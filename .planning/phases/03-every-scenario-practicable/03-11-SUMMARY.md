---
phase: 03-every-scenario-practicable
plan: 11
subsystem: scenario-content
tags: [gate, verification, d-01, deletion, declared-gaps, mutation-testing, browser-pass, phase-closing]
status: complete
requires:
  - src/lib/content/phrases.ts (getScenarioPhrases, the strict accessor — plan 03-01)
  - src/lib/scenario-coverage.ts (COVERAGE_TOTALS, pendingPairs, buildScenarioCoverage — 03-01)
  - scripts/verify-scenario-content.mts (the phase's content gate — 03-01, appended by 02…10)
  - .planning/phases/03-every-scenario-practicable/03-01-SUMMARY.md … 03-10-SUMMARY.md
provides:
  - "CONT-01 and CONT-02 closed — Phase 3 complete"
  - "src/lib/content/phrases.ts — ONE accessor, and it is strict; WORLD_FALLBACK and getPhrases deleted"
  - "scripts/verify-scenario-content.mts — the no-silent-fallback invariant, plus WINDOWS 39, WINDOWS 41 and 03-09's tautological id line closed; 11,981 assertions"
  - "AGENTS.md — the banks, the derivation, the id one-way door, the scheduled/unscheduled split, the one-accessor rule and the build-poisoning hazard"
affects:
  - src/components/practice/SkillPractice.tsx (the global speaking warm-up reads the strict accessor)
  - src/components/ScenarioView.tsx (a comment describing a function that no longer exists)
  - .planning/WINDOWS.md (29, 33, 37, 39, 41 closed; 44 waived; 34 restated; 43, 45, 46, 47, 48 opened)
  - .planning/REQUIREMENTS.md (CONT-01 and CONT-02 annotated with what the browser pass saw and what it did not)
tech-stack:
  added: []
  patterns:
    - "delete the dead mechanism and replace it with an assertion — a fallback nothing reaches is still a trap for the next author"
    - "re-prove a control against FULL banks, not only against the empty state it was written in"
    - "run the mutation sweep in a scratch copy with its own node_modules, so a poisoned build is impossible rather than merely unlikely"
    - "a CAUGHT verdict requires a landing proof AND the expected label AND a file that still parses"
key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/components/practice/SkillPractice.tsx
    - src/components/ScenarioView.tsx
    - scripts/verify-scenario-content.mts
    - AGENTS.md
    - .planning/WINDOWS.md
decisions:
  - "The per-world fallback was DELETED rather than left unreachable: every getScenarioPhrases call site is curated, so nothing changes today, and the point is what cannot happen in Phase 4"
  - "The replacement guard is an assertion, not a comment — every scenario resolves to a NON-EMPTY set of its own, and `!== undefined` was rejected as the same lie in a quieter voice"
  - "WINDOWS 39 and 41 and 03-05/06/07's tautological id line were CLOSED here rather than assessed and left: this plan owns the harness, both stated blockers had expired, and each is a trap aimed squarely at Phase 4"
  - "WorldView.tsx was deliberately NOT fixed: at 52/52 it is not a live overclaim, the plan does not own the file, and a UI change at a gate is a change nobody in this run can look at"
  - "The near-duplication read-through found NO duplicate exercise and TWO design echoes, both judged defensible and both recorded with numbers so Phase 4 sees them before writing"
  - "CONT-01 and CONT-02 close, each annotated IN THE REQUIREMENT with what the browser pass saw and what it did not, so the tick is auditable rather than assumed"
  - "The two design echoes were ratified as STATED DESIGN DECISIONS at the gate and the ledger entry waived, not left open as debt"
  - "Nothing the pass did not reach was rounded up: four checklist items stay open by name, including the phone pass this project has never run"
metrics:
  duration: ~135min
  tasks: 3
  commits: 3
  completed: 2026-08-01
---

# Phase 3 Plan 11: The Gate — Summary

The automated half of the phase gate passed in full and is recorded in numbers rather than
impressions. The last silent fallback is deleted rather than left unreachable, three assertion
gaps this phase declared about itself are closed, the derivation control is re-proved against
full banks, and the payload the phase made non-theoretical is measured.

**The browser pass was then run by a human**, and it earned two of the three ROADMAP criteria
outright — including the one this phase could only prove by construction. **CONT-01 and CONT-02
close.** Four checklist items were not reached and are open by name; none of them is missing
content, and none was rounded up.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `c0e9a79` | `WORLD_FALLBACK` and `getPhrases` deleted, twelve call sites repointed, the replacement invariant asserted, WINDOWS 39/41 and three tautological id lines closed, `AGENTS.md`, the ledger |
| 2 | — | **The browser pass, performed by the coordinator** against `next start -p 3117`, signed in. Results in §5 |
| 3 | `<task3>` | CONT-01 and CONT-02 given the status the pass earned; the ledger set to what was and was not observed |

---

## 1. The automated gate, in numbers

**Every harness, every baseline held.**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 7601 | **11981** (+4380: 36 fallback invariant · 426 paragraph pairs · 3915 move pairs · 3 source rules) |
| `verify-merge` | 25647 | **25647** |
| `verify-schema` | 309 | **309** |
| `verify-queue` | 173 | **173** |
| `verify-headers` | 24 | **24** |
| `verify-celpip-sections` | 43 | **43** |
| `verify-celpip-content` | 648 | **648** |
| `verify-celpip-speech` | 50 | **50** |
| dependencies | 11 + 11 | **11 + 11**, asserted as a test rather than eyeballed |

`npx tsc --noEmit`, `npm run lint` and `npm run build` all exit 0 (113/113 static pages).

**The phase gate itself:**

```
gate: {"pairsTotal":52,"pairsWritten":52,"scenariosWithPhrases":35,"scenariosWithVocabulary":35}
0 pending pairs · 0 incomplete scenarios · 35/35 phrases · 35/35 vocabulary
```

### The saturated payload — measured, not assumed (T-03-02)

RESEARCH put the pessimistic case at 194 KiB, nineteen per cent. Measured on the finished banks:

| What | Bytes | Share of the 1 MiB cap |
|---|---|---|
| `srs` + `attempts` over every id the banks can emit (**611 ids**) | **119,352** | **11.4 %** |
| A **fully** saturated `ProgressState` — the 611 ids plus all 35 scenarios completed, all 136 deck cards known, every scalar at a maximum | **143,830** | **13.7 %** |

Both comfortably under, and lower than RESEARCH predicted. The number matters because
`src/app/api/progress/route.ts:36` caps the body at `1024 * 1024` on both the declared
`content-length` and the actual bytes, and the sync queue treats a 413 as a **permanent drop** —
exceeding it would be silent, unrecoverable loss of a snapshot rather than a retry.

### The derivation control, re-proved against FULL banks (T-03-23)

The existing control is stub-driven and has only ever demonstrated that an *empty* bank reports
unwritten. D-03 rests on it, and the banks are now full, so it was re-run against them.

**Run in a genuine scratch copy** (`src/` copied out of the tree entirely), so the working tree
was never mutated and WINDOWS 40's hazard was impossible rather than merely avoided:

| | `pairsWritten` | `pendingPairs()` | `small-talk` grammar | scenario `complete` | scenarios complete |
|---|---|---|---|---|---|
| Full banks | 52/52 | `[]` | `available: true`, `"5 questions"` | `true` | 35 |
| **One entry emptied** | **51/52** | `["social/small-talk:grammar"]` | **`available: false`, `""`** | **`false`** | **34** |
| Restored | 52/52 | `[]` | `available: true`, `"5 questions"` | `true` | 35 |

One edit, five derived consequences, no second edit anywhere. The honesty mechanism works with
real content behind it and not only with none.

Afterwards: `git status` showed the five content banks byte-identical to `HEAD`.

### The build is the committed one (WINDOWS 40's mitigation, applied)

`.next` was deleted and rebuilt from the clean committed tree, and the built accessor was
asserted rather than assumed — the check 03-08 had to invent after a sweep poisoned a sibling's
build. All six passage titles appear **7× each** in the emitted JS and maps; `BANK[key]` appears
4×; `BANK["social/humor"]` appears **0×**.

---

## 2. The deletion, and what stands in its place

`WORLD_FALLBACK` (six worlds × three generic lines) and `getPhrases` are **gone**. Twelve call
sites — the five `SPEAKING_PACKS` and the three in the global speaking warm-up — now read
`getScenarioPhrases(...) ?? []`.

**Nothing changes on screen today**, and that is the point. Every one of those twelve keys was
curated and always was, so the fallback branch has been dead since 03-04. What changes is what
cannot happen in **Phase 4**: a new scenario authored without its own phrase set would have been
served a neighbour's, silently and indistinguishably, which is precisely the outcome D-01
rejected — reintroduced by a mechanism nobody would have been looking at.

The replacement is an assertion rather than a comment:

```
no silent fallback: every scenario resolves to a phrase set of its own
  phrases: <key> resolves to a NON-EMPTY set of its own                    (×35)
  the phrase module exports no lenient accessor and no per-world fallback
```

`!== undefined` was considered and rejected: an empty array is a scenario with nothing to
practise, which is the same lie in a quieter voice. The module header now states the rule as a
rule — *add a scenario, add its six phrases in the same change* — because the guard is only worth
anything if the next author meets it before the failure rather than after.

**Coalescing at the call site is correct here and would not be elsewhere.** If a set were ever
deleted, the speaking pack gets *shorter*; it does not quietly serve another scenario's lines.

**Verified:**

```
! grep -vE '^\s*(//|\*|/\*)' src/lib/content/phrases.ts | grep -q 'WORLD_FALLBACK'   PASS
! grep -rE '[^A-Za-z]getPhrases\(' --include='*.ts' --include='*.tsx' src            PASS
every one of the 35 scenarios resolves to its own phrase set                         PASS
```

**And against a served production build (T-03-26):** all five pack titles render on
`/skill/speaking`; **zero** of the six deleted fallback lines appear on any of eight pages
checked (`/`, `/skill/speaking`, `/world/social`, `social/dating`, `travel/airport`,
`academic/news`, `practical/banking`, `native/register`); `native/register` still renders
*"Can you send it over when you get a sec?"* and `work/negotiating` *"I'd struggle to justify
that internally."* The pack **contents** are behind a client-side tab and were not seen —
ledger entry 43.

---

## 3. The three declared gaps, closed

The plan asked whether they were worth strengthening now. They were, and they are done — see
Deviations for why this went beyond assessment.

| Gap | What it missed | Now |
|---|---|---|
| **WINDOWS 39** (03-08) | `no passage text is repeated` fingerprints the **joined** body, so a passage borrowing **one paragraph** passes. 03-08's M23 reproduces it and **survived** a full run | 426 cross-scenario paragraph-pair assertions. M23's reproduction now **caught on its own label** |
| **WINDOWS 41** (03-10) | `is written for itself` fingerprints the whole task and `has its own three moves` the whole list, so **one borrowed move** passes both | 3,915 cross-scenario move-pair assertions |
| **03-09's finding** | `id === scenarioItemId(key, kind, parsed.localId)` recomposes from a slug parsed out of that same id — tautological. 03-09 fixed **its own** bank at the source and recorded that 03-05, 03-06 and 03-07 carry the identical hole | All three banks now asserted at the **source** never to spell the format by hand |

**Both corpora were measured clean before the assertions ran**, so these add no work and change
no content — they make a property that was true by an author's care true by the gate instead:

- **31 reading paragraphs**, all distinct, **0** exact cross-scenario reuse, highest
  cross-scenario Jaccard **0.081**.
- **90 speaking moves**, all distinct, **0** of **3,915** cross-scenario pairs at or above
  **J = 0.50**, **0** shared four-word runs carrying content (the five that exist are
  `say what you will`, `and say what you`, `before you say what`, `say who you are` — the
  instruction verb plus a pronoun).

### Mutation testing — because a new assertion that cannot fail is decoration

Run entirely in a **scratch copy with its own `node_modules`**, so the working tree and `.next`
could not be touched. Every hardening the phase paid for was carried, plus one this run needed:
a verdict requires a **landing proof**, the **expected label**, *and* a file that still parses.

| | Verdict |
|---|---|
| **M-A** `native/culture` given **one** of `native/idioms`' paragraphs (WINDOWS 39 / M23) | **CAUGHT** — `scenario reading: native/idioms paragraph 0 is not native/culture paragraph 0` |
| **M-B** `practical/appointments` given **one** of `travel/airport`'s moves (WINDOWS 41) | **CAUGHT** — `travel/airport move 3 is not practical/appointments move 3` |
| **M-C** the grammar bank spells the id format by hand | **CAUGHT** — `the grammar bank never spells the id format by hand` |
| **M-D** the reading bank spells it by hand | **CAUGHT** on its label |
| **M-E** the writing bank spells it by hand | **CAUGHT** on its label |
| **M-F** one scenario's phrase set emptied | **CAUGHT** — `phrases: native/culture resolves to a NON-EMPTY set of its own` |
| **M-G** a lenient accessor + fallback reintroduced | **CAUGHT** — `the phrase module exports no lenient accessor and no per-world fallback` |
| **C-1** those literals inside a **comment** | SURVIVED (expected — the comment strip works) |
| **C-2** one reading paragraph **reworded**, not copied | SURVIVED (expected) |
| **C-3** one speaking move **reworded**, not copied | SURVIVED (expected) |

**7 caught on their expected labels, 3 controls survived, 0 spurious.**

**Two verdicts were refused rather than counted, and that is worth recording.** An early M-A
attempt did not change the file at all and my first harness reported it "SURVIVED" — a false gap.
A second attempt landed but broke TypeScript parsing, so the non-zero exit was a `SyntaxError`
and not an assertion: "caught for the wrong reason", the hazard 03-03 named. Both were refused
and M-A was re-anchored line-wise until it landed cleanly. **A sweep that reports a verdict it
cannot justify is worse than no sweep.**

---

## 4. The near-duplication read-through

This is the phase's only defence against its named residual risk (**T-03-25**): the harness
asserts byte-identity, and a lazy paraphrase passes everything. Plans 03-03 through 03-10 each
ran Jaccard scans and all reported clean — but scans are not reading, so this was reading.

**Read in full:** all twelve Work and Practical phrase sets and their decks (plan 03), all ten
Reading & Ideas and Sounding Native sets and their decks (plan 04), and **all sixteen** of plan
10's rehearsals plus the fourteen from 03-09 they sit beside. Same-world neighbours were read
side by side, and the vocabulary card **examples** — the largest prose surface in plans 03 and 04
— were read for `practical/housing`, `practical/appointments`, `academic/summaries`,
`academic/debate`, `native/register` and `native/culture`.

### The verdict: no near-duplicate exercise, and I am confident of it

**Nothing in plans 03, 04 or 10 reads as another scenario's exercise with the nouns changed.**
The two pairs the plan singled out are both clean:

- **`work/networking` vs `work/feedback`** (same world, same level, one sitting). Networking is
  arriving, pitching with an image, introducing two people, leaving well; feedback is three lines
  for giving and three for taking. Their decks share nothing — *elevator pitch / work the room /
  a warm introduction / on my radar* against *a blind spot / sugarcoat / defensive / take
  something on board*. Different halves of professional life.
- **`travel/shopping` vs `practical/banking`** rehearsals (both B1, both at a counter, both plan
  10). They share a shape — order the facts, name what you want, get a person and a date when the
  person in front cannot decide — but shopping teaches *naming one outcome instead of waiting to
  be offered one* and banking teaches *three facts before any opinion*. The language each
  rehearses is disjoint.

Same-world highest cross-scenario similarity, measured to accompany the reading:

| World | Highest phrase pair | Highest term pair |
|---|---|---|
| Work (plan 03) | **0.20** — *"hear back"* / *"hear me okay"*, a homograph | 0.50 — `hands-on` / `a show of hands`, adjudicated by 03-03 |
| Practical (plan 03) | 0.33 — *"didn't make"* / *"can't make it"*, a homograph | 0.33 |
| Reading & Ideas (plan 04) | 0.20 | **0.00** |
| Sounding Native (plan 04) | **0.14** | **0.00** |
| Social | 0.50 — the pre-existing weekend pair every plan since 03-04 has reported | 0.33 |
| Travel | 0.25 | 0.33 |

The two worlds written fastest by one agent in plan 04 have the **lowest** similarity in the app,
and their vocabulary decks share not one content word.

### What a reader sees that a scan does not: two design echoes

Both are repetitions of exercise **design**, not of content. Neither was rewritten. Both are
recorded with numbers as ledger entry **44**, because Phase 4 should see them before writing.

**1. Sounding Native: four of five rehearsals are the same drill.** *Say it, say it again
differently, name what changed.* `idioms` (with, then without), `phrasal-verbs` (phrasal, then
single-word), `register` (colleague, then agency), `pronunciation` (three passes). `native/culture`
is the only one that escapes it. **Defensible**: contrast is the only self-markable drill for
style and accent when nothing is listening, and until the tutor lands in Phase 5 her own judgement
is the whole feedback loop. But it is the most concentrated design echo in the phase, and the
closest pair — `idioms` and `phrasal-verbs` — differ in level, in content and in what the third
move asks for, so it is the same *technique* applied to two neighbouring targets rather than the
same exercise twice.

**2. The A2 counter tasks: three of the four close on a read-back.** `travel/airport` ("say the
new time and the new gate back"), `travel/directions` ("say the first turn back"),
`practical/appointments` ("say the new day and time back"). `travel/restaurant` does not.
**Defensible**: read-back is *the* A2 survival technique, and meeting it in three unrelated
situations is how a technique is acquired — the argument 03-03 accepted for `I'd like … please`.
But it is the phase's most repeated single move type. Corpus-wide, **25 of 90 moves open with
"Say" and 18 with "Ask"** — 48 % on two verbs. Consistency was the stated goal
(03-CONTEXT names inconsistency across 52 exercises as the failure mode), so this is largely the
house style working as designed. It is still the number to see before writing move 91.

### Two things I am less sure about, said plainly

**`native/idioms` reads like a textbook, and nothing else in the phase does.** Its six phrases
(*a piece of cake, call it a day, under the weather, hit the nail on the head, on the same page,
break a leg*) and its eight cards (*once in a blue moon, beat around the bush, bite the bullet,
the last straw, cost an arm and a leg, let the cat out of the bag, on the ball, a blessing in
disguise*) are the most canonical idiom list in ELT. It duplicates **no** other scenario and
passes every assertion, so it is not a D-01 failure. But asked whether the authored content is
original *throughout*, this is the one bank where I would say: original, yes; *ours*, not really.
The phrases are the tracer's (03-01) and the deck is 03-04's, which deliberately held Sounding
Native to floors because depth is **CONT-04, Phase 4**. So this is a Phase 4 item and I am
flagging it rather than calling it a defect.

**`travel/restaurant` is the closest remaining same-page echo.** Its phrase set teaches *"I'm
allergic to nuts"* and its rehearsal is *Order around an allergy*, whose success line turns on the
word "allergic". I judged this **fine** — the rehearsal quotes nothing, and it teaches a
*sequencing* skill (say it before you order, not after) that the phrase alone does not. It is a
different thing from the two same-page echoes 03-10 found and fixed, which repeated an eight-word
stem verbatim. But it is the one I would most like a second pair of eyes on, so it is in the
browser checklist.

**Everything else reads as written for its own scenario**, and in places conspicuously so —
`native/register`'s card example *"That reads as blunt in English, even though it's normal in
Spanish"* is written for this learner and could not have come from anywhere else.

---

## 5. The browser pass (Task 2) — what a human saw

Run by the coordinator against `next start -p 3117`, signed in, on 2026-08-01. Recorded as
reported; nothing here is my observation.

### Criterion 3 — the one this phase could only prove by construction

Five scenario grammar questions answered in `social/small-talk`, **four wrong on purpose**. All
four topics reached **Weak spots by name** — *Question tags · Past simple · Echo questions ·
Present simple vs continuous* — each with an accuracy figure (`Echo questions · 0%`) and a **drill
behind it**. `attempts` recorded `{topic, tries, wrong, resolved, level}` under the composite ids,
and `srs` scheduled them at **box 1**.

This is the far end of D-05 and D-06 together: a mistake made inside a scenario, stored under an
id that names that scenario, aggregating into a topic the learner can then drill. Every plan from
03-05 onward proved it deterministically and none had seen it. **WINDOWS 33 closes.**

### The explained key rendered — the first time in this app

`academic/news`, four questions answered, **Check answers** → `1 / 4 correct.` with the authored
explanations in the DOM. Verified properly: two `explain:` strings were pulled straight out of
`scenario-reading.ts` and asserted present, rather than guessed at by wording. **WINDOWS 37
closes**, and with it the claim 03-07 and 03-08 could only make by construction — *every scenario
comprehension question tells the learner why the answer is the answer.*

### Steps are derived and honest

`social/small-talk` renders six steps including *Lock it in*, *Practise speaking* and *Practise
grammar*. `academic/news` renders its own passage, its own warm-up (1/6) and its own deck (1/14).

### A false alarm, chased down rather than filed

The first two answers produced *"No weak spots yet"* and *"No open mistakes"* — and that is
**correct behaviour**: both had been answered correctly (`wrong: 0, resolved: true`). Recorded
here so the next reader does not re-open it. It also means both empty branches of the weak-spots
tab and the mistakes notebook were seen working, which 03-02 listed as unobserved.

### The badge reading, settled as a rule and left open as one narrow question

Observed: **Due today 4 · Your mistakes 2 · Weak spots 4**, against an `attempts` store read as
holding four entries with `wrong: 1, resolved: false`.

**The rule is intentional and needs no further work.** The three badges answer three different
questions and are *meant* to disagree:

| Badge | Source | Predicate |
|---|---|---|
| Due today | `dueReviewIds()` over `srs` | box/due — independent of `attempts` entirely |
| Weak spots | `weakTopics()` (`progress.ts:386`) | `wrong > 0` **regardless of `resolved`** — a topic you fixed once is still a topic you got wrong, which is the point of a recommendation |
| Your mistakes | `openMistakeIds()` (`progress.ts:405`) | `wrong > 0 && !resolved` — clears on a correct re-answer, and the empty state says so: *"Get it right again and it clears automatically"* |

The badge and the view call the **same function** (`ReviewHub.tsx:42`, `MistakesView.tsx:27`), so
they cannot drift from each other.

**What is not settled, and it is one step wide.** Run against a state of exactly four
wrong-and-unresolved `social/small-talk` grammar attempts, the code yields **four**, not two — all
four ids resolve through `resolveReviewItem`, across four distinct topics. So either two entries
were `resolved: true` at the instant the badge rendered and `false` when the store was later read
— and **4 / 2 / 4 is precisely what two wrong-then-right items produce**, which is checklist item
2d, the one the reviewer was working through — or there is a real mismatch. **Ledger entry 47**
carries the predicates and the single next step: answer two wrongly, read the badge and the store
*at the same instant*, confirm 2/2. It does not need re-deriving.

### A near-miss worth recording, because the answer is reassuring rather than obvious

The reviewer's own regex looked for the explanations by searching for *because / the passage /
Why:* and found nothing, then warned that any assertion phrased that way would be weaker than it
looks. **Checked: no assertion anywhere in the harness matches explanation prose.** Explanations
are gated by `filled(q.explain)` and by distinctness within a passage, and by nothing else;
mutations M4, M8 and M9 are what give those teeth. Measured over the live bank: of the 36
explanations, **0** contain "because", **0** contain "Why:", and only **7** contain "the passage"
— they are written as substantive prose rather than to a formula, which is why the regex missed
them and is arguably the better teaching. **Ledger entry 48**, so nobody later adds a
wording-shaped assertion believing it is a tightening.

### Not reached — open by name, not rounded up

Typing into a writing desk (**35**) · ticking a rehearsal move and the no-double-award property
(**38**) · `ScenarioSkillCoverage.summary` (**36**) · `WorldView` pills (**34**) · the empty-a-bank
honesty demo on a served page · the two neighbour side-by-sides · **any phone pass, for anything,
in this project**. All carried in **ledger entry 46** with the checklist preserved below.

---

## 6. Task 3 — the requirements close, and what the tick asserts

**CONT-01 — complete.** Closed at 03-10 on a derived predicate asserted in its own command before
the tick, and **confirmed in a browser** here. What the tick asserts: every scenario in all six
worlds offers a real, scenario-specific exercise in each skill it declares — 52 of 52, derived,
no stub and no placeholder — and that a human has now driven two of the four skills end to end
(grammar through to weak topics, reading through to the explained key). What it does **not**
assert: that anyone has typed into a writing desk or ticked a rehearsal move. Both are the
interactive half of a surface whose static render and whose data are proved, and both stay open
in the ledger. No content is missing, which is what separates this from 02.1-02's decision to
leave CELPIP-10 open — there the *content* was absent, and the requirement's own wording rested
on it.

**CONT-02 — complete.** Closed at 03-04 on `scenariosWithPhrases === 35 && scenariosWithVocabulary
=== 35`, and its SRS leg — the half a script cannot establish — confirmed twice: a due scenario
item resolved and rendered in `/review` on 2026-08-01, and at this pass scenario attempts were
recorded under their composite ids and scheduled at box 1. Not re-run: the badge-agreement check
and clearing a mistake by re-answering it, both in entry 46.

**Ledger at the close of Phase 3:** 33 open, 1 waived, 14 fixed, 48 total. Closed by this plan:
**29** (the recall loop and the review flow — items 1 and 2 driven, item 3 moot at 52/52), **33**,
**37**, **39**, **41**. Waived: **44**, the two design echoes, ratified as stated design decisions
rather than debt. Restated because their status changed while their code did not: **34**.
Opened: **43**, **45**, **46**, **47**, **48**.

---

## Deviations from Plan

**Four, all recorded rather than absorbed.**

### 1. [Rule 2 — missing critical functionality] The three declared gaps were CLOSED, not merely assessed

- **The plan asks** for an assessment of WINDOWS 39, WINDOWS 41 and 03-05/06/07's tautological
  id line. It does not ask for a fix.
- **Why the fix was taken:** it is the *same argument the plan makes for the deletion at the top
  of Task 1.* Each is a mechanism that is harmless today and a trap for the author who arrives
  next, and Phase 4 is exactly the phase that grows these banks. Each ledger entry names a
  blocker and every one had expired: 39 was blocked on 03-09's uncommitted work in the harness
  (committed at `3f7498d`), 41 was left "for the plan that owns the harness next" (this one), and
  03-09 explicitly recorded that the other three banks carry its hole. This plan's
  `files_modified` includes the harness, no sibling is running, and the cost is one appended
  group.
- **Why it is safe:** both corpora were measured clean *before* the assertions were written, so
  nothing could turn a true assertion into a false alarm; and each is proved to have teeth by a
  mutation caught on its own label rather than trusted.
- **Files modified:** `scripts/verify-scenario-content.mts` · **Commit:** `c0e9a79`

### 2. [Scope, deliberately NOT taken] `WorldView.tsx` still counts declarations

- WINDOWS 34 has been open since 03-05, and its **status changed** during this phase while its
  **code did not**. When it was filed, `/world/social` showed a solid Speaking pill on a scenario
  whose speaking practice was unwritten — a live overclaim. At 52/52 the two surfaces now agree,
  by accident rather than by construction.
- **Not fixed**, for three reasons: it is not a live defect today, this plan does not own the
  file, and a UI change made at a gate is a change **nobody in this run can look at** — which is
  the failure mode the whole phase is trying to end. The fix remains three lines.
- **It re-arms in Phase 4** the moment a scenario declares a skill before its bank entry exists,
  which is the normal authoring order. Entry 34 has been **restated** to say exactly that, so a
  reader does not find a stale description claiming a live overclaim that is not there.

### 3. [Rule 1 — bug in my own tooling] Two mutation verdicts were refused

- **Found during:** the sweep, by requiring evidence for a verdict rather than reading an exit
  code. My first driver reported M-A **"SURVIVED"** when its anchor had never matched and the file
  was untouched — a fabricated gap. A second attempt landed but broke TypeScript parsing, so the
  non-zero exit came from a `SyntaxError` and not an assertion — a fabricated catch.
- **Fix:** the driver now refuses a verdict without a landing proof (`cmp` against a snapshot),
  refuses one where the output carries a parse error, and requires the **expected label** for a
  CAUGHT. M-A was re-anchored line-wise and then caught properly. Both hazards were already
  documented by 03-02 and 03-03; I reproduced them both in one run.

### 4. [Rule 1 — bug] The two design echoes were reported for a decision, not fixed quietly

- The near-duplication read-through found two repetitions of exercise **design** (§4). Neither is
  a D-01 failure and rewriting either is content work, so both were **reported by name with
  numbers** rather than acted on — the plan's own instruction, and the boundary 03-CONTEXT draws
  around scope reduction as a decision to bring back rather than take.
- **Outcome:** the coordinator reviewed both arguments and **accepted them as stated design
  decisions.** Entry 44 is therefore **waived** with that reason recorded, not left open as debt.
  It stands as a design record aimed at Phase 4, along with the `native/idioms` flag, which CONT-04
  will either deepen or inherit.

### Not a deviation, but the thing this plan had to get right

**`REQUIREMENTS.md` was untouched until Task 3.** CONT-01 and CONT-02 were already ticked (03-10
and 03-04, each after asserting its predicate), and neither was re-examined at Task 1 — confirming
a requirement on the strength of a green script alone is the overclaim this phase's derivation
exists to make impossible. Both now carry, in the requirement itself, **what the browser pass saw
and what it did not**, so the tick is auditable rather than assumed.

**The state tooling defect is recorded rather than absorbed a ninth time.** Eight consecutive
plans hand-corrected it; the root cause (a line-oriented read of a hard-wrapped paragraph, taking
the first physical line only) plus three further specific bugs and 03-07's blanket-replace warning
are consolidated as ledger entry **45**, in one place a fix can start from instead of scattered
across eight summaries.

---

## Known Stubs

**None.** `pendingPairs()` returns empty, every one of the 52 declared pairs resolves to a bank
entry, and no page renders the "Not yet available" panel for any declared skill. That panel still
exists and is still correct — it is what a scenario would get if a bank entry were deleted, which
is the control that keeps 52/52 honest.

## Threat Flags

**None.** No new network surface, no new auth path, no schema change, no dependency, no file
access in shipped code. The register's eight `mitigate` dispositions:

- **T-03-02** (a saturated blob exceeding the cap) — **measured**, 143,830 bytes / 13.7 %, over
  every id the banks can emit plus every other field at a maximum. The gate fails rather than
  warns.
- **T-03-23** (a completeness claim outrunning the banks) — the control **re-proved against full
  banks** in a scratch copy; one emptied entry moves five derived numbers with no second edit.
- **T-03-24** (marking a requirement on unobserved behaviour) — `REQUIREMENTS.md` untouched;
  Task 3 is preconditioned on the pass and instructed to leave a requirement pending with a named
  failing check.
- **T-03-01** (prototype pollution at the widened surface) — `verify-schema` **309**,
  `verify-merge` **25647**; no validation weakened anywhere.
- **T-03-25** (a near-duplicate reaching production unreviewed) — the read-through above, done and
  reported by name; findings are two design echoes and no duplicate. The second pair of eyes is
  item 6 of the checklist.
- **T-03-26** (the deletion regressing the speaking page) — all twelve call sites verified curated
  by grep **before** the edit; `tsc`, `lint`, `build` clean; the 35-scenario invariant asserted;
  all five pack titles and two scenario warm-ups read from a served production build; **zero**
  fallback lines on eight pages.
- **T-03-27** (a Phase 4 scenario served a neighbour's phrases) — the mechanism is **deleted**,
  the replacement invariant fails at authoring time (M-F, M-G), and the rule is in `AGENTS.md`.
- **T-03-SC** (package installs) — zero installed; **11 + 11**, asserted as a hard test.

## Self-Check: PASSED

All six modified files exist on disk; commit `c0e9a79` is in `git log`;
`git diff --diff-filter=D HEAD~1 HEAD` is empty, so nothing was deleted; the harness reproduces
**11,981** assertions on the committed tree; `git status --porcelain` shows only the pre-existing
untracked `.claude/`; **port 3000 has no listener, no node process survives this session, and a
request to it returns HTTP 000** (TIME_WAIT entries from my own closed connections remain and
expire by themselves).

---

# THE CHECKLIST — what it earned, and what it still owes

**Items 1 (partly), 3 and 4b are DONE** (§5). Items **2c/2d, 4a, 4c, 4d, 5, 6 and 7 remain** and
are carried as ledger entry **46**. Preserved in full below so the remainder can be picked up
without rebuilding it.

```
npm run build && npx next start -p 3117     # sign in first: 2, 3 and 5 need a session
```

Ports **3000 and 3117 are both free** as of this summary — the `next start` left on 3117 (PID
40108) was killed and confirmed dead (`curl` → HTTP 000). The only node processes still running
are the Playwright MCP, which are the reviewer's tooling and were left alone.

### 1 — ROADMAP criterion 1 — PARTLY DONE (steps derived and honest on two scenarios; 1a/1b/1c not individually reported)

| # | URL | What to confirm |
|---|---|---|
| 1a | `http://localhost:3117/world/social/complaining` | Declares **Speaking + Writing**. Briefing, six phrases about complaining, a vocabulary step, a rehearsal *The repair that was not done* with **three moves**, and a **different** writing task (a message to the neighbours upstairs) with its own checklist and model answer. Nothing reading as a placeholder; nothing saying practice is not written yet |
| 1b | `http://localhost:3117/world/native/phrasal-verbs` | Declares **Grammar + Speaking**. A **five-question quiz about phrasal verbs** — separability, particles, `postpone → put off` — not generic grammar |
| 1c | `http://localhost:3117/world/travel/directions` **and** `http://localhost:3117/world/travel/airport`, side by side | Same world. Their **phrases** and their **rehearsals** must be different. Airport is *The connection you just lost*; directions is *The street that is not on the map* |

### 2 — ROADMAP criterion 2 — 2a/2b DONE (2026-08-01, closed WINDOWS 29); **2c and 2d STILL OWED**

| # | Where | What to do, then confirm |
|---|---|---|
| 2a | any scenario, **"Lock it in"** | Reveal a card and answer **"Not yet"** on **two** items, then **"Got it"** on two more. Watch for the XP float and the "Locked in" screen |
| 2b | `http://localhost:3117/review` | The two "Not yet" items are listed as **due today** and render — the Spanish, the reveal, both buttons |
| 2c | dashboard **and** `/review` | The dashboard's **due count** and the review hub's **"Due today"** badge both include them, and **the two numbers agree with the list** |
| 2d | `/review` → **"Your mistakes"** | The ones you got wrong are there. Answer one correctly — it **clears** |

### 3 — ROADMAP criterion 3 — **DONE.** Four topics reached Weak spots by name. WINDOWS 33 closed

| # | Where | What to do, then confirm |
|---|---|---|
| 3a | `http://localhost:3117/world/social/small-talk`, step 5 | Answer **two questions wrongly on purpose**. Confirm the explanation panel appears and the option you picked is marked — **nobody has ever answered one of these** |
| 3b | `/review` → **"Weak spots"** | **"Question tags"** is named, and the drill it offers **actually contains questions** |

### 4 — The four nobody had ever done: **4b DONE** (the explained key rendered; WINDOWS 37 closed). **4a, 4c, 4d STILL OWED**

| # | URL | What to do |
|---|---|---|
| 4a | `http://localhost:3117/world/work/emails` | **Type into the writing desk.** Counter turns *in range* around 70 words · **Save draft** · tick a checklist line · **Show model answer** reveals it. *Nobody has typed into one* |
| 4b | `http://localhost:3117/world/academic/news` | **Press Check answers** on the passage. **The explained key has never rendered anywhere in this app** — every explanation is behind `submitted && q.explain`, so `curl` has never reached one. Confirm each question says *why* the answer is the answer |
| 4c | `http://localhost:3117/world/travel/airport` | **Tick all three moves.** Line-through on tick · counter reaches **3 of 3** · **Rehearsed** pill · **15 speaking XP awarded ONCE**. Then **untick and re-tick** — it must **not** award again (T-03-22, proved only by construction) |
| 4d | `http://localhost:3117/skill/speaking` | Open a pack and confirm it has **phrases in it**. The five packs were repointed onto the strict accessor in this commit and their titles render, but their **contents have never been seen** — they sit behind a client tab `curl` cannot click |

### 5 — The honesty mechanism — **STILL OWED** (proved in a scratch copy against full banks; not seen on a served page)

Ask me to temporarily empty one scenario's exercise entry. The pair must say its practice is
**not written yet**, offer the global skill room instead, and **disappear from that page's
structured data** — and restoring it must bring it back **with no other edit**. I have proved this
in a scratch copy against the full banks (52/52 → 51/52 and back); this is seeing it on the page.

### 6 — Two neighbours side by side — **STILL OWED.** The executor's read-through stands as the phase's reader pass and was accepted; this was the second pair of eyes

| # | Open in two tabs | Read against each other |
|---|---|---|
| 6a | `/world/work/networking` **and** `/world/work/feedback` | Same world, same level, one sitting (plan 03). Their **phrases and vocabulary** |
| 6b | `/world/travel/shopping` **and** `/world/practical/banking` | Both **rehearsals** written in plan 10, both at a counter |
| 6c | **my own additions**, worth two more minutes: `/world/native/idioms` and `/world/native/phrasal-verbs` — the two rehearsals whose **drill design** is closest (§4 above) — and `/world/travel/restaurant`, whose rehearsal is built on its own phrase set and is the closest same-page echo I found |

### 7 — On a phone — **STILL OWED.** Never done, for anything, in this project

Open **one** scenario on a real phone. Confirm the recall deck's buttons are **tappable**, the
passage is **readable**, and the **writing editor is usable at phone width**. This is the device
the beta user practises on, and nothing from Phase 2.1 or Phase 3 has run on one.

### Also worth a glance while you are there (editorial, WINDOWS 31, 32)

- `native/register`'s six phrases are **three contrasting pairs** — casual then formal. They are
  only legible if the pairs sit **adjacent** in the rendered order.
- `work/negotiating` (C1) and `academic/articles` (C1) carry the **longest lines in the corpus**.
  Check they do not break badly in a card.

**Task 3 is done:** CONT-01 and CONT-02 carry the status the pass earned, each annotated with what
was seen and what was not, and everything unreached is open in `.planning/WINDOWS.md` by name —
entry **46** for the checklist remainder, **47** for the one narrow badge question, **48** for the
explanation-wording near-miss. Phase 3 closes here.
