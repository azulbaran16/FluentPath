---
schema_version: 1
open_count: 7
waived_count: 0
fixed_count: 0
total_count: 7
last_updated: 2026-07-31T07:30:42.000Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | unrun-verify | src/lib/celpip-progress.ts |  | 02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07. | open |  | 2026-07-28T23:55:44.383Z |  |
| 2 | 02 | deviation | src/app/api/celpip-progress/route.ts |  | The plan's route gates are bare presence counts: overwrite-instead-of-merge, cap removal and rate-limit removal all produced ZERO failures. Sharpened call-site gates are recorded in 02-06-SUMMARY.md but live only in that document. | open |  | 2026-07-28T23:55:44.925Z |  |
| 3 | 02.1 | unrun-verify | src/components/celpip/SpeakingRecorder.tsx |  | 02.1-01 checkpoint: the Speaking phone pass was not done (no device available). The MediaRecorder isTypeSupported container probe (WebM -> MP4) exists precisely for Safari before 18.4, which supports MP4 only, so the one browser family it was written for has never run it. Owed to 02.1-12. | open |  | 2026-07-31T03:10:00.000Z |  |
| 4 | 02.1 | unrun-verify | src/components/celpip/SpeakingRecorder.tsx |  | 02.1-01 checkpoint: microphone release-on-stop is code-verified, not observed. The run used a synthetic AudioContext MediaStreamDestination, whose track lifecycle is not the OS recording indicator. Needs one real-device glance in 02.1-12. | open |  | 2026-07-31T03:10:00.000Z |  |
| 5 | 02.1 | unrun-verify | src/components/celpip/CelpipLanding.tsx |  | 02.1-02: the skill-aware /celpip landing has never been opened in a real browser. The server-rendered HTML was read from a production `next start` (coverage line, disabled tabs, JSON-LD) and the client logic was executed in node against a generated copy of the component, but hydration, the skill-tab switch and the Writing group control were never exercised in a browser. The plan explicitly warns that breaking the `ready` discipline produces a hydration mismatch on a page the beta user opens daily. Owed to 02.1-12. | open |  | 2026-07-31T07:07:20.000Z |  |
| 6 | 02.1 | deviation | src/components/celpip/CelpipLanding.tsx |  | 02.1-02: HISTORY_SOURCES is gated only by an ad-hoc harness that was not committed (it transpiles the component and stubs its render imports, which is too heavy for scripts/). 54 assertions and 15 mutations ran green — including two that initially SURVIVED and were closed — but plans 05 and 09 append an entry to that array with no automated protection. CELPIP_SECTIONS is committed-gated by scripts/verify-celpip-sections.mts; the history half is not. | open |  | 2026-07-31T07:07:20.000Z |  |
| 7 | 02.1 | unrun-verify | src/lib/celpip/speaking-prompts.ts |  | 02.1-03: the eight Speaking cards and the Task 3 written-scene caveat render only under the Speaking tab, which is client-side, so the served /celpip HTML carries the Writing tab alone and neither has been SEEN rendered. What was verified against a production `next start`: all eight prompt routes return 200, an unknown id returns 404, the coverage line reads "8 prompts covering 8 of the 8 exam task shapes", and the Task 3 page serves its disclosure, its scene text and its 30/60 timings. What was not: no browser has switched to the Speaking tab, and none of the seven new prompts has been taken through record -> playback -> self-check (only the plan-01 advice prompt was, at 02.1-01's checkpoint). Owed to 02.1-12. | open |  | 2026-07-31T07:30:42.000Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "02",
    "file": "src/lib/celpip-progress.ts",
    "line": null,
    "description": "02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-28T23:55:44.383Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "02",
    "file": "src/app/api/celpip-progress/route.ts",
    "line": null,
    "description": "The plan's route gates are bare presence counts: overwrite-instead-of-merge, cap removal and rate-limit removal all produced ZERO failures. Sharpened call-site gates are recorded in 02-06-SUMMARY.md but live only in that document.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-28T23:55:44.925Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/SpeakingRecorder.tsx",
    "line": null,
    "description": "02.1-01 checkpoint: the Speaking phone pass was not done (no device available). The MediaRecorder isTypeSupported container probe (WebM -> MP4) exists precisely for Safari before 18.4, which supports MP4 only, so the one browser family it was written for has never run it. Owed to 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T03:10:00.000Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/SpeakingRecorder.tsx",
    "line": null,
    "description": "02.1-01 checkpoint: microphone release-on-stop is code-verified, not observed. The run used a synthetic AudioContext MediaStreamDestination, whose track lifecycle is not the OS recording indicator. Needs one real-device glance in 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T03:10:00.000Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/CelpipLanding.tsx",
    "line": null,
    "description": "02.1-02: the skill-aware /celpip landing has never been opened in a real browser. The server-rendered HTML was read from a production `next start` (coverage line, disabled tabs, JSON-LD) and the client logic was executed in node against a generated copy of the component, but hydration, the skill-tab switch and the Writing group control were never exercised in a browser. The plan explicitly warns that breaking the `ready` discipline produces a hydration mismatch on a page the beta user opens daily. Owed to 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T07:07:20.000Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/CelpipLanding.tsx",
    "line": null,
    "description": "02.1-02: HISTORY_SOURCES is gated only by an ad-hoc harness that was not committed (it transpiles the component and stubs its render imports, which is too heavy for scripts/). 54 assertions and 15 mutations ran green — including two that initially SURVIVED and were closed — but plans 05 and 09 append an entry to that array with no automated protection. CELPIP_SECTIONS is committed-gated by scripts/verify-celpip-sections.mts; the history half is not.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T07:07:20.000Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/speaking-prompts.ts",
    "line": null,
    "description": "02.1-03: the eight Speaking cards and the Task 3 written-scene caveat render only under the Speaking tab, which is client-side, so the served /celpip HTML carries the Writing tab alone and neither has been SEEN rendered. What was verified against a production `next start`: all eight prompt routes return 200, an unknown id returns 404, the coverage line reads \"8 prompts covering 8 of the 8 exam task shapes\", and the Task 3 page serves its disclosure, its scene text and its 30/60 timings. What was not: no browser has switched to the Speaking tab, and none of the seven new prompts has been taken through record -> playback -> self-check (only the plan-01 advice prompt was, at 02.1-01's checkpoint). Owed to 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T07:30:42.000Z",
    "resolved_at": null
  }
]
````
