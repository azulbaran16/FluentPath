---
phase: 02-server-side-progress
plan: 06
subsystem: api
tags: [celpip, useSyncExternalStore, prisma, postgres, zod, merge-on-write, retry-queue, rate-limit, mutation-testing]

# Dependency graph
requires:
  - phase: 02-server-side-progress
    provides: "02-01 — the module-store pattern behind useSyncExternalStore, the single persist() funnel, the per-load reconcile and merge-on-write; 02-03 — safeRead*/zod contract, the 413 cap and the 429 + Retry-After shape; 02-04 — sync-queue.ts with the CELPIP slot, ENDPOINTS.celpip and the { celpipProgress } envelope already asserted; 02-05 — celpipProgressSchema, safeReadCelpip, mergeCelpip, celpipEqual and the User.celpipProgress column"
provides:
  - "src/app/api/celpip-progress/route.ts — validated, merge-on-write GET and PUT with its OWN 2 MiB size cap and its own per-account rate-limit bucket"
  - "src/lib/celpip-progress.ts — one module-level CELPIP store behind useSyncExternalStore, the D-01b instant stamped in persist and nowhere else, writes routed through the shared queue's CELPIP slot on a 2s debounce"
  - "useCelpipSync() — the per-load CELPIP reconcile, mounted once app-wide beside the progress one"
affects: [02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "A count-based grep gate on a stamping helper does NOT pin WHERE the stamp lives; the gate must extract the funnel's body and assert the count inside AND outside it"
    - "A presence-count gate on an identifier survives the mutation that removes its CALL, because the import and the comments still match — gate on `name(` outside comments instead"
    - "A per-domain endpoint gets its own size cap and its own rate-limit bucket: the sibling's are per-handler, and an entry-level text cap bounds one entry, never the number of entries"
    - "Refusing a legitimate write is not free — the queue counts a 429 as a failure and three inside thirty seconds raise the not-synced indicator, so the limit is sized to never trip on real use and the size cap carries the abuse budget"

key-files:
  created:
    - src/app/api/celpip-progress/route.ts
  modified:
    - src/lib/celpip-progress.ts
    - src/components/ProgressSync.tsx

key-decisions:
  - "readLocal() now reads through safeReadCelpip rather than spreading a bare JSON.parse — the same change 02-03 made to the progress cache, verified against a representative Phase 1 blob before adopting"
  - "2 MiB body cap: double the progress route's, sized so the retry queue's permanent-413 drop can never be reached by a real learner"
  - "60 writes/min on its own bucket: a 2s debounce tops one tab out at 30/min, and a tighter limit would raise the D-06 indicator at someone who is mid-essay"
  - "The plan's `nowInstant( == 1` gate was kept AND strengthened with a funnel-pinning gate, because mutation X3 passes the plan's gate while reopening the write-back-on-every-load defect"

requirements-completed: [PROG-01, PROG-02, PROG-04, PROG-05]

coverage:
  - id: D1
    description: "The D-01b instant is authored in exactly one place in the CELPIP store — the mutation funnel — so clearDraft outranks the stale device and the reconcile's own commit never writes back"
    requirement: PROG-01
    verification:
      - kind: other
        ref: "grep -v '^\\s*//' src/lib/celpip-progress.ts | grep -c 'nowInstant(' => 1, PLUS the funnel-pinning gate (inside persist = 1, outside persist = 0). Mutations X1/X2/X3 each fail 2 gates; X3 passes the plan's count gate alone, which is why the second gate exists"
        status: pass
      - kind: unit
        ref: "The wiring scenario run against the real mergeCelpip: stamped => the cleared draft stays cleared after a same-day reconcile; unstamped => it comes back (the fca41b7 defect reproduced on demand)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A quiet authenticated load produces no CELPIP write — the reconcile commits without stamping, so the next load still finds both sides equal"
    requirement: PROG-01
    verification:
      - kind: unit
        ref: "The wiring scenario: reconcile against a settled server returns writesBack=false, twice in a row, with updatedAt unchanged"
        status: pass
      - kind: manual_procedural
        ref: "Load any page signed in with devtools Network open; expect exactly one GET /api/celpip-progress and no PUT"
        status: unknown
    human_judgment: true
    rationale: "Proven at the merge/commit arithmetic, but the request count has not been observed in a browser. 02-07 is the gate."
  - id: D3
    description: "CELPIP attempts made while signed out are still there after signing in, and appear on a second device"
    requirement: PROG-05
    verification:
      - kind: unit
        ref: "The wiring scenario: sign-in keeps both the local attempt and the account's; an empty second device receives the history, does not resurrect the cleared draft and writes nothing back"
        status: pass
      - kind: manual_procedural
        ref: "Practise a CELPIP task signed out, sign in, confirm the attempt is in the history; then open the account in a second browser"
        status: unknown
    human_judgment: true
    rationale: "The merge is proven by 4313 assertions and the wiring arithmetic is proven here, but no CELPIP byte has crossed the wire against a real database."
  - id: D4
    description: "The CELPIP route is IDOR-safe, bounded and rate-limited on its own budget, and never authors an instant of its own"
    requirement: PROG-01
    verification:
      - kind: other
        ref: "session.user.id is the sole key on the select and the update; one updateMany with the count===0 401; two 413 checks before any DB call; rateLimit keyed `celpip:${id}`; no nowInstant import. Sharpened gates catch mutations R1-R4"
        status: pass
      - kind: manual_procedural
        ref: "PUT a >2 MiB CELPIP body while signed in; expect 413 and an unchanged row"
        status: unknown
    human_judgment: true
    rationale: "The route imports next-auth and prisma, so it cannot be loaded standalone — the same limitation 02-03 recorded for the progress route. Unauthenticated GET and PUT were observed answering 401 against a running dev server; everything past the auth preamble is structural."
  - id: D5
    description: "The CELPIP landing and the writing simulator keep working with no change to how they consume the store"
    requirement: PROG-01
    verification:
      - kind: other
        ref: "Both files byte-unchanged; the hook returns the same nine keys; npx tsc --noEmit, npm run lint and npm run build all exit 0"
        status: pass
      - kind: manual_procedural
        ref: "Open a completed task after a reconcile and confirm a blank editor"
        status: unknown
    human_judgment: true
    rationale: "/celpip and /celpip/writing/email-noise-complaint both render 200 against a running dev server with zero errors in the log, but that is SSR of the empty state — client hydration of the hoisted store has not been watched in a browser."

# Metrics
duration: 55min
completed: 2026-07-28
status: complete
---

# Phase 2 Plan 06: The CELPIP Loop Closes Summary

**The beta user's CELPIP attempt history stops living only in her browser: a merge-on-write route with its own size cap and rate-limit bucket, a store hoisted to one module-level instance whose `persist` funnel stamps the D-01b instant in exactly one place, and a reconcile that runs once per authenticated load — with the stamp's *location*, not merely its count, pinned by a gate that a mutation proved the plan's own gate could not catch.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 2 of 2
- **Files modified:** 3 (1 created, 2 modified) — +419 / −38

## Accomplishments

- **`src/app/api/celpip-progress/route.ts`** — a direct sibling of the hardened progress route, line for line: the same `auth()` preamble and 401 body, a `content-length` pre-check and a byte check both answering 413 before any DB call, `safeParse` on the `celpipProgress` envelope refusing only a non-object body (D-08), a safe read of the stored blob, `mergeCelpip` joining stored with incoming, and one `updateMany` with the `count === 0` 401 for the stale-cookie case. `session.user.id` is the only key on both the read and the write; no client-supplied identifier appears anywhere.

- **It has its own bounds, which is the point 02-05 flagged.** The progress route's 1 MiB cap and 60/min limit are per-handler and do not cover this route, and 02-05's 20,000-character caps bound *one* essay and *one* draft — never the number of attempts in the blob, which only grows.
  - **2 MiB**, double the sibling's. The headroom matters in this direction specifically: the retry queue classifies 413 as **permanent** and discards the slot, so a cap a real learner could reach would stop her history syncing for good rather than merely slowing it. Two mebibytes holds ~1,700 real responses (150-200 words) or ~100 at the schema's per-entry maximum.
  - **60 writes/min on its own bucket** (`celpip:${id}`), so a CELPIP flood cannot spend the progress budget or vice versa. Deliberately not tighter: the client debounce is two seconds, so one tab tops out at 30/min, and the queue counts a 429 as a *failure* — three inside thirty seconds raise the D-06 "not synced" indicator at a learner who is mid-essay and whose work is in fact saving. The size cap carries the abuse budget; this bounds the loop.

- **The corrupt-blob log makes the trade sharper and more clearly worth taking.** As on the progress route the offending string is logged in full, once, because merge-on-write means the next save replaces the row and the log line is the only remaining copy. Here that string may be the learner's essay prose — which is exactly why discarding it silently is the worse outcome. It never reaches the response body.

- **`src/lib/celpip-progress.ts` hoisted** to one module-level snapshot behind `useSyncExternalStore`: a listeners set, a stable `EMPTY_SNAPSHOT` singleton for the server snapshot, and a lazy hydrate on first subscription — which let the mount effect and its `react-hooks/set-state-in-effect` suppression be **deleted**. The boolean-returning local write is kept exactly as it was; the simulator surfaces a visible warning on a false return and Phase 1 verified that path.

- **The one thing this plan could not drop: `persist` stamps.** Every mutation — `addAttempt`, `saveDraft` and above all `clearDraft` — passes through the one funnel, so the device that clears a draft on submission carries the later instant and wins `mergeCelpip`'s whole-map draft rule. `commit()` does not stamp, so the reconcile's own write-back is not triggered on every load. Both halves are now gate-pinned (below).

- **Writes go through the shared queue's CELPIP slot** on a **2-second** debounce rather than the progress store's 600 ms, so autosaving a draft does not push the essay on every pause in typing. The separate slot is what already stops an XP tick from carrying any essay at all.

- **`useCelpipSync()`** mirrors `useProgressSync()` exactly: authenticated only, at most once per tab per session behind a module-level flag re-armed on sign-out, flush the queue first (a queued snapshot means the server's copy is known-stale), GET, `mergeCelpip` against a freshly-read cache, commit, and write back **only** when `celpipEqual` says the merge moved the server's copy. The whole body is guarded so a failed reconcile leaves the local session intact, and it is silent (D-03). Mounted once, from `ProgressSync`, beside the progress reconcile.

- **Both consumers are byte-unchanged.** `CelpipLanding.tsx` and `WritingSimulator.tsx` destructure the same nine keys they always did.

## Task Commits

1. **Task 1: the validated, merge-on-write CELPIP route** — `0efaa27` (feat)
2. **Task 2: one store instance, synced through the shared queue** — `abb8b54` (feat)

## Files Created/Modified

- `src/app/api/celpip-progress/route.ts` (new, 196 lines) — `GET`, `PUT`, `isUnreadable`, `readStored`, `MAX_BODY_BYTES`, `WRITE_LIMIT`.
- `src/lib/celpip-progress.ts` (+223/−38) — the module store (`subscribe`/`getSnapshot`/`getServerSnapshot`/`commit`/`ensureHydrated`), `persist`, `putServer`, `scheduleServerWrite`, `useCelpipSync`, and `useCelpipProgress` with an unchanged public surface. `formatDuration`, the `KEY` constant and every action body are unchanged.
- `src/components/ProgressSync.tsx` (+6) — the `useCelpipSync` import and its single call, between the progress reconcile and the flush triggers.

## Decisions Made

1. **`readLocal()` now reads through `safeReadCelpip`** instead of `{ ...CELPIP_EMPTY, ...JSON.parse(raw) }`. This is the same change 02-03 made to the progress cache, and 02-05 wrote `safeReadCelpip`'s doc comment to name both call sites ("the Postgres column *and* the localStorage cache"). It matters more now than before the hoist: whatever `readLocal` returns is what goes over the wire and into the merge, so an unvalidated cache would have carried a garbage `updatedAt` — the field the whole draft rule reads — straight into the join. Verified against a representative Phase 1 blob before adopting (below), not assumed.

2. **2 MiB, not 1 and not 8.** Reasoned from the failure mode rather than from a round number: a 413 is a *permanent* rejection to the queue, so the cap must be unreachable by a real learner, and it is still bounded well below what a browser keeps in localStorage.

3. **60/min rather than something tighter.** The obvious instinct on a heavier payload is a tighter limit; that instinct is wrong here because a refused write is not free — it feeds the failure counter that raises the not-synced indicator. Sized so real use never trips it.

4. **The plan's stamping gate was kept and *strengthened*.** See mutation X3: `grep -c 'nowInstant('` returning 1 is satisfied just as well by a stamp that lives in `commit` — the reconcile — which is the write-back-on-every-load defect the gate exists to prevent. The count gate stays; a funnel-pinning gate now sits beside it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Reworded the route's header comment so the `updateMany` gate can pass**

- **Found during:** Task 1.
- **Issue:** The plan gates on `grep -c 'updateMany' src/app/api/celpip-progress/route.ts | grep -qx 1`. The header comment described the route as sharing the sibling's "`updateMany` + count check", so the file matched on 2 lines and the gate failed — the same collision 02-01 hit on the progress route (its Deviation 2).
- **Fix:** The comment now reads "same count-checked guarded write". Same meaning, without repeating the identifier. The call and the `count === 0` check are untouched.
- **Files modified:** `src/app/api/celpip-progress/route.ts`
- **Verification:** gate passes (1); `npx tsc --noEmit`, `npm run lint` and `npm run build` all exit 0 after the reword.
- **Committed in:** `0efaa27`

**2. [Rule 2 — Missing critical functionality] `readLocal()` routed through `safeReadCelpip`**

- **Found during:** Task 2.
- **Issue:** The plan's action text does not mention the local read, but hoisting the store changes what that read is *for*. Before this plan the value only rendered; now it is merged and uploaded. `{ ...CELPIP_EMPTY, ...JSON.parse(raw) }` validates nothing, so a cache holding `updatedAt: "garbage"` or `drafts: []` would have carried it into `mergeCelpip` — and `updatedAt` is the single field the whole-map draft rule selects on.
- **Fix:** `readLocal` calls `safeReadCelpip`, the contract 02-05 built for exactly these two call sites. The `try/catch` stays, because `getItem` itself throws in some privacy modes — a different failure from unreadable contents.
- **Verification:** run against a representative Phase 1 blob (no `updatedAt`, one attempt with essay text and a checked rubric, one saved draft) — 12/12 checks pass: the attempt, its prose, its rubric and the draft all survive verbatim, a missing instant becomes `null` rather than throwing, an unknown `taskType` attempt is dropped, a non-string draft is dropped while a good sibling draft survives, a malformed instant reads as `null` (ranked oldest — the safe direction), and garbage or absent input reads as the empty state.
- **Files modified:** `src/lib/celpip-progress.ts`
- **Committed in:** `abb8b54`

**3. [Rule 2 — Missing critical functionality] A funnel-pinning gate beside the plan's stamping count**

- **Found during:** Task 2 mutation testing (X3).
- **Issue:** Moving the stamp *out* of `persist` and *into* `commit` leaves `grep -v '^\s*//' … | grep -c 'nowInstant('` at exactly **1**. The plan's gate passes, `npx tsc --noEmit` passes, `npm run lint` passes — and every authenticated page load now stamps, writes back, and hands the drafts map to whichever device loaded the app last. That is the precise defect the gate was written to prevent, and the gate is blind to it.
- **Fix:** A second gate extracts the `persist` function body and asserts `nowInstant(` **inside** it is 1 and **outside** it is 0. Verification-side only; no code change.
- **Verification:** X1 (stamp removed), X2 (commit stamps too) and X3 (stamp relocated) each fail 2 gates. X3 fails **only** on the new pair.
- **Committed in:** n/a — a gate, recorded here and reproduced verbatim below.

**4. [Rule 2 — Missing critical functionality] The route's presence-count gates sharpened to call-site gates**

- **Found during:** Task 1 mutation testing (R1-R4).
- **Issue:** The plan's route gates are bare counts with no expected value (`grep -c 'mergeCelpip' …`). Replacing the merge with a plain overwrite — reopening T-02-28 and letting a stale snapshot regress the stored row — leaves the count at **2** (the import and a comment still match), and `tsc` and `lint` are both blind to it. The same held for dropping the size cap and dropping the rate limiter: **zero** failures across every gate the plan specifies.
- **Fix:** Gates now count the **call** (`mergeCelpip(`, `safeReadCelpip(`, `rateLimit(`) outside comments with an exact expected value, plus `MAX_BODY_BYTES` uses = 3 and the `!limit.ok` guard = 1.
- **Verification:** R1 (overwrite instead of merge), R2 (size cap dropped), R3 (rate limiter dropped) and R4 (`safeReadCelpip` replaced by a bare `JSON.parse`) each now fail exactly the gate that owns them; all four produced **zero** failures under the plan's gates as written.
- **Committed in:** n/a — gates, reproduced verbatim below.

---

**Total deviations:** 4 auto-fixed (1 blocking, 3 missing coverage).
**Impact on plan:** No scope creep. Every file touched is in `files_modified`; the three coverage additions are verification gates, not code.

## Issues Encountered

- **Both modules were restored byte-identically after every mutation**, confirmed by md5 before and after the whole run (`63cda007…` for the store, `8dd01d90…` for the route). Backups were written to an **explicit** path rather than `$TMPDIR`, which is unset in this shell and silently broke a prior executor's backups. Each mutation aborts if its pattern does not match or does not change the file — a mutation that silently fails to apply reports zero failures and looks like a toothless assertion.

- **The route cannot be exercised standalone**, exactly as 02-03 recorded for the progress route: it imports `next-auth` and `prisma`. What *was* observed against a running dev server is the auth preamble — `GET` and `PUT /api/celpip-progress` both answer **401** unauthenticated, matching `/api/progress`, with no database touched. Everything past the preamble is structural until 02-07.

- **The wiring itself could not be imported either** — `celpip-progress.ts` imports `react` and `next-auth/react`, and its relative imports are extensionless. So the funnel was **transcribed** into a scenario script and run against the *real* `mergeCelpip` and the *real* `nowInstant`. That is a model, not the module, which is why it is not committed: a transcription that drifts gives false confidence, and the property that actually needs guarding — where the stamp lives — is guarded by the funnel gate instead. What the scenario does establish is the arithmetic, including the negative case: with the stamp removed, the cleared draft **comes back**.

- **`git status` was dirty on arrival** (`AGENTS.md` modified, eight `term-*.png` deleted, several untracked `.planning/` and `.claude/` paths). None of it is mine; nothing outside my three files was ever staged, checked with `git diff --cached --name-only` on both commits, and neither commit deletes a file (`git diff --diff-filter=D` empty for both).

- **Nothing was pushed, no branch was created or switched, and `prisma db push` was never run.** The additive column still reaches the live database only at container start, after merge.

## Verification Results

Every `<verify>` block in the plan was run on the final tree. All pass.

| Gate | Task | Result |
|---|---|---|
| `npx tsc --noEmit` | 1, 2 | exit 0 |
| `npm run lint` | 1, 2 | exit 0 |
| `npm run build` | 1, 2 | exit 0 — compiled in 5.6s, `/api/celpip-progress` listed among the routes |
| `grep -c 'mergeCelpip' …/celpip-progress/route.ts` | 1 | 3 |
| `grep -c 'safeReadCelpip' …/celpip-progress/route.ts` | 1 | 2 |
| `grep -c 'updateMany' … \| grep -qx 1` | 1 | **PASS (1)** — after Deviation 1 |
| `grep -c 'session.user.id' …/celpip-progress/route.ts` | 1 | 6 |
| `grep -c 'rateLimit' …/celpip-progress/route.ts` | 1 | 2 |
| `grep -c 'useSyncExternalStore' src/lib/celpip-progress.ts` | 2 | 3 |
| `grep -v '^\s*//' … \| grep -c 'useState<CelpipProgressState>' \| grep -qx 0` | 2 | **PASS (0)** |
| `grep -c 'enqueue' src/lib/celpip-progress.ts` | 2 | 2 |
| `grep -c 'useCelpipSync' src/components/ProgressSync.tsx` | 2 | 2 |
| `grep -v '^\s*//' … \| grep -c 'nowInstant(' \| grep -qx 1` | 2 | **PASS (1)** |
| `grep -cE 'addAttempt\|saveDraft\|clearDraft\|draftFor\|attemptsForTask\|lastAttempt\|completedTasks' …` | 2 | 16 — every action still present |

### Added gates (Deviations 3 and 4) — reproduce with

```sh
F=src/lib/celpip-progress.ts
# The stamp must live INSIDE the funnel, and nowhere else. A count of 1 alone
# does not say where it is — mutation X3 proves that.
awk '/^function persist\(/{p=1} p{print} p&&/^}/{p=0}' $F | grep -c 'nowInstant('          # expect 1
awk '/^function persist\(/{p=1} p&&/^}/{p=0;next} !p{print}' $F \
  | grep -v '^\s*//' | grep -c 'nowInstant('                                              # expect 0

R=src/app/api/celpip-progress/route.ts
NC() { grep -v '^\s*//' $R | grep -v '^\s*\*'; }
NC | grep -c 'mergeCelpip('     # expect 1 — the CALL, not the import
NC | grep -c 'safeReadCelpip('  # expect 1
NC | grep -c 'rateLimit('       # expect 1
NC | grep -c 'MAX_BODY_BYTES'   # expect 3 — the declaration and both checks
NC | grep -c '413'              # expect 2
NC | grep -c '!limit.ok'        # expect 1
```

### Inherited invariants the prompt named — re-checked, not assumed

| Invariant | Result |
|---|---|
| `verify-merge` | **4313/4313** |
| `verify-schema` | **158/158** |
| `verify-queue` | **172/172** |
| `grep -v '^\s*//' src/lib/progress.ts \| grep -c 'nowInstant('` | **1** |
| `grep -c 'updateMany' src/app/api/progress/route.ts` | **1** |
| One GET per authenticated load per domain | **1 each** — `fetch("/api/progress")` and `fetch("/api/celpip-progress")` appear once each, both behind their own module-level `reconciled` flag; `<ProgressSync />` is still mounted once |
| `progress-merge.ts` / `progress-schema.ts` still React-free, alias-free, standalone-loadable | **yes** — both were imported directly by the two scenario scripts under `node --experimental-strip-types`; the deliberate NUL bytes in `progress-merge.ts` are untouched |

### Mutation testing (do the gates have teeth?)

Each mutation aborts if its pattern does not match or does not change the file. Both modules finish byte-identical (md5 confirmed before and after the whole run).

`src/lib/celpip-progress.ts` — md5 `63cda007…`:

| # | Mutation | Plan's gates | With the added funnel gate |
|---|---|---|---|
| X1 | `persist` stops stamping — the plan's one must-not-drop thing | 1 fails (count → 0) | **2 fail** |
| X2 | The reconcile's `commit` stamps too | 1 fails (count → 2) | **2 fail** |
| X3 | The stamp **moved** out of `persist` into `commit` — count stays 1 | **0 fail** ← blind, and `tsc`/`lint` blind too | **2 fail** |

`src/app/api/celpip-progress/route.ts` — md5 `8dd01d90…`:

| # | Mutation | Plan's gates | With the sharpened gates |
|---|---|---|---|
| R1 | PUT **overwrites** instead of merging (reopens T-02-28) | **0 fail** ← and `lint` does not flag the now-unused import | 1 fails |
| R2 | The size cap is dropped | **0 fail** | 1 fails |
| R3 | The rate limiter is dropped | **0 fail** | 1 fails |
| R4 | `safeReadCelpip` replaced by a bare `JSON.parse` | **0 fail** | 1 fails |

X3 and R1 are the two that matter: X3 reopens the write-back-on-every-load defect and R1 reopens stale-snapshot regression, and both were invisible to every gate the plan specifies.

### The wiring scenario (transcribed funnel, real `mergeCelpip`)

13/13 checks pass. Not committed — see Issues.

| Check | Result |
|---|---|
| stamped: the cleared draft stays cleared after a **same-day** reconcile | pass |
| stamped: `draftFor(task)` is empty → a blank editor | pass |
| stamped: the attempt survives the merge | pass |
| stamped: the merge moved the server copy, so it **is** written back | pass |
| **unstamped (X1): the cleared draft COMES BACK** — `fca41b7` reproduced | pass |
| a quiet load produces no write-back, and none on the next load either | pass |
| the instant is unchanged by reconciling | pass |
| signing in keeps the local attempt **and** the account's | pass |
| an empty second device receives the history, does not resurrect the draft, writes nothing back | pass |

### Truths from the plan's `must_haves`

| Truth | Status |
|---|---|
| A signed-in learner's CELPIP attempt history survives a browser cleanup and appears on a second device | **Proven at the merge and the wiring** — an empty second device receives the history and writes nothing back. No byte has crossed a real wire; 02-07 |
| CELPIP attempts made while signed out are still there after signing in | **Proven** — both sides' attempts survive the sign-in merge |
| Opening a completed task after a reconcile still gives a blank editor, including same-day | **Proven arithmetically**, with the negative case demonstrated. **Not observed in a browser** — it needs an authenticated session against the live database, which this run deliberately did not touch. 02-07's gate |
| A quiet authenticated load produces no CELPIP write | **Proven** — `writesBack=false` twice running, instant unchanged. The request count is 02-07's |
| Saving a draft does not re-upload the essay history on every keystroke, and an XP tick never re-uploads any essay | **Structural** — a 2s debounce on this domain and a separate queue slot per domain (asserted by `verify-queue`'s "the two domains hold independent slots") |
| The landing and the simulator keep working with no change | **Proven for compilation and SSR** — both files byte-unchanged, all three build gates green, both pages render 200 with zero dev-log errors. Client hydration of the hoisted store is 02-07's |

## Known Stubs

None. Nothing in this plan renders placeholder data or leaves a data source unwired. 02-04's forward reference — `ENDPOINTS.celpip` pointing at a route that did not exist — is **resolved** by this plan: the slot is now reachable and the `{ celpipProgress }` envelope it asserted is honoured exactly.

## Threat Flags

None new. The mitigations this plan's register assigns are all in place:

- **T-02-26** (IDOR) — no identifier is accepted from the client; `session.user.id` is the sole key on the `findUnique` and the `updateMany`, on both handlers.
- **T-02-27** (essay-bearing payload size) — a `content-length` pre-check and a byte check, both answering 413 before any DB call, on a cap sized so a real learner can never reach it; the per-entry text caps from 02-05 still apply; a per-account limiter on its own bucket. Mutations R2 and R3 prove the gates catch their removal.
- **T-02-28** (replayed snapshot) — merge-on-write plus the queue's sequence compare-and-clear. Mutation R1 proves the gate catches an overwrite.
- **T-02-29** (draft resurrection pre-filling a timed attempt) — the whole-map rule is now exercised end to end on the D-01b instant, stamped by `clearDraft` through the single funnel. X1/X2/X3 prove the gates catch every way of breaking it, and the wiring scenario reproduces the defect on demand when the stamp is removed. The empty-editor case in a real browser is still owed.
- **T-02-30** (essay re-upload per keystroke) — a separate queue slot per domain plus a 2s debounce here against the progress store's 600 ms.
- **T-02-SC** — no package installs. No new dependency, no `Dockerfile` change, no Prisma migration switch (D-09 untouched).

## User Setup Required

None. No dependency, no environment variable, no `Dockerfile` change, and **no database command was run** — `prisma db push` happens only at container start, after the branch merges.

## Next Phase Readiness

- **02-07 inherits three things that need a browser and a real database**, in priority order:
  1. **The empty editor.** Sign in, submit a CELPIP attempt, reload, start the same task again — expect a blank editor. This is the one truth of this plan that no command can close, and it is the defect `fca41b7` fixed. The arithmetic is proven and the stamp's location is gate-pinned; what is unobserved is the round trip.
  2. **One GET and no PUT on a quiet authenticated load** — with `/api/celpip-progress` now live there are two reconciles per load, one per domain, and neither should write back on a quiet load.
  3. **The container's first `prisma db push`**, which is when `User.celpipProgress` actually reaches the live database.
- **The two gate holes found here are general, not CELPIP-specific.** A count gate on a stamping helper does not pin *where* it lives, and a presence-count gate on an identifier survives the removal of its call. Both patterns appear in earlier plans in this phase; 02-07 may want to re-run the sharpened forms against `src/lib/progress.ts` and `src/app/api/progress/route.ts`.
- **`eslint` did not flag the unused `mergeCelpip` import** under mutation R1. Out of scope here (a project lint-config matter, pre-existing), but worth knowing: an unused import is not currently a signal in this repo.
- **Caveat on the requirement checkboxes:** PROG-01, PROG-02, PROG-04 and PROG-05 are this plan's declared requirements and the CELPIP code path for all four now exists end to end. Treat them as "implemented and unit-proven" until 02-07 signs the phase off — consistent with how 02-01, 02-03 and 02-05 recorded theirs.

## Self-Check: PASSED

| Claim | Verified |
|---|---|
| `src/app/api/celpip-progress/route.ts` exists and exports `GET` and `PUT` | yes — both present; the route is listed in `npm run build` output |
| `src/lib/celpip-progress.ts` exports `useCelpipProgress`, `useCelpipSync`, `formatDuration` | yes |
| `src/components/ProgressSync.tsx` calls `useCelpipSync()` | yes — import + call |
| Commits `0efaa27`, `abb8b54` present in history | yes |
| No file outside `files_modified` was staged | yes — `git diff --cached --name-only` checked on both commits |
| No deletions in either commit | yes — `git diff --diff-filter=D` empty for both |
| Both mutated modules restored byte-identically | yes — md5 `63cda007…` and `8dd01d90…` confirmed before and after |
| Nothing pushed, no branch change, no `prisma db push` | yes |

---
*Phase: 02-server-side-progress*
*Completed: 2026-07-28*
