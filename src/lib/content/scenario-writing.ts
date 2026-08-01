// Writing tasks written FOR one scenario, keyed `${worldSlug}/${scenarioSlug}` —
// the same keying scenario-lessons.ts, phrases.ts, scenario-vocabulary.ts and
// scenario-grammar.ts use.
//
// This is the writing quarter of D-01. A pair that appears below has ONE task
// about its own situation — a brief with a real reader, a word range at the
// scenario's own CEFR level, a checklist that names what the draft must contain,
// and an original model answer that would itself pass that checklist. A pair
// that does not appear is reported unwritten by the coverage registry rather
// than served the global writing room's material with a scenario title on top.
//
// ─────────────────────────────────────────────────────────────────────────────
// NO NEW ITEM TYPE. These are `WritingPrompt`s — the shape `WritingDesk` already
// renders. The only component change this bank required is that the desk hides
// its prompt picker when there is nothing to pick, because a scenario wants a
// task and a picker with one pill reads as a control that does nothing.
//
// ONE TASK PER PAIR, NOT A SET. Grammar's floor is five questions because a quiz
// scored out of one is not practice. A writing task is not scored at all: the
// learner drafts, self-checks against the list, and compares against the model.
// Nine scenarios × one task each is 9 briefs and 9 model answers — the density
// D-04 asks for in the shape this skill actually has.
//
// NOTHING HERE IS SCORED, AND NOTHING HERE IS SYNCED.
//   · No automated correction exists. The checklist and the model answer are the
//     whole feedback loop until the tutor lands in Phase 5. Saying otherwise
//     would be an overclaim, so no surface says otherwise.
//   · The desk saves drafts to raw `localStorage` under
//     `fluentpath:writing:${prompt.id}` — OUTSIDE the Phase 2 progress contract
//     (`progress-schema.ts`). A draft therefore does not follow the learner to
//     another device. That is unchanged pre-existing behaviour, recorded here so
//     no later reader assumes it syncs.
//
// THE ID IS THE COMPOSED SCENARIO ITEM ID, not a bare slug — even though nothing
// here enters the spaced-repetition queue. The reason is storage, not
// scheduling: `WritingDesk` derives its draft key from the prompt id, so two
// scenarios whose ids both name their own scenario CANNOT collide on one draft.
// The collision becomes impossible by construction rather than avoided by care
// (T-03-14). Composition goes through `scenarioItemId`, the one author of the
// D-06 format, so there is exactly one spelling of it in the codebase.
//
// WHY COMPOSITION IS LAZY. `scenario-grammar.ts` records the trap in full: this
// module imports `scenarioItemId` from `review-items.ts`, which is itself inside
// an ESM cycle with `scenario-grammar.ts`. Composing at module scope calls
// `scenarioItemId` while `review-items.ts`'s own `const SCENARIO_ITEM_SEPARATOR`
// may still be in its temporal dead zone, depending on nothing but which module
// the entry point reaches first — a ReferenceError that can appear in the bundle
// and not in the harness, or the other way round. Building on first ACCESS moves
// the call after every module body has run, in every order. The result is
// memoised, so the prompt a component receives is referentially stable across
// renders.
//
// No React and no hooks: scripts/verify-scenario-content.mts loads this file
// under `node --experimental-strip-types`, where `@/` aliases do not resolve.
// Hence the explicit `.ts` extensions below.

import { scenarioItemId } from "../review-items.ts";
import type { WritingLevel, WritingPrompt } from "./writing.ts";

/**
 * A task as AUTHORED. Identical to `WritingPrompt` except that the id is the
 * local slug; `getScenarioWriting` swaps it for the composed one.
 */
interface AuthoredWritingPrompt {
  /**
   * Authored slug, unique WITHIN its scenario, never derived from array
   * position — it becomes part of the key the learner's draft is stored under.
   */
  slug: string;
  title: string;
  /** the scenario's OWN CEFR level, not a level of the author's choosing */
  level: WritingLevel;
  /** the brief: what to write, to whom, and what it has to do */
  task: string;
  /** target length in words, counted the way WritingDesk counts it */
  minWords: number;
  maxWords: number;
  /**
   * REQUIRED, because an optional field is one an author forgets — Phase 2.1's
   * lesson, applied. Each line names something the draft must CONTAIN, so the
   * learner can tick it by looking, rather than praising the draft in the
   * abstract ("good structure") where nobody can tell.
   */
  checklist: string[];
  /**
   * An original model answer that passes its own checklist and sits inside its
   * own word range. A model that breaks its own brief teaches the wrong target,
   * so the harness asserts both.
   */
  model: string;
}

const BANK: Record<string, AuthoredWritingPrompt> = {
  /* ───────────────────── work/emails · B1 ─────────────────────
   * The scenario's phrases are about the MECHANICS of email (copying people
   * in, spam folders, reply-all) and its grammar set is about TONE. The task
   * is therefore the thing neither covers: an email that has to carry bad
   * news and still get a yes. */
  "work/emails": {
    slug: "move-a-deadline",
    title: "Ask for a deadline to move",
    level: "B1",
    task: "You owe your manager the Q3 sales report on Monday, but the figures you need from the finance team will not reach you until Wednesday. Write her an email asking to move the deadline. Explain why, offer what you can still send on Monday, and name the new date.",
    minWords: 70,
    maxWords: 120,
    checklist: [
      "A subject line naming the report and the word “deadline”",
      "The reason for the delay in one sentence, without blaming a colleague by name",
      "What you can send on Monday anyway",
      "The new date written out (“Thursday the 14th”), not “later in the week”",
      "A closing line that asks her to confirm",
    ],
    model:
      "Subject: Q3 sales report — request to move the deadline\n\nHi Marta,\n\nI'm writing about the Q3 sales report that is due on Monday. The final figures from finance will not reach me until Wednesday, so the full report cannot be ready in time.\n\nCould we move the deadline to Thursday the 14th? On Monday I can still send you the regional summary and the charts, which is the part the board asked for.\n\nCould you let me know by Friday whether Thursday works for you?\n\nThanks very much,\nAndrés",
  },

  /* ───────────────────── travel/hotel · B1 ─────────────────────
   * Every phrase in this scenario is SPOKEN at a desk. Writing to a hotel
   * before you arrive is the half the phrase set cannot reach: nobody can ask
   * a follow-up question, so the message has to be complete on the first
   * reading and polite enough to be worth answering. */
  "travel/hotel": {
    slug: "late-arrival-message",
    title: "Write to the hotel before you arrive",
    level: "B1",
    task: "Your flight lands at 1:30 a.m., long after the hotel's front desk closes for the night, and you are travelling with a colleague. Write a message to the hotel: give them your booking, tell them when you will arrive, ask how to get in at that hour, and make one more request you genuinely need.",
    minWords: 70,
    maxWords: 120,
    checklist: [
      "The name the room is booked under and the dates of the stay",
      "Your arrival time as a time (“about 2:30 a.m.”), not as “very late”",
      "A direct question about getting in after the desk has closed",
      "One further request, with the reason you need it",
      "A closing that asks them to reply before you travel",
    ],
    model:
      "Subject: Late arrival — booking for Andrés Zulbaran, 12–15 May\n\nDear Sir or Madam,\n\nI have a twin room booked with you from 12 to 15 May under the name Andrés Zulbaran.\n\nOur flight lands at 1:30 a.m. on the 12th, so we will reach the hotel at about 2:30 a.m. Could you tell me how to collect our keys once the front desk has closed?\n\nWe would also be grateful for a room away from the lift, as we both have meetings at nine the next morning.\n\nI would appreciate a reply before we fly on Saturday.\n\nKind regards,\nAndrés Zulbaran",
  },

  /* ───────────────────── practical/tech-support · B1 ─────────────────────
   * The scenario's phrases are what you say ON THE PHONE, where the other
   * person can ask you to repeat. A written ticket gets no second question:
   * the whole exercise is being reproducible by a stranger who cannot see the
   * screen. */
  "practical/tech-support": {
    slug: "reproducible-bug-report",
    title: "Report a problem support can reproduce",
    level: "B1",
    task: "Your company's expense app signs you out every time you attach a photo of a receipt. Write the support ticket. The person who reads it cannot see your screen, so give the steps in order, say what happens, say what you expected instead, and list what you have already tried.",
    minWords: 90,
    maxWords: 160,
    checklist: [
      "The steps you take, in order, so a stranger can repeat them",
      "What actually happens, including the exact words of any message on screen",
      "What you expected to happen instead",
      "At least two things you have already tried",
      "Your device and the app version, so support does not have to ask",
    ],
    model:
      "Subject: Expense app signs me out when I attach a receipt\n\nHello,\n\nSince Tuesday the expense app has signed me out whenever I attach a photo to a claim.\n\nThese are the steps: I open a new claim, type the amount, tap “Add receipt”, and choose a photo from my gallery. The screen goes white for a second and then the login page appears. A red banner reads “Session expired. Please sign in again.” When I sign back in, the claim is empty.\n\nI expected the photo to attach and the claim to save as a draft.\n\nI have already restarted the phone, reinstalled the app, and tried a much smaller photo. It happens every time.\n\nI am on an iPhone 13, iOS 18.2, expense app version 4.6.1.\n\nThank you,\nAndrés",
  },
};

/* ------------------------------------------------------------------ *
 * Lazy composition — see the header before making this eager.
 * ------------------------------------------------------------------ */

const COMPOSED = new Map<string, WritingPrompt>();

function composed(key: string): WritingPrompt | undefined {
  const cached = COMPOSED.get(key);
  if (cached) return cached;
  const authored = BANK[key];
  if (!authored) return undefined;
  const prompt: WritingPrompt = {
    id: scenarioItemId(key, "writing", authored.slug),
    title: authored.title,
    level: authored.level,
    task: authored.task,
    minWords: authored.minWords,
    maxWords: authored.maxWords,
    checklist: authored.checklist,
    model: authored.model,
  };
  COMPOSED.set(key, prompt);
  return prompt;
}

/**
 * The scenario's own writing task, or nothing.
 *
 * Strict, never a fallback: `undefined` is what an unwritten pair IS, and the
 * coverage registry reads exactly that to keep the page honest.
 */
export function getScenarioWriting(
  worldSlug: string,
  scenarioSlug: string,
): WritingPrompt | undefined {
  return composed(`${worldSlug}/${scenarioSlug}`);
}

/** Every key this bank holds — the harness asserts each names a real pair that
 * actually declares writing. */
export function scenarioWritingKeys(): string[] {
  return Object.keys(BANK);
}
