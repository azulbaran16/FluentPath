---
phase: 01-celpip-writing-practice
plan: 02
subsystem: content
tags: [content-authoring, celpip, typescript]

# Dependency graph
requires:
  - phase: 01-01
    provides: "CelpipWritingTask type contract, EMAIL_TASKS seed entry, EMAIL_TASKS/SURVEY_TASKS assembly in celpip.ts"
provides:
  - "EMAIL_TASKS with 8 original Task 1 (formal email) entries covering workplace, services, housing, and community themes"
affects: [01-03-tasks-survey-bank, 01-04-timer-rubric-checklist, 01-05-celpip-landing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content-only extension of an existing typed array — no type, storage, or route changes; matches the plan's pure-authoring scope"

key-files:
  created: []
  modified:
    - src/lib/celpip/tasks-email.ts

key-decisions:
  - "Split the plan's two authoring tasks into two atomic commits even though both touch the same file, by staging an intermediate file state (seed + email-02..05) before appending email-06..08, preserving one-commit-per-task traceability."

patterns-established: []

requirements-completed: [CELPIP-01]

coverage:
  - id: D1
    description: "EMAIL_TASKS holds 8 original Task 1 formal-email entries (seed + 7 new), each with a scenario, exactly 3 bullets, a 27-minute limit, a 150-200 word range, an original model answer, and original strategy tips"
    requirement: "CELPIP-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit -p tsconfig.json (exit 0)"
        status: pass
      - kind: other
        ref: "npm run build (exit 0, /celpip and /celpip/writing/[taskId] routes generated)"
        status: pass
      - kind: other
        ref: "node word-count script over all 8 modelAnswer template literals: 161,160,168,172,177,174,175,177 words — all within 150-200"
        status: pass
      - kind: other
        ref: "grep -rniE \"IELTS.?.?PTE.?with.?Viv\" src/lib/celpip | wc -l (result: 0)"
        status: pass
      - kind: other
        ref: "node id-uniqueness script across EMAIL_TASKS + SURVEY_TASKS (9 ids, 0 duplicates)"
        status: pass
    human_judgment: true
    rationale: "IP-originality (no text copied from third-party study material) and Canadian-register naturalness are content-quality judgments a human reviewer should confirm by reading the prose, even though the mechanical checks (grep, word count, types, build) all pass."

# Metrics
duration: ~10min
completed: 2026-07-25
status: complete
---

# Phase 1 Plan 2: CELPIP Task 1 Email Bank Summary

**Extended EMAIL_TASKS from 1 seed to 8 original formal-email prompts spanning workplace, services, housing, and community themes, each with a 150-200 word original model answer and strategy tips.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-07-25T17:44:44Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Authored `email-02` (workplace schedule-change request), `email-03` (internet provider billing/service issue), `email-04` (HR employment-letter request), and `email-05` (dental appointment reschedule) — 4 original Task 1 entries, each with 3 bullets, `timeLimitMinutes: 27`, `wordRange { min: 150, max: 200 }`.
- Authored `email-06` (landlord furnace repair), `email-07` (condo board parking dispute), and `email-08` (child's teacher meeting request) — 3 more original entries, bringing `EMAIL_TASKS` to 8 total (seed + 7).
- Every model answer is an original 150-200 word formal email (greeting, purpose-first opening, one paragraph per bullet, context-referencing close, formal sign-off) — written from the exam format only, with distinct original strategy tips per task.
- Verified all 9 ids across `EMAIL_TASKS` + `SURVEY_TASKS` are unique, `npm run build` and `npx tsc --noEmit` both exit 0, and the third-party academy name grep returns 0 hits under `src/lib/celpip`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author 4 workplace & services email tasks** - `80f1faa` (feat)
2. **Task 2: Author 3 housing & community email tasks, reach 8 total** - `32d4cc5` (feat)

## Files Created/Modified

- `src/lib/celpip/tasks-email.ts` - `EMAIL_TASKS` grown from 1 seed entry to 8 original Task 1 (formal email) entries

## Decisions Made

- Authored all 7 new entries in one editing pass for consistency of voice and format, then split the commit into two atomic task commits by temporarily truncating the file to the Task 1 batch (`email-02`..`email-05`), committing, and then re-appending the Task 2 batch (`email-06`..`email-08`) for a second commit — preserving the plan's per-task commit granularity without duplicating authored content.

## Deviations from Plan

None - plan executed exactly as written. The plan's own target range ("3-4 more to reach ~8 total") was resolved as exactly 3 (`email-06`..`email-08`), landing `EMAIL_TASKS` at precisely 8 total (seed + 4 + 3), matching the phase's "~8" target.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `EMAIL_TASKS` is fully seeded at 8 original entries; plan 01-03 can independently grow `SURVEY_TASKS` to ~8 using the same pattern.
- No changes to `celpip.ts` types, `celpip-progress.ts`, routes, or `WritingSimulator.tsx` were needed — this was pure content authoring against the existing contract.
- No blockers. `npm run build` exits 0 with both `/celpip` and `/celpip/writing/[taskId]` routes still generating correctly with the larger task bank.

---
*Phase: 01-celpip-writing-practice*
*Completed: 2026-07-25*

## Self-Check: PASSED

- FOUND: src/lib/celpip/tasks-email.ts
- FOUND: .planning/phases/01-celpip-writing-practice/01-02-SUMMARY.md
- FOUND commit: 80f1faa
- FOUND commit: 32d4cc5
