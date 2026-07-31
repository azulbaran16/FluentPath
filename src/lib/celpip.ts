// ───────────────────────────────────────────────────────────
// CELPIP Writing — task bank, rubric, and shared types.
// Each task is one seeded, original CELPIP-format writing prompt
// (Task 1: formal email, Task 2: survey/opinion response).
// This is the single source of truth for CELPIP writing content.
// ───────────────────────────────────────────────────────────

import { EMAIL_TASKS } from "./celpip/tasks-email.ts";
import { SURVEY_TASKS } from "./celpip/tasks-survey.ts";
import { SPEAKING_TASK_PROMPTS } from "./celpip/speaking-prompts.ts";
import { LISTENING_SET_BANK } from "./celpip/listening-set-1.ts";
import { READING_SET_BANK } from "./celpip/reading-set-1.ts";

export type CelpipTaskType = "email" | "survey";

/**
 * The four CELPIP skills the landing offers.
 *
 * Deliberately a SEPARATE union from `CelpipTaskType`, which is the WRITING
 * task union: that one types the stored writing attempt's `taskType`, whose
 * literal pair is mirrored in `progress-schema.ts` and — independently — in
 * `progress-merge.ts`, so widening it would put a live attempt one missed edit
 * away from being silently deleted by the merge. `CelpipSkill` sits above
 * `CelpipTaskType` and never reaches a stored shape.
 */
export type CelpipSkill = "writing" | "reading" | "listening" | "speaking";

export interface CelpipWordRange {
  min: number;
  max: number;
}

export interface CelpipRubricItem {
  id: string;
  text: string;
  explanation: string;
}

export interface CelpipRubricDimension {
  key: string;
  label: string;
  items: CelpipRubricItem[];
}

export interface CelpipRubric {
  email: CelpipRubricDimension[];
  survey: CelpipRubricDimension[];
  /** The Speaking self-evaluation (D-02: the learner scores herself, no AI and
   * no automated scoring anywhere). Authored in its own bank file so each
   * file's originality claim covers only the text it actually contains. */
  speaking: CelpipRubricDimension[];
}

/**
 * The eight real CELPIP Speaking task shapes, in exam order.
 *
 * Deliberately a SEPARATE union from `CelpipTaskType`. That one discriminates
 * `CelpipWritingTask` AND types the stored writing attempt's `taskType`, whose
 * literal pair is mirrored in both `progress-schema.ts` and — independently —
 * `progress-merge.ts`. Widening it would let a writing task declare itself a
 * speaking one and would put a live attempt one missed edit away from being
 * silently deleted by the merge. This union never reaches the stored shape:
 * `CelpipSpeakingAttempt.shape` is a bounded string, so a ninth shape added
 * here can add a prompt but can never lose a learner's history.
 */
export type CelpipSpeakingShape =
  | "advice"
  | "personal-experience"
  | "describe-scene"
  | "predictions"
  | "compare-persuade"
  | "difficult-situation"
  | "opinion"
  | "unusual-situation";

/**
 * The same eight shapes as data, so the landing can report coverage as
 * "n of 8" without anybody typing 8 — and so adding a ninth shape moves the
 * denominator on its own.
 *
 * Presentation only. This list is NOT mirrored anywhere in the persistence
 * layer: `CelpipSpeakingAttempt.shape` is a bounded string precisely so that a
 * shape added here can add a prompt but can never lose a learner's history.
 */
export const CELPIP_SPEAKING_SHAPES: CelpipSpeakingShape[] = [
  "advice",
  "personal-experience",
  "describe-scene",
  "predictions",
  "compare-persuade",
  "difficult-situation",
  "opinion",
  "unusual-situation",
];

export interface CelpipSpeakingPrompt {
  id: string;
  shape: CelpipSpeakingShape;
  /** 1-8, the exam's own task numbering. */
  taskNumber: number;
  title: string;
  /** Situation the learner speaks about. */
  scenario: string;
  /** Silent preparation window, before recording starts on its own. */
  prepSeconds: number;
  /** Recording window, which the exam does not let you extend. */
  responseSeconds: number;
  /** Task 3 only: the scene to describe, given in words rather than as an
   * image. Absent on every other shape. */
  sceneDescription?: string;
  strategyTips: string[];
}

export interface CelpipWritingTask {
  id: string;
  taskType: CelpipTaskType;
  title: string;
  /** Situation the learner responds to. */
  scenario: string;
  /** Task 1 (email): the points the response must address. */
  bullets?: string[];
  /** Task 2 (survey): the two-option choice the response argues for. */
  options?: [string, string];
  timeLimitMinutes: number;
  wordRange: CelpipWordRange;
  /** Original model answer — never copied from third-party material. */
  modelAnswer: string;
  strategyTips: string[];
}

export const CELPIP_TASK_META: Record<
  CelpipTaskType,
  { label: string; blurb: string; color: string }
> = {
  email: {
    label: "Task 1: Email",
    blurb: "Respond to a real-life situation with a formal email covering three points.",
    color: "--sky",
  },
  survey: {
    label: "Task 2: Survey",
    blurb: "Take a position between two options and support it in a short opinion response.",
    color: "--sky",
  },
};

export const CELPIP_TASKS: CelpipWritingTask[] = [...EMAIL_TASKS, ...SURVEY_TASKS];

export function getTask(taskId: string): CelpipWritingTask | undefined {
  return CELPIP_TASKS.find((t) => t.id === taskId);
}

export function getTasksByType(taskType: CelpipTaskType): CelpipWritingTask[] {
  return CELPIP_TASKS.filter((t) => t.taskType === taskType);
}

/* ------------------------------------------------------------------ *
 * Speaking — siblings of CELPIP_TASKS / getTask, never an overload of
 * them. The two banks share no shape and no id space.
 * ------------------------------------------------------------------ */

export const SPEAKING_PROMPTS: CelpipSpeakingPrompt[] = [...SPEAKING_TASK_PROMPTS];

export function getSpeakingPrompt(promptId: string): CelpipSpeakingPrompt | undefined {
  return SPEAKING_PROMPTS.find((p) => p.id === promptId);
}

/* ------------------------------------------------------------------ *
 * Listening — the content types (D-03, D-04, D-05).
 *
 * A script is an ordered array of SPEAKER TURNS, never one string, and
 * that is the load-bearing shape decision of this section rather than a
 * style preference. It solves four problems with one choice:
 *
 *   1. Chrome truncates a single long utterance at roughly fifteen
 *      seconds with no error and sometimes no `onend`. One utterance per
 *      turn keeps every one of them far under that ceiling without a
 *      `resume()` timer fighting the engine.
 *   2. The multi-speaker parts (problem solving has two voices, the
 *      discussion has three) are testing whether the learner can track
 *      who said what. Turns are what let each speaker get their own
 *      voice.
 *   3. The post-answer transcript — the ONLY place the script text may
 *      ever be shown (D-04) — renders with speaker labels for free.
 *   4. `audioUrl` has an obvious per-segment home, which is exactly the
 *      reversibility D-03 asks for: swapping the Web Speech API for
 *      recorded audio later is a file per script, not a data migration.
 * ------------------------------------------------------------------ */

/** The six scored CELPIP Listening part shapes, in exam order. */
export type CelpipListeningPartKind =
  | "problem-solving"
  | "daily-conversation"
  | "information"
  | "news-item"
  | "discussion"
  | "viewpoints";

/**
 * The exam's own name for each part shape.
 *
 * Declared as a total `Record` over the union rather than as a lookup with a
 * fallback, so adding a seventh kind fails `npx tsc --noEmit` here instead of
 * rendering a blank heading to a learner.
 */
const LISTENING_PART_KIND_LABEL: Record<CelpipListeningPartKind, string> = {
  "problem-solving": "Listening to Problem Solving",
  "daily-conversation": "Listening to a Daily Life Conversation",
  information: "Listening for Information",
  "news-item": "Listening to a News Item",
  discussion: "Listening to a Discussion",
  viewpoints: "Listening to Viewpoints",
};

/**
 * The same six kinds as data, DERIVED from the label table above rather than
 * written out a second time — the landing reports coverage as "n of 6" and a
 * mirrored list is the thing that goes stale. Object key order is insertion
 * order for string keys, so this stays in exam order.
 */
export const CELPIP_LISTENING_PART_KINDS = Object.keys(
  LISTENING_PART_KIND_LABEL,
) as CelpipListeningPartKind[];

export function listeningPartKindLabel(kind: CelpipListeningPartKind): string {
  return LISTENING_PART_KIND_LABEL[kind];
}

/** One line of a script. `speaker` is BOTH the transcript label and the voice
 * key, so a script cannot label a speaker one way and voice them another. */
export interface CelpipListeningTurn {
  speaker: string;
  text: string;
}

export interface CelpipListeningSegment {
  id: string;
  turns: CelpipListeningTurn[];
  /**
   * RESERVED FOR VOICE-01, and deliberately absent from every segment today.
   *
   * This is the whole of D-03's reversibility promise in one optional field:
   * when recorded or premium-TTS audio lands, a segment gains a file path and
   * the player prefers it over `speechSynthesis`. No stored attempt changes
   * shape, no set is re-authored, and nothing migrates. A same-origin file also
   * needs no CSP change — `default-src 'self'` already covers it.
   */
  audioUrl?: string;
}

/**
 * One objective question with a single correct option.
 *
 * `explanation` is REQUIRED at the type level, not optional: CELPIP-06 and
 * CELPIP-07 both ask for per-question explanations, and an optional field is
 * one an author forgets under deadline. The compiler is a cheaper reviewer.
 *
 * SHARED WITH READING, not copied for it — the two skills differ in what the
 * learner consumes before the question, not in the question itself, so both
 * grade through one comparison against one answers map. A drop-down blank is
 * the same act again with the surrounding sentence as its stem; see
 * `CelpipReadingBlank`.
 */
export interface CelpipObjectiveQuestion {
  id: string;
  /** The question itself. */
  stem: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Why that option is the answer — shown after submission, never before. */
  explanation: string;
  /** Which segment this question follows. Problem solving asks after each
   * segment; every other part has one segment and may leave this absent. */
  segmentId?: string;
}

/**
 * One part of a set.
 *
 * EVERY part carries an ARRAY of segments even though only problem solving has
 * more than one. A part that modelled its single segment as a bare field would
 * make the player carry a special case forever, for one part, in the one
 * component where a mistake means the learner hears nothing and — under D-05 —
 * never sees a question either.
 */
export interface CelpipListeningPart {
  id: string;
  kind: CelpipListeningPartKind;
  title: string;
  segments: CelpipListeningSegment[];
  questions: CelpipObjectiveQuestion[];
}

export interface CelpipListeningSet {
  id: string;
  title: string;
  timeLimitMinutes: number;
  parts: CelpipListeningPart[];
}

/**
 * The Listening bank, one file per set.
 *
 * Availability follows this array's CONTENTS, not its existence: a set dropped
 * for the calendar flips the landing back to "not yet available" on its own,
 * and a set whose parts are all removed does the same. Nothing about what ships
 * is written down anywhere for a later edit to forget.
 */
export const LISTENING_SETS: CelpipListeningSet[] = [...LISTENING_SET_BANK];

export function getListeningSet(setId: string): CelpipListeningSet | undefined {
  return LISTENING_SETS.find((s) => s.id === setId);
}

/* ------------------------------------------------------------------ *
 * Reading — the content types (D-06, D-07).
 *
 * THE LOAD-BEARING SHAPE DECISION HERE IS THE DROP-DOWN BLANK, and it is
 * why this file gains a whole sub-model rather than a second list of
 * multiple-choice questions.
 *
 * The blank appears in THREE of the exam's four reading parts — inside
 * the reply in Correspondence, inside the short message in Diagram, and
 * inside the reader comment in Viewpoints. A Reading section built only
 * from four-option multiple choice would look nothing like the real
 * exam, and this is the type learners most often meet cold on the day.
 * Its difficulty is specific and cannot be faked: the wrong options are
 * grammatically fine and only CONTEXTUALLY wrong, so the blank has to be
 * read against the text around it rather than parsed as grammar.
 *
 * Two consequences run through everything below:
 *
 *   1. A blank belongs INSIDE its text, not beside it. `blankText` is an
 *      ordered array of segments — prose runs and blank references — so
 *      the reply renders as one continuous piece of writing with the
 *      selects sitting in it. A list of questions detached from the
 *      passage would remove the very context the type tests.
 *   2. A blank and a question grade through ONE answers map, because
 *      they are the same act: choose an option index, compare it to a
 *      key. See the id-uniqueness note on `CelpipReadingPart`.
 *
 * The names `passage`, `diagram`, `blankText`, `minutes`, `kind` and
 * `questions` are PINNED: plans 09 and 10 hard-code them in their verify
 * commands, so renaming one silently disarms a downstream gate rather
 * than failing it.
 * ------------------------------------------------------------------ */

/** The four scored CELPIP Reading part shapes, in exam order (D-07). */
export type CelpipReadingPartKind =
  | "correspondence"
  | "diagram"
  | "information"
  | "viewpoints";

/**
 * The exam's own name for each part shape. A total `Record` over the union for
 * the same reason the listening one is: a fifth kind fails `npx tsc --noEmit`
 * here rather than rendering a blank heading to a learner.
 */
const READING_PART_KIND_LABEL: Record<CelpipReadingPartKind, string> = {
  correspondence: "Reading Correspondence",
  diagram: "Reading to Apply a Diagram",
  information: "Reading for Information",
  viewpoints: "Reading for Viewpoints",
};

/** The same four kinds as data, DERIVED from the label table rather than
 * written out twice — the landing reports coverage as "n of 4". */
export const CELPIP_READING_PART_KINDS = Object.keys(
  READING_PART_KIND_LABEL,
) as CelpipReadingPartKind[];

export function readingPartKindLabel(kind: CelpipReadingPartKind): string {
  return READING_PART_KIND_LABEL[kind];
}

/**
 * One drop-down blank: a gap in a piece of prose that the learner fills from a
 * short list of options.
 *
 * Same three fields an objective question carries, and deliberately so — the
 * runner grades both through one comparison against one answers map. What it
 * does NOT carry is a `stem`: the sentence around the blank IS the stem, which
 * is exactly what makes the type hard and is why the segments below exist.
 *
 * `explanation` is REQUIRED, not optional, for the same reason
 * `CelpipObjectiveQuestion.explanation` is: CELPIP-06 asks for per-question
 * explanations, an optional field is one an author forgets under deadline, and
 * on this type the explanation is doing more work than anywhere else — it is
 * the only place the learner is told why an option that read perfectly well was
 * still wrong.
 */
export interface CelpipReadingBlank {
  id: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
}

/**
 * One run of a blank-bearing text: either literal prose or a reference to a
 * blank declared alongside it.
 *
 * A discriminated union rather than an optional-field object, so a segment
 * cannot be half of each and the renderer needs no fallback branch. There is
 * deliberately no third member for raw markup: formatting is expressed as
 * structure (paragraph arrays, table rows), never as an HTML string, which is
 * what keeps `dangerouslySetInnerHTML` out of this section entirely (T-02.1-36).
 */
export type CelpipReadingTextSegment =
  | { kind: "text"; text: string }
  | { kind: "blank"; blankId: string }
  /** A paragraph boundary inside one continuous text. Carried as a segment
   * rather than by nesting paragraphs, so a blank can never straddle one. */
  | { kind: "break" };

/**
 * A piece of prose with drop-down blanks in it — the reply in Correspondence,
 * the short message in Diagram, the reader comment in Viewpoints.
 *
 * `blanks` is a flat array and `segments` references it by id rather than
 * inlining the blank, so the answer key reads as a list and the prose reads as
 * prose. A `blankId` that resolves to nothing renders as a visible gap marker
 * rather than silently vanishing; plan 09's harness rejects one at build time.
 */
export interface CelpipReadingBlankText {
  /** Heading above the text — a subject line, "Reader comment", and so on. */
  title?: string;
  /** Sender/date/greeting-style lines shown above the body, unblanked. */
  intro?: string[];
  segments: CelpipReadingTextSegment[];
  blanks: CelpipReadingBlank[];
}

/** A labelled block inside an information passage. Part 3's text is usually
 * presented as lettered sections, and the questions ask which one says what. */
export interface CelpipReadingPassageSection {
  label: string;
  paragraphs: string[];
}

/**
 * A plain reading text. Paragraphs are an ARRAY OF STRINGS, never one string
 * with newlines and never markup: the renderer maps them to `<p>` elements
 * through React text nodes, so authored prose can never become markup.
 */
export interface CelpipReadingPassage {
  title?: string;
  /** Lead paragraphs, before any labelled section. Often the whole text. */
  paragraphs: string[];
  /** Labelled blocks, for the information part. */
  sections?: CelpipReadingPassageSection[];
}

/** What kind of thing the diagram is. Presentation only — it decides the
 * heading treatment, never whether the data is renderable. */
export type CelpipReadingDiagramKind = "schedule" | "fee-table" | "rules-list";

/** One row: its row header plus its cells. A rules list carries one cell per
 * row and no `headers`, which renders as a definition list rather than a table. */
export interface CelpipReadingDiagramRow {
  label: string;
  cells: string[];
}

/**
 * The Diagram part's stimulus, as STRUCTURED DATA rather than an image.
 *
 * Four reasons, and the last one decided it: structured data is authorable
 * inside the content module beside everything else; it is greppable for the
 * D-06 originality check, which an image is not; it reaches a screen reader as
 * a real table instead of as alt text somebody has to remember to write; and it
 * costs no asset pipeline — which is a cost this phase cannot absorb three
 * weeks out from the exam.
 */
export interface CelpipReadingDiagram {
  kind: CelpipReadingDiagramKind;
  caption: string;
  /** Column headers when the diagram is tabular. Absent on a rules list. */
  headers?: string[];
  rows: CelpipReadingDiagramRow[];
  /** Point-form notes printed under the table, as the exam's brochures carry. */
  notes?: string[];
}

/**
 * One part of a reading set.
 *
 * `minutes` IS PER PART, NOT PER SET, and that is a training decision rather
 * than a modelling one. The real exam paces Reading part by part — 11 minutes
 * for correspondence, 8 for the diagram, 9 for information, 11 for viewpoints.
 * A single 39-minute block would let a learner overspend on part 1 and then run
 * out on part 4, which is precisely the failure the per-part allowance exists
 * to train against.
 *
 * ALL THREE STIMULUS FIELDS ARE OPTIONAL AND A PART MAY CARRY MORE THAN ONE.
 * Correspondence is an email (`passage`) plus a reply with blanks
 * (`blankText`); Diagram is a table (`diagram`) plus a message with blanks;
 * Information is a passage alone; Viewpoints is an article plus a commented
 * reply. The runner renders whichever are present, in this order.
 *
 * ID UNIQUENESS IS A REAL CONSTRAINT, NOT A CONVENTION. Blank ids and question
 * ids share ONE answers map on the attempt, so a blank id colliding with a
 * question id inside the same set silently overwrites one of the two answers
 * and mis-scores the sheet. Ids must be unique across every question and every
 * blank in a set; plan 09's content harness gates it (T-02.1-39).
 */
export interface CelpipReadingPart {
  id: string;
  kind: CelpipReadingPartKind;
  title: string;
  /** This part's own allowance. The set's total is derived from these. */
  minutes: number;
  /** Instruction line shown above the stimulus, as the exam prints one. */
  instructions?: string;
  passage?: CelpipReadingPassage;
  diagram?: CelpipReadingDiagram;
  blankText?: CelpipReadingBlankText;
  /** The plain comprehension items. Shares its answers map with the blanks. */
  questions: CelpipObjectiveQuestion[];
}

/**
 * A reading set: the exam's four parts in order.
 *
 * NOTE WHAT IS NOT HERE: a `timeLimitMinutes` field. The total is DERIVED by
 * `readingSetMinutes` from the parts' own allowances, so it cannot be typed
 * twice and cannot drift from the parts it is supposed to describe — which it
 * would, the first time a part's allowance is corrected and the header is not.
 */
export interface CelpipReadingSet {
  id: string;
  title: string;
  parts: CelpipReadingPart[];
}

/** The set's total allowance, summed from its parts. 39 minutes for a complete
 * four-part set. */
export function readingSetMinutes(set: CelpipReadingSet): number {
  return set.parts.reduce((total, part) => total + part.minutes, 0);
}

/** Every gradable item in a part, blanks included — the denominator the runner
 * scores against and the count the landing reports. 38 for a complete set. */
export function readingPartItemCount(part: CelpipReadingPart): number {
  return part.questions.length + (part.blankText?.blanks.length ?? 0);
}

export function readingSetItemCount(set: CelpipReadingSet): number {
  return set.parts.reduce((total, part) => total + readingPartItemCount(part), 0);
}

/**
 * The Reading bank, one file per set.
 *
 * Availability follows this array's CONTENTS, exactly as the listening one
 * does: a set dropped for the calendar, or a set whose parts are all removed,
 * flips the landing back to "not yet available" on its own and needs no second
 * edit to say so. Nothing about what ships is written down anywhere for a later
 * edit to forget.
 */
export const READING_SETS: CelpipReadingSet[] = [...READING_SET_BANK];

export function getReadingSet(setId: string): CelpipReadingSet | undefined {
  return READING_SETS.find((s) => s.id === setId);
}

export { CELPIP_RUBRIC } from "./celpip/rubric.ts";
export { CELPIP_SPEAKING_RUBRIC } from "./celpip/rubric-speaking.ts";

/* ------------------------------------------------------------------ *
 * The section registry (CELPIP-10).
 *
 * The ONE place a section's label, blurb, route prefix, card icons and
 * availability are declared — and availability is DERIVED from the banks
 * rather than written down: a section is offered when its bank exports at
 * least one item and reported as not-yet-available when it exports none.
 *
 * That is the whole point of this file's role in the phase. The remaining
 * content lands across a dozen plans against a fixed exam date, and any
 * plan may be dropped for the calendar. A hand-maintained list of "what
 * ships" would be one forgotten edit away from lying to a learner who is
 * planning her preparation around it; a derived one cannot be.
 * ------------------------------------------------------------------ */

/**
 * Icon keys the registry hands to the card layer — names, not components.
 *
 * This module is loaded directly by `node --experimental-strip-types` in the
 * verification scripts, so it stays free of React and of lucide. The key ->
 * component map lives in `src/lib/icons.tsx` with the rest of the
 * presentation layer, exactly as `curriculum.ts` stays pure data.
 */
export type CelpipCardIcon =
  | "email"
  | "survey"
  | "speaking"
  | "reading"
  | "listening";

export interface CelpipSectionItem {
  /** Bank id. The card's href is `${routePrefix}/${id}`. */
  id: string;
  title: string;
  /** One line under the title on the card. */
  summary: string;
  /** Bottom-left of the card: "27 min", "30s prep · 90s speaking", … */
  timing: string;
  icon: CelpipCardIcon;
}

/**
 * A sub-division within a section. Writing has two (the exam's two writing
 * tasks); every other skill has exactly one. The sections are uneven by
 * design (D-01) and the UI should not pretend otherwise, so this is a flat
 * one-level grouping rather than a general nested-tab system.
 */
export interface CelpipSectionGroup {
  key: string;
  label: string;
  items: CelpipSectionItem[];
}

export interface CelpipSectionCoverage {
  /** Derived: true when the section's groups hold at least one item. */
  available: boolean;
  /** Derived from counts this module can see. "" when unavailable. */
  summary: string;
  /**
   * The one hand-written field on a section: a qualitative limitation that a
   * later plan can correct by editing a single string. Everything else about
   * coverage is computed. Only meaningful — and only carried — when the
   * section is available.
   */
  caveat?: string;
}

export interface CelpipSection {
  skill: CelpipSkill;
  label: string;
  blurb: string;
  /** Route prefix; an item's href is `${routePrefix}/${item.id}`. */
  routePrefix: string;
  groups: CelpipSectionGroup[];
  coverage: CelpipSectionCoverage;
}

/**
 * What a bank hands the registry.
 *
 * `undefined` means the bank module does not exist yet. A later plan replaces
 * one `undefined` below with a call that builds one of these — a one-line edit
 * — and nothing else on the landing changes. Do NOT create empty bank modules
 * to satisfy the registry: an empty module is a second thing to remember to
 * delete when a set is dropped, and this registry exists to remove exactly
 * that class of forgetting.
 */
export interface CelpipSectionSource {
  groups: CelpipSectionGroup[];
  /** The derived half of the coverage line: what the bank actually holds. */
  summary: string;
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

const WRITING_CARD_ICON: Record<CelpipTaskType, CelpipCardIcon> = {
  email: "email",
  survey: "survey",
};

function writingSource(): CelpipSectionSource {
  // Groups come from CELPIP_TASK_META rather than from a second literal list
  // of writing task types — one mirrored list of that union is already one
  // too many.
  const groups = (Object.keys(CELPIP_TASK_META) as CelpipTaskType[]).map(
    (taskType) => ({
      key: taskType,
      label: CELPIP_TASK_META[taskType].label,
      items: getTasksByType(taskType).map((task) => ({
        id: task.id,
        title: task.title,
        summary: task.scenario,
        timing: `${task.timeLimitMinutes} min`,
        icon: WRITING_CARD_ICON[task.taskType],
      })),
    }),
  );
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  return {
    groups,
    summary: `${plural(count, "prompt")} across the exam's two writing tasks`,
  };
}

function speakingSource(): CelpipSectionSource {
  const items: CelpipSectionItem[] = SPEAKING_PROMPTS.map((prompt) => ({
    id: prompt.id,
    title: prompt.title,
    summary: prompt.scenario,
    timing: `${prompt.prepSeconds}s prep · ${prompt.responseSeconds}s speaking`,
    icon: "speaking",
  }));
  const shapes = new Set(SPEAKING_PROMPTS.map((p) => p.shape));
  return {
    groups: [{ key: "speaking", label: "Speaking", items }],
    summary: `${plural(items.length, "prompt")} covering ${shapes.size} of the ${
      CELPIP_SPEAKING_SHAPES.length
    } exam task shapes`,
  };
}

function listeningSource(): CelpipSectionSource {
  const items: CelpipSectionItem[] = LISTENING_SETS.map((set) => ({
    id: set.id,
    title: set.title,
    // The part SHAPES, never a line of the script: this string is rendered on
    // the landing, and D-04 is that she hears the words rather than reads them.
    summary: set.parts.map((part) => listeningPartKindLabel(part.kind)).join(" · "),
    timing: `${set.timeLimitMinutes} min · ${plural(
      set.parts.reduce((n, part) => n + part.questions.length, 0),
      "question",
    )}`,
    icon: "listening",
  }));
  const kinds = new Set(LISTENING_SETS.flatMap((set) => set.parts).map((p) => p.kind));
  return {
    groups: [{ key: "listening", label: "Listening", items }],
    summary: `${plural(items.length, "set")} covering ${kinds.size} of the ${
      CELPIP_LISTENING_PART_KINDS.length
    } exam part shapes`,
  };
}

// Reading has no bank module yet, so its section reads an absent source and
// reports itself as not yet available. Plan 09 replaces this `undefined`; it is
// one line, exactly as the listening one above it was.
const READING_SOURCE: CelpipSectionSource | undefined = undefined;

function section(
  skill: CelpipSkill,
  label: string,
  blurb: string,
  source: CelpipSectionSource | undefined,
  caveat?: string,
): CelpipSection {
  // Empty groups are dropped, so availability follows the bank's actual
  // CONTENTS rather than the mere presence of a source: a set that is emptied
  // or dropped from the phase flips the landing back to "not yet" by itself.
  const groups = (source?.groups ?? []).filter((g) => g.items.length > 0);
  const available = groups.length > 0;
  return {
    skill,
    label,
    blurb,
    routePrefix: `/celpip/${skill}`,
    groups,
    coverage: {
      available,
      summary: available ? (source?.summary ?? "") : "",
      caveat: available ? caveat : undefined,
    },
  };
}

export const CELPIP_SECTIONS: CelpipSection[] = [
  section(
    "writing",
    "Writing",
    "Task 1 email and Task 2 survey under exam timing, with original model answers and a descriptor self-check.",
    writingSource(),
  ),
  section(
    "reading",
    "Reading",
    "The exam's reading parts against the clock, with an answer key that explains why each answer is the answer.",
    READING_SOURCE,
  ),
  section(
    "listening",
    "Listening",
    "Spoken sets you hear once, with the questions revealed only after playback — as in the exam.",
    listeningSource(),
    // The other deliberate product compromise (D-03), said rather than hidden
    // for the same reason the Speaking one is: she meets the real thing on exam
    // day and has to know in advance how this differs.
    "The audio here is spoken by your browser rather than played from a recording, so it sounds more mechanical than the exam's and the voices are whatever your device offers. That is a trade for having this to practise with now. What it still trains is the part that decides the score: following speech you cannot re-read, once, while taking notes.",
  ),
  section(
    "speaking",
    "Speaking",
    "Timed prompts with a silent preparation window, in-browser recording, and a self-evaluation.",
    speakingSource(),
    // Two limitations, both stated rather than hidden. The first is the
    // deliberate product compromise (D-01, "Speaking to a usable minimum"):
    // exam Task 3 shows a photograph and this app has no original image, so
    // the scene is written out. She will meet that shape as a picture, so she
    // has to know that in advance rather than discover it on the day.
    "Task 3 is a picture-description task in the real exam. This app has no original photograph to show you, so that one prompt writes the scene out for you to read and then describe. Recordings play back in this browser and are never uploaded — only the timings and your own self-check are saved to your account.",
  ),
];

export function getSection(skill: CelpipSkill): CelpipSection | undefined {
  return CELPIP_SECTIONS.find((s) => s.skill === skill);
}

/** Sections whose banks actually hold something. */
export function availableSections(): CelpipSection[] {
  return CELPIP_SECTIONS.filter((s) => s.coverage.available);
}

/** Sections that do not ship yet — named out loud rather than hidden. */
export function pendingSections(): CelpipSection[] {
  return CELPIP_SECTIONS.filter((s) => !s.coverage.available);
}
