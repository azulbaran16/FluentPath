<!-- refreshed: 2026-07-23 -->
# Architecture

**Analysis Date:** 2026-07-23

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        UI Layer (React)                              │
│  Pages: Dashboard, Worlds, Scenarios, Tutor, Settings, Pro Billing │
│  Components: AppShell, Sidebar, WorldCard, ScenarioView, etc.       │
│  `src/components/` `src/app/`                                       │
└─────────────────────────────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┼──────────────────────┐
                    │                         │                      │
                    ▼                         ▼                      ▼
        ┌──────────────────────┐  ┌──────────────────┐  ┌────────────────┐
        │  API Routes Layer    │  │  Client Hooks    │  │  Content Lib   │
        │  /api/tutor          │  │  useProgress()   │  │  curriculum.ts │
        │  /api/progress       │  │  useSession()    │  │  grammar.ts    │
        │  /api/auth           │  │  `src/lib/`      │  │  reading.ts    │
        │  /api/billing        │  │                  │  │  phrases.ts    │
        │  /api/stripe/webhook │  │                  │  │  vocabulary.ts │
        │  `src/app/api/`      │  │                  │  │  `src/lib/`    │
        └──────────┬───────────┘  └────────┬─────────┘  └────────┬───────┘
                   │                       │                      │
                   │                       └──────────┬───────────┘
                   │                                  │
                   └──────────────┬───────────────────┘
                                  │
                    ┌─────────────────────────────────┐
                    │  Data Layer (Persistence)       │
                    │  - localStorage (client-side)   │
                    │  - Prisma ORM                   │
                    │  - PostgreSQL (production)      │
                    │  `src/lib/db.ts`                │
                    │  `prisma/schema.prisma`         │
                    └─────────────────────────────────┘
                                  │
                    ┌─────────────────────────────────┐
                    │  External Services              │
                    │  - Claude Haiku API (Tutor)     │
                    │  - Stripe (Billing)             │
                    │  - NextAuth (Authentication)    │
                    │  - Nodemailer (Email)           │
                    └─────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| AppShell | Main layout wrapper with Sidebar | `src/components/AppShell.tsx` |
| Sidebar | Navigation and user menu | `src/components/Sidebar.tsx` |
| Dashboard | Main dashboard with progress, next scenario, weak topics | `src/components/Dashboard.tsx` |
| ScenarioView | Scenario content and practice options | `src/components/ScenarioView.tsx` |
| PronunciationLab | Speaking practice with Web Speech API | `src/components/practice/PronunciationLab.tsx` |
| GrammarQuiz | Grammar questions with scoring | `src/components/practice/GrammarQuiz.tsx` |
| ReadingRoom | Reading comprehension with graduated texts | `src/components/practice/ReadingRoom.tsx` |
| WritingDesk | Writing practice with AI feedback stubs | `src/components/practice/WritingDesk.tsx` |
| ReviewView | Spaced repetition review (Leitner system) | `src/components/practice/ReviewView.tsx` |
| DiagnosticTest | CEFR level placement test (A2-C1) | `src/components/practice/DiagnosticTest.tsx` |
| ProView | Pro subscription features and upgrade CTA | `src/components/ProView.tsx` |

## Pattern Overview

**Overall:** Next.js 16 App Router with React 19 — full-stack TypeScript web app using file-based routing.

**Key Characteristics:**
- **Public + Protected Routes** — Layouts enforce auth (`(app)` requires login; `(catalog)` is public for SEO)
- **Client-First Progress** — localStorage-first UX with optional server sync for authenticated users
- **Content as Data** — Curriculum, grammar questions, reading texts all defined in TypeScript data files (`src/lib/content/`)
- **API-Gated Features** — Pro features (AI Tutor, daily message caps) enforced at endpoint level
- **SSG for SEO** — Scenario pages use `generateStaticParams()` to pre-render for search indexing

## Layers

**UI Layer (React Components):**
- Purpose: Render interactive UI, handle client-side state, collect user input
- Location: `src/components/`
- Contains: Pages (`src/app/`), reusable components, layout shells
- Depends on: Hooks (`useProgress`, `useSession`), Icons, Tailwind CSS
- Used by: Browser (client-side execution)

**Pages/Routes Layer (Next.js App Router):**
- Purpose: Define URL structure and server-side rendering logic
- Location: `src/app/` with groups `(app)` (protected) and `(catalog)` (public)
- Contains: Page files, layouts, error boundaries, middleware via layout guards
- Depends on: Auth checks, Prisma queries, content data
- Used by: Next.js router; entry point for all requests

**API Layer (Backend Endpoints):**
- Purpose: Handle POST/PUT requests, guard pro features, integrate external services
- Location: `src/app/api/`
- Key routes:
  - `POST /api/tutor` — Claude AI tutor (requires Pro + auth + daily cap)
  - `GET/PUT /api/progress` — Read/write user progress (requires auth)
  - `POST /api/auth/[...nextauth]` — NextAuth handlers (sign-in, callback, session)
  - `POST /api/billing/checkout` — Stripe checkout session
  - `POST /api/stripe/webhook` — Stripe event webhook (subscription updates)
- Depends on: Prisma, NextAuth session, Anthropic SDK, Stripe SDK
- Used by: Frontend `fetch()` calls, external webhooks

**Business Logic Layer (Hooks & Utils):**
- Purpose: Encapsulate complex state, data formatting, calculations
- Location: `src/lib/`
- Key exports:
  - `useProgress()` — Stateful hook managing client-side + server-synced progress
  - `auth()` — NextAuth session getter (server-side)
  - `prisma` — Singleton Prisma client
  - Data functions: `getScenario()`, `WORLDS`, skill metadata
- Depends on: NextAuth, Prisma, localStorage API
- Used by: Components, API routes

**Data Layer (Persistence):**
- Purpose: Durable storage of user accounts, progress, billing state
- Location: `src/lib/db.ts` (Prisma client), `prisma/schema.prisma` (schema)
- Models:
  - `User` — Account, subscription, referral, progress (as JSON string)
  - `TutorUsage` — Daily usage cap tracking (userId + day composite key)
  - `PasswordResetToken` — Reset flow tokens
- Technologies: PostgreSQL (production), SQLite (development option)
- Used by: API routes, NextAuth callbacks

**Content Library (Single Source of Truth):**
- Purpose: Define all curriculum, exercises, text content in code
- Location: `src/lib/` and `src/lib/content/`
- Key files:
  - `curriculum.ts` — 6 worlds, 40+ scenarios, 4 skills, CEFR levels
  - `grammar.ts` — 200+ grammar questions with answers
  - `reading.ts` — Graduated reading texts by level
  - `vocabulary.ts` — Vocabulary cards organized by topic/scenario
  - `phrases.ts` — Scenario-specific phrases
  - `writing.ts` — Writing prompts and model answers
- Depends on: Nothing (pure data)
- Used by: Dashboard, practice components, SEO metadata generation

## Data Flow

### Primary Request Path (User Learns)

1. **Enter Scenario** — User clicks scenario on dashboard (`src/components/Dashboard.tsx`)
   → Routes to `/world/[slug]/[scenario]` (`src/app/(catalog)/world/[slug]/[scenario]/page.tsx`)

2. **Render Scenario** — Server-side page loads scenario metadata from curriculum
   → Renders `<ScenarioView />` with practice options (speaking, grammar, reading, writing)

3. **Start Practice** — User picks a skill (e.g., "Speaking")
   → Client-side component loads (e.g., `<PronunciationLab />` in `src/components/practice/`)
   → Reads questions/phrases from `src/lib/content/` data files

4. **User Completes Exercise** — Web Speech API records audio, scores locally
   → `useProgress()` hook updates client-side state (XP, streak, SRS box)
   → Progress written to localStorage key `"fluentpath:progress:v2"`

5. **Sync to Server (Authenticated User)** — After session, progress hook calls `PUT /api/progress`
   → API route (`src/app/api/progress/route.ts`) validates auth via NextAuth
   → Prisma updates `User.progress` JSON field + `User.level` string

### AI Tutor Chat Flow (Claude API)

1. **User Opens Chat** — Routes to `/tutor` → `<SpeakingWorkspace />` or scenario chat
   → Displays message history (client state)

2. **User Sends Message** — Frontend calls `POST /api/tutor` with `{ messages, scenario }`
   → API checks: auth token, Pro status, daily cap (via `TutorUsage` table)

3. **Claude Responds** — If all gates pass:
   → Builds system prompt from `tutorSystemPrompt()` (includes scenario context)
   → Calls Anthropic SDK with `claude-haiku-4-5-20251001`
   → Extracts text response, increments daily usage count

4. **Return Reply** — Response sent back to client
   → If over daily cap: returns "limit reached" stub
   → If not Pro: returns upgrade prompt
   → If no API key: returns demo mode stub

### Progress Sync Flow

1. **Client Saves Locally** — `useProgress()` hook writes to localStorage immediately
   → App remains functional offline

2. **Session Exists** — Hook detects authenticated user via `useSession()`
   → Debounced `PUT /api/progress` call (every few seconds, or on route change)

3. **Server Persists** — Prisma upserts `User.progress` JSON + `User.level`
   → Next login: `GET /api/progress` fetches server state
   → Client merges server + local (server wins for conflicts)

**State Management:**
- **Placement Test** — Estimated CEFR level (A2-C1) stored in `User.level`
- **Progress State** — Serialized JSON in `User.progress` field (mirrors `ProgressState` TypeScript type)
- **XP & Streak** — Calculated client-side from completed scenarios + dates; persisted in progress JSON
- **SRS (Spaced Repetition)** — Leitner-style boxes (0-5); due dates tracked in progress; review page filters by due date
- **Weak Topics** — Extracted from `attempts` records in progress; used by dashboard to recommend review

## Key Abstractions

**Scenario & World:**
- Purpose: Represent a learning context (e.g., "small talk at a party")
- Type: Interfaces in `src/lib/curriculum.ts`
- Usage: Linked throughout the app; slug-based routing; curriculum.ts is single source of truth
- Example: `WORLDS[0].scenarios[0]` → `{ slug: "small-talk", title: "Small talk & breaking ice", … }`

**Skill:**
- Purpose: Classify what learners practice (grammar, speaking, reading, writing)
- Type: Union `"grammar" | "speaking" | "reading" | "writing"`
- Metadata: Name, color token, description — stored in `SKILL_META` record
- Usage: Filter scenarios, track XP per skill, tag exercises

**ProgressState:**
- Purpose: Immutable state snapshot of learner's progress
- Fields: `completed`, `xp`, `skillXp`, `streak`, `level`, `srs`, `vocab`, `attempts`, `todayXp`, `goalXp`
- Stored: localStorage + User.progress (Prisma)
- Type Definition: `src/lib/progress.ts`

**SrsItem (Spaced Repetition):**
- Purpose: Track due date for a question/card across Leitner boxes
- Type: `{ box: number, due: "YYYY-MM-DD" }`
- Box intervals: [0, 1, 3, 7, 16, 30] days
- Usage: Review page filters by `due <= today()`; failure moves back to box 0; success advances one box

**AttemptStat (Mistake Tracking):**
- Purpose: Per-question performance, powering weak-spots detection
- Fields: `topic`, `tries`, `wrong`, `resolved` (got it right last time), `updatedAt`
- Usage: Dashboard shows weakest 3 topics; review page emphasizes them

## Entry Points

**Landing Page (`/`):**
- Location: `src/app/page.tsx`
- Triggers: Public (no auth required); if signed in, redirects to `/dashboard`
- Responsibilities: Marketing copy, world overview, skill explanation, CTA to sign up/log in

**Dashboard (`/dashboard`):**
- Location: `src/app/(app)/dashboard/page.tsx`
- Triggers: Requires auth (guarded by `(app)` layout)
- Responsibilities: Show progress, XP, streak, weak topics; recommend next scenario; link to practice

**Worlds Catalog (`/world` / `/world/[slug]` / `/world/[slug]/[scenario]`):**
- Location: `src/app/(catalog)/world/`
- Triggers: Public (indexable by search engines); auth optional
- Responsibilities: Browse worlds, see scenarios, link to practice, show scenario metadata (SEO)

**Auth Pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`):**
- Location: `src/app/login/`, `src/app/signup/`, etc.
- Triggers: Public; NextAuth routes handle POST submissions
- Responsibilities: Forms for sign-in, registration, password recovery

**Tutor Chat (`/tutor`):**
- Location: `src/app/(app)/tutor/page.tsx`
- Triggers: Requires auth; Pro feature when billing enabled
- Responsibilities: Render chat UI, manage message history, call `/api/tutor`

**API Tutor Endpoint (`POST /api/tutor`):**
- Location: `src/app/api/tutor/route.ts`
- Triggers: User sends message from chat UI
- Responsibilities: Auth check, Pro gate, daily cap, Claude call, usage tracking

## Architectural Constraints

- **Threading:** Single-threaded event loop (Node.js/Next.js); database connection pooled via Prisma
- **Global state:** Prisma client singleton in `src/lib/db.ts` (reused across hot reloads in dev)
- **Session:** JWT-based (NextAuth), stored in secure HTTP-only cookie; no memory leaks between requests
- **Circular imports:** None detected; layers are unidirectional (UI → API → Lib → DB)
- **Real-time updates:** No WebSocket; polling via fetch on route/focus changes; localStorage keeps UI responsive
- **Storage limits:** localStorage has ~5-10 MB limit; progress JSON compression feasible if exceeds limit

## Anti-Patterns

### Inline Scenario Logic in Components

**What happens:** Early components had hardcoded scenario data instead of referencing `curriculum.ts`

**Why it's wrong:** Creates maintenance burden; duplicated scenario data causes inconsistency; routing & metadata out of sync

**Do this instead:** Always look up scenario via `getScenario(worldSlug, scenarioSlug)` from `src/lib/curriculum.ts`; export types from curriculum, never re-define locally

### Unguarded Progress Mutations

**What happens:** `useProgress()` hook allows components to modify progress state without validation

**Why it's wrong:** Components can award arbitrary XP, fake completions, bypass SRS logic

**Do this instead:** Keep progress mutations within `useProgress()` hook only; components call `addXp()`, `completeScenario()`, etc. (abstracted methods)

### Raw localStorage Access

**What happens:** Some components directly call `localStorage.getItem()` instead of using `useProgress()` hook

**Why it's wrong:** Breaks abstraction; theme storage & progress storage mixed together; server-sync logic bypassed

**Do this instead:** Use `useProgress()` for all learning data; reserve direct localStorage for UI state only (theme, open/closed panels)

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**
- **Auth fail:** Redirect to `/login` from layout guard (`src/app/(app)/layout.tsx`)
- **API error (tutor):** Return stub response or "retry later" message; log to console
- **Database disconnect:** Prisma retries automatically; user sees loading state; request eventually times out
- **Missing scenario:** 404 via `notFound()` on scenario page (Next.js error boundary)
- **localStorage fail:** Catch storage quota errors; progress remains in memory; sync to server when possible

## Cross-Cutting Concerns

**Logging:** 
- Client-side: `console.error()`, `console.warn()` for debugging
- Server-side: Prisma logs errors in dev; API routes log errors to console
- No external logging service integrated

**Validation:** 
- Zod schemas for auth credentials (`src/auth.ts`), progress updates (`src/app/api/progress/route.ts`)
- Type safety via TypeScript for curriculum data
- Client-side UI validation (empty fields, required inputs)

**Authentication:** 
- NextAuth with Credentials provider (email/password + bcrypt) and Google OAuth
- JWT sessions stored in secure cookies
- Auth check in layouts via `await auth()` → redirects if missing
- Rate limiting on login attempts (12 tries per 10 min per email)

**Rate Limiting:**
- Login attempts: `src/lib/rate-limit.ts` (memory-based, per process)
- Tutor usage: `TutorUsage` table tracks daily message count; 60 messages/day/user limit
- No API call throttling for other endpoints; relying on Stripe, Anthropic service limits

---

*Architecture analysis: 2026-07-23*
