<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workflow: GSD

Este repo usa GSD Core (open-gsd/gsd-core) como flujo de trabajo: para features, bugs
y trabajo no trivial usa los skills `gsd-*` (entrada: `/gsd-progress` o `/gsd-next`;
tareas pequeñas: `/gsd-quick` o `/gsd-fast`). El estado de planificación vive en
`.planning/`. GSD tiene prioridad sobre el flujo de Superpowers en este repo.

# FluentPath

Web app to learn English to a native level: interactive scenarios + AI tutor.
Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

- Curriculum (6 worlds + scenarios) lives in `src/lib/curriculum.ts` — single source of truth.
- Progress lives in Postgres as of Fase 2 — `User.progress` and `User.celpipProgress`.
  `src/lib/progress.ts` and `src/lib/celpip-progress.ts` are module stores behind
  `useSyncExternalStore`; localStorage is a cache plus an offline queue, not the source
  of truth. The shared contract is `src/lib/progress-schema.ts` (zod, strips unknown
  fields) and the merge rules are `src/lib/progress-merge.ts` — read both before
  touching either store. The merge must stay idempotent, commutative and associative:
  it re-runs on every authenticated load.
- CELPIP practice at `/celpip` covers all four skills as of Fase 2.1 — Writing, plus Reading
  (`src/lib/celpip/reading-set-1.ts`), Listening (`listening-set-1.ts`) and Speaking
  (`speaking-prompts.ts`, `rubric-speaking.ts`). All content is original: third-party study
  material is a format reference only and no sentence of it may enter the app. Section
  availability and every coverage line on the landing are **derived from bank contents**
  (`CELPIP_SECTIONS` in `src/lib/celpip.ts`) — never hand-written, so they cannot overclaim.
- **A CELPIP attempt is recorded when the learner LEAVES the results view** (Retry / Back to
  tasks), via each runner's `finalizeAttempt` behind a `finalizedRef` guard. Phase 1 chose this
  for Writing and Speaking, Listening and Reading all inherit it. **Known limitation: closing
  the tab from the results screen loses the attempt**, including a full 39-minute Reading
  sitting. `ProgressSync.tsx` wires `visibilitychange`/`pagehide`, but those flush the sync
  *queue* — on the results screen nothing is queued yet, so they do not help. Fixing it means
  wiring `finalizeAttempt` itself to those events in all three runners.
- Listening audio is the Web Speech API (`src/lib/celpip-speech.ts`), not recorded files.
  **Scripts are chunked one turn per speaker turn, ≤25 words each, and that is a correctness
  constraint rather than a style note:** Chrome truncates a single utterance at roughly
  fifteen seconds with no error and sometimes no `onend`, and the questions are revealed by
  that `onend` and by nothing else — so an over-long turn strands the learner on a screen with
  no words and no questions. `scripts/verify-celpip-content.mts` gates the ceiling at 35 words.
  A single-speaker news item is still written as many turns for this reason alone.
- Scenario practice is per-scenario as of Fase 3 — all 35 scenarios and all 52 declared
  scenario×skill pairs. Content is keyed by the composite scenario key `"world/scenario"`
  across `scenario-lessons.ts`, `phrases.ts`, `scenario-vocabulary.ts`, `scenario-grammar.ts`,
  `scenario-writing.ts`, `scenario-reading.ts` and `scenario-speaking.ts`. **Coverage is
  derived from bank contents** (`src/lib/scenario-coverage.ts`, `EXERCISE_SOURCES`) and never
  hand-written, so a claim cannot outrun the content: a bank that exists but is EMPTY still
  reports its pair unwritten and the page says so. Wiring a new skill bank is one entry in
  `EXERCISE_SOURCES`, one branch in `ScenarioPractice.tsx` — plus `reviewableIds()` **only if
  the renderer calls `recordAttempt`**. Three of the four exercise banks do not; adding an
  unscored id there puts a permanent phantom in the "Due today" count.
- **There is exactly ONE phrase accessor and it is strict.** `getScenarioPhrases` returns
  `undefined`, never a neighbour's set: the per-world fallback that used to hand every
  unwritten scenario three shared lines was deleted at 03-11. **A new scenario added without
  its own phrase set FAILS the content harness** ("every scenario resolves to a non-empty
  phrase set") rather than silently borrowing one. Add a scenario, add its six phrases in the
  same change.
- **A spaced-repetition id is a one-way door.** Every SRS item carries an authored slug and its
  stored key is composed by `scenarioItemId` alone as `world/scenario#kind#slug`. That string
  is the key its Postgres `srs` entry lives under and `mergeProgress` unions keys blindly, so
  **an id must never be renamed or renumbered once shipped** — a rename orphans live progress
  with no migration path and no way to detect it. Insert freely; never renumber.
- Which exercises feed the review queue is deliberate: **phrases, vocabulary and scenario
  grammar are scheduled; writing, reading and speaking are not.** Those three compose ids for
  uniqueness and storage scoping only (`SCHEDULED_ITEM_KINDS` in `review-items.ts`) because
  nothing scores them — a drafted text, a comprehension question that cannot leave its passage,
  and a ticked self-report are not answers that can come due.
- The gate for all of it: `node --experimental-strip-types scripts/verify-scenario-content.mts`
  (11,981 assertions). It is a low-conflict append target — one import line, one group at the
  bottom. If it fails, fix the content; never weaken the assertion.
- AI tutor endpoint `src/app/api/tutor/route.ts` is a stub until `ANTHROPIC_API_KEY` is set (Fase 5).
- **A mutation sweep can poison a `.next` build that outlives it.** Sweeps restore source
  byte-for-byte and `git status` comes back clean while the build keeps the mutation — 03-08
  hit this (every scenario page served one passage; the minifier had dropped the rest as
  unreachable) and diagnosed it from the build's own source map, which records what the bundler
  read. Run sweeps in a worktree or a scratch copy, and rebuild from the committed tree before
  making any claim from a build.
- Design system & theme tokens in `src/app/globals.css` ("Traveler's Journal": Fraunces + Hanken Grotesk).
- Full plan & phases: `docs/plans/2026-06-19-fluentpath-design.md`.
