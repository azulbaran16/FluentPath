<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FluentPath

Web app to learn English to a native level: interactive scenarios + AI tutor.
Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

- Curriculum (6 worlds + scenarios) lives in `src/lib/curriculum.ts` — single source of truth.
- Progress is local-first in `src/lib/progress.ts` (localStorage); swap for a DB in Fase 5.
- AI tutor endpoint `src/app/api/tutor/route.ts` is a stub until `ANTHROPIC_API_KEY` is set (Fase 2).
- Design system & theme tokens in `src/app/globals.css` ("Traveler's Journal": Fraunces + Hanken Grotesk).
- Full plan & phases: `docs/plans/2026-06-19-fluentpath-design.md`.
