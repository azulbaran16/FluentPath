---
phase: 02-server-side-progress
plan: 05
subsystem: api
tags: [prisma, postgres, zod, celpip, crdt, semilattice, merge, mutation-testing]

# Dependency graph
requires:
  - phase: 02-server-side-progress
    provides: "02-01 — progress-schema.ts/progress-merge.ts, the D-01b instant, laterInstant/unionRecord/canonical; 02-02 — the rule that a selection key must travel with the value it selects; 02-03 — sanitizedRecord, the Identical<> drift guard, the millisecond-precision instant regex"
  - phase: 01-celpip-writing-practice
    provides: "src/lib/celpip-progress.ts — the CelpipProgressState shape Phase 1 deliberately kept flat as the migration contract, and the fca41b7 draft-clearing defect this merge must not reopen"
provides:
  - "User.celpipProgress — one additive nullable text column (D-05), proven additive by a read-only diff against a pinned pre-phase baseline before it can reach any database"
  - "src/lib/progress-schema.ts — CelpipAttempt/CelpipProgressState/CELPIP_EMPTY with the D-01b instant, celpipProgressSchema, sanitizedArray, safeReadCelpip and a second drift guard"
  - "src/lib/progress-merge.ts — mergeCelpip/celpipEqual: attempt de-duplication on a natural key with a canonical order, and the whole-map draft carve-out"
  - "scripts/verify-schema.mts — 158 assertions; scripts/verify-merge.mts — 4313 assertions"
affects: [02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "An additive schema change is read as SQL against a PINNED pre-phase baseline commit before it is committed — a HEAD-relative baseline goes green vacuously once the edit itself is committed"
    - "A content module's union is bound by an `import(...)` TYPE annotation rather than an import statement, so the drift guard fires without pulling the content into the bundle"
    - "Array-shaped payloads get an entry-level sanitiser of their own (sanitizedArray), so one malformed entry costs only itself"
    - "De-duplication on a natural key plus a canonical sort order, asserted as an idempotence requirement rather than presentation"

key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - src/lib/progress-schema.ts
    - src/lib/progress-merge.ts
    - src/lib/celpip-progress.ts
    - scripts/verify-schema.mts
    - scripts/verify-merge.mts

key-decisions:
  - "CelpipProgressState carries ONE marker — the D-01b millisecond instant — and no day-shaped field: this store has no lastActive to fall back to, and submit-then-reconcile always happens inside one calendar day"
  - "An attempt with no natural key (task id + submission instant) is dropped at coercion rather than repaired, because an entry that cannot be de-duplicated is re-appended on every reconcile"
  - "Attempt arrays are canonicalised at COERCION as well as in the join, so merge(a, a) equals coerce(a) exactly and an out-of-order stored history does not produce a write on every load"
  - "An unrecognised taskType drops the attempt rather than defaulting, following 02-02's precedent of dropping half-formed entries instead of inventing values"
  - "src/lib/celpip-progress.ts was edited outside files_modified — moving the shapes out requires it, and 02-06 (which owns the file) lands in a later wave"

requirements-completed: [PROG-01, PROG-03]

coverage:
  - id: D1
    description: "The only schema change this phase applies is one new nullable text column on User, read as SQL before it can run anywhere"
    requirement: PROG-01
    verification:
      - kind: other
        ref: "npx prisma migrate diff against the pinned baseline 9f6f6df => `ALTER TABLE \"User\" ADD COLUMN \"celpipProgress\" TEXT;` and nothing else; ADD COLUMN count 1, destructive-keyword count 0, Dockerfile diff 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Existing rows are untouched by the schema change: no rewrite, no default, no constraint"
    requirement: PROG-01
    verification:
      - kind: other
        ref: "The generated SQL is a bare nullable ADD COLUMN — no DEFAULT, no NOT NULL, no index, no backfill statement"
        status: pass
      - kind: manual_procedural
        ref: "Observe the container's `prisma db push` output on the first deploy after merge; expect an additive push and unchanged row count"
        status: unknown
    human_judgment: true
    rationale: "Structurally proven from the SQL, but the push itself only runs at container start after the branch merges — 02-07's audit is the gate in front of that."
  - id: D3
    description: "A CELPIP attempt that exists on two devices appears exactly once after a merge, and the attempt list is in a stable order so repeated merges stop producing writes"
    requirement: PROG-01
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#CELPIP attempts — de-duplicated, and in a canonical order; plus the CELPIP algebra rotation (10 fixtures: 100 idempotence, 100 commutativity, 1000 associativity triples)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A draft cleared after submitting is not resurrected by a merge — a new timed attempt still starts from a blank editor, including when the submission and the reconcile happen on the same calendar day"
    requirement: PROG-01
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#CELPIP drafts — a cleared draft is never resurrected (same-day pair, the instants-swapped mirror, the one-sided instant, and the reversed role)"
        status: pass
      - kind: manual_procedural
        ref: "Submit a CELPIP attempt signed in, reload, start the same task again — expect a blank editor"
        status: unknown
    human_judgment: true
    rationale: "The merge rule is proven by command, but nothing is wired to the server until 02-06 and no browser has exercised it; 02-06 and the 02-07 gate observe it."
  - id: D5
    description: "A corrupt stored CELPIP blob loads as the empty state; one malformed attempt is dropped while the rest of the task's history survives"
    requirement: PROG-03
    verification:
      - kind: unit
        ref: "scripts/verify-schema.mts#CELPIP PROG-03 (8 corrupt inputs, throw-freedom and value both asserted) and #CELPIP attempts — one malformed attempt costs only itself"
        status: pass
    human_judgment: false

# Metrics
duration: 38min
completed: 2026-07-28
status: complete
---

# Phase 2 Plan 05: CELPIP Gets a Column, a Contract and a Merge Summary

**The CELPIP attempt store now has a home in Postgres — one additive nullable column whose exact SQL was read before it can ever run — a zod contract that drops a single malformed attempt without costing the task its history, and a merge that de-duplicates attempts on a natural key while taking the drafts map whole from the side with the later millisecond instant, so a draft cleared on submission cannot pre-fill the next timed attempt.**

## Performance

- **Duration:** ~38 min
- **Tasks:** 3 of 3
- **Files modified:** 6 (0 created, 6 modified)

## Accomplishments

- **`User.celpipProgress`** — one nullable text column beside `progress`, with the comment naming its client counterpart. The change was proven before it was committed: `prisma migrate diff` against the **pinned** baseline `9f6f6df` produces exactly

  ```sql
  -- AlterTable
  ALTER TABLE "User" ADD COLUMN     "celpipProgress" TEXT;
  ```

  and nothing else. No default, no constraint, no rewrite — which is what keeps the container's `prisma db push --accept-data-loss` additive (D-09). The Dockerfile is byte-unchanged.

- **The CELPIP half of the contract** — `CelpipAttempt`, `CelpipProgressState` and `CELPIP_EMPTY` now live in `progress-schema.ts` beside the progress shapes, with `celpip-progress.ts` re-exporting them so both consuming components resolve unchanged. The state gains exactly **one** field: the D-01b millisecond instant. Not a day marker — this store has no `lastActive` to fall back to, and the submit-then-reconcile round trip happens inside one calendar day every single time, so a day marker would hand the draft carve-out to a tie-break instead of to the rule.

- **`celpipProgressSchema`** — the plain object constructor (D-08's strip-unknown default), `sanitizedRecord` for both maps, and a new **`sanitizedArray`** for the attempt lists: a malformed attempt is dropped while its siblings survive, and a task whose value is not an array is dropped rather than turned into an invented empty history. Essay text and draft text are capped at 20,000 characters and an over-length entry is **rejected as an entry, never truncated** — a silently truncated essay would read as the learner's own work.

- **The task-type union is bound without being imported.** `celpip.ts` re-exports the whole task bank, so `progress-schema.ts` takes the union through an `import(...)` *type annotation* — erased at compile time, invisible to the bundler and to `node --experimental-strip-types` — while the schema declares the literal pair. The drift guard binds them: a third CELPIP writing task type stops `tsc` until both sides agree.

- **`mergeCelpip`** — two rules over the existing primitives:
  - **`attempts`** union by key; per task the arrays concatenate, de-duplicate on the natural key (`taskId` + submission instant, joined on the module's canonical NUL separator) and sort ascending. The sort is documented as a correctness requirement: without a canonical order the join is not idempotent, and under D-02's per-load reconcile that is a write on every page view.
  - **`drafts`** taken **whole** from the side with the later instant. No key union, and no map-size rung ahead of the instant — the device that cleared is by definition the one holding *fewer* keys, so both shapes reopen `fca41b7`.
  - The instant itself is `laterInstant` of the two, **never** freshly generated.

- **`celpipEqual`** mirrors `progressEqual`, so 02-06's reconcile can skip a write-back that would change nothing.

- **The proofs grew:** `verify-schema.mts` 89 → **158** assertions, `verify-merge.mts` 3037 → **4313**. Every earlier progress assertion still passes.

## Task Commits

1. **Task 1: the additive column, with its SQL read first** — `528d249` (feat)
2. **Task 2: the CELPIP half of the shared runtime contract** — `ac82543` (feat)
3. **Task 3: mergeCelpip — de-duplicated attempts, protected drafts** — `8cfac30` (feat)

## Files Created/Modified

- `prisma/schema.prisma` — `celpipProgress String?` on `User`, plus the whitespace realignment `prisma format` applies to the model (see Deviation 2).
- `src/lib/progress-schema.ts` (+173) — the CELPIP shapes and their instant, `CELPIP_MAX_TEXT`, `sanitizedArray`, `celpipAttemptSchema`, `celpipProgressSchema`, `safeReadCelpip`, `CELPIP_SCHEMA_MATCHES_STATE`.
- `src/lib/progress-merge.ts` (+213) — `MERGE_CELPIP_EMPTY`, `stringRecord`, `boolRecord`, `celpipAttemptEntry`, `attemptKey`, `canonicalAttempts`, `celpipAttemptRecord`, `celpipCoerce`, `pickDraftsSide`, `mergeCelpip`, `celpipEqual`. Still zero runtime imports; still loads standalone under node.
- `src/lib/celpip-progress.ts` (−35/+22) — the three declarations removed and re-exported from the contract module; `formatDuration`, the store and every hook signature untouched.
- `scripts/verify-schema.mts` (+284) — six CELPIP assertion groups.
- `scripts/verify-merge.mts` (+376) — six CELPIP assertion groups including a ten-fixture algebra rotation.

## Decisions Made

1. **One marker, not two.** `CelpipProgressState` carries the D-01b instant and nothing day-shaped. The plan's original day-shaped field was already withdrawn by D-01b; this implementation reflects the amendment, and `pickDraftsSide` therefore has no `lastActive` rung at all (there is no such field on this state to consult).
2. **An attempt with no natural key is dropped at coercion.** Both halves of the key are required. An entry that cannot be de-duplicated is re-appended on every reconcile, so keeping it would grow the column without bound — this is an identity requirement, not validation strictness. My first pass asserted this only indirectly; mutation N8 exposed the gap and it is now asserted directly (see below).
3. **An unrecognised `taskType` drops the attempt** rather than defaulting to `"email"`, following 02-02's precedent: a fabricated value would show the learner the wrong task in their own history.
4. **Attempt arrays are canonicalised at coercion as well as in the join.** This makes `coerce` the canonical form, so `mergeCelpip(a, a)` equals `coerce(a)` exactly and a stored history that happens to be out of order does not produce a write on every load until it has been rewritten once.
5. **Rung 2 of the drafts ladder compares the whole canonical map, not the key list.** Drafts hold learner text, so two maps can share every key and still differ; ranking those equal would leave both sides preferring their own copy forever. Mutation N6 proves the assertion covering this has teeth.
6. **The natural key is joined on a literal NUL**, the same canonical separator `pickVocabSide` already uses in this module. It is invisible in an editor, so the function's doc comment now says so explicitly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] `src/lib/celpip-progress.ts` was edited, though it is not in this plan's `files_modified`**

- **Found during:** Task 2.
- **Issue:** The plan's action text explicitly instructs "have `src/lib/celpip-progress.ts` re-export the types so its existing importers keep resolving unchanged", but the file is absent from the frontmatter's `files_modified`. Moving the three declarations out without touching it leaves two conflicting definitions of the same shapes.
- **Fix:** The three declarations were removed and re-exported from `progress-schema.ts`; `formatDuration`, the `KEY` constant, the hook and every callback are byte-unchanged. Checked for a parallel-work collision first: `src/lib/celpip-progress.ts` belongs to **02-06**, which is wave 4 and had not started, so nothing was contended. The sibling running in parallel (02-04) owns `progress.ts`, `sync-queue.ts` and the two components — none of them touched here.
- **Files modified:** `src/lib/celpip-progress.ts`
- **Verification:** `npx tsc --noEmit`, `npm run lint` and `npm run build` all exit 0; both consuming components (`CelpipLanding.tsx`, `WritingSimulator.tsx`) import only `formatDuration` and `useCelpipProgress`, both unchanged.
- **Committed in:** `ac82543`

**2. [Rule 3 — Blocking] `npx prisma format` realigned the whole `User` model**

- **Found during:** Task 1.
- **Issue:** `celpipProgress` is 14 characters, one wider than the model's existing name column, so adding it leaves the file outside Prisma's canonical formatting. Running the formatter re-aligned every field in `User` (and `resetTokens`) — whitespace only, no semantic change.
- **Fix:** Accepted the formatter's output rather than hand-aligning against it, so the next person to run `prisma format` does not get a surprise diff. The generated SQL is unaffected, which the diff gate proves.
- **Files modified:** `prisma/schema.prisma`
- **Committed in:** `528d249`

**3. [Rule 3 — Blocking] The plan's `from "./celpip"` gate versus a literal type-only import**

- **Found during:** Task 2.
- **Issue:** The plan requires the task-type union to arrive "through a type-only import" *and* gates on `grep -c 'from "./celpip"' == 0` outside comments, whose acceptance note claims a type-only import "does not match". It does — `import type { CelpipTaskType } from "./celpip";` contains that exact text. The two instructions cannot both be satisfied by an import statement.
- **Fix:** The union is taken by an `import(...)` **type annotation** instead: `type CelpipTaskType = import("./celpip").CelpipTaskType;`. This satisfies the plan's actual intent more strongly than an import statement would — it is erasable syntax with no import statement at all, so there is no form of it a bundler or `node --experimental-strip-types` could ever resolve at runtime — and the drift guard binds the union exactly as the plan asks.
- **Files modified:** `src/lib/progress-schema.ts`
- **Verification:** the gate passes (0); `mergeCelpip`'s module and the contract module both still load standalone under node; mutation M5 (widening the schema's literal pair) fails 2 assertions.
- **Committed in:** `ac82543`

**4. [Rule 2 — Missing critical functionality] A directly-asserted drop rule for identity-less attempts**

- **Found during:** Task 3 mutation testing (N8).
- **Issue:** Removing the `taskId`/`date` requirement from `celpipAttemptEntry` produced **zero** assertion failures. No fixture carried an attempt with a valid `taskType` but no natural key, so the drop rule — the one that stops an unrecognisable attempt being re-appended on every reconcile — was structurally present but unproven.
- **Fix:** Added a fixture with three identity-less shapes (empty `date`, empty `taskId`, neither) beside one good attempt, asserting the good one survives alone and that a repeat merge does not append a second copy. The same mutation now fails 2 assertions.
- **Files modified:** `scripts/verify-merge.mts`
- **Committed in:** `8cfac30`

### Process deviations

**5. TDD gate commits collapsed into one commit per task**, as in 02-02. Tasks 2 and 3 are `tdd="true"`; the run's execution constraints specify one commit per task, so RED and GREEN were run as separate working-tree steps (both RED runs recorded below) and committed together.

**6. The RED runs were module-level, not assertion-level.** Both tasks add assertions that import exports which do not yet exist, so the RED run fails at module instantiation (`does not provide an export named …`) rather than with N failing assertions. That is a weak RED, which is exactly why every load-bearing behaviour was mutation-tested afterwards.

---

**Total deviations:** 4 auto-fixed (3 blocking, 1 missing coverage), 2 process notes.
**Impact on plan:** No scope creep. One file outside `files_modified` was touched, on the plan's own instruction and with no wave collision.

## Issues Encountered

- **A literal NUL byte was introduced into `src/lib/progress-merge.ts`, and it was the right call.** `attemptKey` joins the task id and the submission instant on `\0`, matching the separator `pickVocabSide` already uses on lines 568-569 — the module's existing convention, and unambiguous in a way a printable separator is not (a task id containing the separator could otherwise forge another task's key). The file therefore still reads as binary to `grep`; `grep -c` still counts correctly, and the plan's gates all use counts. The doc comment now names the separator because it is invisible in an editor. **Do not "fix" this.**
- **`prisma migrate diff` needed no database connection**, as the plan states, and wrote nothing to any datasource. `/tmp` paths worked from Git Bash under Windows without manual conversion.
- **The parallel sibling (02-04) landed three commits mid-run** (`b45a685`, `7a05578`, `0200507`). No `tsc`/`lint`/`build` failure was ever attributable to my files, and `npm run build` was not blocked by a lock on any attempt. Its files were never staged: each of my three commits touches only its own declared files.
- **Two type errors surfaced on the first `tsc` after Task 2's GREEN**, both mechanical: `export type { … } from "./progress-schema"` does not bring a name into local scope (so `addAttempt`'s annotation lost its type), and casting `CelpipAttempt` straight to `Record<string, unknown>` needs an `unknown` hop. Both fixed before the commit.

## Verification Results

Every `<verify>` block in the plan was run. All pass on the final tree.

| Gate | Task | Result |
|---|---|---|
| `npx prisma generate` | 1 | exit 0 |
| `git merge-base --is-ancestor 9f6f6df HEAD` | 1 | exit 0 — the pin is a genuine ancestor |
| baseline `grep -c 'celpipProgress'` outside comments | 1 | **0** — the pinned schema does not already contain the column |
| `npx prisma migrate diff … --script` | 1 | `ALTER TABLE "User" ADD COLUMN "celpipProgress" TEXT;` — one statement |
| `grep -c 'ADD COLUMN' … \| grep -qx 1` | 1 | **PASS (1)** |
| `grep -icE 'DROP\|ALTER COLUMN\|TRUNCATE\|RENAME' … \| grep -qx 0` | 1 | **PASS (0)** |
| `grep -v '^\s*//' prisma/schema.prisma \| grep -c 'celpipProgress' \| grep -qx 1` | 1 | **PASS (1)** |
| `git diff --name-only HEAD -- Dockerfile \| wc -l \| grep -qx 0` | 1 | **PASS (0)** |
| `node --experimental-strip-types scripts/verify-schema.mts` | 2 | exit 0 — **158/158** (was 89) |
| `grep -c 'celpipProgressSchema' src/lib/progress-schema.ts` | 2 | 3 |
| `grep -v '^\s*//' … \| grep -c 'from "./celpip"' \| grep -qx 0` | 2 | **PASS (0)** — see Deviation 3 |
| `node --experimental-strip-types scripts/verify-merge.mts` | 3 | exit 0 — **4313/4313** (was 3037) |
| standalone node import of `progress-merge.ts` | 3 | pass — `mergeCelpip` and `celpipEqual` are functions |
| `npx tsc --noEmit` | 1, 2, 3 | exit 0 (both drift guards armed) |
| `npm run lint` | 2, 3 | exit 0 |
| `npm run build` | 3 | exit 0 — all routes compiled |

### TDD gate evidence (RED before GREEN)

| Task | RED run | GREEN run |
|---|---|---|
| 2 | `SyntaxError: … does not provide an export named 'CELPIP_EMPTY'` | 158/158 |
| 3 | `SyntaxError: … does not provide an export named 'MERGE_CELPIP_EMPTY'` | 4313/4313 |

### Mutation testing (do the assertions have teeth?)

Ten mutations, each applied by a harness that **aborts if the pattern does not match** (a mutation that silently fails to apply reports zero failures and looks like a toothless assertion — the trap 02-02 hit). Each was reverted from a checked backup and confirmed with `diff -q` plus an md5 comparison; both modules finish byte-identical to their pre-mutation state.

`src/lib/progress-schema.ts` (md5 `ecd79ddd…` before and after all six):

| # | Mutation | Result |
|---|---|---|
| M1 | Drop the `updatedAt` declaration from `celpipProgressSchema` | **13 assertions + 27 tsc errors** (the drift guard) |
| M2 | `sanitizedArray` accepts a non-array and yields an empty history | 1 assertion |
| M3 | Remove the free-form prose length cap | 2 assertions |
| M4 | `z.object` → `z.looseObject` (keep unknown keys) | 2 assertions + 2 tsc errors |
| M5 | Accept any string as a CELPIP task type | 2 assertions |
| M6 | `safeReadCelpip` stops guarding `JSON.parse` | 6 assertions |

`src/lib/progress-merge.ts` (md5 `4a6dcecf…` before and after all nine):

| # | Mutation | Result |
|---|---|---|
| N1 | `drafts` key-unioned instead of taken whole — the rule D-01a forbids | **23 assertions** |
| N2 | `drafts` decided by map size *before* the instant — the rejected tie-break | **4 assertions** |
| N3 | Attempts concatenated without de-duplication | **294 assertions** |
| N4 | De-duplicated but left unsorted (the non-idempotent shape) | 13 assertions |
| N5 | The merge stamps a fresh instant | **498 assertions** |
| N6 | The drafts tie ranks two same-key maps on their key list only | 1 assertion |
| N7 | A null instant no longer loses to a real one | **412 assertions** |
| N8 | Identity-less attempts kept rather than dropped | **0 → 2** after the coverage gap was closed (Deviation 4) |
| N9 | A natural-key collision keeps whichever entry was seen first | 1 assertion |

N1, N2 and N7 are the three mutations that reproduce the `fca41b7` defect. All three are caught loudly.

### Truths from the plan's `must_haves`

| Truth | Status |
|---|---|
| The only schema change is one new nullable text column, proven by reading the SQL before it runs | **Proven** — the diff against the pinned baseline is one `ADD COLUMN` and nothing else, with the pin asserted to be an ancestor that does not already contain the column |
| Existing rows are untouched: no rewrite, no default, no constraint | **Proven from the SQL** — a bare nullable `ADD COLUMN`. The push itself runs at container start after merge; 02-07 is the gate in front of it |
| An attempt on two devices appears once, in a stable order, so repeated merges stop writing | **Proven** — de-duplication, ascending order and `celpipEqual` idempotence asserted, over 1000 associativity triples |
| A cleared draft is not resurrected, including same-day | **Proven** — the same-day pair, the instants-swapped mirror, the one-sided instant and the reversed role, with an explicit assertion that both instants fall on the same calendar day |
| A corrupt CELPIP blob loads as the empty state; one malformed attempt is dropped while the rest survives | **Proven** — 8 corrupt inputs (throw-freedom and value), plus one good attempt against three malformed ones with the sibling task untouched |

## Known Stubs

None. Nothing in this plan renders placeholder data or leaves a data source unwired. The column, the contract and the merge are complete and proven; **nothing writes to the column yet** — that is 02-06's declared scope, not a stub here.

## Threat Flags

None new. The mitigations this plan's register assigns are all in place:

- **T-02-21** (schema edit applied at container start) — the read-only diff against a pinned pre-phase baseline, asserted to be exactly one additive statement with nothing destructive, with the pin asserted to be an ancestor that does not already contain the column, the Dockerfile asserted unchanged, and the whole phase on a branch.
- **T-02-22** (draft merge) — whole-map selection on the instant, never a key union and never map size ahead of it; mutations N1, N2 and N7 prove the assertions catch each rejected shape.
- **T-02-23** (unbounded essay text) — 20,000-character caps on attempt text and draft text, over-length entries dropped rather than truncated; mutation M3 proves it.
- **T-02-24** (non-idempotent array merge causing a write per load) — natural-key de-duplication plus a canonical sort, with idempotence asserted; mutations N3 and N4 prove it.
- **T-02-25** (stored XSS through essay text) — untouched here; no rendering surface changed, and the re-check is 02-07's.
- **T-02-SC** — no package installs. Prisma stays at 6.19.3 and was deliberately not upgraded; zod was already a direct dependency.

## User Setup Required

None. No new dependency, no `Dockerfile` change, no environment variable, and **no database command was run** — `prisma db push` happens only at container start, after the branch merges.

## Next Phase Readiness

- **02-06 owns the one thing this plan deliberately did not do: stamping.** `mergeCelpip`'s draft carve-out only works because the clearing device carries the later instant, and **nothing stamps `CelpipProgressState.updatedAt` yet.** Until `persist()` in `celpip-progress.ts` stamps it — on `addAttempt`, `saveDraft` *and* `clearDraft`, through the single funnel, and **never** in the reconcile — every real merge falls through to the value rungs, where the larger map wins and the cleared draft comes back. 02-06's plan already specifies this (its gate counts exactly one `nowInstant(` outside comments in that file); it must not be dropped.
- **The pieces 02-06 needs are exported and proven:** `celpipProgressSchema`, `safeReadCelpip`, `CELPIP_EMPTY`, `CELPIP_MAX_TEXT`, `mergeCelpip`, `celpipEqual`, `MERGE_CELPIP_EMPTY`. `celpip-progress.ts` already re-exports the shapes, so its store can be hoisted without touching either component.
- **A note for the route handler:** the progress route's 1 MiB body cap and 60/min rate limit are per-handler, not shared. A CELPIP payload carries essay text and is the heavier of the two, so `/api/celpip-progress` needs its own bounds — the 20,000-character caps here bound one essay and one draft, not the number of attempts in the blob.
- **02-07's gate still owes the phase:** the container's first `db push` against the live database, the same-day clear-then-reload observed in a browser, and the sister's real attempt history surviving a device change.
- **Caveat on the requirement checkboxes:** PROG-01 and PROG-03 are this plan's declared requirements and the CELPIP half of both is proven by command, but no CELPIP byte has yet crossed the wire. Treat them as "implemented and unit-proven" until 02-06 wires the route and 02-07 signs the phase off.

## Self-Check: PASSED

| Claim | Verified |
|---|---|
| `prisma/schema.prisma` declares `celpipProgress` exactly once outside comments | yes — grep count 1 |
| `src/lib/progress-schema.ts` exports `celpipProgressSchema`, `safeReadCelpip`, `CELPIP_EMPTY`, `CelpipProgressState`, `CelpipAttempt` | yes — all present; the script imports and exercises every one |
| `src/lib/progress-merge.ts` exports `mergeCelpip` and `celpipEqual` | yes — asserted by the standalone node load |
| Commits `528d249`, `ac82543`, `8cfac30` present in history | yes |
| No file outside the plan's scope was staged | yes — only the six files listed, and `celpip-progress.ts` on the plan's own instruction (Deviation 1) |
| No deletions in any commit | yes — `git diff --diff-filter=D` empty for all three |
| Both mutated modules restored byte-identically | yes — md5 `ecd79ddd…` and `4a6dcecf…` confirmed before and after |

---
*Phase: 02-server-side-progress*
*Completed: 2026-07-28*
