// Executable proof that no live spaced-repetition id has been re-pointed.
//
//   node --experimental-strip-types scripts/verify-id-stability.mts
//   node --experimental-strip-types scripts/verify-id-stability.mts --update
//
// Same posture as scripts/verify-scenario-content.mts and the seven other
// verify-*.mts scripts: no test runner, no new dependency, `.mts` so node does
// not warn about a typeless package, explicit `.ts` extensions on relative
// imports because path aliases only resolve inside the bundler, and the verdict
// is the EXIT CODE. Node's MODULE_TYPELESS_PACKAGE_JSON warning on stderr is
// expected noise.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS EXISTS.
//
// An item's authored slug becomes the key its Postgres `srs` entry lives under
// (`scenarioItemId`, src/lib/review-items.ts). `mergeProgress` unions those keys
// blindly and cannot delete one, so:
//
//   - INSERTING an id is free and always will be.
//   - DELETING one is safe: the stored entry goes unreferenced and
//     `resolveReviewItem` skips it.
//   - RE-POINTING one — leaving the id in place and changing the content behind
//     it — silently transfers a learner's Leitner box and due date onto material
//     she has never seen. There is no migration path and, until this script,
//     NO WAY TO DETECT IT AFTERWARDS (AGENTS.md, phrases.ts:22-31).
//
// Phase 4 deletes and replaces items on purpose (04-CONTEXT D-04) and authors
// well over a hundred new ids besides. It needs the detector before it does
// either, so the detector lands in the phase's first plan, second task.
//
// ─────────────────────────────────────────────────────────────────────────────
// SCOPE: THE SCHEDULED KINDS ONLY — phrase, vocab, grammar — PLUS THE VOLUME
// TIER'S OWN KEY SPACE.
//
// The scheduled kinds are the only kinds a Postgres `srs` entry is ever keyed by
// inside the SCENARIO space (`SCHEDULED_ITEM_KINDS`). Writing, reading and
// speaking compose ids for uniqueness and storage scoping only; nothing scores
// them, nothing schedules them, and hashing them would gate prose that no
// learner's progress points at.
//
// Phase 04.1 adds a SECOND KEY SPACE, not a second kind inside the first: the
// volume tier's ids are `vocab:<slug>`, composed by `coreVocabItemId` and parsed
// by `parseCoreVocabItemId` (src/lib/core-vocab-items.ts), and they are
// deliberately unknown to `parseScenarioItemId` — L1 of 04.1-CONTEXT, because a
// pseudo-scenario id would be stored, merged and scheduled correctly and NEVER
// RENDERED. Those ids reach the same `srs` column and are the same one-way door,
// so they belong under the same detector. Five hundred of them are authored
// after this gate learns them, and not one before.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT IS HASHED — THE COVERED-FIELD CONTRACT.
//
// The WHOLE authored record, every field, not the headline one. A hash over
// `text` alone would pass a rewritten `tip`; a hash over `term` alone would pass
// a rewritten `example` — and a partial edit under a live id is precisely the
// edit an author under fatigue is most likely to make, and precisely what D-04
// forbids ("never edit the content behind an existing id", not "never edit its
// headline field").
//
//   phrase   → slug, kind, en (Phrase.text), es, tip        [Phrase, phrases.ts]
//   vocab    → slug, kind, term, es, example    [ScenarioVocabCard, s.-vocab.ts]
//   grammar  → slug, kind, level, topic, prompt, options, answer, explain
//                                            [GrammarQuestion, s.-grammar.ts]
//   corevocab→ slug, kind, word, es, example  [CoreVocabCard, core-vocabulary.ts]
//
// That is every authored field of each type. `tip` is optional and hashes as
// null when absent, so ADDING a tip to a live phrase is a change this gate
// catches — which is correct: a learner scheduled a card whose hint was blank.
// The composed id itself is the KEY, not part of the payload; the slug and the
// kind are inside the payload anyway, so a hash binds content to its own id.
//
// `assertCoveredFields` below fails if either content type ever grows a field
// this contract does not name, so the contract cannot silently fall behind the
// banks it describes.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE FOUR RULES — UNCHANGED BY THE SECOND KEY SPACE, AND THAT IS WORTH SAYING.
//
// They operate on an id→hash MAP and are agnostic to how an id was spelled, so
// arriving at a second key space cost them nothing: not one of the four was
// touched when `vocab:` was added. Recording that here rather than leaving the
// next reader to work it out, because "I did not have to touch the rules" is a
// fact about the design — the rules gate KEYS, the tree decides what a key is.
//
//   1. An id in BOTH the fixture and the tree must hash the same.
//      → a re-point fails, and so does a partial edit under a live id.
//
//   2. An id in the fixture and NOT in the tree must appear in the fixture's
//      `retired` list with a reason.
//      → a deletion is auditable rather than merely survivable.
//
//   3. An id in the tree and NOT in the fixture FAILS as an unrecorded addition.
//      → this is the rule that makes the gate MANDATORY rather than opt-in.
//        Adding items is free; adding them without regenerating the fixture in
//        the same commit is not, because an id that never enters the fixture is
//        an id rule 1 can never protect. Every plan in this phase regenerates.
//
//   4. An id on the `retired` list must NOT be emitted by any bank.
//      → a retirement is final. An id coming back is a re-point wearing a
//        different hat, and a later plan proves its retirement held by running
//        this script rather than by grepping source, where a comment or a
//        near-miss substring would make the check lie in either direction.
//
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE MODE, AND WHAT A LEGITIMATE DIFF LOOKS LIKE.
//
// `--update` regenerates `scripts/fixtures/scheduled-item-ids.json` from the
// tree. THE REGENERATED DIFF IS THE REVIEW. A legitimate one is:
//
//   * new id lines ADDED;
//   * nothing REMOVED except ids that moved into `retired` with a reason;
//   * NOT ONE CHANGED HASH on an id that already existed.
//
// A changed hash beside an unchanged id is exactly what a reviewer should
// refuse, so update mode refuses it first: it exits non-zero rather than
// laundering a re-point into the fixture. It likewise refuses to drop an id that
// has not been declared retired. Both refusals name the id. There is no flag to
// override them — the fix is to revert the edit, or to retire the old id and add
// a new one with its own slug, which is what a replacement has always meant.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { WORLDS } from "../src/lib/curriculum.ts";
import { getScenarioPhrases } from "../src/lib/content/phrases.ts";
import { getScenarioVocabulary } from "../src/lib/content/scenario-vocabulary.ts";
import { getScenarioGrammar } from "../src/lib/content/scenario-grammar.ts";
import {
  SCHEDULED_ITEM_KINDS,
  parseScenarioItemId,
  scenarioItemId,
} from "../src/lib/review-items.ts";
// The SECOND key space (04.1). The bank stores the bare slug; the stored key is
// composed here by `coreVocabItemId`, exactly as the app composes it, so the
// gate cannot record a key the app would never write.
import { CORE_VOCABULARY } from "../src/lib/content/core-vocabulary.ts";
import {
  CORE_VOCAB_PREFIX,
  coreVocabItemId,
  parseCoreVocabItemId,
} from "../src/lib/core-vocab-items.ts";

/* ------------------------------------------------------------------ *
 * Harness — the same shape verify-scenario-content.mts uses.
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

/** Deterministic serialization: a difference in key order must never move a
 * hash, or every reordered object literal would read as a re-point. */
function canon(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canon).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function digest(record: Record<string, unknown>): string {
  return createHash("sha256").update(canon(record), "utf8").digest("hex");
}

/* ------------------------------------------------------------------ *
 * The fixture.
 * ------------------------------------------------------------------ */

const FIXTURE_URL = new URL(
  "./fixtures/scheduled-item-ids.json",
  import.meta.url,
);
const FIXTURE_PATH = "scripts/fixtures/scheduled-item-ids.json";

interface Retirement {
  id: string;
  reason: string;
}

interface Fixture {
  note: string[];
  ids: Record<string, string>;
  retired: Retirement[];
}

const FIXTURE_NOTE = [
  "Every scheduled spaced-repetition id the content banks can emit, with a",
  "SHA-256 of the item's FULL authored record — every field, not the headline",
  "one. Generated and checked by scripts/verify-id-stability.mts; the covered",
  "fields, the four rules and the shape of a legitimate diff are documented in",
  "that script's header. Regenerate with `--update` IN THE SAME COMMIT as the",
  "content that changed it. Never hand-edit a hash. An id that leaves `ids`",
  "must arrive in `retired` with a reason, and a retired id may never come back.",
];

function emptyFixture(): Fixture {
  return { note: FIXTURE_NOTE, ids: {}, retired: [] };
}

/** Written with sorted keys and a trailing newline so two runs over the same
 * tree are byte-identical — the `--update` idempotence check each plan runs
 * depends on it. */
function serialize(fixture: Fixture): string {
  const sortedIds: Record<string, string> = {};
  for (const id of Object.keys(fixture.ids).sort()) {
    sortedIds[id] = fixture.ids[id];
  }
  const sortedRetired = [...fixture.retired].sort((a, o) =>
    a.id < o.id ? -1 : a.id > o.id ? 1 : 0,
  );
  return `${JSON.stringify(
    { note: FIXTURE_NOTE, ids: sortedIds, retired: sortedRetired },
    null,
    2,
  )}\n`;
}

function readFixture(): Fixture | undefined {
  if (!existsSync(FIXTURE_URL)) return undefined;
  const parsed = JSON.parse(readFileSync(FIXTURE_URL, "utf8")) as Partial<Fixture>;
  return {
    note: parsed.note ?? FIXTURE_NOTE,
    ids: parsed.ids ?? {},
    retired: parsed.retired ?? [],
  };
}

/* ------------------------------------------------------------------ *
 * The tree — every scheduled id a bank can emit, and its hash.
 * ------------------------------------------------------------------ */

/**
 * The union of field names actually seen, per kind, accumulated over EVERY item
 * rather than sampled from the first — an optional field that only some items
 * carry would otherwise slip past a sample and be hashed by nobody.
 */
const seenFields: Record<string, Set<string>> = {
  phrase: new Set(),
  vocab: new Set(),
  grammar: new Set(),
  corevocab: new Set(),
};

function noteFields(kind: string, item: object) {
  for (const field of Object.keys(item)) seenFields[kind].add(field);
}

/**
 * Guards the covered-field contract in the header against a content type that
 * grows a field. A silently uncovered field is a silently un-gated edit, which
 * is the whole failure this script exists to make impossible.
 */
function assertCoveredFields(kind: string, covered: readonly string[]) {
  const extra = [...seenFields[kind]].filter((f) => !covered.includes(f));
  ok(
    `${kind}: the hashed record covers every authored field`,
    extra.length === 0,
    `uncovered field(s): ${extra.join(", ")} — add them to the hash AND to the covered-field contract in this script's header, then regenerate the fixture`,
  );
}

const PHRASE_FIELDS = ["id", "text", "es", "tip"] as const;
const VOCAB_FIELDS = ["id", "term", "es", "example"] as const;
const GRAMMAR_FIELDS = [
  "id",
  "level",
  "topic",
  "prompt",
  "options",
  "answer",
  "explain",
] as const;
const COREVOCAB_FIELDS = ["id", "word", "es", "example"] as const;

const tree = new Map<string, string>();

for (const world of WORLDS) {
  for (const scenario of world.scenarios) {
    const key = `${world.slug}/${scenario.slug}`;

    for (const phrase of getScenarioPhrases(world.slug, scenario.slug) ?? []) {
      noteFields("phrase", phrase);
      tree.set(
        scenarioItemId(key, "phrase", phrase.id),
        digest({
          kind: "phrase",
          slug: phrase.id,
          en: phrase.text,
          es: phrase.es,
          tip: phrase.tip ?? null,
        }),
      );
    }

    for (const card of getScenarioVocabulary(world.slug, scenario.slug) ?? []) {
      noteFields("vocab", card);
      tree.set(
        scenarioItemId(key, "vocab", card.id),
        digest({
          kind: "vocab",
          slug: card.id,
          term: card.term,
          es: card.es,
          example: card.example,
        }),
      );
    }

    for (const question of getScenarioGrammar(world.slug, scenario.slug) ?? []) {
      noteFields("grammar", question);
      // The bank composes the id; `parseScenarioItemId` is its one inverse, so
      // the slug is recovered rather than re-derived by string surgery here.
      const slug = parseScenarioItemId(question.id)?.localId;
      ok(
        `grammar: ${question.id} is a composed scenario item id`,
        slug !== undefined,
        "a scenario grammar question whose id does not parse is not schedulable and cannot be gated",
      );
      tree.set(
        question.id,
        digest({
          kind: "grammar",
          slug: slug ?? question.id,
          level: question.level,
          topic: question.topic,
          prompt: question.prompt,
          options: question.options,
          answer: question.answer,
          explain: question.explain,
        }),
      );
    }
  }
}

// The VOLUME tier (04.1) — a second key space in the same tree, hashed on the
// same terms. `card.id` is the SLUG; the key is composed here, because the bank
// deliberately does not import the key space (that acyclicity is itself asserted
// in verify-scenario-content.mts).
for (const card of CORE_VOCABULARY) {
  noteFields("corevocab", card);
  tree.set(
    coreVocabItemId(card.id),
    digest({
      kind: "corevocab",
      slug: card.id,
      word: card.word,
      es: card.es,
      example: card.example,
    }),
  );
}

assertCoveredFields("phrase", PHRASE_FIELDS);
assertCoveredFields("vocab", VOCAB_FIELDS);
assertCoveredFields("grammar", GRAMMAR_FIELDS);
assertCoveredFields("corevocab", COREVOCAB_FIELDS);

// Scope proof, not decoration: if an unscheduled kind ever leaked into the map
// the gate would be hashing prose nothing schedules, and the covered-field
// contract above would not describe it.
//
// TWO POSITIVE BRANCHES, not one relaxed predicate. A `vocab:` id parses to
// nothing through `parseScenarioItemId` — by design, L1 — so the tempting repair
// when the second key space arrived was "parses OR starts with the prefix",
// which would wave through a MALFORMED id of either space: `vocab:` with no
// slug, or `vocab:ghost` for a card the bank does not hold. Instead each id is
// routed to the parser of its own space and must satisfy that parser fully. The
// scenario branch is byte-for-byte the check it always was, unqualified; an id
// that satisfies neither branch still fails, on whichever label it was routed
// to. `CORE_VOCAB_PREFIX` is the router, and it is the same constant the
// composer uses, so the two cannot drift apart.
for (const id of tree.keys()) {
  if (id.startsWith(CORE_VOCAB_PREFIX)) {
    ok(
      `scope: ${id} is a well-formed volume id the bank holds`,
      parseCoreVocabItemId(id) !== undefined,
      "a `vocab:` key whose slug no card carries is stored, merged and never rendered — D-05 in the second key space",
    );
    continue;
  }
  const kind = parseScenarioItemId(id)?.kind;
  ok(
    `scope: ${id} is a scheduled kind`,
    kind !== undefined && SCHEDULED_ITEM_KINDS.includes(kind),
    `kind: ${kind ?? "unparseable"}`,
  );
}

/* ------------------------------------------------------------------ *
 * Update mode.
 * ------------------------------------------------------------------ */

const updating = process.argv.includes("--update");
const existing = readFixture();

if (updating) {
  if (failures > 0) {
    console.error(
      "\nverify-id-stability: refusing to regenerate — the tree itself failed a check above.",
    );
    process.exit(1);
  }

  const previous = existing ?? emptyFixture();
  const retiredIds = new Set(previous.retired.map((r) => r.id));
  const refusals: string[] = [];

  for (const [id, hash] of Object.entries(previous.ids)) {
    const current = tree.get(id);
    if (current === undefined) {
      if (!retiredIds.has(id)) {
        refusals.push(
          `  ${id}\n    is in the fixture and no longer in the tree, and is not declared retired.\n    Add it to "retired" with a reason, then re-run --update. A deletion must be auditable.`,
        );
      }
      continue;
    }
    if (current !== hash) {
      refusals.push(
        `  ${id}\n    already existed and its content HASH CHANGED. That is a re-point: this id is a live key in\n    somebody's Postgres srs, so editing the content behind it moves her box and due date onto\n    material she has never seen. Revert the edit, or retire this id and add a NEW one with its\n    own slug. There is deliberately no flag to force this through.`,
      );
    }
  }

  if (refusals.length > 0) {
    console.error(
      `\nverify-id-stability --update: REFUSED, ${refusals.length} id(s):\n\n${refusals.join("\n\n")}\n`,
    );
    process.exit(1);
  }

  const next: Fixture = {
    note: FIXTURE_NOTE,
    ids: Object.fromEntries(tree),
    retired: previous.retired,
  };
  // Line endings are normalised before comparing: this repo checks out with
  // core.autocrlf, so a fixture git handed back as CRLF would read as "changed"
  // against the LF this always writes, and the message would lie.
  const before = existing
    ? readFileSync(FIXTURE_URL, "utf8").replace(/\r\n/g, "\n")
    : "";
  const after = serialize(next);
  writeFileSync(FIXTURE_URL, after, "utf8");

  const added = [...tree.keys()].filter((id) => !(id in previous.ids)).length;
  console.log(
    `verify-id-stability --update: ${tree.size} scheduled id(s) recorded` +
      ` (${added} new), ${next.retired.length} retired.`,
  );
  console.log(
    before === after
      ? `  ${FIXTURE_PATH} is unchanged — the fixture was already regenerated alongside the content.`
      : `  ${FIXTURE_PATH} REWRITTEN. Read the diff: additions only, nothing removed except into "retired", no changed hash.`,
  );
  process.exit(0);
}

/* ------------------------------------------------------------------ *
 * The four rules.
 * ------------------------------------------------------------------ */

if (!existing) {
  console.error(
    `FAIL  the fixture ${FIXTURE_PATH} does not exist` +
      "\n      Seed it: node --experimental-strip-types scripts/verify-id-stability.mts --update",
  );
  process.exit(1);
}

const fixture = existing;

console.log("· rule 1: an id present in both hashes the same (no re-point)");

for (const [id, hash] of Object.entries(fixture.ids)) {
  const current = tree.get(id);
  if (current === undefined) continue;
  ok(
    `${id} still holds the content it was recorded with`,
    current === hash,
    "the content behind a LIVE id changed. This id is the key a learner's Leitner box and due date" +
      " are stored under, so this moves her schedule onto material she has never seen. A replacement" +
      " is: retire this id, add a NEW one with its own slug — never edit in place.",
  );
}

console.log("· rule 2: an id that left the tree was declared retired, with a reason");

for (const id of Object.keys(fixture.ids)) {
  if (tree.has(id)) continue;
  const retirement = fixture.retired.find((r) => r.id === id);
  ok(
    `${id} left the banks and is declared retired`,
    retirement !== undefined,
    'deleting an item is safe — its stored entry simply goes unreferenced — but it must be auditable:' +
      ' add { "id", "reason" } to "retired" in the fixture.',
  );
  if (retirement) {
    ok(
      `${id}'s retirement carries a reason`,
      typeof retirement.reason === "string" && retirement.reason.trim() !== "",
      "a retirement with no reason is a deletion nobody can review",
    );
  }
}

console.log("· rule 3: every id the banks emit is recorded (no unrecorded addition)");

for (const id of tree.keys()) {
  ok(
    `${id} is recorded in the fixture`,
    id in fixture.ids,
    `an id that never enters the fixture is an id rule 1 can never protect. Run:` +
      ` node --experimental-strip-types scripts/verify-id-stability.mts --update` +
      ` and COMMIT ${FIXTURE_PATH} beside the content that added this id.`,
  );
}

console.log("· rule 4: a retired id never comes back");

for (const retirement of fixture.retired) {
  ok(
    `${retirement.id} stays retired`,
    !tree.has(retirement.id),
    "a retirement is final: an id that comes back re-points a stored schedule onto whatever now" +
      " carries that slug. Give the new item its own slug instead.",
  );
  ok(
    `${retirement.id} is not also recorded as live`,
    !(retirement.id in fixture.ids),
    "an id cannot be both live and retired — regenerate the fixture (--update) so the retirement" +
      " is the only record of it",
  );
}

console.log("");
console.log(`  scheduled ids: ${tree.size} in the banks, ${Object.keys(fixture.ids).length} in the fixture`);
console.log(`  retired:       ${fixture.retired.length}`);

if (failures > 0) {
  console.error(
    `\nverify-id-stability: ${failures} of ${checks} assertions FAILED`,
  );
  process.exit(1);
}
console.log(`\nverify-id-stability: all ${checks} assertions passed.`);
