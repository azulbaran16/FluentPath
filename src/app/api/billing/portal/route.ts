import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/site";

// Open the Stripe Customer Portal so the user can manage/cancel their plan.
export async function POST() {
  if (!stripeEnabled) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found." }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl("/settings"),
  });

  return NextResponse.json({ url: portal.url });
}
