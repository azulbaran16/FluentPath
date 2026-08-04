---
phase: 04-native-level-depth
plan: 08
subsystem: scenario-content
tags: [decision, coverage-honesty, declarations, grammar, speaking, bundle-size, tripwires]
status: complete

requires:
  - "04-01's id-stability gate + fixture — 5 additions regenerated into it, zero retirements"
  - "04-01's session-length invariant — native/register's minutes raised under it, in the declaring commit"
  - "04-06's REBUILT corpus harvester — the one that sees reading bodies, glossaries and question prompts"
  - "Phase 3's derived-coverage registry (scenario-coverage.ts) — the thing WorldView was failing to read"
  - "the 03-11 gate's ratified design-echo record — option E's brief, and the reason three rehearsals keep theirs"
provides:
  - "a world page whose pills read the registry, so a declaration can never again outrun its bank on that surface"
  - "the FIRST asserted 'no pair is pending' — Phase 3 could only report it"
  - "native/register's grammar bank: 5 questions on register-carrying grammar nothing else in the corpus teaches"
  - "a rehearsal design that is not contrastive repetition, and the measured reason the other three keep theirs"
  - "measured authoring rates for the next phase: 80.6 w/question for register grammar vs research's 47.7"
affects:
  - "04-09 / the phase gate: CONT-04 must close with 'more reading' named as a deferral (WINDOWS 61), not silently"
  - "every future scenario added to any world — the world page now inherits the honest pill"

tech-stack:
  added: []
  patterns:
    - "deriving a client component's honesty data in the SERVER component when the registry it needs would drag six content banks into the bundle — measured, not assumed"
    - "making an honesty prop REQUIRED so the defect cannot return by omission, which is how it arrived"
    - "pinning a multiple-choice answer per slug rather than counting option strings off a list, so every flip fails"
    - "building mutation anchors from the file's OWN line terminator, after a CRLF/LF anchor silently no-opped"

key-files:
  created: []
  modified:
    - src/components/WorldView.tsx
    - src/app/(catalog)/world/[slug]/page.tsx
    - src/lib/content/scenario-grammar.ts
    - src/lib/content/scenario-speaking.ts
    - src/lib/curriculum.ts
    - scripts/verify-scenario-content.mts
    - scripts/fixtures/scheduled-item-ids.json

decisions:
  - "THE MENU WAS PRESENTED WITH PRICES AND NOT TAKEN. The user chose C and E; A and B were declined on the ratio argument, F stayed deferred. 'More reading' is therefore NOT delivered by Phase 4 and is recorded by name as WINDOWS 61 so CONT-04 cannot close silent about it."
  - "LEDGER 34 WAS FIXED THE OPPOSITE WAY TO THE WAY IT PREDICTED. Its stated three-line fix cost +217,154 B (+52.1%) on the /world/[slug] client bundle, measured. Deriving in the server component cost +50 B for identical pills."
  - "THE PLAN NAMED FOUR TEACHING POINTS AND native/register ALREADY OWNED ALL FOUR — as live vocabulary cards in that very scenario. Seventh consecutive plan whose named item was the duplicate."
  - "TWO OF MY OWN DEFECTS, both surfaced by the mutation sweep: an assertion that could not fail, and a mutation that never applied (LF anchor, CRLF file). Fixed and re-proved rather than reported around."
  - "04-07's stated corpus size (4,523/4,565) does not reproduce. The true figure is 4,410, arithmetically exact against independently counted banks. A reporting error in that summary, not a harvester defect."
  - "Only native/idioms moved off contrastive repetition. The other three keep theirs BY NAME because contrast is their subject — declining by name is the same discipline this plan's checkpoint ran on."

metrics:
  duration: "~95 min"
  completed: 2026-08-04
  tasks: 3
  commits: 3
  harness_assertions: 14577
  harness_baseline: 14479
---

# Phase 4 Plan 08: The Declarations Decision Summary

The world page now reads the coverage registry instead of counting declarations — closing a
latent overclaim carried open since 03-05 — and the container menu was **priced, presented and
handed to the user**, who took two of six. `native/register` gained a grammar declaration with
its five questions in the same commit, and `native/idioms`' rehearsal moved off the drill four of
five Sounding Native rehearsals were running.

## The decision, verbatim

> **C, E** — Two options, so **no split** — proceed in this plan as written.

**Declined by name, which is the point:**

| Option | Verdict | Why |
|---|---|---|
| **A** `native/phrasal-verbs` declares reading | **declined** | ~631 authored words is 4× CONTEXT's projected 157.8, and both existing native passages are already above the corpus mean (323 and 291 body words vs 247) |
| **B** `native/register` declares reading | **declined** | same cost, same ratio |
| **D** register grows to 2–3 writing tasks | **declined** | research priced it as "bank shape + accessor + **1 call site**". I measured **eight further assertion blocks in the harness** that read the accessor as a single prompt, reshaping for all **nine** writing pairs for one scenario's benefit |
| **F** second passage/rehearsal per scenario | **deferred** | needs a picker that does not exist; UI work, outside D-01's scope |

**What "none" would have cost was put on the table before the choice, and two of D-01's four named
items were still not bought.** The banks are delivered (04-01…04-07); *more rehearsals* is
delivered in kind by E; ***more reading is not delivered by Phase 4 at all.*** That is now
**WINDOWS 61**, open, so `04-09` must name it inside the CONT-04 annotation rather than letting the
requirement close quietly.

## The unconditional part: ledger 34, closed the opposite way to the way it predicted (`47454ef`)

The ledger said the fix was *"three lines (import `getScenarioCoverage`, pass available per skill)"*.
I measured that spelling before shipping it, per the coordinator's instruction:

| Variant | `/world/[slug]` client JS | Delta |
|---|---|---|
| Baseline (the bug) | 416,798 B · 6 chunks | — |
| **Import the registry into `WorldView`** | **633,952 B · 9 chunks** | **+217,154 B · +52.1 %** |
| **Derive in the server component** | **416,848 B · 6 chunks** | **+50 B · +0.01 %** |

`WorldView` is `"use client"` and `scenario-coverage.ts` imports all six content banks, so the
obvious reading of the ledger ships the curriculum to a browser to decide what colour five pills
are. `ScenarioView` already does exactly that on the sibling route, which is why the precedent
looked safe and why measuring rather than trusting it was the right call.

Two further choices:

- **The `written` prop is REQUIRED.** The defect was a caller withholding what it knew, and
  `SkillPill.available` defaults to `true` — the one default a caller that *has* the registry must
  not fall back to. Required means the next caller cannot re-introduce it by omission.
- **Two source-read assertions**, on 03-09's technique, so a three-line fix is not a three-line
  revert. Both mutation-proved below.

At 53 of 53 written this changes nothing on screen. That is the point: it changes what cannot
happen next — and this plan then declared a skill twice, which is exactly the move that would have
armed it.

## Option C — `native/register` declares grammar (`b4c0e6b`)

**The plan named four teaching points and the scenario already owned all four.** Contractions, the
agentless passive, the distancing past and hedges are **live vocabulary cards in `native/register`
itself**:

| Named by the plan | Already live, where |
|---|---|
| contractions | `#vocab#a-contraction`, `#vocab#a-full-form`, **and** the writing checklist: *"Three or more contractions in the casual version and not one in the formal version"* |
| the agentless passive | `#vocab#the-agentless-passive`, the live phrase *"The message appears to have been copied…"*, **and** `work/emails#grammar#passive-invoice-sent` |
| the distancing past | `#vocab#the-distancing-past`, the live phrase *"I was wondering whether an extension…"*, **and** `work/emails#grammar#was-wondering-softener` |
| hedges | `#vocab#a-hedge`, `#vocab#over-hedge-something`, **and** `work/interviews#grammar#hedge-would-say` |

This is the **seventh consecutive plan** in which an item the plan itself named turned out to be
the duplicate. Writing them again would have been the deck read back as a quiz.

**What the five teach instead** — register-carrying grammar the corpus names nowhere:

| Slug | Teaching point | Answer direction |
|---|---|---|
| `full-form-as-emphasis` | the **full** form in casual speech is the *marked* one — "I am not" draws a line | casual setting, full form |
| `ellipsis-casual-speech` | dropping subject + auxiliary — *"Seen the email?"* | **casual form** |
| `negative-inversion-formal-notice` | inversion after a fronted negative adverbial — *"At no point did we…"* | **formal form** |
| `get-passive-casual` | the spoken passive built with *get*, carrying the speaker's sympathy | **casual form** |
| `must-in-written-notice` | *must* as the register of written regulation, against spoken *have to* | **formal form** |

**The set runs both ways, and the harness pins each answer per slug.** Two casual, two formal, and
`full-form-as-emphasis` in neither group on purpose. A register set whose right answer is always
the formal option teaches that formal is correct and casual is sloppy — the opposite of the
scenario's own first line.

**Topic strings: exactly one new permanent string.** `Register markers` is new; `Passive voice` and
`Modals` were reused character for character so a learner's history *aggregates* with `work/emails`
rather than fragmenting. `RECORDED_TOPICS` extended in the same commit.

**`minutes` 17 → 21**, in the declaring commit. The session-length invariant models phrases and the
deck only, so grammar's time is added on 04-02's measured rate (7 minutes for 10 questions = 42 s
each), rounded up rather than down.

## Option E — one rehearsal off contrastive repetition (`0f0d13d`)

The 03-11 gate recorded that four of five Sounding Native rehearsals are *say it, say it again
differently, name what changed*, with `native/culture` the only escape, and **ratified it**. That
ratification stands. What it also said is that the shape supports another design.

**Only `native/idioms` moved, and the other three are declined by name** — the same discipline the
checkpoint ran on:

| Scenario | Kept? | Why |
|---|---|---|
| `native/register` | **kept** | the scenario *is* the formal↔casual dial; contrast is the subject |
| `native/phrasal-verbs` | **kept** | the scenario *is* the phrasal/single-word twin |
| `native/pronunciation` | **kept** | its three passes are the only self-marking a scenario whose scorer cannot hear what it drills has (04-07) |
| `native/idioms` | **moved** | its subject is using idioms like yourself, not like a phrasebook. The repetition was borrowed from the neighbours |

The device instead is **predict-then-check with a count and a ban**: name the two idioms before you
start, spend exactly those two, let a third go past. Nothing is said twice. It exposes the failure
D-04 named — reaching for an idiom because it is the only phrase you have — and it is checkable
alone, because counting to two needs no listener. **Four of five → three of five, asserted and
printed on every run.**

**Safe on live data, and this is why E was cheap:** speaking ids are not in `SCHEDULED_ITEM_KINDS`,
so no learner's stored schedule is keyed by this item. **The fixture did not move — verified, not
assumed.** Slug and title unchanged and still accurate.

## Authoring cost, measured against research's estimate

| Option | Research estimate | **Measured** | Ratio |
|---|---|---|---|
| C (5 grammar questions) | 239 (5 × 47.7) | **403** excl. topic strings (**80.6**/question) | **1.69×** |
| E (1 rehearsal) | 84 | **105** | 1.25× |

**Why C ran 69 % over, for the next phase to plan against:** the breakdown is prompt 15.4 · options
8.4 · **explain 56.8**. A register question must *name its reader* in the prompt — an unattributed
register question is unanswerable — and its explanation has to say why *both* options are
grammatical and what decides between them. Register grammar is not a 47.7-word unit.

## Corpus scan — and a correction to 04-07's reported figure

Run with **04-06's rebuilt harvester (`corpus2.mts`)**. Note the scratchpad also holds 04-05's
broken `corpus.mts`, which still pushes `rd.body` (a `string[]`) through a string-only guard and
still reads `g.term`/`q.prompt` against `{word, meaning}`/`q.q` — the three defects 04-06 fixed.
**Using the wrong one silently drops three populations, so it was checked, not assumed.**

**04-07's reported corpus size does not reproduce.** That summary states 4,523 fields at baseline
rising to 4,565. The same harvester on this tree measures **4,410**, and content has only grown
since. The figure is **arithmetically exact** against independently counted banks:

```
phrase fields  720 = 2 × 264 phrases + 192 tipped   ✓
vocab fields  1056 = 3 × 352 cards                  ✓
```

Every population is non-empty. So this is a **reporting error in 04-07's summary, not a harvester
defect** — recorded here so the next plan does not chase a phantom 155 fields.

**Results.** Zero exact duplicates in prose in either scan.

| Scan | Comparisons | Exact | Highest J |
|---|---|---|---|
| Option C drafts, **before authoring** | 44,100 | **0** | 0.357 → **0.250** after two rewrites |
| Option E draft, **before authoring** | 17,760 | **0** | 0.250 |
| Option C **final**, prose only, excluding itself | 35,090 | **0** | 0.250 |

**Three fields rewritten while still uncommitted, so all three were free:**

| Field | Was | Rewritten because |
|---|---|---|
| `ellipsis-casual-speech.prompt` | *"Two colleagues at the coffee machine…"* | J = 0.357 against `social/small-talk#speaking.title` — *"Two minutes at the coffee machine"*. A shared distinctive setting |
| `get-passive-casual.prompt` | *"…with no warning at all."* | J = 0.294 against a global passage option — *"A city with no cars at all"* |
| `get-passive-casual.explain` | *"Spoken English has a passive of its own…"* | **The consecutive read, not the scan.** Second of five explanations to open on "spoken English" — a repeated frame a word-set metric cannot see |

**On the 10 "exact duplicates" the raw scan reported:** every one was a single- or two-word
multiple-choice **option** — `must`, `am not`, `aren't`, `Seen`. Closed-class grammatical forms
must collide across a bank of grammar questions; that is not a duplicated teaching unit. Judged on
prose (prompts and explanations) and reported separately rather than either gamed or ignored.

## Mutation sweep — 7 declared, 7 executed, 7 caught, 4 controls green, **1 defect in my own work**

| # | Mutation | Result |
|---|---|---|
| M1 | `WorldView` stops passing `available` — the exact shape of ledger 34 | **caught** |
| M2 | registry imported into the client component — the +217 KB spelling | **caught** |
| N1 | a skill declared with **no bank behind it** | **caught** (both pair-count literals) |
| N2 | same, with the literals also raised — isolates the new assertion | **caught** (*no declared pair is unwritten*) |
| N3 | `native/idioms`' rehearsal put back onto contrastive repetition | **caught** |
| N4a/b | a casual answer flipped to the formal option | **caught**, both |
| N4c | a formal answer flipped to a casual one — the other direction | **caught** |

**N4 survived on its first run, and both causes were mine.**

1. **The mutation never applied.** Its anchor used `\n` against a file with **566 CRLF terminators
   and zero bare LF**. Confirmed by testing the anchor in isolation rather than assuming — this is
   the defect 04-01 recorded and fixed once already. Rebuilt to derive the terminator from the
   file itself.
2. **The assertion could not fail.** It counted "casual answers" against a list holding **both**
   `'m not` **and** `am not`, so `full-form-as-emphasis` satisfied it whichever way its answer
   pointed. Replaced with an expected answer **pinned per slug**; three flips in both directions
   now fail.

Had I only fixed the mutation, the sweep would have gone green and shipped an assertion that could
never fire. The rule "suspect your own mutation first" found the first defect; it does not excuse
skipping the second.

**Every restore was a copy-back, never `git checkout --`, because the files under test were
uncommitted** (hazard 4). All files verified byte-identical to their pre-sweep state.

## The tripwires survived as tripwires

Both pair-count literals were **hand-raised 52 → 53 in the same commit as the declaration**, and
both are still literals:

- `DECLARED_PAIRS.length === 53` — at `:531`, **not `:520` as the plan states**.
- `COVERAGE_TOTALS.pairsTotal === 53` — at `:713`, and it is **one half of a compound sharing an
  assertion with the cross-check** `COVERAGE_TOTALS.pairsTotal === DECLARED_PAIRS.length`. The
  cross-check is untouched. Only the `53` was raised.

Neither was replaced by a self-comparison. The comment above each now says why, and says what
`DECLARED_PAIRS.length === DECLARED_PAIRS.length` would cost. **N1 proves they still fire.**

**And the assertion this phase earned:** `pendingPairs().length === 0`. Phase 3 kept that reported
because it moved on almost every plan; this phase started at zero and never left a pair unwritten.
N2 proves it fires independently of the literals.

## Verification

Every `<verify>` block in both executed tasks was run. **All passed.**

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **14,577** pass (baseline 14,479; 14,481 after Task 2; 14,570 after C) |
| `verify-id-stability.mts` | **2,021** pass (baseline 2,001); **651** ids, 15 retired (unchanged) |
| Fixture diff | **5 added · 0 removed · 0 changed hashes** |
| `--update` idempotence | fixture byte-identical after re-running |
| Pairs | **53/53 written, 0 pending** — now asserted |
| Rehearsal echo | **3/5** contrastive — asserted ≤ 4, reported every run |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0, no warnings |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| Build integrity | bundle grepped for `Register markers`, `got let go`, `negative-inversion`, `let it go past`, `must-in-written-notice` — all present |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |
| Payload | 205,174 B over 752 ids — **19.6 %** of the 1,048,576 B cap (was 203,699 / 747) |

**Build integrity (the 03-08 hazard).** No mutation sweep artefact could survive: every mutation
was restored and diffed byte-for-byte, `git status` showed the tree clean of tracked source changes,
and `.next` was wiped before the final build. The rebuilt bundle was then grepped for this plan's
own content rather than assumed.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] The plan's stated fix for ledger 34 would have cost 212 KB of client JS**

- **Found during:** Task 2, by measuring before shipping.
- **Issue:** `import getScenarioCoverage` into `WorldView` pulls all six content banks into the
  `/world/[slug]` client bundle: +217,154 B, +52.1 %, 6 → 9 chunks.
- **Fix:** derived in the server component and passed as a required prop. +50 B. Same pills.
- **Commit:** `47454ef`

**2. [Rule 1 — Bug] My own assertion could not fail, and my own mutation never applied**

- **Found during:** the option-C mutation sweep, by N4 surviving.
- **Fix:** answers pinned per slug; mutation anchors built from the file's own terminator. Both
  re-proved. The bank header's "three of the five have a casual answer" was corrected to
  two-and-two, and **option C's commit message was amended** (nothing had been pushed) rather than
  left carrying a false claim about its own content.
- **Commit:** `0f0d13d`

**3. [Rule 1 — Bug] The teaching points the plan named for option C were already live**

- **Found during:** reading `native/register`'s existing content before drafting.
- **Fix:** all four abandoned; five untaught register-carrying points written instead, and the
  rejection recorded **in the bank header** so the next author does not re-propose them.
- **Commit:** `b4c0e6b`

**4. [Rule 3 — Blocking] `roadmap.update-plan-progress` and the `state.*` verbs left five fields wrong**

WINDOWS 45/60, **sixteenth consecutive plan** — detail below.

### Things I did not change

- **`CONT-04`. Not ticked.** `REQUIREMENTS.md` is untouched, verified by diff. 04-09 owns it.
- **The three rehearsals that keep contrastive repetition**, each declined by name and with its
  reason, in the bank header.
- **`native/pronunciation`'s no-new-declaration verdict**, derived at 04-07 and not re-derived.
- **The 03-11 gate's ratification of the design echo.** Option E is not a reversal of it.
- **Option D's writing-container change**, and the eight harness blocks it would reshape.
- **04-05's broken `corpus.mts`**, left in the scratchpad rather than deleted — but named here and
  distinguished from `corpus2.mts`, because the failure mode is silent.

## Tooling defect — WINDOWS 45/60, sixteenth consecutive occurrence

All four known bugs fired, plus the unquoted-scalar one 04-07 recorded, plus a **new one**:

| Field | What happened | Corrected to |
|---|---|---|
| `total_phases` | reset 6 → **5** against a ROADMAP defining six | 6 |
| `Progress:` | informative parenthetical destroyed for a bare `96%` | `44 of 45 plans (4 of 6 phases complete; Phase 4 has 9 plans written and 8 executed)` |
| `**Current focus:**` | never advanced — still read "7 of 9 plans" | 8 of 9 |
| `stopped_at` | written **unquoted** where every other value is quoted | re-quoted |
| decision rows | all five of mine stamped `[Phase ?]` | `[Phase 04]` |
| **`roadmap.update-plan-progress` (NEW)** | reported `complete: false` and **wrote nothing at all** — both `**Plans**: 7/9` and the phase table row left stale | both advanced to 8/9 by hand |

All corrections made **after the last `state.*` verb ran**, per entry 60's ordering rule. The **113
pre-existing `[Phase ?]` rows were counted before and after and are untouched**; only my five moved.
`last_activity_desc` was written on one physical line and last, and verified to parse as a JSON
string.

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on every surface remains derived
from bank contents — the world page more so than before it.

## Self-Check: PASSED

All seven modified files present on disk. All three commits (`47454ef`, `b4c0e6b`, `0f0d13d`)
present in `git log`. `REQUIREMENTS.md` confirmed unmodified.
