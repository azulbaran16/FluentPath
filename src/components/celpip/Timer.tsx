"use client";

import { useEffect, useRef, useState } from "react";

type TimerMode = "timed" | "practice";

// Once 120 seconds or less remain, the digits switch to the warning color.
// This is an urgency signal only — no delete/destroy semantics attached.
const WARNING_THRESHOLD_SECONDS = 120;

export function Timer({
  totalSeconds,
  running,
  mode,
  onExpire,
}: {
  /** Full countdown duration in seconds (e.g. task.timeLimitMinutes * 60). */
  totalSeconds: number;
  /** Whether the countdown should be actively ticking, controlled by the parent. */
  running: boolean;
  mode: TimerMode;
  /** Called exactly once when the countdown reaches 0. */
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);
  const expiredRef = useRef(false);
  const anchorRef = useRef<{ startedAtMs: number; remainingAtStart: number } | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep the latest onExpire callback available to the tick loop below
  // without re-anchoring the countdown whenever the parent re-renders.
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // A new attempt/task resets the whole countdown.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRemaining(totalSeconds);
    setPaused(false);
    setExpired(false);
    expiredRef.current = false;
    anchorRef.current = null;
  }, [totalSeconds]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const effectivelyRunning = running && !paused && !expired;

  // Anchor-timestamp countdown so it never drifts across re-renders or a
  // throttled background tab — each tick recomputes remaining from
  // Date.now() minus the moment this run started, rather than decrementing
  // a counter. Guards prefers-reduced-motion the same way ProgressRing does.
  useEffect(() => {
    if (!effectivelyRunning) {
      anchorRef.current = null;
      return;
    }
    anchorRef.current = { startedAtMs: Date.now(), remainingAtStart: remaining };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    function tick() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const elapsedSeconds = (Date.now() - anchor.startedAtMs) / 1000;
      const next = Math.max(0, anchor.remainingAtStart - elapsedSeconds);
      setRemaining(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setExpired(true);
        onExpireRef.current();
      }
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let rafId: number | null = null;

    if (reduceMotion) {
      intervalId = setInterval(tick, 1000);
    } else {
      let lastTickMs = 0;
      const loop = (t: number) => {
        if (t - lastTickMs >= 250) {
          lastTickMs = t;
          tick();
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // remaining is intentionally excluded — it's only read at anchor-creation
    // time above, not on every tick, to avoid re-anchoring every second.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivelyRunning]);

  const displaySeconds = Math.max(0, Math.ceil(remaining));
  const mm = Math.floor(displaySeconds / 60);
  const ss = displaySeconds % 60;
  const label = `${mm}:${String(ss).padStart(2, "0")}`;
  const isWarning = displaySeconds <= WARNING_THRESHOLD_SECONDS && displaySeconds > 0;

  return (
    <div className="flex items-center gap-4">
      <span
        className="font-display text-3xl font-semibold tabular-nums transition-colors"
        style={{ color: isWarning ? "var(--vermilion)" : undefined }}
        aria-live="polite"
        aria-label={`Time remaining: ${mm} minutes ${ss} seconds`}
      >
        {label}
      </span>
      {mode === "practice" && !expired && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line-strong px-4 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          {paused ? "Resume" : "Pause"}
        </button>
      )}
    </div>
  );
}
