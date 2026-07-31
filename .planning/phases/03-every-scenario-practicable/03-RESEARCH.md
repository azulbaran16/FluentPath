# Phase 3: Every Scenario Practicable — Research

**Researched:** 2026-07-31
**Domain:** Original learning-content authoring at scale + wiring it into an existing
client-side SRS engine, inside this repo's own conventions. No external technology domain.
**Confidence:** HIGH on everything about existing code (all of it read, cited, and several
counts re-derived by script). MEDIUM on the authoring-cost extrapolation (arithmetic over
measured per-unit costs, but the units for three of the four skills do not exist yet).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Each of the 52 scenario×skill pairs gets **its own exercise, written for that
  scenario**. Practising speaking on "complaining politely" must practise complaining, not
  serve generic conversation prompts. The user rejected both cheaper readings: routing
  shared banks per scenario (two scenarios could hand back the same exercise) and going
  deep on 10–12 scenarios while declaring the rest incomplete.
  — **Reversibility:** reversible — content is additive; nothing is destroyed by adding more.

- **D-02:** **CONT-02 before CONT-01.** Phrases and vocabulary land across all 35 scenarios
  first, then the 52 exercises. Rationale from the user: phrases and vocabulary feed the
  spaced-repetition queue, so every scenario starts contributing to the learning loop
  immediately, even while its exercise is still generic. Highest value per word authored.

- **D-03:** The phase must be sequenced so **execution can stop anywhere and leave no
  overclaim** — the pattern Phase 2.1 proved with derived coverage. If a scenario's exercise
  is not yet written, the app must say so rather than present a generic one as if it were
  scenario practice.

### Claude's Discretion

- Exercise shape per skill, and how much prose each costs
- Whether phrases and vocabulary live in one module per scenario or extend the existing
  keyed banks
- How many phrases / vocabulary items per scenario is the right floor
- How an incomplete pair is presented in the UI (D-03 says it must be honest; the form is mine)
- Whether any of the existing global bank content can be honestly re-keyed to a scenario
  rather than rewritten — reuse is fine where it genuinely belongs to that scenario

### Deferred Ideas (OUT OF SCOPE)

- **New scenarios and new topics** — that is Phase 4 (CONT-03/04/05), explicitly not here.
- **Native-level content** for the Sounding Native world — Phase 4.
- Automated tests for the content loop — TEST-01, v2 backlog.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | Every existing scenario in all 6 worlds offers real practice in each of its applicable skills (grammar, speaking, reading, writing) — no stub, placeholder, or empty activity | §2 names the exact stub that exists today (three of four skills render **nothing**, and speaking serves a per-world generic set to 26/35). §1 gives the four component contracts a scenario exercise must satisfy and which need a new shape. §4 gives the derived-coverage mechanism that proves "no stub" by construction rather than by claim. |
| CONT-02 | Every scenario has scenario-specific phrases and vocabulary that feed the SRS review queue | §3 states the merge contract an SRS item must satisfy, the id convention it must adopt, the two **blockers** in the current code (nothing but grammar ever writes SRS; the review surface hard-filters to `GRAMMAR_QUESTIONS`), the fact that `vocab` is a separate whole-map-selected field and not part of the SRS at all, and the measured payload headroom. |
</phase_requirements>

## Project Constraints (from AGENTS.md / CLAUDE.md)

`CLAUDE.md` is a one-line `@AGENTS.md` include. Actionable directives extracted from
`AGENTS.md`, all of which bind this phase:

| Directive | Bearing on Phase 3 |
|---|---|
| "This is NOT the Next.js you know… read the relevant guide in `node_modules/next/dist/docs/` before writing any code." | Directory exists (`01-app/`, `02-pages/`, `03-architecture/`, `04-community/`, `index.md`). This phase is mostly content + client components, but any new route segment, `generateMetadata`, or `generateStaticParams` edit must consult it first. |
| GSD is the workflow; state lives in `.planning/` | Already in effect. |
| Curriculum in `src/lib/curriculum.ts` is the **single source of truth** | It is: it defines the 52 pairs. Nothing in this phase may fork the scenario list. |
| Progress lives in Postgres; `progress.ts` is a module store behind `useSyncExternalStore`; the merge **must stay idempotent, commutative and associative** and re-runs on every authenticated load | The binding constraint on CONT-02. See §3. |
| CELPIP section availability and coverage lines are **derived from bank contents, never hand-written, so they cannot overclaim** | The precedent D-03 asks to copy. See §4. |
| All content is original; third-party study material is a format reference only | Applies here too, and more loosely: there is no external format at all for scenario exercises (see §6). |

## Summary

This phase has almost no unknown technology in it. Everything it needs — a phrase shape, a
grammar-question shape, a passage shape, a writing-prompt shape, a Leitner SRS engine, a
merge that survives multi-device reconciliation, and a proven derived-coverage pattern — is
already in the repo, written, and shipping. What the phase is actually made of is (a) a large
volume of original authored English content, and (b) three small pieces of plumbing that do
not exist yet and that CONT-01/CONT-02 cannot be satisfied without.

The three missing pieces, stated plainly so the planner does not discover them late:

1. **`ScenarioView` never reads `scenario.skills`.** It renders three fixed steps for every
   scenario in all six worlds. The declared skills reach the SkillPill row
   (`ScenarioView.tsx:44-46`), the page `<title>`/description
   (`world/[slug]/[scenario]/page.tsx:23-25`) and the JSON-LD `teaches` array
   (`world/[slug]/[scenario]/page.tsx:55`) — and nowhere else. Twenty-two of the fifty-two
   pairs (9 writing, 9 reading, 4 grammar) render **no exercise at all** today.
2. **Nothing except grammar ever writes to `state.srs`.** `recordAttempt` has exactly two
   call sites (`GrammarQuiz.tsx:38`, `TypeAnswer.tsx:45`) and both pass a `GRAMMAR_QUESTIONS`
   id. Three separate surfaces then hard-filter the queue back through that same bank
   (`ReviewView.tsx:17`, `ReviewHub.tsx:24`, `Dashboard.tsx:17,38`). An SRS item added by a
   scenario would today be stored correctly, merged correctly, and be **invisible and
   uncounted** in every review surface.
3. **`vocab` is not part of the SRS.** It is a separate `Record<string, true>` binary
   known-map (`progress-schema.ts:44-45`, `progress.ts:354-364`) and it is the one field in
   the whole state with a real delete site, which is why the merge selects it **whole** from
   one side (`progress-merge.ts:558-594`, `:620`). "Vocabulary feeds the SRS queue" is
   therefore a design decision, not a wiring job — and the safest reading of CONT-02 is that
   scenario vocabulary gets **SRS entries** (per-entry merged, unionised) rather than being
   pushed into the whole-map-selected `vocab` field.

**Primary recommendation:** Define one typed content module per skill keyed
`"world/scenario"` in the exact style of `scenario-lessons.ts`; give every learner-facing
item a **stable id** (three of the four existing shapes have none); route the scenario page
through a **derived registry** in the shape of `CELPIP_SECTIONS` so an unwritten pair reports
itself as unwritten with no hand-written string; widen the SRS review surface **once** in the
CONT-02 wave so items authored later are visible the day they land; and gate the whole thing
with an appended-to `scripts/verify-*.mts` harness in the committed, zero-dependency style
this repo already uses four times. Zero new packages. 11 + 11 holds.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scenario/skill content banks | Static module (`src/lib/content/*`) | — | Content is compiled into the bundle today (`phrases.ts`, `grammar.ts`, …); there is no CMS and no content API. Keep it that way — it is what makes a node verification script able to load it. |
| "Which pairs are written" coverage | Static module (derived) | — | Phase 2.1 proved this belongs beside the banks (`celpip.ts:795-819`), never in a component and never in a database. |
| Exercise rendering + scoring | Browser / client component | — | Every practice component is `"use client"` and scores locally (`GrammarQuiz`, `ReadingRoom`, `PronunciationLab`, `WritingDesk`). No server round-trip exists for scoring and none should be added here. |
| Scenario page shell, metadata, JSON-LD | Frontend server (RSC) | — | `world/[slug]/[scenario]/page.tsx` is a server component with `generateStaticParams`; `teaches` is emitted server-side, so an honest `teaches` must be derivable server-side too. |
| SRS scheduling (`box`/`due`) | Browser (module store) | API + Postgres (durability) | `BOX_DAYS` and the whole engine live in `progress.ts:39,317-345`; the server only validates and stores the blob (`progress-schema.ts:479-499`). Do not move scheduling. |
| SRS/vocab durability + cross-device merge | API (`/api/progress`) + Postgres | localStorage (cache + queue) | Established in Phase 2. The merge is the contract, not the transport. |
| Review surface (what is due, weak topics) | Browser client components | — | `ReviewView`/`ReviewHub`/`Dashboard`. This is the tier that must change for CONT-02 to be observable. |

---

# §1 — What each skill's exercise looks like today

## The four component contracts

| Skill | Component | Props (file:line) | Content type | Item has a stable id? | Writes progress? |
|---|---|---|---|---|---|
| speaking | `PronunciationLab` | `{ phrases: Phrase[]; accent?: string; onComplete?: () => void }` — `PronunciationLab.tsx:31-39` | `Phrase { text; es; tip? }` — `phrases.ts:5-10` | **No** | **No** — no `useProgress` import at all; only the optional `onComplete` callback, which `ScenarioView` uses to call `complete()` (`ScenarioView.tsx:92`, `:27-30`) |
| grammar | `GrammarQuiz` | `{ questions: GrammarQuestion[]; accent?: string }` — `GrammarQuiz.tsx:10-15` | `GrammarQuestion { id; level: GrammarLevel; topic; prompt; options; answer; explain }` — `grammar.ts:7-15` | **Yes** (`id`) | **Yes** — `recordAttempt(q.id, isRight, { topic, level, chosen })` + `addSkillXp("grammar", …)` at `GrammarQuiz.tsx:38-43` |
| reading | `ReadingRoom` | `{ passages: Passage[]; accent?: string }` — `ReadingRoom.tsx:10-15` | `Passage { id; title; level; minutes; body: string[]; glossary; questions: ReadingQuestion[] }`, `ReadingQuestion { q; options; answer }` — `reading.ts:4-20` | Passage **yes**; question **No** — `PassageReader` keys answers by array index (`ReadingRoom.tsx:85,97-99`) | **No** |
| writing | `WritingDesk` | `{ prompts: WritingPrompt[]; accent?: string }` — `WritingDesk.tsx:8-13` | `WritingPrompt { id; title; level; task; minWords; maxWords; checklist: string[]; model }` — `writing.ts:7-17` | Prompt **yes**; checklist item **No** | **No** — and it writes drafts to raw `localStorage` under `fluentpath:writing:${prompt.id}` (`WritingDesk.tsx:22,31,46`), outside `progress-schema.ts` entirely |

**Also relevant, though no scenario declares it as a skill:** `listening.ts` (`Clip { id; title;
level; lines: string[]; questions }`, `listening.ts:14-20`) and `sentences.ts`
(`SentenceDrill { id; level; words; hint }`). `Skill` is a four-member union
(`curriculum.ts:8`) and listening is **not** in it — listening is a standalone `/listening`
page. Nothing in this phase needs to widen that union.

## Does each skill need a new content shape?

| Skill | Verdict | Reasoning |
|---|---|---|
| **speaking** | **Reuse `Phrase`, key it per scenario. No new shape needed.** | `phrases.ts` is *already* keyed `"world/scenario"` (`phrases.ts:12`, `:102-108`) and 9 scenarios already have their own set. The work is authoring the missing 26 and **deleting the fallback** (see §2). One optional addition to consider: `Phrase` has no `id`, and CONT-02 needs one — see §3's id convention. |
| **grammar** | **Reuse `GrammarQuestion` as the item; add a per-scenario container.** | `GrammarQuiz` already does exactly what criterion 3 of the ROADMAP asks: it calls `recordAttempt` with `topic` and `level`, which is what populates `weakTopics()` (`progress.ts:386-402`). Feeding it scenario-authored `GrammarQuestion[]` satisfies criteria 2 and 3 for free. Only 4 pairs — the cheapest skill. |
| **reading** | **Reuse `Passage`, but a new container and a stable question id are needed.** | `ReadingRoom` is a *browser* (level-filter pills + passage list, `ReadingRoom.tsx:22-73`); a scenario wants the single-passage reader, and `PassageReader` is **not exported** (`ReadingRoom.tsx:76`). Either export it or add a thin scenario wrapper. `ReadingQuestion` has no `id` (`reading.ts:4-8`) — required if a reading answer is to reach SRS or `attempts`. |
| **writing** | **Reuse `WritingPrompt`; new container; and decide about the localStorage draft.** | `WritingDesk` renders a prompt-picker even for one prompt (`WritingDesk.tsx:57-70`) — a scenario wants a single-prompt mode. Its draft key is raw `localStorage` outside the Phase 2 contract; scoping it per scenario (`fluentpath:writing:social/complaining`) is a one-line change, but note it will **not** sync across devices, and saying otherwise would be an overclaim. |

**Confidence: HIGH.** [VERIFIED: every file above read in full or at the cited lines this session]

---

# §2 — What a learner currently sees for a skill with no scenario-specific content

Traced concretely, end to end.

`src/app/(catalog)/world/[slug]/[scenario]/page.tsx` resolves the scenario (`:44-47`),
emits JSON-LD whose `teaches` is `sc.skills.map(s => SKILL_META[s].label)` (`:55`), and
renders `<ScenarioView world={world} scenario={sc} />` (`:64`). **It passes the skills only as
part of the scenario object; it does not branch on them.**

`src/components/ScenarioView.tsx` then renders, for **every** scenario in **every** world,
the same three sections — with `scenario.skills` used at exactly one place, the pill row:

```
ScenarioView.tsx:44-46   scenario.skills.map(s => <SkillPill key={s} skill={s} />)   ← the promise
ScenarioView.tsx:63-84   Step 1 "Learn the essentials"  → getScenarioLesson(...)     ← real, 35/35
ScenarioView.tsx:86-93   Step 2 "Warm up & speak"       → <PronunciationLab phrases={getPhrases(...)}/>
ScenarioView.tsx:95-128  Step 3 "Role-play"             → <Link href={`/tutor?scenario=…`}/> + "Mark as done"
```

There is **no `switch (skill)`, no conditional, and no reference to `scenario.skills` below
line 46 anywhere in the file.** Grep confirms `SkillPractice` — the component that does branch
per skill — is imported by `src/app/(catalog)/skill/[skill]/page.tsx:7` only, never by
`ScenarioView`.

So the answer to "what does a learner see", per skill:

| Declared skill | Pairs | What renders on the scenario page today |
|---|---|---|
| **speaking** | 30 | `PronunciationLab`. For the 9 scenarios in `SETS` it is genuinely scenario-specific. For the other **21 speaking pairs** `getPhrases` falls through to `WORLD_FALLBACK[worldSlug]` (`phrases.ts:102-108`) — a **3-phrase generic set shared by every scenario in that world**. E.g. every un-curated `work` scenario (emails, presentations, negotiating, networking, feedback) hands back the identical three lines "Let me get back to you on that. / That works for me. / I'll follow up by email." (`phrases.ts:75-79`). Two scenarios *do* return the same exercise — the precise failure D-01 rejected. |
| **writing** (9) | 9 | **Nothing.** No writing UI is mounted on any scenario page. |
| **reading** (9) | 9 | **Nothing.** |
| **grammar** (4) | 4 | **Nothing.** |

**Naming the stub CONT-01 forbids, so the plan can prove it gone:**

- **Stub A — the silent omission (22 pairs).** A `SkillPill` and a JSON-LD `teaches` entry
  promise Writing / Reading / Grammar; the page renders zero exercises for them. This is the
  strongest form: not a placeholder the learner can see and forgive, but an unkept promise
  with no acknowledgement. The 22 affected pairs are enumerated at the end of this section.
- **Stub B — the world fallback masquerading as scenario practice (21 pairs).** `getPhrases`
  silently substitutes generic material and the UI presents it under the heading
  "Warm up & speak" inside a scenario page. Nothing tells the learner it is generic. This is
  literally what D-03 forbids.
- **Stub C — the unreachable-but-live lesson fallback.** `getScenarioLesson` has the same
  fallback pattern (`scenario-lessons.ts:330-345`), but it is **currently unreachable**: all
  35 curriculum keys have a curated lesson (verified by script — 35 lesson keys, 35 scenarios,
  zero on either side without a match). It becomes reachable again the moment Phase 4 adds a
  scenario, so the same honesty mechanism should cover it.

**A fourth thing that is not a stub but reads like one:** Step 3 links to `/tutor`, which
returns a clearly-labelled stub reply while `ANTHROPIC_API_KEY` is unset
(`src/app/api/tutor/route.ts:53,58,136-137`). That is **Phase 5's** requirement (TUTOR-01),
not this phase's — but a plan that claims "every declared skill is practicable" while
speaking practice ends in a stubbed role-play should say which half it fixed.

**The 22 pairs with nothing at all today** (from `curriculum.ts:65-141`, re-derived by
script):

- **writing (9):** `social/complaining` B2 · `work/emails` B1 · `work/presentations` B2 ·
  `work/networking` B2 · `travel/hotel` B1 · `academic/summaries` B2 · `academic/debate` C1 ·
  `practical/tech-support` B1 · `native/register` C1
- **reading (9):** `social/humor` C1 · `travel/restaurant` A2 · `academic/news` B2 ·
  `academic/articles` C1 · `academic/stories` B2 · `academic/summaries` B2 ·
  `practical/housing` B2 · `native/idioms` C1 · `native/culture` C1
- **grammar (4):** `social/small-talk` B1 · `work/interviews` B2 · `work/emails` B1 ·
  `native/phrasal-verbs` B2

**Confidence: HIGH.** [VERIFIED: `ScenarioView.tsx` read in full; grep for `SkillPractice`
across `src/` returns one importer; pair counts re-derived from `curriculum.ts` by script and
match CONTEXT.md's 52 / 30 / 9 / 9 / 4 exactly]

---

# §3 — The SRS contract (CONT-02)

## How something reaches `state.srs` today

One function, one shape, two call sites.

```
progress.ts:317-345   recordAttempt(id, correct, meta?)
  box  = correct ? min(prev.box + 1, BOX_DAYS.length - 1) : 0        // BOX_DAYS = [0,1,3,7,16,30] (progress.ts:39)
  due  = correct ? addDays(BOX_DAYS[box]) : today()
  → s.srs      = { ...s.srs,      [id]: { box, due } }
  → s.attempts = { ...s.attempts, [id]: AttemptStat }                 // written together, same id
```

`SrsItem` is `{ box: number; due: "YYYY-MM-DD" }` (`progress-schema.ts:19-22`); validated by
`srsItemSchema` with `box` an integer `0..50` and `due` matching `/^\d{4}-\d{2}-\d{2}$/`
(`progress-schema.ts:451-454`, `:369`).

**Call sites: `GrammarQuiz.tsx:38` and `TypeAnswer.tsx:45`. Both pass a `GRAMMAR_QUESTIONS`
id.** Nothing else in the app has ever written an SRS entry — `PronunciationLab`,
`ReadingRoom`, `WritingDesk`, `VocabularyView`, `SentenceBuilder` and every CELPIP runner all
do not.

## The id convention, and the collision hazard

`state.srs` and `state.attempts` share **one flat, unnamespaced string key space.** Current
occupants are grammar ids only: `"a1" … "a13"`, `"b1" …`, `"c1" …` (39 total,
`grammar.ts:20+`). Other banks use bare slugs in their own namespaces — reading `"coffee"`,
`"market"`; writing `"text-friend"`; listening `"voicemail"`; vocabulary
`` `${deckId}:${i}` `` (`vocabulary.ts:35-40`). A cross-bank scan finds **no duplicates
today**, but nothing prevents one, and the merge unions keys blindly
(`progress-merge.ts:619`).

**Recommendation (HIGH confidence, derived from the code's own conventions):** every
scenario-authored SRS id must be **prefixed with the `"world/scenario"` key that already
identifies the scenario everywhere else** — `completed` uses it (`progress.ts:186-187`,
`progress-schema.ts:36-37`), `phrases.ts` uses it, `scenario-lessons.ts` uses it, the tutor
link uses it. A shape like `"social/complaining#phrase#2"` or
`"social/complaining#grammar#1"`:

- cannot collide with `"a1"` or with `"daily:0"`;
- carries its own provenance, so a review surface can resolve it back to a scenario without a
  second lookup table;
- survives `sanitizedRecord` (`progress-schema.ts:432-437`) and `srsRecord`
  (`progress-merge.ts:218-231`) unchanged — neither constrains key format, only that the key
  is not `__proto__`/`constructor`/`prototype` (`progress-schema.ts:400`,
  `progress-merge.ts:222`);
- keeps the natural key stable when a scenario's content is edited **only if the item's local
  part is stable**, which is exactly why the item needs an authored `id` field rather than an
  array index (see below).

**This forces one content change: give every SRS-bearing item a stable authored id.**
`Phrase` has none (`phrases.ts:5-10`), `ReadingQuestion` has none (`reading.ts:4-8`), and
`WritingPrompt.checklist` is `string[]` (`writing.ts:15`). Deriving an id from an array index
means **inserting a phrase re-labels every phrase after it** — the learner's box-4 item
silently becomes a different sentence, and the merge cannot detect it because the key is
identical. This is the single sharpest correctness trap in CONT-02.

## What the merge requires of 35 scenarios' worth of new items

`mergeProgress` handles `srs` as `unionRecord(x.srs, y.srs, mergeSrsItem)`
(`progress-merge.ts:619`). Everything the plan must satisfy follows from three facts, all of
them already documented in that file:

**1. A per-entry rule may read only the two entries it is handed.** The block comment at
`progress-merge.ts:337-357` is explicit, with an executed counterexample behind it
(`scripts/verify-merge.mts` group 19): a rule that consults state-level fields or the paired
entry in another map breaks associativity, because "the timestamp travels with the merge; the
entry's provenance does not." **This is the concrete form of the CONTEXT's "a selection key
must travel with the value it selects."**

**2. `mergeSrsItem` is already total and needs no change** (`progress-merge.ts:428-457`):
earlier `due` wins; equal `due` takes the lower `box`. Both tiebreaks fail safe toward one
extra review. **Adding 490–1,400 more keys to this map costs the merge nothing** — the rule is
per key and the number of keys is irrelevant to its algebra.

**Therefore, what "adding 35 scenarios of items" must satisfy is short and checkable:**

- **The item id must be a stable natural key.** Same phrase ⇒ same id forever, across content
  edits and reorderings. If ids move, the union produces two entries where the learner earned
  one, and the reconcile re-runs on every authenticated load (`progress.ts:196-237`) so the
  damage compounds silently.
- **Nothing may be added to the `SrsItem` value shape.** `{box, due}` moves as a unit
  (`progress-merge.ts:429-431`). A third field — `skill`, `scenario`, `kind` — would need its
  own merge rule and would reintroduce exactly the associativity hazard the file spent 6,994
  assertions closing. **Put selection metadata in the id, not in the value.** (This *is* the
  "selection key travels with the value" rule, satisfied the cheapest way: the id and the
  value are one map entry, so they can never separate.)
- **The write must go through `recordAttempt`, not a new mutation.** It is the only function
  that computes `box` and `due` together, and `persist` (`progress.ts:174-184`) is the single
  funnel that stamps the D-01b `updatedAt` instant. A second SRS writer is a second place to
  get the pair wrong.
- **`meta.topic` must be set for anything that should reach weak topics.** `weakTopics()`
  groups `attempts` by `topic` (`progress.ts:386-402`) — that is ROADMAP criterion 3.
- **Writing an SRS entry also writes an `attempts` entry** (`progress.ts:337-341`). Its merge
  rule is `mergeAttemptStat` (`progress-merge.ts:411-426`), which requires the invariant
  `wrong <= tries` — enforced on coercion, not in the join (`progress-merge.ts:244-274`) — and
  selects `topic`/`level`/`resolved`/`lastWrongOption` as a **group** from the later-day side.
  Content that reuses one id across two different topics would make that group incoherent.

## The two blockers CONT-02 hits regardless of content

**Blocker 1 — the review surface is hard-filtered to the grammar bank.** Three places:

```
ReviewView.tsx:17   GRAMMAR_QUESTIONS.filter(q => dueIds.has(q.id))     ← what the learner is shown
ReviewHub.tsx:24    GRAMMAR_QUESTIONS.filter(q => dueSet.has(q.id))     ← the "Due today" badge count
Dashboard.tsx:17,38 dueReviewIds().filter(id => REVIEWABLE_IDS.has(id)) ← the dashboard count
```

`Dashboard.tsx:35-36` even documents why: "Only count reviews that still exist in the current
question bank, so the dashboard matches what the Review page actually shows." That reasoning
is sound — an orphaned id must not be counted — but the implementation resolves ids through
**one** bank. Scenario phrases and vocabulary would be stored, merged and scheduled perfectly
and appear **nowhere**. ROADMAP criterion 2 ("those items later appear in the review flow when
due") fails on plumbing, not on content.

The right generalisation is the one Phase 2.1 already built for a structurally identical
problem: `HISTORY_SOURCES` in `CelpipLanding` — an array of typed resolvers, one per record
type, each declaring how to resolve an id back to a renderable item, with the sort/empty
state/counting inherited (`02.1-02-SUMMARY.md`, "Task 2"). A `REVIEW_SOURCES` array resolving
`{ id → renderable review item }` per content kind, with an unresolved id **excluded from the
count** exactly as today, is the same shape and preserves the existing guarantee.

**Blocker 2 — `vocab` is not the SRS and must not become a second one.** `markVocab`
(`progress.ts:354-364`) sets or **deletes** `vocab[id]`, and `VocabularyView` offers a binary
"Still learning" / "Got it" (`VocabularyView.tsx:196-210`). Because it has a real delete site,
the merge selects the map **whole** from one side via the D-01b instant ladder
(`progress-merge.ts:558-594`, applied at `:620`). Consequences the planner must weigh:

- Whole-map selection means **a losing side's marks are discarded wholesale**, not per key.
  Growing `vocab` from 136 ids to ~420 makes each lost selection three times as costly.
- `vocab` has no `due` and no `box`. Putting scenario vocabulary there satisfies "has
  vocabulary" but **not** "feeds the SRS review queue."

**Recommendation (MEDIUM-HIGH):** scenario vocabulary should produce **SRS entries via
`recordAttempt`** (per-entry merged, union-safe, scheduled) and leave `vocab` for the
existing deck flashcards. If the planner instead wants the flashcard UX for scenario
vocabulary, the study interaction can stay flashcard-shaped while the *persistence* goes to
`srs` — the two are independent. What must not happen is a second whole-field-selected map:
`progress-schema.ts:200-211` and `:283-293` explain at length why a second map riding the one
`updatedAt` instant resurrects deleted data (the `fca41b7` defect Phase 1 paid for).

## Is there a bound on SRS size, and does the payload have a cap?

**Yes to both, and there is comfortable headroom.**

- **Wire cap: 1 MiB**, checked twice — on the declared `content-length` and on the actual
  body — returning 413 (`src/app/api/progress/route.ts:36,126-132`). The sync queue treats
  413 as a **permanent drop** for that body (`src/lib/sync-queue.ts:304-305`), so exceeding it
  means silent, unrecoverable loss of that snapshot. This is the number to respect.
- **No cap on `srs` key count.** `sanitizedRecord` (`progress-schema.ts:432-437`) bounds each
  *entry* (`box` ≤ 50, `due` well-formed) and blocks poisoned keys, but does not bound the
  number of keys or the key length. The only bound is the 1 MiB body.
- **localStorage:** ~5 MB per origin, shared with `fluentpath:celpip:*` and the sync queue —
  noted at `progress-schema.ts:160-166`. `writeLocal` already returns `false` rather than
  throwing on quota (`progress.ts:61-68`).

Measured — a JSON blob built to the shape above, `Buffer.byteLength` of `JSON.stringify`,
with a deliberately long 24-char scenario key:

| Scenario | `srs` keys | `attempts` keys | `vocab` keys | Size | % of 1 MiB |
|---|---|---|---|---|---|
| Today (grammar saturated) | 39 | 39 | 136 | 7.3 KiB | 0.7% |
| CONT-02 only — 6 phrases + 8 vocab per scenario | 490 | 0 | 280 | 42.3 KiB | 4.1% |
| CONT-02 rich — 8 phrases + 12 vocab per scenario | 700 | 0 | 420 | 61.4 KiB | 6.0% |
| CONT-01 + CONT-02 — the above + 52 exercises × 5 scored items | 960 | 260 | 420 | 120.2 KiB | 11.7% |
| Pessimistic — 10 phrases + 15 vocab + 52 × 10 items | 1,395 | 520 | 525 | 194.5 KiB | 19.0% |

**Verdict: the payload cap is not a constraint on this phase.** Even the pessimistic case
uses under a fifth of the budget, and that is before considering that a learner reaches
saturation only by practising every item in the app. What *is* worth stating in the plan: the
blob grows ~16× from its current saturated size, so this is the first phase where the 1 MiB
number stops being theoretical, and a future phase that adds free-form prose per item (a
learner's own written answer, say) would blow through it fast. `attempts` entries cost ~2×
what `srs` entries do, so scoring every item is the expensive choice, not storing every item.

**Confidence: HIGH** on the mechanism and the cap; **HIGH** on the sizes (measured, not
estimated — the script is arithmetic over the real shapes). [VERIFIED: `progress.ts`,
`progress-schema.ts`, `progress-merge.ts`, `api/progress/route.ts` read; sizes computed this
session]

---

# §4 — Derived coverage for scenarios and skills (D-03)

## What Phase 2.1 built, precisely

`src/lib/celpip.ts` holds a registry whose availability is **computed, not declared**:

```
celpip.ts:693-697   interface CelpipSectionSource { groups: CelpipSectionGroup[]; summary: string }
                    // `undefined` = the bank module does not exist yet
celpip.ts:708-793   writingSource() / speakingSource() / listeningSource() / readingSource()
                    // each maps a bank into groups + a summary assembled from COUNTS
celpip.ts:795-819   section(skill, label, blurb, source, caveat?)
                    //   groups    = (source?.groups ?? []).filter(g => g.items.length > 0)
                    //   available = groups.length > 0
                    //   summary   = available ? source.summary : ""
                    //   caveat    = available ? caveat : undefined     ← a caveat cannot precede its bank
celpip.ts:821-862   CELPIP_SECTIONS — the four sections
celpip.ts:864-876   getSection / availableSections / pendingSections
```

Three properties make it un-overclaimable, and all three transfer directly:

1. **Empty groups are filtered before availability is computed** (`celpip.ts:805`). A bank
   that exists but is empty still reports "not yet". Phase 2.1 proved this with a deliberate
   **control mutation** (`02.1-02-SUMMARY.md`, "Registry — 10 mutations"), which is why a
   later plan can wire the registry before writing the content.
2. **Every user-visible number is assembled from `.length`, never typed** — `plural()` at
   `celpip.ts:699-701`, and denominators are data (`CELPIP_SPEAKING_SHAPES.length`,
   `CELPIP_READING_PART_KINDS.length`).
3. **The registry holds no React and no lucide** — icon keys are strings resolved to
   components in `icons.tsx` — so `celpip.ts` stays loadable under
   `node --experimental-strip-types`, which is what lets
   `scripts/verify-celpip-sections.mts` gate the derivation with 43 assertions.

## The equivalent mechanism for scenarios and skills

**Recommendation (HIGH confidence — this is a direct structural transfer, not a novel design):**
add a derived **scenario coverage registry** beside the content banks. Sketch, in the repo's
own idiom:

```ts
// src/lib/scenario-coverage.ts  — no React, no lucide, no "@/" imports:
// must load under `node --experimental-strip-types` so a script can gate it.

export interface SkillCoverage {
  skill: Skill;
  /** DERIVED — the bank actually holds a non-empty exercise for this pair. */
  available: boolean;
  /** DERIVED from counts; "" when unavailable. */
  summary: string;
}

export interface ScenarioCoverage {
  key: string;                 // "world/scenario"
  phrases: number;             // DERIVED — bank length, 0 when absent
  vocabulary: number;          // DERIVED
  skills: SkillCoverage[];     // one entry per DECLARED skill, in curriculum order
  complete: boolean;           // DERIVED — every declared skill available AND phrases > 0 AND vocabulary > 0
}
```

built by walking `WORLDS` (`curriculum.ts:58-142`) — never a second scenario list — and
looking each pair up in the per-skill banks, with `available` computed the `section()` way:
**the bank returned something non-empty**, not a flag anyone can set.

What it then drives, all by itself:

| Surface | Today | With the registry |
|---|---|---|
| `ScenarioView` step per skill | nothing renders for 22 pairs; generic phrases for 21 | render the exercise when `available`; render an explicit, named "not written yet" panel when not — the honest form D-03 asks for, in the shape of `CelpipTabs.tsx:43`'s `aria-disabled` + "Not yet available" |
| JSON-LD `teaches` (`world/[slug]/[scenario]/page.tsx:55`) | every declared skill, always — **currently an overclaim for 22 pairs** | only skills whose banks are non-empty, exactly as `02.1-02-SUMMARY.md` did for `teaches` (T-02.1-10) |
| Page description (`…/page.tsx:23-25`) | lists every declared skill | list what ships |
| `SkillPill` row (`ScenarioView.tsx:44-46`) | promises all declared skills | pill can carry the availability state |
| `/skill/[skill]` "N scenarios train your X" (`skill/[skill]/page.tsx:96-97`) | counts **declarations** | count what is written |
| World cards / `WorldView.tsx:75-76` | same pills | same treatment |

**Two adaptations Phase 2.1 did not need**, both worth calling out to the planner:

- **CELPIP had 4 sections; this has 52 pairs + 35 phrase sets + 35 vocab sets.** A hero
  paragraph naming every gap is unreadable. The Phase 2.1 judgement call — "the caveat renders
  beside its own section rather than in the hero line, so four caveats cannot pile up"
  (`02.1-02-SUMMARY.md`, "Judgement call") — argues for **per-scenario, in-place** honesty
  plus a single **aggregate count** ("28 of 52 skill exercises written") anywhere a roll-up is
  wanted. The aggregate must be derived from the same registry, or the two will disagree.
- **`getPhrases`'s and `getScenarioLesson`'s silent fallbacks defeat any derivation built on
  top of them.** `getPhrases` can never return empty (`phrases.ts:102-108`), so
  `phrases.length > 0` is always true and a registry reading it would report every scenario as
  covered. **The registry must read `SETS` directly, and the fallback should be removed or
  made explicit** (e.g. `getPhrases` returns `Phrase[] | undefined` and the caller decides).
  This is the single most important edit for D-03 and it is a two-line change with a wide
  blast radius — `SPEAKING_PACKS` (`phrases.ts:129-175`) and `SkillPractice.tsx:15-19` both
  call `getPhrases` for the global speaking page and would need a decision.

**Confidence: HIGH** on the mechanism; **MEDIUM** on the exact registry shape above, which is
a sketch for the planner, not a specification. [VERIFIED: `celpip.ts:693-876` read;
`02.1-02-SUMMARY.md` read in full]

---

# §5 — Authoring cost, measured

## Method

String literals were extracted from each content module with comments stripped, and words
counted inside them (so type declarations, keys' punctuation and code are excluded). Item
counts come from structural greps. Everything below is reproducible from
`src/lib/content/*.ts` as committed.

## Measured baseline — what a unit of each kind actually costs

| Bank | Units | Words in strings | **Words per unit** |
|---|---|---|---|
| `scenario-lessons.ts` | 35 scenarios (intro + 4 tip lines each; 140 tip lines total) | 1,824 | **52.1 / scenario** |
| `phrases.ts` — the 9 curated `SETS` | 36 phrase entries across 9 scenarios | 382 | **10.6 / phrase**, 4.0 phrases / scenario |
| `phrases.ts` — `WORLD_FALLBACK` | 18 entries | 164 | 9.1 / phrase |
| `vocabulary.ts` | 17 decks × 8 = 136 cards | 1,482 | **10.9 / card** (term + gloss + example) |
| `grammar.ts` | 39 questions | 2,444 | **62.7 / question** (prompt + 4 options + explanation + topic) |
| `writing.ts` | 13 prompts | 1,403 | **107.9 / prompt** (task + 4–5 checklist lines + full model answer) |
| `reading.ts` | 18 passages, 33 questions | 2,841 | **157.8 / passage** (2 paragraphs + glossary + ~2 questions) |
| `listening.ts` | 12 clips | 1,169 | 97.4 / clip |

The CONTEXT's "2,129 words" for `scenario-lessons.ts` is the whole-file count; 1,824 is the
string-contents count. Both are right; the per-scenario figure of ~52 words is the one to
plan against.

## Projection

**CONT-02 — phrases + vocabulary across all 35 scenarios (D-02, lands first):**

| Item | Basis | Words |
|---|---|---|
| Phrases: 26 missing scenarios × 6 phrases × 10.6 w | existing sets average 4.0/scenario; 6 is a defensible floor for "real practice" | **1,654** |
| Phrases: top up the 9 existing sets from 4 to 6 (18 phrases) | | 191 |
| Vocabulary: 35 × 8 cards × 10.9 w | matches the existing deck size exactly (every deck is 8) | **3,052** |
| **CONT-02 subtotal** | 490 new authored items | **≈ 4,900 words** |

**CONT-01 — 52 exercises:**

| Skill | Pairs | Unit assumed | Words each | Subtotal |
|---|---|---|---|---|
| speaking | 30 | already covered by CONT-02's phrases; add a scenario role-play brief / target-language frame ≈ 60 w | 60 | 1,800 |
| grammar | 4 | 5 questions × 62.7 w | 314 | 1,254 |
| writing | 9 | 1 prompt × 107.9 w | 108 | 971 |
| reading | 9 | 1 passage × 157.8 w | 158 | 1,420 |
| **CONT-01 subtotal** | 52 | | | **≈ 5,450 words** |

**Phase total: ≈ 10,300 words of original English content and ≈ 550 discrete authored items.**

Two calibration points make that number legible:

- Phase 2.1 spent **~5,000 words** of original CELPIP content and, per CONTEXT, "consumed a
  full session." **This phase is roughly twice that** — which is what the user was shown and
  accepted when choosing D-01. Under D-02 the split is ~4,900 (CONT-02) + ~5,450 (CONT-01), so
  it is close to two Phase-2.1-sized bodies of work with a natural seam between them.
- The whole existing `src/lib/content/` corpus is ~12,600 words across eight modules. **This
  phase adds ~80% again on top of everything the app has ever shipped.**

## Which skill is most expensive

**Per pair, reading is the most expensive: ~158 words each — 2.5× a grammar question set is
not the comparison; it is 1.5× a writing prompt and 2.6× a speaking brief.** A reading passage
must carry prose that is genuinely readable at its CEFR level, a glossary and questions with
non-guessable distractors, and five of the nine reading pairs sit at B2/C1 where the passage
must be *long enough to be worth reading*. `reading.ts`'s existing C1 items are the longest
things in the repo's content directory.

**But in aggregate the answer is different, and this is the number that should drive
sequencing: speaking dominates.** 30 of 52 pairs are speaking, and CONT-02's phrase authoring
is itself speaking content. Speaking accounts for ~1,850 of CONT-02's 4,900 words and ~1,800
of CONT-01's 5,450 — **roughly 3,650 words, about 35% of the phase**, spread thin across 30
pairs rather than concentrated. Reading is the most expensive *per unit*; speaking is the
largest *total*; grammar is the cheapest total (4 pairs) despite the highest per-question cost.

A useful corollary for D-02's ordering: **CONT-02 buys the most learner value per word**
(4,900 words covers 35/35 scenarios and every one of them starts feeding the SRS), which is
exactly the user's stated rationale, now with a number behind it.

**Confidence: HIGH** on the measured baseline; **MEDIUM** on the projection — the per-unit
costs are real but the assumed units (6 phrases, 8 cards, 5 grammar questions, 1 passage, 1
prompt per pair) are the floors this research recommends, not floors the user has ratified.
If the planner raises any of them the total scales linearly.

---

# §6 — Consistency risk across 52 exercises

CONTEXT names this the failure mode: "Unlike Phase 2.1, there is no external format to
follow." That is true, and it cuts two ways — there is no exam blueprint to copy, and equally
no exam blueprint to catch a drifting author.

**Recommendation: both a typed shape per skill AND a committed content harness. They catch
different failures and the repo has already paid to learn the difference.**

## Why the type alone is not enough

`tsc` proves a passage has a `body` and `questions`. It cannot see that the body is one
sentence long, that the glossary is empty, that two scenarios' phrase sets are byte-identical,
that a question's four options include the answer twice, or that an id was reused. Phase 2.1's
own words: "`tsc` proves a prompt has the right FIELDS and says nothing about whether the bank
covers the exam. A missing task shape, a duplicated id, a scene-description prompt with no
scene, or a rubric item that renders as a blank gap are all type-correct."
(`scripts/verify-celpip-content.mts:33-41`)

The repo has already been bitten by the specific variant that applies here — CONTEXT records
it as an established pattern: *"an author forgets an optional field. Make required anything
the learner needs."*

## The typed-shape half

Copy `CelpipObjectiveQuestion` (`celpip.ts:264-276`) as the model. Its lesson is in what it
makes **required**:

```ts
export interface CelpipObjectiveQuestion {
  id: string;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;   // ← REQUIRED. "Why that option is the answer"
  segmentId?: string;    // ← optional only because it is genuinely absent for most parts
}
```

Applied here, the shapes should make required at minimum: a stable `id`; the Spanish gloss on
anything a Spanish-speaking learner must decode (`Phrase.es` is already required —
`phrases.ts:7`); and an **explanation on every scored item**. Note the existing shapes are
already close: `GrammarQuestion.explain` is required (`grammar.ts:14`) and
`WritingPrompt.checklist`/`model` are required (`writing.ts:15-16`). The gaps to close are
`Phrase.tip` (optional today, `phrases.ts:9`) and `ReadingQuestion`, which has **no
explanation field at all** (`reading.ts:4-8`) — the learner is told they were wrong and never
told why.

A second typed device worth using: a **scenario-keyed record typed against the curriculum**,
so a key that is not a real `"world/scenario"` fails `tsc`. Today `scenario-lessons.ts:12`
types `LESSONS` as a plain `Record<string, ScenarioLesson>` — a typo'd key compiles and
silently falls through to `FALLBACK`. A generated union of the 35 valid keys (or a
`satisfies` clause) turns that class of bug into a compile error. This is cheap and it is the
one type improvement that would have prevented the whole "content exists but is not reachable"
category.

## The harness half

`scripts/verify-celpip-content.mts` is the model and it is explicitly designed to be extended
by parallel plans:

- **1,321 lines, zero dependencies, no test runner** — deliberate, because a runner "would be
  a new dependency needing its own justification" (`verify-celpip-content.mts:9-12`). This
  phase's dependency gate is 11 + 11; the same reasoning applies unchanged.
- **`.mts` with explicit `.ts` import extensions** so `node --experimental-strip-types` loads
  it without a bundler — which is why the content modules must not import React, lucide, or
  `@/`-aliased paths.
- **Shared helpers, then self-contained per-topic groups**: `ok()`, `canon()`, `deepEqual()`,
  `group()`, `filled()` (non-empty after trimming — "a field of spaces renders as a gap and is
  a content defect"), `inRange()`, `duplicates()` (`verify-celpip-content.mts:88-146`).
- **Documented as a low-conflict append target** (`:18-31`) — "one import statement, one new
  section at the bottom" — precisely so parallel plans can each add their skill without
  colliding. A 52-exercise phase will want the same property.
- **The rule when it fails**: "If an assertion here fails, fix the content — never weaken the
  assertion" (`:41`).

There is direct precedent for a *correctness* content assertion here, not just a hygiene one:
the ≤35-word ceiling on listening turns exists because Chrome truncates a long utterance
silently and the learner is stranded (AGENTS.md; gated in `verify-celpip-content.mts`). The
scenario equivalent worth gating:

| Assertion | Failure it catches |
|---|---|
| Every declared pair in `curriculum.ts` either has a bank entry **or** is reported unavailable by the coverage registry | The overclaim CONT-01/D-03 exist to prevent |
| Every scenario key in every bank resolves to a real `"world/scenario"` | Typo'd key silently falls back (the current `LESSONS`/`SETS` hazard) |
| No duplicate ids **within or across** banks | Two SRS items sharing one `box`/`due` |
| No two scenarios share a byte-identical exercise or phrase set | D-01's explicit rejection of shared routing, made mechanical |
| Every scored item's `answer` indexes into `options`; options are distinct | A question with no correct answer, or two |
| Every required prose field is `filled()` | The blank-gap defect |
| Floors met: ≥N phrases, ≥N vocabulary per scenario | Half-authored content passing as done |
| Derived counts equal bank lengths | The registry drifting from the banks — the `verify-celpip-sections.mts` role, 43 assertions |

**One caution from the ledger.** Phase 2.1 twice built a harness and *did not commit it*
because it needed to transpile a component — leaving `HISTORY_SOURCES` and `AudioCheck`'s
escape hatches ungated (WINDOWS.md entries 6 and 9, both still open). The lesson for this
phase: **keep the coverage registry free of React so its harness stays committable.** That is
the same constraint that keeps `celpip.ts` script-loadable, and it is the reason to put the
registry in `src/lib/`, not in a component.

**Confidence: HIGH.** [VERIFIED: `verify-celpip-content.mts` header and helpers read;
`celpip.ts:264-276` read; WINDOWS.md entries 6 and 9 read]

---

## Standard Stack

**No new libraries. The stack for this phase is the repo.**

| Existing asset | Version | Purpose here | Why it is the answer |
|---|---|---|---|
| TypeScript | 5.x (devDep) | The per-skill typed shapes; the drift guards | `progress-schema.ts:525-540` already uses an `Identical<A,B>` compile-time drift guard; the same technique binds a content shape to its consumer |
| `zod` | direct dep | Already validates the progress wire contract | **Not** needed for content — content is compiled in, not received over a wire. Do not add zod validation to content banks; the harness is the right gate |
| `node --experimental-strip-types` | Node 22.14 (verified locally) | Runs the content harness with no runner and no dependency | Four scripts already rely on it |
| `lucide-react` | direct dep | Any new skill/status glyph | Precedent: Phase 2.1 added `Headphones` with zero packages installed |
| Next.js 16 App Router | direct dep | The scenario route is already a server component with `generateStaticParams` | No new routes are required by this phase |

**Installation:** none. `npm ls --depth=0` shape is 11 dependencies
(`@anthropic-ai/sdk`, `@prisma/client`, `bcryptjs`, `lucide-react`, `next`, `next-auth`,
`nodemailer`, `react`, `react-dom`, `stripe`, `zod`) + 11 devDependencies
(`@tailwindcss/postcss`, `@types/bcryptjs`, `@types/node`, `@types/nodemailer`,
`@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `prisma`, `tailwindcss`,
`typescript`). **The phase gate's 11 + 11 must hold.**

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|---|---|---|
| A hand-written `.mts` harness | `vitest` / `node:test` | `node:test` is a built-in and would cost zero packages — but it breaks the established four-script pattern and its runner output is not the `ok()/FAIL` format the other four use. TEST-01 (a real test framework) is explicitly a **v2 backlog item** and deferred by CONTEXT. **Do not open it here.** |
| Content as TS modules | MDX / JSON / a CMS | Would break `node --experimental-strip-types` loading, break the type-level guards, and add a dependency. Rejected. |
| Per-scenario content modules (`src/lib/content/scenarios/social-complaining.ts`) | Extending the existing keyed banks | Genuinely open — CONTEXT calls it Claude's discretion. 35 files is a lot of imports but gives one-scenario-per-file diffs; extending `phrases.ts` keeps one file but grows it from 222 lines to ~700. Precedent leans toward extending the keyed bank for phrases (it already is one) and toward one module per skill for the exercises (`src/lib/celpip/` is one file per set). |

## Package Legitimacy Audit

**This phase installs no external packages.** No registry lookup, no ecosystem verification
and no legitimacy check is required or was performed. Every module named in this document is
already a direct dependency in the committed `package.json` or is first-party source.

| Package | Registry | Verdict | Disposition |
|---|---|---|---|
| *(none)* | — | — | — |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

If any plan in this phase proposes a package, it must justify it explicitly against the
11 + 11 gate and run the legitimacy protocol at that point.

## Architecture Patterns

### System architecture — how a scenario page will resolve content

```
curriculum.ts (WORLDS)                       ← single source of truth: the 52 pairs
        │  "world/scenario" + skills[]
        ▼
scenario-coverage.ts  ── reads ──▶  phrases SETS · vocabulary(per scenario) ·
  (DERIVED registry,                grammar(per scenario) · reading · writing
   no React, script-loadable)              │
        │ available / summary / counts     │ the banks, keyed "world/scenario"
        ├──────────────────────────────────┘
        ▼
 ┌───────────────────────────────┬──────────────────────────────────────┐
 ▼ (server)                      ▼ (client)                             ▼ (client)
world/[slug]/[scenario]/page   ScenarioView                     the four exercise components
 · <title>, description          · pill row (availability-aware)   PronunciationLab · GrammarQuiz
 · JSON-LD `teaches`             · one step per DECLARED skill     single-passage reader · single-prompt desk
   ← only available skills         → exercise  if available                     │
                                   → honest    if not                          │ scored items
                                     "not written yet" panel                   ▼
                                                                    useProgress().recordAttempt(id, ok, {topic, level})
                                                                               │  id = "world/scenario#kind#localId"
                                                                               ▼
                                                     progress.ts persist() ─▶ localStorage + sync queue
                                                                               │
                                                                               ▼
                                                   /api/progress (1 MiB cap) ─▶ Postgres
                                                                               │
                                                       reconcile on load ─▶ mergeProgress (per-entry srs union)
                                                                               │
                                                                               ▼
                                                     REVIEW_SOURCES resolve id → renderable
                                                     ReviewView · ReviewHub · Dashboard counts
```

### Pattern 1: Content keyed `"world/scenario"`, consumed through one accessor

**What:** a module-level `Record<string, T>` keyed by the composite scenario key, plus a
single exported getter.
**When:** every content bank this phase touches.
**Example (the established form):**

```ts
// Source: src/lib/content/scenario-lessons.ts:12, :340-345
const LESSONS: Record<string, ScenarioLesson> = {
  "social/small-talk": { intro: "…", tips: ["…", "…", "…"] },
  // …35 keys
};
export function getScenarioLesson(worldSlug, scenarioSlug): ScenarioLesson {
  return LESSONS[`${worldSlug}/${scenarioSlug}`] ?? FALLBACK;   // ← the part to change
}
```

**The change this phase requires:** the accessor must be able to say "nothing here." Returning
a fallback makes derived coverage impossible (§4). Prefer `T | undefined` and let the caller
render the honest empty state.

### Pattern 2: Availability derived by filtering empties

```ts
// Source: src/lib/celpip.ts:802-806
// Empty groups are dropped, so availability follows the bank's actual
// CONTENTS rather than the mere presence of a source.
const groups = (source?.groups ?? []).filter((g) => g.items.length > 0);
const available = groups.length > 0;
```

### Pattern 3: Scored item → SRS, via the one funnel

```ts
// Source: src/components/practice/GrammarQuiz.tsx:38-43
recordAttempt(q.id, isRight, { topic: q.topic, level: q.level, chosen: idx });
addSkillXp("grammar", isRight ? 10 : 2);
```

For a scenario item the only change is the id: `` `${world}/${scenario}#grammar#${item.id}` ``,
with `topic` chosen so it lands meaningfully in `weakTopics()`.

### Pattern 4: The committed, zero-dependency verification script

```ts
// Source: scripts/verify-celpip-content.mts:90-96,121-125
function ok(label: string, condition: boolean, detail?: string) { … }
function filled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
```

### Anti-Patterns to Avoid

- **A silent fallback inside a content accessor.** `getPhrases` (`phrases.ts:102-108`) is the
  live example: it makes the app *look* complete and makes honest coverage unbuildable. It is
  the direct cause of stub B.
- **Adding a field to `SrsItem`.** The `{box, due}` pair merges as a unit
  (`progress-merge.ts:429-431`). Metadata goes in the id.
- **A second whole-field-selected map alongside `vocab`.** `progress-schema.ts:200-211,283-293`
  explains at length that a second map riding the single `updatedAt` instant resurrects
  deleted data. Append-only or per-entry-merged maps only.
- **Deriving an item id from its array index.** Inserting one phrase silently rewrites the
  learner's schedule for every later phrase.
- **Putting React or lucide in the coverage registry.** It makes the harness un-committable,
  which is exactly how WINDOWS.md entries 6 and 9 happened.
- **Hard-coding a coverage claim.** `tsc` is perfectly happy with `available: true`
  (`02.1-02-SUMMARY.md`, "Rule 2 deviation").
- **Resolving due SRS ids through a single bank.** `ReviewView.tsx:17` is the current form and
  it will silently swallow every scenario item.

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Spaced repetition scheduling | A per-scenario schedule, a second box ladder, a "scenario SRS" | `recordAttempt` + `BOX_DAYS` (`progress.ts:39,317-345`) | It is written, merged, validated and shipping. A second scheduler is a second thing the merge must reconcile. |
| Cross-device conflict resolution for new items | Any bespoke last-write-wins for scenario progress | `mergeProgress`'s `unionRecord(srs, mergeSrsItem)` (`progress-merge.ts:619`) | 6,994 assertions and two documented associativity counterexamples stand behind it. |
| Validating stored progress | A new parser for the widened state | `safeReadProgress` / `progressSchema` (`progress-schema.ts:479-517`) | Already lenient-on-read, strict-on-shape, per-entry-dropping, prototype-safe. No schema change is needed to add SRS keys. |
| Coverage / "what is done" reporting | A hand-maintained checklist, a `complete: true` flag | A derived registry in the shape of `section()` (`celpip.ts:795-819`) | Proven un-overclaimable by a control mutation. |
| A test runner for content | `vitest`, `jest` | An appended group in the existing `.mts` harness style | Zero dependencies; the 11 + 11 gate; TEST-01 is deferred v2. |
| Speech synthesis / recognition | Anything | `PronunciationLab`'s existing Web Speech usage (`PronunciationLab.tsx:61-97`) | Already SSR-safe with feature detection and a graceful unsupported branch. |
| Icons | Custom SVG | `lucide-react`, already a dependency | Precedent set in 02.1-02. |

**Key insight:** this phase's technical risk is not in what it builds — it is in the three
*existing* pieces of plumbing it must extend without breaking (the accessor fallbacks, the
review-surface bank filter, and the merge's per-entry discipline). Everything else is prose.

## Common Pitfalls

### Pitfall 1: Authoring content that never becomes visible

**What goes wrong:** phrases and vocabulary are written for all 35 scenarios, stored in
`state.srs` correctly, merged correctly — and the learner never sees a single one in the
review flow, because `ReviewView.tsx:17` resolves due ids through `GRAMMAR_QUESTIONS` only.
**Why:** the review surface was written when grammar was the only SRS producer, and
`Dashboard.tsx:35-36` documents the orphan-filtering intent that led to it.
**How to avoid:** widen the review resolution **in the CONT-02 wave, before or alongside the
first authored batch** — not after. A `REVIEW_SOURCES` array in the shape of
`HISTORY_SOURCES`.
**Warning signs:** `seenCount` (`progress.ts:416`, unfiltered) diverges from the Dashboard's
`dueCount` (filtered) — the two already read the same map through different lenses.

### Pitfall 2: Ids that move when content is edited

**What goes wrong:** an author inserts a phrase at position 2; every SRS key from 2 onward now
points at a different sentence. The learner's box-5 item is silently a different phrase, and
the merge cannot detect it.
**Why:** `Phrase`, `ReadingQuestion` and checklist entries have no `id` field today.
**How to avoid:** authored `id` on every SRS-bearing item, and a harness assertion that ids
are unique and stable.
**Warning signs:** any `map((_, i) => …)` producing a persisted key.

### Pitfall 3: Coverage that overclaims because the accessor cannot fail

**What goes wrong:** the registry reports 35/35 scenarios covered because `getPhrases` never
returns empty.
**How to avoid:** derive from `SETS`, not from the accessor; remove or explicitly gate the
fallback; add the control assertion Phase 2.1 used — *a bank that exists but is empty must
still report unavailable*.
**Warning signs:** a coverage number that does not change when you empty a bank.

### Pitfall 4: `teaches` and the page description keep overclaiming

**What goes wrong:** the JSON-LD at `world/[slug]/[scenario]/page.tsx:55` tells Google the
page teaches Writing for all nine writing pairs while none renders. This is live in production
today and is an SEO-visible overclaim.
**How to avoid:** derive `teaches` and the description from the coverage registry, as
02.1-02 did for `/celpip` (T-02.1-10).

### Pitfall 5: Growing `vocab` and then losing it whole

**What goes wrong:** scenario vocabulary is pushed into `state.vocab`; the map grows from 136
to ~420 keys; a reconcile selects the *other* side's map and 420 marks disappear at once.
**Why:** `vocab` is the one field with a real delete site and is therefore selected whole
(`progress-merge.ts:558-594,620`).
**How to avoid:** put scenario vocabulary in `srs` (per-entry union) rather than `vocab`.

### Pitfall 6: Two scenarios ending up with the same exercise

**What goes wrong:** under time pressure, an author copies a passage or a phrase set between
two related scenarios. D-01 explicitly rejected shared routing; a copy-paste is the same
outcome by another route.
**How to avoid:** a harness assertion on byte-identical exercises and phrase sets across
scenarios. Cheap to write, and it is the one assertion that mechanises D-01.

### Pitfall 7: The `phrases.ts` blast radius

**What goes wrong:** removing the `getPhrases` fallback breaks `SPEAKING_PACKS`
(`phrases.ts:129-175`) and `SkillPractice.tsx:15-19`, which build the global `/skill/speaking`
page out of `getPhrases` calls.
**How to avoid:** decide the accessor's contract before authoring, and treat those two call
sites as part of the same change.

### Pitfall 8: Editing content retroactively changes a learner's history

**What goes wrong:** an item is reworded; its stored `attempts` entry still carries the old
`topic`, and `mergeAttemptStat` selects `topic`/`level`/`resolved` as a group from the
later-day side (`progress-merge.ts:411-426`).
**How to avoid:** treat authored `topic` strings as stable identifiers, not prose. The CELPIP
banks solve the same problem by storing `correct`/`total` on the attempt rather than
recomputing them (`progress-schema.ts:222-227`) — "a later edit to a set must not
retroactively change a result she already saw."

## Runtime State Inventory

*Not a rename/refactor/migration phase — but this phase does write new keys into a live
production database column, so the two categories that matter are recorded rather than
skipped.*

| Category | Items found | Action required |
|---|---|---|
| Stored data | `User.progress` (Postgres JSON, live — the beta user has real history). New `srs`/`attempts` keys are **additive**; `sanitizedRecord` drops nothing it does not recognise and the schema needs no change. No existing key is renamed or removed. | None — but no plan may rename an existing SRS id, because a rename orphans a live entry with no migration path. |
| Stored data | `localStorage` `fluentpath:progress:v2` (`progress.ts:36`) and `fluentpath:writing:${promptId}` (`WritingDesk.tsx:22`) | The writing draft keys are outside the Phase 2 contract; scoping them per scenario changes the key and abandons any existing draft. Low stakes, but say so rather than discover it. |
| Live service config | None. No n8n workflow, Datadog dashboard, Tailscale ACL or Cloudflare tunnel references scenario content. | None. |
| OS-registered state | None. | None. |
| Secrets / env vars | `ANTHROPIC_API_KEY` gates the tutor stub (`api/tutor/route.ts:53`) — **Phase 5's concern**, unchanged here. | None. |
| Build artifacts | Content is bundled; `generateStaticParams` pre-renders all 35 scenario routes (`world/[slug]/[scenario]/page.tsx:8-12`). New content requires a rebuild, which the deploy already does. | None. |

## Validation Architecture

`.planning/config.json` contains only `workflow._auto_chain_active`; `nyquist_validation` is
absent, so this section is included.

### Test Framework

| Property | Value |
|---|---|
| Framework | **None.** No test runner is installed (11 devDeps, none of them a runner). Validation is five hand-written `.mts` scripts run under `node --experimental-strip-types`. |
| Config file | none — see Wave 0 |
| Quick run command | `npx tsc --noEmit` (seconds; catches every shape/drift error) |
| Full suite command | `npx tsc --noEmit && npm run lint && npm run build && for s in merge schema queue headers celpip-sections celpip-content celpip-speech; do node --experimental-strip-types scripts/verify-$s.mts \|\| exit 1; done` |

Existing baselines to hold (from `02.1-02-SUMMARY.md`): `verify-merge` 6994, `verify-schema`
197, `verify-queue` 173, `verify-headers` 24, `verify-celpip-sections` 43.

### Phase Requirements → Test Map

| Req | Behavior | Test type | Automated command | File exists? |
|---|---|---|---|---|
| CONT-01 | Every declared pair either has a non-empty bank entry or is reported unavailable | content assertion | `node --experimental-strip-types scripts/verify-scenario-content.mts` | ❌ Wave 0 |
| CONT-01 | No two scenarios share a byte-identical exercise (D-01) | content assertion | same | ❌ Wave 0 |
| CONT-01 | Every scenario key in every bank resolves to a real `"world/scenario"` | content assertion | same | ❌ Wave 0 |
| CONT-01 | Coverage is derived, not declared — an emptied bank flips to unavailable (control mutation) | content assertion | same | ❌ Wave 0 |
| CONT-01 | Every required prose field is non-empty after trimming | content assertion | same | ❌ Wave 0 |
| CONT-02 | Every scenario has ≥N phrases and ≥N vocabulary items | content assertion | same | ❌ Wave 0 |
| CONT-02 | Every SRS-bearing item has a unique, stable, namespaced id; no cross-bank collision | content assertion | same | ❌ Wave 0 |
| CONT-02 | The merge stays idempotent/commutative/associative with scenario-shaped ids | merge assertion | `node --experimental-strip-types scripts/verify-merge.mts` | ✅ exists — **append a group** with scenario-shaped keys |
| CONT-02 | A widened `state.srs` still round-trips the wire contract | schema assertion | `node --experimental-strip-types scripts/verify-schema.mts` | ✅ exists |
| CONT-02 | A due scenario item resolves and renders in the review flow | render behaviour | **none available** — the repo has no component test harness | ❌ manual / browser |
| ROADMAP #3 | A scenario grammar mistake surfaces in weak topics | behaviour | inherited free from `GrammarQuiz` + `weakTopics()`; assert the authored `topic` strings are non-empty and stable | ❌ Wave 0 (partial) |
| all | Type shapes and drift guards | compile | `npx tsc --noEmit` | ✅ |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` + the phase's own
  `verify-scenario-content.mts`
- **Per wave merge:** full suite above, all baselines held
- **Phase gate:** full suite green + `npm run build` + dependency count still 11 + 11, before
  `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `scripts/verify-scenario-content.mts` — the new harness; covers CONT-01 and CONT-02's
      content half. Model it on `verify-celpip-content.mts`'s header, helpers and
      low-conflict-append structure.
- [ ] The coverage registry must be **React-free** so the above can load it. Design
      constraint, not a file.
- [ ] An appended group in `scripts/verify-merge.mts` exercising scenario-shaped SRS keys.
- [ ] **No component render harness exists and none should be built here** — Phase 2.1 twice
      built one and could not commit it (WINDOWS.md 6, 9). The review-flow rendering check is
      a browser check, and the plan should say so honestly rather than pretend to automate it.

## Security Domain

`security_enforcement` is not set in `.planning/config.json`, so it is enabled. This phase's
attack surface is narrow — it authors static content and widens an existing client-side store
— but two categories are live.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard control |
|---|---|---|
| V2 Authentication | no | Untouched. |
| V3 Session Management | no | Untouched. |
| V4 Access Control | no | Scenario content is public and free by design. |
| V5 Input Validation | **yes** | The widened `srs`/`attempts` maps arrive over `/api/progress` from a client. Already covered: `progressSchema` strips unknown keys, `sanitizedRecord` drops malformed entries and blocks `__proto__`/`constructor`/`prototype` (`progress-schema.ts:400,411-437`), and the 1 MiB body cap bounds growth (`api/progress/route.ts:36,126-132`). **No new validation is needed — but nothing may weaken these.** |
| V6 Cryptography | no | Nothing added. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation | Status here |
|---|---|---|---|
| Prototype pollution via attacker-chosen record keys | Tampering | `POISONED_KEYS` skip-lists in both the schema and the merge, with results built by explicit assignment into a fresh object, never by spreading input | **Already mitigated** (`progress-schema.ts:400,411-420`, `progress-merge.ts:222`). Namespaced scenario ids do not weaken it. |
| Unbounded blob growth (storage exhaustion) | DoS | 1 MiB cap on both declared and actual body length; counters capped at `MAX_COUNT` | **Already mitigated.** §3 measures the worst realistic case at 19% of the cap. |
| XSS via authored content rendered into HTML | Tampering | React escapes by default; no `dangerouslySetInnerHTML` anywhere in the practice components read this session | **Holds — do not introduce one.** Note the 02.1-09 precedent: a landing summary must be assembled from *shapes and counts*, never from passage text, "so a summary assembled from the text would put authored prose — and, one careless edit later, an answer — into the served document" (`celpip.ts:775-778`). The same applies to any scenario coverage summary. |
| Answer leakage into the served payload | Info disclosure | Phase 2.1's precedent: answers must not reach the RSC payload before the learner submits | **Applies to new reading/grammar exercises.** The existing components hold answers client-side and reveal on submit; a new scenario exercise must not regress this. `ListeningPlayer`'s RSC-payload leak is committed-gated at the route boundary (WINDOWS.md 11) — worth reading before writing a new exercise route. |
| Supply chain | Tampering | Zero packages installed | **Held at 11 + 11.** |

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | build, harnesses (`--experimental-strip-types`) | ✓ | v22.14.0 | — |
| `npm` scripts (`dev`/`build`/`lint`) | verification | ✓ | in `package.json` | — |
| `node_modules/next/dist/docs/` | AGENTS.md mandate | ✓ | present (`01-app/`, `02-pages/`, `03-architecture/`, `04-community/`, `index.md`) | — |
| Web Speech API (`speechSynthesis`, `SpeechRecognition`) | speaking practice | ✓ in Chrome/Edge desktop | — | Already handled: `PronunciationLab.tsx:51-59,202-206` feature-detects and renders an explicit unsupported message |
| Browser for UAT | review-flow rendering, hydration | **✗ in the agent session** | — | **No fallback.** WINDOWS.md holds 20 open entries, most of them `unrun-verify` from exactly this gap. The plan should schedule a browser pass rather than assume one. |
| Postgres / `DATABASE_URL` | end-to-end sync check | not verified this session | — | `scripts/audit-stored-progress.mts` exists and is read-only if a production check is wanted |

**Missing dependencies with no fallback:** a real browser for the CONT-02 review-flow check
and any hydration check on a changed `ScenarioView`.

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | 6 phrases and 8 vocabulary items per scenario is the right floor for "real" scenario-specific content | §5 | The whole cost projection scales linearly with these. The 8 matches every existing deck exactly; the 6 is a judgement above the current 4.0 average. **This is a number the user should ratify before authoring starts.** |
| A2 | A scenario grammar pair needs ~5 questions, and a reading/writing pair needs 1 passage/prompt | §5 | Same linear effect. `GrammarQuiz` shows a score out of N (`GrammarQuiz.tsx:63-70`), so a 1-question quiz reads oddly; 5 is a guess at the minimum that feels like practice. |
| A3 | A speaking pair needs ~60 words of scenario framing beyond its phrases | §5 | If speaking pairs need a full role-play script instead, speaking's share grows sharply — and it is already ~35% of the phase. |
| A4 | Scenario vocabulary belongs in `srs` rather than `vocab` | §3 | If the planner or user wants the flashcard "known" semantics instead, CONT-02's "feeds the SRS review queue" is only half met and the whole-map merge risk in Pitfall 5 becomes live. |
| A5 | Nothing in the existing global banks can be honestly re-keyed to a scenario at meaningful volume | §5 (cost assumes all-new authoring) | CONTEXT explicitly leaves reuse open as discretion. Some genuinely fits — `reading.ts`'s "A Day at the Market" is plausibly `travel/shopping`, `writing.ts`'s "complaint" is plausibly `social/complaining`. A reuse audit could plausibly shave 10–15% off the projection. **Not performed — it requires editorial judgement per item and would be its own task.** |
| A6 | ~10,300 words is comparable to "two Phase 2.1s" | §5 | Phase 2.1's ~5,000 is quoted from CONTEXT, not re-measured from its banks this session. |
| A7 | No test runner should be introduced | Standard Stack | If the planner disagrees, `node:test` is a built-in and would cost zero packages — but it breaks the established pattern and TEST-01 is deferred. |

## Open Questions

1. **Do phrases and vocabulary live in one module per scenario, or extend the keyed banks?**
   - Known: `phrases.ts` is already a keyed bank with 9 entries; `src/lib/celpip/` uses one
     file per set; `scenario-lessons.ts` puts 35 scenarios in one 345-line file.
   - Unclear: at 35 scenarios × (phrases + vocabulary), one file is ~700–900 lines.
   - Recommendation: **extend `phrases.ts` in place** (it is already the right shape and the
     accessor is already written), and give vocabulary its own new scenario-keyed module
     rather than bending `VOCAB_DECKS`, whose ids are `deckId:index` and whose consumer is a
     deck browser. Split into per-world files only if a single file exceeds ~800 lines.

2. **What exactly does an incomplete pair render?** (CONTEXT: Claude's discretion, D-03: must
   be honest.)
   - Known: the repo's one precedent is `CelpipTabs.tsx:43` — a disabled pill with
     `aria-disabled` and the words "Not yet available."
   - Unclear: on a scenario page the learner has arrived *for* that practice, so a disabled
     pill may be too quiet.
   - Recommendation: a named panel per unwritten skill ("Writing practice for this scenario
     isn't written yet") with a link to the global `/skill/writing`, so the fallback is offered
     **as what it is** rather than presented as scenario practice. That satisfies D-03 while
     still giving the learner somewhere to go.

3. **Should `getPhrases`'s world fallback be deleted or kept behind an explicit flag?**
   - Known: it is the direct cause of stub B, and two other call sites depend on it
     (`phrases.ts:129-175`, `SkillPractice.tsx:15-19`).
   - Recommendation: keep `WORLD_FALLBACK` as data for the *global* speaking page, but make
     the scenario path read `SETS` directly so coverage can be derived. That is a smaller
     blast radius than deleting it.

4. **Does the review surface widening land in this phase or is it its own slice?**
   - Known: CONT-02's ROADMAP criterion 2 cannot pass without it.
   - Recommendation: **in this phase, in the CONT-02 wave, before the bulk authoring** — it is
     the cheapest possible time to discover the resolution shape is wrong, and D-02's whole
     rationale is that authored phrases start feeding the loop immediately.

5. **Is the 1 MiB cap worth raising pre-emptively?**
   - Known: measured worst case is 19% of the cap; a 413 is a permanent drop
     (`sync-queue.ts:304-305`).
   - Recommendation: **no.** Leave it. Note it in the phase summary as the first phase where
     the number stops being theoretical.

6. **Not verified this session:** whether any production `User.progress` row would behave
   unexpectedly with a much larger `srs` map. `scripts/audit-stored-progress.mts` exists and is
   read-only, but requires `DATABASE_URL` and was not run. **Flagged rather than assumed.**

7. **Not verified this session:** nothing in this document has been observed in a browser. All
   render claims are read from source. Given 20 open `unrun-verify` ledger entries, the plan
   should treat a browser pass as a real task and not a formality.

## Sources

### Primary (HIGH confidence — first-party source read this session)

- `src/lib/curriculum.ts` — the 35 scenarios, `Skill` union, 52 pairs (counts re-derived by script)
- `src/components/ScenarioView.tsx` — read in full; the CONT-01 trace
- `src/app/(catalog)/world/[slug]/[scenario]/page.tsx`, `src/app/(catalog)/skill/[skill]/page.tsx`
- `src/lib/content/{phrases,scenario-lessons,vocabulary,grammar,reading,writing,listening,sentences}.ts`
- `src/components/practice/{PronunciationLab,SkillPractice,GrammarQuiz,TypeAnswer,ReadingRoom,WritingDesk,VocabularyView,ReviewView,ReviewHub,SpeakingWorkspace}.tsx`, `src/components/Dashboard.tsx`
- `src/lib/progress.ts`, `src/lib/progress-schema.ts`, `src/lib/progress-merge.ts`
- `src/app/api/progress/route.ts`, `src/lib/sync-queue.ts` (cap and 413 handling)
- `src/lib/celpip.ts:264-276,693-876` — the derived-coverage registry
- `scripts/verify-celpip-content.mts:1-146` — the harness pattern
- `.planning/phases/02.1-celpip-remaining-skills/02.1-02-SUMMARY.md` — read in full
- `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` §"Phase 3", `.planning/WINDOWS.md`, `AGENTS.md`, `package.json`

### Secondary (MEDIUM confidence — derived by measurement this session)

- Word/item counts per bank, and the 52 / 30 / 9 / 9 / 4 pair split — computed by script over
  the committed sources
- Progress payload sizes at five saturation levels — computed by `JSON.stringify` +
  `Buffer.byteLength` over states built to the real shapes

### Tertiary (LOW confidence)

- None. No web search was performed and none was needed: this phase has no external
  technology domain, no new dependency, and no third-party API. Every claim above is either
  cited to a repo file:line or explicitly listed in the Assumptions Log.

## Metadata

**Confidence breakdown:**

- Existing code behaviour (§1, §2, §3, §4, §6): **HIGH** — every claim cited to a line read
  this session; the three counts CONTEXT supplied were independently re-derived and match
  exactly (35 scenarios, 52 pairs, 9/35 with own phrases).
- Payload sizing (§3): **HIGH** — measured, not estimated.
- Per-unit authoring costs (§5): **HIGH** — measured over the committed banks.
- Total authoring projection (§5): **MEDIUM** — sound arithmetic over assumed per-pair floors
  (A1–A3, A5). Ratify the floors and it becomes HIGH.
- Recommended registry shape (§4) and review-source shape (§3): **MEDIUM** — direct structural
  transfers from a proven in-repo pattern, but sketches for the planner rather than
  specifications.

**Research date:** 2026-07-31
**Valid until:** ~30 days, or until any of `phrases.ts`, `progress-merge.ts`,
`ScenarioView.tsx` or `celpip.ts` changes — the cited line numbers are the perishable part.
