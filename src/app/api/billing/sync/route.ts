import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripeEnabled, syncSubscription, isPro } from "@/lib/stripe";

// Pull the latest subscription status from Stripe (used right after checkout
// so Pro unlocks immediately, even if the webhook hasn't arrived yet).
export async function POST() {
  if (!stripeEnabled) {
    return NextResponse.json({ pro: false });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await syncSubscription(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { proUntil: true },
  });
  return NextResponse.json({ pro: isPro(user) });
}
