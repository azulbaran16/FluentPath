"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { celebrate } from "@/lib/confetti";

const FREE = [
  "All 6 worlds & 35+ real-life scenarios",
  "Grammar, reading, writing, listening & vocabulary",
  "Pronunciation lab & placement test",
  "Spaced-repetition review & achievements",
];

const PRO = [
  "Everything in Free",
  "Unlimited AI Tutor — live, in-character role-play",
  "Instant grammar & pronunciation feedback",
  "Priority access to new features",
];

export function ProView({
  isPro,
  proUntil,
  status,
}: {
  isPro: boolean;
  proUntil: string | null;
  status?: string;
}) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [synced, setSynced] = useState(false);

  // After returning from Checkout, sync the subscription so Pro unlocks now.
  useEffect(() => {
    if (status === "success" && !synced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSynced(true);
      fetch("/api/billing/sync", { method: "POST" })
        .then(() => {
          celebrate();
          setTimeout(() => window.location.assign("/pro"), 1200);
        })
        .catch(() => {});
    }
  }, [status, synced]);

  async function go(path: string, kind: "checkout" | "portal") {
    setLoading(kind);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div>
      {status === "success" && (
        <div className="mb-6 rounded-[var(--radius)] border border-teal/40 bg-[color-mix(in_srgb,var(--teal)_8%,transparent)] p-4 text-sm font-semibold text-teal">
          🎉 Welcome to Pro! Unlocking your features…
        </div>
      )}
      {status === "cancelled" && (
        <div className="mb-6 rounded-[var(--radius)] border border-line bg-card p-4 text-sm text-muted">
          No worries — checkout was cancelled. You can upgrade anytime.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Free */}
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-xl font-semibold">Free</h2>
          <p className="mt-1 text-3xl font-semibold">
            $0<span className="text-base font-normal text-muted"> / forever</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={2.5} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-line-strong px-4 py-2.5 text-center text-sm font-semibold text-muted">
            Your current plan
          </p>
        </div>

        {/* Pro */}
        <div
          className="relative rounded-[var(--radius)] border-2 bg-card p-6 shadow-[var(--shadow-lift)]"
          style={{ borderColor: "var(--vermilion)" }}
        >
          <span
            className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-paper"
            style={{ background: "var(--vermilion)" }}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Pro
          </span>
          <h2 className="font-display text-xl font-semibold">FluentPath Pro</h2>
          <p className="mt-1 text-3xl font-semibold">
            $5<span className="text-base font-normal text-muted"> / month</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "var(--vermilion)" }}
                  strokeWidth={2.5}
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="mt-6">
              <p className="mb-3 text-center text-sm font-semibold text-teal">
                You&apos;re on Pro{proUntil ? ` · renews ${proUntil}` : ""}.
              </p>
              <button
                onClick={() => go("/api/billing/portal", "portal")}
                disabled={loading !== null}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold transition-colors hover:bg-paper-deep disabled:opacity-60"
              >
                {loading === "portal" && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                Manage subscription
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("/api/billing/checkout", "checkout")}
              disabled={loading !== null}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: "var(--vermilion)" }}
            >
              {loading === "checkout" ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" strokeWidth={2} /> Upgrade to Pro
                </>
              )}
            </button>
          )}
          <p className="mt-3 text-center text-xs text-muted">
            Cancel anytime · Secure checkout by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
