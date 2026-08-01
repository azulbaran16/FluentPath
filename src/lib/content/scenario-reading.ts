// Reading passages written FOR one scenario, keyed `${worldSlug}/${scenarioSlug}` —
// the same keying scenario-lessons.ts, phrases.ts, scenario-vocabulary.ts,
// scenario-grammar.ts and scenario-writing.ts use.
//
// This is the reading quarter of D-01. A pair that appears below has ONE
// passage about its own situation, at its own CEFR level, with a glossary of
// the words that would genuinely block it and comprehension questions whose
// distractors are wrong for reasons a learner would fall for. A pair that does
// not appear is reported unwritten by the coverage registry rather than served
// the global reading room's eighteen texts with a scenario title on top.
//
// ─────────────────────────────────────────────────────────────────────────────
// THESE QUESTIONS ARE NOT SPACED-REPETITION ITEMS. Read this before assuming an
// id here is a schedule key, because everything else in this phase's id space
// is one.
//
// `PassageReader` scores a passage in place — it counts the correct answers,
// reveals the key and now shows the explanation — and it never calls
// `recordAttempt`. Nothing therefore writes `srs["…#reading#…"]`, so no reading
// id can ever come due. That is deliberate rather than missing: CONT-02's own
// wording is that PHRASES AND VOCABULARY feed the queue, and a comprehension
// question torn out of its passage cannot be answered on a review card at all —
// the passage IS the question. Listing these ids in `reviewableIds()` would put
// a permanent phantom in Dashboard's "Due today" count and hand ReviewHub's
// weak-spots drill an id that resolves to nothing, which is why the harness
// asserts the NEGATIVE (`scenario reading: an unscheduled kind, proved
// unscheduled`) instead of leaving the omission looking like a mistake.
//
// WHAT THE IDS ARE FOR, THEN. Two different things, at two levels:
//   · The PASSAGE id is the composed D-06 id, through `scenarioItemId`, the one
//     author of the format. A scenario passage and a global one share the
//     `Passage` shape and would otherwise share a namespace of bare slugs like
//     `"coffee"` and `"market"`; naming its own scenario makes a collision
//     impossible by construction rather than merely unlikely.
//   · A QUESTION id is an authored slug, unique WITHIN its passage and nothing
//     more. It is not composed and not global, because it is not a key to
//     anything — `PassageReader` still keys the learner's answers by array
//     position. It exists so a question can be referred to by something other
//     than where it happens to sit in a list.
//
// NO NEW ITEM TYPE. These are `Passage`es — the shape `PassageReader` already
// renders. The only component change this bank required is that the reader was
// exported, its back link made optional (a scenario has no list to go back to),
// and the explanation rendered under the key.
//
// THE EXPLANATION IS REQUIRED HERE. `ReadingQuestion.explain` is optional on the
// global shape for one reason only: so the eighteen existing passages keep
// compiling. `ScenarioReadingQuestion` below makes it required, and the harness
// asserts it non-empty after trimming. Phase 2.1's lesson is that an author
// forgets an optional field, and this is the field that turns "you were wrong"
// into teaching.
//
// WHY COMPOSITION IS LAZY. `scenario-grammar.ts` records the trap in full: this
// module imports `scenarioItemId` from `review-items.ts`, which is itself inside
// an ESM cycle with `scenario-grammar.ts`. Composing at module scope calls
// `scenarioItemId` while `review-items.ts`'s own `const SCENARIO_ITEM_SEPARATOR`
// may still be in its temporal dead zone, depending on nothing but which module
// the entry point reaches first — a ReferenceError that can appear in the bundle
// and not in the harness, or the other way round. Building on first ACCESS moves
// the call after every module body has run, in every order. The result is
// memoised, so the passage a component receives is referentially stable across
// renders.
//
// No React and no hooks: scripts/verify-scenario-content.mts loads this file
// under `node --experimental-strip-types`, where `@/` aliases do not resolve.
// Hence the explicit `.ts` extensions below.

import { scenarioItemId } from "../review-items.ts";
import type { Passage, ReadingLevel, ReadingQuestion } from "./reading.ts";

/**
 * A comprehension question as a SCENARIO passage must carry it: the global
 * shape with both of its optional fields made required.
 */
export interface ScenarioReadingQuestion extends ReadingQuestion {
  /** authored slug, unique within its passage; never an array position */
  id: string;
  /** why the correct option is correct — rendered under the key on check */
  explain: string;
}

/** A scenario passage: a `Passage` whose every question explains itself. */
export interface ScenarioPassage extends Passage {
  questions: ScenarioReadingQuestion[];
}

/**
 * A passage as AUTHORED. Identical to `ScenarioPassage` except that the id is
 * the local slug; `getScenarioReading` swaps it for the composed one.
 */
interface AuthoredPassage {
  /** authored slug, unique within its scenario, never derived from position */
  slug: string;
  title: string;
  /** the scenario's OWN CEFR level, not a level of the author's choosing */
  level: ReadingLevel;
  /** an honest estimate: the text, the glossary and the questions */
  minutes: number;
  /** two or more paragraphs */
  body: string[];
  glossary: { word: string; meaning: string }[];
  questions: ScenarioReadingQuestion[];
}

const BANK: Record<string, AuthoredPassage> = {
  /* ════════════════════════════ A2 ════════════════════════════ */

  /* ───────────────────── travel/restaurant · A2 ─────────────────────
   * Genuine A2 rather than a B1 text with easy words bolted on: present
   * simple throughout, concrete nouns, and sentences short enough to hold in
   * the head while the next one arrives. The scenario's phrases and deck are
   * about SPEAKING at the table (asking for a table, the bill, a
   * recommendation); the thing neither reaches is reading the notice on the
   * wall before you have said anything at all. So the questions turn on what
   * a diner actually needs to get right — which day, what is included, how to
   * pay, and when to mention an allergy — and two of them require putting two
   * sentences together rather than finding one. */
  "travel/restaurant": {
    slug: "the-blue-door-lunch-menu",
    title: "The Lunch Menu at the Blue Door",
    level: "A2",
    minutes: 3,
    body: [
      "The Blue Door is a small café near the station. It opens at twelve and closes at four. From Monday to Friday it has a set lunch. The set lunch is one soup, one main dish and a coffee. It costs nine pounds.",
      "The soup changes every day. On Monday it is tomato. On Wednesday it is carrot and ginger. The main dish is usually chicken or fish, and there is always one dish with no meat. Bread comes with the soup, and the bread is free.",
      "The café does not take cards for orders under five pounds, so bring some cash. If you have an allergy, tell the person at the counter before you order. The kitchen cooks every dish fresh, so lunch takes about fifteen minutes. On Saturday the café is open, but there is no set lunch — only sandwiches and cake.",
    ],
    glossary: [
      {
        word: "a set lunch",
        meaning: "two or three dishes together for one price",
      },
      { word: "the counter", meaning: "the long table where you order and pay" },
      { word: "cash", meaning: "notes and coins, not a card" },
      { word: "an allergy", meaning: "when a food makes you ill" },
    ],
    questions: [
      {
        id: "saturday-set-lunch",
        q: "You want the set lunch on Saturday. What does the text say?",
        options: [
          "The café is closed on Saturday",
          "There is no set lunch on Saturday",
          "The set lunch costs more on Saturday",
        ],
        answer: 1,
        explain:
          "The last sentence says the café is open on Saturday, but that day it serves only sandwiches and cake. It is open — it simply has no set lunch.",
      },
      {
        id: "whats-included",
        q: "What is always part of the set lunch?",
        options: ["A coffee", "A dessert", "A sandwich"],
        answer: 0,
        explain:
          "The set lunch is a soup, a main dish and a coffee. Cake and sandwiches are the Saturday menu, and the text never mentions a dessert.",
      },
      {
        id: "paying-four-pounds",
        q: "You order a coffee and a piece of cake for four pounds. How can you pay?",
        options: ["With a card", "With cash", "You cannot pay until five o'clock"],
        answer: 1,
        explain:
          "Four pounds is under five pounds, and the café takes no cards under five pounds. So you need notes or coins.",
      },
      {
        id: "when-to-say-allergy",
        q: "You cannot eat fish. When does the text say to tell the café?",
        options: [
          "Before you order",
          "When the food arrives",
          "When you pay at the end",
        ],
        answer: 0,
        explain:
          "The text says to tell the person at the counter before you order. The kitchen cooks every dish fresh after the order, so afterwards is too late.",
      },
    ],
  },

  /* ════════════════════════════ B2 ════════════════════════════ */

  /* ───────────────────── practical/housing · B2 ─────────────────────
   * The scenario's phrases and deck are the QUESTIONS a tenant asks out loud
   * at a viewing — damp, repairs, notice, the boiler. What nobody asks at a
   * viewing, because it has not happened yet, is what the fortnight after the
   * offer does to you. So this is the paperwork half: two deposits that get
   * confused for one, the referencing that is not under your control, and the
   * clause behind "bills included". Long enough at B2 to be worth reading, and
   * three of its four questions need the passage put together rather than
   * scanned. */
  "practical/housing": {
    slug: "between-the-viewing-and-the-keys",
    title: "What Happens Between the Viewing and the Keys",
    level: "B2",
    minutes: 4,
    body: [
      "Most people spend their energy on the viewing itself and then discover that the difficult part comes afterwards. Once your offer is accepted, the agent will usually ask for a holding deposit — commonly one week's rent — which takes the property off the market while your references are checked. It is not the same money as the security deposit, although the two are confused so often that agents have stopped being surprised by it. The holding deposit is normally credited against your first month's rent; the security deposit sits untouched in a government-approved scheme until the tenancy ends.",
      "Referencing is where a straightforward-looking application slows down. An agency will ask a current employer to confirm your salary, a previous landlord to confirm that you paid on time, and a credit agency to confirm that you exist in the way you say you do. Any of the three can take a fortnight if the person at the other end is on holiday, and none of them is under your control. What is under your control is having the documents ready before anybody asks for them: payslips, a passport, and the name and email address of somebody who will actually reply.",
      "The last surprise is what “bills included” means, because it rarely means all of them. Read the clause rather than the advert. In most flats it covers the water and the council tax and stops there; sometimes it covers electricity up to a monthly cap, above which the difference lands on you in a bill nobody warned you about. Ask whose name the energy account is in, too. If it stays with the landlord you cannot change supplier, and you will pay whatever tariff he happened to sign up for years ago.",
    ],
    glossary: [
      {
        word: "a holding deposit",
        meaning:
          "money that takes a property off the market while your application is checked",
      },
      {
        word: "referencing",
        meaning: "the checks an agency runs on your job, your rent history and your credit",
      },
      { word: "a cap", meaning: "an upper limit that cannot be passed" },
      {
        word: "a tariff",
        meaning: "the price plan an energy company charges you under",
      },
    ],
    questions: [
      {
        id: "holding-vs-security-deposit",
        q: "If your application succeeds, what normally happens to the holding deposit?",
        options: [
          "It is returned to you in full when you move out",
          "It is put towards your first month's rent",
          "It is held in a government-approved scheme until the tenancy ends",
          "The agent keeps it as a fee for the paperwork",
        ],
        answer: 1,
        explain:
          "The passage says the holding deposit is credited against the first month's rent. The government-approved scheme holds the other one, the security deposit — which is exactly the confusion that paragraph exists to undo.",
      },
      {
        id: "what-you-can-control",
        q: "Referencing can take a fortnight. What does the passage suggest you can actually do about that?",
        options: [
          "Chase the agency every day until the checks come back",
          "Offer a higher rent so that your application is dealt with first",
          "Have your documents and a referee who replies ready in advance",
          "Ask the agency to skip the employer check",
        ],
        answer: 2,
        explain:
          "The passage says none of the three checks is under your control, and then names what is: payslips, a passport and somebody who will actually reply, ready before anybody asks. Chasing, paying more and skipping a check are not in the passage at all.",
      },
      {
        id: "bills-included-clause",
        q: "A flat is advertised as “bills included”. What does the passage say you should expect?",
        options: [
          "Every utility covered, so no further bill can arrive",
          "Usually the water and the council tax, and possibly electricity up to a limit",
          "Only the council tax, in every case",
          "Nothing covered at all — the phrase is meaningless",
        ],
        answer: 1,
        explain:
          "“It rarely means all of them”: typically water and council tax, sometimes electricity up to a cap. That is narrower than every utility, and wider than only the council tax or nothing at all.",
      },
      {
        id: "whose-name-the-account-is-in",
        q: "Why does the passage tell you to ask whose name the energy account is in?",
        options: [
          "Because a landlord who holds the account tends to forget to pay it",
          "Because you cannot change supplier or tariff on an account that is not yours",
          "Because it decides whether the flat counts as furnished",
          "Because the meter cannot be read while the account is in another name",
        ],
        answer: 1,
        explain:
          "The final sentence gives that reason and only that reason: if the account stays with the landlord you cannot switch supplier, and you pay the tariff he signed years ago. The other three are claims the passage never makes.",
      },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * Lazy composition — see the header before making this eager.
 * ------------------------------------------------------------------ */

const COMPOSED = new Map<string, ScenarioPassage>();

function composed(key: string): ScenarioPassage | undefined {
  const cached = COMPOSED.get(key);
  if (cached) return cached;
  const authored = BANK[key];
  if (!authored) return undefined;
  const passage: ScenarioPassage = {
    id: scenarioItemId(key, "reading", authored.slug),
    title: authored.title,
    level: authored.level,
    minutes: authored.minutes,
    body: authored.body,
    glossary: authored.glossary,
    questions: authored.questions,
  };
  COMPOSED.set(key, passage);
  return passage;
}

/**
 * The scenario's own reading passage, or nothing.
 *
 * Strict, never a fallback: `undefined` is what an unwritten pair IS, and the
 * coverage registry reads exactly that to keep the page honest.
 */
export function getScenarioReading(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioPassage | undefined {
  return composed(`${worldSlug}/${scenarioSlug}`);
}

/** Every key this bank holds — the harness asserts each names a real pair that
 * actually declares reading. */
export function scenarioReadingKeys(): string[] {
  return Object.keys(BANK);
}
