---
phase: 03-every-scenario-practicable
plan: 04
subsystem: scenario-content
tags: [content, srs, cont-02, authoring, duplicate-scan, requirement-closure]
status: complete
requires:
  - src/lib/review-items.ts (scenarioItemId, scenarioRecallItems — plan 03-01)
  - src/lib/scenario-coverage.ts (derived coverage, COVERAGE_TOTALS — plan 03-01)
  - scripts/verify-scenario-content.mts (the phase's content gate — plan 03-01)
  - src/lib/content/phrases.ts (Phrase.id, getScenarioPhrases — plans 03-01 … 03-03)
  - src/lib/content/scenario-vocabulary.ts (the bank shape — plans 03-01 … 03-03)
provides:
  - "src/lib/content/phrases.ts — 8 new curated sets (35/35 scenarios, CONT-02's phrase half closed)"
  - "src/lib/content/scenario-vocabulary.ts — 10 new decks (35/35 scenarios, CONT-02's vocabulary half closed)"
affects:
  - .planning/REQUIREMENTS.md (CONT-02 ticked — the first plan permitted to)
  - .planning/STATE.md (03-01's honest-panel regression note REMOVED on its named evidence)
  - .planning/WINDOWS.md (entry 32 — the ten new pages unobserved in a browser)
tech-stack:
  added: []
  patterns:
    - "assert the closure predicate BEFORE ticking the requirement, never after"
    - "a mutation driver that COUNTS declared vs executed, so a silently skipped mutation invalidates the sweep instead of passing it"
    - "contrasting pairs as a phrase-set shape where the teaching point is a dial rather than a line"
key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - .planning/REQUIREMENTS.md
    - .planning/STATE.md
    - .planning/WINDOWS.md
decisions:
  - "CONT-02 ticked only after asserting COVERAGE_TOTALS.scenariosWithPhrases === 35 AND scenariosWithVocabulary === 35 — the assertion runs before the tick"
  - "Sounding Native authored at its declared CEFR levels to CONT-02's floors only; CONT-04's native-level depth stays with Phase 4"
  - "native/register's phrases are three CONTRASTING PAIRS rather than a flat list — a register is a dial and one line cannot show a dial moving"
  - "native/pronunciation's tongue-twister shape was deliberately not spread; its deck is the metalanguage of pronunciation instead"
  - "verb-skeleton overlap between the phrasal-verbs deck and the rest of the corpus is structural, not authoring fatigue"
  - "academic/summaries got the language of REDUCING a case and academic/debate the language of MAKING one, per 03-03's handover"
metrics:
  duration: ~70min
  tasks: 2
  commits: 2
  completed: 2026-08-01
---

# Phase 3 Plan 04: Reading & Ideas and Sounding Native Summary

The last ten scenarios reached D-04's floors, so **all thirty-five scenarios now carry their own
phrases and their own vocabulary and every one of them feeds the spaced-repetition queue — CONT-02
is closed, and closed by derivation rather than by claim.** No scenario is served the per-world
generic set any more, which retires the regression this phase deliberately introduced at 03-01.

## What shipped

| Task | Commit | What |
|---|---|---|
| 1 | `aac86c2` | Reading & Ideas: 5 phrase sets + 5 vocabulary decks, none of which existed |
| 2 | `26f8faf` | Sounding Native: 3 phrase sets + 5 vocabulary decks; **CONT-02 closes** |

**Registry state on completion: 35/35 scenarios with phrases · 35/35 with vocabulary · 0/52 pairs
written (52 pending: speaking 30, writing 9, reading 9, grammar 4).** No scenario reports itself
complete, and the app still claims nothing it does not have.

**128 new items** — 48 phrases and 80 cards. Every id is an authored slug, unique within its
scenario and never derived from position; `scenarioItemId()` remains the only author of a composite
id and nothing here composes one by hand. No field was added to the stored `{box, due}` value: the
metadata stays in the id, as `srsItemSchema`'s closed two-field object requires.

---

## 1. CONT-02 is closed, and the order of operations is the point

Plans 03-02 and 03-03 both carried `requirements: [CONT-02]` in frontmatter, both saw the tool tick
"**Every** scenario has phrases and vocabulary" at 17/35 and 27/35, and both reverted it. This plan
is the one where it may stand — so the predicate was **asserted first and ticked second**:

```
CONT-02 closed {"pairsTotal":52,"pairsWritten":0,
                "scenariosWithPhrases":35,"scenariosWithVocabulary":35}
```

Both numbers are read off the banks by `scenario-coverage.ts`, which counts
`getScenarioPhrases`/`getScenarioVocabulary` — the **strict** accessors — and never the lenient
`getPhrases`. A registry built on the lenient one would have reported 35/35 on the day nine
scenarios were written. That is the whole mechanism, and it is why the tick is trustworthy.

**`.planning/STATE.md`'s honest-panel regression note has been removed**, not re-tallied. It had been
carried since the tracer with a running count of 26 → 18 → 8, and its named removal evidence was
exactly `COVERAGE_TOTALS.scenariosWithPhrases === 35`. That now reads true, so the entry is gone
from Blockers/Concerns. One residual was carried forward rather than lost with it: `getPhrases` and
`WORLD_FALLBACK` still exist in `phrases.ts` and are now **dead for scenario pages**; plan 03-11
deletes them, and the module's own header still says so.

**CONT-01 is untouched and remains 0/52.** `REQUIREMENTS.md` was edited for CONT-02 only.

---

## 2. The content, and what each set was written to do

### Reading & Ideas — four scenarios that declare reading and not speaking

That shapes what a phrase set can honestly be here. CONT-02 asks for phrases in every scenario, but
a reading scenario's useful phrases are not comprehension questions — those are the reading pair,
owned by plans 03-07 and 03-08. They are the language of **working with a text out loud**.

| Scenario | Level | What the six phrases actually are |
|---|---|---|
| `academic/news` | B2 | Not "what does it say" but "how is it saying it" — sourcing, hedged attribution, a loaded word, a buried lede |
| `academic/articles` | C1 | Tracking an argument **across** paragraphs: hedging an inference, hearing a connector turn, admitting a lost thread |
| `academic/stories` | B2 | What the narrator is doing, and what a reader may say before finishing |
| `academic/summaries` | B2 | The language of **reducing** a text (the writing half is plan 03-06's) |
| `academic/debate` | C1 | The one that declares speaking: conceding, rebutting, building |

`academic/articles` is C1 and, as the plan warned, the level where an author most easily writes
vocabulary that is merely long rather than genuinely advanced. Its deck is therefore the words that
let a reader **follow a case**, not impressive nouns: `a premise`, `qualify (a claim)`, `a caveat`,
`underpin`, `a case in point`, `ostensibly`, `the upshot`, `gloss over`.

**`academic/summaries` and `academic/debate` overlap by construction**, and 03-03 asked for them to
be split the way `travel/emergencies` was. They are: summaries got the language of **reducing** a
case (`boils down to`, `in a nutshell`, cutting an example, cutting to half a page) and debate the
language of **making** one (`I take your point, but…`, `you're conflating…`, `by that logic…`).
Their decks split the same way — summaries is judged on `concise` / `long-winded` / `redundant` /
`verbatim`, debate on `a rebuttal` / `a straw man` / `anecdotal` / `a double standard`.

### Sounding Native — floors only, and the Phase 4 boundary held

**This is the scope line that mattered most in this plan.** The fuller native-level treatment of
this world — deeper idiom work, phrasal-verb families, pronunciation drills, register and culture at
native level — is **CONT-04**, and `03-CONTEXT.md` defers it explicitly to Phase 4. All five
scenarios were written at their **declared** CEFR level and to the **same floors as every other
scenario**, and nothing here reaches for that depth. A set that tried to be CONT-04 would both
overshoot this phase and leave Phase 4 nothing to add. The boundary is recorded in a comment at the
head of the Sounding Native block in both banks, so the next author meets it before writing.

Three scenarios needed phrases; all five needed decks.

- **`native/phrasal-verbs` (B2)** — written to **extend** its briefing, not restate it. The briefing
  already demonstrates separability on "turn it down" and the get up / get on / get over family, so
  neither appears; `call it off` carries the separability rule on fresh material instead. Its deck is
  eight verbs the phrases do not use, so the scenario teaches fourteen rather than six twice.
- **`native/register` (C1)** — the plan asked for **contrasting pairs rather than a flat list**, and
  that is what shipped: three situations (a request, an apology, a refusal), each said twice, casual
  then formal. Its deck is the **markers** a listener reads the dial from — `a contraction`, `slang`,
  `jargon`, `a hedge`, `blunt`, `stilted`, `pleasantries`, `overfamiliar` — rather than more example
  sentences, which the pairs already supply.
- **`native/culture` (C1)** — deliberately **not** a list of references, which date within a year,
  but what she says when one lands and she does not catch it, plus the words for how a reference
  *behaves* (`a catchphrase`, `a household name`, `an in-joke`, `niche`, `dated`, `go viral`).
- **`native/idioms`** already had its six phrases from plan 01, so its deck is **eight further
  idioms** rather than a second gloss on the same six.
- **`native/pronunciation`**'s existing set is tongue-twisters — a legitimate shape for that scenario
  and a poor model for the other four, and the plan said not to spread it. It was not. Its deck is
  the **metalanguage** instead: `word stress`, `a silent letter`, `a homophone`, `enunciate`,
  `mumble`, `intonation`, `a tongue-twister`, `rhyme with` — the words she needs to say what her
  mouth is doing wrong and to understand being told how to fix it.

---

## 3. The duplicate scans, over the full 35-scenario corpus

03-03 added a Jaccard similarity pass precisely because exact-match cannot see a paraphrase, and it
earned its keep there by catching a fourth near-duplicate *after* that plan's first commit. It was
re-run here over **all 35 scenarios including these ten**, and — learning that lesson — **before**
the Task 2 commit rather than after.

**Scan 1 — exact repeats,** case-, accent- and punctuation-insensitive:

| Corpus | Total | Distinct | **Repeated** |
|---|---|---|---|
| Phrase texts | 210 | 210 | **0** |
| Vocabulary terms | 280 | 280 | **0** |
| Spanish glosses | 210 | 210 | **0** |
| Card examples | 280 | 280 | **0** |

210 = 35 × 6 and 280 = 35 × 8 exactly. Also **0** cross-namespace collisions — no phrase text is
also a card example anywhere in the corpus.

**Scan 2 — Jaccard similarity over content words**, every cross-scenario pair:
**21,420 phrase pairs and 38,080 term pairs** (up from 03-03's 13,041 and 19,900 at 27 and 25
scenarios; the counts are exactly `C(210,2) − 35·C(6,2)` and `C(280,2) − 35·C(8,2)`).

> **A caveat on comparing these figures to 03-03's.** This is a re-implementation from the method
> described in that summary, not the identical script, and its stop-word list is more aggressive. It
> is therefore *stricter on shared frames and looser on shared function words* — it does **not**
> reproduce 03-03's two accepted `I'd like … please` pairs above 0.4, because it strips `like` and
> `please` as stop words. The pair counts are directly comparable; the thresholds are not.

**Phrase texts above 0.4: one.** `social/small-talk` "How was your weekend?" vs
`social/making-friends` "What are you up to this weekend?" — **pre-existing** (plan 03-01/03-02
content, not this plan's), and an artefact of the aggressive stop-listing reducing both to
`{weekend}`. Past versus future, two different scenarios. Not a defect.

**Vocabulary terms above 0.5: three**, all the shared-verb-skeleton pattern 03-03 documented and
accepted (`ask someone out` / `call someone out` / `log someone out`):

| J | Pair | Verdict |
|---|---|---|
| 1.00 | `catch up` (small-talk) vs **`catch on`** (phrasal-verbs) | *ponerse al día* vs *ponerse de moda* — different meanings |
| 1.00 | `run into` (small-talk) vs `run over` (meetings) | **pre-existing**, neither is this plan's |
| 0.67 | `talk over someone` (meetings) vs **`talk someone into something`** (phrasal-verbs) | *interrumpir* vs *convencer* |

Two of the three involve a new card, and both are in `native/phrasal-verbs`. That is worth naming
rather than waving through: **in the phrasal-verbs scenario specifically, verb-skeleton overlap with
the rest of a 280-term corpus is structurally guaranteed, not a sign of authoring fatigue.** Every
phrasal verb shares a verb with some other phrasal verb somewhere. And the scenario's own briefing
makes the collision pedagogically useful — "Same verb, many meanings" is its third tip. Both were
kept deliberately.

**A sweep at lowered thresholds** (0.25 phrases / 0.34 terms) was also run to check that the
stop-word list was not hiding real near-misses in the two new worlds. It surfaced 20 phrase pairs
and 14 term pairs, and **all but the following were pre-existing content or incidental single-word
overlap** (`double down` vs `a double room`; `is that from something` vs `I can't make it on
Friday`). One was worth acting on, and was:

**One near-duplicate was rewritten before the Task 2 commit.** `native/phrasal-verbs`'s
`put-up-with` was drafted as "I don't know how you put up with that noise." — the same
"I don't know…" opener as `social/dating`'s "I don't know if you'd be up for it…" (J = 0.29, below
the working threshold, but a shared opening frame in a corpus that has one already). It became
**"Honestly, how do you put up with that noise?"**, which keeps the sympathetic-exclamation function
and is arguably the more natural spoken B2 line. Card examples flagged **nothing** at either
threshold.

Several collisions were avoided at selection time rather than after: `a digression` was dropped from
`academic/articles` because `work/presentations` already teaches `go off on a tangent` (replaced by
`ostensibly`); `backpedal` was dropped from `academic/debate` because its gloss collided with
`native/phrasal-verbs`' `back out of` (replaced by `double down`); `a spoiler` was dropped from
`native/culture` because `academic/stories` teaches `give away the ending`; `pull someone's leg` was
dropped from `native/idioms` because `social/humor` already teaches *tomar el pelo*; and
`in a nutshell` was kept out of the idioms deck because `academic/summaries` uses it as a phrase.

---

## Deviations from Plan

**None affecting content or contract.** Two tool defects were found and corrected, both recurrences
of failures previous plans in this phase already recorded.

**1. [Rule 1 — bug] `requirements mark-complete CONT-02` half-applied its own write set.**
- **Found during:** the requirements step, by reading the command's output rather than trusting it.
- **Issue:** the tool reported `"write_set_complete": false` — it ticked the checkbox
  (`surface: "checkbox", applied: true`) but **did not update the traceability table**
  (`surface: "traceability", applied: false`), which still read
  `CONT-02 | Phase 3 | In Progress (27/35 phrases, 25/35 vocabulary)`. It also left the requirement's
  inline note describing CONT-02 as in progress at 27/35 and stating it "Completes at plan 03-04",
  so a ticked box sat directly beside prose saying it was not done.
- **Fix:** traceability row and inline note both corrected by hand. The requirement now reads as
  closed on all three surfaces.
- **Files modified:** `.planning/REQUIREMENTS.md`

**2. [Rule 1 — bug] `state.advance-plan` again wrote an overclaiming plan counter, and three more.**
- **Found during:** the state-update step. 03-03 reported the same class of defect; it recurred.
- **Issue:** four separate wrong values. (a) The plan counter advanced to **5** and rewrote the line
  to `Plan: 5 of 11 complete` — four plans are complete, not five; the command writes the *next*
  plan's number into a line labelled "complete". (b) `**Current focus:**` was still stuck on
  `plan 03 of 11 complete`. (c) `last_activity_desc` was **truncated mid-sentence** at
  `"…authored (128 new"`. (d) `update-progress` moved the bar to 78% and the frontmatter to
  `completed_plans: 28`, but left the parenthetical on the same line reading `27 of 36 plans` — the
  line contradicted itself.
- **Fix:** all four corrected by hand.
- **Files modified:** `.planning/STATE.md`
- **Note:** this is the third consecutive plan in this phase to hand-correct this command. Worth
  raising as a tooling defect rather than continuing to absorb it per plan.

---

## Verification Results

Every `<verify>` block in the plan was run. All passed.

**Task 1**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **5344** passed · 32/35 phrases · 30/35 vocabulary |
| `npx tsc --noEmit && npm run lint` | exit 0 |
| Academic floor check (5 scenarios, `phrases<6 \|\| vocabulary<8`) | `academic: 5 scenarios at floor` |

The task's `<done>` predicts exactly 32/35 and 30/35, and gets it.

**Task 2**

| Command | Result |
|---|---|
| `verify-scenario-content.mts` | **6019** passed · 35/35 · 35/35 · 0/52 |
| `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| **CONT-02 closure assertion** | `{"pairsTotal":52,"pairsWritten":0,"scenariosWithPhrases":35,"scenariosWithVocabulary":35}` |
| `verify-merge && verify-schema && verify-queue` | 25647 · 309 · 173 |

**Baselines — every one held**

| Harness | Baseline | Now |
|---|---|---|
| `verify-scenario-content` | 4529 | **6019** (this plan's content) |
| `verify-merge` | 25647 | 25647 |
| `verify-schema` | 309 | 309 |
| `verify-celpip-content` | 648 | 648 |
| `verify-celpip-speech` | 50 | 50 |
| `verify-queue` | 173 | 173 |
| `verify-headers` | 24 | 24 |
| `verify-celpip-sections` | 43 | 43 |
| dependencies | 11 + 11 | **11 + 11** |

`tsc`, `lint` and `build` all exit 0. **No server was started, so none was left running.**

The harness's derived unwritten-scenario assertion loop now iterates **zero** times, exactly as
03-01 designed and documented — at 35/35 there is no scenario with neither bank entry. Nothing is
lost: `recall: <key> yields its phrases then its vocabulary` still asserts
`items.length === phrases.length + cards.length` for all 35 scenarios permanently.

---

## Mutation testing — because a first green is not evidence

18 declared, run against `verify-scenario-content.mts`, every one targeting **this plan's** content.
The tree was proved clean before and after each mutation and a **non-empty `git diff` landing
proof** was required before any verdict was trusted.

03-03's three hardenings were carried over, and its recorded failure was fixed at the root:

1. **Anchors are extracted from the real file by unique substring at apply time**, never hand-typed;
   zero matches or many matches **abort** rather than guess. Anchors containing a line terminator are
   refused outright, so the CRLF trap that made 03-02's M9 unreproducible cannot occur — both files
   are pure CRLF (550 and 1,895 line terminators, **zero** bare LF).
2. **A "caught" verdict requires the expected assertion label** in the output, not merely exit 1.
3. **Controls are always included.**
4. **03-03's silently-skipped mutation is structurally impossible here.** That sweep reported "16 as
   expected" while listing 16 of 17, because bash's `read` drops a final line with no trailing
   newline. Rather than patch the loop condition, this driver **counts declared versus executed and
   exits non-zero if they differ** — it reported `declared 18 · EXECUTED 18`. A skipped mutation now
   invalidates the sweep instead of passing it.

| | Caught / refused (expected) | Survived (expected) |
|---|---|---|
| Floors | **M1** `academic/debate` down to five phrases · **M6** `native/pronunciation` down to seven cards | **C3** a *seventh* phrase · **C4** a *ninth* card |
| Ids | **M2** duplicate slug in `native/culture` · **M5** index-derived id (`"3"`) on a `native/register` phrase · **M9** duplicate card slug in `academic/articles` | — |
| Required fields | **M4** whitespace example on an `academic/news` card · **M7** blank Spanish gloss on `academic/summaries` · **M8** an optional tip present but empty | **C1** reworded gloss · **C2** reworded example |
| Keys & D-01 | **M3** typo'd bank key (`academic/artcles`) · **M10** `native/culture` handed `native/idioms`' deck · **M11** `academic/stories` handed `academic/news`' set | **C5** comment-only change |
| The applier | **SELF-MISSING** an anchor matching nothing **aborted** · **SELF-AMBIG** an anchor matching 280 lines **aborted** | — |

**11 mutations caught (each with its expected label), 5 controls survived, 2 applier refusals
confirmed, 0 spurious, 0 unexpected.**

M10 and M11 are the D-01 pair, and they had to be built differently from 03-03's. That plan landed a
displaced array on a **real but unwritten** curriculum key, so the byte-identity assertion was the
only thing that could fire. At 35/35 **there are no unwritten keys left**, so that technique is no
longer available — a data-level D-01 mutation would necessarily also create a bad key and trip the
wrong assertion. Both were therefore made at the **accessor**, returning another scenario's bank for
one key, which is precisely "two scenarios handed the same material" and fires exactly
`vocabulary: native/culture is written for itself` and `phrases: academic/stories is written for
itself`. Worth recording for plans 03-05 onward: **the unwritten-key mutation technique retires with
CONT-02.**

Afterwards the harness reproduced **6019** and `verify-merge` **25647** against the restored tree.

---

## Known Stubs

**None introduced by this plan.** The four exercise branches of `ScenarioPractice`'s switch still
render the honest "Not yet available" panel; that remains plan 03-01's documented, load-bearing
state, owned by plans 03-05 through 03-10. `pendingPairs()` still returns all 52, which is true.

The one thing that *changed* character: the honest **warm-up** panel (a different panel, on the
speaking step) is now **unreachable**, because every scenario has a curated phrase set. Its code
path and the `getPhrases`/`WORLD_FALLBACK` fallback that motivated it are now dead for scenario
pages and are deleted by plan 03-11.

## Threat Flags

None. No new network surface, no new auth path, no schema change, no dependency, no file-access
pattern — this plan adds strings to two content modules. The register's dispositions were honoured:

- **T-03-05** (id collision across ~490 scenario keys) — the harness re-proves global uniqueness and
  disjointness from `GRAMMAR_QUESTIONS` and `VOCAB_DECKS` on every run; the composite key space grew
  from 362 to **490** ids and the assertions held.
- **T-03-06** (an id derived from position re-pointing a schedule) — all 128 new items carry an
  authored slug, asserted unique within its scenario and non-numeric; mutation M5 proves the
  assertion has teeth.
- **T-03-09** (two scenarios ending up with the same set) — the byte-identity assertion is proved by
  M10 and M11, and the two similarity scans cover what it cannot.
- **T-03-10** (authoring past the boundary into CONT-04's Phase 4 scope) — disposition `accept`,
  bounded by the curriculum's declared levels. Held: see §2.
- **T-03-02** (progress blob growth against the 1 MiB cap) — additive keys only.
- **T-03-SC** (package installs) — zero packages installed; dependencies unchanged at **11 + 11**.

## What has NOT been seen by a human

The ten new scenario pages have not been opened in a browser. The render path is observed (03-01
watched a curated scenario render its "Lock it in" step through these same accessors, and the user
drove `/review` on 2026-08-01) and the content is gated by 6019 committed assertions and an
18-mutation sweep, so this is an editorial gap rather than a structural one. Two things in this
batch deserve a deliberate glance: **`native/register`'s contrasting pairs are only legible if the
casual and formal lines sit adjacent in the rendered order**, and the C1 `articles` and `debate`
lines are the longest in the corpus. Recorded as `.planning/WINDOWS.md` id **32**, owed to plan
03-11's browser pass, which is already visiting these surfaces for entries 29, 30 and 31.

## For plan 03-05

- **CONT-02 is closed; CONT-01 is not, and is entirely ahead of you** — 0 of 52 pairs written.
  `pendingPairs().filter(p => p.skill === "grammar").length === 0` is your closing assertion, and it
  is true regardless of which sibling plan merges first.
- Wire your bank by adding **one entry to `EXERCISE_SOURCES`** in `scenario-coverage.ts`
  (`grammar: (w, s) => { const q = getScenarioGrammar(w, s); return q && { items: q, unit: "question" }; }`)
  and nothing else in that file, `ScenarioView.tsx` or the route. The count is decided before
  availability, so an empty bank still reports its pair unwritten.
- **The unwritten-key mutation technique is gone** (see the mutation section) — a D-01 mutation now
  has to be made at the accessor.
- `verify-scenario-content.mts` remains a low-conflict append target: one import line, one group at
  the bottom.

## Self-Check: PASSED

Both modified source files exist on disk; both commits (`aac86c2`, `26f8faf`) are in `git log`;
neither commit deleted a tracked file; the working tree is clean apart from the intended planning
documents and the pre-existing untracked `.claude/`.
