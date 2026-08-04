---
phase: 04-native-level-depth
plan: 02
subsystem: scenario-content
tags: [content, grammar, srs, harness, gate, topics]
status: complete

requires:
  - "04-01's id-stability gate + fixture — regenerated in the same commit as the ten new ids"
  - "04-01's session-length invariant — extended here rather than replaced"
  - "Phase 3's derived-coverage machinery (scenario-coverage.ts, EXERCISE_SOURCES)"
provides:
  - "RECORDED_TOPICS in scripts/verify-scenario-content.mts — the written-out topic set per grammar-declaring scenario, asserted exactly"
  - "the third session-length rate: SECONDS_PER_GRAMMAR_QUESTION = 30"
  - "native/phrasal-verbs finished — 18 phrases, 42-card deck, 15 questions, 24 honest minutes"
affects:
  - "every later plan that adds a grammar question: the topic set must be changed in the same commit, deliberately"
  - "every later plan that adds a grammar bank to a scenario: an unrecorded scenario now FAILS the gate"

tech-stack:
  added: []
  patterns:
    - "a written-out expected set in the harness as the detector for a near-variant identifier that nothing else can see"
    - "a deliberately LOSSY normalisation used to hunt strings that mean the same and are not the same"
    - "extending an existing invariant with a third named rate rather than writing a second invariant beside it"

key-files:
  created:
    - .planning/phases/04-native-level-depth/deferred-items.md
  modified:
    - src/lib/content/scenario-grammar.ts
    - scripts/fixtures/scheduled-item-ids.json
    - scripts/verify-scenario-content.mts
    - src/lib/curriculum.ts

decisions:
  - "Exactly ONE new permanent topic string was spent — \"Phrasal verb senses\". Fixedness went under the EXISTING \"Phrasal verb separability\", because the plan groups fixedness with separability and because the topic is about the FORM of a phrasal verb, which is what a frozen string is."
  - "The topic sets are WRITTEN OUT in the harness rather than shape-checked. A shape check cannot tell \"Phrasal verb particles\" from \"Phrasal Verb Particles\", and that is the entire failure."
  - "Global agreement is checked through a deliberately LOSSY normalisation: two topics that normalise together must be byte-identical; two that normalise apart are different teaching points and are left alone."
  - "social/small-talk measures at EXACTLY ZERO slack under the three-rate invariant and was NOT raised. Zero passes by design; raising it would contradict the rule the invariant itself states."
  - "The pre-existing exact duplicate between work/emails' grammar prompt and global b8 was logged to deferred-items.md, NOT fixed — it is a committed id in a scenario this plan does not touch, so correcting it costs a retirement."

metrics:
  duration: "~50 min"
  completed: 2026-08-04
  tasks: 2
  commits: 2
  harness_assertions: 12868
  harness_baseline: 12683
---

# Phase 4 Plan 02: The Phrasal-Verbs Quiz, and a Gate on the Strings Behind It Summary

`native/phrasal-verbs` now drills fifteen grammar questions instead of five — the particle, the
sense, the register collision and the frozen form — and the topic strings those questions are
filed under stopped being prose the next author has to have read about and became a set the gate
holds.

## What shipped

| | Before | After |
|---|---|---|
| `native/phrasal-verbs` grammar questions | 5 | **15** |
| Its derived coverage line | "5 questions" | **"15 questions"** (no second edit) |
| Distinct topic strings in that bank | 3 | **4** (one new, permanent) |
| Advertised `minutes` | 17 | **24** |
| Session-length rates gated | 2 | **3** |
| `verify-scenario-content` assertions | 12,683 | **12,868** |
| Scheduled ids under a committed hash | 538 | **548** (+ 1 retired) |
| `verify-id-stability` assertions | 1,639 | **1,679** |

**Task 1 — the ten questions (`7f6a90a`).** No new item type and no new shape (D-01): these are
`AuthoredGrammarQuestion`s that `GrammarQuiz` already renders and already reports to
`recordAttempt`.

- **The particle, not the verb (3).** `give in` (against *give up / give away / give off*),
  `hold back` (against *hold up / hold on / hold out*), `let on` (against *let off / let in /
  let down*). **Every distractor is a real English verb with a different meaning**, never a
  non-word, so a wrong answer is choosing the wrong meaning rather than choosing nonsense. The
  drag and make families the bank already had are not repeated.
- **The sense (3).** `go off` = stop liking (against the alarm and the spoiled-milk senses the
  deck teaches), `take up` = occupy space (against the hobby sense the deck teaches), `break down`
  = itemise (against the machine and the person senses the deck teaches). Each explanation names
  the competing senses and says what in the sentence decides — the subject, the object, or whether
  there is an object at all. This is criterion 4 of RESEARCH §1 applied to the quiz: the unit is
  verb + particle + **sense**.
- **The register collision (2), in both directions.** `terminate` is the only option that belongs
  in a signed contract even though *call off* and *pull out of* are what you would say to a
  colleague; `kick off` is the only option that belongs in a corridor even though the agenda's own
  word is *commence*. The scenario had exactly one item of this kind in the whole world; it is now
  a strand.
- **Form (2), extending the two separability items rather than repeating them.** `get rid of` is
  simply frozen — the item where the learner's instinct to reason from the parts is precisely what
  produces "got rid off". `keep up with them` is a three-part verb whose pronoun object may **not**
  split it, and its explanation says so **against** `separable-pronoun-look-over` by name, where a
  pronoun *has* to split the verb.

**Task 2 — the gate (`9da6b63`).** The topic set, written out; and the quiz charged to the sitting.

## The topic set now asserted for this scenario

```
Phrasal verb particles          (existing, copied character for character)
Phrasal verb senses             (NEW — permanent from 7f6a90a)
Phrasal verb separability       (existing, copied character for character)
Phrasal verbs vs formal verbs   (existing, copied character for character)
```

Exactly one new string was spent. Fixedness went under the existing **"Phrasal verb separability"**
rather than earning a fifth: the plan groups fixedness with separability, and the topic is about
the *form* of a phrasal verb, which is what a frozen string is.

The other three banks are recorded too, so the assertion is a property of the corpus and not of one
scenario:

| Scenario | Recorded topics |
|---|---|
| `social/small-talk` | Echo questions · Past simple · Present simple vs continuous · Question tags · had better |
| `work/interviews` | Hedging with would · Indirect questions · Past perfect · Present perfect continuous · Second conditional |
| `work/emails` | First conditional · Gerund vs infinitive · Modals · Passive voice · Past continuous |
| `native/phrasal-verbs` | the four above |

Four assertions carry it: the distinct set per scenario is **exactly** the recorded one; every
scenario that declares grammar **has** a recorded set (so the next scenario to declare grammar
cannot land ungated); no set is recorded for a scenario with no bank; and one teaching point has
**one spelling** across all four banks. Plus the cross-surface one — any topic that normalises onto
a global-bank topic must match it **character for character**, since that agreement is the whole
reason `weakTopics()` aggregates the two instead of counting one weak spot twice at half strength.

The normalisation used for that last check is **deliberately lossy** — case, punctuation and runs
of whitespace all collapse — because the failure being hunted is a string that *means* the same and
*is* not the same. Two topics that normalise apart are simply different teaching points and are
left alone.

## The third rate, and the arithmetic

`SECONDS_PER_GRAMMAR_QUESTION = 30`, in the same named-constant shape 04-01 used. Both of 04-01's
documented properties carry forward untouched, and the comment block now says so explicitly:

- the comparison stays **`>=`**, so exactly zero slack passes;
- the budget still **double-counts the warm-up phrases**, which is why a scenario at nominal zero
  still has real headroom underneath it. The margin is in the rates, not in a rounded-up `minutes`.

```
native/phrasal-verbs:  18 × 20 s  +  42 × 15 s  +  15 × 30 s
                     =    360 s   +    630 s    +    450 s     =  1,440 s
                     =  exactly 24 minutes, exactly ZERO slack — which PASSES.
```

Not rounded to 25. The margin is already in the rates.

**Run across all 35 scenarios, no scenario lands at negative slack, so no other `minutes` moved.**
Two scenarios sit at exactly zero and **neither was touched**:

| Scenario | min | phrases | deck | questions | needs | advertised | slack |
|---|---|---|---|---|---|---|---|
| `native/phrasal-verbs` | 24 | 18 | 42 | 15 | 1,440 s | 1,440 s | **0 s** |
| `social/small-talk` | 8 | 6 | 14 | 5 | 480 s | 480 s | **0 s** |
| `work/emails` | 10 | 6 | 14 | 5 | 480 s | 600 s | 120 s |
| `work/interviews` | 12 | 6 | 14 | 5 | 480 s | 720 s | 240 s |
| `practical/appointments` | 6 | 6 | 14 | 0 | 330 s | 360 s | 30 s (tightest non-zero) |

`social/small-talk` at exactly zero is the case the plan singled out, and leaving it alone is the
point: raising it would contradict the rule the invariant itself states, and would leave the next
author unable to tell which convention is live.

## Numbers

**Saturated payload:** **176,151 B — 16.8 % of the 1,048,576 B cap**, over 649 scheduled ids
(548 scenario + 101 global grammar). 04-01 left it at 173,143 B / 16.5 %; ten grammar questions,
which carry the highest words-per-item cost in Class A, spent **0.3 points** of headroom.

**Fixture diff:** 10 lines added, **0 removed**, and **not one changed hash** on a pre-existing id.
`--update` re-run afterwards left the file byte-identical.

### Corpus-wide near-duplicate scan

Exact + Jaccard over word sets, run across the whole authored corpus (every scenario phrase, tip,
gloss, vocab term, example and gloss, every scenario grammar prompt/explain/option, and the global
grammar bank), with the ten new prompts and explanations compared against all of it.

**Thresholds stated up front:** any *exact* match is a defect to investigate; on prose fields
(prompt, explain, example, tip) **J ≥ 0.50** is investigated and **J ≥ 0.60** is treated as a
defect. Stopwords are **not** stripped, which inflates every score — so these are upper bounds.
04-01's separate, stricter rule for `es` glosses does not apply here: a grammar question has no
Spanish field.

**Highest pair involving a new item: 0.286** — `fixed-form-get-rid-of`'s prompt against
`native/phrasal-verbs#vocab#turn-out-transpire`'s example. The entire overlap is function words
(*we, had, been, the, in, a/two, year(s)*); no content word is shared. The next four:

| J | New item | Against |
|---|---|---|
| 0.250 | `particle-let-on` / prompt | `social/dating#vocab#have-a-crush-on` / example |
| 0.250 | `three-part-keep-up-with` / prompt | `inseparable-do-without` / prompt (same scenario) |
| 0.232 | `particle-hold-back` / explain | `separable-pronoun-look-over` / explain (same scenario) |
| 0.211 | `fixed-form-get-rid-of` / prompt | `wound-up-staying` / prose (same scenario) |

Every one is function-word overlap or a deliberate same-scenario echo — the 0.232 pair is two
separability explanations, which *should* rhyme. Nothing approaches 0.50.

**Exact duplicates: one involving a new item, and it is a distractor string** —
`travel/airport#vocab#take-off`'s term equals one wrong option in
`register-commence-kick-off`. Not a duplicated teaching unit: this scenario does not *teach* `take
off`, it offers it as a wrong answer and its explanation glosses it in one clause as "what the
plane does". That is the same class as the two incidental co-occurrences 04-01 recorded and left
(`take on too much`, `turned up late`), so it is treated the same way. **Six further exact
duplicates were found, all pre-existing and none involving this plan's work** — logged to
`deferred-items.md`, not fixed, because each is a committed id.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] A planned question would have duplicated `work/meetings`' card, caught before it was written**

- **Found during:** Task 1 authoring, by the corpus scan run on candidates *before* committing.
- **Issue:** The sense strand was going to use **`run over`** in the "exceed the allotted time"
  sense. `work/meetings#vocab#run-over` already teaches exactly that sense, glossed
  *"alargarse más de la cuenta"*, with the example *"The demo ran over by twenty minutes"* — and
  the draft prompt used "by about twenty minutes" as its own deciding detail. Two scenarios handed
  the same material, which is the D-01 failure at the grain WINDOWS 39/41 established as real.
- **Fix:** Replaced with `break down` = itemise, whose competing senses are the two this scenario's
  own deck teaches, so the item now *builds on* the deck instead of colliding with another world.
- A second candidate, **`cut off`**, was dropped for the same reason after
  `practical/phone-calls#phrase#we-got-cut-off` turned up; replaced by `let on`.
- **Commit:** `7f6a90a` (the collision never reached a commit)

### Things I did not change

- **The six pre-existing exact duplicates** listed in `deferred-items.md`, including the
  cross-surface one where `work/emails#grammar#look-forward-to-gerund`'s prompt is byte-identical
  to global `b8`'s. Out of this plan's scope, every one a committed id, and no assertion was added
  for them either — a gate that fails on arrival is a gate that gets disabled rather than fixed.
- **`social/small-talk`'s 8 minutes**, at exactly zero slack. Explained above.
- **The `take off` distractor collision**, explained above.

## Verification

Every `<verify>` block in both tasks was run. All passed. Exit codes were captured **directly into
a variable**, never read through a pipe.

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **12,868** assertions pass (baseline 12,683) |
| `verify-id-stability.mts` | **1,679** assertions pass; 548 ids, 1 retired |
| Task 1 `--update` idempotence | fixture byte-identical after re-running |
| Fixture diff | 10 added, 0 removed, 0 changed hashes |
| Derived coverage | `native/phrasal-verbs` grammar summary reads **"15 questions"**, no second edit |
| `npx tsc --noEmit` | exit 0 (both tasks) |
| `npm run lint` | exit 0, no warnings (both tasks) |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |

**Build integrity (the 03-08 hazard).** No mutation was live when the build ran: every mutation was
restored with a per-file `git checkout --` and `git status` was verified clean *before* `.next` was
wiped. The rebuilt bundle was then grepped and holds `three-part-keep-up-with`,
`sense-go-off-dislike`, `register-terminate-contract` and `Phrasal verb senses`, and
`.next/server/chunks/ssr/…` carries `minutes:24` — so the artifact reflects the committed tree and
no claim here rests on a stale or poisoned build.

### Mutation sweep — 8 declared, 8 executed, 6 caught, 2 controls green

Anchors were extracted as **unique single-line substrings**, base64-encoded through the shell so
smart quotes could not be mangled, and applied to the raw file text so CRLF survived byte for byte.
The mutator **refuses** a non-unique or multi-line anchor. A mutation counts as caught only if the
harness fails **on the expected assertion label**, so a mutation that merely breaks the file cannot
masquerade as proof of an assertion it never reached.

| # | Mutation | Caught by |
|---|---|---|
| M1 | a bank topic mistyped to a near-variant (`Hedging with would` → `Hedging with Would`), chosen so only one assertion *can* fire | the exact recorded-set assertion |
| M2 | a bank topic case-varied against the global bank (`Passive voice` → `Passive Voice`) | character-for-character agreement with the global bank |
| M3 | two scenario banks spelling one point differently (`Question tags` → `modals`) | one spelling across every scenario bank |
| M4 | the *record* claiming a topic the bank does not hold | the exact recorded-set assertion, from the other side |
| M5 | `minutes` back to **17** — which **passed** 04-01's two-rate invariant (990 s needed / 1,020 s advertised) | the advertised-sitting assertion — **only the third rate can make 17 fail**, so this is the proof the grammar term is really charged |
| M6 | a `RECORDED_TOPICS` key renamed, leaving `work/interviews` with no record at all | "every scenario that declares grammar has its topic set recorded here" |
| C1 | an inert comment edit in the mutated bank file | control — stayed **green** |
| C2 | an inert `blurb` change in the mutated curriculum file | control — stayed **green** |

**The sweep harness was smoke-tested in BOTH directions before any verdict was trusted**, which is
the discipline 04-01 paid for after two defective runners:

- **Baseline green** — the untouched committed tree exits 0, so a later failure means the mutation.
- **The SURVIVED path is live** — an inert edit run *as* a mutation leaves the harness at exit 0,
  i.e. the sweep really would have printed `SURVIVED` rather than silently counting a catch. Until
  that branch had executed once, "6 caught" was an unfalsifiable claim.
- **The ANCHOR-DEFECT path is live** — a deliberately non-unique anchor (`level: "B2",`, 20
  occurrences) was refused with exit 2 and **left the file untouched**.

One live reminder of hazard 2 was hit during the TDD RED step and is recorded rather than hidden:
an `echo "EXIT=$?"` placed after a `node … | grep …` pipeline reported `0` for a probe that had
genuinely exited `1`. It read grep's status, exactly as 04-01's first runner did. It affected no
verdict — the probe's own output showed the failure — and every exit code in the sweep and in the
verification table above is captured directly.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | 15 questions, derived, drilling particle/sense/register/fixedness rather than generic B2 grammar | ✅ coverage reads "15 questions" off `items.length` |
| 2 | Every added id new, no pre-existing id's content changed, all ten inside the fixture from the same commit | ✅ 10 added / 0 removed / 0 changed hashes |
| 3 | A mistyped or near-variant topic string now fails the gate | ✅ proved by M1, M2, M3, M4, M6 |
| 4 | A sitting the scenario can keep, all three rates gated across all 35 under one rule: `>=` passes, only negative slack corrected | ✅ 24 min at exactly zero; no scenario negative; nothing else moved |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived from
bank contents.

## Self-Check: PASSED

All modified and created files present on disk; both commits (`7f6a90a`, `9da6b63`) present in
`git log`.
