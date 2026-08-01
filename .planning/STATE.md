---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 03
current_phase_name: every-scenario-practicable
status: in-progress
stopped_at: "03-08 complete on main. Reading CLOSED at 9 of 9: the four C1 passages (social/humor, academic/articles, native/idioms, native/culture) are written and pendingPairs() returns zero reading pairs (16 remain, all speaking). 1,201 body words, 16 questions, 16 explanations, 3,318 authored words. C1 made out of inference, not word length. Ran the content's own promises as a script and caught a question misquoting its own body by one capital letter. reviewableIds untouched for the third bank of four; exactly one file modified. verify-scenario-content 6815 -> 7313 (+188 measured as this plan's); all other harnesses held; tsc/lint/build 0; deps 11 + 11. 32 declared = 32 executed, 22 caught with expected labels, 1 DECLARED GAP (M23: the D-01 text assertion only fires on whole-body duplication - WINDOWS 39), 6 controls, 3 refusals. THIS PLAN'S SWEEP POISONED 03-09'S BUILD (M21 baked into .next with no trace in git); diagnosed from the build's source map and repaired by rebuilding - WINDOWS 40. Observed served: all four render their own passage, /skill/reading reads 9 of 9 with zero pending badges. Port 3000 left free. CONT-01 NOT ticked (36/52). Next is 03-10."
last_updated: "2026-08-01T06:18:00.253Z"
last_activity: 2026-08-01
last_activity_desc: "03-08 executed: reading CLOSED at 9 of 9. The four C1 passages — social/humor, academic/articles, native/idioms and native/culture — are written, so every scenario that declares reading now opens into a text chosen for it with a key that explains itself, and pendingPairs() returns zero reading pairs (16 remain, all speaking, all 03-10s). 1,201 body words across 15 paragraphs, 16 questions, 64 options, 16 explanations, 16 glossary entries — 3,318 authored words, 300.3 body words per pair against 03-07s 204.8, which is the C1 load the plan said it was buying. C1 WAS MADE OUT OF INFERENCE RATHER THAN VOCABULARY LENGTH, stated in the form that can be checked: no question is answerable by locating one sentence and copying it. Humor is a deadpan essay whose literal surface is praise and whose meaning is an eleven-year complaint, with three of four questions turning on tone; articles is a four-paragraph argument with an honest concession and a turn, one question about the STRUCTURE and one about a conclusion the passage supports and never states; idioms uses NONE of the fourteen expressions its deck and phrase set already teach and its glossary is silent on exactly the four the questions ask her to recover; culture is a letter whose references are each insured by the sentence beside them, with the required inference question testing that recovery route rather than the cultural knowledge. THE CONTENT RAN ITS OWN PROMISES AS A SCRIPT and it caught one: a question quoted its own body as it is a white elephant when the sentence begins It is — one capital letter, invisible to four readings, and a question that misquotes its own text teaches the learner the quotation marks are decorative. Two explanations were also corrected before the first commit, one overreaching about six weeks the passage never claims and two referring to options by position. reviewableIds() untouched for the THIRD bank of four: PassageReader still has no recordAttempt, so the negative now covers nine passages; review-items.ts needed no edit, and this plan modified exactly ONE file. verify-scenario-content 6815 → 7313, of which +188 is measured as this plans by removing the passages and re-running; every other harness held at 25647, 309, 648, 50, 173, 24 and 43, tsc/lint/build exit 0, dependencies 11 + 11. Every gate counts READING pending pairs alone and no global total is asserted anywhere, which is the wave-8 convention: the printed 36/52 is 36 only because 03-09 merged first. 32 declared = 32 EXECUTED in the mutation sweep, 22 caught each with its expected label, 6 controls survived, 3 applier refusals. TWO FINDINGS WORTH THE SWEEP. First, M23 SURVIVES: the D-01 assertion that claims no passage text is repeated fingerprints the joined body, so a passage borrowing ONE paragraph from another scenario is not caught; it was declared as an expected survivor rather than deleted, the corpus was proved clean out of band at 0 exact reuse and 0 above J=0.5 over 426 cross-scenario paragraph pairs, and the one-assertion fix is WINDOWS 39, left for the plan that owns the harness because 03-09 held uncommitted work in that same file. Second and worse, THIS PLANS MUTATION SWEEP POISONED 03-09s PRODUCTION BUILD: they ran npm run build while M21 was applied, the sweep restored the file byte-for-byte and verified its sha256 so git was clean, and .next kept the mutation — every scenario page served The Man Who Mows at Seven and the minifier had dropped eight of the nine passages as unreachable. Caught by curling four pages and seeing one title four times, diagnosed from the builds own SOURCE MAP after the stale-build hypothesis was tested and discarded, and repaired by rebuilding from the clean tree with all nine slugs verified present in the emitted JS. 03-09s own observation is unaffected because it is about speaking, which no mutation touched. Recorded as WINDOWS 40: a mutation sweep in a shared working tree can poison a parallel plans build in either direction with no trace in git. Observed on a served production build afterwards: all four pairs render their own passage with the C1 badge, glossary and Check answers, travel/restaurant renders its own A2 text again, and /skill/reading reads 9 of the 9 scenarios with zero pending badges — all derived. Port 3000 left with no listener and curl to it refused. Nobody has pressed Check answers, so the sixteen new explanations are unseen (WINDOWS 37). CONT-01 was NOT ticked at 36/52. Next is 03-10, the last sixteen speaking pairs."
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 36
  completed_plans: 34
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-23)

**Core value:** A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.
**Current focus:** Phase 03 — every-scenario-practicable (executing, plan 09 of 11 complete)

## Current Position

Phase: 03 (every-scenario-practicable) — IN PROGRESS
Plan: 9 of 11 complete
Status: 03-06 complete on `main`. **CONT-02 stays closed; CONT-01's writing quarter closes.** All
nine scenario×skill pairs that declare writing — `work/emails`, `travel/hotel`,
`practical/tech-support`, `social/complaining`, `work/presentations`, `work/networking`,
`academic/summaries`, `academic/debate`, `native/register` — now have a brief written for their own
situation, with a checklist and an original model answer, so coverage reads
**35/35 scenarios with phrases · 35/35 with vocabulary · 13/52 pairs written · 39 pending**
(speaking 30, reading 9, **grammar 0, writing 0**). `WritingDesk`'s only change is that it hides its
prompt picker below two prompts, so a scenario's single task reads as a task rather than as a menu
of one. **A writing id is composed but UNSCHEDULED**: nothing scores a writing task, so
`reviewableIds()` was deliberately NOT extended and the negative is asserted instead — 03-05's
four-edit rule is *conditional* on the bank writing to the SRS, and plans 03-07 and 03-09 must check
their own renderer for `recordAttempt` before copying it. **`CONT-01` is NOT ticked in
REQUIREMENTS.md** and must not be until 52/52; the requirement says *every* pair. `getPhrases` and
its `WORLD_FALLBACK` still exist in `phrases.ts` and are still dead for scenario pages; **plan 03-11
deletes them**. Next action is executing 03-07 (reading). **The exported surface plans 07–11 depend
on is recorded in `03-01-SUMMARY.md`; the authoring rules and the duplicate-scan method in
`03-03-SUMMARY.md`; `03-05-SUMMARY.md` §1 is the wiring recipe; and `03-06-SUMMARY.md` §1 is the
caveat on its fourth edit.** Read the summaries, not the plans.
Last activity: 2026-08-01 — 03-08 executed: reading CLOSED at 9 of 9. The four C1 passages — social/humor, academic/articles, native/idioms and native/culture — are written, so every scenario that declares reading now opens into a text chosen for it with a key that explains itself, and pendingPairs() returns zero reading pairs (16 remain, all speaking, all 03-10s). 1,201 body words across 15 paragraphs, 16 questions, 64 options, 16 explanations, 16 glossary entries — 3,318 authored words, 300.3 body words per pair against 03-07s 204.8, which is the C1 load the plan said it was buying. C1 WAS MADE OUT OF INFERENCE RATHER THAN VOCABULARY LENGTH, stated in the form that can be checked: no question is answerable by locating one sentence and copying it. Humor is a deadpan essay whose literal surface is praise and whose meaning is an eleven-year complaint, with three of four questions turning on tone; articles is a four-paragraph argument with an honest concession and a turn, one question about the STRUCTURE and one about a conclusion the passage supports and never states; idioms uses NONE of the fourteen expressions its deck and phrase set already teach and its glossary is silent on exactly the four the questions ask her to recover; culture is a letter whose references are each insured by the sentence beside them, with the required inference question testing that recovery route rather than the cultural knowledge. THE CONTENT RAN ITS OWN PROMISES AS A SCRIPT and it caught one: a question quoted its own body as it is a white elephant when the sentence begins It is — one capital letter, invisible to four readings, and a question that misquotes its own text teaches the learner the quotation marks are decorative. Two explanations were also corrected before the first commit, one overreaching about six weeks the passage never claims and two referring to options by position. reviewableIds() untouched for the THIRD bank of four: PassageReader still has no recordAttempt, so the negative now covers nine passages; review-items.ts needed no edit, and this plan modified exactly ONE file. verify-scenario-content 6815 → 7313, of which +188 is measured as this plans by removing the passages and re-running; every other harness held at 25647, 309, 648, 50, 173, 24 and 43, tsc/lint/build exit 0, dependencies 11 + 11. Every gate counts READING pending pairs alone and no global total is asserted anywhere, which is the wave-8 convention: the printed 36/52 is 36 only because 03-09 merged first. 32 declared = 32 EXECUTED in the mutation sweep, 22 caught each with its expected label, 6 controls survived, 3 applier refusals. TWO FINDINGS WORTH THE SWEEP. First, M23 SURVIVES: the D-01 assertion that claims no passage text is repeated fingerprints the joined body, so a passage borrowing ONE paragraph from another scenario is not caught; it was declared as an expected survivor rather than deleted, the corpus was proved clean out of band at 0 exact reuse and 0 above J=0.5 over 426 cross-scenario paragraph pairs, and the one-assertion fix is WINDOWS 39, left for the plan that owns the harness because 03-09 held uncommitted work in that same file. Second and worse, THIS PLANS MUTATION SWEEP POISONED 03-09s PRODUCTION BUILD: they ran npm run build while M21 was applied, the sweep restored the file byte-for-byte and verified its sha256 so git was clean, and .next kept the mutation — every scenario page served The Man Who Mows at Seven and the minifier had dropped eight of the nine passages as unreachable. Caught by curling four pages and seeing one title four times, diagnosed from the builds own SOURCE MAP after the stale-build hypothesis was tested and discarded, and repaired by rebuilding from the clean tree with all nine slugs verified present in the emitted JS. 03-09s own observation is unaffected because it is about speaking, which no mutation touched. Recorded as WINDOWS 40: a mutation sweep in a shared working tree can poison a parallel plans build in either direction with no trace in git. Observed on a served production build afterwards: all four pairs render their own passage with the C1 badge, glossary and Check answers, travel/restaurant renders its own A2 text again, and /skill/reading reads 9 of the 9 scenarios with zero pending badges — all derived. Port 3000 left with no listener and curl to it refused. Nobody has pressed Check answers, so the sixteen new explanations are unseen (WINDOWS 37). CONT-01 was NOT ticked at 36/52. Next is 03-10, the last sixteen speaking pairs.

Progress: [█████████░] 94% (3 of 6 phases; 34 of 36 plans)

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

### Roadmap Evolution

- Phase 1 inserted after Phase 0: CELPIP Writing Practice inserted as new Phase 1 (beta user has exam date); former phases 1-4 renumbered to 2-5 before any planning/execution (URGENT)

## Deferred Items

Items acknowledged and carried forward:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Launch | Stripe live mode, custom domain, security hardening (LAUNCH-01..04) | Backlog (v2) | 2026-07-23 |
| Extras | Premium voice, normalized progress schema (VOICE-01, DATA-01) | Backlog (v2) | 2026-07-23 |
| Quality | Automated test suite (TEST-01) | Backlog (v2) | 2026-07-23 |

## Session Continuity

Last session: 2026-08-01T06:18:00.216Z
Stopped at: 03-08 complete on main. Reading CLOSED at 9 of 9: the four C1 passages (social/humor, academic/articles, native/idioms, native/culture) are written and pendingPairs() returns zero reading pairs (16 remain, all speaking). 1,201 body words, 16 questions, 16 explanations, 3,318 authored words. C1 made out of inference, not word length. Ran the content's own promises as a script and caught a question misquoting its own body by one capital letter. reviewableIds untouched for the third bank of four; exactly one file modified. verify-scenario-content 6815 -> 7313 (+188 measured as this plan's); all other harnesses held; tsc/lint/build 0; deps 11 + 11. 32 declared = 32 executed, 22 caught with expected labels, 1 DECLARED GAP (M23: the D-01 text assertion only fires on whole-body duplication - WINDOWS 39), 6 controls, 3 refusals. THIS PLAN'S SWEEP POISONED 03-09'S BUILD (M21 baked into .next with no trace in git); diagnosed from the build's source map and repaired by rebuilding - WINDOWS 40. Observed served: all four render their own passage, /skill/reading reads 9 of 9 with zero pending badges. Port 3000 left free. CONT-01 NOT ticked (36/52). Next is 03-10.
Resume file: None
