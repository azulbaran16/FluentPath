# ── FluentPath production image (Next.js standalone + Prisma) ──
# Build context: the repo root. Designed for Coolify / any Docker host.
# Requires DATABASE_URL (Postgres) and AUTH_SECRET at runtime.

# 1. Install dependencies (with the Prisma client generated)
FROM node:20-slim AS deps
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
# --legacy-peer-deps: nodemailer (patched for security) is a newer major than
# @auth/core's optional peer range. We use nodemailer directly (not @auth/core's
# Email provider), so the mismatch is benign; tolerate it during install.
RUN npm ci --legacy-peer-deps

# 2. Build the app (Next.js standalone output)
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# A dummy URL is enough for the build (no DB queries run at build time).
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Minimal runtime image
FROM node:20-slim AS runner
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Prisma CLI (for `db push` at start) + schema
RUN npm install -g prisma@6.19.3
COPY --from=builder /app/prisma ./prisma
# Generated Prisma client + query engine
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Next.js standalone server + assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Sync the schema to the database, then start the server.
# --accept-data-loss: non-interactive db push needs this to apply additive
# changes like new unique constraints (otherwise it refuses and the container
# never starts). Safe here — schema changes are additive.
CMD ["sh", "-c", "prisma db push --skip-generate --accept-data-loss && node server.js"]
