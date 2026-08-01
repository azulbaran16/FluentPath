---
phase: 03-every-scenario-practicable
plan: 03
subsystem: scenario-content
tags: [content, srs, cont-02, authoring, duplicate-scan]
status: complete
requires:
  - src/lib/review-items.ts (scenarioItemId, scenarioRecallItems — plan 03-01)
  - src/lib/scenario-coverage.ts (derived coverage — plan 03-01)
  - scripts/verify-scenario-content.mts (the phase's content gate — plan 03-01)
  - src/lib/content/phrases.ts (Phrase.id, getScenarioPhrases — plans 03-01, 03-02)
  - src/lib/content/scenario-vocabulary.ts (the bank shape — plans 03-01, 03-02)
provides:
  - "src/lib/content/phrases.ts — 10 new curated sets (27/35 scenarios)"
  - "src/lib/content/scenario-vocabulary.ts — 12 new decks (25/35 scenarios)"
affects:
  - .planning/REQUIREMENTS.md (CONT-02 left In Progress with live numbers)
  - .planning/STATE.md (the honest-panel tally moved 18 → 8, note deliberately kept)
tech-stack:
  added: []
  patterns:
    - "near-duplicate scanning as a separate authoring pass: the harness asserts byte-identity, a human-run Jaccard sweep catches the paraphrase it cannot"
    - "mutation anchors EXTRACTED from the file by unique substring at generation time, never hand-typed"
    - "a 'caught' verdict requires the EXPECTED assertion label, not merely a non-zero exit code"
key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - .planning/REQUIREMENTS.md
    - .planning/STATE.md
    - .planning/WINDOWS.md
decisions:
  - "work/emails keeps its PHRASES spoken — talking about a message rather than writing one — so plan 03-06's writing prompt is not pre-empted by the plan that happened to run first"
  - "A shared REQUEST FRAME across scenarios is legitimate reuse; a shared SITUATION is not. 'I'd like … please' teaches one A2 structure in two places on purpose, but its third instance was rewritten to vary register instead of nouns"
  - "The near-duplicate check is a deliberate separate pass over all 35 scenarios, not a by-product of the harness — byte-identity is all the harness can assert"
  - "A mutation counts as caught only when its expected assertion label appears; exit code 1 alone lets it trip an unrelated assertion and look caught for the wrong reason"
  - "CONT-02 deliberately NOT ticked at 27/35 — 03-04 is the only plan allowed to close it"
metrics:
  duration: ~65min
  tasks: 2
  commits: 2
  completed: 2026-08-01
---

# Phase 3 Plan 03: Work & Professional and Practical Life Summary

Twelve scenarios — all seven of Work & Professional and all five of Practical Life — are at D-04's
floors of six phrases and eight vocabulary cards, so **twenty-five of the thirty-five scenarios, every
one a learner would use in a working week, now carry their own material and feed spaced repetition.
No work scenario is served the per-world generic set any more.**

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `750fb12` | Work: 5 phrase sets (emails, presentations, negotiating, networking, feedback) + 7 vocabulary decks |
| 2 | `c3a5bc4` | Practical Life: 5 phrase sets + 5 vocabulary decks, none of which existed |

**Registry state on completion: 27/35 scenarios with phrases · 25/35 with vocabulary · 0/52 pairs
written (52 pending: speaking 30, writing 9, reading 9, grammar 4).** No scenario reports itself
complete, and the app still claims nothing it does not have.

**156 new items** — 60 phrases and 96 cards. Every id is an authored slug, unique within its
scenario and never derived from position; `scenarioItemId()` remains the only author of a composite
id, and nothing in this plan composes one by hand. No field was added to the stored `{box, due}`
value: the metadata stays in the id, as `srsItemSchema`'s closed two-field object requires.

---

## 1. The content, and what each set was written to do

### Work & Professional — where the generic fallback did the most damage

Five un-curated work scenarios were all being handed the same three lines. Each now has six of its
own, written at the scenario's own CEFR level and to **extend** its briefing rather than restate it —
`scenario-lessons.ts` already gives `work/negotiating` the template "If you can do X, then we could
do Y", so the phrase set had to teach something the briefing does not.

| Scenario | Level | What the six phrases actually are |
|---|---|---|
| `work/emails` | B1 | The **spoken** half only — chasing a message, resending it, owning a reply-all |
| `work/presentations` | B2 | Opening a structure, deflecting a question honestly, closing with a thought |
| `work/negotiating` | C1 | A six-rung ladder: push back → probe → trade → mark a limit → reframe → close |
| `work/networking` | B2 | Arriving, pitching with an image, introducing two people, and leaving well |
| `work/feedback` | B2 | Three lines for **giving** and three for **taking** |

**The two the plan singled out, and how each burden was met.**

`work/emails` is a writing scenario as much as a speaking one, and plan 03-06 owns its writing
prompt. Its phrases are therefore all about *talking about* a message rather than composing one —
"Did you get my email from Friday?", "I hit reply all by mistake.", "It might have landed in your
spam folder." Its **cards** are the machinery a learner has to recognise in someone else's message
(`the subject line`, `an out-of-office`, `bounce back`, `a sign-off`, `snowed under`), which is the
half that decides whether she understands the reply. Nothing here spends 03-06's material.

`work/negotiating` is C1, the highest level in the world, and its language is concession and
counter-offer rather than assertion. The set opens on "I'd struggle to justify that internally" —
a refusal that blames the organisation rather than the other party — and its cards are the words
for *positions and trades*, not for disagreement: `a sticking point`, `a deal-breaker`,
`meet someone halfway`, `a concession`, `leverage`, `walk away`, `a ballpark figure`,
`a counter-offer`.

### Practical Life — five scenarios that had nothing at all

| Scenario | Level | What the set is built around |
|---|---|---|
| `practical/phone-calls` | B1 | Surviving a bad line |
| `practical/tech-support` | B1 | Spoken only — the ticket is plan 03-06's |
| `practical/housing` | B2 | Spoken only — the lease is plan 03-07's |
| `practical/banking` | B1 | Fees, a disputed charge, clearing, an overdraft |
| `practical/appointments` | A2 | Short, concrete, produceable at a desk |

`practical/phone-calls` is the one scenario where the learner cannot see the other person, so its
phrases are exactly the ones that survive a bad line: getting volume ("Could you speak up a little?
The line's not great."), **spelling out** with the phonetic alphabet, and **reading a number back**
("So that's double seven, four, one — is that right?", with the tip that `double seven` is how a
repeated digit is said aloud). Its cards are the *states a call can be in* — `on hold`, `get cut
off`, `voicemail`, `get through` — because that is what the other end will tell her is happening.

`practical/appointments` is A2 and stays A2 **in its examples as well as its phrases**: one clause,
present or past simple, a concrete noun. "It's only a check-up. It takes ten minutes." A card a
learner cannot say back is not a card.

`practical/tech-support` and `practical/housing` each declare a second skill that a later plan
fills, so both keep their phrases spoken. Housing's six are a viewing checklist a learner would
actually use — damp in winter, who pays for repairs, how much notice, **the meter readings before
signing**, a realistic move-in date, when the boiler was last serviced — and its cards are the nouns
on the paperwork, so the two halves do different work.

### Vocabulary complements the phrases rather than restating them

Held per scenario, as in plan 03-02. `work/interviews`' phrases are what *she* says in the room, so
its cards are what the **process** uses around her (`a shortlist`, `a notice period`, `a probation
period`, `salary expectations`) — the words in the job ad and the recruiter's call, which is where a
B2 candidate actually gets lost. `work/meetings`' phrases are floor-taking moves, so its cards are
the machinery (`the agenda`, `action points`, `take the minutes`, `on mute`, `a show of hands`).

---

## 2. The named residual risk: authoring fatigue

**The harness only detects byte-identity, and a lazy paraphrase passes it.** That is stated in
`verify-scenario-content.mts` itself and was the orchestrator's named risk for this plan, with Work
and Practical called out as the two worlds most at risk because "asking for something politely"
recurs across interviews, meetings, feedback, landlord, bank and doctor. It was checked directly,
across **all 35 scenarios and not only the twelve authored here**, by two scans.

**Scan 1 — exact repeats,** case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 162 | 162 | **0** |
| Vocabulary terms | 200 | 200 | **0** |
| Spanish glosses | 162 | 162 | **0** |
| Card examples | 200 | 200 | **0** |

162 = 27 × 6 and 200 = 25 × 8 exactly. Also **0** cross-namespace collisions (no phrase text is also
a card example anywhere), and across all 35 scenarios only **one** shared four-word opening frame.

**Scan 2 — paraphrases that share no opening frame.** Exact-match scanning would miss the actual
failure mode, so a Jaccard similarity pass over content words ran on every cross-scenario pair:
**13,041 phrase pairs and 19,900 term pairs.** Two phrase pairs remain above 0.4 and both are
legitimate:

- `travel/airport` "I'd like a window seat, please." vs `practical/appointments` "I'd like to make
  an appointment, please." — the same **request frame**, two different A2 scenarios. Meeting
  `I'd like … please` twice at A2 in unrelated situations is how a structure is acquired.
- `travel/directions` "How long does it take on foot?" vs `practical/banking` "How long will the
  transfer take to clear?" — the banking line exists to teach `to clear`, not to teach duration.

The five term pairs above 0.5 are all the phrasal-verb skeleton `V + someone + out`
(`ask someone out` / `call someone out` / `log someone out`) or an incidental shared word
(`back down` / `be down`, `hands-on` / `a show of hands`). Same pattern, different meanings — a
feature rather than a repeat.

**Four near-duplicates were rewritten while drafting rather than shipped:**

1. `practical/phone-calls` was heading for "I've been on hold for twenty minutes" — the same
   present-perfect-plus-duration frame as `social/complaining`'s "We've been waiting over an hour
   now". The *collocation* `on hold` is the teaching point, so it moved to the vocabulary deck where
   it belongs and the phrase slot became "Sorry, I think we got cut off."
2. `work/feedback` opened on "Is now a good time for some feedback?" against
   `practical/phone-calls`' "Is this a good time, or shall I call back later?" — the politeness
   recurrence the orchestrator warned about, verbatim. Rewritten to "Can I be straight with you
   about the report?", which changes the register rather than the noun.
3. `practical/banking` was heading for "My card's been declined twice" — the same passive frame as
   `travel/emergencies`' "My wallet's been stolen." Replaced with "There's a payment here I didn't
   make.", which also drops the word *fraud* on purpose.
4. `practical/tech-support` shipped "I'd like this escalated, please" through the first commit and
   **the similarity scan caught it afterwards** as the third `I'd like … please` in the corpus. It
   became "This needs escalating, I'm afraid." — a statement rather than a request, which varies the
   speaker's stance and not just the vocabulary. This one is the reason the scan exists: three
   deliberate rewrites during drafting still left a fourth for the machine to find. Fixed before the
   Task 2 commit; the sweep afterwards showed 4 → 2 pairs above threshold.

Several collisions were also avoided at selection time rather than after: `a deposit` was dropped
from `practical/housing` because `travel/hotel` already teaches it, `an icebreaker` from
`work/networking` because `social/small-talk` teaches `break the ice`, and `a takeaway` from
`work/presentations` because `travel/restaurant` uses the word in its other sense.

---

## Deviations from Plan

**One, plus one correction to a tool's output.**

**1. [Rule 1 — bug] `practical/tech-support`'s sixth phrase was rewritten after Task 1's commit.**
- **Found during:** the cross-scenario similarity scan, run between the two task commits.
- **Issue:** "I'd like this escalated, please." was the third `I'd like … please` construction in
  the corpus. Not a duplicate by any assertion in the repo, and it would have shipped.
- **Fix:** "This needs escalating, I'm afraid." — same target word, different register and stance.
- **Files modified:** `src/lib/content/phrases.ts` · **Commit:** `c3a5bc4`

**2. [Rule 1 — bug] `state.advance-plan` wrote an overclaiming plan counter.**
- **Found during:** the state-update step.
- **Issue:** the SDK advanced the plan counter to 4 and rewrote the STATE.md line to
  `Plan: 4 of 11 complete`. Three plans are complete, not four — the command writes the *next*
  plan's number into a line labelled "complete", and 03-02 left the same line reading `2 of 11`
  after plan 2. `**Current focus:**` was also still stuck on `plan 02 of 11`, and
  `last_activity_desc` had been truncated mid-sentence at "…(156 new items). 10".
- **Fix:** all three corrected by hand. Small, but this phase is about not overclaiming in the files
  a later reader trusts without re-deriving.
- **Files modified:** `.planning/STATE.md`

**The trap the orchestrator named, avoided.** This plan's frontmatter carries `requirements:
[CONT-02]`, and `requirements mark-complete CONT-02` was **deliberately not run** — it is the
command that ticked "**Every** scenario has phrases and vocabulary" at 17 of 35 during 03-02.
CONT-02 is left unchecked and `In Progress (27/35 phrases, 25/35 vocabulary)`, with a note added
naming both 03-02 and 03-03 as plans that carry it and may not tick it. **03-04 is the only plan
allowed to close it**, on the evidence `COVERAGE_TOTALS.scenariosWithPhrases === 35`.

Likewise `.planning/STATE.md`'s honest-panel regression note is **kept**, with only its tally moved:
26 → 18 (03-02) → **8** here, and the eight named (all of Reading & Ideas, plus Sounding Native's
three uncurated scenarios). Its stated evidence for removal is unchanged and still lands at 03-04.

---

## Verification Results

Every `<verify>` block in the plan was run. All passed.

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **3732** passed · 22/35 phrases · 20/35 vocabulary |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| Work floor check (`phrases<6 \|\| vocabulary<8`, 7 scenarios) | `work: 7 scenarios at floor` |

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **4529** passed · 27/35 · 25/35 · 0/52 |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| `COVERAGE_TOTALS` check | `{"pairsTotal":52,"pairsWritten":0,"scenariosWithPhrases":27,"scenariosWithVocabulary":25}` |

The plan's `<verification>` block asks for 27/35 and 25/35 and gets exactly that.

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 2737 | **4529** (this plan's content) |
| `verify-merge` | 25647 | 25647 |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` all exit 0. No server was started, so none was left running.

---

## Mutation testing — because a first green is not evidence

Run under **bash**, with the tree proved clean before and after every mutation and a **non-empty
`git diff` landing proof** required before any verdict was trusted.

Two hardenings over 03-02's pass, both aimed at its recorded failures:

1. **Anchors are extracted from the real file by unique substring at generation time**, not
   hand-typed, and generation aborts if a substring matches zero or many lines. All 17 generated
   cleanly. Combined with a **single-line-only** applier that rejects any anchor containing a
   newline, the CRLF trap that made 03-02's M9 unreproducible cannot occur — these files are CRLF
   and nothing in an anchor ever spans a line terminator.
2. **A "caught" verdict requires the expected assertion label in the output**, not merely a non-zero
   exit code. Exit code 1 alone would let a mutation trip an unrelated assertion and look caught for
   the wrong reason.

| | Caught / refused (expected) | Survived (expected) |
|---|---|---|
| Floors | **M1** `work/negotiating` down to five phrases · **M7** `practical/housing` down to one card | **C3** a *seventh* phrase · **C4** a *ninth* card |
| Ids | **M2** duplicate slug in `practical/banking` · **M5** index-derived id (`"5"`) on a `practical/appointments` card · **M10** duplicate slug in `work/meetings` | — |
| Required fields | **M3** whitespace example on a `work/feedback` card · **M8** blank Spanish gloss on a `work/emails` phrase · **M9** an optional tip present but empty | **C1** reworded gloss · **C2** reworded example |
| Keys & D-01 | **M4** typo'd bank key (`practical/bankng`) · **M6** `work/networking` and `work/feedback` handed the identical set | **C5** comment-only change |
| The applier | **AMBIG** an anchor matching 200 lines **aborted** · **MISSING** an anchor matching nothing **aborted** | — |

**10 mutations caught (each with its expected label), 5 controls survived, 2 applier refusals
confirmed, 0 spurious, 0 unexpected.** M6 is built so that the two scenarios' original arrays land
on **real but unwritten curriculum keys** (`academic/news`, `academic/articles`), which keeps the
byte-identity assertion the only thing that can fire — a D-01 mutation that also tripped the
bad-key assertion would have proved less than it appears to.

**One thing went wrong in the sweep and is worth recording.** The first run reported "16 as
expected" and listed 16 of 17 — the `MISSING` self-test had been **silently skipped**, because the
order file has no trailing newline and bash's `read` returns non-zero on the last line. A sweep that
drops a mutation while still reporting success is precisely the failure this pass exists to catch,
so the loop was fixed (`while read -r id || [ -n "$id" ]`) and **the entire sweep re-run from a
clean tree**, not patched up. The table above is that second run. Afterwards the harness reproduced
4529 and `verify-merge` 25647 against a clean tree — the reproducibility check 03-02 could not make.

---

## Known Stubs

**None introduced by this plan.** The four exercise branches of `ScenarioPractice`'s switch still
render the honest "Not yet available" panel; that remains plan 03-01's documented, load-bearing
state, owned by plans 03-05 through 03-10. `pendingPairs()` still returns all 52, which is true.

## Threat Flags

None. No new network surface, no new auth path, no schema change, no dependency, no file-access
pattern — this plan adds strings to two content modules. The register's dispositions were honoured:

- **T-03-05** (id collision as the key space passes 350 items) — the harness re-proves global
  uniqueness and disjointness from `GRAMMAR_QUESTIONS` and `VOCAB_DECKS` on every run; the key space
  grew from 206 to **362** composite ids and the assertions held.
- **T-03-06** (an id derived from position re-pointing a schedule) — all 156 new items carry an
  authored slug, asserted unique within its scenario and non-numeric; mutation M5 proves the
  assertion has teeth.
- **T-03-09** (two scenarios ending up with the same set under authoring pressure) — the
  byte-identity assertion is proved by M6, and the two similarity scans above cover what it cannot.
- **T-03-02** (progress blob growth against the 1 MiB cap) — additive keys only.
- **T-03-SC** (package installs) — zero packages installed; dependencies unchanged at **11 + 11**.

## What has NOT been seen by a human

The twelve new scenario pages have not been opened in a browser. The **render path** is observed
(03-01 watched a curated scenario render its "Lock it in" step through these same accessors, and the
user drove `/review` on 2026-08-01) and the **content** is gated by 4529 committed assertions and a
17-mutation sweep, so this is an editorial gap rather than a structural one: line breaks, how the
longer C1 negotiating lines sit in a card, whether the Spanish reads well beside the English.
Recorded as `.planning/WINDOWS.md` id **31**, owed to plan 03-11's browser pass, which is already
visiting these surfaces for entries 29 and 30.

## For plan 03-04

- **You inherit CONT-02 and you are the plan that closes it.** Run
  `requirements mark-complete CONT-02` only after `COVERAGE_TOTALS.scenariosWithPhrases === 35`
  reads true, and clear STATE.md's honest-panel note on that same evidence.
- **Eight scenarios remain**, and they are the hardest eight to keep distinct: all five of Reading &
  Ideas (`news`, `articles`, `stories`, `summaries`, `debate` — four of which are reading-only and
  will all want the vocabulary of argument) and three of Sounding Native (`phrasal-verbs`,
  `register`, `culture`). `native/idioms` and `native/pronunciation` already have phrases but **no
  vocabulary**, so they need decks only.
- **`academic/summaries` and `academic/debate` overlap by construction.** Debate is C1 speaking and
  writing; summaries is B2 reading and writing. Split them the way 03-02 split `travel/emergencies`:
  give one the language of *making* a case and the other the language of *reducing* one.
- **Re-run both duplicate scans over all 35 scenarios before committing.** At 35/35 the corpus is
  ~210 phrases and ~280 terms, and Reading & Ideas is where "That raises an interesting point"
  wants to appear four times. The scans are cheap; the scripts' method is described above.
- The harness's derived unwritten-scenario assertions run out at your plan, by design —
  `verify-scenario-content.mts` carries a comment explaining that nothing is lost when they do.

## Self-Check: PASSED

Both modified source files exist on disk; both commits (`750fb12`, `c3a5bc4`) are in `git log`;
neither commit deleted a tracked file; the working tree is clean apart from the intended planning
documents.
