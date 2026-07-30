import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  CELPIP_EMPTY,
  celpipProgressSchema,
  safeReadCelpip,
  type CelpipProgressState,
} from "@/lib/progress-schema";
import { mergeCelpip } from "@/lib/progress-merge";
import { rateLimit } from "@/lib/rate-limit";

// Per-user CELPIP attempt history, stored as a JSON string in its own column
// (D-05). A direct sibling of src/app/api/progress/route.ts: same auth
// preamble, same merge-on-write, same count-checked guarded write, same
// non-throwing read — only the column, the envelope and the bounds differ.
//
// It is a SEPARATE route from /api/progress on purpose. The two domains hold
// independent queue slots, so a twenty-XP tick never re-uploads an essay and a
// draft autosave never re-uploads the review queue.
//
// The write is a MERGE, not an overwrite: the incoming snapshot is joined into
// the stored blob with the same mergeCelpip the client runs, so a replayed,
// duplicated or out-of-order snapshot is a no-op rather than a regression.
// That is what makes the retry queue's at-least-once delivery safe.
//
// This handler must never author a D-01b `updatedAt` instant of its own. The
// stored value is whichever of the two snapshots' instants the merge selected.
// A server-side stamp would make every stored row newer than every client and
// invert the whole-map draft rule — handing a cleared draft back to the stale
// device and pre-filling the next timed attempt with the submitted answer.
//
// Validation is deliberately LENIENT (D-08), exactly as on the progress route:
// an unknown field is stripped, a known field carrying a bad value falls back
// to its default, one malformed attempt is dropped while its siblings survive,
// and the only body refused with 400 is one that is not an object at all — a
// browser holding a cached older build must keep saving.

/**
 * Larger than the progress route's one mebibyte, because this payload
 * legitimately carries the learner's essay prose — and it needs its own cap
 * rather than inheriting one, because the progress route's bounds are
 * per-handler and the schema's 20,000-character ceilings bound ONE essay and
 * ONE draft, never the number of attempts in the blob. An attempt history is
 * unbounded by nature: it only ever grows.
 *
 * Two mebibytes holds roughly 1,700 real CELPIP Writing responses (150-200
 * words, ~1,200 characters) or about 100 at the schema's per-entry maximum —
 * orders of magnitude beyond one learner preparing for one exam, and still
 * below what a browser will keep in localStorage anyway. The headroom matters
 * in this direction specifically: the retry queue classifies 413 as PERMANENT
 * and discards the slot, so a cap a real learner could reach would stop their
 * history syncing for good rather than merely slowing it down.
 */
const MAX_BODY_BYTES = 2 * 1024 * 1024;

/** Its own bucket, keyed on this route rather than shared with the progress
 * one, so a CELPIP flood cannot spend the progress budget or vice versa.
 *
 * The number is generous on purpose. The client debounce here is two seconds,
 * so one tab autosaving continuously tops out at thirty writes a minute and
 * this leaves room for a second tab. Refusing a legitimate write is not free:
 * the queue counts a 429 as a failure, and three of them inside thirty seconds
 * raise the D-06 "not synced" indicator — telling a learner who is mid-essay
 * that their work is not saving, when it is. The size cap above is what bounds
 * the damage a hostile client can do; this bounds the loop. */
const WRITE_LIMIT = 60;
const WRITE_WINDOW_MS = 60_000;

/**
 * True when stored text cannot be read as a CELPIP progress object at all:
 * either `JSON.parse` throws, or the value is not a plain object. Those are
 * exactly the two inputs `celpipProgressSchema` refuses, because every known
 * field recovers to its own default — so this is precisely the set of blobs
 * that degrade.
 *
 * It costs a second parse on the happy path, for the same reason the progress
 * route pays it: inferring corruption from the parsed result cannot tell a
 * genuinely corrupt row from a brand-new learner's empty one, and would log
 * every first save as a data loss.
 */
function isUnreadable(raw: string): boolean {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value !== "object" || value === null || Array.isArray(value);
  } catch {
    return true;
  }
}

/**
 * Reads the stored blob without ever throwing — a corrupt row yields the empty
 * state instead of a permanent 500 for that account (PROG-03).
 *
 * When it does degrade, the offending string is logged IN FULL, once, at error
 * level. Not an excerpt: this route merges on write, so the very next save
 * replaces the unreadable row, and after that the log line is the only
 * surviving copy of that learner's attempt history.
 *
 * The trade is sharper here than on the progress route, because this blob may
 * contain the learner's own essay prose — and that is also what makes it more
 * clearly worth taking. That prose is the beta user's exam preparation;
 * silently discarding it is the worse outcome by a wide margin. It reaches our
 * error log alongside the account id, never the email, never a credential, and
 * never the response body.
 */
function readStored(
  raw: string | null | undefined,
  userId: string,
): CelpipProgressState {
  if (!raw) return CELPIP_EMPTY;
  if (isUnreadable(raw)) {
    console.error(
      `[celpip-progress] unreadable stored blob for user ${userId} — serving ` +
        `the empty state; merge-on-write will replace the row on the next ` +
        `save, so this line is the only remaining copy. Full contents: ${raw}`,
    );
    return CELPIP_EMPTY;
  }
  return safeReadCelpip(raw);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { celpipProgress: true },
  });
  return NextResponse.json({
    celpipProgress: readStored(user?.celpipProgress, session.user.id),
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`celpip:${session.user.id}`, WRITE_LIMIT, WRITE_WINDOW_MS);
  if (!limit.ok) {
    // The retry queue honours this header, so a refused write backs off
    // instead of tightening the loop that caused the refusal.
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // Size is checked before parsing, and the advertised length before reading,
  // so an oversized body is refused as early as the client lets us.
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "CELPIP progress too large" }, { status: 413 });
  }
  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "CELPIP progress too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = celpipProgressSchema.safeParse(
    (body as { celpipProgress?: unknown } | null)?.celpipProgress,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid CELPIP progress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { celpipProgress: true },
  });
  // Refuse to overwrite a row we could not read — same reasoning as the
  // progress route. Here the stakes are the learner's own essay prose, which
  // exists nowhere else once the row is replaced. Freezing keeps it
  // recoverable; 409 is retryable, so a repaired row heals without a redeploy.
  if (user?.celpipProgress && isUnreadable(user.celpipProgress)) {
    console.error(
      `[celpip] refusing to overwrite an unreadable stored blob for user ` +
        `${session.user.id} — the row is frozen until it is repaired. ` +
        `Full contents: ${user.celpipProgress}`,
    );
    return NextResponse.json(
      { error: "Stored CELPIP progress is unreadable; refusing to overwrite it" },
      { status: 409 },
    );
  }

  const merged = mergeCelpip(
    readStored(user?.celpipProgress, session.user.id),
    parsed.data,
  );

  // Deliberately not `update`: this form doesn't throw if the user no longer
  // exists (e.g. a stale cookie), so the handler answers 401 instead of 500.
  const { count } = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { celpipProgress: JSON.stringify(merged) },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
