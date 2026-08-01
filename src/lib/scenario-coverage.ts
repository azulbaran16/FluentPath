// What each of the 35 scenarios and each of the 52 scenario×skill pairs
// ACTUALLY offers — derived from the banks' contents, never declared.
//
// This is D-03, and it is the same mechanism `src/lib/celpip.ts` uses for the
// /celpip landing (`section()`, CELPIP_SECTIONS): availability follows what a
// bank HOLDS, not whether a bank exists, so a set that is emptied or dropped
// flips its pair back to "not written yet" by itself with no second edit
// anywhere. Phase 3 runs over eleven plans and may stop after any of them; this
// module is what makes stopping safe, because the app cannot claim practice it
// does not have.
//
// React-free and lucide-free for the same reason celpip.ts is: this is loaded
// by scripts/verify-scenario-content.mts under `node --experimental-strip-types`
// and by a server component. Hence the explicit `.ts` extensions below.

import { WORLDS, type Level, type Skill } from "./curriculum.ts";
import { getScenarioPhrases } from "./content/phrases.ts";
import { getScenarioVocabulary } from "./content/scenario-vocabulary.ts";
import { getScenarioGrammar } from "./content/scenario-grammar.ts";
import { getScenarioWriting } from "./content/scenario-writing.ts";

/* ------------------------------------------------------------------ *
 * The shape a bank hands the registry.
 * ------------------------------------------------------------------ */

/**
 * What an exercise bank hands the registry for ONE scenario×skill pair.
 *
 * `undefined` from the lookup means the bank has no entry for that pair — and
 * that is what an unwritten pair is. Do NOT create an empty bank module, or an
 * empty entry, to satisfy this: an empty module is a second thing to remember
 * to delete when content is dropped, and this registry exists to remove exactly
 * that class of forgetting (the rule celpip.ts:683-692 set).
 *
 * Only `items.length` is ever read. `unit` names what is being counted, because
 * every user-visible string here is a COUNT AND A UNIT — never a line of a
 * phrase, a passage or an answer. These strings are rendered into the served
 * document, and a summary assembled from content puts authored prose, and one
 * careless edit later an answer key, into the page's own HTML.
 */
export interface ScenarioSkillSource {
  items: readonly unknown[];
  /** singular noun: "question", "prompt", "passage", "task" */
  unit: string;
}

/** How plans 03-05, 03-06, 03-07 and 03-09 attach their bank. */
export type ScenarioSkillLookup = (
  worldSlug: string,
  scenarioSlug: string,
) => ScenarioSkillSource | undefined;

/** How the two content banks are read. Both return `undefined` for a scenario
 * they have no entry for — the strict accessors, never the lenient one. */
export type ScenarioBankLookup = (
  worldSlug: string,
  scenarioSlug: string,
) => readonly unknown[] | undefined;

export interface ScenarioCoverageSources {
  phrases: ScenarioBankLookup;
  vocabulary: ScenarioBankLookup;
  /** One entry per skill whose bank exists. A skill absent from this record is
   * unwritten for every scenario that declares it. */
  exercises: Partial<Record<Skill, ScenarioSkillLookup | undefined>>;
}

/* ------------------------------------------------------------------ *
 * The registry's shape. Plans 03-02 through 03-11 close their verify
 * commands on these literal field names — do not rename.
 * ------------------------------------------------------------------ */

export interface ScenarioSkillCoverage {
  skill: Skill;
  /** true only when the bank actually holds items for this pair */
  available: boolean;
  /** a count and a unit, or "" when unavailable */
  summary: string;
}

export interface ScenarioCoverage {
  /** the composite `world/scenario` key */
  key: string;
  world: string;
  scenario: string;
  title: string;
  level: Level;
  /** how many phrases the scenario's own bank holds */
  phrases: number;
  /** how many vocabulary cards the scenario's own bank holds */
  vocabulary: number;
  /** one entry per DECLARED skill, in curriculum order */
  skills: ScenarioSkillCoverage[];
  /**
   * Derived, never set: phrases, vocabulary AND every declared skill present.
   * Because it falls out of the banks like everything else here, it can never
   * be true of a scenario whose content was dropped.
   */
  complete: boolean;
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/**
 * Walks WORLDS — never a second scenario list — and derives everything.
 *
 * Takes its lookups as a parameter so the harness can drive it with a stub and
 * prove, among other things, that a bank which EXISTS but is EMPTY still
 * reports its pair unwritten. That property is what lets plans 03-05 through
 * 03-10 wire a renderer before its content exists without the page lying in the
 * meantime.
 */
export function buildScenarioCoverage(
  sources: ScenarioCoverageSources,
): ScenarioCoverage[] {
  return WORLDS.flatMap((world) =>
    world.scenarios.map((scenario): ScenarioCoverage => {
      const phrases = (sources.phrases(world.slug, scenario.slug) ?? []).length;
      const vocabulary = (
        sources.vocabulary(world.slug, scenario.slug) ?? []
      ).length;

      const skills = scenario.skills.map((skill): ScenarioSkillCoverage => {
        const source = sources.exercises[skill]?.(world.slug, scenario.slug);
        // The count is decided BEFORE availability, exactly as section() drops
        // empty groups: a bank that exists but holds nothing is unwritten.
        const count = source?.items.length ?? 0;
        const available = count > 0;
        return {
          skill,
          available,
          summary: available ? plural(count, source?.unit ?? "item") : "",
        };
      });

      return {
        key: `${world.slug}/${scenario.slug}`,
        world: world.slug,
        scenario: scenario.slug,
        title: scenario.title,
        level: scenario.level,
        phrases,
        vocabulary,
        skills,
        complete:
          phrases > 0 && vocabulary > 0 && skills.every((s) => s.available),
      };
    }),
  );
}

/**
 * The four per-scenario exercise banks.
 *
 * A skill is absent here until the plan that authors its bank adds ONE line —
 * `grammar: (w, s) => { const q = getScenarioGrammar(w, s); return q && { items: q, unit: "question" }; }`
 * — and nothing else in this file, in ScenarioView or in the route changes.
 * Owners: grammar 03-05 · writing 03-06 · reading 03-07 and 03-08 ·
 * speaking 03-09 and 03-10.
 */
const EXERCISE_SOURCES: Partial<Record<Skill, ScenarioSkillLookup | undefined>> =
  {
    grammar: (w, s) => {
      const questions = getScenarioGrammar(w, s);
      return questions && { items: questions, unit: "question" };
    },
    // One task per pair, not a set — a writing brief is not scored, so there is
    // no "out of N" to make plural. `items` is the single prompt in a list
    // because `items.length` is the only thing this registry ever reads.
    writing: (w, s) => {
      const prompt = getScenarioWriting(w, s);
      return prompt && { items: [prompt], unit: "task" };
    },
  };

/** Coverage over the real banks, built once at module load and pure, so a
 * server component and a client component see the identical array. */
export const SCENARIO_COVERAGE: ScenarioCoverage[] = buildScenarioCoverage({
  phrases: getScenarioPhrases,
  vocabulary: getScenarioVocabulary,
  exercises: EXERCISE_SOURCES,
});

export function getScenarioCoverage(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioCoverage | undefined {
  return SCENARIO_COVERAGE.find(
    (c) => c.world === worldSlug && c.scenario === scenarioSlug,
  );
}

/**
 * Every pair the curriculum DECLARES that no bank has written yet, in registry
 * order.
 *
 * This is the closing assertion of every skill plan from 03-05 onward: each one
 * proves it is finished by showing that no pair declaring ITS skill is still
 * pending. That is a statement about one skill alone, and therefore true no
 * matter which sibling plan merged first — a global written-count would not be,
 * because two plans in one wave would each be asserting a total the other moves.
 */
export function pendingPairs(): { key: string; skill: Skill }[] {
  return SCENARIO_COVERAGE.flatMap((c) =>
    c.skills
      .filter((s) => !s.available)
      .map((s) => ({ key: c.key, skill: s.skill })),
  );
}

/** The phase's four headline numbers, all derived. */
export const COVERAGE_TOTALS = {
  pairsTotal: SCENARIO_COVERAGE.reduce((n, c) => n + c.skills.length, 0),
  pairsWritten: SCENARIO_COVERAGE.reduce(
    (n, c) => n + c.skills.filter((s) => s.available).length,
    0,
  ),
  scenariosWithPhrases: SCENARIO_COVERAGE.filter((c) => c.phrases > 0).length,
  scenariosWithVocabulary: SCENARIO_COVERAGE.filter((c) => c.vocabulary > 0)
    .length,
};
