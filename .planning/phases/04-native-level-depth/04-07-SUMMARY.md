---
phase: 04-native-level-depth
plan: 07
subsystem: scenario-content
tags: [content, srs, metalanguage, honesty, additions-only, deferred-voice]
status: complete

requires:
  - "04-01's id-stability gate + fixture — 14 additions regenerated into it, zero retirements"
  - "04-01's session-length invariant — native/pronunciation's minutes raised under it, in the growing commit"
  - "04-01's recall-batches contract — the 28-card deck inherits batching with no renderer change"
  - "04-06's REBUILT corpus harvester — the one that sees reading bodies, glossaries and question prompts"
  - "04-05/04-06's rule that a surviving or refused mutation is the mutation's fault first — applied to my own premature fixture regeneration"
provides:
  - "the written account, in BOTH banks, of why native/pronunciation is deliberately the smallest of the five"
  - "12 warm-up lines: 5 tongue-twisters and ship/sheep untouched, plus 6 sentences a person would actually say"
  - "a 16-card metalanguage deck completing the vocabulary a learner needs to be TOLD what her mouth is doing"
  - "the strengthened, measured case for deferred VOICE-01, as an input to the phase gate's annotation of CONT-04"
affects:
  - "04-08's declarations decision: the no-new-declaration verdict for this scenario is derived here so it need not be re-derived"
  - "04-09 / the phase gate: all five native scenarios now carry depth, four deeply and this one deliberately less"

tech-stack:
  added: []
  patterns:
    - "declining to pad a weak surface to a uniform floor, and writing the reason into the content itself rather than only into the record"
    - "authoring against the ONE existing item that works, rather than against the shape that merely fills the slot"
    - "disclosing a renderer's blind spot inside the item that trips it, so the limitation teaches instead of misleading"
    - "regenerating the id fixture ONCE, after the reader pass — the gate treats a pre-reader-pass regeneration as a re-point, and it is right to"

key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - src/lib/curriculum.ts
    - scripts/fixtures/scheduled-item-ids.json

decisions:
  - "THE PLAN NAMED SIX CONTRASTS AND ONE OF THEM WAS ALREADY TAKEN. The 'short and long vowel pair' draft glossed as '(la /iː/ larga frente a la /ɪ/ corta)' — a word-for-word PERMUTATION of the live `native/pronunciation#phrase#ship-sheep.es`, J = 1.000, same scenario, same contrast. Killed before it was written. /v/–/b/ took the slot: Spanish has no /v/, and nothing in this bank covered it. Sixth consecutive plan where an item the plan named was the duplicate."
  - "`minutes` was NOT lowered to 9 at Task 1. The plan says 'the smallest whole minute the invariant allows', which at 12 phrases and a 20-card deck is 9 — BELOW the standing 10. Shrinking an advertised sitting inside the commit that grows the bank behind it points the wrong way, and 04-01's rule is that this budget is always fixed by raising. Held at 10 through Task 1, raised to 11 at Task 2 as planned."
  - "`record-it-and-a-record` is the ONE addition whose contrast the word-level scorer cannot see, and the item says so in its own tip. Stress does not change the word the recogniser returns. Disclosed rather than quietly shipped, because a score that cannot see the thing being drilled is exactly the evidence VOICE-01 needs."
  - "`sentence stress` scores J = 0.667 against the GLOBAL speaking-tip panel titled 'Word & sentence stress'. KEPT, with the number written into the deck header: that panel is prose on the Speaking skill page — no term, no Spanish, nothing scheduled — and this deck has coexisted with it since Phase 3 on `word stress` and `intonation` already."
  - "I regenerated the fixture BEFORE the reader pass and the gate refused the second regeneration as a re-point on two of my own uncommitted ids. The gate was right; the fault was mine. Recovered by restoring the fixture to its committed baseline and regenerating once, after content was final."
  - "NO id was retired and none re-pointed. Zero one-way-door decisions were put to the user — the third consecutive plan needing none, because this scenario's Phase 3 content is correct and depth here is pure addition."

metrics:
  duration: "~50 min"
  completed: 2026-08-04
  tasks: 2
  commits: 2
  harness_assertions: 14479
  harness_baseline: 14325
---

# Phase 4 Plan 07: The Honest One — native/pronunciation Summary

`native/pronunciation` now holds twelve warm-up lines and sixteen cards, and it is **deliberately
the smallest of the five native scenarios** — half again where its neighbours went to three times.
Both banks say so in their own headers, with the reason, so the inequality is a recorded judgement
rather than an unexplained gap.

## What shipped

| | Before | After |
|---|---|---|
| `native/pronunciation` phrases | 6 | **12** |
| `native/pronunciation` cards | 8 | **16** |
| Advertised `minutes` | 10 | **11** |
| `verify-scenario-content` assertions | 14,325 | **14,479** |
| Scheduled ids under a committed hash | 632 (+15 retired) | **646 (+15 retired — unchanged)** |
| `verify-id-stability` assertions | 1,959 | **2,001** |
| Ids retired by this plan | — | **zero** |
| Ids re-pointed by this plan | — | **zero** |

For contrast, its four neighbours: `idioms` 18/24 · `phrasal-verbs` 18/24 · `register` 18/24 ·
`culture` 18/24. This one is 12/16, on purpose.

## The six warm-up lines (`951bc7a`)

The five tongue-twisters and `ship-sheep` were not touched, in any field. **Not one addition is a
tongue-twister** — six more would be volume with no gain, which is the padding this plan refuses.
All six follow `ship-sheep` instead, the one item in the set that already worked: the contrast sits
inside a sentence a person would really say, so `PronunciationLab` has a real **word** to get right
or wrong and the score means something.

| Slug | Line | Contrast, and what it costs |
|---|---|---|
| `taking-the-dog-to-the-vet` | *"I'm taking the dog to the vet tomorrow."* | **/v/ vs /b/** — Spanish has no /v/ at all. Two lips instead of lip-and-teeth gives `bet`: you are gambling, not going to the vet |
| `thursday-not-tuesday` | *"I thought we said Thursday, not Tuesday."* | **/θ/ vs /t/** — the tongue behind the teeth instead of between them gives `Tuesday`, and you arrive two days early |
| `hang-those-clothes-up` | *"Hang those clothes up — they're still damp."* | **/ð/ vs /d/** — three /ð/ in one natural sentence; a hard /d/ leaves `doze` and `close`, and no clothes |
| `state-school-not-estate` | *"It's a state school, not a private one."* | **initial `st-`** — the vowel that creeps in front makes `estate`, a housing estate rather than a kind of school |
| `send-an-update-every-friday` | *"I send an update every Friday morning."* | **final /d/ voicing** — devoiced it is `sent`, and the sound carries away the tense: something done once, not every week |
| `record-it-and-a-record` | *"Someone should record this — I want a record of what he actually said."* | **noun/verb stress** — re-CORD against RE-cord, both forms in one utterance |

Every `tip` names **what the mouth does**, never what the sentence means, and every `es` names the
contrast in the parenthetical style the set already used rather than pretending a drill line has a
translation.

**Writing a sentence that contains a contrast is not building a minimal-pairs component**, and the
header says so in as many words: the deferred item under D-01 is a new drill with a new renderer,
and this adds neither. It is six more entries in the array `PronunciationLab` has always rendered,
modelled on an item that was already in the bank.

## The plan named six contrasts and one of them was already taken

The **short/long vowel pair** was on the plan's list. Its draft gloss came back at **J = 1.000**
against a live id in the very same scenario:

| Killed candidate | Killed by |
|---|---|
| `(la /iː/ larga frente a la /ɪ/ corta)` | `native/pronunciation#phrase#ship-sheep.es` — *"(la /ɪ/ corta frente a la /iː/ larga)"*. The **same words in a different order**, for the same contrast, in the same set |

Measured before a word was authored. **/v/–/b/** took the slot instead — the largest Spanish-speaker
consonant gap in the bank, and covered nowhere in it. This is the **sixth consecutive plan** in which
an item the plan itself named turned out to be the duplicate. Naming something in a plan still does
not make it free.

Two more collisions were cleared before authoring:

| Field | Was | Rewritten because |
|---|---|---|
| `send-an-update-every-friday.text` | *"I send the invoice on the first of every month."* | J = 0.333 against `practical/banking#vocab#direct-debit.example` — *"…by direct debit on the first of the month"*, a whole shared clause |
| same, second draft | *"I send them a reminder every Friday."* | J = 0.300 against the live `work/emails#phrase#gentle-nudge` — *"I'll send them a gentle nudge."*, the `send them a …` frame |

## The deck — sixteen cards of metalanguage (`33f082b`)

The deck's Phase 3 rule **stands and is not superseded**: this deck is the metalanguage, because the
phrases are twisters and cannot be spread. Eight more terms widen it, in four strands. The Phase 3
eight (`word stress`, `a silent letter`, `a homophone`, `enunciate`, `mumble`, `intonation`,
`a tongue-twister`, `rhyme with`) are untouched.

- **What unstressed syllables do (2)** — `the schwa` · `a weak form`. Why the vowel disappears, and
  why `of` in *a cup of tea* has no `ov` in it.
- **What happens between words (1)** — `linking and elision`. The gap she is putting in that nobody
  else puts in.
- **What the consonant itself is doing (2)** — `aspiration` · `voiced and voiceless`. The two
  distinctions that turn `pin` into `bin` and `is` into `ice`.
- **What the whole sentence is doing (2)** — `sentence stress` (explicitly *against* the live
  `word stress` card) · `a rising tone`, whose `es` carries both contours and what each one signals.
- **And the one that tells her where not to spend the effort (1)** — `an accent, not a mistake`.
  The single most useful thing a C1 learner can be told, because it sorts her features into the ones
  worth working on and the ones worth keeping.

**Every `example` is a correction being GIVEN, not a definition restated** — *"That 'p' needs more
aspiration behind it — you're landing on 'bin' rather than 'pin'."* The card's value is recognising
the correction when it arrives, so the example shows somebody actually saying it to somebody.
`ScenarioVocabCard` stays `{id, term, es, example}`: no new item type (D-01).

## The account written into both banks

Both headers now carry the same reason, so the two agree and neither reads as an oversight. From
`phrases.ts`:

> **DELIBERATELY THE SMALLEST OF THE FIVE SOUNDING-NATIVE SETS** — twelve phrases where its
> neighbours hold eighteen, and sixteen cards where they hold twenty-four or forty-two. That is a
> judgement, not an oversight […] The drills pronunciation actually needs are minimal pairs as an
> exercise, word stress as an exercise and intonation as an exercise — and those are precisely the
> new drill components this phase's D-01 rules out. Under that decision the only shapes available
> here are a warm-up line and a recall card, so volume buys less in this scenario than in any other:
> a thirteenth tongue-twister teaches nothing a sixth did not. Padding this set to the same floor as
> `native/idioms` or `native/culture` would imply the five scenarios were deepened equally when they
> were not, which is a claim made with content instead of with words.

And the deferred work, named in both banks and acted on in neither:

> **WHAT WOULD CHANGE THE VERDICT:** the deferred premium TTS/STT work (VOICE-01, v2 backlog). This
> scenario's whole feedback loop today is the browser recogniser plus the learner's own ear, and
> `PronunciationLab` scores an attempt WORD BY WORD against what the recogniser returned — it cannot
> hear a vowel length, an aspiration or a stress position, only whether the word came back. A real
> voice model would make every drill D-01 rejected buildable and would make this the cheapest
> scenario to deepen rather than the dearest. Named here as evidence for that case; NOT acted on.

## The VOICE-01 case, strengthened by evidence rather than by assertion

This is an explicit input to the phase gate's annotation of CONT-04, and it got stronger during
execution rather than being asserted at the start:

1. **One of the six additions has a contrast the scorer structurally cannot see.**
   `record-it-and-a-record` drills noun/verb stress. Stress does **not** change the word the
   recogniser returns — `record` comes back as `record` either way — so the word-level score is blind
   to precisely the thing being drilled. The item **says so in its own tip**: *"el corrector de esta
   pantalla puntúa palabra a palabra y no oye dónde cae el acento, así que esta la juzgas tú con el
   botón de escuchar."* Disclosed inside the item that trips it, rather than quietly shipped.
2. **The other five only work because their errors happen to produce different WORDS.** That is a
   lucky property of segmental minimal pairs, not a property of the scorer. Vowel length, aspiration
   and contour are all invisible to it.
3. **The deck exists at all because of this.** Sixteen cards of metalanguage is what a scenario
   builds when it cannot score the skill: the whole feedback loop is somebody else telling her, so
   the deliverable is the vocabulary to understand what she is told.

**T-04-15 is therefore partially unmet and reported as such.** Its mitigation reads *"Every addition
puts the contrast on a word the recogniser must return"* — true of five of six, false of the stress
item by the nature of stress. The alternative was to drop the contrast the plan named; the choice
taken was to ship it with the limitation written on its face.

## Corpus-wide near-duplicate scan

Exact + Jaccard over word sets, run **before authoring** and again against the final content, using
**04-06's rebuilt harvester** — the one that sees reading passage bodies (`string[]`), glossaries
(`{word, meaning}`) and reading question prompts (`q.q`). Rebuilt against the real shapes here it
measures **4,523 authored fields** at baseline, rising to **4,565** as this plan's own content landed.
Stopwords are **not** stripped, so every score is an upper bound. Thresholds as this phase has used
throughout: any exact match is a defect, J ≥ 0.50 is investigated, J ≥ 0.60 is a defect.

**189,966 comparisons for the phrases, 108,984 for the deck. Zero exact duplicates in any field, in
either set** — after the three kills above, none of which reached a commit.

### Then both banks were read consecutively, which the scan cannot substitute for

Five more rewrites no threshold flagged, because a repeated *shape* is invisible to a word-set metric:

| Item | Shared its frame with |
|---|---|
| `thursday-not-tuesday.tip` | *"te sale 'Tuesday'"* — the third of six tips to say *"sale"* for *comes out as*. → *"lo que oye el otro es 'Tuesday'"* |
| `hang-those-clothes-up.tip` | *"salen 'doze' y 'close'"* — same frame again. → *"quedan en 'doze' y en 'close'"* |
| `schwa.example` | opened *"The second syllable of 'problem'…"* against the live `word-stress` card's *"…is on the second syllable"*, two cards apart. → *"You're giving the 'a' in 'about' a full vowel…"* |
| `aspiration.example` | opened *"Your 'p'…"*, the third card in the deck to open on *"Your"* (the live `intonation` card is one of them). → *"That 'p' needs more aspiration behind it…"* |
| `accent-not-a-mistake.example` | *"nobody misheard you"* against the live `mumble` card's *"nobody catches my name"*. → *"everyone understood you"* |

All five were caught while the ids were **uncommitted**, so all five were free.

### Highest pairs, reported rather than gamed

**One finding is genuine and was KEPT with its number.** `sentence stress` scores **J = 0.667**
against `global/speaking-tip#word-stress.title` — *"Word & sentence stress"* — a global prose panel
on the Speaking skill page whose points also brush weak forms (*"small words are weak"*), linking
(*"Natives link words"*) and the contour (*"Voice usually rises on yes/no questions, falls on
statements"*).

It was kept, and the measurement was written into the deck header so the next author inherits it:
that panel is **not a card** — no term, no Spanish, no example, nothing scheduled — and this deck has
coexisted with it since Phase 3 on `word stress` and `intonation` already. The plan requires sentence
stress by name, the deferred drills cannot be built, and the words are the only thing this scenario
can actually hand her. `a rising tone` was deliberately given a **third** signal (an open list) so it
neither repeats that panel's question-vs-statement nor the live `intonation` card's order-vs-question.

Everything else is artefact. `the schwa` raises J = 0.500 against bare `"the"` grammar options and
0.333 against a dozen `the X` card terms — a two-word term against a one-word string, which 04-06
recorded as an artefact of the metric and not a duplicate. The `es` parentheticals score 0.300 against
`ship-sheep.es`; that is this set's **house style**, mandated by the plan in as many words.

**Nothing sat at or above J = 0.60 on any pair that is a taught unit**, so this plan files no WINDOWS
judgement of 04-04's kind.

## The sitting

```
native/pronunciation:  12 x 20 s  +  28-card deck x 15 s  +  0 questions
                       = 240 s + 420 s = 660 s
                       minutes 11 -> 660 s advertised -> 0 s slack
```

The deck is phrases **plus** vocabulary, so the warm-up is deliberately double-counted per 04-01's
documented conservatism, and the invariant compares with `>=`, so exactly zero slack passes.
`minutes` was raised **in the same commit as the deck growth**.

**It was not lowered at Task 1, and that is a deviation from the plan's wording.** At 12 phrases and
a 20-card deck the sitting is 540 s, so "the smallest whole minute the invariant allows" is **9** —
a *decrease* from the standing 10. Shrinking an advertised sitting inside the commit that grows the
bank behind it points the wrong way, and 04-01's rule is that this budget is always fixed by raising
`minutes`, never by lowering anything. Held at 10 (600 s, 60 s slack — the invariant passes), then
raised to 11 at Task 2 exactly as the plan requires. Recorded in `curriculum.ts` beside the entry.

## The id gate fired on me, and it was right

**I regenerated the fixture before finishing the reader pass**, then rewrote two tips. The second
`--update` **refused**:

```
verify-id-stability --update: REFUSED, 2 id(s):
  native/pronunciation#phrase#hang-those-clothes-up
    already existed and its content HASH CHANGED. That is a re-point […]
  native/pronunciation#phrase#thursday-not-tuesday
```

Applying 04-04's rule — *when something fails, suspect your own move first* — the diagnosis was
immediate and it was not a defect in the gate: hazard 5 says **regenerate the fixture once, after
content is final**, and I had not. Both ids existed only in my uncommitted working copy.

Recovered by restoring the fixture to its committed baseline with `git show HEAD:… > …` — chosen over
`git checkout --` deliberately, since the fixture is a generated artefact and the source files beside
it held uncommitted work — then verifying `phrases.ts` and `curriculum.ts` were untouched by the
restore (69 and 9 added lines, 0 removed), then regenerating **once**. Final diffs: **6 added / 0
removed / 0 changed hashes** at Task 1, **8 added / 0 removed / 0 changed hashes** at Task 2.

## No one-way door was opened

**Zero ids retired. Zero ids re-pointed. Zero changed hashes across both commits.** The six existing
phrases and eight existing cards were not touched in any field. **No retirement decision was put to
the user**, because none was needed — this scenario's Phase 3 content is correct and depth here is
pure addition. That is now **three consecutive plans** (04-05, 04-06, 04-07) needing no one-way-door
decision.

## Verification

Every `<verify>` block in both tasks was run. **All passed.** Exit codes captured directly.

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **14,479** assertions pass (baseline 14,325; 14,391 after Task 1) |
| `verify-id-stability.mts` | **2,001** assertions pass; **646** ids, 15 retired (unchanged) |
| Fixture diff, Task 1 | 6 added · **0 removed** · **0 changed hashes** |
| Fixture diff, Task 2 | 8 added · **0 removed** · **0 changed hashes** |
| `--update` idempotence (both tasks) | fixture byte-identical after re-running |
| Removed-line check on `phrases.ts` (Task 1) | exit 0 — nothing removed |
| Removed-line check on `scenario-vocabulary.ts` (Task 2) | exit 0 — nothing removed |
| `minutes: 11` covers the sitting | 660 s needed, 660 s advertised, 0 s slack under `>=` |
| Corpus scan | **0 exact duplicates**; 3 candidates killed pre-authoring; highest genuine J = 0.667, kept with reasons |
| `npx tsc --noEmit` | exit 0 (both tasks) |
| `npm run lint` | exit 0, no warnings (both tasks) |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |
| Payload | 203,699 B saturated over 747 scheduled ids — **19.4 %** of the 1,048,576 B cap (was 19.0 % / 733) |

**Build integrity (the 03-08 hazard).** No mutation sweep was run in this plan, so no mutation could
survive into an artefact. The build ran only after `git status` showed the tree clean of tracked
changes, and `.next` was wiped first. The rebuilt bundle holds `hang-those-clothes-up`,
`state-school-not-estate`, `accent-not-a-mistake`, the card term *"linking and elision"*, the phrase
text *"Someone should record this"*, *"a rising tone"* and `minutes:11`. Checked rather than assumed.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] A contrast the plan named was already taught by a live id in the same scenario**

- **Found during:** the pre-authoring scan, before any content existed.
- **Issue:** the short/long vowel pair's draft `es` was a word-for-word permutation of
  `ship-sheep.es` (J = 1.000) — the same contrast, the same set, a live spaced-repetition key.
- **Fix:** the candidate was never written. **/v/–/b/** took its slot: Spanish has no /v/, and
  nothing in this bank covered it. Two further collisions on
  `send-an-update-every-friday.text` were cleared the same way.
- **None of the three ever reached a commit.** Commit `951bc7a`.

**2. [Rule 3 — Blocking] The fixture was regenerated before the reader pass, and the gate refused**

- **Found during:** Task 1, by the id-stability gate itself.
- **Issue:** two tips were rewritten *after* an `--update` had already recorded their ids, so the
  regeneration read as a re-point on two live keys.
- **Fix:** fixture restored to its committed baseline and regenerated **once**, after content was
  final. The gate behaved exactly as designed; the error was procedural and mine.
- **Recorded rather than hidden**, because the recovery path is the thing a later plan needs.

**3. [Rule 1 — Bug] Five repeated frames the Jaccard scan scored below threshold**

Caught by reading both finished banks consecutively; all five ids were still uncommitted. Documented
in full under the corpus scan. Commits `951bc7a` and `33f082b`.

### Things I did not change

- **`minutes` at Task 1.** The plan's literal wording would have *lowered* it from 10 to 9. Held,
  with the reason written into `curriculum.ts`; raised to 11 at Task 2 as planned.
- **`sentence stress`, at J = 0.667 against a global speaking-tip title.** Kept with the number in
  the deck header, on 04-06's precedent that a measurement below the defect threshold does not buy
  content distortion — and here the card is required by name and the panel is not a card.
- **The stress item's scorability.** `record-it-and-a-record` ships with its limitation disclosed in
  its own tip rather than being dropped or silently included. T-04-15 is reported partially unmet.
- **`CONT-04`.** **Not ticked.** This is plan **seven of nine**; the declarations decision (04-08)
  and the phase gate (04-09) are still outstanding. A tick here is a claim outrunning the content,
  which D-02 forbids and which 04-03 had to revert.
- **A new skill declaration for this scenario.** Derived here so 04-08 need not re-derive it:
  **there is no honest one.** Reading and writing do not train pronunciation, and a `GrammarQuestion`
  about stress placement would be a drill component in a quiz's clothing — the line D-01 draws, and
  the plan rules it out by name. `skills: ["speaking"]` is unchanged.
- **`reviewableIds()`** and `EXERCISE_SOURCES`. `phrase` and `vocab` are already scheduled kinds; no
  wiring changed, so no phantom can enter the "Due today" count.
- **`FALLBACK_LESSON`** (04-04's open question) and the two deferred briefing questions from 04-05
  and 04-06. Nothing here touches `scenario-lessons.ts`.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | 12 phrases and 16 cards — half again, with the reason written into both banks | ✅ 12/16; both headers carry the same account |
| 2 | Not one added line is a tongue-twister; every one is sayable, contrast on a scorable word | ✅ on the shape; **5 of 6** on scorability — the stress item is disclosed, not hidden |
| 3 | The deck covers the schwa, connected speech, voicing, stress, contour and accent vs error | ✅ all eight strands |
| 4 | The deferred premium-voice case is named and strengthened, and not acted on | ✅ named in both banks; strengthened by the measured scorer blind spot |
| 5 | No existing id touched | ✅ 0 removed, 0 changed hashes, 2,001 assertions |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived from
bank contents.

## Self-Check: PASSED

All four modified files present on disk; both commits (`951bc7a`, `33f082b`) present in `git log`.
