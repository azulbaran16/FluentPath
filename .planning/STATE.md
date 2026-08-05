---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 04.1
current_phase_name: native-level-depth
status: in-progress
stopped_at: Completed 04.1-03-PLAN.md
last_updated: "2026-08-05T01:00:49.147Z"
last_activity: 2026-08-04
last_activity_desc: "04-09 executed, THE PHASE GATE: 17 of 17 mutations CAUGHT on their own labels with 2 controls green in a scratch export with its own node_modules, an independent 651 = 651 id enumeration that does not import the gate own logic, the derivation control re-proved, and a reader pass that found NO near-duplicate exercise and rewrote nothing (same-world highest 0.286 phrases / 0.400 terms, nothing at or above 0.50 anywhere, the rise from 03-11 mostly pool size). The corpus figure is settled at 4,410 for 04-07 own tree and 4,440 at HEAD, and 04-05 broken harvester now THROWS rather than sitting importable beside the good one. CONT-04 is marked [~] met-with-a-stated-limitation and NOT [x]: the content is complete, derived and gated, but THE BROWSER PASS WAS NOT PERFORMED and ten items are open by name as WINDOWS 62 - including the batched recall deck, which is this phase one component change and has never been rendered, and any phone at all. More reading is named as a deliberate deferral the user declined knowingly. PHASE 4 IS COMPLETE."
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 52
  completed_plans: 48
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-23)

**Core value:** A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.
**Current focus:** Phase 05 — the AI tutor (NOT STARTED). Phase 04 native-level-depth is COMPLETE, 9 of 9 plans; CONT-04 closed at [~] with its browser pass open by name (WINDOWS 62).

## Current Position

Phase: 04.1 (vocabulary-volume-deck) — IN PROGRESS
Plan: 3 of 7 executed (01 tracer, 02 gates)
Status: **THE GATES ARE IN, BEFORE A SINGLE CARD IS AUTHORED AT VOLUME.** 04.1-02 put all
twenty of the tracer's `vocab:` ids under a committed hash of their whole authored record
(651 → **671** ids, `verify-id-stability.mts` 2,021 → **2,082** assertions, fixture regenerated
once with an additions-only diff and no changed hash); made the quality floor mechanical
(`verify-scenario-content.mts` 14,577 → **14,991**), including the frame-diversity ceiling that
is the one assertion able to see flat prose — **a deliberately flattened twenty-card deck that
passes every other check produces exactly THREE failures, all of them frame**; and re-pointed the
payload gate at the **STORAGE** set, which 04.1 is the first phase in this project to have differ
from the queue set: `209,586 B over 772 storage ids = 752 shared-queue + 20 volume — 20.0 % of
the cap`, with a **40 % STOP LINE** beside the route's own wall and the sentence *the fix is never
to raise the ceiling* written next to the constant. **45 of 45 mutations were CAUGHT on their own
labels** in a scratch worktree, with the wall surviving both stop-line mutations. **The marginal
cost of a volume id is 220.6 B, not the 272.8 CONTEXT extrapolates from** — +480 lands near 30 %.
**04.1-01's blocking human checkpoint is STILL OUTSTANDING and no VOCAB requirement is marked.**

Previously: **PHASE 4 COMPLETE on `main`** — 04-09, the gate, is done. **ALL FIVE native scenarios now carry depth — four of them
deeply and one deliberately less, and the record says which is which.**
`native/phrasal-verbs` — 18 phrases, a 42-card deck batched 14/14/14, 15 grammar questions, 24
honest minutes. `native/idioms` — 18 re-selected phrases and 24 re-selected cards, its briefing
rewritten onto material no other surface uses, 17 minutes. `native/register` — nine contrasting
pairs (18 phrases) and a 24-card marker deck, 17 minutes. `native/culture` — 18 repair phrases
across three axes and a 24-card deck, nothing in either bank carrying a shelf life, 17 minutes.
**`native/pronunciation` — 12 phrases and 16 cards, 11 minutes: DELIBERATELY the smallest of the
five, and BOTH its bank headers say why.** Under D-01 the drills this skill actually needs
(minimal pairs, word stress, intonation AS EXERCISES) cannot be built, so volume buys less here
than anywhere else, and padding it to a uniform floor would have implied the five were deepened
equally when they were not. Its six added warm-up lines are sentences a person would really say,
modelled on `ship-sheep` — not six more tongue-twisters — and its deck is the metalanguage a
learner needs in order to be TOLD what her mouth is doing wrong, which is this scenario's entire
feedback loop until a real voice model lands.

**The deferred VOICE-01 case is now evidence-backed rather than asserted**, and it is an explicit
input to the phase gate's annotation of CONT-04: `PronunciationLab` scores WORD BY WORD against
the browser recogniser, so it cannot see vowel length, aspiration or stress at all. One of the six
new lines (`record-it-and-a-record`, the noun/verb stress shift) has a contrast the scorer is
structurally blind to, and **the item says so in its own tip** rather than shipping the limitation
silently. T-04-15 is reported partially unmet: 5 of 6, by the nature of stress.

**A FOURTH gate now binds this phase, and it is the first in the project on ARRAY ORDER:**
`native/register`'s phrase set must have an even length, must alternate `casual-` / `formal-`
against the index, and its nine pairs must sit adjacent — because no field records which entry
pairs with which and both renderers walk the array from index 0. **Adding a tenth situation means
adding TWO consecutive entries, casual first.** The slugs deliberately do not share a stem, so
suffix matching is not the mechanism and must not become it.

**The three gates already binding every later plan:** (1) `scripts/verify-id-stability.mts` —
regenerate `scripts/fixtures/scheduled-item-ids.json` with `--update` IN THE SAME COMMIT as any
added or removed scheduled id; a legitimate diff is additions only, nothing removed except into
`retired` with a hand-written reason, and NOT ONE changed hash; a replacement is
retire-then-add-with-a-new-slug, never an edit in place, and the hash covers EVERY field so a
rewritten tip or example fails too. (2) the session-length invariant with THREE rates —
`minutes × 60 >= phrases × 20 + deck × 15 + questions × 30` — so **any plan that deepens a bank
must raise that scenario's `minutes` in the same commit**; `>=` means exactly zero slack passes,
and `native/phrasal-verbs` and `social/small-talk` both sit at zero and must not be raised.
(3) `native/idioms`' tip gate and its withheld-expression gate, plus the 35/35 briefing-of-its-own
assertion.

**Run the corpus scan BEFORE authoring — it has now killed twenty-one candidates across six
plans**, and in each of the last three the items it killed included ones the PLAN ITSELF named.
Naming something in a plan does not make it free; at 04-07 the killed candidate scored **J = 1.000
against a live id in the very same scenario**. And the scan is not sufficient: reading a finished
bank consecutively has, in each of the last three plans, found shared syntactic frames it scored
at 0.10–0.20 — five of them at 04-07.

**Use 04-06's REBUILT harvester, not an earlier plan's.** 04-05's silently dropped every reading
passage BODY (`string[]` under a `typeof === "string"` guard), every glossary (wrong field names)
and every reading question prompt (`q.prompt` vs `q.q`). Rebuilt it measures ~4,500 fields against
3,744, so any "zero duplicates" measured before 04-06 was measured against an incomplete corpus.

**Read `04-01-SUMMARY.md` (the contract carrier), then `04-06-SUMMARY.md` (the rebuilt harvester)
and `04-07-SUMMARY.md` (the smallest-of-the-five judgement and the VOICE-01 evidence), not the
plans.** 04-08 in particular: **the no-new-declaration verdict for `native/pronunciation` is
already derived in `04-07-SUMMARY.md` and need not be re-derived.** Defects found and NOT fixed are in
`.planning/phases/04-native-level-depth/deferred-items.md` — including two open questions a later
plan should settle: whether `FALLBACK_LESSON` is deleted or stays asserted-dead (03-11 and 04-04
took opposite routes on the same class of problem), and whether 04-04's briefing/bank separation
gate should widen from one scenario to all thirty-five.

Last activity: 2026-08-04 — 04-09 executed, THE PHASE GATE: 17 of 17 mutations CAUGHT on their own labels with 2 controls green in a scratch export with its own node_modules, an independent 651 = 651 id enumeration that does not import the gate own logic, the derivation control re-proved, and a reader pass that found NO near-duplicate exercise and rewrote nothing (same-world highest 0.286 phrases / 0.400 terms, nothing at or above 0.50 anywhere, the rise from 03-11 mostly pool size). The corpus figure is settled at 4,410 for 04-07 own tree and 4,440 at HEAD, and 04-05 broken harvester now THROWS rather than sitting importable beside the good one. CONT-04 is marked [~] met-with-a-stated-limitation and NOT [x]: the content is complete, derived and gated, but THE BROWSER PASS WAS NOT PERFORMED and ten items are open by name as WINDOWS 62 - including the batched recall deck, which is this phase one component change and has never been rendered, and any phone at all. More reading is named as a deliberate deferral the user declined knowingly. PHASE 4 IS COMPLETE.

Progress: [█████████░] 92% — 45 of 45 written plans executed (5 of 6 phases complete; Phase 4 native-level-depth CLOSED at 9 of 9 plans, CONT-04 at [~] with its browser pass open as WINDOWS 62; Phase 5, the AI tutor, is not yet planned so 45 is the written total and not the project total)

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | ~15min | 1 tasks | 8 files |
| Phase 01 P02 | ~10min | 2 tasks | 1 files |
| Phase 01 P03 | ~15min | 2 tasks | 1 files |
| Phase 01 P04 | ~15min | 3 tasks | 5 files |
| Phase 01 P05 | ~15min | 3 tasks | 4 files |
| Phase 01 P06 | ~20min | 2 tasks | 3 files (2 defect fixes) |
| Phase 02 P01 | 47min | 2 tasks | 8 files |
| Phase 02 P02 | ~20min | 2 tasks | 2 files |
| Phase 02 P03 | 25min | 2 tasks | 4 files |
| Phase 02 P04 | 40min | 3 tasks | 5 files |
| Phase 02 P05 | 38min | 3 tasks | 6 files |
| Phase 02 P06 | 55min | 2 tasks | 3 files |
| Phase 02.1 P01 | ~70min | 3 tasks | 13 files |
| Phase 02.1 P02 | 28m | 3 tasks | 7 files |
| Phase 02.1 P03 | 48m | 3 tasks | 4 files |
| Phase 02.1 P04 | 62m | 2 tasks | 9 files |
| Phase 02.1 P05 | 45m | 3 tasks | 6 files |
| Phase 02.1 P06 | 38m | 2 tasks | 2 files |
| Phase 02.1 P07 | 22m | 2 tasks | 1 files |
| Phase 02.1 P11 | 34 | 1 tasks | 2 files |
| Phase 02.1 P08 | 74m | 2 tasks | 9 files |
| Phase 02.1 P09 | ~55min | 3 tasks | 4 files |
| Phase 02.1 P10 | 40 | 2 tasks | 4 files |
| Phase 02.1 P12 | 50m | 3 tasks | 5 files |
| Phase 03 P01 | ~95min | 2 tasks | 11 files |
| Phase 03 P02 | ~70min | 3 tasks | 7 files |
| Phase 03 P03 | ~65min | 2 tasks | 2 files |
| Phase 03 P04 | ~70min | 2 tasks | 2 files |
| Phase 03 P05 | 75min | 3 tasks | 8 files |
| Phase 03 P06 | 24min | 3 tasks | 6 files |
| Phase 03 P07 | ~55min | 2 tasks | 7 files |
| Phase 03 P09 | ~95min | 2 tasks | 6 files |
| Phase 03 P08 | ~70min | 2 tasks | 1 files |
| Phase 03 P10 | ~85min | 2 tasks | 1 files |
| Phase 03 P11 | ~135min | 3 tasks | 8 files |
| Phase 04 P01 | 22m | 4 tasks | 8 files |
| Phase 04 P02 | ~50 min | 2 tasks | 4 files |
| Phase 04 P03 | ~65 min | 3 tasks | 5 files |
| Phase 04 P04 | 75 min | 3 tasks | 8 files |
| Phase 04 P04 | 75 min | 3 tasks | 8 files |
| Phase 04 P05 | ~55 min | 2 tasks | 5 files |
| Phase 04 P06 | 65 min | 2 tasks | 5 files |
| Phase 04 P07 | ~50 min | 2 tasks | 4 files |
| Phase 04 P08 | ~95 min | 3 tasks | 7 files |
| Phase 04 P09 | ~135 min | 3 tasks | 4 files |
| Phase 04.1 P02 | ~3h | 3 tasks | 3 files |
| Phase 04.1 P03 | ~2h | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- 2026-06-19 (user, informal — design doc): free features first, paid AI tutor last → tutor is Phase 5
- 2026-07-23 (user, brainstorming + approved spec docs/plans/2026-07-23-celpip-writing-design.md): CELPIP Writing prep as product feature, self-eval v1 (no AI), free, inserted as Phase 1
- 2026-07-23 (user): milestone focus is "Completar producto" — tutor + content + server-side progress; commercial-launch items deferred to a later milestone
- [Phase ?]: 01-01: Modeled the pre-start screen via mode === null (not a third phase value) to keep phase: 'compose'|'results' per the plan's type contract while supporting the two-button start screen.
- [Phase ?]: 01-01: Results view ships Retry / Back to tasks only (no 'Next task' yet) — deferred to plan 05 once catalog navigation exists.
- [Phase ?]: 01-02: Split two authoring tasks into two atomic commits by staging an intermediate file state, preserving one-commit-per-task even though both tasks modify the same file.
- [Phase ?]: 01-03: SURVEY_TASKS landed at 9 total (seed + 8) rather than exactly 8, since the plan's target was '~8' with an explicit 7-9 acceptance range.
- [Phase ?]: 01-04: Deferred addAttempt from submit-time to results-view-exit-time (Retry / Back to tasks) since the store's addAttempt only appends — persisting once at exit captures the learner's final rubric self-check without duplicate attempts.
- [Phase ?]: 01-04: Extended celpip-progress.ts's writeLocal/saveDraft to return a success boolean (was silently swallowing setItem failures) so the autosave-failure warning truth can actually surface to the UI.
- [Phase ?]: 01-05: Task-card 'in progress' status computed from a non-empty saved draft (not attempts), since completedTasks already covers any attempted task under the current store shape.
- [Phase ?]: 01-06: Verification gate was driven by an agent through a real browser (Playwright) because the user had no time for hands-on UAT; timer expiry was reached by overriding Date.now() in the page rather than waiting 27 minutes.
- [Phase ?]: 01-06: formatDuration moved from CelpipLanding into celpip-progress so the results metrics strip and history rows format durations identically.
- [Phase ?]: 01-05: Attempt-history rows link to /celpip/writing/[taskId] (not a deep-linked historical result view) since WritingSimulator has no mechanism to render an arbitrary past attempt and is out of this plan's file scope.
- [Phase ?]: 02-01: srs/attempts per-entry selection is value-only (canonical max), not 'side with the later lastActive' — the plan's rule is provably non-associative for a key-unioned field; 02-02's refined rules must stay entry-only
- [Phase ?]: 02-01: the D-01b vocab ladder consults lastActive ONLY when neither side carries an instant; two equal non-null instants fall through to the value rungs, which is what keeps the ladder associative
- [Phase ?]: 02-01: GET /api/progress returns the empty state rather than null for an absent or corrupt blob
- [Phase ?]: 02-02: srs[id] merges entry-only (earlier due, then lower box) — the plan's paired-attempts-updatedAt rule is 02-01's non-associativity counterexample applied to a cross-map reference
- [Phase ?]: 02-02: the attempts same-day tie breaks on topic, not tries — tries is independently maxed, so it inflates the winner's own comparison key
- [Phase ?]: 02-02: todayXp/xpDay are keyed on xpDay alone, never lastActive; a selection key must travel with the value it selects
- [Phase ?]: 02-03: the D-01b instant is accepted only at millisecond precision — laterInstant compares lexically, so a second-precision instant would sort ABOVE a millisecond one and invert the whole-field ordering
- [Phase ?]: 02-03: zod on the client costs +284,752 bytes in one new chunk (isolated by a before/after build); accepted as the price of the client and server sharing one contract
- [Phase ?]: 02-04: classifyFailure defaults to retry; only 401/403 stop and only an explicitly permanent 4xx drops — the never-lose direction for PROG-04
- [Phase ?]: 02-04: a connectivity hint resets the backoff but NOT the consecutive-failure count; only a real success clears the D-06 indicator
- [Phase ?]: 02-04: the sync queue is a transport, not a mutation site — it forwards the D-01b instant unmodified, keeping nowInstant() authored in exactly one place
- [Phase ?]: 02-05: CelpipProgressState carries one marker — the D-01b millisecond instant — and nothing day-shaped; the drafts carve-out is decided by it, never by map size
- [Phase ?]: 02-05: a CELPIP attempt with no natural key (task id + submission instant) is dropped at coercion — an entry that cannot be de-duplicated is re-appended on every reconcile
- [Phase ?]: 02-05: the CELPIP task-type union is bound by an import(...) type annotation, not an import statement, so the drift guard fires without pulling the task bank into the bundle
- [Phase ?]: 02-06: readLocal() in the CELPIP store reads through safeReadCelpip — after the hoist that value is merged and uploaded, not just rendered, so an unvalidated updatedAt would enter the join
- [Phase ?]: 02-06: /api/celpip-progress gets its OWN 2 MiB cap and its own rate-limit bucket — the sibling's bounds are per-handler and a 20,000-char entry cap bounds one essay, not the number of attempts
- [Phase ?]: 02-06: a count-based grep gate on a stamping helper does not pin WHERE the stamp lives; mutation X3 moves it into the reconcile with the count unchanged, so the gate now extracts the persist body and asserts inside=1 outside=0
- [Phase ?]: 02.1-01: each new CELPIP skill gets its OWN top-level append-only field; `taskType` is never widened, because celpipAttemptEntry mirrors that enum independently of zod and would silently delete an unrecognised attempt on the next reconcile
- [Phase ?]: 02.1-01: an attempt's `shape` is a bounded string with NO literal list mirrored in progress-merge.ts — adding a ninth exam shape must never be able to delete a learner's stored attempt
- [Phase ?]: 02.1-01: no new deletable map, so no second whole-field instant; this state carries one `updatedAt` and `drafts` already rides it (a second map selected on it would resurrect a cleared draft — fca41b7)
- [Phase ?]: 02.1-01: canonicalAttempts/celpipAttemptRecord generalised over `{ date: string }` with an injected key function, so Listening and Reading each add one line and inherit the existing proof rather than copying it
- [Phase ?]: 02.1-01: the Speaking response countdown is always mode="timed" even in practice mode — pausing a countdown while MediaRecorder keeps capturing desynchronises the two
- [Phase ?]: 02.1-01: the microphone opens on the Start press and stays open through prep so no permission dialog can eat the opening seconds; the UI says the indicator will be lit rather than hiding it
- [Phase ?]: 02.1-01: mutation harnesses must fail loudly on a missing OR ambiguous anchor — CRLF/LF mismatch between progress-schema.ts and progress-merge.ts made three "surviving mutations" spurious, and one later anchor silently hit the writing coercer instead of the speaking one
- [Phase ?]: 02.1-02: /celpip section availability is DERIVED from bank contents (CELPIP_SECTIONS) — a bank wired but empty still reports 'not yet available', so a dropped content plan cannot leave a false claim on the landing
- [Phase ?]: 02.1-02: HISTORY_SOURCES in CelpipLanding is the single extension point for attempt history — a new skill adds one entry and changes nothing else in that file
- [Phase ?]: 02.1-03: RESEARCH assumption A2 resolved — CELPIP Speaking timings confirmed against official material, pinned in one lookup and gated by rule, so a correction is deliberately a two-file edit
- [Phase ?]: 02.1-03: Speaking Task 3 ships a written scene instead of the exam's photograph — recorded as an open content dependency, disclosed in the prompt copy and the landing caveat, gated by six mutations
- [Phase ?]: 02.1-03: scripts/verify-celpip-content.mts is the shared CELPIP content harness and a low-conflict append target for plans 04 and 07 — shared helpers, one marked import block, per-skill sections
- [Phase ?]: 02.1-04: a Listening script is an ordered array of SPEAKER TURNS, never one string — one shape solves Chrome's ~15s utterance truncation, per-speaker voices, the post-answer transcript and the audioUrl slot
- [Phase ?]: 02.1-04: CelpipListeningSegment.audioUrl? is the reserved VOICE-01 slot and the whole of D-03's reversibility — recorded audio later is a file per script, never a migration
- [Phase ?]: 02.1-04: CelpipObjectiveQuestion.explanation is REQUIRED at the type level, because an optional field is one an author forgets under deadline
- [Phase ?]: 02.1-04: an out-of-range answer index is DROPPED, never clamped — a clamped index is an answer she never chose, shown back to her as her own
- [Phase ?]: 02.1-04: listening notes are NEVER persisted, and BOTH the schema and the merge assert a client sending them has them stripped — otherwise the no-second-instant argument quietly stops being true
- [Phase ?]: 02.1-04: src/lib/celpip-speech.ts is the ONE place the CELPIP section drives speechSynthesis; onCompleted is attached to the LAST utterance only, because under D-05 it is the single signal allowed to reveal the questions
- [Phase ?]: 02.1-04: every utterance is queued synchronously inside one call (the iOS gesture rule) and never chained from onend — gated by scripts/verify-celpip-speech.mts against a mock engine, since tsc, lint and a desktop browser are all happy with the broken version
- [Phase ?]: 02.1-04: pre-existing defect fixed — progress-merge's coercers assigned poisoned record keys (constructor/prototype) that the schema strips, so the two halves of one contract disagreed and the reconcile would write on every authenticated page load, forever
- [Phase ?]: 02.1-05: a resolved set passed from a server component to a client one is serialized into the RSC payload and INLINED into the page's HTML — the listening route passes the set ID and the player resolves it, gated by a conjunction (measured: 41 of 42 authored strings in the served HTML before the fix, 0 after)
- [Phase ?]: 02.1-05: the ONLY pre-answer paths to the script are the two audio-failure valves, and both set audioFailed on the attempt so a read run can never be mistaken for a listened one in her history
- [Phase ?]: 02.1-05: listening questions are revealed one at a time and are not revisitable — the selection lives in a `pending` slot until she advances, so moving on is the deliberate act rather than a side effect of clicking an option
- [Phase ?]: 02.1-05: adding a listening part is a pure append to SET_1_PARTS — the set's timeLimitMinutes is derived from the parts, so plans 06/07/11 add a const and one array entry and touch nothing else
- [Phase ?]: 02.1-05: the content harness REPORTS part-kind coverage and ASSERTS the exam's per-part item counts (8/5/6/5/8/5) — a coverage gate would fail for most of the phase and be disabled rather than fixed
- [Phase ?]: Listening SET_1_PARTS is ordered by the exam's own part order, not by which plan authored each part, and the order is gated as a subsequence of CELPIP_LISTENING_PART_KINDS
- [Phase ?]: A CELPIP conversation part must answer some items by implication rather than recall — 3 of 5 in ls1-daily-conversation — or it is a news item with two voices
- [Phase ?]: Listening set 1's information and viewpoints parts: 3 of 6 information items are answerable only by having tracked the order, and 4 of 5 viewpoints items turn on fact against opinion or attribution
- [Phase ?]: The set's derived timeLimitMinutes comment now names both terms (audio at the app's real 142 wpm, plus a minute per item) but still writes no count into prose
- [Phase ?]: Listening discussion parts must name their speakers aloud: the player renders no speaker label during playback, so who-said-it questions are otherwise unanswerable
- [Phase ?]: LISTENING_MIN_SPEAKERS gates the voice count each listening part shape needs — a discussion collapsed to two speakers passed every other assertion
- [Phase ?]: Listening set 1 is closed at six of six part shapes and 37 items; further listening content is a new set, not a seventh part
- [Phase ?]: 02.1-08: the drop-down blank is a native select and a first-class gradable item, built before any passage — it appears in three of the exam's four reading parts
- [Phase ?]: 02.1-08: readingAttempts is a fourth separate top-level append-only field; taskType was NOT widened, and in-progress answer sheets are never persisted
- [Phase ?]: 02.1-08: the Reading clock is armed PER PART and the Timer is keyed by part id — two parts may legitimately share an allowance (correspondence and viewpoints are both 11 minutes)
- [Phase ?]: 02.1-08: a reading set carries NO timeLimitMinutes; readingSetMinutes derives it from the parts so it cannot drift
- [Phase ?]: Reading ships partial (parts 1 and 3) rather than waiting for all four: the correspondence part is the only one exercising both question types at once, so it is what makes the drop-down blank reachable at all
- [Phase ?]: Part-kind coverage is REPORTED by the content harness and never asserted — an assertion would fail for the whole of plan 09 and get disabled rather than fixed; part ORDER is asserted as a subsequence, because this set has a hole where part 2 goes
- [Phase ?]: The reading section carries NO hand-written caveat: unlike Listening's synthesised audio and Speaking's written-out photograph, Reading is simply incomplete, and its derived coverage line already says 2 of the 4 and moves on its own
- [Phase ?]: Reading covers all four exam parts: 38 items in 39 minutes, both derived from the parts and typed nowhere
- [Phase ?]: The drop-down answer key must not sit in one option position across a part — a uniform part trains a cue the exam does not supply
- [Phase ?]: An explanation names an option by its content, never its position, because re-ordering options is the fix for a uniform key
- [Phase ?]: Each reading part runs its items in the exam's own order: blanks before questions for the diagram part only
- [Phase ?]: Part-kind coverage stays reported and unasserted even though plan 09's reason expired — a future set 2 may legitimately ship partial
- [Phase ?]: 02.1-12: CELPIP-07 and CELPIP-08 marked [~] (met with a stated limitation) rather than [x] — their own wording rests on a browser observation nobody has made
- [Phase ?]: 02.1-12: the four Speaking rubric axis names are the official CELPIP sub-score names — judged factual labels rather than expression, and disclosed in the gate record rather than hidden
- [Phase ?]: 02.1-12 (user, 2026-07-31): the four Speaking rubric dimension names stay VERBATIM — they are the exam's own scoring axes and renaming would hurt recognition on the day. The only verbatim borrowing in the app, and a deliberate one
- [Phase ?]: 02.1-12: the Listening caveat was never missing — it ships in the same client chunk as Speaking's and simply never uses the word 'synthesised'. Quote product copy, do not paraphrase it, in verification records
- [Phase ?]: 02.1-12: closing the tab from a CELPIP results screen loses the attempt (finalizeAttempt runs on results-view exit, inherited by all four skills). Recorded as a known limitation and improvement candidate, deliberately NOT fixed at the phase gate
- [Phase ?]: 03-01: the SRS id is the composite world/scenario#kind#slug (D-06 as ratified), composed ONLY by scenarioItemId in src/lib/review-items.ts — a one-way door on live Postgres progress, so nothing downstream spells the format by hand
- [Phase ?]: 03-01: scenario vocabulary enters the SRS queue through recordAttempt, not markVocab — state.vocab stays the deck browser's boolean known-set, and CONT-02's 'feeds the queue' means real spaced repetition
- [Phase ?]: 03-01: item ids are AUTHORED slugs, never index-derived — the deck browser's \:\ orphans every later card's progress on an insert, and 280 new cards were about to be written
- [Phase ?]: 03-01: no field may be added to the stored {box,due} value — srsItemSchema is a closed object and sanitizeEntries strips extras silently, which is why the selection metadata lives in the id instead
- [Phase ?]: 03-01: ReviewView resolves every due id through resolveReviewItem instead of filtering GRAMMAR_QUESTIONS — D-05 fixed, so a scenario item is rendered rather than stored, merged and invisible
- [Phase ?]: 03-01: coverage is DERIVED from bank contents (SCENARIO_COVERAGE), mirroring celpip.ts section(): an entry whose item count is zero is dropped before availability is decided, so emptying a bank flips the pair back to unwritten with no second edit
- [Phase ?]: 03-01: pendingPairs() returns {key, skill} and is the closing assertion of every skill plan from 03-05 — a per-skill zero is true regardless of which sibling plan in the wave merged first, where a global written-count would not be
- [Phase ?]: 03-01: the coverage registry carries COUNTS only ({items, unit}); ScenarioPractice imports each bank module directly, so a bank's renderable TYPE never has to be invented before the bank exists
- [Phase ?]: 03-01: getScenarioPhrases (strict) and getPhrases (lenient, world fallback) coexist until plan 03-11 — the scenario path uses only the strict one, which makes the generic branch unreachable from a scenario page from this commit onward
- [Phase ?]: 03-01: RecallDeck snapshots its items at mount — on /review the due-derived array shrinks the moment an item is answered correctly, which would skip one item per correct answer and eventually read past the end
- [Phase ?]: 03-02: the verify-merge scenario fixtures join a sweep over EVERY existing state, so composite SRS keys are proved against grammar keys, malformed entries and EMPTY rather than only against each other
- [Phase ?]: 03-02: verify-merge imports scenarioItemId rather than spelling the composite id, so the harness cannot keep passing against a format the app no longer writes
- [Phase ?]: 03-02: a harness example must be DERIVED from bank contents — naming social/dating as the unwritten scenario made a true assertion fail on correct content the moment the phase authored it
- [Phase ?]: 03-02: a weak topic with nothing practisable behind it is named plainly rather than producing an empty quiz
- [Phase ?]: 03-03: work/emails keeps its PHRASES spoken (chasing a message, owning a reply-all) and leaves the written half to plan 03-06 — a scenario declaring two skills must not have one plan spend the other's material
- [Phase ?]: 03-03: byte-identity is all the harness can assert, so the near-duplicate check is a separate deliberate pass — 162 phrase texts, 200 terms, 162 glosses, 200 examples across all 35 scenarios, plus a Jaccard scan for paraphrases that share no opening frame
- [Phase ?]: 03-03: a shared REQUEST FRAME across scenarios is legitimate reuse, a shared SITUATION is not — 'I'd like … please' teaches the same A2 structure in two places on purpose, but a third instance was rewritten to 'This needs escalating, I'm afraid' to vary register rather than nouns
- [Phase ?]: 03-03: a mutation is 'caught' only when the EXPECTED assertion label appears in the output — exit code 1 alone lets a mutation trip an unrelated assertion and look caught for the wrong reason
- [Phase ?]: 03-03: mutation anchors are EXTRACTED from the real file by unique substring at generation time, not hand-typed — a stale hand-copied anchor is what made 03-02's M9 unreproducible
- [Phase ?]: 03-04: CONT-02 ticked only after asserting COVERAGE_TOTALS.scenariosWithPhrases === 35 and scenariosWithVocabulary === 35 — the assertion runs BEFORE the tick, never after
- [Phase ?]: 03-04: Sounding Native authored to CONT-02's floors at its declared CEFR levels only; the deeper idiom/phrasal-verb/pronunciation/register depth is CONT-04 and stays with Phase 4
- [Phase ?]: 03-04: native/register's phrases are three CONTRASTING PAIRS rather than a flat list — a register is a dial, and one line cannot show a dial moving
- [Phase ?]: 03-04: native/pronunciation's tongue-twister shape was deliberately NOT spread to the other four native scenarios; its vocabulary deck is the metalanguage instead
- [Phase ?]: 03-04: verb-skeleton overlap between the phrasal-verbs deck and the rest of the corpus is structural, not authoring fatigue — every phrasal verb shares a verb with some other phrasal verb in a 280-term corpus
- [Phase ?]: 03-05: a scenario exercise's question id IS its composed D-06 id, so GrammarQuiz needed no change at all — ROADMAP criterion 3 (mistakes reaching weak topics) is inherited from the existing engine, not built
- [Phase ?]: 03-05: an exercise bank that is also resolved by review-items.ts must compose its ids LAZILY — the two form a real ESM cycle and eager composition hits SCENARIO_ITEM_SEPARATOR's temporal dead zone depending on nothing but import order
- [Phase ?]: 03-05: wiring a scenario exercise bank is FOUR edits, not three — registry, resolver, dispatch AND reviewableIds(); Dashboard and ReviewHub build their due count and weak-spots drill from that list, so an omitted id is scheduled and then counted nowhere
- [Phase ?]: 03-05: grammar topic strings are an id space, not display copy — 8 of 20 questions reuse a global bank topic EXACTLY so weakTopics aggregates instead of fragmenting; the 7 new strings (Question tags, Echo questions, had better, Hedging with would, Indirect questions, Phrasal verb separability/particles, Phrasal verbs vs formal verbs) are permanent
- [Phase ?]: 03-05: CONT-01 was deliberately NOT ticked at 4/52 — the requirement says EVERY pair; assert the closure predicate before ticking, never after (the discipline 03-02 and 03-03 had to apply in reverse)
- [Phase ?]: 03-06: writing ids are composed but UNSCHEDULED — nothing scores a writing task, so reviewableIds() was deliberately not extended and the negative is asserted instead
- [Phase ?]: 03-06: 03-05's fourth-edit rule is CONDITIONAL on the bank writing to the SRS — plans 03-07 and 03-09 must check their renderer for recordAttempt before copying it
- [Phase 03]: 03-07: reading does NOT record attempts — PassageReader has no recordAttempt, so 03-05's fourth wiring edit (reviewableIds) was deliberately NOT taken and the negative is asserted; two banks of three now
- [Phase 03]: 03-07: PassageReader was EXPORTED rather than a scenario wrapper written; onBack became optional and the article's mt-3 moved behind it, so the ReadingRoom browser function is byte-identical in the diff
- [Phase 03]: 03-07: explain and id are optional on the global ReadingQuestion and REQUIRED on ScenarioReadingQuestion — the optional pair exists only so the 18 shipped passages keep compiling
- [Phase 03]: 03-07: the PASSAGE id is the composed D-06 id (uniqueness against bare global slugs like "coffee"); a QUESTION id is a plain authored slug, unique within its passage and a key to nothing
- [Phase 03]: 03-07: CONT-01 was NOT ticked at 18/52 — the requirement says EVERY pair; assert the closure predicate before ticking, never after
- [Phase 03]: 03-09: the rehearsal task does NOT record attempts — the panel calls addSkillXp and recordActivity only, so speaking is the THIRD unscheduled kind and 03-05's fourth wiring edit was again not taken, with the negative asserted
- [Phase 03]: 03-09: the harness READS SpeakingTaskPanel.tsx and asserts no fetch, no speechSynthesis, no SpeechRecognition, no getUserMedia, no MediaRecorder and no recordAttempt — the plan's 'no AI, no microphone' promise run as a script, comments stripped first
- [Phase 03]: 03-09: a new exercise shape, because speaking had none — setup, a TUPLE of exactly three moves, one success line, every field required; the unit is 'rehearsal' so it cannot be confused with writing's 'task'
- [Phase 03]: 03-09: a mutation proved the per-id 'is exactly what scenarioItemId composes' assertion TAUTOLOGICAL (it recomposes from the localId it parsed out of the same id); it was strengthened at the source, and 03-05/06/07 carry the same hole
- [Phase 03]: 03-09: CONT-01 NOT ticked at 36/52 — the requirement says EVERY pair; 16 speaking pairs remain and are plan 03-10's
- [Phase 03]: 03-08: C1 in a reading passage is what the READER is asked to do, not how long the words are — no question is answerable by locating one sentence and copying it
- [Phase 03]: 03-08: native/idioms uses NONE of the fourteen expressions its deck and phrase set already teach, and its glossary is silent on exactly the four the questions ask her to recover
- [Phase 03]: 03-08: a passage's own promises are RUN AS A SCRIPT — the curly-quote verbatim check caught a question misquoting its own body by one capital letter, which four readings had not
- [Phase 03]: 03-08: M23 SURVIVES and was declared rather than deleted — the D-01 text assertion only fires on WHOLE-body duplication, so a single shared paragraph is not caught (WINDOWS 39)
- [Phase 03]: 03-08: a MUTATION SWEEP IN A SHARED WORKING TREE poisoned 03-09's production build with no trace in git; diagnosed from the build's own source map and repaired by rebuilding (WINDOWS 40)
- [Phase 03]: 03-08: reviewableIds() untouched for the third bank of four — PassageReader still has no recordAttempt, and the negative now covers nine passages
- [Phase 03]: CONT-01 ticked in 03-10, and only after asserting pairsWritten===52 && pairsTotal===52 && pendingPairs().length===0 in a separate command whose output was read
- [Phase 03]: Two rehearsals were reworded post-commit because scan 4 caught them echoing their OWN scenario's other exercise — byte-identity harnesses cannot see a same-page near-duplicate
- [Phase 03]: A surviving mutation can be a WEAK MUTATION rather than a weak assertion: M21 and M8-under both survived run 1, both were the mutation's fault, and M21 was kept as a declared survivor
- [Phase 03]: 03-11: the per-world phrase fallback is DELETED, not left unreachable — one strict accessor, and a harness invariant (every scenario resolves to a non-empty set) replaces it, so a Phase 4 scenario with no phrase set fails at authoring time instead of silently borrowing a neighbour's
- [Phase 03]: 03-11: WINDOWS 39, WINDOWS 41 and 03-05/06/07's tautological id assertion were CLOSED at the gate rather than assessed and left — each was a trap aimed at Phase 4, both stated blockers had expired, and each is proved by a mutation caught on its own label
- [Phase 03]: 03-11: the two design echoes found by the reader pass (Sounding Native's four-of-five same drill; three of four A2 counter tasks closing on a read-back) are RATIFIED as stated design decisions, waived in the ledger rather than carried as debt
- [Phase 03]: 03-11: CONT-01 and CONT-02 close, each annotated in the requirement with what the browser pass saw and what it did not — writing-desk typing and rehearsal ticking stay open by name rather than being rounded up
- [Phase 04]: 04-02: exactly ONE new permanent topic string spent — "Phrasal verb senses". Fixedness filed under the EXISTING "Phrasal verb separability", because the topic is about the FORM of a phrasal verb and a frozen string is a form.
- [Phase 04]: 04-02: topic sets are WRITTEN OUT in the harness, not shape-checked — a shape check cannot tell "Phrasal verb particles" from "Phrasal Verb Particles", and that is the entire failure being hunted.
- [Phase 04]: 04-02: social/small-talk measures EXACTLY ZERO slack under the three-rate session invariant and was deliberately NOT raised — zero passes by design, and raising it would contradict the rule the invariant states.
- [Phase 04]: 04-03: ALL SIX of native/idioms' phrases were retired, not a subset — four carried no tip and two carried glosses, and since the id hash covers every field, any survivor would have forced the new tip gate to be scoped around its own exceptions
- [Phase 04]: 04-03: a retirement is APPROVED BY A HUMAN FIRST and recorded with a reason written BEFORE --update runs; 'on the same page' came back under a NEW slug and as a question, because the expression was worth keeping and the item was not
- [Phase 04]: 04-03: MIN_TIP_WORDS = 12 sits in the empty band between this bank's old glosses (4-5 words) and real use notes (10+), so it is tuned to neither population; the world's tip ratio is PRINTED, never asserted, because it moves every plan
- [Phase 04]: 04-03: the four expressions native/idioms' passage withholds are WRITTEN OUT and cross-checked against the passage itself — each must occur in the body, none in the glossary, count must track the questions — so the record cannot drift from what it describes
- [Phase 04]: 04-03: never restore a mutation with 'git checkout --' while the file under test has uncommitted work; it restores from the INDEX and silently deleted the assertion group being tested. Snapshot the bytes in memory instead.
- [Phase 04]: 04-04: all EIGHT native/idioms vocabulary cards retired, approved as 'stands'. The decision was presented with a fact that did NOT carry over from 04-03's phrase retirement: five of fourteen phrases survived in the global decks, but only TWO of eight cards do — the other six existed nowhere in the corpus, so retiring them DELETED them from the product.
- [Phase 04]: 04-04: a card shape with no tip field has exactly two levers for the register mark, and both are used — the sense named in the term's parenthesis, and an example that could not be reworded to carry the other sense. That is what separates a better-selected card from a differently-canonical one.
- [Phase 04]: 04-04: the deck is COMPLEMENTARY to the warm-up, not more of it — the phrases are whole turns, the cards are chunks you drop inside a sentence you build yourself. That rule is why 42 items in one scenario do not read as one list twice.
- [Phase 04]: 04-04: FALLBACK_LESSON asserted UNREACHABLE (by reference AND by value, all 35 scenarios) rather than deleted — deleting it changes the accessor's return type and every call site. 03-11 took the opposite route for phrases.ts, so the two precedents disagree; filed as an open question rather than settled.
- [Phase 04]: 04-04: two corpus pairs above the plan's own J>=0.60 threshold were NOT fixed and NOT argued away — both are short-field artefacts (3- and 4-word denominators, zero shared teaching), filed to WINDOWS to be second-guessed, and reported beside a >=6-word view where the highest is 0.308. Change the card, never the threshold.
- [Phase 04]: 04-05: native/register's pairing is carried by ARRAY ADJACENCY and nothing else — no field records which entry pairs with which and both renderers walk the array from index 0 — so it is now ASSERTED: even length, alternation by the casual-/formal- slug prefix against the index, and nine adjacent pairs. The project's first assertion on array order as a teaching property.
- [Phase 04]: 04-05: the three checks are SEPARABLE, and a negative mutation proved it — with alternation neutered and a reversed pair appended, the adjacency assertion still fires. Adjacency is stated apart from alternation because it is the property the RENDERERS depend on, and a failure should name the broken pair rather than a broken index.
- [Phase 04]: 04-05: the register marker deck is deliberately MORE GRAMMAR THAN VOCABULARY — a full form, the agentless passive, the distancing past, nominalisation, a bare imperative — because research says register in English is carried by grammar more than by word choice, and ScenarioVocabCard holds a marker without becoming a new item type (D-01).
- [Phase 04]: 04-05: the pre-authoring corpus scan killed FOUR planned cards and THREE were markers the plan named by name (understatement, sign-off, filler — each already taught by another scenario; plus tag-question). Naming a marker in a plan does not make it free; a second scenario teaching the same unit is the D-01 failure.
- [Phase 04]: 04-05: a Jaccard scan cannot see a shared SYNTACTIC FRAME. Reading the finished 24 cards consecutively found four (over-hedge/downplay scored 0.15 on their examples while sharing an identical skeleton, adjacent on the page). The reader pass is a separate step from the scan, not a formality after it.
- [Phase 04]: 04-05: NO id retired and none re-pointed — the first plan in this phase to need no one-way-door decision, because native/register's existing six phrases and eight cards are correct and their pairing already works. Depth here is pure addition. CONT-04 NOT ticked at five of nine plans.
- [Phase ?]: 04-06: the plan's success criterion 3 (irony/sarcasm/deadpan taught for the first time) is UNMET DELIBERATELY — social/humor is titled 'Humor & sarcasm', holds deadpan/understatement/tongue-in-cheek as cards and drills sarcasm in its briefing and warm-up. Writing them in native/culture is the D-01 duplication 04-05 killed understatement for. Reported, not duplicated; 'take something at face value' holds the adjacent ground by naming the CONSEQUENCE of missing a tone.
- [Phase ?]: 04-06: the withheld-reference record now carries a 'glossed' flag, because native/culture's passage withholds three of its four references and glosses the fourth on purpose (the question turns on the possessive 'our white elephant'). The exception is asserted IN THE POSITIVE — the glossary must really define it — so the flag cannot be flipped onto a second entry to silence a failing check. A negative mutation confirmed it is load-bearing.
- [Phase ?]: 04-06: 04-05's corpus harvester silently dropped every reading passage BODY (string[] failed a typeof string guard), every GLOSSARY (wrong field names) and every reading QUESTION PROMPT. Rebuilt: 4,284 fields against 3,744. Prior plans' scans never compared against any passage body.
- [Phase ?]: 04-07: native/pronunciation is DELIBERATELY the smallest of the five - 12 phrases and 16 cards against its neighbours' 18 and 24 - and the reason is written into BOTH bank headers rather than left as an unexplained gap. Under D-01 the drills this skill needs (minimal pairs, word stress, intonation AS EXERCISES) cannot be built, so volume buys less here than anywhere else; padding it to a uniform floor would imply the five were deepened equally when they were not.
- [Phase ?]: 04-07: the plan named six contrasts and one was ALREADY TAKEN - the short/long vowel pair's draft gloss was a word-for-word PERMUTATION of the live ship-sheep.es (J=1.000, same scenario, same contrast). Killed pre-authoring; /v/-/b/ took the slot because Spanish has no /v/ and nothing in the bank covered it. Sixth consecutive plan where an item the plan named was the duplicate.
- [Phase ?]: 04-07: record-it-and-a-record ships with its own limitation in its tip - stress does not change the word the recogniser returns, so the word-level scorer is blind to exactly what that item drills. Disclosed rather than hidden, and that blind spot IS the strengthened evidence for deferred VOICE-01. T-04-15 reported partially unmet (5 of 6).
- [Phase 04]: 04-08: the container menu was PRESENTED, not taken — six priced options, and the user chose C and E. A and B (a reading passage each, ~631 words) were DECLINED on a measured ratio: 631 is 4x CONTEXT's 157.8 and the two existing native passages are already above the corpus mean. So D-01's 'more reading' is NOT delivered by Phase 4 and is recorded by name as WINDOWS 61 rather than left implicit; 'more rehearsals' is delivered in kind by E.
- [Phase 04]: 04-08: ledger 34 was fixed the OPPOSITE way to the way it predicted. Its stated fix ('import getScenarioCoverage' into WorldView) was MEASURED at +217,154 B (+52.1%, 6->9 chunks) on the /world/[slug] client bundle, because WorldView is a client component and the registry pulls in all six content banks. Derived in the server component instead: +50 B. WorldView's 'written' prop is REQUIRED, so the overclaim cannot return by omission.
- [Phase 04]: 04-08: the plan named four teaching points for the register grammar set and native/register ALREADY OWNED ALL FOUR — contractions, the agentless passive, the distancing past and hedges are live vocabulary cards in that very scenario, two are live phrases, and work/emails already has grammar questions for two. SEVENTH consecutive plan whose named item was the duplicate. The five written instead teach what nothing names: the full form as emphasis, casual ellipsis, negative inversion, the get-passive, and must as the register of written regulation.
- [Phase 04]: 04-08: my own option-C assertion was DEFECTIVE and a mutation caught it. It counted 'casual answers' against a list holding both 'm not and am not, so one question satisfied it whichever way its answer pointed. The N4 mutation ALSO failed to apply (LF anchor against a CRLF file — 04-01's recorded defect). Both fixed: answers pinned per slug, mutations built CRLF-safe from the file's own terminator, three flips caught in both directions.
- [Phase 04]: 04-08: 04-07's reported corpus size (4,523 baseline / 4,565) does not reproduce. 04-06's rebuilt harvester measures 4,410 on the same tree, and the figure is arithmetically exact against independently counted banks (720 phrase fields = 2x264 + 192 tipped; 1,056 vocab = 3x352). A reporting error in that summary, not a harvester defect — every population is non-empty.
- [Phase 04]: 04-09 gate: CONT-04 marked [~] met-with-a-stated-limitation, NOT [x] — content complete, derived and gated, but the browser pass was never driven and ten items are named unobserved
- [Phase 04]: 04-09: 17 of 17 mutations CAUGHT on their own labels with 2 controls green, run in a scratch export with its own node_modules; every verdict required a landing proof and a parse check
- [Phase 04]: 04-09: a PARTICLE IS NOT A STOPWORD in Sounding Native — a conventional stoplist scored catch-up against catch-on at J=1.000, deleting the unit phrasal-verbs teaches
- [Phase 04]: 04-09: corpus size settled by measurement at four commits — 4,410 at 04-07's own tree, 4,440 at HEAD; 04-07's 4,523/4,565 does not reproduce and the broken harvester now throws
- [Phase 04]: 04-09: the state.* defect consolidated into WINDOWS 66 with its root cause after seventeen consecutive occurrences, superseding 45/50/51/60
- [Phase 04.1]: 04.1-02: the payload gate now measures the STORAGE set (reviewableIds + coreVocabIds), not the queue set — 04.1 is the first time the two differ, and a 40% stop line stands beside the route's hard cap
- [Phase 04.1]: 04.1-02: verify-id-stability.mts holds TWO key spaces, routed by prefix to each id's own parser; the scenario branch is unqualified and a malformed id of either space still fails
- [Phase ?]: The near-duplicate scan runs BEFORE the fixture regeneration: content is not final until the scan has rewritten, and --update runs exactly once after that
- [Phase ?]: The gloss is the FRONT of a recall card, so near-synonyms carry deliberately separated glosses (tell/say, leave/let, meet/know, love/want, job/work, believe/think)
- [Phase ?]: here (NGSL 98) is skipped as a deictic pro-form, pairing it with there (40); temporal and frequency adverbs remain carded

### Pending Todos

- Phase 01 was signed off by an agent-driven browser session, not by a human.
  Subjective quality (rubric wording, model-answer naturalness, exam feel) and a
  full real-time 27-minute timer run are still unconfirmed — worth a pass from
  the beta user before her exam. See 01-06-SUMMARY.md "Caveats".

- 02.1-01: **the Speaking phone pass is owed** — no device was available at the
  checkpoint. The `MediaRecorder` container probe (`isTypeSupported` falling
  WebM → MP4) exists precisely for Safari before 18.4, which supports MP4 only,
  and that is the one browser family nobody has run it on. Plan 12's phase gate
  owns it.

- 02.1-01: microphone release-on-stop is **code-verified, not observed** — the
  checkpoint used a synthetic AudioContext stream, whose track lifecycle is not
  the OS recording indicator. Worth one real-device glance in plan 12.

### Blockers/Concerns

- Brownfield fragility (see .planning/codebase/CONCERNS.md): progress PUT is unvalidated and fire-and-forget; JSON.parse on stored progress can throw — addressed by Phase 2
- IP constraint (Phase 1): third-party CELPIP study material is format reference only — no text may be copied into the app; Celpip.zip is gitignored
- Startup runs `prisma db push --accept-data-loss`; any schema change in Phase 1 must be additive or first migrate to proper Prisma migrations
- Phase 5 needs `ANTHROPIC_API_KEY` configured in Coolify production env (user action) to leave stub mode
- Zero automated tests exist — phases should include targeted verification for what they touch
- 02.1-04: nobody has HEARD the audio check — no browser, no phone, no speaker. Chrome's ~15s utterance truncation (the reason speaker-turn chunking exists) and the iPhone silent-switch path are both untested on a device. AudioCheck is not mounted by any route until plan 05, so this cannot close before then. Owed to 02.1-12; WINDOWS.md id 8.
- 02.1-05: nobody has HEARD the Listening runner or clicked through it — no browser, no phone, no speaker. Playback of a real 226-word twelve-turn script, the onCompleted handoff that reveals the questions, the one-at-a-time flow, submit, and the attempt reaching the account are all unobserved. Chrome's ~15s truncation and the iPhone silent switch remain untested on a device. Owed to 02.1-12; WINDOWS.md ids 8, 10, 11.
- Phase 2.1 cannot be closed until the browser/phone pass runs: six ROADMAP criteria and ~20 WINDOWS.md entries depend on it. Checklist in 02.1-12-SUMMARY.md
- 04.1-01 task 3 is a BLOCKING human checkpoint and is outstanding: /core-vocabulary must be opened in a browser, a card rated, the page reloaded, and the three /review numbers confirmed unmoved, before any requirement of plan 01 is marked complete or plan 03 authors more ids.

### Roadmap Evolution

- Phase 1 inserted after Phase 0: CELPIP Writing Practice inserted as new Phase 1 (beta user has exam date); former phases 1-4 renumbered to 2-5 before any planning/execution (URGENT)
- Phase 04.1 inserted after Phase 4: Vocabulary Volume Deck - 500 NGSL cards in a second key space (vocab:<slug>); beta user says the app is too basic, measured at ~280 vocabulary cards vs a 2000-word beginner target (URGENT)

## Deferred Items

Items acknowledged and carried forward:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Launch | Stripe live mode, custom domain, security hardening (LAUNCH-01..04) | Backlog (v2) | 2026-07-23 |
| Extras | Premium voice, normalized progress schema (VOICE-01, DATA-01) | Backlog (v2) | 2026-07-23 |
| Quality | Automated test suite (TEST-01) | Backlog (v2) | 2026-07-23 |

## Session Continuity

Last session: 2026-08-05T01:00:36.835Z
Stopped at: Completed 04.1-03-PLAN.md
Resume file: None
