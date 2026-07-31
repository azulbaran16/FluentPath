# Phase 3: Every Scenario Practicable - Pattern Map

**Mapped:** 2026-07-31
**Files analyzed:** 11 (5 content modules, 4 components, 1 derived-coverage module, 1 verify script)
**Analogs found:** 11 / 11 — every file this phase touches has a working precedent in-repo

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/content/phrases.ts` (9 → 35) | content bank (keyed) | lookup + fallback | `src/lib/content/scenario-lessons.ts` | exact |
| `src/lib/content/scenario-vocabulary.ts` (new) | content bank (keyed) | lookup + fallback | `scenario-lessons.ts` keying + `vocabulary.ts` card shape | exact (split across two) |
| per-scenario exercise modules under `src/lib/content/` (new) | content bank (keyed) | lookup, may return `undefined` | `src/lib/celpip/reading-set-1.ts` + `scenario-lessons.ts` | role-match |
| `src/lib/content/grammar.ts` / `reading.ts` / `writing.ts` | global bank | list | already correct as global banks — **do not re-key in place**, see note | n/a |
| derived-coverage module (new, e.g. `src/lib/scenario-coverage.ts`) | registry / derivation | derive-from-bank | `src/lib/celpip.ts:795-875` (`section()` + `CELPIP_SECTIONS`) | exact |
| `src/components/ScenarioView.tsx` | component (server-consumed client) | render | itself (lines 63-128 step structure) | self |
| `src/components/practice/SkillPractice.tsx` | component (dispatch) | switch on skill | itself, lines 21-34 | self |
| new `ScenarioPractice.tsx` (likely) | component (dispatch, scenario-scoped) | switch on skill + coverage gate | `SkillPractice.tsx` (dispatch) + `CelpipTabs.tsx:27-46` (honest "not yet") | role-match |
| `scripts/verify-scenario-content.mts` (new) | verification script | assert-and-exit | `scripts/verify-celpip-content.mts` | exact |
| SRS items emitted by new exercises | data | write-through `recordAttempt` | `GrammarQuiz.tsx:17` → `progress.ts:317-345` | exact |

---

## Pattern Assignments

### 1. `src/lib/content/scenario-lessons.ts` — THE template (already covers 35/35)

**File:** `src/lib/content/scenario-lessons.ts` (345 lines)

**Typed shape + doc comment** (lines 1-10):
```ts
// Short "Learn the essentials" intro shown at the top of each scenario,
// before the speaking warm-up. Curated for the main scenarios, with a
// sensible fallback so every scenario has a useful briefing.

export interface ScenarioLesson {
  /** one- or two-sentence framing of the situation */
  intro: string;
  /** 2–3 quick, practical tips (usage, culture, register) */
  tips: string[];
}
```

**Keying** (line 12-13) — a flat `Record<string, T>` keyed `"world/scenario"`, **not** nested by world and not by bare slug:
```ts
const LESSONS: Record<string, ScenarioLesson> = {
  "social/small-talk": { ... },
```

**Fallback policy — read this exactly** (lines 328-345). The module holds ONE module-level `FALLBACK` constant, and the accessor's return type is **non-optional**:
```ts
const FALLBACK: ScenarioLesson = {
  intro: "Before you practise, glance over the key phrases below — ...",
  tips: [ ... ],
};

export function getScenarioLesson(
  worldSlug: string,
  scenarioSlug: string,
): ScenarioLesson {
  return LESSONS[`${worldSlug}/${scenarioSlug}`] ?? FALLBACK;
}
```

**Consequence the planner must confront (D-03):** this total-function shape is exactly what makes overclaim possible — a caller cannot tell a curated entry from the fallback, because both are a `ScenarioLesson`. `phrases.ts:102-108` has the same defect one level worse (a *world* fallback that looks scenario-specific). **New exercise banks must NOT copy the total-function fallback.** They must return `T | undefined` and let the coverage layer (§4) decide what the UI says. `scenario-lessons.ts` keeps its fallback because a briefing is not a claim of scenario practice; an exercise is.

Once phrases reach 35/35, `getPhrases`'s `WORLD_FALLBACK` becomes dead code for scenarios and the accessor should be made honest (`getPhrases` returning `undefined` for an unknown key, or the fallback deleted) — otherwise a scenario dropped from a set silently regresses to generic phrases with no signal.

---

### 2. `src/lib/content/phrases.ts` — the shape to extend from 9 to 35

**Item type** (lines 5-10) — note `tip` is optional today; per CONTEXT "an author forgets an optional field", consider requiring anything the learner needs:
```ts
export interface Phrase {
  text: string;
  es: string;
  /** quick pronunciation/usage tip */
  tip?: string;
}
```

**Entry shape** (lines 13-19) — 3-5 phrases per scenario is the established floor; every phrase carries a Spanish gloss:
```ts
"social/small-talk": [
  { text: "How's it going?", es: "¿Cómo te va?", tip: "Suena como 'hows-it-going', todo unido." },
  { text: "What do you do for a living?", es: "¿A qué te dedicas?" },
  ...
],
```

**Keyed today (9):** `social/small-talk`, `social/making-friends`, `work/interviews`, `work/meetings`, `travel/airport`, `travel/restaurant`, `travel/directions`, `native/idioms`, `native/pronunciation` (lines 13-66).

**Downstream coupling — do not break it.** `SPEAKING_PACKS` (lines 129-175) composes packs by calling `getPhrases(...)` on specific keys, and `SkillPractice` (lines 15-19) builds its global `SPEAKING_SET` the same way. Adding keys is additive and safe; renaming or removing any of the 9 above breaks both.

**File size discipline:** at 221 lines for 9 scenarios plus packs plus tips, extending to 35 in place will land near 500-600 lines. `reading.ts` (549) and `grammar.ts` (446) show that size is tolerated in this repo, but a `src/lib/content/scenarios/<world>.ts` split with `phrases.ts` re-exporting is the low-conflict option if plans are parallelised (same rationale as the append-target header in `verify-celpip-content.mts:17-30`).

---

### 3. The practice components — what contract a scenario-specific exercise must satisfy

**Critical finding:** `ScenarioView.tsx` **does not branch on `scenario.skills` at all.** It renders three fixed steps for every one of the 35 scenarios (`ScenarioView.tsx:63-128`): briefing, `PronunciationLab`, tutor link. The skills pills at line 44-46 are decorative. So the 52 pairs are not merely served generic content — for writing, reading and grammar they are **not served at all** from the scenario page. The other half of the gap lives in `SkillPractice.tsx`, which is scenario-blind by construction.

**`SkillPractice.tsx` — the dispatch pattern to copy** (lines 21-34):
```ts
export function SkillPractice({ skill }: { skill: Skill }) {
  const accent = `var(${SKILL_META[skill].color})`;

  switch (skill) {
    case "grammar":  return <GrammarQuiz questions={GRAMMAR_QUESTIONS} accent={accent} />;
    case "speaking": return <PronunciationLab phrases={SPEAKING_SET} accent={accent} />;
    case "reading":  return <ReadingRoom passages={PASSAGES} accent={accent} />;
    case "writing":  return <WritingDesk prompts={WRITING_PROMPTS} accent={accent} />;
  }
}
```
An exhaustive `switch` over `Skill` with no `default` — `tsc` then flags any new skill. A `ScenarioPractice({ world, scenario, skill })` should mirror this exactly, substituting a scenario-keyed lookup for each module-level bank constant, and rendering the honest "not yet" affordance (§4) where the lookup returns `undefined`.

**The four renderer contracts** (all take a plain array + optional `accent` string; none know about scenarios, so all four are reusable unchanged):

| Skill | Component | Signature | Content type |
|---|---|---|---|
| speaking | `PronunciationLab.tsx:31-39` | `{ phrases: Phrase[]; accent?: string; onComplete?: () => void }` | `Phrase` (`phrases.ts:5-10`) |
| grammar | `GrammarQuiz.tsx:10-16` | `{ questions: GrammarQuestion[]; accent?: string }` | `GrammarQuestion` (`grammar.ts:7-15`) |
| reading | `ReadingRoom.tsx:10-16` | `{ passages: Passage[]; accent?: string }` | `Passage` (`reading.ts:11-20`) |
| writing | `WritingDesk.tsx:8-14` | `{ prompts: WritingPrompt[]; accent?: string }` | `WritingPrompt` (`writing.ts:7-18`) |

**This is the cheapest correct route:** author scenario-keyed banks of the four *existing* content types and hand them to the four *existing* renderers. No new renderer is needed for D-01. Inventing four new exercise shapes is where CONTEXT's stated failure mode ("inconsistency across 52 exercises") comes from.

**Where the accent comes from:** scenario pages use the **world** colour (`ScenarioView.tsx:23`, `accent = \`var(${world.color})\``); skill pages use the **skill** colour (`SkillPractice.tsx:22`, `SKILL_META[skill].color`). A scenario×skill view has to pick one — precedent says the page owner wins, so world colour on `/world/x/scenario`.

**Content types worth noting for authoring cost** (these set the per-pair word budget):
- `GrammarQuestion` (`grammar.ts:7-15`): `id, level, topic, prompt` (uses `___` for the gap), `options[]`, `answer` (index), `explain` — cheap, ~5-6 per pair.
- `Passage` (`reading.ts:11-20`): `id, title, level, minutes, body: string[]`, `glossary: {word, meaning}[]`, `questions: {q, options[], answer}[]` — expensive, this is the 9 reading pairs' cost centre.
- `WritingPrompt` (`writing.ts:7-18`): `id, title, level, task, minWords, maxWords, checklist: string[], model: string` — a model answer per pair, 9 pairs.
- Every one carries a CEFR `level` union; `curriculum.ts:12-20` gives each scenario its own `level`, so the authored level should match the scenario's rather than be picked freely.

---

### 4. `src/lib/celpip.ts` `CELPIP_SECTIONS` — the derived-coverage mechanism to mirror (D-03)

**The derivation** (`celpip.ts:795-819`) — availability is computed from the bank's **contents**, never declared:
```ts
function section(
  skill: CelpipSkill, label: string, blurb: string,
  source: CelpipSectionSource | undefined, caveat?: string,
): CelpipSection {
  // Empty groups are dropped, so availability follows the bank's actual
  // CONTENTS rather than the mere presence of a source: a set that is emptied
  // or dropped from the phase flips the landing back to "not yet" by itself.
  const groups = (source?.groups ?? []).filter((g) => g.items.length > 0);
  const available = groups.length > 0;
  return {
    skill, label, blurb,
    routePrefix: `/celpip/${skill}`,
    groups,
    coverage: {
      available,
      summary: available ? (source?.summary ?? "") : "",
      caveat: available ? caveat : undefined,
    },
  };
}
```
Three properties to carry over verbatim:
1. **`source: CelpipSectionSource | undefined`** — a bank module that does not exist yet is `undefined`, and the registry doc (`celpip.ts:683-692`) explicitly forbids creating empty modules to satisfy it. For Phase 3: an unwritten scenario×skill pair is an **absent key**, not an empty array.
2. **`.filter(g => g.items.length > 0)`** — emptying a bank flips the UI back to "not yet" with no second edit.
3. **Coverage strings are derived counts**, never prose. See `readingSource()` (`celpip.ts:771-793`) and `plural()` (`celpip.ts:699-701`):
```ts
summary: `${plural(items.length, "set")} covering ${kinds.size} of the ${
  CELPIP_READING_PART_KINDS.length
} exam part shapes`,
```
`celpip.ts:833-838` is the standing rule for why: a hand-written sentence naming which parts are missing is stale the day the next plan commits.

**Selectors on top** (`celpip.ts:864-875`) — `getSection`, `availableSections()`, `pendingSections()`. The Phase 3 analog is `scenarioSkillCoverage(world, scenario, skill)`, `practicablePairs()`, `pendingPairs()`, all derived by intersecting `curriculum.ts`'s `skills` arrays (the definition of the 52 pairs) with the banks' keys.

**How the UI consumes it, honestly** (`CelpipTabs.tsx:27-46`) — the pending state is *shown, disabled and labelled*, not hidden:
```tsx
{CELPIP_SECTIONS.map((section) =>
  section.coverage.available ? (
    <SkillTab ... />
  ) : (
    <span aria-disabled="true"
      className="... cursor-not-allowed ... text-muted opacity-60">
      {section.label}
      <span className="... bg-paper-deep ... text-muted">Not yet available</span>
    </span>
  ),
)}
```
And the default tab is derived too (`CelpipLanding.tsx:183-187`), module-level so SSR and hydration agree:
```ts
const DEFAULT_SKILL: CelpipSkill = (
  CELPIP_SECTIONS.find((s) => s.coverage.available) ?? CELPIP_SECTIONS[0]
).skill;
```
Caveat rendering: `CelpipLanding.tsx:256-257`, a single `text-xs text-muted` paragraph under the section header.

**Applied to Phase 3:** the `SkillPill`s at `ScenarioView.tsx:44-46` are the natural carrier — a pill whose pair has no bank entry gets the same disabled + "Not yet available" treatment, and the pair's practice section is not rendered. That satisfies D-03 with zero new UI vocabulary.

---

### 5. `scripts/verify-celpip-content.mts` — the content harness pattern

**How it runs** (lines 1-15): `node --experimental-strip-types scripts/verify-celpip-content.mts`. No test runner, no new dependency, `.mts`, and **explicit `.ts` extensions on relative imports** because path aliases only resolve inside the bundler (`import { ... } from "../src/lib/celpip.ts"`, lines 51-82). There is no npm script for it — `package.json:5-12` has only dev/build/start/lint/postinstall/db:studio. Phase 3's script should be invoked the same way and named `scripts/verify-scenario-content.mts` alongside the seven existing `verify-*.mts`.

**Why it exists** (lines 32-38) — the sentence to reuse as the new script's charter:
> `tsc` proves a prompt has the right FIELDS and says nothing about whether the bank covers the exam. A missing task shape, a duplicated id, a scene-description prompt with no scene, or a rubric item that renders as a blank gap are all type-correct. ... If an assertion here fails, fix the content — never weaken the assertion.

**Low-conflict append structure** (lines 17-30) — deliberate, because several plans edit it: one import line in the marked block, one new `/* --- <skill> --- */` group at the bottom, shared helpers at the top, never reorganise existing groups. Phase 3 has the same shape (one group per skill, or one per world) and should copy the header comment.

**Shared harness** (lines 86-150): `ok(label, condition, detail?)` counting `checks`/`failures`; `canon()` deterministic serialization; `deepEqual`; `group(name)`; and the three predicates that catch silent-when-broken authoring:
```ts
/** Non-empty after trimming. A field of spaces renders as a gap and is a
 * content defect, not a formatting one. */
function filled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
function inRange(value: unknown, min: number, max: number): boolean { ... }
function duplicates(values: string[]): string[] { ... }
```

**The four assertion families to mirror** (speaking group, lines 155-200):
- *coverage is exhaustive*: `SPEAKING_PROMPTS.length === CELPIP_SPEAKING_SHAPES.length`, then per-shape "covered exactly once". → Phase 3: **every one of the 52 `world/scenario × skill` pairs derived from `curriculum.ts` has a bank entry, and every bank key names a pair that exists.** The second half catches the typo'd key that silently falls back.
- *no orphan declarations*: "no prompt declares a shape outside the exam's eight".
- *ids*: non-empty and unique — matters doubly here because SRS keys off them (§6).
- *accessor round-trip*: `getSpeakingPrompt(p.id) === p` for every item, **and** `getSpeakingPrompt("does-not-exist") === undefined`. That negative case is precisely the assertion that would catch a fallback-shaped accessor pretending an unwritten pair exists.

**Reported, not asserted** (tail, lines ~1292-1315): partial coverage is `console.log`'d per set so a stalled bank is visible on every run rather than merely true. Phase 3's equivalent: print `n/35 scenarios with phrases`, `n/35 with vocabulary`, `n/52 pairs practicable` on every run. That is the phase's own progress meter, free.

**Exit contract** (lines ~1316-1321): `process.exit(1)` with `FAIL` lines on stderr, else `all ${checks} assertions passed.`

**Precedent for the other half:** `scripts/verify-celpip-sections.mts:78-200` asserts the *registry* rather than the banks — one section per skill, `availableSections().length + pendingSections().length === CELPIP_SECTIONS.length` (line 194), `getSection(s.skill) === s` (line 200), global id uniqueness across all sections (line 186). The Phase 3 coverage module needs its own equivalent, and splitting bank-assertions from registry-assertions into two scripts is the established division.

---

### 6. `src/lib/progress.ts` / `progress-merge.ts` — the SRS contract new items must satisfy

**Item shape** — `SrsItem` is exactly `{ box: number; due: string }`, validated at `progress-schema.ts:451-454`:
```ts
export const srsItemSchema = z.object({
  box: z.number().int().min(0).max(50),
  due: z.string().regex(DAY_RE),   // "YYYY-MM-DD"
});
```
`state.srs` is `Record<string, SrsItem>` keyed by **item id** (`progress-schema.ts:43`).

**How an entry is written — never by hand** (`progress.ts:317-345`). Every exercise goes through `recordAttempt`, which writes `srs` and `attempts` together:
```ts
const recordAttempt = useCallback(
  (id: string, correct: boolean,
   meta?: { topic?: string; level?: string; chosen?: number }) => {
    persist((s) => {
      const prevSrs = s.srs[id];
      const box = correct ? Math.min((prevSrs?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0;
      const due = correct ? addDays(BOX_DAYS[box]) : today();
      ...
      return { ...s, srs: { ...s.srs, [id]: { box, due } }, attempts: { ...s.attempts, [id]: stat } };
    });
  }, []);
```
`GrammarQuiz.tsx:17` is the canonical caller: `const { recordAttempt, addSkillXp } = useProgress();`. New scenario exercises call the same hook — **do not add a new progress field for scenario practice.**

**The `meta.topic` hook matters for this phase.** `weakTopics()` (`progress.ts:386-401`) aggregates by `attempts[id].topic`, defaulting to `"General"` (line 329). If scenario exercises pass `meta: { topic: scenario.title, level: scenario.level }`, the existing weak-topics recommendation starts working per scenario for free. If they omit it, all 52 pairs collapse into `"General"`.

**Merge rules new ids must survive** (`progress-merge.ts:428-457`) — the `{box, due}` pair moves as a **unit**, earlier `due` wins, ties take the lower `box`:
```ts
function mergeSrsItem(x: SrsItem, y: SrsItem): SrsItem {
  const d = compareDay(x.due, y.due);
  if (d !== 0) return d < 0 ? x : y;
  return x.box <= y.box ? x : y;
}
```
Wired at `progress-merge.ts:619`: `srs: unionRecord(x.srs, y.srs, mergeSrsItem)`. Because merging is a **key union with a per-entry, value-only picker**, adding new ids is inherently safe: idempotence, commutativity and associativity are properties of `mergeSrsItem` alone and cannot be affected by how many keys exist. **The one real hazard is id collision** — a scenario grammar question reusing an existing `grammar.ts` id (`"a1"`, `"a2"`, …) silently merges two different questions' review schedules. Namespace new ids `"<world>/<scenario>:<skill>:<n>"` and assert global uniqueness in the verify script (precedent: `verify-celpip-sections.mts:186`, `const allIds = CELPIP_SECTIONS.flatMap(...)`).

**Vocabulary is a different store.** `state.vocab` is `Record<string, true>` (`progress-schema.ts:44-45`), written by `markVocab` (`progress.ts:354-364`), not by `recordAttempt` — vocabulary cards are **not** in the SRS queue today. CONT-02 says phrases and vocabulary feed the SRS queue; that is a real decision the planner must make explicit: either route scenario vocabulary through `recordAttempt` (SRS) instead of / in addition to `markVocab`, or accept that "feeds the queue" means the known/unknown flashcard loop. Card ids are generated `${deckId}:${i}` at `vocabulary.ts:35-40` — **index-derived, so inserting a card mid-deck reassigns every later card's id and orphans its progress.** Per-scenario decks must key ids by term or explicit slug, not by index.

---

### 7. Design tokens and `"use client"` boundaries

**Tokens** (`src/app/globals.css:10-52`) — two full sets, light at `:root` and dark at lines 34-52, plus Tailwind `--color-*` bridges from line 56. Never hardcode a hex.
- Surfaces: `--paper`, `--paper-deep`, `--card`; text `--ink`, `--ink-soft`, `--muted`; borders `--line`, `--line-strong`.
- Accents: `--vermilion` (speaking), `--plum` (grammar), `--teal` (reading), `--sky` (writing), `--gold` (vocabulary), `--moss`. These are exactly `SKILL_META[skill].color` (`curriculum.ts:31-55`) — read the colour from there, do not restate it.
- Shadows `--shadow-soft` / `--shadow-lift`, radius `--radius`.

**The card idiom, used verbatim across every practice surface** (`ScenarioView.tsx:69`, `SpeakingWorkspace.tsx:98`, `VocabularyView.tsx:40`):
```
rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]
```
plus `transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]` when clickable, and the tinted icon chip:
```tsx
style={{ background: `color-mix(in srgb, ${ACCENT} 14%, transparent)`, color: ACCENT }}
```
Accent colours are applied via inline `style`, not Tailwind classes, because they are dynamic per world/skill (`ScenarioView.tsx:52`, `142-146`). Icons are `lucide-react` at `strokeWidth={1.75}` (2 or 2.5 for chevrons/checks). Headings use `font-display` (Fraunces).

**Client boundary — the rule this repo follows:**
- **Content modules under `src/lib/content/` have NO `"use client"`.** They are plain typed data, imported from both server pages and client components. New scenario banks and the coverage module must stay server-safe: no `window`, no hooks, no `Date.now()` at module scope. `celpip.ts` builds `CELPIP_SECTIONS` at module load and is imported by client components — that works only because it is pure.
- **Every practice component is `"use client"`**, line 1: `ScenarioView.tsx:1`, `SkillPractice.tsx:1`, `SpeakingWorkspace.tsx:1`, `VocabularyView.tsx:1`. Anything calling `useProgress` must be.
- **Pages are server components** that do the curriculum work and hand data down: `src/app/(catalog)/skill/[skill]/page.tsx:36-49` awaits `params` (Next 16: `params` is a `Promise`) and computes `matches` from `WORLDS` on the server. Coverage derivation belongs on the server side of that line where possible — it is pure data and costs nothing to compute during SSR.
- **Hydration:** anything derived and rendered before hydration must be module-level and deterministic (`CelpipLanding.tsx:183-187` and its comment). `ready` from the progress store is the flag that distinguishes the SSR baseline from hydrated state (`ScenarioView.tsx:20-22`, `VocabularyView.tsx:33`).

---

## Shared Patterns

### Keyed content lookup
**Source:** `scenario-lessons.ts:12`, `338-344`; `phrases.ts:12`, `102-108`
**Apply to:** every new scenario-keyed bank
Flat `Record<string, T>` keyed `` `${worldSlug}/${scenarioSlug}` ``, accessed only through an exported accessor taking `(worldSlug, scenarioSlug)`. Consumers never index the record directly. **New exercise banks return `T | undefined`; only the briefing keeps a total fallback.**

### Derived coverage, never declared
**Source:** `celpip.ts:795-819`, `771-793`, `864-875`; consumed at `CelpipTabs.tsx:27-46`, `CelpipLanding.tsx:183-187`, `256-257`
**Apply to:** the new scenario-coverage module and every UI surface that claims a scenario is practicable
Availability = "the bank actually holds items". Coverage prose = derived counts. Pending states are shown, disabled and labelled "Not yet available", never hidden.

### Executable content verification
**Source:** `scripts/verify-celpip-content.mts:1-150` (harness), `155-200` (assertion families), tail (reporting + exit code); registry half at `scripts/verify-celpip-sections.mts:78-200`
**Apply to:** all new content banks
`node --experimental-strip-types`, `.ts` extensions on relative imports, shared `ok`/`filled`/`inRange`/`duplicates`, append-only per-skill groups, partial coverage printed not asserted, `process.exit(1)` on any failure.

### Progress writes go through the hook
**Source:** `progress.ts:317-345` (`recordAttempt`), `354-364` (`markVocab`); caller example `GrammarQuiz.tsx:17`
**Apply to:** every new exercise component
Never construct an `SrsItem` by hand. Pass `meta.topic`/`meta.level` so `weakTopics()` (`progress.ts:386-401`) resolves per scenario. Ids must be globally unique and not index-derived.

### Renderer props are `(items[], accent?)`
**Source:** `PronunciationLab.tsx:31-39`, `GrammarQuiz.tsx:10-16`, `ReadingRoom.tsx:10-16`, `WritingDesk.tsx:8-14`
**Apply to:** the scenario×skill dispatch
The four existing renderers are already scenario-agnostic and need no change. Scenario specificity lives entirely in which array they are handed.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| a scenario×skill *dispatch that gates on coverage* | component | switch + gate | `SkillPractice.tsx:21-34` gives the switch and `CelpipTabs.tsx:27-46` gives the gate, but nothing in the repo composes the two. This is the one genuinely new component. |
| per-scenario vocabulary in the SRS queue | data flow | — | `state.vocab` is a boolean known-set (`progress-schema.ts:44-45`), separate from `srs`. No existing code puts vocabulary into the review queue, so CONT-02's "feeds the SRS queue" has no precedent to copy and needs an explicit planning decision. |

---

## Metadata

**Analog search scope:** `src/lib/content/`, `src/lib/` (celpip, progress, progress-merge, progress-schema, curriculum), `src/components/practice/`, `src/components/celpip/`, `src/app/(catalog)/skill/[skill]/`, `src/app/globals.css`, `scripts/`, `package.json`
**Files scanned:** 24
**Pattern extraction date:** 2026-07-31
