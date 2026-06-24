import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";

const nameSchema = z.object({ name: z.string().trim().min(1).max(80) });

// Update profile (display name).
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = nameSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });
  return NextResponse.json({ ok: true });
}

// Permanently delete the account (and, via cascade, its reset tokens).
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.user.deleteMany({ where: { id: session.user.id } });
  await signOut({ redirect: false });
  return NextResponse.json({ ok: true });
}
