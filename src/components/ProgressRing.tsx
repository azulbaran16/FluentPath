"use client";

import { useEffect, useState } from "react";

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = "var(--vermilion)",
  label,
}: {
  /** 0–100 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = Math.min(100, Math.max(0, value));

  // Animate the ring drawing in from empty after mount.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(target);
      return;
    }
    const id = requestAnimationFrame(() => setShown(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const offset = c - (shown / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <span className="absolute font-display text-sm font-semibold">
        {label ?? `${Math.round(value)}%`}
      </span>
    </div>
  );
}
