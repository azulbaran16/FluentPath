---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 02.1
current_phase_name: celpip-remaining-skills
status: in-progress
stopped_at: Completed 02.1-04-PLAN.md
last_updated: "2026-07-31T08:13:51.086Z"
last_activity: 2026-07-31
last_activity_desc: "02.1-04 executed: Listening infrastructure — content types, listeningAttempts, the one speech driver, and the audio check"
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 25
  completed_plans: 17
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-23)

**Core value:** A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.
**Current focus:** Phase 02.1 — celpip-remaining-skills (executing, plans 01-04 of 12 complete)

## Current Position

Phase: 02.1 (celpip-remaining-skills) — IN PROGRESS
Plan: 5 of 12
Status: 02.1-04 complete on `main`; next action is executing 02.1-05 (the plan that makes Listening usable — 04 and 05 are one unit)
Last activity: 2026-07-31 — 02.1-04 executed: Listening infrastructure — nothing learner-visible yet, by design

Progress: [███████░░░] 68% (2 of 6 phases; 17 of 25 plans)

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

Last session: 2026-07-31T08:13:27.584Z
Stopped at: Completed 02.1-04-PLAN.md
Resume file: None
