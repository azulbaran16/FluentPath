---
phase: 01-celpip-writing-practice
plan: 01
subsystem: ui
tags: [nextjs-app-router, react, typescript, localstorage, celpip]

# Dependency graph
requires: []
provides:
  - "src/lib/celpip.ts single-source-of-truth data module (types, CELPIP_TASKS, CELPIP_TASK_META, getTask, getTasksByType)"
  - "src/lib/celpip/tasks-email.ts and tasks-survey.ts seed task banks (1 task each)"
  - "src/lib/celpip/rubric.ts seed self-eval rubric (4 dimensions x email/survey)"
  - "src/lib/celpip-progress.ts local-first attempt store under fluentpath.celpip.v1 (useCelpipProgress hook)"
  - "/celpip landing route and /celpip/writing/[taskId] dynamic simulator route under (catalog)"
  - "WritingSimulator client component: compose -> submit -> results flow"
affects: [01-02-tasks-email-bank, 01-03-tasks-survey-bank, 01-04-timer-rubric-checklist, 01-05-celpip-landing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Typed static content module mirroring curriculum.ts (flat array + getX lookup helpers)"
    - "Local-first localStorage store mirroring progress.ts (readLocal/writeLocal try/catch + persist() wrapper), with no server-sync branch"
    - "generateStaticParams + async params + notFound() + delegate-to-client-component route pattern under the (catalog) route group"
    - "Expansion-seam comments in WritingSimulator marking where Timer, autosave, and RubricChecklist attach in plan 04"

key-files:
  created:
    - src/lib/celpip.ts
    - src/lib/celpip/tasks-email.ts
    - src/lib/celpip/tasks-survey.ts
    - src/lib/celpip/rubric.ts
    - src/lib/celpip-progress.ts
    - src/app/(catalog)/celpip/page.tsx
    - src/app/(catalog)/celpip/writing/[taskId]/page.tsx
    - src/components/celpip/WritingSimulator.tsx
  modified: []

key-decisions:
  - "WritingSimulator models the pre-start state as mode === null (not a separate phase value) rather than adding a third phase literal, keeping phase strictly 'compose' | 'results' per the plan's type contract while still supporting the two-button start screen."
  - "Results view ships with only Retry / Back to tasks actions (per this plan's explicit action text) — 'Next task' from UI-SPEC's fuller action list is deferred to plan 05 once the landing/catalog navigation exists to route to."
  - "CelpipAttempt.durationSeconds is measured from a startedAt timestamp captured when the learner clicks Start Timed Attempt / Start Practice, since the Timer component itself is an explicit plan-04 expansion seam in this tracer."

patterns-established:
  - "Pattern 1: CELPIP content modules (celpip.ts + celpip/*.ts) follow curriculum.ts's header-comment + typed-array + lookup-helper shape exactly, so later plans extend arrays without touching the shape."
  - "Pattern 2: CELPIP progress (celpip-progress.ts) is a stripped copy of progress.ts's local-first skeleton (SSR guard, try/catch read/write, persist() wrapper) with the server-sync branch entirely removed, matching the phase's 'no server persistence yet' constraint."

requirements-completed: [CELPIP-02, CELPIP-03, CELPIP-04]

coverage:
  - id: D1
    description: "Learner can open /celpip (free, no account) and follow a link into /celpip/writing/[taskId] for a seeded original task"
    requirement: "CELPIP-02"
    verification:
      - kind: automated_ui
        ref: "npm run build (generates /celpip and /celpip/writing/[taskId] routes)"
        status: pass
    human_judgment: true
    rationale: "Build output proves the routes compile and statically resolve, but visually confirming the landing renders links and the simulator route opens correctly needs a human look at the running app."
  - id: D2
    description: "Simulator renders scenario + bullets/options, a plain textarea, and a live 3-state word counter"
    requirement: "CELPIP-03"
    verification: []
    human_judgment: true
    rationale: "No automated UI test exists in this phase (zero test suite per PROJECT.md); word-counter color/state transitions need visual/interactive confirmation."
  - id: D3
    description: "Submitting shows user text beside the model answer and records an attempt in localStorage under fluentpath.celpip.v1"
    requirement: "CELPIP-04"
    verification:
      - kind: other
        ref: "node -e check confirming celpip-progress.ts contains the literal key 'fluentpath.celpip.v1'"
        status: pass
    human_judgment: true
    rationale: "Static key-presence check proves the constant is wired, but confirming an attempt actually persists across a reload requires an interactive browser check."
  - id: D4
    description: "Corrupted fluentpath.celpip.v1 data loads as a safe empty default instead of crashing"
    verification: []
    human_judgment: true
    rationale: "No automated test forces a JSON.parse failure against the try/catch fallback in this phase; behavior mirrors progress.ts's proven pattern but is unverified by an executed test."
  - id: D5
    description: "npm run build and npm run lint both exit 0; no raw-HTML injection API in src/components/celpip or src/app/(catalog)/celpip"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "npm run lint"
        status: pass
      - kind: other
        ref: "grep -rn dangerouslySetInnerHTML src/components/celpip src/app/(catalog)/celpip (count 0)"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-25
status: complete
---

# Phase 1 Plan 1: CELPIP Writing Tracer Summary

**End-to-end CELPIP Writing tracer: one seeded email task + one seeded survey task flow through celpip.ts data, a fluentpath.celpip.v1 localStorage store, /celpip and /celpip/writing/[taskId] routes, and a WritingSimulator client component that persists a real attempt on submit.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-25T17:35:35Z
- **Tasks:** 1 (tracer)
- **Files modified:** 8 (all new)

## Accomplishments

- Typed content module `src/lib/celpip.ts` following the `curriculum.ts` single-source-of-truth pattern, with `CelpipTaskType`, `CelpipWordRange`, `CelpipRubricItem`, `CelpipRubricDimension`, `CelpipRubric`, `CelpipWritingTask`, `CELPIP_TASK_META`, `CELPIP_TASKS`, `getTask`, `getTasksByType`.
- One original seed task each for Task 1 (email, `email-noise-complaint`, 27 min, 150–200 words) and Task 2 (survey, `survey-transit-vs-parking`, 26 min, 150–200 words), plus a seed 4-dimension self-eval rubric with distinct email/survey items (salutation/closing for email; thesis/other-option for survey).
- `src/lib/celpip-progress.ts`: local-first store under `fluentpath.celpip.v1` with SSR-safe defensive `readLocal`/`writeLocal`, `useCelpipProgress()` hook exposing `addAttempt`, `saveDraft`, `draftFor`, `attemptsForTask`, `lastAttempt`, `completedTasks`.
- `/celpip` minimal landing (plan 05 owns the full version) and `/celpip/writing/[taskId]` dynamic route under `(catalog)`, with `generateStaticParams`, async `params`, `notFound()` guard, and `JsonLd` structured data.
- `WritingSimulator` client component: pre-start screen (Start Timed Attempt / Start Practice), compose screen (scenario/bullets/options, textarea, 3-state word counter), results screen (side-by-side scrollable user-text/model-answer panels, Retry / Back to tasks), submitting a real `CelpipAttempt` via `addAttempt`.

## Task Commits

Task committed atomically:

1. **Task 1: End-to-end writing slice — one task, data→storage→route→simulator→results→persist** - `0a3a7c3` (feat)

_This tracer plan has one task by design — proving the whole path in a single reviewable commit before any later plan expands horizontally._

## Files Created/Modified

- `src/lib/celpip.ts` - Types, `CELPIP_TASK_META`, `CELPIP_TASKS` assembly, `getTask`/`getTasksByType`, re-exports `CELPIP_RUBRIC`
- `src/lib/celpip/tasks-email.ts` - `EMAIL_TASKS` (1 original seed task)
- `src/lib/celpip/tasks-survey.ts` - `SURVEY_TASKS` (1 original seed task)
- `src/lib/celpip/rubric.ts` - `CELPIP_RUBRIC` seed (4 dimensions × email/survey)
- `src/lib/celpip-progress.ts` - `CelpipAttempt`, `CelpipProgressState`, `CELPIP_EMPTY`, `useCelpipProgress()`
- `src/app/(catalog)/celpip/page.tsx` - Minimal landing listing seeded tasks as links
- `src/app/(catalog)/celpip/writing/[taskId]/page.tsx` - Dynamic simulator route (`generateStaticParams`, `notFound`, `JsonLd`)
- `src/components/celpip/WritingSimulator.tsx` - Client simulator: compose → submit → results, persists attempt

## Decisions Made

- Modeled the pre-start screen via `mode === null` rather than a third `phase` value, to keep `phase: "compose" | "results"` exactly as specified while still supporting the two equal-weight start buttons before composing begins.
- Kept results-view actions to Retry / Back to tasks only (per this plan's explicit action text); "Next task" navigation is deferred to plan 05 once the full catalog/tabs exist to route between tasks.
- `durationSeconds` is derived from a `startedAt` timestamp set when the learner picks a mode, since the Timer UI itself is an explicit plan-04 expansion seam — the tracer still records a real, non-zero duration without building the countdown yet.

## Deviations from Plan

None - plan executed exactly as written. The `mode === null` pre-start state is a direct, literal implementation of "Before compose starts, show two equal-weight buttons" using the `mode: "timed" | "practice"` state the plan already specifies (not a new type or field), so it is not tracked as a deviation.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Data, storage, and route/component wiring are proven end-to-end; plans 02–03 can add ~7 more tasks each to `EMAIL_TASKS`/`SURVEY_TASKS` without touching the assembly logic.
- Plan 04 has three clearly marked expansion seams in `WritingSimulator.tsx` (Timer, autosave-interval, RubricChecklist) plus the already-seeded `CELPIP_RUBRIC` to wire up.
- Plan 05 can replace the minimal `/celpip` landing with tabs, `TaskCard`, and attempt history once more tasks exist; the "Next task" action can be added there.
- No blockers. `npm run build` and `npm run lint` both exit 0 with the new routes listed in the build output.

---
*Phase: 01-celpip-writing-practice*
*Completed: 2026-07-25*
