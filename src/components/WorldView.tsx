"use client";

import Link from "next/link";
import type { World } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { WorldIcon } from "@/lib/icons";
import { SkillPill, LevelBadge } from "./SkillPill";
import { ProgressRing } from "./ProgressRing";
import { Check } from "lucide-react";

export function WorldView({ world }: { world: World }) {
  const { ready, isDone, worldProgress } = useProgress();
  const accent = `var(${world.color})`;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="rise mt-3 flex items-center justify-between gap-6 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
              color: accent,
            }}
          >
            <WorldIcon slug={world.slug} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">
              {world.title}
            </h1>
            <p className="text-muted">{world.tagline}</p>
          </div>
        </div>
        <ProgressRing
          value={ready ? worldProgress(world.slug) : 0}
          size={64}
          color={accent}
        />
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {world.scenarios.map((s, i) => {
          const done = ready && isDone(world.slug, s.slug);
          return (
            <Link
              key={s.slug}
              href={`/world/${world.slug}/${s.slug}`}
              className="rise group flex flex-col rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold leading-tight">
                  {s.title}
                </h3>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    done ? "text-paper" : "border border-line-strong"
                  }`}
                  style={done ? { background: accent } : undefined}
                  aria-label={done ? "Completed" : "Not started"}
                >
                  {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </div>
              <p className="mt-1 flex-1 text-sm text-muted">{s.blurb}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <LevelBadge level={s.level} />
                {s.skills.map((sk) => (
                  <SkillPill key={sk} skill={sk} />
                ))}
                <span className="ml-auto text-xs text-muted">~{s.minutes} min</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
