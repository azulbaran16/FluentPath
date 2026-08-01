---
phase: 03-every-scenario-practicable
plan: 10
subsystem: scenario-content
tags: [content, cont-01, speaking, coverage, derived-ui, mutation-testing, corpus-scan, phase-closing]
status: complete
requires:
  - src/lib/content/scenario-speaking.ts (ScenarioSpeakingTask, the BANK, lazy composition — plan 03-09)
  - src/components/practice/SpeakingTaskPanel.tsx (the renderer, unchanged by this plan — 03-09)
  - src/lib/review-items.ts (scenarioItemId, the "speaking" unscheduled kind — 03-09)
  - src/lib/scenario-coverage.ts (EXERCISE_SOURCES, pendingPairs, COVERAGE_TOTALS — 03-01)
  - scripts/verify-scenario-content.mts (eight speaking groups — 03-09)
  - .planning/phases/03-every-scenario-practicable/03-09-SUMMARY.md (the shape, the XP rule, the floors)
provides:
  - "src/lib/content/scenario-speaking.ts — the last SIXTEEN rehearsal tasks; 30/30 speaking, 52/52 pairs"
  - "CONT-01 closed: every declared pair in all six worlds has its own exercise"
affects:
  - "src/app/(catalog)/skill/[skill]/page.tsx (speaking now reads 30 of 30, derived — zero badges)"
  - src/components/ScenarioView.tsx (the last sixteen header pills stop being muted, derived)
  - .planning/REQUIREMENTS.md (CONT-01 ticked, after the predicate was asserted)
tech-stack:
  added: []
  patterns:
    - "assert the closure predicate BEFORE ticking the requirement, never after"
    - "run the plan's own authoring promise as a SCRIPT — scan 4 found two same-page echoes rereading did not"
    - "a mutation that survives may be a WEAK MUTATION, not a weak assertion — diagnose before hardening"
    - "the last plan in a phase is the one place a GLOBAL total is the right assertion"
key-files:
  created: []
  modified:
    - src/lib/content/scenario-speaking.ts
decisions:
  - "CONT-01 was ticked HERE, and only after `pairsWritten === 52 && pairsTotal === 52 && pendingPairs().length === 0` was asserted in a separate command whose output was read. Four earlier plans caught this tool ticking at partial coverage"
  - "Two rehearsals were REWRITTEN after shipping because scan 4 found them echoing their OWN scenario's other exercise — travel/hotel's setup against its vocabulary deck, practical/tech-support's move against its 03-06 writing task, checklist AND briefing. Byte-identity cannot see either"
  - "M21 (adding \"speaking\" to SCHEDULED_ITEM_KINDS) SURVIVED and was kept as a declared survivor: the guard is defence in depth, exactly as review-items.ts's own comment claims. Two replacement mutations that do reach the negatives were added rather than the survivor being deleted"
  - "The id-uniqueness assertion is structurally satisfied by scenario-key uniqueness and cannot be falsified from the DATA — reported as a declared limit of its label, in the spirit of 03-08's WINDOWS 39 and 03-09's tautological id assertion"
  - "`native/register`'s rehearsal deliberately takes a DIFFERENT message from its 03-06 writing task (a chase-up, not the cancelled workshop) and turns on audible markers — pace, discourse markers, the date said in full — rather than the checklist's contraction and phrasal-verb counts"
  - "Sounding Native's five are authored at their declared levels only. CONT-04's deeper native-level treatment remains Phase 4"
metrics:
  duration: ~85min
  tasks: 2
  commits: 3
  completed: 2026-08-01
---

# Phase 3 Plan 10: The Last Sixteen, and CONT-01 Closes Summary

The sixteen scenarios that had never had a speaking exercise written for them — every one of
Travel & Errands, every one of Practical Life, every one of Sounding Native — now open a rehearsal
written for their own situation. **The coverage registry reads 52 of 52 because the four banks hold
fifty-two exercises**, and `/skill/speaking` reads *30 of the 30* with no badge on any scenario.
CONT-01's content is complete.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `7dfae26` | Travel & Errands ×6 and Practical Life ×5 — eleven rehearsals, 25 of 30 |
| 2 | `be30dcc` | Sounding Native ×5 — the last five; 52/52 pairs, 0 pending, 35/35 scenarios complete |
| — | `5e83a9c` | Two rehearsals reworded after **my own scan** caught them echoing their scenario's other exercise (see Deviations) |

**Registry on completion: 52/52 pairs written · 0 pending · 35/35 phrases · 35/35 vocabulary ·
35/35 scenarios complete.** Per-skill pending: grammar 0, writing 0, reading 0, **speaking 16 → 0**.

The corpus is now **30 tasks, 90 moves, 30 success lines, 2,333 authored words**. This plan wrote
**16 tasks, 48 moves, 1,302 words** — mean **81.4**, range **76–86**.

---

## 1. The sixteen, and what each was written to do

Every scenario's briefing, phrase set and vocabulary deck was read before authoring, and where the
scenario also declares writing its 03-06 task was read too, so the rehearsal could be the half a
written brief cannot reach.

### Travel & Errands — the world where D-01's failure was most visible

All six used to be handed the same three generic lines. Three are **A2**, and A2 is where a task
drifts upward fastest: these moves are produceable in short sentences by someone at a counter with
a queue behind her.

| Scenario | Level | The rehearsal |
|---|---|---|
| `travel/airport` | A2 | The connection you just lost. Flight number **first**, then the two questions that matter, then the new time and gate **said back** before moving away |
| `travel/hotel` | B1 | The 03-06 writing task is the message sent *before* arrival. This is the desk, live: describe the **difference** rather than your mood, ask what else is free, and if nothing is, get one thing and a time |
| `travel/restaurant` | A2 | Say “allergic” **before** you order, not after. The success line is that nobody else at the table had to say it for you |
| `travel/directions` | A2 | The failure case, not the ideal one: when you did not follow it, **ask them to point** and say the first turn back |
| `travel/emergencies` | B1 | A pharmacy, where you cannot control the pace. Symptom and date before the request, and the dose **written down rather than remembered** |
| `travel/shopping` | B1 | Name **one** outcome — exchange or money back — instead of waiting to be offered one, and end a refusal with a person and a day |

### Practical Life — two scenarios where she cannot see the other person

`phone-calls` and `tech-support` share the difficulty the plan named, and each has one move about
**getting something repeated or confirmed** rather than about producing more language.

| Scenario | Level | The rehearsal |
|---|---|---|
| `practical/phone-calls` | B1 | A bad line. **Stop them at the word you lost, not at the end of the sentence** — and read the price and day back as numbers before hanging up |
| `practical/tech-support` | B1 | The 03-06 writing task is the ticket a stranger must reproduce. This is the third call: give the **pattern** first, get ahead of the script, leave with a reference number |
| `practical/housing` | B2 | Twenty minutes, an agent in a hurry. The two questions photographs cannot answer, who pays for repairs, and **what would make them pick somebody else** |
| `practical/banking` | B1 | Three facts before any opinion, then the two things nobody remembers to ask: how many days, and whose job it is to stop the card |
| `practical/appointments` | A2 | Cancel by naming the old day and time, then say the new one back. Under a minute |

### Sounding Native — the last five, at their declared levels

The boundary held: **CONT-04's deeper native-level treatment is Phase 4's.** These five are the same
shape as the other twenty-five.

| Scenario | Level | The rehearsal |
|---|---|---|
| `native/idioms` | C1 | Answer straight first with **no** idiom, then let two do work a plain sentence would do worse — and say the turn again without them to hear which parts got weaker |
| `native/phrasal-verbs` | B2 | The same fact said twice, once with the phrasal verb and once with its single-word twin, then **name the listener each version belongs to** |
| `native/pronunciation` | B2 | **Not a tongue-twister.** The warm-up already drills those six, and nobody has ever needed to say “red lorry, yellow lorry” to a human. This is a voicemail somebody will write down: word stress, connected speech, and slowing only the parts going onto paper |
| `native/register` | C1 | One chase-up said to a colleague and to an agency, then **three changes named — and “more polite” is not allowed to be one of them.** A different message from the 03-06 writing task's cancelled workshop, and judged on markers a listener can *hear* |
| `native/culture` | C1 | React to the **point** first so the conversation does not stop, ask in one short question, do not apologise for not knowing, and give something back |

### The two authoring constraints, held

**A move states what a successful turn DOES and is checkable by looking.** “Say the new time and the
new gate back to the agent” can be ticked honestly; “speak clearly” cannot. Until the tutor lands in
Phase 5 her own judgement is the whole feedback loop.

**The word budget is gated, not intended.** The harness asserts 40–100 words for setup + moves +
success. My sixteen run **76–86, mean 81.4** — measurably longer than 03-09's 66–80/73.6, and the
gap is real rather than a rounding artefact. Nine of my drafts came in at 85–101 and were cut back
before Task 1's commit; `practical/phone-calls` **breached the 100-word ceiling at 101** in draft and
was rewritten to 82. I did not force the last five words out of the rest, because trimming past this
point was costing the concrete detail (a day, an amount, a number of people) that makes a setup a
situation rather than a category.

---

## Deviations from Plan

**Three, all recorded.**

### 1. [Rule 1 — bug in shipped content] Two rehearsals echoed their own scenario's other exercise

- **Found during:** the corpus scans, after both tasks had been committed — by **running the
  authoring promise as a script**, exactly as the plan instructed and as three plans before me found
  their own content lying about itself.
- **Issue:** scan 4 (four-word runs shared between a rehearsal and any other authored text in the
  phase) returned **seven** runs, and five of them were mine:

  | Run | The rehearsal | Where else the learner meets it |
  |---|---|---|
  | `booked a double room` / `a double room with` / `double room with a` | `travel/hotel` setup | its **own vocabulary deck**: *“We booked a double room with a balcony.”* |
  | `what you have already` / `you have already tried` | `practical/tech-support` move 2 | its **own 03-06 writing task**, its **checklist** (*“At least two things you have already tried”*) **and its briefing** |

  Both are same-page collisions: the learner opens `/world/travel/hotel` and meets an eight-word
  sentence stem twice, and `/world/practical/tech-support` repeats one phrase across four surfaces.
  **The harness cannot catch either** — it compares byte-identity of whole fields, and these are
  near-duplicates across different namespaces.
- **Fix:** `travel/hotel`'s setup became *“Your confirmation says a quiet room at the back. The card
  opens one beside the lift, above the kitchen”*, and `practical/tech-support`'s move became *“Get
  ahead of the script: name what you already did, so they can skip those pages”* — which is also a
  better move, because it names the spoken advantage (cutting the script off) rather than restating
  the written brief.
- **Verified:** scan 4 re-run → **2 shared runs, both pre-existing in `work/feedback` (03-09's) and
  both already adjudicated by that plan. Zero from my sixteen.**
- **Files modified:** `src/lib/content/scenario-speaking.ts` · **Commit:** `5e83a9c`

### 2. [Rule 2 — missing critical verification] A mutation survived, and it was the MUTATION that was weak

- **Found during:** the first mutation sweep. **M21** — `"speaking"` added to `SCHEDULED_ITEM_KINDS`
  — **survived**, and so did **M8-under** (the word-budget floor).
- **M8-under** was simply too small: the shortest task in the corpus is 66 words, so gutting a
  22-word setup still left ~55 and never reached the 40-word floor. Rewritten as a **four-edit
  case** that shrinks the setup and all three moves; it now fires.
- **M21 is the interesting one, and it was kept as a declared survivor.** `reviewableIds()` does not
  derive from `SCHEDULED_ITEM_KINDS` at all — it enumerates the grammar and recall banks directly —
  and past the guard `resolveReviewItem`'s recall lookup misses a speaking id anyway. So removing the
  guard changes no observable behaviour today. **That is exactly what `review-items.ts`'s own comment
  claims** (*“Falling through to the recall lookup below would also return undefined — by accident,
  and one added kind away from silently resolving to the wrong thing”*), so the mutation confirms the
  source rather than indicting it. **The survivor was kept and reported; two replacements that do
  reach the negatives were added:** `M21a` smuggles a composed speaking id into `reviewableIds()`'s
  return (caught), and `M21b` makes `resolveReviewItem` resolve speaking ids to a recall card
  (caught). 03-09's decision is still enforced, now at three points rather than two.
- **Why this is written down:** the reflex on a surviving mutation is to harden the assertion.
  Twice here that would have been wrong — the assertion was fine and the mutation was not a real
  regression. **Diagnose before hardening.**

### 3. [Rule 1 — stale documentation] The bank's header said the wrong number

- `scenario-speaking.ts`'s module header read *“fourteen more tasks land in plan 03-10”*. Sixteen
  did. Corrected to name both plans and both counts, in `be30dcc`.

**Not a deviation, but the thing this plan exists to get right: CONT-01 was ticked, and the
predicate was asserted first.** `pairsWritten === 52 && pairsTotal === 52 && pendingPairs().length
=== 0` was evaluated in its own command and its output read (`PREDICATE TRUE: pairsWritten=52
pairsTotal=52 pending=0`) **before** `requirements mark-complete CONT-01` was run. Four plans have
now caught that tool ticking “every scenario/pair” requirements at partial coverage; this is the
first plan where ticking was actually correct, and it was still checked rather than assumed.

---

## Verification Results

**Every `<verify>` block in the plan was run. All passed.**

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **7511** assertions passed · 35/35 · 35/35 · **47/52** |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| the pending-pairs gate | `25 of 30 speaking pairs written; only Sounding Native remains` — 5 speaking pending, every pending pair `native/*` |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **7601** assertions passed · 35/35 · 35/35 · **52/52 (0 pending)** |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| the closing gate | `CONT-01 closed: 52/52 pairs, 35/35 scenarios complete` |

**Re-run after the `5e83a9c` rewording:** **7601**, 52/52, `tsc`/`lint` exit 0.

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 7313 | **7601** (this plan's sixteen tasks) |
| `verify-merge` | 25647 | 25647 |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` exit 0. **No packages were installed.**

**Task 2's global assertion, and why it was right here.** Every other plan in this phase closed on
`pendingPairs().filter(p => p.skill === …)`, because a global total is a statement about siblings'
work. This plan is wave 9 and terminal: `pairsWritten === 52 && pairsTotal === 52` **is** the claim
the task exists to make, and it is derived from four bank lookups with nothing setting a completion
flag. The per-skill assertion (`speaking` 16 → 0) was made **as well**, not instead.

---

## Mutation testing — 39 declared, 39 EXECUTED

Run against `verify-scenario-content.mts`, over four files. Every hardening the earlier plans paid
for was carried: anchors extracted from the real file by **unique substring at apply time** (0 or >1
matches **abort**; an anchor or replacement spanning a line terminator is **refused**); files read
and written as **raw bytes** so CRLF is never normalised; a **landing proof** before any verdict; a
**caught** verdict requiring the **expected assertion label**, not merely exit 1; **controls
included**; every file **restored byte-for-byte and re-hashed after every single case**.

| | Caught, with its expected label | Survived (expected) |
|---|---|---|
| The shape | **M1** truncated to two moves · **M2** a fourth move · **M3** a setup of spaces · **M4** a success line of spaces · **M5** a title of spaces · **M6** an empty move · **M7** the same move twice | **C1** reworded title · **C2** reworded setup · **C3** reworded success line · **C5** reworded move · **C4** comment-only |
| The budget | **M8-over** far over the ceiling · **M8-under** the whole task gutted under the floor | — |
| Bank keys | **M9** typo'd key (`travel/dirctions`) · **M10** an entry for `academic/news`, which declares no speaking | — |
| The level | **M11-native** `native/pronunciation` at C1 · **M11-a2** `travel/airport` at B1 | — |
| Ids (D-06) | **M12-key** every id naming `travel/airport` · **M12-kind** ids composed under kind `vocab` · **M13** a slug that is an array position · **M14-literal** the format spelled by hand · **M15-template** the format spelled as a template | **C6** the forbidden strings inside a COMMENT |
| D-01 | **M16** every scenario handed `travel/airport`'s rehearsal · **M17** `practical/appointments` given airport's MOVE LIST under its own title and setup | — |
| Corpus repeats | **M18** a repeated title · **M19** a repeated setup · **M20** a repeated success line | — |
| The UNSCHEDULED leg | **M21a** a speaking id smuggled into `reviewableIds()` · **M21b** a speaking id resolving to a review card | **M21-guard** `SCHEDULED_ITEM_KINDS` (see Deviation 2 — declared) |
| Coverage (D-03) | **M22** the summary's unit reworded off “rehearsal” · **M23** the bank unwired from the registry | — |
| The panel's promise | **M24** a `fetch` added · **M25** the XP award removed | — |
| The applier itself | **SELF-MISSING** 0 matches → aborted · **SELF-AMBIG** 30 matches → aborted · **SELF-MULTILINE** anchor spanning a line terminator → refused | — |

**26 caught (each on its expected label), 7 survived (6 controls + 1 declared), 3 applier refusals,
0 spurious, 0 unexpected** — on the **second** run. The first run is the interesting one: **M8-under
and M21 both survived**, and both turned out to be weak mutations rather than weak assertions
(Deviation 2).

**C6 is the one that keeps the id assertion honest**: it inserts `#speaking#` and `#${` inside a
**comment** and must survive, proving 03-09's comment-strip works and that the source-level
one-author assertion is scoped to real code.

**M17 is the one worth naming again.** Its target keeps its own title, setup and success line and
borrows only the three moves — which is precisely what `WORLD_FALLBACK` looked like wearing a
scenario heading, and precisely what a tired author produces on task fourteen of sixteen. `is
written for itself` does **not** fire on it; `has its own three moves` does.

### A declared limit of one assertion's label

In the spirit of 03-08's WINDOWS 39 and 03-09's tautological id line: **“every scenario speaking id
is unique across all scenarios” cannot be falsified from the data.** Every id is composed from a
scenario key that is unique by construction, so two entries can never collide however carelessly
their slugs are authored. It only fails if the *accessor* stops using the scenario key — which is
what **M12-key** actually catches, on a different label (`names ITS OWN scenario`). The uniqueness
assertion is real cross-bank protection (it is one of six key-space collision checks) but it is not
protection against an authoring mistake, and its label implies more grip over the data than it has.

**The equivalent coarse-grained fingerprint here:** `is written for itself` hashes the whole task
body and `has its own three moves` hashes the whole move list, so **two scenarios sharing a SINGLE
move are not caught by either.** That is a real gap, declared rather than papered over — and it is
the gap the corpus scans below exist to cover.

---

## The duplicate scans, over the full corpus including all thirty rehearsals

> **The caveat every plan from 03-04 onward recorded applies, and applies to their figures too.**
> This is a re-implementation from the method 03-03 described, not the identical script. **Pair
> counts are directly comparable across plans; thresholds are not.** Mine reproduces **21,420**
> phrase pairs and **38,080** term pairs exactly — so the corpora agree with all five predecessors —
> while its stop-word list is more aggressive again, which raises individual Jaccard scores without
> moving one item of content.
>
> **Thresholds used here: phrases 0.4 · terms 0.5 · grammar prompts 0.4 · writing tasks 0.4 ·
> writing checklist lines 0.5 · speaking titles 0.5 · speaking setups 0.4 · speaking moves 0.5 ·
> speaking success lines 0.5.**

**Scan 1 — exact repeats**, case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 210 | 210 | **0** |
| Spanish glosses | 210 | 210 | **0** |
| Vocabulary terms | 280 | 280 | **0** |
| Card examples | 280 | 280 | **0** |
| Grammar prompts | 20 | 20 | **0** |
| Writing checklist lines | 45 | 45 | **0** |
| Reading titles | 9 | 9 | **0** |
| **Speaking titles** | **30** | **30** | **0** |
| **Speaking setups** | **30** | **30** | **0** |
| **Speaking moves** | **90** | **90** | **0** |
| **Speaking success lines** | **30** | **30** | **0** |

**90 moves, 90 distinct.** That is the corpus fatigue would have shown in first — three imperatives
per task, thirty times over, all of them about being specific under pressure.

**Scan 1b — cross-namespace exact.** speaking moves ↔ writing checklist **0**; ↔ phrase texts **0**;
↔ grammar explanations **0**; ↔ reading question stems **0**; speaking setups ↔ writing tasks **0**;
speaking success ↔ writing checklist **0**; speaking titles ↔ writing titles **0**; ↔ reading titles
**0**.

**Scan 2 — Jaccard over content words**, cross-scenario pairs only:

| Corpus | Pairs compared | Above threshold |
|---|---|---|
| Phrase texts | 21,420 | 4 |
| Vocabulary terms | 38,080 | 12 |
| Grammar prompts | 150 | 0 |
| Writing tasks / checklist lines | 36 / 900 | 0 / 0 |
| **Speaking titles** | **435** | **0** |
| **Speaking setups** | **435** | **0** |
| **Speaking moves** | **3,915** | **0** |
| **Speaking success lines** | **435** | **0** |

**All sixteen non-speaking hits are pre-existing phrase and vocabulary content, none of it this
plan's.** They are the closed-set artefacts earlier plans already adjudicated (`How was your
weekend?` ⟷ `What are you up to this weekend?`, the `I'd like a …, please.` family, and phrasal-verb
pairs such as `catch up`/`catch on`, `run into`/`run over`, `talk over someone`/`talk someone into
something`). My count is higher than 03-09's 2 and 3 **because my stop list is more aggressive**,
not because content changed — the same items, scored differently. This is precisely why thresholds
do not travel between plans.

**Nothing in the thirty-task speaking corpus came within reach of any threshold — 5,220
cross-scenario comparisons, zero hits.**

**Scan 3 — the thirty setups against the GLOBAL writing room's prompts**, because “dress the global
bank in a scenario heading” is the failure D-01 names: **270 pairs, 0 above 0.4.**

**Scan 4 — four-word runs shared between a rehearsal and any other authored text** in the phase's
corpus: **7 on the first run, 5 of them mine and all 5 fixed (Deviation 1); 2 remain.**

| Run | Where | Verdict |
|---|---|---|
| `and ask for one` | `work/feedback` (03-09) ↔ `work/networking`'s writing task | Pre-existing, adjudicated by 03-09. A functional four-word string carrying no content |
| `in your own words` | `work/feedback` (03-09) ↔ `academic/summaries` | Pre-existing, adjudicated by 03-09. The standard English formulation of reflective listening |

**Zero shared four-word runs originate in this plan's sixteen.**

---

## Browser observation — served HTML against a production build

**The `.next` directory was deleted and rebuilt AFTER the mutation sweep had finished and restored
all four files**, per 03-08's hazard: their sweep poisoned a sibling's build while `git status`
stayed clean, and the diagnostic that settled it was the build's own source map. `git status
--porcelain` was clean (bar the pre-existing untracked `.claude/`) before the build began.

`npm run start` on port 3000. From the served HTML:

- **All 30 speaking pairs render their OWN rehearsal.** Checked mechanically: each of the thirty
  pages was fetched and asserted to contain *its own* task title — **30 of 30**, and **0 pages
  showing the `Not yet available` panel**. (03-08's poisoned-build failure mode would surface here as
  29 pages missing their own title, so this check is the one that would have caught it.)
- `/world/travel/airport` — the scenario 03-09 recorded as still rendering `Not yet available` —
  now carries `Practise speaking`, the **A2** badge, *say it out loud*, *The connection you just
  lost*, the setup, the three numbered moves, the **You did it if** block and `0 of 3 moves
  rehearsed`.
- **Levels are the scenario's own, on the page:** `travel/airport` **A2**, `practical/tech-support`
  **B1**, `native/pronunciation` **B2**, `native/register` **C1**.
- **`native/pronunciation` renders the voicemail rehearsal, not a tongue-twister** — the six
  twisters are still one step up the page in the warm-up, which is where they belong.
- **`/skill/speaking`** reads *“**30** of the **30** scenarios that train your speaking have practice
  written for the situation itself”*, with **zero** `Not written yet` badges. Neither number is
  typed; both come off the banks — and the sentence's own second clause (03-09's *“the rest are on
  the way, and say so”*) has disappeared **on its own**, because it is conditional on there being a
  rest.
- Curly quotes serve as UTF-8 (`“` present in the raw bytes) — the `?` glyphs in my terminal capture
  were a console-encoding artefact, checked rather than assumed.

## What has NOT been seen by a human

**Nobody has ticked a move.** Everything above is the static render. The interactive half remains
unseen for all thirty tasks: the checkbox, the line-through, the counter reaching `3 of 3`, the
`Rehearsed` pill, and the single award of 15 speaking XP with the day's activity recorded
(**T-03-22**). That is 03-09's `.planning/WINDOWS.md` entry 38, now covering thirty tasks rather
than fourteen, and still owed to plan 03-11's browser pass alongside entries 29–37 and 39.

## Known Stubs

**None introduced, and none remaining in this phase's scenario surface.** `pendingPairs()` returns
**empty**; every one of the fifty-two declared pairs resolves to a bank entry; no page renders the
`Not yet available` panel for any declared skill. The panel still exists and is still correct — it
is what a scenario would get if a bank entry were deleted, which is the control assertion that keeps
52/52 honest.

**One thing handed on rather than hidden, inherited from 03-09:** the rehearsal's composed id is
still **read by nothing**. It exists for uniqueness across the thirty tasks and as a handle for a
later plan. Stated in the module header.

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file access
in shipped code. The register's four `mitigate` dispositions were honoured:

- **T-03-20** (two of the previously-shared scenarios ending up with the same task) — the threat that
  actually happened in this codebase, and these sixteen are exactly the scenarios it happened to.
  **Both halves asserted separately and fingerprinted without the id**: M16 catches a shared task,
  M17 catches a shared move list. Declared gap: a single shared *move* is not caught by either — the
  corpus scans cover it, and found none.
- **T-03-23** (a completeness claim outrunning the banks) — 52/52 is derived from four bank lookups;
  **M23** unwires the bank and the coverage assertions fire; the harness's own `stubFor` control
  proves an emptied bank flips a pair back to unwritten. Nothing anywhere sets a completion flag.
- **T-03-04** (coverage summaries assembled from task text) — every speaking summary is
  `"1 rehearsal"`; **M22** catches a reworded unit, and no setup, move or success line enters a
  summary string.
- **T-03-SC** (package installs) — zero installed; dependencies unchanged at **11 + 11**.
- **T-03-10** (authoring past the phase boundary) — accepted and honoured: Sounding Native's five sit
  at their curriculum levels, and the harness asserts each task's level against the curriculum entry
  (**M11-native** fires on a drift).

## CONT-01, and what “closed” means here

**The content is complete and the requirement is ticked.** `REQUIREMENTS.md` now reads
`- [x] **CONT-01**` and its traceability row reads `Complete`, written by
`requirements mark-complete` **after** the closure predicate was asserted in a separate command.

**What that tick does and does not assert.** It asserts that every scenario in all six worlds offers
a real, scenario-specific exercise in each skill it declares — 52 of 52, derived, with no stub and no
placeholder, and it is the phase's last content plan. It does **not** assert that a human has used
any of them: the interactive half of the rehearsal panel is still unobserved, and **the phase gate
(03-11) still owes the browser pass** for that and for WINDOWS entries 29–39.

## The state tooling, eighth consecutive plan

Diffed against a snapshot taken **before** the first `state.*` command. See the state section for
what was corrected. The full workaround was applied: the `Last activity:` sentence is on **one
physical line**, `last_activity_desc` was written **after the last tool write**, `Progress:` was
checked against its own parenthetical, and **only this plan's own `add-decision` rows were
restamped** — the historical `[Phase ?]` rows were counted before and after to prove they were left
alone.

## Self-Check: PASSED

`src/lib/content/scenario-speaking.ts` exists on disk and holds all thirty entries; all three commits
(`7dfae26`, `be30dcc`, `5e83a9c`) are in `git log`; `git diff --diff-filter=D` is empty for each, so
no commit deleted a tracked file; the tree reproduces **7601** assertions and 52/52; all four files
touched by the mutation sweep hash identically to their pre-sweep bytes; `git status --porcelain`
shows only this plan's intended planning documents and the pre-existing untracked `.claude/`.
