"use client";

// Client-side conversion events. Safe no-ops when GA/Pixel aren't loaded.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fire the "registration" conversion in GA4 + Meta Pixel after signup. */
export function trackSignup(): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", "sign_up");
    window.fbq?.("track", "CompleteRegistration");
  } catch {
    /* analytics must never break the app */
  }
}
