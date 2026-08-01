// Rehearsal tasks written FOR one scenario, keyed `${worldSlug}/${scenarioSlug}` —
// the same keying scenario-lessons.ts, phrases.ts, scenario-vocabulary.ts,
// scenario-grammar.ts, scenario-writing.ts and scenario-reading.ts use.
//
// This is the speaking half of D-01, and it is the largest half: thirty of the
// fifty-two declared pairs. Before this bank, twenty-one of them were handed
// WORLD_FALLBACK — three generic lines shared by every scenario in the world,
// i.e. two scenarios returning the identical exercise, which is the outcome D-01
// was chosen to prevent. CONT-02 has since given all thirty-five scenarios their
// own phrases, which fixed the warm-up. What was still missing is the EXERCISE:
// something that makes practising "complaining politely" practise complaining
// rather than pronunciation.
//
// ─────────────────────────────────────────────────────────────────────────────
// A NEW SHAPE, AND WHY THIS SKILL IS THE ONE THAT NEEDED ONE. Grammar, writing
// and reading each reused an exercise type that already existed, because reusing
// one is how fifty-two exercises stay consistent. Speaking had no scenario
// exercise type at all: `PronunciationLab` drills phrases (that is the warm-up,
// one step higher on the page) and the tutor role-play is a clearly-labelled
// stub until an API key is configured, which is Phase 5's requirement and not
// this one. So the shape below is deliberately the smallest thing that is still
// a rehearsal: a SETUP naming who the learner is and what the situation is,
// exactly THREE ordered MOVES stating what a successful turn does, and one
// SUCCESS line she can honestly check herself against. Every field is required,
// because this repo has already paid for an author forgetting an optional one.
//
// IT MUST WORK WITH NO AI AND NO MICROPHONE. A speaking exercise that depended
// on either would not be practicable today, so the panel that renders this is a
// brief the learner works through aloud on her own: no network call, no speech
// API, no recording, no score. `scripts/verify-scenario-content.mts` reads the
// panel's source and asserts exactly that rather than trusting this paragraph.
//
// UNSCHEDULED, AND THAT IS A DECISION RATHER THAN AN OMISSION. The panel awards
// speaking XP once when the learner ticks all three moves and records the day's
// activity; it never calls `recordAttempt`, so nothing ever writes
// srs["…#speaking#…"]. A self-ticked box carries no correctness signal, and a
// rehearsal spoken aloud cannot be brought back as a one-screen review card in
// any case. So `speaking` joins `writing` and `reading` OUTSIDE
// `SCHEDULED_ITEM_KINDS`, these ids are deliberately absent from
// `reviewableIds()`, and the harness asserts the negative — because a phantom
// due item and a missing one are both silent failures.
//
// THE ID IS STILL THE COMPOSED SCENARIO ITEM ID, for uniqueness rather than for
// scheduling: fourteen more tasks land in plan 03-10 and every other bank in
// this phase shares one flat key space with them. Composed only by
// `scenarioItemId`, the one author of the D-06 format.
//
// WHY COMPOSITION IS LAZY. `review-items.ts` and the scenario banks form a
// genuine ESM cycle. Composing at module scope would call `scenarioItemId` while
// `review-items.ts`'s own `const SCENARIO_ITEM_SEPARATOR` was still in its
// temporal dead zone whenever that module happened to be evaluated first — a
// ReferenceError that depends on nothing but import order. Building on first
// access moves the call after every module body has run, in every order.
//
// No React and no hooks: scripts/verify-scenario-content.mts loads this file
// under `node --experimental-strip-types`, where `@/` aliases do not resolve.
// Hence the explicit `.ts` extensions below.

import { scenarioItemId } from "../review-items.ts";
import type { Level } from "../curriculum.ts";

/** A scenario's rehearsal task, as the panel receives it. */
export interface ScenarioSpeakingTask {
  /** the composed scenario item id — see the header */
  id: string;
  title: string;
  /** the scenario's OWN CEFR level, not a level of the author's choosing */
  level: Level;
  /** who the learner is and what the situation is */
  setup: string;
  /**
   * Exactly three, in order, each stating what a successful turn DOES. A tuple
   * rather than an array so a fourth or a second is a compile error as well as
   * a harness failure — the count is the shape, not a floor.
   */
  moves: readonly [string, string, string];
  /** something the learner can honestly check herself against afterwards */
  success: string;
}

/**
 * A task as AUTHORED. Identical except that the id is the local slug;
 * `getScenarioSpeaking` swaps it for the composed one.
 */
interface AuthoredSpeakingTask {
  /**
   * Authored slug, unique across the bank, never derived from array position.
   */
  slug: string;
  title: string;
  level: Level;
  setup: string;
  moves: readonly [string, string, string];
  success: string;
}

const BANK: Record<string, AuthoredSpeakingTask> = {
  /* ═══════════════════ Social & Everyday Life ═══════════════════
   * Six scenarios, six situations. Each task practises the move its own
   * scenario is named after — small talk is not "have a conversation", it is
   * open, sustain, close — and each is doable aloud, alone, in one turn or one
   * short exchange. The scenario's briefing, phrase set and vocabulary deck
   * were read first: the moves give those phrases somewhere to be used rather
   * than repeating them. */

  "social/small-talk": {
    slug: "two-minutes-at-the-coffee-machine",
    title: "Two minutes at the coffee machine",
    level: "B1",
    setup:
      "You started on Monday. A colleague you have met once is waiting for the same coffee machine.",
    moves: [
      "Open with something you can both see, and end on a question.",
      "Answer with one extra detail, then hand the question straight back.",
      "Leave first: give a reason and name when you will talk again.",
    ],
    success:
      "You asked two questions, and neither of you ran out of things to say.",
  },

  "social/making-friends": {
    slug: "turn-a-classmate-into-a-plan",
    title: "Turn a classmate into a plan",
    level: "B1",
    setup:
      "You have talked to the same person at your Tuesday climbing class three times. Never outside it.",
    moves: [
      "Ask about something they mentioned last week, one level deeper than last time.",
      "Turn it into a real offer: a day, a place, an hour.",
      "Swap a number or a handle, and say what you will send tonight.",
    ],
    success:
      "You finished with a day in the diary rather than with “sometime”.",
  },

  "social/dating": {
    slug: "ask-and-make-it-easy-to-refuse",
    title: "Ask, and make it easy to refuse",
    level: "B2",
    setup:
      "Two weeks of messages with someone you like. Tonight you want to ask them out loud.",
    moves: [
      "Compliment something they said or did — never how they look.",
      "Invite them to one place on one evening, small enough to be easy.",
      "Offer the way out yourself, in the words you would actually use.",
    ],
    success:
      "The invitation named a place and a day, and a no would have cost nothing.",
  },

  "social/parties": {
    slug: "join-a-group-then-leave-it-well",
    title: "Join a group, then leave it well",
    level: "B1",
    setup:
      "A friend's flat-warming. You know the host, nobody else, and fifteen people are already talking.",
    moves: [
      "Join a group of three: ask to stand there and say why.",
      "Ask how they know the host, then put your own name into your answer.",
      "Step away warmly with a reason, so you can come back later.",
    ],
    success:
      "You joined one conversation and left it deliberately, and both people knew your name.",
  },

  "social/complaining": {
    slug: "the-repair-that-was-not-done",
    title: "The repair that was not done",
    level: "B2",
    setup:
      "You paid on Tuesday to have your bike fixed. It is Friday, the receipt is in your hand, and nothing was done.",
    moves: [
      "Say what was agreed and what happened, without saying whose fault it is.",
      "Ask for one fix they could carry out today.",
      "If the answer is no, repeat the ask once, then say what you will do next.",
    ],
    success:
      "You asked for one thing, said it twice calmly, and never blamed the person opposite.",
  },

  "social/favors": {
    slug: "a-small-ask-of-a-neighbour",
    title: "A small ask of a neighbour",
    level: "B1",
    setup:
      "A parcel arrives Thursday while you are at work. Your neighbour is in, and you have never asked them for anything.",
    moves: [
      "Say how small the ask is before you make it.",
      "Ask with the polite form, and give the reason in the same breath.",
      "Offer something specific back, and mean it.",
    ],
    success:
      "The whole request took under thirty seconds, and your offer back was something you can actually do.",
  },
};

/**
 * Every key the bank actually holds — see the twins in phrases.ts,
 * scenario-vocabulary.ts, scenario-grammar.ts, scenario-writing.ts and
 * scenario-reading.ts. Exported for scripts/verify-scenario-content.mts, which
 * uses it to catch a key naming a scenario that does not exist or does not
 * declare speaking; iterating the curriculum can never reach such a key.
 */
export function scenarioSpeakingKeys(): string[] {
  return Object.keys(BANK);
}

/** Built on first access, never at module scope — see the header. */
let COMPOSED: Record<string, ScenarioSpeakingTask> | undefined;

function composed(): Record<string, ScenarioSpeakingTask> {
  COMPOSED ??= Object.fromEntries(
    Object.entries(BANK).map(([scenarioKey, task]) => {
      const { slug, ...rest } = task;
      return [
        scenarioKey,
        { ...rest, id: scenarioItemId(scenarioKey, "speaking", slug) },
      ];
    }),
  );
  return COMPOSED;
}

/**
 * A scenario's own rehearsal task, or nothing.
 *
 * `undefined` — never a fallback task — because the coverage registry decides
 * what the page claims from what this returns, and a fallback is exactly the
 * shared-exercise failure D-01 rejected. This skill is where that failure
 * actually happened, so this accessor is the one place it must not come back.
 */
export function getScenarioSpeaking(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioSpeakingTask | undefined {
  return composed()[`${worldSlug}/${scenarioSlug}`];
}
