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

  /* The seventh Social scenario, and the only C1 one. The part learners
   * actually need is not making the joke — it is what you say in the two
   * seconds after it dies, which is the move most sets leave out. */
  "social/humor": {
    slug: "the-joke-that-did-not-land",
    title: "The joke that did not land",
    level: "C1",
    setup:
      "In the corridor a colleague drops a flat one-liner about the deadline. You are not sure it was a joke.",
    moves: [
      "Check the tone in one line that works whichever way it was meant.",
      "Answer with one of your own, aimed at yourself or at the week — never at anyone present.",
      "When it dies, name it and move on. Do not explain it.",
    ],
    success:
      "You made one joke and one recovery, and the recovery was shorter than the joke.",
  },

  /* ═══════════════════ Work & Professional ═══════════════════
   * Six scenarios, and each task turns on the move that is specific to it
   * rather than on "sound professional": interrupting, signposting, countering
   * without closing a door, asking for a contact, and taking criticism without
   * defending. Where a scenario also declares writing, the rehearsal is
   * deliberately the half a written brief cannot reach — the live turn, under
   * time, with someone answering back. */

  "work/interviews": {
    slug: "tell-me-about-a-time-it-went-wrong",
    title: "Tell me about a time it went wrong",
    level: "B2",
    setup:
      "Final round. The interviewer asks about something you owned that went wrong, and you have ninety seconds.",
    moves: [
      "Set the scene in two sentences: when, where, what was yours.",
      "Say what you did, in the first person, and finish on a result with a number in it.",
      "Hand it back with a question only someone who has done the job would ask.",
    ],
    success:
      "You said “I” more often than “we”, and you stopped on the result instead of trailing off.",
  },

  "work/meetings": {
    slug: "take-the-floor-then-give-it-back",
    title: "Take the floor, then give it back",
    level: "B2",
    setup:
      "Eight people on a call. Someone has talked for four minutes and is about to skip the decision your team needs.",
    moves: [
      "Come in at the first pause: use their name and say what you are adding.",
      "Make the point in three sentences and name who should answer it.",
      "Give the floor back yourself, with one line on what was agreed.",
    ],
    success:
      "You interrupted once, took under a minute, and handed the call to a named person.",
  },

  "work/presentations": {
    slug: "three-things-and-the-question-you-cannot-answer",
    title: "Three things, and the question you cannot answer",
    level: "B2",
    setup:
      "Eight minutes, five slides, and a room that has already sat through two talks this morning.",
    moves: [
      "Open by naming the three things they will leave with, in the order you will say them.",
      "Move between two slides aloud: close the first and open the second in one sentence.",
      "Take a question you cannot answer: say so, say what you will do, give a date.",
    ],
    success:
      "The room could repeat your three points, and the question you dodged did not sound dodged.",
  },

  "work/negotiating": {
    slug: "a-counter-offer-that-keeps-the-door-open",
    title: "A counter-offer that keeps the door open",
    level: "C1",
    setup:
      "The supplier's quote came back eighteen per cent over budget. You want the price and the relationship.",
    moves: [
      "Say what works in their offer before you say what does not.",
      "Counter as a trade: one thing you give, one thing you ask, one sentence.",
      "Say what happens if they cannot move, in words they could repeat to their own boss.",
    ],
    success:
      "Your counter had an “if” in it, and nothing you said would stop you calling them next quarter.",
  },

  "work/networking": {
    slug: "three-minutes-and-one-contact",
    title: "Three minutes and one contact",
    level: "B2",
    setup:
      "The coffee break at a conference. The person you came to meet is free, and the break is short.",
    moves: [
      "Say who you are in one sentence that ends in what you do, not your job title.",
      "Ask them something only they could answer, and say why you are asking.",
      "Ask for the contact, name the one thing you will send, and let them go.",
    ],
    success:
      "You listened more than you talked, asked once, and walked away with something to send.",
  },

  "work/feedback": {
    slug: "take-it-before-you-answer-it",
    title: "Take it before you answer it",
    level: "B2",
    setup:
      "Your manager says the section you wrote slowed the whole document down. Your instinct is to explain why it is long.",
    moves: [
      "Say nothing in your defence: thank them and ask for one example.",
      "Play the criticism back in your own words and check you have it right.",
      "Ask what a better version looks like, then name what you will change.",
    ],
    success:
      "You asked two questions before you gave a single reason, and you left with a change and a date.",
  },

  /* ═══════════════════ Reading & Ideas ═══════════════════
   * The one speaking pair outside Social and Work in this plan. Its writing
   * prompt (03-06) already asks for a written concession on a car-free city
   * centre, so this takes a different motion and the half writing cannot
   * reach: the ninety-second spoken open, where the concession has to come out
   * before the other side reaches for it and the last line has to be the one
   * that gets repeated. */

  "academic/debate": {
    slug: "open-for-the-motion-in-ninety-seconds",
    title: "Open for the motion in ninety seconds",
    level: "C1",
    setup:
      "A seminar debate on whether the school an applicant attended may count in university admissions. You open.",
    moves: [
      "State your position in one sentence the other side would call fair.",
      "Give their best argument before they do, concede what is true in it, then show what survives.",
      "Close on the sentence you want repeated. Add no new claim after it.",
    ],
    success:
      "Your concession was one the other side would recognise, and your last line argued nothing new.",
  },

  /* ═══════════════════ Travel & Errands ═══════════════════
   * Six scenarios, and every one of them used to be handed the same three
   * generic travel lines — so this world is where D-01's rejected outcome was
   * most visible and where a copy between two entries would be most tempting.
   * Three of the six are A2, and A2 is where a task drifts upward fastest: the
   * moves below are doable in short, simple sentences by someone standing at a
   * counter with a queue behind her. Each turns on the move its own scenario is
   * named after — checking in under a change, reporting a room, ordering with
   * an allergy, following a route, describing a symptom, returning a fault. */

  "travel/airport": {
    slug: "the-connection-you-just-lost",
    title: "The connection you just lost",
    level: "A2",
    setup:
      "Your first flight landed late and the second is gone. One desk is open, eleven people behind you.",
    moves: [
      "Say your flight number and the problem in one short sentence.",
      "Ask for the next flight, then ask what time you must be at the gate.",
      "Say the new time and the new gate back to the agent before you move away.",
    ],
    success:
      "You gave the flight number first, and you walked away with a time and a gate you had said out loud.",
  },

  "travel/hotel": {
    slug: "not-the-room-you-booked",
    title: "Not the room you booked",
    level: "B1",
    setup:
      "You booked a double room with a window. The card opens a small one facing the car park.",
    moves: [
      "Say what you booked and what you were given, without saying anyone lied.",
      "Ask what else is free tonight, and how many of your nights it would cover.",
      "If nothing is free, ask for one thing that fixes tonight and when it will arrive.",
    ],
    success:
      "You described the difference rather than your mood, and left with another room or a promise you could repeat.",
  },

  "travel/restaurant": {
    slug: "order-around-an-allergy",
    title: "Order around an allergy",
    level: "A2",
    setup:
      "Dinner with two friends. You are allergic to nuts, the menu is only in English, and the waiter is already at the table.",
    moves: [
      "Say your allergy first, before you talk about the dishes.",
      "Choose one dish and ask if it has nuts in it.",
      "If the waiter is not sure, ask him to check in the kitchen.",
    ],
    success:
      "You said the word “allergic” before you ordered, and nobody at the table had to say it for you.",
  },

  "travel/directions": {
    slug: "the-street-that-is-not-on-the-map",
    title: "The street that is not on the map",
    level: "A2",
    setup:
      "Your phone is dead, the street you want is not on the paper map in your hand, and you are late.",
    moves: [
      "Ask one person for the street by name, and say that you are on foot.",
      "Ask how many minutes it takes from here.",
      "If you did not follow it, ask them to point, and say the first turn back.",
    ],
    success:
      "You left knowing the first turn and roughly how many minutes, not just which way to wave your arm.",
  },

  "travel/emergencies": {
    slug: "a-pharmacy-in-a-hurry",
    title: "A pharmacy in a hurry",
    level: "B1",
    setup:
      "Sunday, far from home. Your throat has been bad since Friday and the pharmacist speaks quickly.",
    moves: [
      "Say what is wrong and since when, before you say what you want.",
      "Say what you already take, and ask whether this is safe alongside it.",
      "Ask her to say the dose again more slowly, and write it down while she speaks.",
    ],
    success:
      "You gave the symptom and the day it started, and the dose left with you written down rather than remembered.",
  },

  "travel/shopping": {
    slug: "a-broken-zip-and-a-receipt",
    title: "A broken zip and a receipt",
    level: "B1",
    setup:
      "The jacket you bought last week has a broken zip. You have the receipt, and a sign says exchanges only.",
    moves: [
      "Show the fault and say when you bought it, in that order.",
      "Say which you want, an exchange or your money back, and why that one.",
      "If the assistant cannot decide, ask who can and when they are next in.",
    ],
    success:
      "You named one outcome instead of waiting to be offered one, and a no ended with a person and a day.",
  },

  /* ═══════════════════ Practical Life ═══════════════════
   * Five scenarios that all used to share a generic set as well. Two of them —
   * `phone-calls` and `tech-support` — put the learner somewhere she cannot see
   * the other person and cannot control the pace, so one move in each is about
   * getting something REPEATED or CONFIRMED rather than about producing more
   * language: the skill that actually fails on a bad line is interrupting to
   * check, not fluency. Where a scenario also declares writing, the rehearsal
   * is the half a written brief cannot reach. */

  "practical/phone-calls": {
    slug: "a-bad-line-to-the-garage",
    title: "A bad line to the garage",
    level: "B1",
    setup:
      "A garage, about a noise your car makes. The line is poor and there is a radio playing behind them.",
    moves: [
      "Say who you are and why you are calling in two sentences.",
      "The moment you lose a word, stop them there and ask for that word again, not the whole sentence.",
      "Read the price and the day back as numbers before you hang up.",
    ],
    success:
      "You stopped them the first time you lost something, not the third, and both numbers were confirmed aloud.",
  },

  "practical/tech-support": {
    slug: "past-the-script-on-the-third-call",
    title: "Past the script, on the third call",
    level: "B1",
    setup:
      "Your internet drops every evening around nine. Two earlier calls both ended with “try restarting the router”.",
    moves: [
      "Give the pattern first: when it started, how often, and what sets it off.",
      "Say what you have already tried, so they can skip that page of their script.",
      "Ask for a reference number, and if tonight is the same, ask for an escalation.",
    ],
    success:
      "You gave a pattern instead of “it does not work”, and finished the call holding a number you can quote.",
  },

  "practical/housing": {
    slug: "twenty-minutes-to-see-a-flat",
    title: "Twenty minutes to see a flat",
    level: "B2",
    setup:
      "Twenty minutes to view a flat, an agent with three more viewings after yours, and two applicants waiting on the landing.",
    moves: [
      "Ask the two questions the photographs cannot answer, before you look at the rooms.",
      "Ask who pays for what — repairs, the boiler, the water — and get one of them named.",
      "Before you leave, ask what would make them pick somebody else's application.",
    ],
    success:
      "You asked about cost and repairs while still inside the flat, and you know what the decision turns on.",
  },

  "practical/banking": {
    slug: "a-charge-you-did-not-make",
    title: "A charge you did not make",
    level: "B1",
    setup:
      "Thirty-two euros left your account on Saturday for something you never bought. You are at the counter, the line open on your phone.",
    moves: [
      "Give the date, the amount and the name on the line, then say it was not you.",
      "Ask what happens next and how long it takes, in days.",
      "Ask whether the card should be stopped today, and who does it.",
    ],
    success:
      "Three facts came before any opinion, and you left knowing a number of days and whose job the card is.",
  },

  "practical/appointments": {
    slug: "move-friday-without-losing-it",
    title: "Move Friday without losing it",
    level: "A2",
    setup:
      "The dentist is on Friday at four and you cannot go now. The receptionist has two other calls waiting.",
    moves: [
      "Give your name and your appointment: the day and the time.",
      "Say you cannot come, then ask for the first free morning.",
      "Say the new day and time back, and ask if you must bring anything.",
    ],
    success:
      "The old appointment was cancelled by its day and time, and the new one was spoken twice before you hung up.",
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
