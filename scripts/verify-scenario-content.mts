// Executable proof that the per-scenario content banks hold what Phase 3
// claims — and that they keep holding it as thirty-five scenarios and
// fifty-two scenario×skill pairs get filled in over ten plans.
//
//   node --experimental-strip-types scripts/verify-scenario-content.mts
//
// Same posture as scripts/verify-celpip-content.mts, verify-merge.mts,
// verify-schema.mts, verify-headers.mts and verify-celpip-sections.mts: no test
// runner, no new dependency, `.mts` so node does not warn about a typeless
// package, and explicit `.ts` extensions on relative imports because path
// aliases (and extensionless specifiers) only resolve inside the bundler. A
// test runner is a v2 requirement (TEST-01) and would be a new dependency
// needing its own justification against this phase's empty legitimacy audit; it
// is deliberately out of scope.
//
// Node prints a MODULE_TYPELESS_PACKAGE_JSON warning on stderr while loading a
// .ts file. Expected noise — this script's verdict is its exit code.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A GROUP. This file is a LOW-CONFLICT APPEND TARGET on purpose:
// plans 03-02 through 03-10 each add content and each want to assert it,
// and none of them should have to touch another's group. Appending means
// exactly two edits:
//
//   1. one import statement inside the marked import block below, and
//   2. one new `/* --- <topic> --- */` group at the BOTTOM of the file,
//      above the printed progress meter.
//
// The assertion helpers at the top are shared; everything below them is
// per-topic and self-contained. Do not reorganise the existing groups to make
// room — the whole point is that two plans can land here without colliding.
// ─────────────────────────────────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS. `tsc` proves a phrase has the right FIELDS and says
// nothing about whether the bank covers the scenario. A phrase set of four
// where the floor is six, a vocabulary card whose example is a space, a
// duplicated slug, a bank key naming a scenario that does not exist, two
// scenarios handed the identical deck — all type-correct, all silent. And the
// ids are worse than silent: under D-06 an item's id is the key its Postgres
// spaced-repetition entry lives under, `mergeProgress` unions those keys
// blindly, and an orphaned entry is undetectable after the fact. A first green
// run of hand-written content is not evidence; this is.
//
// If an assertion here fails, fix the content — never weaken the assertion.

/* ------------------------------------------------------------------ *
 * Imports — one line per topic. APPEND HERE (see the header).
 * ------------------------------------------------------------------ */

import { WORLDS, type Skill } from "../src/lib/curriculum.ts";
import {
  getScenarioPhrases,
  scenarioPhraseKeys,
  type Phrase,
} from "../src/lib/content/phrases.ts";
import {
  getScenarioVocabulary,
  scenarioVocabularyKeys,
  type ScenarioVocabCard,
} from "../src/lib/content/scenario-vocabulary.ts";
import { GRAMMAR_QUESTIONS } from "../src/lib/content/grammar.ts";
import {
  getScenarioGrammar,
  scenarioGrammarKeys,
} from "../src/lib/content/scenario-grammar.ts";
import {
  getScenarioWriting,
  scenarioWritingKeys,
} from "../src/lib/content/scenario-writing.ts";
import { WRITING_PROMPTS } from "../src/lib/content/writing.ts";
import {
  getScenarioReading,
  scenarioReadingKeys,
} from "../src/lib/content/scenario-reading.ts";
import { PASSAGES } from "../src/lib/content/reading.ts";
import {
  getScenarioSpeaking,
  scenarioSpeakingKeys,
} from "../src/lib/content/scenario-speaking.ts";
// FALLBACK_LESSON is imported so the generic briefing can be asserted
// UNREACHABLE rather than trusted unreachable — see the group near the bottom.
import {
  getScenarioLesson,
  FALLBACK_LESSON,
} from "../src/lib/content/scenario-lessons.ts";
// Read by the speaking group alone, to assert that the rehearsal panel really
// is practicable with no AI and no microphone rather than merely documented as
// such. A builtin, so the no-new-dependency rule above still holds.
import { readFileSync } from "node:fs";
import { VOCAB_DECKS } from "../src/lib/content/vocabulary.ts";
import {
  parseScenarioItemId,
  resolveReviewItem,
  reviewableIds,
  scenarioItemId,
  scenarioRecallItems,
} from "../src/lib/review-items.ts";
import {
  EMPTY,
  addDays,
  safeReadProgress,
  srsItemSchema,
  today,
  type ProgressState,
} from "../src/lib/progress-schema.ts";
import { mergeProgress } from "../src/lib/progress-merge.ts";
import {
  COVERAGE_TOTALS,
  SCENARIO_COVERAGE,
  buildScenarioCoverage,
  getScenarioCoverage,
  pendingPairs,
} from "../src/lib/scenario-coverage.ts";
import {
  RECALL_BATCH_CEILING,
  recallBatches,
} from "../src/lib/recall-batches.ts";

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
 * a false failure. Mirrors verify-celpip-content.mts / verify-schema.mts. */
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

/* ------------------------------------------------------------------ *
 * The curriculum, flattened once. Shared by every group.
 * ------------------------------------------------------------------ */

interface Pair {
  key: string;
  world: string;
  scenario: string;
  title: string;
  skill: Skill;
}

const SCENARIOS = WORLDS.flatMap((world) =>
  world.scenarios.map((scenario) => ({
    key: `${world.slug}/${scenario.slug}`,
    world: world.slug,
    scenario: scenario.slug,
    title: scenario.title,
    level: scenario.level,
    skills: scenario.skills,
  })),
);

const DECLARED_PAIRS: Pair[] = SCENARIOS.flatMap((s) =>
  s.skills.map((skill) => ({
    key: s.key,
    world: s.world,
    scenario: s.scenario,
    title: s.title,
    skill,
  })),
);

const SCENARIO_KEYS = new Set(SCENARIOS.map((s) => s.key));

/** D-04's ratified authoring floors. They hold from the commit that introduces
 * a bank onward — a floor switched on at the end of a phase is a floor nobody
 * authored against. */
const MIN_PHRASES = 6;
const MIN_VOCAB_CARDS = 8;

/* ================================================================== *
 * BANKS — phrases, vocabulary and the ids they emit (plan 03-01)
 * ================================================================== */

group("banks: every key names a scenario the curriculum actually has");

for (const key of scenarioPhraseKeys()) {
  ok(
    `phrases: "${key}" is a real world/scenario pair`,
    SCENARIO_KEYS.has(key),
    "a key nothing can reach serves nobody and never fails on its own",
  );
}
for (const key of scenarioVocabularyKeys()) {
  ok(
    `vocabulary: "${key}" is a real world/scenario pair`,
    SCENARIO_KEYS.has(key),
    "a key nothing can reach serves nobody and never fails on its own",
  );
}

group("banks: every present set meets D-04's authoring floor");

for (const s of SCENARIOS) {
  const phrases = getScenarioPhrases(s.world, s.scenario);
  if (phrases) {
    ok(
      `phrases: ${s.key} holds at least ${MIN_PHRASES}`,
      phrases.length >= MIN_PHRASES,
      `${phrases.length} phrase(s)`,
    );
  }
  const cards = getScenarioVocabulary(s.world, s.scenario);
  if (cards) {
    ok(
      `vocabulary: ${s.key} holds at least ${MIN_VOCAB_CARDS}`,
      cards.length >= MIN_VOCAB_CARDS,
      `${cards.length} card(s)`,
    );
  }
}

group("banks: no required field renders as a gap");

for (const s of SCENARIOS) {
  for (const phrase of getScenarioPhrases(s.world, s.scenario) ?? []) {
    ok(`phrases: ${s.key}/${phrase.id} has an id`, filled(phrase.id));
    ok(`phrases: ${s.key}/${phrase.id} has English text`, filled(phrase.text));
    ok(`phrases: ${s.key}/${phrase.id} has a Spanish gloss`, filled(phrase.es));
    if (phrase.tip !== undefined) {
      ok(
        `phrases: ${s.key}/${phrase.id} tip is not blank`,
        filled(phrase.tip),
        "an optional field present but empty is worse than absent",
      );
    }
  }
  for (const card of getScenarioVocabulary(s.world, s.scenario) ?? []) {
    ok(`vocabulary: ${s.key}/${card.id} has an id`, filled(card.id));
    ok(`vocabulary: ${s.key}/${card.id} has a term`, filled(card.term));
    ok(`vocabulary: ${s.key}/${card.id} has a Spanish gloss`, filled(card.es));
    ok(`vocabulary: ${s.key}/${card.id} has an example`, filled(card.example));
  }
}

group("banks: item ids are authored, unique and never index-derived");

for (const s of SCENARIOS) {
  const phraseIds = (getScenarioPhrases(s.world, s.scenario) ?? []).map(
    (p) => p.id,
  );
  if (phraseIds.length > 0) {
    ok(
      `phrases: ${s.key} has no duplicate slug`,
      duplicates(phraseIds).length === 0,
      duplicates(phraseIds).join(", "),
    );
    ok(
      `phrases: ${s.key} slugs are not array positions`,
      phraseIds.every((id) => !/^\d+$/.test(id)),
      phraseIds.filter((id) => /^\d+$/.test(id)).join(", "),
    );
  }
  const cardIds = (getScenarioVocabulary(s.world, s.scenario) ?? []).map(
    (c) => c.id,
  );
  if (cardIds.length > 0) {
    ok(
      `vocabulary: ${s.key} has no duplicate slug`,
      duplicates(cardIds).length === 0,
      duplicates(cardIds).join(", "),
    );
    ok(
      `vocabulary: ${s.key} slugs are not array positions`,
      cardIds.every((id) => !/^\d+$/.test(id)),
      cardIds.filter((id) => /^\d+$/.test(id)).join(", "),
    );
  }
}

group("ids: the composed key space is globally unique and disjoint (D-06)");

const composedIds = SCENARIOS.flatMap((s) =>
  scenarioRecallItems(s.world, s.scenario).map((item) => item.id),
);
ok(
  "every composed id is unique across all scenarios",
  duplicates(composedIds).length === 0,
  duplicates(composedIds).join(", "),
);

// The whole reason D-06's format carries a slash: an id collision with an
// existing bank silently merges two different items' review schedules, and
// mergeProgress cannot see it happen.
const grammarIds = new Set(GRAMMAR_QUESTIONS.map((q) => q.id));
const deckCardIds = new Set(VOCAB_DECKS.flatMap((d) => d.cards.map((c) => c.id)));
ok(
  "no composed id collides with a global grammar question id",
  composedIds.every((id) => !grammarIds.has(id)),
  composedIds.filter((id) => grammarIds.has(id)).join(", "),
);
ok(
  "no composed id collides with a deck-browser card id",
  composedIds.every((id) => !deckCardIds.has(id)),
  composedIds.filter((id) => deckCardIds.has(id)).join(", "),
);
ok(
  "reviewableIds() lists every bank's ids exactly once",
  duplicates(reviewableIds()).length === 0,
  duplicates(reviewableIds()).join(", "),
);
// Scenario EXERCISE ids (plan 03-05 onward). These are composed ids too, but
// they are not recall items, so `composedIds` above cannot see them — and
// reviewableIds() has to list them or the "Due today" count and the weak-spots
// drill silently drop every scenario exercise the learner has scheduled.
// Plans 03-06 through 03-10 extend this list with their own bank.
const exerciseIds = SCENARIOS.flatMap((s) =>
  (getScenarioGrammar(s.world, s.scenario) ?? []).map((q) => q.id),
);
ok(
  "reviewableIds() covers every key space",
  reviewableIds().length ===
    grammarIds.size + composedIds.length + exerciseIds.length,
  `${reviewableIds().length} vs ${grammarIds.size} + ${composedIds.length} + ${exerciseIds.length}`,
);

group("ids: composition and parsing are inverses");

for (const s of SCENARIOS) {
  for (const phrase of getScenarioPhrases(s.world, s.scenario) ?? []) {
    const id = scenarioItemId(s.key, "phrase", phrase.id);
    const parsed = parseScenarioItemId(id);
    ok(
      `round trip: ${id}`,
      canon(parsed) ===
        canon({ scenarioKey: s.key, kind: "phrase", localId: phrase.id }),
      canon(parsed),
    );
  }
  for (const card of getScenarioVocabulary(s.world, s.scenario) ?? []) {
    const id = scenarioItemId(s.key, "vocab", card.id);
    const parsed = parseScenarioItemId(id);
    ok(
      `round trip: ${id}`,
      canon(parsed) ===
        canon({ scenarioKey: s.key, kind: "vocab", localId: card.id }),
      canon(parsed),
    );
  }
}

ok(
  "a scenario key the curriculum does not have parses to nothing",
  parseScenarioItemId("social/does-not-exist#phrase#anything") === undefined,
);
ok(
  "a world the curriculum does not have parses to nothing",
  parseScenarioItemId("nowhere/small-talk#phrase#hows-it-going") === undefined,
);
ok(
  "an unknown kind parses to nothing",
  parseScenarioItemId("social/small-talk#riddle#hows-it-going") === undefined,
);
ok(
  "a global grammar id parses to nothing (it is not a scenario item)",
  parseScenarioItemId("a1") === undefined,
);

group("resolution: a due id comes back as its own item (D-05)");

for (const s of SCENARIOS) {
  for (const item of scenarioRecallItems(s.world, s.scenario)) {
    const resolved = resolveReviewItem(item.id);
    ok(
      `resolveReviewItem resolves ${item.id}`,
      resolved?.kind === "recall" && canon(resolved.item) === canon(item),
      canon(resolved),
    );
  }
}
for (const question of GRAMMAR_QUESTIONS) {
  const resolved = resolveReviewItem(question.id);
  ok(
    `resolveReviewItem still resolves grammar ${question.id}`,
    resolved?.kind === "grammar" && resolved.question === question,
  );
}
ok(
  "an id no bank can emit resolves to nothing",
  resolveReviewItem("social/small-talk#phrase#never-authored") === undefined,
);
ok(
  "a structurally invalid id resolves to nothing",
  resolveReviewItem("#") === undefined,
);

group("recall items: what the deck and the review screen both read");

for (const s of SCENARIOS) {
  const items = scenarioRecallItems(s.world, s.scenario);
  const phrases: Phrase[] = getScenarioPhrases(s.world, s.scenario) ?? [];
  const cards: ScenarioVocabCard[] =
    getScenarioVocabulary(s.world, s.scenario) ?? [];
  ok(
    `recall: ${s.key} yields its phrases then its vocabulary`,
    items.length === phrases.length + cards.length,
    `${items.length} vs ${phrases.length} + ${cards.length}`,
  );
  for (const item of items) {
    ok(`recall: ${item.id} shows Spanish on the front`, filled(item.front));
    ok(`recall: ${item.id} reveals English on the back`, filled(item.back));
    ok(
      `recall: ${item.id} carries its scenario as the topic`,
      item.topic === s.title,
      `${item.topic} vs ${s.title}`,
    );
    ok(
      `recall: ${item.id} carries the scenario's level`,
      item.level === s.level,
      `${item.level} vs ${s.level}`,
    );
    if (item.hint !== undefined) {
      ok(`recall: ${item.id} hint is not blank`, filled(item.hint));
    }
  }
}

// DERIVED, never named. Plan 03-01 wrote `social/dating` here as the worked
// example of a scenario with no bank entry; plan 03-02 authored that scenario,
// and a true assertion became a false alarm on content that was correct. Every
// genuinely unwritten scenario is exercised instead, so this keeps binding as
// the banks fill and no plan has to remember to move it.
//
// It runs out at 03-04, when all 35 have both banks — and nothing is lost when
// it does: `recall: <key> yields its phrases then its vocabulary` in the loop
// above asserts `items.length === phrases.length + cards.length` for all 35
// scenarios permanently, of which "0 + 0 yields 0" is the case named here.
const unwritten = SCENARIOS.filter(
  (s) =>
    getScenarioPhrases(s.world, s.scenario) === undefined &&
    getScenarioVocabulary(s.world, s.scenario) === undefined,
);
for (const s of unwritten) {
  const deck = scenarioRecallItems(s.world, s.scenario);
  ok(
    `a scenario with neither bank entry yields an empty deck, never a fallback: ${s.key}`,
    deck.length === 0,
    `${deck.length} item(s)`,
  );
}
ok(
  "a scenario the curriculum does not have yields an empty deck",
  scenarioRecallItems("nowhere", "nothing").length === 0,
);

group("D-01: no two scenarios are handed the same material");

const phraseFingerprints = new Map<string, string>();
const vocabFingerprints = new Map<string, string>();
for (const s of SCENARIOS) {
  const phrases = getScenarioPhrases(s.world, s.scenario);
  if (phrases) {
    const print = canon(phrases);
    const twin = phraseFingerprints.get(print);
    ok(
      `phrases: ${s.key} is written for itself`,
      twin === undefined,
      twin ? `byte-identical to ${twin}` : undefined,
    );
    phraseFingerprints.set(print, s.key);
  }
  const cards = getScenarioVocabulary(s.world, s.scenario);
  if (cards) {
    const print = canon(cards);
    const twin = vocabFingerprints.get(print);
    ok(
      `vocabulary: ${s.key} is written for itself`,
      twin === undefined,
      twin ? `byte-identical to ${twin}` : undefined,
    );
    vocabFingerprints.set(print, s.key);
  }
}

group("the curriculum this phase is measured against");

ok(
  "the curriculum declares 35 scenarios",
  SCENARIOS.length === 35,
  `${SCENARIOS.length}`,
);
ok(
  "the curriculum declares 52 scenario×skill pairs",
  DECLARED_PAIRS.length === 52,
  `${DECLARED_PAIRS.length}`,
);
ok(
  "every scenario declares at least one skill",
  SCENARIOS.every((s) => inRange(s.skills.length, 1, 4)),
  SCENARIOS.filter((s) => !inRange(s.skills.length, 1, 4))
    .map((s) => s.key)
    .join(", "),
);

group("the storage leg: a composed id survives the schema and the merge");

// D-06 rests on two premises about live learner data. Both were checked by
// hand at plan review; neither should have to be checked by hand again.
const smallTalk = scenarioRecallItems("social", "small-talk");
ok(
  "social/small-talk emits items to store in the first place",
  smallTalk.length === 14,
  `${smallTalk.length} item(s)`,
);

// Exactly what recordAttempt writes for a correct first answer (box 1, due in
// BOX_DAYS[1] = 1 day) and for a wrong one (box 0, due today), keyed by the
// composed id — assembled here rather than imported because recordAttempt is a
// React hook and this file has no React.
const stored: ProgressState = {
  ...EMPTY,
  srs: Object.fromEntries(
    smallTalk.map((item, index) => [
      item.id,
      index % 2 === 0 ? { box: 0, due: today() } : { box: 1, due: addDays(1) },
    ]),
  ),
  attempts: Object.fromEntries(
    smallTalk.map((item) => [
      item.id,
      {
        topic: item.topic,
        level: item.level,
        tries: 1,
        wrong: 0,
        resolved: true,
        updatedAt: today(),
      },
    ]),
  ),
};

const readBack = safeReadProgress(JSON.stringify(stored));
for (const item of smallTalk) {
  ok(
    `schema keeps the composed key ${item.id}`,
    readBack.srs[item.id] !== undefined,
    "sanitizeEntries drops an entry it cannot validate — a dropped key is a lost schedule",
  );
}
ok(
  "the schema changes no srs value on the way through",
  canon(readBack.srs) === canon(stored.srs),
  canon(readBack.srs),
);
ok(
  "the schema keeps the per-scenario topic on every attempt",
  Object.values(readBack.attempts).every((a) => a.topic !== "General"),
  "a collapsed topic breaks weakTopics() for all 35 scenarios at once",
);

// The merge unions keys and picks per entry, so an id that survives the schema
// survives the merge — but "so it must be fine" is exactly the reasoning the
// phase's one-way door does not get to rely on.
const mergedForward = mergeProgress(readBack, EMPTY);
const mergedBackward = mergeProgress(EMPTY, readBack);
for (const item of smallTalk) {
  ok(
    `merge keeps the composed key ${item.id}`,
    mergedForward.srs[item.id] !== undefined &&
      mergedBackward.srs[item.id] !== undefined,
  );
}
ok(
  "merging with the empty state is commutative on these keys",
  canon(mergedForward.srs) === canon(mergedBackward.srs),
);
ok(
  "merging this state with itself is idempotent",
  canon(mergeProgress(readBack, readBack).srs) === canon(readBack.srs),
);

// T-03-01 / the reason the id carries the metadata: srsItemSchema is a CLOSED
// two-field object. A fifth field on the value would be dropped on every round
// trip and nobody would see it go.
const withExtra = srsItemSchema.safeParse({
  box: 1,
  due: today(),
  scenario: "social/small-talk",
});
ok(
  "an extra field on a stored srs value is stripped, not carried",
  withExtra.success && canon(withExtra.data) === canon({ box: 1, due: today() }),
  canon(withExtra),
);

// The far end, as far as this file can reach it: what /review selects, and what
// it resolves that selection to. ReviewView does exactly these two steps.
const due = Object.entries(readBack.srs)
  .filter(([, entry]) => entry.due <= today())
  .map(([id]) => id);
ok(
  "the due filter selects the scenario items that are due today",
  due.length === smallTalk.filter((_, i) => i % 2 === 0).length,
  `${due.length} due`,
);
ok(
  "every due scenario id resolves to a renderable recall item",
  due.every((id) => resolveReviewItem(id)?.kind === "recall"),
  due.filter((id) => resolveReviewItem(id) === undefined).join(", "),
);

/* ================================================================== *
 * COVERAGE — the derived registry (plan 03-01, task 2)
 * ================================================================== */

group("coverage: every number is read off a bank, never typed");

ok(
  "the registry has one entry per scenario, in curriculum order",
  canon(SCENARIO_COVERAGE.map((c) => c.key)) === canon(SCENARIOS.map((s) => s.key)),
  canon(SCENARIO_COVERAGE.map((c) => c.key)),
);
for (const s of SCENARIOS) {
  const entry = getScenarioCoverage(s.world, s.scenario);
  ok(`coverage: ${s.key} is resolvable by its slugs`, entry !== undefined);
  if (!entry) continue;
  ok(
    `coverage: ${s.key} phrase count equals the bank's length`,
    entry.phrases === (getScenarioPhrases(s.world, s.scenario) ?? []).length,
    `${entry.phrases}`,
  );
  ok(
    `coverage: ${s.key} vocabulary count equals the bank's length`,
    entry.vocabulary === (getScenarioVocabulary(s.world, s.scenario) ?? []).length,
    `${entry.vocabulary}`,
  );
  ok(
    `coverage: ${s.key} lists exactly the skills it declares, in order`,
    canon(entry.skills.map((k) => k.skill)) === canon(s.skills),
    canon(entry.skills.map((k) => k.skill)),
  );
  ok(
    `coverage: ${s.key} carries its own title and level`,
    entry.title === s.title && entry.level === s.level,
  );
  for (const pair of entry.skills) {
    ok(
      `coverage: ${s.key}:${pair.skill} summary is empty exactly when unavailable`,
      pair.available ? filled(pair.summary) : pair.summary === "",
      `available=${pair.available} summary=${JSON.stringify(pair.summary)}`,
    );
  }
}
ok(
  "coverage: nothing sets `complete` — it is the conjunction of the banks",
  SCENARIO_COVERAGE.every(
    (c) =>
      c.complete ===
      (c.phrases > 0 && c.vocabulary > 0 && c.skills.every((s) => s.available)),
  ),
  SCENARIO_COVERAGE.filter(
    (c) =>
      c.complete !==
      (c.phrases > 0 && c.vocabulary > 0 && c.skills.every((s) => s.available)),
  )
    .map((c) => c.key)
    .join(", "),
);

group("coverage: the totals and the written/unwritten identity");

ok(
  "COVERAGE_TOTALS.pairsTotal is the curriculum's 52 declared pairs",
  COVERAGE_TOTALS.pairsTotal === DECLARED_PAIRS.length &&
    COVERAGE_TOTALS.pairsTotal === 52,
  `${COVERAGE_TOTALS.pairsTotal}`,
);
ok(
  "every registry pair is a pair the curriculum declares",
  canon(
    SCENARIO_COVERAGE.flatMap((c) => c.skills.map((s) => `${c.key}:${s.skill}`)).sort(),
  ) === canon(DECLARED_PAIRS.map((p) => `${p.key}:${p.skill}`).sort()),
);
ok(
  "written + unwritten equals the declared total",
  COVERAGE_TOTALS.pairsWritten + pendingPairs().length ===
    COVERAGE_TOTALS.pairsTotal,
  `${COVERAGE_TOTALS.pairsWritten} + ${pendingPairs().length} vs ${COVERAGE_TOTALS.pairsTotal}`,
);
ok(
  "COVERAGE_TOTALS.scenariosWithPhrases counts the banks, not the accessor",
  COVERAGE_TOTALS.scenariosWithPhrases ===
    SCENARIOS.filter((s) => getScenarioPhrases(s.world, s.scenario)).length,
  `${COVERAGE_TOTALS.scenariosWithPhrases}`,
);
ok(
  "COVERAGE_TOTALS.scenariosWithVocabulary counts the banks",
  COVERAGE_TOTALS.scenariosWithVocabulary ===
    SCENARIOS.filter((s) => getScenarioVocabulary(s.world, s.scenario)).length,
  `${COVERAGE_TOTALS.scenariosWithVocabulary}`,
);

group("coverage: the pending selector is neither short nor long");

// Plans 03-05 through 03-10 each read a ZERO out of this selector as proof of
// completion. A selector that is one pair short would let a skill plan close
// with an unwritten pair; one pair long would make a finished plan look
// unfinished and get the assertion loosened. Both directions, therefore.
const pending = pendingPairs();
const declaredUnavailable = SCENARIO_COVERAGE.flatMap((c) =>
  c.skills.filter((s) => !s.available).map((s) => `${c.key}:${s.skill}`),
);
ok(
  "pendingPairs() has exactly declared-minus-written entries",
  pending.length === COVERAGE_TOTALS.pairsTotal - COVERAGE_TOTALS.pairsWritten,
  `${pending.length}`,
);
ok(
  "every pending pair carries a key and a skill",
  pending.every((p) => filled(p.key) && filled(p.skill)),
);
ok(
  "every pending pair is declared by the curriculum",
  pending.every((p) =>
    DECLARED_PAIRS.some((d) => d.key === p.key && d.skill === p.skill),
  ),
  pending
    .filter(
      (p) => !DECLARED_PAIRS.some((d) => d.key === p.key && d.skill === p.skill),
    )
    .map((p) => `${p.key}:${p.skill}`)
    .join(", "),
);
ok(
  "every declared-and-unavailable pair appears in pendingPairs()",
  canon(pending.map((p) => `${p.key}:${p.skill}`)) === canon(declaredUnavailable),
  canon(pending.map((p) => `${p.key}:${p.skill}`)),
);

group("coverage: driven by a stub — the properties the real banks cannot show");

// The real banks can only ever demonstrate the state they are in today. These
// four cases are the ones the whole plan set rests on, and every one of them is
// a state no bank is in right now.
const STUB_KEY = "social/small-talk";
const stubList = (n: number) => Array.from({ length: n }, (_, i) => i);
const stubFor = (
  key: string,
  phrases: number,
  vocabulary: number,
  skills: Partial<Record<Skill, number | undefined>>,
) =>
  buildScenarioCoverage({
    phrases: (w, s) => (`${w}/${s}` === key ? stubList(phrases) : undefined),
    vocabulary: (w, s) => (`${w}/${s}` === key ? stubList(vocabulary) : undefined),
    exercises: Object.fromEntries(
      (Object.keys(skills) as Skill[]).map((skill) => [
        skill,
        (w: string, s: string) => {
          if (`${w}/${s}` !== key) return undefined;
          const count = skills[skill];
          // `undefined` = no bank entry. A NUMBER — including 0 — is a bank
          // entry that exists; 0 is the emptied-bank control below.
          return count === undefined
            ? undefined
            : { items: stubList(count), unit: "item" };
        },
      ]),
    ),
  }).find((c) => c.key === key)!;

// social/small-talk declares speaking and grammar.
const bothWritten = stubFor(STUB_KEY, 6, 8, { speaking: 3, grammar: 5 });
ok(
  "a scenario with phrases, vocabulary and every declared skill is complete",
  bothWritten.complete === true,
  canon(bothWritten),
);
const oneSkillShort = stubFor(STUB_KEY, 6, 8, { speaking: 3 });
ok(
  "a scenario one declared skill short reports INCOMPLETE",
  oneSkillShort.complete === false &&
    oneSkillShort.skills.filter((s) => s.available).length === 1,
  canon(oneSkillShort.skills),
);
ok(
  "no vocabulary means incomplete even with every skill written",
  stubFor(STUB_KEY, 6, 0, { speaking: 3, grammar: 5 }).complete === false,
);
ok(
  "no phrases means incomplete even with every skill written",
  stubFor(STUB_KEY, 0, 8, { speaking: 3, grammar: 5 }).complete === false,
);

// THE CONTROL. A bank wired but EMPTY must still report its pair unwritten —
// this is what lets plans 03-05 through 03-10 wire a renderer before its
// content exists without the page lying in the meantime, and it is the one
// property no assertion over the real banks can reach today.
const emptiedBank = stubFor(STUB_KEY, 6, 8, { speaking: 0, grammar: 5 });
const emptiedSpeaking = emptiedBank.skills.find((s) => s.skill === "speaking");
ok(
  "a bank that EXISTS but is EMPTY still reports its pair unwritten",
  emptiedSpeaking?.available === false && emptiedSpeaking.summary === "",
  canon(emptiedBank.skills),
);
ok(
  "emptying one bank flips the scenario back to incomplete, with no second edit",
  emptiedBank.complete === false,
);

/* ================================================================== *
 * SCENARIO GRAMMAR — the grammar quarter of D-01 (plan 03-05)
 *
 * `tsc` proves a question has the right FIELDS and is blind to every way one
 * can be type-correct and silently wrong: an `answer` that indexes past its
 * own `options`, two identical options, a prompt with no gap for the answer to
 * go in, a topic that no longer matches the string the learner's stored
 * attempts were filed under, and — worst, because it is invisible and
 * permanent — an id that is not the composed form for its own scenario.
 * ================================================================== */

/** D-04's ratified floor for a scenario×skill grammar pair. */
const MIN_GRAMMAR_QUESTIONS = 5;

/** The gap `GrammarQuiz` splits the prompt on (GrammarQuiz.tsx:28). */
const GAP = "___";

const GRAMMAR_PAIR_KEYS = new Set(
  DECLARED_PAIRS.filter((p) => p.skill === "grammar").map((p) => p.key),
);

group("scenario grammar: every bank key is a pair that declares grammar");

for (const key of scenarioGrammarKeys()) {
  ok(
    `scenario grammar: "${key}" is a real world/scenario pair`,
    SCENARIO_KEYS.has(key),
    "a key nothing can reach serves nobody and never fails on its own",
  );
  ok(
    `scenario grammar: "${key}" actually declares grammar`,
    GRAMMAR_PAIR_KEYS.has(key),
    "questions written for a scenario that does not teach the skill are never rendered",
  );
}

group("scenario grammar: every present set meets D-04's floor");

for (const s of SCENARIOS) {
  const questions = getScenarioGrammar(s.world, s.scenario);
  if (!questions) continue;
  ok(
    `scenario grammar: ${s.key} holds at least ${MIN_GRAMMAR_QUESTIONS}`,
    questions.length >= MIN_GRAMMAR_QUESTIONS,
    `${questions.length} question(s)`,
  );
}

group("scenario grammar: no question is type-correct and silently wrong");

for (const s of SCENARIOS) {
  for (const q of getScenarioGrammar(s.world, s.scenario) ?? []) {
    ok(`scenario grammar: ${q.id} has a prompt`, filled(q.prompt));
    ok(
      `scenario grammar: ${q.id} marks the gap with ${GAP}`,
      q.prompt.includes(GAP),
      "a prompt with no gap renders as a sentence with nowhere to put the answer",
    );
    ok(
      `scenario grammar: ${q.id} offers at least two options`,
      Array.isArray(q.options) && q.options.length >= 2,
      canon(q.options),
    );
    ok(
      `scenario grammar: ${q.id} has no blank option`,
      q.options.every((o) => filled(o)),
      canon(q.options),
    );
    ok(
      `scenario grammar: ${q.id} options are distinct`,
      duplicates(q.options.map((o) => o.trim().toLowerCase())).length === 0,
      duplicates(q.options.map((o) => o.trim().toLowerCase())).join(", "),
    );
    ok(
      `scenario grammar: ${q.id} answer indexes into its OWN options`,
      inRange(q.answer, 0, q.options.length - 1),
      `answer ${String(q.answer)} of ${q.options.length} option(s)`,
    );
    ok(
      `scenario grammar: ${q.id} has an explanation`,
      filled(q.explain),
      "an explanation is required at the type level because an optional one is one an author forgets",
    );
    ok(
      `scenario grammar: ${q.id} carries a topic`,
      filled(q.topic),
      "the topic is the key weakTopics() groups the learner's history by",
    );
    ok(
      `scenario grammar: ${q.id} is at its own scenario's level`,
      q.level === s.level,
      `${q.level} vs ${s.level}`,
    );
  }
}

group("scenario grammar: ids are composed, namespaced and globally unique");

const scenarioGrammarIds: string[] = [];

for (const s of SCENARIOS) {
  const questions = getScenarioGrammar(s.world, s.scenario) ?? [];
  const localIds: string[] = [];
  for (const q of questions) {
    scenarioGrammarIds.push(q.id);
    const parsed = parseScenarioItemId(q.id);
    ok(
      `scenario grammar: ${q.id} parses as a scenario item`,
      parsed !== undefined,
      "an id the parser rejects is stored, merged and never resolved again",
    );
    if (!parsed) continue;
    localIds.push(parsed.localId);
    ok(
      `scenario grammar: ${q.id} names ITS OWN scenario`,
      parsed.scenarioKey === s.key,
      `${parsed.scenarioKey} vs ${s.key}`,
    );
    ok(
      `scenario grammar: ${q.id} is of kind "grammar"`,
      parsed.kind === "grammar",
      parsed.kind,
    );
    ok(
      `scenario grammar: ${q.id} is exactly what scenarioItemId composes`,
      q.id === scenarioItemId(s.key, "grammar", parsed.localId),
      "an id spelled by hand is an id that drifts from the one author of the format",
    );
    ok(
      `scenario grammar: ${q.id} slug is not an array position`,
      !/^\d+$/.test(parsed.localId),
      parsed.localId,
    );
  }
  if (localIds.length > 0) {
    ok(
      `scenario grammar: ${s.key} has no duplicate slug`,
      duplicates(localIds).length === 0,
      duplicates(localIds).join(", "),
    );
  }
}

ok(
  "every scenario grammar id is unique across all scenarios",
  duplicates(scenarioGrammarIds).length === 0,
  duplicates(scenarioGrammarIds).join(", "),
);
ok(
  "no scenario grammar id collides with a GLOBAL grammar question id",
  scenarioGrammarIds.every((id) => !grammarIds.has(id)),
  scenarioGrammarIds.filter((id) => grammarIds.has(id)).join(", "),
);
ok(
  "no scenario grammar id collides with a deck-browser card id",
  scenarioGrammarIds.every((id) => !deckCardIds.has(id)),
  scenarioGrammarIds.filter((id) => deckCardIds.has(id)).join(", "),
);
ok(
  "no scenario grammar id collides with a recall item id",
  scenarioGrammarIds.every((id) => !new Set(composedIds).has(id)),
  scenarioGrammarIds.filter((id) => new Set(composedIds).has(id)).join(", "),
);

group("scenario grammar: a due question resolves back to itself (D-05)");

for (const s of SCENARIOS) {
  for (const q of getScenarioGrammar(s.world, s.scenario) ?? []) {
    const resolved = resolveReviewItem(q.id);
    ok(
      `resolveReviewItem resolves ${q.id}`,
      resolved?.kind === "grammar" && resolved.question === q,
      canon(resolved),
    );
  }
}
ok(
  "reviewableIds() lists every scenario grammar id",
  scenarioGrammarIds.every((id) => new Set(reviewableIds()).has(id)),
  "an id missing here is scheduled correctly and then counted nowhere",
);
ok(
  "a scenario grammar id no bank can emit resolves to nothing",
  resolveReviewItem("social/small-talk#grammar#never-authored") === undefined,
);

group("scenario grammar: no two scenarios are handed the same questions (D-01)");

// Compared WITHOUT the id, because the id names its own scenario and would
// make every set trivially distinct — which is exactly how a copy-pasted set
// with fresh slugs would slip through.
const grammarSetsByKey = SCENARIOS.filter(
  (s) => getScenarioGrammar(s.world, s.scenario) !== undefined,
).map((s) => ({
  key: s.key,
  body: canon(
    (getScenarioGrammar(s.world, s.scenario) ?? []).map((q) => ({
      topic: q.topic,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      explain: q.explain,
    })),
  ),
}));

for (const entry of grammarSetsByKey) {
  const twin = grammarSetsByKey.find(
    (other) => other.key !== entry.key && other.body === entry.body,
  );
  ok(
    `scenario grammar: ${entry.key} is written for itself`,
    twin === undefined,
    twin ? `identical to ${twin.key}` : "",
  );
}

const allPrompts = SCENARIOS.flatMap((s) =>
  (getScenarioGrammar(s.world, s.scenario) ?? []).map((q) =>
    q.prompt.trim().toLowerCase(),
  ),
);
ok(
  "no prompt is repeated anywhere in the scenario grammar corpus",
  duplicates(allPrompts).length === 0,
  duplicates(allPrompts).join(" | "),
);

group("scenario grammar: the registry reports the bank, not the declaration");

for (const pair of DECLARED_PAIRS.filter((p) => p.skill === "grammar")) {
  const coverage = getScenarioCoverage(pair.world, pair.scenario);
  const skill = coverage?.skills.find((s) => s.skill === "grammar");
  const questions = getScenarioGrammar(pair.world, pair.scenario);
  ok(
    `coverage: ${pair.key} grammar availability follows the bank's CONTENTS`,
    skill?.available === ((questions?.length ?? 0) > 0),
    canon(skill),
  );
  if (questions && questions.length > 0) {
    ok(
      `coverage: ${pair.key} grammar summary is a count and a unit`,
      skill?.summary === `${questions.length} questions`,
      skill?.summary,
    );
  }
}

ok(
  "every pair the registry reports as pending grammar has no bank entry",
  pendingPairs()
    .filter((p) => p.skill === "grammar")
    .every((p) => {
      const [w, sc] = p.key.split("/");
      return getScenarioGrammar(w, sc) === undefined;
    }),
  canon(pendingPairs().filter((p) => p.skill === "grammar")),
);

/* ================================================================== *
 * SCENARIO WRITING (plan 03-06)
 *
 * What `tsc` cannot see about a writing task: a word range whose minimum is
 * above its maximum (the desk's "in range" indicator can then never turn on), a
 * model answer that breaks the very brief it is modelling, a checklist line that
 * is a space, a task written at a level that is not its scenario's, an id that
 * is not the composed form for its own scenario — and, particular to this bank,
 * an id that gets SCHEDULED. Nothing scores a writing task, so a writing id in
 * `reviewableIds()` would inflate the "Due today" count with an item that can
 * never come due and hand the weak-spots drill an id that resolves to nothing.
 * ================================================================== */

/** House style in writing.ts is four or five checklist lines. Fewer than four
 * is a brief the learner cannot check herself against, which is the entire
 * feedback loop until the tutor lands in Phase 5. */
const MIN_CHECKLIST_LINES = 4;

/** Counted exactly the way `WritingDesk` counts it (WritingDesk.tsx:38-41), so
 * the range this asserts is the range the learner is actually shown. A
 * different rule here would prove a property nobody sees. */
function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const WRITING_PAIR_KEYS = new Set(
  DECLARED_PAIRS.filter((p) => p.skill === "writing").map((p) => p.key),
);

group("scenario writing: every bank key is a pair that declares writing");

for (const key of scenarioWritingKeys()) {
  ok(
    `scenario writing: "${key}" is a real world/scenario pair`,
    SCENARIO_KEYS.has(key),
    "a key nothing can reach serves nobody and never fails on its own",
  );
  ok(
    `scenario writing: "${key}" actually declares writing`,
    WRITING_PAIR_KEYS.has(key),
    "a task written for a scenario that does not teach the skill is never rendered",
  );
}

group("scenario writing: no field renders as a gap");

for (const s of SCENARIOS) {
  const prompt = getScenarioWriting(s.world, s.scenario);
  if (!prompt) continue;
  ok(`scenario writing: ${prompt.id} has a title`, filled(prompt.title));
  ok(
    `scenario writing: ${prompt.id} has a task`,
    filled(prompt.task),
    "the task IS the exercise; an empty one is a blank editor with no brief",
  );
  ok(
    `scenario writing: ${prompt.id} has a model answer`,
    filled(prompt.model),
    "the model answer is half of the only feedback loop that exists before Phase 5",
  );
  ok(
    `scenario writing: ${prompt.id} offers at least ${MIN_CHECKLIST_LINES} checklist lines`,
    prompt.checklist.length >= MIN_CHECKLIST_LINES,
    `${prompt.checklist.length} line(s)`,
  );
  ok(
    `scenario writing: ${prompt.id} has no blank checklist line`,
    prompt.checklist.every((line) => filled(line)),
    canon(prompt.checklist),
  );
  ok(
    `scenario writing: ${prompt.id} has no repeated checklist line`,
    duplicates(prompt.checklist.map((l) => l.trim().toLowerCase())).length === 0,
    duplicates(prompt.checklist.map((l) => l.trim().toLowerCase())).join(" | "),
  );
  ok(
    `scenario writing: ${prompt.id} is at its own scenario's level`,
    prompt.level === s.level,
    `${prompt.level} vs ${s.level}`,
  );
}

group("scenario writing: the word range is a range, and the model obeys it");

for (const s of SCENARIOS) {
  const prompt = getScenarioWriting(s.world, s.scenario);
  if (!prompt) continue;
  ok(
    `scenario writing: ${prompt.id} asks for more than zero words`,
    Number.isInteger(prompt.minWords) && prompt.minWords > 0,
    String(prompt.minWords),
  );
  ok(
    `scenario writing: ${prompt.id} minimum is strictly below its maximum`,
    Number.isInteger(prompt.maxWords) && prompt.minWords < prompt.maxWords,
    `${prompt.minWords}–${prompt.maxWords}`,
  );
  // A model that breaks its own brief teaches the wrong target: the learner is
  // told 70–120 words and shown 200, and believes the 200.
  const modelWords = wordCount(prompt.model);
  ok(
    `scenario writing: ${prompt.id} model answer meets its own word range`,
    modelWords >= prompt.minWords && modelWords <= prompt.maxWords,
    `${modelWords} words vs ${prompt.minWords}–${prompt.maxWords}`,
  );
}

group("scenario writing: ids are composed, namespaced and globally unique");

const scenarioWritingIds: string[] = [];

for (const s of SCENARIOS) {
  const prompt = getScenarioWriting(s.world, s.scenario);
  if (!prompt) continue;
  scenarioWritingIds.push(prompt.id);
  const parsed = parseScenarioItemId(prompt.id);
  ok(
    `scenario writing: ${prompt.id} parses as a scenario item`,
    parsed !== undefined,
    "an id the parser rejects cannot be reasoned about at all",
  );
  if (!parsed) continue;
  ok(
    `scenario writing: ${prompt.id} names ITS OWN scenario`,
    parsed.scenarioKey === s.key,
    `${parsed.scenarioKey} vs ${s.key}`,
  );
  ok(
    `scenario writing: ${prompt.id} is of kind "writing"`,
    parsed.kind === "writing",
    parsed.kind,
  );
  ok(
    `scenario writing: ${prompt.id} is exactly what scenarioItemId composes`,
    prompt.id === scenarioItemId(s.key, "writing", parsed.localId),
    "an id spelled by hand is an id that drifts from the one author of the format",
  );
  ok(
    `scenario writing: ${prompt.id} slug is not an array position`,
    !/^\d+$/.test(parsed.localId),
    parsed.localId,
  );
}

ok(
  "every scenario writing id is unique across all scenarios",
  duplicates(scenarioWritingIds).length === 0,
  duplicates(scenarioWritingIds).join(", "),
);
// The draft key IS the id (WritingDesk.tsx:22). Two scenarios sharing one id
// would share one draft: the learner's hotel message would open inside the
// support ticket. T-03-14, asserted rather than trusted.
const globalWritingIds = new Set(WRITING_PROMPTS.map((p) => p.id));
ok(
  "no scenario writing id collides with a GLOBAL writing prompt id",
  scenarioWritingIds.every((id) => !globalWritingIds.has(id)),
  scenarioWritingIds.filter((id) => globalWritingIds.has(id)).join(", "),
);
ok(
  "no scenario writing id collides with a global grammar question id",
  scenarioWritingIds.every((id) => !grammarIds.has(id)),
  scenarioWritingIds.filter((id) => grammarIds.has(id)).join(", "),
);
ok(
  "no scenario writing id collides with a deck-browser card id",
  scenarioWritingIds.every((id) => !deckCardIds.has(id)),
  scenarioWritingIds.filter((id) => deckCardIds.has(id)).join(", "),
);
ok(
  "no scenario writing id collides with a recall item id",
  scenarioWritingIds.every((id) => !new Set(composedIds).has(id)),
  scenarioWritingIds.filter((id) => new Set(composedIds).has(id)).join(", "),
);
ok(
  "no scenario writing id collides with a scenario grammar id",
  scenarioWritingIds.every((id) => !new Set(scenarioGrammarIds).has(id)),
  scenarioWritingIds.filter((id) => new Set(scenarioGrammarIds).has(id)).join(", "),
);

group("scenario writing: an unscheduled kind, proved unscheduled");

// The mirror image of the grammar bank's D-05 leg. Grammar ids MUST be in
// reviewableIds(); writing ids must NOT — nothing scores a writing task, so a
// writing id can never come due, and listing one would add a permanent
// phantom to Dashboard's "Due today" count and give ReviewHub's weak-spots
// drill an id that resolves to nothing.
const reviewable = new Set(reviewableIds());
ok(
  "no scenario writing id is listed as reviewable",
  scenarioWritingIds.every((id) => !reviewable.has(id)),
  scenarioWritingIds.filter((id) => reviewable.has(id)).join(", "),
);
for (const id of scenarioWritingIds) {
  ok(
    `resolveReviewItem returns nothing for ${id}`,
    resolveReviewItem(id) === undefined,
    "a writing task is a draft, not a review card — there is nothing to hand /review",
  );
}
ok(
  "a writing id still round-trips through the id format",
  scenarioWritingIds.every(
    (id) => parseScenarioItemId(id)?.kind === "writing",
  ),
  "unscheduled is not the same as unparseable: the draft key depends on this",
);

group("scenario writing: no two scenarios are handed the same task (D-01)");

// Fingerprinted WITHOUT the id, because the id names its own scenario and would
// make every task trivially distinct — exactly how a copy-pasted brief with a
// fresh slug would slip through.
const writingByKey = SCENARIOS.flatMap((s) => {
  const p = getScenarioWriting(s.world, s.scenario);
  if (!p) return [];
  return [
    {
      key: s.key,
      body: canon({
        title: p.title,
        task: p.task,
        checklist: p.checklist,
        model: p.model,
      }),
    },
  ];
});

for (const entry of writingByKey) {
  const twin = writingByKey.find(
    (other) => other.key !== entry.key && other.body === entry.body,
  );
  ok(
    `scenario writing: ${entry.key} is written for itself`,
    twin === undefined,
    twin ? `identical to ${twin.key}` : "",
  );
}

const allWritingTasks = SCENARIOS.flatMap((s) => {
  const p = getScenarioWriting(s.world, s.scenario);
  return p ? [p.task.trim().toLowerCase()] : [];
});
ok(
  "no task statement is repeated anywhere in the scenario writing corpus",
  duplicates(allWritingTasks).length === 0,
  duplicates(allWritingTasks).join(" | "),
);

const allWritingModels = SCENARIOS.flatMap((s) => {
  const p = getScenarioWriting(s.world, s.scenario);
  return p ? [p.model.trim().toLowerCase()] : [];
});
ok(
  "no model answer is repeated anywhere in the scenario writing corpus",
  duplicates(allWritingModels).length === 0,
  "two scenarios sharing a model answer is the D-01 failure in its purest form",
);

// The other way a scenario can be handed material that is not its own: taking
// it from the GLOBAL writing room, which is precisely what the unwritten panel
// tells the learner it is not doing.
const globalTasks = new Set(WRITING_PROMPTS.map((p) => p.task.trim().toLowerCase()));
const globalModels = new Set(
  WRITING_PROMPTS.map((p) => p.model.trim().toLowerCase()),
);
ok(
  "no scenario task is a global writing prompt's task",
  allWritingTasks.every((t) => !globalTasks.has(t)),
  allWritingTasks.filter((t) => globalTasks.has(t)).join(" | "),
);
ok(
  "no scenario model answer is a global writing prompt's model answer",
  allWritingModels.every((m) => !globalModels.has(m)),
  "borrowed material with a scenario title on top is the failure D-01 names",
);

group("scenario writing: the registry reports the bank, not the declaration");

for (const pair of DECLARED_PAIRS.filter((p) => p.skill === "writing")) {
  const coverage = getScenarioCoverage(pair.world, pair.scenario);
  const skill = coverage?.skills.find((s) => s.skill === "writing");
  const prompt = getScenarioWriting(pair.world, pair.scenario);
  ok(
    `coverage: ${pair.key} writing availability follows the bank's CONTENTS`,
    skill?.available === (prompt !== undefined),
    canon(skill),
  );
  if (prompt) {
    ok(
      `coverage: ${pair.key} writing summary is a count and a unit`,
      skill?.summary === "1 task",
      skill?.summary,
    );
  }
}

ok(
  "every pair the registry reports as pending writing has no bank entry",
  pendingPairs()
    .filter((p) => p.skill === "writing")
    .every((p) => {
      const [w, sc] = p.key.split("/");
      return getScenarioWriting(w, sc) === undefined;
    }),
  canon(pendingPairs().filter((p) => p.skill === "writing")),
);

/* ================================================================== *
 * SCENARIO READING — the passages (plans 03-07 and 03-08)
 * ================================================================== */

/** A passage is the most expensive item in the phase (~158 words) and the one
 * a tired author is likeliest to thin out. Two paragraphs is the house style
 * `reading.ts` set; two questions is the point below which "comprehension" is
 * a coin toss dressed as an exercise; three options is the point below which
 * guessing beats reading. */
const MIN_READING_PARAGRAPHS = 2;
const MIN_READING_QUESTIONS = 2;
const MIN_READING_OPTIONS = 3;
const MIN_READING_GLOSSARY = 2;

group("scenario reading: every bank key is a pair that declares reading");

const readingPairKeys = new Set(
  DECLARED_PAIRS.filter((p) => p.skill === "reading").map((p) => p.key),
);
for (const key of scenarioReadingKeys()) {
  ok(
    `scenario reading: "${key}" is a scenario the curriculum has`,
    SCENARIO_KEYS.has(key),
    "a typo'd key is a passage nobody will ever be served",
  );
  ok(
    `scenario reading: "${key}" actually declares reading`,
    readingPairKeys.has(key),
    "a passage for a pair that does not declare reading is content nothing renders",
  );
}

group("scenario reading: no field renders as a gap, and no floor is thinned");

for (const s of SCENARIOS) {
  const passage = getScenarioReading(s.world, s.scenario);
  if (!passage) continue;

  ok(`scenario reading: ${s.key} has a title`, filled(passage.title), passage.title);
  ok(
    `scenario reading: ${s.key} is at its scenario's own level`,
    passage.level === s.level,
    `${passage.level} vs the scenario's ${s.level}`,
  );
  ok(
    `scenario reading: ${s.key} gives an honest minutes estimate`,
    inRange(passage.minutes, 1, 20),
    String(passage.minutes),
  );
  ok(
    `scenario reading: ${s.key} has at least ${MIN_READING_PARAGRAPHS} body paragraphs`,
    passage.body.length >= MIN_READING_PARAGRAPHS,
    `${passage.body.length} paragraph(s)`,
  );
  ok(
    `scenario reading: ${s.key} has no empty paragraph`,
    passage.body.every(filled),
    "a paragraph of spaces renders as a hole in the text",
  );
  ok(
    `scenario reading: ${s.key} glosses at least ${MIN_READING_GLOSSARY} words`,
    passage.glossary.length >= MIN_READING_GLOSSARY,
    `${passage.glossary.length} entr(y/ies)`,
  );
  ok(
    `scenario reading: ${s.key} has no empty glossary entry`,
    passage.glossary.every((g) => filled(g.word) && filled(g.meaning)),
    canon(passage.glossary),
  );
  ok(
    `scenario reading: ${s.key} has no repeated glossary word`,
    duplicates(passage.glossary.map((g) => g.word.trim().toLowerCase()))
      .length === 0,
    duplicates(passage.glossary.map((g) => g.word.trim().toLowerCase())).join(", "),
  );
  ok(
    `scenario reading: ${s.key} asks at least ${MIN_READING_QUESTIONS} questions`,
    passage.questions.length >= MIN_READING_QUESTIONS,
    `${passage.questions.length} question(s)`,
  );

  for (const q of passage.questions) {
    ok(
      `scenario reading: ${s.key}/${q.id} has a question`,
      filled(q.q),
      "an empty stem is a question the learner cannot answer",
    );
    // The field this whole plan exists for. Optional on the global shape so
    // the eighteen existing passages compile; required here, because a
    // learner told she was wrong and never told why has learned nothing.
    ok(
      `scenario reading: ${s.key}/${q.id} explains its key`,
      filled(q.explain),
      "an explanation of spaces is an explanation an author forgot",
    );
  }
}

group("scenario reading: no question is type-correct and silently wrong");

for (const s of SCENARIOS) {
  const passage = getScenarioReading(s.world, s.scenario);
  if (!passage) continue;
  for (const q of passage.questions) {
    ok(
      `scenario reading: ${s.key}/${q.id} offers at least ${MIN_READING_OPTIONS} options`,
      q.options.length >= MIN_READING_OPTIONS,
      `${q.options.length} option(s)`,
    );
    ok(
      `scenario reading: ${s.key}/${q.id} has no empty option`,
      q.options.every(filled),
      canon(q.options),
    );
    // Both of the next two are type-correct and silently wrong: `answer` is a
    // number whatever it points at, and two identical options make the key
    // ambiguous while the component happily marks one of them right (T-03-11).
    ok(
      `scenario reading: ${s.key}/${q.id} answer indexes into its OWN options`,
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length,
      `answer ${q.answer} against ${q.options.length} options`,
    );
    ok(
      `scenario reading: ${s.key}/${q.id} options are distinct`,
      duplicates(q.options.map((o) => o.trim().toLowerCase())).length === 0,
      duplicates(q.options.map((o) => o.trim().toLowerCase())).join(" | "),
    );
  }

  const questionIds = passage.questions.map((q) => q.id);
  ok(
    `scenario reading: ${s.key} question ids are unique within the passage`,
    duplicates(questionIds).length === 0,
    duplicates(questionIds).join(", "),
  );
  ok(
    `scenario reading: ${s.key} question ids are authored, not array positions`,
    questionIds.every((id) => filled(id) && !/^\d+$/.test(id)),
    questionIds.join(", "),
  );
  ok(
    `scenario reading: ${s.key} asks each question once`,
    duplicates(passage.questions.map((q) => q.q.trim().toLowerCase())).length ===
      0,
    "the same stem twice in one passage is fatigue, not practice",
  );
  ok(
    `scenario reading: ${s.key} explains each key in its own words`,
    duplicates(passage.questions.map((q) => q.explain.trim().toLowerCase()))
      .length === 0,
    "one explanation pasted under two keys explains neither",
  );
}

group("scenario reading: ids are composed, namespaced and globally unique");

const scenarioReadingIds: string[] = [];

for (const s of SCENARIOS) {
  const passage = getScenarioReading(s.world, s.scenario);
  if (!passage) continue;
  scenarioReadingIds.push(passage.id);
  const parsed = parseScenarioItemId(passage.id);
  ok(
    `scenario reading: ${passage.id} parses as a scenario item`,
    parsed !== undefined,
    "an id the parser rejects cannot be reasoned about at all",
  );
  if (!parsed) continue;
  ok(
    `scenario reading: ${passage.id} names ITS OWN scenario`,
    parsed.scenarioKey === s.key,
    `${parsed.scenarioKey} vs ${s.key}`,
  );
  ok(
    `scenario reading: ${passage.id} is of kind "reading"`,
    parsed.kind === "reading",
    parsed.kind,
  );
  ok(
    `scenario reading: ${passage.id} is exactly what scenarioItemId composes`,
    passage.id === scenarioItemId(s.key, "reading", parsed.localId),
    "an id spelled by hand is an id that drifts from the one author of the format",
  );
  ok(
    `scenario reading: ${passage.id} slug is not an array position`,
    !/^\d+$/.test(parsed.localId),
    parsed.localId,
  );
}

ok(
  "every scenario reading id is unique across all scenarios",
  duplicates(scenarioReadingIds).length === 0,
  duplicates(scenarioReadingIds).join(", "),
);
// The reason this bank composes an id at all: a scenario passage and a global
// one now share the `Passage` shape, and the global ids are bare slugs
// ("coffee", "market"). Without the namespace the two banks share one flat key
// space and nothing would notice a collision.
const globalPassageIds = new Set(PASSAGES.map((p) => p.id));
ok(
  "no scenario reading id collides with a GLOBAL passage id",
  scenarioReadingIds.every((id) => !globalPassageIds.has(id)),
  scenarioReadingIds.filter((id) => globalPassageIds.has(id)).join(", "),
);
ok(
  "no scenario reading id collides with a global grammar question id",
  scenarioReadingIds.every((id) => !grammarIds.has(id)),
  scenarioReadingIds.filter((id) => grammarIds.has(id)).join(", "),
);
ok(
  "no scenario reading id collides with a deck-browser card id",
  scenarioReadingIds.every((id) => !deckCardIds.has(id)),
  scenarioReadingIds.filter((id) => deckCardIds.has(id)).join(", "),
);
ok(
  "no scenario reading id collides with a recall item id",
  scenarioReadingIds.every((id) => !new Set(composedIds).has(id)),
  scenarioReadingIds.filter((id) => new Set(composedIds).has(id)).join(", "),
);
ok(
  "no scenario reading id collides with a scenario grammar id",
  scenarioReadingIds.every((id) => !new Set(scenarioGrammarIds).has(id)),
  scenarioReadingIds.filter((id) => new Set(scenarioGrammarIds).has(id)).join(", "),
);
ok(
  "no scenario reading id collides with a scenario writing id",
  scenarioReadingIds.every((id) => !new Set(scenarioWritingIds).has(id)),
  scenarioReadingIds.filter((id) => new Set(scenarioWritingIds).has(id)).join(", "),
);

group("scenario reading: an unscheduled kind, proved unscheduled");

// The same mirror image plan 03-06 asserted for writing, and asserted here
// rather than assumed because the cost of guessing wrong is symmetric.
// `PassageReader` scores in place and never calls `recordAttempt`, so nothing
// writes srs["…#reading#…"] — listing these ids would put a permanent phantom
// in Dashboard's "Due today" count and hand ReviewHub's weak-spots drill an id
// that resolves to nothing. Grammar ids MUST be reviewable; these must NOT.
const reviewableForReading = new Set(reviewableIds());
ok(
  "no scenario reading id is listed as reviewable",
  scenarioReadingIds.every((id) => !reviewableForReading.has(id)),
  scenarioReadingIds.filter((id) => reviewableForReading.has(id)).join(", "),
);
for (const id of scenarioReadingIds) {
  ok(
    `resolveReviewItem returns nothing for ${id}`,
    resolveReviewItem(id) === undefined,
    "a comprehension question torn out of its passage is not a review card — the passage IS the question",
  );
}
ok(
  "a reading id still round-trips through the id format",
  scenarioReadingIds.every((id) => parseScenarioItemId(id)?.kind === "reading"),
  "unscheduled is not the same as unparseable",
);

group("scenario reading: no two scenarios are handed the same passage (D-01)");

// Fingerprinted WITHOUT the id, because the id names its own scenario and would
// make every passage trivially distinct — exactly how a copy-pasted text with a
// fresh slug would slip through.
const readingByKey = SCENARIOS.flatMap((s) => {
  const p = getScenarioReading(s.world, s.scenario);
  if (!p) return [];
  return [
    {
      key: s.key,
      body: canon({
        title: p.title,
        body: p.body,
        glossary: p.glossary,
        questions: p.questions.map((q) => ({
          q: q.q,
          options: q.options,
          answer: q.answer,
          explain: q.explain,
        })),
      }),
    },
  ];
});

for (const entry of readingByKey) {
  const twin = readingByKey.find(
    (other) => other.key !== entry.key && other.body === entry.body,
  );
  ok(
    `scenario reading: ${entry.key} is written for itself`,
    twin === undefined,
    twin ? `identical to ${twin.key}` : "",
  );
}

const allReadingTexts = SCENARIOS.flatMap((s) => {
  const p = getScenarioReading(s.world, s.scenario);
  return p ? [p.body.join(" ").trim().toLowerCase()] : [];
});
ok(
  "no passage text is repeated anywhere in the scenario reading corpus",
  duplicates(allReadingTexts).length === 0,
  "two scenarios sharing a text is the D-01 failure in its purest form",
);
const allReadingTitles = SCENARIOS.flatMap((s) => {
  const p = getScenarioReading(s.world, s.scenario);
  return p ? [p.title.trim().toLowerCase()] : [];
});
ok(
  "no passage title is repeated anywhere in the scenario reading corpus",
  duplicates(allReadingTitles).length === 0,
  duplicates(allReadingTitles).join(" | "),
);

// The other way a scenario can be handed material that is not its own: taking
// it from the GLOBAL reading room, which is precisely what the unwritten panel
// tells the learner it is not doing.
const globalTexts = new Set(
  PASSAGES.map((p) => p.body.join(" ").trim().toLowerCase()),
);
const globalTitles = new Set(PASSAGES.map((p) => p.title.trim().toLowerCase()));
ok(
  "no scenario passage is a global reading-room passage",
  allReadingTexts.every((t) => !globalTexts.has(t)),
  allReadingTexts.filter((t) => globalTexts.has(t)).join(" | "),
);
ok(
  "no scenario passage takes a global reading-room title",
  allReadingTitles.every((t) => !globalTitles.has(t)),
  allReadingTitles.filter((t) => globalTitles.has(t)).join(" | "),
);

group("scenario reading: the registry reports the bank, not the declaration");

for (const pair of DECLARED_PAIRS.filter((p) => p.skill === "reading")) {
  const coverage = getScenarioCoverage(pair.world, pair.scenario);
  const skill = coverage?.skills.find((s) => s.skill === "reading");
  const passage = getScenarioReading(pair.world, pair.scenario);
  ok(
    `coverage: ${pair.key} reading availability follows the bank's CONTENTS`,
    skill?.available === (passage !== undefined),
    canon(skill),
  );
  if (passage) {
    ok(
      `coverage: ${pair.key} reading summary is a count and a unit`,
      skill?.summary === "1 passage",
      skill?.summary,
    );
  }
}

ok(
  "every pair the registry reports as pending reading has no bank entry",
  pendingPairs()
    .filter((p) => p.skill === "reading")
    .every((p) => {
      const [w, sc] = p.key.split("/");
      return getScenarioReading(w, sc) === undefined;
    }),
  canon(pendingPairs().filter((p) => p.skill === "reading")),
);

/* ------------------------------------------------------------------ *
 * Scenario speaking (plans 03-09 and 03-10) — the rehearsal tasks.
 *
 * Thirty of the fifty-two pairs declare speaking, and twenty-one of them used
 * to be handed the SAME three generic lines as every other scenario in their
 * world. That is D-01's named failure, and this is the only skill where it
 * actually happened — so the assertions below mechanise it rather than trusting
 * authoring care: no two scenarios may share a task, and no two may share a
 * move list either (T-03-20).
 * ------------------------------------------------------------------ */

const SPEAKING_MOVES = 3;
// The measured budget. Around sixty words is the shape; a task that runs much
// longer is a briefing in disguise and duplicates the lesson the scenario
// already has one step up the page.
const MIN_SPEAKING_WORDS = 40;
const MAX_SPEAKING_WORDS = 100;

function speakingWords(task: {
  setup: string;
  moves: readonly string[];
  success: string;
}): number {
  return [task.setup, ...task.moves, task.success]
    .join(" ")
    .trim()
    .split(/\s+/).length;
}

group("scenario speaking: every key names a pair that DECLARES speaking");

const speakingPairKeys = new Set(
  DECLARED_PAIRS.filter((p) => p.skill === "speaking").map((p) => p.key),
);

for (const key of scenarioSpeakingKeys()) {
  // Iterating the curriculum can never reach a typo'd key — it would simply
  // never be looked up, and the pair would silently report unwritten forever.
  ok(
    `scenario speaking: bank key ${key} is a pair that declares speaking`,
    speakingPairKeys.has(key),
    "a key naming no scenario, or a scenario that does not declare speaking, is content nobody will ever see",
  );
}

ok(
  "every scenario speaking key is spelled once",
  duplicates(scenarioSpeakingKeys()).length === 0,
  duplicates(scenarioSpeakingKeys()).join(", "),
);

for (const s of SCENARIOS) {
  if (s.skills.includes("speaking")) continue;
  ok(
    `scenario speaking: ${s.key} has no task because it declares no speaking`,
    getScenarioSpeaking(s.world, s.scenario) === undefined,
    "a task on a pair the curriculum never declared is practice with no way in",
  );
}

group("scenario speaking: the shape is uniform — three moves, every field filled");

for (const s of SCENARIOS) {
  const task = getScenarioSpeaking(s.world, s.scenario);
  if (!task) continue;
  ok(
    `scenario speaking: ${s.key} has exactly ${SPEAKING_MOVES} moves`,
    task.moves.length === SPEAKING_MOVES,
    `${task.moves.length} move(s) — the count is the shape, not a floor`,
  );
  ok(
    `scenario speaking: ${s.key} names the situation`,
    filled(task.setup),
    "a setup of spaces is a rehearsal with nobody in it",
  );
  ok(
    `scenario speaking: ${s.key} has a title`,
    filled(task.title),
    task.title,
  );
  ok(
    `scenario speaking: ${s.key} says how the learner knows it worked`,
    filled(task.success),
    "without a success line the learner has performed, not practised",
  );
  ok(
    `scenario speaking: ${s.key} has no empty move`,
    task.moves.every(filled),
    canon(task.moves),
  );
  ok(
    `scenario speaking: ${s.key} does not ask for the same move twice`,
    duplicates(task.moves.map((m) => m.trim().toLowerCase())).length === 0,
    "three moves that are two moves is fatigue, not a rehearsal",
  );
  const words = speakingWords(task);
  ok(
    `scenario speaking: ${s.key} sits inside the ${MIN_SPEAKING_WORDS}–${MAX_SPEAKING_WORDS} word budget`,
    inRange(words, MIN_SPEAKING_WORDS, MAX_SPEAKING_WORDS),
    `${words} words`,
  );
}

group("scenario speaking: each task is written at ITS OWN scenario's level");

for (const s of SCENARIOS) {
  const task = getScenarioSpeaking(s.world, s.scenario);
  if (!task) continue;
  // The cheapest mechanical sign that a task has drifted away from the scenario
  // it belongs to — a C1 rehearsal filed under an A2 situation is the shape a
  // copied task takes.
  ok(
    `scenario speaking: ${s.key} is at level ${s.level}`,
    task.level === s.level,
    `${task.level} vs the curriculum's ${s.level}`,
  );
}

group("scenario speaking: ids are composed, namespaced and globally unique");

const scenarioSpeakingIds: string[] = [];

for (const s of SCENARIOS) {
  const task = getScenarioSpeaking(s.world, s.scenario);
  if (!task) continue;
  scenarioSpeakingIds.push(task.id);
  const parsed = parseScenarioItemId(task.id);
  ok(
    `scenario speaking: ${task.id} parses as a scenario item`,
    parsed !== undefined,
    "an id the parser rejects cannot be reasoned about at all",
  );
  if (!parsed) continue;
  ok(
    `scenario speaking: ${task.id} names ITS OWN scenario`,
    parsed.scenarioKey === s.key,
    `${parsed.scenarioKey} vs ${s.key}`,
  );
  ok(
    `scenario speaking: ${task.id} is of kind "speaking"`,
    parsed.kind === "speaking",
    parsed.kind,
  );
  ok(
    `scenario speaking: ${task.id} is exactly what scenarioItemId composes`,
    task.id === scenarioItemId(s.key, "speaking", parsed.localId),
    "an id spelled by hand is an id that drifts from the one author of the format",
  );
  ok(
    `scenario speaking: ${task.id} slug is not an array position`,
    !/^\d+$/.test(parsed.localId),
    parsed.localId,
  );
}

ok(
  "every scenario speaking id is unique across all scenarios",
  duplicates(scenarioSpeakingIds).length === 0,
  duplicates(scenarioSpeakingIds).join(", "),
);

// The per-id "is exactly what scenarioItemId composes" assertion above is
// weaker than it looks and was caught being so by a mutation: it recomposes
// from the localId it just PARSED OUT of the same id, so an id hand-spelled in
// the correct format satisfies it tautologically. The one-author rule is a
// property of the SOURCE, so it is asserted at the source — the separator is
// review-items.ts's to spell, and this bank must reach it only through
// `scenarioItemId`. Scoped to the format itself rather than to the character,
// so a task that one day mentions a hashtag out loud does not fail the build.
const bankSource = readFileSync(
  new URL("../src/lib/content/scenario-speaking.ts", import.meta.url),
  "utf8",
);
const bankCode = bankSource
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^[ \t]*\/\/.*$/gm, " ");
ok(
  "the speaking bank never spells the id format by hand",
  !bankCode.includes("#speaking#") &&
    !/#\$\{/.test(bankCode) &&
    bankCode.includes("scenarioItemId("),
  "the id is a one-way door on live learner data, so it gets exactly one author",
);
ok(
  "no scenario speaking id collides with a global grammar question id",
  scenarioSpeakingIds.every((id) => !grammarIds.has(id)),
  scenarioSpeakingIds.filter((id) => grammarIds.has(id)).join(", "),
);
ok(
  "no scenario speaking id collides with a deck-browser card id",
  scenarioSpeakingIds.every((id) => !deckCardIds.has(id)),
  scenarioSpeakingIds.filter((id) => deckCardIds.has(id)).join(", "),
);
ok(
  "no scenario speaking id collides with a recall item id",
  scenarioSpeakingIds.every((id) => !new Set(composedIds).has(id)),
  scenarioSpeakingIds.filter((id) => new Set(composedIds).has(id)).join(", "),
);
ok(
  "no scenario speaking id collides with a scenario grammar id",
  scenarioSpeakingIds.every((id) => !new Set(scenarioGrammarIds).has(id)),
  scenarioSpeakingIds
    .filter((id) => new Set(scenarioGrammarIds).has(id))
    .join(", "),
);
ok(
  "no scenario speaking id collides with a scenario writing id",
  scenarioSpeakingIds.every((id) => !new Set(scenarioWritingIds).has(id)),
  scenarioSpeakingIds
    .filter((id) => new Set(scenarioWritingIds).has(id))
    .join(", "),
);
ok(
  "no scenario speaking id collides with a scenario reading id",
  scenarioSpeakingIds.every((id) => !new Set(scenarioReadingIds).has(id)),
  scenarioSpeakingIds
    .filter((id) => new Set(scenarioReadingIds).has(id))
    .join(", "),
);

group("scenario speaking: an unscheduled kind, proved unscheduled");

// The third bank in this phase to answer "does the renderer score anything?"
// with no, and the third to assert the negative rather than leave an omission
// that looks like one. `SpeakingTaskPanel` awards XP and records the day's
// activity; it never calls `recordAttempt`, so nothing writes
// srs["…#speaking#…"]. Listing these ids would put a permanent phantom in
// Dashboard's "Due today" count and hand ReviewHub's weak-spots drill an id
// that resolves to nothing.
const reviewableForSpeaking = new Set(reviewableIds());
ok(
  "no scenario speaking id is listed as reviewable",
  scenarioSpeakingIds.every((id) => !reviewableForSpeaking.has(id)),
  scenarioSpeakingIds.filter((id) => reviewableForSpeaking.has(id)).join(", "),
);
for (const id of scenarioSpeakingIds) {
  ok(
    `resolveReviewItem returns nothing for ${id}`,
    resolveReviewItem(id) === undefined,
    "a ticked self-check is a self-report — there is nothing to bring back and nothing that could mark it wrong",
  );
}
ok(
  "a speaking id still round-trips through the id format",
  scenarioSpeakingIds.every(
    (id) => parseScenarioItemId(id)?.kind === "speaking",
  ),
  "unscheduled is not the same as unparseable",
);

group("scenario speaking: no two scenarios are handed the same rehearsal (D-01)");

// Fingerprinted WITHOUT the id, because the id names its own scenario and would
// make every task trivially distinct — exactly how a copy-pasted task with a
// fresh slug would slip through.
const speakingByKey = SCENARIOS.flatMap((s) => {
  const t = getScenarioSpeaking(s.world, s.scenario);
  if (!t) return [];
  return [
    {
      key: s.key,
      body: canon({
        title: t.title,
        setup: t.setup,
        moves: t.moves,
        success: t.success,
      }),
      moves: canon(t.moves.map((m) => m.trim().toLowerCase())),
    },
  ];
});

for (const entry of speakingByKey) {
  const twin = speakingByKey.find(
    (other) => other.key !== entry.key && other.body === entry.body,
  );
  ok(
    `scenario speaking: ${entry.key} is written for itself`,
    twin === undefined,
    twin ? `identical to ${twin.key}` : "",
  );
  // The sharper half. A shared MOVE LIST is what a generic set actually looks
  // like once someone has given it a scenario-specific setup on top — the
  // WORLD_FALLBACK failure, wearing a hat.
  const moveTwin = speakingByKey.find(
    (other) => other.key !== entry.key && other.moves === entry.moves,
  );
  ok(
    `scenario speaking: ${entry.key} has its own three moves`,
    moveTwin === undefined,
    moveTwin ? `the same move list as ${moveTwin.key}` : "",
  );
}

const allSpeakingTitles = SCENARIOS.flatMap((s) => {
  const t = getScenarioSpeaking(s.world, s.scenario);
  return t ? [t.title.trim().toLowerCase()] : [];
});
ok(
  "no rehearsal title is repeated anywhere in the scenario speaking corpus",
  duplicates(allSpeakingTitles).length === 0,
  duplicates(allSpeakingTitles).join(" | "),
);

const allSpeakingSetups = SCENARIOS.flatMap((s) => {
  const t = getScenarioSpeaking(s.world, s.scenario);
  return t ? [t.setup.trim().toLowerCase()] : [];
});
ok(
  "no rehearsal setup is repeated anywhere in the scenario speaking corpus",
  duplicates(allSpeakingSetups).length === 0,
  "two scenarios sharing a situation is the D-01 failure in its purest form",
);

const allSpeakingSuccess = SCENARIOS.flatMap((s) => {
  const t = getScenarioSpeaking(s.world, s.scenario);
  return t ? [t.success.trim().toLowerCase()] : [];
});
ok(
  "no success line is repeated anywhere in the scenario speaking corpus",
  duplicates(allSpeakingSuccess).length === 0,
  duplicates(allSpeakingSuccess).join(" | "),
);

group("scenario speaking: practicable with no AI and no microphone");

// The plan's own promise, run as a script rather than reread. T-03-21: an
// exercise that only works once an API key is configured is not practice today,
// and the tutor role-play that WILL give live correction is Phase 5's.
const panelSource = readFileSync(
  new URL("../src/components/practice/SpeakingTaskPanel.tsx", import.meta.url),
  "utf8",
);
// Comments are stripped first, so the paragraphs explaining why these calls are
// absent cannot themselves fail the assertion that they are absent.
const panelCode = panelSource
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^[ \t]*\/\/.*$/gm, " ");

for (const forbidden of [
  "fetch(",
  "speechSynthesis",
  "SpeechRecognition",
  "SpeechSynthesisUtterance",
  "getUserMedia",
  "MediaRecorder",
]) {
  ok(
    `SpeakingTaskPanel does not use ${forbidden}`,
    !panelCode.includes(forbidden),
    "the rehearsal must work with no network, no microphone and no API key",
  );
}
// The other half of the same promise, and the one that keeps the unscheduled
// assertion above honest at the source rather than at the id.
ok(
  "SpeakingTaskPanel does not call recordAttempt",
  !panelCode.includes("recordAttempt"),
  "a ticked self-check is not an answer; scheduling one puts an unfalsifiable item in the review queue",
);
ok(
  "SpeakingTaskPanel awards XP through addSkillXp and records the day",
  panelCode.includes("addSkillXp(\"speaking\"") &&
    panelCode.includes("recordActivity()"),
  "the panel must write through the progress hook, and no new progress field",
);

group("scenario speaking: the registry reports the bank, not the declaration");

for (const pair of DECLARED_PAIRS.filter((p) => p.skill === "speaking")) {
  const coverage = getScenarioCoverage(pair.world, pair.scenario);
  const skill = coverage?.skills.find((s) => s.skill === "speaking");
  const task = getScenarioSpeaking(pair.world, pair.scenario);
  ok(
    `coverage: ${pair.key} speaking availability follows the bank's CONTENTS`,
    skill?.available === (task !== undefined),
    canon(skill),
  );
  if (task) {
    ok(
      `coverage: ${pair.key} speaking summary is a count and a unit`,
      skill?.summary === "1 rehearsal",
      skill?.summary,
    );
  }
}

ok(
  "every pair the registry reports as pending speaking has no bank entry",
  pendingPairs()
    .filter((p) => p.skill === "speaking")
    .every((p) => {
      const [w, sc] = p.key.split("/");
      return getScenarioSpeaking(w, sc) === undefined;
    }),
  canon(pendingPairs().filter((p) => p.skill === "speaking")),
);

/* ================================================================== *
 * NO SILENT FALLBACK — the invariant that REPLACES the deleted one
 * (plan 03-11)
 *
 * `phrases.ts` used to export a lenient accessor reading through a per-world
 * generic record. Under it, a scenario with no set of its own was handed three
 * lines shared by every scenario in its world — indistinguishable on screen
 * from content written for the situation, and precisely what D-01 rejected.
 * Both are deleted. Nothing in the module can now substitute one scenario's
 * phrases for another's, because there is nothing left to substitute FROM.
 *
 * That deletion is only safe while every scenario has its own set, so this is
 * the assertion that keeps it safe. It would have been FALSE for most of this
 * phase (9/35 at the tracer, 27/35 at 03-03) and became true at 03-04. From
 * here it is the guard: a Phase 4 scenario added with no phrase set fails HERE,
 * at authoring time, rather than being served a neighbour's at read time.
 *
 * If this fails, write the missing scenario's six phrases. Do not reintroduce
 * a fallback, and do not relax the assertion to `!== undefined` — an empty
 * array is a scenario with nothing to practise, which is the same lie in a
 * quieter voice.
 * ================================================================== */

group("no silent fallback: every scenario resolves to a phrase set of its own");

for (const s of SCENARIOS) {
  const set = getScenarioPhrases(s.world, s.scenario);
  ok(
    `phrases: ${s.key} resolves to a NON-EMPTY set of its own`,
    set !== undefined && set.length > 0,
    "the per-world fallback is deleted, so this is now a hole rather than a silent substitution",
  );
}

// Read at the source, comments stripped first — otherwise the paragraph at the
// head of the module explaining why the fallback is gone would itself fail the
// assertion that it is gone. Same technique as the speaking panel's promise
// above (03-09), and the same reason.
const phraseModuleCode = readFileSync(
  new URL("../src/lib/content/phrases.ts", import.meta.url),
  "utf8",
)
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^[ \t]*\/\/.*$/gm, " ");

ok(
  "the phrase module exports no lenient accessor and no per-world fallback",
  !phraseModuleCode.includes("WORLD_FALLBACK") &&
    !/[^A-Za-z]getPhrases\s*\(/.test(phraseModuleCode),
  "one accessor, and it is strict — a second one that cannot return empty is how a claim outruns the bank",
);

/* ================================================================== *
 * THE DECLARED GAPS, CLOSED (plan 03-11)
 *
 * Three assertions in this file were written down as having less grip than
 * their labels imply. Each was declared rather than hidden, which is why they
 * could be found and closed; each was left open for a stated reason, and every
 * one of those reasons has since expired.
 *
 *   WINDOWS 39 (03-08) — `no passage text is repeated` fingerprints the JOINED
 *     body, so a passage borrowing ONE paragraph from another scenario is not
 *     caught. Mutation M23 reproduces it and SURVIVES. Left open because 03-09
 *     held uncommitted work in this file; that work is committed.
 *   WINDOWS 41 (03-10) — `is written for itself` fingerprints the whole task
 *     and `has its own three moves` the whole move list, so two scenarios
 *     sharing a SINGLE move are caught by neither. Left for "the plan that owns
 *     the harness next", which is this one.
 *   03-09's finding — the per-id "is exactly what scenarioItemId composes"
 *     line recomposes from a localId parsed out of that same id, so it is
 *     tautological. 03-09 fixed its own bank at the SOURCE and recorded that
 *     03-05's, 03-06's and 03-07's carry the identical hole. Those three are
 *     closed here, by the same technique.
 *
 * All three corpora are clean today, measured out of band before these ran:
 * 31 reading paragraphs all distinct with a highest cross-scenario Jaccard of
 * 0.081, and 90 moves all distinct with zero of 3,915 cross-scenario pairs at
 * or above 0.5. So these assertions add no work — they make a property that was
 * true by an author's care true by the gate instead, which is what Phase 4
 * needs, since Phase 4 adds the scenarios these banks will grow by.
 * ================================================================== */

group("D-01 at a finer grain: no borrowed paragraph, no borrowed move");

// WINDOWS 39. A whole-body fingerprint is the wrong grain for how a copy-paste
// actually happens: nobody duplicates a 300-word passage, they lift a paragraph.
const scenarioParagraphs: { key: string; index: number; text: string }[] = [];
for (const s of SCENARIOS) {
  const passage = getScenarioReading(s.world, s.scenario);
  if (!passage) continue;
  passage.body.forEach((paragraph, index) =>
    scenarioParagraphs.push({ key: s.key, index, text: canon(paragraph.trim()) }),
  );
}
for (let a = 0; a < scenarioParagraphs.length; a += 1) {
  for (let b = a + 1; b < scenarioParagraphs.length; b += 1) {
    const x = scenarioParagraphs[a];
    const y = scenarioParagraphs[b];
    if (x.key === y.key) continue;
    ok(
      `scenario reading: ${x.key} paragraph ${x.index} is not ${y.key} paragraph ${y.index}`,
      x.text !== y.text,
      "a passage that borrows ONE paragraph from another scenario is D-01's failure at the grain it really happens",
    );
  }
}

// WINDOWS 41. Same argument one skill over: a tired author does not hand over a
// whole rehearsal, they reuse the move they already found the words for.
const scenarioMoves: { key: string; index: number; text: string }[] = [];
for (const s of SCENARIOS) {
  const task = getScenarioSpeaking(s.world, s.scenario);
  if (!task) continue;
  task.moves.forEach((move, index) =>
    scenarioMoves.push({ key: s.key, index, text: canon(move.trim()) }),
  );
}
for (let a = 0; a < scenarioMoves.length; a += 1) {
  for (let b = a + 1; b < scenarioMoves.length; b += 1) {
    const x = scenarioMoves[a];
    const y = scenarioMoves[b];
    if (x.key === y.key) continue;
    ok(
      `scenario speaking: ${x.key} move ${x.index + 1} is not ${y.key} move ${y.index + 1}`,
      x.text !== y.text,
      "the task and move-list fingerprints are both whole-field, so a single borrowed move passes them",
    );
  }
}

group("the one-author rule, asserted at the source in every exercise bank");

// 03-09's technique, applied to the three banks it identified as carrying the
// same tautological per-id line. Whether an id was PRODUCED BY `scenarioItemId`
// is a property of the source and cannot be recovered from the string, so it
// is checked where it is decidable. Comments stripped first, so the paragraphs
// explaining the rule cannot satisfy it.
for (const [label, path, literal] of [
  ["grammar", "../src/lib/content/scenario-grammar.ts", "#grammar#"],
  ["writing", "../src/lib/content/scenario-writing.ts", "#writing#"],
  ["reading", "../src/lib/content/scenario-reading.ts", "#reading#"],
] as const) {
  const code = readFileSync(new URL(path, import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^[ \t]*\/\/.*$/gm, " ");
  ok(
    `the ${label} bank never spells the id format by hand`,
    !code.includes(literal) &&
      !/#\$\{/.test(code) &&
      code.includes("scenarioItemId("),
    "the id is a one-way door on live learner data, so it gets exactly one author",
  );
}

/* ================================================================== *
 * PHASE 4 (plan 04-01) — the deck's batching, the advertised sitting,
 * and the saturated payload.
 *
 * Three groups appended under the header's two-edit rule. The first two close
 * the Wave-0 gaps 04-RESEARCH named; the third turns 03-11's hand-measured
 * payload figure into a gate.
 * ================================================================== */

group("the recall deck arrives in batches (D-03)");

// The chunking has ONE author (src/lib/recall-batches.ts) and the properties
// are asserted on that pure function rather than on the component, so they stay
// proved when the component is restyled. Synthetic lengths first, because a
// property is easier to falsify on lengths the content does not happen to have.
for (let n = 0; n <= 60; n += 1) {
  const input = Array.from({ length: n }, (_, k) => k);
  const batches = recallBatches(input);

  ok(
    `batches(${n}): concatenating the batches reproduces the input, in order`,
    canon(batches.flat()) === canon(input),
    canon(batches.map((b) => b.length)),
  );
  ok(
    `batches(${n}): no batch is empty`,
    batches.every((b) => b.length > 0),
    canon(batches.map((b) => b.length)),
  );
  ok(
    `batches(${n}): no batch exceeds the ceiling of ${RECALL_BATCH_CEILING}`,
    batches.every((b) => b.length <= RECALL_BATCH_CEILING),
    canon(batches.map((b) => b.length)),
  );

  if (n === 0) {
    ok(
      "batches(0): an empty deck yields NO batches, not one empty batch",
      batches.length === 0,
      `${batches.length} batch(es)`,
    );
    continue;
  }

  // The property that keeps the thirty scenarios this phase never touches
  // byte-identical on screen: at or below the ceiling there is no batching.
  if (n <= RECALL_BATCH_CEILING) {
    ok(
      `batches(${n}): a deck at or below the ceiling is ONE uninterrupted run`,
      batches.length === 1 && batches[0].length === n,
      canon(batches.map((b) => b.length)),
    );
  }

  ok(
    `batches(${n}): the fewest batches that all fit`,
    batches.length === Math.ceil(n / RECALL_BATCH_CEILING),
    `${batches.length} vs ${Math.ceil(n / RECALL_BATCH_CEILING)}`,
  );
  // Evenness, stated as a property rather than as sizes: the longest and the
  // shortest batch differ by at most one card, so the last batch is never a
  // stub of one or two after a full one.
  const lengths = batches.map((b) => b.length);
  ok(
    `batches(${n}): sized as evenly as the length allows`,
    Math.max(...lengths) - Math.min(...lengths) <= 1,
    canon(lengths),
  );
}

// The same properties over the decks that actually ship, so this is proved on
// the content and not only on the abstraction.
for (const s of SCENARIOS) {
  const deck = scenarioRecallItems(s.world, s.scenario);
  const batches = recallBatches(deck);
  ok(
    `${s.key}: its real ${deck.length}-card deck batches losslessly and in order`,
    canon(batches.flat()) === canon(deck) &&
      batches.every(
        (b) => b.length > 0 && b.length <= RECALL_BATCH_CEILING,
      ) &&
      batches.length === Math.ceil(deck.length / RECALL_BATCH_CEILING),
    canon(batches.map((b) => b.length)),
  );
}

// 03-09's source-read technique, applied to the renderer: whether the component
// DELEGATES the chunking is a property of the source and cannot be recovered
// from behaviour at this level. Comments stripped first, so the paragraph above
// the call explaining the rule cannot satisfy it.
{
  const deckSource = readFileSync(
    new URL("../src/components/practice/RecallDeck.tsx", import.meta.url),
    "utf8",
  )
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^[ \t]*\/\/.*$/gm, " ");
  ok(
    "the deck component calls the one chunking author",
    deckSource.includes("recallBatches(") &&
      deckSource.includes("@/lib/recall-batches"),
    "RecallDeck must consume src/lib/recall-batches.ts",
  );
  ok(
    "the deck component does not spell its own chunking arithmetic",
    !deckSource.includes("Math.ceil(") && !deckSource.includes("Math.floor("),
    "a second author of the split is a second behaviour; the batching is inherited by ALL FOUR callers of the one recall renderer and there is deliberately no prop to opt one out",
  );
}

group("the advertised sitting is not contradicted by what the page mounts");

/* The budget, stated so a later reader does not have to infer it.
 *
 * TWO PROPERTIES OF IT ARE DELIBERATE AND MUST NOT BE "CORRECTED" AWAY:
 *
 *  1. The comparison is `>=`, so EXACTLY ZERO SLACK PASSES. A scenario sitting
 *     precisely at its budget is making a claim it can keep, not breaking one.
 *     Two scenarios sit at exactly zero as this is written — `social/small-talk`
 *     and `native/phrasal-verbs` — and NEITHER is to be "corrected" upward.
 *     Only NEGATIVE slack is a failure and only negative slack gets fixed.
 *
 *  2. THE BUDGET DELIBERATELY DOUBLE-COUNTS THE WARM-UP PHRASES. A scenario's
 *     recall deck is its phrases PLUS its vocabulary (scenarioRecallItems), so
 *     every warm-up phrase is charged twice: 20 seconds as a warm-up line in
 *     PronunciationLab and 15 seconds again as a card in RecallDeck. That is
 *     not an oversight. It makes the budget CONSERVATIVE, which is the only
 *     direction an honesty invariant is allowed to err in. Removing the double
 *     count would lower every scenario's required minutes and WEAKEN THIS
 *     ASSERTION, which this repo forbids. It is also why a scenario at nominal
 *     zero slack still has real headroom underneath it: the margin is in the
 *     rates, not in a rounded-up `minutes`.
 *
 * 04-02 added the THIRD rate. A scenario that also mounts a grammar quiz spends
 * more than its phrases and its deck, so `GrammarQuiz` is charged too — 30
 * seconds per question, which is reading a gapped sentence, weighing four
 * options and reading the explanation afterwards. Both properties above carry
 * forward unchanged across that extension.
 *
 * When a scenario fails this, the fix is to raise ITS `minutes` to the smallest
 * whole minute that clears it — a one-line honesty correction. Never lower a
 * rate. */
const SECONDS_PER_WARMUP_PHRASE = 20;
const SECONDS_PER_RECALL_CARD = 15;
const SECONDS_PER_GRAMMAR_QUESTION = 30;

for (const world of WORLDS) {
  for (const scenario of world.scenarios) {
    const key = `${world.slug}/${scenario.slug}`;
    const phrases = (getScenarioPhrases(world.slug, scenario.slug) ?? []).length;
    const cards = scenarioRecallItems(world.slug, scenario.slug).length;
    const questions = (getScenarioGrammar(world.slug, scenario.slug) ?? []).length;
    const needed =
      phrases * SECONDS_PER_WARMUP_PHRASE +
      cards * SECONDS_PER_RECALL_CARD +
      questions * SECONDS_PER_GRAMMAR_QUESTION;
    const advertised = scenario.minutes * 60;
    ok(
      `${key}: its advertised ${scenario.minutes} min covers ${phrases} warm-up phrase(s), a ${cards}-card deck and ${questions} question(s)`,
      advertised >= needed,
      `advertised ${advertised}s, needs ${needed}s — raise minutes to ${Math.ceil(needed / 60)}`,
    );
  }
}

group("the saturated payload stays under the cap the route enforces");

/* 03-11 measured this by hand and recorded it in a summary line. A summary line
 * is not a gate, and this phase spends the headroom — so the construction is
 * reproduced here and asserted on every run, against the ROUTE'S OWN constant
 * read out of its source rather than a number retyped here, so the two cannot
 * drift. A 413 is a permanent drop in the sync queue, not a retry, so exceeding
 * this is silent unrecoverable loss of a snapshot. */
const routeSource = readFileSync(
  new URL("../src/app/api/progress/route.ts", import.meta.url),
  "utf8",
)
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^[ \t]*\/\/.*$/gm, " ");
const capExpression = /MAX_BODY_BYTES\s*=\s*([0-9_ *]+);/.exec(routeSource)?.[1];
// Parsed as a product of integers rather than eval'd: the route writes it as
// `1024 * 1024`, and reading the shape keeps the harness honest about what it
// found instead of silently accepting anything.
const cap = capExpression
  ?.split("*")
  .map((part) => Number(part.replace(/_/g, "").trim()))
  .reduce((a, b) => a * b, 1);
ok(
  "the route's body cap is readable from its own source",
  typeof cap === "number" && Number.isFinite(cap) && cap > 0,
  `MAX_BODY_BYTES parsed as: ${capExpression ?? "NOT FOUND"}`,
);

const saturatedIds = reviewableIds();
const longestTitle = SCENARIOS.reduce(
  (longest, s) => (s.title.length > longest.length ? s.title : longest),
  "",
);
const saturated: ProgressState = {
  ...EMPTY,
  completed: Object.fromEntries(SCENARIOS.map((s) => [s.key, true as const])),
  xp: Number.MAX_SAFE_INTEGER,
  skillXp: {
    grammar: Number.MAX_SAFE_INTEGER,
    speaking: Number.MAX_SAFE_INTEGER,
    reading: Number.MAX_SAFE_INTEGER,
    writing: Number.MAX_SAFE_INTEGER,
  },
  streak: Number.MAX_SAFE_INTEGER,
  lastActive: today(),
  level: "C1",
  srs: Object.fromEntries(
    saturatedIds.map((id) => [id, { box: 5, due: addDays(180) }]),
  ),
  vocab: Object.fromEntries(
    VOCAB_DECKS.flatMap((deck) =>
      deck.cards.map((card) => [card.id, true as const]),
    ),
  ),
  attempts: Object.fromEntries(
    saturatedIds.map((id) => [
      id,
      {
        topic: longestTitle,
        level: "C1",
        tries: Number.MAX_SAFE_INTEGER,
        wrong: Number.MAX_SAFE_INTEGER,
        resolved: true,
        lastWrongOption: 3,
        updatedAt: today(),
      },
    ]),
  ),
  todayXp: Number.MAX_SAFE_INTEGER,
  xpDay: today(),
  goalXp: Number.MAX_SAFE_INTEGER,
  updatedAt: new Date().toISOString(),
};

// Serialised the way the sync queue does it: `{ progress: <state> }`
// (sync-queue.ts ENDPOINTS.progress.envelope), measured in UTF-8 bytes the way
// the route does (`Buffer.byteLength(text, "utf8")`).
const saturatedBytes = Buffer.byteLength(
  JSON.stringify({ progress: saturated }),
  "utf8",
);
ok(
  "a fully saturated ProgressState fits under the route's body cap",
  typeof cap === "number" && saturatedBytes < cap,
  `${saturatedBytes} B against a ${cap ?? "?"} B cap`,
);

/* ================================================================== *
 * PHASE 4 (plan 04-02) — the topic strings behind the grammar banks.
 *
 * One group appended under the header's two-edit rule.
 * ================================================================== */

group("scenario grammar: the topic strings are the recorded ones, exactly");

/* WHY A WRITTEN-OUT SET AND NOT A SHAPE CHECK.
 *
 * `recordAttempt` stores the topic a question was answered under and
 * `weakTopics()` groups the learner's whole history by that EXACT string
 * (src/lib/progress.ts). So the string is a stable identifier in live learner
 * data, not display copy, and there are two silent failures it can suffer:
 *
 *   - a near-variant — "Phrasal verb particle", "Phrasal Verb Particles",
 *     "Phrasal verb  particles" — SPLITS one learner's accumulated weak spot
 *     into two half-populated ones, permanently, with nothing to detect it;
 *   - a topic that ought to aggregate with the GLOBAL bank
 *     (src/lib/content/grammar.ts) but is spelled a hair differently
 *     FRAGMENTS the same teaching point across two surfaces.
 *
 * Neither is type-incorrect, neither renders wrong, and neither can be
 * recovered after a learner has answered under both spellings. The header of
 * scenario-grammar.ts already states this rule in prose; writing the sets out
 * here makes it a rule the GATE holds rather than one the next author has to
 * have read. Adding a question with a mistyped topic now fails loudly.
 *
 * TO ADD A TOPIC: change the set below in the same commit, deliberately, and
 * treat the new string as permanent from that commit — exactly as an id is. */
const RECORDED_TOPICS: Record<string, string[]> = {
  "social/small-talk": [
    "Echo questions",
    "Past simple",
    "Present simple vs continuous",
    "Question tags",
    "had better",
  ],
  "work/interviews": [
    "Hedging with would",
    "Indirect questions",
    "Past perfect",
    "Present perfect continuous",
    "Second conditional",
  ],
  "work/emails": [
    "First conditional",
    "Gerund vs infinitive",
    "Modals",
    "Passive voice",
    "Past continuous",
  ],
  // 04-02 introduced exactly one new permanent string here, "Phrasal verb
  // senses", and copied the other three character for character from the five
  // questions that predate it.
  "native/phrasal-verbs": [
    "Phrasal verb particles",
    "Phrasal verb senses",
    "Phrasal verb separability",
    "Phrasal verbs vs formal verbs",
  ],
};

const grammarDeclaringKeys = SCENARIOS.filter(
  (s) => getScenarioGrammar(s.world, s.scenario) !== undefined,
).map((s) => s.key);

ok(
  "every scenario that declares grammar has its topic set recorded here",
  grammarDeclaringKeys.every((key) => key in RECORDED_TOPICS),
  grammarDeclaringKeys.filter((key) => !(key in RECORDED_TOPICS)).join(", ") ||
    "a scenario whose topics are not written out is a scenario whose topics nothing gates",
);
ok(
  "no topic set is recorded for a scenario that has no grammar bank",
  Object.keys(RECORDED_TOPICS).every((key) =>
    grammarDeclaringKeys.includes(key),
  ),
  Object.keys(RECORDED_TOPICS)
    .filter((key) => !grammarDeclaringKeys.includes(key))
    .join(", "),
);

for (const s of SCENARIOS) {
  const questions = getScenarioGrammar(s.world, s.scenario);
  if (!questions) continue;
  const recorded = RECORDED_TOPICS[s.key];
  if (!recorded) continue;
  const actual = [...new Set(questions.map((q) => q.topic))].sort();
  ok(
    `scenario grammar: ${s.key}'s distinct topics are exactly the recorded set`,
    canon(actual) === canon([...recorded].sort()),
    `bank: ${canon(actual)}\n      recorded: ${canon([...recorded].sort())} — a topic string is the key weakTopics() groups a learner's history by, so a near-variant splits it in two permanently. Change the recorded set deliberately, in the same commit, or fix the typo.`,
  );
}

/* Character-for-character agreement with the global bank. Compared through a
 * normalisation that is DELIBERATELY LOSSY — case, punctuation and runs of
 * whitespace all collapse — because the failure being hunted is a string that
 * MEANS the same and IS not the same. Two topics that normalise together must
 * therefore be byte-identical; two that normalise apart are simply different
 * teaching points and are left alone. */
const normaliseTopic = (topic: string) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const globalTopicsByNormal = new Map<string, Set<string>>();
for (const q of GRAMMAR_QUESTIONS) {
  const n = normaliseTopic(q.topic);
  if (!globalTopicsByNormal.has(n)) globalTopicsByNormal.set(n, new Set());
  globalTopicsByNormal.get(n)?.add(q.topic);
}

const scenarioTopicsByNormal = new Map<string, Set<string>>();
for (const s of SCENARIOS) {
  for (const q of getScenarioGrammar(s.world, s.scenario) ?? []) {
    const n = normaliseTopic(q.topic);
    if (!scenarioTopicsByNormal.has(n)) scenarioTopicsByNormal.set(n, new Set());
    scenarioTopicsByNormal.get(n)?.add(q.topic);
  }
}

for (const [n, spellings] of scenarioTopicsByNormal) {
  ok(
    `scenario grammar: "${[...spellings][0]}" has ONE spelling across every scenario bank`,
    spellings.size === 1,
    `${canon([...spellings])} — two scenarios spelling one teaching point differently fragment a single learner's history across both`,
  );
  const globalSpellings = globalTopicsByNormal.get(n);
  if (!globalSpellings) continue;
  ok(
    `scenario grammar: "${[...spellings][0]}" matches the global bank character for character`,
    globalSpellings.size === 1 && globalSpellings.has([...spellings][0]),
    `scenario: ${canon([...spellings])} vs global: ${canon([...globalSpellings])} — the same teaching point on two surfaces has to be the same STRING, or a learner's weak spot is counted twice at half strength`,
  );
}

/* ------------------------------------------------------------------ *
 * 04-03 — the tip that is a translation, and the passage that withholds.
 *
 * TWO DEFECTS ARE GATED HERE, and both were invisible to every assertion above.
 *
 * ONE: the gloss masquerading as a tip. 04-RESEARCH §1 measured the
 * textbook-ness of `native/idioms` and found it in the tips — of its six
 * phrases exactly one carried a tip and it read "Idiom: algo muy fácil.", which
 * is the Spanish column written twice. A native-level item's tip says WHO says
 * it, TO WHOM, and WHAT IT COSTS to get that wrong; a tip that translates the
 * expression teaches nothing the `es` field did not already say. `tsc` sees a
 * populated optional string and is satisfied. So: non-blank, not a restatement
 * of the item's own Spanish, and long enough to be a use note.
 *
 * TWO: the bank that spoils its own reading passage. That passage's questions
 * ask the reader to recover four expressions FROM CONTEXT, and its glossary is
 * silent on exactly those four on purpose (see the passage's header comment in
 * scenario-reading.ts). Glossing one of them in the phrase or vocabulary bank
 * converts a reading exercise into a memorised definition — silently, with
 * every other assertion still green, and only ever noticed by a learner who
 * finds the questions trivially easy. That is T-04-08.
 * ------------------------------------------------------------------ */

group("native/idioms: every tip is a use note, and no bank entry glosses what the passage withholds");

const IDIOMS_KEY = "native/idioms";
const [IDIOMS_WORLD, IDIOMS_SCENARIO] = IDIOMS_KEY.split("/");

/* The gloss/use-note boundary, stated as a number so it is arguable rather than
 * a matter of taste. The two tips this bank carried before 04-03 ran four and
 * five words ("Idiom: algo muy fácil.", "Muy frecuente en el trabajo."); the
 * neighbouring scenario's genuine use notes start at ten and the eighteen below
 * start at twenty-seven. Twelve sits in the empty band between the two
 * populations, so it separates them without being tuned to either. It is a
 * FLOOR on substance, not a target: nothing is asserted about the ceiling. */
const MIN_TIP_WORDS = 12;

/* Case, curly quote marks and runs of whitespace all collapse. Deliberately
 * lossy, for the same reason 04-02's topic normaliser is: the thing being
 * hunted is a string that MEANS the same and is not byte-identical. */
const plain = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const idiomPhrases = getScenarioPhrases(IDIOMS_WORLD, IDIOMS_SCENARIO) ?? [];
const idiomCards = getScenarioVocabulary(IDIOMS_WORLD, IDIOMS_SCENARIO) ?? [];

ok(
  `${IDIOMS_KEY}: resolves to a phrase set this group can assert on`,
  idiomPhrases.length > 0,
  "an empty set would make every per-item assertion below vacuously true",
);

for (const phrase of idiomPhrases) {
  const tip = (phrase.tip ?? "").trim();
  ok(
    `${IDIOMS_KEY}#${phrase.id}: carries a tip at all`,
    tip.length > 0,
    "every item in this bank is register-marked, and the mark IS the tip — an item without one is not native-level, it is listed",
  );
  if (!tip) continue;

  const tipWords = tip.split(/\s+/).filter(Boolean).length;
  ok(
    `${IDIOMS_KEY}#${phrase.id}: its tip is a use note, not a gloss (>= ${MIN_TIP_WORDS} words)`,
    tipWords >= MIN_TIP_WORDS,
    `${tipWords} word(s): "${tip}" — say who says it, to whom, and what getting it wrong costs`,
  );

  /* The trailing full stop comes off the Spanish so that a tip which quotes the
   * gloss and then carries on is caught as readily as one that IS the gloss. */
  const es = plain(phrase.es).replace(/[.!?¡¿]+$/, "").trim();
  ok(
    `${IDIOMS_KEY}#${phrase.id}: its tip does not restate its own Spanish`,
    es.length > 0 && !plain(tip).includes(es),
    `tip repeats the "es" field verbatim ("${es}") — that is the defect 04-RESEARCH §1 measured, not a use note`,
  );
}

/* The four the passage withholds, WRITTEN OUT — 04-02's pattern, and for its
 * reason: a shape check cannot know which four expressions a hand-written
 * passage decided to keep silent about, so the set is recorded and then
 * CROSS-CHECKED AGAINST THE PASSAGE ITSELF so the record cannot quietly drift
 * away from what it claims to describe.
 *
 * `asWritten` is the form the passage actually uses and is what the two
 * self-checks run on. `hunt` is the inflections a bank entry would plausibly
 * gloss it under — the passage says "the writing WAS on the wall", a bank would
 * say "the writing IS on the wall", and only the second is the defect. */
const WITHHELD_BY_THE_PASSAGE: { asWritten: string; hunt: string[] }[] = [
  {
    asWritten: "cross that bridge",
    hunt: ["cross that bridge", "crossed that bridge"],
  },
  {
    asWritten: "the writing was on the wall",
    hunt: [
      "writing was on the wall",
      "writing is on the wall",
      "writing's on the wall",
      "writing on the wall",
    ],
  },
  {
    asWritten: "cleared the air",
    hunt: ["clear the air", "cleared the air", "clearing the air"],
  },
  {
    asWritten: "put my foot in it",
    hunt: [
      "put my foot in it",
      "put your foot in it",
      "put his foot in it",
      "put her foot in it",
      "putting my foot in it",
      "putting your foot in it",
    ],
  },
];

const idiomsPassage = getScenarioReading(IDIOMS_WORLD, IDIOMS_SCENARIO);
ok(
  `${IDIOMS_KEY}: has the reading passage this group protects`,
  !!idiomsPassage,
  "the withholding assertions below are vacuous without it",
);

if (idiomsPassage) {
  const bodyText = plain(idiomsPassage.body.join(" "));
  const glossaryText = plain(
    idiomsPassage.glossary.map((g) => `${g.word} ${g.meaning}`).join(" "),
  );
  const questionText = plain(
    idiomsPassage.questions
      .map((q) => `${q.q} ${q.options.join(" ")} ${q.explain}`)
      .join(" "),
  );
  const passageText = `${bodyText} ~ ${glossaryText} ~ ${questionText}`;

  /* Three checks that make the written-out record self-validating: it cannot
   * name an expression the passage does not use, it cannot name one the
   * passage actually glosses, and it cannot fall out of step with the number
   * of questions that depend on the withholding. */
  ok(
    `${IDIOMS_KEY}: the withheld record names one expression per question the passage asks`,
    WITHHELD_BY_THE_PASSAGE.length === idiomsPassage.questions.length,
    `${WITHHELD_BY_THE_PASSAGE.length} recorded vs ${idiomsPassage.questions.length} question(s) — every question turns on one of them, so these two move together`,
  );
  for (const withheld of WITHHELD_BY_THE_PASSAGE) {
    ok(
      `${IDIOMS_KEY}: the passage really uses "${withheld.asWritten}"`,
      bodyText.includes(plain(withheld.asWritten)),
      "the record names an expression the passage does not contain — it has drifted from the text it describes",
    );
    ok(
      `${IDIOMS_KEY}: the passage's glossary stays silent on "${withheld.asWritten}"`,
      !glossaryText.includes(plain(withheld.asWritten)),
      "the glossary now defines an expression recorded as withheld — either the record is wrong or the passage gave away its own answer",
    );
  }

  /* T-04-08 itself. */
  const bankFields: { where: string; text: string }[] = [
    ...idiomPhrases.flatMap((p) => [
      { where: `phrase#${p.id}.text`, text: p.text },
      { where: `phrase#${p.id}.es`, text: p.es },
      { where: `phrase#${p.id}.tip`, text: p.tip ?? "" },
    ]),
    ...idiomCards.flatMap((c) => [
      { where: `vocab#${c.id}.term`, text: c.term },
      { where: `vocab#${c.id}.es`, text: c.es },
      { where: `vocab#${c.id}.example`, text: c.example },
    ]),
  ];
  for (const withheld of WITHHELD_BY_THE_PASSAGE) {
    const offenders = bankFields.filter((f) =>
      withheld.hunt.some((h) => plain(f.text).includes(plain(h))),
    );
    ok(
      `${IDIOMS_KEY}: no bank entry gives away "${withheld.asWritten}"`,
      offenders.length === 0,
      `${canon(offenders.map((o) => o.where))} — the passage withholds this on purpose so the reader recovers it from context; glossing it here turns a reading exercise into recall`,
    );
  }

  /* The literal cross-surface rule: nothing the banks teach may be sitting in
   * the passage at all. The vocabulary term is the sharp end of this — a bare
   * expression like "on the ball" would match a passage that used it — while
   * the phrase check is the cheap belt-and-braces half. */
  for (const phrase of idiomPhrases) {
    ok(
      `${IDIOMS_KEY}#${phrase.id}: its text does not appear in the passage`,
      !passageText.includes(plain(phrase.text)),
      "a passage that parades what the deck teaches is the deck read aloud (T-03-19)",
    );
  }
  for (const card of idiomCards) {
    ok(
      `${IDIOMS_KEY}#${card.id}: its term does not appear in the passage`,
      !passageText.includes(plain(card.term)),
      "a passage that parades what the deck teaches is the deck read aloud (T-03-19)",
    );
  }
}

group("every scenario gets a briefing of its own, and it does not quote its own banks");

/* TWO PROPERTIES, both of them things a comment used to claim and nothing
 * checked.
 *
 * ── A. THE GENERIC BRIEFING IS PROVABLY UNREACHABLE (T-04-09) ──
 *
 * `getScenarioLesson` resolves an unknown key to a single generic record. All
 * 35 scenarios have their own briefing, so that record is dead — but "dead" was
 * only ever true by inspection, and the trap it sets is specific: the next
 * author to add a scenario and forget its briefing gets filler that reads
 * exactly like curated content on the page. Nothing crashes, no derived count
 * is wrong, and the learner is quietly served nothing.
 *
 * This is the situation `phrases.ts` was in before 03-11. 03-11 DELETED its
 * fallback; that is not the move here, because this accessor returns
 * `ScenarioLesson` rather than `ScenarioLesson | undefined`, so deleting the
 * record changes its signature and every call site. 03-11's other rule is the
 * one that applies — the replacement for a comment asserting a fallback is dead
 * is an assertion asserting it. Filed as an open question for the phase gate;
 * NOT decided here.
 *
 * The reference check (`!==`) is the load-bearing one: it proves the accessor
 * did not fall through, which is the actual property. The deep-equality check
 * beside it catches the other half — a briefing that was written by pasting the
 * generic one, which the reference check alone would pass.
 *
 * ── B. THE THREE SURFACES OF `native/idioms` STAY APART (T-04-10) ──
 *
 * Research measured one canonical list appearing in this scenario's briefing,
 * in its warm-up and in its deck at once, and the briefing was the surface
 * nothing gated: it is prose, so a repeat there was invisible to every existing
 * check. Measured clean before this was written — 0 offenders.
 *
 * The vocabulary term is the sharp end, because it is short enough to sit
 * inside a sentence of prose unnoticed; a phrase text is a whole sentence and
 * the check on it is the cheap half. A term that NAMES ITS SENSE in a
 * parenthesis — `down the line (later, not now)` — is hunted on the part before
 * the bracket, since the bare expression is what a tip would actually repeat
 * and matching the whole string would make the check trivially passable. */

const briefingScenarios = SCENARIOS.map((s) => ({
  key: s.key,
  lesson: getScenarioLesson(s.world, s.scenario),
}));

for (const { key, lesson } of briefingScenarios) {
  ok(
    `${key}: resolves to a briefing of its own, not the generic record`,
    lesson !== FALLBACK_LESSON,
    "the accessor fell through to the generic briefing — filler that reads as curated content on the page, and nothing else would have reported it",
  );
  ok(
    `${key}: its briefing is not a copy of the generic one`,
    JSON.stringify(lesson) !== JSON.stringify(FALLBACK_LESSON),
    "a briefing byte-identical to the generic record is the fallback with extra steps",
  );
  ok(
    `${key}: its briefing intro is not blank`,
    lesson.intro.trim().length > 0,
    "a scenario whose briefing renders an empty heading claims a framing it does not give",
  );
  ok(
    `${key}: its briefing carries at least two non-blank tips`,
    lesson.tips.filter((t) => t.trim().length > 0).length >= 2,
    "the type says 2–3 quick practical tips; one or none is the shape of an unfinished briefing",
  );
}

const idiomsLesson = getScenarioLesson(IDIOMS_WORLD, IDIOMS_SCENARIO);
const briefingSurfaces = [
  { where: "intro", text: plain(idiomsLesson.intro) },
  ...idiomsLesson.tips.map((t, i) => ({
    where: `tip[${i}]`,
    text: plain(t),
  })),
];

for (const phrase of idiomPhrases) {
  const offenders = briefingSurfaces.filter((s) =>
    s.text.includes(plain(phrase.text)),
  );
  ok(
    `${IDIOMS_KEY}: the briefing does not work its example from phrase#${phrase.id}`,
    offenders.length === 0,
    `${canon(offenders.map((o) => o.where))} — the briefing, the warm-up and the deck teaching the same expression is the triple 04-RESEARCH §1 measured`,
  );
}
for (const card of idiomCards) {
  /* The sense-naming parenthesis comes off: the bare expression is what a tip
   * would repeat, and hunting the bracketed form would make this passable by
   * accident. */
  const bareTerm = plain(card.term.split(" (")[0]);
  const offenders = briefingSurfaces.filter((s) => s.text.includes(bareTerm));
  ok(
    `${IDIOMS_KEY}: the briefing does not work its example from vocab#${card.id}`,
    offenders.length === 0,
    `${canon(offenders.map((o) => o.where))} quotes "${bareTerm}" — the briefing must demonstrate on material no other surface of this scenario uses`,
  );
}

group("native/register: the dial is legible, because the pairing survives");

/* THE PROPERTY NOTHING ELSE COULD HOLD.
 *
 * `native/register` is the only bank in the app built as CONTRASTING PAIRS:
 * nine situations, each written twice — once casually, once formally, with the
 * same facts in both halves. The contrast IS the teaching. A single line cannot
 * show a dial, which is why the set is shaped this way rather than as a flat
 * list of eighteen.
 *
 * And the pairing is carried by ARRAY ORDER AND NOTHING ELSE. No field records
 * which entry pairs with which; both renderers that consume this set —
 * PronunciationLab as a warm-up and RecallDeck as cards — simply walk the array
 * from index 0. So a casual half separated from its formal half by an insertion
 * still type-checks, still passes every other assertion in this file, still
 * renders eighteen perfectly good phrases, and quietly stops teaching the one
 * thing this scenario exists for.
 *
 * That is exactly the failure mode this file was written for: type-correct and
 * silent. 04-05 grew the set from six entries to eighteen, which is precisely
 * when an ordering invariant held only by an author's care starts to rot — the
 * next plan to add a tenth situation will not have read the header comment.
 *
 * Three separable checks, because they fail for different reasons:
 *
 *   1. EVEN LENGTH — an odd count means a half was added without its partner,
 *      i.e. a situation the learner sees said once. Cheapest check, and the one
 *      that catches the commonest mistake.
 *   2. ALTERNATION BY THE SLUG CONVENTION — every entry declares which half of
 *      a pair it is (`casual-` / `formal-`), and the declaration must agree
 *      with its position. This catches a pair inserted the wrong way round,
 *      which even length cannot see.
 *   3. ADJACENCY — the two halves of pair k are the entries at 2k and 2k+1,
 *      one of each, in that order. Stated separately from (2) because it is the
 *      property the RENDERERS depend on, and a reader of a failure should be
 *      told which pair broke rather than which index did.
 *
 * NOTE the slugs deliberately do NOT share a stem — `casual-my-bad` pairs with
 * `formal-apologise-oversight` — so matching suffixes is not, and must not
 * become, the mechanism. Adjacency is the mechanism; this asserts adjacency.
 *
 * Measured clean before any of it was written: 18 entries, 0 alternation
 * violations, 0 untipped entries, 9 well-formed pairs. */

const REGISTER_WORLD = "native";
const REGISTER_SCENARIO = "register";
const REGISTER_KEY = `${REGISTER_WORLD}/${REGISTER_SCENARIO}`;
const CASUAL_PREFIX = "casual-";
const FORMAL_PREFIX = "formal-";

const registerPhrases = getScenarioPhrases(REGISTER_WORLD, REGISTER_SCENARIO) ?? [];

ok(
  `${REGISTER_KEY}: its phrase set resolves and is not empty`,
  registerPhrases.length > 0,
  "the whole group below is vacuous without this — an empty set alternates and pairs perfectly",
);
ok(
  `${REGISTER_KEY}: its phrase set holds an even number of entries (${registerPhrases.length})`,
  registerPhrases.length % 2 === 0,
  "an odd count is a half added without its partner — one situation the learner only ever sees said once, which is the one thing a dial cannot be shown with",
);

for (const [i, phrase] of registerPhrases.entries()) {
  const expected = i % 2 === 0 ? CASUAL_PREFIX : FORMAL_PREFIX;
  const wrong = i % 2 === 0 ? FORMAL_PREFIX : CASUAL_PREFIX;
  ok(
    `${REGISTER_KEY}#phrase#${phrase.id}: at index ${i} it declares itself the ${expected.slice(0, -1)} half`,
    phrase.id.startsWith(expected) && !phrase.id.startsWith(wrong),
    `index ${i} must hold a "${expected}" slug and holds "${phrase.id}" — either the pair went in the wrong way round or an entry was inserted between two halves`,
  );
  ok(
    `${REGISTER_KEY}#phrase#${phrase.id}: carries a non-blank tip`,
    (phrase.tip ?? "").trim().length > 0,
    "in this scenario the tip is where the MARK lives — who says it, to whom, and what it costs to get that wrong. An entry without one is a line with no register attached, which is the thing being taught",
  );
}

for (let pair = 0; pair * 2 + 1 < registerPhrases.length; pair++) {
  const casual = registerPhrases[pair * 2];
  const formal = registerPhrases[pair * 2 + 1];
  ok(
    `${REGISTER_KEY}: pair ${pair + 1} sits adjacent — ${casual.id} then ${formal.id}`,
    casual.id.startsWith(CASUAL_PREFIX) &&
      formal.id.startsWith(FORMAL_PREFIX) &&
      casual.id !== formal.id,
    "both renderers walk this array in order, so the two halves of a situation are legible as a contrast only while they sit next to each other, casual first",
  );
}

group("native/culture: nothing in either bank has a shelf life, and neither bank spoils the passage");

/* 04-06. TWO PROPERTIES, and the group is deliberately HONEST ABOUT WHICH OF
 * THEM A SCRIPT CAN ACTUALLY HOLD.
 *
 * ── A. THE SHELF LIFE (T-04-13, disposition: accept) ──
 *
 * `native/culture` is the one scenario whose content can go stale without
 * anything failing. An item built on a film, a song, an advert or a person
 * decays quietly: it still type-checks, still renders, still passes every
 * assertion above, and is simply wrong by the time a learner reaches it. That
 * is why this scenario's banks teach the MACHINERY of a missed reference rather
 * than the references themselves.
 *
 * A FOUR-DIGIT YEAR IS THE ONLY SHELF-LIFE MARKER A SCRIPT CAN SEE, and it is
 * gated below. It is NOT a proxy for the rule. "no work, no person, no brand"
 * is enforced by the authoring rule in each bank's header and by the reader
 * pass at the phase gate, and nothing here should be read as covering it.
 * Stating the limit is the point: a gate that implies more coverage than it has
 * is worse than no gate, because the next author trusts it.
 *
 * ── B. THE BANKS DO NOT SPOIL THE PASSAGE (T-04-08) ──
 *
 * The same cross-surface rule 04-03 established for `native/idioms`, applied
 * here — with ONE STRUCTURAL DIFFERENCE that must not be flattened away.
 *
 * The idioms passage withholds all four of the expressions its questions turn
 * on. This passage withholds three and GLOSSES THE FOURTH ON PURPOSE: its
 * header says a white elephant is glossed because the question about it turns
 * on the possessive ("our white elephant") rather than on the phrase. So the
 * record carries a `glossed` flag, the glossary-silence assertion runs only on
 * the three, and the exception is ASSERTED IN THE POSITIVE — the glossary must
 * really define the one card marked glossed. That makes the exception
 * self-validating rather than a hole: it cannot be widened to a second entry by
 * an author who just wants a failing check to pass.
 *
 * The bank check runs on all four regardless. The passage may gloss its own
 * white elephant; the BANKS may not, because the possessive turn only works
 * while the phrase itself is unremarkable in the reader's hands. */

const CULTURE_KEY = "native/culture";
const [CULTURE_WORLD, CULTURE_SCENARIO] = CULTURE_KEY.split("/");

const culturePhrases = getScenarioPhrases(CULTURE_WORLD, CULTURE_SCENARIO) ?? [];
const cultureCards = getScenarioVocabulary(CULTURE_WORLD, CULTURE_SCENARIO) ?? [];

ok(
  `${CULTURE_KEY}: its phrase set resolves and is not empty`,
  culturePhrases.length > 0,
  "every per-item assertion in this group is vacuously true over an empty bank",
);
ok(
  `${CULTURE_KEY}: its vocabulary deck resolves and is not empty`,
  cultureCards.length > 0,
  "every per-item assertion in this group is vacuously true over an empty bank",
);

/* Both banks flattened into one list of (where, text) so the year check and the
 * spoiler check read the same surface. A field added to either type without
 * being added here is invisible to both, which is why this is built once. */
const cultureFields: { where: string; text: string }[] = [
  ...culturePhrases.flatMap((p) => [
    { where: `phrase#${p.id}.text`, text: p.text },
    { where: `phrase#${p.id}.es`, text: p.es },
    { where: `phrase#${p.id}.tip`, text: p.tip ?? "" },
  ]),
  ...cultureCards.flatMap((c) => [
    { where: `vocab#${c.id}.term`, text: c.term },
    { where: `vocab#${c.id}.es`, text: c.es },
    { where: `vocab#${c.id}.example`, text: c.example },
  ]),
];

/* 1000–2999. Narrow on purpose: a bare four-digit run would also catch a price,
 * a word count or a house number, and a check that fires on things that are not
 * the defect gets loosened rather than obeyed. */
const YEAR = /\b(1\d{3}|2\d{3})\b/;
for (const field of cultureFields) {
  const found = YEAR.exec(field.text)?.[0];
  ok(
    `${CULTURE_KEY}#${field.where}: names no year`,
    found === undefined,
    `contains "${found}" — this is the ONE shelf-life marker a script can see, and this scenario is the one whose content silently rots. Teach the machinery, not the moment`,
  );
}

/* The four the passage's questions turn on, WRITTEN OUT and then cross-checked
 * against the passage itself — 04-02's pattern by way of 04-03, and for its
 * reason: no shape check can know which references a hand-written passage
 * decided to insure by context, so the record is stated and then forbidden to
 * drift away from the text it claims to describe.
 *
 * `asWritten` is the form the passage uses and is what the self-checks run on.
 * `hunt` is the forms a bank entry would plausibly gloss it under. `glossed`
 * records the one deliberate exception, described at the top of this group. */
const WITHHELD_BY_THE_CULTURE_PASSAGE: {
  asWritten: string;
  hunt: string[];
  glossed: boolean;
}[] = [
  {
    asWritten: "groundhog day",
    hunt: ["groundhog day", "groundhog"],
    glossed: false,
  },
  {
    asWritten: "the emperor's new clothes",
    hunt: [
      "the emperor's new clothes",
      "emperor's new clothes",
      "emperors new clothes",
    ],
    glossed: false,
  },
  {
    asWritten: "the third act of a story",
    hunt: ["third act"],
    glossed: false,
  },
  {
    /* The deliberate exception: glossed by the passage, because the question
     * about it turns on the possessive rather than on the phrase. The BANKS
     * still may not name it. */
    asWritten: "white elephant",
    hunt: ["white elephant"],
    glossed: true,
  },
];

const culturePassage = getScenarioReading(CULTURE_WORLD, CULTURE_SCENARIO);
ok(
  `${CULTURE_KEY}: has the reading passage this group protects`,
  !!culturePassage,
  "every withholding assertion below is vacuous without it",
);

if (culturePassage) {
  const cultureBody = plain(culturePassage.body.join(" "));
  const cultureGlossary = plain(
    culturePassage.glossary.map((g) => `${g.word} ${g.meaning}`).join(" "),
  );
  const culturePassageText = `${cultureBody} ~ ${cultureGlossary} ~ ${plain(
    culturePassage.questions
      .map((q) => `${q.q} ${q.options.join(" ")} ${q.explain}`)
      .join(" "),
  )}`;

  ok(
    `${CULTURE_KEY}: the withheld record names one reference per question the passage asks`,
    WITHHELD_BY_THE_CULTURE_PASSAGE.length ===
      culturePassage.questions.length,
    `${WITHHELD_BY_THE_CULTURE_PASSAGE.length} recorded vs ${culturePassage.questions.length} question(s) — every question turns on one of them, so the two move together`,
  );
  ok(
    `${CULTURE_KEY}: exactly one of the four is the glossed exception`,
    WITHHELD_BY_THE_CULTURE_PASSAGE.filter((w) => w.glossed).length === 1,
    "the exception exists because ONE question turns on a possessive rather than on a phrase. A second entry claiming it is the assertion being widened to fit a failure",
  );

  for (const withheld of WITHHELD_BY_THE_CULTURE_PASSAGE) {
    ok(
      `${CULTURE_KEY}: the passage really uses "${withheld.asWritten}"`,
      cultureBody.includes(plain(withheld.asWritten)),
      "the record names a reference the passage does not contain — it has drifted from the text it describes",
    );
    if (withheld.glossed) {
      ok(
        `${CULTURE_KEY}: the passage's glossary really does define "${withheld.asWritten}", as its header says`,
        cultureGlossary.includes(plain(withheld.asWritten)),
        "this entry is recorded as the deliberate exception, so the gloss must actually be there — otherwise the exception is just a silenced assertion",
      );
    } else {
      ok(
        `${CULTURE_KEY}: the passage's glossary stays silent on "${withheld.asWritten}"`,
        !cultureGlossary.includes(plain(withheld.asWritten)),
        "the glossary now defines a reference recorded as withheld — either the record is wrong or the passage gave away its own answer",
      );
    }

    /* T-04-08 itself, and it runs on ALL FOUR including the glossed one. */
    const offenders = cultureFields.filter((f) =>
      withheld.hunt.some((h) => plain(f.text).includes(plain(h))),
    );
    ok(
      `${CULTURE_KEY}: no bank entry gives away "${withheld.asWritten}"`,
      offenders.length === 0,
      `${canon(offenders.map((o) => o.where))} — the passage asks the reader to recover this from context; naming it in a bank turns a reading exercise into recall`,
    );
  }

  /* The literal cross-surface rule, as 04-03 wrote it: nothing the banks teach
   * may be sitting in the passage at all. The card TERM is the sharp end,
   * because it is short enough to pass unnoticed inside a sentence of prose;
   * a term that names its sense in a parenthesis is hunted on the part before
   * the bracket, since the bare expression is what would actually repeat. */
  for (const phrase of culturePhrases) {
    ok(
      `${CULTURE_KEY}#${phrase.id}: its text does not appear in the passage`,
      !culturePassageText.includes(plain(phrase.text)),
      "a passage that parades what the warm-up teaches is the warm-up read aloud (T-03-19)",
    );
  }
  for (const card of cultureCards) {
    ok(
      `${CULTURE_KEY}#${card.id}: its term does not appear in the passage`,
      !culturePassageText.includes(plain(card.term.split(" (")[0])),
      "a passage that parades what the deck teaches is the deck read aloud (T-03-19)",
    );
  }
}

/* ------------------------------------------------------------------ *
 * The phase's own progress meter — REPORTED, never asserted.
 *
 * These three numbers move on almost every plan in this phase. An assertion on
 * them would fail for most of the phase and end up disabled rather than fixed,
 * which is exactly how a gate stops being a gate (the lesson 02.1-05 recorded
 * about part-kind coverage). Printed on every run so a stalled bank is visible
 * rather than merely true.
 * ------------------------------------------------------------------ */

const withPhrases = SCENARIOS.filter(
  (s) => (getScenarioPhrases(s.world, s.scenario) ?? []).length > 0,
).length;
const withVocabulary = SCENARIOS.filter(
  (s) => (getScenarioVocabulary(s.world, s.scenario) ?? []).length > 0,
).length;

console.log("");
console.log(`  phrases:    ${withPhrases}/${SCENARIOS.length} scenarios`);
console.log(`  vocabulary: ${withVocabulary}/${SCENARIOS.length} scenarios`);
console.log(
  `  pairs:      ${COVERAGE_TOTALS.pairsWritten}/${COVERAGE_TOTALS.pairsTotal} written` +
    ` (${pendingPairs().length} pending)`,
);
// Printed, not asserted, on top of the assertion above: the headroom is what
// this phase is spending, so it should be visible on every run rather than
// recoverable only from a failure.
/* The number 04-RESEARCH §1 used to diagnose `native/idioms` — printed so it
 * stays visible while this phase spends the rest of the world. NOT asserted, on
 * purpose and for the same reason as the three above: it moves on almost every
 * plan in this phase, and an assertion on a moving number ends up disabled
 * rather than fixed. Research measured 24 of 30 when the world held 30 phrases
 * and `native/idioms` contributed one of its six. */
const nativeWorldPhrases = SCENARIOS.filter((s) => s.world === "native").flatMap(
  (s) => getScenarioPhrases(s.world, s.scenario) ?? [],
);
const nativeWorldTipped = nativeWorldPhrases.filter(
  (p) => (p.tip ?? "").trim().length > 0,
).length;

console.log(
  `  tip ratio:  ${nativeWorldTipped}/${nativeWorldPhrases.length} phrases in Sounding Native carry a tip` +
    ` (${((nativeWorldTipped / nativeWorldPhrases.length) * 100).toFixed(1)}%)` +
    ` — reported, never asserted`,
);
console.log(
  `  payload:    ${saturatedBytes.toLocaleString("en-US")} B saturated over` +
    ` ${saturatedIds.length} scheduled id(s)` +
    (typeof cap === "number"
      ? ` — ${((saturatedBytes / cap) * 100).toFixed(1)}% of the ${cap.toLocaleString("en-US")} B cap`
      : ""),
);

if (failures > 0) {
  console.error(
    `\nverify-scenario-content: ${failures} of ${checks} assertions FAILED`,
  );
  process.exit(1);
}
console.log(`\nverify-scenario-content: all ${checks} assertions passed.`);
