"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Scenario, World } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { getScenarioPhrases } from "@/lib/content/phrases";
import { getScenarioLesson } from "@/lib/content/scenario-lessons";
import { scenarioRecallItems } from "@/lib/review-items";
import { getScenarioCoverage } from "@/lib/scenario-coverage";
import { SkillPill, LevelBadge } from "./SkillPill";
import { PronunciationLab } from "./practice/PronunciationLab";
import { RecallDeck } from "./practice/RecallDeck";
import { ScenarioPractice } from "./practice/ScenarioPractice";
import { SKILL_META } from "@/lib/curriculum";
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
  // The STRICT accessor. `getPhrases` can never return empty — it falls back to
  // a per-world generic set — so reading it here is what let 26 scenarios show
  // three shared lines as though they had been written for the situation. From
  // this commit a scenario either has its own warm-up or says it does not.
  const phrases = getScenarioPhrases(world.slug, scenario.slug);
  const recall = scenarioRecallItems(world.slug, scenario.slug);
  const lesson = getScenarioLesson(world.slug, scenario.slug);
  // The header pills used to be a promise: a scenario declared a skill and got
  // a coloured pill whether or not anything was written behind it. They now
  // read the same registry the sections below are gated on, so a pill and the
  // panel under it can never say different things.
  const coverage = getScenarioCoverage(world.slug, scenario.slug);

  function markDone() {
    complete(world.slug, scenario.slug);
    setJustDone(true);
  }

  // Steps are DERIVED, never numbered by hand: the recall step is omitted when
  // a scenario has nothing of its own to recall, and later plans add one
  // section per declared skill. A hand-written "3" would be wrong on the first
  // scenario that skips a step.
  const steps: { key: string; title: string; body: ReactNode }[] = [
    {
      key: "learn",
      title: "Learn the essentials",
      body: (
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
      ),
    },
    {
      key: "warm-up",
      title: "Warm up & speak",
      body: phrases ? (
        <PronunciationLab phrases={phrases} accent={accent} onComplete={markDone} />
      ) : (
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-ink-soft">
            Warm-up phrases written for this scenario aren&apos;t ready yet.
            Rather than hand you generic lines dressed up as practice for{" "}
            {scenario.title.toLowerCase()}, we&apos;ll say so.
          </p>
          <Link
            href="/skill/speaking"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Practise speaking in the meantime →
          </Link>
        </div>
      ),
    },
  ];

  if (recall.length > 0) {
    steps.push({
      key: "recall",
      title: "Lock it in",
      body: (
        <RecallDeck items={recall} accent={accent} title={scenario.title} />
      ),
    });
  }

  // One section per DECLARED skill, in curriculum order. Before this, the page
  // rendered the same three steps for all 35 scenarios and never read
  // `scenario.skills` below the header — which is why 22 pairs promised a skill
  // in a pill and in structured data while rendering nothing at all.
  for (const skill of scenario.skills) {
    steps.push({
      key: `skill-${skill}`,
      title: `Practise ${SKILL_META[skill].label.toLowerCase()}`,
      body: (
        <ScenarioPractice world={world} scenario={scenario} skill={skill} />
      ),
    });
  }

  steps.push({
    key: "role-play",
    title: "Role-play the conversation",
    body: (
      <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <p className="text-sm text-ink-soft">
          Rehearse the full conversation with Rumi, your AI Tutor — live,
          in-character role-play with gentle grammar &amp; word-choice
          corrections as you go.
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
    ),
  });

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
            <SkillPill
              key={s}
              skill={s}
              available={
                coverage?.skills.find((c) => c.skill === s)?.available ?? false
              }
            />
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

      {steps.map((step, index) => (
        <section key={step.key} className={index === 0 ? "mt-6" : "mt-8"}>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
            <StepNumber accent={accent}>{index + 1}</StepNumber>
            {step.title}
          </h2>
          {step.body}
        </section>
      ))}
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
