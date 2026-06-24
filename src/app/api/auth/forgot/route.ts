import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";

const schema = z.object({ email: z.string().email() });

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// Request a password reset. Always responds 200 so the endpoint never reveals
// whether an email is registered.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only credentials accounts (with a password) can reset.
  if (user?.passwordHash) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const raw = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: sha256(raw),
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    const link = absoluteUrl(`/reset-password?token=${raw}`);
    const mail = passwordResetEmail(link);
    await sendEmail({ to: email, ...mail });
  }

  return NextResponse.json({ ok: true });
}
