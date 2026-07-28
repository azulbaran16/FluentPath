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
import { EMPTY, type ProgressState } from "../src/lib/progress-schema.ts";

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

const states: Array<[string, ProgressState]> = [
  ["account", account],
  ["anonymous", anonymous],
  ["phone", phone],
  ["legacy", legacy],
  ["EMPTY", EMPTY],
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
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-merge: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-merge: all ${checks} assertions passed.`);
