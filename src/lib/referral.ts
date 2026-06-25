import { randomBytes } from "crypto";

// Both sides of a referral get this many free Pro days.
export const REFERRAL_REWARD_DAYS = 7;

/** Short, URL-safe, shareable referral code. */
export function newReferralCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

/** Extend a Pro expiry by `days`, starting from now or the current expiry. */
export function extendPro(current: Date | null, days: number): Date {
  const now = new Date();
  const base = current && current > now ? current : now;
  return new Date(base.getTime() + days * 86_400_000);
}
