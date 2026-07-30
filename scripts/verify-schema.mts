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
  CELPIP_EMPTY,
  CELPIP_MAX_TEXT,
  CELPIP_SCHEMA_MATCHES_STATE,
  EMPTY,
  SCHEMA_MATCHES_STATE,
  celpipProgressSchema,
  progressSchema,
  safeReadCelpip,
  safeReadProgress,
  sanitizedRecord,
  type CelpipAttempt,
  type CelpipProgressState,
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

  const withoutInstant: Record<string, unknown> = { ...full };
  delete withoutInstant.updatedAt;
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

/* ================================================================== *
 * 10-16. The CELPIP domain (D-04, D-05).
 *
 * The same contract, applied to the store Phase 1 built in the browser
 * and this phase moves into its own Postgres column. Two shapes differ
 * from the progress side and both are proven below: attempts are an
 * ARRAY per task (so one malformed attempt must cost only itself, not
 * the task's history), and the payload is the only one carrying
 * free-form learner prose (so it is the only one that needs a length
 * bound).
 * ================================================================== */

/** An attempt exactly as WritingSimulator records it. */
const attempt: CelpipAttempt = {
  taskId: "email-neighbour",
  taskType: "email",
  date: "2026-07-27T18:04:11.000Z",
  durationSeconds: 1500,
  wordCount: 168,
  text: "Dear Mr Alvarez, I am writing about the noise from the building work.",
  checkedRubric: { "content-1": true, "tone-2": false },
  outOfTime: false,
};

const olderAttempt: CelpipAttempt = {
  ...attempt,
  date: "2026-07-25T08:30:00.000Z",
  durationSeconds: 1800,
  wordCount: 151,
  text: "Dear Mr Alvarez, I would like to raise the matter of the noise.",
  outOfTime: true,
};

const surveyAttempt: CelpipAttempt = {
  taskId: "survey-transit",
  taskType: "survey",
  date: "2026-07-26T12:00:00.000Z",
  durationSeconds: 1620,
  wordCount: 190,
  text: "I believe the city should invest in the bus network first.",
  checkedRubric: {},
  outOfTime: false,
};

const celpipFull: CelpipProgressState = {
  attempts: {
    "email-neighbour": [olderAttempt, attempt],
    "survey-transit": [surveyAttempt],
  },
  drafts: { "survey-transit": "In my opinion the current schedule is" },
  updatedAt: INSTANT,
};

/** Parses through the CELPIP write-path schema, failing the run rather than
 * throwing when a payload that should have been accepted was not. */
function acceptCelpip(label: string, payload: unknown): CelpipProgressState {
  const parsed = celpipProgressSchema.safeParse(payload);
  ok(`${label} — accepted`, parsed.success);
  return parsed.success ? parsed.data : CELPIP_EMPTY;
}

group("CELPIP D-08 — unknown fields are stripped, known fields are saved");
{
  const parsed = acceptCelpip("a CELPIP payload carrying an unknown field", {
    ...celpipFull,
    // The shape a browser on a cached older bundle would send.
    lastActive: "2026-07-27",
    experiment: { nested: [1, 2, 3] },
  });
  deepEqual("every known CELPIP field survives untouched", parsed, celpipFull);
  deepEqual(
    "the accepted key set is exactly the CELPIP contract",
    Object.keys(parsed).sort(),
    Object.keys(CELPIP_EMPTY).sort(),
  );
  ok(
    "an unknown field inside an attempt is stripped too",
    !(
      "score" in
      (acceptCelpip("an attempt with an extra field", {
        ...celpipFull,
        attempts: { "email-neighbour": [{ ...attempt, score: 9 }] },
      }).attempts["email-neighbour"][0] as unknown as Record<string, unknown>)
    ),
  );
}

group("CELPIP attempts — one malformed attempt costs only itself");
{
  const parsed = acceptCelpip("a task array holding one good and three bad attempts", {
    ...celpipFull,
    attempts: {
      "email-neighbour": [
        attempt,
        { ...attempt, taskType: "essay" }, // not a CELPIP writing task type
        { ...attempt, date: 1_753_000_000_000 }, // a number where the ISO date belongs
        "nope",
      ],
      "survey-transit": [surveyAttempt],
    },
  });
  deepEqual(
    "the well-formed attempt survives alone",
    parsed.attempts["email-neighbour"],
    [attempt],
  );
  ok(
    "the rest of the task's history is untouched",
    canon(parsed.attempts["survey-transit"]) === canon([surveyAttempt]),
  );
  ok(
    "no placeholder attempt is fabricated for a dropped entry",
    parsed.attempts["email-neighbour"].length === 1,
  );

  const notAnArray = acceptCelpip("a task whose attempts value is not an array", {
    ...celpipFull,
    attempts: { "email-neighbour": { 0: attempt }, "survey-transit": [surveyAttempt] },
  });
  ok(
    "a non-array task value is dropped rather than coerced to an empty history",
    !("email-neighbour" in notAnArray.attempts),
  );
  deepEqual("its sibling survives", notAnArray.attempts["survey-transit"], [surveyAttempt]);

  const junkMap = acceptCelpip("an attempts field that is not an object at all", {
    ...celpipFull,
    attempts: "everything",
  });
  deepEqual("the whole map falls back to empty", junkMap.attempts, {});
  deepEqual("and its neighbours are untouched", junkMap.drafts, celpipFull.drafts);

  const poisoned = acceptCelpip("poisoned keys in the CELPIP records", {
    ...celpipFull,
    attempts: JSON.parse(
      `{"__proto__":[],"constructor":[],"survey-transit":${JSON.stringify([surveyAttempt])}}`,
    ) as Record<string, unknown>,
    drafts: JSON.parse('{"__proto__":"x","survey-transit":"ok"}') as Record<string, unknown>,
  });
  deepEqual("poisoned attempt keys are dropped", Object.keys(poisoned.attempts).sort(), [
    "survey-transit",
  ]);
  deepEqual("poisoned draft keys are dropped", Object.keys(poisoned.drafts).sort(), [
    "survey-transit",
  ]);
}

group("CELPIP bounds — free-form prose cannot grow the column without bound");
{
  const huge = "x".repeat(CELPIP_MAX_TEXT + 1);
  const parsed = acceptCelpip("an attempt whose essay text exceeds the cap", {
    ...celpipFull,
    attempts: { "email-neighbour": [attempt, { ...attempt, date: "2026-07-28T00:00:00.000Z", text: huge }] },
  });
  deepEqual(
    "the over-length attempt is rejected as an entry, not stored",
    parsed.attempts["email-neighbour"],
    [attempt],
  );

  const atTheCap = acceptCelpip("an attempt exactly at the cap", {
    ...celpipFull,
    attempts: {
      "email-neighbour": [{ ...attempt, text: "y".repeat(CELPIP_MAX_TEXT) }],
    },
  });
  ok(
    "an essay exactly at the cap is still accepted",
    atTheCap.attempts["email-neighbour"].length === 1,
  );

  const draft = acceptCelpip("a draft exceeding the cap", {
    ...celpipFull,
    drafts: { "survey-transit": huge, "email-neighbour": "short enough" },
  });
  deepEqual("the over-length draft is dropped, its neighbour survives", draft.drafts, {
    "email-neighbour": "short enough",
  });
}

group("CELPIP PROG-03 — a corrupt stored blob loads as the empty state");
{
  const corrupt = ["{not json at all", "", "null", "42", '"a string"', "[]", '{"attempts":', " "];
  for (const raw of corrupt) {
    let threw = false;
    let out: CelpipProgressState = celpipFull;
    try {
      out = safeReadCelpip(raw);
    } catch {
      threw = true;
    }
    ok(`safeReadCelpip never throws on ${JSON.stringify(raw).slice(0, 24)}`, !threw);
    deepEqual(
      `safeReadCelpip yields the empty state for ${JSON.stringify(raw).slice(0, 24)}`,
      out,
      CELPIP_EMPTY,
    );
  }
  deepEqual("an absent CELPIP blob reads as the empty state", safeReadCelpip(null), CELPIP_EMPTY);
  deepEqual(
    "an undefined CELPIP blob reads as the empty state",
    safeReadCelpip(undefined),
    CELPIP_EMPTY,
  );
  deepEqual(
    "a well-formed CELPIP blob round-trips",
    safeReadCelpip(JSON.stringify(celpipFull)),
    celpipFull,
  );
  deepEqual(
    "a partially-corrupt CELPIP blob keeps everything it can",
    safeReadCelpip(
      JSON.stringify({
        ...celpipFull,
        drafts: 7,
        attempts: { "email-neighbour": [attempt, null], "survey-transit": [surveyAttempt] },
      }),
    ),
    {
      attempts: { "email-neighbour": [attempt], "survey-transit": [surveyAttempt] },
      drafts: {},
      updatedAt: INSTANT,
    },
  );
}

group("CELPIP D-01b — the millisecond instant round-trips");
{
  ok(
    "a well-formed instant survives the strip",
    acceptCelpip("a well-formed CELPIP instant", celpipFull).updatedAt === INSTANT,
  );
  for (const bad of ["2026-07-28", "2026-07-28T09:15:42Z", "not a date", 42]) {
    ok(
      `a malformed CELPIP instant falls back to null: ${canon(bad)}`,
      acceptCelpip("a malformed CELPIP instant", { ...celpipFull, updatedAt: bad }).updatedAt ===
        null,
    );
  }
  // The Phase 1 shape, exactly as it sits in localStorage today: two maps and
  // no instant at all. It must PARSE (not fail) and read as null, which the
  // merge ranks below any side that carries one.
  const phase1Blob = { attempts: { "survey-transit": [surveyAttempt] }, drafts: {} };
  const parsed = acceptCelpip("a Phase 1 blob with no instant at all", phase1Blob);
  ok("it parses to a null instant rather than failing", parsed.updatedAt === null);
  deepEqual("and its history is preserved", parsed.attempts, phase1Blob.attempts);
  ok(
    "a Phase 1 blob read through the safe helper behaves the same",
    safeReadCelpip(JSON.stringify(phase1Blob)).updatedAt === null,
  );
}

group("CELPIP rejection and drift guard");
{
  for (const bad of [42, "celpip", null, undefined, true, [], [1, 2, 3]]) {
    ok(`CELPIP rejected: ${canon(bad)}`, !celpipProgressSchema.safeParse(bad).success);
  }
  ok(
    "an empty object is ACCEPTED and fills in from the defaults",
    celpipProgressSchema.safeParse({}).success,
  );
  deepEqual(
    "an empty object parses to the CELPIP empty state",
    celpipProgressSchema.parse({}),
    CELPIP_EMPTY,
  );
  ok(
    "the CELPIP schema output type is asserted identical to CelpipProgressState",
    CELPIP_SCHEMA_MATCHES_STATE === true,
  );
  deepEqual(
    "CELPIP_EMPTY itself satisfies the schema unchanged",
    celpipProgressSchema.parse(CELPIP_EMPTY),
    CELPIP_EMPTY,
  );
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-schema: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-schema: all ${checks} assertions passed.`);
