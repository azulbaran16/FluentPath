---
phase: 02-server-side-progress
plan: 04
subsystem: sync
tags: [offline, retry-queue, localstorage, backoff, jitter, useSyncExternalStore, useEffectEvent, page-lifecycle, a11y]

# Dependency graph
requires:
  - phase: 02-server-side-progress
    provides: "02-01 — the module-level store behind useSyncExternalStore, the single persist() funnel and merge-on-write PUT that makes a replayed snapshot harmless"
  - phase: 02-server-side-progress
    provides: "02-03 — 429 + Retry-After, the 1 MiB 413 cap and the 400-only-for-a-non-object contract this queue classifies against"
provides:
  - "src/lib/sync-queue.ts — a durable coalesced write queue: one localStorage slot per domain, monotonic sequence numbers, compare-and-clear, full-jitter backoff that caps the DELAY and never the attempt count, failure classification and a subscribable status"
  - "The store's authenticated write path routed through the queue instead of an unchecked fetch"
  - "Every flush trigger — connectivity, page-hidden, page-hide backstop, backoff timer, app load — wired exactly once in src/components/ProgressSync.tsx"
  - "src/components/SyncIndicator.tsx — the D-06 indicator, silent until failure persists, invisible to anonymous learners"
  - "scripts/verify-queue.mts — 172 assertions, mutation-tested"
affects: [02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "The queue is a transport, not a mutation site — it forwards the snapshot byte for byte, so the D-01b instant is still authored in exactly one place"
    - "Storage reached only through two internal helpers reading globalThis.localStorage, so a node harness can install a memory-backed store before importing the module"
    - "flushQueue() hands a mid-flight caller the SAME promise rather than resolving instantly, so a caller that reschedules itself on settle cannot busy-loop"
    - "The status publishes on real changes only — the change-only emit is what stops the subscriber-driven timer from feeding itself"
    - "Deterministic tests over a controllable Date.now / Math.random / fetch triple installed before the dynamic import"

key-files:
  created:
    - src/lib/sync-queue.ts
    - src/components/SyncIndicator.tsx
    - scripts/verify-queue.mts
  modified:
    - src/lib/progress.ts
    - src/components/ProgressSync.tsx

key-decisions:
  - "classifyFailure defaults to retry for anything unexpected — the never-lose direction; only an explicitly permanent 4xx drops"
  - "A connectivity hint resets the backoff but NOT the consecutive-failure count; only a real success clears the indicator"
  - "401 clears the whole queue and resets the counter: the queued state is auth-bound, and the local cache still holds the same snapshot for the next sign-in to merge back"
  - "The load-time order is drain-then-reconcile, awaited, because a queued snapshot means the server copy is known-stale"
  - "The backoff timer is armed from the queue's own nextAt with a 250 ms floor, never polled"

patterns-established:
  - "Pattern: a change-only status emit plus a promise-sharing single-flight is what makes an event-driven retry timer safe; either one alone permits a busy loop"
  - "Pattern: a verification harness that overrides console.error must route its OWN failure output around the capture, or a failing assertion becomes invisible"

requirements-completed: [PROG-04]

coverage:
  - id: D1
    description: "A write that fails is queued durably and is never discarded for age — only a classified-permanent rejection drops it, and that path logs"
    requirement: PROG-04
    verification:
      - kind: unit
        ref: "scripts/verify-queue.mts — 'no silent loss — fifty consecutive failures still keep the payload' + the 400/413 drop-with-a-log groups"
        status: pass
    human_judgment: false
  - id: D2
    description: "A newer write cannot be thrown away by an older flush that was still in the air"
    requirement: PROG-04
    verification:
      - kind: unit
        ref: "scripts/verify-queue.mts — 'compare-and-clear' groups, both directions; mutation M1 (always clear on success) fails 4 assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "A two-second network blip shows the learner nothing; the indicator appears only after three consecutive failures AND thirty seconds without a success, and leaves on the next success"
    requirement: PROG-04
    verification:
      - kind: unit
        ref: "scripts/verify-queue.mts — the three 'staleness' scenarios (both conditions, each alone, and recovery)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Retries are spread with full jitter under a 60 s ceiling that saturates at attempt 6, and Retry-After wins when the server sends one"
    requirement: PROG-04
    verification:
      - kind: unit
        ref: "scripts/verify-queue.mts — 'backoff' group (bounds for attempts 0-20) + the two 429 scenarios"
        status: pass
    human_judgment: false
  - id: D5
    description: "Progress recorded while the network is down survives the tab close and reaches the server on the next load"
    requirement: PROG-04
    verification:
      - kind: unit
        ref: "scripts/verify-queue.mts asserts the persisted shape in localStorage directly, without going through the module, and replays it after a failure"
        status: pass
      - kind: manual_procedural
        ref: "Sign in, go offline in devtools, complete a scenario, close the tab, come back online, reopen — expect exactly one PUT /api/progress carrying the offline work"
        status: unknown
    human_judgment: true
    rationale: "Every link in the chain is asserted under node against a memory-backed store, but the browser's real localStorage, the real tab lifecycle and the real network have not been exercised. 02-07 is the gate."
  - id: D6
    description: "The flush triggers fire once for the whole app and never use the legacy unload events or the beacon transport"
    requirement: PROG-04
    verification:
      - kind: other
        ref: "grep -c 'flushQueue' src/components/ProgressSync.tsx => 4; grep -c '<ProgressSync' src/ => 1 mount; the beforeunload/sendBeacon gates return 0 outside comments"
        status: pass
      - kind: manual_procedural
        ref: "Switch tabs with a pending queue and confirm exactly one PUT on hide, not two (visibilitychange + pagehide are both wired)"
        status: unknown
    human_judgment: true
    rationale: "The module-level single-flight makes a double send impossible in one tab by construction, but that has not been watched in a browser."
  - id: D7
    description: "An anonymous learner on the public /celpip route never sees a sync indicator"
    requirement: PROG-04
    verification:
      - kind: other
        ref: "SyncIndicator returns null unless `authed`; nothing enqueues unless `authed` (progress.ts scheduleServerWrite gate, unchanged)"
        status: pass
    human_judgment: true
    rationale: "Structurally airtight — two independent gates — but no browser has rendered it."

# Metrics
duration: 40min
completed: 2026-07-28
status: complete
---

# Phase 2 Plan 04: The Durable Sync Queue Summary

**A failed progress write now survives the failure, the tab close and the reboot: `persist()` hands the snapshot to a coalesced localStorage queue that retries it on a full-jitter curve, never discards it for age, cannot lose a newer write to an older flush still in the air, and tells the learner only after failure has genuinely persisted — with all of it proven by 172 assertions under plain node and eleven mutations to show they have teeth.**

## Performance

- **Duration:** ~40 min
- **Tasks:** 3 of 3
- **Files modified:** 5 (3 created, 2 modified) — +1312 / −13

## Accomplishments

- **`src/lib/sync-queue.ts`** — one slot per domain under `fluentpath:sync:v1`, each carrying the snapshot body, a monotonic sequence number, an attempt count and the next permitted attempt. Framework-free, zero runtime imports, storage reached only through two internal helpers, so plain node can exercise it with a memory-backed store installed on the global.
- **The delay is capped, never the attempt count.** Fifty consecutive 503s leave the payload exactly where it was. Only a rejection classified permanent (400, 413, and any other unexpected 4xx that is not an auth or timing code) discards a slot, and that path logs at error level with the module prefix — under D-08 it should be unreachable, so an occurrence is a bug worth seeing.
- **Compare-and-clear.** The success path clears a slot only if the stored sequence number still matches what was sent. The dangerous interleaving — flush reads slot, request in flight, learner completes a scenario, response arrives, flush clears the slot — is asserted directly by enqueueing a newer body from inside the fetch stub.
- **Full jitter**, base 1 s, ceiling 60 s saturating at attempt 6, with `rand` injectable so the bounds are asserted rather than sampled. `Retry-After` wins over the local curve when 02-03's rate limiter sends one.
- **`putServer` enqueues instead of firing a fetch nobody read.** The snapshot goes in exactly as `persist()` produced it, D-01b instant included and unmodified — `grep -c 'nowInstant('` on `progress.ts` is still **1**.
- **The reconcile drains before it fetches.** A queued snapshot means the server's copy is known-stale, so merging against it would join with data the queue is about to overwrite anyway.
- **`ProgressSync` owns every flush trigger, once.** Connectivity restored (reset the backoff, then flush — the browser's online flag is used strictly as a hint), the page-hidden transition (the last reliably observable point, where the page is still fully alive and a plain fetch works), page-hide as a best-effort backstop, and one timeout armed from the queue's own earliest next-attempt time so a flush still happens behind a captive portal. No polling. No legacy unload-time events. No beacon.
- **`SyncIndicator`** — a small fixed pill, bottom-left and out of the reading column, gold caution token tinted with a `color-mix` against transparent the way `SkillPill.tsx` does, ink-soft text on a strong-line border, `role="status"` with a polite live region, entrance animation behind `motion-safe`. It renders nothing unless the learner is signed in *and* the status is stale, and it disappears the moment a write lands.

## Task Commits

1. **Task 1: The persisted, coalesced write queue and its executable proof** — `b45a685` (feat)
2. **Task 2: Route every write through the queue and own every flush trigger in one place** — `7a05578` (feat)
3. **Task 3: The discreet not-synced indicator** — `0200507` (feat)

## Files Created/Modified

- `src/lib/sync-queue.ts` (new, 486 lines) — `enqueue`, `flushQueue`, `backoffDelay`, `classifyFailure`, `subscribeStatus`, `getStatus`, plus `getServerStatus`, `nextAttemptAt`, `resetBackoff`, `resetQueue`.
- `scripts/verify-queue.mts` (new, 661 lines) — 172 assertions across 21 scenarios.
- `src/components/SyncIndicator.tsx` (new, 43 lines).
- `src/lib/progress.ts` (+32/−13) — the queue import, the rewritten `putServer`, and the drain-then-reconcile ordering. Nothing else moved.
- `src/components/ProgressSync.tsx` (+103) — `useFlushTriggers` and the indicator mount.

## Decisions Made

1. **`classifyFailure` defaults to `retry`.** Only `401`/`403` stop and only an explicitly permanent 4xx drops; `408`, `425` and `429` retry, and anything unrecognised retries. An unexpected status keeps the payload rather than discarding it, which is the direction PROG-04 points.

2. **A connectivity hint resets the backoff but not the failure count.** The research is explicit that `navigator.onLine` reporting `true` is untrustworthy, so an `online` event is a hint to stop waiting, not evidence that anything can be reached. Clearing the consecutive-failure count there would blink the D-06 indicator off on every network change a phone reports while walking past a Wi-Fi access point. Only a real success clears it. Asserted, and mutation-tested.

3. **401 clears the whole queue, both domains, and resets the counter.** The queued state is auth-bound and the learner is now anonymous; spinning against 401s is exactly what the research warns about, and leaving a "not synced" indicator up for someone who is signed out would be a lie. This is not data loss: the local cache still holds the same snapshot, and the next authenticated load merges it back into the account.

4. **The load-time order is drain-then-reconcile, and it is awaited.** The ordering is the point, and nothing renders on that path — the local state has already hydrated synchronously, so the learner waits on nothing. Accepted cost: on a network that hangs rather than fails, the reconcile is delayed behind the flush. It would have failed anyway, and `reconciled` behaves exactly as it did before.

5. **The status emits only on a real change, and `flushQueue()` returns the in-flight promise to a mid-flight caller.** Neither is a micro-optimisation. `ProgressSync` re-arms its single timer both from the subscription and when the flush it started settles; with an unconditional emit, a no-op flush would wake the timer, which would flush, which would emit. With an instantly-resolving mid-flight call, a settle-driven reschedule would spin at zero delay. The pair is what makes an event-driven retry timer safe without polling, and a 250 ms floor on the timer covers the case where full jitter legitimately draws a delay of zero.

6. **`storageOk` is tracked but not rendered.** A broken localStorage on its own is not learner-actionable — if the network is healthy the write still lands, it just would not have survived the tab. When it *does* matter, the accompanying network failures trip `stale` and the indicator appears anyway. The flag is exported for 02-07 to inspect.

7. **The indicator takes `authed` as a prop** rather than calling `useSession()` itself, so there is exactly one session read at that mount point and the anonymous-learner gate is visible at the call site.

## Deviations from Plan

**None.** All three tasks executed as written, with two clarifications worth recording rather than deviations:

- The plan lists six exports for the queue; four more were added (`getServerStatus`, `nextAttemptAt`, `resetBackoff`, `resetQueue`) because the plan's own action text requires the behaviours behind them — a stable server snapshot for `useSyncExternalStore`, a timer armed from the queue's earliest next-attempt time, a connectivity reset, and the 401 clear. `resetQueue` is the 401 path's implementation and is reused by the harness between scenarios; nothing is exported solely for testing.
- Task 2's `npm run build` and `npx tsc --noEmit` were **red at the time of the Task 2 commit**, entirely on `scripts/verify-merge.mts` importing `mergeCelpip` / `celpipEqual` / `MERGE_CELPIP_EMPTY` from the sibling plan 02-05's in-flight `progress-merge.ts`. `next build` reported `✓ Compiled successfully` on the same run — the failure was the type-check step, on a file this plan does not own. Both gates were re-run after the sibling settled and both exit 0; the results in the table below are from the final tree.

## Issues Encountered

- **The proof passed on its first real run**, which is not evidence. Eleven mutations were applied to a verified backup and reverted with a checked `cp`, finishing with `diff -q` confirming the module was restored byte-identically (the explicit-path guard 02-02 learned the hard way):

  | # | Mutation | Failures |
  |---|---|---|
  | M1 | Clear the slot on success unconditionally (compare-and-clear removed) | 4 |
  | M2 | Drop the payload after 5 attempts | 1 |
  | M3 | Staleness uses OR instead of AND | 2 |
  | M4 | `resetBackoff` also clears the consecutive-failure count | 1 |
  | M5 | 429 classified as permanent | 2 |
  | M6 | A storage throw swallowed and reported as a successful persist | 2 |
  | M7 | Backoff ceiling uncapped | 23 |
  | M8 | `Retry-After` ignored in favour of the local curve | 1 |
  | M9 | Defensive read replaced by a bare `JSON.parse` | 1 |
  | M10 | The two domains collapsed into one shared slot | 1 |
  | M11 | Status publishes unconditionally (no change-only emit) | **0 → 2** |

- **M11 exposed a real coverage gap.** The change-only emit is load-bearing — it is half of what stops the `ProgressSync` timer feeding itself — and nothing asserted it. Two assertions were added ("a queue event that changes nothing wakes nobody", "and the cached snapshot is not replaced either"); the mutation now produces 2 failures.

- **The harness was hiding its own failures.** The script overrides `console.error` to capture the module's permanent-rejection log, and `ok()` was reporting failures through the same channel — so the first run showed "7 of 170 FAILED" with no visible FAIL lines, and the captured failure text then contaminated the log-count assertions. `ok()` now reports through a saved reference to the real `console.error`. Node's `ExperimentalWarning` for type stripping also routes through `console.error`, so the capture filters on the `[sync-queue]` prefix and passes everything else through.

- **A null dereference in the harness masked later assertions.** Under M1 the run crashed on `persisted().progress!.body` after the first FAIL, hiding three more. All 23 non-null assertions were replaced with a `slot(domain)` accessor returning impossible sentinel values, so a regression that empties a slot now reports four readable FAIL lines instead of a stack trace.

- **The sibling plan 02-05 was editing the same working tree throughout** (`src/lib/progress-schema.ts`, `src/lib/celpip-progress.ts`, `scripts/verify-merge.mts`, `scripts/verify-schema.mts`). Nothing outside this plan's five files was ever staged — verified on every commit with `git diff --cached --name-only`. The sibling's own suites were re-run against the final tree and both pass.

- **The `motion-safe` entrance was verified in the compiled CSS**, not assumed: `.motion-safe\:animate-\[rise_0\.4s_ease-out_both\]` appears inside `@media (prefers-reduced-motion:no-preference)` in `.next/static/chunks/*.css`, and `@keyframes rise` (already in `globals.css`) resolves it. No new CSS was added.

## Verification Results

Every `<verify>` block in the plan was run on the final tree. All pass.

| Gate | Task | Result |
|---|---|---|
| `node --experimental-strip-types scripts/verify-queue.mts` | 1 | exit 0 — **172/172 assertions passed** |
| `npx tsc --noEmit` | 1, 2, 3 | exit 0 |
| `npm run lint` | 1, 2, 3 | exit 0 (zero warnings) |
| `npm run build` | 2, 3 | exit 0 — compiled in 6.1s, 26 routes |
| `grep -v '^\s*//' src/lib/sync-queue.ts \| grep -c 'sendBeacon' \| grep -qx 0` | 1 | **PASS (0)** |
| `grep -v '^\s*//' src/lib/sync-queue.ts \| grep -c 'beforeunload' \| grep -qx 0` | 1 | **PASS (0)** |
| `grep -c 'enqueue' src/lib/progress.ts` | 2 | 2 |
| `grep -c 'flushQueue' src/components/ProgressSync.tsx` | 2 | 4 |
| `grep -c 'visibilitychange' src/components/ProgressSync.tsx` | 2 | 2 |
| `grep -v '^\s*//' src/components/ProgressSync.tsx \| grep -c 'beforeunload' \| grep -qx 0` | 2 | **PASS (0)** |
| `grep -v '^\s*//' src/lib/progress.ts \| grep -c 'sendBeacon' \| grep -qx 0` | 2 | **PASS (0)** |
| `grep -c 'role="status"' src/components/SyncIndicator.tsx` | 3 | 1 |
| `grep -c 'aria-live' src/components/SyncIndicator.tsx` | 3 | 1 |
| `grep -c 'SyncIndicator' src/components/ProgressSync.tsx` | 3 | 2 |
| `grep -icE '#[0-9a-f]{3,8}' src/components/SyncIndicator.tsx \| grep -qx 0` | 3 | **PASS (0)** |

### Inherited invariants the prompt named — re-checked, not assumed

| Invariant | Result |
|---|---|
| `grep -v '^\s*//' src/lib/progress.ts \| grep -c 'nowInstant('` | **1** — the queue enqueues the snapshot's instant unmodified; only `persist` stamps |
| `grep -c 'updateMany' src/app/api/progress/route.ts` | **1** |
| One GET per authenticated load | unchanged — the reconcile still owns the only `fetch("/api/progress")` GET, behind the same module-level guard |
| Sibling suites still green | `verify-merge.mts` 4313/4313, `verify-schema.mts` 158/158 |

### Truths from the plan's `must_haves`

| Truth | Status |
|---|---|
| Progress recorded while the network is down is still queued after the tab is closed and reaches the server on the next load | **Proven per link** — the persisted slot is asserted by reading localStorage directly, and the load path drains before it reconciles. The real tab lifecycle is 02-07's |
| A two-second network blip shows the learner nothing | **Proven** — three failures inside three seconds leave `stale` false; the threshold needs thirty seconds as well |
| After repeated failures a discreet not-synced indicator appears, and it disappears the moment a write succeeds | **Proven for the status transition**, in both directions. The render is structural (`stale` is the only condition beyond `authed`) |
| A write is never dropped for exceeding a retry count; only a genuinely permanent rejection discards it, and that is logged | **Proven** — fifty consecutive 503s keep the payload; 400 and 413 drop with exactly one `[sync-queue]` line each |
| A queued write and a live write racing each other cannot lose the newer one | **Proven** — a newer body enqueued from inside the in-flight request survives, and the matching-sequence case still empties the slot |
| An anonymous learner on the public /celpip route never sees a sync indicator | **Structural, two independent gates** — nothing enqueues unless `authed`, and the indicator returns null unless `authed`. Not observed in a browser |

## Known Stubs

**One forward reference, deliberate and inert.** `ENDPOINTS.celpip` points at `/api/celpip-progress`, which does not exist yet — 02-05 creates it. Nothing enqueues to the CELPIP slot until then, so the constant is unreachable at runtime; it is documented as such in the module comment, and the verification script exercises the route and envelope directly so 02-05 inherits an asserted contract rather than a guess.

No placeholder data is rendered anywhere in this plan, and no component is left with an unwired data source.

## Threat Flags

None new. The mitigations this plan's register assigns are all in place and asserted:

- **T-02-16** (retry-loop DoS) — full jitter under a 60 s ceiling, asserted for attempts 0–20; 02-03's per-account 60/min limit backstops it, and its `Retry-After` is honoured over the local curve.
- **T-02-17** (silent loss of a queued write) — the delay is capped, never the attempt count; fifty failures asserted to keep the payload; the only discard path logs.
- **T-02-18** (replay of a stale snapshot) — merge-on-write from 02-01 plus sequence compare-and-clear, asserted in both directions.
- **T-02-19** (identity claim in the payload) — the wire format is `{ progress }` and nothing else; no account identifier is ever assembled here, the server derives identity from the session alone, and a 401 mid-replay stops the loop and clears the auth-bound state instead of spinning.
- **T-02-20** (queued snapshot readable in localStorage) — accepted as the register states: the same device already holds the same data as the offline cache.
- **T-02-SC** — no package installs. The queue is built on `fetch`, `localStorage`, `visibilitychange` and `pagehide`, all inside the framework's stated browser baseline.

## User Setup Required

None — no dependency, no schema change, no `Dockerfile` change (D-09 untouched), no environment variable.

## Next Phase Readiness

- **02-05 (CELPIP store):** the CELPIP slot, its route (`/api/celpip-progress`) and its envelope (`{ celpipProgress }`) are already wired and asserted. All 02-05 has to do is create the route and call `enqueue("celpip", snapshot)` from its own persist funnel; the coalescing, backoff, race guard and indicator come for free. Keep the CELPIP snapshot's own D-01b instant out of the queue's hands for the same reason the progress one is — the queue does not stamp.
- **02-06:** `getStatus().storageOk` is exported and currently unrendered. If the phase wants a "this browser cannot save at all" message, the flag is there.
- **02-07 (verification gate):** four things need a browser. In priority order — (1) offline work surviving a tab close and landing on the next load; (2) exactly one PUT on tab-hide, not two, despite both `visibilitychange` and `pagehide` being wired; (3) the indicator appearing after a sustained outage and vanishing on recovery; (4) that an anonymous `/celpip` session never renders it. Everything upstream of the browser is asserted under node.
- **A note for whoever revisits the queue:** the two properties that make the event-driven timer safe are non-obvious and easy to "simplify" away — the status emits only on a real change, and `flushQueue()` hands a mid-flight caller the same promise rather than resolving instantly. Removing either produces a busy loop that no type-checker will catch. Both are commented at the source and one is now asserted.

## Self-Check: PASSED

| Claim | Verified |
|---|---|
| `src/lib/sync-queue.ts` exists with all six planned exports | yes |
| `src/components/SyncIndicator.tsx` exists | yes |
| `scripts/verify-queue.mts` exists and exits 0 | yes — 172 assertions |
| `src/lib/progress.ts` and `src/components/ProgressSync.tsx` modified | yes |
| Commits `b45a685`, `7a05578`, `0200507` present in history | yes |
| No file outside `files_modified` was staged | yes — `git diff --cached --name-only` checked on all three commits |
| No deletions in any commit | yes — `git diff --diff-filter=D` empty for all three |

---
*Phase: 02-server-side-progress*
*Completed: 2026-07-28*
