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
