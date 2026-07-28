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
//
// WHAT THIS DELIBERATELY GIVES UP — three costs, named here so a later reader
// does not file any of them as a defect.
//
//   1. XP DOES NOT SUM ACROSS DEVICES. `xp` and every `skillXp` bucket take a
//      max, so a learner who earns 40 XP offline on a laptop and 30 XP offline
//      on a phone ends the merge with 40, not 70. This is unavoidable rather
//      than chosen: `addSkillXp` (progress.ts) keeps no per-event record to
//      reconstruct a sum from, so the merge has nothing to add up. And a sum
//      could not be used even if it did — summing is not idempotent, and D-02
//      re-runs this merge on every authenticated load, so the total would
//      inflate on every page view. Max is the only rule that survives a
//      reconcile that repeats forever.
//
//   2. A STREAK MAY NOT COMPOUND ACROSS DEVICES. The `streak`/`lastActive`
//      pair moves as a unit from the later day (see mergeStreakPair), with no
//      case for days that happen to be adjacent. A learner who practised on
//      the laptop on Monday and only on the phone on Tuesday can therefore end
//      up with the phone's streak of 1 rather than a compounded 2. D-01c chose
//      this cost explicitly over order-dependence: the rejected adjacent-day
//      rule is not associative, so two devices plus the server would disagree
//      about the number depending on which pair synced first.
//
//   3. `goalXp` IS ASYMMETRIC ON A SAME-DAY TIE — the lower value wins. It is
//      the one field whose writer does not touch `lastActive` at all
//      (`setGoalXp` at progress.ts:288 sets the value and nothing else), so two
//      devices that both changed the goal today are genuinely indistinguishable
//      and the rule has to pick a direction. A learner who raises the goal on
//      two devices on the same day therefore keeps the lower number. That is
//      the safe direction on purpose: a goal silently raised is a goal the
//      learner cannot meet, while a goal left low is visible and one tap from
//      being raised again.
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

function optNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * `srs` entries, normalised. An entry that cannot supply BOTH a finite `box`
 * and a non-empty `due` is dropped rather than repaired: a fabricated due date
 * would enter the review queue as a real one, and a fabricated box would change
 * the interval the next correct answer schedules. Dropping is safe because
 * coercion runs on both sides independently — a readable entry on either side
 * still survives the union untouched.
 */
function srsRecord(v: unknown): Record<string, SrsItem> {
  if (!isPlainObject(v)) return {};
  const out: Record<string, SrsItem> = {};
  for (const k of Object.keys(v)) {
    const e = v[k];
    if (!isPlainObject(e)) continue;
    const box = optNum(e.box);
    const due = str(e.due);
    if (box === null || due === null || due === "") continue;
    out[k] = { box: box < 0 ? 0 : box, due };
  }
  return out;
}

/**
 * `attempts` entries, normalised. Same drop rule: no usable `updatedAt` day or
 * no usable `tries` count means the entry cannot take part in a point-in-time
 * comparison at all, so it is dropped rather than given an invented timestamp.
 *
 * The `wrong <= tries` invariant is enforced HERE, not in the merge. That is
 * what lets both counters merge as a plain max: if every input satisfies it,
 * then max(wrong) belongs to some side whose own tries is at most max(tries),
 * so the merged pair satisfies it too — no clamping in the join, and therefore
 * nothing in the join that could break associativity.
 */
function attemptRecord(v: unknown): Record<string, AttemptStat> {
  if (!isPlainObject(v)) return {};
  const out: Record<string, AttemptStat> = {};
  for (const k of Object.keys(v)) {
    const e = v[k];
    if (!isPlainObject(e)) continue;
    const updatedAt = str(e.updatedAt);
    const rawTries = optNum(e.tries);
    if (updatedAt === null || updatedAt === "" || rawTries === null) continue;
    const tries = rawTries < 0 ? 0 : rawTries;
    const rawWrong = optNum(e.wrong) ?? 0;
    const wrong = rawWrong < 0 ? 0 : rawWrong > tries ? tries : rawWrong;
    const stat: AttemptStat = {
      topic: str(e.topic) ?? "General",
      tries,
      wrong,
      resolved: Boolean(e.resolved),
      updatedAt,
    };
    // Optional fields are assigned only when present, never as `undefined`:
    // an explicit undefined-valued key would change the canonical form and
    // make coercion non-idempotent.
    const level = str(e.level);
    if (level !== null) stat.level = level;
    const chosen = optNum(e.lastWrongOption);
    if (chosen !== null) stat.lastWrongOption = chosen;
    out[k] = stat;
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
    srs: srsRecord(v.srs),
    vocab: flagRecord(v.vocab),
    attempts: attemptRecord(v.attempts),
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

/* ------------------------------------------------------------------ *
 * Per-entry rules for the key-unioned `attempts` and `srs` maps.
 *
 * THE CONSTRAINT THAT SHAPES BOTH. A per-entry rule may depend ONLY on
 * the two entries it is given. It may not consult anything that lives at
 * state level (`lastActive`, the D-01b instant) and it may not consult
 * the paired entry in the OTHER map, because a key union destroys the
 * provenance such a rule would need. 02-01 proved this with a
 * counterexample that applies verbatim to any cross-referenced key:
 * a holds key k, b does NOT hold k but carries a later timestamp for it,
 * c holds k with a middling timestamp.
 *   merge(a,b) keeps a's entry and inherits b's later timestamp, then
 *              outranks c                                  -> a's entry
 *   merge(b,c) keeps c's entry and inherits the same timestamp, then
 *              outranks a                                  -> c's entry
 * The timestamp travels with the merge; the entry's provenance does not.
 * Two devices plus the server would disagree, and each disagreement is
 * written back, so the reconcile would never settle.
 * `scripts/verify-merge.mts` group 19 executes both rejected rules and
 * asserts that they diverge, so this is evidence and not an assertion.
 * ------------------------------------------------------------------ */

/**
 * The point-in-time group of an attempt stat: the fields that describe the
 * learner's state at one moment and must therefore move together. Serialized
 * with a fixed key set so the comparison is stable and total.
 */
function pointInTime(e: AttemptStat): string {
  return canonical({
    resolved: e.resolved,
    topic: e.topic,
    level: e.level,
    lastWrongOption: e.lastWrongOption,
  });
}

/** Returns > 0 when x's point-in-time group wins. Later `updatedAt` first,
 * then the lexicographically greater `topic`, then the group's own canonical
 * form so the order is total. Every rung reads a field that TRAVELS WITH THE
 * GROUP — deliberately not `tries`, see mergeAttemptStat. */
function pickAttemptSide(x: AttemptStat, y: AttemptStat): number {
  const d = compareDay(x.updatedAt, y.updatedAt);
  if (d !== 0) return d;
  if (x.topic !== y.topic) return x.topic > y.topic ? 1 : -1;
  const cx = pointInTime(x);
  const cy = pointInTime(y);
  return cx > cy ? 1 : cx < cy ? -1 : 0;
}

/**
 * `attempts[id]` — the mistake notebook (D-01a row 1: the map is append-only
 * and union-safe; this rule decides only a key present on both sides).
 *
 *   • `tries` and `wrong` take the larger of the two. The invariant that wrong
 *     never exceeds tries is upheld by attemptRecord, not here.
 *   • `updatedAt` takes the later day.
 *   • `resolved`, `lastWrongOption`, `topic` and `level` come as a GROUP from
 *     the later-`updatedAt` side. Never OR'd, never maxed field by field: a
 *     question the learner just got wrong must not be flipped to resolved by an
 *     older record, and a stale option index must not stick to a resolved stat.
 *
 * DEVIATION from the plan text, on associativity grounds. The plan breaks a
 * same-day tie on "the side with more `tries`". That rung cannot be used: the
 * merged entry's `tries` is the MAX of both sides, so a merged entry carries a
 * counter that its own winning group never had, and the inflated counter then
 * wins a comparison the original would have lost. Counterexample, all three on
 * the same day: e1 = (tries 1, topic "aaa"), e2 = (an earlier day, tries 9,
 * topic "xxx"), e3 = (tries 5, topic "ccc").
 *   (e1·e2) takes e1's group by date and inherits tries 9, then beats e3 on
 *           the inflated count                                 -> "aaa"
 *   (e1·e3) ties on date and e3 wins on tries, then beats e2 by date -> "ccc"
 * `topic` is kept as the tie rung in its place because it belongs to the group
 * being selected and so cannot be inflated the same way.
 */
function mergeAttemptStat(x: AttemptStat, y: AttemptStat): AttemptStat {
  const win = pickAttemptSide(x, y) >= 0 ? x : y;
  const out: AttemptStat = {
    topic: win.topic,
    tries: maxNum(x.tries, y.tries),
    wrong: maxNum(x.wrong, y.wrong),
    resolved: win.resolved,
    // Identical to `win.updatedAt` by construction — the winner is chosen on
    // this comparison first — but written as the max so the field reads as the
    // rule it is.
    updatedAt: laterDay(x.updatedAt, y.updatedAt) ?? win.updatedAt,
  };
  if (win.level !== undefined) out.level = win.level;
  if (win.lastWrongOption !== undefined) out.lastWrongOption = win.lastWrongOption;
  return out;
}

/**
 * `srs[id]` — the review queue. The `{box, due}` entry moves as a UNIT, so a
 * box from one side is never paired with a due date from the other: the two are
 * computed together by `recordAttempt` and only mean anything together.
 *
 *   • The earlier `due` wins.
 *   • Equal `due` takes the lower `box`.
 *
 * Both tiebreaks fail safe for learning: the worst case is one extra review,
 * against a worst case of hiding an item the learner just got wrong for up to
 * thirty days. And they are exactly right on the case that matters — an
 * incorrect answer writes box 0 with `due` = today, the smallest possible pair,
 * so a just-failed item beats any stale success outright.
 *
 * DEVIATION from the plan text, on associativity grounds. The plan selects the
 * entry "from the side whose paired `attempts[id].updatedAt` is later", with
 * these two rungs as a fallback. The paired-timestamp rule is exactly the
 * cross-map reference the block comment above rules out — `attempts[id]` can
 * exist on a side that has no `srs[id]`, and after one merge the surviving
 * entry has silently inherited that side's timestamp. The plan's own fallback
 * is therefore promoted to the whole rule. Its ordering-hazard safeguard
 * ("read the same unmerged input pair") is satisfied a stronger way: this
 * picker is never handed `attempts` at all, so no later refactor can introduce
 * the hazard.
 */
function mergeSrsItem(x: SrsItem, y: SrsItem): SrsItem {
  const d = compareDay(x.due, y.due);
  if (d !== 0) return d < 0 ? x : y;
  return x.box <= y.box ? x : y;
}

/** Three-way form of `laterDay`, so a rule can name the winning SIDE and not
 * just the winning day. Same lexical comparison, same "null always loses". */
function compareDay(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a > b ? 1 : -1;
}

/** `streak` + `lastActive` — D-01a's second row, as amended by D-01c. */
interface StreakPair {
  lastActive: string | null;
  streak: number;
}

/**
 * The pair moves as a unit, and there are exactly two branches:
 *
 *   1. Different `lastActive`, by ANY distance — the later day supplies both
 *      the day and its OWN streak.
 *   2. Equal `lastActive` — that day, and the larger of the two streaks.
 *
 * This is a plain lexicographic max over the total order (`lastActive` first,
 * `streak` second), which is why it is idempotent, commutative and associative,
 * and why the state-level `lastActive` this pair reports always agrees with the
 * max of both sides.
 *
 * WHY THERE IS NO ADJACENT-DAY CASE. The obvious third branch — "the two days
 * are exactly one apart, so the learner practised on consecutive days; take the
 * later day AND the larger streak" — was considered and REJECTED by D-01c on
 * two independent grounds.
 *
 *   • It is not associative. Take (Jan 10, streak 30), (Jan 11, streak 1) and
 *     (Jan 12, streak 1). Merging the first two under that rule gives
 *     (Jan 11, 30), which is again adjacent to Jan 12, so the result is
 *     (Jan 12, 30). Merging the last two first gives (Jan 12, 1), which is two
 *     days from Jan 10, so the result is (Jan 12, 1). Two devices plus the
 *     server would then disagree about the streak depending on which pair
 *     synced first — and, worse, each disagreement is written back, so the
 *     reconcile never settles.
 *   • On the adjacent path it is literally `max(lastActive)` paired with
 *     `max(streak)`, the exact shape D-01a names as forbidden: it credits a
 *     run out of two partial ones, and the fabricated number STICKS, because
 *     `recordActivity` recomputes the next streak from `lastActive` and never
 *     re-derives it from history.
 *
 * ACCEPTED COST: practising on two devices on consecutive days may not compound
 * the streak — the later device's own number stands. The user chose correctness
 * and order-independence over streak generosity.
 *
 * Note what is NOT here: no day-distance arithmetic of any kind. That is not an
 * accident of style — a distance is the only way to express the rejected rule,
 * so its absence is mechanically checkable, and this plan gates on it.
 */
function mergeStreakPair(x: MergeState, y: MergeState): StreakPair {
  const d = compareDay(x.lastActive, y.lastActive);
  if (d > 0) return { lastActive: x.lastActive, streak: x.streak };
  if (d < 0) return { lastActive: y.lastActive, streak: y.streak };
  return { lastActive: x.lastActive, streak: maxNum(x.streak, y.streak) };
}

/** `todayXp` + `xpDay` — the XP ring, which is a per-day counter. */
interface DailyXp {
  todayXp: number;
  xpDay: string | null;
}

/**
 * The tuple moves together and is decided by `xpDay` ALONE — deliberately not
 * by `lastActive`, which can name a different day. Mixing the two fields is the
 * defect this rule exists to prevent: today's ring showing yesterday's total.
 * A null `xpDay` loses outright, so a state that never earned XP cannot donate
 * its `todayXp` to a state that did. Lexicographic max over (`xpDay`,
 * `todayXp`), hence associative.
 */
function mergeDailyXp(x: MergeState, y: MergeState): DailyXp {
  const d = compareDay(x.xpDay, y.xpDay);
  if (d > 0) return { todayXp: x.todayXp, xpDay: x.xpDay };
  if (d < 0) return { todayXp: y.todayXp, xpDay: y.xpDay };
  return { todayXp: maxNum(x.todayXp, y.todayXp), xpDay: x.xpDay };
}

/**
 * `goalXp` — a learner preference, never a max (D-01a's fourth row). The side
 * with the later `lastActive` supplies it; on a same-day tie the LOWER value
 * wins. See give-up 3 in the header for why the tie is asymmetric on purpose.
 *
 * Associative for the same reason the streak pair is: the winner is the side
 * holding the max `lastActive`, so the merged state's key is the winner's key
 * — this is a lexicographic max over (`lastActive` ascending, `goalXp`
 * descending), which is still a total order.
 */
function pickGoalXp(x: MergeState, y: MergeState): number {
  const d = compareDay(x.lastActive, y.lastActive);
  if (d > 0) return x.goalXp;
  if (d < 0) return y.goalXp;
  return x.goalXp < y.goalXp ? x.goalXp : y.goalXp;
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
  // The streak pair and the XP ring are separate rules on purpose: they are
  // keyed on different days (`lastActive` and `xpDay`), which can disagree.
  const run = mergeStreakPair(x, y);
  const ring = mergeDailyXp(x, y);

  return {
    completed: unionRecord(x.completed, y.completed, (p) => p),
    xp: maxNum(x.xp, y.xp),
    skillXp: unionRecord(x.skillXp, y.skillXp, maxNum) as ProgressState["skillXp"],
    streak: run.streak,
    lastActive: run.lastActive,
    level: higherLevel(x.level, y.level),
    // Both unions read the coerced INPUT pair, never each other's output, and
    // mergeSrsItem takes no `attempts` argument at all — so the hazard of
    // comparing an already-merged timestamp cannot be reintroduced by a later
    // refactor, because there is no parameter through which to reintroduce it.
    srs: unionRecord(x.srs, y.srs, mergeSrsItem),
    vocab: pickVocabSide(x, y) >= 0 ? { ...x.vocab } : { ...y.vocab },
    attempts: unionRecord(x.attempts, y.attempts, mergeAttemptStat),
    todayXp: ring.todayXp,
    xpDay: ring.xpDay,
    goalXp: pickGoalXp(x, y),
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
