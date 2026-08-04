---
phase: 04-native-level-depth
plan: 03
subsystem: scenario-content
tags: [content, idioms, srs, retirement, harness, gate, one-way-door]
status: complete

requires:
  - "04-01's id-stability gate + fixture — the retirements are declared in it and the 18 additions regenerated into it in the same commit"
  - "04-01's session-length invariant — native/idioms' minutes raised under it, not around it"
  - "the scenario's own reading passage (03-xx) — its deliberate withholding is now a gated property rather than a comment"
provides:
  - "MIN_TIP_WORDS = 12 in scripts/verify-scenario-content.mts — the gloss/use-note boundary, stated as a number"
  - "WITHHELD_BY_THE_PASSAGE — the four expressions native/idioms' passage withholds, written out and self-validated against the passage"
  - "the first APPROVED multi-id retirement in the project, and the audit trail shape for one"
affects:
  - "04-04: owns the deck, the briefing, and the eight-card retirement decision this plan could not legally take"
  - "any later plan touching native/idioms — six ids are permanently unusable and the tip gate has no exceptions"

tech-stack:
  added: []
  patterns:
    - "a written-out record CROSS-CHECKED AGAINST THE ARTEFACT IT DESCRIBES, so it cannot drift: each entry must occur in the passage body, must NOT occur in its glossary, and the count must track the question count"
    - "a threshold constant sited in the empty band between two measured populations rather than tuned to either"
    - "restoring a mutation from an in-memory byte snapshot, never `git checkout --`, so uncommitted work under test survives its own sweep"

key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/lib/curriculum.ts
    - scripts/fixtures/scheduled-item-ids.json
    - scripts/verify-scenario-content.mts
    - .planning/phases/04-native-level-depth/deferred-items.md

decisions:
  - "All six phrases were retired, not a subset. Four of the six carried NO tip and the other two carried glosses, and rule 4 forbids amending a field under a live id — so any survivor would have forced Task 3's gate to be scoped around its own exceptions, which is how a gate stops being a gate."
  - "`on the same page` came back under a NEW slug and as a QUESTION rather than an assertion. The expression was the best thing in the old bank; the item could not be saved, because its tip was a five-word frequency note and amending it would have been a re-point."
  - "The eight vocabulary cards were NOT retired here even though the table recommended it. MIN_VOCAB_CARDS = 8 makes a card retirement legal only in the commit that lands its replacements, and that commit is 04-04's."
  - "The tip ratio is PRINTED, never asserted — it moves on almost every plan in this phase, and an assertion on a moving number ends up disabled rather than fixed."
  - "The one within-set echo (`at the end of the day` / `the end of the world`, J=0.400) was turned into a teaching contrast inside one of the tips rather than removed. Two frequent expressions that genuinely rhyme are worth naming against each other."

metrics:
  duration: "~65 min"
  completed: 2026-08-04
  tasks: 3
  commits: 2
  harness_assertions: 13103
  harness_baseline: 12868
---

# Phase 4 Plan 03: `native/idioms` Re-Selected, and a Gate on the Tip That Was a Translation Summary

`native/idioms` stopped teaching the classic core-idiom list — the six canonical phrases were
retired by an explicit human decision and eighteen frequency-attested, register-marked expressions
took their place — and the two defects that made the bank textbook, the tip that is a gloss and the
bank entry that spoils its own reading passage, are now both impossible to reintroduce quietly.

## What shipped

| | Before | After |
|---|---|---|
| `native/idioms` phrases | 6 (all canonical core idioms) | **18, re-selected** |
| Of those, carrying a tip | 2 of 6, both glosses (4 and 5 words) | **18 of 18, use notes, 27–45 words** |
| Advertised `minutes` | 10 | **13** |
| `verify-scenario-content` assertions | 12,868 | **13,103** |
| Scheduled ids under a committed hash | 548 (+1 retired) | **560 (+7 retired)** |
| `verify-id-stability` assertions | 1,679 | **1,727** |
| Sounding Native tip ratio | 37/42 (88.1 %) | **53/54 (98.1 %)**, printed on every run |

## Task 1 — the approved retirement decision, verbatim

The checkpoint was presented with a fourteen-row table and stopped. The user answered:

> **`retire-recommended`**

and gave the reasoning, which is recorded here as reasoning and not merely as a verdict:

- The user was shown the cost in plain terms: the six phrase ids go, any schedule on them is
  permanently gone, and **it cannot be checked whether the beta user has studied them** — that
  lives in the production database, which is not reachable from here.
- **Five of the fourteen items are already taught in the global vocabulary decks with the same
  glosses**, so retiring here does not remove the material from the app.
- **This is Sounding Native, not CELPIP.** The beta user's exam prep is untouched either way,
  which is what made a one-way door on her progress acceptable at all.
- `same-page` was offered as a keep-one option and **declined** — re-author the expression under a
  new slug instead, because it is a real expression worth teaching that should not carry an id
  whose record cannot be amended.
- The eight vocabulary cards were carried to 04-04 exactly as scoped.

### Two findings that shaped the decision

**A. `retire-none` could not have been gated on all 18.** Four of the six phrases carried **no tip
at all**; the other two carried a 4-word gloss and a 5-word frequency note. Success criterion 3
wants a substantial, non-translation use note on all eighteen, and the id rule forbids adding a tip
to a live id because the hash covers every field. Any survivor would have forced the new assertion
to be written around its own exceptions.

**B. Retiring a vocabulary card here would have failed the build.** `MIN_VOCAB_CARDS = 8`
(`scripts/verify-scenario-content.mts:247`) and this plan adds no cards, so `8 − N < 8`. Card
retirement is only legal in the commit that lands its replacements — 04-04's.

### The six ids deleted, with their reasons

Each is recorded in `scripts/fixtures/scheduled-item-ids.json` under `retired`, written by hand
**before** `--update` ran. None may ever return.

| Id | Reason (abridged; full text in the fixture) |
|---|---|
| `native/idioms#phrase#piece-of-cake` | Core-idiom class; its tip was a translation — the exact defect research measured. On three further surfaces: briefing verbatim + global deck `idioms`. |
| `native/idioms#phrase#call-it-a-day` | No tip. The strongest duplicate in the set: the global deck's example is **byte-identical** to this phrase's text. |
| `native/idioms#phrase#under-the-weather` | Core-idiom class, no tip. Quoted verbatim in the briefing and taught again in the global deck with the same gloss. |
| `native/idioms#phrase#hit-the-nail` | The purest case: core-idiom class, no tip, and no who-says-it-to-whom note that would make it native-level. Retired on selection grounds alone. |
| `native/idioms#phrase#same-page` | The expression is genuinely the PHRASE-List class; the **item** could not be saved (5-word frequency note, and amending it is a re-point). Re-authored under a new slug per the approved decision. |
| `native/idioms#phrase#break-a-leg` | Named by name in 04-RESEARCH §1.2 as the class this bank was being rescued from — fully opaque set-piece idiom. No tip. |

## Task 2 — the eighteen, and why they are these

The criterion changed; that is the whole work. Five strands, each a thing a C1 learner gets wrong:

- **Disagreeing without ever saying no (4)** — `to be fair` · `that's true up to a point` ·
  `I wouldn't go that far` · `that's one way of putting it`.
- **The formula that manages the topic itself (4)** — `at the end of the day` ·
  `let's leave it at that` · `long story short` · `are we on the same page here?`
- **Understatement carrying a strong statement (4)** — `the timing isn't ideal` ·
  `I've had better weeks` · `it's hardly the end of the world` · `that was a bit much, wasn't it?`
- **Who decides, and what you owe the other person (3)** — `not my call` ·
  `the benefit of the doubt` · `no hard feelings if you'd rather not`.
- **The unremarkable ones, whose value is being unremarkable (3)** — `off the top of my head` ·
  `for what it's worth` · `as it happens`.

The last strand is the plan's restraint requirement made concrete, and `as-it-happens`' tip says so
outright: *"aquí la frase corriente es la buena, y colocar un idiom de color en su lugar es
exactamente el error que este escenario enseña a evitar."* Eighteen items therefore do not
contradict the briefing's own "learn a few well rather than many badly".

**Not one of the four expressions the passage withholds** — *cross that bridge when we come to it*,
*the writing is on the wall*, *clear the air*, *put my foot in it* — appears anywhere in the bank,
in any field. Probed explicitly across eight inflections; all absent, and now gated.

### The sitting

```
native/idioms:  18 × 20 s  +  26-card deck × 15 s  =  360 s + 390 s  =  750 s
                minutes 13 → 780 s advertised → 30 s slack
```

The deck is phrases **plus** vocabulary, so the warm-up is deliberately double-counted, per
04-01's documented conservatism. 12 was not enough (720 s < 750 s); 13 is the smallest whole
minute that clears it.

### Fixture diff

**18 added · 6 removed into `retired` · ZERO changed hashes.** Verified three ways: the removed
lines are exactly the six approved ids and nothing else; an id-by-id comparison of both sides of
the diff reports a changed-hash count of **0**; and re-running `--update` afterwards left the file
byte-identical, so it really was regenerated alongside the content in the same commit.

Before regenerating, the gate was run deliberately and **failed with 24 assertions** — 18
unrecorded additions plus the six ids that were still both live-in-the-fixture and retired. That
failure is the gate working, and it is recorded rather than skipped past.

## Task 3 — the two gates

**The tip.** For every one of the eighteen: a non-blank tip; a tip that does not restate its own
`es` field (the trailing full stop is stripped from the Spanish so a tip that quotes the gloss and
then carries on is caught as readily as one that *is* the gloss); and a tip of at least
`MIN_TIP_WORDS = 12` words.

Twelve is not a taste judgement. The two tips this bank used to carry ran **4 and 5** words; the
neighbouring scenario's genuine use notes start at **10**; the eighteen below start at **27**.
Twelve sits in the empty band between the two populations, so it separates them without being
tuned to either. Stated beside the constant, in the file.

**The withholding (T-04-08).** The four expressions the passage keeps its glossary silent about are
**written out** — 04-02's pattern — and then **cross-checked against the passage itself**, which is
what stops the record drifting away from what it claims to describe:

1. each recorded expression must really occur in the passage **body**;
2. none may occur in its **glossary**;
3. the record must hold **one per question** the passage asks.

Only then is the protection asserted: no phrase text, `es` or tip, and no vocabulary term, `es` or
example, may contain any of them — hunted across the inflections a bank would plausibly gloss them
under, since the passage says *"the writing **was** on the wall"* and a bank would say *"is"*. Plus
the literal cross-surface rule: no phrase text and no vocabulary term appears in the passage at all.

**The corpus came back clean before the assertion was written**, as the task requires.

## Numbers

**World tip ratio: 53/54 (98.1 %)** — printed on every harness run, never asserted. Research
measured 24 of 30 when the world held 30 phrases and this scenario contributed one of its six. The
single remaining untipped phrase is in `native/pronunciation`.

**Saturated payload: 179,579 B — 17.1 % of the 1,048,576 B cap**, over 661 scheduled ids. 04-02
left it at 176,151 B / 16.8 %; twelve net new phrases with long tips spent **0.3 points**.

### Corpus-wide near-duplicate scan

Exact + Jaccard over word sets, every field of the eighteen against **2,956 authored fields**
spanning all 35 scenarios' phrases/vocabulary/grammar/reading/speaking/writing/briefings plus both
global banks — with the scenario's own phrase bank excluded so nothing matched itself. Stopwords
are **not** stripped, so every score is an upper bound. Thresholds as 04-02 set them: any exact
match is a defect; J ≥ 0.50 investigated, J ≥ 0.60 a defect.

**Zero exact duplicates involving a new item.**

**Highest pair: J = 0.571** — `are-we-on-the-same-page.text` ("Are we on the same page here?")
against `global/vocab/work`'s bare **term** "on the same page". The entire overlap **is the
expression itself**, and the denominator is a four-word term, which is what inflates the score;
against that deck's example sentence it drops to 0.364. This is the deliberate re-authoring the
user approved, and the global vocabulary decks are a separate non-SRS flashcard feature, not a
scenario bank. Recorded rather than gamed: distorting the sentence to lower a number would have
made the content worse.

The next four, all function-word artefacts against gapped grammar prompts:

| J | New item | Against |
|---|---|---|
| 0.444 | `at-the-end-of-the-day` / text | global `a16` prompt ("It's the ___ day of the year.") |
| 0.400 | `had-better-weeks` / text | `social/small-talk#grammar#close-had-better` option |
| 0.400 | `that-was-a-bit-much` / text | global `c6` prompt |
| 0.375 | `hardly-the-end-of-the-world` / text | global `a16` prompt |

**Highest per field — text 0.571 · es 0.333 · tip 0.191.** The tips are the most distinctive field
in the set, which is right, since the tip is the whole of what makes an item native-level.

**Within-set highest: J = 0.400**, `at-the-end-of-the-day` against `hardly-the-end-of-the-world`.
Not removed — the two are genuinely frequent and genuinely different, and a C1 learner does blur
them. Turned into a teaching point instead: the second one's tip now names the first and says what
each does (*"aquel resume y este resta importancia"*).

### Mutation sweep — 11 declared, 11 executed, 9 caught, 2 controls green

Anchors extracted as **unique single-line substrings** at generation time; the mutator refuses a
non-unique or multi-line anchor and leaves the file untouched. Files read and written as raw text,
so CRLF survives byte for byte. Exit codes captured **directly from `spawnSync`**, never through a
pipe. A mutation counts as caught only if the harness fails **and** the expected assertion label
appears in its output.

| # | Mutation | Caught by |
|---|---|---|
| M1 | a tip blanked on one of the eighteen | "carries a tip at all" |
| M2 | a tip shortened back to a gloss | "is a use note, not a gloss" |
| M3 | a tip restating its own Spanish verbatim — the headline defect | "does not restate its own Spanish" |
| M4 | a bank tip glossing `clear the air` (T-04-08) | "no bank entry gives away \"cleared the air\"" |
| M5 | the record holding 5 entries against 4 questions | "names one expression per question" |
| M6 | the record naming an expression the passage does not contain | "the passage really uses" |
| M7 | the passage's glossary giving away one of the withheld four | "the glossary stays silent on" |
| M8 | a vocabulary term that the passage already uses | "its term does not appear in the passage" |
| M9 | `MIN_TIP_WORDS` raised to 60 — proves the constant is live | "is a use note, not a gloss" |
| C1 | inert comment edit in the content file | control — stayed **green** |
| C2 | inert comment edit in the harness | control — stayed **green** |

M5 was chosen so **only one assertion can fire**: its added entry occurs in the body (so "really
uses" passes), not in the glossary in that inflection (so "stays silent" passes), and its hunt term
is absent from every bank (so "gives away" passes).

**Smoke-tested in all three directions before any verdict was trusted:** baseline green; the
**SURVIVED branch live** (an inert edit run *as* a mutation left the harness at exit 0, so the
sweep really would have printed SURVIVED); and the **ANCHOR-DEFECT branch live** (a deliberately
non-unique anchor, 239 occurrences, was refused and left the file untouched).

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] Two near-duplicates caught *before* they were committed, by the pre-authoring corpus scan**

- **Found during:** Task 2, by the scan the task mandates, run on candidates rather than on results.
- **Issue:** two of the eighteen planned items were already taught elsewhere in the corpus —
  `I take your point` by `academic/debate#phrase#take-your-point-but` (with its own register tip),
  and `take something on board` by `work/feedback#vocab#take-on-board`. Both are the D-01 failure at
  the grain WINDOWS 39/41 established as real: two scenarios handed the same material. The second
  stings slightly, because 04-RESEARCH §1.2 names *take something on board* as an exemplar of
  exactly the class this bank was being re-selected toward — the corpus simply already had it.
- **Fix:** neither was written. Replaced before authoring.
- **Commit:** `1fdb6a8` (the collision never reached a commit)

**2. [Rule 1 — Bug] Two more near-duplicates at J = 0.500, caught by the post-authoring scan**

- `leave-it-at-that` was drafted as *"Let's leave it at that for now."* against
  `work/meetings#phrase#park-that` *"Let's park that for now."* — same frame, and functionally
  confusable. **Fixed to "Let's leave it at that."**, which also sharpens the meaning: "for now"
  was pulling it toward `park-that`'s postponement and contradicting its own tip.
- `no-hard-feelings` was drafted as *"No hard feelings either way."* against
  `social/dating#phrase#no-pressure-either-way` *"No pressure either way."* — same frame, same
  reassurance-before-a-decision function. **Fixed to "No hard feelings if you'd rather not."**,
  which also names the situation instead of floating abstractly.
- Both re-scanned afterwards; the highest remaining pair fell to 0.444.
- **Commit:** `1fdb6a8`

**3. [Rule 3 — Blocking] My own mutation runner deleted the uncommitted work it was testing**

This is the most important thing in this summary and it is recorded in full rather than quietly
fixed, because it is a live instance of hazard 2 and of the destructive-git rule.

- **What happened:** the first runner restored each mutated file with `git checkout -- <file>`.
  That restores from the **index**. The harness file held **uncommitted** work — the very assertion
  group under test — so the first mutation of that file **silently deleted the entire group**, and
  every mutation after it then "SURVIVED" against a harness that no longer contained the
  assertions it was being measured against. The runner's own final line printed
  `post-sweep tree: exit 0`, which was true and completely misleading.
- **How it was caught:** the **declared-vs-executed count**. Four anchors went to zero occurrences
  *simultaneously* — which is not what a real anchor defect looks like — and 04-01's rule ("if a
  mutation survives, check whether the mutation was defective first") turned that into an
  inspection instead of a verdict. Without that count the run would have reported "4 caught, 2
  survived" and I would have written it down.
- **Fix:** restore is now an **in-memory byte snapshot** written back verbatim, which is correct
  regardless of commit state and CRLF-safe because nothing re-encodes. A **pre-sweep byte snapshot
  of every touchable file** is compared at the end, so "exit 0" is no longer the only evidence that
  the sweep left nothing behind. The deleted group was re-applied and re-verified at the identical
  13,103 assertions before the sweep was re-run.
- **Lesson for later plans:** never restore a mutation with `git checkout --` while the file under
  test has uncommitted changes. Either commit first or snapshot the bytes.

**4. [Rule 3 — Blocking] One stale anchor (`M3`) from an item removed mid-authoring**

`see-how-it-goes` was swapped out for `are-we-on-the-same-page` when the user's instruction to
re-author `same-page` arrived, and M3's anchor still named it. Reported as ANCHOR DEFECT — NOT
EXECUTED rather than counted, which is what the executed count is for. Re-pointed at
`benefit-of-the-doubt` and re-run.

### Things I did not change

- **`native/idioms`' briefing** (`scenario-lessons.ts:125`) still quotes `piece of cake` and
  `under the weather` — **both now retired** — and quotes them as `expression = gloss`, the exact
  shape the new tip gate forbids. `scenario-lessons.ts` is not in this plan's `files_modified` and
  the plan assigns the briefing to 04-04 with instructions to leave it a clean field. **Logged in
  full detail** in `deferred-items.md`, with the precise line, the two replacement phrases
  recommended, and the note that the other two briefing tips are still true. Also filed to
  `.planning/WINDOWS.md`.
- **The eight vocabulary cards.** Recommended for retirement, illegal to retire here (constraint B
  above), carried to 04-04 with the note that it needs its own explicit human approval — it is the
  same one-way door on live progress that Task 1 was.
- **The `es`-field similarity between `are-we-on-the-same-page` and the global vocabulary deck.**
  Explained above; the overlap is the expression, and the user approved re-authoring it.

## Verification

Every `<verify>` block in both auto tasks was run. **All passed.** Exit codes were captured
directly, never through a pipe (`${PIPESTATUS[0]}` where a pipe was unavoidable).

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **13,103** assertions pass (baseline 12,868) |
| `verify-id-stability.mts` | **1,727** assertions pass; 560 ids, 7 retired |
| Every retirement carries a reason | 7/7, checked programmatically |
| `--update` idempotence | fixture byte-identical after re-running |
| Fixture diff | 18 added · 6 removed into `retired` · **0 changed hashes** |
| No retired slug survives under `src/` | all 7 absent |
| `npx tsc --noEmit` | exit 0 (both tasks) |
| `npm run lint` | exit 0, no warnings (both tasks) |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |

**Build integrity (the 03-08 hazard).** The build ran only after `git status` showed the working
tree clean of every mutation, and `.next` was wiped first. The rebuilt bundle was then grepped and
holds `are-we-on-the-same-page`, `off-the-top-of-my-head`, `hardly-the-end-of-the-world` and
`minutes:13`, and **does not hold** `piece-of-cake`, `break-a-leg` or `hit-the-nail` — so the
artefact reflects the committed tree and no claim here rests on a stale or poisoned build.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | The retirement list was approved by a human before a single id was deleted | ✅ Task 1 stopped; `retire-recommended` answered; deletions came after |
| 2 | 18 phrases selected on frequency, register and sense rather than canonicity | ✅ five strands, all PHRASE-List class, none canonical |
| 3 | Every one of the 18 carries a tip that is a use note, gated | ✅ **no exceptions** — 18/18, 27–45 words, proved by M1/M2/M3/M9 |
| 4 | No surviving id has different content behind it, in any field | ✅ 0 changed hashes; there are in fact no survivors — all six were retired |
| 5 | Every one of the 18 ids is in the regenerated fixture, committed beside its content | ✅ 560 ids, additions-only diff, `--update` idempotent |
| 6 | The passage still asks the reader to recover what nothing else gives away | ✅ gated, self-validating, proved by M4/M5/M6/M7/M8 |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived from
bank contents.

## Self-Check: PASSED

All modified files present on disk; both commits (`1fdb6a8`, `8c7667d`) present in `git log`.
