// Deterministic merge for ProgressState — the join that both sides of the wire
// run. The client's per-load reconcile (D-02) and the server's merge-on-write
// PUT call this exact function, so its algebra, not a policy, decides the
// outcome. `scripts/verify-merge.mts` proves the properties below by command.
//
// WHAT THIS GUARANTEES
//   Total         Never throws. null, undefined, a string, an array or a blob
//                 full of garbage fields is read as the empty state.
//   Idempotent    merge(a, merge(a, b)) === merge(a, b). D-02 reconciles on
//                 every authenticated load; a non-idempotent rule (any sum,
//                 any counter bump) would inflate on every page view.
//   Commutative   merge(a, b) === merge(b, a). No rule may consult which
//                 argument is "local" and which is "server" — the identical
//                 function runs on both sides, so a positional tie-break makes
//                 the two converge to different values and write forever.
//   Associative   merge(merge(a,b),c) === merge(a,merge(b,c)). Two devices plus
//                 the server must converge no matter which pair syncs first.
//
// WHAT THIS DOES NOT GUARANTEE
//   • `vocab` is selected WHOLE-FIELD, not key-unioned. A card marked on the
//     older side is dropped when the newer side supplies the map. That is the
//     cost D-01a accepted when it rejected tombstones: `markVocab(id, false)`
//     really deletes, and a key union would resurrect every un-marked card on
//     the next load — the exact defect Phase 1 fixed in fca41b7.
//   • Whole-field selection at day granularity would be under-determined, so
//     `vocab` rides the D-01b `updatedAt` instant instead (see pickVocabSide).
//     Two sides carrying byte-identical non-null instants therefore fall
//     straight through to the value-only rungs; `lastActive` is consulted only
//     when NEITHER side has an instant, which is what keeps the rule
//     associative (a merged state's `lastActive` is the max of both sides and
//     may not belong to the side whose map won).
//   • `srs` and `attempts` are key-unioned but their per-entry rules are
//     deliberately coarse here — 02-02 refines them.
//   • The `streak`/`todayXp`/`xpDay`/`goalXp` group is taken as a unit; 02-02
//     replaces the grouping with per-field rules (and keeps the goalXp
//     tie-break, which is asymmetric on purpose: a learner who deliberately
//     lowered a daily goal must never have it raised back by a merge).
//
// This module is pure: no react, no next, no `@/` aliases and no runtime
// relative imports, so `node --experimental-strip-types` can load it directly.
// The type-only import below erases at compile time.

import type { AttemptStat, ProgressState, SrsItem } from "./progress-schema";

// Deliberately a SECOND declaration of the empty state. The contract module's
// EMPTY cannot be imported as a value here without giving this file a runtime
// relative import, which would break the standalone-load property above. It is
// typed through the type-only import so the compiler catches a missing or extra
// field, and `scripts/verify-merge.mts` asserts it field-for-field against
// progress-schema.ts's EMPTY at runtime — that assertion is the only thing
// keeping the two declarations honest.
export const MERGE_EMPTY: ProgressState = {
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

// Declared locally rather than imported from src/lib/content/diagnostic.ts:
// that module's rank table is private and importing the file would drag the
// whole question bank into the client bundle.
const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/* ------------------------------------------------------------------ *
 * Generic primitives — every one of them a max over a total order,
 * which is what makes the whole merge a semilattice join.
 * ------------------------------------------------------------------ */

/** Key union. `pick` decides a key present on both sides and must itself be
 * commutative, associative and idempotent. */
export function unionRecord<V>(
  a: Record<string, V> | null | undefined,
  b: Record<string, V> | null | undefined,
  pick: (x: V, y: V) => V,
): Record<string, V> {
  const out: Record<string, V> = { ...(a ?? {}) };
  const other = b ?? {};
  for (const k of Object.keys(other)) {
    const v = other[k];
    out[k] = k in out ? pick(out[k], v) : v;
  }
  return out;
}

export function maxNum(a: number, b: number): number {
  return a > b ? a : b;
}

/** Day strings are `YYYY-MM-DD`, so lexical comparison is chronological.
 * null always loses. */
export function laterDay(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a > b ? a : b;
}

/** The same comparison over the D-01b ISO instants — always UTC, so lexical
 * order is chronological. A side that carries an instant always outranks a side
 * that does not, which is why null loses here too. */
export function laterInstant(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a > b ? a : b;
}

/* ------------------------------------------------------------------ *
 * Defensive coercion — this is what makes mergeProgress total.
 * Payload validation proper lands in 02-03; here the only job is to
 * never throw and to normalise idempotently (coerce(coerce(x)) ===
 * coerce(x)), because idempotence of the merge rests on it.
 * ------------------------------------------------------------------ */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function flagRecord(v: unknown): Record<string, true> {
  if (!isPlainObject(v)) return {};
  const out: Record<string, true> = {};
  for (const k of Object.keys(v)) {
    if (v[k]) out[k] = true;
  }
  return out;
}

function numberRecord(v: unknown): Record<string, number> {
  if (!isPlainObject(v)) return {};
  const out: Record<string, number> = {};
  for (const k of Object.keys(v)) {
    const n = v[k];
    if (typeof n === "number" && Number.isFinite(n)) out[k] = n;
  }
  return out;
}

function entryRecord<V>(v: unknown): Record<string, V> {
  if (!isPlainObject(v)) return {};
  const out: Record<string, V> = {};
  for (const k of Object.keys(v)) {
    if (isPlainObject(v[k])) out[k] = v[k] as V;
  }
  return out;
}

// Internally the merge works with a plain `Record<string, number>` for skillXp
// so the generic record primitives apply to it; the public shape's narrower
// `Partial<Record<Skill, number>>` is restored on the way out.
type MergeState = Omit<ProgressState, "skillXp"> & { skillXp: Record<string, number> };

const COERCED_EMPTY: MergeState = { ...MERGE_EMPTY, skillXp: {} };

function coerce(v: unknown): MergeState {
  if (!isPlainObject(v)) return { ...COERCED_EMPTY };
  return {
    completed: flagRecord(v.completed),
    xp: num(v.xp, 0),
    skillXp: numberRecord(v.skillXp),
    streak: num(v.streak, 0),
    lastActive: str(v.lastActive),
    level: str(v.level),
    srs: entryRecord<SrsItem>(v.srs),
    vocab: flagRecord(v.vocab),
    attempts: entryRecord<AttemptStat>(v.attempts),
    todayXp: num(v.todayXp, 0),
    xpDay: str(v.xpDay),
    goalXp: num(v.goalXp, MERGE_EMPTY.goalXp),
    updatedAt: str(v.updatedAt),
  };
}

/* ------------------------------------------------------------------ *
 * Canonical serialization — record keys sorted, so two states that
 * differ only in insertion order compare equal.
 * ------------------------------------------------------------------ */

function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (isPlainObject(v)) {
    const keys = Object.keys(v).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
  }
  return JSON.stringify(v) ?? "null";
}

/* ------------------------------------------------------------------ *
 * Field rules (D-01a as amended by D-01b). Every rule is value-only.
 * ------------------------------------------------------------------ */

/** Rank tiers: null < any unknown string < A1 < A2 < B1 < B2 < C1 < C2. */
function levelTier(v: string): number {
  const i = CEFR_ORDER.indexOf(v as (typeof CEFR_ORDER)[number]);
  return i >= 0 ? i + 1 : 0;
}

function higherLevel(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  const ta = levelTier(a);
  const tb = levelTier(b);
  if (ta !== tb) return ta > tb ? a : b;
  // Same tier: either the identical known level, or two unknown strings —
  // break that on the strings themselves so the order stays total.
  return a >= b ? a : b;
}

/**
 * Whole-entry selection for the key-unioned `srs` / `attempts` maps.
 *
 * DEVIATION, documented deliberately: 02-01's action text picks the entry "from
 * the side whose `lastActive` is later". That rule is NOT associative for a
 * key-unioned field, and 02-01 Task 2 asserts associativity. Counterexample —
 * a has key k (day 1), b lacks k (day 3), c has k (day 2):
 *   merge(a,b) keeps a's k and inherits day 3, then beats c  -> a's entry
 *   merge(b,c) keeps c's k and inherits day 3, then beats a  -> c's entry
 * The state-level day travels with the merge but the entry's provenance does
 * not. So the pick is value-only: the entry whose canonical serialization is
 * lexicographically greater. Arbitrary, but a genuine total order — hence
 * commutative, associative and idempotent — and it never mixes sub-fields
 * across sides. 02-02 replaces it with meaningful per-entry rules.
 */
function pickWholeEntry<V>(x: V, y: V): V {
  return canonical(x) >= canonical(y) ? x : y;
}

/** The `streak` / `todayXp` / `xpDay` / `goalXp` group, taken as a unit. */
interface DailyGroup {
  streak: number;
  todayXp: number;
  xpDay: string | null;
  goalXp: number;
}

function dailyOf(s: MergeState): DailyGroup {
  return { streak: s.streak, todayXp: s.todayXp, xpDay: s.xpDay, goalXp: s.goalXp };
}

function compareDay(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a > b ? 1 : -1;
}

function pickDaily(x: MergeState, y: MergeState): DailyGroup {
  const d = compareDay(x.lastActive, y.lastActive);
  if (d > 0) return dailyOf(x);
  if (d < 0) return dailyOf(y);
  // Equal-day tie. D-01c dropped the consecutive-day carve-out, so this is the
  // only tie rule: larger streak and todayXp, later xpDay, and the LOWER
  // goalXp — a learner who deliberately lowered a daily goal must never have it
  // raised back by a merge.
  return {
    streak: maxNum(x.streak, y.streak),
    todayXp: maxNum(x.todayXp, y.todayXp),
    xpDay: laterDay(x.xpDay, y.xpDay),
    goalXp: x.goalXp < y.goalXp ? x.goalXp : y.goalXp,
  };
}

/**
 * The D-01b ladder for `vocab`, the one field in this state with a real delete
 * site (`markVocab(id, false)` at progress.ts). Returns > 0 when x's map wins.
 *
 *   1. Different `updatedAt` — later instant wins; a side holding an instant
 *      beats a side holding none.
 *   2. Both instants absent — later `lastActive` wins.
 *   3. Values only — the map with more keys, then the lexicographically greater
 *      sorted key list.
 *
 * Rung 3 is reachable only when both sides are blobs written before this phase
 * and untouched since, because every mutation stamps the instant — including
 * the un-mark. That is what makes the un-marking side WIN rather than lose to
 * the larger map.
 *
 * `lastActive` is consulted only at rung 2 (never as a tie-break under two
 * equal non-null instants) on purpose: a merged state's `lastActive` is the max
 * of both sides and may not belong to the side whose map won, so using it there
 * would break associativity.
 */
function pickVocabSide(x: MergeState, y: MergeState): number {
  if (x.updatedAt !== y.updatedAt) {
    if (x.updatedAt === null) return -1;
    if (y.updatedAt === null) return 1;
    return x.updatedAt > y.updatedAt ? 1 : -1;
  }
  if (x.updatedAt === null) {
    const d = compareDay(x.lastActive, y.lastActive);
    if (d !== 0) return d;
  }
  const kx = Object.keys(x.vocab).sort();
  const ky = Object.keys(y.vocab).sort();
  if (kx.length !== ky.length) return kx.length > ky.length ? 1 : -1;
  const jx = kx.join(" ");
  const jy = ky.join(" ");
  return jx > jy ? 1 : jx < jy ? -1 : 0;
}

/* ------------------------------------------------------------------ *
 * The join.
 * ------------------------------------------------------------------ */

export function mergeProgress(a: unknown, b: unknown): ProgressState {
  const x = coerce(a);
  const y = coerce(b);
  const daily = pickDaily(x, y);

  return {
    completed: unionRecord(x.completed, y.completed, (p) => p),
    xp: maxNum(x.xp, y.xp),
    skillXp: unionRecord(x.skillXp, y.skillXp, maxNum) as ProgressState["skillXp"],
    streak: daily.streak,
    lastActive: laterDay(x.lastActive, y.lastActive),
    level: higherLevel(x.level, y.level),
    srs: unionRecord(x.srs, y.srs, pickWholeEntry),
    vocab: pickVocabSide(x, y) >= 0 ? { ...x.vocab } : { ...y.vocab },
    attempts: unionRecord(x.attempts, y.attempts, pickWholeEntry),
    todayXp: daily.todayXp,
    xpDay: daily.xpDay,
    goalXp: daily.goalXp,
    // A plain max over a total order, so the join stays commutative and
    // associative. Never freshly generated: neither the reconcile's commit nor
    // the route handler may author an instant of its own.
    updatedAt: laterInstant(x.updatedAt, y.updatedAt),
  };
}

/** Canonical equality, insensitive to record key insertion order and to
 * absent-versus-default fields, and inclusive of `updatedAt`. The reconcile
 * uses it to skip the write-back when the merge changed nothing — the property
 * that keeps a quiet page load from writing. */
export function progressEqual(a: unknown, b: unknown): boolean {
  return canonical(coerce(a)) === canonical(coerce(b));
}
