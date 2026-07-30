---
phase: 02-server-side-progress
plan: 03
subsystem: api
tags: [zod, validation, prisma, postgres, localstorage, rate-limit, prototype-pollution, dos]

# Dependency graph
requires:
  - phase: 02-server-side-progress
    provides: "02-01 — src/lib/progress-schema.ts (the framework-free contract module, EMPTY, the D-01b updatedAt field) and the merge-on-write PUT this plan hardens"
provides:
  - "progressSchema — the D-08 write contract: unknown keys stripped, every known field recovering to its own default, 400 only for a non-object body"
  - "sanitizedRecord / sanitizedPartialRecord — entry-level sanitisation that drops a malformed entry instead of inventing a placeholder, and closes the prototype-pollution vector"
  - "safeReadProgress — one non-throwing read for stored data, shared by the Postgres blob and the localStorage cache"
  - "SCHEMA_MATCHES_STATE — a compile-time drift guard between the schema output type and the ProgressState interface"
  - "A bounded (413), rate-limited (429 + Retry-After) progress write path"
  - "scripts/verify-schema.mts — executable proof of strip, per-field recovery, record sanitisation and safe-default reads"
affects: [02-04, 02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Asymmetric validation: writes are lenient and refuse only a non-object body; reads of stored data never throw"
    - "Per-field `.catch(default)` so one bad value costs only its own field, never the whole payload"
    - "Entry-level sanitisation by explicit assignment into a fresh object — never a spread of unvalidated input"
    - "Conditional-type equality assertion as a compile-time guard against schema/interface drift"
    - "Mutation-test the verification script before trusting a first-run green"

key-files:
  created:
    - scripts/verify-schema.mts
  modified:
    - src/lib/progress-schema.ts
    - src/app/api/progress/route.ts
    - src/lib/progress.ts

key-decisions:
  - "The D-01b instant is accepted only at millisecond precision, because laterInstant compares instants LEXICALLY and a second-precision instant sorts ABOVE a millisecond one"
  - "Corruption is detected by a second JSON.parse rather than inferred from the parsed result — the latter cannot tell a corrupt row from a new learner's empty one"
  - "zod's client-bundle cost was measured by an isolated before/after build rather than reported as a raw total: +284,752 bytes in one new chunk"

requirements-completed: [PROG-03]

coverage:
  - id: D1
    description: "A browser on a cached older build still saves: unknown fields are stripped and everything it did send is stored (D-08)"
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "scripts/verify-schema.mts — 'D-08 — unknown fields are stripped, known fields are saved'"
        status: pass
    human_judgment: false
  - id: D2
    description: "A single bad value costs only its own field; a malformed record entry is dropped and its neighbours survive"
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "scripts/verify-schema.mts — 'per-field recovery' + 'record sanitisation' groups"
        status: pass
    human_judgment: false
  - id: D3
    description: "A corrupt stored blob loads as the empty state instead of a permanent 500 for that account"
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "scripts/verify-schema.mts — 'PROG-03 — a corrupt stored blob loads as the empty state' (8 corrupt inputs, both throw-freedom and value asserted)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A non-object payload is rejected with 400 and the stored row is left exactly as it was"
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "scripts/verify-schema.mts — 'rejection — only a non-object body fails validation' (7 rejected inputs)"
        status: pass
      - kind: other
        ref: "src/app/api/progress/route.ts — the 400 returns before findUnique and updateMany; no DB call is reachable from that branch"
        status: pass
    human_judgment: false
  - id: D5
    description: "Prototype-poisoning record keys are dropped rather than assigned"
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "scripts/verify-schema.mts — 'prototype pollution' group, incl. an assertion that the fixture really does carry an own __proto__ key"
        status: pass
    human_judgment: false
  - id: D6
    description: "A corrupt stored blob is recoverable after the fact: its full contents reach the error log once before the safe default replaces it"
    requirement: PROG-03
    verification:
      - kind: other
        ref: "src/app/api/progress/route.ts#readStored — console.error carries the full raw string and the account id; no truncation, no email"
        status: unknown
      - kind: manual_procedural
        ref: "Write a deliberately corrupt User.progress row, GET /api/progress, inspect the Coolify log for the full blob"
        status: unknown
    human_judgment: true
    rationale: "Structurally present and readable in the source, but no test exercises the route handler against a real corrupt row — the route imports next-auth and prisma and cannot be loaded standalone. 02-07's gate is the place to observe it."
  - id: D7
    description: "A hostile authenticated client cannot fill the database with an unbounded progress blob"
    requirement: PROG-03
    verification:
      - kind: other
        ref: "grep -c '413' src/app/api/progress/route.ts => 2; the content-length pre-check and the post-read byte check both return 413 before any DB call"
        status: pass
      - kind: manual_procedural
        ref: "PUT a >1 MiB progress body while signed in; expect 413 and an unchanged row"
        status: unknown
    human_judgment: true
    rationale: "The cap is structurally in place and unreachable-past by construction, but has not been exercised over HTTP."

# Metrics
duration: 25min
completed: 2026-07-28
status: complete
---

# Phase 2 Plan 03: The Shared Runtime Contract Summary

**`PUT /api/progress` now validates every write against a zod schema shared with the client cache — stripping what it does not know, recovering a known field that arrives broken, dropping a single malformed queue entry rather than the whole payload, and refusing only a body that is not an object at all — while stored data on both sides of the wire reads through one helper that never throws.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2 of 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- **`progressSchema`** — built from the plain object constructor, whose default behaviour *is* D-08. Every known field carries its own fallback, so a stale client sending `xp: "1200"` loses `xp` and nothing else. `safeParse` fails on exactly one input class: a value that is not an object. That is the only 400 this contract produces.
- **`updatedAt` is declared explicitly.** This is the field the whole D-01b tie-break ladder reads, and the plain object constructor strips what it does not declare — so an undeclared `updatedAt` would have been silently deleted by the server on *every* write, collapsing the whole-field rule back to day granularity and resurrecting un-marked vocabulary cards. The mutation test below proves the guard against that regression is armed.
- **`sanitizedRecord`** — walks `Object.entries` of the *raw* value, validates each entry, and assigns survivors into a freshly created object, skipping `__proto__`, `constructor` and `prototype`. A bad entry is dropped, never replaced by an invented placeholder: fabricating an SRS due date would re-show a card on a day nobody earned.
- **`safeReadProgress`** — one non-throwing read for stored data, now used by both the Postgres blob and `readLocal()`, so a corrupt localStorage entry degrades exactly the way a corrupt row does.
- **`SCHEMA_MATCHES_STATE`** — a conditional-type equality assertion between the schema's *output* type and the hand-written `ProgressState`. It fails `npx tsc --noEmit` the moment either side gains a field.
- **The write path is bounded and rate-limited** — 413 above one mebibyte (checked on `content-length` first, then on the actual body bytes), and 60 writes/minute per account answering 429 with `Retry-After` for 02-04's queue to honour.
- **`scripts/verify-schema.mts`** — 89 assertions, no test runner, no new dependency.

## Task Commits

1. **Task 1 (RED): failing proof of the runtime contract** — `16409c8` (test)
2. **Task 1 (GREEN): the shared zod contract** — `ee814fa` (feat)
3. **Task 2: validate, bound and rate-limit the write path** — `16f6440` (feat)

No REFACTOR commit: the GREEN implementation needed no cleanup pass.

## Files Created/Modified

- `scripts/verify-schema.mts` (new, 405 lines) — the executable proof.
- `src/lib/progress-schema.ts` (+214) — the runtime contract section, plus a corrected header comment (the module now has exactly one runtime import, zod, where it previously had none).
- `src/app/api/progress/route.ts` (+113/-23) — rate limit, size cap, schema validation, corrupt-blob logging, and `safeReadProgress` on both handlers.
- `src/lib/progress.ts` (+15/-4) — `readLocal` routed through `safeReadProgress`, v1-key fallback preserved.

## Decisions Made

1. **The D-01b instant is accepted only at millisecond precision** (`/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/`). This looked like needless strictness until the ordering was checked: `laterInstant` compares instants **lexically**, and `"2026-07-28T09:15:42Z" > "2026-07-28T09:15:42.500Z"` because `Z` outranks `.`. Admitting a second-precision instant would silently invert D-01b's whole-field ordering — the exact defect the amendment exists to prevent. Anything else falls back to `null`, which the merge treats as "older than any instant": the safe direction. The reasoning is in the regex's doc comment and asserted in the proof.

2. **Corruption is detected by a second `JSON.parse`, not inferred from the parsed result.** Reference-identity or value-equality against `EMPTY` cannot distinguish a genuinely corrupt row from a brand-new learner's empty one, and would log every first save as a data loss. The extra parse of a ≤1 MiB string sits alongside two DB round-trips; the cost is noted in the function's comment so it is not "optimised" away later.

3. **`z.literal(true)` for the flag records** (`completed`, `vocab`) rather than a truthy coercion. Verified against every write site first: `progress.ts` only ever assigns `true`, and JSON round-trips it exactly, so nothing existing is dropped.

4. **Bounded integers everywhere** (`0 … 1_000_000_000`, `int`). Checked against every call site before committing — `addSkillXp` is called with 2, 8, 10 and `pairs.length`, and `complete` with its default 20, so no real learner value is fractional or negative. A fractional amount would now silently reset that field, which is why the check was done rather than assumed.

## Deviations from Plan

**None.** Both tasks executed as written. Two things the plan called out as "must not regress" were verified rather than trusted:

- the `level` denormalization and the single `updateMany` + `count === 0` are byte-identical to 02-01's versions, and the reworded rationale comment was left alone so `grep -c 'updateMany' … == 1` still passes (confirmed: 1);
- `updatedAt` is declared in the schema, and mutation test #1 below proves that removing it fails both the type gate and 14 runtime assertions.

The corrupt-blob path logs the **full** blob, not an excerpt, exactly as the plan required.

## Issues Encountered

- **The proof passed on its first run**, which is not evidence. Before committing, each load-bearing behaviour was mutation-tested against `src/lib/progress-schema.ts`, restored byte-identically after each (md5 `498a192b…` confirmed before and after every mutation):

  | Mutation | Result |
  |---|---|
  | Drop the `updatedAt` declaration from the schema | **tsc fails** (`Type 'true' is not assignable to type 'false'` — the drift guard) **and 14 assertions fail** |
  | `z.object` → `z.looseObject` (keep unknown keys) | 3 assertions fail |
  | Remove the `POISONED_KEYS` filter | 2 assertions fail |
  | `counter` loses its per-field `.catch(fallback)` | 7 assertions fail |

  The assertions have teeth, and the drift guard specifically catches the one regression this plan was warned about.

- **`sanitizedPartialRecord` hit a zod generics wall.** `.catch(() => ({}) as Partial<Record<K, T>>)` does not type-check, because zod types the fallback as `Awaited<Partial<Record<K, T>>>` and that does not reduce while `T` is an unresolved type parameter. Resolved by composing instead of duplicating: the partial variant is now `sanitizedRecord(item).transform(record => record as Partial<Record<K, T>>)`, which keeps the single cast inside the helper (so `skillXp` needs none at the call site) and reuses the already-proven sanitiser. Runtime behaviour was checked for the missing-key case before adopting it.

- **A sibling plan (02-02) was editing the same working tree throughout.** `src/lib/progress-merge.ts` and `scripts/verify-merge.mts` appeared as modified mid-run; `git diff --stat` confirmed they were not mine, and nothing outside my four files was ever staged. Their 3037 merge assertions were re-run against my modified `progress-schema.ts` after Task 2 and all pass, so the added zod import did not disturb the merge module's standalone-load property.

## Verification Results

Every gate the plan specifies was run on the final tree.

| Gate | Result |
|---|---|
| `node --experimental-strip-types scripts/verify-schema.mts` | exit 0 — **89/89 assertions passed** |
| `npx tsc --noEmit` (drift guard armed) | exit 0 |
| `npm run lint` | exit 0 — and `npx eslint --max-warnings 0` also exit 0 (zero warnings) |
| `npm run build` | exit 0 |
| `grep -v '^\s*//' … \| grep -c 'strictObject' \| grep -qx 0` | pass (0) |
| `grep -v '^\s*//' … \| grep -c 'looseObject' \| grep -qx 0` | pass (0) |
| `grep -c 'safeReadProgress' src/app/api/progress/route.ts` | 2 |
| `grep -c 'safeReadProgress' src/lib/progress.ts` | 3 |
| `grep -c 'updateMany' … \| grep -qx 1` | pass (1) |
| `grep -c '413' src/app/api/progress/route.ts` | 2 |
| `grep -c 'rateLimit' src/app/api/progress/route.ts` | 2 |
| `du -sb .next/static/chunks` | **1427746** bytes across 32 chunks |
| `node --experimental-strip-types scripts/verify-merge.mts` (sibling's, re-run) | exit 0 — 3037/3037 |

### Client bundle: the figure, and what it actually means

The plan asked for the chunk total against a **1170768-byte / 30-chunk** research baseline. The raw number is **1427746 bytes / 32 chunks**, i.e. +256,978 against that baseline — but that baseline predates 02-01, so it also carries 02-01's and 02-02's work and would have overstated zod's share.

So the cost was isolated with a clean before/after build, holding the sibling's work constant (the pre-plan tree — `progress-schema.ts`, `progress.ts` and `route.ts` restored to their pre-Task-1 versions — built green at **1142994 bytes / 31 chunks**):

| Build | Chunk bytes | Chunks |
|---|---|---|
| Pre-plan tree (no zod in the progress path) | 1,142,994 | 31 |
| This plan | 1,427,746 | 32 |
| **Attributable to zod on the client** | **+284,752 (+24.9%)** | **+1** |

The new chunk was located by grepping the build output for a zod-only marker: `.next/static/chunks/0byb2c0u53y_u.js`, **293,502 bytes** — which matches the delta and confirms the attribution.

This is uncompressed; over the wire it is roughly a quarter of that. It is a real cost on a phone, and it is the price of the plan's deliberate key link — the client cache reading through the *same* contract as the server, so a corrupt cache degrades identically on both sides. **Not** changed here, because that shared contract is the plan's stated design. Recorded for the phase gate: if 02-07 judges the payload too heavy, the lever is to keep zod server-only and give `readLocal` a small hand-rolled guard, at the cost of two definitions that can drift.

### Truths from the plan's `must_haves`

| Truth | Status |
|---|---|
| A cached older build can still save; unknown fields stripped, the rest stored | **Proven** — `verify-schema.mts` D-08 group, incl. an assertion that the accepted key set is exactly the contract |
| One bad value costs only its own field | **Proven** — single-field and four-fields-at-once cases |
| One malformed review-queue entry is dropped, neighbours survive | **Proven** — one good entry against three malformed ones, plus "no placeholder is fabricated" |
| A non-object payload is rejected 400, the stored row untouched | **Proven for the rejection** (7 inputs). Row-untouched is **structural**: the 400 branch returns before any DB call |
| A corrupt stored blob loads as the empty state, not a 500 | **Proven at the helper** — 8 corrupt inputs, throw-freedom and value both asserted. Route-level is structural |
| A corrupt blob is recoverable: full contents logged once before replacement | **Structural** — readable in `readStored`, not exercised against a real row. 02-07 |
| A hostile client cannot store an unbounded blob | **Structural** — two 413 checks, both before any DB call. Not exercised over HTTP |

## Known Stubs

None. Nothing in this plan renders placeholder data or leaves a data source unwired.

## Threat Flags

None new. The mitigations the plan's register assigns to this plan are all in place: T-02-10 (bounded, format-checked fields; unknown keys stripped), T-02-11 (413 above one mebibyte, checked twice), T-02-12 (`sanitizedRecord` assigns into a fresh object and skips the three poisoned keys — asserted, including that the sanitised record keeps a clean prototype), T-02-13 (60/min per account, 429 + `Retry-After`), T-02-15 (non-throwing reads on both sides), T-02-SC (no installs — zod 4.4.3 was already a direct dependency).

T-02-14 remains **accepted, not mitigated**, and the acceptance is now written into the code: `readStored`'s doc comment states what is exposed (one account's own progress JSON plus the account id), what is not (the email, any credential, the response body), and why the alternative is worse (merge-on-write makes that log line the only surviving copy).

## User Setup Required

None — no external service configuration, no new dependency, no schema change, no Dockerfile change (D-09 untouched).

## Next Phase Readiness

- **02-04 (retry queue):** `PUT` now answers 429 with a `Retry-After` header the queue must honour, and 413/400 are terminal — a body that is too large or not an object will never succeed on replay, so those must be dropped from the queue rather than retried. 400 no longer means "malformed field"; it means "not an object at all".
- **02-05 (CELPIP store):** `sanitizedRecord`, `sanitizedPartialRecord` and the `Identical<>` drift guard are generic and reusable. `CelpipProgressState` needs its own millisecond-precision `updatedAt` regex for the same lexical-ordering reason documented above, and its attempts are an *array* per task, so it needs an array sanitiser rather than the record one.
- **02-07 (verification gate):** three things need a browser or a real row — the full-blob corrupt log, the 413 over HTTP, and the client bundle judgement above.
- **Caveat:** PROG-03 is checked off in `REQUIREMENTS.md` because it is this plan's declared requirement and the safe-default read is proven by command. The *route-level* corrupt-row behaviour has still never been observed against real data; treat it as "implemented and unit-proven", not "observed".

## Self-Check: PASSED

- `scripts/verify-schema.mts` — present on disk.
- `src/lib/progress-schema.ts`, `src/app/api/progress/route.ts`, `src/lib/progress.ts` — present and modified.
- Commits `16409c8`, `ee814fa`, `16f6440` — all three verified in `git log`.
- No file deletions in any of the three commits (`git diff --diff-filter=D` empty for each).

---
*Phase: 02-server-side-progress*
*Completed: 2026-07-28*
