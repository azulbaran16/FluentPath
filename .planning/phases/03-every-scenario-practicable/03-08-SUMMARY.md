---
phase: 03-every-scenario-practicable
plan: 08
subsystem: scenario-content
tags: [content, cont-01, reading, c1, inference, mutation-testing, parallel-wave, shared-tree-hazard]
status: complete
requires:
  - src/lib/content/scenario-reading.ts (the bank, getScenarioReading, the AuthoredPassage shape — plan 03-07)
  - src/components/practice/ReadingRoom.tsx (PassageReader, exported with onBack optional — plan 03-07)
  - src/lib/scenario-coverage.ts (the reading EXERCISE_SOURCES entry — plans 03-01, 03-07)
  - src/lib/review-items.ts ("reading" as an UNSCHEDULED ScenarioItemKind — plan 03-07)
  - scripts/verify-scenario-content.mts (the seven reading groups — plan 03-07)
provides:
  - "src/lib/content/scenario-reading.ts — the four C1 passages: social/humor, academic/articles, native/idioms, native/culture. Reading closes at 9/9"
affects:
  - "src/app/(catalog)/skill/[skill]/page.tsx (reading now reads 9 of 9 with zero pending badges, derived)"
  - src/components/ScenarioView.tsx (four more header pills stop being muted, derived)
  - .planning/WINDOWS.md (entries 39 and 40)
tech-stack:
  added: []
  patterns:
    - "C1 is what the READER is asked to do, not how long the words are — no question answerable by locating one sentence and copying it"
    - "a passage's own promises about itself are RUN AS A SCRIPT, including the quotations it makes from its own body"
    - "the glossary stays SILENT on every expression a question asks the reader to recover"
    - "assert per-skill pending pairs, never a global written total — the wave-8 convention, honoured"
    - "a mutation that survives is DECLARED as a gap rather than deleted"
    - "a mutation sweep in a SHARED working tree can poison a parallel plan's build with no trace in git"
key-files:
  created: []
  modified:
    - src/lib/content/scenario-reading.ts
decisions:
  - "C1 was made out of INFERENCE rather than vocabulary length: every one of the sixteen questions fails a learner who has understood every sentence literally and correctly"
  - "social/humor's humour is IN the writing rather than described by it — the scenario's whole existing bank is metalanguage for talking about a joke already got, so the passage is the one that has to be got"
  - "native/idioms uses NONE of the fourteen expressions its deck and phrase set already teach; the glossary is silent on exactly the four the questions turn on, and glosses only the two nothing is asked about"
  - "native/culture's references are each INSURED by the sentence beside them, and one question tests that recovery route rather than the cultural knowledge"
  - "reviewableIds() untouched and the NEGATIVE re-asserted for the four new pairs — PassageReader still has no recordAttempt; the fourth edit is now wrong for the third bank running"
  - "M23 (one paragraph copied between two passages) SURVIVES and was declared rather than deleted: the D-01 text assertion only fires on WHOLE-body duplication. Recorded as WINDOWS 39 rather than fixed, because 03-09 held uncommitted work in that harness file"
  - "CONT-01 was NOT ticked. Reading is 9/9 but the requirement says EVERY pair, and the registry says 36/52"
metrics:
  duration: ~70min
  tasks: 2
  commits: 2
  completed: 2026-08-01
---

# Phase 3 Plan 08: The Four C1 Reading Passages Summary

Reading closes. The four most expensive pairs in the phase — a deadpan essay whose surface is praise
and whose meaning is a complaint, a four-paragraph argument with a concession and a turn, a committee
memoir in which four idioms do real work, and a letter home that drops references at full speed —
are written, and **every one of the nine scenarios that declares reading now opens into a text chosen
for it with a key that explains itself**. `pendingPairs()` returns **zero** reading pairs.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `6ec66e3` | `social/humor` and `academic/articles` at C1 — 7 of 9 reading pairs written |
| 2 | `1753113` | `native/idioms` and `native/culture` at C1 — **reading closes at 9 of 9** |

**Four passages · 1,201 body words · 15 paragraphs · 16 questions · 64 options · 16 explanations ·
16 glossary entries — 3,318 authored words** (829.5 per pair; 300.3 of that body prose). These are
the longest passages in the bank: 03-07's five averaged 204.8 body words, these four average 300.3,
which is the C1 load the plan said it was buying.

**Reading pending on completion: 0.** Per-skill pending across the phase: `{"speaking": 16}` — grammar
0 (03-05), writing 0 (03-06), reading 0 (here).

---

## 1. What made these C1, since it is not the words

The plan's second truth is that "the four C1 passages are C1 because of what they ask the reader to
do, not because of word length". That is a checkable claim, so the module comment states it in the
form that can be checked: **no question below can be answered by locating one sentence and copying
it.** Every answer sits either in the distance between what a sentence says and what it is doing, or
in the role a sentence plays in the argument around it.

| Scenario | Level | Body | The passage, and the C1 demand it makes |
|---|---|---|---|
| `social/humor` | C1 | 280 | *The Man Who Mows at Seven*. Sustained deadpan: the literal surface is warm praise for a neighbour who mows at seven on Sundays, and the meaning is an eleven-year complaint. **Three of the four questions turn on tone** — what "nothing but admiration for a man of such consistency" is doing, why "I consider that the matter has now been addressed" is funny when what was actually said was that the lawn looked well, and what the writer is admitting by holding his last sentence up to the light and leaving it |
| `academic/articles` | C1 | 311 | *What Actually Emptied the High Street*. A claim, an honest concession, a turn on evidence, an upshot. **One question is about the STRUCTURE** ("what is the second paragraph doing?" — conceding what is right about the view it rejects) and **one asks for a conclusion the passage supports and never states** (a measure aimed only at online retailers cannot reach two thirds of a cause that sits in a lease) |
| `native/idioms` | C1 | 322 | *The Committee and the Kitchen*. Four expressions doing work in context. The star is the chair's "cross that bridge when we came to it": the dictionary gives it as *later*, and three surrounding facts turn it into a refusal — he moves straight on to the noticeboard, the question never reaches the minutes, and afterwards he asks pleasantly to be left the funding side |
| `native/culture` | C1 | 288 | *Everything You Have Missed*. A letter, because a letter is the genre in which references are dropped at full speed and never explained. **The required inference question asks how a reader who has never seen the film recovers "Groundhog Day"** — from "Same letter, same fortnight, same three men", the sentence sitting next to it |

### The two scenarios where the deck was the hazard

`native/idioms` and `native/culture` have the densest banks in the phase, and 03-07's handover warned
that an unread author would collide with them. Both were read first.

**`native/idioms` uses none of the fourteen expressions its deck and phrase set already teach** — not
*a piece of cake*, not *under the weather*, not *the last straw*, not *bite the bullet*, not *on the
ball*, not one. Checked as a script over both banks rather than by recollection. The deck teaches the
expressions one per card in a sentence built to display them; a passage that paraded them again would
be the deck read aloud, which is exactly T-03-19, and it would test a memorised gloss rather than a
reading.

**The glossary is silent on precisely the four expressions the questions ask the reader to recover** —
*cross that bridge*, *the writing was on the wall*, *clear the air*, *put my foot in it* — and glosses
only what would block her on the way there: `Any Other Business`, `sit on the fence`, `throw good
money after bad`, `the reserve fund`. Two of those four are idioms, deliberately: the passage still
teaches, it just does not answer its own questions. Asserted mechanically.

**`native/culture` restates none of its deck's eight terms and neither of the briefing's two example
references** (`Achilles' heel`, `that's so 2010`). *A white elephant* IS glossed, and that is not an
exception to the silence rule: the question about it turns on the **possessive** — "it is a white
elephant, obviously, but it is *our* white elephant" — not on the phrase.

### The Phase 4 boundary, held

CONT-04's deeper native-level treatment belongs to Phase 4. These two are C1 scenario passages of the
same shape as every other reading pair — one text, one glossary, four questions, an explanation on
each — and the harness pins the level to the curriculum entry rather than to the author's judgement
(**M1** catches a passage served at the wrong level).

---

## 2. Running the content's own promises as a script — one caught, and it was in the plumbing

03-06's model answer broke its own checklist; 03-07's explanation claimed "Seventeen is the same
digits in the other order", which it is not. Both were found by execution and neither by rereading. So
everything these four passages assert about themselves was run.

**Check 1 — every quotation a question makes from its own passage is a real quotation.** Sixteen
curly-quoted spans of three words or more across the four passages, each required to appear
**verbatim** in that passage's body.

> **This caught one.** `native/culture`'s third question quoted *"it is a white elephant, obviously,
> but it is our white elephant"* — and the body's sentence begins *"It* is a white elephant". A
> capital letter, invisible to rereading, and a question that quotes its own text incorrectly is a
> question that teaches the learner the quotation marks are decorative. Fixed by quoting from
> mid-sentence: *"a white elephant, obviously, but it is our white elephant"*. Final run: **16 spans,
> 0 not verbatim.**

**Check 2 — the factual claims the explanations make about their own passages.** Eighteen for the
first two, thirteen for the last two: that the eleven years and the seven o'clock Sunday are really
in the humour text; that the concession opener is verbatim; that the passage never says funds own
*most* parades of shops; that the tax it does name is on floor space and not on online retailers; that
the Groundhog sentence really is followed by the repetition sentence; that "very brave" really does
precede the third-act phrase; that the disgrace-in-April clause really does follow the white-elephant
sentence. **All green after two corrections made before the first commit:**

- an explanation claimed *"Six weeks of waking at seven"* — the passage says he began waking by the
  **fourth** Sunday, not for six weeks. The explanation was overreaching about the text it explains.
  Rewritten to "Waking at seven anyway".
- two explanations referred to options by **position** ("the first option", "the third option"). Both
  were rewritten to name the option's content instead: safer against reordering, and better teaching.

**Check 3 — the module comment's own claim.** The first draft of the C1 header said *every* question
fails a literal reader. `academic/articles`' evidence question is answerable by a careful literal
reader who also tracks the argument, so the claim was narrowed to the one that is true: no question
is answerable by **locating one sentence and copying it**. A comment that overclaims is the same
defect as an explanation that overclaims, one level up.

---

## 3. The wiring question: still nothing, still asserted

`PassageReader` has no `recordAttempt` and no `useProgress` — 03-07 checked the file rather than
inferring, and nothing in this plan changed the component. So **`reviewableIds()` is untouched, the
fourth wiring edit was again not taken, and the negative now covers nine passages instead of five**:
no scenario reading id is listed as reviewable, and `resolveReviewItem` returns nothing for each of
the four new ones. Mutations **M17/M18** (03-07's) still give those assertions teeth.

`review-items.ts` did **not** need editing this time — `"reading"` joined `ScenarioItemKind` and
`ITEM_KINDS` in 03-07 and is deliberately absent from `SCHEDULED_ITEM_KINDS`, so the four new composed
ids type-check with no change to any shared module. **This plan modified exactly one file**, as
`files_modified` said it would.

That makes it **three banks out of four** where the handover's fourth edit would have been wrong.

---

## Deviations from Plan

**Three, all recorded rather than absorbed.**

**1. [Rule 1 — bug I caused] A mutation sweep in this SHARED working tree poisoned plan 03-09's
production build, silently and with no trace in git.**

- **Found during:** the post-plan browser check, by curling four pages and seeing **one title four
  times**.
- **What happened:** plan 03-09 ran `npm run build` at 02:00:04 while this plan's mutation sweep had
  **M21** applied — `const authored = BANK["social/humor"]` in place of `BANK[key]`. The sweep
  restores the file byte-for-byte and verifies the sha256 after every mutation, so `git status` was
  clean and `git diff` was empty. **`.next` kept the mutation.** Every scenario page served *The Man
  Who Mows at Seven*, and the minifier had dropped eight of the nine passages from the emitted JS as
  unreachable.
- **How it was diagnosed rather than guessed:** the first hypothesis (a stale build) was **wrong** and
  was discarded on evidence. The build's own **source map** settles it — a map records the source the
  bundler read, and this one contains
  `function composed(key: string): ScenarioPassage | undefined { … const authored = BANK[\"social/humor\"];`.
  My first grep for that string returned zero and nearly closed the investigation on a false negative:
  the map is JSON, so the quotes are escaped. The file on disk and the accessor at runtime were
  correct throughout, and all nine `is written for itself` assertions were passing the whole time.
- **Fix:** rebuilt from the clean committed tree. Verified rather than assumed — **all nine passage
  slugs now appear in the emitted JS in equal numbers (5 files each)**, and the rebuilt map carries
  `BANK[key]` twice and `BANK["social/humor"]` zero times. Then observed on a served production build
  (below).
- **03-09's own browser observation is unaffected** and I have not touched their files: WINDOWS 38 is
  about `scenario-speaking.ts`, which no mutation in this sweep touched.
- **The standing hazard, recorded as WINDOWS 40:** any wave that pairs a mutation sweep with a sibling
  plan in one working tree can do this again, in either direction, and neither plan would see it in
  `git status`. The mitigation is to sweep in a worktree or a copy, or to assert the built accessor
  after any build a summary makes a claim about.

**2. [Finding, declared not deleted] M23 survives: the D-01 text assertion only catches WHOLE-body
duplication.**

- **Found during:** the mutation sweep. The first draft of M15 copied **one** of `native/idioms`'
  paragraphs over `native/culture`'s and **survived a full harness run**.
- **Why:** `no passage text is repeated anywhere in the scenario reading corpus` fingerprints
  `p.body.join(" ")`. A passage that borrows a single paragraph from another scenario is D-01's
  failure at a finer grain and is not caught.
- **What was done:** M15 was rewritten to copy the **whole** body (it is now caught, with its expected
  label), and the single-paragraph form was kept as **M23, a DECLARED SURVIVOR** with its own verdict
  class. A gap you have written down is worth more than a mutation you quietly deleted.
- **Why it was not fixed here:** the fix is one appended assertion in
  `scripts/verify-scenario-content.mts`, and **plan 03-09 had uncommitted work in that same file in
  this same tree**. Staging it would have swept their in-flight edits into my commit. Recorded as
  **WINDOWS 39** for the plan that owns the harness next.
- **The corpus is clean today, measured rather than hoped:** across **31 authored paragraphs** and
  **426 cross-scenario paragraph pairs**, exact cross-scenario reuse **0** and pairs above J=0.5
  **0**; against the global reading room's eighteen bodies, **558 pairs, 0** above 0.5.

**3. [Out of scope, not fixed] Three lint warnings from the sibling plan's in-flight edits.**

- During Task 1, `npm run lint` exited 0 with three `no-unused-vars` warnings in
  `scripts/verify-scenario-content.mts` (`getScenarioSpeaking`, `scenarioSpeakingKeys`,
  `readFileSync`) — 03-09's imports, added ahead of the groups that use them. Not mine, not in my file,
  and transient by construction. **Not fixed and not deferred-filed.** By Task 2 they were gone.

---

## Verification Results

**Every `<verify>` block in the plan was run. All passed.**

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6909** assertions passed |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 (3 warnings, all 03-09's — see deviation 3) |
| the reading gate | `7 of 9 reading pairs written` (exactly 2 pending, as `<done>` predicts) |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **7312** assertions passed |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0, 0, 0 |
| the closing gate | **`reading complete: 9 of 9 reading pairs written`** · 9 declared, 0 pending |

**Assertion attribution, measured rather than assumed.** The harness moved 6815 → 7313 during this
plan, and most of that is 03-09's. Removing this plan's Task-2 passages and re-running gives **7219**,
so **Task 2 is +94**; Task 1 was measured the same way at the time (6815 → 6909, **+94**, with nothing
else in the tree). **The four C1 passages are +188 assertions; 03-09 contributed the other +310.**

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 6815 | **7313** (+188 mine, +310 03-09's) |
| `verify-merge` | 25647 | **25647** |
| `verify-schema` | 309 | **309** |
| `verify-celpip-content` | 648 | **648** |
| `verify-celpip-speech` | 50 | **50** |
| `verify-queue` | 173 | **173** |
| `verify-headers` | 24 | **24** |
| `verify-celpip-sections` | 43 | **43** |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` all exit 0. **No packages were installed.**

**The wave-8 convention, honoured.** Every gate in this plan closes on
`pendingPairs().filter(p => p.skill === "reading")`. **No global written total is asserted anywhere.**
The printed `36/52` is a report, not a gate, and it is 36 only because 03-09 merged first — which is
exactly the number this plan was forbidden to depend on.

---

## Mutation testing — 32 declared, 32 EXECUTED

Run against `verify-scenario-content.mts`, over this plan's four passages. Every hardening the earlier
plans paid for was carried, and one was **changed on purpose**:

1. **Anchors extracted from the real file by exact substring at apply time.** Zero matches or more
   than one match **aborts** the mutation and invalidates the sweep.
2. **CRLF, handled differently from 03-07 and for a stated reason.** This file is CRLF in the working
   tree. 03-07 refused multi-line anchors outright; that bans the only route to `level:`, which is not
   unique on its own line now that four C1 passages exist. Anchors are therefore authored with `\n`
   and **normalised to the file's terminator before matching**, with exactly-one-match still required
   — which closes the actual hazard (an anchor silently failing to match) rather than the shape.
   **SELF-CRLF proves the normalisation is load-bearing:** the un-normalised LF form of a real
   multi-line anchor finds **0** matches in this file and the normalised form finds exactly **1**.
3. **A CAUGHT verdict requires the EXPECTED ASSERTION LABEL** (`FAIL  <label>`) in the output, not
   merely exit 1. All 22 matched their intended label; none was caught only by the wrong assertion.
4. **Controls always included** — six, all expected to survive, all did.
5. **Declared vs EXECUTED counted**, mismatch invalidates the sweep. Reported **declared 32 ·
   EXECUTED 32**.
6. **A non-empty `git diff` landing proof** before every verdict, and the file's **sha256 asserted
   identical to the snapshot after every restore**. Only `scenario-reading.ts` is ever written —
   03-09 had uncommitted work in this tree, so `git checkout`, `git clean` and `git stash` were never
   used and the tree was never reset.

| | Caught, with its expected label | Survived |
|---|---|---|
| Floors & required fields | **M2** articles truncated to one paragraph · **M3** idioms' glossary cut to one entry · **M4** a whitespace explanation · **M5** a whitespace title · **M17** a question dropped to two options · **M18** zero minutes · **M19** a paragraph of spaces · **M22** an option of spaces | **C1** reworded body sentence · **C3** reworded option · **C5** a *fifth* question |
| Silently-wrong questions | **M6** answer index past the end of its own options · **M7** an option repeated inside one question · **M8** one explanation pasted over another · **M16** the same question asked twice · **M20** a glossary word repeated | **C2** reworded stem · **C6** reordered glossary |
| Level & ids | **M1** a C1 passage served at B2 · **M9** ids derived from array position · **M10** every id the same slug | — |
| Bank keys | **M11** typo'd key (`native/idoims`) · **M12** an entry re-keyed to `native/register`, which does not declare reading | — |
| D-01 | **M13** a passage taking a GLOBAL reading-room title · **M14** two of this plan's passages sharing a title · **M15** culture handed idioms' WHOLE body · **M21** the accessor handing every scenario humour's passage | **M23** *(declared gap)* culture handed **one** of idioms' paragraphs · **C4** comment-only |
| The applier itself | **SELF-MISSING** 0 matches → aborted · **SELF-AMBIG** 4 matches on `level: "C1",` → aborted · **SELF-CRLF** raw LF anchor 0, normalised 1 → refused | — |

**22 caught (each with its expected label), 1 declared gap, 6 controls survived, 3 applier refusals,
0 unexpected.** The restored tree reproduced the harness exactly and `git status` showed nothing of
mine.

**M21 is the one worth naming**, and not for the reason I expected. It catches the D-01 failure at the
accessor — every scenario handed one passage — and it is also the mutation that escaped into 03-09's
build. The assertion caught it in seconds; the build kept it for twenty minutes.

---

## The duplicate scans, over the full corpus including the four new passages

> **The caveat 03-04 through 03-07 all recorded applies, and applies to their figures too.** This is a
> re-implementation from the method 03-03 described, not the identical script. **Pair counts are
> directly comparable across plans; thresholds are not.** Mine reproduces **21,420** phrase pairs,
> **38,080** term pairs and **150** grammar-prompt pairs exactly, so the corpora agree with all four
> predecessors; the stop-word list is 03-07's, restated in the script so the next plan can diff it.
>
> **Thresholds used here: phrases 0.4 · Spanish glosses 0.4 · vocabulary terms 0.5 · card examples 0.4
> · grammar prompts 0.4 · grammar explanations 0.5 · writing tasks 0.4 · writing models 0.4 · writing
> titles 0.5 · writing checklist lines 0.5 · reading bodies 0.4 · reading PARAGRAPHS 0.5 · reading
> stems 0.5 · reading explanations 0.5 · reading titles 0.5 · reading options 0.6 · reading glossary
> words 0.5 · scenario-vs-global bodies 0.4 · titles 0.5 · stems 0.5.**

**Scan 1 — exact repeats**, case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 210 | 210 | **0** |
| Spanish glosses | 210 | 210 | **0** |
| Vocabulary terms | 280 | 280 | **0** |
| Card examples | 280 | 280 | **0** |
| Grammar prompts / explanations | 20 / 20 | 20 / 20 | **0** |
| Writing titles / tasks / models | 9 / 9 / 9 | 9 / 9 / 9 | **0** |
| Writing checklist lines | 45 | 45 | **0** |
| **Reading titles** | **9** | **9** | **0** |
| **Reading passage bodies** | **9** | **9** | **0** |
| **Reading PARAGRAPHS** | **31** | **31** | **0** |
| **Reading question stems** | **36** | **36** | **0** |
| **Reading explanations** | **36** | **36** | **0** |
| **Reading options (all)** | **140** | **140** | **0** |
| **Reading glossary words** | **35** | **35** | **0** |

**140 options, 140 distinct.** 03-07 called the option corpus the one that would show fatigue first,
at 76. It is now nearly double and still has no repeat — and the four hardest passages to write are
the ones that were added.

**Scan 1b — cross-namespace exact.** reading stems ↔ grammar prompts **0**; reading explanations ↔
grammar explanations **0**; reading explanations ↔ writing checklist **0**; reading options ↔ phrase
texts **0**; reading glossary words ↔ vocabulary terms **0**; reading bodies ↔ writing tasks **0**;
reading bodies ↔ writing models **0**; reading **paragraphs** ↔ writing models **0**. No authored line
appears in two namespaces anywhere in the phase's corpus.

**Scan 2 — Jaccard over content words**, cross-scenario pairs only:

| Corpus | Threshold | Pairs compared | Above threshold |
|---|---|---|---|
| Phrase texts | 0.4 | 21,420 | 3 |
| Spanish glosses | 0.4 | 21,420 | 2 |
| Vocabulary terms | 0.5 | 38,080 | 3 |
| Card examples | 0.4 | 38,080 | 0 |
| Grammar prompts / explanations | 0.4 / 0.5 | 150 / 150 | 0 / 0 |
| Writing tasks / models / titles / checklist | 36 / 36 / 36 / 900 | — | 0 |
| **Reading passage bodies** | 0.4 | **36** | **0** |
| **Reading PARAGRAPHS** | 0.5 | **426** | **0** |
| **Reading question stems** | 0.5 | **576** | **0** |
| **Reading explanations** | 0.5 | **576** | **0** |
| **Reading titles** | 0.5 | **36** | **0** |
| **Reading options (all)** | 0.6 | **8,704** | **0** |
| **Reading glossary words** | 0.5 | **544** | **0** |

**All eight hits are pre-existing CONT-02 content and not one is this plan's.** Six are the closed-set
artefacts the previous plans already adjudicated (`How was your weekend?` ⟷ `What are you up to this
weekend?` at J=1.00; `How's it going?` ⟷ `Yeah, that's not going to work for us.`; `I'd like a window
seat, please.` ⟷ `I'd like to make an appointment, please.`; and the three phrasal-verb pairs
`catch up`/`catch on`, `run into`/`run over`, `talk over someone`/`talk someone into something`). The
two new ones are **Spanish glosses**, a corpus 03-07 scanned only for exact repeats: `¿Qué tal tu fin
de semana?` ⟷ `¿Qué planes tienes este fin de semana?` (the Spanish side of the weekend pair already
on the list) and `Nos vamos; ¿podemos pagar la cuenta?` ⟷ `¿Nos trae la cuenta?` — two ways to ask for
the bill, in the two scenarios where you ask for a bill.

**Scan 3 — the nine scenario passages against the GLOBAL reading room's eighteen**, the check D-01
specifically needs:

| Comparison | Pairs | Above threshold |
|---|---|---|
| scenario body ⟷ global body | 162 | **0** (> 0.4) |
| scenario title ⟷ global title | 162 | **0** (> 0.5) |
| scenario question stem ⟷ global question stem | 1,620 | **0** (> 0.5) |
| scenario body ⟷ global writing-room task | 81 | **0** (> 0.4) |
| **scenario PARAGRAPH ⟷ global body** | **558** | **0** (> 0.5) |

**Scan 4 — four-word runs shared between any reading passage and any other authored text** in the
phase's corpus: **0**.

**Scan 5 — the gap M23 exposed, closed out of band.** 31 paragraphs, 426 cross-scenario pairs: **0**
exact reuse, **0** above J=0.5.

**Nothing in the new reading corpus came close to any threshold.**

---

## Browser observation — served HTML against a production build

`npm run start` on the rebuilt production output. **Shut down afterwards: no listener on port 3000 and
`curl` to it returns HTTP 000.** Port 3000 was free when this plan started; a sibling plan's server
occupied it mid-run and stopped on its own; mine is stopped. **Nothing of mine is left listening.**

- **All four new pairs render their OWN passage as their own step**, with the **C1** badge, the
  `Glossary` block and `Check answers`: `/world/social/humor` → *The Man Who Mows at Seven*;
  `/world/academic/articles` → *What Actually Emptied the High Street*; `/world/native/idioms` → *The
  Committee and the Kitchen*; `/world/native/culture` → *Everything You Have Missed*.
- **The regression is gone**: `/world/travel/restaurant` renders *The Lunch Menu at the Blue Door* at
  A2 again, which is the observation that proves the rebuild fixed deviation 1 rather than merely
  looking different.
- **No level filter and no back link on any scenario page** — `All levels` and `All texts` are absent
  from all five pages checked and present on `/skill/reading`.
- **`/skill/reading` reads "9 of the 9 scenarios that train your reading have practice written for the
  situation itself" with ZERO `Not written yet` badges.** Neither number is typed; both come off the
  bank. The global reading room above it is intact (`All levels`, *A Morning Ritual*).

## What has NOT been seen by a human

**Nobody has pressed Check answers on any scenario passage, so the explained key has still never been
seen** — including the sixteen explanations added here. Every one is behind `{submitted && q.explain}`
and is absent from the served HTML entirely, which is where `curl` stops. So *"every question in every
scenario passage explains its own key"* is proved by construction (the type requires it, the harness
asserts all 36 non-empty after trimming and distinct within their passage) and by mutation (**M4**
catches a whitespace explanation, **M8** catches one pasted over another) — **and not by sight**.

This is 03-07's WINDOWS entry 37, unchanged in kind and now covering nine passages rather than five.
Owed to plan 03-11's browser pass.

## Known Stubs

**None introduced.** The speaking branch of `ScenarioPractice`'s switch still renders the honest "Not
yet available" panel for the sixteen speaking pairs that remain unwritten — plan 03-01's documented,
load-bearing state, and no surface this plan touched claims otherwise. `pendingPairs()` returns 16 and
every one of them is speaking.

**CONT-01 was NOT ticked.** Reading is 9/9 and writing and grammar are complete, but the requirement
reads "**Every** existing scenario … offers real practice in **each** of its applicable skills" and
the registry says 36/52. `REQUIREMENTS.md` is untouched by this plan. **Assert the closure predicate
before ticking, never after.**

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file access.
The register's four `mitigate` dispositions were honoured:

- **T-03-11** (an answer index not addressing its own options, or repeated options) — asserted on all
  sixteen new questions; **M6** and **M7** each caught with their expected label.
- **T-03-19** (a scenario passage restating the vocabulary deck that scenario already has) — the
  hazard the plan named for these two scenarios specifically. Not left to care: **none of the fourteen
  expressions `native/idioms`' deck and phrase set teach appears in its passage**, and **none of
  `native/culture`'s eight deck terms appears in its letter**, both checked as scripts over the live
  banks.
- **T-03-04** (coverage summaries assembled from passage text) — every summary is still `"1 passage"`;
  no paragraph, option, explanation or glossary line enters a summary string.
- **T-03-SC** (package installs) — zero installed; dependencies unchanged at **11 + 11**.
- **T-03-10** (authoring past the phase boundary into CONT-04) — `accept`, and bounded as the plan
  said it would be: the level comes from the curriculum entry and **M1** catches a passage that
  departs from it.

## For plans 03-10 and 03-11

- **Reading needs nothing more.** Nine of nine, and the only reading item outstanding is the unseen
  explained key (WINDOWS 37).
- **WINDOWS 39 is a one-assertion fix** in `scripts/verify-scenario-content.mts`: fingerprint reading
  **paragraphs**, not just joined bodies, so D-01 is caught at the grain a real copy-paste would use.
  M23 in this plan's sweep is the reproduction.
- **WINDOWS 40 is a process hazard for any future parallel wave**: do not run a mutation sweep in a
  working tree a sibling plan may build from. Sweep in a worktree or a copy, or re-assert the built
  accessor before any summary makes a claim from a build.
- **If you write more passages:** run the curly-quote verbatim check first. It caught a real defect
  here that four readings had not.

## Self-Check: PASSED

`src/lib/content/scenario-reading.ts` exists on disk and is the only source file this plan modified;
both commits (`6ec66e3`, `1753113`) are in `git log`; `git diff --diff-filter=D` is empty for each, so
neither deleted a tracked file; all four new passages resolve through `getScenarioReading` to their own
titles; the harness reproduces **7313** assertions on the restored tree after a 32-mutation sweep;
`tsc`, `lint` and `build` exit 0; dependencies are 11 + 11; and port 3000 has no listener with `curl`
to it refused.
