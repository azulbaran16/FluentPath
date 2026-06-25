# Deploy FluentPath on Coolify

This app runs as a Docker image (Next.js standalone + Prisma) backed by
PostgreSQL. The repo already includes a production `Dockerfile`, and the Prisma
schema is **already set to `postgresql`** — so steps below are mostly clicking
in Coolify.

> The container runs `prisma db push` on start, so no migration files are
> needed — it creates/updates the tables from the schema automatically.
>
> Local dev now also uses Postgres. Run `docker compose up -d db` and set
> `DATABASE_URL="postgresql://fluentpath:fluentpath@localhost:5432/fluentpath"`.

## 1. Create the database in Coolify

1. In your project: **+ New Resource → Database → PostgreSQL**.
2. Once it's running, copy its **internal connection string**. It looks like
   `postgresql://USER:PASSWORD@HOST:5432/DBNAME`.

## 2. Create the application in Coolify

1. **+ New Resource → Application → Public/Private Repository.**
2. Point it at `https://github.com/azulbaran16/FluentPath` (branch `main`).
3. **Build Pack: Dockerfile** (Coolify auto-detects the `Dockerfile`).
4. Set the **port** to `3000`.

## 3. Environment variables (Coolify → the app → Environment)

Required:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | the Postgres URL from step 1 |
| `AUTH_SECRET` | a long random string (`openssl rand -base64 32`) |
| `AUTH_URL` | your public URL, e.g. `https://fluentpath.yourdomain.com` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_SITE_URL` | same public URL as `AUTH_URL` |

To unlock the paid features (already built):

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | enables the real AI tutor (Rumi) |
| `STRIPE_SECRET_KEY` | Stripe secret key (test `sk_test_…` or live `sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | from the webhook you create in step 5 |
| `STRIPE_PRICE_ID` | optional; if empty a $5/mo price is created inline |

Optional:

| Variable | Value |
|----------|-------|
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | enable Google sign-in |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | real password-reset emails (otherwise links are logged) |

## 4. Domain & deploy

1. Set your domain in Coolify (it provisions HTTPS via Let's Encrypt).
2. Click **Deploy**. The first build takes a few minutes.
3. Open the URL — sign up and you're live.

## 5. After deploy

- **Stripe webhook** (so subscriptions sync reliably): in the Stripe dashboard,
  **Developers → Webhooks → Add endpoint** → `https://YOURDOMAIN/api/stripe/webhook`,
  select the `checkout.session.completed`, `customer.subscription.updated` and
  `customer.subscription.deleted` events. Copy the signing secret into
  `STRIPE_WEBHOOK_SECRET` and redeploy.
- **Google sign-in**: add the redirect URI in Google Cloud:
  `https://YOURDOMAIN/api/auth/callback/google`.
- **SEO**: submit `https://YOURDOMAIN/sitemap.xml` in
  [Google Search Console](https://search.google.com/search-console).

---

### Run Postgres locally (matches prod)

```bash
docker compose up -d db
# in .env:
# DATABASE_URL="postgresql://fluentpath:fluentpath@localhost:5432/fluentpath"
npx prisma db push
npm run dev
```
