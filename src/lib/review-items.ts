// The one place that knows how a scenario item's spaced-repetition id is
// spelled, and the one place that turns an id back into something renderable.
//
// Why both live in one module: `recordAttempt` stores `srs[id] = {box, due}`
// and `mergeProgress` unions those keys blindly across devices. If composition
// lived next to the banks and resolution lived next to the review screen, the
// two would drift and the symptom would be an id that is stored, merged and
// scheduled perfectly — and never rendered. That is D-05, and it is the failure
// this module exists to make impossible.
//
// No React and no lucide here: scripts/verify-scenario-content.mts loads this
// under `node --experimental-strip-types`, where JSX does not run and `@/`
// aliases do not resolve. Hence the explicit `.ts` extensions below, exactly as
// src/lib/celpip.ts does.

import { WORLDS, getScenario, type Level, type Skill } from "./curriculum.ts";
import { getScenarioPhrases } from "./content/phrases.ts";
import { getScenarioVocabulary } from "./content/scenario-vocabulary.ts";
import { GRAMMAR_QUESTIONS, type GrammarQuestion } from "./content/grammar.ts";
// A deliberate ESM cycle: the bank composes its ids through `scenarioItemId`
// above and this module resolves them back. It is safe because the bank builds
// its ids on first ACCESS rather than at module scope — see the header of
// scenario-grammar.ts, which explains the temporal-dead-zone trap avoided.
import { getScenarioGrammar } from "./content/scenario-grammar.ts";

/* ------------------------------------------------------------------ *
 * The id (D-06, ratified 2026-07-31).
 * ------------------------------------------------------------------ */

/**
 * Separates the three parts of a scenario item's id.
 *
 * The composite carries a `/` (inside the scenario key) that no pre-existing
 * id in this app has, so the new key space cannot collide with the old one —
 * that is the property the whole format was chosen for, and
 * scripts/verify-scenario-content.mts asserts it rather than trusting it.
 */
export const SCENARIO_ITEM_SEPARATOR = "#";

/**
 * The kinds of item a scenario's id space has.
 *
 * SCHEDULED kinds — items that enter the review queue:
 * `phrase` and `vocab` are recall cards (plan 03-01). `grammar` is a scored
 * exercise item (plan 03-05): the question's OWN id is the composed id, so
 * `GrammarQuiz` schedules a namespaced entry without knowing this module
 * exists. A SCHEDULED kind added here must also gain a branch in
 * `resolveReviewItem` and a source in `reviewableIds` below, or its items are
 * stored, merged and never rendered — the D-05 failure this module exists to
 * make impossible.
 *
 * UNSCHEDULED kinds — items that take an id but never enter the queue:
 * `writing` (plan 03-06). A scenario writing task is a long-form draft the
 * learner self-checks against a checklist and a model answer; nothing scores it,
 * so nothing ever writes `srs["…#writing#…"]` and there is no card to bring
 * back. It takes an id from this space anyway for STORAGE, not scheduling:
 * `WritingDesk` derives its draft key from the prompt id, so composing that id
 * makes two scenarios' drafts structurally unable to collide (T-03-14).
 * `reading` (plan 03-07) is unscheduled for a different reason: `PassageReader`
 * scores its comprehension questions in place and explains the key, but it
 * never calls `recordAttempt` — and a comprehension question torn out of its
 * passage could not be answered in a review card even if it did, because the
 * passage is the question. It takes an id for UNIQUENESS: a scenario passage
 * and a global one now share the `Passage` shape, and an id that names its own
 * scenario cannot collide with `"coffee"` or `"market"`.
 * An unscheduled kind is deliberately absent from `reviewableIds` and returns
 * `undefined` from `resolveReviewItem`, and the harness asserts both — so
 * "unscheduled" is a proved property rather than an omission that looks like
 * one.
 */
export type ScenarioItemKind =
  | "phrase"
  | "vocab"
  | "grammar"
  | "writing"
  | "reading";

const ITEM_KINDS: readonly ScenarioItemKind[] = [
  "phrase",
  "vocab",
  "grammar",
  "writing",
  "reading",
];

/** The kinds that DO enter the review queue. `reviewableIds()` sources one list
 * per entry here; `resolveReviewItem` has one branch per entry. Anything in
 * `ITEM_KINDS` and not here is unscheduled by design. */
export const SCHEDULED_ITEM_KINDS: readonly ScenarioItemKind[] = [
  "phrase",
  "vocab",
  "grammar",
];

export interface ScenarioItemId {
  /** the composite `world/scenario` key */
  scenarioKey: string;
  kind: ScenarioItemKind;
  /** the item's authored slug, unique within its scenario */
  localId: string;
}

/**
 * Composes the stored id. NOTHING outside this module may spell the format by
 * hand — the id is a one-way door on live learner data (changing it orphans
 * every stored entry with no migration path), so it gets exactly one author.
 *
 * `scenarioItemId("social/small-talk", "phrase", "hows-it-going")`
 *   → `"social/small-talk#phrase#hows-it-going"`
 */
export function scenarioItemId(
  scenarioKey: string,
  kind: ScenarioItemKind,
  localId: string,
): string {
  return [scenarioKey, kind, localId].join(SCENARIO_ITEM_SEPARATOR);
}

/**
 * The inverse. Returns nothing for anything that is not a live scenario item —
 * a global grammar id (no separator), a malformed id, an unknown kind, or a
 * scenario key the curriculum no longer has.
 */
export function parseScenarioItemId(id: string): ScenarioItemId | undefined {
  const parts = id.split(SCENARIO_ITEM_SEPARATOR);
  if (parts.length !== 3) return undefined;
  const [scenarioKey, kind, localId] = parts;
  if (!scenarioKey || !localId) return undefined;
  if (!ITEM_KINDS.includes(kind as ScenarioItemKind)) return undefined;
  const [worldSlug, scenarioSlug, ...rest] = scenarioKey.split("/");
  if (rest.length > 0 || !worldSlug || !scenarioSlug) return undefined;
  if (!getScenario(worldSlug, scenarioSlug)) return undefined;
  return { scenarioKey, kind: kind as ScenarioItemKind, localId };
}

/* ------------------------------------------------------------------ *
 * The deck.
 * ------------------------------------------------------------------ */

/**
 * One recall card. Built HERE and nowhere else, so the deck the learner studies
 * on a scenario page and the deck she meets in /review are produced by the same
 * function and cannot disagree about a single field.
 */
export interface RecallItem {
  /** the composed, stored id */
  id: string;
  /** shown first — the Spanish */
  front: string;
  /** revealed — the English */
  back: string;
  /** a pronunciation/usage tip or an example sentence, when there is one */
  hint?: string;
  /** the SCENARIO's title, so weakTopics() groups by scenario rather than
   * collapsing all 550-odd items into "General" */
  topic: string;
  /** the scenario's CEFR level */
  level: Level;
  /** which skill's XP a rating credits */
  xpSkill: Skill;
}

/**
 * A scenario's own phrases followed by its own vocabulary, as one deck.
 *
 * Empty when the scenario has neither bank entry — never a fallback: both
 * lookups below are the strict accessors for exactly that reason.
 */
export function scenarioRecallItems(
  worldSlug: string,
  scenarioSlug: string,
): RecallItem[] {
  const found = getScenario(worldSlug, scenarioSlug);
  if (!found) return [];
  const { scenario } = found;
  const scenarioKey = `${worldSlug}/${scenarioSlug}`;

  const phrases = (getScenarioPhrases(worldSlug, scenarioSlug) ?? []).map(
    (phrase): RecallItem => ({
      id: scenarioItemId(scenarioKey, "phrase", phrase.id),
      front: phrase.es,
      back: phrase.text,
      hint: phrase.tip,
      topic: scenario.title,
      level: scenario.level,
      xpSkill: "speaking",
    }),
  );

  const vocabulary = (getScenarioVocabulary(worldSlug, scenarioSlug) ?? []).map(
    (card): RecallItem => ({
      id: scenarioItemId(scenarioKey, "vocab", card.id),
      front: card.es,
      back: card.term,
      hint: card.example,
      topic: scenario.title,
      level: scenario.level,
      // The deck browser's match game already credits vocabulary to reading
      // (VocabularyView.tsx); one store, one convention.
      xpSkill: "reading",
    }),
  );

  return [...phrases, ...vocabulary];
}

/* ------------------------------------------------------------------ *
 * Resolution — a due id back into something the review screen can render.
 * ------------------------------------------------------------------ */

export type ReviewItem =
  | { kind: "grammar"; id: string; question: GrammarQuestion }
  | { kind: "recall"; id: string; item: RecallItem };

/**
 * Turns a due id into a renderable item, or nothing.
 *
 * Nothing is the right answer for an id whose content has since been deleted or
 * renamed: the stored entry stays in `srs` (the merge cannot delete keys and
 * must not try), and the review screen simply skips it — which is what today's
 * bank filter already does, made explicit.
 */
export function resolveReviewItem(id: string): ReviewItem | undefined {
  const question = GRAMMAR_QUESTIONS.find((q) => q.id === id);
  if (question) return { kind: "grammar", id, question };

  const parsed = parseScenarioItemId(id);
  if (!parsed) return undefined;
  const [worldSlug, scenarioSlug] = parsed.scenarioKey.split("/");

  // A scenario grammar question resolves to the SAME `grammar` variant a global
  // one does, so /review, the weak-spots drill and the mistake notebook render
  // it through `GrammarQuiz` with no branch of their own.
  if (parsed.kind === "grammar") {
    const question = (getScenarioGrammar(worldSlug, scenarioSlug) ?? []).find(
      (candidate) => candidate.id === id,
    );
    return question ? { kind: "grammar", id, question } : undefined;
  }

  // An UNSCHEDULED kind, stated rather than arrived at. A scenario writing task
  // is not a review card and neither is a scenario reading passage: nothing
  // scores either, so nothing ever schedules its id, and there is no one-screen
  // item to hand /review. Falling through to the recall lookup below would also
  // return undefined — by accident, and one added kind away from silently
  // resolving to the wrong thing.
  if (!SCHEDULED_ITEM_KINDS.includes(parsed.kind)) return undefined;

  const item = scenarioRecallItems(worldSlug, scenarioSlug).find(
    (candidate) => candidate.id === id,
  );
  return item ? { kind: "recall", id, item } : undefined;
}

/**
 * Every id every bank can currently emit.
 *
 * Used by the harness to prove global uniqueness across the key spaces — the
 * collision this phase's id format was chosen to make impossible is worth
 * proving on every run rather than reasoning about once.
 *
 * It is also load-bearing at runtime, and this is the part a later plan must
 * not forget: `Dashboard` and `ReviewHub` both build their "Due today" count by
 * filtering the due set through this list, and `ReviewHub`'s weak-spots drill
 * is built by resolving every id in it. An id this function omits is stored,
 * merged and scheduled correctly and then counted nowhere and drillable never —
 * D-05 again, one level up. So every scenario exercise bank that writes to the
 * SRS adds its ids HERE as well as gaining a branch in `resolveReviewItem`.
 *
 * The converse is equally deliberate: a bank whose items are NOT scored must
 * NOT appear here. Plan 03-06's writing tasks are the first such bank and plan
 * 03-07's reading passages are the second — nothing schedules either, so
 * listing their ids would inflate the "Due today" count with items that can
 * never be due and hand the weak-spots drill an id that resolves to nothing.
 * See `SCHEDULED_ITEM_KINDS`.
 *
 * So the rule is CONDITIONAL, and the cost of getting it wrong is symmetric:
 * omit a scored bank and its items are invisible; add an unscored one and its
 * items are permanent phantoms. Before adding a bank here, check whether its
 * renderer actually calls `recordAttempt` — `GrammarQuiz` does, `WritingDesk`
 * and `PassageReader` do not.
 */
export function reviewableIds(): string[] {
  const ids = GRAMMAR_QUESTIONS.map((q) => q.id);
  for (const world of WORLDS) {
    for (const scenario of world.scenarios) {
      for (const item of scenarioRecallItems(world.slug, scenario.slug)) {
        ids.push(item.id);
      }
      // Scenario exercises. Plan 03-05 (grammar); plans 03-06 through 03-10
      // append their own bank here if it schedules items.
      for (const question of getScenarioGrammar(world.slug, scenario.slug) ??
        []) {
        ids.push(question.id);
      }
    }
  }
  return ids;
}
