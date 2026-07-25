---
phase: 01-celpip-writing-practice
plan: 04
subsystem: ui
tags: [react, typescript, localstorage, celpip, timer, self-eval]

# Dependency graph
requires:
  - phase: 01-celpip-writing-practice (plan 01)
    provides: "CelpipRubric/CelpipRubricDimension types, seed CELPIP_RUBRIC, celpip-progress.ts store, WritingSimulator tracer with expansion seams"
provides:
  - "Full 4-dimension CELPIP_RUBRIC (email + survey), every dimension 2-4 original yes/no items"
  - "Timer.tsx: anchor-timestamp countdown, tabular-nums MM:SS, vermilion warning at <=2min, Pause/Resume (practice mode only), onExpire-once contract"
  - "RubricChecklist.tsx: dimension-grouped self-check, sky-accent checked state, no check-all gate"
  - "WritingSimulator wired end-to-end: timer-driven expiry lock (never loses text), debounced autosave with a visible failure warning, draft restore on mount, deferred attempt recording that captures the learner's final rubric self-check"
  - "celpip-progress.ts: writeLocal/saveDraft now report success/failure so a setItem failure can reach the UI instead of being silently swallowed"
affects: [01-05-celpip-landing, 01-06-checkpoint-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Anchor-timestamp countdown: recompute remaining from Date.now() minus a start anchor (not a decrementing counter) so background-tab throttling never causes drift; rAF loop (250ms granularity) with a prefers-reduced-motion setInterval(1000ms) fallback, mirroring ProgressRing's guard idiom"
    - "Deferred attempt recording: submit() no longer calls addAttempt immediately — it snapshots duration and moves to the results phase; addAttempt fires once, guarded by a ref, at every results-view exit path (Retry / Back to tasks), so whatever rubric state the learner last checked (including empty/partial) is what persists — avoids duplicate attempts from an append-only store with no update API"
    - "Store methods (persist/saveDraft) now return a boolean success flag instead of swallowing setItem failures internally, so calling UI code can render a visible warning"

key-files:
  created:
    - src/components/celpip/Timer.tsx
    - src/components/celpip/RubricChecklist.tsx
  modified:
    - src/lib/celpip/rubric.ts
    - src/components/celpip/WritingSimulator.tsx
    - src/lib/celpip-progress.ts

key-decisions:
  - "Deferred addAttempt from submit-time to results-view-exit-time (Retry / Back to tasks), holding pendingDuration in a ref and checkedRubric in local state, because the store's addAttempt only appends (no update API) — calling it once at the true exit point is the only way to persist the learner's actual final rubric self-check without duplicating attempt records."
  - "Extended celpip-progress.ts's writeLocal/saveDraft to return a boolean instead of swallowing setItem failures (previously silent), which the must_haves backstop truth requires — a correctness fix (Rule 2) beyond the plan's declared file list, scoped narrowly to the return-value contract only."
  - "Timer countdown drift-guard uses requestAnimationFrame (250ms polling) with a prefers-reduced-motion fallback to setInterval(1000ms), reusing ProgressRing's reduced-motion detection idiom even though a countdown isn't a CSS animation."
  - "React Compiler's react-hooks/refs lint rule forbids reading/writing ref.current during render; effectivelyRunning is computed from the expired state (not expiredRef) and onExpireRef is synced via useEffect rather than assigned inline during render."

patterns-established:
  - "Anchor-timestamp countdown pattern for any future exam-style timer in this codebase (Timer.tsx is the first, and only, precedent)."
  - "Deferred-record-on-exit pattern for append-only local-first stores: hold interactive local state, persist once at the natural exit point rather than mutating a store that has no update primitive."

requirements-completed: [CELPIP-02, CELPIP-03]

coverage:
  - id: D1
    description: "Countdown timer runs 27 min (Task 1) / 26 min (Task 2), pausable in practice mode, tabular-nums digits with no jitter"
    requirement: "CELPIP-02"
    verification:
      - kind: other
        ref: "grep -c tabular-nums src/components/celpip/Timer.tsx (count 1); npm run build"
        status: pass
    human_judgment: true
    rationale: "Static checks prove the tabular-nums class and countdown wiring are present, but visually confirming a real running countdown without jitter and pause/resume behavior needs an interactive browser check (deferred to the 01-06 checkpoint)."
  - id: D2
    description: "Timer face turns vermilion at <=2 minutes remaining"
    verification: []
    human_judgment: true
    rationale: "Color-state transition at a specific time threshold requires watching the countdown live; no automated screenshot test exists in this phase."
  - id: D3
    description: "Countdown expiry locks the editor, shows the Time's up banner, and offers Submit as-is / Continue untimed without ever losing text"
    requirement: "CELPIP-02"
    verification:
      - kind: other
        ref: "grep -c onExpire src/components/celpip/WritingSimulator.tsx (count 3); npm run build; npm run lint"
        status: pass
    human_judgment: true
    rationale: "Static grep proves the onExpire wiring and both exit buttons exist in source, but confirming the editor truly locks, the banner renders, and text survives both paths requires an interactive check (deferred to 01-06)."
  - id: D4
    description: "Draft autosaves every few seconds and restores on reopen/refresh"
    requirement: "CELPIP-03"
    verification:
      - kind: other
        ref: "grep -c saveDraft src/components/celpip/WritingSimulator.tsx (count 3); npm run build"
        status: pass
    human_judgment: true
    rationale: "Static check proves saveDraft/draftFor wiring exists; confirming an actual refresh restores the draft requires an interactive browser check (deferred to 01-06)."
  - id: D5
    description: "localStorage.setItem failure during autosave renders a visible warning and never drops the in-memory text"
    verification:
      - kind: other
        ref: "grep -c \"copy your text somewhere safe\" src/components/celpip/WritingSimulator.tsx (count 1)"
        status: pass
    human_judgment: true
    rationale: "This is the plan's explicit backstop truth — verification requires forcing a real setItem failure (quota/private mode), which is a held-out interactive test, not something this phase's automated checks exercise."
  - id: D6
    description: "Word count under 150 / over 200 is a visual flag only, never blocks submission"
    requirement: "CELPIP-03"
    verification:
      - kind: other
        ref: "npm run build; npm run lint"
        status: pass
    human_judgment: false
  - id: D7
    description: "Submit shows an interactive, dimension-grouped self-eval checklist with original yes/no items and explanations, with no check-all gate"
    requirement: "CELPIP-03"
    verification:
      - kind: other
        ref: "npm run build; grep -rniE \"IELTS.?.?PTE.?with.?Viv\" src/lib/celpip (count 0)"
        status: pass
    human_judgment: true
    rationale: "Automated checks prove the rubric is original and the checklist compiles; confirming the interactive checkbox UX and the grouping/explanations read well needs a human look (deferred to 01-06)."
  - id: D8
    description: "Checked rubric items persist into the attempt record so history reflects self-evaluation, including a partial check-in"
    requirement: "CELPIP-03"
    verification: []
    human_judgment: true
    rationale: "Persistence into localStorage history across a full submit -> check -> exit flow requires an interactive browser test; this phase only proves the wiring compiles and lints clean."
  - id: D9
    description: "npm run build and npm run lint exit 0; no third-party academy text under src/lib/celpip"
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "npm run lint"
        status: pass
      - kind: other
        ref: "grep -rniE \"IELTS.?.?PTE.?with.?Viv\" src/lib/celpip (count 0)"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-25
status: complete
---

# Phase 1 Plan 4: Simulator Timer, Expiry Lock, Autosave & Rubric Self-Eval Summary

**Real timed-exam simulator: anchor-timestamp countdown with vermilion ≤2min warning and never-lose-text expiry lock, debounced draft autosave with a visible failure warning, and a persisted 4-dimension descriptor-based self-evaluation checklist.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-25T18:05:31Z
- **Tasks:** 3
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments

- Expanded `CELPIP_RUBRIC` (`src/lib/celpip/rubric.ts`) so every dimension in both the email and survey variants (task fulfillment, organization, vocabulary, grammar & format) has 2-4 original yes/no items with short explanations — vocabulary previously had only 1 item per variant, now has 3.
- `Timer.tsx`: drift-resistant countdown anchored to a start timestamp (not a decrementing counter), `tabular-nums` MM:SS display, switches to `var(--vermilion)` at ≤120s remaining, exposes Pause/Resume (44px touch target) only in practice mode, calls `onExpire` exactly once via a guard ref.
- `WritingSimulator.tsx` wired end-to-end: Timer rendered in a sticky header above the editor; expiry sets `locked` (textarea becomes `readOnly`, editor never cleared) and shows the "Time's up" banner with equal-weight "Submit as-is" / "Continue untimed" actions; debounced (3s) `saveDraft` autosave restores via `draftFor` on mount and renders the exact UI-SPEC warning copy if the underlying write fails.
- `RubricChecklist.tsx`: dimension-grouped checkbox rows (reusing `WritingDesk`'s checkbox-row primitive) with `--sky` accent on checked items, item text + explanation, no check-all control.
- Attempt recording deferred from submit-time to results-view-exit-time (Retry / Back to tasks) so the persisted `checkedRubric` reflects whatever the learner actually checked, including a partial or empty self-check — the store's `addAttempt` only appends, so this was the only way to avoid duplicate attempt records while still capturing interactive rubric state.
- `celpip-progress.ts`: `writeLocal`/`saveDraft` now return a boolean success flag instead of silently swallowing `setItem` failures, so the autosave warning can actually fire on a real write failure.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the full descriptor-based self-evaluation rubric** - `09b39e8` (feat)
2. **Task 2: Timer component + expiry-lock wiring (never lose text)** - `f35bbff` (feat)
3. **Task 3: Draft autosave (with visible failure) + rubric self-check wired into results** - `abba24d` (feat)

## Files Created/Modified

- `src/lib/celpip/rubric.ts` - Added 2 vocabulary items each to the email and survey variants (synonym variety, register/opinion-language checks)
- `src/components/celpip/Timer.tsx` - New: anchor-timestamp countdown, tabular-nums, vermilion warning, Pause/Resume, onExpire-once
- `src/components/celpip/RubricChecklist.tsx` - New: dimension-grouped self-check checklist component
- `src/components/celpip/WritingSimulator.tsx` - Timer + expiry-lock wiring, debounced autosave + warning banner, draft restore on mount, deferred attempt recording with rubric self-check
- `src/lib/celpip-progress.ts` - `writeLocal`/`saveDraft` return a success boolean instead of swallowing failures

## Decisions Made

- Deferred `addAttempt` from submit-time to results-view-exit-time (Retry / Back to tasks), holding the pending duration in a ref and `checkedRubric` in local state — the store's `addAttempt` only appends (no update API), so recording once at the true exit point is the only way to persist the learner's actual final self-check without duplicating attempts.
- Extended `celpip-progress.ts` beyond this plan's declared file list to return a boolean from `writeLocal`/`saveDraft` — required to satisfy the must_haves backstop truth that a `setItem` failure must reach the UI, not be silently caught (Rule 2: auto-add missing critical functionality).
- Timer's countdown uses `requestAnimationFrame` (250ms polling) with a `prefers-reduced-motion` fallback to `setInterval(1000ms)`, reusing `ProgressRing`'s reduced-motion detection idiom.
- `effectivelyRunning` is computed from the `expired` state (not `expiredRef.current`) and `onExpireRef` is synced via a `useEffect` rather than assigned inline during render, to satisfy the project's `react-hooks/refs` lint rule (refs must not be read/written during render).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Store swallowed autosave failures silently**
- **Found during:** Task 3 (autosave wiring)
- **Issue:** `celpip-progress.ts`'s `writeLocal` caught `setItem` errors and discarded them with no signal to the caller, so the plan's required visible-failure-warning truth (backstop) could never actually fire on a real failure.
- **Fix:** `writeLocal` and `saveDraft` (via `persist`) now return a boolean; `WritingSimulator` sets the warning state from that return value.
- **Files modified:** `src/lib/celpip-progress.ts`
- **Verification:** `npm run build` and `npm run lint` exit 0; `addAttempt`'s call sites are unaffected (return value optional to use).
- **Committed in:** `abba24d` (Task 3 commit)

**2. [Rule 3 - Blocking] React Compiler lint rule blocked initial ref-based expiry guard**
- **Found during:** Task 2 (Timer implementation)
- **Issue:** `react-hooks/refs` rejected reading `expiredRef.current` during render and assigning `onExpireRef.current = onExpire` inline during render.
- **Fix:** Render-time check switched to the `expired` state variable; `onExpireRef` is now synced inside a `useEffect`.
- **Files modified:** `src/components/celpip/Timer.tsx`
- **Verification:** `npm run lint` exits 0 with zero errors/warnings.
- **Committed in:** `f35bbff` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both fixes were necessary for correctness (autosave warning) and to satisfy the project's lint gate (React Compiler ref rule). No scope creep beyond the plan's stated file list except the narrow `celpip-progress.ts` return-value change, which is required by the plan's own must-have truth.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Simulator now has real timed-exam behavior end-to-end: countdown, expiry lock, autosave, and a persisted self-evaluation — plan 05 (landing/catalog) can link into a fully functional simulator.
- Interactive/visual truths (timer jitter-free rendering, color transitions, expiry banner UX, draft restore across a real refresh, autosave-failure UI, and rubric persistence across a full attempt) are deferred to the human checkpoint in plan 01-06 per this plan's `<verification>` section — none of them were skipped, they were never assigned to this plan's automated verification.
- No blockers. `npm run build` and `npm run lint` both exit 0 after all three tasks.

---
*Phase: 01-celpip-writing-practice*
*Completed: 2026-07-25*

## Self-Check: PASSED

All created/modified files found on disk; all 3 task commit hashes (09b39e8, f35bbff, abba24d) confirmed in git log.
