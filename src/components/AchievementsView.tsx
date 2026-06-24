"use client";

import {
  Footprints,
  Compass,
  Flame,
  Zap,
  GraduationCap,
  Repeat,
  Crown,
  Trophy,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useProgress } from "@/lib/progress";
import {
  evaluateAchievements,
  type AchievementIcon,
} from "@/lib/achievements";

const ICONS: Record<AchievementIcon, LucideIcon> = {
  footprints: Footprints,
  compass: Compass,
  flame: Flame,
  zap: Zap,
  graduation: GraduationCap,
  repeat: Repeat,
  crown: Crown,
  trophy: Trophy,
};

export function AchievementsView() {
  const { ready, state } = useProgress();
  const items = evaluateAchievements(state);
  const earned = items.filter((a) => a.earned).length;

  return (
    <div>
      <div className="rise mb-6 flex items-center justify-between rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)]">
        <div>
          <h2 className="font-display text-lg font-semibold">Your badges</h2>
          <p className="text-sm text-muted">Earn them as you practise.</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold" style={{ color: "var(--gold)" }}>
            {ready ? earned : 0}
            <span className="text-base font-normal text-muted">/{items.length}</span>
          </p>
          <p className="text-xs text-muted">unlocked</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, idx) => {
          const Icon = ICONS[a.icon];
          const pct = Math.round((a.current / a.target) * 100);
          const unlocked = ready && a.earned;
          return (
            <div
              key={a.id}
              className={`rise rounded-[var(--radius)] border bg-card p-5 shadow-[var(--shadow-soft)] ${
                unlocked ? "border-gold/40" : "border-line"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={
                    unlocked
                      ? { background: "color-mix(in srgb, var(--gold) 18%, transparent)", color: "var(--gold)" }
                      : { background: "var(--paper-deep)", color: "var(--muted)" }
                  }
                >
                  {unlocked ? (
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  ) : (
                    <Lock className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold">{a.title}</h3>
                  <p className="text-xs text-muted">{a.description}</p>
                </div>
              </div>

              {!unlocked && (
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ready ? pct : 0}%`, background: "var(--gold)" }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-muted">
                    {ready ? a.current : 0}/{a.target}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
