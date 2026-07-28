# Phase 02: Server-Side Progress — Research

**Researched:** 2026-07-28
**Domain:** Offline-first client state sync · runtime validation · deterministic merge · additive Postgres schema change
**Confidence:** HIGH (most findings verified by executing code in this session against the repo's own installed dependencies)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** When local progress and server progress differ, merge **field by field** —
  union of `completed` and `srs` keys, `max()` for `xp` and `streak`, highest CEFR
  `level`, most recent `lastActive`. Nothing is ever discarded. This replaces today's
  behavior at `src/lib/progress.ts:148-155`, where anonymous local progress is silently
  dropped whenever the account already holds data. Chosen because PROG-05 says
  "without loss" literally, and the user wants that read literally.
  — **Reversibility:** costly — once learners' accounts hold merged state, reverting to
  server-wins cannot recover which fields came from where; the merge would have to be
  treated as the new baseline.

- **D-02:** Reconcile on **every authenticated app load**, not only on first sign-in.
  Chosen to cover the second-device case (stale local cache vs newer server) and prior
  offline work, which is what the ROADMAP's "same progress in a different browser"
  criterion actually requires.

- **D-03:** No user-facing merge dialog. The merge is automatic and silent — the user
  rejected asking the learner to choose between two progress sets as confusing.

- **D-04:** CELPIP Writing attempts (`fluentpath.celpip.v1`, built in Phase 1) **are in
  scope** for this phase. Rationale from the user: the first beta user is actively
  practising and would lose her attempt history on a device change or browser cleanup,
  and Phase 1 deliberately shaped the store for this migration.

- **D-05:** CELPIP attempts live in a **separate additive JSON column**
  (`User.celpipProgress`), not inside the existing `User.progress` blob and not in a
  normalized table. Keeps the two domains decoupled, avoids re-uploading full essay
  texts on every XP save, and stays additive so `db push` remains safe.
  — **Reversibility:** costly — moving the column later means a data migration for every
  user who has practised by then.

- **D-06:** Sync failures are **silent until they persist**. Retry in the background;
  only after repeated failures show a discreet "not synced" indicator. A two-second
  network blip must not interrupt a learning session.

- **D-07:** Pending writes survive tab close — the queue is **persisted to localStorage**
  and replayed on the next app load or when connectivity returns. Chosen because
  PROG-04's "no silent loss" is otherwise unmet: network failures often coincide with
  the learner closing the browser.

- **D-08:** The progress API validates against the `ProgressState` schema and **strips
  unknown fields, saving the rest** — it does not reject the whole payload. Browsers
  can hold a cached older version of the app; a deploy that adds a field must never
  start failing saves for those clients.

- **D-09:** Schema changes stay **additive only**; the Dockerfile keeps
  `prisma db push --accept-data-loss`. The user declined switching to real Prisma
  migrations during a phase that already touches live user data. Adding nullable
  columns is safe under that flag.
  — **Reversibility:** reversible — additive nullable columns can be dropped without
  affecting existing rows.

### Claude's Discretion

The user explicitly delegated these:

- What to do with **corrupted stored progress** beyond PROG-03's requirement (load a
  safe default rather than crash) — e.g. whether to preserve the corrupt string for
  diagnosis before overwriting. Today `src/app/api/progress/route.ts:17` calls
  `JSON.parse` with no try/catch.
- **Retry policy specifics** — backoff curve, attempt ceiling, and what counts as
  "persistent" failure before the indicator appears.
- **Validator shape** — zod vs hand-rolled runtime guard, and where the schema lives so
  client and server share one definition.
- **Placement and visual treatment** of the "not synced" indicator (must follow the
  Traveler's Journal design tokens in `src/app/globals.css`).
- Whether the merge function is shared with the CELPIP store or written separately.

### Deferred Ideas (OUT OF SCOPE)

- **Normalizing progress into relational tables** (`Scenario`, `SrsItem`, `Attempt`) —
  DATA-01, already deferred to the v2 backlog. Recorded again here because the CELPIP
  storage question (D-05) surfaced it a second time.
- **Switching to real Prisma migrations** (`migrate deploy`) and removing
  `--accept-data-loss` — declined for this phase (D-09), still an open concern in
  `.planning/codebase/CONCERNS.md`.
- **Automated tests for the sync path** — TEST-01, v2 backlog. This phase should still
  bring targeted verification for what it touches, per the milestone-wide constraint.
- **Multi-tab concurrent writes** and a **merge audit log** — raised as possible extra
  gray areas; the user chose not to explore them.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROG-01 | Signed-in learner's progress (completions, XP, streak, CEFR level, SRS queue, attempts) persisted in Postgres as the authoritative copy; localStorage is cache/offline buffer | §"Shared Validation Schema (Q2)" defines the wire contract; §"Additive Prisma Column (Q4)" confirms `User.celpipProgress` is safe; D-04 resolves "attempts" to include CELPIP |
| PROG-02 | Learner logs in from a different browser/device and sees identical progress | §"Merge Function (Q3)" — merge must be idempotent + commutative or D-02's per-load reconcile diverges between devices; §"Pitfall 1" (hook is not a shared store) is the blocker |
| PROG-03 | API validates payloads against the ProgressState schema; malformed writes rejected without corrupting stored data; corrupted stored data loads as a safe default | §"Shared Validation Schema (Q2)" — verified zod strip + per-field `.catch()` + `sanitizedRecord()`; §"Pitfall 4" (unguarded `JSON.parse` at route.ts:17) |
| PROG-04 | Failed progress writes are retried automatically — no silent data loss | §"Offline Retry Queue (Q1)" — coalesced localStorage queue, `visibilitychange` flush, full-jitter backoff, compare-and-clear against live-write races |
| PROG-05 | Anonymous local progress migrates into the account on first sign-in without loss | §"Merge Function (Q3)" — field-by-field table incl. the tombstone fields (`vocab`, `drafts`) where "union" is *wrong* |
</phase_requirements>

---

## Summary

Everything this phase needs is already installed. **zod 4.4.3 is a direct dependency**
(`package.json:24`, verified at runtime), and its default `z.object()` behaviour is
*exactly* D-08 — it strips unknown keys and keeps the rest. The only genuinely new
runtime code is a pure, dependency-free merge module and a small persisted write queue.
**No new npm package is warranted.**

The three things that will actually decide whether this phase succeeds are not the ones
the phase description emphasises:

1. **`useProgress()` is not a shared store.** It is a plain hook with its own `useState`,
   called independently by ~15 components (`src/lib/progress.ts:112`; consumers listed in
   §"Pitfall 1"). On `/review` alone, four instances mount at once. D-02 ("reconcile on
   every authenticated app load") therefore means *four* `GET /api/progress` calls, four
   merges, four retry queues writing the same localStorage key, and four `setState`s that
   already diverge from one another today. The store must be hoisted to a module-level
   singleton behind `useSyncExternalStore` (verified present in React 19.2.4) **before**
   any of the sync work lands, or every later task multiplies the bug.

2. **A union merge is wrong for two fields.** `markVocab(id, false)` *deletes* a key
   (`src/lib/progress.ts:298`) and `clearDraft()` *deletes* a key
   (`src/lib/celpip-progress.ts:125`). A key-union merge resurrects both — and resurrecting
   a cleared CELPIP draft re-introduces the exact defect Phase 1 found and fixed in commit
   `fca41b7` (a submitted answer pre-filling the next timed attempt). Every other record
   field in both stores is genuinely add-only and safe to union.

3. **The merge must be idempotent, and the server must run it too.** D-02 reruns the merge
   on every page load; D-07 replays queued snapshots out of order. If the server *overwrites*
   (as `route.ts:45` does today), a replayed stale snapshot silently regresses the account.
   If the server *merges* with the same function, replay order stops mattering and the whole
   system converges. Reusing one merge on both sides is the single highest-leverage decision
   available here.

**Primary recommendation:** hoist `useProgress`/`useCelpipProgress` to a module-level store
behind `useSyncExternalStore`, put the zod schema + merge in one alias-free pure module
importable by client, route handler, and a `node --experimental-strip-types` verification
script, and make `PUT /api/progress` merge-on-write rather than overwrite.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Authoritative progress storage | Database (Postgres `User.progress`, `User.celpipProgress`) | — | PROG-01 names Postgres as authoritative |
| Payload validation / unknown-field stripping | API (`src/app/api/progress/route.ts`) | Browser (same schema, for localStorage reads) | PROG-03 says "the API validates"; the client cannot be trusted, but reuses the schema to satisfy "corrupted stored progress loads as a safe default" |
| Conflict merge (D-01) | API — on every write | Browser — on reconcile (D-02) | Running it only on the client makes replay order significant (§Q1); running it on both makes writes convergent and idempotent |
| Optimistic state + local cache | Browser (module store + localStorage) | — | Established pattern: "the learner never waits on the network" (CONTEXT §Established Patterns) |
| Retry queue + backoff + flush triggers | Browser | — | D-07 explicitly locates the queue in localStorage; the server has no knowledge of pending client writes |
| "Not synced" indicator | Browser (client component under `AppShell`) | — | Purely presentational; `src/components/AppShell.tsx:10-16` is the shared authenticated chrome |
| Session/auth gate | API (`auth()` at `route.ts:9`, `:23`) | Browser (`useSession()` at `progress.ts:113`) | Existing pattern; anonymous learners stay local-only |
| Schema shape change | Database (Prisma `db push` at container start) | — | Dockerfile:53 runs it before `node server.js` |

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

`CLAUDE.md` is a single `@AGENTS.md` include. Extracted directives:

| Directive | Source | Compliance note for the planner |
|-----------|--------|--------------------------------|
| "This is NOT the Next.js you know… Read the relevant guide in `node_modules/next/dist/docs/` before writing any code" | `AGENTS.md:3` | Done for this phase — see §"State of the Art". Route Handler API (`export async function PUT(req: Request)`) is **unchanged** and the repo's existing shape at `route.ts:21` is current per `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md:33` |
| GSD workflow has priority over Superpowers in this repo | `AGENTS.md` §Workflow | — |
| Curriculum single source of truth is `src/lib/curriculum.ts` | `AGENTS.md` §FluentPath | Merge module must not duplicate curriculum knowledge; `TOTAL_SCENARIOS` is imported at `progress.ts:5` |
| "Progress is local-first in `src/lib/progress.ts` (localStorage); swap for a DB in Fase 5" | `AGENTS.md` §FluentPath | **Stale** — the DB swap is this phase (Phase 2), and `putServer` already exists at `progress.ts:128`. Worth correcting in AGENTS.md as part of this phase |
| Design tokens in `src/app/globals.css` ("Traveler's Journal": Fraunces + Hanken Grotesk) | `AGENTS.md` §FluentPath | The "not synced" indicator must use existing tokens — `--muted` (`globals.css:15`) for the resting state, `--gold` (`:23`) for warning; do **not** introduce a new colour |
| Repo conventions | `.planning/codebase/CONVENTIONS.md` | Use `.safeParse()` not `.parse()` (`CONVENTIONS.md:270`); `@/` path alias not relative paths in app code (`:81`); `console.error("[module] …")` prefix (`:157`); UPPER_SNAKE_CASE module constants (`:20`) |

---

## Standard Stack

### Core — everything already installed

| Library | Installed version | Purpose | Why standard here |
|---------|-------------------|---------|-------------------|
| `zod` | **4.4.3** | Runtime validation of the progress payload, shared client/server | Already a direct dependency (`package.json:24`); already the repo's validation idiom (`src/auth.ts`, `src/app/api/signup/route.ts`, `CONVENTIONS.md:267-281`). Its default object behaviour *is* D-08 |
| `react` | **19.2.4** | `useSyncExternalStore` for the hoisted store; `useEffectEvent` for non-reactive effect logic | Both verified present at runtime (see §"Environment Availability") |
| `@prisma/client` / `prisma` | **6.19.3** | `User.celpipProgress` column | Existing ORM; `migrate diff` gives a read-only pre-flight (§Q4) |
| Web platform (`localStorage`, `online`/`offline`, `visibilitychange`) | — | Retry queue + flush triggers | Zero dependency; all inside Next 16's stated browser floor (Chrome/Edge/Firefox 111+, Safari 16.4+ — `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md:112`) |

**Installation:** none. `npm install` is not required for this phase.

### Alternatives Considered

| Instead of | Could Use | Tradeoff — and why it was rejected |
|------------|-----------|-----------------------------------|
| `zod` (classic) on the client | `zod/mini` (verified importable from 4.4.3) | Smaller client bundle, but a *functional* API (`z.catch(schema, def)` vs `.catch(def)`). Using mini on the client and classic on the server means **two schema definitions** — precisely the drift D-08/PROG-03 need to avoid. Use classic on both sides |
| `zod` | Hand-rolled type guards | No new dep either way (zod is already installed), but a hand-rolled validator has to re-implement strip-unknown, per-field fallback, and record sanitisation with no compile-time link to the TS type. Zod gives the drift guard for free (§Q2). **Reject** |
| Custom retry queue | `workbox-background-sync` / a service worker Background Sync | Adds a dependency and a service worker to an app that has none; Background Sync is Chromium-only and would not satisfy PROG-04 on Safari (the beta user's likely device). **Reject** |
| Custom retry queue | TanStack Query with persisted mutations | Adds a large dependency and a paradigm the codebase does not use anywhere. **Reject** |
| `node --experimental-strip-types` for verification scripts | `tsx` devDependency | `tsx` works on Node 20 (the Docker base, `Dockerfile:6`); strip-types needs Node ≥22.6 and the dev machine has 22.14.0. But there is **no CI** in this repo (`no .github`), so the scripts only ever run on the dev machine alongside `npm run build`/`npm run lint`. **Reject the dependency**, note `tsx` as the escape hatch if that ever changes |

---

## Package Legitimacy Audit

**This phase installs zero new packages.** The audit below covers the one library the
research recommends leaning on, which is already a direct dependency.

| Package | Registry | Declared | Installed (verified) | Source Repo | Verdict | Disposition |
|---------|----------|----------|----------------------|-------------|---------|-------------|
| `zod` | npm | `^4.4.3` (`package.json:24`) | 4.4.3 — `node -p "require('zod/package.json').version"` | github.com/colinhacks/zod | OK | Already installed; no action |

**Packages removed due to [SLOP] verdict:** none — no package was newly recommended.
**Packages flagged as suspicious [SUS]:** none.
**`npx playwright` (§Q5)** is *not* a package.json dependency — Phase 1 used it ephemerally
via `npx` (`.planning/phases/01-celpip-writing-practice/01-06-SUMMARY.md` front-matter:
`verified_by: agent-driven browser session (Playwright)`). Confirmed in this session that
`npx playwright --version` resolves 1.62.0 into the npx cache without touching `package.json`.
If the planner wants browser checks, keep it ephemeral.

---

## Offline Retry Queue (Q1)

### The shape of the write, and why it changes everything

`persist()` sends the **entire state snapshot** on every save
(`src/lib/progress.ts:172` → `putServer(next)` → `PUT /api/progress` with
`{ progress: s }` at `:132`). It is not a delta and not an append. Two consequences:

- **Duplicates are free.** Replaying the same snapshot twice is a no-op. There is nothing
  to de-duplicate, unlike an append-style API.
- **Out-of-order is fatal — unless the server merges.** A queued snapshot from T1 arriving
  after a live write from T2 will *regress* the server, because `route.ts:45` does
  `data: { progress: JSON.stringify(progress) }` — a blind overwrite.

**Recommendation: make `PUT` merge-on-write** using the same merge function as D-01
(read stored → validate → merge with incoming → write). This turns the write into a
semilattice join, at which point replay order, duplicate delivery, and multi-tab
double-sends are all harmless by construction. It is also the only way §"Merge Function"'s
idempotence guarantee holds end to end.
*Cost, stated honestly:* server-side merge makes non-monotone changes unpropagatable —
un-marking a vocab card or lowering `goalXp` would be undone. See §Q3 for the two fields
this affects and the carve-out.

### Queue structure — coalesce to depth 1 per domain

```
localStorage["fluentpath:sync:v1"] = {
  progress: { seq: 41, body: {...ProgressState}, attempts: 2, nextAt: 1753… } | null,
  celpip:   { seq: 12, body: {...CelpipProgressState}, attempts: 0, nextAt: 0 } | null
}
```

- **One slot per domain, overwritten by the newest snapshot.** Because each entry is a full
  snapshot of the same key, keeping older entries is pure waste. This also bounds
  localStorage growth — critical, because a CELPIP snapshot carries full essay texts
  (`CelpipAttempt.text` at `src/lib/celpip-progress.ts:22`; Phase 1 verification recorded
  a single 1192-char attempt) and an unbounded queue would hit the ~5 MB quota.
- **Separate slots for `progress` and `celpip`** — this is what makes D-05's stated
  rationale ("avoids re-uploading full essay texts on every XP save") actually true. If both
  domains shared one queue entry, every XP tick would re-upload every essay.
- **Reuse `celpip-progress.ts`'s write contract.** `writeLocal()` at `:58-65` returns a
  boolean instead of swallowing the `setItem` throw. The queue writer must do the same — if
  the queue itself cannot be persisted, the retry is in-memory-only and the UI should
  degrade to the "not synced" state rather than silently pretending.

### Detecting connectivity

`navigator.onLine` is **inherently unreliable as a positive** — MDN documents LAN-only
connections, Windows reachability heuristics, and virtual adapters all reporting `true`
with no internet, and explicitly advises *"you should not disable features based on the
online status, only provide hints"* `[CITED: developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine]`.
`false` is a trustworthy negative.

**Therefore:**
- Subscribe to `window.addEventListener("online", …)` / `"offline"` — the events fire on
  `window`, not `document` `[CITED: same]`.
- On `online`: reset the backoff attempt counter to 0 and flush immediately. This is the
  event's only job — a *hint to wake up*.
- On `offline`: do not cancel anything, just skip the attempt and let the backoff timer
  continue. Never gate a write on `onLine === true`.
- **Do not poll.** The backoff timer is already the fallback for the case where `online`
  never fires (captive portal, VPN flap). Polling would duplicate it and burn battery.

### Flush on hide / unload

Chrome's Page Lifecycle guidance: the transition to **hidden** is *"the last event that's
reliably observable by the page"* and should be treated as the last chance to save state;
`pagehide`, `beforeunload` and `unload` are **not reliably fired, especially on mobile**
`[CITED: developer.chrome.com/docs/web-platform/page-lifecycle-api]`.

**Therefore:**
- Primary flush trigger: `document.addEventListener("visibilitychange", …)` when
  `document.visibilityState === "hidden"`. At this point the page is still fully alive — a
  **plain `fetch()` works**, no special unload API needed.
- Backstop only: `window.addEventListener("pagehide", …)`.
- Do **not** use `beforeunload` or `unload` (Chrome is actively deprecating `unload`).

### Is `navigator.sendBeacon` worth using? — **No.**

| Constraint | Evidence | Why it disqualifies it here |
|-----------|----------|----------------------------|
| POST only | *"The method always sends data as an HTTP POST request"* `[CITED: MDN Navigator/sendBeacon]` | The route is `PUT` (`route.ts:21`). Would need a POST alias purely for the beacon |
| ~64 KiB queued-data cap; returns `false` when it cannot queue | *"The total size of queued data is limited to 64 KiB (65,536 bytes)"* `[CITED: MDN]` | A CELPIP snapshot with a handful of ~1.2 KB essays plus JSON overhead is the same order of magnitude and grows monotonically. Silent-ish failure is exactly PROG-04's prohibition |
| Response unreadable | *"…that need access to the server response, instead use fetch() with keepalive"* `[CITED: MDN]` | Cannot confirm the server accepted, so cannot correctly clear the queue slot |
| D-07 already covers the gap | CONTEXT.md D-07 | The only thing a beacon buys is "the write that would have been lost at unload". The persisted queue replays that write on the next load. The beacon adds a second, weaker code path for a case already solved |

`fetch(url, { keepalive: true })` fixes the method/response problems but is **Baseline only
since November 2024** (Safari 18.2, Dec 2024) `[CITED: MDN Request/keepalive; Safari 18.2 release notes]`,
i.e. **below Next 16's stated Safari 16.4+ floor**
(`version-16.md:112`). It cannot be relied on either.

**Verdict: flush at `visibilitychange → hidden` with a plain `fetch`; let the persisted
queue be the safety net. Zero new API surface, no browser-support cliff.**

### Backoff curve and attempt ceiling

Capped exponential backoff alone still clusters retries; **jitter** spreads them
`[CITED: aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/]`. Full jitter is
the AWS-blogged default.

```
delay(n) = random(0, min(CAP, BASE * 2**n))
BASE = 1_000 ms
CAP  = 60_000 ms       // n=6 saturates
```

- **Attempt ceiling: cap the *delay*, not the attempt count.** PROG-04 says "no silent
  loss". Since the queue is coalesced to one slot per domain, retaining it indefinitely
  costs a bounded amount of localStorage. Dropping the payload after N attempts would be
  exactly the silent loss the requirement forbids.
- **Classify the failure before retrying** — this is the one place an unbounded retry is a
  bug:

  | Outcome | Action |
  |---------|--------|
  | Network error / `fetch` rejects | Retry with backoff |
  | 5xx | Retry with backoff |
  | 429 | Retry with backoff (honour `Retry-After` if present) |
  | **401** (`route.ts:11`, `:25`, `:48`) | Stop. The session is gone. Drop to anonymous local-only, clear the queue's auth-bound state, do **not** spin |
  | **400** (`route.ts:30`, `:34`) | Permanent — the same body will fail forever. `console.error("[progress-sync] …")` and drop the slot. Under D-08 this should be near-unreachable; if it fires, it is a genuine bug worth seeing |

- **"Persistent failure" threshold for the D-06 indicator:** show it when
  `consecutiveFailures >= 3` **and** `Date.now() - lastSuccessAt > 30_000`. Three full-jitter
  attempts at BASE=1 s average well under 10 s, so a two-second blip never trips it (D-06's
  stated requirement). Hide it immediately on the next success.

### Avoiding a replay/live-write race

The dangerous interleaving: flush reads slot → request in flight → user completes a scenario
→ `persist()` overwrites the slot → response arrives → flush clears the slot → **the newer
write is lost**.

**Guard: monotonic sequence number + compare-and-clear.**

```ts
const pending = readQueue().progress;      // { seq, body }
const sent = pending.seq;
const res = await fetch(...);
if (res.ok) {
  // Only clear if nothing was enqueued while we were in flight.
  updateQueue((q) => (q.progress?.seq === sent ? { ...q, progress: null } : q));
}
```

- `seq` increments on every enqueue and is stored **in localStorage**, so it is shared
  across tabs and survives reload.
- Combined with server-side merge, this makes the queue safe under: duplicate delivery,
  out-of-order arrival, tab close mid-flight, and two tabs flushing simultaneously.
- **Single-flight guard:** keep a module-level `inFlight` boolean so a `visibilitychange`
  flush and a backoff-timer flush in the same tab cannot both fire. (Across tabs they can —
  harmless once the server merges. CONTEXT explicitly defers multi-tab; server-merge is what
  makes deferring it safe.)

---

## Shared Validation Schema (Q2)

### Is zod already a dependency? — Yes.

`zod@^4.4.3` at `package.json:24`; installed 4.4.3 (verified:
`node -p "require('zod/package.json').version"` → `4.4.3`). It is already the repo's
validation idiom (`CONVENTIONS.md:267-281`, `src/app/api/signup/route.ts`, `src/auth.ts`).
**No new library.**

One honest cost: zod is currently **server-only** — every importer today is a route handler
or `src/auth.ts` (verified by grepping every `from "zod"` in `src/`). Importing the schema
into `src/lib/progress.ts` (a `"use client"` module reachable from nearly every page) puts
zod in the client bundle for the first time. See §"Verification" for how to measure it;
baseline captured this session is **1,170,768 bytes across 30 chunks** in
`.next/static/chunks` after `next build`.

### Strip-unknown behaviour — verified against the installed 4.4.3

All four rows below were **executed in this session**, not recalled:

| Construct | Input | Output | D-08 fit |
|-----------|-------|--------|----------|
| `z.object({a,b})` (**default**) | `{a:1,b:"x",extra:"nope"}` | `{"a":1,"b":"x"}` | ✅ **This is D-08.** No modifier needed |
| `z.looseObject({a})` | `{a:1,extra:"yes"}` | `{"a":1,"extra":"yes"}` | ❌ keeps unknown fields |
| `z.strictObject({a})` | `{a:1,extra:"y"}` | `safeParse().success === false` | ❌ this is the rejected option |
| `z.record(z.string(), Item)` | one bad entry | `success === false` for the **whole record** | ⚠️ see below |

> **Zod v4 note:** the v3 spellings `.passthrough()` / `.strict()` are superseded by the
> top-level `z.looseObject` / `z.strictObject` constructors, both confirmed exported from
> the installed build. D-08 needs neither.

### Stripping unknown *keys* is not enough — the two gaps

**Gap 1: a known field with the wrong type fails the whole payload.**
`z.object()` only strips *unknown* keys. If a stale client sends `xp: "NaN"`, `safeParse`
fails and the save is rejected — the outcome D-08 exists to prevent. Fix: per-field
`.catch(default)`.

```
z.object({ xp: z.number().catch(0), streak: z.number().catch(0) })
  .safeParse({ xp: "NaN", streak: 3, unknownField: 1 })
→ success: true, data: { xp: 0, streak: 3 }         [VERIFIED: executed this session]
```

**Gap 2: one bad record entry destroys the whole record.**
`z.record(z.string(), SrsItem).safeParse({good:…, bad:{box:"x"}})` → `success: false`
(verified). Two candidate fixes were tested:

- `z.record(z.string(), SrsItem.catch(FALLBACK))` → keeps the bad key with a **fabricated**
  value: `{"good":{...},"bad":{"box":0,"due":"1970-01-01"}}` (verified). Rejected — it
  invents SRS schedule data.
- **Drop-bad-entries transform** → `{"good":{"box":1,"due":"d"}}`, the junk key silently
  gone (verified). **Recommended** — it is "strip what doesn't fit, save the rest" applied
  to record entries, which is D-08's own principle one level down.

```ts
// Verified to compile clean under `tsc --strict` and to behave as documented at runtime.
function sanitizedRecord<T extends z.ZodType>(item: T) {
  return z.unknown().transform((raw): Record<string, z.infer<T>> => {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
    const out: Record<string, z.infer<T>> = {};
    for (const [k, v] of Object.entries(raw)) {
      const p = item.safeParse(v);
      if (p.success) out[k] = p.data as z.infer<T>;
    }
    return out;
  });
}
```

**Gap 3: a non-object top-level payload.** `ProgressSchema.safeParse("hello")` → `false`
(verified). That one *should* stay a 400 — it is not a stale-client scenario, it is a
malformed request. `ProgressSchema.catch(EMPTY).parse("hello")` → `EMPTY` (verified) is the
right treatment for **reading corrupted DB/localStorage data** (PROG-03's "loads as a safe
default"), not for accepting a write.

**This asymmetry is the crisp rule the planner needs:**
- **Reading** stored data (DB blob at `route.ts:17`, localStorage at `progress.ts:80-91`) →
  `.catch(EMPTY)` at the top level. Never throws, never crashes.
- **Writing** (PUT body) → `.safeParse` with per-field `.catch` and `sanitizedRecord`;
  400 only when the body is not an object at all.

### Where the schema lives

A **new pure module**, e.g. `src/lib/progress-schema.ts`, with three hard constraints:

1. **No `"use client"` directive** — it must be importable from the route handler.
2. **No React / next-auth / next imports** — otherwise it cannot be imported by a plain
   node script (§Q5).
3. **No `@/` path aliases inside it** — verified this session that `node --experimental-strip-types`
   fails with `ERR_MODULE_NOT_FOUND: Cannot find package '@/lib'`. Use relative imports
   *within* this module; app code still imports it via `@/lib/progress-schema` as
   `CONVENTIONS.md:81` requires.

Note `src/lib/achievements.ts:2` already does `import type { ProgressState } from "./progress"`.
If the interface moves, re-export it from `progress.ts` so that import keeps working, or
update the one call site.

If the CEFR ordering is needed for the merge, do **not** import
`src/lib/content/diagnostic.ts` — its `RANK` is module-private (`const`, not exported, at
`:73`) and importing that file drags the whole diagnostic question bank into the client
bundle. Declare a local `const CEFR_ORDER = ["A2","B1","B2","C1"] as const` in the schema
module (it must handle unranked strings anyway — see §Q3).

### Keeping the TS type and the runtime schema from drifting

Two viable strategies. **Both were compiled in this session.**

- **(a) Schema is the source of truth:** `export type ProgressState = z.output<typeof progressSchema>`.
  Zero drift by construction. Downside: with `sanitizedRecord` transforms and `.catch()`
  everywhere, the hover type becomes unreadable, and the documented interface at
  `progress.ts:33-51` (which carries the field comments the codebase relies on) is lost.

- **(b) Keep the hand-written interface + a compile-time equality guard.** **Recommended.**

```ts
type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _drift: Eq<z.output<typeof progressSchema>, ProgressState> = true;
void _drift;
```

  Verified: compiles clean (`tsc --noEmit --strict`, exit 0) when aligned, and fails with
  `error TS2322: Type 'true' is not assignable to type 'false'` the moment a field is added
  to one side and not the other. The guard is caught by the repo's existing
  `npx tsc --noEmit` check — the same one Phase 1 ran
  (`01-06-SUMMARY.md`: *"`npx tsc --noEmit` was also run clean"*). No new tooling.

**Gotcha:** `.catch()` and `.default()` make `z.input<>` ≠ `z.output<>`. Use `z.input<>`
for "what a (possibly stale) client may send" and `z.output<>` for "what our code consumes".
The drift guard must compare against `z.output`.

---

## Merge Function (Q3)

### Required algebraic properties — and why they are not optional

D-02 reruns the reconcile on **every authenticated app load**. D-07 replays snapshots in
arbitrary order. The merge must therefore be a **join over a semilattice**:

| Property | Statement | What breaks without it |
|----------|-----------|------------------------|
| **Idempotent** | `merge(a, merge(a,b)) === merge(a,b)` | XP/streak inflate on every page reload. **This is the decisive argument for `max()` over `sum()` in D-01** — a summing merge would double XP on each of D-02's reconciles |
| **Commutative** | `merge(a,b) === merge(b,a)` | Client and server converge to *different* values, so every load produces a write, which produces a new merge — a write-amplification loop |
| **Associative** | `merge(merge(a,b),c) === merge(a,merge(b,c))` | Three-way (two devices + server) convergence is not guaranteed |
| **Total** | never throws, defined for `null`/missing/garbage on either side | The merge runs on data that just came out of a `.catch()` fallback; a throw here is PROG-03's crash |

`max`, key-union, and lexicographic-max are all semilattice joins, so a merge built only
from those is automatically all four. **Any tiebreak that depends on *which argument* is
"local" vs "server" breaks commutativity** — if one is needed, it must depend only on the
*values*, and the identical function must run on both sides.

### Field-by-field over `ProgressState` (`src/lib/progress.ts:33-51`)

| Field | Type | Rule | Notes / hazards |
|-------|------|------|-----------------|
| `completed` | `Record<string, true>` | **Key union** | Safe. Only writer is `:207` (`completed: {...s.completed, [k]: true}`); no code path ever deletes a key. Values are always `true`, so no value conflict is possible |
| `xp` | `number` | **`max`** (D-01) | ⚠️ `max` ≠ `sum`: 100 XP earned offline on device A and 80 on device B yields 100, not 180. Unavoidable — `addSkillXp` (`:226`) adds XP with no per-event record to reconstruct from, so a sum is not derivable. And `sum` would break idempotence (above). Accept and document |
| `skillXp` | `Partial<Record<Skill, number>>` | Key union, **per-key `max`** | ⚠️ **Not covered by D-01.** Planner must confirm. Per-key max is the only rule consistent with `xp`'s |
| `streak` | `number` | **Tuple with `lastActive` — see below** | ⚠️ A naive `max` **fabricates a streak** |
| `lastActive` | `string \| null` (`YYYY-MM-DD`) | Most recent; plain `>` string comparison | Safe: `today()` at `:69` is `toISOString().slice(0,10)`, so lexicographic order **is** chronological order. `null` always loses |
| `level` | `string \| null` | Highest by CEFR rank | `ProgressState.level` is typed `string`, not `Cefr` (`:40`), and is written from `estimateLevel()` which returns `"A2"\|"B1"\|"B2"\|"C1"` (`src/lib/content/diagnostic.ts:4`, `:76`). **Rule for unrankable strings must be explicit**: rank unknown values as `-1` so a known level always beats an unknown one, and break unknown-vs-unknown by string comparison (keeps it deterministic and commutative) |
| `srs` | `Record<string, SrsItem>` | Key union, per-key tuple — **see below** | ⚠️ `{box, due}` must move together |
| `vocab` | `Record<string, true>` | ⚠️ **NOT a safe union** — see tombstones | `markVocab(id, false)` **deletes** the key at `:298` |
| `attempts` | `Record<string, AttemptStat>` | Key union, per-key rule — see below | — |
| `todayXp` + `xpDay` | `number`, `string \| null` | **Tuple.** Later `xpDay` wins the pair; equal `xpDay` → `max(todayXp)`; `null` `xpDay` loses | Independent `max` on `todayXp` would carry yesterday's total into today's daily-goal ring (`:362-364`) |
| `goalXp` | `number` | ⚠️ **Not covered by D-01, and `max` is wrong** | This is a **preference**, not a counter (`setGoalXp` at `:247`). `max` ratchets it up permanently — a learner who lowers their daily goal on device B would have device A silently raise it back on the next reconcile. Recommend: take `goalXp` from the side with the newer `lastActive`; if `lastActive` ties, prefer local (it is the device the learner is on). Flag for the planner as a decision D-01 did not anticipate |

### `streak` + `lastActive`: the fabrication hazard (flagged as requested)

**A naive `max(streak)` combined with `max(lastActive)` invents a streak that neither side
ever had.**

```
A (old device):  { streak: 30, lastActive: "2026-01-01" }
B (new device):  { streak:  1, lastActive: "2026-07-28" }

naive merge   →  { streak: 30, lastActive: "2026-07-28" }
```

The learner is now credited with a 30-day streak they actually broke in January. Worse, it
sticks: `recordActivity` (`:180-188`) and `complete` (`:203`) compute the next streak from
`daysBetween(s.lastActive, today)`, so on the next activity the fabricated 30 becomes 31.

**Correct rule — merge the pair, not the fields:**

```
if (a.lastActive === b.lastActive)        → { lastActive: a.lastActive, streak: max(a.streak, b.streak) }
else if (|daysBetween(a,b)| === 1)        → { lastActive: newer, streak: max(...) + 0 }   // contiguous days: the older side's streak already rolls into the newer
else                                      → the (streak, lastActive) pair from the side with the newer lastActive
```

The middle case is where `max` is legitimate: two devices used on consecutive days are one
continuous streak. Non-adjacent days mean the streak genuinely broke, and the newer side's
value is the truth. Note D-01 literally says `max()` for `streak` — **the planner should
surface this to the user**, because the rule above is what "max streak" *means* once
`lastActive` is honoured, and it is not the same code.

### `srs`: which side wins a due-date conflict

`SrsItem` is `{ box, due }` (`:17-20`) with **no per-item timestamp**, so the pair cannot be
ordered directly. Never merge `box` and `due` independently — `max(box)` from one side with
`min(due)` from the other produces a schedule that neither device computed (`due` is
*derived* from `box` at write time: `addDays(BOX_DAYS[box])` at `:266`).

**Primary rule — use the paired `attempts` timestamp.** `recordAttempt` is the *only* writer
of `srs`, and it writes `srs[id]` and `attempts[id]` **in the same update**
(`:278-279`); `reviewItem` is a thin wrapper over it (`:287-290`). So
`attempts[id].updatedAt` is a real (day-granularity) timestamp for the same key:

```
if (a.attempts[id]?.updatedAt !== b.attempts[id]?.updatedAt)
    → take the whole SrsItem from the side with the newer attempts[id].updatedAt
```

**Fallback rule (no paired stat, or same-day tie) — bias toward reviewing sooner:**

```
→ take the whole SrsItem with the EARLIER `due`;  tie → the one with the LOWER `box`
```

Rationale: both tiebreaks fail *safe for learning*. The cost of the wrong answer is one
extra review; the cost of the opposite bias (`max(box)`) is hiding an item the learner just
got wrong for up to 30 days (`BOX_DAYS` at `:15`). It is also value-only, so it stays
commutative and idempotent. **Ordering hazard:** compute the `attempts` merge and the `srs`
merge from the *same* input pair — if `srs` is merged against an already-merged `attempts`,
the `updatedAt` comparison becomes meaningless.

### `attempts` (`AttemptStat`, `:23-31`): per-key rule

| Sub-field | Rule | Why |
|-----------|------|-----|
| `tries`, `wrong` | `max` | Cumulative counters. The invariant `wrong <= tries` is **preserved**: each side satisfies it, so `max(wrong) <= max(tries)` holds. (Sum would break idempotence) |
| `updatedAt` | later of the two | Day granularity (`today()` at `:274`) |
| `resolved`, `lastWrongOption`, `topic`, `level` | from the side with the later `updatedAt` | Point-in-time state, not counters. `resolved` in particular must not be OR'd — that would mark a still-open mistake as resolved |
| **same-day tie** | prefer the side with more `tries`; if still tied, prefer the lexicographically-greater `topic` (or any value-only rule) | Needed for determinism. Do **not** tiebreak on "server wins" — that breaks commutativity and, since client and server run the same function, creates the write-amplification loop |

### The tombstone problem — two fields where "union" is the bug

There are exactly **two** delete sites in the two stores (verified by grepping every
`delete ` in both files):

| Site | Effect of a naive union merge |
|------|-------------------------------|
| `src/lib/progress.ts:298` — `markVocab(id, false)` deletes `vocab[id]` | The un-marked card comes back on the next reconcile. The learner cannot un-know a word |
| `src/lib/celpip-progress.ts:125` — `clearDraft(taskId)` deletes `drafts[taskId]` | **A cleared draft is resurrected — re-introducing the exact defect Phase 1 found and fixed in commit `fca41b7`** ("a submitted answer pre-filled the next attempt", `01-06-SUMMARY.md` §Defects). A "new" timed attempt would start pre-written, directly breaking CELPIP criterion 1 |

**Recommendations:**
- **`drafts`: do not sync at all.** Drafts are transient, device-local scratch state; the
  submitted text is already preserved in the attempt record (`CelpipAttempt.text`). Excluding
  them from the payload removes the hazard entirely, shrinks the CELPIP payload, and loses
  nothing the learner values. Strongly recommended.
- **`vocab`: last-writer-wins on the whole map**, keyed by `lastActive` (same rule as
  `goalXp`), or accept that un-marking is device-local. Do not add tombstones — CONTEXT
  defers that class of work, and a `Record<string, true>` has no room for one without a
  schema change.

Every *other* record field (`completed`, `srs`, `attempts`, `skillXp`, CELPIP `attempts`)
has no delete site and is genuinely add-only. Union is correct for all of them.

### `CelpipProgressState` (`src/lib/celpip-progress.ts:27-30`)

| Field | Rule | Hazard |
|-------|------|--------|
| `attempts: Record<string, CelpipAttempt[]>` | Key union; per key, **concatenate then de-duplicate by a natural key, then sort deterministically** | `CelpipAttempt` has **no id** (`:14-25`). The only workable natural key is `` `${taskId}|${attempt.date}` `` — `date` is an ISO *timestamp* (`:17`), so collisions require two submissions in the same millisecond. **Sorting is not cosmetic:** without a canonical order the merge is not idempotent (array identity differs each pass), which under D-02 produces a write on every page load. Sort ascending by `date` |
| `drafts: Record<string, string>` | **Exclude from sync** (above) | — |

**Share the merge or write it separately?** (Claude's discretion, per CONTEXT.) The two
states share no field shapes — one is scalars-plus-maps, the other is maps-of-arrays. Share
the *small generic primitives* (`unionRecord`, `maxBy`, `laterDate`, `dedupeSortedBy`) and
write two thin domain merges on top. A single generic "merge any two objects" function would
have to encode per-field policy anyway and would obscure the tombstone carve-outs.

### Ordering hazards summary

1. **Merge `srs` and `attempts` from the same unmerged input pair** (above).
2. **Do not write back an unchanged merge.** With D-02 firing on every load and (after the
   fix) one store instance, a merge that equals the stored value must not trigger a `PUT`, or
   two devices ping-pong writes. Compare per-field, or `JSON.stringify` a canonicalised copy
   — note that **object key order affects `stringify` output**, so record keys must be sorted
   before comparison or you get false "changed" verdicts on every load.
3. **Reconcile must read the store, not a stale React closure.** Today's effect already does
   `const local = readLocal()` (`:147`) rather than reading `state` — keep that discipline
   against the new module store.
4. **Apply the pending queue *before* deciding the merged result is clean.** If a queued
   snapshot is still unsent, the server copy is known-stale; flush first, then reconcile,
   or the reconcile will merge against data it is about to overwrite anyway.

---

## Additive Prisma Column (Q4)

### Is `celpipProgress String?` safe under `db push --accept-data-loss`? — Yes, verified.

Empirically confirmed in this session with Prisma's **read-only** diff command against the
repo's actual schema:

```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datamodel <schema-with-celpipProgress> \
  --script
```

Output — the complete SQL `db push` would apply:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "celpipProgress" TEXT;
```

A nullable `ADD COLUMN` with no default and no constraint. Existing rows get `NULL`; no
table rewrite, no lock beyond a brief `ACCESS EXCLUSIVE` for the catalog update (Postgres
has added nullable columns without a rewrite since 11). **There is no data-loss condition
for Prisma to detect, so `--accept-data-loss` is never exercised.** Prisma's documented
trigger for the flag is the opposite case — *adding a required field to a table containing
existing data* `[CITED: prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema]`.

### The real risk this phase carries

`--accept-data-loss` at `Dockerfile:53` means a **typo** in the schema edit is silently
destructive. Renaming `progress` to `progres` reads to Prisma as *drop one column, add
another* — and it would execute, wiping every learner's progress on the next container
start, with no prompt. This is the single most dangerous line this phase touches.

**Mitigation (no pipeline change, honouring D-09 and the user's "do not improve the
Dockerfile" instruction):** run the read-only diff above as a pre-push gate and read the SQL.
The expected output is exactly one `ADD COLUMN` line. Anything containing `DROP`, `ALTER
COLUMN`, or a second statement is a stop-the-line signal. The same command also works
against the live database:

```bash
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
```

*"`prisma migrate diff` is a read-only command that does not write to your datasource(s)"*
`[VERIFIED: npx prisma migrate diff --help, Prisma 6.19.3]`.

### Deploy sequence given the Dockerfile

| Step | Where | Detail |
|------|-------|--------|
| 1 | dev machine | Edit `prisma/schema.prisma` — add `celpipProgress String?` to `model User` (near `progress` at `:25`) |
| 2 | dev machine | `npx prisma generate` — the client is generated from the schema, and `postinstall` (`package.json:10`) only runs on install, not on a schema edit. Without this, `tsc` will not see the field |
| 3 | dev machine | `npx prisma migrate diff … --script` → confirm exactly one `ADD COLUMN` |
| 4 | dev machine | `npx tsc --noEmit` && `npm run build` && `npm run lint` |
| 5 | build (Coolify) | `deps` stage copies `prisma/` **before** `npm ci` (`Dockerfile:9-14`), so `postinstall → prisma generate` sees the new column and the generated client is baked into the image |
| 6 | build | `builder` runs `npm run build` with a **dummy** `DATABASE_URL` (`Dockerfile:23`) — no DB queries at build time, so the build cannot be affected by live DB state |
| 7 | runtime | `CMD` runs `prisma db push --skip-generate --accept-data-loss && node server.js` (`Dockerfile:53`) — the column is added, *then* the server starts. Ordering is correct: the new code never queries a column that does not exist |
| 8 | rollout overlap | While the old container still serves, the DB has one extra nullable column its (older) generated client does not know about. Prisma enumerates columns explicitly in its SELECTs, so the old client is unaffected — `[ASSUMED]`, reasoned from Prisma's query generation rather than verified this session |

**Two failure modes worth stating in the plan:**
- `&&` in `Dockerfile:53` means **if `db push` fails, the container never starts.** A DB
  hiccup at deploy time becomes a full outage, not a degraded one. Pre-existing, but this is
  the phase that adds a schema change to that path.
- `db push` runs on **every** container start, not just when the schema changed. It is a
  no-op when the DB already matches, but it is also the mechanism by which any future
  accidental schema drift gets applied silently.

**Local verification of the column is currently blocked:** the Docker daemon was not running
during this research session (`docker ps` → *"open //./pipe/dockerDesktopLinuxEngine: The
system cannot find the file specified"*), so the local Postgres from `docker-compose.yml`
could not be started and the `ALTER TABLE` was not executed against a real database. The diff
command above needed no database and is the stronger evidence anyway.

---

## Verification Without a Test Runner (Q5)

### Recommendation: **do not add a test runner in this phase.**

TEST-01 is explicitly on the v2 backlog (CONTEXT §Deferred). Everything the four success
criteria need is reachable with tools already present:

- The merge, the validator, the backoff curve, and the queue-coalescing logic are **pure
  functions**. They are the highest-risk code in the phase and are 100% exercisable from a
  plain node script with **zero new dependencies**.
- The remaining criteria need a browser and a database, which a unit-test runner would not
  give anyway — and Phase 1 already established the precedent
  (`01-06-SUMMARY.md`: `verified_by: agent-driven browser session (Playwright)`).

**If the planner disagrees, the honest cost is one devDependency (`tsx`, ~1 package) and it
would be justified only by a need to run the checks on Node 20 (the Docker base) or in CI —
neither of which exists today (`no .github`, no `.gitlab-ci.yml`).**

### Pure-function harness — verified working this session

```bash
node --experimental-strip-types scripts/verify-merge.mts
```

Confirmed end-to-end in this repo: a `.mts` script imported a local `.ts`/`.mts` module,
which itself imported `zod`, and ran under the installed Node **v22.14.0** with no
transpiler, no config, and no new package.

Constraints found by testing, which the planner must design around:

| Constraint | Evidence | Consequence |
|-----------|----------|-------------|
| `@/` aliases do **not** resolve | `ERR_MODULE_NOT_FOUND: Cannot find package '@/lib'` | The schema/merge module must use only relative imports internally |
| Relative imports need the explicit extension | `import { S } from "./pure.ts"` works | Write scripts with explicit `.ts`/`.mts` specifiers |
| `.ts` (not `.mts`) triggers a `MODULE_TYPELESS_PACKAGE_JSON` warning | Observed | Use `.mts` for the scripts — `tsconfig.json:31` already includes `**/*.mts` so they are type-checked by `npx tsc --noEmit` too |
| Node 22.14 needs the `--experimental-strip-types` flag (`process.features.typescript === false`) | Observed | Flag is required; scripts are dev-machine-only (Docker base is `node:20-slim`, `Dockerfile:6`) |
| The target module must be React-free | — | This is the same constraint as §Q2; `src/lib/progress.ts` itself is `"use client"` and imports `next-auth/react` (`:4`), so it can never be imported this way |

**What the harness should assert (all pure, all fast):**
- `merge(a, merge(a,b)) === merge(a,b)` — **idempotence**, the property D-02 depends on
- `merge(a,b) === merge(b,a)` — **commutativity**
- The streak-fabrication case from §Q3 produces the correct pair, not `{30, 2026-07-28}`
- `vocab` un-mark and CELPIP `drafts` are not resurrected
- CELPIP attempt de-dup: merging the same snapshot twice yields the same array
- Validator: unknown field stripped; bad `xp` falls back; one bad `srs` entry is dropped
  while good ones survive; non-object payload → `success: false`
- Corrupt-string read: `schema.catch(EMPTY).parse("<garbage>")` → `EMPTY`

### The four success criteria → evidence

| # | Criterion | How to prove it | New dependency? |
|---|-----------|-----------------|-----------------|
| 1 | Same progress in a different browser | `docker compose up -d db` + `npm run dev`; sign in, complete a scenario, then open a **fresh browser profile / incognito** (not just a new tab — localStorage must be empty), sign in, observe identical completions/XP/streak/level/due count on `/dashboard`. Cross-check `SELECT progress FROM "User"` via `npm run db:studio` | No |
| 2 | Anonymous progress survives signup | Complete scenarios signed-out, confirm `fluentpath:progress:v2` in DevTools → sign up → assert the account holds the **union**, and that a pre-existing account's data was *also* kept (that is the D-01 half a "server wins" implementation would silently pass) | No |
| 3 | Malformed write rejected; corrupt stored data loads safe | Two halves: (a) pure-function harness above; (b) one manual DB check — set `User.progress = '{"xp": broken'` in Prisma Studio, load `/dashboard`, assert the empty state renders instead of a 500. Plus `curl -X PUT /api/progress -d '"hello"'` → 400, then re-read the row to confirm it was **not** overwritten | No |
| 4 | Offline writes reach the server on reconnect | DevTools → Network → **Offline**; complete a scenario; confirm the queue slot exists in `fluentpath:sync:v1`; **close the tab**; reopen online; assert the write lands (Studio) and the slot clears. Repeat with `document.dispatchEvent(new Event("visibilitychange"))` after setting `visibilityState` to check the hide-flush | No |

`npx playwright` can script criteria 1/2/4 without touching `package.json` (verified: it
resolves 1.62.0 into the npx cache), but it needs a one-off browser download
(`npx playwright install chromium`). Manual DevTools is sufficient and matches the repo's
current practice.

### Bundle-size regression check

Next 16 **no longer prints per-route "First Load JS"** in the build table (verified: the
route table in this repo's `next build` output has no size columns). Use the chunk directory
instead:

```bash
npx next build && du -sb .next/static/chunks
```

**Baseline captured this session: `1170768` bytes across 30 chunks.** Re-run after the schema
module lands to quantify zod's first appearance in the client bundle.

---

## Architecture Patterns

### System Architecture Diagram

```
  learner action (complete / recordAttempt / markVocab / addAttempt)
        │
        ▼
  ┌──────────────────────────────────────────────┐
  │  MODULE STORE  (singleton, src/lib/…)        │   ← one instance per tab
  │  state + subscribe/getSnapshot               │      (today: one per component)
  └───────┬────────────────────────┬─────────────┘
          │ notify                 │ persist()
          ▼                        ▼
  useSyncExternalStore      ┌──────────────┐        ┌──────────────────────┐
  (N components,            │ localStorage │        │  SYNC QUEUE          │
   optimistic, instant)     │  :progress:v2│        │  fluentpath:sync:v1  │
                            │  .celpip.v1  │        │  {progress|celpip}   │
                            └──────────────┘        │  coalesced, seq'd    │
                                                    └───────┬──────────────┘
                                                            │ flush triggers:
                                                            │  • debounce (600ms)
                                                            │  • window "online"
                                                            │  • visibilitychange→hidden
                                                            │  • backoff timer (full jitter)
                                                            ▼
                                                    ┌───────────────────┐
                                                    │  PUT /api/progress│
                                                    └───────┬───────────┘
                                                            │ auth() gate
                                                            ▼
                                       ┌────────────────────────────────────┐
                                       │  validate (zod: strip unknown,     │
                                       │  per-field .catch, sanitizedRecord)│
                                       │      │ non-object → 400           │
                                       │      ▼                            │
                                       │  read stored ── .catch(EMPTY) ────│ ← corrupt blob
                                       │      ▼                            │   never throws
                                       │  MERGE(stored, incoming)  ◄───────┼── same function
                                       │      ▼                            │   as the client
                                       │  write User.progress /            │
                                       │        User.celpipProgress        │
                                       └────────────────────────────────────┘
                                                            │
                                                            ▼
                                                     Postgres (authoritative)

  On authenticated load (D-02):  GET /api/progress ─► MERGE(local, server) ─► store + localStorage
                                                       └─ write back ONLY if the merge changed the server copy
```

### Recommended Module Layout

```
src/lib/
├── progress-schema.ts     # NEW · pure · no "use client", no react, no @/ imports
│                          #   ProgressState + CelpipProgressState zod schemas,
│                          #   EMPTY/CELPIP_EMPTY, drift guards.
│                          #   Imported by: progress.ts, celpip-progress.ts,
│                          #   api/progress/route.ts, scripts/verify-*.mts
├── progress-merge.ts      # NEW · pure · generic joins + the two domain merges
├── sync-queue.ts          # NEW · "use client" · coalesced localStorage queue,
│                          #   backoff, flush triggers, seq compare-and-clear
├── progress.ts            # REWRITE · module store + useSyncExternalStore wrapper
├── celpip-progress.ts     # REWRITE · same treatment; drafts stay local-only
└── achievements.ts        # imports `type ProgressState` from "./progress" (:2) — keep the re-export
```

### Pattern 1: hoist the hook to a module store (prerequisite for everything else)

```ts
// src/lib/progress.ts  ("use client")
import { useSyncExternalStore, useCallback } from "react";

let snapshot: ProgressState = EMPTY;              // module-level singleton
const listeners = new Set<() => void>();

function emit() { for (const l of listeners) l(); }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
function getSnapshot() { return snapshot; }       // MUST return a cached reference
function getServerSnapshot() { return EMPTY; }    // stable singleton — no hydration mismatch

export function setProgress(next: ProgressState) {
  snapshot = next;
  writeLocal(next);
  enqueue("progress", next);
  emit();
}

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // …derived values as today…
}
```

**Why:** verified that `React.useSyncExternalStore` and `React.useEffectEvent` are both
functions in the installed React 19.2.4. `getSnapshot` must return the *same object
reference* when nothing changed or React throws "The result of getSnapshot should be cached";
`getServerSnapshot` must return the stable `EMPTY` singleton so SSR and hydration agree —
which is exactly the behaviour the current mount-effect hydrate achieves
(`progress.ts:122-125`, with its `react-hooks/set-state-in-effect` disable comment). Hoisting
lets that eslint-disable be **deleted**.

**Also:** hydration and reconcile must move to a *single* place (a `useEffect` in a
provider-level component, or a module-level `initOnce()` guard) so D-02's GET fires once per
load, not once per mounted consumer.

### Pattern 2: total, semilattice-shaped merge primitives

```ts
// src/lib/progress-merge.ts — pure, no imports beyond types
export const unionRecord = <V>(
  a: Record<string, V> | undefined,
  b: Record<string, V> | undefined,
  pick: (x: V, y: V) => V,
): Record<string, V> => {
  const out: Record<string, V> = { ...(a ?? {}) };
  for (const [k, v] of Object.entries(b ?? {})) {
    out[k] = k in out ? pick(out[k], v) : v;
  }
  return out;
};

// Every `pick` must be commutative and idempotent — see §Q3.
export const laterDay = (a: string | null, b: string | null): string | null =>
  a === null ? b : b === null ? a : (a > b ? a : b);   // YYYY-MM-DD sorts chronologically
```

### Pattern 3: lenient read, strict-ish write

```ts
// src/app/api/progress/route.ts
// READ (GET, and the stored-blob read inside PUT): never throws.
const stored = safeReadProgress(user?.progress);       // JSON.parse in try/catch → schema.catch(EMPTY)

// WRITE (PUT): strip unknown, recover known-but-bad, 400 only on a non-object body.
const parsed = progressSchema.safeParse(body?.progress);
if (!parsed.success) return NextResponse.json({ error: "Invalid progress" }, { status: 400 });
const merged = mergeProgress(stored, parsed.data);
```

Keep `updateMany` (`route.ts:43`) rather than `update` — the existing comment at `:42`
explains it does not throw when a stale cookie points at a deleted user. That behaviour is
still wanted.

### Anti-Patterns to Avoid

- **Summing any counter in the merge.** Idempotence is a hard requirement under D-02
  (§Q3). Every field must be a join.
- **Tiebreaking on "server wins" / "local wins".** Breaks commutativity → client and server
  converge to different values → a write on every page load, forever.
- **A per-component retry queue.** With ~15 `useProgress()` call sites, this becomes N
  writers on one localStorage key.
- **`beforeunload` / `unload` for the flush.** Not reliably fired, especially on mobile
  `[CITED: Chrome Page Lifecycle]`; Chrome is deprecating `unload`.
- **Gating a write on `navigator.onLine === true`.** MDN explicitly advises against
  disabling features on that signal.
- **`z.strictObject` / `.strict()` anywhere in the progress path.** That is the rejected
  "reject the whole payload" option (Discussion Log §"Payload validation strictness").
- **Sending `progress` and `celpipProgress` in one payload.** Defeats D-05's stated
  rationale — every 20-XP tick would re-upload every essay.
- **Touching the Dockerfile.** CONTEXT §Specific Ideas: *"Do not 'improve' the Dockerfile as
  a side quest."*

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| Runtime shape validation with unknown-key stripping | A hand-rolled `isProgressState()` type guard | `zod` (already installed) `z.object()` — strip is the default | A hand-rolled guard cannot express per-field fallback, record sanitisation, and a compile-time link to the TS type. The drift guard (§Q2) is free with zod and impossible without it |
| Cross-component shared state | A custom pub/sub + `useEffect` subscription | React 19's `useSyncExternalStore` (verified present) | Handles tearing under concurrent rendering and gives an explicit SSR snapshot. Rolling your own reintroduces the hydration-mismatch class the current mount-effect hack works around |
| Non-reactive reads inside an effect | A `useRef` mirror of the latest value | React 19.2's `useEffectEvent` (verified present) | The repo already fights `react-hooks/refs` lint over exactly this pattern (`01-06-SUMMARY.md` §D2: *"the ref read tripped `react-hooks/refs`"`) |
| Backoff timing | A fixed retry interval or a bespoke curve | Capped exponential + **full jitter** | Without jitter, every client that went offline in the same outage retries in lockstep `[CITED: AWS Architecture Blog]` |
| CEFR ordering | A fresh ordering table | The existing `A2 < B1 < B2 < C1` order (`src/lib/content/diagnostic.ts:4`, `:73`) declared locally in the schema module | Two orderings would drift; but do not *import* `diagnostic.ts` — it pulls the whole question bank into the client bundle |
| Date arithmetic in the merge | New date helpers | `daysBetween` / `today` (`progress.ts:68-78`) — extract them into the pure module | The merge must agree exactly with what `recordActivity`/`complete` compute, or streaks diverge |
| Duration formatting in any new CELPIP UI | A local formatter | `formatDuration` (`celpip-progress.ts:34`) — Phase 1 extracted it precisely so two call sites format identically | — |

**Key insight:** every "library" this phase might reach for is already in the tree. The
genuinely bespoke code — the merge — is bespoke *because it encodes product policy* (D-01),
not because no library exists. Keep it small, pure, and total; that is what makes it
verifiable without a test runner.

---

## Runtime State Inventory

This is a migration phase (localStorage → Postgres). A grep audit finds files; it does not
find live state.

| Category | Items found | Action required |
|----------|-------------|-----------------|
| **Stored data** | Postgres `User.progress TEXT` (`prisma/schema.prisma:25`) and `User.level` (`:23`) hold live rows for real accounts. Browser localStorage keys: `fluentpath:progress:v2` (`progress.ts:12`), legacy `fluentpath:progress:v1` (still read at `:85`), `fluentpath.celpip.v1` (`celpip-progress.ts:12`), `fluentpath:theme` (`layout.tsx` inline script) | **Both** a code edit and a data-compatibility guarantee. The new schema must parse every blob already in the DB — if a stored value fails the new validation, the `.catch(EMPTY)` read path would silently zero a real learner's progress. Recommend: before deploy, run the validator over every existing `User.progress` row from a node script and confirm zero fall back to EMPTY. The beta user's CELPIP history lives **only** in her browser today — the first merge must not clobber it |
| **Live service config** | Coolify application env (`DATABASE_URL`, `AUTH_SECRET`, Stripe/Anthropic keys) — configured in the Coolify UI, not in git | **None.** No env var changes in this phase. `DEPLOY-COOLIFY.md` documents the setup |
| **OS-registered state** | None — verified: no scheduled tasks, pm2/systemd units, or launchd plists exist in this repo, and deployment is a single Docker container started by Coolify (`Dockerfile:53`) | None |
| **Secrets / env vars** | None renamed or added. The phase introduces no new secret | None |
| **Build artifacts** | Generated Prisma client at `node_modules/.prisma` + `node_modules/@prisma/client` — **stale after the `schema.prisma` edit**. `postinstall: prisma generate` (`package.json:10`) only runs on install. `.next/` build output also stale | **Yes:** run `npx prisma generate` locally after editing the schema, before `tsc`/`build`. In Docker this is automatic (`deps` stage copies `prisma/` at `Dockerfile:10` *before* `npm ci` at `:14`) |

**The canonical question — after every file in the repo is updated, what still holds the old
shape?** Answer for this phase: (a) every row already in `User.progress`, which the new
validator must accept unchanged; (b) the beta user's `fluentpath.celpip.v1` localStorage,
which must survive its first merge into a `NULL` `celpipProgress` column; (c) the locally
generated Prisma client.

---

## Common Pitfalls

### Pitfall 1: `useProgress()` is not a shared store — N instances, N syncs

**What goes wrong:** D-02's per-load reconcile fires once *per mounted hook instance*, not
once per load. So does the GET, the merge, and the retry-queue subscription.

**Why it happens:** `useProgress()` (`progress.ts:112`) is a plain hook holding its own
`useState` (`:115`). It is called in **17 places across 15 files**, verified:
`AchievementsView.tsx:33`, `Dashboard.tsx:33`, `DiagnosticTest.tsx:21`, `GrammarQuiz.tsx:17`,
`GrammarWorkspace.tsx:22`, `MistakesView.tsx:12`, `ReviewHub.tsx:18`, `ReviewHub.tsx:77`,
`ReviewView.tsx:10`, `SentenceBuilder.tsx:69`, `TypeAnswer.tsx:24`, `VocabularyView.tsx:13`,
`VocabularyView.tsx:302`, `ScenarioView.tsx:20`, `WorldView.tsx:12`. On `/review`,
`ReviewHub` (`:18`) renders `ReviewView` (`:10`) / `MistakesView` (`:12`) / `WeakSpots`
(`:77`) → `GrammarQuiz` (`:17`) — **up to four concurrent instances**. There is no context
provider for progress: the only `createContext`/provider in `src/` is next-auth's
`SessionProvider` (`src/app/providers.tsx:9`).

**How to avoid:** hoist to a module-level store behind `useSyncExternalStore` (Pattern 1)
as the **first** task of the phase. This is also a latent bug *today*: two mounted instances
already hold divergent copies of `state` — one persists, the other never sees it.

**Warning signs:** four identical `GET /api/progress` entries in the Network tab on one
page load; the queue's `seq` jumping by more than one per user action.

### Pitfall 2: the merge fabricates a streak

**What goes wrong:** `max(streak)` paired with `max(lastActive)` credits a broken streak.
**Why:** `streak` is only meaningful relative to `lastActive`, and D-01 lists them as two
independent rules. **How to avoid:** merge the pair (§Q3). **Warning sign:** a test account
with `{streak:30, lastActive:"2026-01-01"}` on one side and `{streak:1, lastActive:"today"}`
on the other yields 30.

### Pitfall 3: a union merge resurrects deleted keys

**What goes wrong:** an un-marked vocab card reappears; a cleared CELPIP draft pre-fills the
next timed attempt — regressing the defect fixed in `fca41b7`.
**Why:** `progress.ts:298` and `celpip-progress.ts:125` are deletes; a `Record<string, true>`
has no room for a tombstone. **How to avoid:** exclude `drafts` from sync entirely;
last-writer-wins for `vocab` (§Q3). **Warning sign:** open a completed CELPIP task after a
reconcile and the editor is pre-filled.

### Pitfall 4: unguarded `JSON.parse` on the stored blob

**What goes wrong:** `src/app/api/progress/route.ts:17` —
`user?.progress ? JSON.parse(user.progress) : null` — throws an uncaught error on a corrupt
blob, returning a 500 for every subsequent load. Already logged in
`.planning/codebase/CONCERNS.md` §Known Bugs.
**How to avoid:** try/catch → `schema.catch(EMPTY)` (§Q2). Per Claude's discretion in
CONTEXT: **preserve the corrupt string before overwriting.** Recommendation — do *not* add a
column for it (D-09 keeps changes minimal and this one is not worth a migration); instead
`console.error("[progress] corrupt blob for user", id, raw.slice(0, 200))` once, then proceed
with the safe default. The row is only overwritten on the next successful write, so a DBA can
still recover it until then.

### Pitfall 5: the merge writes back on every load (ping-pong)

**What goes wrong:** the reconcile merges, decides the result "differs", PUTs, the server
merges and stores something marginally different, the next load repeats — a write on every
page view, forever. **Why:** a non-commutative tiebreak, or a `JSON.stringify` comparison
where record key order differs between the two sides. **How to avoid:** value-only
tiebreaks; sort record keys before any stringify comparison. **Warning sign:** `updatedAt`
on the `User` row (`schema.prisma:27`, `@updatedAt`) advancing on every page load with no
learner activity.

### Pitfall 6: payload growth

**What goes wrong:** the full snapshot is re-sent on every save (`progress.ts:172`). Adding
CELPIP essays to the same payload multiplies it; the queue in localStorage doubles it again.
**How to avoid:** separate queue slots and separate payloads per domain (D-05); coalesce the
queue to depth 1. **Warning sign:** `writeLocal` starting to throw (which
`celpip-progress.ts:58-65` already reports as `false` — Phase 1 verified the
"We couldn't save your draft just now" warning path works).

### Pitfall 7: `--accept-data-loss` and a schema typo

Covered in §Q4. **Warning sign:** `prisma migrate diff --script` output containing anything
other than a single `ADD COLUMN`.

---

## Code Examples

### Full-jitter backoff (pure, verifiable in the node harness)

```ts
// src/lib/sync-queue.ts
const BASE_MS = 1_000;
const CAP_MS = 60_000;

/** Full jitter (AWS Architecture Blog). Deterministic when `rand` is injected — which is
 *  how the verification script asserts the bounds without flaking. */
export function backoffDelay(attempt: number, rand: () => number = Math.random): number {
  const ceiling = Math.min(CAP_MS, BASE_MS * 2 ** attempt);
  return Math.floor(rand() * ceiling);
}
```

### Flush triggers (React 19.2, using `useEffectEvent`)

```ts
// Mounted ONCE (provider-level), not per consumer — see Pitfall 1.
import { useEffect, useEffectEvent } from "react";

export function useSyncDriver(authed: boolean) {
  // Non-reactive: reads the latest `authed` without re-subscribing the listeners.
  const flush = useEffectEvent(() => { if (authed) void flushQueue(); });

  useEffect(() => {
    const onOnline = () => { resetBackoff(); flush(); };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);   // best-effort backstop only
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);   // no deps — useEffectEvent keeps the handlers fresh
}
```

`useEffectEvent` verified present in the installed React 19.2.4 and documented for Next 16
(`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md:403`).

### Lenient record parse (verified behaviour, §Q2)

```ts
const srsItem = z.object({ box: z.number().int().min(0), due: z.string() });

export const progressSchema = z.object({
  completed: sanitizedRecord(z.literal(true)),
  xp:        z.number().int().min(0).catch(0),
  streak:    z.number().int().min(0).catch(0),
  lastActive: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().catch(null),
  level:     z.string().nullable().catch(null),
  srs:       sanitizedRecord(srsItem),
  // …remaining fields per src/lib/progress.ts:33-51
});
// Unknown keys are stripped by z.object()'s default — that IS D-08. No modifier.
```

### Read-only schema-change preview (§Q4)

```bash
# Exactly one line of SQL is expected:  ALTER TABLE "User" ADD COLUMN "celpipProgress" TEXT;
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

---

## State of the Art

| Old approach | Current approach | When changed | Impact here |
|--------------|------------------|--------------|-------------|
| `z.object().passthrough()` / `.strict()` | `z.looseObject()` / `z.strictObject()` top-level constructors | zod v4 | Repo is on 4.4.3 — use the v4 spellings. D-08 needs neither: plain `z.object()` already strips |
| `unload` / `beforeunload` to flush | `visibilitychange → hidden` as the last reliable save point | Page Lifecycle guidance; Chrome is deprecating `unload` | Determines the flush trigger (§Q1) |
| `navigator.sendBeacon` for unload sends | `fetch({keepalive:true})` where supported — but Baseline only since Nov 2024 | Safari 18.2 / Firefox 133 | Neither is usable across Next 16's Safari 16.4+ floor; the persisted queue replaces both (§Q1) |
| Route handler `GET` cached by default | Dynamic by default | Next 15.0.0-RC (`route.md:669`) | `GET /api/progress` is already dynamic — no `export const dynamic` needed |
| `context.params` as a plain object | `Promise` | Next 15.0.0-RC (`route.md:668`) | Not applicable — `/api/progress` has no dynamic segment |
| Build output printing per-route "First Load JS" | No size columns in the route table | Next 16 (verified in this repo's output) | Measure bundle impact via `du -sb .next/static/chunks` instead (§Q5) |
| Node type-stripping behind a flag | Default-on in Node ≥22.18 | — | Local Node is 22.14.0 (`process.features.typescript === false`), so `--experimental-strip-types` is still required |

**Deprecated / outdated in-repo:**
- `AGENTS.md` §FluentPath still says progress is *"local-first… swap for a DB in Fase 5"* —
  that swap is **this** phase. Worth a one-line correction.
- The v1 localStorage key `fluentpath:progress:v1` is still read at `progress.ts:85`. Keep it
  — it is the working precedent for versioned client-state migration and costs nothing.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | Prisma's generated client SELECTs an explicit column list, so an older container is unaffected by a new nullable column during rollout overlap | Q4 step 8 | Low. If wrong, the old container could error on the extra column during the overlap window. Mitigable by accepting brief downtime instead of an overlapping rollout |
| A2 | `fetch({keepalive:true})` carries an aggregate ~64 KiB in-flight body limit like `sendBeacon` | Q1 | Low — the recommendation is not to use keepalive at all. Could not confirm in the Fetch spec text retrieved this session |
| A3 | Coolify performs an overlapping (old-still-serving) rollout rather than stop-then-start | Q4 step 8 | Low. If it is stop-then-start, A1 is moot and the sequence is strictly safer |
| A4 | The existing rows in production `User.progress` all parse cleanly under the new schema | Runtime State Inventory | **High** — a row that falls back to `EMPTY` would zero a real learner's progress. Must be checked against the live DB before deploy, not assumed. Listed as a gate, not a finding |
| A5 | Coolify runs a single container replica (so `db push` at start is not racing itself) | Q4 | Low. Multiple replicas each running `db push` concurrently is benign for an idempotent `ADD COLUMN` but was not verified |
| A6 | No proxy/ingress body-size limit blocks a large `celpipProgress` payload | Q1 / Pitfall 6 | Medium. Next's App Router route handlers have no `bodyParser` limit (`route.md:597`), but Coolify's proxy default was not inspected. Worth checking against a realistic multi-essay payload during verification |

---

## Open Questions

1. **`goalXp` merge rule** — D-01 does not cover it, and `max()` (the rule it would inherit
   from `xp`) is wrong for a preference: it would ratchet the learner's daily goal upward
   permanently.
   - What we know: `setGoalXp` (`progress.ts:247`) is a plain user setting, default 30 (`:65`).
   - What's unclear: whether the user considers it part of the "nothing is lost" guarantee.
   - Recommendation: take it from the side with the newer `lastActive`; surface to the user
     as a one-line confirmation during planning.

2. **`skillXp` merge rule** — also not covered by D-01.
   - Recommendation: per-key `max`, consistent with `xp`. Low risk; no confirmation needed
     unless the user objects.

3. **`streak`'s literal `max()`** — D-01 says `max()`; §Q3 shows `max()` alone fabricates
   streaks.
   - Recommendation: implement the pair rule and record it as a refinement of D-01, not a
     contradiction. Worth one explicit confirmation because D-01 is a locked decision.

4. **`vocab` un-marking across devices** — a `Record<string, true>` cannot express a
   tombstone, and CONTEXT defers that class of work.
   - Recommendation: last-writer-wins by `lastActive`, and accept that un-marking may be lost
     in a rare concurrent case. Alternative (changing `vocab` to `Record<string, boolean>`)
     is a wire-format change — additive-compatible, but larger than this phase wants.

5. **Server-side merge vs. the two non-monotone fields.** Making `PUT` merge is what kills
   the out-of-order hazard, but it also means the server can never accept a *decrease*.
   - Recommendation: merge everything except `goalXp` and `vocab`, which the server takes
     last-writer-wins from the incoming payload. This is a small, explicit carve-out rather
     than a general exception.

6. **Where the "not synced" indicator lives.** `AppShell` (`src/components/AppShell.tsx:10-16`)
   is a server component wrapping `Sidebar` + `main`. A client indicator would slot in there
   or in `Sidebar`. But `/celpip` is a public route — confirm during planning whether the
   indicator should appear for anonymous learners at all (it should not: they have no server
   sync to fail).

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (dev machine) | Build, verification scripts | ✓ | v22.14.0 | — |
| `node --experimental-strip-types` | Pure-function verification (§Q5) | ✓ (flag required; `process.features.typescript === false`) | — | `tsx` devDependency |
| `zod` | Validation (§Q2) | ✓ | 4.4.3 | — |
| `zod/mini` | (considered, rejected) | ✓ importable | 4.4.3 | — |
| React `useSyncExternalStore` | Module store (Pattern 1) | ✓ `typeof === "function"` | 19.2.4 | — |
| React `useEffectEvent` | Flush triggers | ✓ `typeof === "function"` | 19.2.4 | `useRef` mirror (trips `react-hooks/refs` lint) |
| `prisma` CLI | Schema edit + `migrate diff` | ✓ | 6.19.3 (7.9.1 available — **do not upgrade in this phase**) | — |
| `tsc` | Drift guard + type check | ✓ via `npx tsc --noEmit` | TypeScript ^5 | — |
| `next build` | Bundle baseline | ✓ (needs a dummy `DATABASE_URL`) | 16.2.9 | — |
| **Docker daemon** | Local Postgres for criteria 1/2/4 | ✗ **not running** | — | Start Docker Desktop, then `docker compose up -d db` (`docker-compose.yml:10-21`, port 5432, `postgresql://fluentpath:fluentpath@localhost:5432/fluentpath`) |
| **Local Postgres** | End-to-end verification | ✗ (blocked by Docker) | postgres:16 per compose | Verify against a staging DB, or accept that criteria 1/2/4 are DB-dependent and must wait |
| `npx playwright` | Optional scripted browser checks | ✓ ephemeral (1.62.0, npx cache — **not** in `package.json`) | 1.62.0 | Manual DevTools (matches current practice) |
| Playwright browsers | Same | ✗ not installed | — | `npx playwright install chromium` (one-off download) or manual DevTools |
| CI runner | — | ✗ none (`no .github`, no `.gitlab-ci.yml`) | — | Local `npm run build` / `npm run lint` / `npx tsc --noEmit`, as Phase 1 did |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** Docker/Postgres (start Docker Desktop — this is a
hard prerequisite for three of the four success criteria); Playwright browsers (manual
DevTools is sufficient).

---

## Validation Architecture

`workflow.nyquist_validation` is absent from `.planning/config.json` (which contains only
`workflow._auto_chain_active: false`), so it is treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **None** — zero test files, no runner (`CONCERNS.md` §"No test coverage") |
| Config file | none — see Wave 0 |
| Quick run command | `node --experimental-strip-types scripts/verify-merge.mts` (new; verified this pattern works) |
| Full suite command | `npx tsc --noEmit && npm run lint && npm run build && node --experimental-strip-types scripts/verify-merge.mts && node --experimental-strip-types scripts/verify-schema.mts` |

### Phase Requirements → Test Map

| Req | Behavior | Type | Automated command | File exists? |
|-----|----------|------|-------------------|--------------|
| PROG-01 | Progress round-trips to Postgres | integration | — (manual: `npm run db:studio` + browser) | ❌ manual |
| PROG-02 | Merge is idempotent & commutative (the property cross-device identity rests on) | unit | `node --experimental-strip-types scripts/verify-merge.mts` | ❌ Wave 0 |
| PROG-02 | Cross-device identity end-to-end | manual | fresh browser profile + `docker compose up -d db` | ❌ manual |
| PROG-03 | Unknown fields stripped; bad known field recovered; bad record entry dropped | unit | `node --experimental-strip-types scripts/verify-schema.mts` | ❌ Wave 0 |
| PROG-03 | Corrupt stored blob → safe default, no crash | unit + manual | script asserts `schema.catch(EMPTY)`; manual corrupts a row in Studio | ❌ Wave 0 |
| PROG-03 | Non-object body → 400, stored row untouched | manual | `curl -X PUT` + re-read | ❌ manual |
| PROG-04 | Backoff bounds, queue coalescing, seq compare-and-clear | unit | `node --experimental-strip-types scripts/verify-queue.mts` (inject `rand`) | ❌ Wave 0 |
| PROG-04 | Offline write survives tab close and lands on reconnect | manual | DevTools Offline + close tab | ❌ manual |
| PROG-05 | Anonymous progress merges in without loss (both directions) | unit + manual | merge script covers the algebra; browser covers the flow | ❌ Wave 0 |
| all | Schema/type drift | static | `npx tsc --noEmit` (drift guard, §Q2) | ✅ exists |
| all | Schema change is purely additive | static | `npx prisma migrate diff … --script` | ✅ exists |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` (catches the drift guard immediately)
- **Per wave merge:** `npx tsc --noEmit && npm run lint && node --experimental-strip-types scripts/verify-*.mts`
- **Phase gate:** full suite green + the manual browser/DB checks in §Q5 before
  `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `scripts/verify-merge.mts` — covers PROG-02, PROG-05 (idempotence, commutativity,
      streak pairing, tombstones, CELPIP de-dup)
- [ ] `scripts/verify-schema.mts` — covers PROG-03 (strip, per-field catch, record
      sanitisation, corrupt-blob default)
- [ ] `scripts/verify-queue.mts` — covers PROG-04 (backoff bounds with injected `rand`,
      coalescing, compare-and-clear)
- [ ] The pure module (`src/lib/progress-schema.ts` + `src/lib/progress-merge.ts`) must land
      **before** the scripts — they are the only thing a node script can import
- [ ] Docker daemon started + `docker compose up -d db` + `npx prisma db push` locally
- [ ] Framework install: **none** — deliberately, per §Q5

---

## Security Domain

`security_enforcement` is absent from `.planning/config.json`, so it is treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard control |
|---------------|---------|------------------|
| V2 Authentication | no (unchanged) | next-auth 5.0.0-beta.31; this phase adds no auth surface |
| V3 Session Management | **yes (indirectly)** | `auth()` gates both handlers (`route.ts:9`, `:23`). The retry queue must handle a **401 mid-replay** by stopping, not spinning (§Q1) |
| V4 Access Control | **yes** | Every read/write is scoped to `session.user.id` (`route.ts:14`, `:44`). The queue must never carry a user id in its payload — the server derives identity from the session only. **Do not** add a `userId` field to the wire format |
| V5 Input Validation | **yes — the core of this phase** | zod `safeParse` with default strip (§Q2). Note D-08 is deliberately *lenient*: strip-and-save. Compensate by bounding every numeric (`z.number().int().min(0)`) and constraining string formats (`due`/`lastActive` regex) so a hostile client cannot store an unbounded blob |
| V6 Cryptography | no | No secrets or crypto in this path |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation |
|---------|--------|---------------------|
| Unbounded blob storage — a hostile authenticated client PUTs a 50 MB `progress` and fills the DB | Denial of Service | Cap the serialized length server-side before writing (e.g. reject > 1 MB with 413) and bound record cardinality in the schema. **This is a new gap D-08's leniency creates** — "strip unknown, save the rest" says nothing about *size*. Note `src/lib/rate-limit.ts` exists and is applied to login/signup but **not** to `/api/progress` |
| Stored XSS via progress values rendered in the UI | Tampering → XSS | React escapes by default; Phase 1 verified `dangerouslySetInnerHTML` is absent from the CELPIP surface. Keep it absent — CELPIP `text` is learner-authored free text now round-tripping through the server |
| IDOR — reading another learner's progress | Information Disclosure | Already correct: no id is accepted from the client; `session.user.id` is the only key (`route.ts:14`, `:44`). Preserve this when adding the `celpipProgress` path |
| Prototype pollution via `__proto__` / `constructor` keys in a `Record<string, …>` | Tampering | `Object.entries()` + explicit assignment into a fresh object (as `sanitizedRecord` does) avoids the merge/spread pollution vector. **Do not** use `Object.assign({}, parsed)` on unvalidated input, and consider skipping the keys `__proto__`, `constructor`, `prototype` explicitly in `sanitizedRecord` |
| Log injection / PII leak via the corrupt-blob diagnostic | Information Disclosure | Pitfall 4 recommends logging the corrupt string. **Truncate it** (`.slice(0, 200)`) and never log the email — `CONVENTIONS.md:163` already says not to log sensitive data |
| Retry storm against our own server after an outage | Denial of Service | Full jitter (§Q1) is exactly the mitigation `[CITED: AWS Architecture Blog]` |

---

## Sources

### Primary (HIGH confidence — verified by execution in this session, reproducible)

- **Repo source, read directly:** `src/lib/progress.ts`, `src/lib/celpip-progress.ts`,
  `src/app/api/progress/route.ts`, `prisma/schema.prisma`, `Dockerfile`, `package.json`,
  `tsconfig.json`, `eslint.config.mjs`, `docker-compose.yml`, `src/app/providers.tsx`,
  `src/components/AppShell.tsx`, `src/components/practice/ReviewHub.tsx`,
  `src/lib/content/diagnostic.ts`, `src/lib/celpip.ts` — every `file:line` citation above
- `node -p "require('zod/package.json').version"` → `4.4.3`; same for next 16.2.9,
  react 19.2.4, prisma 6.19.3
- Zod strip / loose / strict / record / `.catch` / `.default` behaviour — **executed**, all
  outputs quoted in §Q2
- `sanitizedRecord` drop-bad-entries transform — **executed**, output quoted
- Drift-guard `Eq<>` assertion — **compiled** with `tsc --noEmit --strict` (exit 0 aligned;
  `TS2322` when divergent)
- `node --experimental-strip-types` running a `.mts` script that imports a local `.ts` module
  and `zod` — **executed**; `@/` alias failure (`ERR_MODULE_NOT_FOUND`) — **executed**
- `npx prisma migrate diff --from-schema-datamodel … --script` →
  `ALTER TABLE "User" ADD COLUMN "celpipProgress" TEXT;` — **executed**
- `npx prisma migrate diff --help` (Prisma 6.19.3) — "read-only command that does not write
  to your datasource(s)"
- `React.useSyncExternalStore` / `React.useEffectEvent` are functions in 19.2.4 — **executed**
- `next build` route table has no size columns; `du -sb .next/static/chunks` → `1170768`
  across 30 chunks — **executed**
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` —
  Route Handler API + version history (lines 24-41, 597, 640-670)
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — browser baseline
  (`:112`), React 19.2 / `useEffectEvent` (`:398-406`)

### Secondary (MEDIUM confidence — official documentation, retrieved this session)

- MDN — `Navigator.sendBeacon()`: POST-only, ~64 KiB queued cap, `false` on failure to queue,
  response unreadable, "use fetch with keepalive instead" for other methods/response access
- MDN — `Navigator.onLine`: "inherently unreliable"; LAN / Windows-heuristic / virtual-adapter
  false positives; `online`/`offline` fire on `window`; "do not disable features based on
  online status"
- MDN — `Request.keepalive`: Baseline newly available since November 2024
- Chrome for Developers — Page Lifecycle API: `hidden` is the last reliably observable state
  and the last chance to save; `pagehide`/`beforeunload`/`unload` not reliably fired,
  especially on mobile
- AWS Architecture Blog — *Exponential Backoff And Jitter* (Marc Brooker): capped backoff
  still clusters; full jitter / decorrelated jitter formulas
- Prisma docs — *Prototyping your schema*: `db push` requires `--accept-data-loss` when it
  "anticipates that the changes could result in data loss"; the documented example is adding
  a **required** field to a populated table
- Apple — Safari 18.2 release notes (keepalive availability window)

### Tertiary (LOW confidence — flagged, see Assumptions Log)

- Prisma's generated SELECT column enumeration (A1) — reasoned, not verified this session
- `fetch` keepalive aggregate 64 KiB in-flight limit (A2) — not found in the Fetch spec text
  retrieved
- Coolify rollout strategy and proxy body-size limits (A3, A6) — not inspected

*Confidence tiers cross-checked against `gsd-tools query classify-confidence`. The seam rates
`websearch --verified` as MEDIUM and `webfetch`/`codebase` as LOW; findings I obtained by
**executing commands in this session** are recorded as HIGH with the exact command shown, so
the planner can re-run any of them rather than trust the tier.*

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Standard stack (no new deps) | **HIGH** | zod 4.4.3 confirmed installed and its exact strip/catch/record semantics executed against that build |
| Shared validation (Q2) | **HIGH** | Every claimed behaviour was run; the drift guard was compiled both aligned and divergent |
| Merge design (Q3) | **HIGH** on the code facts (every writer, every delete site, every field type cited to `file:line`); **MEDIUM** on the policy recommendations (`goalXp`, `vocab`, the streak refinement) — those need user confirmation, see §Open Questions |
| Additive Prisma column (Q4) | **HIGH** for the SQL (Prisma itself produced it); **MEDIUM** for the rollout-overlap reasoning (A1, A3) |
| Retry queue (Q1) | **MEDIUM-HIGH** — the browser-API constraints are cited to MDN/Chrome docs; the queue structure is a design recommendation, not a verified artefact |
| Verification approach (Q5) | **HIGH** — the harness pattern was executed end-to-end in this repo, including its failure modes |
| Pitfalls | **HIGH** — Pitfalls 1-4 and 7 are each grounded in specific lines of existing code |

**Research date:** 2026-07-28
**Valid until:** 2026-08-27 (30 days). The stack is stable; the shortest-lived facts are the
Prisma 7.9.1 availability notice and the zod 4.x minor line.
