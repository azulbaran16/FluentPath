# FluentPath

## What This Is

Web app for Spanish-speaking learners (B1–B2) to reach native-level English through interactive real-life scenarios — 6 worlds covering social life, work, travel, reading, practical life, and sounding native — plus a conversational AI tutor that corrects mistakes in context. Already live in production on the user's Coolify (Docker + PostgreSQL); this milestone completes the product per the original design plan.

## Core Value

A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.

## Business Context

- **Customer**: Spanish-speaking English learners (B1–B2) who want native-level fluency
- **Revenue model**: Freemium — practice is free; Pro subscription ($5/mo via Stripe) unlocks the AI tutor
- **Success metric**: A learner can complete scenarios across the full curriculum with the AI tutor working end-to-end, with progress persisted server-side
- **Strategy notes**: `docs/plans/2026-06-19-fluentpath-design.md` (original design & phase plan)

## Requirements

### Validated

<!-- Shipped and live in production. -->

- ✓ Foundations: design system ("Traveler's Journal"), navigation, dashboard, curriculum with 6 worlds / ~38 scenarios — F1
- ✓ Speaking practice via Web Speech API (PronunciationLab with word-by-word scoring) — F3
- ✓ API-free practice: GrammarQuiz, ReadingRoom, WritingDesk, per-scenario phrases — F4
- ✓ Progress engine: placement test (A2–C1), SRS review (Leitner), streaks, XP per skill, live dashboard — F5
- ✓ Accounts (Auth.js email/password + Google), landing page, route guards, basic progress sync to DB
- ✓ Stripe test-mode billing with Pro gating and 60 msgs/day tutor cap
- ✓ Analytics (GA4 + Meta Pixel), double-sided referral program, SEO blog
- ✓ Deployed on Coolify (Docker, Node 20, PostgreSQL 16, Traefik)

### Active

<!-- Milestone: "Completar producto" (user decision 2026-07-23). -->

- [ ] Server-side progress: Postgres is the authoritative copy; validated, retried, cross-device (PROG-01..05)
- [ ] Every existing scenario fully practicable in all its applicable skills, feeding SRS and weak-topics (CONT-01, CONT-02)
- [ ] Curriculum expanded to the full designed topic coverage, including native-level Sounding Native content, graduated B1–C1 (CONT-03..05)
- [ ] AI tutor working end-to-end in production: real Claude replies, scenario role-play, gentle correction, graceful gating/error states, progress credit (TUTOR-01..05)

See `.planning/REQUIREMENTS.md` for full requirement definitions.

### Out of Scope

- Stripe live mode, custom domain, production security hardening (password rules, distributed rate limiting, webhook error handling, observability) — commercial-launch milestone, explicitly excluded from "Completar producto" (user decision 2026-07-23)
- Premium TTS/STT voice — Web Speech API is sufficient for this milestone; revisit after the tutor is live (F6 stretch)
- Normalized progress DB schema for analytics — JSON column suffices at current scale; revisit when analytics queries are needed
- Automated test suite build-out — separate quality effort; phases add targeted verification only (codebase currently has zero tests)
- Growth work (more SEO content, marketing, ads) — post-completion
- Mobile app — web-first

## Context

- **Brownfield.** The app is deployed and functional. F1, F3, F4, F5, icons, and accounts/landing/persistence are done per `docs/plans/2026-06-19-fluentpath-design.md`. Remaining from the original plan: F2 (real tutor) and F6 (more content, cloud persistence maturity).
- **Tutor is mostly built:** `src/app/api/tutor/route.ts` already implements Claude (`claude-haiku-4-5`) with scenario-aware system prompt, Pro gate, 60/day cap, and a stub fallback when `ANTHROPIC_API_KEY` is absent. Remaining work is production activation, resilience (retry without quota loss), gating UX, and progress credit.
- **Progress sync exists but is fragile:** local-first (`src/lib/progress.ts`) with debounced fire-and-forget `PUT /api/progress`, no server-side validation, "server wins" merge, `JSON.parse` can crash on corrupted data (see `.planning/codebase/CONCERNS.md`). The milestone makes the DB the source of truth with validation and retry.
- **Content lives in code:** `src/lib/curriculum.ts` is the single source of truth (6 worlds, ~38 scenarios); exercise banks in `src/lib/content/*` (grammar, reading, writing, vocabulary, phrases, listening, lessons).
- **Codebase map:** `.planning/codebase/` (refreshed 2026-07-23) documents stack, architecture, conventions, and concerns.

## Constraints

- **Tech stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 — established; this Next.js version has breaking changes, read `node_modules/next/dist/docs/` before writing code (repo rule in AGENTS.md)
- **Hosting**: Coolify Docker + PostgreSQL 16; startup runs `prisma db push --accept-data-loss` — schema changes must be additive (or the phase must migrate to proper Prisma migrations first)
- **Budget**: Tutor uses `claude-haiku-4-5` with a 60 msgs/user/day cap so API cost stays well under the $5/mo subscription
- **Browser**: Speech recognition requires desktop Chrome/Edge (Web Speech API)
- **Content**: All curriculum/content changes go through `src/lib/curriculum.ts` and `src/lib/content/*` — never inline scenario data in components

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app · B1–B2 target user · conversational AI tutor (base decisions, design doc 2026-06-19) | Broadest reach, clear learner profile, tutor is the differentiator | ✓ Good |
| Free features first, paid AI tutor last (user decision 2026-06-19 — informal, recorded in `docs/plans/2026-06-19-fluentpath-design.md`, not an ADR) | Validate the app is functional before paying for API usage | ✓ Good — free app shipped and live; tutor is the final phase of this roadmap |
| Milestone "Completar producto" (user decision 2026-07-23): tutor + content + server-side progress; commercial-launch items deferred | Finish the product before launch hardening/marketing | — Pending |
| Local-first progress (localStorage) with background server sync | Instant UX, works offline | ⚠️ Revisit — this milestone makes the DB authoritative (Phase 1) |
| `claude-haiku-4-5` + daily cap for the tutor | Cost control under the $5/mo price point | — Pending (validate reply quality in Phase 4) |

---
*Last updated: 2026-07-23 after milestone "Completar producto" initialization (doc ingest + codebase map)*
