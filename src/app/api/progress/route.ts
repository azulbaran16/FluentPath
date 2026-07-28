import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { EMPTY, type ProgressState } from "@/lib/progress-schema";
import { mergeProgress } from "@/lib/progress-merge";

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

/** Reads the stored blob without ever throwing — a corrupt row yields the empty
 * state instead of a permanent 500 for that account (PROG-03). */
function readStored(raw: string | null | undefined): ProgressState {
  if (!raw) return EMPTY;
  try {
    return JSON.parse(raw) as ProgressState;
  } catch {
    return EMPTY;
  }
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
  return NextResponse.json({ progress: readStored(user?.progress) });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const incoming = (body as { progress?: unknown }).progress;
  if (typeof incoming !== "object" || incoming === null) {
    return NextResponse.json({ error: "Invalid progress" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { progress: true },
  });
  const merged = mergeProgress(readStored(user?.progress), incoming);

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
