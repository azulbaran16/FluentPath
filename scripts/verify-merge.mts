// Executable proof of the merge algebra.
//
//   node --experimental-strip-types scripts/verify-merge.mts
//
// No test runner and no new dependency: the merge is a pure module with no
// react, no next and no `@/` aliases, so node can load it directly. Imports
// carry explicit .ts extensions because path aliases only resolve inside the
// bundler. `.mts` rather than `.ts` so node does not warn about a typeless
// package; tsconfig.json already includes **/*.mts, so `npx tsc --noEmit`
// type-checks this file too.
//
// If an assertion here exposes a real defect in mergeProgress, fix the module —
// never weaken the assertion.

import {
  MERGE_CELPIP_EMPTY,
  MERGE_CELPIP_MAX_OPTION_INDEX,
  MERGE_EMPTY,
  celpipEqual,
  mergeCelpip,
  mergeProgress,
  progressEqual,
} from "../src/lib/progress-merge.ts";
import {
  CELPIP_EMPTY,
  CELPIP_MAX_OPTION_INDEX,
  EMPTY,
  type AttemptStat,
  type CelpipAttempt,
  type CelpipListeningAttempt,
  type CelpipProgressState,
  type CelpipReadingAttempt,
  type CelpipSpeakingAttempt,
  type ProgressState,
  type SrsItem,
} from "../src/lib/progress-schema.ts";
// Phase 03: the ONE author of a scenario item's stored id. Imported rather
// than spelled out so this harness cannot keep passing against a format the
// app no longer writes.
import { scenarioItemId } from "../src/lib/review-items.ts";

/* ------------------------------------------------------------------ *
 * Harness
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

/** Deterministic serialization: record keys are sorted, so a difference in
 * insertion order can never produce a false failure. */
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v) ?? "null";
}

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

function deepEqual(label: string, actual: unknown, expected: unknown) {
  const a = canon(actual);
  const b = canon(expected);
  ok(label, a === b, a === b ? undefined : `actual   ${a}\n      expected ${b}`);
}

function group(name: string) {
  console.log(`· ${name}`);
}

/* ------------------------------------------------------------------ *
 * Fixtures
 * ------------------------------------------------------------------ */

function mk(patch: Partial<ProgressState>): ProgressState {
  return { ...EMPTY, ...patch };
}

// A populated account (server side of PROG-05).
const account = mk({
  completed: { "airport/check-in": true, "airport/security": true },
  xp: 120,
  skillXp: { grammar: 60, reading: 60 },
  streak: 4,
  lastActive: "2026-07-26",
  level: "B1",
  srs: { "q-1": { box: 2, due: "2026-07-29" } },
  vocab: { "card-a": true },
  attempts: {
    "q-1": {
      topic: "Tenses",
      tries: 3,
      wrong: 1,
      resolved: true,
      updatedAt: "2026-07-26",
    },
  },
  todayXp: 40,
  xpDay: "2026-07-26",
  goalXp: 30,
  updatedAt: "2026-07-26T18:00:00.000Z",
});

// A non-empty anonymous cache from a browser that was never signed in.
const anonymous = mk({
  completed: { "restaurant/ordering": true },
  xp: 45,
  skillXp: { speaking: 45 },
  streak: 1,
  lastActive: "2026-07-27",
  level: "A2",
  srs: { "q-9": { box: 0, due: "2026-07-27" } },
  vocab: { "card-z": true },
  attempts: {
    "q-9": {
      topic: "Prepositions",
      tries: 1,
      wrong: 1,
      resolved: false,
      updatedAt: "2026-07-27",
    },
  },
  todayXp: 45,
  xpDay: "2026-07-27",
  goalXp: 20,
  updatedAt: "2026-07-27T09:30:00.000Z",
});

// A third device, so associativity is exercised across three states.
const phone = mk({
  completed: { "airport/check-in": true, "hotel/booking": true },
  xp: 80,
  skillXp: { grammar: 20, writing: 80 },
  streak: 2,
  lastActive: "2026-07-28",
  level: "C1",
  srs: { "q-1": { box: 1, due: "2026-07-30" }, "q-4": { box: 3, due: "2026-08-05" } },
  vocab: { "card-a": true, "card-b": true },
  attempts: {
    "q-4": {
      topic: "Tenses",
      tries: 2,
      wrong: 0,
      resolved: true,
      updatedAt: "2026-07-28",
    },
  },
  todayXp: 10,
  xpDay: "2026-07-28",
  goalXp: 50,
  updatedAt: "2026-07-28T07:15:00.000Z",
});

// A pre-Phase-2 blob: no instant at all.
const legacy = mk({
  completed: { "airport/security": true },
  xp: 60,
  streak: 3,
  lastActive: "2026-07-25",
  level: "B2",
  vocab: { "card-a": true, "card-q": true },
  goalXp: 40,
});

/* ---- 02-02 Task 1 fixtures: the streak pair, the daily-XP tuple, goalXp ---- */

// The fabrication case D-01a exists to prevent: a long run abandoned in January
// on one side, a fresh one-day run today on the other.
const abandonedRun = mk({
  lastActive: "2026-01-15",
  streak: 30,
  todayXp: 200,
  xpDay: "2026-01-15",
  goalXp: 60,
});
const freshToday = mk({
  lastActive: "2026-07-28",
  streak: 1,
  todayXp: 5,
  xpDay: "2026-07-28",
  goalXp: 30,
});

// The three-state trio from the plan — the exact case the rejected adjacent-day
// carve-out failed.
const jan10 = mk({ lastActive: "2026-01-10", streak: 30 });
const jan11 = mk({ lastActive: "2026-01-11", streak: 1 });
const jan12 = mk({ lastActive: "2026-01-12", streak: 1 });

// The daily-XP tuple must be decided by `xpDay`, NOT by `lastActive`: these two
// disagree about which side is "newer" on purpose.
const lateDayOldXpRing = mk({
  lastActive: "2026-07-30",
  streak: 9,
  xpDay: "2026-07-20",
  todayXp: 1,
  goalXp: 25,
});
const earlyDayNewXpRing = mk({
  lastActive: "2026-07-25",
  streak: 2,
  xpDay: "2026-07-28",
  todayXp: 7,
  goalXp: 45,
});

/* ---- 02-02 Task 2 fixtures: the review queue and the mistake notebook ---- */

// The learner just got q-7 wrong on this device: recordAttempt writes box 0 and
// due today, and marks the stat unresolved. Both maps are written together.
const justGotItWrong = mk({
  lastActive: "2026-07-28",
  updatedAt: "2026-07-28T19:00:00.000Z",
  srs: { "q-7": { box: 0, due: "2026-07-28" } },
  attempts: {
    "q-7": {
      topic: "Conditionals",
      level: "B2",
      tries: 5,
      wrong: 3,
      resolved: false,
      lastWrongOption: 2,
      updatedAt: "2026-07-28",
    },
  },
});

// The other device still holds the older record, where q-7 was answered right:
// box 4, due nearly a month out, resolved and with no lastWrongOption at all.
const staleResolved = mk({
  lastActive: "2026-07-20",
  updatedAt: "2026-07-20T08:00:00.000Z",
  srs: { "q-7": { box: 4, due: "2026-08-19" } },
  attempts: {
    "q-7": {
      topic: "Conditionals",
      level: "B2",
      tries: 4,
      wrong: 2,
      resolved: true,
      updatedAt: "2026-07-20",
    },
  },
});

// An entry that exists only in srs, with no paired stat at all — the fallback
// path, and the shape a key union can always produce.
const srsWithoutStat = mk({
  lastActive: "2026-07-22",
  srs: { "q-7": { box: 2, due: "2026-08-02" }, "q-solo": { box: 3, due: "2026-08-10" } },
});

const states: Array<[string, ProgressState]> = [
  ["account", account],
  ["anonymous", anonymous],
  ["phone", phone],
  ["legacy", legacy],
  ["EMPTY", EMPTY],
  ["abandonedRun", abandonedRun],
  ["freshToday", freshToday],
  ["jan10", jan10],
  ["lateDayOldXpRing", lateDayOldXpRing],
  ["earlyDayNewXpRing", earlyDayNewXpRing],
  ["justGotItWrong", justGotItWrong],
  ["staleResolved", staleResolved],
  ["srsWithoutStat", srsWithoutStat],
];

/* ------------------------------------------------------------------ *
 * 1. Idempotence — the property D-02's per-load reconcile rests on.
 *    Without it, XP inflates on every page reload.
 * ------------------------------------------------------------------ */

group("idempotence");
for (const [na, a] of states) {
  for (const [nb, b] of states) {
    const once = mergeProgress(a, b);
    deepEqual(`idempotent: merge(${na}, merge(${na}, ${nb}))`, mergeProgress(a, once), once);
    deepEqual(`idempotent: merge(merge(${na}, ${nb}), itself)`, mergeProgress(once, once), once);
  }
}

/* ------------------------------------------------------------------ *
 * 2. Commutativity — without it the client and the server converge to
 *    different values and every load produces a write.
 * ------------------------------------------------------------------ */

group("commutativity");
for (const [na, a] of states) {
  for (const [nb, b] of states) {
    deepEqual(`commutative: ${na} <-> ${nb}`, mergeProgress(a, b), mergeProgress(b, a));
  }
}

/* ------------------------------------------------------------------ *
 * 3. Associativity — three-way convergence across two devices plus the
 *    server, regardless of which pair syncs first.
 * ------------------------------------------------------------------ */

group("associativity");
for (const [na, a] of states) {
  for (const [nb, b] of states) {
    for (const [nc, c] of states) {
      deepEqual(
        `associative: (${na}·${nb})·${nc} = ${na}·(${nb}·${nc})`,
        mergeProgress(mergeProgress(a, b), c),
        mergeProgress(a, mergeProgress(b, c)),
      );
    }
  }
}

/* ------------------------------------------------------------------ *
 * 4. Totality — never throws, always returns a well-formed state.
 * ------------------------------------------------------------------ */

group("totality");
const junk: unknown[] = [
  null,
  undefined,
  "garbage",
  42,
  true,
  [1, 2, 3],
  {},
  { completed: "nope", xp: "lots", srs: null, vocab: 7, goalXp: Number.NaN },
];

function wellFormed(label: string, s: ProgressState) {
  const keys = Object.keys(EMPTY).sort();
  deepEqual(`${label}: has exactly the contract's fields`, Object.keys(s).sort(), keys);
  ok(`${label}: xp is a finite number`, Number.isFinite(s.xp));
  ok(`${label}: goalXp is a finite number`, Number.isFinite(s.goalXp));
  ok(
    `${label}: record fields are objects`,
    [s.completed, s.skillXp, s.srs, s.vocab, s.attempts].every(
      (r) => typeof r === "object" && r !== null && !Array.isArray(r),
    ),
  );
}

for (const j of junk) {
  const label = `merge(${canon(j)}, account)`;
  let merged: ProgressState;
  try {
    merged = mergeProgress(j, account);
  } catch (err) {
    ok(`${label} does not throw`, false, String(err));
    continue;
  }
  ok(`${label} does not throw`, true);
  wellFormed(label, merged);
  // Garbage on one side must not destroy the readable side.
  deepEqual(`${label} preserves the readable side`, merged.completed, account.completed);

  const mirrored = mergeProgress(account, j);
  deepEqual(`merge(account, ${canon(j)}) is commutative with garbage too`, mirrored, merged);
}
wellFormed("merge({}, {})", mergeProgress({}, {}));
deepEqual("merge({}, {}) is the empty state", mergeProgress({}, {}), EMPTY);

// Poisoned record keys, on the PROGRESS side. The same pre-existing gap the
// CELPIP group below documents in full: progress-schema's `sanitizeEntries`
// skipped `__proto__`, `constructor` and `prototype`; every coercion function
// here assigned them. `constructor` and `prototype` survived the merge and were
// stripped by the schema, so the reconcile would write on every page load.
{
  const poisoned = mergeProgress(
    JSON.parse(
      `{"completed":{"__proto__":true,"constructor":true,"prototype":true,"lesson-1":true},` +
        `"skillXp":{"constructor":40,"listening":30},` +
        `"vocab":{"prototype":true,"card-1":true},` +
        `"srs":{"constructor":{"box":2,"due":"2026-07-30"},"card-1":{"box":1,"due":"2026-07-29"}},` +
        `"attempts":{"prototype":{"topic":"x","tries":1,"wrong":0,"updatedAt":"2026-07-30"}}}`,
    ),
    EMPTY,
  );
  deepEqual("poisoned completed keys are dropped by the merge", Object.keys(poisoned.completed).sort(), [
    "lesson-1",
  ]);
  deepEqual("poisoned skillXp keys are dropped by the merge", Object.keys(poisoned.skillXp).sort(), [
    "listening",
  ]);
  deepEqual("poisoned vocab keys are dropped by the merge", Object.keys(poisoned.vocab).sort(), [
    "card-1",
  ]);
  deepEqual("poisoned srs keys are dropped by the merge", Object.keys(poisoned.srs).sort(), [
    "card-1",
  ]);
  deepEqual("poisoned attempt-stat keys are dropped by the merge", Object.keys(poisoned.attempts).sort(), []);
  ok(
    "and no prototype was polluted along the way",
    ({} as Record<string, unknown>).polluted === undefined &&
      Object.getPrototypeOf(poisoned.completed) === Object.prototype,
  );
}

/* ------------------------------------------------------------------ *
 * 5. Never-lose — PROG-05 read literally: an account that already holds
 *    data merged with a non-empty anonymous cache keeps every completion
 *    key from both sides.
 * ------------------------------------------------------------------ */

group("never-lose (PROG-05)");
{
  const merged = mergeProgress(account, anonymous);
  for (const k of Object.keys(account.completed)) {
    ok(`kept account completion ${k}`, merged.completed[k] === true);
  }
  for (const k of Object.keys(anonymous.completed)) {
    ok(`kept anonymous completion ${k}`, merged.completed[k] === true);
  }
  ok("xp is the max, never a sum", merged.xp === 120);
  ok("skillXp unions per key", merged.skillXp.grammar === 60 && merged.skillXp.speaking === 45);
  ok("level takes the higher CEFR rank", merged.level === "B1");
  ok("srs unions keys", "q-1" in merged.srs && "q-9" in merged.srs);
  ok("attempts union keys", "q-1" in merged.attempts && "q-9" in merged.attempts);
  ok("lastActive is the later day", merged.lastActive === "2026-07-27");
}

/* ------------------------------------------------------------------ *
 * 6-8. D-01b: the whole-field group rides the millisecond instant.
 * ------------------------------------------------------------------ */

group("D-01b instant selection");

// Same calendar day on both sides. The later-instant side un-marked card-2, so
// its map is the SMALLER of the two. A size-based tie-break gets this backwards
// and resurrects the deletion.
const sameDayEarlierBigger = mk({
  lastActive: "2026-07-28",
  updatedAt: "2026-07-28T10:00:00.000Z",
  vocab: { "card-1": true, "card-2": true },
});
const sameDayLaterSmaller = mk({
  lastActive: "2026-07-28",
  updatedAt: "2026-07-28T11:00:00.000Z",
  vocab: { "card-1": true },
});
{
  const merged = mergeProgress(sameDayEarlierBigger, sameDayLaterSmaller);
  deepEqual("later instant supplies vocab (smaller map wins)", merged.vocab, {
    "card-1": true,
  });
  ok(
    "same-day deletion survives: card-2 stays un-marked",
    !("card-2" in merged.vocab),
  );
  ok(
    "merged updatedAt is the later input instant, never a fresh one",
    merged.updatedAt === "2026-07-28T11:00:00.000Z",
  );
  deepEqual(
    "and it is commutative",
    mergeProgress(sameDayLaterSmaller, sameDayEarlierBigger),
    merged,
  );
}

// Mirror: same instants, but now the LATER-instant side is the larger map, so
// the assertion above cannot pass by accident on a "smaller map always wins"
// rule.
const sameDayEarlierSmaller = mk({
  lastActive: "2026-07-28",
  updatedAt: "2026-07-28T10:00:00.000Z",
  vocab: { "card-1": true },
});
const sameDayLaterBigger = mk({
  lastActive: "2026-07-28",
  updatedAt: "2026-07-28T11:00:00.000Z",
  vocab: { "card-1": true, "card-2": true },
});
{
  const merged = mergeProgress(sameDayEarlierSmaller, sameDayLaterBigger);
  deepEqual("mirror: later instant supplies vocab (larger map wins)", merged.vocab, {
    "card-1": true,
    "card-2": true,
  });
  ok("mirror: merged updatedAt is still the later input instant", merged.updatedAt === "2026-07-28T11:00:00.000Z");
}

group("D-01b fallbacks");

// Neither side carries an instant (two pre-Phase-2 blobs) → later lastActive.
const noInstantOlder = mk({
  lastActive: "2026-07-20",
  vocab: { "card-1": true, "card-2": true, "card-3": true },
});
const noInstantNewer = mk({
  lastActive: "2026-07-24",
  vocab: { "card-9": true },
});
{
  const merged = mergeProgress(noInstantOlder, noInstantNewer);
  deepEqual("both instants absent → later lastActive supplies vocab", merged.vocab, {
    "card-9": true,
  });
  ok("no fabricated instant: result still has none", merged.updatedAt === null);
  deepEqual(
    "fallback is commutative",
    mergeProgress(noInstantNewer, noInstantOlder),
    merged,
  );
}

// A side holding an instant beats a side holding none, regardless of map size
// AND regardless of which has the later day.
const withInstantSmallOldDay = mk({
  lastActive: "2026-07-01",
  updatedAt: "2026-07-01T08:00:00.000Z",
  vocab: { "card-1": true },
});
const withoutInstantBigNewDay = mk({
  lastActive: "2026-07-30",
  vocab: { "card-1": true, "card-2": true, "card-3": true },
});
{
  const merged = mergeProgress(withInstantSmallOldDay, withoutInstantBigNewDay);
  deepEqual("a side with an instant outranks a side without", merged.vocab, {
    "card-1": true,
  });
  ok("merged instant is the only one present", merged.updatedAt === "2026-07-01T08:00:00.000Z");
  ok("lastActive is still the later day", merged.lastActive === "2026-07-30");
  deepEqual(
    "instant-beats-none is commutative",
    mergeProgress(withoutInstantBigNewDay, withInstantSmallOldDay),
    merged,
  );
}

/* ------------------------------------------------------------------ *
 * 9. Empty-literal parity — the runtime half of the drift guard for the
 *    merge module's deliberate second declaration of the empty state.
 * ------------------------------------------------------------------ */

group("empty-literal parity");
deepEqual("progress-merge MERGE_EMPTY === progress-schema EMPTY", MERGE_EMPTY, EMPTY);
deepEqual("field-for-field key parity", Object.keys(MERGE_EMPTY).sort(), Object.keys(EMPTY).sort());

/* ------------------------------------------------------------------ *
 * 10. No ping-pong — progressEqual must say "unchanged" when the merge
 *     changed nothing, including across record insertion order.
 * ------------------------------------------------------------------ */

group("no ping-pong");
{
  // Same content, different insertion order in every record.
  const serverCopy = mk({
    completed: { "airport/security": true, "airport/check-in": true },
    xp: 120,
    skillXp: { reading: 60, grammar: 60 },
    streak: 4,
    lastActive: "2026-07-26",
    level: "B1",
    srs: { "q-1": { due: "2026-07-29", box: 2 } },
    vocab: { "card-a": true },
    attempts: {
      "q-1": {
        tries: 3,
        topic: "Tenses",
        resolved: true,
        wrong: 1,
        updatedAt: "2026-07-26",
      },
    },
    todayXp: 40,
    xpDay: "2026-07-26",
    goalXp: 30,
    updatedAt: "2026-07-26T18:00:00.000Z",
  });
  const merged = mergeProgress(account, serverCopy);
  ok("progressEqual ignores record key insertion order", progressEqual(merged, serverCopy));
  ok("a quiet reconcile writes nothing back", progressEqual(mergeProgress(account, account), account));
  ok(
    "progressEqual treats an absent field as its default",
    progressEqual(EMPTY, {}) && progressEqual(EMPTY, null),
  );
  ok(
    "progressEqual still detects a real difference",
    !progressEqual(merged, anonymous),
  );
}

/* ------------------------------------------------------------------ *
 * 11. goalXp is a preference, not an achievement (D-01a).
 * ------------------------------------------------------------------ */

group("goalXp tie-break");
{
  const lowered = mk({ lastActive: "2026-07-28", goalXp: 10 });
  const original = mk({ lastActive: "2026-07-28", goalXp: 50 });
  ok(
    "an equal-day tie keeps the LOWER goal — a deliberate lowering is never undone",
    mergeProgress(lowered, original).goalXp === 10,
  );
  const laterDayHigher = mk({ lastActive: "2026-07-29", goalXp: 50 });
  ok(
    "the later day still supplies the whole daily group",
    mergeProgress(lowered, laterDayHigher).goalXp === 50,
  );
}

/* ------------------------------------------------------------------ *
 * 12. The streak pair (D-01a as amended by D-01c). `streak` and
 *     `lastActive` move together from the side with the later day; an
 *     equal day takes the larger streak. There is no adjacent-day case.
 * ------------------------------------------------------------------ */

group("streak pair (D-01c)");
{
  const merged = mergeProgress(abandonedRun, freshToday);
  ok(
    "a 30-day run abandoned in January does not fabricate a streak today",
    merged.streak === 1,
  );
  ok("the day travels with it", merged.lastActive === "2026-07-28");
  deepEqual(
    "the streak pair is commutative",
    mergeProgress(freshToday, abandonedRun),
    merged,
  );
  ok(
    "re-merging does not grow the streak (idempotent)",
    mergeProgress(merged, abandonedRun).streak === 1 &&
      mergeProgress(mergeProgress(merged, abandonedRun), freshToday).streak === 1,
  );

  // Equal day: the larger streak wins the tie, and the day is that day.
  const sameDaySmallStreak = mk({ lastActive: "2026-07-28", streak: 3 });
  const sameDayBigStreak = mk({ lastActive: "2026-07-28", streak: 11 });
  const tie = mergeProgress(sameDaySmallStreak, sameDayBigStreak);
  ok("an equal-day tie keeps the larger streak", tie.streak === 11);
  ok("and that day", tie.lastActive === "2026-07-28");

  // The rule that was REJECTED (D-01c): "days exactly one apart -> later day
  // plus the larger streak". These three states are one day apart in sequence,
  // so that rule would read (Jan 12, 30) here — and, worse, would read it only
  // under some bracketings. Both bracketings must give (Jan 12, 1).
  const trio: Array<[string, ProgressState]> = [
    ["jan10", jan10],
    ["jan11", jan11],
    ["jan12", jan12],
  ];
  for (const [na, a] of trio) {
    for (const [nb, b] of trio) {
      for (const [nc, c] of trio) {
        const left = mergeProgress(mergeProgress(a, b), c);
        const right = mergeProgress(a, mergeProgress(b, c));
        deepEqual(
          `three consecutive days: (${na}·${nb})·${nc} = ${na}·(${nb}·${nc})`,
          left,
          right,
        );
        ok(
          `three consecutive days: (${na}·${nb})·${nc} never compounds the streak`,
          left.streak === 1 || left.streak === 30,
        );
      }
    }
  }
  const abc = mergeProgress(mergeProgress(jan10, jan11), jan12);
  const aBc = mergeProgress(jan10, mergeProgress(jan11, jan12));
  ok("(jan10·jan11)·jan12 = (Jan 12, streak 1)", abc.lastActive === "2026-01-12" && abc.streak === 1);
  ok("jan10·(jan11·jan12) = (Jan 12, streak 1)", aBc.lastActive === "2026-01-12" && aBc.streak === 1);
}

/* ------------------------------------------------------------------ *
 * 13. The daily-XP tuple. `todayXp` and `xpDay` move as a pair, decided
 *     by `xpDay` alone — never by `lastActive`, or today's ring shows
 *     yesterday's total.
 * ------------------------------------------------------------------ */

group("daily XP tuple");
{
  const yesterdayBig = mk({ lastActive: "2026-07-27", xpDay: "2026-07-27", todayXp: 500 });
  const todaySmall = mk({ lastActive: "2026-07-28", xpDay: "2026-07-28", todayXp: 5 });
  const merged = mergeProgress(yesterdayBig, todaySmall);
  ok("today's ring never shows yesterday's total", merged.todayXp === 5);
  ok("and it belongs to today", merged.xpDay === "2026-07-28");
  deepEqual("the tuple is commutative", mergeProgress(todaySmall, yesterdayBig), merged);

  const sameDayLow = mk({ xpDay: "2026-07-28", todayXp: 10 });
  const sameDayHigh = mk({ xpDay: "2026-07-28", todayXp: 40 });
  const tie = mergeProgress(sameDayLow, sameDayHigh);
  ok("an equal xpDay takes the larger todayXp", tie.todayXp === 40);
  ok("and keeps that day", tie.xpDay === "2026-07-28");

  const noDay = mk({ xpDay: null, todayXp: 999 });
  const withDay = mk({ xpDay: "2026-07-28", todayXp: 5 });
  const nulled = mergeProgress(noDay, withDay);
  ok("a null xpDay loses the pair outright", nulled.todayXp === 5 && nulled.xpDay === "2026-07-28");
  deepEqual("null-xpDay is commutative", mergeProgress(withDay, noDay), nulled);

  // The tuple is decided independently of the streak pair.
  const split = mergeProgress(lateDayOldXpRing, earlyDayNewXpRing);
  ok("the streak pair follows lastActive", split.streak === 9 && split.lastActive === "2026-07-30");
  ok("while the XP ring follows xpDay", split.todayXp === 7 && split.xpDay === "2026-07-28");
}

/* ------------------------------------------------------------------ *
 * 14. goalXp is a preference. The later `lastActive` supplies it; on a
 *     same-day tie the LOWER value wins, because `setGoalXp` writes the
 *     value alone and never touches `lastActive`, so two same-day writes
 *     are indistinguishable and only one direction is safe.
 * ------------------------------------------------------------------ */

group("goalXp on the newer side");
{
  const loweredNewer = mk({ lastActive: "2026-07-29", goalXp: 15 });
  const higherOlder = mk({ lastActive: "2026-07-28", goalXp: 60 });
  const merged = mergeProgress(loweredNewer, higherOlder);
  ok("a goal lowered on the newer side survives a higher older value", merged.goalXp === 15);
  deepEqual("and it is commutative", mergeProgress(higherOlder, loweredNewer), merged);

  const raisedNewer = mk({ lastActive: "2026-07-29", goalXp: 90 });
  const lowerOlder = mk({ lastActive: "2026-07-28", goalXp: 20 });
  ok(
    "goalXp is not a max: a raise on the newer side also wins",
    mergeProgress(raisedNewer, lowerOlder).goalXp === 90,
  );
}

/* ------------------------------------------------------------------ *
 * 15. vocab: a card un-marked on one device stays un-marked, INCLUDING
 *     when both sides carry the same calendar day (the common path, since
 *     D-02 reconciles on every load).
 * ------------------------------------------------------------------ */

group("same-day vocab non-resurrection");
{
  const beforeUnmark = mk({
    lastActive: "2026-07-28",
    updatedAt: "2026-07-28T09:00:00.000Z",
    vocab: { "card-1": true, "card-2": true },
  });
  const afterUnmark = mk({
    lastActive: "2026-07-28",
    updatedAt: "2026-07-28T21:00:00.000Z",
    vocab: { "card-1": true },
  });
  const merged = mergeProgress(beforeUnmark, afterUnmark);
  ok("identical lastActive on both sides", beforeUnmark.lastActive === afterUnmark.lastActive);
  ok("the un-marked card does not come back", !("card-2" in merged.vocab));
  deepEqual("the newer map is taken whole", merged.vocab, { "card-1": true });
  ok(
    "and it stays gone after a second reconcile",
    !("card-2" in mergeProgress(merged, beforeUnmark).vocab),
  );
}

/* ------------------------------------------------------------------ *
 * 16. attempts[id] — the mistake notebook. Counters take a max; the
 *     point-in-time group travels together from the later `updatedAt`
 *     side, so a stale record can never mark an open mistake resolved.
 * ------------------------------------------------------------------ */

group("attempts per-entry rules");
{
  const merged = mergeProgress(justGotItWrong, staleResolved).attempts["q-7"];
  ok("a just-failed question is not resolved by an older resolved record", merged.resolved === false);
  ok("tries takes the max", merged.tries === 5);
  ok("wrong takes the max", merged.wrong === 3);
  ok("updatedAt takes the later day", merged.updatedAt === "2026-07-28");
  ok("lastWrongOption travels WITH the group", merged.lastWrongOption === 2);
  ok("topic travels with the group", merged.topic === "Conditionals");
  deepEqual(
    "the entry merge is commutative",
    mergeProgress(staleResolved, justGotItWrong).attempts["q-7"],
    merged,
  );
  deepEqual(
    "and idempotent — merging the same pair twice changes nothing",
    mergeProgress(mergeProgress(justGotItWrong, staleResolved), staleResolved).attempts["q-7"],
    merged,
  );

  // The mirror: now the NEWER record is the resolved one, and it carries no
  // lastWrongOption. If the group were merged field-by-field, the older
  // record's option index would leak through onto a resolved stat.
  const resolvedNewer = mk({
    attempts: {
      "q-8": { topic: "Articles", tries: 6, wrong: 2, resolved: true, updatedAt: "2026-07-28" },
    },
  });
  const openOlder = mk({
    attempts: {
      "q-8": {
        topic: "Articles",
        tries: 3,
        wrong: 3,
        resolved: false,
        lastWrongOption: 1,
        updatedAt: "2026-07-01",
      },
    },
  });
  const mirror = mergeProgress(resolvedNewer, openOlder).attempts["q-8"];
  ok("mirror: the newer resolved record wins", mirror.resolved === true);
  ok("mirror: counters still take the max", mirror.tries === 6 && mirror.wrong === 3);
  ok(
    "mirror: the older lastWrongOption does NOT leak onto the winning group",
    !("lastWrongOption" in mirror),
  );

  // The invariant, over every pair of fixtures: wrong never exceeds tries.
  for (const [na, a] of states) {
    for (const [nb, b] of states) {
      const m = mergeProgress(a, b);
      for (const [id, stat] of Object.entries(m.attempts)) {
        ok(
          `invariant wrong <= tries for ${id} in ${na}·${nb}`,
          stat.wrong <= stat.tries,
          `tries ${stat.tries}, wrong ${stat.wrong}`,
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * 17. srs[id] — the review queue. The {box, due} entry moves as a UNIT
 *     and is chosen on the entry's own values: the earlier due wins, then
 *     the lower box. Both tiebreaks bias toward reviewing sooner.
 * ------------------------------------------------------------------ */

group("srs per-entry rules");
{
  const merged = mergeProgress(justGotItWrong, staleResolved).srs["q-7"];
  deepEqual(
    "the just-failed entry wins whole: box 0 with ITS due date",
    merged,
    { box: 0, due: "2026-07-28" },
  );
  ok(
    "box and due are never mixed across sides",
    canon(merged) === canon(justGotItWrong.srs["q-7"]) ||
      canon(merged) === canon(staleResolved.srs["q-7"]),
  );
  deepEqual(
    "srs selection is commutative",
    mergeProgress(staleResolved, justGotItWrong).srs["q-7"],
    merged,
  );

  // Same due on both sides → the lower box wins (review sooner, and the box is
  // the conservative one).
  const sameDueHighBox = mk({ srs: { "q-2": { box: 5, due: "2026-08-01" } } });
  const sameDueLowBox = mk({ srs: { "q-2": { box: 1, due: "2026-08-01" } } });
  deepEqual(
    "an equal due date takes the lower box",
    mergeProgress(sameDueHighBox, sameDueLowBox).srs["q-2"],
    { box: 1, due: "2026-08-01" },
  );

  // No paired stat anywhere → still decided by the entry alone.
  const soloEarlier = mk({ srs: { "q-solo": { box: 1, due: "2026-08-03" } } });
  deepEqual(
    "with no paired stat the earlier due still wins",
    mergeProgress(soloEarlier, srsWithoutStat).srs["q-solo"],
    { box: 1, due: "2026-08-03" },
  );

  // A key present on one side only is carried through untouched.
  deepEqual(
    "a key present on one side only survives the union unchanged",
    mergeProgress(srsWithoutStat, EMPTY).srs["q-solo"],
    { box: 3, due: "2026-08-10" },
  );
}

/* ------------------------------------------------------------------ *
 * 18. Malformed entries: one bad side yields the other unchanged, two
 *     bad sides drop the key rather than fabricate one.
 * ------------------------------------------------------------------ */

group("malformed entries");
{
  const junkEntries: unknown = {
    ...EMPTY,
    srs: {
      "q-7": { box: "two", due: 7 },
      "q-null": null,
      // Readable due, unusable box — the half-formed case, which must be
      // dropped rather than completed with an invented box.
      "q-half": { box: "two", due: "2026-08-05" },
      "q-ok": { box: 1, due: "2026-08-01" },
    },
    attempts: {
      "q-7": "not an object",
      "q-null": { topic: "T" },
      // Readable timestamp, no usable tries count — same half-formed case.
      "q-half": { topic: "T", resolved: true, updatedAt: "2026-08-05" },
      // Violates the wrong <= tries invariant on input, and a negative
      // counter: both must be repaired at coercion, before any merge.
      "q-inv": { topic: "T", tries: 2, wrong: 9, resolved: false, updatedAt: "2026-08-05" },
      "q-neg": { topic: "T", tries: -4, wrong: -1, resolved: false, updatedAt: "2026-08-05" },
      "q-ok": { topic: "T", tries: 2, wrong: 0, resolved: true, updatedAt: "2026-08-01" },
    },
  };

  const withGood = mergeProgress(junkEntries, justGotItWrong);
  deepEqual(
    "a malformed srs entry yields the other side's entry unchanged",
    withGood.srs["q-7"],
    { box: 0, due: "2026-07-28" },
  );
  deepEqual(
    "a malformed attempt entry yields the other side's entry unchanged",
    withGood.attempts["q-7"],
    justGotItWrong.attempts["q-7"],
  );
  ok("the readable junk entries still survive", canon(withGood.srs["q-ok"]) === canon({ box: 1, due: "2026-08-01" }));

  const bothBad = mergeProgress(junkEntries, junkEntries);
  ok("malformed on both sides: the srs key is dropped, not fabricated", !("q-7" in bothBad.srs));
  ok("malformed on both sides: the attempts key is dropped too", !("q-7" in bothBad.attempts));
  ok("an entry missing required fields is dropped as well", !("q-null" in bothBad.attempts));
  ok(
    "an srs entry with a readable due but no usable box is dropped, not half-built",
    !("q-half" in bothBad.srs),
    `got ${canon(bothBad.srs["q-half"])}`,
  );
  ok(
    "an attempt with a timestamp but no usable tries count is dropped too",
    !("q-half" in bothBad.attempts),
    `got ${canon(bothBad.attempts["q-half"])}`,
  );
  for (const [id, item] of Object.entries(bothBad.srs)) {
    ok(
      `surviving srs entry ${id} is fully formed`,
      typeof item.box === "number" && Number.isFinite(item.box) && typeof item.due === "string" && item.due !== "",
      canon(item),
    );
  }
  ok(
    "wrong is clamped to tries at coercion, so the invariant holds before any merge",
    bothBad.attempts["q-inv"].wrong === 2 && bothBad.attempts["q-inv"].tries === 2,
    canon(bothBad.attempts["q-inv"]),
  );
  ok(
    "negative counters are repaired to zero",
    bothBad.attempts["q-neg"].tries === 0 && bothBad.attempts["q-neg"].wrong === 0,
    canon(bothBad.attempts["q-neg"]),
  );
  for (const [id, stat] of Object.entries(bothBad.attempts)) {
    ok(
      `surviving attempt ${id} keeps wrong <= tries`,
      stat.wrong <= stat.tries && stat.tries >= 0,
      canon(stat),
    );
    ok(
      `surviving attempt ${id} is fully formed`,
      typeof stat.tries === "number" && Number.isFinite(stat.tries) && typeof stat.updatedAt === "string" && stat.updatedAt !== "",
      canon(stat),
    );
  }
  ok("readable siblings are untouched by a dropped key", "q-ok" in bothBad.srs && "q-ok" in bothBad.attempts);
  deepEqual("dropping is idempotent", mergeProgress(bothBad, junkEntries), bothBad);
}

/* ------------------------------------------------------------------ *
 * 19. The two per-entry rules that were REJECTED, kept as executable
 *     evidence. Both are non-associative for a key-unioned field, which
 *     is the property 02-01 established and this plan's own acceptance
 *     criteria require. If a later reader is tempted to "restore" either
 *     rule from the plan text, this group is the answer.
 * ------------------------------------------------------------------ */

group("rejected per-entry rules (evidence)");
{
  type Pair = { srs: Record<string, SrsItem>; attempts: Record<string, AttemptStat> };
  const stat = (updatedAt: string, tries: number, topic: string): AttemptStat => ({
    topic,
    tries,
    wrong: 0,
    resolved: true,
    updatedAt,
  });

  /* --- Rejected rule A: "srs[id] comes from the side whose paired
         attempts[id].updatedAt is later". --- */
  function rejectedA(x: Pair, y: Pair): Pair {
    const srs: Record<string, SrsItem> = { ...x.srs };
    for (const k of Object.keys(y.srs)) {
      if (!(k in srs)) {
        srs[k] = y.srs[k];
        continue;
      }
      const ux = x.attempts[k]?.updatedAt ?? "";
      const uy = y.attempts[k]?.updatedAt ?? "";
      srs[k] = ux >= uy ? srs[k] : y.srs[k];
    }
    const attempts: Record<string, AttemptStat> = { ...x.attempts };
    for (const k of Object.keys(y.attempts)) {
      const a = attempts[k];
      const b = y.attempts[k];
      attempts[k] = a === undefined ? b : a.updatedAt >= b.updatedAt ? a : b;
    }
    return { srs, attempts };
  }

  // 02-01's counterexample shape: A holds the key with an old stat, B holds the
  // stat but NOT the srs entry, C holds both with a middling stat. B's newer
  // timestamp is inherited by whichever entry it merges with first.
  const A: Pair = { srs: { k: { box: 1, due: "2026-08-01" } }, attempts: { k: stat("2026-07-01", 1, "t") } };
  const B: Pair = { srs: {}, attempts: { k: stat("2026-07-03", 1, "t") } };
  const C: Pair = { srs: { k: { box: 9, due: "2026-09-09" } }, attempts: { k: stat("2026-07-02", 1, "t") } };

  const leftA = rejectedA(rejectedA(A, B), C).srs.k;
  const rightA = rejectedA(A, rejectedA(B, C)).srs.k;
  ok(
    "rejected rule A (srs follows the paired attempt timestamp) is NOT associative",
    canon(leftA) !== canon(rightA),
    `left ${canon(leftA)} right ${canon(rightA)}`,
  );

  // The shipped rule agrees under both bracketings on the very same states.
  const sA = mk({ srs: A.srs, attempts: A.attempts });
  const sB = mk({ srs: B.srs, attempts: B.attempts });
  const sC = mk({ srs: C.srs, attempts: C.attempts });
  deepEqual(
    "the shipped entry-only rule IS associative on the same three states",
    mergeProgress(mergeProgress(sA, sB), sC).srs.k,
    mergeProgress(sA, mergeProgress(sB, sC)).srs.k,
  );

  /* --- Rejected rule B: "on an equal updatedAt, the side with more tries
         wins the point-in-time group". `tries` is itself merged with a max,
         so the winner's key is inflated by the loser's counter. --- */
  function rejectedB(x: AttemptStat, y: AttemptStat): AttemptStat {
    const tries = Math.max(x.tries, y.tries);
    let win = x;
    if (y.updatedAt > x.updatedAt) win = y;
    else if (y.updatedAt === x.updatedAt && y.tries > x.tries) win = y;
    return { ...win, tries, wrong: Math.max(x.wrong, y.wrong), updatedAt: x.updatedAt > y.updatedAt ? x.updatedAt : y.updatedAt };
  }

  const e1 = stat("2026-07-03", 1, "aaa");
  const e2 = stat("2026-07-01", 9, "xxx");
  const e3 = stat("2026-07-03", 5, "ccc");
  const leftB = rejectedB(rejectedB(e1, e2), e3).topic;
  const rightB = rejectedB(rejectedB(e1, e3), e2).topic;
  ok(
    "rejected rule B (tries breaks the updatedAt tie) is NOT associative",
    leftB !== rightB,
    `left ${leftB} right ${rightB}`,
  );

  const t1 = mk({ attempts: { k: e1 } });
  const t2 = mk({ attempts: { k: e2 } });
  const t3 = mk({ attempts: { k: e3 } });
  deepEqual(
    "the shipped group rule IS associative on the same three entries",
    mergeProgress(mergeProgress(t1, t2), t3).attempts.k,
    mergeProgress(t1, mergeProgress(t2, t3)).attempts.k,
  );
  deepEqual(
    "and order-independent across the other bracketing too",
    mergeProgress(mergeProgress(t1, t3), t2).attempts.k,
    mergeProgress(mergeProgress(t2, t3), t1).attempts.k,
  );
}

/* ================================================================== *
 * 20-25. The CELPIP domain (02-05).
 *
 * A second, much smaller join over the same primitives. Two rules, and
 * each one exists to prevent a named defect:
 *
 *   attempts  a key-unioned map of ARRAYS. Entries are de-duplicated on
 *             their natural key and sorted into a canonical order,
 *             because without one the merge is not idempotent and D-02's
 *             per-load reconcile writes on every single page view.
 *   drafts    taken WHOLE from the side with the later D-01b instant.
 *             No key union, and no map-size tie-break ahead of the
 *             instant: `clearDraft` really deletes, and either of those
 *             would pre-fill the next timed attempt with the answer the
 *             learner just submitted — the Phase 1 defect fixed in
 *             fca41b7.
 * ================================================================== */

function mkCelpip(patch: Partial<CelpipProgressState>): CelpipProgressState {
  return { ...CELPIP_EMPTY, ...patch };
}

function att(taskId: string, date: string, patch: Partial<CelpipAttempt> = {}): CelpipAttempt {
  return {
    taskId,
    taskType: taskId.startsWith("survey") ? "survey" : "email",
    date,
    durationSeconds: 1500,
    wordCount: 170,
    text: `an answer submitted at ${date}`,
    checkedRubric: { "content-1": true, "tone-2": false },
    outOfTime: false,
    ...patch,
  };
}

// a2 is the SHARED attempt: it was synced to both devices, so it arrives on
// both sides of the merge and must come out once.
const a1 = att("email-neighbour", "2026-07-20T10:00:00.000Z");
const a2 = att("email-neighbour", "2026-07-24T16:30:00.000Z");
const a3 = att("email-neighbour", "2026-07-27T09:05:00.000Z");
const s1 = att("survey-transit", "2026-07-22T11:00:00.000Z");

const laptop = mkCelpip({
  attempts: { "email-neighbour": [a1, a2] },
  drafts: { "survey-transit": "a draft still open on the laptop" },
  updatedAt: "2026-07-24T16:30:00.000Z",
});
const phoneCelpip = mkCelpip({
  attempts: { "email-neighbour": [a2, a3], "survey-transit": [s1] },
  drafts: {},
  updatedAt: "2026-07-27T09:05:00.000Z",
});

/* ---- the draft carve-out, all four ways round ---- */

// The device where the learner is still writing. Same calendar day as the
// submission below, which is the whole point: a day-shaped marker ties here.
const beforeSubmit = mkCelpip({
  drafts: { "email-neighbour": "Dear Mr Alvarez, I am writing to" },
  updatedAt: "2026-07-28T10:00:00.000Z",
});
// The same device seconds later: the attempt was submitted, so clearDraft
// deleted the draft. Its map is now the SMALLER of the two, and it must still
// win — on the instant, never on size.
const afterSubmit = mkCelpip({
  attempts: { "email-neighbour": [att("email-neighbour", "2026-07-28T10:04:59.000Z")] },
  drafts: {},
  updatedAt: "2026-07-28T10:05:00.000Z",
});
// The mirror: identical maps, instants SWAPPED. If the rule were "the smaller
// map wins" the assertion above would pass here too — this is what stops it.
const draftIsTheNewerOne = mkCelpip({
  drafts: { "email-neighbour": "Dear Mr Alvarez, I am writing to" },
  updatedAt: "2026-07-28T10:05:00.000Z",
});
const clearedIsTheOlderOne = mkCelpip({
  attempts: { "email-neighbour": [att("email-neighbour", "2026-07-28T09:59:00.000Z")] },
  drafts: {},
  updatedAt: "2026-07-28T10:00:00.000Z",
});
// A Phase 1 blob, never touched since: no instant at all.
const legacyWithDraft = mkCelpip({
  attempts: { "survey-transit": [s1] },
  drafts: { "email-neighbour": "an old draft from a device that has not synced" },
});
const legacyBiggerDrafts = mkCelpip({
  drafts: { "email-neighbour": "one", "survey-transit": "two" },
});
const legacySmallerDrafts = mkCelpip({
  drafts: { "survey-transit": "a different answer, same key count as nothing else" },
});

/* ---- Speaking rehearsals (02.1-01) ---- */

function spk(
  promptId: string,
  date: string,
  patch: Partial<CelpipSpeakingAttempt> = {},
): CelpipSpeakingAttempt {
  return {
    promptId,
    date,
    shape: "advice",
    durationSeconds: 150,
    recorded: true,
    recordingSeconds: 90,
    mimeType: "audio/webm;codecs=opus",
    sizeBytes: 341_882,
    checkedRubric: { "speaking-did-the-task": true, "speaking-used-the-window": false },
    outOfTime: false,
    note: `a note written at ${date}`,
    ...patch,
  };
}

const WINTER = "speaking-advice-first-winter";

// r2 is the SHARED rehearsal, on both devices, and must come out once.
const r1 = spk(WINTER, "2026-07-26T09:00:00.000Z");
const r2 = spk(WINTER, "2026-07-28T18:20:00.000Z");
const r3 = spk(WINTER, "2026-07-29T07:15:00.000Z");
// The valid empty-handed attempt: nothing recorded and nothing ticked. Never
// gated on a quality signal, so it has to survive the merge like any other.
const rSilent = spk(WINTER, "2026-07-30T06:00:00.000Z", {
  recorded: false,
  recordingSeconds: 0,
  mimeType: "",
  sizeBytes: 0,
  checkedRubric: {},
  note: "",
  outOfTime: true,
});
// A shape string this build does not know — the regression guard for the enum
// trap. `celpipAttemptEntry` drops an unrecognised writing taskType; nothing in
// the speaking rule may do the equivalent, or a ninth exam shape would delete
// the learner's stored rehearsals on the next reconcile.
const rFutureShape = spk("speaking-future-shape", "2026-07-30T09:00:00.000Z", {
  shape: "role-play-a-phone-call",
});

const speakingOnly = mkCelpip({
  speakingAttempts: { [WINTER]: [r1, r2] },
  updatedAt: "2026-07-28T18:20:00.000Z",
});
const bothSkills = mkCelpip({
  attempts: { "email-neighbour": [a2, a3] },
  drafts: { "survey-transit": "a draft open while she also rehearses out loud" },
  speakingAttempts: { [WINTER]: [r2, r3], "speaking-future-shape": [rFutureShape] },
  updatedAt: "2026-07-29T07:15:00.000Z",
});
// Two rehearsals sharing a natural key (same prompt, same millisecond) but
// differing in content: the tie-break must pick the same one either way round.
const speakingTwins = mkCelpip({
  speakingAttempts: {
    [WINTER]: [spk(WINTER, r2.date, { note: "aaa" }), spk(WINTER, r2.date, { note: "zzz" })],
  },
});
const speakingSilentOnly = mkCelpip({
  speakingAttempts: { [WINTER]: [rSilent] },
  updatedAt: "2026-07-30T06:00:00.000Z",
});
// The beta user's stored row as it sits in Postgres TODAY: written before this
// phase, so `speakingAttempts` is not empty — it is ABSENT. Cast rather than
// declared, because that shape is deliberately not a valid CelpipProgressState;
// being total over exactly this is the additivity requirement.
const legacyNoSpeakingField = {
  attempts: { "email-neighbour": [a1], "survey-transit": [s1] },
  drafts: { "email-neighbour": "written before the Speaking section existed" },
  updatedAt: "2026-07-25T12:00:00.000Z",
} as unknown as CelpipProgressState;

/* ---- Listening sittings (02.1-04) ---- */

function lst(
  setId: string,
  date: string,
  patch: Partial<CelpipListeningAttempt> = {},
): CelpipListeningAttempt {
  return {
    setId,
    date,
    durationSeconds: 2_640,
    answers: { "l1-q1": 2, "l1-q2": 0, "l3-q4": 3 },
    correct: 29,
    total: 37,
    replays: 0,
    audioFailed: false,
    outOfTime: false,
    ...patch,
  };
}

const SET1 = "listening-set-everyday-canada";

// h2 is the SHARED sitting, on both devices, and must come out once.
const h1 = lst(SET1, "2026-07-26T14:00:00.000Z", { correct: 21 });
const h2 = lst(SET1, "2026-07-28T14:40:00.000Z", { correct: 26 });
const h3 = lst(SET1, "2026-07-30T08:05:00.000Z", { correct: 31, replays: 2 });
// The valid stranded attempt: she heard nothing, said so at the audio check,
// and went through the set anyway. Nothing here is gated on a quality signal,
// so it has to survive the merge like any other result.
const hDeaf = lst(SET1, "2026-07-31T06:30:00.000Z", {
  answers: {},
  correct: 0,
  audioFailed: true,
  outOfTime: true,
});
// A set id this build does not know, because the set was cut from the phase for
// the calendar. The same regression guard the speaking `shape` carries, one
// level out: nothing in the listening rule may mirror a list of set ids.
const hCutSet = lst("listening-set-that-was-cut", "2026-07-31T09:00:00.000Z");

const listeningOnly = mkCelpip({
  listeningAttempts: { [SET1]: [h1, h2] },
  updatedAt: "2026-07-28T14:40:00.000Z",
});
const allThreeSkills = mkCelpip({
  attempts: { "email-neighbour": [a2, a3] },
  drafts: { "survey-transit": "a draft open on the same evening she did a listening set" },
  speakingAttempts: { [WINTER]: [r2, r3] },
  listeningAttempts: { [SET1]: [h2, h3], "listening-set-that-was-cut": [hCutSet] },
  updatedAt: "2026-07-30T08:05:00.000Z",
});
// Two sittings sharing a natural key (same set, same millisecond) but differing
// in content: the tie-break must pick the same one either way round.
const listeningTwins = mkCelpip({
  listeningAttempts: {
    [SET1]: [lst(SET1, h2.date, { correct: 11 }), lst(SET1, h2.date, { correct: 33 })],
  },
});
const listeningDeafOnly = mkCelpip({
  listeningAttempts: { [SET1]: [hDeaf] },
  updatedAt: "2026-07-31T06:30:00.000Z",
});
// The row shape as it sits in Postgres between 02.1-01 and this plan: speaking
// present, listening ABSENT rather than empty. Distinct from
// legacyNoSpeakingField above, which is the Phase-1 shape missing both.
const legacyNoListeningField = {
  attempts: { "email-neighbour": [a1] },
  drafts: {},
  speakingAttempts: { [WINTER]: [r1] },
  updatedAt: "2026-07-27T12:00:00.000Z",
} as unknown as CelpipProgressState;

/* ---- Reading sittings (02.1-08) ---- */

function rdg(
  setId: string,
  date: string,
  patch: Partial<CelpipReadingAttempt> = {},
): CelpipReadingAttempt {
  return {
    setId,
    date,
    durationSeconds: 2_340,
    // BOTH kinds of item id in ONE map, which is the point of this shape: `q`
    // ids are comprehension questions and `b` ids are drop-down blanks, and the
    // merge must not be able to tell them apart.
    answers: { "r1-q1": 2, "r1-b3": 0, "r4-b7": 1 },
    correct: 30,
    total: 38,
    outOfTime: false,
    ...patch,
  };
}

const RSET1 = "reading-set-settling-in";

// g2 is the SHARED sitting, on both devices, and must come out once.
const g1 = rdg(RSET1, "2026-07-27T10:00:00.000Z", { correct: 22 });
const g2 = rdg(RSET1, "2026-07-29T11:30:00.000Z", { correct: 27 });
const g3 = rdg(RSET1, "2026-07-31T07:45:00.000Z", { correct: 33, outOfTime: true });
// The valid abandoned sheet: she ran out of time on part 1 and answered nothing.
// Nothing here is gated on a quality signal — submission is never blocked on
// completeness — so a zero-everything result has to survive the merge like any
// other rather than being read as junk.
const gBlank = rdg(RSET1, "2026-07-31T12:00:00.000Z", {
  answers: {},
  correct: 0,
  outOfTime: true,
});
// A set id this build does not know, because the set was cut from the phase for
// the calendar. The same regression guard the speaking `shape` and the
// listening set id carry: nothing in the reading rule may mirror a list of ids.
const gCutSet = rdg("reading-set-that-was-cut", "2026-07-31T13:00:00.000Z");

const readingOnly = mkCelpip({
  readingAttempts: { [RSET1]: [g1, g2] },
  updatedAt: "2026-07-29T11:30:00.000Z",
});
const allFourSkills = mkCelpip({
  attempts: { "email-neighbour": [a2, a3] },
  drafts: { "survey-transit": "a draft left open on the day she did a reading set" },
  speakingAttempts: { [WINTER]: [r2, r3] },
  listeningAttempts: { [SET1]: [h2, h3] },
  readingAttempts: { [RSET1]: [g2, g3], "reading-set-that-was-cut": [gCutSet] },
  updatedAt: "2026-07-31T07:45:00.000Z",
});
// Two sittings sharing a natural key (same set, same millisecond) but differing
// in content: the tie-break must pick the same one either way round.
const readingTwins = mkCelpip({
  readingAttempts: {
    [RSET1]: [rdg(RSET1, g2.date, { correct: 9 }), rdg(RSET1, g2.date, { correct: 35 })],
  },
});
const readingBlankOnly = mkCelpip({
  readingAttempts: { [RSET1]: [gBlank] },
  updatedAt: "2026-07-31T12:00:00.000Z",
});
// The row shape as it sits in Postgres between 02.1-04 and this plan: writing,
// speaking and listening present, reading ABSENT rather than empty. Distinct
// from both legacy states above, which are missing more.
const legacyNoReadingField = {
  attempts: { "email-neighbour": [a1] },
  drafts: {},
  speakingAttempts: { [WINTER]: [r1] },
  listeningAttempts: { [SET1]: [h1] },
  updatedAt: "2026-07-29T12:00:00.000Z",
} as unknown as CelpipProgressState;

const celpipStates: Array<[string, CelpipProgressState]> = [
  ["CELPIP_EMPTY", CELPIP_EMPTY],
  ["laptop", laptop],
  ["phoneCelpip", phoneCelpip],
  ["beforeSubmit", beforeSubmit],
  ["afterSubmit", afterSubmit],
  ["draftIsTheNewerOne", draftIsTheNewerOne],
  ["clearedIsTheOlderOne", clearedIsTheOlderOne],
  ["legacyWithDraft", legacyWithDraft],
  ["legacyBiggerDrafts", legacyBiggerDrafts],
  ["legacySmallerDrafts", legacySmallerDrafts],
  // Added by 02.1-01. Each one is exercised against every other state under
  // both bracketings by the O(n^3) sweep below — which is why fixtures here are
  // worth more than one-off assertions.
  ["speakingOnly", speakingOnly],
  ["bothSkills", bothSkills],
  ["speakingTwins", speakingTwins],
  ["speakingSilentOnly", speakingSilentOnly],
  ["legacyNoSpeakingField", legacyNoSpeakingField],
  // Added by 02.1-04, for the same reason and with the same payoff: each is
  // exercised against every other state under both bracketings for free.
  ["listeningOnly", listeningOnly],
  ["allThreeSkills", allThreeSkills],
  ["listeningTwins", listeningTwins],
  ["listeningDeafOnly", listeningDeafOnly],
  ["legacyNoListeningField", legacyNoListeningField],
  // Added by 02.1-08. Same payoff a third time: the O(n^3) sweep below exercises
  // each of these against every other state under both bracketings, which is
  // why a fixture here is worth more than a one-off assertion.
  ["readingOnly", readingOnly],
  ["allFourSkills", allFourSkills],
  ["readingTwins", readingTwins],
  ["readingBlankOnly", readingBlankOnly],
  ["legacyNoReadingField", legacyNoReadingField],
];

group("CELPIP algebra — idempotent, commutative, associative");
for (const [na, a] of celpipStates) {
  for (const [nb, b] of celpipStates) {
    const once = mergeCelpip(a, b);
    deepEqual(`celpip idempotent: merge(${na}, merge(${na}, ${nb}))`, mergeCelpip(a, once), once);
    deepEqual(`celpip commutative: ${na} <-> ${nb}`, mergeCelpip(b, a), once);
    for (const [nc, c] of celpipStates) {
      deepEqual(
        `celpip associative: (${na}·${nb})·${nc}`,
        mergeCelpip(mergeCelpip(a, b), c),
        mergeCelpip(a, mergeCelpip(b, c)),
      );
    }
  }
}

group("CELPIP attempts — de-duplicated, and in a canonical order");
{
  const merged = mergeCelpip(laptop, phoneCelpip);
  deepEqual(
    "the two devices' histories combine, and the shared attempt appears once",
    merged.attempts["email-neighbour"],
    [a1, a2, a3],
  );
  ok(
    "no duplicate survives the union",
    merged.attempts["email-neighbour"].length === 3,
    `length ${merged.attempts["email-neighbour"].length}`,
  );
  deepEqual("a task present on only one side is carried over whole", merged.attempts["survey-transit"], [s1]);
  const dates = merged.attempts["email-neighbour"].map((e) => e.date);
  deepEqual("the result is sorted ascending by submission timestamp", dates, [...dates].sort());

  // Without a canonical order the array identity differs on each pass, and
  // D-02's per-load reconcile would write on every page view.
  ok(
    "merging twice yields an identical array — the reconcile settles",
    celpipEqual(mergeCelpip(merged, laptop), merged) &&
      celpipEqual(mergeCelpip(merged, phoneCelpip), merged),
  );
  ok("a quiet reconcile writes nothing back", celpipEqual(mergeCelpip(laptop, laptop), laptop));

  const shuffled = mkCelpip({ attempts: { "email-neighbour": [a3, a1, a2] } });
  deepEqual(
    "an out-of-order stored history is canonicalised rather than re-shuffled",
    mergeCelpip(shuffled, CELPIP_EMPTY).attempts["email-neighbour"],
    [a1, a2, a3],
  );

  // Two records sharing the natural key (same task, same millisecond) but
  // differing in content: whichever way round they arrive, the same one wins.
  const twinA = mkCelpip({ attempts: { "email-neighbour": [att("email-neighbour", a2.date, { wordCount: 12 })] } });
  const twinB = mkCelpip({ attempts: { "email-neighbour": [att("email-neighbour", a2.date, { wordCount: 99 })] } });
  const clash = mergeCelpip(twinA, twinB);
  ok("a natural-key collision collapses to one entry", clash.attempts["email-neighbour"].length === 1);
  deepEqual("and it collapses to the same one in either order", mergeCelpip(twinB, twinA), clash);

  // Same submission instant, different tasks: still one entry each, still a
  // total order.
  const twoTasks = mergeCelpip(
    mkCelpip({ attempts: { "email-neighbour": [att("email-neighbour", "2026-07-29T08:00:00.000Z")] } }),
    mkCelpip({ attempts: { "survey-transit": [att("survey-transit", "2026-07-29T08:00:00.000Z")] } }),
  );
  ok(
    "two tasks submitted in the same millisecond keep one entry each",
    twoTasks.attempts["email-neighbour"].length === 1 &&
      twoTasks.attempts["survey-transit"].length === 1,
  );
}

group("CELPIP speaking — the same append-only rule, and no enum trap");
{
  const merged = mergeCelpip(speakingOnly, bothSkills);
  deepEqual(
    "the two devices' rehearsal histories combine, and the shared one appears once",
    merged.speakingAttempts[WINTER],
    [r1, r2, r3],
  );
  const dates = merged.speakingAttempts[WINTER].map((e) => e.date);
  deepEqual("sorted ascending by submission timestamp", dates, [...dates].sort());
  ok(
    "merging twice yields an identical array — the reconcile settles",
    celpipEqual(mergeCelpip(merged, speakingOnly), merged) &&
      celpipEqual(mergeCelpip(merged, bothSkills), merged),
  );

  // THE REGRESSION GUARD FOR THE ENUM TRAP.
  //
  // `celpipAttemptEntry` drops a writing attempt whose taskType is not one of
  // its two hard-coded literals — a list that is a SECOND copy of the zod enum,
  // so widening only the schema stores an attempt that the merge then silently
  // deletes on the next reconcile. Nothing in the speaking rule may mirror the
  // eight known shapes, and this is the assertion that says so out loud. A
  // schema-only suite cannot catch it: the schema accepts the entry either way.
  const survived = mergeCelpip(
    mkCelpip({ speakingAttempts: { "speaking-future-shape": [rFutureShape] } }),
    CELPIP_EMPTY,
  );
  deepEqual(
    "a rehearsal whose shape string this build does not recognise is NOT deleted by the merge",
    survived.speakingAttempts["speaking-future-shape"],
    [rFutureShape],
  );
  ok(
    "and its shape is carried through verbatim, not normalised away",
    survived.speakingAttempts["speaking-future-shape"][0].shape === "role-play-a-phone-call",
  );
  ok(
    "it still survives a second reconcile rather than being dropped on the way back",
    mergeCelpip(survived, survived).speakingAttempts["speaking-future-shape"].length === 1,
  );

  // The empty-handed attempt: nothing recorded, nothing ticked, no note. It is
  // a valid outcome (D-02 puts no gate anywhere in this flow), so the merge
  // must carry it like any other rather than reading it as a half-formed entry.
  const silent = mergeCelpip(speakingSilentOnly, speakingOnly);
  deepEqual(
    "an attempt with no recording and no ticks is preserved, not treated as junk",
    silent.speakingAttempts[WINTER].filter((e) => !e.recorded),
    [rSilent],
  );

  // A natural-key collision collapses to one, the same one either way round.
  const clash = mergeCelpip(
    mkCelpip({ speakingAttempts: { [WINTER]: [spk(WINTER, r2.date, { note: "aaa" })] } }),
    mkCelpip({ speakingAttempts: { [WINTER]: [spk(WINTER, r2.date, { note: "zzz" })] } }),
  );
  ok("a natural-key collision collapses to one entry", clash.speakingAttempts[WINTER].length === 1);
  deepEqual(
    "and it collapses to the same one in either order",
    mergeCelpip(
      mkCelpip({ speakingAttempts: { [WINTER]: [spk(WINTER, r2.date, { note: "zzz" })] } }),
      mkCelpip({ speakingAttempts: { [WINTER]: [spk(WINTER, r2.date, { note: "aaa" })] } }),
    ),
    clash,
  );

  // Identity is promptId + date, exactly as the writing rule is. An entry with
  // neither cannot be de-duplicated and would be re-appended on every reconcile.
  const identityless = {
    speakingAttempts: {
      [WINTER]: [{ ...r1, date: "" }, { ...r1, promptId: "" }, { shape: "advice" }, r1],
    },
  };
  const kept = mergeCelpip(identityless, CELPIP_EMPTY);
  deepEqual(
    "a rehearsal with no natural key is dropped, not stored",
    kept.speakingAttempts[WINTER],
    [r1],
  );
  ok(
    "so a repeat merge cannot append a second copy of it",
    mergeCelpip(kept, identityless).speakingAttempts[WINTER].length === 1,
  );

  // ---- The coercer normalises, and does so idempotently. ----
  //
  // coerce is what produces the canonical form on BOTH sides of the wire, so a
  // value it lets through unnormalised is a value the reconcile keeps rewriting.
  const nasty = mergeCelpip(
    {
      speakingAttempts: {
        [WINTER]: [
          {
            promptId: WINTER,
            date: "2026-07-31T05:00:00.000Z",
            shape: 42,
            durationSeconds: -90,
            recorded: "yes",
            recordingSeconds: -1,
            mimeType: null,
            sizeBytes: -4096,
            checkedRubric: { "speaking-did-the-task": "true", "speaking-right-register": false },
            outOfTime: 1,
            note: undefined,
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  const n = nasty.speakingAttempts[WINTER][0];
  ok("a negative attempt duration is clamped to zero", n.durationSeconds === 0, `${n.durationSeconds}`);
  ok("a negative recording length is clamped to zero", n.recordingSeconds === 0, `${n.recordingSeconds}`);
  ok("a negative size is clamped to zero", n.sizeBytes === 0, `${n.sizeBytes}`);
  ok("a non-string shape falls back to the empty string", n.shape === "", JSON.stringify(n.shape));
  ok("a null mimeType falls back to the empty string", n.mimeType === "", JSON.stringify(n.mimeType));
  ok("an absent note falls back to the empty string", n.note === "", JSON.stringify(n.note));
  ok("a non-boolean recorded flag is coerced to a boolean", typeof n.recorded === "boolean");
  ok("a non-boolean outOfTime flag is coerced to a boolean", typeof n.outOfTime === "boolean");
  deepEqual(
    "a non-boolean rubric value is dropped rather than stored — the map is rebuilt, never spread",
    n.checkedRubric,
    { "speaking-right-register": false },
  );
  ok(
    "every value left in the rubric map is a real boolean",
    Object.values(n.checkedRubric).every((value) => typeof value === "boolean"),
  );
  ok(
    "and normalising is idempotent, so the reconcile settles instead of rewriting",
    celpipEqual(mergeCelpip(nasty, nasty), nasty),
  );

  // ---- Additivity: the beta user's live row. ----
  const additive = mergeCelpip(legacyNoSpeakingField, speakingOnly);
  deepEqual(
    "a stored row written before this phase keeps its writing history intact",
    additive.attempts["email-neighbour"],
    [a1],
  );
  deepEqual(
    "and the absent speaking field simply fills in from the other side",
    additive.speakingAttempts[WINTER],
    [r1, r2],
  );
  deepEqual(
    "merging the legacy row against the empty state yields the writing shape byte-identical",
    mergeCelpip(legacyNoSpeakingField, CELPIP_EMPTY).attempts,
    { "email-neighbour": [a1], "survey-transit": [s1] },
  );
  ok(
    "no instant is fabricated for the field that did not exist",
    mergeCelpip(legacyNoSpeakingField, CELPIP_EMPTY).updatedAt === "2026-07-25T12:00:00.000Z",
  );

  // ---- The two skills do not interfere. ----
  const crossSkill = mergeCelpip(laptop, speakingOnly);
  deepEqual(
    "adding rehearsals leaves the writing history untouched",
    crossSkill.attempts,
    mergeCelpip(laptop, CELPIP_EMPTY).attempts,
  );
  deepEqual(
    "and adding essays leaves the rehearsal history untouched",
    crossSkill.speakingAttempts,
    mergeCelpip(speakingOnly, CELPIP_EMPTY).speakingAttempts,
  );
  ok(
    "the rehearsal key space is separate: a prompt id never collides with a task id",
    !(WINTER in crossSkill.attempts) && !("email-neighbour" in crossSkill.speakingAttempts),
  );

  // ---- No audio ever reaches the stored shape. ----
  const fields = new Set(Object.keys(r1));
  ok(
    "the stored rehearsal carries no audio payload field of any kind",
    !fields.has("blob") &&
      !fields.has("audio") &&
      !fields.has("data") &&
      !fields.has("url") &&
      !fields.has("objectUrl") &&
      !fields.has("recording"),
    `fields: ${[...fields].sort().join(",")}`,
  );
  const smuggled = mergeCelpip(
    {
      speakingAttempts: {
        [WINTER]: [{ ...r1, audioBase64: "SUQzBAAAAAAA", blob: "…", recordingUrl: "blob:x" }],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "a client that tries to smuggle audio in has it dropped by the coercer",
    Object.keys(smuggled.speakingAttempts[WINTER][0]).sort(),
    Object.keys(r1).sort(),
  );
}

group("CELPIP listening — the third append-only field, and the answer sheet");
{
  const merged = mergeCelpip(listeningOnly, allThreeSkills);
  deepEqual(
    "the two devices' sitting histories combine, and the shared one appears once",
    merged.listeningAttempts[SET1],
    [h1, h2, h3],
  );
  const dates = merged.listeningAttempts[SET1].map((e) => e.date);
  deepEqual("sorted ascending by submission timestamp", dates, [...dates].sort());
  ok(
    "merging twice yields an identical array — the reconcile settles",
    celpipEqual(mergeCelpip(merged, listeningOnly), merged) &&
      celpipEqual(mergeCelpip(merged, allThreeSkills), merged),
  );

  // THE ENUM TRAP, at the set-id level. `celpipAttemptEntry` drops a writing
  // attempt whose taskType is not one of its two hard-coded literals, and that
  // list is a SECOND copy of the zod enum. Nothing in the listening rule may
  // mirror a list of set ids or part kinds: sets are content, a set can be cut
  // from the phase for the calendar, and a cut set must never delete a result
  // the learner already has.
  const survived = mergeCelpip(
    mkCelpip({ listeningAttempts: { "listening-set-that-was-cut": [hCutSet] } }),
    CELPIP_EMPTY,
  );
  deepEqual(
    "a sitting for a set id this build does not recognise is NOT deleted by the merge",
    survived.listeningAttempts["listening-set-that-was-cut"],
    [hCutSet],
  );
  ok(
    "it still survives a second reconcile rather than being dropped on the way back",
    mergeCelpip(survived, survived).listeningAttempts["listening-set-that-was-cut"].length === 1,
  );

  // The stranded attempt: audio failed, nothing answered, nothing right. It is
  // a real outcome and the field that records it is the whole point of
  // `audioFailed`, so the merge must carry it rather than reading a
  // zero-everything entry as junk.
  const deaf = mergeCelpip(listeningDeafOnly, listeningOnly);
  deepEqual(
    "a sitting where the audio failed is preserved, not treated as an empty entry",
    deaf.listeningAttempts[SET1].filter((e) => e.audioFailed),
    [hDeaf],
  );
  ok(
    "and its flags survive verbatim",
    deaf.listeningAttempts[SET1].filter((e) => e.audioFailed)[0].outOfTime === true,
  );

  // A natural-key collision collapses to one, the same one either way round.
  const clash = mergeCelpip(
    mkCelpip({ listeningAttempts: { [SET1]: [lst(SET1, h2.date, { correct: 11 })] } }),
    mkCelpip({ listeningAttempts: { [SET1]: [lst(SET1, h2.date, { correct: 33 })] } }),
  );
  ok("a natural-key collision collapses to one entry", clash.listeningAttempts[SET1].length === 1);
  deepEqual(
    "and it collapses to the same one in either order",
    mergeCelpip(
      mkCelpip({ listeningAttempts: { [SET1]: [lst(SET1, h2.date, { correct: 33 })] } }),
      mkCelpip({ listeningAttempts: { [SET1]: [lst(SET1, h2.date, { correct: 11 })] } }),
    ),
    clash,
  );

  // Identity is setId + date. An entry with neither cannot be de-duplicated and
  // would be re-appended on every reconcile, growing the column forever.
  const identityless = {
    listeningAttempts: {
      [SET1]: [{ ...h1, date: "" }, { ...h1, setId: "" }, { correct: 4 }, h1],
    },
  };
  const kept = mergeCelpip(identityless, CELPIP_EMPTY);
  deepEqual("a sitting with no natural key is dropped, not stored", kept.listeningAttempts[SET1], [
    h1,
  ]);
  ok(
    "so a repeat merge cannot append a second copy of it",
    mergeCelpip(kept, identityless).listeningAttempts[SET1].length === 1,
  );

  // ---- The coercer normalises, and does so idempotently. ----
  const nasty = mergeCelpip(
    {
      listeningAttempts: {
        [SET1]: [
          {
            setId: SET1,
            date: "2026-08-01T05:00:00.000Z",
            durationSeconds: -2640,
            answers: {
              "l1-q1": 2,
              "l1-q2": -1,
              "l1-q3": 1.5,
              "l1-q4": "3",
              "l1-q5": MERGE_CELPIP_MAX_OPTION_INDEX + 1,
              "l1-q6": null,
              "l1-q7": Number.NaN,
            },
            correct: -4,
            total: -37,
            replays: -2,
            audioFailed: 1,
            outOfTime: "yes",
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  const n = nasty.listeningAttempts[SET1][0];
  ok("a negative duration is clamped to zero", n.durationSeconds === 0, `${n.durationSeconds}`);
  ok("a negative correct count is clamped to zero", n.correct === 0, `${n.correct}`);
  ok("a negative total is clamped to zero", n.total === 0, `${n.total}`);
  ok("a negative replay count is clamped to zero", n.replays === 0, `${n.replays}`);
  ok("a non-boolean audioFailed flag is coerced to a boolean", typeof n.audioFailed === "boolean");
  ok("a non-boolean outOfTime flag is coerced to a boolean", typeof n.outOfTime === "boolean");
  deepEqual(
    "every unusable answer index is DROPPED rather than clamped — a clamped index would be an answer she never chose",
    n.answers,
    { "l1-q1": 2 },
  );
  ok(
    "every value left in the answer sheet is a real integer in range",
    Object.values(n.answers).every(
      (v) => Number.isInteger(v) && v >= 0 && v <= MERGE_CELPIP_MAX_OPTION_INDEX,
    ),
  );
  ok(
    "and normalising is idempotent, so the reconcile settles instead of rewriting",
    celpipEqual(mergeCelpip(nasty, nasty), nasty),
  );

  // The answer sheet is a record with learner-supplied keys, so it needs the
  // same rebuild-never-spread treatment the rubric maps get. A poisoned QUESTION
  // id is a distinct hole from a poisoned SET id.
  const poisoned = mergeCelpip(
    {
      listeningAttempts: {
        [SET1]: [
          {
            ...h1,
            date: "2026-08-01T06:00:00.000Z",
            answers: JSON.parse('{"__proto__":1,"constructor":2,"l1-q1":3}') as Record<
              string,
              number
            >,
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "poisoned question ids are dropped, the real answer survives",
    poisoned.listeningAttempts[SET1][0].answers,
    { "l1-q1": 3 },
  );

  // THE FIELD THAT IS NOT THERE. Notes are deliberately never persisted (a
  // second deletable map would fight `drafts` for the one shared instant), so a
  // client that sends one must have it dropped by the coercer. Without this,
  // the argument quietly stops being true the first time a future component
  // sends the field speculatively.
  const withNotes = mergeCelpip(
    {
      listeningAttempts: {
        [SET1]: [{ ...h1, notes: "3pm, second platform, $4.25", transcript: "…" }],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "a notes or transcript field is dropped by the coercer — the stored shape carries no prose",
    Object.keys(withNotes.listeningAttempts[SET1][0]).sort(),
    Object.keys(h1).sort(),
  );

  // ---- Additivity: the row shape between 02.1-01 and this plan. ----
  const additive = mergeCelpip(legacyNoListeningField, listeningOnly);
  deepEqual(
    "a row written before this plan keeps its writing history intact",
    additive.attempts["email-neighbour"],
    [a1],
  );
  deepEqual("and keeps its rehearsal history intact", additive.speakingAttempts[WINTER], [r1]);
  deepEqual(
    "while the absent listening field simply fills in from the other side",
    additive.listeningAttempts[SET1],
    [h1, h2],
  );
  deepEqual(
    "the Phase-1 row, which has neither new field, is still total",
    mergeCelpip(legacyNoSpeakingField, CELPIP_EMPTY).listeningAttempts,
    {},
  );
  ok(
    "no instant is fabricated for the field that did not exist",
    mergeCelpip(legacyNoListeningField, CELPIP_EMPTY).updatedAt === "2026-07-27T12:00:00.000Z",
  );

  // ---- The three skills do not interfere. ----
  const crossSkill = mergeCelpip(allThreeSkills, listeningOnly);
  deepEqual(
    "adding sittings leaves the writing history untouched",
    crossSkill.attempts,
    mergeCelpip(allThreeSkills, CELPIP_EMPTY).attempts,
  );
  deepEqual(
    "and leaves the rehearsal history untouched",
    crossSkill.speakingAttempts,
    mergeCelpip(allThreeSkills, CELPIP_EMPTY).speakingAttempts,
  );
  ok(
    "the three key spaces are separate: a set id never collides with a prompt or task id",
    !(SET1 in crossSkill.attempts) &&
      !(SET1 in crossSkill.speakingAttempts) &&
      !(WINTER in crossSkill.listeningAttempts) &&
      !("email-neighbour" in crossSkill.listeningAttempts),
  );

  // ---- The two copies of the option ceiling must not drift. ----
  ok(
    "progress-merge's option ceiling matches progress-schema's",
    MERGE_CELPIP_MAX_OPTION_INDEX === CELPIP_MAX_OPTION_INDEX,
    `merge ${MERGE_CELPIP_MAX_OPTION_INDEX} vs schema ${CELPIP_MAX_OPTION_INDEX}`,
  );
}

group("CELPIP reading — the fourth append-only field, and one map for two item types");
{
  const merged = mergeCelpip(readingOnly, allFourSkills);
  deepEqual(
    "the two devices' sitting histories combine, and the shared one appears once",
    merged.readingAttempts[RSET1],
    [g1, g2, g3],
  );
  const dates = merged.readingAttempts[RSET1].map((e) => e.date);
  deepEqual("sorted ascending by submission timestamp", dates, [...dates].sort());
  ok(
    "merging twice yields an identical array — the reconcile settles",
    celpipEqual(mergeCelpip(merged, readingOnly), merged) &&
      celpipEqual(mergeCelpip(merged, allFourSkills), merged),
  );

  // THE ENUM TRAP, at the set-id level, for the third field running.
  // `celpipAttemptEntry` drops a writing attempt whose taskType is not one of
  // its two hard-coded literals — a SECOND copy of the zod enum. Nothing in the
  // reading rule may mirror a list of set ids or part kinds: a set cut from the
  // phase for the calendar must never delete a result she already has.
  const survived = mergeCelpip(
    mkCelpip({ readingAttempts: { "reading-set-that-was-cut": [gCutSet] } }),
    CELPIP_EMPTY,
  );
  deepEqual(
    "a sitting for a set id this build does not recognise is NOT deleted by the merge",
    survived.readingAttempts["reading-set-that-was-cut"],
    [gCutSet],
  );
  ok(
    "it still survives a second reconcile rather than being dropped on the way back",
    mergeCelpip(survived, survived).readingAttempts["reading-set-that-was-cut"].length === 1,
  );

  // The abandoned sheet: nothing answered, nothing right, out of time. The
  // house rule is that submission is never gated on completeness, so a
  // zero-everything result is a REAL outcome and the merge must carry it rather
  // than reading it as an empty entry.
  const blank = mergeCelpip(readingBlankOnly, readingOnly);
  deepEqual(
    "a sitting with an empty answer sheet is preserved, not treated as junk",
    blank.readingAttempts[RSET1].filter((e) => e.date === gBlank.date),
    [gBlank],
  );
  ok(
    "and its out-of-time flag survives verbatim",
    blank.readingAttempts[RSET1].filter((e) => e.date === gBlank.date)[0].outOfTime === true,
  );

  // A natural-key collision collapses to one, the same one either way round.
  const clash = mergeCelpip(
    mkCelpip({ readingAttempts: { [RSET1]: [rdg(RSET1, g2.date, { correct: 9 })] } }),
    mkCelpip({ readingAttempts: { [RSET1]: [rdg(RSET1, g2.date, { correct: 35 })] } }),
  );
  ok("a natural-key collision collapses to one entry", clash.readingAttempts[RSET1].length === 1);
  deepEqual(
    "and it collapses to the same one in either order",
    mergeCelpip(
      mkCelpip({ readingAttempts: { [RSET1]: [rdg(RSET1, g2.date, { correct: 35 })] } }),
      mkCelpip({ readingAttempts: { [RSET1]: [rdg(RSET1, g2.date, { correct: 9 })] } }),
    ),
    clash,
  );

  // Identity is setId + date. An entry with neither cannot be de-duplicated and
  // would be re-appended on every reconcile, growing the column forever.
  const identityless = {
    readingAttempts: {
      [RSET1]: [{ ...g1, date: "" }, { ...g1, setId: "" }, { correct: 4 }, g1],
    },
  };
  const kept = mergeCelpip(identityless, CELPIP_EMPTY);
  deepEqual("a sitting with no natural key is dropped, not stored", kept.readingAttempts[RSET1], [
    g1,
  ]);
  ok(
    "so a repeat merge cannot append a second copy of it",
    mergeCelpip(kept, identityless).readingAttempts[RSET1].length === 1,
  );

  // ---- The coercer normalises, and does so idempotently. ----
  const nasty = mergeCelpip(
    {
      readingAttempts: {
        [RSET1]: [
          {
            setId: RSET1,
            date: "2026-08-01T05:00:00.000Z",
            durationSeconds: -2340,
            answers: {
              "r1-q1": 2,
              "r1-b2": -1,
              "r2-q3": 1.5,
              "r2-b4": "3",
              "r3-q5": MERGE_CELPIP_MAX_OPTION_INDEX + 1,
              "r4-b6": null,
              "r4-q7": Number.NaN,
            },
            correct: -4,
            total: -38,
            outOfTime: "yes",
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  const n = nasty.readingAttempts[RSET1][0];
  ok("a negative duration is clamped to zero", n.durationSeconds === 0, `${n.durationSeconds}`);
  ok("a negative correct count is clamped to zero", n.correct === 0, `${n.correct}`);
  ok("a negative total is clamped to zero", n.total === 0, `${n.total}`);
  ok("a non-boolean outOfTime flag is coerced to a boolean", typeof n.outOfTime === "boolean");
  deepEqual(
    "every unusable answer index is DROPPED rather than clamped — a clamped index would be an answer she never chose",
    n.answers,
    { "r1-q1": 2 },
  );
  ok(
    "the rule is identical for a blank id and a question id — one map, one sanitiser",
    !("r1-b2" in n.answers) && !("r2-b4" in n.answers) && !("r2-q3" in n.answers),
  );
  ok(
    "and normalising is idempotent, so the reconcile settles instead of rewriting",
    celpipEqual(mergeCelpip(nasty, nasty), nasty),
  );

  // The answer sheet is a record with content-supplied keys, so it needs the
  // same rebuild-never-spread treatment. A poisoned ITEM id is a distinct hole
  // from a poisoned SET id, and the reading sheet has a wider key space than the
  // listening one because blanks live in it too.
  const poisoned = mergeCelpip(
    {
      readingAttempts: {
        [RSET1]: [
          {
            ...g1,
            date: "2026-08-01T06:00:00.000Z",
            answers: JSON.parse(
              '{"__proto__":1,"constructor":2,"prototype":3,"r1-b1":3}',
            ) as Record<string, number>,
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "poisoned item ids are dropped, the real blank answer survives",
    poisoned.readingAttempts[RSET1][0].answers,
    { "r1-b1": 3 },
  );

  // THE FIELDS THAT ARE NOT THERE. An in-progress answer sheet is deliberately
  // never persisted (a second deletable map would fight `drafts` for the one
  // shared instant), and neither is any per-part timing detail, so a client that
  // sends either must have it dropped. Without this the argument quietly stops
  // being true the first time a future component sends the field speculatively.
  const withDraftSheet = mergeCelpip(
    {
      readingAttempts: {
        [RSET1]: [{ ...g1, inProgress: { "r1-q1": 2 }, partIndex: 2, notes: "…" }],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "an in-progress sheet, a part cursor or a notes field is dropped by the coercer",
    Object.keys(withDraftSheet.readingAttempts[RSET1][0]).sort(),
    Object.keys(g1).sort(),
  );

  // ---- Additivity: the row shape between 02.1-04 and this plan. ----
  const additive = mergeCelpip(legacyNoReadingField, readingOnly);
  deepEqual(
    "a row written before this plan keeps its writing history intact",
    additive.attempts["email-neighbour"],
    [a1],
  );
  deepEqual("and keeps its rehearsal history intact", additive.speakingAttempts[WINTER], [r1]);
  deepEqual("and keeps its listening history intact", additive.listeningAttempts[SET1], [h1]);
  deepEqual(
    "while the absent reading field simply fills in from the other side",
    additive.readingAttempts[RSET1],
    [g1, g2],
  );
  deepEqual(
    "the Phase-1 row, which has none of the three new fields, is still total",
    mergeCelpip(legacyNoSpeakingField, CELPIP_EMPTY).readingAttempts,
    {},
  );
  ok(
    "no instant is fabricated for the field that did not exist",
    mergeCelpip(legacyNoReadingField, CELPIP_EMPTY).updatedAt === "2026-07-29T12:00:00.000Z",
  );

  // ---- All four skills coexist and do not interfere. ----
  const crossSkill = mergeCelpip(allFourSkills, readingOnly);
  deepEqual(
    "adding reading sittings leaves the writing history untouched",
    crossSkill.attempts,
    mergeCelpip(allFourSkills, CELPIP_EMPTY).attempts,
  );
  deepEqual(
    "and leaves the rehearsal history untouched",
    crossSkill.speakingAttempts,
    mergeCelpip(allFourSkills, CELPIP_EMPTY).speakingAttempts,
  );
  deepEqual(
    "and leaves the listening history untouched",
    crossSkill.listeningAttempts,
    mergeCelpip(allFourSkills, CELPIP_EMPTY).listeningAttempts,
  );
  ok(
    "the four key spaces are separate: a reading set id never collides with any other bank's id",
    !(RSET1 in crossSkill.attempts) &&
      !(RSET1 in crossSkill.speakingAttempts) &&
      !(RSET1 in crossSkill.listeningAttempts) &&
      !(SET1 in crossSkill.readingAttempts) &&
      !(WINTER in crossSkill.readingAttempts) &&
      !("email-neighbour" in crossSkill.readingAttempts),
  );
  ok(
    "all four attempt records are present on the merged state",
    Object.keys(mergeCelpip(allFourSkills, CELPIP_EMPTY)).sort().join(",") ===
      "attempts,drafts,listeningAttempts,readingAttempts,speakingAttempts,updatedAt",
  );
}

group("CELPIP drafts — a cleared draft is never resurrected");
{
  const merged = mergeCelpip(beforeSubmit, afterSubmit);
  deepEqual(
    "the later-instant side supplies the whole map, even though it is the smaller one",
    merged.drafts,
    {},
  );
  ok(
    "the submitted answer does not pre-fill the next timed attempt",
    !("email-neighbour" in merged.drafts),
  );
  ok(
    "and the two instants are the same calendar day, so no day marker could have decided this",
    String(beforeSubmit.updatedAt).slice(0, 10) === String(afterSubmit.updatedAt).slice(0, 10),
  );
  deepEqual("commutative", mergeCelpip(afterSubmit, beforeSubmit), merged);
  ok(
    "still cleared after a second reconcile",
    !("email-neighbour" in mergeCelpip(merged, beforeSubmit).drafts),
  );

  // The mirror. Same two maps, instants swapped — the draft must now SURVIVE,
  // which is what proves the rule is not "the smaller map always wins".
  const mirrored = mergeCelpip(draftIsTheNewerOne, clearedIsTheOlderOne);
  deepEqual(
    "with the instants swapped the newer draft survives",
    mirrored.drafts,
    { "email-neighbour": "Dear Mr Alvarez, I am writing to" },
  );
  ok("the attempt history is unioned regardless of which side won the drafts",
    mirrored.attempts["email-neighbour"].length === 1);

  // One-sided instant: only the device that cleared the draft has one.
  const oneSided = mergeCelpip(legacyWithDraft, afterSubmit);
  deepEqual("a side carrying an instant outranks a side carrying none", oneSided.drafts, {});
  deepEqual("commutative", mergeCelpip(afterSubmit, legacyWithDraft), oneSided);
  deepEqual(
    "and the legacy side's attempt history is still unioned in",
    oneSided.attempts["survey-transit"],
    [s1],
  );

  // The reverse role, so the rule above is not "the empty map always wins":
  // the instant-carrying side is the one HOLDING a draft.
  const holdsTheInstant = mergeCelpip(mkCelpip({ drafts: {} }), draftIsTheNewerOne);
  deepEqual(
    "an instant-carrying side that holds a draft supplies it",
    holdsTheInstant.drafts,
    { "email-neighbour": "Dear Mr Alvarez, I am writing to" },
  );

  // Neither side carries an instant: two pre-Phase-2 blobs. Values only, and
  // the order has to be TOTAL or the two sides keep picking their own copy.
  const legacyTie = mergeCelpip(legacyBiggerDrafts, legacySmallerDrafts);
  deepEqual("with no instant on either side the larger map wins", legacyTie.drafts, legacyBiggerDrafts.drafts);
  ok("no instant is fabricated", legacyTie.updatedAt === null);
  const sameKeysDifferentText = mergeCelpip(
    mkCelpip({ drafts: { "email-neighbour": "aaa" } }),
    mkCelpip({ drafts: { "email-neighbour": "zzz" } }),
  );
  ok(
    "two maps with identical keys but different text are still ranked, and the same way both ways round",
    celpipEqual(
      sameKeysDifferentText,
      mergeCelpip(
        mkCelpip({ drafts: { "email-neighbour": "zzz" } }),
        mkCelpip({ drafts: { "email-neighbour": "aaa" } }),
      ),
    ) && Object.keys(sameKeysDifferentText.drafts).length === 1,
  );
  // No key union anywhere near drafts: the losing side's exclusive key does
  // not survive, even though nothing about it conflicts with the winner's.
  const exclusiveEarlier = mkCelpip({
    drafts: { "email-neighbour": "only on the older device" },
    updatedAt: "2026-07-28T10:00:00.000Z",
  });
  const exclusiveLater = mkCelpip({
    drafts: { "survey-transit": "only on the newer device" },
    updatedAt: "2026-07-28T11:00:00.000Z",
  });
  deepEqual(
    "no key union near drafts: the losing side's exclusive key is gone",
    mergeCelpip(exclusiveEarlier, exclusiveLater).drafts,
    { "survey-transit": "only on the newer device" },
  );
}

group("CELPIP instant — the later of the two, never a fresh one");
{
  const merged = mergeCelpip(laptop, phoneCelpip);
  ok(
    "the merged instant is the later INPUT instant",
    merged.updatedAt === phoneCelpip.updatedAt,
    `updatedAt = ${String(merged.updatedAt)}`,
  );
  ok(
    "a merge of two instant-free blobs stays instant-free",
    mergeCelpip(legacyBiggerDrafts, legacySmallerDrafts).updatedAt === null,
  );
  ok(
    "the instant is one of the two inputs and never generated",
    mergeCelpip(beforeSubmit, afterSubmit).updatedAt === afterSubmit.updatedAt,
  );
}

group("CELPIP empty-literal parity");
deepEqual("progress-merge MERGE_CELPIP_EMPTY === progress-schema CELPIP_EMPTY", MERGE_CELPIP_EMPTY, CELPIP_EMPTY);
deepEqual(
  "field-for-field key parity",
  Object.keys(MERGE_CELPIP_EMPTY).sort(),
  Object.keys(CELPIP_EMPTY).sort(),
);

group("CELPIP totality — garbage on either side never throws");
{
  const celpipJunk: unknown[] = [
    null,
    undefined,
    "garbage",
    42,
    true,
    [1, 2, 3],
    {},
    { attempts: "nope", drafts: 7, updatedAt: 0 },
    { attempts: { "email-neighbour": "not an array" }, drafts: { k: 9 } },
    { attempts: { "email-neighbour": [null, 3, { taskId: "x" }] }, drafts: null },
    { speakingAttempts: "nope" },
    { speakingAttempts: [1, 2, 3] },
    { speakingAttempts: { [WINTER]: "not an array" } },
    { speakingAttempts: { [WINTER]: [null, 3, true, { promptId: "x" }, { date: "y" }] } },
    { speakingAttempts: { [WINTER]: [{ ...r1, durationSeconds: -5, sizeBytes: Number.NaN }] } },
    { speakingAttempts: { [WINTER]: [{ ...r1, shape: 42, mimeType: null, note: [] }] } },
    { listeningAttempts: "nope" },
    { listeningAttempts: [1, 2, 3] },
    { listeningAttempts: { [SET1]: "not an array" } },
    { listeningAttempts: { [SET1]: [null, 3, true, { setId: "x" }, { date: "y" }] } },
    { listeningAttempts: { [SET1]: [{ ...h1, correct: -5, total: Number.NaN }] } },
    { listeningAttempts: { [SET1]: [{ ...h1, answers: "not a map" }] } },
    { listeningAttempts: { [SET1]: [{ ...h1, answers: [0, 1, 2] }] } },
  ];
  for (const j of celpipJunk) {
    let merged: CelpipProgressState;
    try {
      merged = mergeCelpip(j, laptop);
    } catch (err) {
      ok(`mergeCelpip(${canon(j)}, laptop) does not throw`, false, String(err));
      continue;
    }
    ok(`mergeCelpip(${canon(j)}, laptop) does not throw`, true);
    deepEqual(
      `mergeCelpip(${canon(j)}, laptop) has exactly the contract's fields`,
      Object.keys(merged).sort(),
      Object.keys(CELPIP_EMPTY).sort(),
    );
    deepEqual(
      `mergeCelpip(${canon(j)}, laptop) preserves the readable side's history`,
      merged.attempts["email-neighbour"],
      [a1, a2],
    );
    deepEqual(
      `mergeCelpip(laptop, ${canon(j)}) is commutative with garbage too`,
      mergeCelpip(laptop, j),
      merged,
    );
  }
  // An attempt carrying a usable task type but NO identity — no submission
  // timestamp, or no task id. It has to be dropped rather than stored: the
  // de-duplication key is exactly that pair, so an entry without one cannot be
  // recognised as already present and would be appended again on every
  // reconcile, growing the column forever.
  const identityless = {
    attempts: {
      "email-neighbour": [
        { ...a1, date: "" },
        { ...a1, taskId: "" },
        { taskType: "email", text: "no id and no date" },
        a1,
      ],
    },
  };
  const kept = mergeCelpip(identityless, CELPIP_EMPTY);
  deepEqual(
    "an attempt with no natural key is dropped, not stored",
    kept.attempts["email-neighbour"],
    [a1],
  );
  ok(
    "so a repeat merge cannot append a second copy of it",
    mergeCelpip(kept, identityless).attempts["email-neighbour"].length === 1,
  );

  // Pre-existing gap found by mutation while adding the Speaking shape in
  // 02.1-01: NO writing fixture carried a non-boolean rubric value, so replacing
  // `boolRecord(v.checkedRubric)` in celpipAttemptEntry with a raw pass-through
  // produced zero failures. The map must be REBUILT from validated entries and
  // never spread from unvalidated input — that is what keeps a poisoned key or
  // a non-boolean value out of the stored history.
  const rawRubric = mergeCelpip(
    {
      attempts: {
        "email-neighbour": [
          {
            ...a1,
            date: "2026-07-31T11:00:00.000Z",
            checkedRubric: { "email-bullets": "true", "email-linkers": false, "email-tone": 1 },
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "a writing attempt's non-boolean rubric values are dropped, not stored",
    rawRubric.attempts["email-neighbour"][0].checkedRubric,
    { "email-linkers": false },
  );

  // ---- Poisoned record keys, on the MERGE side. ----
  //
  // Found by a listening assertion in 02.1-04 and PRE-EXISTING: progress-schema's
  // `sanitizeEntries` has skipped `__proto__`, `constructor` and `prototype`
  // since it was written, and none of the coercion functions in progress-merge
  // did. Nothing noticed, because every poisoned-key assertion in either script
  // exercised the ZOD path only.
  //
  // It is not merely untidy. `constructor` and `prototype` were assigned as
  // ordinary own keys by the merge and stripped by the schema, so the two halves
  // of one contract disagreed: the reconcile would find a difference, send it,
  // have it stripped server-side, and find the same difference on the next load
  // — a write on every authenticated page view, forever.
  const poisonedCelpip = mergeCelpip(
    JSON.parse(
      `{"drafts":{"__proto__":"x","constructor":"y","prototype":"z","survey-transit":"a real draft"},` +
        `"attempts":{"constructor":[],"prototype":[],"email-neighbour":${JSON.stringify([a1])}},` +
        `"speakingAttempts":{"constructor":[]},"listeningAttempts":{"prototype":[]}}`,
    ),
    CELPIP_EMPTY,
  );
  deepEqual(
    "poisoned draft keys are dropped by the merge, not just by the schema",
    Object.keys(poisonedCelpip.drafts).sort(),
    ["survey-transit"],
  );
  deepEqual(
    "poisoned attempt keys are dropped by the merge",
    Object.keys(poisonedCelpip.attempts).sort(),
    ["email-neighbour"],
  );
  deepEqual(
    "poisoned speaking keys are dropped by the merge",
    Object.keys(poisonedCelpip.speakingAttempts).sort(),
    [],
  );
  deepEqual(
    "poisoned listening keys are dropped by the merge",
    Object.keys(poisonedCelpip.listeningAttempts).sort(),
    [],
  );
  const poisonedRubric = mergeCelpip(
    {
      attempts: {
        "email-neighbour": [
          {
            ...a1,
            date: "2026-08-03T09:00:00.000Z",
            checkedRubric: JSON.parse('{"constructor":true,"email-bullets":true}'),
          },
        ],
      },
    },
    CELPIP_EMPTY,
  );
  deepEqual(
    "and a poisoned key inside a rubric map is dropped too",
    Object.keys(poisonedRubric.attempts["email-neighbour"][0].checkedRubric).sort(),
    ["email-bullets"],
  );
  ok(
    "no prototype was polluted along the way",
    ({} as Record<string, unknown>).polluted === undefined &&
      Object.getPrototypeOf(poisonedCelpip.drafts) === Object.prototype,
  );

  deepEqual("mergeCelpip({}, {}) is the CELPIP empty state", mergeCelpip({}, {}), CELPIP_EMPTY);
  ok(
    "celpipEqual treats an absent field as its default",
    celpipEqual(CELPIP_EMPTY, {}) && celpipEqual(CELPIP_EMPTY, null),
  );
  ok("celpipEqual still detects a real difference", !celpipEqual(laptop, phoneCelpip));
  ok(
    "celpipEqual ignores record key insertion order",
    celpipEqual(
      mkCelpip({ drafts: { a: "1", b: "2" } }),
      mkCelpip({ drafts: { b: "2", a: "1" } }),
    ),
  );
}

/* ================================================================== *
 * Scenario-shaped SRS keys (phase 03, D-06)
 *
 * The merge's per-entry rules cannot SEE a key — `unionRecord` hands
 * `mergeSrsItem` two values and nothing else — so the algebra provably
 * cannot change when the key space grows from `q-7` to
 * `social/small-talk#phrase#hows-it-going`. That is the argument. This
 * group is the evidence, because the argument is exactly the kind that
 * stays true right up until someone adds a key-aware special case.
 *
 * The fixtures are swept against EVERY existing state, not asserted in
 * isolation: the point is not that scenario keys merge with scenario
 * keys, it is that they merge with the grammar keys, the malformed
 * entries and the empty state that were already here — which is what
 * a learner's real blob looks like the day after this phase ships.
 *
 * Ids are composed by `scenarioItemId` and never spelled by hand, here
 * least of all: a harness that hard-codes the format is a harness that
 * keeps passing after the format changes.
 * ================================================================== */

group("scenario keys — fixtures");

const SMALL_TALK_PHRASE = scenarioItemId(
  "social/small-talk",
  "phrase",
  "hows-it-going",
);
const SMALL_TALK_VOCAB = scenarioItemId(
  "social/small-talk",
  "vocab",
  "break-the-ice",
);
const AIRPORT_PHRASE = scenarioItemId(
  "travel/airport",
  "phrase",
  "check-this-bag",
);

ok(
  "the composed key carries the slash that keeps it disjoint from `q-7`",
  SMALL_TALK_PHRASE.includes("/") && !SMALL_TALK_PHRASE.startsWith("q-"),
  SMALL_TALK_PHRASE,
);

// The phone: she rated the small-talk phrase "Not yet" this morning (box 0,
// due today, unresolved) and got the vocabulary card right (box 2).
const scenarioPhone = mk({
  lastActive: "2026-07-28",
  updatedAt: "2026-07-28T09:15:00.000Z",
  srs: {
    [SMALL_TALK_PHRASE]: { box: 0, due: "2026-07-28" },
    [SMALL_TALK_VOCAB]: { box: 2, due: "2026-08-01" },
  },
  attempts: {
    [SMALL_TALK_PHRASE]: {
      topic: "Small talk & breaking the ice",
      level: "B1",
      tries: 3,
      wrong: 2,
      resolved: false,
      updatedAt: "2026-07-28",
    },
    [SMALL_TALK_VOCAB]: {
      topic: "Small talk & breaking the ice",
      level: "B1",
      tries: 2,
      wrong: 0,
      resolved: true,
      updatedAt: "2026-07-28",
    },
  },
});

// The laptop, offline for a week: THE SAME phrase at a different box and a
// different due date — the case the plan names — plus a scenario the phone
// has never seen.
const scenarioLaptop = mk({
  lastActive: "2026-07-21",
  updatedAt: "2026-07-21T20:00:00.000Z",
  srs: {
    [SMALL_TALK_PHRASE]: { box: 4, due: "2026-08-20" },
    [AIRPORT_PHRASE]: { box: 1, due: "2026-07-23" },
  },
  attempts: {
    [SMALL_TALK_PHRASE]: {
      topic: "Small talk & breaking the ice",
      level: "B1",
      tries: 2,
      wrong: 0,
      resolved: true,
      updatedAt: "2026-07-21",
    },
    [AIRPORT_PHRASE]: {
      topic: "At the airport",
      level: "A2",
      tries: 1,
      wrong: 1,
      resolved: false,
      lastWrongOption: 1,
      updatedAt: "2026-07-21",
    },
  },
});

// Both key spaces in one blob, which is what every real account holds: a
// global grammar id next to a composite one.
const scenarioAndGrammar = mk({
  lastActive: "2026-07-27",
  updatedAt: "2026-07-27T12:00:00.000Z",
  srs: {
    "q-1": { box: 1, due: "2026-07-30" },
    [SMALL_TALK_VOCAB]: { box: 0, due: "2026-07-27" },
    [AIRPORT_PHRASE]: { box: 3, due: "2026-08-09" },
  },
  attempts: {
    "q-1": {
      topic: "Tenses",
      tries: 2,
      wrong: 1,
      resolved: false,
      lastWrongOption: 0,
      updatedAt: "2026-07-27",
    },
    [SMALL_TALK_VOCAB]: {
      topic: "Small talk & breaking the ice",
      level: "B1",
      tries: 4,
      wrong: 2,
      resolved: false,
      updatedAt: "2026-07-27",
    },
  },
});

// A composite key in `srs` with no paired stat — the shape a key union can
// always produce, now in the new key space too.
const scenarioSrsWithoutStat = mk({
  lastActive: "2026-07-24",
  srs: { [SMALL_TALK_PHRASE]: { box: 2, due: "2026-08-02" } },
});

const scenarioStates: Array<[string, ProgressState]> = [
  ["scenarioPhone", scenarioPhone],
  ["scenarioLaptop", scenarioLaptop],
  ["scenarioAndGrammar", scenarioAndGrammar],
  ["scenarioSrsWithoutStat", scenarioSrsWithoutStat],
];

// Swept against everything above, not against each other.
const allStates: Array<[string, ProgressState]> = [
  ...states,
  ...scenarioStates,
];

group("scenario keys — idempotence");
for (const [na, a] of allStates) {
  for (const [nb, b] of allStates) {
    const once = mergeProgress(a, b);
    deepEqual(
      `idempotent: merge(${na}, merge(${na}, ${nb}))`,
      mergeProgress(a, once),
      once,
    );
  }
}

group("scenario keys — commutativity");
for (const [na, a] of allStates) {
  for (const [nb, b] of allStates) {
    deepEqual(
      `commutative: ${na} <-> ${nb}`,
      mergeProgress(a, b),
      mergeProgress(b, a),
    );
  }
}

group("scenario keys — associativity");
for (const [na, a] of allStates) {
  for (const [nb, b] of allStates) {
    for (const [nc, c] of allStates) {
      deepEqual(
        `associative: (${na}·${nb})·${nc} = ${na}·(${nb}·${nc})`,
        mergeProgress(mergeProgress(a, b), c),
        mergeProgress(a, mergeProgress(b, c)),
      );
    }
  }
}

group("scenario keys — the union neither drops nor invents one");
{
  const merged = mergeProgress(scenarioPhone, scenarioLaptop);
  const expected = [
    SMALL_TALK_PHRASE,
    SMALL_TALK_VOCAB,
    AIRPORT_PHRASE,
  ].sort();
  deepEqual(
    "every composite key from both sides survives, and only those",
    Object.keys(merged.srs).sort(),
    expected,
  );
  deepEqual(
    "the same holds for the paired attempts map",
    Object.keys(merged.attempts).sort(),
    expected,
  );
  ok(
    "a composite key is never split on its separators",
    Object.keys(merged.srs).every((k) => k === "q-1" || k.split("#").length === 3),
    canon(Object.keys(merged.srs)),
  );
}

group("scenario keys — the same item at two boxes and two due dates");
{
  const merged = mergeProgress(scenarioPhone, scenarioLaptop);
  // The just-failed entry (box 0, due today) is the smallest possible pair, so
  // it beats the stale box-4 success outright — and it moves as a UNIT.
  deepEqual(
    "the earlier due wins, box and due together",
    merged.srs[SMALL_TALK_PHRASE],
    { box: 0, due: "2026-07-28" },
  );
  ok(
    "the surviving pair is one of the two inputs, never a blend",
    merged.srs[SMALL_TALK_PHRASE].box === 0 &&
      merged.srs[SMALL_TALK_PHRASE].due === "2026-07-28",
    canon(merged.srs[SMALL_TALK_PHRASE]),
  );
  // The other direction of the same key, so the mistake notebook cannot be
  // cleared by a stale device.
  ok(
    "an unresolved composite stat is not resurrected as resolved",
    merged.attempts[SMALL_TALK_PHRASE].resolved === false,
    canon(merged.attempts[SMALL_TALK_PHRASE]),
  );
  deepEqual(
    "the scenario title travels with the stat, so weakTopics still groups",
    merged.attempts[SMALL_TALK_PHRASE].topic,
    "Small talk & breaking the ice",
  );
}

group("scenario keys — the two key spaces do not interfere");
{
  // `account` also holds q-1, at an EARLIER due (2026-07-29) — so the grammar
  // rule picks account's pair, exactly as it would with no composite key in
  // sight. Asserted against the literal value rather than "one of the two", so
  // a rule that started reading its neighbours could not hide here.
  const merged = mergeProgress(scenarioAndGrammar, account);
  deepEqual(
    "the grammar entry merges by its own rule, untouched by its neighbours",
    merged.srs["q-1"],
    { box: 2, due: "2026-07-29" },
  );
  ok(
    "and the composite entries are all still there",
    merged.srs[SMALL_TALK_VOCAB] !== undefined &&
      merged.srs[AIRPORT_PHRASE] !== undefined,
    canon(Object.keys(merged.srs)),
  );
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-merge: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-merge: all ${checks} assertions passed.`);
