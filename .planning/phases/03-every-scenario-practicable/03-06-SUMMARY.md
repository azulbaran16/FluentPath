---
phase: 03-every-scenario-practicable
plan: 06
subsystem: scenario-content
tags: [content, cont-01, writing, coverage, derived-ui, mutation-testing, unscheduled-ids]
status: complete
requires:
  - src/lib/review-items.ts (scenarioItemId — plan 03-01)
  - src/lib/scenario-coverage.ts (EXERCISE_SOURCES, pendingPairs — plan 03-01)
  - src/components/practice/WritingDesk.tsx (the desk, the draft key, the self-check panel)
  - src/lib/content/writing.ts (the WritingPrompt shape and the house style)
  - scripts/verify-scenario-content.mts (the phase's content gate — plan 03-01)
  - .planning/phases/03-every-scenario-practicable/03-05-SUMMARY.md (the wiring handover)
provides:
  - "src/lib/content/scenario-writing.ts — getScenarioWriting, scenarioWritingKeys; 9/9 writing pairs"
  - "src/lib/review-items.ts — ScenarioItemKind gains \"writing\" as an UNSCHEDULED kind; SCHEDULED_ITEM_KINDS"
  - "src/components/practice/WritingDesk.tsx — single-task mode (no picker below two prompts)"
  - "src/lib/scenario-coverage.ts — the writing EXERCISE_SOURCES entry"
affects:
  - src/components/practice/ScenarioPractice.tsx (the writing branch of the dispatch)
  - "src/app/(catalog)/skill/[skill]/page.tsx (writing now reads 9 of 9, derived)"
  - src/components/ScenarioView.tsx (nine header pills stop being muted, derived)
  - .planning/WINDOWS.md (entries 35 and 36)
tech-stack:
  added: []
  patterns:
    - "reuse the EXISTING exercise shape per skill; the renderer needs no scenario-awareness"
    - "an UNSCHEDULED id kind — composed for STORAGE scoping, asserted absent from the review queue"
    - "compose SRS ids LAZILY when the bank and the resolver share an ESM cycle"
    - "assert per-skill pending pairs, never a global written total"
    - "a checklist line that is mechanically checkable is a checklist line you can run as a script — and must"
key-files:
  created:
    - src/lib/content/scenario-writing.ts
  modified:
    - src/lib/review-items.ts
    - src/lib/scenario-coverage.ts
    - src/components/practice/ScenarioPractice.tsx
    - src/components/practice/WritingDesk.tsx
    - scripts/verify-scenario-content.mts
decisions:
  - "The fourth edit of 03-05's handover (reviewableIds) was deliberately NOT taken: WritingDesk never calls recordAttempt, so writing writes nothing to the SRS. The negative is ASSERTED instead — no writing id is reviewable, and every writing id resolves to nothing"
  - "review-items.ts was edited although it is not in files_modified: scenarioItemId's kind parameter is typed, so the plan's own instruction to compose ids through it did not compile without a \"writing\" kind"
  - "The academic/summaries model answer broke its own checklist on the first draft — two four-word runs copied from the passage. The CONTENT was rewritten, never the assertion"
  - "One task per pair rather than a set: a writing brief is not scored, so there is no 'out of N' to make plural. D-04's density in the shape this skill actually has"
  - "CONT-01 was NOT ticked. It is at 13/52; the requirement says EVERY pair"
metrics:
  duration: ~24min
  tasks: 3
  commits: 3
  completed: 2026-08-01
---

# Phase 3 Plan 06: Scenario Writing, All Nine Pairs Summary

All nine scenario×skill pairs that declare writing now have a brief written for their own
situation — a real reader, a word range at the scenario's own level, a checklist that names what
the draft must contain, and an original model answer that passes that checklist and sits inside its
own word range — rendered as **one task rather than as a picker with a single option**.
**CONT-01 moves from 4/52 to 13/52**, and writing joins grammar as a closed quarter.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `7a8f745` | `scenario-writing.ts`, the `"writing"` item kind, the registry entry, the dispatch branch, the desk's single-task mode, 7 harness groups — proved on the three B1 pairs |
| 2 | `9cb5325` | `social/complaining`, `work/presentations`, `work/networking` at B2 |
| 3 | `656182e` | `academic/summaries` (B2), `academic/debate` (C1), `native/register` (C1) — writing closes |

**Registry state on completion: 13/52 pairs written · 39 pending — speaking 30, reading 9,
grammar 0, writing 0 · 35/35 phrases · 35/35 vocabulary.**
9 tasks, 45 checklist lines, 9 model answers, **2,378 authored words** (264.2 per prompt: 612 task,
1,167 model, 599 checklist).

---

## 1. The handover was followed — and its fourth edit was checked rather than obeyed

03-05's handover is emphatic: **wiring a scenario exercise is four edits, not three**, and the
fourth (`reviewableIds()`) is the one that fails silently. Three of the four applied here verbatim:

**(a) The registry — one entry, nothing else in the file.**

```ts
// src/lib/scenario-coverage.ts
writing: (w, s) => {
  const prompt = getScenarioWriting(w, s);
  return prompt && { items: [prompt], unit: "task" };
},
```

**(b) The dispatch — look the pair up, hand it to the existing renderer.**

```tsx
// src/components/practice/ScenarioPractice.tsx
case "writing": {
  const prompt = getScenarioWriting(world.slug, scenario.slug);
  if (!prompt) return <NotWrittenYet skill={skill} scenario={scenario} />;
  return <WritingDesk prompts={[prompt]} accent={props.accent} />;
}
```

**(c) Resolution — one branch, and it returns nothing on purpose.** See §2.

**(d) `reviewableIds()` — deliberately NOT extended, and that is the finding.**
The handover's rule is conditional: *"if your bank writes to the SRS."* `WritingDesk` **never calls
`recordAttempt`** — checked in the file, not assumed. A writing task is drafted, self-checked
against its list, and compared against a model; nothing scores it and nothing schedules it. Listing
its ids would put a **permanent phantom** in `Dashboard`'s "Due today" count (an item that can never
come due, because nothing ever writes `srs["…#writing#…"]`) and hand `ReviewHub`'s weak-spots drill
an id that resolves to nothing.

So the negative is **asserted** rather than left as an omission that looks like one:

```
no scenario writing id is listed as reviewable
resolveReviewItem returns nothing for work/emails#writing#move-a-deadline    (×9)
a writing id still round-trips through the id format
```

Mutation **M15** (a writing id smuggled into `reviewableIds`) and **M16** (a writing id resolving to
a card) both fire. **Plans 03-07 and 03-09 should ask the same question of their own bank before
copying the fourth edit: does anything score it?** Reading almost certainly yes; speaking depends on
the shape chosen.

---

## 2. An UNSCHEDULED id kind, and why the id is composed anyway

The plan requires each prompt's id to be the fully composed scenario item id, authored only by
`scenarioItemId`. That parameter is **typed** (`kind: ScenarioItemKind`), and the union had no
`"writing"` member — so the instruction did not compile. `review-items.ts` gained one:

```ts
export type ScenarioItemKind = "phrase" | "vocab" | "grammar" | "writing";
export const SCHEDULED_ITEM_KINDS: readonly ScenarioItemKind[] = ["phrase", "vocab", "grammar"];
```

The union's doc-comment now names two classes rather than one, because the old rule — *"a kind added
here must also gain a branch in `resolveReviewItem` and a source in `reviewableIds`"* — is right for
scored kinds and **wrong for this one**.

**Why compose an id at all for something that is never scheduled?** Storage, not scheduling.
`WritingDesk.tsx:22` derives its draft key from the prompt id:

```ts
const storageKey = `fluentpath:writing:${prompt.id}`;
```

An id that names its own scenario makes two scenarios' drafts **structurally unable to collide**
(T-03-14) rather than merely unlikely to. The harness asserts the ids are globally unique and
disjoint from the global writing prompts, the global grammar bank, the deck-browser cards, the
recall items and the scenario grammar ids — five key spaces. Mutation **M7** (every id composed
under `work/emails`) is caught.

`resolveReviewItem` got an explicit branch that returns `undefined` for any unscheduled kind. It is
**defence in depth, not load-bearing today**, and the sweep says so: control **C7** removes the
guard and the harness still passes, because the recall lookup underneath returns `undefined` anyway.
Reporting that honestly is more useful than claiming a mutation score the guard has not earned — the
guard exists so that the *next* kind added cannot fall through into the recall lookup by accident.

**Composition is lazy**, exactly as 03-05 instructed, and was verified from three entry points
(`review-items.ts` first, `scenario-writing.ts` first, `scenario-coverage.ts` first) rather than
reasoned about.

---

## 3. The component change, and the one line that was not obvious

`WritingDesk` rendered a prompt picker unconditionally. Below two prompts the row is now not
rendered at all:

```tsx
const showPicker = prompts.length > 1;
…
<div className={`grid gap-5 lg:grid-cols-2 ${showPicker ? "mt-4" : ""}`}>
```

The `mt-4` is the part worth naming: hiding a row and leaving the margin that separated it produces
a stray gap at the top of a panel that now begins the section. Observed in the served HTML — the
scenario page's markup goes straight from `<div>` to `<div class="grid gap-5 lg:grid-cols-2 ">`,
with no picker and no top margin.

**Everything else is untouched:** the editor, the word counter and its in-range state, the draft
save, the checklist and the model-answer reveal.

---

## 4. The nine tasks, and what each was written to do

Every scenario's **briefing, phrase set and vocabulary deck were read before authoring**, per
03-05's handover, and each task was chosen to be the half those banks cannot reach.

| Scenario | Level | The task, and why it is not the phrase set again |
|---|---|---|
| `work/emails` | B1 | The phrases are the *mechanics* of email (copying people in, spam folders) and the 03-05 grammar set is *tone*. So: an email carrying bad news that still has to get a yes — **ask for a deadline to move** |
| `travel/hotel` | B1 | Every phrase in the scenario is **spoken at a desk**. Writing before you arrive is the half where nobody can ask a follow-up: **a late-arrival message that has to be complete on first reading** |
| `practical/tech-support` | B1 | The phrases are what you say **on the phone**, where you can repeat yourself. A ticket gets no second question: **a bug report a stranger can reproduce** |
| `social/complaining` | B2 | The global writing room already has a complaint — a damaged parcel, to a support queue. This is the harder kind: **a complaint to someone you pass on the stairs tomorrow** |
| `work/presentations` | B2 | The phrases are entirely about being **in the room**. Of the plan's three candidates (abstract / summary after / handover) the handover was chosen: it is unambiguous, and it is **instructions rather than prose** — a genuinely different writing skill from the other eight |
| `work/networking` | B2 | The phrase set ends at the handshake. This begins **two days later**, when she has met sixty people: be identifiable in two lines, give before asking, and ask for anything but a job |
| `academic/summaries` | B2 | **The source passage is part of the task and is original** — a summary exercise that borrowed its passage would put someone else's writing into the app under a heading claiming it was written for this scenario |
| `academic/debate` | C1 | C1 because of the **move**, not the vocabulary: state the objection in words its own supporters would sign, then concede something real. *"Of course there are downsides"* is the failure the checklist names |
| `native/register` | C1 | The scenario **is** the difference between two registers, so one message cannot test it. The same news twice, and every checklist line compares the versions rather than judging each alone |

### Two authoring constraints held deliberately

**Checklist lines name CONTENTS, never quality.** "A subject line naming the report and the word
'deadline'" can be ticked by looking. "Good structure" cannot. Every one of the 45 lines is of the
first kind — that is the entire feedback loop until the tutor lands in Phase 5, and a line the
learner cannot check is a line that does nothing.

**Two prompts have checklists that are mechanically checkable, so they were checked mechanically.**
`native/register` asks for three or more contractions in the casual version and none in the formal
one, an apology carried by the single word "sorry" in one and by a formula in the other. Its model
scores 9 / 0 and passes every line. `academic/summaries` asks for no run of four or more words
copied from the passage — and **the first draft of its own model answer broke that rule twice**
(`who had been avoiding the` and `planners call this induced demand`). See the deviations.

---

## Deviations from Plan

**Three, all recorded rather than absorbed.**

**1. [Rule 3 — blocking issue] `review-items.ts` was edited although it is not in `files_modified`.**
- **Found during:** Task 1, the moment the bank tried to compose an id.
- **Issue:** the plan instructs *"author each prompt's `id` as the fully composed scenario item id,
  using plan 01's id function so there is one spelling of the format in the codebase."*
  `scenarioItemId(scenarioKey, kind, localId)` types `kind` as `ScenarioItemKind`, a closed union of
  `"phrase" | "vocab" | "grammar"`. The instruction therefore did not type-check. The two ways out
  were to spell the format by hand in the bank — which the same sentence forbids, and which is the
  drift the one-author rule exists to prevent — or to widen the union.
- **Fix:** `"writing"` added to `ScenarioItemKind` and `ITEM_KINDS`, plus a new exported
  `SCHEDULED_ITEM_KINDS` naming the three kinds that actually enter the queue, an explicit
  early-return branch in `resolveReviewItem`, and a rewritten doc-comment that distinguishes
  scheduled from unscheduled kinds instead of assuming every kind is scheduled.
- **Why this is minimal rather than convenient:** `parseScenarioItemId` now accepts a writing id, so
  the id round-trips and the draft key is analysable; nothing else in the module's behaviour moved.
  The pre-existing shared assertion `reviewableIds() covers every key space` was **not** touched —
  writing ids are absent from `reviewableIds()`, so its arithmetic still holds unchanged. 03-05 had
  to widen that line; this plan did not, and no group another plan owns was edited.
- **Files modified:** `src/lib/review-items.ts`
- **Commit:** `7a8f745`

**2. [Handover checked, not obeyed] The fourth edit was deliberately not taken.**
- **Found during:** Task 1, reading `WritingDesk.tsx` before wiring anything.
- **Issue:** the handover says four edits, and its fourth is `reviewableIds()`. Applying it here
  would have been wrong: `WritingDesk` contains no `recordAttempt` call, so nothing writes
  `srs["…#writing#…"]` ever. Listing writing ids would add nine items to `Dashboard`'s "Due today"
  filter set that can never come due, and give `ReviewHub`'s weak-spots drill nine ids that resolve
  to nothing.
- **Fix:** the opposite of the fourth edit, asserted rather than assumed — a whole harness group
  proving no writing id is reviewable and every writing id resolves to nothing, plus mutations
  **M15** and **M16** proving those assertions have teeth.
- **Note for 03-07 and 03-09:** the rule is *conditional*. Ask whether your renderer scores anything
  before copying the fourth edit; the cost of getting it wrong is symmetric (omit it when scored →
  invisible items; add it when unscored → phantom items), and only one of those two failures is
  documented in the handover.

**3. [Rule 1 — bug] The `academic/summaries` model answer broke its own checklist, and the content
was rewritten rather than the assertion.**
- **Found during:** Task 3, by **running the checklist's own rule as a script** instead of reading
  the model and feeling satisfied.
- **Issue:** the checklist demands *"no run of four or more words copied from the passage."* The
  first draft of the model contained two: `who had been avoiding the` and
  `planners call this induced demand`. A model answer that fails the list it is modelling teaches
  the learner that the list is decorative — the same class of defect as a model that breaks its own
  word range, which the plan already asked to be gated.
- **Fix:** the model was rewritten (`lures back the drivers who once kept away`, `The effect is
  known as induced demand`). The rule now scores **0 shared four-word runs**, while still keeping
  the term `induced demand` (which the next checklist line requires) and still omitting both
  examples. Word count 81, inside its 55–90 range.
- **Not fixed by weakening:** an exemption clause for `induced demand` was considered and rejected —
  the term is two words and can never form a four-run on its own, so the strict line is both correct
  and non-contradictory.
- **Files modified:** `src/lib/content/scenario-writing.ts`
- **Commit:** `656182e`

**4. [Rule 1 — bug] The state tooling wrote wrong values for the FIFTH consecutive plan.**
- **Found during:** the state-update step, by diffing `STATE.md` against a snapshot taken before the
  first command rather than trusting any command's output.
- **Root cause, already identified by 03-05 and confirmed again here:** `last_activity_desc` is
  derived by a **line-oriented read of a hard-wrapped `Last activity:` paragraph**, taking only the
  first physical line. Every later `state.*` command re-derives and re-truncates it. 03-05's two
  consequences both reproduced: the field must be corrected **after the last tool write**, and a
  single-physical-line `Last activity:` sentence survives.
- **What was wrong this time:** see the state section at the end of this summary for the exact
  fields corrected.
- **This is the fifth consecutive plan in this phase to hand-correct it.** With the mechanism
  identified and now confirmed on a second plan, it is a small specific tooling fix and should be
  raised as one rather than absorbed a sixth time.

**Not a deviation, but worth stating: CONT-01 was NOT ticked.** It reads "**Every** existing
scenario … offers real practice in **each** of its applicable skills", and the registry says 13/52.
`REQUIREMENTS.md` is untouched. **Assert the closure predicate before ticking, never after** — the
predicate is false, so there is nothing to tick.

---

## Verification Results

**Every `<verify>` block in the plan was run. All passed.**

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6437** assertions passed · 35/35 · 35/35 · **7/52** |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| the inline wiring assertion | `writing wired: 3 of 9 writing pairs written` (6 pending, as `<done>` predicts) |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6497** assertions passed · **10/52** |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| the closing assertion | `6 of 9 writing pairs written` |

**Task 3**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6557** assertions passed · **13/52** |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 (`✓ Compiled successfully`, 113/113 static pages) |
| the closing assertion | `writing complete: 9 of 9 writing pairs written` |

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 6355 | **6557** (+202: this plan's content and gates) |
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
`pendingPairs().filter(p => p.skill === "writing")` — a statement about **one skill**, true no matter
which sibling plan merged first. There is no `pairsWritten` assertion anywhere in this plan or in
its harness groups. The printed `13/52` is a **report**, not a gate.

**Per-skill pending on completion:** `{"speaking": 30, "reading": 9}` — 39 total. Grammar 0
(03-05), writing 0 (this plan).

---

## Mutation testing — 27 declared, 27 executed

Run against `verify-scenario-content.mts`. Every hardening the earlier plans paid for was carried:

1. **Anchors extracted from the real file by unique substring at apply time**, never hand-typed.
   Zero matches or many matches **abort**; an anchor containing a line terminator is **refused
   outright**, so CRLF-vs-LF cannot make a mutation silently unreproducible (this repo has both, and
   git normalises `scenario-writing.ts` to CRLF on checkout).
2. **A "caught" verdict requires the EXPECTED ASSERTION LABEL**, not merely exit 1. All 18 matched
   their intended label; none was caught by the wrong assertion.
3. **Controls always included** — six, all expected to survive.
4. **Declared vs EXECUTED counted**, mismatch invalidates the sweep. Reported `declared 27 ·
   EXECUTED 27`.
5. **A non-empty `git diff` landing proof** required before any verdict; the tree asserted clean
   before the sweep and after every single mutation.

| | Caught, with its expected label | Survived (expected) |
|---|---|---|
| Floors & required fields | **M1** a checklist emptied of every line · **M2** a checklist line that is a space · **M3** the same line twice in one prompt | **C1** reworded checklist line · **C3** a *sixth* line · **C4** comment-only |
| The word range | **M4** a minimum above its own maximum · **M5** a task asking for zero words · **M6** a model that breaks the brief it models | **C6** a widened range the model still sits inside |
| Ids (D-06) | **M7** every id composed under `work/emails` · **M8** ids composed under kind `vocab` · **M9** a slug that is an array position | — |
| Keys | **M10** typo'd bank key (`work/emials`) · **M11** an entry for `social/dating`, which does not declare writing | — |
| D-01, at the accessor | **M12** every scenario handed `work/emails`' task · **M13** every prompt at a level that is not its scenario's · **M14** a scenario handed the GLOBAL writing room's task | **C2** reworded title |
| The UNSCHEDULED leg | **M15** a writing id smuggled into `reviewableIds` · **M16** a writing id resolving to a review card | **C7** the unscheduled guard removed |
| Coverage (D-03) | **M17** the bank unwired from `EXERCISE_SOURCES` · **M18** the summary's unit reworded off "task" | — |
| The applier itself | **SELF-MISSING** 0 matches → aborted · **SELF-AMBIG** 11 matches → aborted · **SELF-MULTILINE** anchor spanning a line terminator → refused | — |

**18 caught (each with its expected label), 6 controls survived, 3 applier refusals, 0 spurious,
0 unexpected.** The restored tree reproduced **6557** exactly.

**C7 is the one worth naming, because it is a negative result reported rather than hidden.**
Removing the `!SCHEDULED_ITEM_KINDS.includes(...)` guard in `resolveReviewItem` does **not** break
the harness: the recall lookup underneath returns `undefined` for a writing id anyway. The guard is
therefore defence in depth for the *next* kind, not load-bearing today, and the assertion that has
real teeth is **M16** — which mutates the guard into returning something.

---

## The duplicate scans, over the full corpus including the nine new tasks

> **The caveat 03-04 and 03-05 both recorded applies, and applies to their figures too.** This is a
> re-implementation from the method described in 03-03's summary, not the identical script. **Pair
> counts are directly comparable across plans; thresholds are not.** Mine reproduces **21,420**
> phrase pairs and **38,080** term pairs exactly — so the corpora agree with 03-04 and 03-05 — but
> its stop-word list differs again (mine stops `into`, `over`, `under`, `about`, `again`; it does
> **not** stop `up`), which moves individual Jaccard scores without moving a single item of content.
>
> **Thresholds used here: phrases 0.4 · terms 0.5 · grammar prompts 0.4 · grammar explanations 0.5 ·
> writing tasks 0.4 · writing models 0.4 · writing titles 0.5 · writing checklist lines 0.5.**

**Scan 1 — exact repeats**, case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 210 | 210 | **0** |
| Spanish glosses | 210 | 210 | **0** |
| Vocabulary terms | 280 | 280 | **0** |
| Card examples | 280 | 280 | **0** |
| Grammar prompts | 20 | 20 | **0** |
| Grammar explanations | 20 | 20 | **0** |
| **Writing titles** | **9** | **9** | **0** |
| **Writing tasks** | **9** | **9** | **0** |
| **Writing models** | **9** | **9** | **0** |
| **Writing checklist lines** | **45** | **45** | **0** |

**45 checklist lines, 45 distinct.** That is the number that would have shown fatigue first, and it
did not.

**Scan 1b — cross-namespace exact:** phrase texts ↔ card examples **0**; phrase texts ↔ grammar
prompts **0**; phrase texts ↔ writing checklist **0**; card examples ↔ writing models **0**;
writing tasks ↔ writing models **0**; writing checklist ↔ grammar explanations **0**. No authored
line appears in two namespaces anywhere in the phase's corpus.

**Scan 2 — Jaccard over content words**, cross-scenario pairs only:

| Corpus | Pairs compared | Above threshold |
|---|---|---|
| Phrase texts | 21,420 | 1 |
| Vocabulary terms | 38,080 | 2 |
| Grammar prompts | 150 | 0 |
| Grammar explanations | 150 | 0 |
| **Writing tasks** | **36** | **0** |
| **Writing models** | **36** | **0** |
| **Writing titles** | **36** | **0** |
| **Writing checklist lines** | **900** | **0** |

All three non-writing hits are **pre-existing content, none of it this plan's**:
`How was your weekend?` ⟷ `What are you up to this weekend?` (J = 0.50 here, J = 1.00 under 03-05's
stop-list — the same pair, a different list), `run into` ⟷ `run over` (J = 1.00, both reduce to
`{run}` because my list stops directional particles), and `talk over someone` ⟷ `talk someone into
something` (J = 0.67). All three are the closed-set artefact 03-03 and 03-04 already adjudicated:
English has a dozen or so particles, and any two phrasal verbs draw from the same dozen.

**Scan 3 — the nine new tasks against the GLOBAL writing room's thirteen prompts**, the check this
plan's corpus specifically needed, because "reuse the global bank with a scenario title on top" is
exactly the failure D-01 names:

| Comparison | Pairs | Above threshold |
|---|---|---|
| scenario task ⟷ global task | 81 | **0** (> 0.4) |
| scenario model ⟷ global model | 81 | **0** (> 0.4) |
| scenario title ⟷ global title | 81 | **0** (> 0.5) |

The harness gates the exact version of this permanently (`no scenario task is a global writing
prompt's task`, `no scenario model answer is a global writing prompt's model answer`), and mutation
**M14** proves it fires.

**Nothing in the new writing corpus came close to any threshold.**

---

## Browser observation — served HTML against a production build

`npm run start` on port 3000. **Shut down afterwards: zero listeners on 3000, every socket drained
to nothing, and no `next` process from this session survives.** From the served HTML:

- **`/world/work/emails`** renders `Practise writing` with the **task and no picker**. The markup is
  `<div><div class="grid gap-5 lg:grid-cols-2 ">` — the picker row is absent entirely and the grid
  carries no `mt-4`. Inside it: the `B1` level badge, **`70–120 words`**, the title
  *Ask for a deadline to move*, the full brief, the empty `<textarea>`, the counter reading
  **`0 words (target 70–120)`**, `Save draft`, the `Self-check` panel and `Show model answer`.
- **The model answer is not in the served HTML.** `grep "Marta"` returns 0: the reveal is gated on
  `showModel`, and `ScenarioPractice` is a client component, so the bank is read from the client
  chunk rather than crossing the RSC boundary — the same posture the 13 global prompts have had
  since before this phase.
- **All nine pairs render their own task**, checked by title on four pages:
  `academic/summaries` → *Summarise a passage in your own words*, `native/register` → *The same news,
  written twice*, `academic/debate` → *Concede the strongest point against you*.
- **The honest panel still works on the same pages.** `academic/summaries` shows writing rendered
  and **reading** still `Not yet available`; `native/register` shows writing rendered and
  **speaking** not; `social/dating` (speaking only, unwritten) is unchanged. D-03 holds *within a
  single page*, which is the strongest version of it.
- **`/skill/writing`**: *"**9** of the **9** scenarios that train your writing **have** practice
  written for the situation itself:"* — no "the rest are on the way" clause and **zero**
  `Not written yet` badges, the exact mirror of the *"0 of the 9 … the rest are on the way"* 03-05
  observed on the same line. Neither number is typed; both come off the banks.

---

## What has NOT been seen by a human

**Nobody has typed into a scenario writing desk.** The static render is observed above and the
wiring is deterministic, but the interactive half is unseen: the counter turning green at 70 words,
`Save draft` writing to `localStorage` under the composed id, ticking a checklist line, and
`Show model answer` revealing the model.

**The multi-prompt picker branch was not observed either.** `/skill/writing` mounts `WritingDesk`
behind a client-side tab whose default is `learn`, so the 13-prompt picker never reaches the initial
HTML and `curl` cannot click the tab. The branch is one boolean and unchanged for that path — proved
by reading, not by seeing.

**The draft-isolation truth is proved by construction, not by observation.** "A draft saved on one
scenario's prompt is not visible on another's" follows from the draft key being the prompt id and
the ids being asserted globally unique and each naming its own scenario (mutation M7). No one has
opened two scenarios and checked the two editors.

Both recorded as **`.planning/WINDOWS.md` entry 35**, owed to plan 03-11's browser pass alongside
entries 29–33.

## Known Stubs

**None introduced.** The two remaining branches of `ScenarioPractice`'s switch (reading, speaking)
still render the honest "Not yet available" panel — plan 03-01's documented, load-bearing state,
owned by plans 03-07 through 03-10. `pendingPairs()` returns 39, which is true, and no surface this
plan touched claims otherwise.

**One pre-existing observation recorded rather than fixed:** `ScenarioSkillCoverage.summary` is
derived, asserted (`"5 questions"` since 03-05, `"1 task"` since this plan) and **rendered by no
scenario surface at all** — a grep for `.summary` across `src/components` and `src/app` returns only
the two CELPIP call sites. Not a defect of either plan, both of which were asked for a count and a
unit and produced one, and the assertion has teeth (M18). But a field that is asserted and never
rendered can drift into being wrong for a UI that later starts rendering it. **`.planning/WINDOWS.md`
entry 36.**

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file access.
The register's six `mitigate` dispositions were honoured:

- **T-03-14** (two scenarios' drafts colliding on one storage key) — the draft key is the prompt id,
  and the ids are asserted unique across five key spaces. M7 proves the assertion has teeth. The
  collision is impossible by construction rather than avoided by care.
- **T-03-15** (claiming drafts follow the learner across devices) — stated in the module header, in
  this summary and nowhere contradicted: these drafts are raw `localStorage` **outside** the Phase 2
  progress contract and **do not sync**. Unchanged behaviour, described accurately.
- **T-03-16** (a model answer that breaks its own word range or checklist) — the harness asserts the
  model's word count sits inside the prompt's own range, counted **exactly the way `WritingDesk`
  counts it**, and requires every checklist line non-empty and non-repeated. M6 catches the range;
  M2 and M3 the list. The one real instance found (`academic/summaries`) was fixed in content.
- **T-03-04** (coverage summaries assembled from prompt text) — every summary is `"1 task"`. M18
  catches a change to the unit, and no task, checklist line or model answer enters a summary string.
- **T-03-05** (id collision with another bank) — composed ids, asserted globally unique and disjoint
  from global writing prompts, global grammar questions, deck-browser cards, recall items and
  scenario grammar ids.
- **T-03-SC** (package installs) — zero installed; dependencies unchanged at **11 + 11**.

## For plans 03-07 and 03-09

- **The fourth edit is conditional.** Before copying `reviewableIds()`, check whether your renderer
  calls `recordAttempt`. Omitting it when scored gives invisible items; adding it when unscored
  gives phantom due items. Both are silent, and only the first is in 03-05's handover.
- **If your bank is unscored, assert the negative.** "No id of mine is reviewable" and "every id of
  mine resolves to nothing" are two cheap assertions that turn an omission into a proved property.
- **`ScenarioItemKind` already distinguishes scheduled from unscheduled.** Add your kind to
  `ITEM_KINDS`, and to `SCHEDULED_ITEM_KINDS` only if something scores it.
- **Compose your ids lazily.** The cycle is real; verified from three entry points here.
- **Your closing assertion is your own skill's pending count**, never the global written total.
- **If a checklist line is mechanically checkable, run it as a script against your own model
  answer.** One of nine failed its own list on first draft, and no amount of rereading had caught it.
- The harness remains a low-conflict append target: this plan added **two import lines and seven
  groups at the bottom**, and edited **no group another plan owns** — not even the shared
  `exerciseIds` line 03-05 had to widen.

## Self-Check: PASSED

`src/lib/content/scenario-writing.ts` exists on disk (377 lines); all five modified files exist; all
three commits (`7a8f745`, `9cb5325`, `656182e`) are in `git log`; no commit deleted a tracked file;
`git diff --diff-filter=D` is empty for each; the working tree is clean apart from the intended
planning documents and the pre-existing untracked `.claude/`. Port 3000 has no listener and no
socket.
