---
phase: 03-every-scenario-practicable
plan: 09
subsystem: scenario-content
tags: [content, cont-01, speaking, coverage, derived-ui, mutation-testing, unscheduled-ids, new-exercise-shape]
status: complete
requires:
  - src/lib/review-items.ts (scenarioItemId, SCHEDULED_ITEM_KINDS — plans 03-01, 03-06)
  - src/lib/scenario-coverage.ts (EXERCISE_SOURCES, pendingPairs — plan 03-01)
  - src/components/practice/WritingDesk.tsx (the self-check shape this panel copies)
  - src/lib/progress.ts (addSkillXp, recordActivity — no new progress field)
  - scripts/verify-scenario-content.mts (the phase's content gate — plan 03-01)
  - .planning/phases/03-every-scenario-practicable/03-05-SUMMARY.md (the wiring handover)
  - .planning/phases/03-every-scenario-practicable/03-06-SUMMARY.md (the handover's CONDITIONAL fourth edit)
  - .planning/phases/03-every-scenario-practicable/03-07-SUMMARY.md (the second bank to answer it no)
provides:
  - "src/lib/content/scenario-speaking.ts — ScenarioSpeakingTask, getScenarioSpeaking, scenarioSpeakingKeys; 14/30 speaking pairs"
  - "src/components/practice/SpeakingTaskPanel.tsx — the rehearsal renderer; XP once, no AI, no microphone, nothing scored"
  - "src/lib/review-items.ts — ScenarioItemKind gains \"speaking\" as a THIRD unscheduled kind"
  - "src/lib/scenario-coverage.ts — the speaking EXERCISE_SOURCES entry (unit \"rehearsal\")"
affects:
  - src/components/practice/ScenarioPractice.tsx (the last branch of the dispatch is filled)
  - "src/app/(catalog)/skill/[skill]/page.tsx (speaking now reads 14 of 30, derived)"
  - src/components/ScenarioView.tsx (fourteen header pills stop being muted, derived)
  - .planning/WINDOWS.md (entry 38)
tech-stack:
  added: []
  patterns:
    - "a NEW exercise shape only where no existing one fits — and then the smallest one that is still a rehearsal"
    - "the fourth wiring edit (reviewableIds) is CONDITIONAL — three of four banks in this phase said no"
    - "an UNSCHEDULED id kind — composed for UNIQUENESS, asserted absent from the review queue"
    - "assert a component's PROMISE against its own source: no fetch, no speech API, no recordAttempt"
    - "compose ids LAZILY when the bank and the resolver share an ESM cycle"
    - "assert per-skill pending pairs, never a global written total"
key-files:
  created:
    - src/lib/content/scenario-speaking.ts
    - src/components/practice/SpeakingTaskPanel.tsx
  modified:
    - src/lib/review-items.ts
    - src/lib/scenario-coverage.ts
    - src/components/practice/ScenarioPractice.tsx
    - scripts/verify-scenario-content.mts
decisions:
  - "THE REHEARSAL TASK DOES NOT RECORD ATTEMPTS. The panel calls addSkillXp and recordActivity and nothing else — a ticked self-check is a self-report with no correctness signal, so scheduling it would fill the review queue with items nothing could ever mark wrong. 03-05's fourth edit was NOT taken and the NEGATIVE is asserted, as 03-06 and 03-07 each did before"
  - "The harness reads SpeakingTaskPanel.tsx and asserts the absence of fetch, speechSynthesis, SpeechRecognition, getUserMedia, MediaRecorder AND recordAttempt — the plan's 'no AI, no microphone' promise run as a script rather than reread, with comments stripped first so the paragraphs explaining the absence cannot satisfy it"
  - "A new exercise shape, because speaking is the one skill with none: PronunciationLab drills phrases (that is the warm-up) and the tutor is Phase 5. The shape is a tuple of exactly three moves, so a fourth is a compile error as well as a harness failure"
  - "The unit is \"rehearsal\", not writing's \"task\", so a scenario declaring both skills reports two distinguishable summaries"
  - "review-items.ts was edited although it is not in files_modified — scenarioItemId's kind parameter is typed. The identical Rule 3 deviation 03-06 and 03-07 both recorded, for the identical reason"
  - "A mutation found the per-id 'is exactly what scenarioItemId composes' assertion to be TAUTOLOGICAL; it was strengthened at the source rather than the mutation weakened"
  - "CONT-01 was NOT ticked. It is at 36/52; the requirement says EVERY pair"
metrics:
  duration: ~95min
  tasks: 2
  commits: 3
  completed: 2026-08-01
---

# Phase 3 Plan 09: The Rehearsal Task, and Fourteen of Thirty Summary

Speaking is the one skill in this phase with no existing scenario exercise type, and the twenty-one
pairs that were handed three generic lines shared by every scenario in their world are the reason
D-01 exists at all. Fourteen of them now open a rehearsal written for their own situation — who you
are, three moves in order, and one line to judge yourself against — **practicable today with no AI,
no microphone and no network**, and the last empty branch of `ScenarioPractice`'s switch is filled.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `7059c3c` | `scenario-speaking.ts`, `SpeakingTaskPanel`, the `"speaking"` item kind, the registry entry, the dispatch branch, eight harness groups — proved on the six Social pairs |
| 2 | `9142f88` | `social/humor` (C1), the six Work pairs, `academic/debate` (C1) — this plan's half closes |
| — | `3f7498d` | The id-composition assertion, strengthened after a mutation proved it tautological (see Deviations) |

**Registry state on completion: 36/52 pairs written · 16 pending — all of them speaking · 35/35
phrases · 35/35 vocabulary.** 14 tasks, 42 moves, 14 success lines, **1,123 authored words**
(80.2 per task; 73.6 of that is the task proper, mean of a 66–80 range).

That 36 is the whole wave's number, not this plan's: eighteen from 03-07, fourteen from here, four
from 03-08. **No gate in this plan asserts it** — see the per-skill convention below.

---

## 1. Does the rehearsal task record attempts? **No — and I built it that way on purpose**

03-05's handover says wiring an exercise is **four** edits and the fourth (`reviewableIds()`) is the
silent one. 03-06 established the rule is *conditional* and asserted the negative for writing; 03-07
asked the same question of reading and got the same answer. Speaking was the case 03-07 called
"genuinely uncertain", because the renderer did not exist yet: **I was not reading an answer out of a
file, I was choosing one.**

**The panel calls `addSkillXp("speaking", 15)` and `recordActivity()`. It never calls
`recordAttempt`.** The reasoning, in one line: *a ticked box is a self-report, and `recordAttempt`
exists to schedule things that can be got wrong.* Nothing marks a rehearsal. If these ids were
scheduled, `srs["…#speaking#…"]` entries would come due and `/review` would have to render something
— and there is nothing to render, because the exercise is "say this out loud", which is not a
one-screen card. Both failure modes are silent and symmetric: omit a scored bank and its items are
invisible, add an unscored one and its items are permanent phantoms in `Dashboard`'s "Due today"
count.

So **three of the four exercise banks in this phase answered no**, and the module doc-comment in
`review-items.ts` now says so at the point of edit.

### The three edits that did apply

**(a) The registry — one entry, nothing else in the file.**

```ts
// src/lib/scenario-coverage.ts
speaking: (w, s) => {
  const rehearsal = getScenarioSpeaking(w, s);
  return rehearsal && { items: [rehearsal], unit: "rehearsal" };
},
```

The unit is deliberately **not** writing's `"task"`: `social/complaining` and `academic/debate`
declare both skills, and two summaries reading `"1 task"` on one page would be two different things
wearing one name.

**(b) The dispatch — the last branch of the exhaustive switch.**

```tsx
// src/components/practice/ScenarioPractice.tsx
case "speaking": {
  const rehearsal = getScenarioSpeaking(world.slug, scenario.slug);
  if (!rehearsal) return <NotWrittenYet skill={skill} scenario={scenario} />;
  return <SpeakingTaskPanel task={rehearsal} accent={props.accent} />;
}
```

The warm-up step above it and the tutor step below it are **untouched**: the warm-up drills the
scenario's phrases, this rehearses the scenario, and the tutor remains the separate, honestly
deferred thing it is.

**(c) Resolution — one branch, returning nothing on purpose**, through the guard 03-06 built:
`speaking` joins `writing` and `reading` outside `SCHEDULED_ITEM_KINDS`.

### And the fourth, inverted and asserted rather than omitted

```
no scenario speaking id is listed as reviewable
resolveReviewItem returns nothing for social/small-talk#speaking#two-minutes-at-the-coffee-machine   (×14)
a speaking id still round-trips through the id format
```

Mutations **M18** (a speaking id smuggled into `reviewableIds`) and **M19** (a speaking id resolving
to a review card) both fire.

---

## 2. The shape, and the two things about it that are not style

Plan 03-10 authors sixteen more against exactly this:

```ts
// src/lib/content/scenario-speaking.ts
export interface ScenarioSpeakingTask {
  id: string;                                 // the composed D-06 id
  title: string;
  level: Level;                               // the SCENARIO's own level
  setup: string;                              // who you are, what the situation is
  moves: readonly [string, string, string];   // exactly three, in order
  success: string;                            // what you check yourself against
}
export function getScenarioSpeaking(w: string, s: string): ScenarioSpeakingTask | undefined;
export function scenarioSpeakingKeys(): string[];   // harness-only
```

**`moves` is a tuple, not an array.** A fourth move or a second is therefore a *compile* error as
well as a harness failure — the count is the shape, not a floor. Both halves earn their keep:
mutations M1 (truncated to two) and M2 (a fourth added) are caught by the harness at runtime, because
`node --experimental-strip-types` has thrown the tuple away by then.

**Every field is required.** 03-CONTEXT's lesson — "an author forgets an optional field" — applied to
a shape where every field is load-bearing: a rehearsal with no setup has nobody in it, and one with no
success line has been performed rather than practised.

**Composition is lazy**, per 03-05's instruction, and was verified from **three entry points**
(`review-items.ts` first, `scenario-coverage.ts` first, `scenario-speaking.ts` first) rather than
reasoned about. All three produce the identical id.

---

## 3. The panel, and how its promise is enforced

`SpeakingTaskPanel` is 141 lines and has **no `useEffect`, no `fetch`, no speech API and no
recording**. Its self-check is the shape `WritingDesk` already uses — a checkbox, a line-through on
tick, the same `accentColor` — so the two surfaces read as one product.

**The XP rule, stated because plan 10 inherits it.** Fifteen speaking XP is awarded **once**, at the
moment the set of ticks first completes:

```tsx
if (!awarded && task.moves.every((_, i) => updated[i])) {
  addSkillXp("speaking", REHEARSAL_XP);
  recordActivity();
  setAwarded(true);
}
```

`awarded` latches and is never cleared, so unticking and re-ticking cannot award again (T-03-22). The
amount sits between the two anchors already in `progress.ts`: a grammar question is 10 and finishing a
whole scenario is 20.

**The promise is run as a script, not reread.** 03-06 and 03-07 each caught their own content lying
about itself that way; the equivalent here is that the panel's *behaviour* claim is mechanical, so
the harness reads its source and asserts it:

```
SpeakingTaskPanel does not use fetch(                  SpeakingTaskPanel does not use getUserMedia
SpeakingTaskPanel does not use speechSynthesis         SpeakingTaskPanel does not use MediaRecorder
SpeakingTaskPanel does not use SpeechRecognition       SpeakingTaskPanel does not call recordAttempt
SpeakingTaskPanel awards XP through addSkillXp and records the day
```

Comments are stripped first — otherwise the paragraph explaining *why* there is no `fetch` would fail
the assertion that there is no `fetch`. Control **C6** proves the strip works (a forbidden string
added inside a comment survives) and mutations **M22–M26** prove the assertions fire. The last one is
the important one: **`does not call recordAttempt` is the unscheduled decision enforced at the source
rather than only at the id**, so a later plan cannot quietly start scheduling self-reports.

---

## 4. The fourteen tasks, and what each was written to do

Every scenario's briefing, phrase set and vocabulary deck was read before authoring, per 03-05's
handover, and where a scenario also declares writing its rehearsal was chosen to be the half a
written brief cannot reach.

| Scenario | Level | The rehearsal, and why it is not the phrase set again |
|---|---|---|
| `social/small-talk` | B1 | The phrases are the lines; this is the **arc** — open on something you can both see, answer-plus-bounce-back, and leave first. Ninety seconds at a coffee machine, so "close it" is forced rather than optional |
| `social/making-friends` | B1 | The briefing warns that "we should hang out" is vague. So the whole task turns on the second move: **a day, a place, an hour** — and the success line is "a day in the diary rather than 'sometime'" |
| `social/dating` | B2 | Two moves are easy and the third is the one nobody rehearses: **offer the way out yourself, in the words you would actually use.** The success line judges the exit, not the invitation |
| `social/parties` | B1 | Mingling is two skills and the phrase set only covers arriving. This is **entering a group and leaving it on purpose**, which is the part that decides whether you talk to more than one person |
| `social/complaining` | B2 | The 03-06 writing prompt is a message to a neighbour you will see again. This is the **counter**, live: state the facts without assigning fault, ask for one thing they can do today, and **hold the line once** when the answer is no |
| `social/favors` | B1 | The briefing teaches register scaling. The task makes it audible: **flag the size of the ask before making it**, so refusing costs nothing, and offer back something you can actually do |
| `social/humor` | C1 | The move learners actually need is not the joke, it is the two seconds after it dies. **Name it and move on. Do not explain it** — and the success line makes the recovery shorter than the joke |
| `work/interviews` | B2 | The 03-05 grammar set drills STAR's tenses; this **delivers** one under time. Two sentences of scene, first person singular, a result with a number, then hand it back with a question only an insider would ask |
| `work/meetings` | B2 | Interrupting politely, which is what the scenario is for — and the half most sets omit: **giving the floor back yourself** before it is taken, with one line on what was agreed |
| `work/presentations` | B2 | Signposting, out loud: the three takeaways in order, the sentence that closes one slide and opens the next, and **the question you cannot answer** — say so, say what you will do, give a date |
| `work/negotiating` | C1 | The counter as a **trade in one conditional sentence**, and a close you would be happy for them to repeat to their own boss. The success line is "nothing you said would stop you calling them next quarter" |
| `work/networking` | B2 | The 03-06 writing prompt is the message two days later. This is the **encounter**: who you are in one sentence that ends in what you do rather than your title, and the ask for one contact |
| `work/feedback` | B2 | Taking criticism without defending. **Say nothing in your defence for one full turn**, play it back in your own words, then ask what better looks like. The success line counts questions against reasons |
| `academic/debate` | C1 | The 03-06 writing prompt already asks for a written concession on a car-free city centre, so this takes **a different motion and the spoken open**: concede before the other side reaches for it, and close on the sentence you want repeated with no new claim after it |

### Two authoring constraints held deliberately

**A move states what a successful turn DOES, and is checkable by looking.** "Ask for one fix they
could carry out today" can be ticked honestly; "speak politely" cannot. Until the tutor lands in
Phase 5 the learner's only feedback is her own judgement, so a move she cannot check is a move that
does nothing — the same rule 03-06 applied to its checklists.

**The word budget is gated, not intended.** The harness asserts each task's setup + moves + success
sits in **40–100 words**; mine run 66–80, mean **73.6**. A rehearsal that runs much longer is a
briefing in disguise, and the scenario already has one of those a step up the page. Mutation **M8**
catches a task that outgrows it.

---

## Deviations from Plan

**Four, all recorded rather than absorbed.**

**1. [Rule 3 — blocking issue] `review-items.ts` was edited although it is not in `files_modified`.**
- **Found during:** Task 1, the moment the bank tried to compose an id.
- **Issue:** the plan instructs that each task carry "a composed id built through plan 01's id
  function". `scenarioItemId(scenarioKey, kind, localId)` types `kind` as `ScenarioItemKind`, a
  closed union with no `"speaking"` member, so the instruction did not type-check. The alternative —
  spelling `world/scenario#speaking#slug` by hand — is exactly what the one-author rule exists to
  prevent. **This is the identical deviation 03-06 and 03-07 both recorded, for the identical
  reason**, which makes it a property of the design rather than an accident: adding a kind means
  editing `review-items.ts`.
- **Fix:** `"speaking"` added to `ScenarioItemKind` and `ITEM_KINDS` and **not** to
  `SCHEDULED_ITEM_KINDS`; the union's doc-comment now names all three unscheduled kinds and the
  *different* reason each is one (writing takes an id for a storage key, reading for uniqueness
  against the global bank's bare slugs, speaking for uniqueness across the thirty tasks two plans
  author); the `reviewableIds` comment now says three of four banks answered no.
- **Why this is minimal:** the shared assertion `reviewableIds() covers every key space` was **not**
  touched — speaking ids are absent from `reviewableIds()`, so its arithmetic holds unchanged, as it
  did for writing and reading. No group another plan owns was edited.
- **Files modified:** `src/lib/review-items.ts` · **Commit:** `7059c3c`

**2. [Handover checked, not obeyed — the third time] The fourth edit was deliberately not taken.**
- **Found during:** Task 1, designing the panel — this is the one bank where the answer was a
  decision rather than a reading, because the renderer did not exist yet.
- **Fix:** the opposite of the fourth edit, asserted (§1), **plus** the source-level assertion that
  the panel does not call `recordAttempt` at all. That second one is new to this phase and is what
  keeps the decision from being quietly reversed later: mutation **M24** adds one line of
  `recordAttempt` to the panel and the harness fails.
- **Note for 03-10:** you inherit this. Do not add speaking ids to `reviewableIds()`, and do not add
  `recordAttempt` to the panel without changing both together.

**3. [Rule 2 — missing critical verification] A mutation proved one of my own assertions
tautological, and the assertion was strengthened rather than the mutation weakened.**
- **Found during:** the mutation sweep, on the first run. **M15** — the id spelled by hand in the
  *correct* format (`scenarioKey + "#speaking#" + slug + "x"`) — **survived**.
- **The cause, and it is inherited:** the per-id assertion is
  `task.id === scenarioItemId(s.key, "speaking", parsed.localId)`, where `parsed.localId` was parsed
  **out of the same id**. Recomposing from it can only reproduce it. The assertion catches a
  different separator or a different field order and nothing else — and the identical line exists in
  03-05's, 03-06's and 03-07's groups, where it is tautological in exactly the same way.
- **Why it could not be fixed in the data:** the local slug is authored freely, so "a slug with an x
  on the end" is just another legal slug. Whether an id was *produced by* `scenarioItemId` is a
  property of the source, not of the string.
- **Fix:** the harness now reads `scenario-speaking.ts` (comments stripped) and asserts it never
  spells the format by hand — no `#speaking#` literal, no `#${` template — and does reach
  `scenarioItemId(`. Scoped to the format rather than to the `#` character, so a future task that
  mentions a hashtag out loud cannot fail the build. M15 is now caught on that label, and **M27** (a
  hand-spelled id with a *different* separator) is caught by the parser assertion.
- **For 03-10 and for anyone auditing 03-05/06/07:** their equivalent line has the same hole. It is
  not a shipped defect — no id in the repo is hand-spelled — but it is an assertion with less grip
  than its label implies.
- **Files modified:** `scripts/verify-scenario-content.mts` · **Commit:** `3f7498d`

**4. [Rule 1 — bug] The state tooling wrote wrong values for the SEVENTH consecutive plan.**
- **Found during:** the state-update step, by diffing `STATE.md` against a snapshot taken before the
  first command rather than trusting any command's output.
- See the state section at the end of this summary for the exact fields corrected. 03-06's and
  03-07's workaround was applied in full: the `Last activity:` sentence is on **one physical line**
  and `last_activity_desc` was written **after the last tool write**. 03-07's warning was also
  honoured — **only this plan's own `add-decision` rows were touched**; the 107 historical
  `[Phase ?]` rows were left exactly as found, and counted before and after to prove it.

**A wave note, not a deviation: 03-08 committed to the same working tree while this plan ran.** One
harness run mid-sweep reported `FAIL scenario reading: academic/articles question ids are unique
within the passage` — **their file, their in-flight edit, not mine**. It was judged by attribution
rather than acted on, and the next run (after their `1753113`) was green at 7313. The mutation driver
was adapted for the same reason: it asserts **my** files are restored byte-for-byte and deliberately
does **not** assert a globally clean `git status`, because the sibling's edits are not mine to judge.

**Not a deviation, but worth stating: CONT-01 was NOT ticked.** It reads "**Every** existing scenario
… offers real practice in **each** of its applicable skills", and the registry says 36/52.
`REQUIREMENTS.md` is untouched. **Assert the closure predicate before ticking, never after.**

---

## Verification Results

**Every `<verify>` block in the plan was run. All passed.**

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **7074** assertions passed · 35/35 · 35/35 · 26/52 |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| the inline wiring assertion | `speaking wired: 6 of 30 speaking pairs written` — `social/complaining` has exactly 3 moves, `academic/news` has no task, **24** speaking pairs pending, exactly as `<done>` predicts |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **7218** assertions passed · 34/52 at that moment |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| the closing assertion | `14 of 30 speaking pairs written; 16 remain` — and **30 declared**, checked in the same breath |

**After the strengthened assertion and once 03-08 settled:** **7313** assertions passed · 35/35 ·
35/35 · **36/52 written, 16 pending — all speaking**.

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 6815 | **7313** (this plan's content and gates, plus 03-08's) |
| `verify-merge` | 25647 | 25647 |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` all exit 0. **No packages were installed.**

**The wave-8 convention, honoured.** Every gate in this plan closes on
`pendingPairs().filter(p => p.skill === "speaking")` — a statement about **one skill**, true no
matter which of 03-08 and 03-09 merged first. There is no `pairsWritten` assertion anywhere in this
plan or in its eight harness groups. The printed `36/52` is a **report**, not a gate. It mattered:
03-08's four passages landed *between* this plan's two commits, and every gate here was unmoved by
them.

**Per-skill pending on completion:** `{"speaking": 16}` — 16 total. Grammar 0 (03-05), writing 0
(03-06), reading 0 (03-07 + 03-08).

---

## Mutation testing — 36 declared, 36 EXECUTED

Run against `verify-scenario-content.mts`. Every hardening the earlier plans paid for was carried:

1. **Anchors extracted from the real file by unique substring at apply time**, never hand-typed. Zero
   matches or many matches **abort**; an anchor containing a line terminator is **refused outright**.
2. **A "caught" verdict requires the EXPECTED ASSERTION LABEL** in the output, not merely exit 1. All
   27 matched their intended label.
3. **Controls always included** — six, all expected to survive, all did.
4. **Declared vs EXECUTED counted**, mismatch invalidates the sweep. Reported
   `declared 36 · EXECUTED 36`.
5. **A landing proof** (the file really changed) required before any verdict, and every file restored
   byte-for-byte and re-read to confirm.

| | Caught, with its expected label | Survived (expected) |
|---|---|---|
| The shape | **M1** truncated to two moves · **M2** a fourth move · **M6** an empty move · **M7** the same move twice | **C4** comment-only |
| Required fields | **M3** a setup of spaces · **M4** a success line of spaces · **M5** a title of spaces | **C1** reworded title · **C2** reworded setup · **C3** reworded success line |
| The budget | **M8** a task far over the word budget | — |
| Bank keys | **M9** typo'd key (`work/meetigns`) · **M10** an entry for `academic/news`, which declares no speaking | — |
| The level | **M11** every task at a level that is not its scenario's | — |
| Ids (D-06) | **M12** every id naming `social/small-talk` · **M13** ids composed under kind `vocab` · **M14** a slug that is an array position · **M15** an id spelled by hand in the correct format · **M27** an id spelled by hand with a different separator | — |
| D-01, at the accessor | **M16** every scenario handed `social/small-talk`'s rehearsal · **M17** every scenario handed the same MOVE LIST with its own setup on top | — |
| The UNSCHEDULED leg | **M18** a speaking id smuggled into `reviewableIds` · **M19** a speaking id resolving to a review card | — |
| Coverage (D-03) | **M20** the bank unwired from `EXERCISE_SOURCES` · **M21** the summary's unit reworded off "rehearsal" | — |
| The panel's promise | **M22** a `fetch` added · **M23** `speechSynthesis` added · **M24** `recordAttempt` added · **M25** XP no longer awarded · **M26** the day's activity no longer recorded | **C5** the XP amount changed 15→12 · **C6** a forbidden string added inside a COMMENT |
| The applier itself | **SELF-MISSING** 0 matches → aborted · **SELF-AMBIG** 7 matches → aborted · **SELF-MULTILINE** anchor spanning a line terminator → refused | — |

**27 caught (each with its expected label), 6 controls survived, 3 applier refusals, 0 spurious,
0 unexpected** — on the second run. The first run is the interesting one: **M15 survived**, which is
deviation 3 above and the reason there is now a 27th mutation.

**M17 is the one worth naming.** It gives every scenario its own title and setup and the *same three
moves* — which is precisely what `WORLD_FALLBACK` looked like with a scenario heading on top, and
precisely what a tired author would produce on task twelve of fourteen. `is written for itself`
does **not** fire on it; `has its own three moves` does. Two assertions, because there are two ways
to share an exercise.

---

## The duplicate scans, over the full corpus including the fourteen rehearsals

> **The caveat 03-04 through 03-07 all recorded applies, and applies to their figures too.** This is
> a re-implementation from the method 03-03 described, not the identical script. **Pair counts are
> directly comparable across plans; thresholds are not.** Mine reproduces **21,420** phrase pairs and
> **38,080** term pairs exactly — so the corpora agree with all four predecessors — while its
> stop-word list differs again, which moves individual Jaccard scores without moving one item of
> content.
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
| **Speaking titles** | **14** | **14** | **0** |
| **Speaking setups** | **14** | **14** | **0** |
| **Speaking moves** | **42** | **42** | **0** |
| **Speaking success lines** | **14** | **14** | **0** |

**42 moves, 42 distinct.** That is the number this corpus would have shown fatigue in first — three
imperatives per task, fourteen times, all of them about being clear and specific — and there is not
one repeat.

**Scan 1b — cross-namespace exact.** speaking moves ↔ writing checklist **0**; ↔ phrase texts **0**;
↔ grammar explanations **0**; ↔ reading question stems **0**; speaking setups ↔ writing tasks **0**;
speaking success ↔ writing checklist **0**; speaking titles ↔ writing titles **0**; ↔ reading titles
**0**. No authored line appears in two namespaces anywhere in the phase's corpus.

**Scan 2 — Jaccard over content words**, cross-scenario pairs only:

| Corpus | Pairs compared | Above threshold |
|---|---|---|
| Phrase texts | 21,420 | 2 |
| Vocabulary terms | 38,080 | 3 |
| Grammar prompts | 150 | 0 |
| Writing tasks / checklist lines | 36 / 900 | 0 / 0 |
| **Speaking titles** | **91** | **0** |
| **Speaking setups** | **91** | **0** |
| **Speaking moves** | **819** | **0** |
| **Speaking success lines** | **91** | **0** |

All five non-speaking hits are **pre-existing content, none of it this plan's**, and all five are the
closed-set artefacts the previous four plans already adjudicated: `How was your weekend?` ⟷ `What are
you up to this weekend?`, `I'd like a window seat, please.` ⟷ `I'd like to make an appointment,
please.`, and three phrasal-verb pairs (`catch up`/`catch on`, `run into`/`run over`, `talk over
someone`/`talk someone into something`).

**Nothing in the new speaking corpus came within reach of any threshold — 1,092 cross-scenario
comparisons, zero hits.**

**Scan 3 — the fourteen setups against the GLOBAL writing room's thirteen tasks**, because "dress the
global bank in a scenario heading" is the failure D-01 names: **217 pairs, 0 above 0.4.**

**Scan 4 — four-word runs shared between a rehearsal and any other authored text** in the phase's
corpus: **2, both in `work/feedback`, and both kept deliberately.**

| Run | Where else it occurs | Verdict |
|---|---|---|
| `and ask for one` | `social/complaining`'s and `work/networking`'s **writing** tasks (03-06) | A four-word functional string in three unrelated sentences. Carries no content |
| `in your own words` | `academic/summaries`' writing prompt and briefing | The standard English formulation of the move itself — reflective listening. Rewording it to avoid a collocation would make the instruction worse, and the learner never meets the two on one page |

Neither is copied material: the surrounding sentences share nothing. Recorded rather than quietly
passed over, because 03-07's equivalent scan returned 0 and a reader comparing the two should know
why this one does not.

---

## Browser observation — served HTML against a production build

`npm run start` on port 3000. **Shut down afterwards: no listener, every socket to 3000 drained to
zero, and a request to it is refused.** From the served HTML:

- **All fourteen written pairs render the rehearsal as their own step.** `/world/social/complaining`
  carries `Practise speaking` with the `B2` badge, `say it out loud`, *The repair that was not done*,
  the setup (*"You paid on Tuesday to have your bike fixed…"*), the three numbered moves, the
  **You did it if** block with its success line, `0 of 3 moves rehearsed`, and the footer:
  *"Nothing here is listening or marking you…"*.
- **Two exercises, one page, two different situations.** `social/complaining` renders the rehearsal
  (a bike repair, at a counter) **and** its 03-06 writing task (a message to the neighbours upstairs);
  `academic/debate` renders the spoken open on school-background admissions **and** its written
  concession on car-free city centres. `social/humor` renders the rehearsal and 03-08's C1 passage.
- **The honest panel still works on the same shelf.** `/world/travel/airport` — speaking declared,
  unwritten — still renders `Not yet available` by name with its link out.
- **`/skill/speaking`**: *"**14** of the **30** scenarios that train your speaking have practice
  written for the situation itself — the rest are on the way, and say so:"*, with the
  `Not written yet` badge on the sixteen. Neither number is typed; both come off the banks. For
  contrast, `/skill/reading` on the same run reads *"9 of the 9 …"* with **zero** badges.

---

## What has NOT been seen by a human

**Nobody has ticked a move.** Everything above is the static render; the interactive half is unseen —
the checkbox, the line-through, the counter reaching `3 of 3`, the `Rehearsed` pill, and the single
award of 15 speaking XP with the day's activity recorded. So **T-03-22** ("XP awarded repeatedly by
re-ticking") is proved by construction (`awarded` latches and is never cleared) and by mutation
(M24–M26 fire), and **not by sight**.

Recorded as **`.planning/WINDOWS.md` entry 38**, owed to plan 03-11's browser pass alongside entries
29–37.

## Known Stubs

**None introduced.** `ScenarioPractice`'s switch now has **no branch left rendering the honest panel
by design** — all four skills dispatch to a real renderer, and the panel appears only where a bank
genuinely has no entry. `pendingPairs()` returns 16, all speaking, all of them plan 03-10's, and no
surface this plan touched claims otherwise.

**One thing to hand on rather than hide:** the rehearsal's composed id is, today, **read by nothing**
— unlike writing's, which is a `localStorage` draft key. It exists for uniqueness across the thirty
tasks and as a handle for a later plan (a per-rehearsal record, a deep link, a tutor reference). That
is stated in the module header so a later reader does not assume it is load-bearing. It is the same
posture 03-07 recorded for `ReadingQuestion.id`.

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file access
in shipped code (the harness's `readFileSync` is build-time only). The register's six `mitigate`
dispositions were honoured:

- **T-03-20** (two scenarios sharing a rehearsal task or a move list) — **both** asserted, separately,
  fingerprinted without the id. **M16** catches the shared task and **M17** the shared move list. This
  is the threat that actually happened in this codebase, and it is now the one with two gates.
- **T-03-21** (a speaking exercise that only works once an AI key is configured) — the panel is
  self-directed by construction and the harness reads its source to say so: no `fetch`, no
  `speechSynthesis`, no `SpeechRecognition`, no `getUserMedia`, no `MediaRecorder`. M22 and M23 fire.
  Which half is closed and which is Phase 5's is stated in the module header, in the dispatch comment
  and in the panel's own footer.
- **T-03-22** (XP awarded repeatedly by re-ticking) — the award fires once, when the set of ticks
  first completes; `awarded` latches. Asserted in the panel's behaviour and recorded here; **not**
  observed in a browser (see above).
- **T-03-04** (coverage summaries assembled from task text) — every summary is `"1 rehearsal"`;
  **M21** catches a reworded unit, and no setup, move or success line enters a summary string.
- **T-03-05** (id collision with another bank) — composed ids, asserted globally unique and disjoint
  from global grammar questions, deck-browser cards, recall items, scenario grammar ids, scenario
  writing ids and scenario reading ids — six key spaces. **M12**, **M14**, **M15** and **M27** all
  fire.
- **T-03-SC** (package installs) — zero installed; dependencies unchanged at **11 + 11**.

## For plan 03-10 (the last sixteen speaking pairs)

- **The shape and the panel are done.** Your only file is `src/lib/content/scenario-speaking.ts`: add
  sixteen entries to `BANK`. The accessor, the lazy composition, `scenarioSpeakingKeys()`, the
  registry entry, the dispatch branch and all eight harness groups pick them up with no edit.
- **The floors the harness enforces:** exactly three moves (a tuple, so `tsc` catches it too), every
  field non-empty after trimming, no repeated move inside a task, **40–100 words** for setup + moves +
  success, the task at **its scenario's own level**, an authored non-positional slug, and nothing
  byte-identical — task, title, setup, success line **or move list** — to another scenario's. Mine
  run 66–80 words, mean 73.6.
- **Do not add your ids to `reviewableIds()` and do not add `recordAttempt` to the panel.** The
  harness now asserts both at once, one of them by reading the panel's source.
- **Write moves the learner can tick honestly.** "Ask for one fix they could carry out today" is
  checkable by looking; "be polite" is not, and until Phase 5 her own judgement is the whole feedback
  loop.
- **Read the scenario's briefing, phrase set and deck first**, and where the scenario also declares
  writing, read its 03-06 task too — `academic/debate`'s written prompt is a concession on car-free
  city centres, so this rehearsal had to take a different motion.
- **Your closing assertion is `pendingPairs().filter(p => p.skill === "speaking").length === 0`**,
  never the global written total.
- The harness remains a low-conflict append target: this plan added **two import lines and eight
  groups at the bottom**, and edited **no group another plan owns**.

## The state tooling, seventh consecutive plan

Diffed against a snapshot taken **before** the first `state.*` command rather than trusting any
command's output. What it wrote:

| Field | Verdict |
|---|---|
| `Plan: 8 of 11 complete`, `completed_plans: 32 → 33` | **correct** — 33 `*-SUMMARY.md` files exist on disk |
| `Progress: [█████████░] 92% (3 of 6 phases; **32** of 36 plans)` | **wrong, and self-contradictory on its own line for the fourth plan running** — the bar moved to 92% (33/36) and the parenthetical stayed at 32. Corrected to 33 |
| `**Current focus:** … plan **07** of 11 complete` | **stale, never advanced** — the third plan in a row to report this. Corrected to 08 |
| `last_activity_desc` | **not truncated this time** — 03-07's one-physical-line workaround held — but `record-session` **re-derived it from 03-07's still-current body paragraph**, so the frontmatter said `03-07 executed…` while `stopped_at` said `03-09 complete`. Both halves of the workaround are necessary: the body sentence was rewritten to this plan's (one physical line, 2,878 characters, no wrap) and the frontmatter field written **after the last tool write** |
| `state.add-decision` stamped `- [Phase ?]:` on all five rows | corrected on **exactly those five**. 03-07's warning honoured: counted before and after — `[Phase ?]` **107 → 107**, `[Phase 03]` **5 → 10**. A blanket replace over a shared, append-only section is never in scope for one plan |
| `stopped_at` double-escaping | **did not occur** — this run's text carries no embedded quotes. Both `stopped_at` and `last_activity_desc` were checked to parse cleanly as JSON strings rather than eyeballed |
| `roadmap.update-plan-progress` | **correct** — `7/11 → 8/11`, no hand-correction |

**Also observed, pre-existing and NOT touched:** `total_phases: 4` against a progress line reading
`3 of 6 phases`; the Velocity block still reading `Total plans completed: 0` under a fully populated
per-plan table.

**This is the seventh consecutive plan in this phase to hand-correct these fields.** The wrap
truncation was diagnosed at 03-05 and its workaround works; the parenthetical/bar disagreement, the
stale `Current focus`, and the unresolved `[Phase ?]` are three further small, specific tooling bugs
that should be raised as such rather than absorbed an eighth time.

## Self-Check: PASSED

`src/lib/content/scenario-speaking.ts` (376 lines) and
`src/components/practice/SpeakingTaskPanel.tsx` (141 lines) exist on disk; all four modified files
exist; all three commits (`7059c3c`, `9142f88`, `3f7498d`) are in `git log`;
`git diff --diff-filter=D` is empty for each, so no commit deleted a tracked file; the tree after the
mutation sweep reproduces **7313** assertions and `git status --porcelain` shows only this plan's
intended planning documents, the pre-existing untracked `.claude/`, and nothing of 03-08's that this
plan touched. Port 3000 has no listener, no socket in any state, and refuses connections.
