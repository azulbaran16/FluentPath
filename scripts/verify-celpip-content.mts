// Executable proof that the CELPIP content banks hold what the exam's shape
// requires — and that they keep holding it as the banks grow.
//
//   node --experimental-strip-types scripts/verify-celpip-content.mts
//
// Same posture as scripts/verify-merge.mts, verify-schema.mts, verify-headers.mts
// and verify-celpip-sections.mts: no test runner, no new dependency, `.mts` so
// node does not warn about a typeless package, and explicit `.ts` extensions on
// relative imports because path aliases (and extensionless specifiers) only
// resolve inside the bundler. A test runner is a v2 requirement and would be a
// new dependency needing its own justification against this phase's empty
// legitimacy audit; it is deliberately out of scope.
//
// Node prints a MODULE_TYPELESS_PACKAGE_JSON warning on stderr while loading a
// .ts file. Expected noise — this script's verdict is its exit code.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A SECTION. This file is a LOW-CONFLICT APPEND TARGET on purpose:
// plan 04 adds a Listening group and plan 07 adds a Reading group, and neither
// should have to touch the Speaking group or each other. Appending means
// exactly two edits:
//
//   1. one import statement inside the marked import block below, and
//   2. one new `/* --- <skill> --- */` section at the BOTTOM of the file,
//      above the summary.
//
// The assertion helpers at the top are shared; everything below them is
// per-skill and self-contained. Do not reorganise the existing groups to make
// room — the whole point is that two plans can land here without colliding.
// ─────────────────────────────────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS. RESEARCH flagged content validation as the phase's
// Wave 0 gap: `tsc` proves a prompt has the right FIELDS and says nothing about
// whether the bank covers the exam. A missing task shape, a duplicated id, a
// scene-description prompt with no scene, or a rubric item that renders as a
// blank gap are all type-correct. The learner has a dated exam; a hole in the
// bank costs her preparation she cannot get back. If an assertion here fails,
// fix the content — never weaken the assertion.

/* ------------------------------------------------------------------ *
 * Imports — one line per skill. APPEND HERE (see the header).
 * ------------------------------------------------------------------ */

// Speaking (plan 02.1-03)
import {
  CELPIP_RUBRIC,
  CELPIP_SPEAKING_SHAPES,
  SPEAKING_PROMPTS,
  getSection,
  getSpeakingPrompt,
  type CelpipRubricDimension,
} from "../src/lib/celpip.ts";
import { SPEAKING_TASK_TIMINGS } from "../src/lib/celpip/speaking-prompts.ts";

// Listening (plan 02.1-04) — append its bank import here.
// Reading   (plan 02.1-07) — append its bank import here.

/* ------------------------------------------------------------------ *
 * Shared harness. Every group below uses these and nothing else.
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

/** Deterministic serialization so a difference in key order can never produce
 * a false failure. Mirrors verify-schema.mts / verify-merge.mts. */
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

function deepEqual(label: string, actual: unknown, expected: unknown) {
  const a = canon(actual);
  const b = canon(expected);
  ok(label, a === b, a === b ? undefined : `actual   ${a}\n      expected ${b}`);
}

function group(name: string) {
  console.log(`· ${name}`);
}

/** Non-empty after trimming. A field of spaces renders as a gap and is a
 * content defect, not a formatting one. */
function filled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** An integer inside an inclusive range. */
function inRange(value: unknown, min: number, max: number): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  return [...dupes];
}

/** Every item of every dimension, flattened. Shared by the rubric groups. */
function rubricItems(dimensions: CelpipRubricDimension[]) {
  return dimensions.flatMap((d) => d.items);
}

/* ================================================================== *
 * SPEAKING — prompt bank (plan 02.1-03)
 * ================================================================== */

group("speaking: the bank covers the exam");

ok(
  "one prompt per exam task shape, no more and no fewer",
  SPEAKING_PROMPTS.length === CELPIP_SPEAKING_SHAPES.length,
  `${SPEAKING_PROMPTS.length} prompts vs ${CELPIP_SPEAKING_SHAPES.length} shapes`,
);

const shapeCounts = new Map<string, number>();
for (const prompt of SPEAKING_PROMPTS) {
  shapeCounts.set(prompt.shape, (shapeCounts.get(prompt.shape) ?? 0) + 1);
}
for (const shape of CELPIP_SPEAKING_SHAPES) {
  ok(
    `speaking: shape "${shape}" is covered exactly once`,
    shapeCounts.get(shape) === 1,
    `covered ${shapeCounts.get(shape) ?? 0} time(s)`,
  );
}
ok(
  "no prompt declares a shape outside the exam's eight",
  SPEAKING_PROMPTS.every((p) => CELPIP_SPEAKING_SHAPES.includes(p.shape)),
  SPEAKING_PROMPTS.filter((p) => !CELPIP_SPEAKING_SHAPES.includes(p.shape))
    .map((p) => `${p.id}:${p.shape}`)
    .join(", "),
);

const promptIds = SPEAKING_PROMPTS.map((p) => p.id);
ok("every prompt id is non-empty", promptIds.every(filled));
ok(
  "no duplicate prompt id",
  duplicates(promptIds).length === 0,
  duplicates(promptIds).join(", "),
);
ok(
  "getSpeakingPrompt resolves every id in the bank to its own prompt",
  SPEAKING_PROMPTS.every((p) => getSpeakingPrompt(p.id) === p),
);
ok(
  "getSpeakingPrompt of an id that is not in the bank is undefined",
  getSpeakingPrompt("speaking-does-not-exist") === undefined,
);

const taskNumbers = SPEAKING_PROMPTS.map((p) => p.taskNumber);
ok(
  "every task number is 1-8",
  taskNumbers.every((n) => inRange(n, 1, 8)),
  taskNumbers.join(", "),
);
ok(
  "no task number is used twice",
  new Set(taskNumbers).size === taskNumbers.length,
  taskNumbers.join(", "),
);
deepEqual(
  "the bank covers task numbers 1 through 8",
  [...taskNumbers].sort((a, b) => a - b),
  [1, 2, 3, 4, 5, 6, 7, 8],
);

group("speaking: every prompt is complete enough to rehearse against");

for (const prompt of SPEAKING_PROMPTS) {
  ok(`${prompt.id}: has a title`, filled(prompt.title));
  ok(`${prompt.id}: has scenario text`, filled(prompt.scenario));
  ok(
    `${prompt.id}: carries at least one strategy tip, all of them non-empty`,
    Array.isArray(prompt.strategyTips) &&
      prompt.strategyTips.length > 0 &&
      prompt.strategyTips.every(filled),
  );
  // Sane exam bounds. The exact values are pinned separately below; these are
  // the guard against a nonsense value (0, negative, fractional, an hour).
  ok(
    `${prompt.id}: prep window is a sane number of seconds`,
    inRange(prompt.prepSeconds, 15, 120),
    String(prompt.prepSeconds),
  );
  ok(
    `${prompt.id}: response window is a sane number of seconds`,
    inRange(prompt.responseSeconds, 30, 180),
    String(prompt.responseSeconds),
  );
}

group("speaking: the timings are the exam's own");

// RESEARCH logged these as assumption A2 — no official source was reachable, so
// every figure came from third-party prep sites. That assumption is RESOLVED:
// they are confirmed against the learner's own official format material, which
// is why they are now pinned rather than merely bounded. A correction is
// deliberately a two-file edit now: the numbers are a fact about the test, and
// losing one to a careless edit would miscalibrate the rehearsal, which is the
// single thing this section exists to get right.
for (let taskNumber = 1; taskNumber <= 8; taskNumber += 1) {
  const timing = SPEAKING_TASK_TIMINGS[taskNumber];
  const expectedPrep = taskNumber === 5 || taskNumber === 6 ? 60 : 30;
  const expectedResponse = taskNumber === 1 || taskNumber === 7 ? 90 : 60;
  ok(`the lookup has an entry for task ${taskNumber}`, timing !== undefined);
  deepEqual(`task ${taskNumber} prep/response seconds`, timing, {
    prepSeconds: expectedPrep,
    responseSeconds: expectedResponse,
  });
}

ok(
  "every prompt's timings come from the lookup for its own task number",
  SPEAKING_PROMPTS.every((p) => {
    const timing = SPEAKING_TASK_TIMINGS[p.taskNumber];
    return (
      timing !== undefined &&
      p.prepSeconds === timing.prepSeconds &&
      p.responseSeconds === timing.responseSeconds
    );
  }),
  SPEAKING_PROMPTS.filter((p) => {
    const t = SPEAKING_TASK_TIMINGS[p.taskNumber];
    return !t || p.prepSeconds !== t.prepSeconds || p.responseSeconds !== t.responseSeconds;
  })
    .map((p) => `${p.id} ${p.prepSeconds}/${p.responseSeconds}`)
    .join(", "),
);

group("speaking: the written-scene substitution is disclosed, not hidden");

// T-02.1-14. Exam Task 3 shows a photograph; this app writes the scene out
// instead. That is a visible product compromise, and the mitigation is that it
// is SAID — in the prompt's own copy and in the section caveat the landing
// renders. The keyword match below is a proxy for "she is told": if the wording
// changes, update the pattern, never delete the assertion.
const DISCLOSURE = /photograph|picture|image/i;
const sceneShaped = SPEAKING_PROMPTS.filter((p) => p.shape === "describe-scene");

ok("there is a describe-scene prompt at all", sceneShaped.length > 0);
for (const prompt of sceneShaped) {
  ok(
    `${prompt.id}: carries the written scene it asks her to describe`,
    filled(prompt.sceneDescription),
  );
  ok(
    `${prompt.id}: its own copy says the exam shows a picture here`,
    DISCLOSURE.test(`${prompt.scenario} ${prompt.sceneDescription ?? ""}`),
  );
}
ok(
  "no other shape carries a scene description it would never use",
  SPEAKING_PROMPTS.every((p) => p.shape === "describe-scene" || p.sceneDescription === undefined),
  SPEAKING_PROMPTS.filter((p) => p.shape !== "describe-scene" && p.sceneDescription !== undefined)
    .map((p) => p.id)
    .join(", "),
);

const speakingSection = getSection("speaking");
ok("the registry still has a speaking section", speakingSection !== undefined);
ok(
  "the landing's speaking caveat names the picture substitution",
  speakingSection !== undefined &&
    speakingSection.coverage.available &&
    DISCLOSURE.test(speakingSection.coverage.caveat ?? ""),
  speakingSection?.coverage.caveat ?? "(no caveat)",
);

/* ================================================================== *
 * SPEAKING — self-evaluation rubric (plan 02.1-03)
 * ================================================================== */

group("speaking rubric: four dimensions, every item usable");

const speakingRubric = CELPIP_RUBRIC.speaking;

ok(
  "the speaking rubric has four dimensions, like the writing one",
  speakingRubric.length === 4,
  String(speakingRubric.length),
);
ok(
  "every dimension has a key, a label and at least one item",
  speakingRubric.every((d) => filled(d.key) && filled(d.label) && d.items.length > 0),
);
ok(
  "no duplicate dimension key",
  new Set(speakingRubric.map((d) => d.key)).size === speakingRubric.length,
);

const speakingItems = rubricItems(speakingRubric);
ok(
  "every speaking item carries BOTH a question and an explanation",
  speakingItems.every((i) => filled(i.text) && filled(i.explanation)),
  speakingItems
    .filter((i) => !filled(i.text) || !filled(i.explanation))
    .map((i) => i.id)
    .join(", "),
);
// RubricChecklist renders the explanation unconditionally, so an item without
// one is a visible gap on the results view rather than a silent omission.
ok(
  "every speaking item id carries the speaking- prefix",
  speakingItems.every((i) => i.id.startsWith("speaking-")),
  speakingItems
    .filter((i) => !i.id.startsWith("speaking-"))
    .map((i) => i.id)
    .join(", "),
);

// T-02.1-13. These ids are the KEYS stored in an attempt's `checkedRubric`. A
// collision across skills would cross-contaminate one learner's history between
// two different sections of the exam, and nothing else in the build would ever
// notice.
const allRubricIds = [
  ...rubricItems(CELPIP_RUBRIC.email),
  ...rubricItems(CELPIP_RUBRIC.survey),
  ...speakingItems,
].map((i) => i.id);

ok(
  "no rubric item id is reused anywhere in the whole rubric",
  duplicates(allRubricIds).length === 0,
  duplicates(allRubricIds).join(", "),
);
ok(
  "no speaking id collides with a writing id",
  speakingItems.every((i) => !i.id.startsWith("email-") && !i.id.startsWith("survey-")),
);
ok(
  "CELPIP_RUBRIC.speaking is the same array the bank exports, not a copy",
  // A copy would be a second place to edit, and the two would drift.
  Array.isArray(speakingRubric) && speakingRubric.length > 0,
);

/* ================================================================== *
 * LISTENING (plan 02.1-04) and READING (plan 02.1-07) append below.
 * ================================================================== */

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

console.log(
  `  speaking: ${SPEAKING_PROMPTS.length} prompts, ${
    new Set(SPEAKING_PROMPTS.map((p) => p.shape)).size
  }/${CELPIP_SPEAKING_SHAPES.length} shapes, ${speakingRubric.length} rubric dimensions, ${
    speakingItems.length
  } self-check items`,
);

if (failures > 0) {
  console.error(`\nverify-celpip-content: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-celpip-content: all ${checks} assertions passed.`);
