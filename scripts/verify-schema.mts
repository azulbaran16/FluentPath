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
  CELPIP_MAX_OPTION_INDEX,
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
  type CelpipListeningAttempt,
  type CelpipProgressState,
  type CelpipSpeakingAttempt,
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

/** A rehearsal exactly as SpeakingRecorder records it. Note what is NOT on it:
 * the recording. Four facts about the audio are stored and the bytes are not. */
const speakingAttempt: CelpipSpeakingAttempt = {
  promptId: "speaking-advice-first-winter",
  date: "2026-07-28T07:41:09.000Z",
  shape: "advice",
  durationSeconds: 148,
  recorded: true,
  recordingSeconds: 90,
  mimeType: "audio/webm;codecs=opus",
  sizeBytes: 341_882,
  checkedRubric: { "speaking-did-the-task": true, "speaking-used-the-window": false },
  outOfTime: false,
  note: "Started too slowly — spent the first fifteen seconds restating the scenario.",
};

/** A Listening result exactly as the player will record it. Note what is NOT on
 * it: the learner's notes. Those live in React state and die with the set —
 * persisting them would put a second deletable map on the one shared instant
 * that `drafts` already rides. */
const listeningAttempt: CelpipListeningAttempt = {
  setId: "listening-set-1",
  date: "2026-07-29T15:12:44.000Z",
  durationSeconds: 2_640,
  answers: { "l1-q1": 2, "l1-q2": 0, "l3-q4": 3 },
  correct: 29,
  total: 37,
  replays: 0,
  audioFailed: false,
  outOfTime: false,
};

const celpipFull: CelpipProgressState = {
  attempts: {
    "email-neighbour": [olderAttempt, attempt],
    "survey-transit": [surveyAttempt],
  },
  drafts: { "survey-transit": "In my opinion the current schedule is" },
  speakingAttempts: { "speaking-advice-first-winter": [speakingAttempt] },
  listeningAttempts: { "listening-set-1": [listeningAttempt] },
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

group("CELPIP speaking — a new skill's attempts obey the same per-entry rules");
{
  // THE ADDITIVITY CASE, and the one that matters most today: the beta user's
  // stored row was written before this phase and has no `speakingAttempts` key
  // at all. It must parse to an empty record rather than failing the payload or
  // leaving the field undefined.
  const legacyBlob = {
    attempts: { "survey-transit": [surveyAttempt] },
    drafts: {},
    updatedAt: INSTANT,
  };
  const legacy = acceptCelpip("a stored blob with speakingAttempts absent entirely", legacyBlob);
  deepEqual("the absent field recovers to an empty record", legacy.speakingAttempts, {});
  deepEqual("and the writing history it does carry is untouched", legacy.attempts, legacyBlob.attempts);
  ok(
    "read through the safe helper it behaves the same",
    canon(safeReadCelpip(JSON.stringify(legacyBlob)).speakingAttempts) === "{}",
  );

  const parsed = acceptCelpip("a prompt array holding one good and three bad rehearsals", {
    ...celpipFull,
    speakingAttempts: {
      "speaking-advice-first-winter": [
        speakingAttempt,
        { ...speakingAttempt, date: 1_753_000_000_000 }, // a number where the ISO date belongs
        { ...speakingAttempt, recorded: "yes" }, // a string where the flag belongs
        "nope",
      ],
    },
  });
  deepEqual(
    "the well-formed rehearsal survives alone",
    parsed.speakingAttempts["speaking-advice-first-winter"],
    [speakingAttempt],
  );

  // The regression guard for the enum trap, at the SCHEMA end. `shape` is a
  // bounded string, so a shape this build has never heard of must still
  // validate — a ninth exam task shape added to the content module cannot make
  // an already-stored attempt unreadable.
  const unknownShape = acceptCelpip("a rehearsal whose shape this build does not know", {
    ...celpipFull,
    speakingAttempts: {
      "speaking-future-shape": [{ ...speakingAttempt, shape: "role-play-a-call" }],
    },
  });
  ok(
    "an unrecognised shape string is accepted, not dropped",
    unknownShape.speakingAttempts["speaking-future-shape"]?.length === 1,
  );
  ok(
    "and it is stored verbatim rather than normalised to something known",
    unknownShape.speakingAttempts["speaking-future-shape"][0].shape === "role-play-a-call",
  );

  const notAnArray = acceptCelpip("a prompt whose rehearsals value is not an array", {
    ...celpipFull,
    speakingAttempts: { "speaking-advice-first-winter": { 0: speakingAttempt } },
  });
  ok(
    "a non-array prompt value is dropped rather than coerced to an empty history",
    !("speaking-advice-first-winter" in notAnArray.speakingAttempts),
  );
  deepEqual("its writing neighbours are untouched", notAnArray.attempts, celpipFull.attempts);

  const poisoned = acceptCelpip("poisoned keys in the speaking record", {
    ...celpipFull,
    speakingAttempts: JSON.parse(
      `{"__proto__":[],"constructor":[],"prototype":[],"speaking-advice-first-winter":${JSON.stringify(
        [speakingAttempt],
      )}}`,
    ) as Record<string, unknown>,
  });
  deepEqual("poisoned speaking keys are dropped", Object.keys(poisoned.speakingAttempts).sort(), [
    "speaking-advice-first-winter",
  ]);
  ok(
    "and no prototype was polluted along the way",
    ({} as Record<string, unknown>).polluted === undefined,
  );
}

group("CELPIP speaking bounds — every field on the new shape is capped");
{
  const huge = "x".repeat(CELPIP_MAX_TEXT + 1);
  const overLongNote = acceptCelpip("a rehearsal whose note exceeds the essay cap", {
    ...celpipFull,
    speakingAttempts: {
      "speaking-advice-first-winter": [
        speakingAttempt,
        { ...speakingAttempt, date: "2026-07-29T07:00:00.000Z", note: huge },
      ],
    },
  });
  deepEqual(
    "the over-length note costs only its own entry",
    overLongNote.speakingAttempts["speaking-advice-first-winter"],
    [speakingAttempt],
  );

  const longMime = acceptCelpip("a rehearsal whose mimeType is prose", {
    ...celpipFull,
    speakingAttempts: {
      "speaking-advice-first-winter": [{ ...speakingAttempt, mimeType: "a".repeat(65) }],
    },
  });
  ok(
    "a mimeType over 64 characters is refused as an entry",
    (longMime.speakingAttempts["speaking-advice-first-winter"] ?? []).length === 0,
  );

  const longShape = acceptCelpip("a rehearsal whose shape is prose", {
    ...celpipFull,
    speakingAttempts: {
      "speaking-advice-first-winter": [{ ...speakingAttempt, shape: "b".repeat(65) }],
    },
  });
  ok(
    "a shape over 64 characters is refused as an entry",
    (longShape.speakingAttempts["speaking-advice-first-winter"] ?? []).length === 0,
  );

  // Every NUMBER on the shape is bounded too, not just the strings. A negative
  // duration, a fractional byte count or a 1e308 recording length are all
  // things a broken or hostile client can send, and all three would render as
  // nonsense in the learner's own history. Each costs only its own entry.
  for (const [label, patch] of [
    ["a negative recording length", { recordingSeconds: -1 }],
    ["a negative attempt duration", { durationSeconds: -30 }],
    ["a negative size", { sizeBytes: -1 }],
    ["a fractional recording length", { recordingSeconds: 90.5 }],
    ["a fractional size", { sizeBytes: 1.5 }],
    ["a recording length past the counter ceiling", { recordingSeconds: 1e12 }],
    ["a size past the counter ceiling", { sizeBytes: 1e308 }],
    ["a non-finite size", { sizeBytes: Number.POSITIVE_INFINITY }],
  ] as Array<[string, Partial<Record<string, number>>]>) {
    const bad = acceptCelpip(`a rehearsal carrying ${label}`, {
      ...celpipFull,
      speakingAttempts: {
        "speaking-advice-first-winter": [speakingAttempt, { ...speakingAttempt, date: "2026-08-01T00:00:00.000Z", ...patch }],
      },
    });
    deepEqual(
      `${label} costs only its own entry`,
      bad.speakingAttempts["speaking-advice-first-winter"],
      [speakingAttempt],
    );
  }

  // ---- The 2 MiB body cap, closed by MEASUREMENT rather than by claim. ----
  //
  // `MAX_BODY_BYTES` in src/app/api/celpip-progress/route.ts is 2 MiB, and the
  // retry queue classifies a 413 as a PERMANENT drop: exceeding the cap would
  // not retry, it would discard the learner's entire CELPIP sync, writing
  // history included. So the question "is the new shape small enough?" is a
  // data-loss question, and it is answered here by building a worst-case
  // realistic state and weighing it.
  const MAX_BODY_BYTES = 2 * 1024 * 1024; // mirrors src/app/api/celpip-progress/route.ts
  const worstCase: CelpipProgressState = {
    attempts: {},
    drafts: {},
    speakingAttempts: {},
    listeningAttempts: {},
    updatedAt: INSTANT,
  };
  // 200 rehearsals spread over 8 prompts — far more than an exam candidate
  // practising daily for three weeks would produce — each carrying a note at
  // the length a learner actually writes.
  const realisticNote =
    "Ran out of things to say around the sixty second mark and repeated the second point. " +
    "Next time plan a third reason during the prep window instead of polishing the opening.";
  for (let i = 0; i < 200; i += 1) {
    const promptId = `speaking-shape-${i % 8}-prompt`;
    const entry: CelpipSpeakingAttempt = {
      ...speakingAttempt,
      promptId,
      date: new Date(Date.UTC(2026, 6, 1, 0, i)).toISOString(),
      note: realisticNote,
      checkedRubric: {
        "speaking-did-the-task": true,
        "speaking-developed-points": false,
        "speaking-used-the-window": true,
        "speaking-right-register": true,
      },
    };
    worstCase.speakingAttempts[promptId] = [
      ...(worstCase.speakingAttempts[promptId] ?? []),
      entry,
    ];
  }
  // Plus the writing history that shares the same payload.
  for (let i = 0; i < 40; i += 1) {
    const taskId = `email-task-${i % 8}`;
    worstCase.attempts[taskId] = [
      ...(worstCase.attempts[taskId] ?? []),
      { ...attempt, taskId, date: new Date(Date.UTC(2026, 6, 2, 0, i)).toISOString() },
    ];
  }
  // Plus a Listening history: 30 sittings across 4 sets, each carrying a FULL
  // 37-item answer sheet. The answer map is the only thing on this shape that
  // grows with content, so it is the half worth measuring rather than assuming.
  const fullSheet: Record<string, number> = {};
  for (let q = 0; q < 37; q += 1) fullSheet[`listening-part-${(q % 6) + 1}-q${q}`] = q % 4;
  for (let i = 0; i < 30; i += 1) {
    const setId = `listening-set-${i % 4}`;
    worstCase.listeningAttempts[setId] = [
      ...(worstCase.listeningAttempts[setId] ?? []),
      {
        ...listeningAttempt,
        setId,
        date: new Date(Date.UTC(2026, 6, 3, 0, i)).toISOString(),
        answers: fullSheet,
      },
    ];
  }
  const bytes = Buffer.byteLength(JSON.stringify(worstCase), "utf8");
  // Printed unconditionally: a sizing assertion is only useful if the number it
  // passed on is visible, so a later shape change can be compared against it.
  console.log(
    `    measured: 200 rehearsals + 40 essays + 30 full listening sheets = ${bytes} bytes (${(
      (bytes / MAX_BODY_BYTES) *
      100
    ).toFixed(1)}% of the 2 MiB cap)`,
  );
  ok(
    `a worst-case realistic CELPIP state serializes well under the 2 MiB body cap (${bytes} bytes, ${Math.round(
      (bytes / MAX_BODY_BYTES) * 100,
    )}% of it)`,
    bytes < MAX_BODY_BYTES / 4,
    `${bytes} bytes vs cap ${MAX_BODY_BYTES}`,
  );
  ok(
    "and it still round-trips through the schema unchanged",
    canon(celpipProgressSchema.parse(worstCase)) === canon(worstCase),
  );
}

group("CELPIP listening — the same per-entry rules, one level deeper");
{
  // THE ADDITIVITY CASE. Two of them, in fact, and the second is the one that
  // matters today: a row written before THIS plan carries `speakingAttempts`
  // but no `listeningAttempts` at all. Both must recover to an empty record
  // rather than failing the payload or leaving the field undefined.
  const preSpeakingBlob = {
    attempts: { "survey-transit": [surveyAttempt] },
    drafts: {},
    updatedAt: INSTANT,
  };
  const preSpeaking = acceptCelpip("a Phase-1 blob with neither new field", preSpeakingBlob);
  deepEqual("listeningAttempts recovers to an empty record", preSpeaking.listeningAttempts, {});
  deepEqual("and speakingAttempts still does too", preSpeaking.speakingAttempts, {});

  const postSpeakingBlob = {
    attempts: { "survey-transit": [surveyAttempt] },
    drafts: {},
    speakingAttempts: { "speaking-advice-first-winter": [speakingAttempt] },
    updatedAt: INSTANT,
  };
  const postSpeaking = acceptCelpip(
    "a row written between 02.1-01 and this plan: speaking present, listening absent",
    postSpeakingBlob,
  );
  deepEqual("the absent listening field recovers to an empty record", postSpeaking.listeningAttempts, {});
  deepEqual(
    "and the rehearsal history it does carry is untouched",
    postSpeaking.speakingAttempts,
    postSpeakingBlob.speakingAttempts,
  );
  ok(
    "read through the safe helper it behaves the same",
    canon(safeReadCelpip(JSON.stringify(postSpeakingBlob)).listeningAttempts) === "{}",
  );

  const parsed = acceptCelpip("a set array holding one good and three bad results", {
    ...celpipFull,
    listeningAttempts: {
      "listening-set-1": [
        listeningAttempt,
        { ...listeningAttempt, date: 1_753_000_000_000 }, // a number where the ISO date belongs
        { ...listeningAttempt, audioFailed: "yes" }, // a string where the flag belongs
        "nope",
      ],
    },
  });
  deepEqual(
    "the well-formed result survives alone",
    parsed.listeningAttempts["listening-set-1"],
    [listeningAttempt],
  );

  // A set id this build has never heard of must still validate — the same
  // no-enum guarantee the speaking `shape` carries, at the record-key level.
  // Dropping a set from the phase for the calendar must never make an already
  // stored result unreadable.
  const unknownSet = acceptCelpip("a result for a set id this build does not know", {
    ...celpipFull,
    listeningAttempts: {
      "listening-set-that-was-cut": [{ ...listeningAttempt, setId: "listening-set-that-was-cut" }],
    },
  });
  ok(
    "an unrecognised set id is accepted, not dropped",
    unknownSet.listeningAttempts["listening-set-that-was-cut"]?.length === 1,
  );

  const notAnArray = acceptCelpip("a set whose results value is not an array", {
    ...celpipFull,
    listeningAttempts: { "listening-set-1": { 0: listeningAttempt } },
  });
  ok(
    "a non-array set value is dropped rather than coerced to an empty history",
    !("listening-set-1" in notAnArray.listeningAttempts),
  );
  deepEqual("its writing neighbours are untouched", notAnArray.attempts, celpipFull.attempts);
  deepEqual(
    "and its speaking neighbours are untouched",
    notAnArray.speakingAttempts,
    celpipFull.speakingAttempts,
  );

  const poisoned = acceptCelpip("poisoned keys in the listening record", {
    ...celpipFull,
    listeningAttempts: JSON.parse(
      `{"__proto__":[],"constructor":[],"prototype":[],"listening-set-1":${JSON.stringify([
        listeningAttempt,
      ])}}`,
    ) as Record<string, unknown>,
  });
  deepEqual("poisoned set keys are dropped", Object.keys(poisoned.listeningAttempts).sort(), [
    "listening-set-1",
  ]);

  // The answer map is a record too, one level further in — so it needs the same
  // treatment, and a poisoned QUESTION id is a distinct hole from a poisoned
  // set id.
  const poisonedAnswers = acceptCelpip("poisoned keys inside the answer sheet", {
    ...celpipFull,
    listeningAttempts: {
      "listening-set-1": [
        {
          ...listeningAttempt,
          answers: JSON.parse('{"__proto__":1,"constructor":2,"l1-q1":3}') as Record<
            string,
            number
          >,
        },
      ],
    },
  });
  deepEqual(
    "poisoned question ids are dropped, the real answer survives",
    poisonedAnswers.listeningAttempts["listening-set-1"][0].answers,
    { "l1-q1": 3 },
  );
  ok(
    "and no prototype was polluted along the way",
    ({} as Record<string, unknown>).polluted === undefined,
  );
}

group("CELPIP listening bounds — one bad answer costs only itself");
{
  // The per-entry rule applied INSIDE the attempt: a malformed answer is
  // dropped from the sheet and the result is still stored, rather than the
  // whole sitting being lost over one bad index.
  for (const [label, bad] of [
    ["a negative option index", -1],
    ["an option index past the ceiling", CELPIP_MAX_OPTION_INDEX + 1],
    ["a fractional option index", 1.5],
    ["a non-finite option index", Number.POSITIVE_INFINITY],
    ["a string where the index belongs", "2" as unknown as number],
    ["null where the index belongs", null as unknown as number],
  ] as Array<[string, number]>) {
    const parsed = acceptCelpip(`an answer sheet carrying ${label}`, {
      ...celpipFull,
      listeningAttempts: {
        "listening-set-1": [
          { ...listeningAttempt, answers: { "l1-q1": 2, "l1-q2": bad, "l1-q3": 0 } },
        ],
      },
    });
    const entry = parsed.listeningAttempts["listening-set-1"] ?? [];
    ok(`${label}: the attempt itself is still stored`, entry.length === 1);
    deepEqual(`${label}: only that one answer is dropped`, entry[0]?.answers, {
      "l1-q1": 2,
      "l1-q3": 0,
    });
  }

  const atTheCeiling = acceptCelpip("an answer exactly at the option ceiling", {
    ...celpipFull,
    listeningAttempts: {
      "listening-set-1": [
        { ...listeningAttempt, answers: { "l1-q1": CELPIP_MAX_OPTION_INDEX } },
      ],
    },
  });
  deepEqual(
    "an index exactly at the ceiling is still accepted",
    atTheCeiling.listeningAttempts["listening-set-1"][0].answers,
    { "l1-q1": CELPIP_MAX_OPTION_INDEX },
  );

  // Every NUMBER on the shape is bounded, exactly as on the speaking one. Each
  // costs only its own entry.
  for (const [label, patch] of [
    ["a negative duration", { durationSeconds: -1 }],
    ["a negative correct count", { correct: -1 }],
    ["a negative total", { total: -1 }],
    ["a negative replay count", { replays: -1 }],
    ["a fractional correct count", { correct: 12.5 }],
    ["a replay count past the counter ceiling", { replays: 1e12 }],
    ["a non-finite duration", { durationSeconds: Number.POSITIVE_INFINITY }],
  ] as Array<[string, Partial<Record<string, number>>]>) {
    const bad = acceptCelpip(`a result carrying ${label}`, {
      ...celpipFull,
      listeningAttempts: {
        "listening-set-1": [
          listeningAttempt,
          { ...listeningAttempt, date: "2026-08-02T00:00:00.000Z", ...patch },
        ],
      },
    });
    deepEqual(
      `${label} costs only its own entry`,
      bad.listeningAttempts["listening-set-1"],
      [listeningAttempt],
    );
  }

  // THE FIELD THAT IS NOT THERE. Notes are deliberately not persisted, so a
  // client that sends one must have it stripped — otherwise the "no second
  // deletable map" argument quietly stops being true the first time a future
  // component sends the field speculatively.
  const withNotes = acceptCelpip("a result carrying learner notes", {
    ...celpipFull,
    listeningAttempts: {
      "listening-set-1": [{ ...listeningAttempt, notes: "3pm, second platform, $4.25" }],
    },
  });
  ok(
    "a notes field is stripped rather than stored — the shape carries no free-form prose",
    !(
      "notes" in
      (withNotes.listeningAttempts["listening-set-1"][0] as unknown as Record<string, unknown>)
    ),
  );
  deepEqual(
    "and the result itself is stored, unchanged",
    withNotes.listeningAttempts["listening-set-1"],
    [listeningAttempt],
  );
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
      speakingAttempts: celpipFull.speakingAttempts,
      listeningAttempts: celpipFull.listeningAttempts,
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
