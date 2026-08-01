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
ok(
  "reviewableIds() covers both key spaces",
  reviewableIds().length === grammarIds.size + composedIds.length,
  `${reviewableIds().length} vs ${grammarIds.size} + ${composedIds.length}`,
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

ok(
  "a scenario with neither bank entry yields an empty deck, never a fallback",
  scenarioRecallItems("social", "dating").length === 0,
  `${scenarioRecallItems("social", "dating").length} item(s)`,
);
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

if (failures > 0) {
  console.error(
    `\nverify-scenario-content: ${failures} of ${checks} assertions FAILED`,
  );
  process.exit(1);
}
console.log(`\nverify-scenario-content: all ${checks} assertions passed.`);
