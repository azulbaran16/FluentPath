"use client";

import Link from "next/link";
import { useState } from "react";
import type { Scenario, World } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { getPhrases } from "@/lib/content/phrases";
import { getScenarioLesson } from "@/lib/content/scenario-lessons";
import { SkillPill, LevelBadge } from "./SkillPill";
import { PronunciationLab } from "./practice/PronunciationLab";
import { Check, MessageSquareText, Lightbulb } from "lucide-react";

export function ScenarioView({
  world,
  scenario,
}: {
  world: World;
  scenario: Scenario;
}) {
  const { ready, isDone, complete } = useProgress();
  const [justDone, setJustDone] = useState(false);
  const done = (ready && isDone(world.slug, scenario.slug)) || justDone;
  const accent = `var(${world.color})`;
  const phrases = getPhrases(world.slug, scenario.slug);
  const lesson = getScenarioLesson(world.slug, scenario.slug);

  function markDone() {
    complete(world.slug, scenario.slug);
    setJustDone(true);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/world/${world.slug}`}
        className="text-sm text-muted hover:text-ink"
      >
        ← {world.title}
      </Link>

      <header className="rise mt-3 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={scenario.level} />
          {scenario.skills.map((s) => (
            <SkillPill key={s} skill={s} />
          ))}
          <span className="ml-auto text-xs text-muted">~{scenario.minutes} min</span>
          {done && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-paper"
              style={{ background: accent }}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Done
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">
          {scenario.title}
        </h1>
        <p className="mt-2 text-ink-soft">{scenario.blurb}</p>
      </header>

      {/* Step 1 — Learn the essentials (mini-lesson) */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <StepNumber accent={accent}>1</StepNumber>
          Learn the essentials
        </h2>
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <p className="text-ink-soft">{lesson.intro}</p>
          <ul className="mt-4 space-y-2">
            {lesson.tips.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: accent }}
                  strokeWidth={1.75}
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Step 2 — Warm up & speak (fully functional, no API) */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <StepNumber accent={accent}>2</StepNumber>
          Warm up &amp; speak
        </h2>
        <PronunciationLab phrases={phrases} accent={accent} onComplete={markDone} />
      </section>

      {/* Step 3 — Role-play with the tutor */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-deep font-display text-sm">
            3
          </span>
          Role-play the conversation
        </h2>
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-ink-soft">
            Rehearse the full conversation with the AI Tutor. Live, in-character
            role-play with grammar &amp; pronunciation feedback unlocks in the
            final phase (needs the API key).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/tutor?scenario=${world.slug}/${scenario.slug}`}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
              style={{ background: accent }}
            >
              <MessageSquareText className="h-4 w-4" strokeWidth={1.75} />
              Open the AI Tutor
            </Link>
            <button
              onClick={markDone}
              disabled={done}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors enabled:hover:bg-paper-deep disabled:opacity-60"
            >
              {done && <Check className="h-4 w-4" strokeWidth={2.5} />}
              {done ? "Completed" : "Mark as done"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepNumber({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="grid h-7 w-7 place-items-center rounded-full font-display text-sm text-paper"
      style={{ background: accent }}
    >
      {children}
    </span>
  );
}
