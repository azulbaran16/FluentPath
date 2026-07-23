# Phase 1: CELPIP Writing Practice - Pattern Map

**Mapped:** 2026-07-23
**Files analyzed:** 8
**Analogs found:** 7 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `src/lib/celpip.ts` | model (typed content data) | CRUD (static read) | `src/lib/curriculum.ts` (+ `src/lib/content/writing.ts`) | exact |
| `src/lib/celpip-progress.ts` | store (localStorage hook) | CRUD | `src/lib/progress.ts` | exact (minus server sync) |
| `src/app/celpip/page.tsx` | route (landing/list) | request-response (static render) | `src/app/(catalog)/skill/[skill]/page.tsx` + `src/app/(catalog)/world/[slug]/page.tsx` | role-match |
| `src/app/celpip/writing/[taskId]/page.tsx` | route (dynamic detail) | request-response (static render, `generateStaticParams`) | `src/app/(catalog)/world/[slug]/[scenario]/page.tsx` | exact |
| `src/components/celpip/TaskCard.tsx` | component (card) | transform (props → UI) | `src/components/WorldCard.tsx` | exact |
| `src/components/celpip/WritingSimulator.tsx` (client) | component (stateful workspace) | event-driven (local state + timers) | `src/components/practice/WritingDesk.tsx` | role-match (closest stateful editor+checklist) |
| `src/components/celpip/Timer.tsx` | component (countdown) | event-driven (interval/rAF) | none found | no analog — see below |
| `src/components/celpip/RubricChecklist.tsx` | component (checklist) | transform (props → UI, local toggle) | `src/components/practice/WritingDesk.tsx` (checklist section, lines 116-135) | role-match |

## Pattern Assignments

### `src/lib/celpip.ts` (model, static content)

**Analogs:** `src/lib/curriculum.ts` (lines 1-56), `src/lib/content/writing.ts` (lines 1-37)

**File-header + type pattern** (`curriculum.ts` lines 1-30):
```typescript
// ───────────────────────────────────────────────────────────
// FluentPath curriculum — the 6 "worlds" of real-life English.
// ...
// This is the single source of truth for navigation & progress.
// ───────────────────────────────────────────────────────────

export type Skill = "grammar" | "speaking" | "reading" | "writing";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Scenario {
  slug: string;
  title: string;
  blurb: string;
  level: Level;
  skills: Skill[];
  minutes: number;
}
```

**Metadata record pattern** (`curriculum.ts` lines 32-56) — `SKILL_META: Record<Skill, {...}>` is the model for a `CELPIP_TASK_META`-style lookup keyed by `taskType` (`email` | `survey`), if needed for shared labels/colors.

**Content-module comment + interface pattern** (`content/writing.ts` lines 1-17):
```typescript
// Writing prompts with a model answer and a self-assessment checklist,
// graded A2 → C1. Real AI correction arrives with the tutor; until then
// learners self-check against the model and the rubric.

export type WritingLevel = "A2" | "B1" | "B2" | "C1";

export interface WritingPrompt {
  id: string;
  title: string;
  level: WritingLevel;
  task: string;
  minWords: number;
  maxWords: number;
  checklist: string[];
  model: string;
}
```
This is the direct precedent for CELPIP's `id`, `taskType`, `title`, `scenario`, `bullets`/`options`, `timeLimitMinutes`, `wordRange`, `modelAnswer`, `strategyTips`, `rubric` shape. Mirror the "array of typed literal objects" style (`content/writing.ts` lines 21+) rather than nested/grouped worlds — CELPIP tasks are a flat list like `WRITING_PROMPTS`, not grouped like `WORLDS`.

**Lookup helper pattern** — `curriculum.ts` exports `getWorld`/`getScenario` helpers (referenced in `world/[slug]/page.tsx` line 3 and `[scenario]/page.tsx` line 3, e.g. `getWorld(slug)`, `getScenario(slug, scenario)`). Add an equivalent `getTask(taskId)` / `getTasksByType(taskType)` exported from `celpip.ts`.

---

### `src/lib/celpip-progress.ts` (store, CRUD localStorage)

**Analog:** `src/lib/progress.ts` (full file, 397 lines)

**Namespacing + defensive read/write pattern** (lines 12, 80-98):
```typescript
const KEY = "fluentpath:progress:v2";
...
function readLocal(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    const v1 = window.localStorage.getItem("fluentpath:progress:v1");
    if (v1) return { ...EMPTY, ...JSON.parse(v1) };
    return EMPTY;
  } catch {
    return EMPTY;
  }
}
function writeLocal(s: ProgressState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}
```
CONTEXT.md locks the CELPIP key as `fluentpath.celpip.v1` (note dot-separated namespace, differs slightly from `progress.ts`'s colon convention — follow CONTEXT.md's exact string). Reuse the exact `typeof window === "undefined"` SSR guard and try/catch-silent-fallback-to-EMPTY shape; this is also the direct precedent for the UI-SPEC's "defensive JSON parse: corrupted storage → safe empty default" requirement (UI-SPEC line 144).

**EMPTY default + state shape pattern** (lines 33-66) — model `CelpipProgressState` the same way: a flat interface with a keyed record (`attempts: Record<string, CelpipAttempt[]>` or similar) and a matching `EMPTY` constant spread on read.

**Hook skeleton pattern** (lines 112-126):
```typescript
export function useProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [ready, setReady] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setState(readLocal());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  ...
}
```
CELPIP has **no server sync** in this phase (explicitly deferred to Phase 2) — omit the `useSession`/`putServer`/`/api/progress` fetch logic (lines 112-163, 128-163) entirely. Keep only the local read/write/persist skeleton (lines 165-178) as `persist((s) => next)`.

**Mutator pattern** (lines 196-217, `complete()`) — model an `addAttempt(taskId, attempt)` mutator the same way: immutable spread update inside `persist()`, returning a new state object.

**Derived-selector pattern** (lines 190-194, 355-367) — `isDone()`, `completedCount`, `overallProgress` show the convention for derived read helpers (e.g. CELPIP's `completedTasks`, `attemptsForTask(taskId)`) computed from `state` at the bottom of the hook and returned in the hook's return object.

---

### `src/app/celpip/page.tsx` (route, landing)

**Analogs:** `src/app/(catalog)/skill/[skill]/page.tsx` (full, 128 lines), `src/app/(catalog)/world/[slug]/page.tsx` (full, 41 lines)

**Metadata + header pattern** (`skill/[skill]/page.tsx` lines 18-34, 52-76):
```typescript
export async function generateMetadata({...}): Promise<Metadata> {
  ...
  return {
    title,
    description,
    alternates: { canonical: `/skill/${skill}` },
    openGraph: { title, description, url: `/skill/${skill}`, type: "website" },
  };
}
```
Use the same `generateMetadata` + canonical/openGraph shape for `/celpip`.

**Icon-badge header pattern** (lines 58-76) — grid/flex header with a colored icon badge (`color-mix(in srgb, var(${meta.color}) 14%, transparent)`) — reuse for the CELPIP landing hero, kept compact per UI-SPEC's "hero stays compact so cards sit above the fold."

**Card grid + route link pattern** (lines 100-124, and `WorldCard.tsx` full file) — `TaskCard` should follow `WorldCard.tsx`'s `Link` + `rise` animation + `ProgressRing`/badge composition:
```typescript
<Link
  href={`/world/${world.slug}`}
  className="rise group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
  style={{ animationDelay: `${index * 70}ms` }}
>
```
Reuse `ProgressRing` (imported from `./ProgressRing`, `src/components/ProgressRing.tsx`) for the attempt-status ring with `color={accent}` per UI-SPEC line 80, and `LevelBadge`-style small badge (`SkillPill.tsx` lines 26-32) pattern for a "not started / in progress / completed" status badge.

**Tabs pattern** — no exact disabled-tab precedent exists in the codebase; UI-SPEC requires "coming soon" disabled tabs for Speaking/Reading/Listening. Base the tab bar visually on `WritingDesk.tsx`'s prompt-picker pill row (lines 57-75, `rounded-full border px-3 py-1.5` active/inactive states) but add a `disabled` variant (muted, no accent, `cursor-not-allowed`, small "Coming soon" badge) — no direct analog, follow UI-SPEC copywriting contract exactly.

---

### `src/app/celpip/writing/[taskId]/page.tsx` (route, dynamic detail)

**Analog:** `src/app/(catalog)/world/[slug]/[scenario]/page.tsx` (full, 68 lines)

**generateStaticParams + notFound pattern** (lines 8-12, 39-47):
```typescript
export function generateStaticParams() {
  return WORLDS.flatMap((w) =>
    w.scenarios.map((s) => ({ slug: w.slug, scenario: s.slug })),
  );
}
...
export default async function ScenarioPage({ params }: { params: Promise<{ slug: string; scenario: string }> }) {
  const { slug, scenario } = await params;
  const found = getScenario(slug, scenario);
  if (!found) notFound();
  const { world, scenario: sc } = found;
  ...
  return <ScenarioView world={world} scenario={sc} />;
}
```
Mirror exactly for `[taskId]`: `generateStaticParams()` mapping over `CELPIP_TASKS`, `params: Promise<{ taskId: string }>`, `getTask(taskId)` + `notFound()` guard, then delegate to a client component (`WritingSimulator`) the same way `ScenarioPage` delegates to `<ScenarioView />`.

**JsonLd / SEO pattern** (lines 4-6, 48-64) — optional but consistent: `LearningResource` structured data via `<JsonLd data={...} />` and `absoluteUrl()` from `src/lib/site.ts`. Apply the same `isAccessibleForFree: true` flag (already true for this phase per CONTEXT.md "entire self-evaluation mode is FREE").

**Route grouping note:** this project uses route groups `(app)` (authenticated shell) and `(catalog)` (public shell) — see `src/app/(catalog)/layout.tsx`. CELPIP is public per CONTEXT.md ("visible to all users"), so `src/app/celpip/**` should live under the `(catalog)` route group (i.e. physically `src/app/(catalog)/celpip/page.tsx` and `src/app/(catalog)/celpip/writing/[taskId]/page.tsx`) to reuse `CatalogLayout`'s public `AppShell` wiring (`src/app/(catalog)/layout.tsx` lines 7-14) rather than duplicating shell logic — flag this to the planner as a directory-placement decision.

---

### `src/components/celpip/TaskCard.tsx` (component)

**Analog:** `src/components/WorldCard.tsx` (full file, see excerpt above under landing route). Copy the `Link` + accent-color + `ProgressRing` + hover-lift composition; swap `world.color`/`WorldIcon` for a CELPIP task-type icon and an attempt-status badge instead of a scenario count.

---

### `src/components/celpip/WritingSimulator.tsx` (component, client, stateful)

**Analog:** `src/components/practice/WritingDesk.tsx` (full file, 167 lines)

**"use client" + local state skeleton** (lines 1-20):
```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
...
export function WritingDesk({ prompts, accent = "var(--sky)" }: {...}) {
  const [text, setText] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);
```

**Word-count derivation pattern** (lines 38-42):
```typescript
const words = useMemo(
  () => (text.trim() ? text.trim().split(/\s+/).length : 0),
  [text],
);
const inRange = words >= prompt.minWords && words <= prompt.maxWords;
```
Directly reusable for CELPIP's 150-200 word counter; extend the ternary to a 3-state (`under` / `in range` / `over`) per UI-SPEC's warning-color-on-overflow requirement instead of this 2-state boolean.

**Draft autosave pattern** (lines 22-52):
```typescript
const storageKey = `fluentpath:writing:${prompt.id}`;
useEffect(() => {
  ...
  try {
    setText(window.localStorage.getItem(storageKey) ?? "");
  } catch {
    setText("");
  }
}, [storageKey]);

function save() {
  try {
    window.localStorage.setItem(storageKey, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  } catch {
    /* ignore */
  }
}
```
This is a manual-save pattern (button click); CONTEXT.md requires **automatic** autosave "every few seconds" and UI-SPEC requires a visible error state on `setItem` failure (not silent `/* ignore */`) — adapt the try/catch to surface the UI-SPEC "We couldn't save your draft..." copy on failure instead of swallowing it, and drive `save()` from a `setInterval`/debounced effect rather than only a button click. Keep the same key-per-item namespacing idea, but under the CELPIP progress store (`celpip-progress.ts`) rather than a raw ad hoc key, so drafts fold into the attempt/localStorage shape CONTEXT.md specifies.

**Textarea editor pattern** (lines 89-99):
```typescript
<textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Write your answer here…"
  rows={10}
  className="mt-4 w-full resize-y rounded-xl border border-line-strong bg-paper p-3 text-sm leading-relaxed outline-none transition-colors focus:border-sky"
/>
```
UI-SPEC requires this textarea's body text bumped to 16px (`text-base`) instead of the codebase default 14px (`text-sm`) — the one deliberate typography deviation noted in UI-SPEC line 60. Otherwise reuse the same resize-y/rounded/border-focus classes verbatim.

**Word-counter display pattern** (lines 96-99) — reuse the flex row with conditional className/color (`text-teal` → swap for `var(--sky)` accent per UI-SPEC, `text-muted` for under-range, add `--vermilion` warning class for over-range).

**Show/hide model answer + `<pre>` pattern** (lines 137-156) — directly reusable for the side-by-side results view's model-answer panel:
```typescript
<pre className="mt-3 whitespace-pre-wrap rounded-xl bg-paper-deep/50 p-4 font-sans text-sm leading-relaxed text-ink-soft">
  {prompt.model}
</pre>
```

---

### `src/components/celpip/Timer.tsx` (component, event-driven countdown)

**No analog found.** No countdown/interval-driven UI component exists elsewhere in the codebase (`ProgressRing.tsx` animates via `requestAnimationFrame` once on mount, not a repeating countdown — see below for the closest partial pattern). Build from RESEARCH/UI-SPEC directly:
- UI-SPEC mandates `tabular-nums` for the digit display (no jitter) and Display-role typography (28-30px) — see UI-SPEC Typography section, line 62.
- UI-SPEC mandates color state transition to `--vermilion` at ≤2 minutes remaining (UI-SPEC Color section, line 85).
- Reuse `ProgressRing.tsx`'s `useEffect` + `requestAnimationFrame` + `prefers-reduced-motion` guard idiom (lines 23-36) as the closest precedent for a self-driving animated UI primitive, even though its trigger (one-shot mount animation) differs from a repeating countdown:
```typescript
useEffect(() => {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    setShown(target);
    return;
  }
  const id = requestAnimationFrame(() => setShown(target));
  return () => cancelAnimationFrame(id);
}, [target]);
```
Timer implementation details (interval vs rAF, drift handling) are explicitly Claude's Discretion per CONTEXT.md.

---

### `src/components/celpip/RubricChecklist.tsx` (component)

**Analog:** `src/components/practice/WritingDesk.tsx` checklist section (lines 110-136):
```typescript
<h3 className="font-display text-lg font-semibold">Self-check</h3>
<p className="text-xs text-muted">Tick each point once your draft covers it.</p>
<ul className="mt-3 space-y-2">
  {prompt.checklist.map((item, idx) => (
    <li key={idx}>
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(checked[idx])}
          onChange={(e) => setChecked((c) => ({ ...c, [idx]: e.target.checked }))}
          className="mt-0.5 h-4 w-4 accent-sky"
          style={{ accentColor: accent }}
        />
        <span className={checked[idx] ? "text-muted line-through" : ""}>{item}</span>
      </label>
    </li>
  ))}
</ul>
```
CELPIP's rubric is richer (dimension-grouped, yes/no items with short explanations, not a flat list) — group by dimension (task fulfillment / organization / vocabulary / grammar & format) using the same checkbox-row primitive per item, with the dimension name as a sub-heading. Reuse `accentColor: accent` (`var(--sky)`) for the checked state per UI-SPEC's reserved accent-color list (checked rubric items and checkmarks).

---

## Shared Patterns

### localStorage local-first persistence
**Source:** `src/lib/progress.ts` (lines 80-98, defensive read/write; lines 112-126, hook skeleton; lines 165-178, `persist()` wrapper)
**Apply to:** `src/lib/celpip-progress.ts`
```typescript
function readLocal(): T {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
function writeLocal(s: T) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* surface UI-SPEC error copy here instead of silently ignoring, for autosave paths */
  }
}
```

### Typed static content module
**Source:** `src/lib/curriculum.ts` (lines 1-56), `src/lib/content/writing.ts` (lines 1-37)
**Apply to:** `src/lib/celpip.ts`
Flat/typed array of literal objects, exported interfaces, small lookup helper functions (`getWorld`, `getScenario` equivalents), file-header comment block explaining the module's role as single source of truth.

### Accent-color badge / icon-chip pattern
**Source:** `src/components/SkillPill.tsx` (full file), `src/components/WorldCard.tsx` (lines 22-35), `src/app/(catalog)/skill/[skill]/page.tsx` (lines 58-67)
**Apply to:** `TaskCard.tsx`, landing header, status badges
```typescript
style={{
  background: `color-mix(in srgb, var(${meta.color}) 14%, transparent)`,
  color: `var(${meta.color})`,
}}
```
CELPIP inherits `--sky` (writing skill's existing color) per UI-SPEC line 82 — do not introduce a new color token.

### Route + generateStaticParams + notFound
**Source:** `src/app/(catalog)/world/[slug]/[scenario]/page.tsx` (full file), `src/app/(catalog)/skill/[skill]/page.tsx` (lines 6-16, 36-43)
**Apply to:** `src/app/celpip/page.tsx`, `src/app/celpip/writing/[taskId]/page.tsx`
Static params generation from the content module's task list, `notFound()` guard on missing id, thin server component delegating to a client component for interactivity.

### Public route group placement
**Source:** `src/app/(catalog)/layout.tsx` (full file)
**Apply to:** both new CELPIP routes
CELPIP is a free, publicly-visible feature (per CONTEXT.md) — place under `(catalog)` route group to reuse the existing public `AppShell` wiring rather than the authenticated `(app)` group.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/celpip/Timer.tsx` | component | event-driven (countdown) | No repeating-interval/countdown UI exists in the codebase; closest partial precedent is `ProgressRing.tsx`'s one-shot `requestAnimationFrame` mount animation (lines 23-36). Timer internals (interval vs rAF, drift handling) are explicitly Claude's Discretion per CONTEXT.md — build fresh, following UI-SPEC's typography/color state requirements exactly. |

## Metadata

**Analog search scope:** `src/lib/`, `src/components/`, `src/components/practice/`, `src/app/(catalog)/`, `src/app/(app)/`
**Files scanned:** `curriculum.ts`, `progress.ts`, `content/writing.ts`, `WritingDesk.tsx`, `WorldCard.tsx`, `SkillPill.tsx`, `ProgressRing.tsx`, `icons.tsx`, `world/[slug]/page.tsx`, `world/[slug]/[scenario]/page.tsx`, `skill/[skill]/page.tsx`, `(catalog)/layout.tsx`
**Pattern extraction date:** 2026-07-23
