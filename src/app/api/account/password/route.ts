import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "Use at least 8 characters").max(200),
});

// Change password for a signed-in user (requires the current password).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "This account signs in with Google and has no password." },
      { status: 400 },
    );
  }
  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Your current password is incorrect." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.next, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
