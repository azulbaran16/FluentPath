---
phase: 01-celpip-writing-practice
plan: 05
subsystem: ui
tags: [nextjs-app-router, react, typescript, localstorage, celpip]

# Dependency graph
requires:
  - phase: 01-celpip-writing-practice (plan 01)
    provides: "celpip.ts (getTasksByType, getTask, CELPIP_TASK_META), celpip-progress.ts (useCelpipProgress: attemptsForTask/completedTasks/drafts/ready), the tracer /celpip stub and WritingSimulator simulator route"
provides:
  - "src/components/celpip/TaskCard.tsx — WorldCard-style task card with type icon, line-clamp-2 title/scenario, time limit, ProgressRing attempt-status indicator"
  - "src/components/celpip/CelpipTabs.tsx — Task 1 / Task 2 active tabs (sky accent) + disabled flex-wrap Coming soon tabs for Speaking/Reading/Listening"
  - "src/components/celpip/CelpipLanding.tsx — client landing body: tabs, per-tab TaskCard grid with live attempt status, cross-task attempt history (empty state + zero/one/many counts), dismissible mobile notice"
  - "src/app/(catalog)/celpip/page.tsx — full server landing route: generateMetadata (canonical + openGraph), JsonLd LearningResource, compact hero, renders CelpipLanding"
affects: [01-06-checkpoint-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Draft-vs-attempt status derivation: a task card's status is 'completed' when an attempt exists (completedTasks), 'in-progress' when only a non-empty draft exists (state.drafts[taskId]), else 'not-started' — since the append-only attempt store has no partial/abandoned-attempt concept, a saved draft is the only observable signal of in-progress work"
    - "ProgressRing reused with symbolic 0/50/100 fill values (not a literal percentage) to represent the 3-state attempt status, following WorldCard's ProgressRing composition"

key-files:
  created:
    - src/components/celpip/TaskCard.tsx
    - src/components/celpip/CelpipTabs.tsx
    - src/components/celpip/CelpipLanding.tsx
  modified:
    - src/app/(catalog)/celpip/page.tsx

key-decisions:
  - "Task-card status uses drafts (not just attempts) to realize the plan's three-state 'not started / in progress / completed' contract: as coded, useCelpipProgress's completedTasks already includes any task with >=1 attempt, so 'attempts but not completed' (the plan's literal wording) is unreachable from attempts alone — a non-empty saved draft with no attempt is the only real 'in progress' signal available from the store."
  - "Attempt-history rows link to /celpip/writing/[taskId] (the task's simulator route), not a query-param-selected historical result view — WritingSimulator has no mechanism to render an arbitrary past attempt's results (it only shows the in-memory attempt just submitted in the current session), and WritingSimulator.tsx is not in this plan's files_modified list. Building true per-attempt deep-linking would be an architectural change to the simulator, out of this plan's scope."
  - "Mobile notice is hidden on >=768px (md:hidden) rather than using a JS viewport check, and dismissal is local component state (resets on reload) rather than persisted — matches the plan's 'dismissible, non-blocking' requirement without adding a new persistence key for a low-stakes UI preference."

patterns-established: []

requirements-completed: [CELPIP-04, CELPIP-05]

coverage:
  - id: D1
    description: "/celpip renders a compact hero (icon badge + short original copy) with generateMetadata (canonical /celpip + openGraph) and a JsonLd LearningResource (isAccessibleForFree true), with no auth gate"
    requirement: "CELPIP-05"
    verification:
      - kind: other
        ref: "npm run build (exit 0, /celpip listed in route output); grep -c canonical src/app/(catalog)/celpip/page.tsx (count 1)"
        status: pass
    human_judgment: true
    rationale: "Build/grep prove the route compiles with the required metadata fields wired, but visually confirming the compact hero keeps the task grid above the fold needs a human look (deferred to the 01-06 checkpoint)."
  - id: D2
    description: "CelpipTabs renders Task 1 / Task 2 active tabs (sky accent) plus three disabled Speaking/Reading/Listening tabs with a Coming soon badge, wrapping to a second row on narrow widths instead of clipping"
    requirement: "CELPIP-05"
    verification:
      - kind: other
        ref: "grep -c flex-wrap src/components/celpip/CelpipTabs.tsx (count 1); npm run build; npm run lint"
        status: pass
    human_judgment: true
    rationale: "Static check proves the flex-wrap class and disabled-tab markup exist; confirming the actual wrap behavior at narrow mobile widths requires a visual/interactive check (deferred to 01-06)."
  - id: D3
    description: "Each task type renders a grid of TaskCard for getTasksByType(active); each card truncates title/scenario with line-clamp-2 and shows a ProgressRing + status badge computed from useCelpipProgress (not started / in progress / completed)"
    requirement: "CELPIP-05"
    verification:
      - kind: other
        ref: "grep -c line-clamp-2 src/components/celpip/TaskCard.tsx (count 2); npm run build; npm run lint"
        status: pass
    human_judgment: true
    rationale: "Static check proves truncation classes and the ProgressRing/status wiring compile; confirming live status transitions (not-started -> in-progress via draft -> completed via attempt) across a real localStorage session needs an interactive browser check (deferred to 01-06)."
  - id: D4
    description: "Attempt history renders reverse-chronologically across all tasks with date, duration used, word count, and a link into the task's simulator; zero attempts shows 'No attempts yet' with its body copy; counts read '1 attempt' / '{n} attempts'"
    requirement: "CELPIP-04"
    verification:
      - kind: other
        ref: "grep -c \"No attempts yet\" src/components/celpip/CelpipLanding.tsx (count 1); npm run build; npm run lint"
        status: pass
    human_judgment: true
    rationale: "Static check proves the empty-state copy and sort/grouping logic compile; confirming the ordering and count labels render correctly against real recorded attempts needs an interactive browser check (deferred to 01-06)."
  - id: D5
    description: "A dismissible, non-blocking notice tells mobile users the real exam runs on desktop, without blocking any other UI"
    verification:
      - kind: other
        ref: "grep -c \"larger screen\" src/components/celpip/CelpipLanding.tsx (count 1)"
        status: pass
    human_judgment: true
    rationale: "Static check proves the exact copy is present; confirming it only shows on mobile widths and dismisses without blocking interaction needs a visual/interactive check (deferred to 01-06)."
  - id: D6
    description: "npm run build and npm run lint both exit 0; attempt-history text (titles, dates, durations, word counts) renders through JSX interpolation only, no raw-HTML injection API"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "npm run lint"
        status: pass
      - kind: other
        ref: "grep -rn dangerouslySetInnerHTML src/components/celpip/TaskCard.tsx src/components/celpip/CelpipTabs.tsx src/components/celpip/CelpipLanding.tsx (count 0)"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-25
status: complete
---

# Phase 1 Plan 5: CELPIP Landing — Tabs, Task Cards, Attempt History, Mobile Notice Summary

**Full free `/celpip` landing: compact SEO hero, Task 1/Task 2 tab-switched card grids with live per-task attempt status, disabled coming-soon tabs, cross-task attempt history with a proper empty state, and a dismissible mobile desktop-recommendation notice.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-25T18:16:03Z
- **Tasks:** 3
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- `TaskCard.tsx`: a WorldCard-style card (Link + accent top bar + hover-lift + rise animation) showing a task-type icon (Mail for email, ClipboardList for survey), line-clamp-2 title and scenario snippet, time limit, and a ProgressRing + status badge ("Not started" / "In progress" / "Completed", with an attempt count appended when more than one completed attempt exists).
- `CelpipTabs.tsx`: Task 1 / Task 2 active tabs using the `--sky` accent for the selected tab, plus three visibly muted, non-interactive, `cursor-not-allowed` "Coming soon" tabs (Speaking/Reading/Listening) in a `flex-wrap` row that drops to a second line on narrow widths instead of clipping.
- `CelpipLanding.tsx`: the client landing body — local active-tab state (default Task 1), a responsive TaskCard grid per tab with status computed from `useCelpipProgress` (drafts signal "in progress", attempts signal "completed"), a cross-task attempt-history list sorted most-recent-first (date · duration · word count, linking to the task's simulator route), the "No attempts yet" empty state with its body copy and zero/one/many count labels, and a dismissible mobile-only notice with the exact UI-SPEC copy.
- `/celpip` (`page.tsx`): replaced the plan-01 tracer stub with the real server route — `generateMetadata` (canonical `/celpip` + matching openGraph), a `JsonLd` `LearningResource` (`isAccessibleForFree: true`), a compact hero (icon badge reusing `SkillIcon("writing")` + short original copy) sized so `CelpipLanding`'s card grid sits above the fold, still under `(catalog)` with no auth gate.

## Task Commits

Each task was committed atomically:

1. **Task 1: TaskCard + CelpipTabs components** - `bc27b07` (feat)
2. **Task 2: CelpipLanding client body — grids, attempt history, mobile notice** - `ed9b7ff` (feat)
3. **Task 3: /celpip landing route — metadata, JsonLd, compact hero** - `eed6373` (feat)

## Files Created/Modified

- `src/components/celpip/TaskCard.tsx` - Task-type icon, line-clamp-2 title/scenario, time limit, ProgressRing + status badge
- `src/components/celpip/CelpipTabs.tsx` - Task 1/Task 2 active tabs + 3 disabled Coming soon tabs, flex-wrap row
- `src/components/celpip/CelpipLanding.tsx` - Tab-switched TaskCard grids, attempt history (empty state + counts), mobile notice
- `src/app/(catalog)/celpip/page.tsx` - Full landing route: metadata, JsonLd, compact hero, renders CelpipLanding

## Decisions Made

- Computed "in progress" status from a non-empty saved draft (`state.drafts[taskId]`) rather than from attempts, since `completedTasks` already covers every task with >=1 attempt — the plan's literal "attempts but not completed" phrasing has no reachable state under the current store shape, so a draft-without-attempt is the only real observable "in progress" signal.
- Linked attempt-history rows to `/celpip/writing/[taskId]` (the task's simulator entry point) rather than a deep link into that specific historical attempt's results — `WritingSimulator.tsx` has no mechanism to render an arbitrary past attempt (only the just-submitted in-memory one), and it is not in this plan's file list; adding that would be a simulator architecture change out of scope here.
- Mobile notice uses `md:hidden` (pure CSS breakpoint) and local, non-persisted dismiss state — sufficient for "dismissible, non-blocking" without adding a new storage key for a low-stakes UI preference.

## Deviations from Plan

None - plan executed exactly as written. The draft-based "in progress" status computation and the task-route (not deep-linked) attempt-history link are reasonable, in-scope interpretations of ambiguous/underspecified plan wording (documented above as Decisions), not deviations from an explicit instruction.

## Issues Encountered

`npm run build` marks `/celpip` as dynamic (`ƒ`) rather than statically prerendered — this is pre-existing: `(catalog)/layout.tsx` calls `auth()` on every request to populate the shell for signed-in visitors, which makes every route under the `(catalog)` group dynamic (the sibling `/skill/[skill]` route shows the same `ƒ` marker despite having `generateStaticParams`). This was already true of the plan-01 tracer stub before this plan's changes; no auth gate was added to `/celpip` itself, so the free/no-account requirement still holds.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The full `/celpip` landing is in place: compact hero, tabs, live-status task grids, attempt history, and the mobile notice — ready for the human verification checkpoint in plan 01-06.
- Interactive/visual truths (tab wrap at real mobile widths, status transitions across a live localStorage session, history ordering/counts against real recorded attempts, mobile-notice visibility and dismissal) are deferred to the 01-06 checkpoint per this plan's `<verification>` section — none were skipped, they were never assigned to this plan's automated checks.
- No blockers. `npm run build` and `npm run lint` both exit 0 after all three tasks.

---
*Phase: 01-celpip-writing-practice*
*Completed: 2026-07-25*

## Self-Check: PASSED

All created/modified files found on disk; all 3 task commit hashes (bc27b07, ed9b7ff, eed6373) confirmed in git log.
