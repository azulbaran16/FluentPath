---
phase: 02-server-side-progress
plan: 07
type: execute
status: complete
completed: 2026-07-30
completed_tasks: 3 of 3
verified_by: agent-driven browser session (Playwright) against a real local Postgres; production audit run by the user against the live database
branch: phase-02-server-side-progress (merged to main as 1be8ba6)
pushed: true
deployed: true
---

# 02-07 Summary — Phase verification gate

## Status: COMPLETE — verified, merged and live

Every ROADMAP success criterion was exercised in a browser against a real Postgres and
passed, as did both deletion-resurrection cases the plan reviewer identified as blockers.
The live-data audit passed against production. The phase is deployed and serving.

## Task 1 — live-data audit: PASS

Run by the user directly against the live Coolify Postgres, as a read-only SQL check
rather than through the script, because the production `DATABASE_URL` lives only in the
Coolify dashboard and could not reach this machine:

```
--- filas con progreso: 8, problematicas: 0 ---
```

Eight rows carry progress; every one parses and is a JSON object. None would fall back to
the empty state, so none would have been overwritten. **The risk this gate existed to rule
out does not exist in the real data**, and the beta user's progress was never exposed to it.

### The tool, retained for future schema changes

`scripts/audit-stored-progress.mts` is written, committed (`2bf2026`) and exercised in both
directions against a local Postgres:

| Seeded row | Detected as | Exit |
|---|---|---|
| valid blob | survives intact | — |
| `NULL` progress | empty, nothing to lose | — |
| `{NOT VALID JSON` | UNREADABLE, named with its user id | **1** |
| corrupt row removed | all rows survive | **0** |

It only runs `SELECT`, never prints the connection string, and deliberately does not name
`celpipProgress` — production lacks that column until this branch merges, so selecting it
would fail the whole query. Column absence is proven separately by 02-05's schema diff.

To run: place the Coolify `DATABASE_URL` in `.env.production.local` (gitignored), then
`node --experimental-strip-types scripts/audit-stored-progress.mts`.

## Task 2 — automated suite: PASS

| Gate | Result |
|---|---|
| `verify-merge.mts` | 4313/4313 |
| `verify-schema.mts` | 158/158 |
| `verify-queue.mts` | 172/172 |
| `tsc --noEmit` / `lint` / `build` | exit 0 |
| `daysBetween` in merge module (D-01c) | 0 |
| `nowInstant(` in `progress.ts` / `celpip-progress.ts` (D-01b) | 1 / 1 |
| `updateMany` in progress route | 1 |
| schema diff vs pinned baseline `9f6f6df` | exactly one `ADD COLUMN` |

Run independently by the orchestrator on the combined tree after each wave, not only by
the executor that produced each module.

## Task 3 — browser verification: PASS

Driven by an agent through Playwright against `docker compose` Postgres, because the user
was unavailable for hands-on UAT.

### ROADMAP criterion 1 — cross-device
Local cache cleared entirely, page reloaded on the same account: completions, XP, streak,
level, goal and vocab all restored from the server and rendered in the UI.

### ROADMAP criterion 2 — anonymous progress preserved on sign-in
Account seeded with server-side data, browser seeded with *different* anonymous data, then
signed in:

| Field | Server | Local | Merged | Rule |
|---|---|---|---|---|
| `completed` | `work/interview` | `social/greetings` | both | union |
| `xp` | 500 | 300 | 500 | max |
| `streak` / `lastActive` | 7 / 2026-07-29 | 2 / 2026-07-30 | **2 / 2026-07-30** | D-01c pair — not `max(streak)` |
| `level` | B2 | B1 | B2 | highest CEFR |
| `goalXp` | 50 | 30 | **30** | most recent, not max |

Client and server were byte-identical after the reconcile, confirming merge-on-write.

### ROADMAP criterion 3 — malformed rejected, corrupt loads safe
- non-object body → **400**; garbage JSON → **400**
- `{xp:"banana", streak:{evil:true}, completed:{"x/y":true}, hackerField:"junk", __proto__:{polluted:true}}`
  → **200**, `xp` still 500, `streak` still 2, `x/y` saved, junk field absent, prototype
  **not** polluted — D-08 exactly
- row corrupted directly in Postgres → API returned the empty safe default, dashboard
  rendered with no error boundary, and the server logged the **full** blob with the account
  id (never the email), stating that line is the only remaining copy (W2)

### ROADMAP criterion 4 — offline write reaches the server
Writes blocked at the network layer; a vocab card marked; server confirmed to lack it; the
queue observed persisted in `fluentpath:sync:v1` with body and sequence number. Page
reloaded with the network restored → the write landed and the queue drained to
`{progress:null, celpip:null}`.

### Deletion resurrection — the two plan-review blockers (B1, B2)
Reproduced the reviewer's exact scenario: server holding the **larger** map with an
**older** instant.

- **vocab:** card un-marked through the UI, the 2-key version planted server-side with an
  older instant, page reloaded → card did **not** return; deck read 0/8 known
- **CELPIP:** attempt submitted (which clears the draft), a draft containing
  `"RESURRECTED DRAFT"` planted server-side with an older instant, task reopened →
  **editor blank**. `fca41b7` does not reopen.

### Quiet load writes nothing (the X3 gate hole, in reality)
`User.updatedAt` unchanged across a full dashboard load and a `/celpip` load — neither the
progress loop nor the CELPIP loop stamps on reconcile.

### Sync indicator (D-06)
Invisible through 21 seconds and 22 failed attempts, then appeared reading
"Progress not synced — retrying". Silent on a blip, visible when the failure persists.

## The defect this gate found and fixed

**Unreadable rows were silently destroyed** (`db65499`). An unparseable blob read as
`EMPTY`, and merge-on-write then replaced the row with `EMPTY` merged into whatever that
browser held — the learner's history gone, with the server log as the only copy. This was
the phase's one irreversible failure mode, and the reason the audit was a blocking gate.

Both routes now freeze such a row: 409, nothing written, full blob logged. The client's
local cache is untouched and the not-synced indicator surfaces. `sync-queue` classifies 409
as retryable rather than letting it fall into the generic 4xx drop, so a repaired row heals
on the next attempt — no redeploy, no lost work.

Verified end to end against Postgres: with corrupt blobs in both domains, both routes
answered 409 and **both rows were byte-intact afterwards**; once repaired, the pending
write landed and merged with the recovered data (`kept/row` and `new/write` both present).
The 409 rule is mutation-tested — reverting it to `drop` fails the queue proof.

This is what made deploying ahead of the audit acceptable: it converted the failure from
permanent to recoverable. The audit then came back clean anyway.

## Production incident during this gate

Deploying the merge took the site down for ~27 minutes (502 on every path). **The cause was
not this phase**, and it would have happened on any redeploy. Diagnosis, in order:

- The container log showed `prisma db push` succeeding in 146 ms and Next.js `✓ Ready` on
  `0.0.0.0:3000` — the app was healthy throughout.
- The `db push` hypothesis was eliminated by reproducing the exact startup path locally:
  a fresh database with the old schema, a seeded user row, then the new schema pushed on
  top. It succeeds in 103 ms and the row survives with `celpipProgress` NULL.
- External probing found `nginx/1.24.0 (Ubuntu)` serving another app on the same host with
  a 200, so nginx itself was alive; and host port 3000 belonged to a *different* project
  ("Mesa de Fe"), so FluentPath was being reached by container IP.
- `/etc/nginx/sites-available/fluenthapp.com` proxied to `http://10.0.1.4:3000` — the IP of
  the container Coolify replaced during the rolling update.

Fixed by publishing the app on a stable host port (`3100:3000` in Coolify) and repointing
`proxy_pass` at `http://127.0.0.1:3100`, which survives future container replacements.

## Caveats

- **Not a human sign-off.** An agent drove the browser. Subjective judgement — whether the
  indicator's placement and wording land for a real learner — is unconfirmed.
- **Verified against a local Postgres, not production.** The data shapes were seeded by the
  agent; only Task 1 can speak to the rows production actually holds.
- **A second real device was simulated** by clearing local storage on the same browser
  while keeping the session, not by using two machines.
- Zero automated tests still cover the React layer (TEST-01, v2 backlog). The three
  `.mts` proofs cover the pure modules only; routes and hooks are structural.
- `zod` in the shared client/server contract added **+285 KB (+25%)** to client chunks,
  measured by 02-03 with a clean before/after build. Untouched by design — the shared
  contract is the phase's key link — but it is a real cost for a mobile-used learning app.
  Lever if it matters later: server-only zod plus a small hand-rolled client guard, at the
  price of two definitions that can drift.

## Local environment changes made during verification

- `.env` `DATABASE_URL` now points at `postgresql://…@localhost:5433/fluentpath`. It
  previously pointed at `dev.db`, a SQLite path left over from an earlier setup, which
  could not work against the `postgresql` provider in `prisma/schema.prisma`. Original
  backed up to the session scratchpad.
- `docker-compose.override.yml` (new, gitignored) remaps the bundled dev Postgres to host
  port **5433**, because a native Windows Postgres service already listens on 5432 and wins
  host connections. The Docker container and the native service now coexist.
- All test accounts and seeded rows were deleted from the local database afterwards.

## Infrastructure findings (outside phase scope, but load-bearing)

Three fragilities surfaced that nobody knew about, and none of them are phase defects:

- **The GitHub repo has no webhook** — pushing to `main` does not deploy anything. The
  entire branch strategy for this phase was built on the opposite assumption. Deploys are
  manual until a webhook is added.
- **No SSH access** to the Coolify host is configured on the development machine; the key
  present (`andres_hosting`) belongs to an unrelated shared host. Every server-side step in
  this gate had to be relayed through the user.
- **`mesa-de-fe.jzstudio.dev` still proxies to a container IP** (`10.0.1.3`) and will break
  exactly the same way on its next redeploy. Seven other vhosts on that server already use
  the stable `127.0.0.1:<port>` pattern.

## Requirements

PROG-01 through PROG-05 are verified behaviourally against a local Postgres, and the data
assumption underpinning all of them is now verified against production. The phase is
deployed and serving at https://fluenthapp.com.
