---
phase: 03-every-scenario-practicable
plan: 05
subsystem: scenario-content
tags: [content, srs, cont-01, grammar, coverage, derived-ui, mutation-testing]
status: complete
requires:
  - src/lib/review-items.ts (scenarioItemId, resolveReviewItem, reviewableIds — plan 03-01)
  - src/lib/scenario-coverage.ts (EXERCISE_SOURCES, pendingPairs — plan 03-01)
  - src/components/practice/GrammarQuiz.tsx (the renderer, untouched)
  - src/lib/content/grammar.ts (the GrammarQuestion shape and the global topic strings)
  - scripts/verify-scenario-content.mts (the phase's content gate — plan 03-01)
provides:
  - "src/lib/content/scenario-grammar.ts — getScenarioGrammar, scenarioGrammarKeys; 4/4 grammar pairs at D-04's floor"
  - "src/lib/review-items.ts — ScenarioItemKind gains \"grammar\"; resolveReviewItem and reviewableIds cover scenario exercises"
  - "src/lib/scenario-coverage.ts — the grammar EXERCISE_SOURCES entry (the pattern plans 06/07/09 copy)"
  - "src/components/SkillPill.tsx — SkillPill(available?), PendingBadge"
affects:
  - src/components/practice/ScenarioPractice.tsx (the grammar branch of the dispatch)
  - src/components/ScenarioView.tsx (header pills read the registry)
  - "src/app/(catalog)/skill/[skill]/page.tsx (written-out-of-declared, derived)"
  - src/components/Dashboard.tsx (its due count now sees scenario grammar — via reviewableIds)
  - src/components/practice/ReviewHub.tsx (its weak-spots drill now produces scenario grammar)
  - .planning/WINDOWS.md (entries 33 and 34)
tech-stack:
  added: []
  patterns:
    - "reuse the EXISTING exercise shape per skill; the renderer needs no scenario-awareness"
    - "compose SRS ids LAZILY when the bank and the resolver form an ESM cycle"
    - "assert per-skill pending pairs, never a global written total"
    - "a mutation driver that counts declared vs EXECUTED and refuses multi-line anchors"
key-files:
  created:
    - src/lib/content/scenario-grammar.ts
  modified:
    - src/lib/review-items.ts
    - src/lib/scenario-coverage.ts
    - src/components/practice/ScenarioPractice.tsx
    - src/components/SkillPill.tsx
    - src/components/ScenarioView.tsx
    - "src/app/(catalog)/skill/[skill]/page.tsx"
    - scripts/verify-scenario-content.mts
decisions:
  - "The question's id IS the composed scenario item id, so GrammarQuiz needed no change at all — ROADMAP criterion 3 is inherited, not built"
  - "Ids are composed on FIRST ACCESS, not at module scope: review-items ⇄ scenario-grammar is a real ESM cycle and eager composition would hit SCENARIO_ITEM_SEPARATOR's temporal dead zone depending on nothing but import order"
  - "reviewableIds() was extended, and one pre-existing harness assertion with it — Dashboard and ReviewHub filter the due set through that list, so an omitted id is scheduled and then counted nowhere"
  - "Topic strings: 8 of 20 questions reuse a global bank topic EXACTLY so the two aggregate in weak topics; 7 new topic strings are permanent identifiers, not copy"
  - "CONT-01 was NOT ticked. It is at 4/52; the requirement says EVERY pair"
  - "WorldView's pills were left counting declarations rather than expanding this plan's scope quietly — recorded in WINDOWS.md instead"
metrics:
  duration: ~75min
  tasks: 3
  commits: 3
  completed: 2026-08-01
---

# Phase 3 Plan 05: Scenario Grammar, All Four Pairs Summary

All four scenario×skill pairs that declare grammar now have five questions written for their own
situation, scheduled under ids that name their own scenario, and the mistakes a learner makes in
them reach her weak spots through machinery that already existed — **CONT-01 moves off zero, to
4/52**, and the pills and skill pages stopped counting promises.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `77db41b` | `scenario-grammar.ts`, the `"grammar"` item kind, resolution, `reviewableIds`, the registry entry, the dispatch branch, 7 harness groups — proved on `social/small-talk` |
| 2 | `729ac46` | `work/interviews`, `work/emails`, `native/phrasal-verbs` — grammar's quarter of D-01 closes |
| 3 | `cd6a0cc` | `SkillPill(available)`, `PendingBadge`, `ScenarioView`'s header, and written-out-of-declared on `/skill/[skill]` |

**Registry state on completion: 4/52 pairs written · 48 pending (speaking 30, writing 9, reading 9,
grammar 0) · 35/35 phrases · 35/35 vocabulary.** 20 new questions, 80 options, 20 explanations.

---

## 1. How the grammar source was wired — copy this, plans 06, 07 and 09

Four edits, and the fourth is the one that is easy to miss.

**(a) The registry — one entry, nothing else in the file.** Exactly as 03-01 and 03-04 promised:

```ts
// src/lib/scenario-coverage.ts
const EXERCISE_SOURCES: Partial<Record<Skill, ScenarioSkillLookup | undefined>> = {
  grammar: (w, s) => {
    const questions = getScenarioGrammar(w, s);
    return questions && { items: questions, unit: "question" };
  },
};
```

Availability, the summary, `complete`, `pendingPairs()` and `COVERAGE_TOTALS` all followed with no
further edit. The promise held: nothing else in `scenario-coverage.ts`, `ScenarioView.tsx` or the
scenario route changed.

**(b) The dispatch — look the pair up, hand it to the existing renderer.**

```tsx
// src/components/practice/ScenarioPractice.tsx
case "grammar": {
  const questions = getScenarioGrammar(world.slug, scenario.slug);
  if (!questions) return <NotWrittenYet skill={skill} scenario={scenario} />;
  return <GrammarQuiz questions={questions} accent={props.accent} />;
}
```

`GrammarQuiz` is **byte-for-byte unchanged**. That is the whole point of reusing the existing
question shape.

**(c) Resolution — a new kind, and a branch that returns the SAME variant.**

```ts
// src/lib/review-items.ts
export type ScenarioItemKind = "phrase" | "vocab" | "grammar";

if (parsed.kind === "grammar") {
  const question = (getScenarioGrammar(worldSlug, scenarioSlug) ?? [])
    .find((c) => c.id === id);
  return question ? { kind: "grammar", id, question } : undefined;
}
```

Returning the **existing** `{ kind: "grammar" }` variant rather than a new one means `/review`,
`ReviewHub`'s weak-spots drill and `MistakesView` render a scenario question through `GrammarQuiz`
with no branch of their own. Not one of those three files was touched.

**(d) `reviewableIds()` — the edit that is easy to forget, and the reason it matters.**
`Dashboard.tsx:20` and `ReviewHub.tsx:30` both build `REVIEWABLE_IDS = new Set(reviewableIds())`;
the "Due today" count filters the due set through it, and the weak-spots drill is built by
**resolving every id in it**. An id this function omits is stored, merged and scheduled perfectly
and then **counted nowhere and drillable never** — D-05 one level up. So:

```ts
for (const question of getScenarioGrammar(world.slug, scenario.slug) ?? []) {
  ids.push(question.id);
}
```

The function's doc-comment now states this rule at the point of edit. **If your bank writes to the
SRS, you have four edits, not three.**

---

## 2. The id, and why composition is LAZY

Every question's `id` is the fully composed D-06 id — `social/small-talk#grammar#weather-question-tag`
— composed only by `scenarioItemId`. Because `GrammarQuiz` passes `q.id` straight to `recordAttempt`,
that single decision buys the namespaced schedule entry, the review resolution and ROADMAP criterion
3 with **zero component change**.

But the bank stores an authored **local slug** and composes on the way out, not at module scope, and
that is not a style choice:

> `review-items.ts` imports `scenario-grammar.ts` (to resolve a due id) and `scenario-grammar.ts`
> imports `scenarioItemId` from `review-items.ts`. That is a genuine ESM cycle. Composing at module
> scope calls `scenarioItemId` **while `review-items.ts`'s own `const SCENARIO_ITEM_SEPARATOR` is
> still in its temporal dead zone** whenever `review-items.ts` happens to be evaluated first — a
> `ReferenceError` that depends on nothing but import order, and therefore appears in the bundler
> and not in the harness, or the other way round. Building on first *access* moves the call after
> every module body has run, in every order.

Proved rather than reasoned about: the module loads and resolves correctly when the entry point is
`review-items.ts` **and** when it is `scenario-grammar.ts`. The result is memoised in a module-level
`COMPOSED`, so the array a component receives is referentially stable across renders.

Plans 06, 07 and 09 will hit the identical cycle the moment their bank both composes ids and is
resolved. Copy the lazy accessor.

---

## 3. The content, and what each set was written to do

**35 of the 39 global grammar questions are single-clause drills at a level.** These are not that.
Each set practises the *moves* its scenario is made of.

| Scenario | Level | The five questions |
|---|---|---|
| `social/small-talk` | B1 | Opening (question tags), the weekend question (past simple, with the present-perfect trap), the **echo question** that keeps a chat alive, "what are you doing *these days*" vs "what do you do", and closing with `I'd better let you get on` |
| `work/interviews` | B2 | A span of experience (present perfect continuous), **STAR order** (past perfect), `I'd say` as a hedge, a role you don't have yet (second conditional), and **embedded word order** in the question you ask back |
| `work/emails` | B1 | `Would you mind + -ing`, the first conditional for an offer, the passive where the actor is **deliberately** absent, `look forward to hearing`, and `I was wondering` as politeness-by-distance |
| `native/phrasal-verbs` | B2 | Separable **with a pronoun** (`look it over`), **inseparable** (`do without it`), particle meaning twice (`drag on`, `make out`), and a phrasal verb against its formal single-word twin (`postpone → put off`) |

Two authoring constraints were held deliberately:

- **The briefings and the existing banks were read first and their material excluded.**
  `native/phrasal-verbs` already teaches `turn it down` and the `get up / get on / get over` family
  in its briefing and fourteen more phrasal verbs across its phrase set and deck. **None of those
  appears as an answer here.** `look over`, `do without`, `drag on`, `make out` and `put off` are all
  fresh, so the scenario now teaches nineteen rather than fourteen twice. `work/emails` likewise:
  its phrase set is about the *mechanics* of email (`I'll copy you in`, `it landed in your spam`),
  so the questions took the *tone* instead.
- **`work/interviews`' question 5 extends its own briefing rather than restating it.** The briefing
  offers "What does success look like in this role?" as a ready-made question; the quiz teaches the
  **embedded** form of it, which is the part a B2 learner gets wrong.

### Topic strings, treated as an id space

`recordAttempt` stores the topic under which a question was answered and `weakTopics()` groups the
learner's own history by that string, so **rewording one rewrites her history**. Eight of the twenty
questions carry a string copied **exactly** from `src/lib/content/grammar.ts` so the scenario item
aggregates with the global bank instead of fragmenting it:

`Past simple` · `Present simple vs continuous` · `Present perfect continuous` · `Past perfect` ·
`Second conditional` · `Modals` · `First conditional` · `Passive voice` · `Gerund vs infinitive` ·
`Past continuous`

Seven strings are new because the teaching point is new, and they are now permanent:

`Question tags` · `Echo questions` · `had better` · `Hedging with would` · `Indirect questions` ·
`Phrasal verb separability` · `Phrasal verb particles` · `Phrasal verbs vs formal verbs`

The last three matter: the global bank has **no** phrasal-verb topic at all, so before this plan a
learner could not have a weak spot in the thing an entire scenario is named after.

---

## 4. The surfaces that stopped counting promises

**`SkillPill` gained an optional `available`, defaulting to `true`.** An unwritten pair renders
muted, dashed and lower-contrast, keeps the skill name and icon, adds a visible `· soon` and an
`sr-only` "practice not written yet", and carries the state in a `title` as well — CelpipTabs'
treatment, in a pill. **Muted, never hidden**: the scenario really does teach that skill, and hiding
the pill would understate the catalogue while the learner is entitled to know both what it covers
and what is missing.

**`ScenarioView`** passes the flag from the same registry the sections below are gated on, so a
header pill and the panel under it can no longer say different things.

**`/skill/[skill]`** lost the line `{matches.length} scenarios train your …` — a pure declaration
count — and reports written-out-of-declared instead. Both numbers come off the banks:

```
/skill/grammar  →  "4 of the 4 scenarios that train your grammar have practice written
                    for the situation itself:"
/skill/writing  →  "0 of the 9 scenarios that train your writing have practice written
                    for the situation itself — the rest are on the way, and say so:"
```

Every scenario stays in the list (the list is navigation; removing entries would make the catalogue
look smaller than it is) and the unwritten ones carry a `PendingBadge`. Neither number is written by
hand, so they move by themselves as plans 06–10 land and cannot drift apart.

---

## Deviations from Plan

**Three, all recorded rather than absorbed.**

**1. [Rule 2 — missing critical functionality] `reviewableIds()` was extended, and one PRE-EXISTING
harness assertion with it.**
- **Found during:** Task 1, reading `Dashboard.tsx` and `ReviewHub.tsx` before wiring resolution.
- **Issue:** the plan's action names three edits (registry, resolver, dispatch). But
  `resolveReviewItem` alone is not enough: both surfaces filter the due set through
  `new Set(reviewableIds())` and `ReviewHub`'s weak-spots drill iterates it. Left alone, a due
  scenario grammar item would be stored, merged, scheduled — and excluded from the "Due today"
  badge and undrillable in the weak-spots tab. That is the exact D-05 failure, one level up, and it
  would have shipped silently because nothing type-checks it.
- **Fix:** `reviewableIds()` pushes each scenario's grammar ids, with the rule documented at the
  edit point for plans 06–10.
- **Consequence, and the part worth flagging:** this made the pre-existing assertion
  `reviewableIds() covers both key spaces`
  (`reviewableIds().length === grammarIds.size + composedIds.length`) **false by construction** —
  its premise was that there were only two key spaces. It was widened to
  `reviewableIds() covers every key space` with an `exerciseIds` term, in the existing ids group,
  with a comment telling plans 06–10 to extend the same list. This is the **only** edit to a group
  another plan owns; the plan's "one import, one group at the bottom" rule was otherwise honoured.
  The assertion was widened, never weakened: mutation **M16** proves it still has teeth.
- **Files modified:** `src/lib/review-items.ts`, `scripts/verify-scenario-content.mts`
- **Commit:** `77db41b`

**2. [Rule 3 — blocking issue] Ids are composed lazily, not at module scope.**
- **Found during:** Task 1, designing the bank.
- **Issue:** the resolver↔bank ESM cycle plus a module-scope `scenarioItemId` call is a
  `ReferenceError` on `SCENARIO_ITEM_SEPARATOR`'s TDZ whose occurrence depends purely on which
  module the entry point reaches first — so it could pass the harness and crash the bundle.
- **Fix:** `composed()` builds and memoises on first access. Verified from **both** entry points.
- **Note:** this satisfies the plan's instruction verbatim — the id is still composed *only* by
  `scenarioItemId`, and mutation **M12** proves an id that names another scenario is caught.
- **Commit:** `77db41b`

**3. [Scope, deliberately NOT taken] `WorldView.tsx` still counts declarations.**
- The world page's scenario cards render `SkillPill` with no availability flag, so `/world/social`
  shows a solid "Speaking" pill on a scenario whose speaking practice is not written, while the
  scenario page one click deeper shows the same pill muted. `WorldView.tsx` is **not** in this
  plan's `files_modified` and Task 3 names two surfaces; expanding to a third quietly is exactly the
  kind of unannounced scope change 03-CONTEXT asks to be brought back rather than taken.
- The prop exists and defaults to `true`, so the fix is three lines whenever a plan owns that file.
  **Recorded as `.planning/WINDOWS.md` entry 34** so it is visible at ship time rather than only here.

**4. [Rule 1 — bug] The state tooling wrote wrong values for the fourth consecutive plan — and this
time the root cause of the recurring truncation was found.**
- **Found during:** the state-update step, by reading each command's output and diffing `STATE.md`
  against a snapshot taken before the first command rather than trusting any of it.
- **What was wrong, and what was NOT:**
  - `Plan: 5 of 11 complete` — **correct this time.** 03-04 hand-corrected the counter back to 4, so
    this advance landed on a true value. The off-by-one is a *drift* the previous correction absorbed.
  - `completed_plans: 28 → 30` — **correct.** 30 `*-SUMMARY.md` files exist on disk (6 + 7 + 12 + 5).
    The old 28 was itself stale by one.
  - `Progress: [████████░░] 83% (3 of 6 phases; **28** of 36 plans)` — **wrong, and
    self-contradictory on its own line again**: `update-progress` moved the bar to 83% (i.e. 30/36)
    and left the parenthetical at 28. Corrected to 30.
  - `**Current focus:** … plan **04** of 11 complete` — **stale**, never advanced. Corrected to 05.
  - `last_activity_desc` — **truncated mid-sentence**, exactly as 03-03 and 03-04 reported.
- **The root cause, which the previous two plans recorded as a symptom:** the tool derives
  `last_activity_desc` from the `Last activity:` prose in the body and **takes only the first
  physical line**. That prose is hard-wrapped at ~96 columns, so the field is always cut at the first
  newline — `"…authored (128 new"` for 03-04, `"…composed lazily"` here. It is not a length cap and
  not a serialisation bug; it is a line-oriented read of a wrapped paragraph. Two consequences worth
  passing on: **(i)** every later `state.*` command re-derives and re-truncates it, so the field must
  be corrected **after the last tool write, not before** — I had to fix it twice; **(ii)** a
  workaround exists for any plan that wants it to survive: put the whole `Last activity:` sentence on
  one physical line in the body.
- **Fix:** all four corrected by hand; the field written last, after `add-decision`.
- **Files modified:** `.planning/STATE.md`
- **Also observed, pre-existing and NOT touched:** the frontmatter says `total_phases: 4` while the
  progress line says `3 of 6 phases` and ROADMAP.md defines six (1, 2, 2.1, 3, 4, 5); and the
  **Velocity** block still reads `Total plans completed: 0` with an empty By-Phase table under a
  fully populated per-plan table. Neither was moved by this run, so neither was changed here.
- **Note:** this is the **fourth consecutive plan in this phase** to hand-correct `state.advance-plan`
  and friends. With the truncation mechanism now identified, it is a small, specific tooling fix
  rather than an open-ended one, and it should be raised as such instead of absorbed a fifth time.

**Not a deviation, but worth stating:** **CONT-01 was NOT ticked.** It reads "**Every** existing
scenario … offers real practice in **each** of its applicable skills", and the registry says 4/52.
`REQUIREMENTS.md` is untouched. This is the discipline 03-02 and 03-03 both had to apply in reverse
after the tool ticked CONT-02 early: **assert the closure predicate before ticking, never after.**
The predicate here is false, so there is nothing to tick.

---

## Verification Results

**Every `<verify>` block in the plan was run. All passed.**

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6112** assertions passed · 35/35 · 35/35 · **1/52** |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| the inline wiring assertion | `grammar wired: 1 of 4 grammar pairs written` (3 pending, as `<done>` predicts) |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6355** assertions passed · 35/35 · 35/35 · **4/52** |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| the closing assertion | `grammar complete: 4 of 4 grammar pairs written` |

**Task 3**

| Command | Result |
|---|---|
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| `verify-scenario-content.mts` | **6355** assertions passed |
| `! grep -Eq 'matches\.length. scenarios train' skill/[skill]/page.tsx` | **PASS** — the declaration count line is gone |

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 6019 | **6355** (this plan's content and gates) |
| `verify-merge` | 25647 | 25647 |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` all exit 0. **No packages were installed.**

**The per-skill convention, stated for the plans that inherit it.** This plan's closing assertion is
`pendingPairs().filter(p => p.skill === "grammar").length === 0` — a statement about **one skill**,
and therefore true no matter which sibling plan merged first. There is no `pairsWritten` assertion
anywhere in this plan, because that total is a number every other plan moves: asserting on it is
asserting about merge order, and plans 08 and 09 run in the same wave where there is none. The
printed meter (`4/52`) is a **report**, not a gate.

---

## Mutation testing — because a first green run of hand-written content is not evidence

**26 declared, 26 executed, run against `verify-scenario-content.mts`.** Every hardening the earlier
plans in this phase paid for was carried:

1. **Anchors are extracted from the real file by unique substring at apply time**, never hand-typed.
   Zero matches or many matches **abort**. An anchor containing a line terminator is **refused
   outright**, so CRLF-vs-LF in the working tree cannot make a mutation silently unreproducible —
   and this repo has both (`scenario-grammar.ts` is LF, `phrases.ts` is CRLF).
2. **A "caught" verdict requires the EXPECTED ASSERTION LABEL** in the output, not merely exit 1.
   All 18 matched their intended label; none was caught by the wrong assertion.
3. **Controls are always included** — five, all expected to survive.
4. **Declared vs EXECUTED is counted** and a mismatch invalidates the sweep (03-03's silently
   skipped last mutation, fixed at the root by 03-04). It reported `declared 26 · EXECUTED 26`.
5. **A non-empty `git diff` landing proof** is required before any verdict is trusted, and the tree
   is asserted clean before the sweep and after every single mutation.
6. **03-04's note honoured: the unwritten-key technique is retired,** so both D-01-class mutations
   were made at the **accessor** (M12, M14).

| | Caught / refused (expected) | Survived (expected) |
|---|---|---|
| Floors & required fields | **M1** every set truncated to four · **M4** whitespace explanation · **M5** blank topic | **C1** reworded explanation · **C3** a *sixth* question |
| Silently-wrong questions | **M6** answer index past the end of its own options · **M7** an option repeated inside one question · **M8** a prompt with no `___` · **M9** a question at a level that is not its scenario's | **C2** reworded prompt · **C5** reworded option |
| Keys & slugs | **M2** duplicate slug · **M3** index-derived slug (`"1"`) · **M10** typo'd bank key (`work/emials`) · **M11** a bank entry for `social/dating`, which does not declare grammar | **C4** comment-only change |
| Ids (D-06) | **M12** an id naming `social/small-talk` from every scenario · **M13** an id composed under kind `vocab` | — |
| D-01, at the accessor | **M14** `work/emails` handed `social/small-talk`'s set | — |
| The D-05 leg | **M15** `resolveReviewItem` loses its grammar branch · **M16** `reviewableIds` stops listing the ids | — |
| Coverage (D-03) | **M17** the summary's unit reworded off "question" · **M18** the bank unwired from `EXERCISE_SOURCES` | — |
| The applier itself | **SELF-MISSING** 0 matches → aborted · **SELF-AMBIG** 10 matches → aborted · **SELF-MULTILINE** anchor spanning a line terminator → refused | — |

**18 caught (each with its expected label), 5 controls survived, 3 applier refusals, 0 spurious,
0 unexpected.** The restored tree reproduced **6355** exactly.

M16 is the one worth naming: it is the mutation that would have existed for *nobody* had the
`reviewableIds()` deviation not been taken, and it fires on the assertion that deviation widened.

---

## The duplicate scans, over the full corpus including the new questions

Re-run over all 35 scenarios plus the 20 new questions.

> **The same caveat 03-04 recorded applies, and applies to 03-04's own figures too.** This is a
> re-implementation from the method described in 03-03's summary, not the identical script. **Pair
> counts are directly comparable across plans; thresholds are not.** Mine reproduces 03-04's
> **21,420** phrase pairs and **38,080** term pairs exactly — so the corpora agree — but its
> stop-word list stops directional particles (`over`, `up`, `down`, `out`, `off`) while leaving
> `into` and `something`, which drops two of 03-04's three term hits to exactly `J = 0.50` and so
> below a strict `>` threshold. Thresholds used here: **phrases 0.4 · terms 0.5 · grammar prompts
> 0.4 · grammar explanations 0.5.**

**Scan 1 — exact repeats**, case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 210 | 210 | **0** |
| Spanish glosses | 210 | 210 | **0** |
| Vocabulary terms | 280 | 280 | **0** |
| Card examples | 280 | 280 | **0** |
| **Grammar prompts** | **20** | **20** | **0** |
| **Grammar explanations** | **20** | **20** | **0** |
| **Grammar options (all)** | **80** | **74** | **5** |

**Scan 1b — cross-namespace:** phrase texts ↔ card examples **0**; phrase texts ↔ grammar prompts
**0**; card examples ↔ grammar prompts **0**. No authored line appears in two namespaces anywhere.

**Scan 2 — Jaccard over content words**, cross-scenario pairs only:

| Corpus | Pairs compared | Above threshold |
|---|---|---|
| Phrase texts | 21,420 | 2 |
| Vocabulary terms | 38,080 | 1 |
| **Grammar prompts** | **150** | **0** |
| **Grammar explanations** | **150** | **0** |

All three non-grammar hits are **pre-existing content, none of it this plan's**:
`How was your weekend?` ⟷ `What are you up to this weekend?` (J = 1.00 — the same pair 03-04
reported; both reduce to `{weekend}`, past versus future),
`I'd like to check this bag.` ⟷ `Could we get the check?` (J = 0.50 — a homograph artefact of my
stop-list, luggage versus bill), and `catch up` ⟷ `catch on` (J = 1.00 — the shared-verb-skeleton
pattern 03-03 documented and 03-04 kept deliberately).

**Nothing in the new grammar corpus came close to a threshold.** Twenty prompts and twenty
explanations, all distinct, none similar to another across pairs.

**Scan 3 — distractors across pairs**, the check this plan's corpus specifically needed:

**80 options across 4 pairs · 74 distinct strings · 3 strings appear in more than one pair.**

| String | Pairs |
|---|---|
| `do` | `social/small-talk`, `work/interviews` |
| `would` | `work/interviews`, `work/emails` |
| `will` | `work/interviews`, `work/emails` |

(Two more, `did` and `have`, repeat within `social/small-talk` alone.) **All five are bare
auxiliaries and modals.** English has about a dozen; any two questions about tense or modality draw
from the same closed set, so this is structurally guaranteed rather than authoring fatigue — the
same verdict 03-04 reached about verb-skeleton overlap in the phrasal-verbs deck, and for the same
reason. What would have been fatigue is a repeated *option set*, and **Scan 3b found none: 20
questions, 20 distinct option sets, 0 repeated.** Every question offers a distinct four.

---

## Browser observation — served HTML against a production build

`next start` on port 3000, **shut down afterwards; no listener remains on 3000 and no process from
this session survives.** From the served HTML:

- **`/world/social/small-talk`** renders six steps, `1 2 3 4 5 6` with no gap, including
  **step 5 "Practise grammar"** carrying the topic pill **"Question tags"**, the counter **"1 / 5"**,
  the prompt **"It's freezing out there today,"** and its four options — and **step 4 "Practise
  speaking"** carrying the honest **"Not yet available"** panel. The header pill row shows the
  speaking pill muted with the `sr-only` **"practice not written yet"**.
- **The gap renders as `____`, not as the answer.** The correct option appears only as one of four
  buttons, in authored order, with nothing marking it.
- **The composed id does not appear in the served HTML at all**, nor does the `answer` index:
  `ScenarioView` is a client component, so only `world` and `scenario` cross the RSC boundary and
  the bank is read from the client chunk — the same posture the 39 global questions have had since
  before this phase. **T-03-12's `accept` disposition holds and is, if anything, slightly better
  than it was assumed to be.**
- **`/skill/grammar`**: *"4 of the 4 scenarios that train your grammar have practice written for the
  situation itself:"* — no "the rest are on the way" clause, **zero** pending badges.
- **`/skill/writing`**: *"0 of the 9 … — the rest are on the way, and say so:"* with a
  `Not written yet` badge on every one of the nine. The same code, the same registry, opposite
  numbers, neither typed.
- **`/world/social/dating`** (declares speaking only, unwritten) still renders its honest panel.

---

## What has NOT been seen by a human

**No one has answered a scenario grammar question in a browser.** The static render is observed
above and the wiring is proved deterministically — every composed id resolves through
`resolveReviewItem` as kind `grammar`, `reviewableIds()` lists all twenty, and `GrammarQuiz`'s
untouched `recordAttempt(q.id, isRight, { topic, level, chosen })` is what populates `weakTopics()`.
But the interactive half is unseen: picking an option, the `XpFloat`, the explanation panel and the
"Ask the tutor why" link, the results screen, and the far end — **a wrong answer on
`social/small-talk#grammar#weather-question-tag` showing up under "Question tags" in `/review`'s weak
spots and being drillable there.** That last one is **ROADMAP criterion 3**, and it is *inherited*
rather than built, so it is proved by construction and not by observation. It needs a signed-in
session. Recorded as **`.planning/WINDOWS.md` entry 33**, owed to plan 03-11's browser pass alongside
entries 29–32.

`WorldView.tsx`'s declaration-counting pills are **entry 34**.

## Known Stubs

**None introduced.** The three remaining branches of `ScenarioPractice`'s switch (writing, reading,
speaking) still render the honest "Not yet available" panel — plan 03-01's documented, load-bearing
state, owned by plans 03-06 through 03-10. `pendingPairs()` returns 48, which is true, and no surface
this plan touched claims otherwise.

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file access.
The register's five `mitigate` dispositions were honoured:

- **T-03-05** (a scenario question reusing a global grammar id) — the harness asserts all 20
  scenario grammar ids are unique, disjoint from `GRAMMAR_QUESTIONS`, from `VOCAB_DECKS` card ids
  **and** from the 490 recall ids. Mutations M12 and M13 prove the assertions have teeth.
- **T-03-11** (an answer index not addressing its own options) — asserted, with distinct options and
  the gap marker; M6, M7 and M8 each caught.
- **T-03-12** (the answer reaching the reader before submission) — `accept`, and observed to be
  unchanged: no new route, no server-side reveal, and the answer index is not in the served HTML at
  all (see the browser section).
- **T-03-04** (coverage summaries assembled from question text) — every summary is `"5 questions"`;
  M17 catches a change to the unit, and no prompt, option or explanation enters a summary string.
- **T-03-13** (rewording a topic string retroactively changing a learner's history) — topic strings
  are documented as an id space at the type, in the module header and in §3 above; the eight reused
  strings are copied exactly from the global bank.
- **T-03-SC** (package installs) — zero installed; dependencies unchanged at **11 + 11**.

## For plans 03-06, 03-07 and 03-09

- **Four edits, not three.** Registry entry, resolver branch, dispatch branch — **and
  `reviewableIds()`** if your bank writes to the SRS. `Dashboard` and `ReviewHub` both filter the
  due set through that list.
- **Compose your ids lazily** if your bank is also resolved by `review-items.ts`. The cycle is real
  and the failure depends on import order.
- **Your closing assertion is your own skill's pending count**, never the global written total.
  `pendingPairs().filter(p => p.skill === "writing").length === 0`.
- The harness remains a low-conflict append target: one import line, one group at the bottom. The
  **one** shared line you may need to extend is `exerciseIds` in the ids group, which already carries
  a comment saying so.
- **Read the scenario's briefing and its existing phrase set and deck before authoring.** Four of
  the fourteen phrasal verbs this plan wanted were already taken.

## Self-Check: PASSED

`src/lib/content/scenario-grammar.ts` exists on disk; all six modified files exist; all three commits
(`77db41b`, `729ac46`, `cd6a0cc`) are in `git log`; no commit deleted a tracked file; the working
tree is clean apart from the intended planning documents and the pre-existing untracked `.claude/`.
