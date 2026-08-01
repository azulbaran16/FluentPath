---
phase: 03-every-scenario-practicable
plan: 07
subsystem: scenario-content
tags: [content, cont-01, reading, coverage, derived-ui, mutation-testing, unscheduled-ids, component-reuse]
status: complete
requires:
  - src/lib/review-items.ts (scenarioItemId, SCHEDULED_ITEM_KINDS — plans 03-01, 03-06)
  - src/lib/scenario-coverage.ts (EXERCISE_SOURCES, pendingPairs — plan 03-01)
  - src/components/practice/ReadingRoom.tsx (the browser and its inner single-passage reader)
  - src/lib/content/reading.ts (the Passage and ReadingQuestion shapes and the house style)
  - scripts/verify-scenario-content.mts (the phase's content gate — plan 03-01)
  - .planning/phases/03-every-scenario-practicable/03-05-SUMMARY.md (the wiring handover)
  - .planning/phases/03-every-scenario-practicable/03-06-SUMMARY.md (the handover's CONDITIONAL fourth edit)
provides:
  - "src/components/practice/ReadingRoom.tsx — PassageReader EXPORTED, onBack optional, the key explained"
  - "src/lib/content/reading.ts — ReadingQuestion.explain? and .id? (optional here so the 18 global passages compile)"
  - "src/lib/content/scenario-reading.ts — getScenarioReading, scenarioReadingKeys, ScenarioReadingQuestion (explain REQUIRED), ScenarioPassage; 5/9 reading pairs"
  - "src/lib/review-items.ts — ScenarioItemKind gains \"reading\" as a second UNSCHEDULED kind"
  - "src/lib/scenario-coverage.ts — the reading EXERCISE_SOURCES entry (unit \"passage\")"
affects:
  - src/components/practice/ScenarioPractice.tsx (the reading branch of the dispatch)
  - "src/app/(catalog)/skill/[skill]/page.tsx (reading now reads 5 of 9, derived)"
  - src/components/ScenarioView.tsx (five header pills stop being muted, derived)
  - .planning/WINDOWS.md (entry 37)
tech-stack:
  added: []
  patterns:
    - "reuse the EXISTING renderer per skill — export the inner component rather than writing a second one"
    - "an optional prop is how one component serves two surfaces; the margin belongs to the thing that may be absent"
    - "the fourth wiring edit (reviewableIds) is CONDITIONAL — check whether the renderer scores anything"
    - "an UNSCHEDULED id kind — composed for UNIQUENESS, asserted absent from the review queue"
    - "compose ids LAZILY when the bank and the resolver share an ESM cycle"
    - "assert per-skill pending pairs, never a global written total"
    - "anything a passage promises about itself that is mechanically checkable must be run as a script"
key-files:
  created:
    - src/lib/content/scenario-reading.ts
  modified:
    - src/components/practice/ReadingRoom.tsx
    - src/lib/content/reading.ts
    - src/lib/review-items.ts
    - src/lib/scenario-coverage.ts
    - src/components/practice/ScenarioPractice.tsx
    - scripts/verify-scenario-content.mts
decisions:
  - "READING DOES NOT RECORD ATTEMPTS. PassageReader has no useProgress and no recordAttempt call — checked in the file, not assumed. So 03-05's fourth edit (reviewableIds) was deliberately NOT taken and the NEGATIVE is asserted instead, exactly as 03-06 did for writing"
  - "PassageReader was EXPORTED rather than a scenario wrapper written: one component, two surfaces, and the ReadingRoom browser function is byte-identical in the diff"
  - "onBack became optional rather than removed; the article's mt-3 moved behind it, because a margin left behind by an absent element is a stray gap (03-06's lesson in this component's shape)"
  - "explain and id are OPTIONAL on the global ReadingQuestion and REQUIRED on ScenarioReadingQuestion — the optional pair exists only so the 18 shipped passages keep compiling"
  - "The passage id is the composed D-06 id (for uniqueness against bare global slugs like \"coffee\"); a QUESTION id is a plain authored slug, unique within its passage and a key to nothing"
  - "academic/summaries' reading passage is a DIFFERENT text from that scenario's writing prompt — verified mechanically at 0 shared four-word runs, not by feeling satisfied"
  - "CONT-01 was NOT ticked. It is at 18/52; the requirement says EVERY pair"
metrics:
  duration: ~55min
  tasks: 2
  commits: 2
  completed: 2026-08-01
---

# Phase 3 Plan 07: Scenario Reading, the Five A2/B2 Pairs Summary

The single-passage reader is now a component rather than a private function, five scenarios open
straight into a text written for them with no level filter and no list around it, and every one of
their twenty comprehension questions carries an explanation the type system will not let an author
forget. **CONT-01 moves from 13/52 to 18/52**; the four C1 passages are plan 08's.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `ba4a789` | `PassageReader` exported with an optional back action and an explained key; `ReadingQuestion.explain?`/`.id?`; `scenario-reading.ts` with both required; the `"reading"` item kind; the registry entry; the dispatch branch; 7 harness groups — proved on `travel/restaurant` (A2) and `practical/housing` (B2) |
| 2 | `043aa0e` | `academic/news`, `academic/stories`, `academic/summaries` at B2 — this plan's half of the reading pairs closes |

**Registry state on completion: 18/52 pairs written · 34 pending — speaking 30, reading 4, grammar 0,
writing 0 · 35/35 phrases · 35/35 vocabulary.**
5 passages, 1,024 body words, 20 questions, 76 options, 20 explanations, 19 glossary entries —
**2,912 authored words** (582.4 per pair; 204.8 of that is body prose).

---

## 1. Does reading record attempts? **No — and that is the finding**

03-05's handover says wiring an exercise is **four** edits and the fourth is the silent one. 03-06
then established that the rule is *conditional* and asserted the negative for writing. This plan had
to answer the same question for reading, and the answer decided the whole shape of the wiring.

**`PassageReader` does not import `useProgress` and never calls `recordAttempt`.** Checked in the
file, not inferred:

```
grep -rn "recordAttempt" src/components/practice/ReadingRoom.tsx   →   (nothing)
grep -rn "recordAttempt" src/components/practice/GrammarQuiz.tsx   →   lines 17, 38
```

"Check answers" flips a `submitted` boolean and counts `answers[idx] === q.answer`. Nothing is
stored, nothing is scheduled, nothing writes `srs["…#reading#…"]` — ever. So the fourth edit was
**not** taken, and `reviewableIds()` is unchanged by this plan.

The plan's objective had already drawn that line ahead of me, and the reason it gives is the better
one: *a comprehension question torn out of its passage cannot be answered in a review card, because
the passage IS the question.* Even if something did score it, there would be nothing to bring back.

So the three edits that DID apply:

**(a) The registry — one entry, nothing else in the file.**

```ts
// src/lib/scenario-coverage.ts
reading: (w, s) => {
  const passage = getScenarioReading(w, s);
  return passage && { items: [passage], unit: "passage" };
},
```

**(b) The dispatch — look the pair up, hand it to the exported reader.**

```tsx
// src/components/practice/ScenarioPractice.tsx
case "reading": {
  const passage = getScenarioReading(world.slug, scenario.slug);
  if (!passage) return <NotWrittenYet skill={skill} scenario={scenario} />;
  return <PassageReader passage={passage} accent={props.accent} />;
}
```

**(c) Resolution — one branch, returning nothing on purpose**, through the guard 03-06 built:
`reading` joins `writing` outside `SCHEDULED_ITEM_KINDS`, and `resolveReviewItem` returns
`undefined` for both before the recall lookup is reached.

**And the fourth, inverted and asserted rather than omitted:**

```
no scenario reading id is listed as reviewable
resolveReviewItem returns nothing for travel/restaurant#reading#the-blue-door-lunch-menu   (×5)
a reading id still round-trips through the id format
```

Mutations **M17** (a reading id smuggled into `reviewableIds`) and **M18** (a reading id resolving to
a card) both fire, so the negative has teeth rather than being an absence that looks like one.

**For plan 03-09/03-10:** speaking is the last open case, and it is the one where the answer is
genuinely uncertain. `PronunciationLab` and whatever shape 03-09 chooses may or may not score. Ask
the file, not the handover.

---

## 2. The reader's new signature, and the one line that was not obvious

Plan 08 authors four more passages against exactly this:

```tsx
// src/components/practice/ReadingRoom.tsx
export function PassageReader({
  passage,
  accent,
  onBack,
}: {
  passage: Passage;          // a ScenarioPassage is one
  accent: string;            // REQUIRED — the world colour on a scenario page
  onBack?: () => void;       // omitted when this reader IS the surface
}): JSX.Element
```

```ts
// src/lib/content/scenario-reading.ts
export interface ScenarioReadingQuestion extends ReadingQuestion {
  id: string;        // authored slug, unique WITHIN its passage — a key to nothing
  explain: string;   // rendered under the key on check
}
export interface ScenarioPassage extends Passage {
  questions: ScenarioReadingQuestion[];
}
export function getScenarioReading(w: string, s: string): ScenarioPassage | undefined;
export function scenarioReadingKeys(): string[];   // harness-only
```

**The `ReadingRoom` browser function does not appear in the diff at all.** Not one of its lines
changed — the level pills, the filter, the passage list and the skill page are byte-identical, and
every change inside `PassageReader` is behind `onBack` being present or `q.explain` being present,
neither of which is true on the global path. T-03-17 is closed by construction rather than by care.

**The line that was not obvious** is the same one 03-06 hit in a different component:

```tsx
<article className={`${onBack ? "mt-3 " : ""}rounded-[var(--radius)] …`}>
```

The `mt-3` separated the article from the back link. Hiding the link and keeping the margin opens a
stray gap at the top of a panel that now *begins* the section. The margin belongs to the thing that
may be absent.

**Everything else in the reader is untouched:** the read-aloud button, the glossary block, the option
buttons, the disabled-until-complete Check answers, and the score line.

---

## 3. The ids, and why there are two kinds of them here

**The PASSAGE id is the composed D-06 id.** `travel/restaurant#reading#the-blue-door-lunch-menu`,
authored only by `scenarioItemId`. The reason is uniqueness, not scheduling: a scenario passage and a
global one now share the `Passage` shape, and the eighteen global ids are bare slugs — `"coffee"`,
`"market"`, `"theseus"`. Without the namespace the two banks share one flat key space and nothing
would notice a collision. **Mutation M16** replaces the composed id with `"coffee"` and the harness
catches it on exactly that assertion.

**A QUESTION id is a plain authored slug**, unique within its passage and nothing more. It is not
composed, not global and not a key to anything — `PassageReader` still keys the learner's answers by
array position. It exists so a question can be referred to by something other than where it happens
to sit in a list. **M10** (ids become `"0"`, `"1"`, …) and **M11** (every id becomes `"q"`) are both
caught.

`ScenarioItemKind`'s `kind` parameter is typed, so — exactly as 03-06 recorded — composing the
passage id through `scenarioItemId` did not compile until `"reading"` joined the union. It joined
`ITEM_KINDS` and **not** `SCHEDULED_ITEM_KINDS`, and the union's doc-comment now names both
unscheduled kinds and the different reason each is one.

**Composition is lazy**, per 03-05's instruction, and was verified from **three entry points**
(`review-items.ts` first, `scenario-reading.ts` first, `scenario-coverage.ts` first) rather than
reasoned about. All three produce the identical id.

---

## 4. The five passages, and what each was written to do

Every scenario's briefing, phrase set and vocabulary deck was read before authoring, per 03-05's
handover, and each passage was chosen to be the half those banks cannot reach.

| Scenario | Level | Words | The passage, and why it is not the phrase set again |
|---|---|---|---|
| `travel/restaurant` | A2 | 144 | Every phrase and every card in this scenario is **spoken at the table**. The half neither reaches is the notice on the wall you read *before* you have said anything: a café's set-lunch menu, its card minimum, and when to mention an allergy |
| `practical/housing` | B2 | 294 | The phrases are the **questions you ask out loud at a viewing**. Nobody asks about the fortnight *after* the offer, because it has not happened yet — so: two deposits that get confused for one, referencing you cannot control, and the clause behind "bills included" |
| `academic/news` | B2 | 195 | Written the way news is written — inverted pyramid, an attributed quotation, a spokesperson who declines, an unpublished projection — so the questions can turn on gist, on **what the piece does not claim**, and on fact versus attributed opinion |
| `academic/stories` | B2 | 188 | Fiction with a narrator who withholds. A mother, three unopened letters from the surgery, and a haircut that never happened. One question is about **how** something is said; a second is about the voice itself |
| `academic/summaries` | B2 | 203 | One claim, one method, one number, one explanation — built to be summarisable, so a question can ask **which of those four a two-sentence summary could drop**. That is main-idea-versus-supporting-detail asked in the direction reading can ask it and writing cannot |

### Three authoring constraints held deliberately

**`academic/summaries` meets two different texts, and that was checked rather than intended.** That
scenario's *writing* prompt (03-06) supplies its own original passage, on road widening and induced
demand. A reading passage on the same text would collapse the two exercises into one. This one is on
open-plan offices, and the separation was measured: **0 shared four-word runs, Jaccard 0.115.**
Observed on the served page too — `/world/academic/summaries` renders "The Open Plan Paradox" and
"induced demand" in two different steps.

**Distractors are wrong for reasons a learner would fall for, never wrong at random.** "The café is
closed on Saturday" (it is open, it just has no set lunch); "The petition caused the decision" (both
facts are in the piece, adjacent, and the piece never joins them); "Every utility covered" and "only
the council tax" (the same true statement pushed too far in each direction). Twelve of the twenty
questions can only be answered by putting two sentences together.

**`travel/restaurant` claims to be *genuine* A2, so that claim was measured** rather than asserted:
14 sentences, **mean 10.4 words**, longest 17, and exactly two words of nine letters or more
(`Wednesday`, `sandwiches`) in 144.

---

## Deviations from Plan

**Four, all recorded rather than absorbed.**

**1. [Rule 3 — blocking issue] `review-items.ts` was edited although it is not in `files_modified`.**
- **Found during:** Task 1, the moment the bank tried to compose a passage id.
- **Issue:** the plan instructs *"Give each passage a composed scenario id through plan 01's id
  function."* `scenarioItemId(scenarioKey, kind, localId)` types `kind` as `ScenarioItemKind`, a
  closed union with no `"reading"` member, so the instruction did not type-check. The alternative —
  spelling `world/scenario#reading#slug` by hand in the bank — is what the one-author rule exists to
  prevent. **This is the identical deviation 03-06 recorded, for the identical reason**, which makes
  it a property of the design rather than an accident: adding a kind means editing `review-items.ts`.
- **Fix:** `"reading"` added to `ScenarioItemKind` and `ITEM_KINDS` and **not** to
  `SCHEDULED_ITEM_KINDS`; the union's doc-comment rewritten to name both unscheduled kinds and the
  different reason each is one (writing takes an id for a **storage key**, reading for
  **uniqueness against the global bank's bare slugs**); the `resolveReviewItem` and `reviewableIds`
  comments widened to state the rule as conditional and to name which renderers score.
- **Why this is minimal:** no group another plan owns was edited, and the shared assertion
  `reviewableIds() covers every key space` was **not** touched — reading ids are absent from
  `reviewableIds()`, so its arithmetic holds unchanged, exactly as it did for writing.
- **Files modified:** `src/lib/review-items.ts` · **Commit:** `ba4a789`

**2. [Handover checked, not obeyed — the second time] The fourth edit was deliberately not taken.**
- **Found during:** Task 1, reading `ReadingRoom.tsx` before wiring anything.
- **Issue:** 03-05's rule is four edits; 03-06's finding is that the fourth is conditional on the
  renderer scoring something. `PassageReader` contains no `recordAttempt` call and no `useProgress`.
  Listing reading ids would add five permanent phantoms to `Dashboard`'s "Due today" filter set and
  give `ReviewHub`'s weak-spots drill five ids that resolve to nothing.
- **Fix:** the opposite of the fourth edit, asserted — a harness group proving no reading id is
  reviewable and every reading id resolves to nothing, with mutations M17 and M18 proving those
  assertions fire.
- **Note:** this is now **two banks out of three** where the fourth edit would have been wrong. The
  handover's rule should be read as *"four edits when something scores it, three and an assertion
  when nothing does"*, and the module's doc-comment now says so at the point of edit.

**3. [Rule 1 — bug] An explanation made a false claim about itself, caught by running the check as a
script rather than by rereading it.**
- **Found during:** Task 2, running this plan's own promises as a script — 03-06's lesson, applied
  to whatever my passages assert about themselves.
- **Issue:** `academic/summaries`' distractor explanation read *"“Seventeen” is the same digits in
  the other order."* It is not: 17 and 70 share only the digit 7. An explanation that is confidently
  wrong about its own example teaches the learner that the explanations are decorative — the same
  class of defect as 03-06's model answer breaking its own checklist.
- **Fix:** the **content** was rewritten, never the assertion: *"The wrong answer to be tempted by is
  seventeen: -teen and -ty differ by one syllable, and a fast reader takes the ending for granted."*
  That is the real confusion, and it is true.
- **Found by the same run, and fixed with it:** `academic/summaries`' main-idea explanation claimed
  "All four are in the passage" of four options one of which is a paraphrase of the conclusion.
  Reworded to "All four are drawn from the passage".
- **Files modified:** `src/lib/content/scenario-reading.ts` · **Commit:** `043aa0e`

**4. [Rule 1 — bug] The state tooling wrote wrong values for the SIXTH consecutive plan, and a
second, older defect surfaced next to the known one.**
- **Found during:** the state-update step, by diffing `STATE.md` against a snapshot taken before the
  first command rather than trusting any command's output.
- **The known defect, handled by 03-06's workaround rather than absorbed:** `last_activity_desc` is
  derived by a line-oriented read of the hard-wrapped `Last activity:` paragraph. 03-06's two
  consequences both held — I wrote the body sentence on **one physical line** (1,258 characters, no
  wrap) and wrote the frontmatter field **after the last tool write**, and the field came out whole
  for the first time in this phase. Both halves of the workaround are necessary: before I rewrote the
  body line, `record-session` had re-derived the field from 03-06's still-current paragraph, so the
  frontmatter said `03-06 executed…` while `stopped_at` said `03-07 complete`.
- **What was still wrong:**
  - `Progress: [█████████░] 89% (3 of 6 phases; **31** of 36 plans)` — **self-contradictory on its
    own line, for the third plan running**: `update-progress` moved the bar to 89% (32/36) and left
    the parenthetical at 31. Corrected to 32, which matches the 32 `*-SUMMARY.md` files on disk
    (6 + 7 + 12 + 7).
  - `**Current focus:** … plan **06** of 11 complete` — **stale, never advanced**, exactly as 03-05
    reported. Corrected to 07.
  - `stopped_at` — the tool **double-escaped** the embedded quotes it was handed, writing
    `\\\"reading\\\"` where `\"reading\"` was passed. The field is a quoted YAML scalar, so this is a
    corruption rather than a cosmetic issue; both `stopped_at` and `last_activity_desc` now parse
    cleanly as JSON strings, checked rather than eyeballed.
  - `state.add-decision` stamped **`- [Phase ?]:`** on all five decisions. Not new: **all 107
    pre-existing decisions in the file carry the same `[Phase ?]`**, so the phase has never been
    resolved by this command in the project's history. Only mine were corrected.
- **A mistake of my own, caught by the same diff and worth recording as a warning:** my first
  correction was a blanket `[Phase ?]` → `[Phase 03]` replace, which stamped **all 107 historical
  decisions** — including ones belonging to phases 01, 02 and 02.1 — with a phase they do not belong
  to. That is a worse state than the tool left, and it was invisible in the command output; only the
  line-by-line diff showed it. Reverted, then re-applied to exactly the five lines this plan added
  (now `- [Phase 03]: 03-07: …`, matching the house convention). Final counts verified against the
  snapshot: **5 `[Phase 03]`, 107 `[Phase ?]` — the same 107 as before the run.**
  **A blanket replace over a shared, append-only section is never in scope for one plan.**
- **Fix:** all four corrected by hand, `last_activity_desc` written last.
- **Files modified:** `.planning/STATE.md`
- **Also observed, pre-existing and NOT touched:** the frontmatter still says `total_phases: 4` while
  the progress line says `3 of 6 phases` and ROADMAP defines six; the **Velocity** block still reads
  `Total plans completed: 0` with an empty By-Phase table under a fully populated per-plan table.
  Neither was moved by this run.
- **`roadmap.update-plan-progress` was correct**, for what it is worth: `6/11 → 7/11`, the plan's
  checkbox ticked, and the progress-table row moved, with no hand-correction needed.
- **Note:** this is the **sixth consecutive plan in this phase** to hand-correct these fields. The
  wrap-truncation mechanism has been identified since 03-05 and the workaround works; the
  parenthetical/bar disagreement, the stale `Current focus`, the double-escaping and the unresolved
  `[Phase ?]` are four further small, specific tooling bugs. They should be raised as such rather
  than absorbed a seventh time.

**The mechanical rules that were run rather than read** (all green, listed so plan 08 can rerun them):

| Promise the content makes about itself | How it was checked | Result |
|---|---|---|
| Every fragment a question quotes from its own passage is a real quotation | ≥3-word curly-quoted spans must appear verbatim in that passage's body | 8 spans, all verbatim |
| `academic/summaries`' reading text ≠ its writing text | shared four-word runs; Jaccard over content words | **0 runs**, J = 0.115 |
| `travel/restaurant` is genuinely A2 | mean and max sentence length; count of ≥9-letter words | mean **10.4**, max 17, 2 long words in 144 |

**Not a deviation, but worth stating: CONT-01 was NOT ticked.** It reads "**Every** existing
scenario … offers real practice in **each** of its applicable skills", and the registry says 18/52.
`REQUIREMENTS.md` is untouched. **Assert the closure predicate before ticking, never after.**

---

## Verification Results

**Every `<verify>` block in the plan was run. All passed.**

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6674** assertions passed · 35/35 · 35/35 · **15/52** |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| `grep -Eq 'export function PassageReader' ReadingRoom.tsx` | **PASS** |
| the inline wiring assertion | `reading wired: 2 of 9 reading pairs written` (7 pending, as `<done>` predicts) |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6815** assertions passed · **18/52** |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 (`✓ Compiled successfully`, 113/113 static pages) |
| the closing assertion | `5 of 9 reading pairs written; the 4 C1 pairs remain` — `social/humor · academic/articles · native/idioms · native/culture` |

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 6557 | **6815** (+258: this plan's content and gates) |
| `verify-merge` | 25647 | 25647 |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` all exit 0. **No packages were installed.**

**The per-skill convention, honoured.** Every gate in this plan closes on
`pendingPairs().filter(p => p.skill === "reading")`. There is no `pairsWritten` assertion anywhere in
this plan or in its seven harness groups — which matters more from here than it did before, because
plans 08 and 09 both depend on this one and run in the same wave, where there is no merge order to
assert about. The printed `18/52` is a **report**, not a gate.

**Per-skill pending on completion:** `{"speaking": 30, "reading": 4}` — 34 total. Grammar 0 (03-05),
writing 0 (03-06).

---

## Mutation testing — 31 declared, 31 EXECUTED

Run against `verify-scenario-content.mts`. Every hardening the earlier plans paid for was carried:

1. **Anchors extracted from the real file by unique substring at apply time**, never hand-typed. Zero
   matches or many matches **abort**; an anchor containing a line terminator is **refused outright**,
   so CRLF-vs-LF cannot make a mutation silently unreproducible. This plan touched files of both
   kinds (`scenario-reading.ts` LF in the working tree, `review-items.ts` and `scenario-coverage.ts`
   CRLF), so the refusal is not theoretical here.
2. **A "caught" verdict requires the EXPECTED ASSERTION LABEL** in the output, not merely exit 1. All
   22 matched their intended label; none was caught only by the wrong assertion.
3. **Controls always included** — six, all expected to survive, all did.
4. **Declared vs EXECUTED counted**, mismatch invalidates the sweep. Reported
   `declared 31 · EXECUTED 31`.
5. **A non-empty `git diff` landing proof** required before any verdict; the tree asserted clean
   before the sweep and after every single mutation.
6. **03-04's note honoured: the unwritten-key technique is retired**, so the D-01 mutation was made
   at the **accessor** (M21).

| | Caught, with its expected label | Survived (expected) |
|---|---|---|
| Floors & required fields | **M1** every passage truncated to one question · **M2** truncated to one paragraph · **M3** a whitespace explanation · **M4** a whitespace title · **M5** the glossary cut to one entry | **C1** reworded body sentence · **C3** a *fifth* question · **C4** comment-only |
| Silently-wrong questions | **M6** answer index past the end of its own options · **M7** an option repeated inside one question · **M8** a passage at a level that is not its scenario's · **M9** one explanation pasted under every key | **C2** reworded stem · **C5** reworded option · **C6** reordered glossary |
| Question ids | **M10** ids derived from array position · **M11** every id the same slug | — |
| Bank keys | **M12** typo'd key (`academic/nwes`) · **M13** an entry for `academic/debate`, which does not declare reading | — |
| Ids (D-06) | **M14** every id naming `travel/restaurant` · **M15** ids composed under kind `vocab` · **M16** the id replaced by the GLOBAL bare slug `"coffee"` | — |
| The UNSCHEDULED leg | **M17** a reading id smuggled into `reviewableIds` · **M18** a reading id resolving to a review card | — |
| Coverage (D-03) | **M19** the bank unwired from `EXERCISE_SOURCES` · **M20** the summary's unit reworded off "passage" | — |
| D-01, at the accessor | **M21** every scenario handed `travel/restaurant`'s passage · **M22** a passage taking a GLOBAL reading-room title | — |
| The applier itself | **SELF-MISSING** 0 matches → aborted · **SELF-AMBIG** 21 matches → aborted · **SELF-MULTILINE** anchor spanning a line terminator → refused | — |

**22 caught (each with its expected label), 6 controls survived, 3 applier refusals, 0 spurious,
0 unexpected.** The restored tree reproduced **6815** exactly and `git status` came back clean.

**M16 is the one worth naming.** It is the mutation that justifies composing an id for a bank that
never enters the review queue: replace the composed id with the global bank's own `"coffee"` and the
collision fires. Without the namespace there is nothing to fire.

---

## The duplicate scans, over the full corpus including the five new passages

> **The caveat 03-04, 03-05 and 03-06 all recorded applies, and applies to their figures too.** This
> is a re-implementation from the method 03-03 described, not the identical script. **Pair counts are
> directly comparable across plans; thresholds are not.** Mine reproduces **21,420** phrase pairs and
> **38,080** term pairs exactly — so the corpora agree with all three predecessors — but its stop-word
> list differs again (mine stops `into`, `over`, `under`, `about`, `again`, `out`, `up`, `down`,
> `off`), which moves individual Jaccard scores without moving one item of content.
>
> **Thresholds used here: phrases 0.4 · terms 0.5 · grammar prompts 0.4 · grammar explanations 0.5 ·
> writing tasks 0.4 · writing models 0.4 · writing titles 0.5 · writing checklist lines 0.5 ·
> reading bodies 0.4 · reading stems 0.5 · reading explanations 0.5 · reading titles 0.5.**

**Scan 1 — exact repeats**, case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 210 | 210 | **0** |
| Spanish glosses | 210 | 210 | **0** |
| Vocabulary terms | 280 | 280 | **0** |
| Card examples | 280 | 280 | **0** |
| Grammar prompts | 20 | 20 | **0** |
| Grammar explanations | 20 | 20 | **0** |
| Writing titles / tasks / models | 9 / 9 / 9 | 9 / 9 / 9 | **0** |
| Writing checklist lines | 45 | 45 | **0** |
| **Reading titles** | **5** | **5** | **0** |
| **Reading passage bodies** | **5** | **5** | **0** |
| **Reading question stems** | **20** | **20** | **0** |
| **Reading explanations** | **20** | **20** | **0** |
| **Reading options (all)** | **76** | **76** | **0** |
| **Reading glossary words** | **19** | **19** | **0** |

**76 options, 76 distinct.** That is the number this corpus would have shown fatigue in first — and,
unlike 03-05's grammar options (where five bare auxiliaries repeat because English has a dozen), a
reading distractor is a full clause drawn from its own passage, so there is no closed set to hide
behind and no repeat to excuse. There are none.

**Scan 1b — cross-namespace exact.** reading stems ↔ grammar prompts **0**; reading explanations ↔
grammar explanations **0**; reading explanations ↔ writing checklist **0**; reading options ↔ phrase
texts **0**; reading glossary words ↔ vocabulary terms **0**; reading bodies ↔ writing tasks **0**;
reading bodies ↔ writing models **0**. No authored line appears in two namespaces anywhere in the
phase's corpus.

**Scan 2 — Jaccard over content words**, cross-scenario pairs only:

| Corpus | Pairs compared | Above threshold |
|---|---|---|
| Phrase texts | 21,420 | 3 |
| Vocabulary terms | 38,080 | 3 |
| Grammar prompts / explanations | 150 / 150 | 0 / 0 |
| Writing tasks / models / titles / checklist | 36 / 36 / 36 / 900 | 0 |
| **Reading bodies** | **10** | **0** |
| **Reading question stems** | **160** | **0** |
| **Reading explanations** | **160** | **0** |
| **Reading titles** | **10** | **0** |

All six hits are **pre-existing content, none of it this plan's**, and all six are the closed-set
artefacts the previous three plans already adjudicated: `How was your weekend?` ⟷ `What are you up to
this weekend?` (J = 1.00, the pair 03-04 first reported), `How's it going?` ⟷ `Yeah, that's not going
to work for us.` and `I'd like a window seat, please.` ⟷ `I'd like to make an appointment, please.`
(both stop-list artefacts of my particular list), and three phrasal-verb pairs (`catch up`/`catch
on`, `run into`/`run over`, `talk over someone`/`talk someone into something`) — English has about a
dozen particles and any two phrasal verbs draw from the same dozen.

**Scan 3 — the five new passages against the GLOBAL reading room's eighteen**, the check this corpus
specifically needed, because "serve the global bank with a scenario heading on top" is exactly the
failure D-01 names:

| Comparison | Pairs | Above threshold |
|---|---|---|
| scenario body ⟷ global body | 90 | **0** (> 0.4) |
| scenario title ⟷ global title | 90 | **0** (> 0.5) |
| scenario question stem ⟷ global question stem | 900 | **0** (> 0.5) |
| scenario body ⟷ global writing-room task | 45 | **0** (> 0.4) |

The harness gates the exact version of this permanently (`no scenario passage is a global
reading-room passage`, `no scenario passage takes a global reading-room title`), and mutation **M22**
proves it fires.

**Scan 4 — four-word runs shared between any reading passage and any other authored text** in the
phase's corpus (writing tasks, writing models, the global reading room, the global writing room):
**0**. This is the rule `academic/summaries`' own writing checklist imposes on the learner, run
against the passages instead.

**Nothing in the new reading corpus came close to any threshold.**

---

## Browser observation — served HTML against a production build

`npm run start` on port 3000. **Shut down afterwards: no listener, no socket in any state, and
`curl` to `localhost:3000` is refused.** From the served HTML:

- **All five pairs render the standalone reader as their own step.** `/world/travel/restaurant` shows
  `Practise reading` carrying the `A2` badge, `3 min`, `Read aloud`, *The Lunch Menu at the Blue
  Door*, the body, the `Glossary` block with `a set lunch`, the four questions and `Check answers`.
  `/world/practical/housing` the same at `B2 · 4 min` with *What Happens Between the Viewing and the
  Keys* and `a holding deposit`.
- **No back link and no level filter anywhere on a scenario page.** `All texts` and `All levels` are
  both absent from every scenario page and present on `/skill/reading`. The reader really is serving
  two shapes from one component.
- **The honest panel still works on the same page.** `travel/restaurant` and `practical/housing` both
  render reading and still show **speaking** as `Not yet available`, by name, with its link. D-03
  holds *within a single page*, which is its strongest form.
- **`academic/summaries` renders both of its exercises, with two different texts** — *The Open Plan
  Paradox* under `Practise reading` and the induced-demand passage under `Practise writing`. The
  third success criterion, observed rather than argued.
- **Neither the explanations nor the answer indices are in the served bytes at all.** `grep` for an
  explanation returns 0 and for `"answer":N` returns 0, including inside the RSC flight payload:
  `ScenarioPractice` is a client component, so only `world` and `scenario` cross the boundary and the
  bank is read from the client chunk. **T-03-12's `accept` disposition holds**, and the explanation
  is strictly better hidden than the key was before, because it is also gated on `submitted`.
- **`/skill/reading`**: *"**5** of the **9** scenarios that train your reading have practice written
  for the situation itself — the rest are on the way, and say so:"* with exactly **4**
  `Not written yet` badges. Neither number typed; both come off the banks. The global reading room
  above it still shows `All levels` and its full list (`A Morning Ritual`, `The Ship of Theseus`).

---

## What has NOT been seen by a human

**Nobody has pressed Check answers on a scenario passage, so the explained key has never been seen.**
Every explanation is behind `{submitted && q.explain}`, which is why it is absent from the served
HTML — and absent from `curl`'s reach. So *"every scenario comprehension question tells the learner
why the answer is the answer"* is proved by construction (the type requires it, the harness asserts
all twenty non-empty after trimming, mutation M3 catches a whitespace one) and **not by sight**.

**Nor has anyone confirmed the global reading room's own reader still shows its back link** after
choosing a text from the list. The `ReadingRoom` browser function is byte-identical in the diff and
the link is behind `onBack`, which that path always passes — proved by reading, not by seeing.

Both recorded as **`.planning/WINDOWS.md` entry 37**, owed to plan 03-11's browser pass alongside
entries 29–35.

## Known Stubs

**None introduced.** One branch of `ScenarioPractice`'s switch (speaking) still renders the honest
"Not yet available" panel — plan 03-01's documented, load-bearing state, owned by plans 03-09 and
03-10. The four C1 reading pairs report unwritten and are plan 03-08's. `pendingPairs()` returns 34,
which is true, and no surface this plan touched claims otherwise.

**One thing added and not yet consumed, recorded rather than hidden:** `ReadingQuestion.id` is
optional on the global shape, required on the scenario shape, asserted unique-within-passage and
non-positional — and **read by nothing**. `PassageReader` still keys the learner's answers by array
index, exactly as it did before. The plan asked for a stable id and the harness gates it; it is a
handle for a later plan (a per-question attempt, a deep link, a tutor reference) rather than
something in use today. That is stated in the field's own doc-comment so a later reader does not
assume it is load-bearing.

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file access.
The register's five `mitigate` dispositions were honoured:

- **T-03-17** (exporting the reader regressing the global reading room) — the `ReadingRoom` browser
  function does not appear in the diff; both changes inside `PassageReader` are gated on a prop the
  global path always passes and a field the global passages never carry. `tsc`, `lint` and `build`
  exit 0, and `/skill/reading` was read from the served HTML with its filter and list intact.
- **T-03-11** (an answer index not addressing its own options, or repeated options) — both asserted
  on all twenty questions; **M6** and **M7** each caught.
- **T-03-18** (an optional explanation being forgotten) — `ScenarioReadingQuestion` makes it
  required, the harness asserts it non-empty after trimming and distinct within its passage, and
  **M3** and **M9** both fire. The optional field on the global shape exists only so the eighteen
  shipped passages keep compiling, and its doc-comment says exactly that.
- **T-03-04** (coverage summaries assembled from passage text) — every summary is `"1 passage"`;
  **M20** catches a reworded unit, and no paragraph, option, explanation or glossary line enters a
  summary string.
- **T-03-12** (the key reaching the reader before submission) — `accept`, and observed to be
  unchanged: no new route, no server-side reveal, and neither the answer index nor the explanation
  appears in the served bytes at all.
- **T-03-SC** (package installs) — zero installed; dependencies unchanged at **11 + 11**.

## For plan 03-08 (four C1 passages) and 03-09

- **The reader is done.** Mount `<PassageReader passage={…} accent={…} />` with **no `onBack`**; the
  dispatch branch and the registry entry already exist and need no edit. Your only file is
  `src/lib/content/scenario-reading.ts`.
- **Add four entries to `BANK` under a `C1` heading** — `social/humor`, `academic/articles`,
  `native/idioms`, `native/culture`. Nothing else in the module changes: the accessor, the lazy
  composition and `scenarioReadingKeys()` all pick them up.
- **The floors the harness enforces:** ≥2 paragraphs, ≥2 glossary entries, ≥2 questions, ≥3 options
  per question, options distinct within a question, `answer` addressing its own options, a required
  non-empty `explain` distinct from every other explanation in the same passage, question ids unique
  and non-positional, the passage at **its scenario's own level**, and nothing byte-identical to
  another scenario's or to a global passage or title. My five sit comfortably above all of them
  (4 questions each, 3–4 glossary entries, 3–4 options).
- **Your closing assertion is `pendingPairs().filter(p => p.skill === "reading").length === 0`**,
  never the global written total — 03-09 lands in the same wave.
- **Read the scenario's briefing, phrase set and deck first.** Four of the five here would have
  repeated existing material otherwise; `native/idioms` and `native/culture` in particular have
  dense decks that will collide with an unread author.
- **Run whatever your passages promise about themselves as a script.** Mine made two false claims
  about their own examples on first draft and no amount of rereading had caught either.
- The harness remains a low-conflict append target: this plan added **two import lines and seven
  groups at the bottom**, and edited **no group another plan owns**.

## Self-Check: PASSED

`src/lib/content/scenario-reading.ts` exists on disk (593 lines); all six modified files exist; both
commits (`ba4a789`, `043aa0e`) are in `git log`; `git diff --diff-filter=D` is empty for each, so no
commit deleted a tracked file; the restored tree after the mutation sweep reproduces **6815**
assertions and `git status --porcelain` shows only the pre-existing untracked `.claude/` plus the
intended planning documents. Port 3000 has no listener and no socket, and a request to it is refused.
