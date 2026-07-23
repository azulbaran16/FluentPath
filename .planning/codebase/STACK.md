# Technology Stack

**Analysis Date:** 2026-07-23

## Languages

**Primary:**
- TypeScript 5 - Full codebase (frontend and backend)
- JavaScript (ES2017+ via TypeScript) - Runtime transpilation
- SQL - PostgreSQL queries via Prisma ORM

**Secondary:**
- CSS (Tailwind CSS v4) - Styling

## Runtime

**Environment:**
- Node.js 20 LTS (specified in Dockerfile, production runtime)
- Browser: Chrome/Edge preferred (Web Speech API for pronunciation)

**Package Manager:**
- npm (with `--legacy-peer-deps` flag for installation)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.9 (App Router) - Full-stack framework
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind

**Authentication:**
- NextAuth.js (Auth.js) 5.0.0-beta.31 - Session management and OAuth

**ORM & Database:**
- Prisma 6.19.3 - Database ORM for schema management
- @prisma/client 6.19.3 - Query client

**Build & Dev:**
- TypeScript 5 - Type checking
- ESLint 9 - Linting
- ESLint Config Next 16.2.9 - Next.js linting rules
- PostCSS - CSS transformation pipeline
- Next.js built-in build system - Compilation and bundling

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.106.0 - Claude AI integration for tutor feature (`src/app/api/tutor/route.ts`)
- stripe 22.2.3 - Payment processing for Pro subscriptions (`src/app/api/billing/*`, `src/app/api/stripe/webhook/route.ts`)
- next-auth 5.0.0-beta.31 - Authentication provider management (`src/auth.ts`)

**Infrastructure:**
- prisma 6.19.3 - Schema management and migrations
- @prisma/client 6.19.3 - Database client
- nodemailer 9.0.1 - Email delivery (SMTP) for password resets (`src/lib/email.ts`)
- bcryptjs 3.0.3 - Password hashing and verification (`src/auth.ts`)
- zod 4.4.3 - Runtime type validation and schemas
- lucide-react 1.21.0 - Icon library

**Type Definitions:**
- @types/node 20 - Node.js types
- @types/react 19 - React types
- @types/react-dom 19 - React DOM types
- @types/bcryptjs 2.4.6 - bcryptjs types
- @types/nodemailer 8.0.1 - Nodemailer types

## Configuration

**Environment:**
- Production: `DATABASE_URL` (PostgreSQL connection string via Coolify environment)
- Development: Supports SQLite (local) and PostgreSQL
- Environment files: `.env` (local development), configuration via Coolify for production
- Key env vars (see `.env.example`):
  - `DATABASE_URL` - Database connection string
  - `AUTH_SECRET` - NextAuth.js session encryption key
  - `AUTH_URL` - Deployment URL for OAuth callbacks
  - `ANTHROPIC_API_KEY` - Claude API key (optional, enables AI tutor)
  - `STRIPE_SECRET_KEY` - Stripe secret for payments
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
  - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` - Google OAuth (optional)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` - Email config
  - `GA_ID` - Google Analytics 4 ID (optional)
  - `META_PIXEL_ID` - Meta Pixel ID (optional)

**Build:**
- `tsconfig.json` - TypeScript configuration with strict mode enabled
- `next.config.ts` - Next.js configuration (standalone output for Docker, CSP headers, security headers)
- `tailwind.config.js` - Tailwind CSS plugins
- `postcss.config.mjs` - PostCSS configuration with Tailwind
- `eslint.config.mjs` - ESLint configuration (Next.js vitals + TypeScript rules)
- `prisma/schema.prisma` - Prisma data model and migrations

## Platform Requirements

**Development:**
- Node.js 20+
- npm with `--legacy-peer-deps` support
- Docker (optional, for local Postgres via `docker-compose.yml`)
- PostgreSQL 16 (optional local setup via Docker Compose)
- Environment variables configured in `.env`

**Production:**
- Docker (Node.js 20-slim image)
- PostgreSQL 16 (managed via Coolify)
- Coolify or compatible Docker host with reverse proxy (Traefik)
- Environment variables injected at runtime via container orchestration
- Internet connectivity for:
  - Anthropic API (Claude models)
  - Stripe API (payments)
  - Google Analytics (GA4)
  - Meta Pixel (conversion tracking)
  - Email SMTP provider (for password resets)
  - Google OAuth (optional authentication)

**Security Headers:**
- Content-Security-Policy with inline scripts for hydration
- Strict-Transport-Security (1 year, includeSubDomains)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: microphone allowed for Web Speech API, camera and geolocation blocked

---

*Stack analysis: 2026-07-23*
