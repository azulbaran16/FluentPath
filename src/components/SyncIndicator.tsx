"use client";

import { useSyncExternalStore } from "react";
import { getServerStatus, getStatus, subscribeStatus } from "@/lib/sync-queue";

/**
 * D-06's "not synced" indicator: silent until failure has genuinely persisted.
 *
 * The queue decides when that is (three consecutive failures AND more than
 * thirty seconds since the last success), so a two-second network blip shows
 * the learner nothing at all. There is no dismiss control and no timer here:
 * the moment a write lands the status flips back to healthy and this unmounts.
 *
 * `authed` gates it rather than "is anything queued", because /celpip is a
 * public route: an anonymous learner has no server sync that could fail, and
 * showing them a sync warning would be a lie about a system they are not using.
 */
export function SyncIndicator({ authed }: { authed: boolean }) {
  const status = useSyncExternalStore(subscribeStatus, getStatus, getServerStatus);

  if (!authed || !status.stale) return null;

  return (
    <div
      // Announced once, without interrupting whatever the learner is doing —
      // which is the whole point of D-06.
      role="status"
      aria-live="polite"
      // Bottom-left, out of the reading column. Non-interactive, so it never
      // swallows a click meant for the page underneath. The entrance is behind
      // motion-safe, i.e. the prefers-reduced-motion media query, the same
      // guard Timer.tsx applies to its countdown.
      className="pointer-events-none fixed bottom-4 left-4 z-40 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft shadow-[var(--shadow-soft)] backdrop-blur motion-safe:animate-[rise_0.4s_ease-out_both]"
      // The gold caution token, tinted the way SkillPill.tsx tints: a
      // color-mix against transparent, never a literal colour, so both themes
      // are covered by the tokens themselves. Gold and not vermilion — nothing
      // is being lost or destroyed here, it is being retried.
      style={{ background: "color-mix(in srgb, var(--gold) 12%, transparent)" }}
    >
      Progress not synced — retrying
    </div>
  );
}
