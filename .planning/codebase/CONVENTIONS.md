# Coding Conventions

**Analysis Date:** 2026-07-23

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Dashboard.tsx`, `AuthForm.tsx`, `Tutor.tsx`)
- Utility modules: camelCase (e.g., `progress.ts`, `curriculum.ts`, `rate-limit.ts`)
- API route files: Use `route.ts` in directory structure (`src/app/api/tutor/route.ts`)
- Subdirectories: lowercase with hyphens (e.g., `content/`, `analytics/`, `auth/`)

**Functions:**
- Standard functions: camelCase (e.g., `readLocal()`, `daysBetween()`, `send()`, `celebrate()`)
- React hooks: camelCase starting with `use` (e.g., `useProgress()`, `useSession()`, `useSearchParams()`)
- Helper/private functions: camelCase, sometimes with internal functions defined with simple names (e.g., `sweep()`, `today()`, `Stat()` for sub-components)
- API handlers: UPPERCASE HTTP method (e.g., `POST()`, `PUT()`, `DELETE()`, `GET()`)

**Variables:**
- Constants (module-level): UPPER_SNAKE_CASE (e.g., `KEY`, `BOX_DAYS`, `MODEL`, `DAILY_CAP`, `EMPTY`, `REVIEWABLE_IDS`)
- Local variables: camelCase (e.g., `state`, `messages`, `loading`, `scrollRef`, `savedState`)
- Component props: camelCase with PascalCase type names

**Types & Interfaces:**
- PascalCase (e.g., `ProgressState`, `SrsItem`, `AttemptStat`, `TutorMessage`, `RateResult`)
- Type imports: `import type { Metadata } from "next"`
- Exported interfaces prefixed with `export interface` for clarity

**Enum-like Objects:**
- Use `as const` with object literals (e.g., `const SKILLS = Object.keys(SKILL_META) as Skill[]`)

## Code Style

**Formatting:**
- Line length: Observed ~80-100 character comfortable limit (no explicit prettier config)
- Indentation: 2 spaces (inferred from code)
- Semicolons: Used consistently (standard TS/JS semicolon convention)
- Trailing commas: Yes, in multi-line objects/arrays

**Linting:**
- Framework: ESLint with Next.js presets (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`)
- Config file: `eslint.config.mjs` (Next.js 16 flat config format)
- Disabled rule for setting state in useEffect: `/* eslint-disable-next-line react-hooks/set-state-in-effect */` with re-enable comment
- No Prettier config; formatting likely via ESLint

**Type Safety:**
- Always use `as const` when narrowing types
- Use type guards: `b is Anthropic.TextBlock` syntax for filtering
- Optional chaining used throughout: `user?.id`, `token?.email`
- Nullish coalescing: `?? undefined`, `?? ""`

## Import Organization

**Order:**
1. React/Next.js standard imports
2. External libraries (next-auth, zod, prisma, lucide-react, etc.)
3. Local aliases (prefixed with `@/`)
4. Type imports use `import type` for clarity

**Examples:**
```typescript
// From src/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

// From src/components/Dashboard.tsx
"use client";
import Link from "next/link";
import { useEffect } from "react";
import { WORLDS, SKILL_META, TOTAL_SCENARIOS, type Skill } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { SkillIcon } from "@/lib/icons";
```

**Path Aliases:**
- `@/` → `src/` (configured for absolute imports)
- Used consistently instead of relative paths

## Error Handling

**Pattern - Try-Catch with Silent Fallback:**
```typescript
// From src/lib/progress.ts
try {
  const raw = window.localStorage.getItem(KEY);
  if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  return EMPTY;
} catch {
  return EMPTY;  // Silent fallback to empty state
}
```

**Pattern - Zod SafeParse:**
```typescript
// From src/app/api/signup/route.ts
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0]?.message ?? "Invalid data" },
    { status: 400 },
  );
}
```

**Pattern - Graceful Degradation:**
- When external API keys are missing, app falls back to demo/stub mode
- Example: Tutor endpoint returns demo response when `ANTHROPIC_API_KEY` is not set
- Always communicate limitations clearly to the user

**Pattern - Catch and Log with User Message:**
```typescript
// From src/app/api/tutor/route.ts
try {
  const completion = await client.messages.create({ /* ... */ });
  // process response
} catch (err) {
  console.error("[tutor] Anthropic error:", err);
  return NextResponse.json(
    { reply: "Sorry, I had trouble responding just now. Please try again.", stub: false },
    { status: 200 },
  );
}
```

**Pattern - Empty Catch Blocks (with comment):**
```typescript
// From src/lib/progress.ts
fetch("/api/progress", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ progress: s }),
}).catch(() => {
  /* offline — local cache still holds the data */
});
```

**Pattern - Auth Checks:**
```typescript
// From src/app/api/account/route.ts
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Logging

**Framework:** `console.error()` for errors only (no logger dependency)

**Pattern:**
```typescript
console.error("[tutor] Anthropic error:", err);  // Prefix with module name
```

**Guidelines:**
- Use error logging sparingly (only for unexpected failures)
- Include context in the error prefix (e.g., `[module-name]`)
- Don't log sensitive data (passwords, tokens, emails in some contexts)

## Comments

**When to Comment:**
- **Security/performance concerns:** Rate limiting, CORS policies, CSP headers
- **Non-obvious logic:** Why something is done (not what the code does)
- **API documentation:** What an endpoint does and its behavior
- **Warnings:** Anti-patterns or temporary workarounds

**Examples:**
```typescript
// From src/app/api/auth/forgot/route.ts
// Request a password reset. Always responds 200 so the endpoint never reveals
// whether an email is registered.

// From src/lib/rate-limit.ts
// Lightweight in-memory rate limiter (fixed window).
// Scope: single server instance — counters live in memory and reset on
// restart. That's enough for the current one-container deployment and adds
// real brute-force/abuse protection. If the app is ever scaled to multiple
// instances, swap this for a shared store (Redis, etc.).

// From src/components/Dashboard.tsx
// Only count reviews that still exist in the current question bank, so the
// dashboard matches what the Review page actually shows.
const dueCount = ready
  ? dueReviewIds().filter((id) => REVIEWABLE_IDS.has(id)).length
  : 0;
```

**No JSDoc/TSDoc:** Comments are plain line comments (//), not JSDoc format.

## Function Design

**Size:** Functions are concise and single-purpose (rarely exceed 50 lines)

**Parameters:**
- Use destructuring for component props: `{ label, value, icon: Icon, color, pulse }`
- Use objects for multiple options: `{ role: "user" | "assistant", content: string }`
- Type all parameters explicitly

**Return Values:**
- React components return JSX (type inferred as `JSX.Element`)
- API handlers return `NextResponse.json()`
- Hooks return objects with methods: `{ ready, state, worldProgress, ... }`
- Utility functions return specific types (avoid implicit `any`)

**Example - Sub-component Definition:**
```typescript
// From src/components/Dashboard.tsx
function Stat({
  label,
  value,
  icon: Icon,
  color,
  pulse,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  pulse?: boolean;
}) {
  return (/* JSX */);
}
```

## Module Design

**Exports:**
- Named exports preferred for functions/types
- Default exports for main component (e.g., page components)
- Mix of named and default used consistently

**Barrel Files:**
- Used minimally; each lib file typically exports its own functions/types
- Example: `src/lib/curriculum.ts` exports `WORLDS`, `SKILL_META`, `getScenario()`

**Example - Utility Module:**
```typescript
// src/lib/rate-limit.ts
export interface RateResult { /* ... */ }
export function rateLimit(key: string, limit: number, windowMs: number): RateResult { /* ... */ }
export function clientIp(req: Request): string { /* ... */ }
```

## Client vs Server

**"use client" Directive:**
- Used in interactive components (Dashboard, Tutor, AuthForm)
- Placed at the top of the file before imports
- Necessary when using React hooks (useState, useEffect, useContext)

**"use server" Directive:**
- Not observed in this codebase (no server actions currently)

**API Routes:**
- Located in `src/app/api/[resource]/route.ts`
- Exported as async functions (e.g., `export async function POST(req: Request)`)
- Always check authentication with `auth()` before sensitive operations

## Validation

**Zod Schemas:**
- Defined inline in components/handlers for simplicity
- Use `.safeParse()` instead of `.parse()` to avoid throwing
- Include user-friendly error messages in the schema definition

**Example:**
```typescript
// From src/app/api/signup/route.ts
const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(200),
  ref: z.string().trim().max(32).optional(),
});
```

## CSS & Styling

**Framework:** Tailwind CSS v4

**Design Tokens:** Located in `src/app/globals.css`
- CSS custom properties for colors (e.g., `--vermilion`, `--teal`, `--gold`, `--plum`)
- Semantic naming: `--ink`, `--paper`, `--line`, `--muted`, `--shadow-soft`, `--shadow-lift`
- Used via `style={{ color: "var(--gold)" }}` or class interpolation

**Responsive Classes:**
- Tailwind breakpoints: `sm:`, `lg:` prefixes (not `md:`)
- Grid layouts: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-3`

---

*Convention analysis: 2026-07-23*
