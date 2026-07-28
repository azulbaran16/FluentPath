// Shared progress contract — the single source of truth for the ProgressState
// shape, its empty default, and the day helpers the learning engine computes with.
//
// Deliberately framework-free: this module carries no client-boundary directive
// and has no runtime imports at all (the one import below is type-only and
// erases at compile time). That is what lets the identical shape be loaded by
// the client store, by the /api/progress route handler on the server, and
// directly by a plain `node --experimental-strip-types` verification script,
// where `@/`-aliased paths do not resolve.
//
// BOX_DAYS and the localStorage key deliberately stay in src/lib/progress.ts —
// they are engine/store concerns, not part of the wire contract.

import type { Skill } from "./curriculum";

export interface SrsItem {
  box: number;
  due: string; // YYYY-MM-DD
}

/** Per-question performance, powering weak-spots & the mistake notebook. */
export interface AttemptStat {
  topic: string;
  level?: string;
  tries: number;
  wrong: number;
  resolved: boolean; // got it right on the most recent attempt
  lastWrongOption?: number; // the option index last chosen incorrectly
  updatedAt: string; // YYYY-MM-DD
}

export interface ProgressState {
  /** keys are `${worldSlug}/${scenarioSlug}` */
  completed: Record<string, true>;
  xp: number;
  skillXp: Partial<Record<Skill, number>>;
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
  level: string | null;
  srs: Record<string, SrsItem>;
  /** vocabulary flashcards marked as known, keyed by card id */
  vocab: Record<string, true>;
  /** per-question attempt stats (grammar), keyed by question id */
  attempts: Record<string, AttemptStat>;
  /** XP earned today (resets when the day changes) */
  todayXp: number;
  xpDay: string | null; // the day todayXp belongs to
  /** daily XP goal */
  goalXp: number;
  /**
   * In-blob activity instant (D-01b): a millisecond-precision ISO timestamp
   * stamped on every learner mutation, null on blobs written before Phase 2.
   *
   * It exists because `lastActive` is only a `YYYY-MM-DD` day string while the
   * reconcile runs on every authenticated load (D-02) — so two sides that both
   * practised today are indistinguishable at day granularity, and the fields
   * with real deletions (`vocab` here, CELPIP drafts later) are exactly the ones
   * a tie-break must not decide. Always serialized in UTC, so a lexical
   * comparison of two instants is chronological — the same property `laterDay`
   * relies on.
   *
   * Distinct from the `User.updatedAt` timestamp column in prisma/schema.prisma:
   * that is Prisma's row-write clock and is NOT what this rule reads.
   */
  updatedAt: string | null;
}

export const EMPTY: ProgressState = {
  completed: {},
  xp: 0,
  skillXp: {},
  streak: 0,
  lastActive: null,
  level: null,
  srs: {},
  vocab: {},
  attempts: {},
  todayXp: 0,
  xpDay: null,
  goalXp: 30,
  updatedAt: null,
};

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/** The D-01b activity instant: millisecond-precision, always UTC. */
export function nowInstant(): string {
  return new Date().toISOString();
}
