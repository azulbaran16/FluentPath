---
phase: 03-every-scenario-practicable
plan: 01
subsystem: scenario-content
tags: [content, srs, coverage, verification, one-way-door]
status: complete
requires:
  - src/lib/curriculum.ts (the 35 scenarios and the 52 declared pairs)
  - src/lib/progress.ts (recordAttempt, dueReviewIds, weakTopics)
  - src/lib/progress-schema.ts (srsItemSchema, sanitizeEntries)
  - src/lib/progress-merge.ts (unionRecord, mergeSrsItem)
provides:
  - "src/lib/review-items.ts — D-06 id composition/parsing, RecallItem, resolveReviewItem"
  - "src/lib/content/scenario-vocabulary.ts — scenario-keyed vocabulary with authored ids"
  - "src/lib/content/phrases.ts — Phrase.id, getScenarioPhrases (strict), scenarioPhraseKeys"
  - "src/lib/scenario-coverage.ts — derived per-scenario and per-pair coverage"
  - "src/components/practice/RecallDeck.tsx — the one recall renderer"
  - "src/components/practice/ScenarioPractice.tsx — coverage-gated per-skill dispatch"
  - "scripts/verify-scenario-content.mts — 1084 assertions, the phase's content gate"
affects:
  - src/components/ScenarioView.tsx (steps derived; strict phrase accessor)
  - src/components/practice/ReviewView.tsx (resolves through resolveReviewItem)
  - "src/app/(catalog)/world/[slug]/[scenario]/page.tsx (teaches + description derived)"
tech-stack:
  added: []
  patterns:
    - "derived coverage (celpip.ts section()) applied to scenarios"
    - "authored slugs as SRS keys, never index-derived"
    - "low-conflict append-target harness (verify-celpip-content.mts)"
key-files:
  created:
    - src/lib/review-items.ts
    - src/lib/content/scenario-vocabulary.ts
    - src/lib/scenario-coverage.ts
    - src/components/practice/RecallDeck.tsx
    - src/components/practice/ScenarioPractice.tsx
    - scripts/verify-scenario-content.mts
  modified:
    - src/lib/content/phrases.ts
    - src/components/ScenarioView.tsx
    - src/components/practice/ReviewView.tsx
    - "src/app/(catalog)/world/[slug]/[scenario]/page.tsx"
    - .planning/STATE.md
    - .planning/WINDOWS.md
decisions:
  - "D-06 executed verbatim: the SRS id is `world/scenario#kind#slug`, composed only by scenarioItemId"
  - "Vocabulary cards enter the SRS queue through recordAttempt, not markVocab — state.vocab stays the deck browser's known-set"
  - "A recall rating credits speaking XP for a phrase and reading XP for a vocabulary card, matching VocabularyView's existing convention"
  - "RecallDeck snapshots its item list at mount — on /review the caller's array shrinks as items are answered correctly"
  - "The registry's exercise sources carry `{ items, unit }`; ScenarioPractice imports each bank directly, so a bank's renderable TYPE never has to be invented before the bank exists"
metrics:
  duration: ~95min
  tasks: 2
  commits: 2
  completed: 2026-08-01
---

# Phase 3 Plan 01: The Tracer — social/small-talk End to End Summary

`social/small-talk` now has six phrases and eight vocabulary cards of its own feeding the
spaced-repetition queue under composite ids that name their scenario, and the four pieces of
plumbing the other ten plans ride on — authored ids, a namespaced key space, coverage derived
from bank contents, and a 1084-assertion committed gate — are in place and mutation-tested.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 (tracer) | `5d7d9b7` | Authored ids, the strict phrase accessor, the vocabulary bank, `review-items.ts`, `RecallDeck`, derived steps, `ReviewView` resolution, the harness, the STATE.md regression note |
| 2 | `53cfc64` | `scenario-coverage.ts`, `ScenarioPractice`, per-skill sections, the route's derived structured data, the coverage half of the harness |

Registry state on completion: **9/35 scenarios with phrases · 1/35 with vocabulary · 0/52 pairs
written · 52 pending** (speaking 30, writing 9, reading 9, grammar 4). No scenario reports itself
complete.

---

## 1. The id format as executed

**Shape:** `world/scenario#kind#slug`
**Real example:** `social/small-talk#phrase#hows-it-going`
**Vocabulary example:** `social/small-talk#vocab#break-the-ice`

```ts
// src/lib/review-items.ts
export const SCENARIO_ITEM_SEPARATOR = "#";
export type ScenarioItemKind = "phrase" | "vocab";

export function scenarioItemId(
  scenarioKey: string,      // the composite "world/scenario"
  kind: ScenarioItemKind,
  localId: string,          // the item's authored slug
): string;

export function parseScenarioItemId(id: string): ScenarioItemId | undefined;
// ScenarioItemId = { scenarioKey: string; kind: ScenarioItemKind; localId: string }
```

**Nothing downstream may spell the format by hand.** `scenarioItemId` is the only author. This is
a one-way door on live learner data: the string becomes the key its Postgres `srs` entry lives
under, `mergeProgress` unions keys blindly, and an orphaned entry is undetectable.

`parseScenarioItemId` returns `undefined` for a global grammar id (no separator), a malformed id,
an unknown kind, **and a scenario key the curriculum no longer has** — so a deleted scenario's
stored entries resolve to nothing rather than to a half-built item.

Two premises the harness now re-proves on every run rather than trusting once:
- No composed id collides with a `GRAMMAR_QUESTIONS` id or a `VOCAB_DECKS` card id.
- A composed id survives `safeReadProgress` (i.e. `sanitizeEntries`) and `mergeProgress`
  unchanged, in both merge directions and idempotently.

---

## 2. The `RecallItem` shape

Plan 02 renders recall items in three more surfaces. Every field, verbatim:

```ts
// src/lib/review-items.ts
export interface RecallItem {
  id: string;        // the composed, stored id
  front: string;     // shown first — the SPANISH
  back: string;      // revealed — the ENGLISH
  hint?: string;     // a phrase's tip, or a vocabulary card's example sentence
  topic: string;     // the SCENARIO's title (so weakTopics() groups per scenario)
  level: Level;      // the scenario's CEFR level
  xpSkill: Skill;    // "speaking" for a phrase, "reading" for a vocabulary card
}
```

Built by exactly one function, used by both surfaces:

```ts
export function scenarioRecallItems(worldSlug: string, scenarioSlug: string): RecallItem[];
// the scenario's phrases FIRST, then its vocabulary; [] when it has neither — never a fallback
```

Resolution, and the union `ReviewView` switches on:

```ts
export type ReviewItem =
  | { kind: "grammar"; id: string; question: GrammarQuestion }
  | { kind: "recall";  id: string; item: RecallItem };

export function resolveReviewItem(id: string): ReviewItem | undefined;
export function reviewableIds(): string[];   // every id every bank can currently emit
```

**Do not add a field to the stored `{box, due}` value.** `srsItemSchema` is a closed two-field
object; the harness proves a fifth field is stripped on the round trip. That is why the selection
metadata lives in the id.

---

## 3. The coverage registry's exported surface, field by field

`src/lib/scenario-coverage.ts` — React-free and lucide-free, loaded by the harness under
`node --experimental-strip-types` and by the server route.

**A coverage entry:**

```ts
export interface ScenarioCoverage {
  key: string;        // the composite "world/scenario"
  world: string;
  scenario: string;
  title: string;
  level: Level;
  phrases: number;    // the scenario's phrase-bank length
  vocabulary: number; // the scenario's vocabulary-bank length
  skills: ScenarioSkillCoverage[];  // one per DECLARED skill, in curriculum order
  complete: boolean;  // DERIVED: phrases > 0 && vocabulary > 0 && every skill available
}

export interface ScenarioSkillCoverage {
  skill: Skill;         // "grammar" | "speaking" | "reading" | "writing"
  available: boolean;   // true only when the bank actually HOLDS items
  summary: string;      // a count and a unit ("5 questions"); "" when unavailable
}
```

Nothing sets `complete`. Like everything else it falls out of the banks, so it can never be true
of a scenario whose content was dropped.

**The module's exports:**

```ts
export function buildScenarioCoverage(sources: ScenarioCoverageSources): ScenarioCoverage[];
export const SCENARIO_COVERAGE: ScenarioCoverage[];
export function getScenarioCoverage(worldSlug: string, scenarioSlug: string): ScenarioCoverage | undefined;
export function pendingPairs(): { key: string; skill: Skill }[];
export const COVERAGE_TOTALS: {
  pairsTotal: number;              // 52
  pairsWritten: number;            // 0 at this plan
  scenariosWithPhrases: number;    // 9 at this plan
  scenariosWithVocabulary: number; // 1 at this plan
};
```

**A pending pair carries exactly `{ key, skill }`** — `key` is the composite `world/scenario`,
`skill` is the `Skill` union member. In registry order, one entry per declared-but-unavailable
pair. `pendingPairs().filter(p => p.skill === "grammar").length === 0` is the closing assertion of
every skill plan from 03-05 onward, and it is true regardless of which sibling plan merged first.

Every identifier above appears literally in a later plan's verify command. A rename recorded only
in the source is a rename nobody downstream sees until their gate fails.

---

## 4. The harness's append instructions

`scripts/verify-scenario-content.mts`, invoked as
`node --experimental-strip-types scripts/verify-scenario-content.mts`. No test runner, no npm
script, no new dependency. Its header states the rule; plans 02 through 10 make **exactly two
edits**:

1. **One import statement** inside the marked import block at the top
   (`/* Imports — one line per topic. APPEND HERE */`), with an explicit `.ts` extension on the
   relative path — path aliases only resolve inside the bundler.
2. **One new `group("…")` block at the BOTTOM**, above the printed progress meter.

**Do not reorganise the existing groups to make room.** The shared helpers
(`ok`, `canon`, `group`, `filled`, `inRange`, `duplicates`) and the flattened `SCENARIOS` /
`DECLARED_PAIRS` / `SCENARIO_KEYS` constants at the top are shared; everything below them is
per-topic and self-contained, so two plans in one wave can both land here.

Groups present after this plan: banks × 4, ids × 2, resolution, recall items, D-01 duplication,
the curriculum, the storage leg, coverage × 4.

**The progress meter is REPORTED, never asserted** — phrases/35, vocabulary/35, pairs/52. An
assertion on the phase's moving part would fail for most of the phase and end up disabled rather
than fixed (the lesson 02.1-05 recorded about part-kind coverage). If a real assertion here ever
fails, fix the content.

---

## 5. How the derived source-wiring works

Plans 05, 06, 07 and 09 each attach their bank in this shape rather than inventing a second one.

```ts
// src/lib/scenario-coverage.ts
export interface ScenarioSkillSource {
  items: readonly unknown[];  // ONLY .length is read
  unit: string;               // singular noun: "question" | "prompt" | "passage" | "task"
}

export type ScenarioSkillLookup = (
  worldSlug: string, scenarioSlug: string,
) => ScenarioSkillSource | undefined;   // undefined = NO bank entry for this pair

const EXERCISE_SOURCES: Partial<Record<Skill, ScenarioSkillLookup | undefined>> = {};
```

**To wire a bank, add one entry to `EXERCISE_SOURCES`:**

```ts
grammar: (w, s) => {
  const questions = getScenarioGrammar(w, s);
  return questions && { items: questions, unit: "question" };
},
```

Nothing else in `scenario-coverage.ts`, `ScenarioView.tsx` or the route changes.
Owners: grammar 03-05 · writing 03-06 · reading 03-07 and 03-08 · speaking 03-09 and 03-10.

Three properties carried over verbatim from `celpip.ts`:
1. **`undefined` means the bank has no entry.** Do NOT create an empty bank module or an empty
   entry to satisfy the registry — an empty module is a second thing to remember to delete.
2. **The count is decided BEFORE availability.** A bank that exists but holds nothing reports
   unwritten, and emptying it flips the page back with no second edit. Proved by a stub-driven
   control assertion, because no real bank is in that state today.
3. **Summaries are counts and units only** — never a line of a phrase, passage or answer. These
   strings are rendered into the served document.

**Rendering is wired separately, on purpose.** `ScenarioPractice.tsx` gates on
`getScenarioCoverage(...).skills.find(s => s.skill === skill)?.available`, then dispatches through
an exhaustive `switch` over `Skill` **with no `default` clause**, so `tsc` flags any skill added to
the union. Each branch imports its own bank module directly (e.g. plan 05 imports
`getScenarioGrammar` from `src/lib/content/scenario-grammar.ts` and mounts `<GrammarQuiz>`). This
keeps the registry count-only, so a bank's renderable TYPE never has to be invented before the
bank exists. The accent is the **world** colour — on a scenario page the page owner wins.

---

## Deviations from Plan

**None affecting the contract.** Three implementation choices worth recording:

**1. [Rule 2 — missing critical functionality] `RecallDeck` snapshots its items at mount.**
- **Found during:** Task 1, wiring `RecallDeck` into `ReviewView`.
- **Issue:** `/review` derives its item array from the due set. Rating an item correct pushes its
  `due` a day out, so the array shrinks on the very next render while the deck's index advances —
  the deck would skip one item per correct answer, and `items[i]` would eventually be `undefined`
  and crash on `item.front`.
- **Fix:** `const [deck] = useState(() => items)`. The scenario page's array is static, so the
  snapshot is a no-op there.
- **Note:** `GrammarQuiz` has the same latent shape on `/review` and is **untouched** — it is
  pre-existing behaviour outside this plan's scope. Not logged as a defect because nothing this
  plan did made it worse.
- **Commit:** `5d7d9b7`

**2. Two accessors exported from `phrases.ts`, not one.** `getScenarioPhrases` (strict,
`Phrase[] | undefined`) is what the scenario page and the registry read. `getPhrases` (lenient,
world fallback) is kept for the eight speaking-page and speaking-pack call sites. All eight pass
curated keys, so none of them takes the fallback branch — it stays only because deleting it now
would leave the 26 scenarios with no curated set with nothing at all in a module whose type says
otherwise. Plan 03-11 deletes it.

**3. `scenarioPhraseKeys()` / `scenarioVocabularyKeys()` added.** Not in the plan's export list.
The harness needs them for the assertion the plan explicitly asks for — "every scenario key present
in either bank names a real world-and-scenario pair" — which iterating the curriculum cannot make,
since a typo'd key like `travel/resturant` would simply never be reached. Both are documented as
harness-only.

## Threat Flags

None. No new network surface, no new auth path, no schema change, no dependency. The threat
register's four `mitigate` dispositions were all honoured: no field added to the stored `{box, due}`
value (T-03-01, `verify-schema` still 309); composed ids proved globally unique and disjoint from
both existing key spaces (T-03-05); every SRS-bearing item carries an authored slug and the
interface documents the rule at the field (T-03-06); every coverage summary is a count and a unit
(T-03-04). Zero packages installed (T-03-SC); dependencies unchanged at 11 + 11.

## Known Stubs

The four exercise branches of `ScenarioPractice`'s switch render the honest "Not yet available"
panel rather than an exercise. **Intentional and load-bearing**, not a stub to be hidden: no bank
exists yet, `EXERCISE_SOURCES` is deliberately empty, and the coverage gate returns before the
switch is reached. Plans 03-05, 03-06, 03-07/08 and 03-09/10 fill them. The registry reports 0/52
pairs written, so the app claims nothing it does not have.

## Verification Results

Every `<verify>` block in the plan was run.

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | 840 assertions passed · 9/35 · 1/35 |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| `verify-merge.mts && verify-schema.mts` | 20146 · 309 |
| `! grep -Eq '[^A-Za-z]getPhrases\(' src/components/ScenarioView.tsx` | PASS |
| `grep -Eiq '(twenty-six\|26) scenario' .planning/STATE.md` | PASS |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | 1084 assertions passed · 9/35 · 1/35 · 0/52 |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| `! grep -Eq 'lucide-react\|from "react"' src/lib/scenario-coverage.ts` | PASS |
| `COVERAGE_TOTALS` inline check | `{pairsTotal:52, pairsWritten:0, scenariosWithPhrases:9, scenariosWithVocabulary:1}` |
| `pendingPairs()` inline check | 52 pending · `{speaking:30, writing:9, reading:9, grammar:4}` · 0 complete |

**Baselines, all held**

`verify-merge` 20146 · `verify-schema` 309 · `verify-celpip-content` 648 · `verify-celpip-speech` 50
· `verify-queue` 173 · `verify-headers` 24 · `verify-celpip-sections` 43 · dependencies 11 + 11.

**Mutation testing — a first green run of hand-written content is not evidence.**
Run under bash with an anchor-exact applier that aborts loudly on a missing OR ambiguous anchor
(it did both: a CRLF-mismatched multi-line anchor in `progress-schema.ts` and an anchor matching
77 times were each refused rather than guessed — the exact failure 02.1-01 recorded).

| | Caught (expected caught) | Survived (expected survived) |
|---|---|---|
| Banks & ids | M1 floor 6→5 · M2 duplicate slug · M3 typo'd bank key · M4 blank example · M5 flat (un-namespaced) id · M6 parser skips the curriculum check · M7 strict accessor becomes lenient · M8 vocabulary dropped from the deck · M9 index-derived card id · M10 topic collapsed to "General" | C1 reworded gloss · C2 reordered phrases · C3 a seventh phrase · C4 a ninth card |
| Storage leg | S1 poisoned key (`constructor`) · S2 `srsItemSchema` made permissive · S3b `attempts.topic` collapsed | S4 comment-only change |
| Coverage | K1 availability from source presence not contents · K2 `complete` ignores vocabulary · K3 `complete` ignores skills · K4 `pendingPairs` inverted · K5 summary emitted when unavailable · K6 `scenariosWithPhrases` fixed to 35 · K7 skills not read from the declaration | KC1 unit default reworded · KC2 totals computed a different way |

**22 mutations caught, 7 controls survived, 0 spurious.** One mutation (S3, an unrelated optional
field added to `attemptStatSchema`) survived and was found on inspection to be a **defective
mutation, not a gap** — it never touched `topic`; the corrected S3b was caught.

**Browser observation — partial, and the rest is owed.**
Against a production build (`next start`, server shut down afterwards; port confirmed free), from
the served HTML:
- `social/small-talk` renders the **"Lock it in"** step with its first authored card front, one
  section per declared skill, and **"Not yet available" ×2** for its two unwritten pairs.
- `social/dating` (no curated set) renders the honest warm-up panel, **no "Lock it in" step**, and
  — the regression, observed rather than asserted — **none of the generic per-world lines**
  (`"Nice to meet you"` is gone from the page). Steps derive as `1 2 3 4` with no gap.
- The scenario route's JSON-LD carries **no `teaches` key** at all, retiring the overclaim.

**Not observed:** the interactive recall loop (reveal → Got it/Not yet → XP → "Locked in"), and
**`/review` rendering a due scenario item** — `/review` is auth-gated (307 → `/login`) and needs a
signed-in session with a populated store. That last one is the far end of D-05. It is proved
*deterministically* by the harness — every composed id resolves through `resolveReviewItem`, and
the composed key survives `sanitizeEntries` and `mergeProgress` in both directions — and
`ReviewView`'s only selection path is now that function. But **no human has seen it on screen.**
Recorded as `.planning/WINDOWS.md` id **29**, owed to plan 03-11.

## The regression this plan deliberately introduces

**Twenty-six scenarios lost their speaking warm-up on commit `5d7d9b7` and gain nothing back until
plan 03-04.** They used to receive `WORLD_FALLBACK` — three generic lines shared by every scenario
in the world, i.e. two scenarios handed the identical exercise, exactly what D-01 was chosen to
prevent. They now render an honest panel with a link to the global speaking room. A temporary
reduction in what is shown for an increase in what is true. Written into `.planning/STATE.md` under
Blockers/Concerns, naming **plan 03-04** as the plan that closes it and
`COVERAGE_TOTALS.scenariosWithPhrases === 35` as the evidence to remove it on.

## Self-Check: PASSED

All six created files exist on disk; both commits (`5d7d9b7`, `53cfc64`) are in `git log`.
