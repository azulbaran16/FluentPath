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
- Listening audio is the Web Speech API (`src/lib/celpip-speech.ts`), not recorded files.
  **Scripts are chunked one turn per speaker turn, ≤25 words each, and that is a correctness
  constraint rather than a style note:** Chrome truncates a single utterance at roughly
  fifteen seconds with no error and sometimes no `onend`, and the questions are revealed by
  that `onend` and by nothing else — so an over-long turn strands the learner on a screen with
  no words and no questions. `scripts/verify-celpip-content.mts` gates the ceiling at 35 words.
  A single-speaker news item is still written as many turns for this reason alone.
- AI tutor endpoint `src/app/api/tutor/route.ts` is a stub until `ANTHROPIC_API_KEY` is set (Fase 5).
- Design system & theme tokens in `src/app/globals.css` ("Traveler's Journal": Fraunces + Hanken Grotesk).
- Full plan & phases: `docs/plans/2026-06-19-fluentpath-design.md`.
