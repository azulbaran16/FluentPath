# Phase 4: Native-Level Depth — Research

**Researched:** 2026-08-01
**Domain:** English-language content authoring (phraseology selection) + the existing scenario
content architecture
**Confidence:** HIGH on everything measured in this repo · MEDIUM on the applied-linguistics
selection criteria (published, cited, not verified against a corpus in this session)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 — depth means more of the same shapes, not new ones.** The user chose volume over new
  exercise types: large idiom and phrasal-verb banks, more reading, more rehearsals, using the
  content types and renderers Phase 3 already built. Rejected: designing new drill components
  (minimal pairs, word stress, intonation, register choice) — more valuable for sounding
  native, but it means building UI rather than writing content; and picking two or three areas
  to do deeply while declaring the rest.
  — **Reversibility:** reversible — content is additive, and new drill shapes can be added later
  without disturbing what this phase writes.

- **D-02 — the honesty mechanism is inherited and must not be weakened.** Coverage is derived
  from bank contents (`scenario-coverage.ts`, `EXERCISE_SOURCES`), so a claim cannot outrun the
  content. Depth must not be asserted anywhere it is not written.

### Claude's Discretion

- How much is "native-level" per scenario — the floor to aim for, given Phase 3's was 6 phrases
  and 8 cards
- Whether depth lands in the existing banks or in new per-scenario modules
- Whether any native scenario should declare a skill it does not declare today (that changes
  the 52-pair total, so it is a real decision — flag it rather than doing it silently)
- Sequencing across the five scenarios

### Deferred Ideas (OUT OF SCOPE)

- **New drill shapes** — minimal pairs, word stress, intonation, register choice. Rejected for
  this phase under D-01, not rejected forever.
- **Premium TTS/STT voice** — VOICE-01, v2 backlog. Pronunciation depth may make the case
  stronger; note it rather than acting on it.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-04 | Sounding Native world delivers native-level content: idioms, phrasal verbs, pronunciation drills, and register/culture | §1 gives the selection criterion that separates native-level from textbook and names the three sources it rests on; §2 says which banks can absorb depth at zero structural cost and which cannot; §6 gives the item and word projection per scenario |

CONT-03 and CONT-05 are **closed on measurement** (`REQUIREMENTS.md:54-55`) and are not
researched here.
</phase_requirements>

---

## Summary

The five Sounding Native scenarios are not uniformly thin. Their **reading passages are already
native-level** — `native/idioms`' "The Committee and the Kitchen"
(`scenario-reading.ts:769-854`) and `native/culture`'s "Everything You Have Missed"
(`scenario-reading.ts:876-...`) each make the learner *recover* an expression from context that
the glossary deliberately withholds, which is the actual skill. `native/register`'s writing task
(`scenario-writing.ts:316-332`) is the strongest prompt in the corpus: the same news written
twice, with a checklist made entirely of *differences*. What is thin is precisely the two
**array-shaped banks** — six phrases and eight cards per scenario — and in one case
(`native/idioms`) the thinness is a selection failure rather than a volume one.

That distinction is the answer to the phase's most important question. `native/idioms` teaches
fourteen expressions (`phrases.ts:316-323`, `scenario-vocabulary.ts:1607-1656`) that are, almost
exactly, Grant's list of "core idioms" — the category corpus linguistics has repeatedly shown to
be the *rarest* multiword phraseology in English. Adding twenty more canonical idioms would make
the bank longer and no more native. What makes material native-level is a **change of selection
criterion**: from *opaque-and-teachable* to *frequency-attested-and-non-transparent*, and from
*expression* to *expression-in-a-sense-in-a-register*.

Structurally, depth is cheap in three banks and expensive in three. `phrases`, `vocabulary` and
`grammar` are arrays behind array-shaped renderers: a new item is one object literal and the
derived coverage summary updates itself. `writing`, `reading` and `speaking` are **one item per
pair** all the way down — `getScenarioWriting` returns a `WritingPrompt | undefined`,
`EXERCISE_SOURCES` wraps it as `items: [prompt]` (`scenario-coverage.ts:174-193`), and
`ScenarioPractice` mounts a single-item renderer (`ScenarioPractice.tsx:83-107`). "More reading"
and "more rehearsals" are therefore **container changes, not content additions** — a fact
CONTEXT's brief does not appear to know, and the single biggest planning consequence in this
document.

The payload is a non-issue and the *session length* is the real ceiling. `scenarioRecallItems`
concatenates phrases and vocabulary into one deck (`review-items.ts:177-213`) and `RecallDeck`
walks it linearly with no batching (`RecallDeck.tsx:34,43,112`), so every card added to a native
scenario is added to one uninterrupted sitting that the curriculum currently advertises at nine
or ten minutes (`curriculum.ts:135-139`).

**Primary recommendation:** put depth in `phrases`, `vocabulary` and `grammar` — the three banks
that grow additively — re-select rather than merely extend `native/idioms`, and treat any
increase in reading or rehearsal *count* as a separate, explicitly-scoped container change that
D-01 does not obviously authorise.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Native-level phraseology (idioms, PVs, register markers, culture terms) | Content bank (`src/lib/content/*.ts`) | — | Every bank is a plain keyed `Record`; nothing about depth is a rendering concern |
| Coverage claims ("18 phrases", "2 passages") | Derivation (`src/lib/scenario-coverage.ts`) | — | D-02: read off `items.length`, never authored |
| SRS id composition | `src/lib/review-items.ts` (`scenarioItemId`) | — | One author of the D-06 format; asserted at the source in three banks (`verify-scenario-content.mts:2298-2310`) |
| Session pacing / deck length | Client renderers (`RecallDeck`, `PronunciationLab`, `GrammarQuiz`) | `curriculum.ts` `minutes` | Volume becomes a UX property here, and only here |
| Persistence of the added ids | `POST /api/progress` + `sync-queue` | Postgres `User.progress` | 1 MiB body cap (`route.ts:36,126-131`); a 413 is a permanent drop (`sync-queue.ts:304-307`) |

---

## 1. What is the honest bar for "native-level"?

*This is the brief's most important question. The answer is a selection criterion, not a number.*

### What `native/idioms` actually holds today

`phrases.ts:316-323` — six phrases: *a piece of cake · call it a day · under the weather · hit
the nail on the head · on the same page · break a leg*.
`scenario-vocabulary.ts:1607-1656` — eight cards: *once in a blue moon · beat around the bush ·
bite the bullet · the last straw · cost an arm and a leg · let the cat out of the bag · on the
ball · a blessing in disguise*.
`scenario-lessons.ts:121-129` — the briefing then re-uses two of the six ("piece of cake",
"under the weather") as its worked examples, so the same canonical list appears on **three
surfaces** of one scenario.

Phase 3's gate called this "the most canonical idiom list in ELT" and flagged it as a Phase 4
item rather than a defect (`03-11-SUMMARY.md:311-319`, ledger entry 44). That verdict is correct
and it is *not* a verdict about quantity.

### Why it is textbook: the frequency evidence

- Grant (2005) searched **104 "core idioms" in the British National Corpus and found that none
  of them is frequent enough to enter the 5,000 most frequent items of English**; normalised
  frequencies cluster around 0.14–0.25 occurrences per million words. *[CITED:
  jbe-platform.com/content/journals/10.1075/ijcl.10.4.03gra — Grant, L. (2005), IJCL 10(4),
  429–451]*
- Grant & Bauer (2004) divide multiword units into **core idioms / figuratives / ONCEs** and argue
  that the canonical ELT idiom list is largely drawn from the rarest of those categories.
  *[CITED: academic.oup.com/applij/article/25/1/38/149076 — Applied Linguistics 25(1), 38–61]*
- Martinez & Schmitt (2012) derived a **PHRASE List of 505 frequent *non-transparent* multiword
  expressions** from the BNC and showed that, folded into the 5,000 most frequent word families,
  they would account for **over 10 % of items**. The frequent non-transparent phraseology of
  English is mundane discourse formulae — not the canonical idiom list. *[CITED:
  academic.oup.com/applij/article-abstract/33/3/299/220807; list PDF at
  lextutor.ca/tests/pvst/martinez_schmitt_2012.pdf]*

Confidence: **MEDIUM**. These are well-known published findings retrieved by web search in this
session; I did not run a corpus query, and I have not opened the PHRASE List itself to confirm
which specific expressions it contains. A planner should treat "use the PHRASE List" as a
*direction*, not as a checked-off inventory. *[ASSUMED]* that the app's target register (British
English, spoken, informal-to-neutral) matches BNC-derived lists closely enough for selection —
plausible given the corpus's existing British lean (*lorry*, *fortnight*, *covering letter*,
*blue badges*), but not verified.

### Six concrete selection criteria for native-level phraseology

These are what would make the bank native-level rather than textbook. They are stated as
criteria so the planner can turn them into per-item authoring rules and, where possible, into
harness assertions.

1. **Frequency-attested, not dictionary-attested.** An expression earns a slot because a native
   speaker would actually produce it this month, not because it appears in idiom dictionaries.
   The four "star" expressions the existing native reading passages already turn on —
   *cross that bridge when we come to it*, *the writing is on the wall*, *clear the air*, *put my
   foot in it* (`scenario-reading.ts:802-852`) — are exactly this class, and they are already in
   this repo, written by this project, and demonstrably better than the phrase set beside them.
   **The bar already exists inside `native/idioms`; it just is not in the phrase bank.**
2. **Non-transparent but decomposable — the class that is teachable AND frequent.** *Take
   something on board*, *give someone the benefit of the doubt*, *at the end of the day*, *not my
   call*, *a fair point*. These are the PHRASE-List class. Fully opaque core idioms (*kick the
   bucket*, *break a leg*) are the rarest and, pedagogically, the least load-bearing.
3. **Register-marked, and the mark is part of the item.** Every native expression carries a
   restriction on who may say it to whom. `native/register`'s deck already does this correctly —
   *slang*: "fine in a text and wrong in a covering letter" (`scenario-vocabulary.ts:1777-1781`).
   The idiom bank does not: its tips are glosses (*"Idiom: algo muy fácil"*,
   `phrases.ts:317`), and one of the six carries no tip at all. **A native-level item's tip says
   who says it, to whom, and what it costs you if you get that wrong.** This is the single
   highest-yield, lowest-cost change available.
4. **Sense-specific, not form-specific.** For phrasal verbs this is decisive. Gardner & Davies
   (2007) found **518,923 phrasal-verb tokens in the BNC, with 20 lexical verbs × 8 particles
   (160 combinations) covering more than half**; 25 PVs cover roughly a third and 100 cover more
   than half. Garnier & Schmitt's **PHaVE List (2015) pairs the 150 most frequent PVs with 280
   dominant meaning senses** — i.e. the pedagogical unit is *verb + particle + sense*, because the
   frequent ones are heavily polysemous. *[CITED:
   onlinelibrary.wiley.com/doi/abs/10.1002/j.1545-7249.2007.tb00062.x;
   journals.sagepub.com/doi/10.1177/1362168814559798]*
   `native/phrasal-verbs` today teaches fourteen PVs at **one sense each**
   (`phrases.ts:331-338`, `scenario-vocabulary.ts:1660-1709`). Its own grammar bank already
   models the fix: `particle-drag-on` teaches *drag on / drag up / drag out* in one explanation
   (`scenario-grammar.ts:281-289`). **The native-level move is to go up in senses, not out in
   verbs.**
5. **What a C1 learner still gets wrong.** This is the discriminating question and it is
   answerable from the corpus itself. At C1 the failures are not comprehension; they are
   production failures of *fit*:
   - **Over-use and mis-placement.** A C1 learner who has learned idioms as a list deploys them
     where a plain sentence belongs. `native/idioms`' own rehearsal already knows this — "Answer
     the question straight first, with no idiom anywhere in that sentence"
     (`scenario-speaking.ts:539-543`) — and its briefing says "Learn a few well rather than many
     badly" (`scenario-lessons.ts:123`). **That advice is in direct tension with a large idiom
     bank, and the plan must reconcile them rather than let volume quietly contradict the
     briefing.**
   - **Register collision.** Producing a formal-register single-word verb in casual speech and a
     phrasal verb in a contract. `native/phrasal-verbs`' `register-put-off`
     (`scenario-grammar.ts:301-310`) is the only item in the world that drills this directly.
   - **The particle, not the verb.** *Make out / make up*, *put off / put out / put up / put down*.
   - **Fixedness.** *Beat around the bush* vs *\*beat round the bushes*; *once in a blue moon* is
     invariable. Nothing in the current bank tests a learner on the *form* of an idiom.
   - **Sarcasm and understatement carried by an ordinary expression** — the Sounding Native
     failure that has no bank at all today (`social/humor` owns some of it).
6. **Original to this project, and it already is.** Phase 3 proved zero cross-scenario reuse and
   0.14 highest same-world phrase similarity in Sounding Native (`03-11-SUMMARY.md:269-281`).
   That property must survive the volume increase — see §5's pitfall on near-duplicates.

### What this means concretely for the bar

> **Native-level is not "more idioms". It is: each item is one a native would produce, tagged
> with the register it belongs to and the sense it carries, and chosen because a C1 learner gets
> that particular thing wrong.**

A useful, checkable proxy: **an item earns its slot if you can write a one-line tip that is not a
translation.** Measured over the current native world, 24 of 30 phrases carry a `tip`; of
`native/idioms`' six, **one** does (`phrases.ts:317,321`), and both are glosses. That ratio is the
textbook-ness, quantified. [VERIFIED: read from the bank in this session]

---

## 2. Where does depth go? — the shape of each bank

### Measured: what the five scenarios hold today

Run in this session with `node --experimental-strip-types` against the committed tree.

| Scenario | Level | Declared skills | Phrases | Vocab | Grammar Q | Reading | Rehearsals | Writing |
|---|---|---|---|---|---|---|---|---|
| `native/idioms` | C1 | speaking + reading | 6 | 8 | — | 1 passage (4 paras, 4 Q, 323 body words) | 1 (3 moves) | — |
| `native/phrasal-verbs` | B2 | grammar + speaking | 6 | 8 | 5 | — | 1 (3 moves) | — |
| `native/pronunciation` | B2 | speaking | 6 | 8 | — | — | 1 (3 moves) | — |
| `native/register` | C1 | writing + speaking | 6 | 8 | — | — | 1 (3 moves) | 1 task |
| `native/culture` | C1 | reading + speaking | 6 | 8 | — | 1 passage (4 paras, 4 Q, 291 body words) | 1 (3 moves) | — |
| **World total** | | **9 declared pairs** | **30** | **40** | **5** | **2** | **5** | **1** |

> ### ⚠️ CONTEXT.md's measured starting point is wrong, and the planner must use these numbers
>
> `04-CONTEXT.md:44-52` states **84 phrases · 81 vocabulary cards · 15 rehearsals** across the five
> native scenarios. The banks hold **30 phrases · 40 vocabulary cards · 5 rehearsals**.
>
> - "15 rehearsals" is **15 *moves***: the speaking bank is `Record<key, ScenarioSpeakingTask>`
>   with exactly one task per key (`scenario-speaking.ts:533-607`) and `moves` is a
>   `readonly [string, string, string]` tuple (`scenario-speaking.ts:77`) — 5 × 3 = 15.
> - I could not reconstruct where 84 and 81 came from; both are close to the world's **total
>   item count** (30+40+5+5+2+1 = 83) but that is a guess and I am flagging it rather than
>   asserting it.
>
> **Consequence:** the phase is roughly **2.5× larger than CONTEXT implies** if the target is
> stated as a multiple of today. Reproduce with `getScenarioPhrases`/`getScenarioVocabulary`
> over `WORLDS`; global totals for cross-checking are **210 phrases · 280 vocabulary cards ·
> 611 reviewable ids · 52/52 pairs written**, which match `03-11-SUMMARY.md:97-108` exactly.
> [VERIFIED: executed against the committed tree, 2026-08-01]

### The banks split cleanly into two classes

**Class A — array-shaped. Depth is free.**

| Bank | Accessor returns | Renderer | Coverage wrapper |
|---|---|---|---|
| phrases | `Phrase[] \| undefined` (`phrases.ts:392-397`) | `PronunciationLab phrases={phrases}` (`ScenarioView.tsx:79`) | counts `.length` directly (`scenario-coverage.ts:122`) |
| vocabulary | `ScenarioVocabCard[] \| undefined` (`scenario-vocabulary.ts:1890-1895`) | `RecallDeck items={recall}` (`ScenarioView.tsx:103`) | `.length` (`scenario-coverage.ts:123-125`) |
| grammar | `GrammarQuestion[] \| undefined` (`scenario-grammar.ts:346-350`) | `GrammarQuiz questions={questions}` (`ScenarioPractice.tsx:76`) | `items: questions, unit: "question"` (`scenario-coverage.ts:167-170`) |

Adding an item to any of these is **one object literal**. Nothing else in the app changes: the
summary string ("5 questions" → "15 questions") is derived, the renderer's `1 / N` counter is
derived, and the id composes itself. The harness floors are `>=` (`MIN_PHRASES = 6`,
`MIN_VOCAB_CARDS = 8` at `verify-scenario-content.mts:205-206`; `MIN_GRAMMAR_QUESTIONS = 5` at
:851), so there is **no upper bound anywhere**.

**Class B — one-item-shaped. Depth is a container change.**

| Bank | Accessor returns | Renderer | Coverage wrapper |
|---|---|---|---|
| writing | `WritingPrompt \| undefined` (`scenario-writing.ts:366-371`) | `WritingDesk prompts={[prompt]}` (`ScenarioPractice.tsx:85`) | `items: [prompt], unit: "task"` (`scenario-coverage.ts:174-177`) |
| reading | `ScenarioPassage \| undefined` (`scenario-reading.ts`) | `PassageReader passage={passage}` (`ScenarioPractice.tsx:95`) | `items: [passage], unit: "passage"` (`:182-185`) |
| speaking | `ScenarioSpeakingTask \| undefined` (`scenario-speaking.ts:644-648`) | `SpeakingTaskPanel task={rehearsal}` (`ScenarioPractice.tsx:106`) | `items: [rehearsal], unit: "rehearsal"` (`:190-193`) |

A second passage or a second rehearsal requires changing the bank's `Record<string, T>` to
`Record<string, T[]>`, the accessor's return type, the `EXERCISE_SOURCES` wrapper, the
`ScenarioPractice` branch, and — for reading and speaking — **inventing a picker that does not
exist**.

**One exception, and it is the cheap one:** `WritingDesk` already takes `prompts: WritingPrompt[]`
and already has a picker that it hides below two prompts (`WritingDesk.tsx:12,15-16,54-59`). So
`native/register` could grow to two or three writing tasks with **no new UI at all** — only the
bank shape, the accessor and one call site. That is the one place in Class B where "more of the
same shape" is genuinely additive.

### Recommendation on placement

**Extend the existing keyed banks. Do not add per-scenario modules.**

- The keying convention (`"world/scenario"`) is stated in every bank header and asserted:
  every key must name a real pair (`verify-scenario-content.mts:212-227`) and every exercise-bank
  key must name a pair that *declares* that skill (`:860`, `:1127`).
- A new module would need its own key-set export, its own harness group, its own
  `EXERCISE_SOURCES` line and its own entry in `AGENTS.md`'s bank list. The registry's own
  comment forbids the near relative of this (`scenario-coverage.ts:33-36`: "Do NOT create an
  empty bank module").
- The banks are large but flat and append-only; `scenario-vocabulary.ts` is already 1,895 lines
  with the five native decks at :1607-1871, contiguous. Growth there is a low-conflict append.

**The one thing that argues for a new module** is the sense-per-phrasal-verb idea from §1.4: a
PHaVE-style entry (verb + particle + 2–3 senses + one example each) does not fit
`ScenarioVocabCard` (`{id, term, es, example}`), and forcing it in means one card per sense with
the verb repeated — which is *not wrong* (it is exactly how PHaVE presents them) but does inflate
the card count. **Flagged as a decision, not resolved here.**

---

## 3. The SRS consequence of volume

### What actually enters `state.srs`

Only **scheduled** kinds. `SCHEDULED_ITEM_KINDS = ["phrase", "vocab", "grammar"]`
(`review-items.ts:97-101`); `writing`, `reading` and `speaking` take ids for uniqueness and
storage-scoping and are deliberately absent from `reviewableIds()` (`review-items.ts:52-75,
264-310`), with the harness asserting the negative.

> **So the three banks that are free to grow are exactly the three that cost payload, and the
> three that cost engineering are exactly the three that cost no payload at all.**

### Measured headroom

Phase 3's saturated measurement (`03-11-SUMMARY.md:101-113`) is the baseline and I reproduced its
inputs:

| | Value | Source |
|---|---|---|
| Reviewable ids today | **611** | `reviewableIds().length`, executed this session [VERIFIED] |
| `srs` + `attempts` over all 611 | 119,352 B (11.4 %) | `03-11-SUMMARY.md:107` |
| Fully saturated `ProgressState` | **143,830 B (13.7 %)** | `03-11-SUMMARY.md:108` |
| Cap | **1,048,576 B** | `route.ts:36`, enforced on declared `content-length` **and** actual bytes (`route.ts:126-131`) |
| A 413 | **permanent drop**, not retried | `sync-queue.ts:304-307` — `status >= 400 && status < 500 → "drop"` |

**Marginal cost of one added scheduled id, measured rather than estimated.** Building the
worst-case state (`box: 5`, a full `AttemptStat` with `topic`, `level`, `tries`, `wrong`,
`resolved`, `lastWrongOption`, `updatedAt`) and inserting one id with a realistic native key and
slug (`native/phrasal-verbs#vocab#a-representative-slug`, 44 chars):

**252 bytes per added scheduled id.** Mean id length across the 611 is 31.7 chars; native keys are
longer than average, so 252 B is a conservative figure. [VERIFIED: executed this session]

### The headroom answer

```
(1,048,576 − 143,830) / 252  ≈  3,590 additional scheduled ids
```

**The Sounding Native world can absorb roughly 3,500 more phrases/cards/questions before the
payload is a concern.** The recommendation in §6 adds **150**. That is 37,800 B, taking the
saturated state from 143,830 B (13.7 %) to about **181,600 B (17.3 %)**.

**Payload is not a constraint on this phase.** It would become one only at ~14× the recommended
volume. Two caveats worth carrying:

- The cap applies to the **whole body** for the `progress` domain; `celpip` is a separate domain
  with its own slot (`sync-queue.ts:66,103,107`), so CELPIP growth does not compete for this
  budget. [VERIFIED]
- `localStorage` is written as one `JSON.stringify` of the same state
  (`progress.ts:36,60-66`); a failed `setItem` returns `false` rather than throwing
  (`progress.ts:59-67`). At ~180 KB against a typical 5 MiB origin quota this is not close.
  [VERIFIED for the code path; the quota figure is *[ASSUMED]* from general browser behaviour.]

### The real ceiling is session length, not bytes

`scenarioRecallItems` returns *phrases then vocabulary as one deck* (`review-items.ts:177-213`).
`RecallDeck` snapshots that deck once and walks it `1 / N` to `N / N` with **no batching, no
pause point and no cap** (`RecallDeck.tsx:34,40,43,103,112`). `PronunciationLab` does the same for
phrases alone (`PronunciationLab.tsx:48,124,165`). `GrammarQuiz` likewise (`GrammarQuiz.tsx:23-24,
98,107`).

| Native scenario deck | Today | At the §6 target |
|---|---|---|
| Cards in one uninterrupted `RecallDeck` sitting | 14 | **42** |
| Phrases in one `PronunciationLab` sitting | 6 | **18** |
| Advertised session length (`curriculum.ts:135-139`) | 9–10 min | unchanged unless edited |

**This is the finding the plan must act on.** Tripling the two recall banks triples a linear,
un-pausable deck against a `~10 min` promise rendered on the page (`ScenarioView.tsx:175`). Three
honest ways out, in increasing cost: (a) raise `minutes` in `curriculum.ts` to match — one line
per scenario, and the number is already displayed so it is not a hidden claim; (b) cap or batch
the deck — a renderer change, arguably within D-01's "no new drill components" because it adds no
drill, but it *is* UI work; (c) aim lower than 3×. **Flagged as a decision, not resolved here.**

### The one-way door, restated with its escape hatch

`AGENTS.md` and `phrases.ts:22-31` are unambiguous: an id must never be renamed or renumbered.
What is **not** widely stated, and matters for fixing `native/idioms`, is that **deletion is
safe**: `resolveReviewItem` returns `undefined` for an id whose content is gone, the stored `srs`
entry stays (the merge cannot delete keys), and the review screen skips it
(`review-items.ts:223-231`). So a canonical idiom judged not worth its slot **can be retired**;
what must never happen is an id being **re-pointed** at different content. Floors still bind:
`MIN_PHRASES = 6` and `MIN_VOCAB_CARDS = 8` (`verify-scenario-content.mts:205-206`) prevent
retirement below the current size. [VERIFIED from source]

---

## 4. The four-of-five rehearsal echo — structural, or an authoring choice?

**Answer: it is an authoring choice, not a structural inevitability — but the shape's constraints
push hard towards it, and one of the five has already escaped.**

The echo, as recorded (`03-11-SUMMARY.md:288-296`, ledger entry 44): four of the five native
rehearsals are *say it, say it again differently, name what changed* —
`idioms` with-then-without (`scenario-speaking.ts:539-543`), `phrasal-verbs` phrasal-then-single-word
(`:554-558`), `pronunciation` three passes (`:569-573`), `register` colleague-then-agency
(`:584-588`). `native/culture` is the exception (`:599-603`): react → ask → give back — three
*different* actions in a sequence, no repetition at all.

### What the shape actually forces

Reading `ScenarioSpeakingTask` (`scenario-speaking.ts:63-80`) and `SpeakingTaskPanel`
(`SpeakingTaskPanel.tsx:35,45-55,84-121`), the binding constraints are:

1. **Exactly three moves.** `readonly [string, string, string]` — a fourth is a compile error, and
   deliberately so (`scenario-speaking.ts:72-77`).
2. **Each move is a tickable checkbox line.** Nothing scores it; the learner ticks, and ticking
   all three awards 15 XP once (`SpeakingTaskPanel.tsx:35,48-55`).
3. **No AI, no microphone, no network** — asserted by the harness against the panel's own source
   (`scenario-speaking.ts:27-31`).
4. **A `success` line the learner can honestly check herself against.**

Constraint 4 is the one that produces the echo. With nothing listening, a self-check must be
*verifiable by the speaker from her own output*. "Did I sound native?" is not; "did the second
version differ from the first in three audible ways?" is. Contrast manufactures an internal
reference, which is why it recurs.

### But it is not the only self-markable device — `native/culture` proves it

`native/culture` is markable by **countable properties of a single performance**: "The question
took under five seconds, nobody explained it twice, and the conversation never stopped for you"
(`scenario-speaking.ts:604-605`). No repetition anywhere. That is an existence proof that the
shape supports at least one other design.

Other self-markable devices that fit `setup + 3 moves + success` unchanged, and add no component:

| Device | Self-check it makes possible | Fits Sounding Native? |
|---|---|---|
| **Constraint / ban** — say it without using X | "You never once used the word *nice*" — binary and audible | idioms: produce the turn with the idiom *banned*, then say what you lost |
| **Count** — use exactly N of a class | "Three phrasal verbs, and you can name all three" | phrasal-verbs |
| **Time / length budget** | "Under twenty seconds"; "one breath" (already used at `:585`) | pronunciation, culture |
| **Predict-then-check** — say what you expect the listener to ask, then say the turn | "The question you predicted was one of the three you left open" | register |
| **Repair** — say it wrong on purpose, catch it, fix it mid-sentence | "You caught it before the end of the sentence" | pronunciation, register |
| **Escalation** — same message to three audiences in a rising register | Three-way, not two-way; the third breaks the binary | register (this is a *variation* of contrast, not an escape from it) |

**Honest verdict:** the echo is *defensible* and was ratified as a stated design decision (ledger
44, waived). It is **not structural** — one of the five already escapes it, and at least four
other self-marking devices fit the existing shape. So D-01 does not force the echo. What D-01
*does* force is that any variety must come from the **wording of the three moves and the success
line**, since the container cannot change.

**Two hard constraints on any attempt to vary them:**

- Ledger 44's explicit instruction to this phase: *"do not make Sounding Native five of five."*
- The harness now asserts **every cross-scenario move pair distinct** — 3,915 pairs today
  (`verify-scenario-content.mts:2277-2296`). A reworded-but-similar move passes byte-identity, so
  the Jaccard + reader pass from Phase 3 remains the only real defence.

**And one caveat on adding rehearsals at all:** a second rehearsal per scenario is a Class-B
container change (§2), *and* `SpeakingTaskPanel`'s no-double-award latch is component-local
`useState` (`SpeakingTaskPanel.tsx:46`), so it does not survive a remount. Five rehearsals × 15 XP
already re-award on every fresh mount; multiplying rehearsals multiplies that. Neither behaviour
has been observed in a browser (ledger 46, checklist item 4c). [VERIFIED from source; **not**
observed running]

---

## 5. Should any native scenario declare a skill it does not declare today?

**Flagged, not decided — as CONTEXT requires.** Two candidates are strong, one scenario is a
warning sign, and two have no obvious gap.

Today's nine native pairs (`curriculum.ts:134-141`):

| Scenario | Declares | Does not declare |
|---|---|---|
| `idioms` | speaking, reading | grammar, writing |
| `phrasal-verbs` | grammar, speaking | reading, writing |
| `pronunciation` | speaking | grammar, reading, writing |
| `register` | writing, speaking | grammar, reading |
| `culture` | reading, speaking | grammar, writing |

### Candidate A — `native/phrasal-verbs` → **reading** (strongest)

Phrasal verbs are where a learner's *reading* breaks, not just her speaking: the particle carries
the meaning and the frequent ones are heavily polysemous (Gardner & Davies; PHaVE). The scenario's
own grammar bank already teaches *make out* vs *make up* through a context that disambiguates
(`scenario-grammar.ts:291-299`) — a passage is the natural home for that at scale, and the
`native/idioms` passage is a working model of exactly this technique (glossary silent on the four
expressions the questions ask the reader to recover, `scenario-reading.ts:761-767`).

### Candidate B — `native/register` → **reading** and/or **grammar**

- **Reading**: the scenario *is* the difference between two registers, and its writing task
  already makes the learner produce both versions (`scenario-writing.ts:320-329`). A passage that
  makes her *identify* the markers before she produces them is the missing receptive half, and
  the deck already names every marker she would look for — contraction, hedge, jargon, stilted,
  pleasantries (`scenario-vocabulary.ts:1769-1818`).
- **Grammar**: register is carried by grammar more than by vocabulary — contractions, the agentless
  passive ("it has been corrected", `phrases.ts:354`), distancing past modals ("I was
  wondering…", cf. `scenario-grammar.ts:250`), hedges. `GrammarQuestion` fits this with no new
  shape, and it would give the world a second grammar-declaring scenario.

### The warning sign — `native/pronunciation`

It declares **one** skill and is the thinnest surface in the world (6 phrases, 8 cards, 1
rehearsal). It is also the scenario where D-01 bites hardest: the drills pronunciation actually
needs — minimal pairs, word stress, intonation — are precisely what was rejected. Its phrase set is
six tongue-twisters, which the vocabulary bank's own comment calls "a legitimate shape for this
scenario and a poor model for anything else" (`scenario-vocabulary.ts:1711-1714`), and its deck is
already *metalanguage* rather than practice. **Volume here buys the least of the five**, and the
phase should say so rather than pad it. This is also where the deferred VOICE-01 case gets
stronger.

There is no honest new declaration for it: reading and writing do not train pronunciation, and a
`GrammarQuestion` about stress placement would be a drill component in a quiz's clothing — which
is the line D-01 draws.

### No obvious gap: `native/idioms`, `native/culture`

Idioms are explicitly informal, and the briefing already warns against them in formal writing
(`scenario-lessons.ts:126`) — declaring writing there would teach the wrong thing. Culture at C1 is
reception plus repair, which reading + speaking already covers.

### What a new declaration costs — measured, so the decision is priced

Adding a skill to `curriculum.ts` changes the derived totals and trips three hard-wired things:

1. **`verify-scenario-content.mts:520-521`** asserts `DECLARED_PAIRS.length === 52` — a literal.
   Adding one pair fails the harness until the number is updated. (`:515-516` asserts 35
   scenarios and is untouched.)
2. **`COVERAGE_TOTALS.pairsTotal`** (`scenario-coverage.ts:233`) moves from 52, and every plan
   from 03-02 onward closes its verify command on that field name.
3. **Ledger entry 34 re-arms.** `WorldView.tsx` renders `SkillPill` with no availability flag, so
   the world page counts *declarations* while the scenario page reads the registry. It is latent
   today only because 52/52 are written; **it becomes a live overclaim the moment a skill is
   declared before its bank entry exists, which is the normal authoring order.** The ledger says
   the fix is three lines and is "Owed to whichever Phase 4 plan first adds a scenario with an
   unwritten pair" (`.planning/WINDOWS.md:51`). [VERIFIED from the ledger]

Authoring cost per new declaration: **~631 words for a passage** or **~239 words for five grammar
questions** (§6 figures).

---

## 6. Authoring cost — measured per-unit rates and a projection

### Per-unit costs, measured over the whole corpus this session

CONTEXT quotes Phase 3's figures (10.6 w/phrase, 10.9 w/card, 157.8 w/passage). Those do not
reproduce corpus-wide; they were presumably measured over one plan's output, or over the English
text only. **Use these instead** — every authored field counted, over all 35 scenarios:

| Unit | n | Total words | **Words / unit** | Breakdown |
|---|---|---|---|---|
| Phrase | 210 | 4,413 | **21.0** | `text` 7.4 + `es` 6.5 + `tip` 7.1 |
| Vocabulary card | 280 | 4,483 | **16.0** | `term` 2.4 + `es` 3.5 + `example` 10.1 |
| Grammar question | 20 | 954 | **47.7** | prompt + 4 options + `explain` |
| Reading passage | 9 | 5,679 | **631.0** | body 247.2 + title + ~3.9 glossary + 4 questions with explanations |
| Speaking rehearsal | 30 | 2,513 | **83.8** | title + setup + 3 moves + success |
| Writing task | 9 | 2,435 | **270.6** | title + task + ~5 checklist lines + model (140–240 w) |

[VERIFIED: executed against the committed tree, 2026-08-01. Word count = whitespace-split
non-empty tokens across every authored string field.]

Note the reading figure: 631 authored words per passage is **4× CONTEXT's 157.8**, and the two
native passages are above average (323 and 291 body words vs the 247 mean). A reading passage is
by a wide margin the most expensive unit in this project.

### Recommended depth target

Given (a) volume is free in Class A and expensive in Class B, (b) payload has ~3,500 ids of
headroom, and (c) the binding constraint is a linear un-pausable deck:

**Raise the Sounding Native floor to 18 phrases and 24 vocabulary cards per scenario (3× Phase
3's), and `native/phrasal-verbs`' grammar set to 15 questions (3×).** Author the added items
against §1's six criteria rather than by extending the existing lists.

| Bank | Per scenario | Added items | Words / unit | **Added words** |
|---|---|---|---|---|
| Phrases | 6 → 18 | 5 × 12 = **60** | 21.0 | **1,260** |
| Vocabulary | 8 → 24 | 5 × 16 = **80** | 16.0 | **1,280** |
| Grammar (`phrasal-verbs` only) | 5 → 15 | **10** | 47.7 | **477** |
| **Total (Class A only)** | | **150 items** | | **≈ 3,020 words** |

- SRS: +150 scheduled ids × 252 B = **+37,800 B**; saturated state ≈ **181,600 B / 17.3 %**.
- Harness: the D-01 fingerprint groups grow; cross-scenario move/paragraph pair loops are O(n²)
  but tiny at this scale (31 paragraphs → 426 pairs today).
- Session length: 42-card decks — **see §3's flag**.

**Optional Class-B additions, priced separately so they can be cut cleanly:**

| Addition | Structural cost | Words |
|---|---|---|
| `native/register` → 2nd/3rd writing task | Bank shape + accessor + 1 call site. **No new UI** (`WritingDesk.tsx:54-59`) | 271 each |
| `native/phrasal-verbs` declares reading | `curriculum.ts` + pair-count literals + ledger 34 | **631** |
| `native/register` declares reading | same | **631** |
| `native/register` declares grammar | same | **239** (5 × 47.7) |
| 2nd rehearsal anywhere | `Record<key, T>` → `Record<key, T[]>` + a picker that does not exist | 84 each |
| 2nd passage anywhere | same, plus a picker | 631 each |

### Which of the five is dearest

**`native/idioms` is the dearest — and not because of volume.** It is the only scenario where the
existing content must be **re-selected rather than extended**. Its fourteen items are the core-idiom
class §1 shows to be the rarest phraseology in English; its briefing repeats two of them
(`scenario-lessons.ts:121-129`); and its own briefing advice — "Learn a few well rather than many
badly" — is in tension with a large bank. Fixing it means (a) new selection criteria applied item
by item, (b) rewriting the tips from glosses into register-and-use notes (only 1 of its 6 phrases
carries a tip today), (c) a decision about retiring canonical items whose ids are already live,
and (d) editing the briefing so three surfaces stop agreeing. Word count alone (12 phrases + 16
cards ≈ 508 words) badly understates it; the *judgement* per item is the cost.

**Runners-up, in order:**

2. **`native/culture`** — dearest in raw words if it grows receptively. Every item must be
   *insured by its context* (the technique its passage already uses, `scenario-reading.ts:864-871`)
   and every reference dates, so items have a shelf life the other four do not.
3. **`native/register`** — most *productive* words (writing tasks at 271 each, plus paired-contrast
   phrases that must be authored two at a time, `phrases.ts:347-357`), but the highest-yield per
   word: it has the clearest missing declarations and the cheapest Class-B path.
4. **`native/phrasal-verbs`** — the most *mechanical* and the best-specified: PHaVE gives a
   ready-made frequency ordering, and its grammar bank is the only Class-A exercise bank in the
   world, so it can absorb depth in three banks at once.
5. **`native/pronunciation`** — cheapest in words and **lowest value per word**. Its phrase slot is
   tongue-twisters (a shape the repo already calls a poor model) and its deck is metalanguage.
   Under D-01 there is little honest depth to add here. **Recommend it be the smallest of the five
   and that the phase say so, rather than padding it to a uniform floor.**

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Composing an SRS id | A template string anywhere in a bank | `scenarioItemId` (`review-items.ts:119-125`) | One author of the D-06 format; asserted at the source in three banks (`verify-scenario-content.mts:2298-2310`) and mutation-proved (M-C/D/E) |
| Reading a scenario's phrases | Any lenient/fallback accessor | `getScenarioPhrases` + `?? []` at the call site | The lenient one was deleted at 03-11; the harness asserts the module exports no lenient accessor and no per-world fallback (`phrases.ts:1-20`) |
| Claiming what a scenario offers | A hand-written count or availability flag | `getScenarioCoverage` / `COVERAGE_TOTALS` | D-02; a bank that exists but is empty must still report unwritten (`scenario-coverage.ts:127-138`) |
| A per-scenario writing picker | A new component | `WritingDesk prompts={[...]}` | Already takes an array and hides its picker below two (`WritingDesk.tsx:12,54-59`) |
| Selecting which idioms/PVs to teach | Intuition or a dictionary list | Frequency-ordered published lists (§1) | Grant (2005): the canonical list is the rarest class |
| Detecting near-duplicate content | Only the harness | Harness **+** exact/Jaccard scan **+** a reader pass | The harness asserts byte-identity; a lazy paraphrase passes everything (`03-11-SUMMARY.md:242-246`) |

---

## Common Pitfalls

### Pitfall 1: Volume without re-selection — "more canonical idioms"
**What goes wrong:** the bank triples and reads exactly as textbook as before.
**Why:** the defect Phase 3 flagged was a *quality* verdict (`03-11-SUMMARY.md:311-319`); volume is
orthogonal to it.
**Avoid:** apply §1's criteria per item. **Warning sign:** a tip that is a translation.

### Pitfall 2: Treating "more reading / more rehearsals" as content work
**What goes wrong:** a plan task says "add a second passage" and discovers mid-execution that the
accessor, the coverage wrapper, the renderer and a picker all have to change.
**Why:** `EXERCISE_SOURCES` wraps single objects as `items: [x]` (`scenario-coverage.ts:174-193`).
**Avoid:** classify every intended addition as Class A or Class B (§2) *before* estimating.

### Pitfall 3: A declared skill landing before its bank entry
**What goes wrong:** `/world/native` shows a solid SkillPill for practice that does not exist —
a live overclaim, i.e. the exact failure D-02 exists to prevent.
**Why:** `WorldView.tsx` counts declarations, not coverage (ledger 34, `.planning/WINDOWS.md:51`).
**Avoid:** write the bank entry in the same change as the declaration, or fix the three lines
first. **Warning sign:** `pendingPairs()` non-empty.

### Pitfall 4: Authoring fatigue producing near-duplicates
**What goes wrong:** item 40 of a 24-card deck is item 12 with the nouns changed.
**Why:** this is the *named residual risk of every content phase in this project*
(`04-CONTEXT.md:118-120`), and the risk rises with volume. The harness catches byte-identity only.
**Avoid:** Phase 3's mitigation — exact + Jaccard scans plus a reader pass — carried forward.
**Baselines to beat:** Sounding Native's highest same-world phrase similarity is **0.14** and its
vocabulary terms share **0.00** (`03-11-SUMMARY.md:269-281`).

### Pitfall 5: Renumbering or re-pointing an id
**What goes wrong:** somebody's box-4 schedule silently re-points at a different expression, with
no migration path and no way to detect it afterwards.
**Why:** `mergeProgress` unions `srs` keys blindly (`phrases.ts:22-31`, `AGENTS.md`).
**Avoid:** insert freely; never renumber. **Deletion is safe** (§3) — re-pointing is not.

### Pitfall 6: A 42-card deck against a "~10 min" promise
**What goes wrong:** the learner abandons mid-deck; `RecallDeck` snapshots on mount
(`RecallDeck.tsx:34`) and there is no resume.
**Avoid:** decide (a), (b) or (c) from §3 explicitly. **Warning sign:** `minutes` unchanged in
`curriculum.ts` after the banks triple.

### Pitfall 7: A mutation sweep poisoning `.next`
Inherited from `AGENTS.md` and 03-08. Sweeps restore source byte-for-byte, `git status` comes back
clean, and the build keeps the mutation. **Run sweeps in a worktree or scratch copy with its own
`node_modules`; rebuild from the committed tree before making any claim from a build.**

---

## Code Examples

### Adding a phrase (Class A — the whole change)

```ts
// src/lib/content/phrases.ts — inside SETS["native/idioms"]
// Slug is authored, unique within the scenario, never an array position, and
// NEVER renamed once shipped (phrases.ts:22-31).
{
  id: "take-it-on-board",
  text: "I'll take that on board.",
  es: "Lo tendré en cuenta.",
  // A native-level tip is not a translation: it says who says it, to whom,
  // and what it costs to get that wrong (§1, criterion 3).
  tip: "Concede sin prometer nada. En una reunión suena receptivo; a un cliente enfadado suena a evasiva.",
},
```
Nothing else changes: `scenarioItemId` composes the stored id on the way out
(`review-items.ts:186-196`), the coverage summary is derived (`scenario-coverage.ts:122`), and
`PronunciationLab`'s `1 / N` follows.

### Attaching a skill bank (the one-line rule, for reference)

```ts
// src/lib/scenario-coverage.ts — EXERCISE_SOURCES (:165-194)
grammar: (w, s) => {
  const questions = getScenarioGrammar(w, s);
  return questions && { items: questions, unit: "question" };
},
```
Note `items: questions` (array, grows) versus `items: [passage]` (`:182-185`, fixed at one).
**That single character is the whole Class-A/Class-B distinction.**

### The `reviewableIds` rule, before touching it

```ts
// src/lib/review-items.ts:294-310 — only banks whose renderer calls
// recordAttempt belong here. GrammarQuiz does; WritingDesk, PassageReader and
// SpeakingTaskPanel do not. Adding an unscored bank puts a permanent phantom
// in the "Due today" count.
```
Phrases, vocabulary and grammar are already sourced. **This phase should not need to touch this
function at all** — if a plan proposes to, that is a signal it has drifted into a new item type.

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **Next.js 16 is not the one in training data** — read `node_modules/next/dist/docs/` before
  writing framework code. *(Not expected to bind: this phase is content-only.)*
- **GSD is the workflow**; state lives in `.planning/`.
- **`getScenarioPhrases` is the ONE phrase accessor and it is strict.** A new scenario without its
  own phrase set FAILS the harness.
- **An SRS id is a one-way door.** Insert freely; never renumber.
- **Scheduled vs unscheduled is deliberate:** phrases, vocabulary and scenario grammar are
  scheduled; writing, reading and speaking are not.
- **Coverage is derived from bank contents, never hand-written.**
- **The gate:** `node --experimental-strip-types scripts/verify-scenario-content.mts` — 11,981
  assertions. If it fails, fix the content; never weaken the assertion.
- **A mutation sweep can poison a `.next` build that outlives it.**
- **No new dependencies** — the gate asserts exactly 11 + 11.

---

## Runtime State Inventory

Included because this phase touches ids that are live keys in stored learner data.

| Category | Items found | Action required |
|---|---|---|
| **Stored data** | `User.progress.srs` and `.attempts` in Postgres are keyed by composed ids (`world/scenario#kind#slug`). **Inserting** new ids needs no migration — `mergeProgress` unions keys blindly. **Retiring** an item leaves an orphan key that `resolveReviewItem` skips (`review-items.ts:223-231`) — harmless, no migration. **Renaming** an id is unrecoverable. | Code edit only; **no data migration** — provided no id is renamed or re-pointed |
| **Live service config** | None — no external service holds scenario content or ids. Verified: no n8n/Datadog/Cloudflare surface in this repo. | None |
| **OS-registered state** | None. | None |
| **Secrets / env vars** | None touched. `ANTHROPIC_API_KEY` is Phase 5's. | None |
| **Build artifacts** | `.next` — rebuild from the committed tree before making any claim from a build (`AGENTS.md`, 03-08). Client `localStorage` key `fluentpath:progress:v2` is a **cache**, reconciled on load; new ids appear without invalidation. | Rebuild `.next`; no cache invalidation needed |

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node with `--experimental-strip-types` | every `scripts/verify-*.mts` | ✓ | v22.14.0 | — |
| npm dependency count | the 11 + 11 gate | ✓ | 11 prod / 11 dev | — |
| `next build` / `next start` | browser verification | ✓ (unrun this session) | Next 16 | — |
| A browser driver | the human browser pass | ✗ | — | Coordinator-run pass, as in 03-11 |
| A phone | ledger 46's phone pass | ✗ | — | Still owed project-wide; not this phase's to close |

No dependency is missing that blocks the content work.

---

## Validation Architecture

### Test framework

| Property | Value |
|---|---|
| Framework | **None** — no jest/vitest/playwright in `package.json`. Verification is bespoke assertion scripts under `scripts/`, run directly by Node |
| Config file | none — each script is self-contained |
| Quick run | `node --experimental-strip-types scripts/verify-scenario-content.mts` |
| Full suite | the eight `verify-*.mts` scripts + `npx tsc --noEmit` + `npm run lint` + `npm run build` |

### Requirements → test map

| Req | Behaviour | Type | Automated command | Exists? |
|---|---|---|---|---|
| CONT-04 | Every native bank meets its floor and no field is blank | unit | `node --experimental-strip-types scripts/verify-scenario-content.mts` | ✅ (`:229-271`) |
| CONT-04 | No two scenarios handed the same material | unit | same | ✅ (`:483-510`, `:2255-2296`) |
| CONT-04 | Every added id is composed, unique, and round-trips | unit | same | ✅ (`:308-395`) |
| CONT-04 | Coverage reports the bank, not the declaration | unit | same | ✅ (`:644-849`) |
| CONT-04 | The saturated payload stays under 1 MiB | unit | append a group asserting `reviewableIds()` × worst-case entry < cap | ❌ **Wave 0** — 03-11 measured it by hand; nothing gates it |
| CONT-04 | Native-level *selection* (frequency, register, sense) | **manual** | reader pass | ❌ not automatable — this is the phase's irreducible human gate |
| CONT-04 | Deck length vs advertised `minutes` | unit | assert `scenarioRecallItems(...).length` against a per-level ceiling, or against `minutes` | ❌ **Wave 0** if §3's option (a) or (c) is taken |

### Sampling rate

- **Per task commit:** `verify-scenario-content.mts` + `npx tsc --noEmit`
- **Per wave merge:** all eight `verify-*.mts` + `lint` + `build`, baselines held
  (`verify-scenario-content` ≥ 11,981; `verify-merge` 25,647; `verify-schema` 309;
  `verify-queue` 173; `verify-headers` 24; the three CELPIP scripts 43/648/50; deps **11 + 11**)
- **Phase gate:** full suite green, `pendingPairs()` empty, plus a coordinator browser pass

### Wave 0 gaps

- [ ] A committed payload assertion (the 143,830 B / 13.7 % figure is currently a summary line, not a gate)
- [ ] A deck-length assertion, **if** §3's decision requires one
- [ ] Update `DECLARED_PAIRS.length === 52` (`:521`), **if** §5's decision adds a pair
- [ ] Fix ledger 34 (`WorldView.tsx`, three lines), **if** §5's decision adds a pair

---

## Package Legitimacy Audit

**No packages are installed by this phase.** CONTEXT and `AGENTS.md` both forbid new dependencies,
and the gate asserts exactly **11 production + 11 dev**, confirmed this session by reading
`package.json`. [VERIFIED: `Object.keys(dependencies).length === 11 && Object.keys(devDependencies).length === 11`]

**Packages removed due to [SLOP]:** none — none proposed.
**Packages flagged [SUS]:** none.

---

## Security Domain

Content-only phase: no new network surface, no auth path, no schema change, no file access in
shipped code — the same disposition Phase 3 recorded (`03-11-SUMMARY.md:526-549`).

| ASVS category | Applies | Standard control |
|---|---|---|
| V2 Authentication | no | unchanged |
| V3 Session Management | no | unchanged |
| V4 Access Control | no | unchanged |
| V5 Input Validation | **yes** (indirectly) | `progressSchema` / `srsItemSchema` strip unknown fields (`progress-schema.ts:451,488`); new ids widen the key space the sanitised record accepts. `verify-schema` (309) and `verify-merge` (25,647) must hold |
| V6 Cryptography | no | unchanged |

| Threat | STRIDE | Mitigation |
|---|---|---|
| A saturated `ProgressState` exceeding the 1 MiB cap → **silent permanent loss** of a snapshot | Denial of Service | §3's headroom (~3,590 spare ids); the recommendation uses ~4 % of it. Should be a committed gate — Wave 0 |
| Prototype pollution at a widened key space | Tampering | `sanitizedRecord` (`progress-schema.ts:488`); baselines must not fall |
| A coverage claim outrunning the banks | Repudiation | D-02 derivation, re-proved against full banks at 03-11 |
| Authored content leaking into page HTML | Information Disclosure | Coverage summaries are a **count and a unit only** — never a line of content (`scenario-coverage.ts:38-42`) |

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | BNC/COCA-derived frequency lists match this app's target variety closely enough to drive selection | §1 | Items chosen as "frequent" may be frequent in the wrong variety or register |
| A2 | The specific contents of the PHRASE List and PHaVE List are as summarised; I did not open either list | §1, §6 | A plan that says "take the top 25 from PHaVE" may find a different ordering than expected — **verify before locking a specific item list** |
| A3 | localStorage quota ≈ 5 MiB per origin | §3 | Only matters at ~30× the recommended volume |
| A4 | CONTEXT's 84/81 figures came from a mis-scoped count; I could not reconstruct their origin | §2 | If they were measured against something real that I did not find, the baseline is wrong again |
| A5 | Phase 3's per-unit word rates (10.6 / 10.9 / 157.8) were measured over a subset or English-only; my corpus-wide rates supersede them | §6 | A projection built on the older rates underestimates by ~2× on phrases/cards and ~4× on passages |
| A6 | "Native-level" means British-leaning informal-to-neutral spoken English, consistent with the existing corpus | §1 | An American-target learner would want a different selection |

---

## Open Questions

1. **How much is enough per scenario?**
   Known: the floors are `>=` and unbounded; payload has ~3,590 ids of headroom.
   Unclear: what a learner will actually sit through in one un-batched deck.
   Recommendation: 3× (18/24), **and** an explicit decision on §3's (a)/(b)/(c).

2. **Do any new declarations happen in this phase?**
   Known: two strong candidates (`phrasal-verbs` → reading; `register` → reading and/or grammar),
   priced in §5–6, with three hard-wired consequences.
   Recommendation: **decide before planning**; it changes the 52, the harness literal and ledger 34.

3. **How is `native/idioms` fixed — extend, re-select, or retire?**
   Known: retiring an id is safe; re-pointing is not; floors bind at 6/8.
   Unclear: whether the user wants the canonical items kept as a beginner layer or removed.
   Recommendation: bring this to the user — it is the phase's headline quality decision.

4. **Does D-01 permit a deck-batching change?**
   Known: it adds no drill component, so arguably yes; but it is UI work, which is what D-01
   traded away.
   Recommendation: ask, rather than assume either way.

5. **Should `native/pronunciation` be deliberately smaller than the other four?**
   Known: it has the least honest depth available under D-01 (§6).
   Recommendation: yes, and say so in the phase's own record — with a note that this strengthens
   the deferred VOICE-01 case.

6. **Is `SpeakingTaskPanel`'s XP latch per-mount?**
   `awarded` is component-local `useState` (`SpeakingTaskPanel.tsx:46`), so the no-double-award
   property appears to hold within a mount only. Never observed in a browser (ledger 46, item 4c).
   **Flagged as unverified**, not asserted; it becomes more visible if rehearsals multiply.

---

## State of the Art

| Old approach | Current approach | When changed | Impact |
|---|---|---|---|
| Idiom lists from dictionaries and intuition | Frequency-ordered, corpus-derived lists of *non-transparent* MWEs | Grant & Bauer 2004 → Grant 2005 → Martinez & Schmitt 2012 | The canonical ELT idiom list is the rarest class; selection criterion changes |
| Phrasal verbs taught as verb + particle | Taught as verb + particle + **dominant sense** | Gardner & Davies 2007 → PHaVE 2015 | 150 PVs carry 280 senses; the sense is the unit |
| Per-world phrase fallback | One strict accessor + a harness assertion | 03-11 (`c0e9a79`) | A scenario without its own phrases now fails at authoring time |
| Hand-written coverage claims | Derived from `items.length` | 03-01 | A claim cannot outrun the content |

**Deprecated / outdated in this repo:** `getPhrases` and `WORLD_FALLBACK` — deleted at 03-11; the
harness asserts the module exports no lenient accessor.

---

## Sources

### Primary (HIGH confidence — read or executed in this session)
- `src/lib/curriculum.ts:130-141` · `src/lib/content/phrases.ts` (whole) ·
  `scenario-vocabulary.ts:1596-1895` · `scenario-speaking.ts:1-90, 520-648` ·
  `scenario-reading.ts:1-120, 750-905` · `scenario-grammar.ts:1-120, 250-350` ·
  `scenario-writing.ts:300-377` · `scenario-lessons.ts:110-155`
- `src/lib/scenario-coverage.ts` (whole) · `src/lib/review-items.ts` (whole)
- `src/components/practice/ScenarioPractice.tsx` (whole) · `RecallDeck.tsx` · `PronunciationLab.tsx`
  · `GrammarQuiz.tsx` · `WritingDesk.tsx` · `SpeakingTaskPanel.tsx` · `src/components/ScenarioView.tsx`
- `scripts/verify-scenario-content.mts:116-530, 851, 1114-1400, 2255-2320`
- `src/app/api/progress/route.ts:25-50, 126-131` · `src/lib/sync-queue.ts:66-107, 300-310, 420-430`
  · `src/lib/progress.ts:20-90, 300-345`
- `.planning/phases/03-every-scenario-practicable/03-11-SUMMARY.md` ·
  `.planning/WINDOWS.md` entries 34, 43, 44 · `.planning/REQUIREMENTS.md:54-55` ·
  `.planning/ROADMAP.md:221-250` · `AGENTS.md`
- Executed measurements: item counts, per-unit word costs, `reviewableIds().length`,
  `COVERAGE_TOTALS`, and the 252 B/id marginal payload figure

### Secondary (MEDIUM confidence — web search, published and cited, not corpus-verified here)
- Grant, L. & Bauer, L. (2004). *Criteria for Re-defining Idioms: Are we Barking up the Wrong Tree?*
  Applied Linguistics 25(1), 38–61 — https://academic.oup.com/applij/article/25/1/38/149076
- Grant, L. (2005). *Frequency of 'core idioms' in the British National Corpus.* IJCL 10(4), 429–451
  — https://www.jbe-platform.com/content/journals/10.1075/ijcl.10.4.03gra
- Martinez, R. & Schmitt, N. (2012). *A Phrasal Expressions List.* Applied Linguistics 33(3), 299–320
  — https://academic.oup.com/applij/article-abstract/33/3/299/220807 ·
  list PDF https://www.lextutor.ca/tests/pvst/martinez_schmitt_2012.pdf
- Gardner, D. & Davies, M. (2007). *Pointing Out Frequent Phrasal Verbs: A Corpus-Based Analysis.*
  TESOL Quarterly — https://onlinelibrary.wiley.com/doi/abs/10.1002/j.1545-7249.2007.tb00062.x
- Garnier, M. & Schmitt, N. (2015). *The PHaVE List.* Language Teaching Research —
  https://journals.sagepub.com/doi/10.1177/1362168814559798

### Tertiary (LOW confidence)
- None relied on.

---

## Metadata

**Confidence breakdown:**
- Existing content, bank shapes, renderers, harness: **HIGH** — read at file:line and executed
- Item counts, per-unit costs, payload arithmetic: **HIGH** — executed against the committed tree
- Native-level selection criteria: **MEDIUM** — published and cited; not corpus-verified in session,
  and the specific list contents are unopened (A2)
- The rehearsal-echo verdict: **HIGH** on the structural analysis (source-read), **MEDIUM** on the
  proposed alternative devices (design judgement)
- The new-declaration candidates: **MEDIUM** — pedagogical judgement, deliberately flagged not decided

**Research date:** 2026-08-01
**Valid until:** 2026-08-31 for the applied-linguistics findings (stable literature); **invalid the
moment any native bank is edited** for every measured number in §2, §3 and §6 — each is
reproducible with the commands named there.
