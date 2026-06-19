import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Per-user progress, stored as a JSON string. Mirrors the client
// ProgressState shape; the client merges this with any local cache.

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { progress: true },
  });
  const progress = user?.progress ? JSON.parse(user.progress) : null;
  return NextResponse.json({ progress });
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
  const progress = (body as { progress?: unknown }).progress;
  if (typeof progress !== "object" || progress === null) {
    return NextResponse.json({ error: "Invalid progress" }, { status: 400 });
  }

  const level =
    typeof (progress as { level?: unknown }).level === "string"
      ? (progress as { level: string }).level
      : null;

  // updateMany doesn't throw if the user no longer exists (e.g. stale cookie).
  const { count } = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { progress: JSON.stringify(progress), level },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
