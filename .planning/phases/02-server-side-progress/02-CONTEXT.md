# Phase 02: Server-Side Progress - Context

**Gathered:** 2026-07-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Postgres becomes the authoritative, validated, retry-safe home of learner progress —
identical on every device, rejecting malformed writes without corrupting stored data,
and preserving anonymous progress when a learner signs up.

In scope: the `ProgressState` domain (completions, XP, streak, CEFR level, SRS queue,
grammar attempt stats) **and** the Phase 1 CELPIP attempt store, which the user
explicitly pulled into this phase.

Out of scope: normalizing progress into relational tables (DATA-01, deferred to v2),
any new learning content, and the AI tutor's progress credit (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Merge and conflict resolution

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

### CELPIP attempt persistence

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

### Sync failure behavior

- **D-06:** Sync failures are **silent until they persist**. Retry in the background;
  only after repeated failures show a discreet "not synced" indicator. A two-second
  network blip must not interrupt a learning session.

- **D-07:** Pending writes survive tab close — the queue is **persisted to localStorage**
  and replayed on the next app load or when connectivity returns. Chosen because
  PROG-04's "no silent loss" is otherwise unmet: network failures often coincide with
  the learner closing the browser.

### Validation and schema

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements and criteria
- `.planning/REQUIREMENTS.md` — PROG-01 through PROG-05, the requirements this phase closes
- `.planning/ROADMAP.md` §"Phase 2: Server-Side Progress" — the four success criteria

### Code this phase rewrites
- `src/lib/progress.ts` — the `useProgress()` hook: local hydrate, sign-in reconcile
  (lines 138-163), fire-and-forget `putServer` (lines 128-136), 600ms debounce (line 172)
- `src/app/api/progress/route.ts` — GET (unguarded `JSON.parse`, line 17) and PUT
  (unvalidated body, lines 32-35)
- `prisma/schema.prisma` — `User.progress` and `User.level` columns; where
  `User.celpipProgress` will be added
- `src/lib/celpip-progress.ts` — the Phase 1 CELPIP store (`fluentpath.celpip.v1`), its
  `CelpipProgressState` shape, and the defensive read/write pattern it already mirrors

### Known problems this phase must not reproduce
- `.planning/codebase/CONCERNS.md` — "Progress object lacks input validation",
  "JSON.parse error on corrupted progress data", "Progress sync via 600ms debounce
  without retry", "Progress sync (local-first + server)" fragile area
- `.planning/phases/01-celpip-writing-practice/01-06-SUMMARY.md` — Phase 1 verification,
  including the draft-clearing defect and the note that zero automated tests cover this surface

### Conventions
- `.planning/codebase/CONVENTIONS.md` — repo code conventions
- `AGENTS.md` — Next.js 16 breaking changes; read `node_modules/next/dist/docs/` before writing code

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/celpip-progress.ts`: already implements the defensive pattern this phase
  generalizes — `readLocal()` returns a safe default on parse failure, and
  `writeLocal()` returns a success boolean instead of swallowing `setItem` errors.
  Phase 1 built it as the migration contract; reuse its shape rather than inventing one.
- `src/lib/progress.ts` `EMPTY` + `readLocal()`: the safe-default pattern PROG-03 needs
  on the server side too.
- The v1→v2 localStorage migration already in `readLocal()` (line 85) is a working
  precedent for versioned client-side state migration.

### Established Patterns
- Local-first with optimistic UI: state updates apply immediately, persistence follows.
  Any retry design must preserve this — the learner never waits on the network.
- `useSession()` gates all server writes; anonymous learners stay purely local.
- Progress is a serialized JSON string, portable across engines. Keep it that way (D-09).
- Both stores hydrate from localStorage in a mount effect so SSR renders the empty state.

### Integration Points
- `src/lib/progress.ts` `persist()` (line 165) — the single funnel every progress
  mutation passes through; the retry queue hooks in here.
- The sign-in reconcile effect (line 139) — where D-01 and D-02 land.
- `src/app/api/progress/route.ts` — both handlers need validation; a parallel route or
  an extended payload is needed for `celpipProgress` (D-05).
- `src/components/celpip/CelpipLanding.tsx` and `WritingSimulator.tsx` consume
  `useCelpipProgress()` — they must keep working unchanged when the store gains sync.

</code_context>

<specifics>
## Specific Ideas

- The user reads PROG-05's "without loss" strictly: a field-by-field merge is the
  requirement, not a nice-to-have. Any plan that discards a side of the merge fails
  this phase.
- Deployment risk aversion is explicit — the user chose the option that leaves the
  Coolify deploy pipeline untouched, even though `--accept-data-loss` is a known concern.
  Do not "improve" the Dockerfile as a side quest.
- The beta user (the user's sister) is actively practising CELPIP with a real exam date.
  Her attempt history is live data, not test data.

</specifics>

<deferred>
## Deferred Ideas

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

</deferred>

---

*Phase: 02-server-side-progress*
*Context gathered: 2026-07-28*
