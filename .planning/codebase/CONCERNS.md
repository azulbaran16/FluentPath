# Codebase Concerns

**Analysis Date:** 2026-07-23

## Tech Debt

**Password validation inconsistency:**
- Issue: Login endpoint (`src/auth.ts` line 11) accepts passwords with minimum 1 character, but signup (`src/app/api/signup/route.ts` line 11) and password change (`src/app/api/account/password/route.ts` line 8) enforce 8 characters. This creates weak accounts.
- Files: `src/auth.ts`, `src/app/api/signup/route.ts`, `src/app/api/account/password/route.ts`
- Impact: Attackers can brute-force accounts created via signup with weak passwords if they intercept signup flow; login with single-character passwords is possible.
- Fix approach: Update `src/auth.ts` line 11 to enforce `z.string().min(8)` consistently.

**In-memory rate limiter not distributed:**
- Issue: `src/lib/rate-limit.ts` uses in-memory Map to track login/signup attempts. Counters reset on server restart and don't share across multiple instances.
- Files: `src/lib/rate-limit.ts`, `src/auth.ts` (line 26), `src/app/api/signup/route.ts` (line 17)
- Impact: In production (Coolify with multiple replicas or horizontal scaling), rate limiting becomes ineffective. Brute-force attacks can bypass limits by hitting different instances.
- Fix approach: Migrate to Redis-backed rate limiter or Prisma-backed counter with atomic increments for multi-instance deployments.

**No test coverage:**
- Issue: Zero test files exist in the codebase. No jest/vitest configuration.
- Files: Entire `src/` directory
- Impact: Regressions introduced silently. Auth changes, API modifications, and business logic changes have no automated safety net.
- Fix approach: Add jest or vitest config. Start with critical paths: auth endpoints, progress sync, billing webhook.

**Prisma schema migrations use --accept-data-loss flag:**
- Issue: `Dockerfile` line 53 runs `prisma db push --accept-data-loss`. This flag silently accepts data loss for schema changes.
- Files: `Dockerfile`, `DEPLOY-COOLIFY.md` line 8
- Impact: Future schema modifications (removing columns, changing constraints) could silently drop data without warning. Assumes all future changes are additive-only.
- Fix approach: Migrate to proper Prisma migrations (`migrate deploy`) for production. Use `db push` only in development.

**next-auth is beta version:**
- Issue: `package.json` line 19 uses `next-auth@5.0.0-beta.31`, not a stable release.
- Files: `package.json`
- Impact: Breaking API changes possible in future releases. Security patches may come via major version bumps.
- Fix approach: Monitor release notes. Upgrade to stable v5 when it releases, or pin to specific patch version.

**nodemailer peer dependency conflict workaround:**
- Issue: `Dockerfile` line 14 uses `npm ci --legacy-peer-deps` because nodemailer has a peer dependency conflict with @auth/core.
- Files: `Dockerfile`, `package.json`
- Impact: Hidden dependency issue that requires non-standard install flags. Future upgrades may break the workaround.
- Fix approach: Pin nodemailer and auth versions that are compatible, or migrate auth email provider.

## Security Considerations

**Password reset token exposed in URL:**
- Risk: `src/lib/email.ts` line 50 embeds reset token in URL query parameter. Tokens appear in browser history, server logs, referer headers, and CDN logs.
- Files: `src/lib/email.ts`, `src/app/api/auth/forgot/route.ts` (line 39)
- Current mitigation: Tokens expire in 1 hour; hash stored in DB (not raw token).
- Recommendations: Use POST-redirect-GET pattern or embed token in session instead of URL.

**Progress object lacks input validation:**
- Risk: `src/app/api/progress/route.ts` PUT endpoint (line 32-35) accepts any object and stores it without validating against ProgressState schema.
- Files: `src/app/api/progress/route.ts`
- Current mitigation: Client-side validation on `useProgress()` hook; data is user-specific.
- Recommendations: Validate incoming progress object against `ProgressState` type using zod or runtime validator. Reject malformed data.

**Stripe webhook error handling missing:**
- Risk: `src/app/api/stripe/webhook/route.ts` line 37-39: if `userIdForCustomer()` or `syncSubscription()` throw, error bubbles up. Webhook returns 200 anyway (line 42), so Stripe thinks it succeeded.
- Files: `src/app/api/stripe/webhook/route.ts`
- Current mitigation: Errors are logged to console.
- Recommendations: Add try-catch, log errors with context, return 500 on sync failure so Stripe retries.

**Stripe customer creation race condition:**
- Risk: `src/lib/stripe.ts` line 30-33: if `prisma.user.update()` fails, customer is created in Stripe but not persisted to DB. Future calls see the unsynced customer.
- Files: `src/lib/stripe.ts`
- Current mitigation: None.
- Recommendations: Wrap in transaction or validate update succeeded before returning.

**Missing error handling in Anthropic API:**
- Risk: `src/app/api/tutor/route.ts` line 127-132: API errors are caught and return a generic message, but tutor usage counter is not rolled back. User consumed a message without getting a response.
- Files: `src/app/api/tutor/route.ts`
- Current mitigation: Daily cap still applies; user can retry.
- Recommendations: Either increment counter after successful response, or accept wasted quota as cost of resilience.

**No observability / error tracking:**
- Risk: Errors are only logged to stdout via `console.error()`. Production errors are not aggregated or alerted.
- Files: Throughout `src/app/api/`
- Current mitigation: Analytics (GA4, Meta Pixel) track conversions but not errors.
- Recommendations: Integrate Sentry or similar error tracking service.

## Known Bugs

**JSON.parse error on corrupted progress data:**
- Symptoms: If progress JSON stored in DB is malformed, `src/app/api/progress/route.ts` line 17 throws uncaught error.
- Files: `src/app/api/progress/route.ts`
- Trigger: Manually corrupting DB, or old version of app writing invalid JSON.
- Workaround: None; requires DB fix.
- Fix approach: Wrap JSON.parse in try-catch, return default empty progress.

## Performance Bottlenecks

**Progress stored as single JSON string:**
- Problem: User's entire progress state (all scenarios, SRS cards, attempts, stats) stored in one `User.progress` column as JSON string.
- Files: `prisma/schema.prisma` line 25, `src/app/api/progress/route.ts`
- Cause: No schema for progress; everything is serialized/deserialized on each read/write.
- Improvement path: Normalize schema into `Scenario`, `SrsItem`, `Attempt` tables. Allows partial updates, querying by topic, analytics on weak areas without parsing JSON.

**Rate limiter sweeps entire Map on every 500th request:**
- Problem: `src/lib/rate-limit.ts` line 16-20: opportunistic cleanup iterates all buckets. With many concurrent users, this pauses request processing.
- Files: `src/lib/rate-limit.ts`
- Cause: Stateless memory cleanup to prevent unbounded growth.
- Improvement path: Use Redis or scheduled background cleanup instead of synchronous sweep.

**Progress sync via 600ms debounce without retry:**
- Problem: `src/lib/progress.ts` line 172: updates sent to server are fire-and-forget. Network failures silently lose data.
- Files: `src/lib/progress.ts`
- Cause: No retry logic, optimistic updates assumed to succeed.
- Improvement path: Add exponential backoff retry; persist failed updates to localStorage queue; retry when online.

## Fragile Areas

**Authentication flow:**
- Files: `src/auth.ts`, `src/app/api/auth/`, `src/app/api/account/`
- Why fragile: Multiple password validation points (login, signup, reset, change) with inconsistent rules. OAuth user creation in signIn callback could race with concurrent signup.
- Safe modification: Add integration tests for all auth flows. Use consistent Zod schema for all password fields.
- Test coverage: Zero tests.

**Billing (Stripe integration):**
- Files: `src/lib/stripe.ts`, `src/app/api/billing/`, `src/app/api/stripe/webhook/`
- Why fragile: Multiple points of failure (customer creation, checkout session, subscription sync) with incomplete error handling. Webhook could silently fail.
- Safe modification: Add error boundary around each Stripe API call. Test webhook with Stripe CLI. Add idempotency.
- Test coverage: Zero tests.

**Progress sync (local-first + server):**
- Files: `src/lib/progress.ts`, `src/app/api/progress/`, Database `User.progress` column
- Why fragile: Conflict resolution is "server wins." Client optimistic updates can be lost if server is down. No rollback.
- Safe modification: Implement proper sync (vector clocks, tombstones, or CRDT). Add offline queue. Test with network simulation.
- Test coverage: Zero tests.

**Tutor chat (Claude API):**
- Files: `src/app/api/tutor/route.ts`, `src/components/Tutor.tsx`
- Why fragile: No retry on API failure. No timeout. No user feedback on backoff.
- Safe modification: Add exponential backoff. Clarify daily cap to user. Add retry UI.
- Test coverage: Zero tests.

## Scaling Limits

**Rate limiter scales to single instance only:**
- Current capacity: ~5000 requests per minute (per instance, before map fills memory).
- Limit: Multiple instances = independent rate limit buckets. Brute-force attacks bypass by load-balancing across replicas.
- Scaling path: Switch to Redis backend (`@upstash/redis` or similar). Atomic increments.

**Progress as JSON string doesn't scale for analytics:**
- Current capacity: ~100K users with full progress history fits in DB with JSON column.
- Limit: Queries on progress data (e.g., "which users struggle with phrasal verbs?") require full table scans with JSON parsing.
- Scaling path: Normalize into relational schema. Allows indexes, faster aggregations.

**Tutor daily cap enforced per user with DB upsert:**
- Current capacity: 60 messages/user/day × 1000 users = 60K API calls/day.
- Limit: Each tutor message requires DB query to check/increment cap. At scale, tutor usage endpoint becomes bottleneck.
- Scaling path: Use in-memory cache (with Redis) for daily limits. Sync back to DB periodically.

**Email sending is synchronous:**
- Current capacity: ~10 password resets/min (nodemailer default).
- Limit: Slow email provider (SMTP timeout) blocks signup/forgot endpoint.
- Scaling path: Queue emails to background job (Bull, RabbitMQ) and send async.

## Dependencies at Risk

**@anthropic-ai/sdk@^0.106.0:**
- Risk: Major version (0.x) means breaking API changes in minor releases.
- Impact: Model names, parameters, response shapes can change without warning.
- Migration plan: Pin to specific patch version (e.g., `0.106.5`). Monitor release notes before upgrading.

**next-auth@5.0.0-beta.31:**
- Risk: Beta version; no stability guarantee. Stable v5 may have breaking changes.
- Impact: Auth APIs, session shape, callbacks could change.
- Migration plan: Upgrade to stable v5 when released. Run full auth test suite.

**prisma@^6.19.3:**
- Risk: Schema migration breaking changes between major versions.
- Impact: `db push` behavior, migration file format could change.
- Migration plan: Test schema changes thoroughly in staging. Keep backup before major version upgrade.

## Missing Critical Features

**Automated testing:**
- Problem: Zero tests. No CI/CD safety net.
- Blocks: Confident refactoring, safe deployments, bug fixes.

**Error observability:**
- Problem: No error tracking or alerting. Errors only in logs.
- Blocks: Detecting production issues before users report them.

**Database schema normalization:**
- Problem: Progress stored as JSON string; no relational schema.
- Blocks: Analytics queries, efficient weak-spot detection, scaling.

**Progress conflict resolution:**
- Problem: Local-first + server sync with no conflict resolution.
- Blocks: Multi-device sync, offline-first PWA, data reliability.

## Test Coverage Gaps

**Authentication endpoints:**
- What's not tested: Login with weak passwords, login rate limit, Google OAuth sign-in, password reset token expiry, password change validation.
- Files: `src/auth.ts`, `src/app/api/auth/`, `src/app/api/signup/route.ts`
- Risk: Regressions in auth silent; security issues undetected.
- Priority: High

**Billing and Stripe webhook:**
- What's not tested: Subscription creation, webhook signature validation, pro user gating, daily tutor cap, referral rewards.
- Files: `src/lib/stripe.ts`, `src/app/api/billing/`, `src/app/api/stripe/webhook/route.ts`
- Risk: Billing bugs cause revenue loss or unauthorized access to Pro features.
- Priority: High

**Progress sync and conflict resolution:**
- What's not tested: Anonymous → signed-in migration, local-server merge, concurrent updates, offline scenarios.
- Files: `src/lib/progress.ts`, `src/app/api/progress/route.ts`
- Risk: User progress silently lost; data corruption undetected.
- Priority: High

**Tutor API and Claude integration:**
- What's not tested: API failure handling, daily cap enforcement, response formatting, context injection.
- Files: `src/app/api/tutor/route.ts`, `src/components/Tutor.tsx`
- Risk: Tutor crashes or behaves unexpectedly undetected until production.
- Priority: Medium

**Email delivery:**
- What's not tested: SMTP failures, malformed email, password reset link generation.
- Files: `src/lib/email.ts`, `src/app/api/auth/forgot/route.ts`
- Risk: Password resets fail silently in production.
- Priority: Medium

---

*Concerns audit: 2026-07-23*
