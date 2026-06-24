import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeEnabled, syncSubscription, userIdForCustomer } from "@/lib/stripe";

// Stripe webhook: keep our DB in sync with subscription changes.
// Configure STRIPE_WEBHOOK_SECRET and point Stripe at /api/stripe/webhook.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeEnabled || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const relevant = new Set([
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ]);

  if (relevant.has(event.type)) {
    const obj = event.data.object as { customer?: string };
    const customerId =
      typeof obj.customer === "string" ? obj.customer : undefined;
    if (customerId) {
      const userId = await userIdForCustomer(customerId);
      if (userId) await syncSubscription(userId);
    }
  }

  return NextResponse.json({ received: true });
}
