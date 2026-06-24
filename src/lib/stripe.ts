import Stripe from "stripe";
import { prisma } from "@/lib/db";

const SECRET = process.env.STRIPE_SECRET_KEY;

export const stripeEnabled = Boolean(SECRET);

// A single Stripe client (only usable when configured).
export const stripe = SECRET ? new Stripe(SECRET) : (null as unknown as Stripe);

export const PRO_PRICE_CENTS = 500; // $5.00 / month (used when no STRIPE_PRICE_ID)

export function isPro(user: { proUntil: Date | null } | null): boolean {
  return Boolean(user?.proUntil && user.proUntil.getTime() > Date.now());
}

/** Get the user's Stripe customer id, creating the customer if needed. */
export async function getOrCreateCustomer(user: {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
}): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

/** The line item for a Pro subscription — a fixed Price or an inline price. */
export function proLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  if (process.env.STRIPE_PRICE_ID) {
    return { price: process.env.STRIPE_PRICE_ID, quantity: 1 };
  }
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: PRO_PRICE_CENTS,
      recurring: { interval: "month" },
      product_data: { name: "FluentPath Pro" },
    },
  };
}

/** Pull the latest subscription state from Stripe and store it on the user. */
export async function syncSubscription(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) return;

  const subs = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 1,
  });
  const sub = subs.data[0];

  if (!sub) {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeSubscriptionId: null, stripeStatus: null, proUntil: null },
    });
    return;
  }

  // current_period_end lives on the subscription (or its first item).
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items.data[0]?.current_period_end ??
    0;
  const active = sub.status === "active" || sub.status === "trialing";

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: sub.id,
      stripeStatus: sub.status,
      proUntil: active && periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

/** Resolve a Stripe customer id back to our user id. */
export async function userIdForCustomer(customerId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}
