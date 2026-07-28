import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  EMPTY,
  progressSchema,
  safeReadProgress,
  type ProgressState,
} from "@/lib/progress-schema";
import { mergeProgress } from "@/lib/progress-merge";
import { rateLimit } from "@/lib/rate-limit";

// Per-user progress, stored as a JSON string. Mirrors the client ProgressState
// shape.
//
// The write is a MERGE, not an overwrite: the incoming snapshot is joined into
// the stored blob with the same mergeProgress the client runs, so a stale,
// duplicated or out-of-order snapshot can no longer regress the stored row.
// That is what makes a replayed write harmless — the property the retry queue
// in 02-04 depends on.
//
// This handler must never author a D-01b `updatedAt` instant of its own: the
// stored value is whatever the merge selected from the two snapshots. A
// server-side stamp would make every stored row newer than every client and
// invert the rule.
//
// Validation is deliberately LENIENT (D-08). A browser can be holding a cached
// older build of the app, so an unknown field is stripped, a known field
// carrying a bad value falls back to its default, and the rest is still saved.
// The only body refused with 400 is one that is not an object at all — there is
// nothing in it to save. Size is the one thing that leniency does not bound, so
// it is bounded here instead.

/** D-08's strip-and-save says nothing about size, and an authenticated client
 * posting an enormous blob is the one denial-of-service this design opens. */
const MAX_BODY_BYTES = 1024 * 1024;

/** Generous enough that a learning session with two open tabs never trips it —
 * every mutation is already debounced 600ms client-side — and tight enough that
 * a runaway retry loop does. */
const WRITE_LIMIT = 60;
const WRITE_WINDOW_MS = 60_000;

/**
 * True when stored text cannot be read as a progress object at all: either
 * `JSON.parse` throws, or the value is not a plain object. Those are exactly
 * the two inputs `progressSchema` refuses, because every known field carries
 * its own fallback — so this is precisely the set of blobs that degrade.
 *
 * It costs a second parse on the happy path. That is deliberate: the
 * alternative is inferring corruption from the parsed result, which cannot tell
 * a genuinely corrupt row from a brand-new learner's empty one and would log
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
 * replaces the unreadable row with the empty state joined to whatever the
 * client happened to send, and after that the log line is the only surviving
 * copy of that learner's history. The 02-07 audit proves every row that exists
 * today is readable, which means any occurrence of this path in production is a
 * row that corrupted afterwards.
 *
 * The exposure is accepted knowingly (T-02-14): one account's own progress JSON
 * in our error log, alongside the account id and never the email, never a
 * credential, and never in the response body. The alternative is that learner's
 * history being unrecoverable.
 */
function readStored(raw: string | null | undefined, userId: string): ProgressState {
  if (!raw) return EMPTY;
  if (isUnreadable(raw)) {
    console.error(
      `[progress] unreadable stored blob for user ${userId} — serving the empty ` +
        `state; merge-on-write will replace the row on the next save, so this ` +
        `line is the only remaining copy. Full contents: ${raw}`,
    );
    return EMPTY;
  }
  return safeReadProgress(raw);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { progress: true },
  });
  return NextResponse.json({
    progress: readStored(user?.progress, session.user.id),
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`progress:${session.user.id}`, WRITE_LIMIT, WRITE_WINDOW_MS);
  if (!limit.ok) {
    // The retry queue built in 02-04 honours this header, so a refused write
    // backs off instead of tightening the loop that caused the refusal.
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // Size is checked before parsing, and the advertised length before reading,
  // so an oversized body is refused as early as the client lets us.
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Progress too large" }, { status: 413 });
  }
  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Progress too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = progressSchema.safeParse(
    (body as { progress?: unknown } | null)?.progress,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid progress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { progress: true },
  });
  const merged = mergeProgress(
    readStored(user?.progress, session.user.id),
    parsed.data,
  );

  // Denormalized out of the blob into User.level — recomputed from the MERGED
  // state, never from the incoming payload.
  const level = typeof merged.level === "string" ? merged.level : null;

  // Deliberately not `update`: this form doesn't throw if the user no longer
  // exists (e.g. a stale cookie), so the handler answers 401 instead of 500.
  const { count } = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { progress: JSON.stringify(merged), level },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
