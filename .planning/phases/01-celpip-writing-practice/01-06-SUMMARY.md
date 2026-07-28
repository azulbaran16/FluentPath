---
phase: 01-celpip-writing-practice
plan: 06
type: execute
status: complete
completed: 2026-07-28
verified_by: agent-driven browser session (Playwright), in place of live human UAT
commits:
  - fca41b7 fix(01-06): clear a task's draft once its attempt is recorded
  - f70230e fix(01-06): show the attempt metrics strip on the results screen
---

# 01-06 Summary — Phase verification gate

## Outcome

Phase 1 verified against all five ROADMAP success criteria. Two defects were
found during verification and fixed; both were re-verified in the browser after
the fix. No criterion is left unproven.

The user was unavailable for hands-on UAT, so the interactive checks were driven
by an agent through a real browser against `npm run dev` rather than by a human.
Everything the plan asked a human to observe was exercised; see Caveats.

## Task 1 — automated gate

| Check | Result |
|---|---|
| `npm run build` | pass (exit 0, whole app, 102 static pages) |
| `npm run lint` | pass (exit 0, no warnings) |
| Third-party academy name across `src/` | 0 matches |
| `dangerouslySetInnerHTML` in celpip components/routes | 0 matches |

`npx tsc --noEmit` was also run clean after the fixes.

## Task 2 — interactive verification

| # | Success criterion | Evidence |
|---|---|---|
| 1 | Timed attempt without losing text on refresh | `/celpip` loads signed-out; 8 Task 1 + 9 Task 2 tasks; word counter read "159 words · in range ✓" (sky) at 159 and "207 / 150–200 words" (vermilion) at 207 with Submit still enabled; draft persisted to `fluentpath.celpip.v1` after the 3s debounce and the full 1192-char text was restored after a page reload |
| 2 | Text beside model answer + interactive self-eval | Results rendered "Your answer" (1201 chars) and "Model answer" (899 chars) in `overflow-y: auto` panels; rubric grouped under Task Fulfillment / Organization / Vocabulary / Grammar & Format with 9 items; checking 2 of 9 persisted into the attempt record |
| 3 | Timer expiry locks and never loses data | Clock fast-forwarded past the 27-minute limit: timer hit 0:00, "Time's up" banner appeared, textarea went `readOnly`, text intact at 1192 chars, and both "Submit as-is" and "Continue untimed" were offered. Continue untimed unlocked the editor with text intact and accepted further typing |
| 4 | Attempt history persists locally across sessions | History showed "28 jul 2026 · 28:33 used · 208 words" with a View link and the task card flipped to "Completed"; both survived a full page reload; with two attempts stored, the newest rendered first (reverse-chronological) |
| 5 | No third-party text in the app | Phase-wide grep returned 0; read six model answers (5 survey, 1 email) in full — original prose with invented Canadian specifics (NorthLink, Maple Dental, Mr. Chen), no copied exam text |

Also verified beyond the criteria: Task 1 / Task 2 tabs switch grids; Speaking /
Reading / Listening carry `aria-disabled` + "Coming soon"; Pause froze the
practice-mode countdown for 2.5s and Resume restarted it; with `setItem` forced
to throw, the "We couldn't save your draft just now" warning appeared with
`role="alert"` and the typed text stayed in the editor; at 390px the desktop
notice appeared, dismissed cleanly, and the page had no horizontal overflow.

## Defects found and fixed

**D1 — a submitted answer pre-filled the next attempt** (`fca41b7`)
No code path cleared `drafts[taskId]`, so reopening a completed task restored
the previous answer into the editor. A "new" timed attempt started pre-written
and its word count was inflated — a direct hit on criterion 1's real-exam
conditions. Added `clearDraft(taskId)` to the store and called it from
`finalizeAttempt()`; the text is already preserved in the attempt record.
Re-verified: after submitting, `drafts` is empty and reopening the task shows an
empty editor with a full 27:00 clock.

**D2 — results screen showed no attempt metrics** (`f70230e`)
`01-UI-SPEC.md:130` specifies attempt metrics as a compact tertiary strip in the
results state; the screen rendered only the title, comparison, and rubric.
Added "m:ss used · N words · min–max target", flagged when the attempt ran out
of time. `formatDuration` moved from `CelpipLanding` into `celpip-progress` so
history rows and the strip format identically, and the submitted duration moved
from a ref to state (the results view now renders it — the ref read tripped
`react-hooks/refs`). Re-verified: strip reads "0:08 used · 49 words · 150–200
target", and Retry still records duration, word count, and text correctly.

## Caveats

- **Not a human sign-off.** An agent drove the browser. Subjective judgments a
  real learner would make — whether the rubric wording actually helps, whether
  the model answers read naturally, whether the timer feels like the real exam —
  remain unconfirmed. Worth a pass from the beta user before her exam.
- **Timer expiry was reached by overriding `Date.now()` in the page**, not by
  waiting 27 minutes. The lock/banner/both-buttons path is genuinely exercised;
  a full-length real-time run is not.
- **`durationSeconds: 1713` (28:33) on the first attempt** is an artifact of that
  clock override, not a bug.
- The Next.js dev-mode `eval()` console error is Playwright's CSP blocking React
  devtools. It does not appear in production builds.
- Zero automated tests still cover this surface (a known milestone-wide gap,
  TEST-01 in the v2 backlog). Both fixes are verified by browser session only.

## Files touched

- `src/lib/celpip-progress.ts` — added `clearDraft`, exported `formatDuration`
- `src/components/celpip/WritingSimulator.tsx` — clear draft on finalize, metrics strip, duration ref → state
- `src/components/celpip/CelpipLanding.tsx` — import shared `formatDuration`
