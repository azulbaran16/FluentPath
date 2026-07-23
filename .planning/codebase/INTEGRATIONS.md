# External Integrations

**Analysis Date:** 2026-07-23

## APIs & External Services

**AI/ML:**
- Anthropic Claude (Haiku 4.5 model) - English tutor conversation engine
  - SDK: @anthropic-ai/sdk 0.106.0
  - Endpoint: `src/app/api/tutor/route.ts`
  - Auth: `ANTHROPIC_API_KEY` (pay-per-use from https://console.anthropic.com)
  - Feature gate: Requires Pro subscription when Stripe is enabled; falls back to stub mode without key
  - Rate limiting: 60 messages per user per day (configurable in `src/app/api/tutor/route.ts`)

**Payments:**
- Stripe - Subscription billing for Pro tier
  - SDK: stripe 22.2.3
  - Checkout: `src/app/api/billing/checkout/route.ts` (creates subscription sessions)
  - Portal: `src/app/api/billing/portal/route.ts` (customer portal link)
  - Webhooks: `src/app/api/stripe/webhook/route.ts` (syncs subscription state)
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Price: $5.00/month (default via `PRO_PRICE_CENTS` in `src/lib/stripe.ts`; can be overridden with `STRIPE_PRICE_ID`)
  - Events tracked: `checkout.session.completed`, `customer.subscription.created/updated/deleted`

**Email:**
- SMTP (configurable provider, e.g., SendGrid, Mailgun, AWS SES)
  - SDK: nodemailer 9.0.1
  - Module: `src/lib/email.ts`
  - Config env vars: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
  - Features: Password reset emails with time-limited reset links (1 hour validity)
  - Fallback: Logs emails to console if SMTP not configured (useful in development)

## Data Storage

**Databases:**
- PostgreSQL 16 (production on Coolify)
  - Connection: `DATABASE_URL` (e.g., `postgresql://user:pass@host:5432/fluentpath`)
  - ORM: Prisma 6.19.3
  - Client: @prisma/client 6.19.3
  - Schema: `prisma/schema.prisma` (User, TutorUsage, PasswordResetToken models)
  - Migrations: Handled by Prisma CLI at runtime (`prisma db push` in Dockerfile)
  - Local dev: SQLite or Docker Postgres (via `docker-compose.yml`)

**File Storage:**
- None configured - local filesystem only (no S3, CDN, or blob storage)
- Avatars: External (OAuth providers like Google return image URLs)

**Caching:**
- None configured - all requests hit database directly
- In-memory: Prisma connection pooling (default 10 connections)

## Authentication & Identity

**Auth Provider:**
- NextAuth.js (Auth.js) 5.0.0-beta.31 - Custom implementation
  - Configuration: `src/auth.ts`
  - Handlers: `src/app/api/auth/[...nextauth]/route.ts`
  - Session strategy: JWT
  - Providers:
    1. **Credentials** (email + password) - Custom implementation with bcryptjs hashing
    2. **Google OAuth** (optional, auto-enabled when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set)
  - Session config: JWT-based, trustHost enabled for reverse proxy (Coolify/Traefik)
  - Sign-in page: `/login` (custom page at `src/app/(catalog)/login/page.tsx`)
  - Password hashing: bcryptjs 3.0.3

**Password Management:**
- Hash algorithm: bcryptjs v3.0.3 (salted, cost-factor based)
- Reset flow: 
  - Endpoint: `src/app/api/auth/forgot/route.ts` (generates SHA256 token hash, emails reset link)
  - Token validity: 1 hour
  - Endpoint: `src/app/api/auth/reset/route.ts` (validates and applies new password)
- Rate limiting: 12 login attempts per 10 minutes per email; 5 reset requests per 15 minutes per IP

**Authorization:**
- Private routes guarded by session checks (`src/app/(app)/` layout)
- Pro-feature gating: `isPro()` function in `src/lib/stripe.ts` checks `proUntil` date

## Monitoring & Observability

**Error Tracking:**
- None configured (errors logged to stdout in Docker container logs)

**Logs:**
- Console logs (Prisma: errors and warnings in dev, errors only in production)
- Tutor errors logged to console: `[tutor] Anthropic error` prefix
- Email fallback: Password reset emails logged to console if SMTP not configured

**Analytics:**
- Google Analytics 4 (GA4) - Optional
  - ID env var: `GA_ID` (format: `G-XXXXXXXXXX`)
  - Script: Injected via `src/components/analytics/Analytics.tsx`
  - Tracking: Page views (automatic via gtag)
  - CSP: Allows `https://www.googletagmanager.com` and GA domains

- Meta Pixel (Facebook/Instagram) - Optional
  - ID env var: `META_PIXEL_ID` (numeric ID)
  - Script: Injected via `src/components/analytics/Analytics.tsx`
  - Tracking: Page views and conversion events (fbq)
  - CSP: Allows `https://connect.facebook.net`

## CI/CD & Deployment

**Hosting:**
- Coolify (Docker-based PaaS) - User's self-hosted instance
  - Docker image: Node.js 20-slim
  - Deployment: `Dockerfile` with multi-stage build (deps → builder → runner)
  - Database: PostgreSQL 16 (managed by Coolify)
  - Reverse proxy: Traefik (with `trustHost: true` in NextAuth config)
  - Auto-migration: `prisma db push --skip-generate --accept-data-loss` at startup

**CI Pipeline:**
- None configured (manual deployment via Coolify git integration or `docker push`)

**Build Output:**
- Next.js standalone output (`.next/standalone/`)
- Static assets (`.next/static/`)
- Public files (`public/`)
- Prisma client and schema (`node_modules/.prisma/`, `prisma/schema.prisma`)

## Environment Configuration

**Required env vars (for production):**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth.js session encryption (generate with `npx auth secret`)
- `AUTH_URL` - Deployment URL (e.g., `https://fluentpath.example.com`)
- `NEXT_PUBLIC_SITE_URL` - Public site URL for OG images and links

**Optional env vars (features):**
- `ANTHROPIC_API_KEY` - Enables AI tutor (Claude Haiku)
- `STRIPE_SECRET_KEY` - Enables Stripe payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing (required if `STRIPE_SECRET_KEY` set)
- `STRIPE_PRICE_ID` - Custom Stripe price ID (uses default $5/mo if not set)
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` - Enables Google OAuth
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` - Email delivery
- `GA_ID` - Google Analytics 4 tracking
- `META_PIXEL_ID` - Meta Pixel conversion tracking

**Secrets location:**
- Production: Coolify environment variables (injected into container at runtime)
- Development: `.env` file (not committed to git)
- Template: `.env.example` documents required variables

## Webhooks & Callbacks

**Incoming:**
- `POST /api/stripe/webhook` - Stripe webhook endpoint
  - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Verification: Stripe signature validation via `STRIPE_WEBHOOK_SECRET`
  - Action: Syncs subscription state from Stripe to local database

- `POST /api/auth/callback/google` - Google OAuth callback (NextAuth.js handled)
  - Redirect: Set at https://console.cloud.google.com as `<AUTH_URL>/api/auth/callback/google`

**Outgoing:**
- `POST /api/billing/checkout` - Internal endpoint (returns Stripe Checkout URL, no webhook)
- `POST /api/billing/sync` - Internal endpoint (manual sync of Stripe subscription state)

**Email outbound:**
- Password reset emails sent via SMTP when user requests reset

---

*Integration audit: 2026-07-23*
