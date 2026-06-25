import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { newReferralCode, extendPro, REFERRAL_REWARD_DAYS } from "@/lib/referral";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(200),
  ref: z.string().trim().max(32).optional(),
});

export async function POST(req: Request) {
  // Throttle account creation per IP (anti-abuse).
  const rl = rateLimit(`signup:${clientIp(req)}`, 5, 15 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  // Referral: if the signup came from a valid code, both sides get Pro days.
  let referredById: string | null = null;
  let proUntil: Date | null = null;
  const referrer = parsed.data.ref
    ? await prisma.user.findUnique({ where: { referralCode: parsed.data.ref } })
    : null;
  if (referrer) {
    referredById = referrer.id;
    proUntil = extendPro(null, REFERRAL_REWARD_DAYS); // welcome bonus
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      referralCode: newReferralCode(),
      referredById,
      proUntil,
    },
  });

  // Reward the referrer (only for a real, different account).
  if (referrer) {
    await prisma.user.update({
      where: { id: referrer.id },
      data: { proUntil: extendPro(referrer.proUntil, REFERRAL_REWARD_DAYS) },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
