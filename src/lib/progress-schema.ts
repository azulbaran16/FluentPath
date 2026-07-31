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

/* ------------------------------------------------------------------ *
 * The CELPIP domain (D-04, D-05).
 *
 * Phase 1 built this store in the browser under the
 * `fluentpath.celpip.v1` localStorage key and deliberately shaped it
 * flat and serializable as the migration contract. The shapes below are
 * that contract, moved here so the client store, the route handler and
 * the verification scripts all read one definition; D-05 gives them
 * their own `User.celpipProgress` column rather than a corner of the
 * progress blob.
 * ------------------------------------------------------------------ */

/**
 * The CELPIP writing task-type union, taken by REFERENCE rather than by an
 * import statement.
 *
 * `src/lib/celpip.ts` re-exports the whole task bank, so importing it here at
 * runtime would drag every prompt into the client bundle and into any plain
 * node script that loads this module. An `import(...)` type annotation is
 * erased entirely, which keeps this module's only runtime import zod — and it
 * still BINDS the two: if that union ever gains a third task type, the drift
 * guard at the bottom of this file stops compiling until the schema's literal
 * pair below is updated to match.
 */
type CelpipTaskType = import("./celpip").CelpipTaskType;

export interface CelpipAttempt {
  taskId: string;
  taskType: CelpipTaskType;
  /** ISO timestamp of submission. */
  date: string;
  durationSeconds: number;
  wordCount: number;
  text: string;
  /** Rubric item id -> checked state for this attempt. */
  checkedRubric: Record<string, boolean>;
  outOfTime: boolean;
}

/**
 * One recorded CELPIP Speaking rehearsal.
 *
 * Deliberately its OWN top-level field rather than another `taskType` inside
 * `CelpipAttempt`. Widening that union would have to move in lockstep across
 * the zod enum here, the independent literal pair in progress-merge.ts, and the
 * content module's `CelpipTaskType` — and the merge's copy is the one that
 * silently DELETES an attempt it does not recognise. A separate field cannot
 * reach the writing shape at all, so the beta user's live writing history stays
 * byte-identical.
 *
 * `shape` is a bounded free string, NOT an enum, for the same reason: the eight
 * Speaking task shapes live in the content module, and a ninth one added there
 * must never be able to delete a learner's stored attempt. The bound is what
 * stops it growing the column; the absence of a literal list is what stops it
 * losing data.
 *
 * The recording itself is NOT here and never will be. Audio bytes stay in the
 * component for the session — the localStorage cache is a ~5 MB origin quota
 * and this payload is capped at 2 MiB on the wire, where a 413 is classified as
 * a permanent drop and would discard the learner's whole CELPIP sync, writing
 * history included. Only the four facts about the recording are stored.
 */
export interface CelpipSpeakingAttempt {
  promptId: string;
  /** ISO timestamp of submission. Half of the natural key. */
  date: string;
  /** The exam task shape this prompt follows, e.g. "advice". A bounded string
   * on purpose — see the note above. */
  shape: string;
  /** Wall-clock seconds from starting the attempt to finishing it. */
  durationSeconds: number;
  /** Whether any audio was captured at all. An attempt with none is valid. */
  recorded: boolean;
  /** Length of the captured audio, not of the attempt. */
  recordingSeconds: number;
  /** The container the browser actually chose, read back off the recorder. */
  mimeType: string;
  sizeBytes: number;
  /** Rubric item id -> checked state for this attempt. */
  checkedRubric: Record<string, boolean>;
  outOfTime: boolean;
  /** The learner's own written note about the attempt. Free-form prose, so it
   * carries the same ceiling an essay does. */
  note: string;
}

/**
 * One completed CELPIP Listening set.
 *
 * Its own top-level field, for exactly the reason `CelpipSpeakingAttempt` is:
 * `celpipAttemptEntry` in progress-merge.ts hard-codes the writing task-type
 * pair independently of the zod enum above, so widening `taskType` stores an
 * attempt that the merge then silently DELETES on the next reconcile. A
 * separate append-only field cannot reach the writing shape at all.
 *
 * THE LEARNER'S NOTES ARE NOT HERE, AND THAT IS DELIBERATE — DO NOT "FIX" IT.
 * Note-taking under time pressure is half of what this section trains, so the
 * player gives her a notes area; it lives in React state and is gone when the
 * set ends. Persisting it would create a second map with a real delete site,
 * and this state carries exactly ONE `updatedAt` instant which `pickDraftsSide`
 * already rides. A second whole-field-selected map sharing that instant means a
 * device stamping while saving a note also wins the `drafts` map — resurrecting
 * a cleared writing draft, which is the fca41b7 defect Phase 1 paid for. Not
 * persisting removes the failure mode instead of re-defending against it, and
 * it matches the exam, where the scratch paper is not preserved either.
 */
export interface CelpipListeningAttempt {
  setId: string;
  /** ISO timestamp of submission. Half of the natural key. */
  date: string;
  /** Wall-clock seconds from starting the set to submitting it. */
  durationSeconds: number;
  /**
   * Question id -> chosen option index. Sanitised per entry, so one malformed
   * answer costs only itself and the rest of the sheet still scores.
   */
  answers: Record<string, number>;
  /** How many she got right, and out of how many. Both stored rather than
   * recomputed: the bank is content and a later edit to a set must not
   * retroactively change a result she already saw. */
  correct: number;
  total: number;
  /** How many times she replayed the audio. "Plays once" cannot be ENFORCED in
   * a browser — a reload restarts everything — so it is recorded instead, which
   * makes her own history honest with her rather than pretending. */
  replays: number;
  /** She reported hearing nothing at the audio check and went on anyway. The
   * attempt is still valid and still stored; it just did not measure listening. */
  audioFailed: boolean;
  outOfTime: boolean;
}

/**
 * One completed CELPIP Reading set.
 *
 * Its own top-level field, for the third time and for exactly the same reason:
 * `celpipAttemptEntry` in progress-merge.ts hard-codes the writing task-type
 * pair independently of the zod enum above, so widening `taskType` stores an
 * attempt that the merge then silently DELETES on the next reconcile. A
 * separate append-only field cannot reach the writing shape at all, and the
 * beta user's live writing history stays byte-identical.
 *
 * THE IN-PROGRESS ANSWER SHEET IS NOT HERE, AND THAT IS DELIBERATE — DO NOT
 * "FIX" IT. Only a submitted result is stored. A half-finished sheet would be a
 * second map with a real delete site (it has to clear on submit, or a finished
 * attempt pre-fills the next timed run — the fca41b7 defect Phase 1 paid for),
 * and this state carries exactly ONE `updatedAt` instant which `pickDraftsSide`
 * already rides. A device stamping while saving an in-progress answer would
 * then also win the `drafts` map and resurrect a cleared writing draft. The
 * exposure from not persisting is small and bounded: a reading set is answer
 * clicks rather than prose, and it is one sitting.
 */
export interface CelpipReadingAttempt {
  setId: string;
  /** ISO timestamp of submission. Half of the natural key. */
  date: string;
  /** Wall-clock seconds from starting the set to submitting it. */
  durationSeconds: number;
  /**
   * Item id -> chosen option index, covering BOTH question ids and drop-down
   * blank ids — the two grade identically and share one map, which is why a
   * blank id must never collide with a question id inside a set (see
   * `CelpipReadingPart`). Sanitised per entry, so one malformed answer costs
   * only itself and the rest of the sheet still scores.
   */
  answers: Record<string, number>;
  /** How many she got right, and out of how many. Both stored rather than
   * recomputed: the bank is content and a later edit to a set must not
   * retroactively change a result she already saw. */
  correct: number;
  total: number;
  outOfTime: boolean;
}

export interface CelpipProgressState {
  attempts: Record<string, CelpipAttempt[]>;
  drafts: Record<string, string>;
  /**
   * Speaking rehearsals, keyed by prompt id — append-only, exactly like
   * `attempts` and merged by the same rule.
   *
   * It is deliberately NOT a whole-field-selected map. This state carries one
   * `updatedAt` instant and `drafts` already rides it; a second map selected on
   * that same instant would fight it, and a device that stamped while saving a
   * Speaking attempt would also win the drafts map — resurrecting a cleared
   * draft, which is the fca41b7 defect. An append-only map with a natural key
   * needs no instant at all.
   */
  speakingAttempts: Record<string, CelpipSpeakingAttempt[]>;
  /**
   * Completed Listening sets, keyed by set id — append-only, exactly like
   * `attempts` and `speakingAttempts`, and merged by the same rule.
   *
   * A third append-only map costs the merge nothing: it has no delete site, so
   * it needs no instant of its own and cannot fight `drafts` for the one this
   * state carries. That is the entire reason all three new skills are shaped
   * this way rather than as one polymorphic map.
   */
  listeningAttempts: Record<string, CelpipListeningAttempt[]>;
  /**
   * Completed Reading sets, keyed by set id — the fourth append-only map, on
   * the same rule as the other three.
   *
   * Four such maps cost the merge nothing between them: none has a delete site,
   * so none needs an instant of its own and none can fight `drafts` for the one
   * this state carries. That is the whole reason each new skill got its own
   * top-level field rather than one polymorphic map with a discriminator.
   */
  readingAttempts: Record<string, CelpipReadingAttempt[]>;
  /**
   * The same D-01b activity instant `ProgressState.updatedAt` carries, and for
   * a sharper reason: `drafts` is this store's one field with a real delete
   * site (`clearDraft` runs the moment an attempt is submitted, so the next
   * timed run starts from a blank editor). D-01a selects that map WHOLE from
   * the side with the later activity, and this store has no other activity
   * marker at all — no `lastActive`, no day string, nothing.
   *
   * It has to be an instant rather than a day: submit-then-reconcile happens
   * inside one calendar day every single time, so a day marker would leave the
   * carve-out decided by a tie-break instead of by the rule, and the tie-break
   * would hand the merge back to the larger map — pre-filling the next timed
   * attempt with the submitted answer, which is exactly the defect Phase 1
   * fixed in fca41b7.
   *
   * null on every blob written before Phase 2; the merge ranks null below any
   * side that carries one.
   */
  updatedAt: string | null;
}

export const CELPIP_EMPTY: CelpipProgressState = {
  attempts: {},
  drafts: {},
  speakingAttempts: {},
  listeningAttempts: {},
  readingAttempts: {},
  updatedAt: null,
};

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

/* ================================================================== *
 * The CELPIP runtime contract.
 *
 * Same policy as the progress one — strip what we do not know, recover
 * a known field we cannot read, drop a single malformed entry rather
 * than the payload — with two differences the shape forces:
 *
 *   • Attempts are an ARRAY per task, not a record, so the entry-level
 *     rule needs an array sanitiser: one malformed attempt costs only
 *     itself and the rest of that task's history survives.
 *   • This is the only payload in either domain carrying free-form
 *     learner prose, so it is the only one that needs a length bound.
 *     An essay and a draft are both capped, and an over-length entry is
 *     REJECTED as an entry rather than truncated: a silently truncated
 *     essay would read as the learner's own work.
 * ================================================================== */

/**
 * The ceiling on one essay and on one saved draft.
 *
 * A CELPIP Writing response is 150-200 words, so roughly 1,200 characters;
 * this leaves two orders of magnitude of headroom for a learner who pastes
 * notes in, while still bounding what a hostile or broken client can store.
 */
export const CELPIP_MAX_TEXT = 20_000;

/**
 * The largest option index a stored answer may carry.
 *
 * An objective question offers four options; this is two orders of magnitude of
 * headroom on a value that is only ever an array index, and it means a hostile
 * or broken client cannot store 1e308 in the middle of an answer sheet. An
 * out-of-range index is DROPPED rather than clamped: a clamped index would be a
 * fabricated answer, and showing the learner an answer she never chose is worse
 * than showing her a blank.
 */
export const CELPIP_MAX_OPTION_INDEX = 31;

const celpipText = z.string().max(CELPIP_MAX_TEXT);

/** Validates each element and keeps the survivors, dropping the rest — the
 * array form of `sanitizedRecord`, and the reason a single unreadable attempt
 * cannot cost a task its whole history. A value that is not an array FAILS
 * here rather than becoming an empty one, so the enclosing record drops that
 * key instead of inventing a task with no attempts. */
export function sanitizedArray<T>(item: z.ZodType<T>) {
  return z.array(z.unknown()).transform((raw) => {
    const out: T[] = [];
    for (const value of raw) {
      const parsed = item.safeParse(value);
      if (parsed.success) out.push(parsed.data);
    }
    return out;
  });
}

/**
 * One recorded attempt. Every field is required: an attempt missing its task
 * id or its submission timestamp has no identity, and identity is what the
 * merge de-duplicates on — an attempt without one would be re-appended on
 * every reconcile.
 *
 * `taskType` is declared as a local literal pair rather than by importing the
 * content module's union, for the bundle reason given at the type alias near
 * the top of this file. The drift guard below is what keeps the pair honest.
 */
export const celpipAttemptSchema = z.object({
  taskId: z.string().max(200),
  taskType: z.enum(["email", "survey"]),
  date: z.string().max(64),
  durationSeconds: z.number().int().min(0).max(MAX_COUNT),
  wordCount: z.number().int().min(0).max(MAX_COUNT),
  text: celpipText,
  checkedRubric: sanitizedRecord(z.boolean()),
  outOfTime: z.boolean(),
});

/**
 * One recorded Speaking rehearsal. Every field is required for the same reason
 * the writing attempt's are: an entry missing its prompt id or its submission
 * timestamp has no identity, and identity is what the merge de-duplicates on.
 *
 * `shape` is `z.string().max(64)` and NOT `z.enum([...])`. That is the whole
 * point of the separate field: the eight exam task shapes are content, they
 * live in `src/lib/celpip/speaking-prompts.ts`, and adding a ninth one there
 * must never make a stored attempt unreadable. Nothing here mirrors that list —
 * not this schema, and deliberately not `progress-merge.ts` either, which is
 * where the equivalent writing literal has always lived as a second copy.
 *
 * `mimeType` is bounded at 64 because a container string is short and a hostile
 * client should not be able to store prose in it. `note` takes the essay
 * ceiling — it is the only free-form field on this shape. Nothing here is
 * unbounded, which is what keeps a realistic history well under the 2 MiB body
 * cap in `src/app/api/celpip-progress/route.ts`.
 */
export const celpipSpeakingAttemptSchema = z.object({
  promptId: z.string().max(200),
  date: z.string().max(64),
  shape: z.string().max(64),
  durationSeconds: z.number().int().min(0).max(MAX_COUNT),
  recorded: z.boolean(),
  recordingSeconds: z.number().int().min(0).max(MAX_COUNT),
  mimeType: z.string().max(64),
  sizeBytes: z.number().int().min(0).max(MAX_COUNT),
  checkedRubric: sanitizedRecord(z.boolean()),
  outOfTime: z.boolean(),
  note: celpipText,
});

/**
 * One completed Listening set. Every field is required, for the same reason the
 * other two attempt shapes' are: an entry missing its set id or its submission
 * timestamp has no identity, and identity is what the merge de-duplicates on.
 *
 * `answers` is a sanitised record of bounded integers, so one malformed answer
 * is dropped and the rest of the sheet is still stored — the per-entry rule the
 * whole contract is built on, applied one level deeper.
 *
 * NOTHING HERE IS FREE-FORM PROSE. The learner's notes are not persisted (see
 * `CelpipListeningAttempt`), so this shape is bounded numbers, bounded ids and
 * booleans, which is what keeps a realistic history far under the 2 MiB body
 * cap where a 413 is a permanent drop.
 */
export const celpipListeningAttemptSchema = z.object({
  setId: z.string().max(200),
  date: z.string().max(64),
  durationSeconds: z.number().int().min(0).max(MAX_COUNT),
  answers: sanitizedRecord(z.number().int().min(0).max(CELPIP_MAX_OPTION_INDEX)),
  correct: z.number().int().min(0).max(MAX_COUNT),
  total: z.number().int().min(0).max(MAX_COUNT),
  replays: z.number().int().min(0).max(MAX_COUNT),
  audioFailed: z.boolean(),
  outOfTime: z.boolean(),
});

/**
 * One completed Reading set. Every field is required, for the same reason the
 * other three attempt shapes' are: an entry missing its set id or its
 * submission timestamp has no identity, and identity is what the merge
 * de-duplicates on.
 *
 * `answers` is the same sanitised record of bounded integers the listening
 * shape carries, and it holds BOTH question ids and drop-down blank ids — one
 * map, because the two item types grade identically.
 *
 * NOTHING HERE IS FREE-FORM PROSE. Only a submitted result is stored and no
 * in-progress sheet is (see `CelpipReadingAttempt`), so this shape is bounded
 * numbers, bounded ids and one boolean — which is what keeps a realistic
 * history far under the 2 MiB body cap where a 413 is a permanent drop.
 */
export const celpipReadingAttemptSchema = z.object({
  setId: z.string().max(200),
  date: z.string().max(64),
  durationSeconds: z.number().int().min(0).max(MAX_COUNT),
  answers: sanitizedRecord(z.number().int().min(0).max(CELPIP_MAX_OPTION_INDEX)),
  correct: z.number().int().min(0).max(MAX_COUNT),
  total: z.number().int().min(0).max(MAX_COUNT),
  outOfTime: z.boolean(),
});

export const celpipProgressSchema = z.object({
  attempts: sanitizedRecord(sanitizedArray(celpipAttemptSchema)),
  drafts: sanitizedRecord(celpipText),
  // Load-bearing exactly the way `updatedAt` below is: the plain object
  // constructor strips what it does not declare, so leaving this out would make
  // the server silently DELETE every Speaking attempt on every write — with no
  // error anywhere, because the write itself would still succeed.
  speakingAttempts: sanitizedRecord(sanitizedArray(celpipSpeakingAttemptSchema)),
  // Load-bearing in exactly the same way, and worth repeating rather than
  // cross-referencing: leave this line out and the server silently DELETES
  // every Listening result on every write, with no error anywhere, because the
  // write itself still succeeds.
  listeningAttempts: sanitizedRecord(sanitizedArray(celpipListeningAttemptSchema)),
  // The fourth, and worth stating a third time rather than cross-referencing,
  // because the failure is silent and total: leave this line out and the plain
  // object constructor strips the field, so the server DELETES every Reading
  // result on every write while the write itself still succeeds.
  readingAttempts: sanitizedRecord(sanitizedArray(celpipReadingAttemptSchema)),
  // Load-bearing for the same reason `updatedAt` is on the progress schema,
  // and more so here: the plain object constructor strips what it does not
  // declare, so an undeclared instant would be deleted by the server on every
  // write and the whole-map draft rule would fall through to its value
  // tie-break — handing a cleared draft back to the stale device.
  updatedAt: instantOrNull,
});

/** The CELPIP twin of `safeReadProgress`: reads stored data — the Postgres
 * column and the localStorage cache — without ever throwing. */
export function safeReadCelpip(
  raw: string | null | undefined,
): CelpipProgressState {
  if (!raw) return CELPIP_EMPTY;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return CELPIP_EMPTY;
  }
  const result = celpipProgressSchema.safeParse(parsed);
  return result.success ? result.data : CELPIP_EMPTY;
}

/**
 * Fails `npx tsc --noEmit` on drift between the CELPIP schema and its
 * interface — and, because `CelpipAttempt.taskType` is typed from the content
 * module's own union while the schema declares a literal pair, it fails just
 * as loudly if a third CELPIP writing task type is ever added there and not
 * here.
 */
export const CELPIP_SCHEMA_MATCHES_STATE: Identical<
  z.output<typeof celpipProgressSchema>,
  CelpipProgressState
> = true;
