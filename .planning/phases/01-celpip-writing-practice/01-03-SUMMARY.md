---
phase: 01-celpip-writing-practice
plan: 03
subsystem: content
tags: [content-authoring, celpip, typescript]

# Dependency graph
requires:
  - phase: 01-01
    provides: "CelpipWritingTask type contract, SURVEY_TASKS seed entry, EMAIL_TASKS/SURVEY_TASKS assembly in celpip.ts"
provides:
  - "SURVEY_TASKS with 9 original Task 2 (survey/opinion) entries covering community, transit, workplace, and services themes"
affects: [01-04-timer-rubric-checklist, 01-05-celpip-landing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content-only extension of an existing typed array — no type, storage, or route changes; matches the plan's pure-authoring scope"

key-files:
  created: []
  modified:
    - src/lib/celpip/tasks-survey.ts

key-decisions:
  - "Landed SURVEY_TASKS at 9 total (seed + 8) rather than exactly 8, since the plan's own target was '~8' with an explicit 7-9 acceptance range and 4+4 new entries split cleanly across the two authoring tasks."

patterns-established: []

requirements-completed: [CELPIP-01]

coverage:
  - id: D1
    description: "SURVEY_TASKS holds 9 original Task 2 survey entries (seed + 8 new), each with a scenario, a two-element options tuple, a 26-minute limit, a 150-200 word range, an original model answer, and original strategy tips"
    requirement: "CELPIP-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit -p tsconfig.json (exit 0)"
        status: pass
      - kind: other
        ref: "npm run build (exit 0, /celpip and /celpip/writing/[taskId] routes generated)"
        status: pass
      - kind: other
        ref: "node word-count script over all 9 modelAnswer template literals: 171,177,184,177,177,180,172,167,174 words — all within 150-200"
        status: pass
      - kind: other
        ref: "grep -rniE \"IELTS.?.?PTE.?with.?Viv\" src/lib/celpip | wc -l (result: 0)"
        status: pass
      - kind: other
        ref: "node id-uniqueness script across EMAIL_TASKS + SURVEY_TASKS (17 ids, 0 duplicates)"
        status: pass
    human_judgment: true
    rationale: "IP-originality (no text copied from third-party study material) and Canadian-register naturalness are content-quality judgments a human reviewer should confirm by reading the prose, even though the mechanical checks (grep, word count, types, build) all pass."

# Metrics
duration: ~15min
completed: 2026-07-25
status: complete
---

# Phase 1 Plan 3: CELPIP Task 2 Survey Bank Summary

**Extended SURVEY_TASKS from 1 seed to 9 original survey/opinion prompts spanning community spending, transit, remote work, workplace policy, and services themes, each with a 150-200 word original model answer and strategy tips.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-25
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Authored `survey-02` (park vs library town budget), `survey-03` (transit vs road funding), `survey-04` (remote vs in-office workplace policy), and `survey-05` (sports complex vs cultural centre grant) — 4 original Task 2 entries, each with a two-element `options` tuple, `timeLimitMinutes: 26`, `wordRange { min: 150, max: 200 }`.
- Authored `survey-06` (four-day week vs flexible hours), `survey-07` (self-checkout vs staffed lanes), `survey-08` (online vs in-person training), and `survey-09` (scheduling app vs paper sign-up) — 4 more original entries, bringing `SURVEY_TASKS` to 9 total (seed + 8).
- Every model answer is an original 150-200 word survey response (paraphrase + thesis intro, two body paragraphs each idea → explain → example, complex-sentence conclusion) — written from the exam format only, with distinct original strategy tips per task, each committing clearly to one of the two options.
- Verified all 17 ids across `EMAIL_TASKS` + `SURVEY_TASKS` are unique, `npm run build` and `npx tsc --noEmit` both exit 0, and the third-party academy name grep returns 0 hits under `src/lib/celpip`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author 4 community & lifestyle survey tasks** - `c3f3abc` (feat)
2. **Task 2: Author 4 work & services survey tasks, reach 9 total** - `9b47501` (feat)

## Files Created/Modified

- `src/lib/celpip/tasks-survey.ts` - `SURVEY_TASKS` grown from 1 seed entry to 9 original Task 2 (survey/opinion) entries

## Decisions Made

- Wrote all 8 new entries across both tasks so `SURVEY_TASKS` reaches exactly 9 total (seed + 4 + 4), landing at the top of the plan's stated 7-9 acceptance range rather than exactly 8, since "~8" and "3-4 more" both permit this count and the even 4/4 split across the two authoring tasks kept each task's scope balanced.

## Deviations from Plan

None - plan executed exactly as written. Both authoring tasks were completed as single edits to the file (rather than plan 02's staged-truncation approach) since each task's new entries were appended cleanly after the prior commit's content, with no need to temporarily hide already-committed text.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `SURVEY_TASKS` is fully seeded at 9 original entries; combined with `EMAIL_TASKS` (8 entries) the app now exposes 17 unique CELPIP writing tasks.
- No changes to `celpip.ts` types, `celpip-progress.ts`, routes, or `WritingSimulator.tsx` were needed — this was pure content authoring against the existing contract.
- No blockers. `npm run build` exits 0 with both `/celpip` and `/celpip/writing/[taskId]` routes still generating correctly with the larger task bank.

---
*Phase: 01-celpip-writing-practice*
*Completed: 2026-07-25*

## Self-Check: PASSED

- FOUND: src/lib/celpip/tasks-survey.ts
- FOUND: .planning/phases/01-celpip-writing-practice/01-03-SUMMARY.md
- FOUND commit: c3f3abc
- FOUND commit: 9b47501
