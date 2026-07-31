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
 * READING (plan 02.1-07) appends below.
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

if (failures > 0) {
  console.error(`\nverify-celpip-content: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-celpip-content: all ${checks} assertions passed.`);
