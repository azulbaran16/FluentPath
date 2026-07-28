# Phase 02: Server-Side Progress - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-28
**Phase:** 02-server-side-progress
**Areas discussed:** Sign-in merge, CELPIP attempt scope, sync failure visibility, schema migration

**Note on format:** the user was time-constrained, so questions were grouped into two
batches rather than the default one-question-per-turn flow.

---

## Sign-in merge

| Option | Description | Selected |
|--------|-------------|----------|
| Merge field by field | Union of completions and SRS, max XP/streak, highest CEFR. Nothing lost — the only option that satisfies PROG-05 literally | ✓ |
| Server wins, with a notice | Account data kept, local discarded, learner told. Simple but loses data | |
| Let the learner choose | Dialog comparing both sets. Full control but confusing and needs a new screen | |

**User's choice:** Merge field by field
**Notes:** Discussion was grounded in `src/lib/progress.ts:148-155`, where anonymous
progress is currently dropped whenever the account already has data.

---

## Reconcile timing

| Option | Description | Selected |
|--------|-------------|----------|
| Every authenticated app load | Covers second-device stale cache and prior offline work | ✓ |
| First sign-in only | Simpler and more predictable; risks losing offline work on reload | |

**User's choice:** Every authenticated app load

---

## CELPIP attempt scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sync them in this phase | Beta user is practising now and would lose history on device change; Phase 1 shaped the store for this | ✓ |
| Keep them local | Smaller phase matching the ROADMAP criteria literally; migrate later | |

**User's choice:** Sync them in this phase
**Notes:** PROG-01's word "attempts" was ambiguous between grammar `AttemptStat` and
CELPIP writing attempts. This decision resolves it in favour of including CELPIP.

---

## CELPIP database placement

| Option | Description | Selected |
|--------|-------------|----------|
| Separate JSON column (`User.celpipProgress`) | Additive, decoupled, avoids re-uploading essay text on every XP save | ✓ |
| Inside the existing `progress` blob | Zero schema change but mixes domains and grows the blob fast | |
| Normalized `CelpipAttempt` table | Best long term but is exactly the DATA-01 work deferred to v2 | |

**User's choice:** Separate JSON column

---

## Sync failure visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Silent unless persistent | Background retry; discreet indicator only after repeated failures | ✓ |
| Always visible | Permanent sync-status indicator; maximum transparency, constant visual noise | |
| Fully invisible | Cleanest, but the learner never learns something failed to save | |

**User's choice:** Silent unless persistent

---

## Pending writes on tab close

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent queue in localStorage | Replayed on next load or reconnect — the only option that truly meets PROG-04 | ✓ |
| In-memory retry only | Simpler; per-load merge covers much of the case but pending writes die with the tab | |

**User's choice:** Persistent queue in localStorage

---

## Schema migration approach

| Option | Description | Selected |
|--------|-------------|----------|
| Additive changes only, keep `db push` | Nullable columns are safe even with `--accept-data-loss`; leaves the deploy pipeline untouched | ✓ |
| Move to real Prisma migrations now | Removes the `--accept-data-loss` risk from CONCERNS.md, but the first migration over live data is delicate | |

**User's choice:** Additive changes only
**Notes:** Explicit risk aversion about the production Coolify deploy during a phase
that already touches live user data.

---

## Payload validation strictness

| Option | Description | Selected |
|--------|-------------|----------|
| Strip unknown fields, save the rest | A cached older client never starts failing saves after a deploy adds a field | ✓ |
| Reject the whole payload (400) | Catches client bugs immediately but can break saves for stale clients | |

**User's choice:** Strip unknown fields, save the rest

---

## Claude's Discretion

The user explicitly delegated: corrupted-data handling beyond "load a safe default",
retry backoff curve and failure threshold, validator implementation (zod vs hand-rolled)
and where the shared schema lives, placement and styling of the "not synced" indicator,
and whether the merge helper is shared between the two stores.

## Deferred Ideas

- Normalizing progress into relational tables (DATA-01, v2 backlog)
- Switching to real Prisma migrations and dropping `--accept-data-loss`
- Automated tests for the sync path (TEST-01, v2 backlog)
- Multi-tab concurrent writes and a merge audit log — offered as further gray areas,
  the user chose to stop
