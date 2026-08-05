# Requirements: FluentPath — Milestone "Completar producto"

**Defined:** 2026-07-23
**Core Value:** A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.

Brownfield note: shipped capabilities (auth, practice modes, progress engine, Stripe test billing, analytics, referrals, blog) are recorded as Validated in `.planning/PROJECT.md`. The requirements below cover only the remaining work for this milestone.

## v1 Requirements

Requirements for this milestone. Each maps to exactly one roadmap phase.

### CELPIP (exam prep — Writing v1)

Added 2026-07-23 from approved design `docs/plans/2026-07-23-celpip-writing-design.md`. All content original — third-party study material used only as format reference, never copied.

- [x] **CELPIP-01**: Original task bank in `src/lib/celpip.ts` — ~8 Writing Task 1 (formal email: scenario + 3 bullets) and ~8 Task 2 (survey: scenario + 2 options) with model answers and rewritten strategy tips
- [x] **CELPIP-02**: Exam simulator at `/celpip/writing/[taskId]` — real exam countdown (27 min T1 / 26 min T2, pausable in practice mode), 150–200 word counter, plain-text editor, draft autosave; timer expiry locks the editor and offers submit-as-is or untimed continue
- [x] **CELPIP-03**: Post-submit results — learner's text beside the original model answer, interactive self-evaluation checklist derived (in our own words) from CELPIP level descriptors, attempt metrics (time, words)
- [x] **CELPIP-04**: Attempt history stored local-first under its own namespace following the `progress.ts` pattern, shaped for later Postgres migration
- [x] **CELPIP-05**: `/celpip` landing free for all users — Task 1/Task 2 libraries with attempt status; Speaking/Reading/Listening shown as "coming soon"

### CELPIP (exam prep — remaining skills)

Added 2026-07-30. The beta user's exam is under three weeks away, so scope is deliberately
uneven: Reading and Listening are built to depth, Speaking to a usable minimum. Same IP
constraint as v1 — **all content original**, third-party material is format reference only.

- [x] **CELPIP-06**: Original Reading bank covering the exam's four parts (correspondence, diagram, information, viewpoints) — passages with matching question types, answer key, and per-question explanations
- [~] **CELPIP-07**: Original Listening bank read aloud through the Web Speech API already used elsewhere in the app — scripts the learner hears (not reads), note-taking space, questions revealed after playback, answer key with explanations — *met as content and machinery; the "hears" half is unobserved (see Traceability)*
- [~] **CELPIP-08**: Speaking practice — timed prompts matching the real task shapes, in-browser recording so the learner can hear herself back, and a descriptor-based self-evaluation checklist. No automated scoring — *no human has yet heard a recording play back, on any prompt or device (see Traceability)*
- [x] **CELPIP-09**: Attempts for all three new sections persist under the Phase 2 server-side contract — same account, every device, offline-safe
- [x] **CELPIP-10**: `/celpip` landing exposes Reading, Listening and Speaking as real sections — the "coming soon" badges are gone for what ships and honest about what does not

> `[~]` means **met with a stated limitation**: the artifact ships and its gates pass, but a
> criterion in the requirement's own wording rests on an observation nobody has made yet.
> Introduced by the 02.1-12 phase gate rather than rounding those two up to `[x]`.
>
> **It is a project-wide convention, not a CELPIP one.** The 04-09 phase gate reused it for
> **CONT-04**, whose content is complete, derived and gated but whose browser pass was never
> driven. Reach for `[~]` whenever the honest answer is "built and proved by script, unproved
> by sight" — the whole point is that neither `[ ]` nor `[x]` is true, and picking either one
> would be the overclaim this project's derivation exists to make impossible.

### Progress (server-side persistence)

- [x] **PROG-01**: Signed-in learner's progress (completions, XP, streak, CEFR level, SRS queue, attempts) is persisted in Postgres as the authoritative copy, with localStorage acting as cache/offline buffer
- [x] **PROG-02**: Learner logs in from a different browser or device and sees identical progress
- [x] **PROG-03**: Progress API validates payloads against the ProgressState schema; malformed writes are rejected without corrupting stored data, and corrupted stored data loads as a safe default instead of crashing
- [x] **PROG-04**: Progress writes that fail (offline, flaky network, server error) are retried automatically — no silent data loss
- [x] **PROG-05**: Anonymous local progress migrates into the account on first sign-in without loss

### Content (curriculum completeness)

- [x] **CONT-01**: Every existing scenario in all 6 worlds offers real practice in each of its applicable skills (grammar, speaking, reading, writing) — no stub, placeholder, or empty activity — *closed at plan 03-10 on a derived predicate (`pairsWritten === 52 && pairsTotal === 52 && pendingPairs().length === 0`, asserted in its own command before the tick), and **confirmed at the 03-11 gate by a human in a browser** on 2026-08-01. What was SEEN: a scenario grammar quiz answered end to end, with four wrong answers reaching Weak spots by name with an accuracy figure and a drill behind each; a scenario reading passage submitted with **Check answers**, rendering `1 / 4 correct.` and the authored explanations — the first time an explained key has rendered anywhere in this app; and scenario steps deriving honestly (`social/small-talk` at six steps, `academic/news` serving its own passage, its own 1/6 warm-up and its own 1/14 deck). What remains UNOBSERVED and is open by name in `.planning/WINDOWS.md`: typing into a scenario writing desk (35) and ticking a rehearsal move with its single-award property (38). Neither is missing content — both are the interactive half of a surface whose static render and whose data are proved — so the requirement closes and the observation debt is carried explicitly rather than rounded up.*
- [x] **CONT-02**: Every scenario has scenario-specific phrases and vocabulary that feed the SRS review queue — *closed at plan 03-04: **35/35 scenarios with phrases, 35/35 with vocabulary**, 210 phrases and 280 cards, every one written for its own scenario. The SRS half closed at 03-02 (D-05: every review surface resolves scenario items). The tick rests on derivation, not on claim — `COVERAGE_TOTALS.scenariosWithPhrases === 35` and `scenariosWithVocabulary === 35` are read off the banks by `scenario-coverage.ts` and asserted by `verify-scenario-content.mts` (6019 assertions). Plans 03-02 and 03-03 each carried CONT-02 in frontmatter and each deliberately left it unticked at 17/35 and 27/35. **Confirmed at the 03-11 gate**: the SRS leg was driven by a human in a browser — a due scenario item resolved and rendered in `/review` on 2026-08-01, and at the gate pass scenario attempts were recorded under their composite ids with `{topic, tries, wrong, resolved, level}` and scheduled in `srs` at box 1, which is the whole of "feed the SRS review queue" observed rather than asserted. Not re-run at the gate: the badge-agreement check (dashboard due count vs the review hub's badge vs the list) and clearing a mistake by re-answering it — both carried in `.planning/WINDOWS.md` 42.*

### Content (curriculum expansion)

- [x] **CONT-03**: Each of the 6 worlds covers its full designed topic list with scenarios — *satisfied as measured 2026-08-01: the design doc's topic list and `curriculum.ts` match one-for-one in all six worlds (Social 7, Work 7, Travel 6, Reading & Ideas 5, Practical 5, Sounding Native 5 = 35). The requirement's own examples — humor, favors, networking, feedback, housing, banking — all exist. Nothing was built for this; Phases 1–3 satisfied it as a side effect.*
- [~] **CONT-04**: Sounding Native world delivers native-level content: idioms, phrasal verbs, pronunciation drills, and register/culture — ***met as content, with the browser pass unobserved.** Closed at the 04-09 phase gate on measurement and on a reader pass, and deliberately NOT ticked `[x]`, because a criterion this phase itself added rests on an observation nobody has made.*

  ***WHAT IS WRITTEN, MEASURED 2026-08-04.*** All five scenarios carry depth, from Phase 3 floors of six phrases and eight cards each:

  | Scenario | phrases | cards | grammar Qs | deck | advertised |
  |---|---|---|---|---|---|
  | `native/idioms` | 6 → **18** | 8 → **24** | — | **42** | 10 → **17** min |
  | `native/phrasal-verbs` | 6 → **18** | 8 → **24** | 5 → **15** | **42** | 9 → **24** min |
  | `native/register` | 6 → **18** | 8 → **24** | 0 → **5** | **42** | 9 → **21** min |
  | `native/culture` | 6 → **18** | 8 → **24** | — | **42** | 10 → **17** min |
  | `native/pronunciation` | 6 → **12** | 8 → **16** | — | **28** | 10 → **11** min |
  | **world** | 30 → **84** | 40 → **112** | 5 → **20** | | |

  **155 scheduled ids added · 15 retired, every one with a written reason · ZERO re-pointed** (no changed
  hash in any of the phase's fourteen content commits). Fourteen of the retirements removed pre-existing
  `native/idioms` material by explicit human approval at 04-03 and 04-04; the fifteenth was authored and
  retired inside 04-01. Authored-field words in the world rose **1,643 → 8,132** (+6,489). Coverage is
  **53/53 pairs written, 0 pending** — derived from bank contents, never hand-written, and now *asserted*
  rather than merely reported.

  ***THE TICK RESTS ON THIS.*** `verify-scenario-content` **14,577** assertions and `verify-id-stability`
  **2,021**, both at their high-water marks; an *independent* enumeration of every scheduled id the banks
  emit agrees with the fixture **exactly, 651 = 651**, computed without importing the gate's own logic;
  a **19-mutation sweep in a scratch copy with its own `node_modules`** in which **17 of 17 mutations were
  CAUGHT on their own labels** and **2 controls survived**, each verdict carrying a landing proof and a
  parse check; and the derivation control re-proved — emptying one exercise entry takes 53/53 to 52/53,
  puts the pair in `pendingPairs()`, empties its summary and flips the scenario incomplete, with no second
  edit. Plus a **reader pass** over all five phrase sets, all five decks, each scenario against its own
  briefing/rehearsal/passage, and the two nearest neighbours elsewhere in the app.

  ***WHAT A HUMAN SAW: NOTHING. The 04-09 browser pass was NOT PERFORMED*** — the reviewer's context was
  exhausted before it could be driven, and it is recorded as not done rather than rounded up. Unobserved,
  by name, and open as **WINDOWS 62**: (1) the **batched recall deck**, which is this phase's one component
  change, sits between the learner and every recall item in the app, and **has never been rendered** — its
  rest point, its per-batch counter, its whole-sitting completion totals and "Go again"; (2) the same deck
  on **`/review`** with more than sixteen items due, the longest un-pausable run in the app and one of
  `RecallDeck`'s four callers; (3) a **sub-ceiling deck** (`practical/appointments`, 14 cards) confirmed
  unchanged; (4) the **eighteen-phrase warm-up** at its new length; (5) `native/idioms` **read as a learner**
  against Phase 3's "reads like any ELT textbook" verdict; (6) the **register pairs rendering adjacent**;
  (7) the advertised minutes on the five pages; (8) **ticking a rehearsal move** — the 15 XP single-award
  and the remount question research flagged (WINDOWS 38, open since Phase 3); (9) the honesty mechanism on
  a served page; (10) **anything at all on a phone**, which is the device the beta user practises on and on
  which nothing in this project has ever run. The ordered checklist with URLs is at the foot of
  `04-09-SUMMARY.md`.

  ***WHAT THIS PHASE DID NOT DELIVER, NAMED RATHER THAN OMITTED.*** D-01 — the user's own wording — asked for
  large idiom and phrasal-verb banks, **more reading** and **more rehearsals**. The banks are delivered and
  *more rehearsals* was delivered in kind at 04-08 (option E). ***More reading was not delivered by Phase 4
  at all.*** It was available only as 04-08's options A and B (~631 authored words each), and **the user
  declined both knowingly** at 04-08's blocking checkpoint, on a measured ratio argument: 631 words is 4×
  what 04-CONTEXT projected, and both existing native passages already sit above the corpus mean. Option F
  (a second passage per scenario) was declined as UI work outside D-01's scope; option D (register grows to
  2–3 writing tasks) was declined once its true price — eight further harness blocks, reshaping all nine
  writing pairs — was measured. This is a **scope decision, not a gap**, and nothing is broken by it: the
  app claims no reading it does not have, because coverage is derived. Open as **WINDOWS 61** and **63**.

  ***AND WHY THE FIVE ARE DELIBERATELY UNEQUAL.*** `native/pronunciation` is the smallest at 12/16 where its
  neighbours are 18/24, and that is a recorded judgement written into both of its banks, not an oversight.
  The drills pronunciation actually needs — minimal pairs, word stress, intonation *as exercises* — are new
  drill components, which D-01 rules out; under that decision the only shapes available are a warm-up line
  and a recall card, so a thirteenth tongue-twister teaches nothing a sixth did not. Worse, `PronunciationLab`
  scores word by word against a browser recogniser, so it **cannot hear** vowel length, aspiration or stress
  position: one of the six additions ships with that limitation disclosed in its own tip (WINDOWS 59). Padding
  this scenario to the same floor would have implied the five were deepened equally when they were not — a
  claim made with content instead of with words. This is the measured case for deferred **VOICE-01**.
- [x] **CONT-05**: New content is graduated across CEFR levels (B1–C1) so difficulty progresses with the learner — *satisfied as measured 2026-08-01: the 35 scenarios span A2 ×4, B1 ×11, B2 ×13, C1 ×7, and Phase 3 authored every exercise at its scenario's declared level.*

### Content (vocabulary volume — Phase 04.1)

The beta user said the app was "too basic to learn English"; asked what she meant, she said **too
little content**. Measured: ~280 vocabulary cards against a 1,000–2,000-word beginner consensus and a
2,809-word NGSL. Full reasoning, the options weighed and rejected, and the decisions in
`.planning/NEXT-MILESTONE-REQUEST.md` and `.planning/phases/04.1-vocabulary-volume-deck/04.1-CONTEXT.md`.

> **Closed at the 04.1-07 phase gate on 2026-08-05.** Four of the six are `[x]`; two are `[~]`,
> and the split is not a judgement call — it follows the wording of the requirements themselves.
> A requirement whose own words describe a **property of the code or the content** is closed by
> measurement, because measurement is what those words are about. A requirement whose own words
> describe **what a learner sees** cannot be, and no number of assertions changes that.
> **THE BLOCKING BROWSER CHECKPOINT (04.1-07 task 4) WAS NOT PERFORMED.** Nobody has opened
> `/core-vocabulary` in a browser since the deck held twenty cards. It is open by name as
> WINDOWS 74, with its twelve unobserved items and the ordered checklist in the plan.

- [x] **VOCAB-01**: The volume deck has its own spaced-repetition key space — `vocab:<slug>` composes, parses, resolves and enumerates through its own module, with `parseScenarioItemId`, `resolveReviewItem`, `reviewableIds()` and `verify-scenario-content.mts:389-396` **unchanged**, asserted by a committed check. The pseudo-scenario `core/vocab#word#<slug>` was measured against the live parser and found to be stored, merged and scheduled correctly and never rendered; it is dead by decision, not by omission.

  ***CLOSED ON MEASUREMENT.*** Every clause of this requirement is a property of source, and every
  one is asserted. `coreVocabItemId` is the one author of the format and the bank never spells
  `vocab:` (asserted from source; mutation M36 caught). All 500 ids parse to `undefined` through
  `parseScenarioItemId`, resolve to `undefined` through `resolveReviewItem`, are absent from
  `reviewableIds()` and resolve through their **own** resolver — 2,500 assertions, one per id per
  property. `review-items.ts` has **no reference to the volume module in either direction** and the
  key space's only reference back is a **type-only** import (M34, M35 caught). The requirement's
  own citation `verify-scenario-content.mts:389-396` is now at **401-416** — the four tripwires are
  byte-identical, but **cite them by their text** (*"a scenario key the curriculum does not have
  parses to nothing"*), never by line, since twelve appended imports moved them. **One correction
  to this requirement's wording:** it says `reviewableIds()` must be unchanged *and* names it in the
  list of things that stay unchanged — L5 superseded L1 here, and the deck is deliberately **not**
  in the shared enumerator. The wording is satisfied; the reason is the opposite of the one L1 gave.
  `git diff` across the whole phase shows `curriculum.ts` and `scenario-coverage.ts` untouched.
- [x] **VOCAB-02**: `src/lib/content/core-vocabulary.ts` holds **500** cards of `{ id, word, es, example }` with **no `tip` field on the type**, so the tier's lower bar has nowhere to hide; the words come from a committed copy of the NGSL and every gloss and example is original.

  ***CLOSED ON MEASUREMENT.*** **500 cards, NGSL ranks 8 → 648**, parsed independently of the
  module that enumerates them: **500 = 500 = 500** across the bank walked directly (with the prefix
  spelled inside the check), `coreVocabIds()`, and the committed fixture — 04-09's 651 = 651 pattern
  repeated for the new space, and its whole value is that it cannot share a bug with what it checks.
  The one retired id, `vocab:color`, is in **none** of the three. `CoreVocabCard` has no `tip`
  field, and growing the built record one is caught on `corevocab: the hashed record covers every
  authored field` (M05). Provenance is asserted card by card against `scripts/fixtures/ngsl-headwords.tsv`
  (NGSL 1.2, 2,809 headwords, CC BY-SA 4.0, attributed in the fixture header). **4,421 authored
  words** — 688 of gloss, 3,733 of example, mean example 7.47 words, range 6–10. The list answers
  *which words* and contributes no sentence: harness-only files reach **zero** client chunks
  (`no-base-form-example`, `Culligan`, `SKIPPED_HEADWORDS` all appear in 0 files under `.next/static/`).
- [~] **VOCAB-03**: The UI names the two tiers apart — its own route, its own nav entry, a tier chip on every card and a statement of what a volume card carries and what it does not — the volume deck has its **own** study queue, and no surface blends the counts: `Dashboard`'s and `ReviewHub`'s "Due today", the due list, the mistake notebook and the weak-spots drill are unchanged by its existence.

  ***MET WITH A STATED LIMITATION, and the limitation is the requirement's own first clause.***
  *"The UI names the two tiers apart"* and *"a learner can tell a volume card from a scenario card
  without being told"* are claims about **what a learner sees**, and **nobody has seen it**. The
  deck surface has not been opened in a browser since it held twenty cards; it now holds 500 in ten
  bands of fifty. Twelve unobserved items are named in WINDOWS 74, including the one that matters
  most here — `recallBatches` splitting a band with a rest point has **never been rendered on any
  surface in this app**, and has been open since Phase 4 as WINDOWS 62.
  ***WHAT IS PROVED.*** The route, the nav entry and the tier statement exist and build (114 static
  pages, `/core-vocabulary` among them); the chip is `CORE_VOCAB_TITLE`, stamped by the one recall
  renderer. **No surface blends the counts**, asserted three ways: `ReviewView` and `MistakesView`
  do not know the space exists and `ReviewHub` knows the tier **by name only** (M31, M32, M33
  caught); `reviewableIds()` is still exactly the three scenario key spaces, and pouring the volume
  ids into it fires 503 failures (M39); a `vocab:` branch in `resolveReviewItem` fires 500 (M38).
  **And every number on the surface is derived** — newly asserted at this gate rather than merely
  claimed: the counts come from `ALL_ITEMS.length`, `BANDS.length` and `.filter().length`, and
  **no digit appears in any JSX text node** of the view or the page. Writing "500" into the tier
  statement, into the page heading or into the route metadata is caught on its own label (N07, N08,
  N09). A **retired** id cannot inflate either count (N01, N02, N03), and the component is asserted
  never to count `srs` keys by string prefix (N05) — which is the refactor that would break it.
- [x] **VOCAB-04**: The saturated payload is measured over the **storage set** (every id that can reach the `srs` column, which is no longer the same as the shared review queue), re-measured from the harness after every authoring batch, and stays at or under **40 %** of the 1 MiB cap — a stop line where a human decides, distinct from the wall where a 413 becomes a permanent silent drop.

  ***CLOSED ON MEASUREMENT.*** Printed by the harness on every run, not calculated in a document:
  `payload: 317,038 B saturated over 1252 STORAGE id(s) = 752 shared-queue + 500 volume — 30.2% of
  the 1,048,576 B cap (stop line 40%)`. **9.8 points of margin.** The storage set is a strict
  superset of the queue set and narrowing it back is caught (M42); the **stop line and the wall are
  two assertions on one number that fail at different moments**, proved from both directions —
  tightening the ceiling to 25 % fires the stop line while **the wall survives** (M43). Five
  measurements of the marginal cost across the phase: 220.6 → 222.7 → 223.4 → 224.5 → 224.9 B/id,
  mean **223.7** over all 500, drifting +0.8 B per batch as the frequency list runs out of short
  words. 04.1-05's projection of ~317,100 B came in **62 bytes** high, which is what four measured
  points buy over one extrapolated table.
- [x] **VOCAB-05**: The quality floor is a set of harness assertions rather than a convention: every field non-empty; the `es` gloss is not the English word; the `example` contains the word (inflection allowed) and runs ≥ 6 words; no word repeats within the deck or against the 280 scenario cards; every word is on the committed NGSL list; and **no example opening-shape signature exceeds ~5 % of the deck** — the one assertion that addresses flat prose, automated because at 500 nobody reads them all.

  ***MET WITH A STATED LIMITATION, and the limitation is what the assertions cannot reach.*** Every
  clause listed above is an assertion and every one was watched failing: fields non-empty (M08),
  gloss ≠ word (M09), the example shows the word's **own** form (M10, which refuses *go/went* and
  must never be softened), ≥ 6 words (M11), no duplicate in the deck (M12) or against the **352**
  scenario terms (M13 — the requirement's "280" is stale by 72, and the check is derived from the
  banks rather than pinned to either figure), provenance (M14), rank order (M15), rank completeness
  (M18), and the three frame assertions. **The frame ceilings now bind at 25 per shape / 100 per
  opening word / 100 distinct shapes, and the deck sits at 2 / 30 / 499.** Two findings this gate
  owed and settled: the **distinct-shape floor can now fire ALONE** — 20 shapes of exactly 25
  satisfies both ceilings and fails the floor, one failure, no collateral, which was impossible at
  n=20 where it was dominated; and an **emptied bank still produces exactly ONE failure**, so
  `the containment is not an empty deck` remains the only thing between a vacuous green and a real
  one, and the nine assertions added at this gate survive an empty deck too (said, per 04.1-02's
  instruction, rather than left to be found).
  ***WHY NOT `[x]`.*** The requirement's own justification is *"automated because at 500 nobody
  reads them all"* — and the reader pass found, in a 112-card sample (**22.4 %**), three defect
  classes **no assertion in this list can see**: a per-**band** subject-shape lean (bands 4 and 5
  run at 2 % pronoun openers against a deck-wide 17.8 %, and the band is the unit a learner sits
  through); five cards whose Spanish front is most naturally answered by a *different* English word
  (`standard` → "habitual" the sharpest, where gloss and example teach different senses); and three
  examples that lean on a word a B1 learner will not know. The floor is a set of assertions as
  promised, and it is **not sufficient**, which this gate says out loud rather than rounding up.
  All three are open by name as WINDOWS 71, 72 and 73, and each is fixed only by retire-and-re-add.
- [x] **VOCAB-06**: Every new assertion has a mutation aimed at it that is **caught on its own label**, with surviving controls, run outside the working tree; all 500 ids are in `scripts/fixtures/scheduled-item-ids.json`, each batch regenerated in the same commit as its content; and `scenario-coverage.ts`'s 35/35 and 53/53 are **unmoved**, so the volume deck cannot inflate a scenario claim.

  ***CLOSED ON MEASUREMENT — this is the requirement the whole gate plan exists to satisfy.***
  **52 mutations declared, 52 executed, 46 CAUGHT each on its own label, 6 controls SURVIVED.**
  Run in a `git worktree` at `C:/tmp/fp-mut-0407` with `node_modules` junctioned in and **no build
  performed inside it**; the worktree was removed, the main tree is clean under `src/` and
  `scripts/` on a non-zero-exit check, and `.next` was wiped and rebuilt from the committed tree
  before any claim was made from a build (03-08). Every verdict carries a **landing proof** (the
  find string matched) and a **parse check** through TypeScript's own parser, because a non-zero
  exit from a syntax error is not a catch. **Three mutations were defective and were found to be
  defective before any assertion was blamed**, which is the ordering 04-01 established: M05 added an
  unused *parameter* where the assertion reads keys off the built record; R02's regex stopped at an
  escaped quote and produced invalid JSON, caught as SETUP-ERROR rather than scored as a catch.
  **And one assertion was genuinely weak and was fixed** — see VOCAB-03's note on N07/N08: the copy
  check's regex survived its own mutation twice, and now asks the compiler for `JsxText` nodes.
  All **1,151** scheduled ids are in the fixture (500 volume, 651 scenario, 16 retired), each batch
  regenerated in the same commit as its content, **zero re-pointed** across the phase. `--update`
  still **refuses** to launder a changed hash, verified live. `scenario-coverage.ts` reports
  **35/35 and 53/53** with `pendingPairs()` empty and its pair-count literals untouched, and
  neither it nor `curriculum.ts` was modified at any point in the phase — proved from `git diff`
  across the whole phase, not from care. Dependencies **11 + 11**; zero packages installed.

### Tutor (AI tutor end-to-end)

- [ ] **TUTOR-01**: A signed-in learner with tutor access receives real Claude replies in production — the demo stub only ever appears when no API key is configured
- [ ] **TUTOR-02**: Launching the tutor from a scenario produces in-character role-play grounded in that scenario
- [ ] **TUTOR-03**: The tutor gently corrects the learner's most important grammar or word-choice mistake and keeps the conversation going
- [ ] **TUTOR-04**: Gating and failure states are clear and friendly — not-Pro upsell, daily-cap-reached message, and transient errors that can be retried without consuming the daily quota
- [ ] **TUTOR-05**: Completing a tutor conversation counts toward scenario progress (XP/completion) persisted server-side

## v2 Requirements

Deferred to later milestones. Tracked but not in the current roadmap.

### Commercial Launch

- **LAUNCH-01**: Stripe live mode enabled with real prices and verified webhooks
- **LAUNCH-02**: Custom domain with correct AUTH_URL/OAuth callbacks
- **LAUNCH-03**: Security hardening — consistent password rules, distributed rate limiting, webhook error handling, proper Prisma migrations
- **LAUNCH-04**: Error observability (Sentry or similar) for production API routes

### Native-Level Extras

- **VOICE-01**: Premium TTS/STT voice replacing/augmenting Web Speech API
- **DATA-01**: Normalized progress schema (Scenario/SrsItem/Attempt tables) enabling analytics queries

### Quality

- **TEST-01**: Automated test suite for critical paths (auth, progress sync, billing webhook, tutor gating)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Stripe live mode, custom domain, security hardening | Commercial-launch milestone — user decision 2026-07-23 keeps this milestone focused on completing the product |
| Premium voice (TTS/STT) | Web Speech API sufficient for now; expensive; revisit after tutor is live |
| Progress DB schema normalization | JSON column suffices at current scale; only needed for analytics |
| Full automated test suite | Separate quality effort; phases add targeted verification only |
| Growth/marketing work (more SEO, ads) | Post-completion; blog + analytics + referrals already shipped |
| Mobile app | Web-first product |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CELPIP-01 | Phase 1 | Complete |
| CELPIP-02 | Phase 1 | Complete |
| CELPIP-03 | Phase 1 | Complete |
| CELPIP-04 | Phase 1 | Complete |
| CELPIP-05 | Phase 1 | Complete |
| CELPIP-06 | Phase 2.1 | **Complete — all four of the exam's parts ship** (02.1-08 machinery + 02.1-09 and 02.1-10 content). `reading-set-1` holds correspondence (11 min, a 270-word email plus a 5-blank reply, six questions then five blanks), the diagram part (8 min, a five-row programme table with four exception notes, five blanks in a message about it then three inference questions on it), information (9 min, a 569-word text in five labelled sections, nine questions, two offering a "the passage does not say" option and one with it as the key) and viewpoints (11 min, a 532-word four-voice article, five questions of which four test attribution, then a 159-word reader comment with five blanks). **38 items across 39 minutes, both derived from the parts and typed nowhere**; every item has an in-range key and an original explanation; ids unique across questions AND blanks. Gated by the reading group of `scripts/verify-celpip-content.mts` (383 → 519 → 648 assertions) and by 21 of 21 mutations failing against 4 unharmed controls. The landing reports "4 of the 4 exam part shapes" in numbers it derives. `/celpip/reading/reading-set-1` serves 200 and an unknown id 404s; 0 of 149 authored strings reach the served HTML, against an active control that leaks 125. Two things nobody has done: worked the set at a real pace, and answered a blank in a browser (WINDOWS.md). **02.1-12 gate:** re-confirmed at 648 assertions, 4 of 4 part shapes, 38 items over 39 minutes against a production build, and `/celpip/reading/reading-set-1` leaks 0 of 90 probed passage lines, stems and options into the served HTML. The gate also found and fixed the last of plan 10's positional-prose problem — the fifteen blanks were clean, but four objective-question explanations still said "the first option" (commit `02f11a8`); all 38 explanations now name options by content. **BROWSER PASS 2026-07-31 — this requirement is the one section verified end to end on desktop.** Render order confirmed *by DOM position*, not by reading source: correspondence puts questions before blanks. Per-part clocks re-arm 11:00 → 8:00 → 9:00 → **11:00** — part 4 re-armed despite sharing part 1's 11-minute allowance, which is precisely the latent bug `key={part.id}` guards, so that fix is proved rather than assumed. Total 39 minutes. Blanks distribute 5/5/0/5 across the four parts. Submission with items unanswered is allowed (submitted at 2/38 and it graded). Results screen renders with 36 explanation blocks, and a regex for `the (first\|second\|third\|fourth) option` returns **nothing** across the whole results page — `02f11a8` holds in the rendered DOM. Outstanding: no mobile pass (the native select as system picker, inline selects at phone widths), and nobody has worked the set at a real pace |
| CELPIP-07 | Phase 2.1 | **Met with a stated limitation** `[~]`. Complete as content and structure (02.1-04 + 02.1-05 + 02.1-06 + 02.1-07 + 02.1-11): original scripts read aloud through the Web Speech API, heard and never read before answering, a note pad during playback, questions revealed only by the last utterance's `onCompleted` and one at a time, and an answer key with a per-question explanation. The bank covers **all 6 exam part shapes** (`listening-set-1`: problem solving, daily conversation, information, news item, discussion, viewpoints — 2,468 words, 157 turns, **37 items** at the exam's confirmed 8/5/6/5/8/5, 55-minute derived limit, inside the exam's own 47-55 window). The landing derives "6 of the 6" from the bank, so the claim and the app agree. **Barely heard, and that qualification stands:** the user drove 12 turns of the news item in a real browser against a production build; nothing else in the set has been played, nobody has timed the 55-minute set, and nobody knows whether the discussion part's three voices are followable by ear — six of its eight items are unanswerable if they are not (WINDOWS.md ids 8, 10, 11, 12, 13, 14, 15). **02.1-12 gate:** D-04 and D-05 re-proved at the served boundary against a production build — 0 of 142 script turns and 0 of 37 question stems reach the served HTML, and no speaker name leaks either. The set reports 6/6 shapes, 37 items, 157 turns, longest turn 24 words against a 35-word ceiling, 55-minute limit. The gate also read the driver: `planVoices` is **all-or-nothing** — if the device offers fewer than three English voices, all three discussion speakers fall back to the browser default distinguished only by pitch (1 / 0.85 / 1.15). The script names all three aloud within its first seven turns, so attribution stays recoverable by content, but whether it is recoverable **by ear** is exactly the untested thing. **BROWSER PASS 2026-07-31 — the collapse risk is now bounded, not eliminated.** The test machine exposes **5 English voices** (two Canadian: Microsoft Richard and Linda), so `planVoices` had three real voices to assign and the collapse path **did not apply there** — which means it was not exercised. The failure remains untested *below three voices*, and that is where six of the discussion part's eight items live. Still not closed, and two more things were not reached: the **results screen and the post-answer transcript with speaker labels** (automation overshot it twice) and the **55-minute clock** (untimed) |
| CELPIP-08 | Phase 2.1 | **Met with a stated limitation** `[~]` (02.1-01 + 02.1-03) — all eight exam task shapes ship, one original prompt each, at the exam's own prep/response timings; in-browser recording and playback; a four-dimension descriptor self-check; no automated scoring anywhere. One disclosed compromise: exam Task 3 shows a photograph and this app writes the scene out instead, said in the prompt copy and in the landing's Speaking caveat. **02.1-12 gate:** all eight prompts re-read against the exam's confirmed windows and every pair matches — task 1 and 7 at 30/90, tasks 5 and 6 at 60/60, the other four at 30/60, and `withExamTimings` makes a prompt carrying an unlisted pair throw rather than rehearse her against the wrong clock. What is still unobserved is the thing the requirement's own words rest on — "so the learner can hear herself back": only the plan-01 advice prompt has been recorded and played back, on desktop, and no phone or Safari pass has happened at all, which is precisely the browser family the MediaRecorder WebM→MP4 container probe was written for (WINDOWS.md ids 3, 4). **BROWSER PASS 2026-07-31 — partially advanced.** The Speaking tab was switched to in a real browser, its cards render, and the **Task 3 written-scene caveat was SEEN on screen**, which closes the "never rendered" half. What did not move is the half the requirement's own words rest on: a `blob:` audio element was verified to load and `recordingSeconds` to be correct, but **no human has heard a recording play back** — on any prompt, on any device. The OS microphone indicator going out on stop stays code-verified only; a synthetic stream cannot show it. Still `[~]` |
| CELPIP-09 | Phase 2.1 | **Complete — observed end to end 2026-07-31.** Against a production build with a real Postgres, signed in as a fresh account: attempts made in three sections (writing 2, speaking 1, listening 1) reached the server — `celpipProgress` held `attempts`, `speakingAttempts` and `listeningAttempts` at **2,890 bytes with no audio payload**, which is T-02.1-59 confirmed on live data rather than by grep. `fluentpath.celpip.v1` and the progress key were then **wiped entirely** — a second device by construction — and on reload everything came back from the server and rendered: *"Attempt history — 5 attempts"*, each skill showing **its own metrics** (Listening "1/5 correct", Speaking "0:21 recorded · 2 self-checks ticked", Writing its own), not a shared one. **The Writing history was untouched** — T-02.1-62 confirmed against the thing it was written to protect. A subsequent full Reading attempt took the history to 6 with *"Reading Set 1 · 0:03 used · 0/38 correct"*. All four new-skill sections round-trip. **One known limitation, recorded not fixed:** see the finalize-on-results-exit note below. Previously: in progress — Speaking attempts persist and cross devices (02.1-01, verified against a real account). Listening's persistence contract now exists end to end (02.1-04: `listeningAttempts` through all six lockstep sites, merged by the existing union rule, proved by 12,040 merge and 254 schema assertions) and 02.1-05 shipped its first caller: `ListeningPlayer.finalizeAttempt` appends through `addListeningAttempt` from every exit path out of the results view, guarded once by `finalizedRef`. **No attempt has yet been written from a real browser**, so the Listening round trip is proved by 12,040 merge assertions and by nothing else. **Reading's persistence contract now exists too** (02.1-08: `readingAttempts` through all six lockstep sites, a fourth append-only field merged by the same one-line union rule, natural key `setId`+`date`, answers dropped-never-clamped over one map shared by question and blank ids — proved by 20,146 merge and 309 schema assertions, and by 24 of 26 mutations failing). **`addReadingAttempt` now has a reachable caller** (02.1-09): `READING_SETS` holds a set, `/celpip/reading/reading-set-1` serves, and `ReadingRunner.finalizeAttempt` appends from both exits out of the results view under one `finalizedRef` guard. All four attempt records now coexist and a stored blob written before any of them still parses with all three recovering to empty records. **No reading or listening attempt has yet been written from a real browser**, so both round trips are proved by 20,146 merge assertions and by nothing else. **02.1-12 gate:** the algebra held — 20,146 merge and 309 schema assertions, both at their high-water marks and neither below any figure recorded earlier in the phase, so no assertion was removed to make anything pass. The schema proof continues to assert the live-data property this phase promised: a blob stored **before** 02.1 — with `listeningAttempts`, `readingAttempts` and the speaking fields all absent — parses to the same writing attempts and drafts it always did, with the three new fields recovering to empty records. The audio-leak gate is clean: no recorder, blob or object-URL identifier appears in any of the three persistence modules. **Still not closed**, and for the original reason: the one thing that would close it is signing in, completing one attempt in each of the three sections, and seeing all three from a second browser. No automated gate can substitute for that. **BROWSER PASS 2026-07-31: not run at all** — checklist item 9 was not attempted. A Reading attempt *was* submitted and graded in a browser, so `addReadingAttempt` finally has an exercised caller, but nobody has watched an attempt survive a second device and nobody has confirmed the beta user's Writing history is visibly intact. *(That was true until 2026-07-31; the cross-device pass at the head of this row is the evidence that closed it.)* **KNOWN LIMITATION — close the tab from the results screen and the attempt is lost, including a full 39-minute Reading sitting.** `finalizeAttempt` runs on results-view *exit* (Retry / Back to tasks), the pattern Phase 1 chose for Writing and that Speaking, Listening and Reading each inherited — so this now spans all four skills rather than one. Found because a Reading attempt did not persist when the reviewer navigated straight to sign-out. Logged as an improvement candidate, deliberately not fixed at the gate. Note for whoever does fix it: `ProgressSync.tsx:62-69` already wires `visibilitychange`+`pagehide`, but those flush the sync **queue** — they push state already recorded, and on the results screen `finalizeAttempt` has not run, so there is nothing queued. The fix must wire `finalizeAttempt` itself to the same event pair in all three runners, minding `finalizedRef` and the reset-on-retry paths, and must use that pair rather than `beforeunload` (`ProgressSync.tsx:57-61` records why) |
| CELPIP-10 | Phase 2.1 | Complete (02.1-03 + 02.1-05 + 02.1-09) — **all four skills are real sections on `/celpip` and no tab carries the "Not yet available" badge.** Reading was the last one; 02.1-09 replaced the `undefined` source with `readingSource()` and the section went available on its own, because availability is DERIVED from bank contents rather than declared. Every coverage line is likewise derived and moves without an edit: Writing "17 prompts across the exam's two writing tasks", Reading "1 set covering 4 of the 4 exam part shapes", Listening "1 set covering 6 of the 6 exam part shapes", Speaking "8 prompts covering 8 of the 8 exam task shapes" — **all four read off a production server by the 02.1-12 gate, not from source**, and Reading's line moved from 2 of 4 to 4 of 4 on its own when 02.1-10 committed, without anybody editing the landing. That is the derivation working. Honest about what does not ship: the two qualitative compromises are named in hand-written caveats (Listening's browser-spoken audio — the caveat's own words are *"spoken by your browser rather than played from a recording"*, and it is worth quoting rather than paraphrasing, see the browser-pass note below; and Speaking's written-out photograph). Reading deliberately carries no caveat — it is incomplete rather than compromised, and a sentence naming the missing parts would be stale the day 02.1-10 commits. The attempt history is one list across all four skills, each with its own metrics. **BROWSER PASS 2026-07-31 — PASS, fully observed.** All four tabs are real buttons that switch grids; **no "Coming soon" or "Not yet available" appears anywhere**; hydration is clean. The Speaking Task 3 caveat renders. One correction to the earlier gate record: the reviewer could not text-match a "synthesised-audio" caveat for Listening — **because no such wording exists.** The caveat is present (344 chars), ships in the same client chunk as the Speaking one (`0iphvrge_jsif.js`), and renders through the same `section?.coverage.caveat` expression the reviewer watched work for Speaking; it simply says *"The audio here is spoken by your browser rather than played from a recording, so it sounds more mechanical than the exam's…"* — the words "synthesised", "synthetic", "TTS" and "robotic" appear nowhere in it. **Nothing is missing; the gate record's paraphrase was.** The one residual is a glance to confirm it on screen under the Listening tab |
| PROG-01 | Phase 2 | Complete |
| PROG-02 | Phase 2 | Complete |
| PROG-03 | Phase 2 | Complete |
| PROG-04 | Phase 2 | Complete |
| PROG-05 | Phase 2 | Complete |
| CONT-01 | Phase 3 | Complete (52/52 pairs — plan 03-10; browser-confirmed at the 03-11 gate, 2026-08-01) |
| CONT-02 | Phase 3 | Complete (35/35 phrases, 35/35 vocabulary — plan 03-04; SRS leg browser-confirmed at the 03-11 gate) |
| CONT-03 | Phase 4 | Complete (measured, not built — see requirement) |
| CONT-04 | Phase 4 | **Met with a stated limitation** `[~]` — closed at the 04-09 gate on measurement and a reader pass, NOT on observation. Content complete and derived: 84 phrases · 112 cards · 20 grammar questions across all five Sounding Native scenarios (from 30 · 40 · 5), 155 scheduled ids added, 15 retired with reasons, **0 re-pointed**, 53/53 pairs written and 0 pending — asserted for the first time rather than reported. Gated by 14,577 + 2,021 assertions at their high-water marks, an independent 651 = 651 id enumeration that does not import the gate's own logic, a 19-mutation sweep run in a scratch copy with its own `node_modules` (**17/17 caught on their own labels, 2 controls survived**, every verdict carrying a landing proof), and the derivation control re-proved (one emptied entry takes 53/53 → 52/53 and flips every dependent claim, with no second edit). **THE BROWSER PASS WAS NOT PERFORMED** — the batched recall deck, this phase's one component change and the surface between the learner and every recall item in the app, has never been rendered; nor has `/review` above sixteen due, a rehearsal move ticked, or anything at all on a phone. Ten unobserved items are open by name as WINDOWS 62 with an ordered checklist in `04-09-SUMMARY.md`. **"More reading" — half of D-01's own wording — was NOT delivered**, declined knowingly by the user at 04-08 on a measured ratio argument (WINDOWS 61); option D likewise (WINDOWS 63). `native/pronunciation` is deliberately the smallest of the five, for the reason written into both its banks |
| CONT-05 | Phase 4 | Complete (measured, not built — see requirement) |
| VOCAB-01 | Phase 04.1 | **Complete** — closed at the 04.1-07 gate ON MEASUREMENT. Own key space in its own module: `coreVocabItemId` is the one author of `vocab:<slug>` and the bank never spells it (M36); all 500 ids parse to nothing through `parseScenarioItemId`, resolve to nothing through `resolveReviewItem`, are absent from `reviewableIds()`, and resolve through their OWN resolver — 2,500 assertions, one per id per property. `review-items.ts` has no reference to the volume module in either direction and the key space imports back TYPE-ONLY (M34, M35). The dead `core/vocab#word#<slug>` design is recorded in AGENTS.md with the measurement that killed it. **Cite the four parse tripwires BY TEXT, never by line** — the `verify-scenario-content.mts:389-396` in this requirement's own wording is now 401-416, byte-identical but moved by twelve appended imports |
| VOCAB-02 | Phase 04.1 | **Complete** — 500 cards, NGSL ranks 8 → 648, `{ id, word, es, example }` with no `tip` (M05 catches the built record growing one). Enumerated independently of the module under test: **500 = 500 = 500** across the bank walked directly, `coreVocabIds()` and the fixture, with the one retired id in none of the three. 4,421 authored words (688 gloss + 3,733 example; mean example 7.47 words, range 6–10). Provenance asserted card by card against a committed NGSL 1.2 copy, CC BY-SA 4.0 with attribution in the fixture header; the harness-only files reach ZERO client chunks |
| VOCAB-03 | Phase 04.1 | **Met with a stated limitation** `[~]` — the containment is proved and **the seeing is not**. Asserted: `ReviewView` and `MistakesView` do not know the space exists and `ReviewHub` knows the tier BY NAME ONLY (M31–M33); `reviewableIds()` is still exactly the three scenario key spaces (M39 fires 503) and a resolver branch fires 500 (M38); and — new at this gate — **every count on the surface is derived and no JSX text node holds a digit**, so writing "500" into the tier statement, the page heading or the route metadata is caught on its own label (N07, N08, N09), and a retired id cannot inflate "you've met" or "due today" (N01–N03, N05). NOT asserted, because it cannot be: **this requirement leads with what a learner sees, and nobody has looked.** `/core-vocabulary` has not been opened in a browser since it held twenty cards; it now holds 500 in ten bands of fifty. Twelve unobserved items, open as WINDOWS 74 — including `recallBatches` rendering a rest point, which has never been seen on ANY surface and has been open since Phase 4 as WINDOWS 62 |
| VOCAB-04 | Phase 04.1 | **Complete** — measured from the harness and printed on every run, not calculated in a document: **317,038 B saturated over 1,252 STORAGE ids = 30.2 % of the 1,048,576 B cap**, 9.8 points under the 40 % stop line. The storage set is a strict superset of the queue set (M42), and the stop line and the wall are two assertions on one number that fail at different moments — tightening the ceiling fires the stop line while the wall SURVIVES (M43). Marginal cost measured at five points across the phase, 220.6 → 224.9 B/id, mean 223.7 over all 500; 04.1-05's projection came in 62 bytes low |
| VOCAB-05 | Phase 04.1 | **Met with a stated limitation** `[~]` — every clause is an assertion and every one was watched failing (M08–M15, M18, plus the three frame assertions). Two owed findings settled by measurement: the **distinct-shape floor now fires ALONE** at n=500 (20 shapes of exactly 25 satisfies both ceilings and fails the floor — one failure, no collateral; impossible at n=20 where it was dominated), and an **emptied bank still yields exactly ONE failure**, so `the containment is not an empty deck` is still the only thing between a vacuous green and a real one — and the nine assertions added at this gate survive an empty deck too, said rather than left to be found. NOT `[x]` because the requirement justifies itself with *automated because at 500 nobody reads them all* — and a 112-card reader sample (**22.4 %**) found three defect classes no assertion in this list can see: a per-BAND subject-shape lean (bands 4 and 5 run at 2 % pronoun openers against a deck-wide 17.8 %, and the band is the unit a learner sits through), five cards whose Spanish front is most naturally answered by a *different* English word, and three examples resting on a word a B1 learner will not know. WINDOWS 71, 72, 73 |
| VOCAB-06 | Phase 04.1 | **Complete** — **52 mutations declared, 52 executed, 46 CAUGHT each on its own label, 6 controls SURVIVED**, run in a git worktree with `node_modules` junctioned in and **no build performed inside it**; worktree removed, main tree clean under `src/` and `scripts/` on a non-zero-exit check, `.next` wiped and rebuilt from the committed tree afterwards (03-08). Every verdict carries a landing proof and a parse check through TypeScript's own parser. Three mutations were DEFECTIVE and were diagnosed as defective before any assertion was blamed, which is 04-01's ordering; **one assertion was genuinely weak and was fixed** — the copy check's regex survived its own mutation twice, and now asks the compiler for `JsxText` nodes. 1,151 ids in the fixture across two key spaces, 16 retired, **zero re-pointed** in any content commit of the phase; `--update` still REFUSES to launder a changed hash, verified live. `scenario-coverage.ts` reports 35/35 and 53/53 with its pair-count literals intact, and neither it nor `curriculum.ts` was modified anywhere in the phase — proved from the diff rather than from care. Dependencies 11 + 11, zero packages installed |
| TUTOR-01 | Phase 5 | Pending |
| TUTOR-02 | Phase 5 | Pending |
| TUTOR-03 | Phase 5 | Pending |
| TUTOR-04 | Phase 5 | Pending |
| TUTOR-05 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

*Renumbering note (2026-07-23): CELPIP Writing inserted as Phase 1 before any phase was planned or executed; former phases 1–4 became 2–5.*

---
*Requirements defined: 2026-07-23*
*Last updated: 2026-07-23 after roadmap creation*
