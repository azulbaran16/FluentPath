// Shared progress contract — the single source of truth for the ProgressState
// shape, its empty default, the day helpers the learning engine computes with,
// and (below) the zod schema that validates it at every boundary.
//
// Deliberately framework-free: this module carries no client-boundary
// directive, no react, no next and no `@/`-aliased imports. Its ONLY runtime
// import is zod, already a direct dependency; the `Skill` import below is
// type-only and erases at compile time. That is what lets the identical
// contract be loaded by the client store, by the /api/progress route handler on
// the server, and directly by a plain `node --experimental-strip-types`
// verification script, where `@/`-aliased paths do not resolve.
//
// BOX_DAYS and the localStorage key deliberately stay in src/lib/progress.ts —
// they are engine/store concerns, not part of the wire contract.

import { z } from "zod";
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

/* ================================================================== *
 * The runtime contract (D-08, PROG-03).
 *
 * The policy this section encodes is asymmetric, and the asymmetry is
 * the point:
 *
 *   WRITES are lenient. A field the app has never heard of is stripped,
 *   a field it does know but cannot read falls back to its default, and
 *   a single malformed entry inside a record is dropped — the rest of
 *   the payload is still saved. The ONLY thing refused is a body that
 *   is not an object at all, because there is nothing to salvage from
 *   it. D-08 chose this deliberately: a browser can be holding a cached
 *   older build of the app, and a deploy must never start failing that
 *   learner's saves.
 *
 *   READS of stored data are lenient to the point of never throwing.
 *   `safeReadProgress` always produces a value, so one corrupt row can
 *   never become a permanent 500 for that account (PROG-03).
 *
 * `scripts/verify-schema.mts` proves both halves by command.
 * ================================================================== */

/** `YYYY-MM-DD`, the shape every day field in this state is compared with
 * lexically (`item.due <= today()`), so anything else is unusable. */
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The D-01b instant, exactly as `nowInstant()` writes it: millisecond
 * precision, always `Z`.
 *
 * The precision is not cosmetic. `laterInstant` in progress-merge.ts compares
 * two instants LEXICALLY, which is only chronological while every instant has
 * the same shape — `"2026-07-28T09:15:42Z" > "2026-07-28T09:15:42.500Z"`
 * because `Z` outranks `.`. Admitting a second-precision instant would silently
 * invert the whole-field ordering, so anything but this shape falls back to
 * null, which the merge treats as "older than any instant" — the safe
 * direction.
 */
const INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** Ceiling for every stored counter. A learner cannot reach it; a hostile or
 * broken client sending 1e308 is bounded by it. */
const MAX_COUNT = 1_000_000_000;

/** A bounded, non-negative integer that recovers to `fallback` rather than
 * failing the payload it sits in. */
const counter = (fallback: number) =>
  z.number().int().min(0).max(MAX_COUNT).catch(fallback);

const dayOrNull = z.string().regex(DAY_RE).nullable().catch(null);
const instantOrNull = z.string().regex(INSTANT_RE).nullable().catch(null);
const stringOrNull = z.string().nullable().catch(null);

/** Record keys that must never be assigned: `JSON.parse` creates `__proto__`
 * as a real OWN property, so `Object.entries` does enumerate it. */
const POISONED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Walks a raw value's own entries, validates each one, and assigns the
 * survivors into a FRESHLY created object.
 *
 * Building the result by explicit assignment — never by spreading unvalidated
 * input — is what keeps the prototype-pollution vector closed, and the skipped
 * keys above are what keeps it closed for the keys that would otherwise reach
 * an inherited setter.
 */
function sanitizeEntries<T>(raw: unknown, item: z.ZodType<T>): Record<string, T> {
  const out: Record<string, T> = {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (POISONED_KEYS.has(key)) continue;
    const parsed = item.safeParse(value);
    if (parsed.success) out[key] = parsed.data;
  }
  return out;
}

/**
 * D-08's own principle applied one level down: strip what does not fit, save
 * the rest. A record holding one well-formed entry and one malformed entry
 * parses successfully, keeps the good entry and drops the bad one.
 *
 * Deliberately NOT `z.record(key, item.catch(default))`: that keeps the bad key
 * alive carrying an invented value, and fabricating SRS schedule data or
 * attempt statistics is worse than dropping the entry — the learner would be
 * re-shown a card on a date nobody ever earned.
 */
export function sanitizedRecord<T>(item: z.ZodType<T>) {
  return z
    .unknown()
    .transform((raw) => sanitizeEntries(raw, item))
    .catch(() => ({}) as Record<string, T>);
}

/**
 * Sibling of `sanitizedRecord` that types its output as a partial keyed record,
 * so `skillXp` matches its declared `Partial<Record<Skill, number>>` without a
 * cast at the call site. `Skill` arrives through a type-only import, so the key
 * union cannot be checked at runtime and the narrowing lives here, once.
 */
export function sanitizedPartialRecord<K extends string, T>(item: z.ZodType<T>) {
  return sanitizedRecord(item).transform(
    (record) => record as Partial<Record<K, T>>,
  );
}

export const srsItemSchema = z.object({
  box: z.number().int().min(0).max(50),
  due: z.string().regex(DAY_RE),
});

export const attemptStatSchema = z.object({
  topic: z.string(),
  level: z.string().optional(),
  tries: z.number().int().min(0).max(MAX_COUNT),
  wrong: z.number().int().min(0).max(MAX_COUNT),
  resolved: z.boolean(),
  lastWrongOption: z.number().int().min(0).max(MAX_COUNT).optional(),
  updatedAt: z.string().regex(DAY_RE),
});

/**
 * The write-path contract.
 *
 * Built from the PLAIN object constructor on purpose: its default behaviour is
 * exactly D-08 — unknown keys are dropped, known keys are kept. Neither
 * modifier constructor is used. One of them keeps unknown keys (which is how a
 * hostile client grows the blob without bound); the other rejects the whole
 * payload on an unknown key, and that rejection is the option the user
 * explicitly turned down.
 *
 * `safeParse` therefore fails on exactly one input: a value that is not an
 * object. That is the only 400 this contract produces.
 */
export const progressSchema = z.object({
  completed: sanitizedRecord(z.literal(true)),
  xp: counter(0),
  skillXp: sanitizedPartialRecord<Skill, number>(
    z.number().int().min(0).max(MAX_COUNT),
  ),
  streak: counter(0),
  lastActive: dayOrNull,
  level: stringOrNull,
  srs: sanitizedRecord(srsItemSchema),
  vocab: sanitizedRecord(z.literal(true)),
  attempts: sanitizedRecord(attemptStatSchema),
  todayXp: counter(0),
  xpDay: dayOrNull,
  goalXp: counter(EMPTY.goalXp),
  // Load-bearing rather than cosmetic: the plain object constructor strips what
  // it does not declare, so an UNDECLARED `updatedAt` would be silently removed
  // by the server on every write and D-01b's whole-field rule would collapse
  // back to day granularity — resurrecting every un-marked vocabulary card.
  updatedAt: instantOrNull,
});

/**
 * Reads STORED data — the Postgres blob and the localStorage cache — without
 * ever throwing. Both call sites degrade identically, which is the property
 * PROG-03 asks for: a corrupt row loads as the empty state instead of being a
 * permanent 500 for that account.
 */
export function safeReadProgress(raw: string | null | undefined): ProgressState {
  if (!raw) return EMPTY;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  const result = progressSchema.safeParse(parsed);
  return result.success ? result.data : EMPTY;
}

/* ------------------------------------------------------------------ *
 * Compile-time drift guard.
 * ------------------------------------------------------------------ */

/** True only when A and B are the SAME type — not merely mutually assignable,
 * so an added optional field or a widened field is caught too. */
type Identical<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/**
 * Fails `npx tsc --noEmit` the moment a field is added to the hand-written
 * interface and not to the schema, or vice versa — the drift that would
 * otherwise show up as the server quietly deleting a field on every write.
 *
 * Compared against the schema's OUTPUT type, never its input: the per-field
 * fallbacks make a bad value acceptable on the way in, so the input type is
 * deliberately wider than `ProgressState`.
 */
export const SCHEMA_MATCHES_STATE: Identical<
  z.output<typeof progressSchema>,
  ProgressState
> = true;
