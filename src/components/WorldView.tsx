"use client";

import Link from "next/link";
import type { Skill, World } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { WorldIcon } from "@/lib/icons";
import { SkillPill, LevelBadge } from "./SkillPill";
import { ProgressRing } from "./ProgressRing";
import { Check } from "lucide-react";

/**
 * Which skills each scenario on this page has practice actually WRITTEN for,
 * keyed by scenario slug. Derived from the coverage registry by the server
 * component above and handed down — see the note on `written` below for why it
 * arrives as a prop instead of being looked up here.
 */
export type WorldSkillsWritten = Readonly<Record<string, readonly Skill[]>>;

/**
 * `written` is REQUIRED, and deliberately so.
 *
 * Until it existed this component mapped `scenario.skills` straight onto pills
 * and passed no availability flag, so the world page counted DECLARATIONS while
 * the scenario page one click deeper read the coverage registry. The two agreed
 * only by accident, because every declared pair happened to be written; the
 * moment a skill was declared before its bank entry existed — the normal
 * authoring order — this page advertised practice that did not exist.
 * `SkillPill.available` defaults to true for callers with no registry in hand,
 * which is exactly the default a caller that DOES know must not fall back to.
 * Making the prop required is what stops the next caller re-introducing it by
 * omission rather than by intent.
 *
 * It is a PROP rather than a `getScenarioCoverage` call in this file because
 * this component is `"use client"`, and the registry imports all six content
 * banks. Measured at 04-08: importing it here cost the `/world/[slug]` client
 * bundle 416,798 B -> 633,952 B (+217,154 B, +52.1%, 6 chunks -> 9) to render
 * pills whose text is already known at build time. Deriving it in the server
 * component costs nothing on the wire and cannot drift, because it reads the
 * same registry the scenario page reads.
 */
export function WorldView({
  world,
  written,
}: {
  world: World;
  written: WorldSkillsWritten;
}) {
  const { ready, isDone, worldProgress } = useProgress();
  const accent = `var(${world.color})`;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="rise mt-3 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-line bg-card p-5 sm:gap-6 sm:p-6 shadow-[var(--shadow-soft)]">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-14 sm:w-14"
            style={{
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
              color: accent,
            }}
          >
            <WorldIcon slug={world.slug} className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold leading-tight sm:text-3xl">
              {world.title}
            </h1>
            <p className="text-sm text-muted sm:text-base">{world.tagline}</p>
          </div>
        </div>
        <div className="shrink-0">
          <ProgressRing
            value={ready ? worldProgress(world.slug) : 0}
            size={56}
            color={accent}
          />
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {world.scenarios.map((s, i) => {
          const done = ready && isDone(world.slug, s.slug);
          const writtenHere = written[s.slug] ?? [];
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
                  <SkillPill
                    key={sk}
                    skill={sk}
                    available={writtenHere.includes(sk)}
                  />
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
