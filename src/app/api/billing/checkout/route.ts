import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  stripe,
  stripeEnabled,
  getOrCreateCustomer,
  proLineItem,
} from "@/lib/stripe";
import { absoluteUrl } from "@/lib/site";

// Create a Checkout Session for the Pro subscription and return its URL.
export async function POST() {
  if (!stripeEnabled) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = await getOrCreateCustomer(user);
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [proLineItem()],
    allow_promotion_codes: true,
    success_url: absoluteUrl("/pro?status=success"),
    cancel_url: absoluteUrl("/pro?status=cancelled"),
  });

  return NextResponse.json({ url: checkout.url });
}
