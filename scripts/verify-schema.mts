// Executable proof of the progress contract (D-08, PROG-03).
//
//   node --experimental-strip-types scripts/verify-schema.mts
//
// Same posture as scripts/verify-merge.mts: no test runner and no new
// dependency. src/lib/progress-schema.ts carries exactly one runtime import
// (zod, already a direct dependency), no react, no next and no `@/` aliases, so
// node can load it directly. Imports carry explicit .ts extensions because path
// aliases only resolve inside the bundler. `.mts` rather than `.ts` so node does
// not warn about a typeless package; tsconfig.json already includes **/*.mts,
// so `npx tsc --noEmit` type-checks this file too.
//
// What is being proven here is a policy, not just a shape: writes are LENIENT
// (strip what we do not know, recover a field we do know but cannot read, drop
// a single malformed record entry) and refuse only a payload that is not an
// object at all; reads of STORED data are lenient to the point of never
// throwing. If an assertion here exposes a real defect, fix the module — never
// weaken the assertion.

import { z } from "zod";
import {
  EMPTY,
  SCHEMA_MATCHES_STATE,
  progressSchema,
  safeReadProgress,
  sanitizedRecord,
  type ProgressState,
} from "../src/lib/progress-schema.ts";

/* ------------------------------------------------------------------ *
 * Harness (mirrors scripts/verify-merge.mts)
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

/** Parses through the write-path schema, failing the run rather than throwing
 * when a payload that should have been accepted was not. */
function accept(label: string, payload: unknown): ProgressState {
  const parsed = progressSchema.safeParse(payload);
  ok(`${label} — accepted`, parsed.success);
  return parsed.success ? parsed.data : EMPTY;
}

/* ------------------------------------------------------------------ *
 * Fixtures
 * ------------------------------------------------------------------ */

const INSTANT = "2026-07-28T09:15:42.123Z";

/** Every known field, all well-formed. */
const full: ProgressState = {
  completed: { "airport/check-in": true },
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
      level: "B1",
      tries: 3,
      wrong: 1,
      resolved: true,
      lastWrongOption: 2,
      updatedAt: "2026-07-26",
    },
  },
  todayXp: 20,
  xpDay: "2026-07-26",
  goalXp: 30,
  updatedAt: INSTANT,
};

/* ------------------------------------------------------------------ *
 * 1. D-08: strip unknown fields, save the rest.
 * ------------------------------------------------------------------ */

group("D-08 — unknown fields are stripped, known fields are saved");
{
  const fromAnOlderBuild = {
    ...full,
    // A field this build has never heard of, sent by a browser holding a
    // cached older bundle. Rejecting the payload would stop that learner
    // saving until they hard-refresh — the option the user turned down.
    favouriteColour: "vermilion",
    experiment: { nested: [1, 2, 3] },
  };
  const parsed = accept("a payload carrying two unknown fields", fromAnOlderBuild);
  deepEqual("every known field survives untouched", parsed, full);
  ok(
    "the unknown fields are gone",
    !("favouriteColour" in parsed) && !("experiment" in parsed),
    `keys: ${Object.keys(parsed).sort().join(",")}`,
  );
  deepEqual(
    "the accepted key set is exactly the contract",
    Object.keys(parsed).sort(),
    Object.keys(EMPTY).sort(),
  );
}

/* ------------------------------------------------------------------ *
 * 2. A bad value costs only its own field.
 * ------------------------------------------------------------------ */

group("per-field recovery — one bad value never costs the whole save");
{
  const parsed = accept("xp sent as a string", { ...full, xp: "1200" });
  ok("xp falls back to its default", parsed.xp === 0, `xp = ${String(parsed.xp)}`);
  deepEqual("every other field is preserved", { ...parsed, xp: full.xp }, full);

  const many = accept("four fields sent badly at once", {
    ...full,
    xp: null,
    streak: {},
    level: 42,
    lastActive: "yesterday",
  });
  ok("xp recovered", many.xp === 0);
  ok("streak recovered", many.streak === 0);
  ok("level recovered", many.level === null);
  ok("lastActive recovered", many.lastActive === null);
  ok("goalXp untouched by its neighbours", many.goalXp === 30);
  deepEqual("the record fields are still intact", many.srs, full.srs);
}

/* ------------------------------------------------------------------ *
 * 3. Record sanitisation — drop the bad entry, keep the good one.
 * ------------------------------------------------------------------ */

group("record sanitisation — one malformed entry is dropped, its neighbours survive");
{
  const parsed = accept("an srs map holding one good and three bad entries", {
    ...full,
    srs: {
      "q-good": { box: 2, due: "2026-07-29" },
      "q-nan": { box: "two", due: "2026-07-29" },
      "q-day": { box: 2, due: "next tuesday" },
      "q-not-an-object": "nope",
    },
  });
  deepEqual(
    "only the well-formed entry survives",
    parsed.srs,
    { "q-good": { box: 2, due: "2026-07-29" } },
  );
  ok(
    "no placeholder is fabricated for a dropped key",
    !("q-nan" in parsed.srs) && !("q-day" in parsed.srs) && !("q-not-an-object" in parsed.srs),
  );

  const attempts = accept("an attempts map with one malformed entry", {
    ...full,
    attempts: {
      ...full.attempts,
      "q-bad": { topic: "Tenses", tries: -1, wrong: 0, resolved: true, updatedAt: "2026-07-26" },
    },
  });
  deepEqual("the well-formed attempt survives alone", attempts.attempts, full.attempts);

  const flags = accept("a completed map with a non-true value", {
    ...full,
    completed: { "airport/check-in": true, "airport/security": "yes" },
  });
  deepEqual("only the true-valued completion survives", flags.completed, {
    "airport/check-in": true,
  });

  const skills = accept("a skillXp map with a negative value", {
    ...full,
    skillXp: { grammar: 60, reading: -5 },
  });
  deepEqual("the negative skill is dropped, the valid one kept", skills.skillXp, {
    grammar: 60,
  });

  // The exported helper, used directly.
  const numbers = sanitizedRecord(z.number().int()).parse({ a: 1, b: "x", c: 2.5, d: 3 });
  deepEqual("sanitizedRecord keeps only entries that parse", numbers, { a: 1, d: 3 });
  deepEqual("sanitizedRecord maps a non-object to an empty record", sanitizedRecord(z.number()).parse(42), {});
  deepEqual("sanitizedRecord maps an absent value to an empty record", sanitizedRecord(z.number()).parse(undefined), {});
}

/* ------------------------------------------------------------------ *
 * 4. Prototype-poisoning keys are dropped, not assigned.
 * ------------------------------------------------------------------ */

group("prototype pollution — poisoned record keys are dropped");
{
  // JSON.parse creates `__proto__` as a real OWN property, so Object.entries
  // does enumerate it: the filter is load-bearing, not decorative.
  const raw = JSON.parse(
    '{"srs":{"__proto__":{"box":1,"due":"2026-07-28"},' +
      '"constructor":{"box":1,"due":"2026-07-28"},' +
      '"prototype":{"box":1,"due":"2026-07-28"},' +
      '"q-ok":{"box":1,"due":"2026-07-28"}}}',
  ) as Record<string, unknown>;
  ok(
    "the fixture really does carry an own __proto__ key",
    Object.keys(raw.srs as object).includes("__proto__"),
  );

  const parsed = accept("a payload with poisoned record keys", raw);
  deepEqual(
    "every poisoned key is dropped and the honest one survives",
    Object.keys(parsed.srs).sort(),
    ["q-ok"],
  );
  ok(
    "the sanitised record keeps a clean prototype",
    Object.getPrototypeOf(parsed.srs) === Object.prototype,
  );
  ok(
    "no global prototype was polluted",
    (Object.prototype as unknown as Record<string, unknown>).box === undefined,
  );

  const vocab = accept("poisoned keys in a flag record", {
    ...full,
    vocab: JSON.parse('{"__proto__":true,"card-a":true}') as Record<string, unknown>,
  });
  deepEqual("the flag record is sanitised too", vocab.vocab, { "card-a": true });
}

/* ------------------------------------------------------------------ *
 * 5. A payload that is not an object at all is rejected (the only 400).
 * ------------------------------------------------------------------ */

group("rejection — only a non-object body fails validation");
{
  for (const bad of [42, "progress", null, undefined, true, [], [1, 2, 3]]) {
    ok(
      `rejected: ${canon(bad)}`,
      !progressSchema.safeParse(bad).success,
    );
  }
  ok("an empty object is ACCEPTED and fills in from the defaults", progressSchema.safeParse({}).success);
  deepEqual("an empty object parses to the empty state", progressSchema.parse({}), EMPTY);
}

/* ------------------------------------------------------------------ *
 * 6. PROG-03: reading STORED data never throws.
 * ------------------------------------------------------------------ */

group("PROG-03 — a corrupt stored blob loads as the empty state");
{
  const corrupt = [
    "{not json at all",
    "",
    "null",
    "42",
    '"a string"',
    "[]",
    '{"xp":',
    " ",
  ];
  for (const raw of corrupt) {
    let threw = false;
    let out: ProgressState = EMPTY;
    try {
      out = safeReadProgress(raw);
    } catch {
      threw = true;
    }
    ok(`safeReadProgress never throws on ${JSON.stringify(raw).slice(0, 24)}`, !threw);
    deepEqual(`safeReadProgress yields the empty state for ${JSON.stringify(raw).slice(0, 24)}`, out, EMPTY);
  }
  deepEqual("an absent blob reads as the empty state", safeReadProgress(null), EMPTY);
  deepEqual("an undefined blob reads as the empty state", safeReadProgress(undefined), EMPTY);
  deepEqual("a well-formed blob round-trips", safeReadProgress(JSON.stringify(full)), full);
  deepEqual(
    "a partially-corrupt blob keeps everything it can",
    safeReadProgress(JSON.stringify({ ...full, xp: "lots", srs: { bad: 1 } })),
    { ...full, xp: 0, srs: {} },
  );
}

/* ------------------------------------------------------------------ *
 * 7. Numeric bounds and day shapes.
 * ------------------------------------------------------------------ */

group("bounds — negatives, non-integers and non-day strings fall back");
{
  const parsed = accept("out-of-range numerics", {
    ...full,
    xp: -1,
    streak: 2.5,
    todayXp: Number.NaN,
    goalXp: Number.POSITIVE_INFINITY,
  });
  ok("a negative xp falls back", parsed.xp === 0);
  ok("a fractional streak falls back", parsed.streak === 0);
  ok("NaN falls back", parsed.todayXp === 0);
  ok("Infinity falls back to the 30 XP default goal", parsed.goalXp === 30);

  const days = accept("non-day strings in day fields", {
    ...full,
    lastActive: "2026-7-6",
    xpDay: "26-07-2026",
  });
  ok("a loosely-formatted lastActive falls back to null", days.lastActive === null);
  ok("a reordered xpDay falls back to null", days.xpDay === null);

  const dueShape = accept("an srs entry whose due is not day-shaped", {
    ...full,
    srs: { "q-1": { box: 1, due: "2026-07-29T00:00:00.000Z" } },
  });
  deepEqual("the entry is dropped rather than kept with an unusable due", dueShape.srs, {});
}

/* ------------------------------------------------------------------ *
 * 8. D-01b: the activity instant round-trips.
 * ------------------------------------------------------------------ */

group("D-01b — the millisecond instant survives the schema");
{
  const kept = accept("a well-formed instant", { ...full, updatedAt: INSTANT });
  ok(
    "the instant is declared by the schema and survives the strip",
    kept.updatedAt === INSTANT,
    `updatedAt = ${String(kept.updatedAt)}`,
  );

  const generated = new Date().toISOString();
  ok(
    "the instant nowInstant() actually produces is accepted",
    accept("a freshly generated instant", { ...full, updatedAt: generated }).updatedAt === generated,
  );

  for (const bad of ["2026-07-28", "2026-07-28T09:15:42Z", "not a date", 1_753_700_000_000]) {
    ok(
      `a malformed instant falls back to null: ${canon(bad)}`,
      accept("a malformed instant", { ...full, updatedAt: bad }).updatedAt === null,
    );
  }
  // Seconds-precision is refused on purpose: laterInstant compares instants
  // LEXICALLY, and "…:42Z" > "…:42.500Z" because "Z" outranks ".". Admitting a
  // second-precision instant would silently invert the D-01b ordering.
  ok(
    "a second-precision instant would have compared wrongly, and is refused",
    "2026-07-28T09:15:42Z" > "2026-07-28T09:15:42.500Z",
  );

  const { updatedAt: _dropped, ...withoutInstant } = full;
  ok(
    "a payload written before this phase parses with a null instant",
    accept("a payload with no instant at all", withoutInstant).updatedAt === null,
  );
}

/* ------------------------------------------------------------------ *
 * 9. The compile-time drift guard is armed.
 * ------------------------------------------------------------------ */

group("drift guard");
{
  ok("the schema output type is asserted identical to ProgressState", SCHEMA_MATCHES_STATE === true);
  deepEqual("EMPTY itself satisfies the schema unchanged", progressSchema.parse(EMPTY), EMPTY);
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-schema: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-schema: all ${checks} assertions passed.`);
