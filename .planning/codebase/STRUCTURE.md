# Codebase Structure

**Analysis Date:** 2026-07-23

## Directory Layout

```
InglesAprender/
├── .claude/              # Claude Code project config
├── .planning/            # Planning & analysis docs (generated)
│   └── codebase/        # Architecture, conventions, testing (this folder)
├── .playwright-mcp/      # Playwright MCP test files (if any)
├── docs/
│   └── plans/           # Phase plans (2026-06-19-fluentpath-design.md)
├── prisma/
│   └── schema.prisma    # Database schema (User, TutorUsage, PasswordResetToken)
├── public/              # Static assets (images, fonts, logos)
├── src/
│   ├── app/             # Next.js App Router (file-based routes)
│   ├── components/      # Reusable React components
│   ├── lib/             # Business logic, utilities, data
│   └── types/           # Shared TypeScript type definitions
├── .eslintrc.json       # ESLint config
├── next.config.ts       # Next.js config
├── tailwind.config.ts   # Tailwind CSS config (v4)
├── tsconfig.json        # TypeScript config
├── package.json         # npm dependencies & scripts
├── package-lock.json    # Dependency lock file
└── .env.local (IGNORED) # Environment variables (secrets, API keys)
```

## Directory Purposes

**`src/app/`** — Next.js 16 App Router
- Purpose: Define URL routes and server-side rendering logic
- Structure: File-based routing; `page.tsx` = route handler; `layout.tsx` = wrapper
- Key directories:
  - `(app)/` — Protected routes (auth required); guard in layout redirects to `/login`
  - `(catalog)/` — Public catalog (SEO-indexable); auth optional
  - `api/` — Backend API endpoints (REST routes)
  - `login/`, `signup/`, `forgot-password/`, `reset-password/` — Auth pages (public)
- Entry points: `page.tsx` files render the UI; `route.ts` files handle HTTP requests

**`src/components/`** — Reusable React Components
- Purpose: Modular, composable UI building blocks
- Organization:
  - Root level: High-level layout components (`AppShell`, `Sidebar`, `Dashboard`)
  - `auth/` — Authentication forms (`AuthForm`, `ForgotPasswordForm`, etc.)
  - `practice/` — Learning activity components (`PronunciationLab`, `GrammarQuiz`, `ReadingRoom`, `WritingDesk`, `ReviewView`, `DiagnosticTest`, `SentenceBuilder`, `SkillPractice`, etc.)
  - `motion/` — Animation components (`Reveal`, `CountUp`, `XpFloat`)
  - `analytics/` — Analytics integration (`Analytics.tsx`)
  - `mascot/` — Mascot character (`Rumi.tsx`)
- Naming: PascalCase, e.g., `Dashboard.tsx`, `WorldCard.tsx`
- Imports: Use `@/` path alias for absolute imports from project root

**`src/lib/`** — Business Logic, Utilities, Data
- Purpose: Reusable logic, hooks, data definitions, external service integrations
- Key files:
  - `curriculum.ts` — 6 worlds, 40+ scenarios, 4 skills (single source of truth)
  - `progress.ts` — `useProgress()` hook; localStorage + server sync logic
  - `db.ts` — Prisma singleton client
  - `auth.ts` — NextAuth config (providers, callbacks, JWT strategy)
  - `stripe.ts` — Stripe API helpers (isPro check, Stripe client)
  - `email.ts` — Nodemailer setup for password resets
  - `analytics.ts` — GA4 & Meta Pixel integration
  - `rate-limit.ts` — In-memory rate limiter for login attempts
  - `referral.ts` — Referral program logic
  - `confetti.ts` — Celebration animation utility
  - `site.ts` — Site metadata (name, URL, description)
  - `icons.tsx` — Lucide-react icon wrappers
- Subdirectory `content/`:
  - `grammar.ts` — 200+ grammar questions with answers
  - `reading.ts` — Graduated reading texts (A2-C1 levels)
  - `vocabulary.ts` — Vocabulary cards by topic
  - `phrases.ts` — Scenario-specific phrases
  - `writing.ts` — Writing prompts and model answers
  - `listening.ts` — Listening comprehension passages
  - `lessons.ts` — Grammar lesson explanations
  - `diagnostic.ts` — Placement test questions
  - `scenario-lessons.ts` — Scenario-specific tips
  - `learning-tips.ts` — Study advice
  - `blog.ts` — Blog article metadata
- Other:
  - `speech.d.ts` — TypeScript types for Web Speech API

**`src/types/` (if present)** — Shared TypeScript Types
- Purpose: Global types imported by multiple files
- Avoid duplication by defining types here instead of in components

**`prisma/`** — Database Schema
- `schema.prisma` — Prisma schema with models:
  - `User` — Accounts, subscriptions, progress (as JSON), referrals
  - `TutorUsage` — Daily usage cap tracking (composite key: userId + day)
  - `PasswordResetToken` — Password reset flow tokens
- No migrations folder (using `prisma db push` for schema sync)

**`public/`** — Static Assets
- Favicons, images, fonts (if not using Google Fonts only)
- Accessed via `/` URL prefix

**`docs/plans/`** — Project Planning
- `2026-06-19-fluentpath-design.md` — Full project plan with phases, decisions, curriculum

**`.planning/codebase/`** — Codebase Analysis (Generated)
- `ARCHITECTURE.md` — This file (layers, data flow, patterns)
- `STRUCTURE.md` — Directory layout, file naming, new code guidelines
- `CONVENTIONS.md` — Coding style, naming patterns, import organization
- `TESTING.md` — Test patterns, framework, coverage goals
- `STACK.md` — Technology stack, versions, dependencies
- `INTEGRATIONS.md` — External APIs, authentication, services
- `CONCERNS.md` — Technical debt, bugs, scaling issues

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` — Landing page (public, marketing)
- `src/app/(app)/dashboard/page.tsx` — Main dashboard (protected)
- `src/app/(catalog)/world/[slug]/[scenario]/page.tsx` — Scenario page (public, SSG)
- `src/app/(app)/tutor/page.tsx` — AI tutor chat (protected)
- `src/app/login/page.tsx` — Login form (public)

**Configuration:**
- `next.config.ts` — Next.js build & runtime config
- `tailwind.config.ts` — Tailwind CSS tokens and theme
- `tsconfig.json` — TypeScript compiler options (path aliases: `@/*` → `src/*`)
- `package.json` — npm dependencies, scripts, build config
- `.env.local` (ignored) — Secret env vars (`ANTHROPIC_API_KEY`, `DATABASE_URL`, `STRIPE_*`)

**Core Logic:**
- `src/lib/curriculum.ts` — All worlds, scenarios, skills (update this to add content)
- `src/lib/progress.ts` — Progress hook, localStorage sync logic
- `src/auth.ts` — Authentication (NextAuth config)
- `src/lib/db.ts` — Prisma client (database connection)
- `src/app/api/tutor/route.ts` — AI tutor endpoint (Claude integration)
- `src/app/api/progress/route.ts` — Progress sync endpoint

**Styling & Design:**
- `src/app/globals.css` — Design tokens (colors, shadows, animations), Tailwind theme
- Theme colors: `--paper`, `--ink`, `--vermilion`, `--teal`, `--plum`, `--sky`, `--moss`, `--gold`
- Fonts: Fraunces (display), Hanken Grotesk (body), via Google Fonts
- Dark mode: Toggled via `.dark` class on `<html>`

**Testing:**
- No test files yet; patterns documented in `TESTING.md`
- Future: Jest or Vitest config files would go here

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Dashboard.tsx`, `WorldCard.tsx`, `PronunciationLab.tsx`)
- Pages: `page.tsx` (Next.js convention; lowercase)
- API routes: `route.ts` (Next.js convention; lowercase)
- Utilities/Hooks: camelCase (e.g., `useProgress.ts`, `curriculum.ts`, `progress.ts`)
- Types: PascalCase with `.d.ts` suffix if type-only (e.g., `speech.d.ts`)

**Directories:**
- Feature/section folders: kebab-case (e.g., `practice/`, `motion/`, `analytics/`)
- API routes: kebab-case (e.g., `/api/auth/`, `/api/billing/`, `/api/stripe/webhook`)
- Route groups: parentheses (e.g., `(app)`, `(catalog)`)

**Functions & Variables:**
- Hooks: `use*` prefix (e.g., `useProgress`, `useSession`)
- Constants: UPPER_CASE (e.g., `SKILL_META`, `WORLDS`, `DAILY_CAP`)
- Helper functions: camelCase (e.g., `getScenario`, `today()`, `daysBetween()`)
- React Components: PascalCase (e.g., `function Dashboard() {}`)

**Types:**
- Interfaces: PascalCase (e.g., `ProgressState`, `AttemptStat`, `Scenario`, `World`)
- Unions: PascalCase (e.g., `Skill = "grammar" | "speaking" | "reading" | "writing"`)
- Database models: PascalCase (e.g., `User`, `TutorUsage`)

## Where to Add New Code

**New Feature:**
- Primary code: Add component to `src/components/` or new subdirectory (e.g., `src/components/features/NewFeature.tsx`)
- Page route: Add under `src/app/(app)/` if protected, `src/app/(catalog)/` if public
- API endpoint: Create route under `src/app/api/[feature]/route.ts`
- Tests: Co-located next to file (e.g., `Dashboard.tsx` → `Dashboard.test.tsx`)
- Style: Use Tailwind classes directly in JSX; any new tokens go to `src/app/globals.css`

**New Learning Content:**
- Curriculum scenarios: Update `src/lib/curriculum.ts` (add to `WORLDS` array)
- Grammar questions: Add to `src/lib/content/grammar.ts`
- Reading texts: Add to `src/lib/content/reading.ts`
- Vocabulary cards: Add to `src/lib/content/vocabulary.ts`
- Phrases: Add to `src/lib/content/phrases.ts`
- Writing prompts: Add to `src/lib/content/writing.ts`

**New Component/Module:**
- Implementation: `src/components/NewComponent.tsx` (if UI), `src/lib/newFeature.ts` (if logic)
- If needs styling tokens: Add to `src/app/globals.css` (update `:root` and `.dark` color definitions)
- If needs database table: Add model to `prisma/schema.prisma` → run `npm run db:push` (or `prisma db push`)

**Utilities & Helpers:**
- Shared functions: `src/lib/utils.ts` (if generic), or feature-specific file (e.g., `src/lib/stripe.ts`)
- Data transformers: Keep in same file or import from `src/lib/` depending on reusability
- Path aliases: Always use `@/` for imports from `src/` (configured in `tsconfig.json`)

## Special Directories

**`.env.local` (Secrets):**
- Purpose: Local environment variables (never committed)
- Add to `.gitignore` — contents include:
  - `ANTHROPIC_API_KEY` — Claude API key (for `/api/tutor`)
  - `DATABASE_URL` — PostgreSQL connection string
  - `AUTH_SECRET` — NextAuth JWT secret (generated by `next auth secret`)
  - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — OAuth credentials (optional)
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — Stripe keys (optional, for billing)
- Status: Generated/managed locally; production values set in deployment platform (Coolify, Vercel, etc.)

**`node_modules/` (Dependencies):**
- Purpose: npm packages (auto-generated, ~500 MB)
- Do NOT commit; install via `npm ci` in CI/CD
- Add to `.gitignore`

**`.next/` (Build Output):**
- Purpose: Next.js build cache and compiled code
- Generated by `npm run build`
- Add to `.gitignore`

**`.git/` (Version Control):**
- Purpose: Git repository metadata
- Do NOT edit manually

**`.claude/` (Claude Code Config):**
- Purpose: Project-specific Claude settings (`CLAUDE.md`, `settings.json`, skills)
- Checked in; guides AI behavior for this project

## File Location Quick Reference

| What? | Where? |
|-------|--------|
| Add a new world/scenario | `src/lib/curriculum.ts` |
| Add grammar questions | `src/lib/content/grammar.ts` |
| Create a new page | `src/app/(app)/[feature]/page.tsx` (protected) or `src/app/(catalog)/[feature]/page.tsx` (public) |
| Create an API endpoint | `src/app/api/[feature]/route.ts` |
| Build a reusable component | `src/components/NewComponent.tsx` |
| Add a practice activity | `src/components/practice/NewActivity.tsx` |
| Create a utility function | `src/lib/[feature].ts` |
| Add a database table | `prisma/schema.prisma` (then `npm run db:push`) |
| Update design tokens | `src/app/globals.css` (`:root` and `.dark` sections) |
| Write tests | `src/[path]/FileName.test.ts` (co-located) |
| Add environment variable | `.env.local` (local only) or deployment platform settings |

---

*Structure analysis: 2026-07-23*
