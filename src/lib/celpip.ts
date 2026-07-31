// ───────────────────────────────────────────────────────────
// CELPIP Writing — task bank, rubric, and shared types.
// Each task is one seeded, original CELPIP-format writing prompt
// (Task 1: formal email, Task 2: survey/opinion response).
// This is the single source of truth for CELPIP writing content.
// ───────────────────────────────────────────────────────────

import { EMAIL_TASKS } from "./celpip/tasks-email.ts";
import { SURVEY_TASKS } from "./celpip/tasks-survey.ts";

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

export { CELPIP_RUBRIC } from "./celpip/rubric.ts";
