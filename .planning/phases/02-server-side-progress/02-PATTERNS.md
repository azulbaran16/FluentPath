# Phase 02: Server-Side Progress - Pattern Map

**Mapped:** 2026-07-28
**Files analyzed:** 7 (2 modified libs, 1 modified route, 1 new route, 1 schema, 2 new modules, 1 new component)
**Analogs found:** 7 / 7 (every file has an in-repo analog; nothing needs to be invented from RESEARCH.md)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/progress.ts` (modify) | hook/store | CRUD + sync | `src/lib/celpip-progress.ts` | exact (sibling store, newer conventions) |
| `src/lib/celpip-progress.ts` (modify) | hook/store | CRUD + sync | `src/lib/progress.ts:112-178` (`useSession` + `putServer` + debounce) | exact |
| `src/app/api/progress/route.ts` (modify) | route handler | request-response | `src/app/api/account/route.ts` (zod + `auth()` + `safeParse`) | exact |
| `src/app/api/celpip-progress/route.ts` (new) | route handler | request-response | `src/app/api/progress/route.ts` (post-hardening) + `src/app/api/account/route.ts` | exact |
| `src/lib/progress-schema.ts` (new, shared validator) | utility | transform | `src/auth.ts:9-12` + `src/app/api/account/route.ts:6` (module-level zod schema) | role-match |
| `src/lib/progress-merge.ts` (new) | utility | transform | `src/lib/rate-limit.ts` (pure, framework-free lib module w/ exported types) | role-match |
| `src/components/SyncIndicator.tsx` (new) | component | event-driven | `src/components/SkillPill.tsx` + `WritingSimulator.tsx:311-313` autosave warning | role-match |
| `prisma/schema.prisma` (modify) | model | — | `prisma/schema.prisma:24-25` (`progress String?`) | exact |

---

## Pattern Assignments

### `src/lib/celpip-progress.ts` — the canonical store shape (READ FIRST)

This is the most recently written store and was deliberately built as the Phase 2
migration contract (`src/lib/celpip-progress.ts:6-10`). It establishes the conventions
both stores should converge on.

**File layout convention** — `"use client"`, imports, a header comment explaining the
persistence policy, `const KEY`, exported `interface`s, exported `EMPTY` default,
module-private `readLocal()`/`writeLocal()`, then a single exported `use*()` hook.
Nothing else is exported; components never touch localStorage directly.

**Defensive read — safe default on any failure** (`src/lib/celpip-progress.ts:45-53`):
```typescript
function readLocal(): CelpipProgressState {
  if (typeof window === "undefined") return CELPIP_EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...CELPIP_EMPTY, ...JSON.parse(raw) } : CELPIP_EMPTY;
  } catch {
    return CELPIP_EMPTY;
  }
}
```
Note the `{ ...EMPTY, ...parsed }` spread: this is the repo's forward-compat idiom —
missing fields fill in from the default, unknown fields pass through. The server-side
validator (D-08, strip-unknown-save-the-rest) is the same idea, and PROG-03's
"safe default rather than crash" is literally this function moved server-side.

**Defensive write — returns success, never swallows** (`src/lib/celpip-progress.ts:55-65`):
```typescript
/** Returns true on a successful write, false if setItem throws (quota
 * exceeded, private browsing, etc). Callers use this to surface a visible
 * warning instead of silently losing the write. */
function writeLocal(s: CelpipProgressState): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
```
Contrast `src/lib/progress.ts:92-98`, whose `writeLocal` returns `void` and swallows the
error (`/* storage unavailable */`). **Phase 2 should upgrade `progress.ts` to the
boolean-returning form** — the retry-queue's own localStorage write (D-07) must know
whether it persisted, or the queue silently evaporates on quota-exceeded.

**Persist funnel returning the write result** (`src/lib/celpip-progress.ts:80-91`):
```typescript
const persist = useCallback(
  (updater: (s: CelpipProgressState) => CelpipProgressState): boolean => {
    let ok = true;
    setState((prev) => {
      const next = updater(prev);
      ok = writeLocal(next);
      return next;
    });
    return ok;
  },
  [],
);
```
Every mutation (`addAttempt`, `saveDraft`, `clearDraft`) goes through this one function —
which is exactly why sync can be added in one place. Same for `src/lib/progress.ts:165-178`.

**SSR-safe mount hydrate, with the eslint escape hatch the repo uses**
(`src/lib/celpip-progress.ts:71-78`, identical at `src/lib/progress.ts:119-126`):
```typescript
/* eslint-disable react-hooks/set-state-in-effect */
useEffect(() => {
  setState(readLocal());
  setReady(true);
}, []);
/* eslint-enable react-hooks/set-state-in-effect */
```
Always paired disable/enable around the smallest possible block — never a file-level
disable. The `ready` flag is part of the public hook return so consumers can wait
(`WritingSimulator.tsx:17` destructures it).

**Hook return convention** (`src/lib/celpip-progress.ts:153-163`): a flat object literal
of `{ ready, state, ...actions, ...derived }`. Derived values are computed in the hook
body (e.g. `completedTasks`, line 149-151), not by the consumer. Adding sync must extend
this object **additively** — `CelpipLanding.tsx` and `WritingSimulator.tsx` destructure by
name and keep working as long as nothing existing is renamed or removed.

**Callback memoization:** every action is `useCallback` with an explicit dep array,
almost always `[persist]`. New sync actions follow suit.

---

### `src/lib/progress.ts` (hook/store, CRUD + sync)

**Analog for the sync half:** itself — it is the only existing server-synced store, so its
current structure is what `celpip-progress.ts` copies, and what this phase hardens.

**Server write pattern to replace** (`src/lib/progress.ts:128-136`):
```typescript
const putServer = useCallback((s: ProgressState) => {
  fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress: s }),
  }).catch(() => {
    /* offline — local cache still holds the data */
  });
}, []);
```
Fire-and-forget, no response check, no retry. The retry queue (D-06/D-07) replaces this
body but should keep the signature `(s: ProgressState) => void` so `persist` is untouched.
Note the envelope: `{ progress: s }`, not the bare state — keep that for the CELPIP route.

**Debounced write inside the persist funnel** (`src/lib/progress.ts:165-178`):
```typescript
const persist = useCallback(
  (updater: (s: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = updater(prev);
      writeLocal(next);
      if (authed) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => putServer(next), 600);
      }
      return next;
    });
  },
  [authed, putServer],
);
```
Established invariants to preserve: local write is unconditional and synchronous; the
server write is gated on `authed` (`src/lib/progress.ts:113-114`, `status === "authenticated"`
from `useSession()`); the learner never waits on the network. The debounce timer lives in
a `useRef` (`line 117`) — the retry queue's timer should too.

**Reconcile effect this phase rewrites** (`src/lib/progress.ts:139-163`) — the
server-wins branch at lines 148-151 is what D-01 replaces with a field-by-field merge, and
the `status !== "authenticated"` early return at line 140 is what D-02 widens to every
authenticated load. Two conventions worth keeping from it:
- the `let cancelled = false` + cleanup guard (lines 141, 160-162) against unmounted setState
- the whole body wrapped in `try { } catch { /* keep local */ }` — a failed reconcile must
  never degrade the local session

`hasData()` (`src/lib/progress.ts:100-107`) is the existing emptiness heuristic; the merge
module can retire it or reuse it, but note it currently ignores `vocab`, `attempts` and
`todayXp` — a merge that trusts it will under-count.

**Versioned client-side migration precedent** (`src/lib/progress.ts:80-91`): the v1 key is
read as a fallback when v2 is absent. Any new persisted key (the retry queue) should get a
versioned name in the same style — `fluentpath:progress:v2` / `fluentpath.celpip.v1`.
Note the two stores use *different separators* (`:` vs `.`); pick one deliberately and
document it rather than copying the inconsistency by accident.

---

### `src/app/api/progress/route.ts` (route handler, request-response)

**Best-practice analog:** `src/app/api/account/route.ts` — the cleanest validated handler
in the repo.

**Session read + zod validation, the whole convention in 10 lines**
(`src/app/api/account/route.ts:1-17`):
```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";

const nameSchema = z.object({ name: z.string().trim().min(1).max(80) });

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = nameSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  }
  ...
  return NextResponse.json({ ok: true });
}
```
Conventions to copy verbatim:
- `import { auth } from "@/auth"` — always `await auth()` first, always the same
  `session?.user?.id` null-check and the identical `{ error: "Unauthorized" }, { status: 401 }`
  response. Confirmed across `src/app/api/progress/route.ts:9-12`,
  `src/app/api/account/route.ts:10-13,27-30`, `src/app/api/billing/sync/route.ts:12-15`.
- `@/` path alias for every internal import; no relative `../../` in routes.
- zod schema declared at module scope, above the handlers, named `<thing>Schema`.
- `safeParse(await req.json().catch(() => null))` — one expression that folds malformed-JSON
  and schema-violation into the same 400. This supersedes the hand-rolled try/catch +
  `typeof` checks currently at `src/app/api/progress/route.ts:26-35`.
- Success is always `NextResponse.json({ ok: true })`; GETs return a named payload
  (`{ progress }`, `{ pro }`).
- Zod is already a dependency (`src/auth.ts:5`) — **no new package needed** for D-08's
  validator. `z.object({...}).catchall(...)` / `.partial()` / per-field `.catch(default)`
  gives the strip-unknown-keep-the-rest behaviour without rejecting the payload.

**The unguarded parse to fix** (`src/app/api/progress/route.ts:17`):
```typescript
const progress = user?.progress ? JSON.parse(user.progress) : null;
```
No try/catch — the CONTEXT "Claude's Discretion" item. The client-side idiom to mirror is
`readLocal()`'s try/catch returning `EMPTY` (`src/lib/celpip-progress.ts:47-52`).

**Derived-column write to preserve** (`src/app/api/progress/route.ts:37-46`): `level` is
denormalized out of the blob into `User.level` on every PUT, and the write uses
`updateMany` + `count === 0` rather than `update` — deliberate, with the reason in a
comment on line 42 ("doesn't throw if the user no longer exists (e.g. stale cookie)").
Keep both behaviours; the CELPIP route should use `updateMany` for the same reason.

**Rate limiting, if the retry queue warrants it:** `src/lib/rate-limit.ts:29` +
usage at `src/auth.ts:26` (`rateLimit(\`login:${email}\`, 12, 10 * 60_000).ok`), with
`clientIp(req)` at `src/lib/rate-limit.ts:51-55` for unauthenticated routes. A misbehaving
retry loop hitting PUT is a plausible failure mode; key it on `progress:${session.user.id}`.

---

### `src/app/api/celpip-progress/route.ts` (new route handler, request-response)

**Analog:** `src/app/api/progress/route.ts` (GET+PUT pair, same file, same envelope) plus
the validation shape from `src/app/api/account/route.ts` above.

Directory convention: one folder per resource under `src/app/api/`, containing exactly
`route.ts`; nesting is used for sub-resources (`api/account/password/route.ts`,
`api/billing/checkout|portal|sync`). So either `api/celpip-progress/route.ts` or
`api/progress/celpip/route.ts` fits the existing tree — the latter groups the two progress
domains, matching how `billing/*` groups its three.

Payload envelope, mirroring `src/lib/progress.ts:132` (`{ progress: s }`):
`{ celpipProgress: state }` on PUT, `{ celpipProgress }` on GET. Select only the needed
column (`select: { celpipProgress: true }`, as at `src/app/api/progress/route.ts:15` and
`src/app/api/billing/sync/route.ts:19`).

---

### `src/lib/progress-schema.ts` (new shared validator)

**Analog:** `src/auth.ts:9-12` and `src/app/api/account/route.ts:6` for the zod idiom;
`src/lib/curriculum.ts` / `src/lib/celpip.ts` for "one module is the single source of
truth for a shape" (see `CLAUDE.md`: "Curriculum ... single source of truth").

Placement note: this module is imported by both a route handler (server) and the hook
(client). It must therefore have **no `"use client"` directive and no imports from
`@/auth`, `@/lib/db`, or `next/server`** — pure zod + type exports only, like
`src/lib/rate-limit.ts` which is framework-free. `src/lib/celpip.ts` is already imported
type-only by a `"use client"` module (`src/lib/celpip-progress.ts:4`), confirming
`src/lib/*` is the right home for shared shapes.

Export the inferred types from the schema and have `ProgressState` / `CelpipProgressState`
become `z.infer<...>` so the interfaces at `src/lib/progress.ts:33-51` and
`src/lib/celpip-progress.ts:14-30` cannot drift from the validator. Keep the existing
export names — they are imported across components.

---

### `src/lib/progress-merge.ts` (new, pure merge)

**Analog:** `src/lib/rate-limit.ts` — the repo's model of a pure, dependency-free
`src/lib` utility: a leading block comment stating scope *and* its known limits and when to
replace it (lines 1-6), exported result `interface` (lines 22-27), then a single exported
function with a `key: string` first arg. Copy that documentation posture; D-01's merge
rules (union / `max()` / highest CEFR / most recent `lastActive`) deserve exactly that kind
of explicit "what this does and does not guarantee" header.

Reference implementations for the individual rules already in the repo:
- date/day comparisons use `YYYY-MM-DD` strings compared lexically —
  `src/lib/progress.ts:322` (`item.due <= t`), helpers `today()`/`daysBetween()` at
  `src/lib/progress.ts:68-78`. Use these, don't introduce `Date` comparison.
- CEFR level ordering does **not** exist yet anywhere — `level` is an unconstrained
  `string | null` (`src/lib/progress.ts:40`, `prisma/schema.prisma:23`). The merge module
  must define the ordered CEFR array itself; check `src/lib/curriculum.ts` for the level
  labels already in use before inventing new ones.
- record-union style: `{ ...s.completed, [k]: true }` (`src/lib/progress.ts:207`) and
  `[...(s.attempts[taskId] ?? []), attempt]` (`src/lib/celpip-progress.ts:99`). CELPIP
  attempts are an *array* per task, so their merge needs dedupe by `date`+`taskId`
  (`CelpipAttempt.date` is an ISO timestamp, `src/lib/celpip-progress.ts:18-19`) rather
  than key-union.

---

### `src/components/SyncIndicator.tsx` (new component)

**Closest behavioural analog:** the autosave failure warning in
`src/components/celpip/WritingSimulator.tsx:311-313` — same job (a discreet persistence
warning), same trigger shape (a boolean derived from a failed write at lines 58-65):
```tsx
<p
  className="mt-2 text-xs font-semibold"
  style={{ color: "var(--vermilion)" }}
>
```

**Closest structural analog:** `src/components/SkillPill.tsx` — a tiny presentational
component, no `"use client"` (it has no hooks/handlers; only add the directive if the
indicator subscribes to hook state itself), named export (not default), props typed inline
in the signature with a default (`size = "sm"`), returning a single styled `<span>`.

**Design-token conventions (`src/app/globals.css`) any new indicator must follow:**
- Tokens are declared twice: `:root` (line 8) and `.dark` (line 33, toggled via `.dark` on
  `<html>`). **Never hardcode a hex colour** — both themes must be covered automatically.
- `@theme inline` (line 55) re-exports each token as a Tailwind colour, so
  `--paper`→`bg-paper`, `--ink-soft`→`text-ink-soft`, `--line-strong`→`border-line-strong`.
  Prefer the Tailwind utility (`SkillPill.tsx:28`,
  `Timer.tsx:125` `border-line-strong ... hover:bg-paper-deep`) and drop to
  `style={{ color: "var(--token)" }}` only for a value computed at runtime
  (`Timer.tsx:114-115`, `SkillPill.tsx:11-15`).
- Palette semantics: `--vermilion` is the alert/urgency colour and is explicitly *not*
  destructive-only (`Timer.tsx:7-9`: "an urgency signal only — no delete/destroy semantics
  attached") — correct for "not synced". `--gold` reads as a softer caution;
  `--muted`/`--ink-soft` for de-emphasised text.
- Tinting a token uses `color-mix(in srgb, var(--x) 8%, transparent)`
  (`SkillPill.tsx:12-14`) rather than opacity classes.
- Fonts: `font-display` = Fraunces (headings/numerals, `Timer.tsx:114`), default sans =
  Hanken. `--radius: 0.9rem` (globals.css:75); pills use `rounded-full`, controls
  `rounded-xl`.
- Interactive elements carry `min-h-[44px] min-w-[44px]` touch targets (`Timer.tsx:125`).
- Live status text uses `aria-live="polite"` (`Timer.tsx:116`); a status region should also
  carry `role="status"`. Motion respects `prefers-reduced-motion` via
  `window.matchMedia?.("(prefers-reduced-motion: reduce)")` (`Timer.tsx:62-64`).

**Placement:** `src/components/AppShell.tsx` wraps `<Sidebar>` + `<main>` for every signed-in
page — the natural mount point for an app-wide indicator. It is a server component today
(no `"use client"`), so the indicator itself must own the client boundary.

---

### `prisma/schema.prisma` (additive column)

**Analog:** the existing `progress` column, `prisma/schema.prisma:24-25`:
```prisma
  // serialized ProgressState (JSON string — portable across SQLite/Postgres)
  progress     String?
```
Conventions: `String?` holding serialized JSON rather than a native `Json` column (the
comment states why — engine portability, and CONTEXT D-09 says keep it); a `//` comment
above each non-obvious field (see also lines 19, 22); fields grouped by concern with a
blank line and a section comment (lines 29, 33-34). `celpipProgress String?` belongs next
to `progress` with a comment naming its client counterpart
(`CelpipProgressState` / `fluentpath.celpip.v1`). Nullable + no default keeps
`prisma db push --accept-data-loss` safe (D-09).

---

## Shared Patterns

### Authenticated route preamble
**Source:** `src/app/api/account/route.ts:10-13` (identical at `progress/route.ts:9-12`,
`billing/sync/route.ts:12-15`)
**Apply to:** both progress routes
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Body validation
**Source:** `src/app/api/account/route.ts:14-17`
**Apply to:** every PUT in this phase
```typescript
const parsed = someSchema.safeParse(await req.json().catch(() => null));
if (!parsed.success) {
  return NextResponse.json({ error: "..." }, { status: 400 });
}
```

### Non-throwing user write
**Source:** `src/app/api/progress/route.ts:42-49`
**Apply to:** both progress routes
```typescript
// updateMany doesn't throw if the user no longer exists (e.g. stale cookie).
const { count } = await prisma.user.updateMany({ where: { id: session.user.id }, data: {...} });
if (count === 0) return NextResponse.json({ error: "Account not found" }, { status: 401 });
```

### Defensive localStorage read/write
**Source:** `src/lib/celpip-progress.ts:45-65`
**Apply to:** `progress.ts` (upgrade `writeLocal` to boolean), the retry queue's own
persisted key, and — in spirit — the server's `JSON.parse` of stored progress.

### Client boundary
**Source:** `src/lib/progress.ts:1`, `src/lib/celpip-progress.ts:1`, `Timer.tsx:1`
**Apply to:** any module using hooks or `window`. Pure shape/validator/merge modules stay
directive-free so route handlers can import them. `AppShell.tsx`/`SkillPill.tsx` show the
convention that non-interactive components deliberately omit the directive.

### eslint escape hatch
**Source:** `src/lib/celpip-progress.ts:73-78`, `src/lib/progress.ts:121-126`,
`Timer.tsx:39-47` and `Timer.tsx:100-103` (`exhaustive-deps` with a written justification)
**Apply to:** the hydrate and reconcile effects. Always paired disable/enable around the
minimum block, always with a comment saying why.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| retry-queue logic (inside `progress.ts` or a new `src/lib/sync-queue.ts`) | utility | event-driven / batch | No queue, backoff, or `online`/`visibilitychange`-driven replay exists anywhere in the repo. `src/lib/rate-limit.ts` supplies the *module* shape (in-memory `Map`, exported result type, honest scope comment) but none of the behaviour. Backoff curve, attempt ceiling, and the "persistent failure" threshold are Claude's discretion per CONTEXT. |
| CEFR level ordering used by the merge | utility | transform | `level` is an unvalidated `string \| null` end-to-end (`src/lib/progress.ts:40`, `prisma/schema.prisma:23`); no ordering exists to copy. |

## Metadata

**Analog search scope:** `src/lib/`, `src/app/api/**`, `src/components/`, `src/app/globals.css`, `prisma/`
**Files read in full:** `src/lib/progress.ts`, `src/lib/celpip-progress.ts`, `src/app/api/progress/route.ts`, `src/app/api/account/route.ts`, `src/app/api/billing/sync/route.ts`, `src/auth.ts`, `src/lib/rate-limit.ts`, `src/components/celpip/Timer.tsx`, `src/components/SkillPill.tsx`, `src/components/AppShell.tsx`, `prisma/schema.prisma`
**Pattern extraction date:** 2026-07-28
