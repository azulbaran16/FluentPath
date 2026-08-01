---
phase: 03-every-scenario-practicable
plan: 02
subsystem: scenario-content
tags: [content, srs, review-surfaces, merge-algebra, d-05, cont-02]
status: complete
requires:
  - src/lib/review-items.ts (resolveReviewItem, reviewableIds, RecallItem — plan 03-01)
  - src/components/practice/RecallDeck.tsx (the one recall renderer — plan 03-01)
  - src/lib/scenario-coverage.ts (derived coverage — plan 03-01)
  - src/lib/progress-merge.ts (unionRecord, mergeSrsItem)
provides:
  - "src/components/Dashboard.tsx — due count resolved across banks"
  - "src/components/practice/ReviewHub.tsx — badge AND weak-spots drill resolved across banks"
  - "src/components/practice/MistakesView.tsx — open mistakes across banks, plus a recall mistake card"
  - "scripts/verify-merge.mts — a scenario-key group, 25647 assertions"
  - "src/lib/content/phrases.ts — 8 new curated sets (17/35 scenarios)"
  - "src/lib/content/scenario-vocabulary.ts — 12 new decks (13/35 scenarios)"
affects:
  - scripts/verify-scenario-content.mts (the unwritten-scenario example is now derived, not named)
tech-stack:
  added: []
  patterns:
    - "shared-sweep mutation of merge fixtures: new key shapes join the O(n^3) pass rather than getting one-off assertions"
    - "a harness example DERIVED from bank contents, so authoring content cannot turn a true assertion into a false alarm"
key-files:
  created: []
  modified:
    - src/components/Dashboard.tsx
    - src/components/practice/ReviewHub.tsx
    - src/components/practice/MistakesView.tsx
    - scripts/verify-merge.mts
    - scripts/verify-scenario-content.mts
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - .planning/WINDOWS.md
decisions:
  - "The verify-merge scenario fixtures join a sweep over EVERY existing state, not a private one — composite keys are proved against grammar keys, malformed entries and EMPTY, which is what a real blob looks like after this phase"
  - "verify-merge imports scenarioItemId rather than spelling the id format, so the harness cannot keep passing against a format the app no longer writes"
  - "The harness's unwritten-scenario example is derived from the banks; naming one made a true assertion fail on correct content"
  - "A weak topic with nothing practisable behind it is named plainly instead of producing an empty quiz"
  - "travel/emergencies splits its two halves: the phrases are what SHE says, the cards are what the professional says BACK"
metrics:
  duration: ~70min
  tasks: 3
  commits: 3
  completed: 2026-08-01
---

# Phase 3 Plan 02: Review Surfaces and the First Thirteen Scenarios Summary

D-05 is closed — no surface in the app resolves a due review id through a single bank any more —
and thirteen scenarios, all of Social & Everyday Life and all of Travel & Errands, are at D-04's
floors of six phrases and eight vocabulary cards.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `7c54ede` | Dashboard, ReviewHub (both sites), MistakesView resolved across banks; the `verify-merge` scenario-key group |
| 2 | `2a29cb9` | Social: 5 phrase sets, 6 vocabulary decks; the derived-example fix in `verify-scenario-content` |
| 3 | `a604663` | Travel: 3 phrase sets, 6 vocabulary decks |

**Registry state on completion: 17/35 scenarios with phrases · 13/35 with vocabulary · 0/52 pairs
written (52 pending: speaking 30, writing 9, reading 9, grammar 4).** No scenario reports itself
complete, and the app still claims nothing it does not have.

---

## 1. D-05, closed

Three surfaces filtered due ids through `GRAMMAR_QUESTIONS`. All three now go through the shared
resolver, and the file with two offending sites got both.

| Surface | Was | Now |
|---|---|---|
| `Dashboard.tsx:17` | `new Set(GRAMMAR_QUESTIONS.map(q => q.id))` | `new Set(reviewableIds())` |
| `ReviewHub.tsx:24` (badge) | `GRAMMAR_QUESTIONS.filter(q => dueSet.has(q.id)).length` | `dueReviewIds().filter(id => REVIEWABLE_IDS.has(id)).length` |
| `ReviewHub.tsx:102` (weak-spots drill) | `GRAMMAR_QUESTIONS.filter(q => weakSet.has(q.topic))` | resolve every reviewable id, keep the weak topics, split into `GrammarQuiz` + `RecallDeck` |
| `MistakesView.tsx:18` | `GRAMMAR_QUESTIONS.filter(q => ids.has(q.id))` | resolve every open mistake id, split by kind |

**Both ReviewHub sites went, and that mattered.** Mutation M9 reverted only the drill and left the
badge converted; the grep guard caught it. A badge that counts scenario items above a drill that
cannot produce them promises practice the tab does not have.

**Behaviours the plan asked for, and where each lives:**

- *A weak topic that no bank can practise is not offered as practisable.* `practisableTopics` is
  built from what actually resolved. Topics not in it are named in a plain line
  ("Nothing to drill yet for X — that practice isn't written yet"), and when **nothing** resolves,
  the tab shows a panel instead of an empty quiz. This is live today: with a weak set of
  `{Small talk & breaking the ice, Past simple}` the drill returns 3 grammar + 14 recall items;
  with `{Dating & flirting}` before Task 2 it returned 0 and took the honest branch.
- *A recall mistake gets its own card.* A vocabulary card has no options and no chosen index, so
  the grammar card's "You chose / Correct" shape would have meant inventing fields. The recall card
  shows the prompt, the answer and the hint. "Practice these" drills both kinds.
- *An unresolvable id is still excluded from every count.* Unchanged, and the Dashboard comment now
  records that resolution spans every bank rather than one.

**Deliberately NOT converted:** `GrammarWorkspace.tsx` and `SkillPractice.tsx` still read
`GRAMMAR_QUESTIONS`. They are the grammar skill page — reading the grammar bank is what they are
for. D-05 names three surfaces and these are not among them.

---

## 2. The merge over scenario-shaped keys

`scripts/verify-merge.mts` gains one appended group, no existing group reorganised.

**Four fixtures**, keyed by `scenarioItemId(...)` and never by a hand-spelled string:
`scenarioPhone` (a phrase rated "Not yet" this morning — box 0, due today, unresolved),
`scenarioLaptop` (**the same phrase** at box 4 due a month out, resolved, plus a scenario the phone
has never seen), `scenarioAndGrammar` (a `q-*` id and two composite ids in one blob),
`scenarioSrsWithoutStat` (a composite key in `srs` with no paired stat).

**They join a sweep over every existing state, not a private one.** `allStates = [...states,
...scenarioStates]` — 17 states — so idempotence, commutativity and the O(n³) associativity pass
exercise composite keys against the grammar keys, the malformed entries and `EMPTY`. That is what a
real learner's blob looks like the day after this phase ships.

Plus five targeted assertions: the union neither drops nor invents a key, a composite key is never
split on its separators, the same item at two boxes and two dues resolves to **one of the two
inputs and never a blend** (`{box: 0, due: "2026-07-28"}` — the just-failed entry beats the stale
success), an unresolved stat is not resurrected as resolved by a stale device, and the grammar
entry merges by its own rule untouched by its neighbours.

**`verify-merge`: 20146 → 25647 assertions.** Every previously passing assertion still passes.

**The group carries real weight, and this is measured, not assumed.** Mutation M1 makes
`unionRecord` key-aware — `if (k.includes("#")) { out[k] = v; continue; }` — the exact regression
the group exists for. It produces **13 failures, every one of them inside the new group.** None of
the 20146 pre-existing assertions notice, because none of them uses a key containing `#`.

---

## 3. The content

Thirteen scenarios at six phrases and eight cards each. Written at each scenario's own CEFR level,
taken from the curriculum entry, and to **extend** each briefing rather than restate it.

| World | Phrase sets added | Vocabulary decks added |
|---|---|---|
| Social | dating B2, parties B1, complaining B2, favors B1, humor C1 | making-friends, dating, parties, complaining, favors, humor |
| Travel | hotel B1, emergencies B1, shopping B1 | airport, hotel, restaurant, directions, emergencies, shopping |

**On the named residual risk — authoring fatigue producing near-duplicate sets.** The harness only
catches byte-identity, so a lazy paraphrase would pass. Checked directly instead: across all 35
scenarios there are **102 phrase texts and 104 terms, and not one is repeated anywhere** (17 × 6 and
13 × 8 exactly, zero collisions on a case- and punctuation-insensitive comparison). Where a
collision was heading, the content was changed rather than shipped:

- `travel/emergencies` nearly got "I'm allergic to penicillin" — the same frame as
  `travel/restaurant`'s "I'm allergic to nuts". Replaced with "I'm on medication for my blood
  pressure", which teaches a fixed collocation instead of repeating a structure.
- `travel/shopping` nearly got "How much is this one?", a paraphrase of the world fallback's "How
  much is it?". Replaced with "What's your return policy?".
- `social/parties` nearly got "Thanks for having me over", a paraphrase of `work/interviews`'
  "Thanks for having me". Replaced with "I brought something for the table".

**Vocabulary complements the phrases rather than restating them**, per scenario:
`social/making-friends`' six phrases are all *openers*, so its cards are the follow-through words
(`acquaintance`, `bond over`, `tag along`, `close-knit`). `travel/airport`'s phrase asks for a
window seat; its card teaches `an aisle seat`. `travel/restaurant`'s phrase asks for the check; its
card teaches `the bill (UK) / the check (US)`.

**The two scenarios the plan singled out:**

- `social/complaining` (B2) carries the softeners *and* the escalation, not generic
  dissatisfaction — a six-rung ladder from "I hate to be that person, but this really isn't good
  enough" through a concrete fact ("We've been waiting over an hour now"), a firm request
  ("I'd appreciate it if…"), escalation ("whoever's in charge"), a refusal of the brush-off ("I'm
  not sure where that leaves me") to "I'll have to take this further".
- `social/humor` (C1) cards are the **vocabulary of tone**, not a list of jokes: `deadpan`,
  `dry humour`, `tongue in cheek`, `banter`, `poke fun at`, `at someone's expense`, `crack up`,
  `understatement`.

**The three A2 scenarios stayed A2.** Airport, restaurant and directions keep short examples,
concrete nouns and structures an A2 learner can produce at a counter under pressure. Their cards
also carry the UK/US pairs a traveller actually trips over: bill/check, pavement/sidewalk,
crossroads/intersection, takeaway/takeout.

**`travel/emergencies` is split on purpose.** The phrases are what *she* says to get help fast
(something without a prescription; "My wallet's been stolen" in the passive; "It's been like this
since yesterday morning" for a doctor's history-taking). The cards are what the pharmacist, the
doctor and the police officer say **back** — `a prescription`, `symptoms`, `dizzy`, `a statement`,
`a police report`. That is the half a learner never rehearses and the half that decides whether she
understands the answer.

Every id is an authored slug, unique within its scenario and never derived from position.
`scenarioItemId()` remains the only author of a composite id; nothing composes one by hand.

---

## Deviations from Plan

**Two, both caught by the work rather than by review.**

**1. [Rule 3 — blocking issue] `verify-scenario-content.mts` named a scenario this plan authors.**
- **Found during:** Task 2, immediately after the Social content landed.
- **Issue:** The recall-items group asserted
  `scenarioRecallItems("social", "dating").length === 0` as its worked example of "a scenario with
  neither bank entry yields an empty deck, never a fallback". Plan 03-01 wrote that line when
  `social/dating` was empty; Task 2 authored it. A true assertion failed on correct content — the
  precise way a gate stops being a gate, since the tempting fix is to delete it.
- **Fix:** the example is **derived, never named**. Every genuinely unwritten scenario is exercised
  (21 assertions today, one per unwritten scenario), so it keeps binding as the banks fill and no
  later plan has to remember to move it.
- **On what happens at 03-04, when it runs out:** nothing is lost. The loop above it already
  asserts `items.length === phrases.length + cards.length` for all 35 scenarios permanently, and
  "0 + 0 yields 0" is exactly the case named here. The comment in the file records this so a reader
  does not think an assertion quietly evaporated.
- **Files modified:** `scripts/verify-scenario-content.mts`
- **Commit:** `2a29cb9`

**2. [Rule 1 — bug] `requirements mark-complete CONT-02` had to be reverted.**
- **Found during:** the state-update step, immediately after running it.
- **Issue:** this plan's frontmatter carries `requirements: [CONT-02]`, so the SDK ticked CONT-02
  and set its traceability row to **Complete**. CONT-02 reads "**Every** scenario has
  scenario-specific phrases and vocabulary" — and this plan leaves 17/35 and 13/35. A completed
  checkbox there is precisely the overclaim D-03 exists to prevent, in the one file a later reader
  would trust without re-deriving.
- **Fix:** reverted to unchecked, annotated with the live numbers, and the traceability row set to
  `In Progress (17/35 phrases, 13/35 vocabulary)`. The note records that the **SRS half of CONT-02
  is done** (D-05 closed here) and that the content half completes at **plan 03-04**, on the
  evidence `COVERAGE_TOTALS.scenariosWithPhrases === 35`.
- **For plans 03-03 and 03-04:** they carry `CONT-02` too and will hit the same thing. Only 03-04
  should let the tick stand.
- **Files modified:** `.planning/REQUIREMENTS.md`

**Not a deviation, but worth recording:** the plan says to append the merge group "without
reorganising anything above it". The scenario fixtures are appended at the bottom as instructed;
they reach the existing `states` array by reading it, not by editing it. The orchestrator's
instruction to put fixtures in the shared sweep and the plan's instruction not to reorganise are
both satisfied by `allStates = [...states, ...scenarioStates]`.

---

## Verification Results

Every `<verify>` block in the plan was run. All passed.

**Task 1**

| Command | Result |
|---|---|
| `verify-merge.mts` | **25647** assertions passed (was 20146) |
| `verify-scenario-content.mts` | 1084 passed |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| `! grep -v '^\s*//' src/components/Dashboard.tsx \| grep -Eq 'GRAMMAR_QUESTIONS'` | PASS |
| `! grep -v '^\s*//' src/components/practice/MistakesView.tsx \| grep -Eq 'GRAMMAR_QUESTIONS'` | PASS |
| `! grep -v '^\s*//' src/components/practice/ReviewHub.tsx \| grep -Eq 'GRAMMAR_QUESTIONS'` | PASS |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | 1987 passed · 14/35 phrases · 7/35 vocabulary |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| Social floor check (`phrases<6 \|\| vocabulary<8`) | `social: 7 scenarios at floor` |

**Task 3**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **2737** passed · 17/35 · 13/35 · 0/52 |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| `COVERAGE_TOTALS` check | `{"pairsTotal":52,"pairsWritten":0,"scenariosWithPhrases":17,"scenariosWithVocabulary":13}` |

**Baselines — every one held or moved only where the plan said it would**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 1084 | **2737** (this plan's content) |
| `verify-merge` | 20146 | **25647** (this plan's group) |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint`, `build` all exit 0.

---

## Mutation testing — because a first green is not evidence

Run under **bash** (not `execSync`'s Windows default), with an anchor-exact applier that aborts
loudly on a missing **or** ambiguous anchor, and with the tree proved clean before and after.
**Every mutation's landing was proved by a non-empty `git diff` before its verdict was trusted** —
added specifically because of what happened below.

| | Caught / refused (expected) | Survived (expected) |
|---|---|---|
| Merge | **M1** `unionRecord` made key-aware for `#` ids · **M2** the later `due` wins · **M3** the composed id loses its scenario key | **C3** comment-only edit |
| Content | **M4** `travel/shopping` down to five phrases · **M5** duplicate slug in `social/humor` · **M6** a blank example on a `travel/emergencies` card · **M7** the strict vocabulary accessor made lenient | **C1** reworded Spanish gloss · **C2** a *seventh* phrase (above the floor) · **C4** reworded example sentence |
| Review surfaces | **M8** Dashboard reverted to one bank · **M9** only the ReviewHub drill reverted, badge left converted | — |
| The applier itself | **AMBIG** an anchor matching many sites **aborted** · **MISSING** an anchor matching nothing **aborted** | — |

**9 mutations caught, 4 controls survived, 2 applier refusals confirmed, 0 spurious.**

**Two things went wrong during the pass and both are worth recording.**

**M2 was refused on the first sweep** — its multi-line anchor did not match because the file on disk
is CRLF. The applier aborted rather than guessing a site. That is correct behaviour and the same
failure 02.1-01 and 03-01 each recorded; M2 was re-anchored on a single line and then caught.

**M9 could not be reproduced after the sweep reported it caught.** The sweep's `git checkout --`
rewrites restored files with CRLF, so a multi-line anchor that matched on the first pass could not
match on a re-run. Rather than accept a verdict I could not reproduce — hazard 2, *check whether the
mutation was defective first* — every anchor was rewritten single-line and **the entire sweep was
re-run from a clean tree with a landing proof on each mutation**. The table above is that second
run. M9 is genuinely caught.

---

## Known Stubs

**None introduced by this plan.** The four exercise branches of `ScenarioPractice`'s switch still
render the honest "Not yet available" panel; that is plan 03-01's documented, load-bearing state
and is owned by plans 03-05 through 03-10.

## The regression this plan shrinks but does not close

Plan 03-01 removed the per-world speaking fallback, leaving 26 scenarios with an honest panel
instead of a generic warm-up. **This plan takes that from 26 to 18** — the thirteen Social and
Travel scenarios now have their own phrases (17/35 in total).

`.planning/STATE.md`'s note is **deliberately left in place.** Its stated evidence for removal is
`COVERAGE_TOTALS.scenariosWithPhrases === 35`, which lands at **plan 03-04**, not here. Clearing it
early would be exactly the overclaim D-03 exists to prevent.

## Threat Flags

None. No new network surface, no new auth path, no schema change, no dependency, no file access
pattern. The threat register's dispositions were honoured:

- **T-03-05** (id collision as the key space grows to ~200 items) — the harness re-proves global
  uniqueness and disjointness from both existing key spaces on every run; the key space grew from
  14 composite ids to 206 and the assertions held.
- **T-03-06** (an id derived from position re-pointing a schedule) — every one of the 192 new items
  carries an authored slug, asserted unique within its scenario and non-numeric.
- **T-03-01** (prototype pollution via record keys) — no schema change; `verify-schema` still 309.
- **T-03-02** (progress blob growth against the 1 MiB cap) — additive keys only; the saturated
  measurement is the gate plan's job.
- **T-03-08** (the merge losing its algebra over a new key shape) — the dedicated group, plus M1
  proving it is the *only* thing that would catch a key-aware union.
- **T-03-SC** (package installs) — zero packages installed; dependencies unchanged at 11 + 11.

## What has NOT been seen by a human

Recorded honestly as `.planning/WINDOWS.md` id **30**, owed to plan 03-11.

The three widened surfaces are gated by three grep guards, `tsc`/`lint`/`build`, and an inline node
proof that the weak-spots selection returns 3 grammar + 14 recall items for a mixed weak set against
the real banks. **There is no committed assertion over any of them**, because they are React and
this repo has no test runner (TEST-01, v2 backlog). Unobserved specifically: the Dashboard's due
count with a scenario item in it, the ReviewHub badge, the weak-spots tab in both its mixed and its
"nothing to drill yet" branches, and MistakesView's new compact recall card. All four need a
signed-in session with a populated `srs`/`attempts` store to reach.

Ledger entry **29** (plan 03-01's) is now partly stale in the project's favour: the user drove the
recall loop and `/review` in a browser on 2026-08-01 and reported a real scenario item resolving and
rendering, which closes its items (1) and (2). 03-11 inherits a smaller debt than 29 states.

## Self-Check: PASSED

All seven modified files exist on disk; all three commits (`7c54ede`, `2a29cb9`, `a604663`) are in
`git log`; no commit deleted a tracked file; the working tree is clean apart from the intended
planning-document changes.
