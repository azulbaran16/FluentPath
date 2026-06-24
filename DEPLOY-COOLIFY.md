# Deploy FluentPath on Coolify

This app runs as a Docker image (Next.js standalone + Prisma) backed by
Postgres. The repo already includes a `Dockerfile`. These are the steps.

> Local development still uses SQLite by default and is unaffected. You only
> switch to Postgres for the deployed app (step 1).

## 1. Switch Prisma to Postgres

In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Commit and push this change (Coolify builds from your Git repo).

> The container runs `prisma db push` on start, so no migration files are
> needed — it creates/updates the tables from the schema automatically.

## 2. Create the database in Coolify

1. In your project, **+ New Resource → Database → PostgreSQL**.
2. Once it's running, copy its **connection string** (internal URL). It looks
   like `postgresql://USER:PASSWORD@HOST:5432/DBNAME`.

## 3. Create the application in Coolify

1. **+ New Resource → Application → Public/Private Repository.**
2. Point it at `https://github.com/azulbaran16/FluentPath` (branch `main`).
3. **Build Pack: Dockerfile** (Coolify auto-detects the `Dockerfile`).
4. Set the **port** to `3000`.

## 4. Environment variables (in Coolify → the app → Environment)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | the Postgres URL from step 2 |
| `AUTH_SECRET` | run `npx auth secret` (or `openssl rand -base64 32`) |
| `AUTH_URL` | your public URL, e.g. `https://fluentpath.yourdomain.com` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_SITE_URL` | same public URL as `AUTH_URL` |

Optional:

| Variable | Value |
|----------|-------|
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | to enable Google sign-in |
| `ANTHROPIC_API_KEY` | to enable the real AI tutor |

## 5. Domain & deploy

1. Set your domain in Coolify (it provisions HTTPS via Let's Encrypt).
2. Click **Deploy**. The first build takes a few minutes.
3. Open the URL — sign up and you're live.

## 6. After deploy

- For Google sign-in, add the redirect URI in Google Cloud:
  `https://YOURDOMAIN/api/auth/callback/google`.
- Submit your sitemap (`https://YOURDOMAIN/sitemap.xml`) in
  [Google Search Console](https://search.google.com/search-console) to start
  getting indexed.

---

### Optional: run Postgres locally too

If you'd rather develop against Postgres (matching prod) instead of SQLite:

```bash
docker compose up -d db
# in .env:
# DATABASE_URL="postgresql://fluentpath:fluentpath@localhost:5432/fluentpath"
npx prisma db push
npm run dev
```
