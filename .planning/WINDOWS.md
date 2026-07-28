---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-07-28T23:55:44.925Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | unrun-verify | src/lib/celpip-progress.ts |  | 02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07. | open |  | 2026-07-28T23:55:44.383Z |  |
| 2 | 02 | deviation | src/app/api/celpip-progress/route.ts |  | The plan's route gates are bare presence counts: overwrite-instead-of-merge, cap removal and rate-limit removal all produced ZERO failures. Sharpened call-site gates are recorded in 02-06-SUMMARY.md but live only in that document. | open |  | 2026-07-28T23:55:44.925Z |  |

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
  }
]
````
