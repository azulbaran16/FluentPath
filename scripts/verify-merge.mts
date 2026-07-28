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
  MERGE_EMPTY,
  mergeProgress,
  progressEqual,
} from "../src/lib/progress-merge.ts";
import {
  EMPTY,
  type AttemptStat,
  type ProgressState,
  type SrsItem,
} from "../src/lib/progress-schema.ts";

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

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-merge: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-merge: all ${checks} assertions passed.`);
