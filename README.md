# FluentPath

Web app to learn English to a native level: interactive real-life scenarios +
an AI tutor. Practice **speaking, grammar, reading and writing**, with real
accounts, persistent progress and a spaced-repetition memory engine.

Built with **Next.js 16 · React 19 · TypeScript · Tailwind v4 · Auth.js ·
Prisma**.

## Quick start (local)

```bash
npm install
cp .env.example .env        # then edit .env (defaults work for local SQLite)
npx prisma migrate dev      # creates the local SQLite database
npm run dev                 # http://localhost:3000
```

Use **Chrome or Edge** to enable the speaking/pronunciation microphone.

Generate a real auth secret for `.env`:

```bash
npx auth secret
```

## What works today (no paid API needed)

- **Accounts** — email + password (passwords hashed with bcrypt), with account
  settings (change name/password, delete account) and a password-reset flow
  (emails via SMTP when configured; otherwise the reset link is logged). Google
  sign-in turns on automatically once you add its credentials.
- **Real persistence** — progress is stored per user in the database, not just
  in the browser; anonymous local progress migrates to the account on first
  sign-in.
- **Practice** — pronunciation lab (Web Speech API, word-level scoring), grammar
  quiz, reading room, writing desk.
- **Learning engine** — placement test (CEFR estimate), spaced-repetition
  review, day streak, per-skill progress.
- **SEO** — public, indexable scenario/skill catalog (great content funnel),
  per-page metadata, `sitemap.xml`, `robots.txt`, JSON-LD, and a generated
  Open Graph image. Private pages (dashboard, review…) are noindex.

## Project layout

```
src/
  app/
    page.tsx              Public landing page
    login/  signup/       Auth pages
    (app)/                Signed-in app (guarded) — dashboard, world, skill,
                          tutor, diagnostic, review
    api/
      auth/[...nextauth]  Auth.js handlers
      signup/             Account creation
      progress/           Per-user progress (GET/PUT)
      tutor/              AI tutor (stub until ANTHROPIC_API_KEY)
  auth.ts                 Auth.js config (Credentials + Google)
  lib/
    curriculum.ts         6 worlds / scenarios (source of truth)
    progress.ts           Local-first + server-synced progress hook
    db.ts                 Prisma client
  components/             UI + practice components
prisma/schema.prisma      Data model (SQLite dev → Postgres prod)
```

## Deploy to production (Vercel + Neon)

1. **Database (Neon, free):** create a project at https://neon.tech and copy the
   pooled connection string.
2. In `prisma/schema.prisma`, set `provider = "postgresql"`.
3. Set env vars on Vercel: `DATABASE_URL` (Neon string), `AUTH_SECRET`,
   `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` (your deployed URL). Run
   `npx prisma migrate deploy`.
4. Push to GitHub and import the repo at https://vercel.com/new — Vercel builds
   and deploys automatically.

### Enable Google sign-in (optional)

1. Create OAuth credentials at https://console.cloud.google.com.
2. Authorized redirect URI: `<AUTH_URL>/api/auth/callback/google`.
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. The Google button appears
   automatically.

### Enable the AI tutor (final phase, optional)

Set `ANTHROPIC_API_KEY` (from https://console.anthropic.com — pay-per-use,
separate from Claude Pro/Max). Until then the tutor runs in demo mode.
