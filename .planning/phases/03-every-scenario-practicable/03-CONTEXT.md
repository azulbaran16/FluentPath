# Phase 3: Every Scenario Practicable - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Every existing scenario in the six worlds offers real, scenario-specific practice in each
skill it declares, and every scenario contributes its own phrases and vocabulary to the
spaced-repetition queue.

In scope: the **35 scenarios that already exist** and the **52 scenario×skill pairs** they
declare. Out of scope: new scenarios or new topics — that is Phase 4.

</domain>

<measured_starting_point>
## What actually exists today (measured, not estimated)

| Fact | Value |
|---|---|
| Scenarios in `src/lib/curriculum.ts` | **35** across 6 worlds |
| Declared scenario×skill pairs | **52** — speaking 30, writing 9, reading 9, grammar 4 |
| Scenarios with a briefing (`scenario-lessons.ts`) | **35 of 35** — this part is done |
| Scenarios with their own phrases (`phrases.ts`) | **9 of 35** |
| Scenarios with their own vocabulary | **0 of 35** |
| Scenarios with their own grammar / reading / writing / listening | **0 of 35** |

`vocabulary.ts`, `grammar.ts`, `reading.ts`, `writing.ts` and `listening.ts` contain real
content, but **none of it is keyed per scenario** — they are global banks. That is the gap
CONT-01 names: a scenario can declare `skills: ["speaking","writing"]` and hand the learner
material that has nothing to do with that scenario.

Content is keyed `"world/scenario"` (e.g. `"social/small-talk"`), not by bare slug.

</measured_starting_point>

<decisions>
## Implementation Decisions

### What "practicable" means

- **D-01:** Each of the 52 scenario×skill pairs gets **its own exercise, written for that
  scenario**. Practising speaking on "complaining politely" must practise complaining, not
  serve generic conversation prompts. The user rejected both cheaper readings: routing
  shared banks per scenario (two scenarios could hand back the same exercise) and going
  deep on 10–12 scenarios while declaring the rest incomplete.
  — **Reversibility:** reversible — content is additive; nothing is destroyed by adding more.

### Order of work

- **D-02:** **CONT-02 before CONT-01.** Phrases and vocabulary land across all 35 scenarios
  first, then the 52 exercises. Rationale from the user: phrases and vocabulary feed the
  spaced-repetition queue, so every scenario starts contributing to the learning loop
  immediately, even while its exercise is still generic. Highest value per word authored.

- **D-03:** The phase must be sequenced so **execution can stop anywhere and leave no
  overclaim** — the pattern Phase 2.1 proved with derived coverage. If a scenario's exercise
  is not yet written, the app must say so rather than present a generic one as if it were
  scenario practice.

### Ratified after research (2026-07-31)

- **D-04 — the authoring floors.** Per scenario: **6 phrases, 8 vocabulary cards**; per
  scenario×skill pair: **5 grammar questions** (and the equivalent density for reading and
  writing). The user ratified the researcher's A1/A2 assumptions after being shown the cost
  they imply: **~10,300 words and ~550 items, roughly two Phase 2.1s.** The cheaper floor
  (4/5/3, ~6,000 words) was rejected because 5 cards per scenario is too thin for spaced
  repetition to do its job. Scope reduction is therefore a decision to bring back to the
  user, not one to take quietly mid-execution.

- **D-05 — the review queue must actually resolve scenario items.** Today `ReviewView.tsx`,
  `ReviewHub.tsx` and `Dashboard.tsx` resolve every due id through `GRAMMAR_QUESTIONS`, so
  scenario phrases and vocabulary would be **stored, merged, and invisible** — CONT-02
  satisfied on paper and broken on screen. Fixing that resolution is **in scope for this
  phase**. It is code, not content, so it does not compete for the word budget.

### Ratified at plan review (2026-07-31)

- **D-06 — the SRS id format is the composite `world/scenario#kind#slug`**, e.g.
  `social/small-talk#phrase#hows-it-going`. The user ratified option A from the planner's
  one-way-door checkpoint after the plan checker independently confirmed its premise: all
  39 existing global grammar ids are slash-free, so collision with the new key space is
  structurally impossible rather than merely unlikely, and `sanitizeEntries`
  (`progress-schema.ts:411`) passes such keys through untouched. The two rejected options
  were opaque global slugs (provenance gone, a second lookup table to keep in step) and
  content-hash ids (a typo fix silently orphans a learner's box-4 item).
  — **Reversibility: one-way.** The id becomes the key under which live learner progress
  is stored in Postgres. Changing it later orphans entries with no migration path, because
  `mergeProgress` unions keys blindly and cannot detect an orphan. The checkpoint that
  guarded this is therefore **answered, not pending**: plan 01 executes option A.

### The gap is larger than "generic content"

Research and pattern-mapping agree, and this reframes CONT-01:

- `ScenarioView` **never reads `scenario.skills`** below its header. All 35 scenarios render
  the same three steps. **22 pairs (9 writing, 9 reading, 4 grammar) render nothing at all**,
  while a `SkillPill` and the JSON-LD `teaches` field promise them.
- The other **21 speaking pairs** receive `WORLD_FALLBACK` — three generic lines shared by
  every scenario in that world. That is literally two scenarios returning the same exercise,
  the outcome D-01 was chosen to prevent.

### Claude's Discretion

- Exercise shape per skill, and how much prose each costs
- Whether phrases and vocabulary live in one module per scenario or extend the existing
  keyed banks
- How many phrases / vocabulary items per scenario is the right floor
- How an incomplete pair is presented in the UI (D-03 says it must be honest; the form is mine)
- Whether any of the existing global bank content can be honestly re-keyed to a scenario
  rather than rewritten — reuse is fine where it genuinely belongs to that scenario

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and criteria
- `.planning/REQUIREMENTS.md` — CONT-01, CONT-02
- `.planning/ROADMAP.md` §"Phase 3: Every Scenario Practicable" — the three success criteria

### The content this phase fills
- `src/lib/curriculum.ts` — the 35 scenarios, their `skills` arrays and CEFR levels; the
  single source of truth for what pairs exist
- `src/lib/content/scenario-lessons.ts` — the briefing that already covers all 35, and the
  model for `"world/scenario"` keying
- `src/lib/content/phrases.ts` — the 9 scenarios that already have their own phrases; the
  shape to extend
- `src/lib/content/vocabulary.ts`, `grammar.ts`, `reading.ts`, `writing.ts`, `listening.ts` —
  the global banks, currently not scenario-keyed

### How practice is consumed
- `src/components/ScenarioView.tsx`, `src/components/practice/SkillPractice.tsx`,
  `SpeakingWorkspace.tsx`, `PronunciationLab.tsx` — where scenario content is rendered

### The SRS loop CONT-02 must feed
- `src/lib/progress.ts` — the `srs` record, its `{box, due}` items and the review flow
- `src/lib/progress-merge.ts` — SRS entries merge **per entry, value-only**; adding items
  must keep the merge idempotent, commutative and associative

### Precedent worth copying
- `.planning/phases/02.1-celpip-remaining-skills/02.1-02-SUMMARY.md` — **derived coverage**:
  the landing reports what exists by reading the banks, so it cannot overclaim when work
  stops midway. D-03 asks for the same mechanism here.
- `AGENTS.md` — Next.js 16 breaking changes; read `node_modules/next/dist/docs/` first

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scenario-lessons.ts` is the proof that per-scenario content at 35-scenario scale is
  tractable — 2,129 words covering every scenario with intro + tips.
- The `"world/scenario"` keying convention already exists and is understood by consumers.
- The SRS engine, the review flow and the weak-topics recommendation all exist and work;
  this phase feeds them rather than building them.

### Established Patterns
- Content lives in typed modules under `src/lib/content/`, one file per concern.
- Phase 2.1's lesson: **derive coverage from bank contents**, never hand-write it.
- Phase 2.1's other lesson: an author forgets an optional field. Make required anything the
  learner needs (explanations, translations, whatever the exercise shape demands).

### Integration Points
- `curriculum.ts`'s `skills` array is the contract that defines the 52 pairs.
- `ScenarioView` and `SkillPractice` decide what a learner sees per skill.
- Anything added to the SRS must survive `mergeProgress`'s per-entry rules.

</code_context>

<specifics>
## Specific Ideas

- The user chose the most expensive of three options for D-01 knowingly, after being shown
  that Phase 2.1's ~5,000 words of original content consumed a full session and that this is
  comparable or larger. Treat scope reduction as a decision to bring back to them, not one
  to take quietly.
- **Unlike Phase 2.1, there is no external format to follow.** CELPIP had an exam structure
  to match; here the exercise shapes are ours to define. That is freedom and risk in equal
  measure — inconsistency across 52 exercises is the failure mode.
- The beta user's CELPIP exam is still under three weeks away. This phase does not serve it.

</specifics>

<deferred>
## Deferred Ideas

- **New scenarios and new topics** — that is Phase 4 (CONT-03/04/05), explicitly not here.
- **Native-level content** for the Sounding Native world — Phase 4.
- Automated tests for the content loop — TEST-01, v2 backlog.

</deferred>

---

*Phase: 03-every-scenario-practicable*
*Context gathered: 2026-07-31*
