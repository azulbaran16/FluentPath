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

  /* ───────────────────── work/interviews · B2 ─────────────────────
   * Narrating experience, hedging a claim, imagining a role you do not have
   * yet, and asking your questions back without sounding blunt. */
  "work/interviews": [
    {
      slug: "experience-perfect-continuous",
      level: "B2",
      topic: "Present perfect continuous",
      prompt: "I ___ in logistics for about six years now.",
      options: ["work", "worked", "have been working", "am working"],
      answer: 2,
      explain:
        "A stretch of time that began in the past and is still running → present perfect continuous. “I work” loses the six years; “I worked” tells the panel you have left the field.",
    },
    {
      slug: "star-past-perfect",
      level: "B2",
      topic: "Past perfect",
      prompt: "By the time I took over, the team ___ two deadlines in a row.",
      options: ["missed", "had missed", "has missed", "was missing"],
      answer: 1,
      explain:
        "In a STAR answer the Situation happened before the Action you took, and past perfect is what marks that order — the misses came before you took over.",
    },
    {
      slug: "hedge-would-say",
      level: "B2",
      topic: "Hedging with would",
      prompt: "I ___ say my strongest suit is spotting problems early.",
      options: ["would", "will", "do", "am"],
      answer: 0,
      explain:
        "“I'd say…” frames a claim about yourself as an opinion, which is how you sound confident rather than boastful. “I will say” only announces that you are about to speak.",
    },
    {
      slug: "hypothetical-second-conditional",
      level: "B2",
      topic: "Second conditional",
      prompt: "If I ___ the role, I'd spend the first month listening.",
      options: ["get", "got", "will get", "would get"],
      answer: 1,
      explain:
        "You are imagining a job you do not have yet → second conditional: if + past simple, would + base verb. “Would” never goes in the if-half.",
    },
    {
      slug: "indirect-question-success",
      level: "B2",
      topic: "Indirect questions",
      prompt: "Could you tell me what ___ like in this role?",
      options: [
        "does success look",
        "success looks",
        "is success looking",
        "looks success",
      ],
      answer: 1,
      explain:
        "Once a question sits inside another question the word order goes back to statement order: “what success looks like”, not “what does success look like”.",
    },
  ],

  /* ───────────────────── work/emails · B1 ─────────────────────
   * The grammar that decides whether an email reads as polite or blunt:
   * modals for requests, the conditional for an offer, the passive where the
   * actor is deliberately absent, and past forms used as distance. */
  "work/emails": [
    {
      slug: "would-you-mind-request",
      level: "B1",
      topic: "Modals",
      prompt: "___ you mind sending the figures over before Friday?",
      options: ["Would", "Could", "Will", "Should"],
      answer: 0,
      explain:
        "“Would you mind + -ing” is the softest request an email has. “Could you mind…” is not English, and “Will you send…” reads as an instruction rather than an ask.",
    },
    {
      slug: "if-first-conditional-offer",
      level: "B1",
      topic: "First conditional",
      prompt: "Let me know if you ___ anything else and I'll send it today.",
      options: ["will need", "need", "needed", "would need"],
      answer: 1,
      explain:
        "First conditional: present simple after “if”, “will” in the other half. “If you will need” is a common carry-over from Spanish and marks the email as non-native immediately.",
    },
    {
      slug: "passive-invoice-sent",
      level: "B1",
      topic: "Passive voice",
      prompt: "The invoice ___ last Tuesday, so it should be with you by now.",
      options: ["was sent", "sent", "has sent", "was sending"],
      answer: 0,
      explain:
        "The passive leaves the person out on purpose: “the invoice was sent” states the fact without pointing at who did — or did not — send it.",
    },
    {
      slug: "look-forward-to-gerund",
      level: "B1",
      topic: "Gerund vs infinitive",
      prompt: "I look forward to ___ from you.",
      options: ["hear", "hearing", "heard", "be heard"],
      answer: 1,
      explain:
        "The “to” in “look forward to” is a preposition, not an infinitive marker, so the verb after it takes -ing. This is the single most common sign-off error in English email.",
    },
    {
      slug: "was-wondering-softener",
      level: "B1",
      topic: "Past continuous",
      prompt: "I ___ whether you'd had a chance to look at the proposal.",
      options: ["wonder", "was wondering", "am wondering", "have wondered"],
      answer: 1,
      explain:
        "Putting the verb in the past — “I was wondering…” — puts distance between you and the ask, and that distance is what makes it polite. You are still asking now.",
    },
  ],

  /* ───────────────────── native/phrasal-verbs · B2 ─────────────────────
   * The scenario where a question can be about the thing it names. The
   * briefing demonstrates separability on “turn it down” and the
   * get up / get on / get over family, and the phrase set and deck use
   * fourteen more, so none of those appears here as an answer. */
  "native/phrasal-verbs": [
    {
      slug: "separable-pronoun-look-over",
      level: "B2",
      topic: "Phrasal verb separability",
      prompt: "Here's the draft — could you ___ before I send it?",
      options: ["look over it", "look it over", "over look it", "look over"],
      answer: 1,
      explain:
        "“Look over” is separable, and a pronoun object HAS to sit in the middle: “look it over”. “Look over it” only works when you are literally looking over the top of something.",
    },
    {
      slug: "inseparable-do-without",
      level: "B2",
      topic: "Phrasal verb separability",
      prompt: "The projector's broken, so we'll have to ___ for now.",
      options: ["do it without", "do without it", "without do it", "do it out"],
      answer: 1,
      explain:
        "Not every phrasal verb splits. “Do without” is inseparable, so even a pronoun stays after the particle — “do without it”.",
    },
    {
      slug: "particle-drag-on",
      level: "B2",
      topic: "Phrasal verb particles",
      prompt: "The meeting ___ for another hour after the decision was made.",
      options: ["dragged on", "dragged up", "dragged out", "dragged off"],
      answer: 0,
      explain:
        "The particle carries the meaning: “on” is continuation, so “drag on” is to go on far too long. “Drag up” is to raise an old subject, and “drag out” is what somebody does to a meeting deliberately.",
    },
    {
      slug: "particle-make-out",
      level: "B2",
      topic: "Phrasal verb particles",
      prompt: "The line was terrible — I could barely ___ what she was saying.",
      options: ["make up", "make out", "make off", "make over"],
      answer: 1,
      explain:
        "“Make out” is to manage to hear or see something with difficulty. “Make up” is to invent it — a very different thing to admit to on a call.",
    },
    {
      slug: "register-put-off",
      level: "B2",
      topic: "Phrasal verbs vs formal verbs",
      prompt:
        "The email says the review has been postponed; your manager just says it's been ___.",
      options: ["put off", "put out", "put up", "put down"],
      answer: 0,
      explain:
        "Most formal single words have a spoken phrasal twin — postpone → put off. The other particles build different verbs entirely: put out (annoyed), put up (give someone a bed), put down (criticise).",
    },
  ],};

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
