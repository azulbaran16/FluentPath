// ───────────────────────────────────────────────────────────
// CELPIP Writing — task bank, rubric, and shared types.
// Each task is one seeded, original CELPIP-format writing prompt
// (Task 1: formal email, Task 2: survey/opinion response).
// This is the single source of truth for CELPIP writing content.
// ───────────────────────────────────────────────────────────

import { EMAIL_TASKS } from "./celpip/tasks-email.ts";
import { SURVEY_TASKS } from "./celpip/tasks-survey.ts";
import { SPEAKING_TASK_PROMPTS } from "./celpip/speaking-prompts.ts";

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

// Reading and Listening have no bank module yet, so their sections read an
// absent source and report themselves as not yet available. Plan 05 replaces
// the listening `undefined` and plan 09 the reading one; each is one line.
const READING_SOURCE: CelpipSectionSource | undefined = undefined;
const LISTENING_SOURCE: CelpipSectionSource | undefined = undefined;

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
    LISTENING_SOURCE,
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
