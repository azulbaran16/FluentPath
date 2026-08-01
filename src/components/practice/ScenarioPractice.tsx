"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import type { Scenario, Skill, World } from "@/lib/curriculum";
import { SKILL_META } from "@/lib/curriculum";
import { getScenarioCoverage } from "@/lib/scenario-coverage";
import { getScenarioGrammar } from "@/lib/content/scenario-grammar";
import { GrammarQuiz } from "./GrammarQuiz";

// One scenario, one skill — the dispatch `SkillPractice` does globally, gated
// on coverage the way `CelpipTabs` gates a section.
//
// The gate is the point. Twenty-two of the 52 declared pairs (9 writing,
// 9 reading, 4 grammar) render NOTHING on a scenario page today while a
// SkillPill and the JSON-LD `teaches` field both promise them, and the other
// 30 get generic material. Neither is honest. Until a pair's bank holds
// something, this says so by name and sends the learner somewhere real.

export function ScenarioPractice({
  world,
  scenario,
  skill,
}: {
  world: World;
  scenario: Scenario;
  skill: Skill;
}) {
  // The page owner wins on accent: this is a scenario page, so it is the
  // world's colour rather than the skill's (ScenarioView.tsx does the same).
  const accent = `var(${world.color})`;
  const coverage = getScenarioCoverage(world.slug, scenario.slug);
  const pair = coverage?.skills.find((s) => s.skill === skill);

  if (!pair?.available) {
    return <NotWrittenYet skill={skill} scenario={scenario} />;
  }
  return (
    <ScenarioExercise
      world={world}
      scenario={scenario}
      skill={skill}
      accent={accent}
    />
  );
}

/**
 * Exhaustive over `Skill` with NO default clause, so `tsc` flags any skill
 * that is ever added to the union rather than letting it fall silently into a
 * catch-all. Each branch is filled by the plan named on it; until then the
 * coverage gate above has already returned, so no branch here is reachable.
 */
function ScenarioExercise(props: {
  /** carried for the branches below: each one looks its bank up by world and
   * scenario slug, and takes `accent` for the renderer it mounts */
  world: World;
  scenario: Scenario;
  skill: Skill;
  accent: string;
}) {
  const { world, scenario, skill } = props;
  switch (skill) {
    case "grammar": {
      // The questions carry their own composed ids, so the quiz below schedules
      // a namespaced SRS entry and reports the scenario's grammar topic to
      // weak spots without a single line of scenario-awareness in it.
      const questions = getScenarioGrammar(world.slug, scenario.slug);
      if (!questions) return <NotWrittenYet skill={skill} scenario={scenario} />;
      return <GrammarQuiz questions={questions} accent={props.accent} />;
    }
    case "writing":
      // plan 03-06 — <WritingDesk prompts={...} accent={props.accent} />
      return <NotWrittenYet skill={skill} scenario={scenario} />;
    case "reading":
      // plans 03-07 / 03-08 — <ReadingRoom passages={...} accent={props.accent} />
      return <NotWrittenYet skill={skill} scenario={scenario} />;
    case "speaking":
      // plans 03-09 / 03-10 — the scenario speaking task
      return <NotWrittenYet skill={skill} scenario={scenario} />;
  }
}

/** Named, not hidden: the skill by name, what is missing, and somewhere to go. */
function NotWrittenYet({
  skill,
  scenario,
}: {
  skill: Skill;
  scenario: Scenario;
}) {
  const meta = SKILL_META[skill];
  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, var(${meta.color}) 14%, transparent)`,
            color: `var(${meta.color})`,
          }}
        >
          <PenLine className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold">{meta.label}</h3>
          <span className="rounded-full bg-paper-deep px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted">
            Not yet available
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-soft">
        {meta.label} practice written for {scenario.title.toLowerCase()}{" "}
        isn&apos;t ready yet. The general {meta.label.toLowerCase()} room below
        is good practice — it just isn&apos;t practice for this situation, and
        we&apos;d rather say so than pretend.
      </p>
      <Link
        href={`/skill/${skill}`}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
      >
        Go to the {meta.label.toLowerCase()} room →
      </Link>
    </div>
  );
}
