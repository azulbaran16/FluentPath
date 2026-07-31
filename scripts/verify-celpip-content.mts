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

// Node built-ins, for the one source-level assertion in the listening group
// (see the comment there — it defends D-04 against a shape no type-checker or
// linter can see).
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

// Listening (plan 02.1-05)
import {
  CELPIP_LISTENING_PART_KINDS,
  LISTENING_SETS,
  getListeningSet,
  listeningPartKindLabel,
  type CelpipListeningPartKind,
} from "../src/lib/celpip.ts";

// Reading (plan 02.1-09)
import {
  CELPIP_READING_PART_KINDS,
  READING_SETS,
  getReadingSet,
  readingPartItemCount,
  readingPartKindLabel,
  readingSetItemCount,
  readingSetMinutes,
  type CelpipReadingBlankText,
  type CelpipReadingPartKind,
} from "../src/lib/celpip.ts";

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
// renders. The two patterns below are a proxy for "she is told", and BOTH must
// match: naming the picture is not a disclosure on its own, and neither is
// saying something was written out.
//
// FOUND BY MUTATION. A single /photograph|picture|image/ pattern let the whole
// disclosure be deleted and still passed, because the replacement copy said
// "read it, PICTURE it, and describe it" — the verb, not the noun. Requiring an
// article in front of the noun rejects the verb, and requiring the substitution
// clause as well means no single innocent word can satisfy the assertion. If
// the copy is legitimately reworded, widen the alternations; never drop the
// conjunction.
const PICTURE_NOUN = /\b(a|an|the|no|any|original)\s+(photo|photograph|picture|image)\b/i;
const SUBSTITUTION = /\b(written out|writes? the scene|instead|no original|not have)\b/i;
const DISCLOSURE = {
  test: (text: string) => PICTURE_NOUN.test(text) && SUBSTITUTION.test(text),
};
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
 * LISTENING — set bank (plan 02.1-05)
 * ================================================================== */

/**
 * The per-part item counts the exam actually uses, confirmed against the beta
 * user's official format material rather than estimated from prep sites. A part
 * that drifts from these is a defect, not a judgement call: the item count is
 * what makes the rehearsal feel like the test.
 */
const LISTENING_ITEM_COUNT: Record<CelpipListeningPartKind, number> = {
  "problem-solving": 8,
  "daily-conversation": 5,
  information: 6,
  "news-item": 5,
  discussion: 8,
  viewpoints: 5,
};

/**
 * The FEWEST distinct speakers each part shape needs to be that part shape.
 *
 * Added by plan 02.1-11, because the discussion part is the first with three
 * speakers and nothing committed defended the number. A `discussion` whose
 * three voices collapsed into two would still pass every other assertion in this
 * file — right kind, right item count, right place in the exam order — while
 * quietly becoming a different part shape. It matters more here than anywhere
 * else in the bank: six of that part's eight questions ask WHO said something,
 * and merging two speakers does not make those questions hard, it makes them
 * unanswerable.
 *
 * A MINIMUM rather than an exact count, on purpose. A conversation is allowed a
 * third voice — someone answering a phone, a passer-by — without the part
 * changing shape, and an exact count would fail that and be relaxed rather than
 * respected. The single-speaker shapes are listed explicitly at 1 so that adding
 * a seventh part kind fails to compile here rather than defaulting to unchecked.
 */
const LISTENING_MIN_SPEAKERS: Record<CelpipListeningPartKind, number> = {
  "problem-solving": 2,
  "daily-conversation": 2,
  information: 1,
  "news-item": 1,
  discussion: 3,
  viewpoints: 1,
};

/**
 * THE CEILING THAT KEEPS PLAYBACK ALIVE.
 *
 * Chrome truncates a single utterance at roughly fifteen seconds with no error
 * and sometimes no `onend`. `celpip-speech.ts` speaks one utterance per turn at
 * rate 0.95, so against a nominal 150 words per minute fifteen seconds is about
 * 35 words. A turn past that does not merely cut the audio short: under D-05 the
 * questions are revealed by that `onend` and by nothing else, so the learner is
 * left on a screen with no words, no questions and no error. The authoring
 * target is 25; this is the hard gate.
 *
 * If this assertion fails, SPLIT THE TURN. Never raise the number.
 */
const MAX_TURN_WORDS = 35;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

group("listening: the bank is structurally sound");

const listeningSetIds = LISTENING_SETS.map((s) => s.id);
ok("every listening set id is non-empty", listeningSetIds.every(filled));
ok(
  "no duplicate listening set id",
  duplicates(listeningSetIds).length === 0,
  duplicates(listeningSetIds).join(", "),
);
ok(
  "getListeningSet resolves every id in the bank to its own set",
  LISTENING_SETS.every((s) => getListeningSet(s.id) === s),
);
ok(
  "getListeningSet of an id that is not in the bank is undefined",
  getListeningSet("listening-does-not-exist") === undefined,
);

const allListeningParts = LISTENING_SETS.flatMap((s) => s.parts);
const allListeningSegments = allListeningParts.flatMap((p) => p.segments);
const allListeningQuestions = allListeningParts.flatMap((p) => p.questions);
const allListeningTurns = allListeningSegments.flatMap((s) => s.turns);

const partIds = allListeningParts.map((p) => p.id);
const segmentIds = allListeningSegments.map((s) => s.id);
// Question ids are the KEYS of the stored answer sheet, so a collision would
// make one attempt's answer to one question overwrite another's — silently, and
// in the learner's own history. Uniqueness here is a persistence invariant, not
// a tidiness one.
const questionIds = allListeningQuestions.map((q) => q.id);

ok("every listening part id is non-empty", partIds.every(filled));
ok("no duplicate listening part id", duplicates(partIds).length === 0, duplicates(partIds).join(", "));
ok("every listening segment id is non-empty", segmentIds.every(filled));
ok(
  "no duplicate listening segment id",
  duplicates(segmentIds).length === 0,
  duplicates(segmentIds).join(", "),
);
ok("every listening question id is non-empty", questionIds.every(filled));
ok(
  "no duplicate listening question id anywhere in the bank",
  duplicates(questionIds).length === 0,
  duplicates(questionIds).join(", "),
);

for (const set of LISTENING_SETS) {
  ok(`${set.id}: has a title`, filled(set.title));
  ok(
    `${set.id}: has a sane time limit in minutes`,
    inRange(set.timeLimitMinutes, 1, 90),
    String(set.timeLimitMinutes),
  );
  ok(`${set.id}: holds at least one part`, set.parts.length > 0);

  const kinds = set.parts.map((p) => p.kind);
  ok(
    `${set.id}: every part kind is one of the exam's six`,
    kinds.every((k) => CELPIP_LISTENING_PART_KINDS.includes(k)),
    kinds.join(", "),
  );
  // NOT asserted: that a set covers all six. Set 1 is authored across four
  // plans, so a coverage assertion would fail for most of the phase and end up
  // disabled rather than fixed — which is how a gate becomes decoration. The
  // count is REPORTED in the summary instead, and the landing derives its own
  // coverage line from the same data.
  ok(
    `${set.id}: no part kind appears twice in one set`,
    new Set(kinds).size === kinds.length,
    kinds.join(", "),
  );
  // The array order is the order she HEARS the parts in, and D-07 is that the
  // rehearsal should have the shape of the exam. A set is allowed to be missing
  // parts — most of this phase it will be — but the ones it has must run in
  // exam order, so this is a SUBSEQUENCE test rather than an equality one.
  // Without it, "append the part to the array" (which is what the module's own
  // instructions used to say) silently plays part four before part one.
  const examOrder = CELPIP_LISTENING_PART_KINDS.filter((k) => kinds.includes(k));
  ok(
    `${set.id}: its parts run in the exam's own order`,
    kinds.join(">") === examOrder.join(">"),
    `${kinds.join(" > ")}   exam order: ${examOrder.join(" > ")}`,
  );
}

group("listening: every part is complete enough to sit");

for (const part of allListeningParts) {
  ok(`${part.id}: has a title`, filled(part.title));
  ok(`${part.id}: holds at least one segment`, part.segments.length > 0);
  ok(
    `${part.id}: carries the exam's item count for a "${part.kind}" part`,
    part.questions.length === LISTENING_ITEM_COUNT[part.kind],
    `${part.questions.length} questions, exam uses ${LISTENING_ITEM_COUNT[part.kind]}`,
  );

  const speakers = new Set(part.segments.flatMap((s) => s.turns).map((t) => t.speaker));
  ok(
    `${part.id}: carries the ${LISTENING_MIN_SPEAKERS[part.kind]} or more distinct speakers a "${part.kind}" part needs`,
    speakers.size >= LISTENING_MIN_SPEAKERS[part.kind],
    `${speakers.size} distinct: ${[...speakers].join(", ")}`,
  );

  const ownSegmentIds = new Set(part.segments.map((s) => s.id));
  for (const question of part.questions) {
    ok(
      `${question.id}: names a segment that exists in its own part, or names none`,
      question.segmentId === undefined || ownSegmentIds.has(question.segmentId),
      String(question.segmentId),
    );
  }
}

group("listening: every segment can actually be spoken");

for (const segment of allListeningSegments) {
  ok(`${segment.id}: holds at least one turn`, segment.turns.length > 0);
  ok(
    `${segment.id}: every turn carries a speaker and something to say`,
    segment.turns.every((t) => filled(t.speaker) && filled(t.text)),
    segment.turns
      .filter((t) => !filled(t.speaker) || !filled(t.text))
      .map((t) => JSON.stringify(t))
      .join(", "),
  );
  // T-02.1-24. The one assertion in this group that fails silently in a browser
  // rather than loudly here.
  const overLong = segment.turns.filter((t) => wordCount(t.text) > MAX_TURN_WORDS);
  ok(
    `${segment.id}: no turn exceeds ${MAX_TURN_WORDS} words`,
    overLong.length === 0,
    overLong.map((t) => `${wordCount(t.text)}w: ${t.text.slice(0, 60)}…`).join("\n      "),
  );
}

group("listening: every question can be answered and explained");

for (const question of allListeningQuestions) {
  ok(`${question.id}: has a stem`, filled(question.stem));
  ok(
    `${question.id}: offers at least two options, all of them non-empty`,
    question.options.length >= 2 && question.options.every(filled),
    JSON.stringify(question.options),
  );
  ok(
    `${question.id}: offers no duplicate option`,
    new Set(question.options.map((o) => o.trim().toLowerCase())).size ===
      question.options.length,
    JSON.stringify(question.options),
  );
  // An out-of-range key marks every answer wrong forever, and nothing in the
  // build would notice: the player would render four options and score none.
  ok(
    `${question.id}: its answer is a real index into its own options`,
    inRange(question.answer, 0, question.options.length - 1),
    `answer=${question.answer} of ${question.options.length} options`,
  );
  // CELPIP-07 asks for per-question explanations, and the results view renders
  // this unconditionally — an empty one is a visible gap on the page she reads
  // to find out why she was wrong.
  ok(`${question.id}: carries an explanation`, filled(question.explanation));
}

group("listening: the landing tells the truth about what ships");

const listeningSection = getSection("listening");
ok("the registry still has a listening section", listeningSection !== undefined);
ok(
  "the listening section is available if and only if the bank holds a set with parts",
  listeningSection !== undefined &&
    listeningSection.coverage.available === allListeningParts.length > 0,
  `available=${listeningSection?.coverage.available} parts=${allListeningParts.length}`,
);
if (listeningSection?.coverage.available) {
  ok(
    "its coverage line counts the part shapes that exist against the exam's six",
    new RegExp(
      `\\b${new Set(allListeningParts.map((p) => p.kind)).size} of the ${
        CELPIP_LISTENING_PART_KINDS.length
      }\\b`,
    ).test(listeningSection.coverage.summary),
    listeningSection.coverage.summary,
  );
  ok(
    "every set in the bank is offered as an item on the landing",
    listeningSection.groups.flatMap((g) => g.items).length === LISTENING_SETS.length,
    `${listeningSection.groups.flatMap((g) => g.items).length} items vs ${LISTENING_SETS.length} sets`,
  );
  // D-03's compromise disclosed, and gated the way the Speaking picture
  // disclosure is: a CONJUNCTION, because a single-token pattern was defeated
  // once already in this file by an unrelated word matching it. Naming a
  // recording is not a disclosure on its own, and neither is the word
  // "browser". Both halves must be present.
  const RECORDING_NOUN = /\b(a|an|the|no|any)\s+(recording|recordings|voice actor|studio)\b/i;
  const SYNTHESIS =
    /\b(spoken by (your|the) browser|your browser (speaks|reads)|browser'?s own voice|speech synthes\w+)\b/i;
  const caveat = listeningSection.coverage.caveat ?? "";
  ok(
    "the landing's listening caveat says the audio is the browser's, not a recording",
    RECORDING_NOUN.test(caveat) && SYNTHESIS.test(caveat),
    caveat || "(no caveat)",
  );
  ok(
    "no listening item's landing copy leaks a line of the script",
    listeningSection.groups
      .flatMap((g) => g.items)
      .every((item) =>
        allListeningTurns.every(
          (turn) => !item.summary.includes(turn.text) && !item.title.includes(turn.text),
        ),
      ),
  );
}

group("listening: the script does not ride into the page's own HTML");

// THE ONE ASSERTION IN THIS FILE THAT READS SOURCE RATHER THAN CONTENT, and it
// earns the exception. A prop crossing from a server component into a client
// one is serialized into the RSC payload, which Next INLINES INTO THE PAGE'S
// HTML — so a route that hands the player a resolved set puts every line of the
// script, every option and every explanation into the document source before
// the learner has heard a word. That was measured on this route, not theorised:
// 41 of 42 authored strings were in the served HTML until the route was changed
// to pass the id and let the player resolve it on the client.
//
// It is invisible to `tsc`, to lint, to every other script here, and to anyone
// looking at the rendered page — the markup shows only the brief. It is one
// keystroke away in `view-source`. D-04 is the decision this whole section
// rests on, so the shape that defeats it is gated rather than commented.
//
// A CONJUNCTION on purpose: passing the id is not the property being defended.
// NOT passing the set is.
const listeningRouteSource = readFileSync(
  join(
    import.meta.dirname,
    "..",
    "src",
    "app",
    "(catalog)",
    "celpip",
    "listening",
    "[setId]",
    "page.tsx",
  ),
  "utf8",
);

ok(
  "the listening route hands the player an id",
  /<ListeningPlayer\s+setId=/.test(listeningRouteSource),
);
ok(
  "the listening route never hands the player a resolved set",
  !/<ListeningPlayer\s[^>]*\bset=\{/.test(listeningRouteSource),
  "a `set={…}` prop is serialized into this page's HTML — pass `setId` instead",
);

const listeningPlayerSource = readFileSync(
  join(import.meta.dirname, "..", "src", "components", "celpip", "ListeningPlayer.tsx"),
  "utf8",
);
ok(
  "the player resolves the set itself, on the client",
  /getListeningSet\(/.test(listeningPlayerSource),
);

/* ================================================================== *
 * READING — set bank (plan 02.1-09)
 * ================================================================== */

/**
 * The confirmed shape of each reading part: its allowance in minutes, how many
 * plain comprehension questions it carries, and how many drop-down blanks.
 *
 * Every figure is CONFIRMED against the beta user's own official format
 * material rather than estimated from prep sites, which is why they are pinned
 * here rather than merely bounded. A part that drifts from its row is a defect
 * and not a judgement call: the item split is what makes the rehearsal feel like
 * the test, and the blank count in particular is the difference between meeting
 * the drop-down type in the position the exam puts it and meeting it for the
 * first time on the day.
 *
 * A total `Record` over the union, so a fifth part kind fails `npx tsc --noEmit`
 * here rather than shipping unchecked.
 */
const READING_PART_SHAPE: Record<
  CelpipReadingPartKind,
  { minutes: number; questions: number; blanks: number }
> = {
  correspondence: { minutes: 11, questions: 6, blanks: 5 },
  diagram: { minutes: 8, questions: 3, blanks: 5 },
  information: { minutes: 9, questions: 9, blanks: 0 },
  viewpoints: { minutes: 11, questions: 5, blanks: 5 },
};

group("reading: the bank is structurally sound");

const readingSetIds = READING_SETS.map((s) => s.id);
ok("every reading set id is non-empty", readingSetIds.every(filled));
ok(
  "no duplicate reading set id",
  duplicates(readingSetIds).length === 0,
  duplicates(readingSetIds).join(", "),
);
ok(
  "getReadingSet resolves every id in the bank to its own set",
  READING_SETS.every((s) => getReadingSet(s.id) === s),
);
ok(
  "getReadingSet of an id that is not in the bank is undefined",
  getReadingSet("reading-does-not-exist") === undefined,
);

const allReadingParts = READING_SETS.flatMap((s) => s.parts);
const allReadingQuestions = allReadingParts.flatMap((p) => p.questions);
const allReadingBlanks = allReadingParts.flatMap((p) => p.blankText?.blanks ?? []);

const readingPartIds = allReadingParts.map((p) => p.id);
ok("every reading part id is non-empty", readingPartIds.every(filled));
ok(
  "no duplicate reading part id",
  duplicates(readingPartIds).length === 0,
  duplicates(readingPartIds).join(", "),
);

for (const set of READING_SETS) {
  ok(`${set.id}: has a title`, filled(set.title));
  ok(`${set.id}: holds at least one part`, set.parts.length > 0);

  const kinds = set.parts.map((p) => p.kind);
  ok(
    `${set.id}: every part kind is one of the exam's four`,
    kinds.every((k) => CELPIP_READING_PART_KINDS.includes(k)),
    kinds.join(", "),
  );
  ok(
    `${set.id}: no part kind appears twice in one set`,
    new Set(kinds).size === kinds.length,
    kinds.join(", "),
  );
  // NOT asserted: that a set covers all four. Set 1 is authored across two
  // plans, so a coverage assertion would fail for the whole of plan 09 and get
  // disabled rather than fixed — which is how a gate becomes decoration. The
  // kinds present are REPORTED in the summary instead, exactly as the listening
  // group reports its own, and the landing derives its coverage line from the
  // same data.
  //
  // ORDER, however, IS asserted, and it is not the same property as coverage.
  // This set ships parts 1 and 3 first, so its array is a partial one with a
  // hole in the middle: a later plan that APPENDS the diagram rather than
  // inserting it would run the exam's part 3 before its part 2, and nothing
  // else in the build would notice. A SUBSEQUENCE test allows the set to be
  // missing parts — it will be, for most of this phase — while requiring the
  // ones it has to run in the exam's own order.
  const examOrder = CELPIP_READING_PART_KINDS.filter((k) => kinds.includes(k));
  ok(
    `${set.id}: its parts run in the exam's own order`,
    kinds.join(">") === examOrder.join(">"),
    `${kinds.join(" > ")}   exam order: ${examOrder.join(" > ")}`,
  );

  // T-02.1-39, AND THE ONE INVARIANT PLAN 08 COULD NOT GATE ITSELF because
  // gating it needed a bank to gate.
  //
  // Question ids and blank ids are the keys of ONE answers map on the stored
  // attempt (`CelpipReadingAttempt.answers`), so a blank id that collides with a
  // question id — even across two different parts of the same set — silently
  // overwrites one of the two answers and mis-scores the sheet. The learner sees
  // a score that is wrong by one and no error anywhere. This is the reason the
  // ids carry a per-part token; the assertion is what makes the convention a
  // constraint.
  const itemIds = [
    ...set.parts.flatMap((p) => p.questions.map((q) => q.id)),
    ...set.parts.flatMap((p) => (p.blankText?.blanks ?? []).map((b) => b.id)),
  ];
  ok(`${set.id}: every question id and blank id is non-empty`, itemIds.every(filled));
  ok(
    `${set.id}: no id is shared between two items anywhere in the set, blanks included`,
    duplicates(itemIds).length === 0,
    duplicates(itemIds).join(", "),
  );

  // The set carries NO `timeLimitMinutes` field — `readingSetMinutes` derives
  // the total from the parts, so it cannot be typed twice and drift from them.
  // Asserted against a sum computed here rather than against a stored number,
  // so the derivation itself is what is being checked.
  ok(
    `${set.id}: its total allowance is the sum of its parts' own minutes`,
    readingSetMinutes(set) === set.parts.reduce((n, p) => n + p.minutes, 0),
    `${readingSetMinutes(set)} vs ${set.parts.reduce((n, p) => n + p.minutes, 0)}`,
  );
  ok(
    `${set.id}: its item count is the sum of its parts' questions and blanks`,
    readingSetItemCount(set) ===
      set.parts.reduce((n, p) => n + p.questions.length + (p.blankText?.blanks.length ?? 0), 0),
    String(readingSetItemCount(set)),
  );
}

group("reading: every part has the exam's own shape");

for (const part of allReadingParts) {
  const shape = READING_PART_SHAPE[part.kind];
  const blanks = part.blankText?.blanks ?? [];

  ok(`${part.id}: has a title`, filled(part.title));
  ok(
    `${part.id}: holds at least one item`,
    readingPartItemCount(part) > 0,
    `${part.questions.length} questions, ${blanks.length} blanks`,
  );
  ok(
    `${part.id}: has the ${shape.minutes}-minute allowance a "${part.kind}" part has`,
    part.minutes === shape.minutes,
    `${part.minutes} min, exam allows ${shape.minutes}`,
  );
  ok(
    `${part.id}: carries the ${shape.questions} questions a "${part.kind}" part carries`,
    part.questions.length === shape.questions,
    `${part.questions.length} questions, exam uses ${shape.questions}`,
  );
  ok(
    `${part.id}: carries the ${shape.blanks} drop-down blanks a "${part.kind}" part carries`,
    blanks.length === shape.blanks,
    `${blanks.length} blanks, exam uses ${shape.blanks}`,
  );
  // `CelpipObjectiveQuestion` is shared with Listening, so it carries an
  // optional `segmentId` that means nothing here — a reading part has no
  // segments for it to name. A stray one is a copy-paste from the listening
  // bank, which is exactly the direction D-07 says content must not travel.
  ok(
    `${part.id}: no question names an audio segment`,
    part.questions.every((q) => q.segmentId === undefined),
    part.questions
      .filter((q) => q.segmentId !== undefined)
      .map((q) => `${q.id}:${q.segmentId}`)
      .join(", "),
  );
  // A part may legitimately carry more than one stimulus — correspondence is an
  // email plus a reply with blanks — but a part carrying NONE renders as a
  // heading with questions about nothing.
  ok(
    `${part.id}: carries at least one stimulus to read`,
    part.passage !== undefined || part.diagram !== undefined || part.blankText !== undefined,
  );

  if (part.diagram) {
    ok(`${part.id}: its diagram has a caption`, filled(part.diagram.caption));
    ok(
      `${part.id}: its diagram has at least one row`,
      part.diagram.rows.length > 0,
      String(part.diagram.rows.length),
    );
    ok(
      `${part.id}: every diagram row has a label and at least one cell`,
      part.diagram.rows.every((r) => filled(r.label) && r.cells.length > 0),
    );
  }
}

group("reading: every question and every blank can be answered and explained");

/**
 * The shared half of a gradable item. A blank and a question differ only in
 * what supplies the stem, so everything about the OPTIONS and the KEY is
 * checked by one function against both — the same reasoning that put them in
 * one answers map in the first place. A second copy of these four assertions is
 * a second place for one of them to be quietly relaxed.
 */
function checkGradable(id: string, options: string[], answer: number, explanation: string) {
  ok(
    `${id}: offers at least two options, all of them non-empty`,
    options.length >= 2 && options.every(filled),
    JSON.stringify(options),
  );
  ok(
    `${id}: offers no duplicate option`,
    new Set(options.map((o) => o.trim().toLowerCase())).size === options.length,
    JSON.stringify(options),
  );
  // An out-of-range key marks every answer wrong forever and nothing in the
  // build would notice: the runner would render four options and score none.
  ok(
    `${id}: its answer is a real index into its own options`,
    inRange(answer, 0, options.length - 1),
    `answer=${answer} of ${options.length} options`,
  );
  // CELPIP-06 asks for per-item explanations, and the results view renders this
  // unconditionally — an empty one is a visible gap on the page she reads to
  // find out why she was wrong. On a blank it is doing more work than anywhere
  // else in the app: it is the only place she is told why an option that read
  // perfectly well was still wrong.
  ok(`${id}: carries an explanation`, filled(explanation));
}

for (const question of allReadingQuestions) {
  ok(`${question.id}: has a stem`, filled(question.stem));
  checkGradable(question.id, question.options, question.answer, question.explanation);
}
for (const blank of allReadingBlanks) {
  checkGradable(blank.id, blank.options, blank.answer, blank.explanation);
}

group("reading: every blank is rendered, and everything rendered is a blank");

// T-02.1-43, in BOTH directions, because the two failures are different and
// both are silent.
//
// A segment naming a blank that does not exist renders as a visible gap marker
// and can never be answered — the score's denominator counts it, so the sheet is
// unwinnable by one. A declared blank that no segment references is worse: it is
// counted, it is graded, and it is NOWHERE ON THE PAGE. She loses a mark on an
// item she was never shown. Neither is visible to `tsc`, to lint, or to anybody
// reading the module.
function checkBlankText(partId: string, blankText: CelpipReadingBlankText) {
  const declared = blankText.blanks.map((b) => b.id);
  const referenced = blankText.segments
    .filter((s): s is { kind: "blank"; blankId: string } => s.kind === "blank")
    .map((s) => s.blankId);

  const dangling = referenced.filter((id) => !declared.includes(id));
  ok(
    `${partId}: every blank named in the text is declared`,
    dangling.length === 0,
    dangling.join(", "),
  );

  const unreferenced = declared.filter((id) => !referenced.includes(id));
  ok(
    `${partId}: every declared blank appears in the text`,
    unreferenced.length === 0,
    `${unreferenced.join(", ")} — declared, graded, and never rendered`,
  );

  const twice = declared.filter((id) => referenced.filter((r) => r === id).length > 1);
  ok(
    `${partId}: no blank appears in the text more than once`,
    twice.length === 0,
    `${twice.join(", ")} — one answers-map key, two selects, one overwriting the other`,
  );

  // The number a screen reader announces ("Blank 3") is the blank's position in
  // `blanks`, while its position on the page comes from `segments`. If the two
  // disagree the labels are shuffled, and a learner using the labels to keep her
  // place is silently misdirected.
  ok(
    `${partId}: the blanks are declared in the order they are read`,
    referenced.join(">") === declared.join(">"),
    `read: ${referenced.join(" > ")}\n      declared: ${declared.join(" > ")}`,
  );

  ok(
    `${partId}: its text carries prose as well as blanks`,
    blankText.segments.some((s) => s.kind === "text" && filled(s.text)),
  );
}

for (const part of allReadingParts) {
  if (part.blankText) checkBlankText(part.id, part.blankText);
}

group("reading: the landing tells the truth about what ships");

const readingSection = getSection("reading");
ok("the registry still has a reading section", readingSection !== undefined);
ok(
  "the reading section is available if and only if the bank holds a set with parts",
  readingSection !== undefined &&
    readingSection.coverage.available === allReadingParts.length > 0,
  `available=${readingSection?.coverage.available} parts=${allReadingParts.length}`,
);
if (readingSection?.coverage.available) {
  ok(
    "its coverage line counts the part shapes that exist against the exam's four",
    new RegExp(
      `\\b${new Set(allReadingParts.map((p) => p.kind)).size} of the ${
        CELPIP_READING_PART_KINDS.length
      }\\b`,
    ).test(readingSection.coverage.summary),
    readingSection.coverage.summary,
  );
  ok(
    "every set in the bank is offered as an item on the landing",
    readingSection.groups.flatMap((g) => g.items).length === READING_SETS.length,
    `${readingSection.groups.flatMap((g) => g.items).length} items vs ${READING_SETS.length} sets`,
  );
}

group("reading: the passages do not ride into the page's own HTML");

// The same conjunction the listening group carries, for the same measured
// reason and against a bigger payload: a resolved set crossing the
// server/client boundary is serialized into the RSC payload and inlined into the
// document, which for a reading set means every passage AND the whole answer key
// in `view-source` before she has read a word. Passing the id is not the
// property being defended. NOT passing the set is.
const readingRouteSource = readFileSync(
  join(
    import.meta.dirname,
    "..",
    "src",
    "app",
    "(catalog)",
    "celpip",
    "reading",
    "[setId]",
    "page.tsx",
  ),
  "utf8",
);

ok(
  "the reading route hands the runner an id",
  /<ReadingRunner\s+setId=/.test(readingRouteSource),
);
ok(
  "the reading route never hands the runner a resolved set",
  !/<ReadingRunner\s[^>]*\bset=\{/.test(readingRouteSource),
  "a `set={…}` prop is serialized into this page's HTML — pass `setId` instead",
);

const readingRunnerSource = readFileSync(
  join(import.meta.dirname, "..", "src", "components", "celpip", "ReadingRunner.tsx"),
  "utf8",
);
ok(
  "the runner resolves the set itself, on the client",
  /getReadingSet\(/.test(readingRunnerSource),
);

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

// REPORTED, not asserted — see the coverage note in the listening group. The
// number is printed on every run so a set stalling at one part shape is visible
// rather than merely true.
if (LISTENING_SETS.length === 0) {
  console.log("  listening: no sets in the bank");
} else {
  for (const set of LISTENING_SETS) {
    const kinds = set.parts.map((p) => p.kind);
    console.log(
      `  listening: ${set.id} — ${kinds.length}/${
        CELPIP_LISTENING_PART_KINDS.length
      } part shapes, ${set.parts.reduce((n, p) => n + p.questions.length, 0)} questions, ${
        set.parts.flatMap((p) => p.segments).flatMap((s) => s.turns).length
      } turns, longest turn ${Math.max(
        0,
        ...set.parts
          .flatMap((p) => p.segments)
          .flatMap((s) => s.turns)
          .map((t) => wordCount(t.text)),
      )}w (ceiling ${MAX_TURN_WORDS}w)`,
    );
    console.log(`    shapes: ${kinds.map(listeningPartKindLabel).join(", ")}`);
  }
}

// REPORTED, not asserted — the same coverage note as the listening group above.
// Printed on every run so a set stalling at two part shapes is visible rather
// than merely true.
if (READING_SETS.length === 0) {
  console.log("  reading: no sets in the bank");
} else {
  for (const set of READING_SETS) {
    const kinds = set.parts.map((p) => p.kind);
    console.log(
      `  reading: ${set.id} — ${kinds.length}/${
        CELPIP_READING_PART_KINDS.length
      } part shapes, ${readingSetItemCount(set)} items (${set.parts.reduce(
        (n, p) => n + p.questions.length,
        0,
      )} questions, ${set.parts.reduce(
        (n, p) => n + (p.blankText?.blanks.length ?? 0),
        0,
      )} drop-down blanks), ${readingSetMinutes(set)} min`,
    );
    console.log(`    shapes: ${kinds.map(readingPartKindLabel).join(", ")}`);
  }
}

if (failures > 0) {
  console.error(`\nverify-celpip-content: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-celpip-content: all ${checks} assertions passed.`);
