// Grammar questions written FOR one scenario, keyed `${worldSlug}/${scenarioSlug}` —
// the same keying scenario-lessons.ts, phrases.ts and scenario-vocabulary.ts use.
//
// This is the grammar quarter of D-01. A pair that appears below has five
// questions about ITS OWN situation — never generic questions at the right CEFR
// level with a themed sentence pasted in — and a pair that does not appear is
// reported unwritten by the coverage registry rather than served something
// borrowed. `social/small-talk` practises opening, sustaining and closing a
// casual exchange; `work/interviews` the tenses an interview answer turns on;
// `work/emails` the grammar that decides whether an email reads polite or
// blunt; `native/phrasal-verbs` the separability, particle choice and register
// the scenario is named after.
//
// ─────────────────────────────────────────────────────────────────────────────
// NO NEW ITEM TYPE. These are `GrammarQuestion`s — the shape `GrammarQuiz`
// already renders and already reports to `recordAttempt`. Inventing a per-skill
// exercise shape is where inconsistency across fifty-two exercises comes from,
// and reusing this one buys ROADMAP criterion 3 (a scenario mistake surfacing in
// weak topics) with no component change at all.
//
// THE ID IS THE COMPOSED SCENARIO ITEM ID, not a bare slug. `GrammarQuiz` passes
// the question's own id straight to `recordAttempt`, so a question whose id
// already names its scenario writes a correctly namespaced spaced-repetition
// entry with zero change to the component. The bank below therefore stores an
// authored LOCAL slug and `getScenarioGrammar` composes the stored id through
// `scenarioItemId` — the one author of the D-06 format — on the way out.
//
// WHY COMPOSITION IS LAZY. `review-items.ts` imports this module (to resolve a
// due grammar id) and this module imports `scenarioItemId` from it: a genuine
// ESM cycle. Composing at module scope would call `scenarioItemId` while
// `review-items.ts`'s own `const SCENARIO_ITEM_SEPARATOR` was still in its
// temporal dead zone whenever `review-items.ts` happened to be evaluated first —
// a ReferenceError that depends on nothing but import order. Building on first
// access moves the call after every module body has run, in every order. The
// result is memoised, so the array a component receives is referentially stable
// across renders.
//
// TOPIC STRINGS ARE STABLE IDENTIFIERS, NOT DISPLAY COPY. `recordAttempt` stores
// the topic the question was answered under, and `weakTopics()` groups the
// learner's own history by that string. Rewording one silently splits her
// history in two. Where the teaching point genuinely matches the global bank
// (`src/lib/content/grammar.ts`), the string is copied from it EXACTLY so the two
// aggregate instead of fragmenting; where the point is new — question tags, echo
// questions, phrasal-verb separability — the string is new and permanent.
//
// No React and no hooks: scripts/verify-scenario-content.mts loads this file
// under `node --experimental-strip-types`, where `@/` aliases do not resolve.
// Hence the explicit `.ts` extensions below.

import { scenarioItemId } from "../review-items.ts";
import type { GrammarQuestion } from "./grammar.ts";
import type { GrammarLevel } from "./lessons.ts";

/**
 * A question as AUTHORED. Identical to `GrammarQuestion` except that the id is
 * the local slug; `getScenarioGrammar` swaps it for the composed one.
 */
interface AuthoredGrammarQuestion {
  /**
   * Authored slug, unique WITHIN its scenario, never derived from array
   * position — it becomes part of the learner's spaced-repetition key. Insert
   * freely; never renumber.
   */
  slug: string;
  /** the scenario's OWN CEFR level, not a level of the author's choosing */
  level: GrammarLevel;
  /** a stable identifier — see the header before rewording one */
  topic: string;
  /** the sentence, with `___` marking the gap `GrammarQuiz` splits on */
  prompt: string;
  options: string[];
  /** index into `options` */
  answer: number;
  /** REQUIRED, because an optional field is one an author forgets */
  explain: string;
}

const BANK: Record<string, AuthoredGrammarQuestion[]> = {
  /* ───────────────────── social/small-talk · B1 ─────────────────────
   * Opening it, keeping it moving, closing it. The briefing already teaches
   * the safe topics and the answer-plus-bounce-back move; these are the
   * structures those moves are actually made of. */
  "social/small-talk": [
    {
      slug: "weather-question-tag",
      level: "B1",
      topic: "Question tags",
      prompt: "It's freezing out there today, ___?",
      options: ["isn't it", "is it", "doesn't it", "isn't there"],
      answer: 0,
      explain:
        "A positive statement takes a negative tag that repeats its own auxiliary and subject: “It's…” → “isn't it?”. The tag is what hands the conversation over instead of ending it.",
    },
    {
      slug: "weekend-past-simple",
      level: "B1",
      topic: "Past simple",
      prompt: "So, ___ you get up to anything at the weekend?",
      options: ["did", "have", "do", "were"],
      answer: 0,
      explain:
        "The weekend is over, so it is finished time → past simple with “did”. “Have you got up to…” would need the weekend to still be running.",
    },
    {
      slug: "echo-question-have-you",
      level: "B1",
      topic: "Echo questions",
      prompt: "— I've just got back from Lisbon. — ___ you? How was it?",
      options: ["Have", "Did", "Are", "Do"],
      answer: 0,
      explain:
        "An echo question keeps a chat alive by repeating only the auxiliary you just heard: “I've just got back” → “Have you?”. It costs one word and buys you a whole story.",
    },
    {
      slug: "these-days-continuous",
      level: "B1",
      topic: "Present simple vs continuous",
      prompt: "What ___ these days — still at the same company?",
      options: ["do you do", "are you doing", "did you do", "you do"],
      answer: 1,
      explain:
        "“What do you do?” asks about your job in general; “these days” makes the question about right now and temporarily → present continuous.",
    },
    {
      slug: "close-had-better",
      level: "B1",
      topic: "had better",
      prompt: "Anyway, I ___ let you get on — it was really good to see you.",
      options: ["'d better", "'d rather", "had better to", "would better"],
      answer: 0,
      explain:
        "“I'd better…” (had better + base verb, no “to”) is the standard, warm way to end a chat. “I'd rather” says you would prefer to be elsewhere — a very different goodbye.",
    },
  ],

};

/**
 * Every key the bank actually holds — see the twins in phrases.ts and
 * scenario-vocabulary.ts. Exported for scripts/verify-scenario-content.mts,
 * which uses it to catch a key naming a scenario that does not exist or does
 * not declare grammar; iterating the curriculum can never reach such a key.
 */
export function scenarioGrammarKeys(): string[] {
  return Object.keys(BANK);
}

/** Built on first access, never at module scope — see the header. */
let COMPOSED: Record<string, GrammarQuestion[]> | undefined;

function composed(): Record<string, GrammarQuestion[]> {
  COMPOSED ??= Object.fromEntries(
    Object.entries(BANK).map(([scenarioKey, questions]) => [
      scenarioKey,
      questions.map(({ slug, ...rest }): GrammarQuestion => ({
        ...rest,
        id: scenarioItemId(scenarioKey, "grammar", slug),
      })),
    ]),
  );
  return COMPOSED;
}

/**
 * A scenario's own grammar questions, or nothing.
 *
 * `undefined` — never a fallback set — because the coverage registry decides
 * what the page claims from what this returns, and an exercise that falls back
 * is exactly the stub D-03 forbids: two scenarios handed the same practice.
 */
export function getScenarioGrammar(
  worldSlug: string,
  scenarioSlug: string,
): GrammarQuestion[] | undefined {
  return composed()[`${worldSlug}/${scenarioSlug}`];
}
