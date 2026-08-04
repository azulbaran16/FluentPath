---
phase: 04-native-level-depth
plan: 04
subsystem: scenario-content
tags: [content, idioms, srs, retirement, briefing, harness, gate, one-way-door]
status: complete

requires:
  - "04-01's id-stability gate + fixture — the eight retirements are declared in it and the 24 additions regenerated into it in the same commit"
  - "04-01's session-length invariant — native/idioms' minutes raised under it, not around it"
  - "04-03's eighteen phrases — the deck is authored to be disjoint from them, and the briefing from both"
  - "04-03's WITHHELD_BY_THE_PASSAGE gate — it covers the vocabulary bank, so the 24 new cards were written under it"
provides:
  - "FALLBACK_LESSON, exported from scenario-lessons.ts — the generic briefing is now ASSERTED unreachable instead of trusted unreachable"
  - "the briefing/bank separation gate for native/idioms: no briefing surface may quote the scenario's own phrases or cards"
  - "the second APPROVED multi-id retirement in the project, and the first where retiring DELETED material from the product"
affects:
  - "04-05 … 04-09: native/idioms is finished; the remaining three native scenarios still sit at Phase 3 floors"
  - "any later plan touching native/idioms — fourteen ids are now permanently unusable (6 phrases + 8 cards)"
  - "whoever next touches scenario-lessons.ts — the delete-or-gate question is filed, not settled"

tech-stack:
  added: []
  patterns:
    - "a deck shape with NO tip field forces the register mark into the only two levers it has: the sense named in the term's parenthesis, and an example that could not be reworded to carry the other sense"
    - "asserting a fallback UNREACHABLE by reference identity (proves the accessor did not fall through) AND by value (catches a briefing written by pasting the generic one) — the two catch different defects"
    - "a Jaccard threshold reported honestly against a SECOND view restricted to fields of >=6 words, so short-field artefacts are separated from real duplication instead of being argued away"
    - "rebuilding a fixture deterministically from HEAD when content changes mid-plan, rather than hand-editing it — because --update deliberately refuses to overwrite a recorded hash"

key-files:
  created: []
  modified:
    - src/lib/content/scenario-vocabulary.ts
    - src/lib/content/scenario-lessons.ts
    - src/lib/content/scenario-reading.ts
    - src/lib/curriculum.ts
    - scripts/verify-scenario-content.mts
    - scripts/fixtures/scheduled-item-ids.json
    - .planning/phases/04-native-level-depth/deferred-items.md
    - .planning/WINDOWS.md

decisions:
  - "All eight cards were retired, approved as `stands`. The presentation carried a fact 04-03 could not have known and that did NOT carry over from the phrase decision: five of fourteen phrases survived in the global decks, but only TWO of eight cards do. Six of these expressions existed nowhere else in the corpus, so retiring them deleted them from the product. That was stated in as many words before the answer was given, and it is recorded here as the reasoning rather than only the verdict."
  - "The 24 replacements are authored on a rule that makes them COMPLEMENTARY to the warm-up rather than more of it: the phrases are whole turns, these are the chunks you drop inside a sentence you build yourself. That is why 42 items in one scenario do not read as one list twice."
  - "The briefing does NOT reuse two of the eighteen live phrases, which is what 04-03's deferred note recommended. Doing so would have swapped one three-surface repeat for another; the plan requires the briefing to demonstrate on material NO other surface uses, so it demonstrates on `a lot on my plate`."
  - "FALLBACK_LESSON was asserted dead, not deleted. Deleting it changes the accessor's return type and every call site — churn this plan does not own, for a property the assertion already buys. Filed as an open question because 03-11 took the opposite route for phrases.ts, so the two precedents genuinely disagree."
  - "Two pairs above the plan's own J>=0.60 defect threshold were NOT fixed. Both are short-field artefacts (three- and four-word denominators, zero shared teaching). Recorded in WINDOWS so the judgement can be second-guessed, and reported beside a second view restricted to >=6-word fields where the highest is 0.308 — rather than by moving the threshold."

metrics:
  duration: "~75 min"
  completed: 2026-08-04
  tasks: 3
  commits: 2
  harness_assertions: 13477
  harness_baseline: 13103
---

# Phase 4 Plan 04: The Deck Behind the Warm-Up, and the Briefing Above It Summary

`native/idioms` stopped making the same point on three surfaces at once — the eight canonical
core-idiom cards were retired by an explicit human decision and twenty-four chunk-level expressions
took their place, and the briefing that had been worked-examping two now-retired phrases as
`expression = gloss` was rewritten onto material no other surface of the scenario uses. Both
separations are now gated, and the generic briefing underneath the whole module is asserted
unreachable rather than believed unreachable.

## What shipped

| | Before | After |
|---|---|---|
| `native/idioms` cards | 8 (all canonical core idioms) | **24, re-selected** |
| `native/idioms` phrases | 18 (04-03) | 18, unchanged |
| Briefing worked examples | 2 retired phrases, as `expression = gloss` | **1 expression used on no other surface, as a use note** |
| Advertised `minutes` | 13 | **17** |
| `verify-scenario-content` assertions | 13,103 | **13,477** |
| Scheduled ids under a committed hash | 560 (+7 retired) | **576 (+15 retired)** |
| `verify-id-stability` assertions | 1,727 | **1,791** |
| Scenarios asserted to have their own briefing | 0 (comment only) | **35/35** |

## Task 1 — the card decision, and the fact that did not carry over

The checkpoint was presented with all eight cards and stopped. The user answered:

> **`stands`**

**The headline of the presentation was an asymmetry, and it is the reason this is recorded as
reasoning rather than as a verdict.** The user had already answered the equivalent question for the
six phrases at 04-03, and one of the three facts that made that decision acceptable was that *the
material survives in the app's global vocabulary decks* — five of the fourteen items did. Checked
against the corpus for the cards, that fact is **two of eight**:

| Card | Survives elsewhere? |
|---|---|
| `bite-the-bullet` | **Yes** — global deck `idioms`, `vocabulary.ts:92` |
| `blessing-in-disguise` | **Yes** — global deck `idioms2`, `vocabulary.ts:206` |
| `once-in-a-blue-moon` · `beat-around-the-bush` · `last-straw` · `arm-and-a-leg` · `cat-out-of-the-bag` · `on-the-ball` | **No.** Nowhere in `src/lib/content/`, any field |

So retiring these six **deleted six expressions from the product**, not merely from this scenario.
That was said plainly, and said as *not carrying over*, before the answer was given.

The user's reasoning, recorded as reasoning: these are textbook idioms the app teaches badly, and
keeping them badly helps nobody sound native. The **frozen-record** point made "keep" worse than it
sounds — `ScenarioVocabCard` has no `tip` field and the fixture hash covers every field, so a kept
card could never have been improved. It would have stayed exactly as weak as it was, permanently.
That is a genuine asymmetry between keeping and retiring, and it is not obvious until stated.

### The eight ids deleted, with their reasons

Each is in `scripts/fixtures/scheduled-item-ids.json` under `retired`, written by hand **before**
`--update` ran. None may ever return.

| Id | Reason (abridged; full text in the fixture) |
|---|---|
| `native/idioms#vocab#once-in-a-blue-moon` | Opaque core idiom, invariable — 04-RESEARCH §1.5's own fixedness example, and the card taught nothing about form. Replaced in function by `now-and-again`; **that swap is the re-selection in one line.** Gone from the app. |
| `native/idioms#vocab#beat-around-the-bush` | The other fixedness example (*beat round the bushes*), with nowhere to put the note. Gone from the app. |
| `native/idioms#vocab#bite-the-bullet` | Core-idiom class **and duplicated** in global `idioms`. Removes a doubling, not the expression. |
| `native/idioms#vocab#last-straw` | Opaque set piece, no register mark. Named in `scenario-reading.ts`'s own header as one of the fourteen the banks "already teach" — a claim this retirement made false, corrected in the same commit. Gone from the app. |
| `native/idioms#vocab#arm-and-a-leg` | Hyperbolic core idiom. Its C1 failure is mis-placement — **the exact failure this scenario now teaches against** — and the card modelled the failure rather than the fix. Gone from the app. |
| `native/idioms#vocab#cat-out-of-the-bag` | The purest case: nothing about the parts contributes, so it fails criteria 1 and 2 together. Gone from the app. |
| `native/idioms#vocab#on-the-ball` | The one with a genuine register restriction (informal, said *about* a third party) — and the card recorded none of it, because the shape has no tip field. Gone from the app. |
| `native/idioms#vocab#blessing-in-disguise` | Core-idiom class **and duplicated** in global `idioms2`. |

## Task 2 — the twenty-four, and the rule that makes them not-more-of-the-same

The criterion changed, and one thing about it is specific to the card shape and worth stating,
because it is the constraint the coordinator flagged before authoring began:

> **`ScenarioVocabCard` is `{id, term, es, example}`. It has NOWHERE to put a register note** —
> unlike a phrase, which carries a `tip`. So the sense has to live in the only two places the shape
> offers, and both are used deliberately: a polysemous form **names its sense in the term's
> parenthesis** (`down the line (later, not now)`, `play it by ear (decide as you go)`,
> `let something slide (not enforce it)`), and every `example` is built so it **could not be
> reworded to carry the other sense**.

The organising rule, which is what stops eighteen phrases and twenty-four cards reading as one list
twice:

> **The phrases are whole turns. These are the chunks you drop inside a sentence you build yourself.**

`phrases.ts` holds eighteen complete things to say. A card here is a noun phrase or a verb phrase
that has to be *fitted* into a sentence of the learner's own — the harder and commoner production
problem. Four strands of six:

- **The state a thing is in (6)** — `up in the air` · `a grey area` · `put something on the back
  burner` · `a non-starter` · `in the pipeline` · `a foregone conclusion`.
- **Judging without committing (6)** — `hit and miss` · `a mixed bag` · `par for the course` ·
  `a long shot` · `take something with a pinch of salt` · `a bit of a stretch`.
- **What people do to each other, and what naming it costs (6)** — `move the goalposts` ·
  `have a quiet word` · `let something slide` · `keep someone in the loop` · `a heads-up` ·
  `hold something against someone`.
- **The unremarkable ones (6)** — `for the time being` · `now and again` · `down the line` ·
  `play it by ear` · `off the record` · `sooner rather than later`.

The last strand is deliberately the dullest in the deck, and that is the point: the C1 failure this
scenario teaches against is **mis-placement**, so a learner who reaches for `now and again` instead
of a colourful idiom has learned the thing. `now and again` replacing `once in a blue moon` — same
meaning, opposite frequency class — is the whole re-selection thesis in one swap.

**Grant & Bauer's distinction is doing real work here**, and it is the answer to the obvious
objection that this is just different canonical idioms: `play it by ear` and `move the goalposts`
are **figuratives** — the parts visibly contribute — which is the frequent *and* teachable class.
`let the cat out of the bag` is a **core idiom**, which is the class the deck was rescued from.

### The sitting

```
native/idioms:  18 × 20 s  +  42-card deck × 15 s  +  0 questions
                = 360 s + 630 s = 990 s
                minutes 17 → 1020 s advertised → 30 s slack
```

The deck is phrases **plus** vocabulary, so the warm-up is deliberately double-counted per 04-01's
documented conservatism. **17 was proved minimal, not asserted minimal**: the harness was run with
`minutes: 16` and failed (`advertised 960s, needs 990s`), via an in-memory byte snapshot with a
byte-identity check afterwards — `IDENTICAL`.

### Fixture diff

**24 added · 8 removed into `retired` · ZERO changed hashes.** Audited id-by-id against `HEAD`:
the removed set is exactly the eight approved ids, it is exactly equal to the newly-retired set,
all 15 retirements carry a reason, and no id is both live and retired.

Before regenerating, the gate was run deliberately and **failed with 32 assertions** — 24
unrecorded additions plus the eight ids that were momentarily both live and retired. That failure
is the gate working and is recorded rather than skipped past.

`--update` idempotence: re-running it afterwards left the fixture **byte-identical**.

### Corpus-wide near-duplicate scan

Exact + Jaccard over word sets, every field of the twenty-four against **3,310 authored corpus
fields** spanning all 35 scenarios' phrases/vocabulary/grammar/reading/speaking/writing/briefings
plus both global banks — with the scenario's own vocabulary bank excluded so nothing matched itself.
Stopwords **not** stripped, so every score is an upper bound. Thresholds as 04-02 set them: any
exact match is a defect; J ≥ 0.50 investigated, J ≥ 0.60 a defect.

**Zero exact duplicates.**

**The pre-authoring scan is the one that mattered, and it killed four candidates before they
existed** — bringing the phase total to eight across three plans:

| Candidate | Killed by |
|---|---|
| `run something by someone` | `native/phrasal-verbs#vocab` already has *"Let me run it by my manager…"* — the **same world**, authored two plans ago |
| `at short notice` | already a card in `social/favors` (`scenario-vocabulary.ts:326`) |
| `go over someone's head` | `social/humor#phrase#went-over-my-head` — same form, different sense |
| `on paper` | `academic/…#reading` glossary already glosses it in the same sense |

**Highest pair: J = 0.750** — `now-and-again.es` *"de vez en cuando"* against `global/vocab/daily.es`
*"en vez de"*. **Not a duplicate in any meaningful sense**: a four-word denominator, three shared
Spanish function words, and opposite meanings (*from time to time* vs *instead of*). Second is
**J = 0.667**, `a-non-starter.term` against `travel/restaurant#vocab#starter.term` *"a starter"* —
a three-word denominator, a morphological `non-` relation, and zero shared teaching.

**Both are above the threshold this plan declared, and neither was fixed.** That is a judgement, so
it is filed to `.planning/WINDOWS.md` to be second-guessed rather than buried here, and it is
reported beside the number that measures what the threshold was written for:

> **The same scan restricted to pairs where BOTH fields hold ≥ 6 words — where duplication actually
> matters — tops out at J = 0.308 over 66,495 pairs.**

The threshold was not moved. The alternative was distorting `de vez en cuando`, which is simply the
right gloss, into something worse in order to lower a number.

**Two items WERE changed by the scan**, both real echoes rather than artefacts:

- `hold-it-against-someone.example` was drafted as *"She turned the offer down, and nobody here
  holds it against her."* against `global/vocab/phrasal` *"She turned down the offer."* (J = 0.417)
  — the same frame, and a phrasal verb inside a scenario whose sibling is `native/phrasal-verbs`.
  **Fixed to "She decided not to come, …"**, which also removes an irrelevant second teaching point.
- `a-heads-up.es` was drafted as *"un aviso con antelación"* against
  `social/favors#vocab#short-notice.es` *"con poca antelación"* (J = 0.500). **Fixed to "un aviso
  previo"** — shorter and equally accurate.

After both, the **example-field highest fell from 0.417 to 0.308**. Within-set highest is
**J = 0.400** (`up-in-the-air.term` vs `in-the-pipeline.term`) — two function words in three-word
terms.

## Task 3 — the briefing, and two properties nothing checked

**A. The briefing.** It taught from `piece of cake` and `under the weather`, both retired, and
taught them as `expression = gloss` — the exact shape 04-03's tip gate forbids. The rewrite:

- keeps the intro's real advice (learn a few well rather than many badly) **restated so it is about
  depth per item rather than about count**, which is what makes it consistent with a bank of
  eighteen instead of in tension with it;
- demonstrates on **`a lot on my plate`** — used in no phrase, no card, no rehearsal, and not among
  the four expressions the passage withholds;
- says the thing the new selection makes teachable: *"Getting it wrong rarely leaves you
  misunderstood — it leaves you **misplaced**. People work out what you meant; what they notice is
  that you reached for a phrase the moment didn't call for."*

**04-03's recommendation was deliberately not taken.** Its deferred note suggested reusing two of
the eighteen live phrases (`at-the-end-of-the-day`, `timing-isnt-ideal`). That would have swapped
one three-surface repeat for another, which is the defect the plan exists to remove. Its *other*
observation held exactly: tips 1 and 2 were still true, and only their wording moved.

**B. The generic briefing, asserted unreachable (T-04-09).** `FALLBACK_LESSON` is now exported so
the harness can prove what a comment used to claim. Two checks, catching different things: the
**reference** check (`!== FALLBACK_LESSON`) proves the accessor did not fall through, which is the
actual property; the **value** check catches a briefing written by pasting the generic one, which
the reference check alone would pass. Plus a non-blank intro and ≥ 2 live tips, for all 35.

Deleting the record was **filed, not taken** — see the open question below.

**C. The three surfaces stay apart (T-04-10).** No `native/idioms` briefing surface may contain any
of its own phrase texts or card terms. The vocabulary term is the sharp end, because it is short
enough to sit inside prose unnoticed. A term that names its sense in a parenthesis is hunted on
**the part before the bracket** — `down the line`, not `down the line (later, not now)` — since the
bare form is what a tip would actually repeat, and matching the whole string would make the check
trivially passable.

**Both B and C were measured clean before either assertion was written: 0 offenders, 0 generic.**

### Mutation sweep — 9 declared, 9 executed, 6 caught, 1 negative confirmed, 2 controls green

Anchors are unique single-line substrings checked at mutation time; restore is an **in-memory byte
snapshot** written back verbatim, never `git checkout --`, because both files under test held
uncommitted work — 04-03's lesson, applied rather than restated. Exit codes captured directly from
`spawnSync`. A mutation counts as caught only if the harness fails **and** the expected label
appears.

| # | Mutation | Caught by |
|---|---|---|
| M1 | a briefing intro blanked | "briefing intro is not blank" |
| M2 | a briefing left with one live tip | "carries at least two non-blank tips" |
| M3 | a scenario with no briefing of its own — the trap the group exists for | "resolves to a briefing of its own" |
| M4 | a briefing tip quoting one of its own **cards** — the headline defect | "does not work its example from vocab#par-for-the-course" |
| M5 | a briefing tip quoting one of its own **phrases** | "does not work its example from phrase#wouldnt-go-that-far" |
| M6 | a tip quoting the **bare** form of a sense-naming term | "does not work its example from vocab#down-the-line" |
| M7 | **negative** — the reference check neutered, M3 re-applied | M3's failure **disappears**, proving the reference check is what caught it |
| C1 | inert comment edit in the content file | control — **green** |
| C2 | inert comment edit in the harness | control — **green** |

M6 is the one that earns its place: the stored term is `down the line (later, not now)`, so without
the parenthesis strip the mutation would not be caught at all. It proves the strip is load-bearing
rather than decorative.

**The first run reported 2 survivals and 2 anchor defects, and none of the four was a gate failure**
— all four were defects in *my mutations*, found by applying 04-01's rule (if a mutation survives,
check the mutation first) instead of writing the numbers down:

- **M1 "survived"** because its anchor was the *front* of the intro string, so the replacement
  truncated the sentence and left the rest. The intro stayed non-blank; the assertion was right not
  to fire.
- **M2 "survived"** because blanking **one** tip leaves two live ones, which is `>= 2`. The
  assertion was right not to fire. Fixed to blank two.
- **M4 was refused** (0 occurrences): the file uses a **straight** apostrophe inside a curly-quoted
  example and the anchor assumed a curly one. Refused and reported, not counted — which is what the
  anchor check is for.
- **C2 went RED**, i.e. the "inert" control was not inert: the replacement dropped the `/*`, which
  does not edit a block comment, it **ends** one. **The control caught my error, which is the entire
  reason for having controls.**

**Smoke-tested in both directions before any verdict was trusted:** the **SURVIVED branch** was run
live (a genuinely inert edit, with the runner asserting its anchor really applied — the first
attempt at this smoke test used an anchor that occurred 0 times, making the test vacuous, and the
runner now prints `SMOKE TEST VACUOUS` if that happens); and the **ANCHOR-DEFECT branch** was run
live (a deliberately non-unique anchor, 37 occurrences, refused with the file byte-identical).

**Post-sweep byte-identity: IDENTICAL for both files.** Post-sweep tree: exit 0, 13,477 assertions.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] Four near-duplicates killed before authoring, two more after**

Documented in full under the corpus scan above. Four candidates (`run something by someone`,
`at short notice`, `go over someone's head`, `on paper`) never reached a draft; two drafted items
(`hold-it-against-someone.example`, `a-heads-up.es`) were rewritten. Commit `0c4d821` — none of the
collisions ever reached a commit.

**2. [Rule 3 — Blocking] `--update` refuses to overwrite a changed hash, so the fixture had to be rebuilt rather than patched**

- **Found during:** Task 2, after the post-authoring scan changed two cards that had *already* been
  regenerated into the fixture.
- **Issue:** the gate correctly failed on two ids "still holding the content they were recorded
  with", and `--update` **refused to rewrite them** — *"There is deliberately no flag to force this
  through."* That refusal is rule 1 doing its job, and it does not know that these two ids are new
  in this commit and absent at `HEAD`.
- **Fix:** **not** hand-surgery on the fixture, which is how a gate erodes. The fixture was rebuilt
  deterministically: reset to the `HEAD` blob, re-run the (idempotent) retirement-reasons script,
  then a **single** `--update` with the content already final. Verified afterwards against `HEAD`:
  24 added, 8 removed into `retired`, **0 changed hashes**.
- **Lesson:** regenerate the fixture **once, after content is final** — never mid-authoring.
- **Commit:** `0c4d821`

**3. [Rule 2 — Missing critical] `scenario-reading.ts`'s header named bank contents that no longer exist**

- **File outside `files_modified`.** Flagged precisely at the checkpoint and brought into scope on
  the coordinator's explicit instruction that a stale claim about retired content is the class of
  defect this phase exists to stop.
- **Issue:** the header at `:753-756` asserted the banks "already TEACH fourteen expressions" and
  **named five** — *a piece of cake, under the weather, the last straw, bite the bullet, on the
  ball* — every one of which is now retired.
- **Fix:** comment-only, no behaviour. It no longer names bank contents at all, and it says why: a
  comment that names bank contents goes stale the moment the bank moves, so the property it claimed
  is pointed at the assertion that actually holds it.
- **Commit:** `0c4d821`

### Things I did not change

- **The two J ≥ 0.60 pairs.** Explained in full above, filed to WINDOWS, and reported beside the
  ≥ 6-word view (0.308) rather than by moving the threshold.
- **`FALLBACK_LESSON` itself.** Asserted dead, not deleted — the open question below.
- **`CONT-04`.** Not ticked. This is plan four of nine; 04-03 marked it complete at six of nine and
  had to be reverted.

## Open question for the phase gate

**Should `FALLBACK_LESSON` be deleted outright, and `getScenarioLesson` made to return
`ScenarioLesson | undefined` like every other bank accessor?**

This plan **asserted** the record unreachable rather than deleting it, because deletion changes the
accessor's return type and every call site — churn in files this plan does not own, to buy a
property the assertion already buys. But **03-11 took the opposite route** for `phrases.ts`, and
`AGENTS.md` now records *that* as the rule ("there is exactly ONE phrase accessor and it is
strict"). So the two precedents genuinely disagree, and this project now has one lenient bank
accessor among strict ones.

Filed to `deferred-items.md` and `.planning/WINDOWS.md`. **Whoever next touches
`scenario-lessons.ts` should settle it** rather than leave a third plan to find the same fork.

## Verification

Every `<verify>` block in both auto tasks was run. **All passed.** Exit codes captured directly.

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **13,477** assertions pass (baseline 13,103) |
| `verify-id-stability.mts` | **1,791** assertions pass; 576 ids, 15 retired |
| Fixture diff vs `HEAD` | 24 added · 8 removed into `retired` · **0 changed hashes** |
| Every retirement carries a reason | 15/15, checked programmatically |
| Removed set == newly-retired set | true |
| `--update` idempotence | fixture byte-identical after re-running |
| No retired slug survives under `src/` | all 8 absent |
| `minutes: 17` is minimal | proved — 16 fails the invariant (`needs 990s`) |
| Corpus scan | **0 exact duplicates**; ≥6-word view highest **J = 0.308** |
| Mutation sweep | 9 declared · 9 executed · 6 caught · negative confirmed · 2 controls green · byte-identity IDENTICAL |
| `npx tsc --noEmit` | exit 0 (both tasks) |
| `npm run lint` | exit 0, no warnings (both tasks) |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |

**Build integrity (the 03-08 hazard).** The build ran only after `git status` showed the tree clean
of every mutation, and `.next` was wiped first. The rebuilt bundle holds `par-for-the-course`,
`sooner-rather-than-later`, `hold-it-against-someone`, `misplaced` and `minutes:17`, and does **not**
hold `once-in-a-blue-moon`, `cat-out-of-the-bag`, `blessing-in-disguise` or the old briefing tip
`It's a piece of cake` (0 occurrences). `piece of cake` does still appear — in the **global** deck
`idioms`, which no plan touched and which is legitimately still in the app. Checked rather than
assumed.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | `native/idioms` holds 18 phrases and 24 cards, all on the same criteria | ✅ 42 items, four strands, all figurative/frequent class |
| 2 | Briefing, warm-up, deck and passage teach four disjoint sets | ✅ gated three ways (T-04-08 from 04-03, T-04-10 here) |
| 3 | Only human-approved ids retired, each auditable with a reason | ✅ 8/8, approved as `stands`, reasons written before `--update` |
| 4 | Every scenario asserted to have a briefing of its own | ✅ 35/35, by reference and by value |
| 5 | The scenario advertises a sitting it can keep | ✅ 17 min, proved minimal |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived from
bank contents.

## Self-Check: PASSED

All six modified source files present on disk; both commits (`0c4d821`, `96e18e0`) present in
`git log`.
