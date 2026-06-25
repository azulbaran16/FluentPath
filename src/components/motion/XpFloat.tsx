"use client";

// A small "+N XP" reward that floats up and fades once. Render it with a
// changing `key` (e.g. the question index) so it remounts and replays per win.
export function XpFloat({ amount, className = "" }: { amount: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`xp-float pointer-events-none select-none text-sm font-bold text-teal ${className}`}
    >
      +{amount} XP
    </span>
  );
}
