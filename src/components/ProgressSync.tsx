"use client";

import { useEffect, useEffectEvent } from "react";
import { useSession } from "next-auth/react";
import { useProgressSync } from "@/lib/progress";
import { flushQueue, nextAttemptAt, resetBackoff, subscribeStatus } from "@/lib/sync-queue";

/**
 * The single app-wide mount point for D-02's per-load reconcile and for every
 * sync-queue flush trigger.
 *
 * It exists so both run once per tab, with session context, no matter how many
 * useProgress() consumers a page mounts — /review alone mounts four. Rendered
 * from src/app/providers.tsx inside <SessionProvider>.
 */
export function ProgressSync() {
  const { status } = useSession();
  const authed = status === "authenticated";

  useProgressSync();
  useFlushTriggers(authed);

  return null;
}

/**
 * Owns every opportunity to drain the queue, exactly once for the whole app.
 *
 * `useEffectEvent` keeps the listeners reading the current session without
 * re-subscribing them on every session transition — the listeners are attached
 * once for the life of the mount.
 */
function useFlushTriggers(authed: boolean) {
  const flush = useEffectEvent(() => (authed ? flushQueue() : Promise.resolve()));

  // Connectivity restored. The browser's online flag is only ever a HINT: it
  // reports true for LAN-only links and virtual adapters with no internet, so
  // it may wake the queue up but must never gate a write. `false` would be
  // trustworthy, and we still do not act on it — the backoff curve already
  // handles a failed attempt.
  const wake = useEffectEvent(() => {
    if (!authed) return Promise.resolve();
    resetBackoff();
    return flushQueue();
  });

  useEffect(() => {
    const onOnline = () => void wake();
    // The transition to hidden is the last reliably observable point in the
    // page's life, and the page is still fully alive there — so a plain fetch
    // works and no special transport is needed. The page-hide event is a
    // best-effort backstop only. The legacy unload-time events are deliberately
    // absent: they are not reliably fired on mobile and are being removed.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onPageHide = () => void flush();

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  // The backoff timer: one timeout, armed from the queue's own earliest
  // next-attempt time, so a retry still happens when no event ever arrives —
  // behind a captive portal, say, where nothing fires and nothing succeeds.
  //
  // This is not a poll. An empty queue arms no timer at all, and the timer is
  // re-armed only when the flush it started has settled or when the queue
  // itself reports a change. The queue publishes on real changes only, and
  // flushQueue() hands a mid-flight caller the same promise rather than
  // resolving instantly, which is what keeps that pair from feeding each other.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      if (disposed) return;
      const at = nextAttemptAt();
      if (at === null) return;
      // A floor of a quarter second: full jitter can legitimately draw a delay
      // of zero, and a zero-delay timeout chain would be a busy loop.
      const delay = Math.max(250, at - Date.now());
      timer = setTimeout(() => {
        timer = null;
        void flush().finally(schedule);
      }, delay);
    };

    const unsubscribe = subscribeStatus(schedule);
    schedule();
    return () => {
      disposed = true;
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);
}
