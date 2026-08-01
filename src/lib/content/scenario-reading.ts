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

  /* ───────────────────── academic/news · B2 ─────────────────────
   * Written the way news is actually written — inverted pyramid, an
   * attributed quotation, a spokesperson who declines, and a figure the
   * authority has not published — so that the questions can turn on the three
   * things this scenario is about: the gist, what the piece does NOT claim,
   * and the difference between a fact stated in the reporter's own voice and
   * an opinion handed to somebody else. The scenario's briefing already
   * teaches spotting a loaded verb; this asks the harder question, which is
   * what a careful piece is deliberately not saying. */
  "academic/news": {
    slug: "night-buses-riverside-route",
    title: "Night Buses Return to the Riverside Route",
    level: "B2",
    minutes: 4,
    body: [
      "Night buses will run again along the riverside route from 1 September, three years after the service was withdrawn. The transport authority said on Tuesday that the N12 would operate hourly between midnight and five, seven nights a week, funded by a two-year grant from the regional government.",
      "The route was cut in 2023 after passenger numbers fell to an average of eleven people a night. Officials said at the time that the money was better spent on daytime frequency. A petition to restore the service gathered 4,200 signatures last winter, most of them, according to its organisers, from hospital and hotel staff finishing shifts after the last train.",
      "“This is a service the city should never have lost,” said Councillor Devi Raman, who chairs the transport committee. A spokesperson for the authority declined to say whether the route would continue once the grant expires, adding only that usage would be reviewed in the second year.",
      "The authority has not published the figures behind its projection that the N12 will carry 300 passengers a night. Two other night routes withdrawn in 2023, the N4 and the N7, are unaffected by Tuesday's announcement.",
    ],
    glossary: [
      {
        word: "a grant",
        meaning: "money given for a stated purpose, usually by a government",
      },
      {
        word: "a petition",
        meaning: "a signed request asking an authority to do something",
      },
      {
        word: "a projection",
        meaning: "an estimate of what will happen, worked out from figures",
      },
      {
        word: "declined to say",
        meaning: "refused to answer, politely and on the record",
      },
    ],
    questions: [
      {
        id: "gist-of-the-report",
        q: "Which sentence best gives the gist of the report?",
        options: [
          "One night bus route returns for two years, paid for by a grant.",
          "A petition of 4,200 signatures has forced the authority to change its mind.",
          "The city's night bus network is being rebuilt after the 2023 cuts.",
          "Councillor Devi Raman has won an argument with the transport authority.",
        ],
        answer: 0,
        explain:
          "The whole of the first paragraph is one route, hourly, funded by a two-year grant. The petition is background the report never links to the decision, only one of the three withdrawn routes is affected rather than the network, and nobody in the piece is described as winning anything.",
      },
      {
        id: "what-the-report-does-not-say",
        q: "Which of these does the report NOT say?",
        options: [
          "The N12 will run seven nights a week.",
          "The petition caused the decision.",
          "The N4 and the N7 remain withdrawn.",
          "The authority would not commit to the route beyond the grant.",
        ],
        answer: 1,
        explain:
          "The petition and the decision both appear, in that order, and the report never joins them. Reading a cause into two facts placed next to each other is the commonest way a careful piece ends up being misquoted.",
      },
      {
        id: "fact-versus-attributed-opinion",
        q: "Which statement is presented as somebody's opinion rather than as a fact?",
        options: [
          "Passenger numbers fell to an average of eleven a night.",
          "The N12 will run between midnight and five.",
          "The city should never have lost the service.",
          "The grant runs for two years.",
        ],
        answer: 2,
        explain:
          "It is inside quotation marks and attributed to a named councillor, so the report is telling you that she said it, not that it is true. The other three are stated by the reporter in the reporter's own voice.",
      },
      {
        id: "how-reliable-is-the-signature-claim",
        q: "The report says most signatures came from hospital and hotel staff. How does it present that?",
        options: [
          "As a fact the transport authority confirmed",
          "As a claim made by the people who ran the petition",
          "As the reporter's own estimate",
          "As a figure taken from the authority's published data",
        ],
        answer: 1,
        explain:
          "The words “according to its organisers” hand the claim back to the campaigners. The reporter passes it on without standing behind it, which is a different thing from having checked it.",
      },
    ],
  },

  /* ───────────────────── academic/stories · B2 ─────────────────────
   * Fiction with a narrator who withholds, because that is the half of
   * reading a news item cannot teach and this scenario names: what a
   * character feels sits between the lines. One question is therefore about
   * HOW something is said rather than what is said, and a second is about the
   * voice itself. The scenario's own phrases already cover talking about a
   * story afterwards ("the narrator isn't telling us everything"); this asks
   * her to do the noticing rather than to describe having done it. */
  "academic/stories": {
    slug: "the-spare-key",
    title: "The Spare Key",
    level: "B2",
    minutes: 4,
    body: [
      "My mother kept the spare key under the third flowerpot for forty years, and for forty years she told visitors it was under the second. I never asked why. In our house you did not ask why; you noticed, and you put it away somewhere, and years later you understood it in a supermarket queue for no reason at all.",
      "When I came back that August she had moved it to the fourth pot, and she told me so twice in the first hour, once at the door and once over tea, as though the information might not have stuck. The garden had gone to seed. There were three unopened letters from the surgery on the hall table, propped against the fruit bowl where I could not fail to see them, and she talked about the neighbours' extension for twenty-five minutes.",
      "“You've had a haircut,” she said at last. I had not. I said it suited me, and she laughed, and we sat in the good chairs in the front room that nobody ever sat in, and neither of us mentioned the letters again all week.",
    ],
    glossary: [
      {
        word: "gone to seed",
        meaning: "become overgrown and neglected",
      },
      {
        word: "the surgery",
        meaning: "in British English, a doctor's practice",
      },
      {
        word: "propped against",
        meaning: "leaning on something so that it stays upright and visible",
      },
      {
        word: "it might not have stuck",
        meaning: "the other person might not have remembered it",
      },
    ],
    questions: [
      {
        id: "what-the-letters-mean",
        q: "What does the narrator's account most strongly suggest about the letters from the surgery?",
        options: [
          "His mother has not noticed that they arrived",
          "His mother wants them seen but not discussed",
          "The narrator sent them to her himself",
          "They are advertisements she means to throw away",
        ],
        answer: 1,
        explain:
          "They are unopened, and yet they are propped where he “could not fail to see them”. Putting something in somebody's line of sight and then talking for twenty-five minutes about an extension is a person choosing both halves at once.",
      },
      {
        id: "how-the-repetition-is-told",
        q: "The narrator says she told him about the key “twice in the first hour, once at the door and once over tea”. What does writing it this way achieve?",
        options: [
          "It shows that the narrator remembers detail poorly",
          "It reports the repetition and leaves the reader to draw the conclusion",
          "It tells the reader plainly that his mother is unwell",
          "It builds suspense about where the key is now kept",
        ],
        answer: 1,
        explain:
          "The sentence gives the count and the two occasions and then stops. Nothing is named and nothing is diagnosed, which is why the detail lands harder than a statement would — the reader arrives at it herself.",
      },
      {
        id: "the-narrators-voice",
        q: "Which best describes the narrator's voice?",
        options: [
          "Sentimental, and open about what he feels",
          "Dry and withholding, noticing far more than it says",
          "Angry, and looking for somebody to blame",
          "Detached to the point of not caring",
        ],
        answer: 1,
        explain:
          "“You did not ask why; you noticed, and you put it away somewhere” is the voice describing its own rule. It is not indifferent — the letters, the seeding garden and the unused chairs are all recorded exactly — but it refuses to say out loud what it feels about any of them.",
      },
      {
        id: "the-haircut-he-never-had",
        q: "Why does the narrator agree that a haircut he never had suits him?",
        options: [
          "He cannot remember whether he had one",
          "He is quietly mocking his mother",
          "He takes the easier reply, because in this family things are left unsaid",
          "He wants to steer the conversation towards the letters",
        ],
        answer: 2,
        explain:
          "The first paragraph sets the rule of the house: you do not ask, and you do not correct. Agreeing costs him nothing and keeps the afternoon intact, which is the same reason neither of them goes back to the letters all week.",
      },
    ],
  },

  /* ───────────────────── academic/summaries · B2 ─────────────────────
   * DELIBERATELY A DIFFERENT TEXT from the one this scenario's WRITING prompt
   * supplies (scenario-writing.ts, "summarise-induced-demand", on road
   * widening). A learner who met the same passage in both exercises would be
   * doing one exercise twice, and the two would collapse into each other.
   *
   * Built to be summarisable, which is a property and not a hope: one claim,
   * one method, one number, one explanation — so a question can ask which of
   * those four a two-sentence summary could drop. That is the scenario's own
   * skill (main idea versus supporting detail) asked in the direction reading
   * can ask it and writing cannot. */
  "academic/summaries": {
    slug: "the-open-plan-paradox",
    title: "The Open Plan Paradox",
    level: "B2",
    minutes: 4,
    body: [
      "When a company takes down its internal walls, it is usually buying one thing: conversation. The argument has been made so often that it is no longer defended — remove the partitions, the reasoning goes, and colleagues who once had to knock will simply turn round and talk to each other.",
      "In 2018 two researchers at Harvard Business School measured what actually happened. They fitted employees at two large firms with badges that recorded who spoke to whom and for how long, first in a conventional office with walls and then, after those walls came down, in an open one. Face-to-face conversation fell by roughly seventy per cent. Email and instant messaging rose to fill the space it left, and the effect appeared at both firms.",
      "The explanation the authors offer is not that people like each other less in the open. It is that being visible costs something. In a room where anyone may be listening and anyone may be watched, a four-minute conversation about a delayed delivery is performed rather than simply had, and the cheaper option — a message nobody else can see — wins. The walls were never obstacles to conversation. They were the privacy that made conversation cheap.",
    ],
    glossary: [
      {
        word: "a partition",
        meaning: "a thin wall that divides one room into two",
      },
      {
        word: "a paradox",
        meaning: "an outcome that contradicts what everybody expected",
      },
      {
        word: "performed",
        meaning: "done with an audience in mind rather than done naturally",
      },
    ],
    questions: [
      {
        id: "the-main-idea",
        q: "Which sentence best states the passage's main idea?",
        options: [
          "Open-plan offices reduce face-to-face conversation, because privacy was what made conversation cheap.",
          "Employees in open-plan offices send more email than employees in offices with walls.",
          "Two Harvard researchers used badges to measure who spoke to whom at two large firms.",
          "Companies take down internal walls in order to get colleagues talking.",
        ],
        answer: 0,
        explain:
          "All four are drawn from the passage, and three of them are supporting material: the email figure is one finding, the badges are the method, and the reason companies remove walls is the belief the passage sets out to test. Only the first says what the passage concludes.",
      },
      {
        id: "the-supporting-figure",
        q: "By roughly how much did face-to-face conversation fall?",
        options: [
          "Seventeen per cent",
          "Fifty per cent",
          "Seventy per cent",
          "The passage gives no figure",
        ],
        answer: 2,
        explain:
          "Roughly seventy per cent, in the second paragraph. The wrong answer to be tempted by is seventeen: -teen and -ty differ by one syllable, and a fast reader takes the ending for granted rather than looking at it.",
      },
      {
        id: "what-a-summary-could-drop",
        q: "If you had to cut this passage to two sentences, which detail could go without changing what it says?",
        options: [
          "That conversation fell while written messaging rose",
          "That the badges recorded who spoke to whom and for how long",
          "That the authors explain the fall by the cost of being visible",
          "That taking down walls is normally meant to increase conversation",
        ],
        answer: 1,
        explain:
          "The badges are how the finding was obtained, not part of the finding. The other three carry the argument between them — the expectation, the result and the explanation — and removing any one of them leaves the passage saying nothing in particular.",
      },
      {
        id: "the-closing-claim",
        q: "What does the writer mean by “the walls were never obstacles to conversation. They were the privacy that made conversation cheap”?",
        options: [
          "Offices should never remove their internal walls",
          "Conversation is easier when fewer people can observe it",
          "People prefer writing to speaking in every setting",
          "The two firms in the study happened to have unusually thin walls",
        ],
        answer: 1,
        explain:
          "The sentence turns the usual assumption round: the wall was not standing in the way of the conversation, it was the condition that let the conversation happen unobserved. That is a claim about being watched, not a rule about architecture or a general preference for writing.",
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
