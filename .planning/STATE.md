---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 03
current_phase_name: every-scenario-practicable
status: in-progress
stopped_at: "03-02 complete on main — D-05 is CLOSED (no surface resolves a due id through one bank; verify-merge 20146 -> 25647). Social & Everyday Life and Travel & Errands are at D-04's floors: 17/35 phrases, 13/35 vocabulary, 0/52 pairs. Next is 03-03. 18 scenarios are still on the honest warm-up panel until 03-04. The three widened review surfaces are unobserved in a browser (WINDOWS.md id 30)."
last_updated: "2026-08-01T01:18:47.946Z"
last_activity: 2026-08-01
last_activity_desc: "03-02 executed: D-05 closed, Social and Travel authored. 9 mutations"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 36
  completed_plans: 27
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-23)

**Core value:** A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.
**Current focus:** Phase 03 — every-scenario-practicable (executing, plan 02 of 11 complete)

## Current Position

Phase: 03 (every-scenario-practicable) — IN PROGRESS
Plan: 2 of 11 complete
Status: 03-02 complete on `main`. **D-05 is closed** — no surface in the app resolves a due review
id through a single bank. The Dashboard count, the ReviewHub badge, the weak-spots drill (both of
ReviewHub's sites, not one) and the mistake notebook all go through `resolveReviewItem` /
`reviewableIds`, and `verify-merge` states the algebra over scenario-shaped keys (20146 → **25647**
assertions). All of Social & Everyday Life and all of Travel & Errands are at D-04's floors, so
coverage now reads **17/35 scenarios with phrases · 13/35 with vocabulary · 0/52 pairs written · 52
pending**. Next action is executing 03-03. **The exported surface plans 03–11 depend on is recorded
in `03-01-SUMMARY.md`, and this plan's coverage numbers and merge baseline in `03-02-SUMMARY.md`** —
read the summaries, not the plans.
Last activity: 2026-08-01 — 03-02 executed: D-05 closed, Social and Travel authored. 9 mutations
caught, 4 controls survived, 2 applier refusals confirmed. The three widened review surfaces have
**not** been seen in a browser (WINDOWS.md id 30).

Progress: [████████░░] 75% (3 of 6 phases; 27 of 36 plans)

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

- **03-01: twenty-six scenarios lost their speaking warm-up on that commit, and
  the last of them does not get one back until plan 03-04.** As of 03-02 the
  number is **eighteen**, not twenty-six — the note stays open until the
  evidence below says otherwise, and the tally is updated rather than the note
  cleared. Deliberate, and the one thing in Phase 3
  that a mid-phase stop makes visibly *worse*, so it is recorded here rather than
  only in 03-01-PLAN.md, which a reader resuming mid-phase would not open.
  What happened: `ScenarioView` used to call `getPhrases`, whose per-world
  fallback hands every scenario in a world the same three generic lines — two
  scenarios receiving the identical exercise, which is exactly what D-01 was
  chosen to prevent. It now calls the strict `getScenarioPhrases`, which returns
  nothing for a scenario with no curated set, and those scenarios render an
  honest "not ready yet" panel with a link to the global speaking room instead.
  **17 of 35 scenarios have their own set today** (03-02 delivered the 17/35 it
  was scheduled to). **Plan 03-04 closes this** (03-03 to 27/35, 03-04 to
  35/35); at that point the panel is
  unreachable and `getPhrases` itself is deleted by plan 03-11. Remove this entry
  on the evidence — `COVERAGE_TOTALS.scenariosWithPhrases === 35` — not on memory.
  A temporary reduction in what is shown, for an increase in what is true.

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

Last session: 2026-08-01T01:18:42.504Z
Stopped at: 03-02 complete on main — D-05 is CLOSED (no surface resolves a due id through one bank; verify-merge 20146 -> 25647). Social & Everyday Life and Travel & Errands are at D-04's floors: 17/35 phrases, 13/35 vocabulary, 0/52 pairs. Next is 03-03. 18 scenarios are still on the honest warm-up panel until 03-04. The three widened review surfaces are unobserved in a browser (WINDOWS.md id 30).
Resume file: None
