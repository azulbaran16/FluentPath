---
phase: 04-native-level-depth
plan: 06
subsystem: scenario-content
tags: [content, culture, srs, harness, gate, shelf-life, additions-only]
status: complete

requires:
  - "04-01's id-stability gate + fixture — 28 additions regenerated into it in the same commits, zero retirements"
  - "04-01's session-length invariant — native/culture's minutes raised under it twice, not around it"
  - "04-01's recall-batches contract — the 42-card deck inherits batching with no change to the renderer"
  - "04-03's cross-surface withholding gate for native/idioms — the pattern this plan extends to a passage that glosses one of its four on purpose"
  - "04-04/04-05's rule that a surviving mutation is the mutation's fault first — applied twice here, correctly both times"
provides:
  - "the shelf-life gate for native/culture: no four-digit year in either bank, and neither bank names what the passage withholds"
  - "a withheld record carrying a `glossed` flag, with the exception asserted IN THE POSITIVE so it cannot be widened to silence a second failure"
  - "18 repair phrases across three axes (room, speed, direction) and a 24-card deck of reference machinery, none of it dated"
  - "a corrected corpus harvester: 04-05's dropped reading BODIES, GLOSSARIES and QUESTION PROMPTS — 4,284 fields scanned against 3,744"
affects:
  - "04-07 … 04-09: native/pronunciation is the only one of the five still at Phase 3 floors"
  - "anyone tempted to add irony, sarcasm, deadpan or understatement to native/culture — social/humor already teaches all four, and the deck header says so"

tech-stack:
  added: []
  patterns:
    - "asserting a DELIBERATE EXCEPTION in the positive: the one reference the passage glosses on purpose must really be glossed, so the flag cannot be flipped to silence an inconvenient check"
    - "gating the one shelf-life marker a script can see (a year) and SAYING PLAINLY that it is not a proxy for the rule — a gate implying more coverage than it has is worse than none"
    - "fixing the corpus harvester before trusting it: three whole populations were silently absent from the prior plan's scan because a `typeof text === 'string'` guard skipped string[] bodies"
    - "measuring a reader-pass finding before acting on it, and declining to act when the number says 0.10 and the fix would cost a changed hash"

key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - src/lib/curriculum.ts
    - scripts/verify-scenario-content.mts
    - scripts/fixtures/scheduled-item-ids.json

decisions:
  - "THE PLAN'S SUCCESS CRITERION 3 IS UNMET, DELIBERATELY. It asks for irony, sarcasm and deadpan 'taught somewhere in this world for the first time', on the plan's belief that they have no bank today. They do: `social/humor` is titled 'Humor & sarcasm', holds `deadpan`, `understatement` and `tongue-in-cheek` as cards, drills sarcasm in its briefing intro AND tip[0] AND a warm-up phrase, and advertises irony in its own blurb. Authoring any of them here is the D-01 duplication 04-05 killed `understatement` for. Not written; reported instead."
  - "`take something at face value` is the ONE card in that territory, and it earns its place by naming the CONSEQUENCE of missing a tone (you heard the literal sentence) rather than the tone itself — which is culture's machinery and not humour's unit."
  - "The withheld record carries a `glossed` flag because this passage is NOT the idioms passage: it withholds three of its four references and glosses the fourth on purpose, since the question about `our white elephant` turns on the possessive rather than the phrase. The glossary-silence check runs on the three; the exception is asserted in the POSITIVE on the fourth; and the BANK check runs on all four regardless. A negative mutation confirmed the exception is load-bearing."
  - "SIX candidates were killed by the pre-authoring scan and FOUR of them the plan had named — deadpan, sarcasm, irony and 'a pointed understatement'. Plus `a set-up` (native/phrasal-verbs teaches `set up`) and `a shared complaint` (social/humor's reading passage IS the national-grievance essay, glossary and all). Naming something in a plan still does not make it free; this is the fifth consecutive plan where that held."
  - "04-05's corpus harvester silently dropped every reading passage BODY, every GLOSSARY and every reading QUESTION PROMPT, because its `push` guard required `typeof text === 'string'` and `body` is `string[]`. Rebuilt: 4,284 fields against 3,744. Every scan in this plan therefore covered surfaces no prior plan's scan reached — including native/culture's own letter home, which is precisely the text this scenario's banks must not collide with."
  - "Five shared frames found in the final reader pass against the EXISTING eight cards were measured at J = 0.094–0.129 and KEPT. Clearing them would mean editing a field behind an id committed forty minutes earlier — a changed hash — and a 0.10 overlap does not buy a one-way door. Reported with the numbers rather than silently ignored."
  - "NO id was retired and none re-pointed. Zero one-way-door decisions were put to the user; this is the second consecutive plan needing none, because native/culture's six phrases and eight cards are correct and depth here is pure addition."

metrics:
  duration: "~65 min"
  completed: 2026-08-04
  tasks: 2
  commits: 2
  harness_assertions: 14325
  harness_baseline: 13832
---

# Phase 4 Plan 06: Depth That Does Not Date Summary

`native/culture` now teaches eighteen repairs and twenty-four cards, and **not one item's
meaning depends on a film, a song, a programme, an advert, a person or a year.** The scenario
whose content could rot silently is the one scenario in the app with a gate against it — as far
as a gate can reach, which this summary states rather than implies.

## What shipped

| | Before | After |
|---|---|---|
| `native/culture` phrases | 6 | **18** |
| `native/culture` cards | 8 | **24** |
| Advertised `minutes` | 10 | **17** |
| `verify-scenario-content` assertions | 13,832 | **14,325** |
| Scheduled ids under a committed hash | 604 (+15 retired) | **632 (+15 retired — unchanged)** |
| `verify-id-stability` assertions | 1,875 | **1,959** |
| Ids retired by this plan | — | **zero** |
| Ids re-pointed by this plan | — | **zero** |

## The eighteen repairs — three axes (`7e33d72`)

The six Phase 3 entries were not touched, in any field. The twelve additions widen the
repertoire along the axes the plan named, and the **tip carries the room** so the line itself
can stay short and natural.

**The room** — the same admission, priced differently in four places:

| Slug | Line | The room |
|---|---|---|
| `got-the-tone-not-the-reference` | *"I got the tone but not the reference — keep going, I'll catch up."* | a meeting, where stopping the room costs money; it admits and hands the turn back in one breath |
| `give-me-that-one-again` | *"Sorry — you'll have to give me that one again."* | a call: nobody can read your face, so confusion said silently does not exist |
| `scrolled-back-twice` | *"I've scrolled back twice and I still don't get it."* | a group chat, where the moment has gone and showing you tried is what stops it sounding lazy |
| `new-one-on-me` | *"That's a new one on me."* | someone senior who assumed you would get it — flat, no apology, no joke, done in three seconds |

**The speed** — invisible, open, delayed, and the one that arrives late:

| Slug | Line | The speed |
|---|---|---|
| `whatever-thats-from` | *"Whatever that's from, you're right about the second half."* | invisible: you answer the point, not the reference, and nothing stops. The cost is that you never find out |
| `what-am-i-missing` | *"Go on then — what am I missing?"* | open and instant, with people who owe you the answer |
| `go-back-a-second` | *"Actually, go back a second — what was the thing you said before?"* | delayed on purpose: the table has moved on, so nobody re-tells a joke to one person |
| `ten-seconds-behind` | *"Don't mind me — I'm always about ten seconds behind."* | the late catch, said afterwards and about yourself |

**The other direction** — she is not only the person who misses one:

| Slug | Line | The direction |
|---|---|---|
| `doesnt-travel` | *"Sorry, that doesn't travel — it only works where I'm from."* | **hers** lands on nobody, and naming it untranslatable beats explaining it |
| `i-got-it-even-if-nobody-else-did` | *"I got it, even if nobody else did."* | **somebody else's** died and she was the only one who had it |
| `same-job-back-home` | *"We've got one that does the same job back home."* | the gap turned into an exchange |
| `held-everybody-up-enough` | *"Right, sorted — I've held everybody up enough."* | closing the repair, so the table does not spend another minute on her |

Every one of the twelve carries a use note saying who it works with, when it sounds like an
excuse, and what it costs in the wrong room. None translates its line.

## The deck — twenty-four cards of machinery (`9a534cb`)

Four strands. Phase 3's eight (`catchphrase`, `household-name`, `in-joke`, `name-drop`,
`mainstream`, `niche`, `dated`, `go-viral`) untouched:

- **What kind of thing it is (5 new)** — `a running gag` · `a nickname that stuck` ·
  `a euphemism` · `an aside` · `a well-worn line`. The taxonomy, so she can say *which* sort
  of thing went past rather than only that something did.
- **What it does to the room (5)** — `be lost on someone` · `shorthand for something` ·
  `allude to something` · `common currency` · `the uninitiated`. The social work a reference
  performs, which is the half a dictionary never gives.
- **Time (2 new, beside Phase 3's `dated` and `go viral`)** — `topical` ·
  `date someone (a reference that dates you)`. The scenario's own design constraint made
  teachable rather than merely obeyed.
- **Catching and not catching (4)** — `the penny drops` · `fill someone in` ·
  `take something at face value` · `a callback`. What happens in the seconds after.

**Every `example` insures its own term by context**, which is this scenario's signature
technique — the same one its passage uses on the references it drops — and the reason its cards
run longer than any other deck's. `ScenarioVocabCard` stays `{id, term, es, example}`: no new
item type (D-01).

Where no clean Spanish equivalent exists the `es` says what the thing *is* rather than
pretending one does: `the uninitiated` → *"los que no están en el ajo, los que aún no conocen
el asunto"*; `a well-worn line` → *"una frase tan repetida que cualquiera de los presentes
podría terminarla"*.

## The plan's criterion 3 is UNMET, and that is the finding

> *"Irony, sarcasm and deadpan are taught somewhere in this world for the first time."*

The plan believed these were "the Sounding Native failure with no bank of its own today". The
pre-authoring scan says otherwise, and it is not close:

| Candidate | Killed by |
|---|---|
| `deadpan` | `social/humor#vocab#deadpan` — same word, same card shape, example *"Her delivery is so deadpan that half the room misses the joke."* |
| `sarcasm` | `social/humor` is **titled** "Humor & sarcasm"; its briefing intro and `tip[0]` both teach it, and `social/humor#phrase#assume-that-was-sarcasm` is a live warm-up line |
| `irony` | `social/humor`'s own blurb — *"Get the joke and make one — read tone and irony"* — plus `tongue-in-cheek` glossed *"en tono irónico"* |
| `a pointed understatement` | `social/humor#vocab#understatement`, **already killed once for this scenario's neighbour at 04-05** |

A second scenario teaching the same unit is the D-01 failure 04-01 established as real. I did
not write them. **One card holds that ground legitimately:** `take something at face value`,
which names the *consequence* of missing a tone — you heard the literal sentence and half the
room heard the opposite — rather than the tone itself. The rest is recorded in the deck's own
header so the next author inherits the measurement instead of rediscovering it.

Two more of the plan's named items also died:

| Candidate | Killed by |
|---|---|
| `a set-up` ("everyone can finish it") | `native/phrasal-verbs#vocab#set-up-arrange` — **same world** — and `global/vocab/phrasal2` teaches `set up` too. Replaced by **`a well-worn line`** |
| `a shared complaint that functions as small talk` | `social/humor`'s reading passage **is** that essay — *"A grievance here is not raised, it is filed"* — with `a grievance` in its glossary and a question turning on it |

**Six killed candidates; four of them the plan had named.** Fifth consecutive plan where the
scan earned its cost before a word was authored.

## The shelf-life gate — and what it does NOT cover

A new group, `native/culture: nothing in either bank has a shelf life, and neither bank spoils
the passage`, appended under the file's two-edit rule with **zero new imports** — every
accessor it needs was already imported.

**A. The year.** Every field of both banks (`text`/`es`/`tip`, `term`/`es`/`example`) is
asserted to contain no four-digit year, matched narrowly as `1\d{3}|2\d{3}` so a price, a word
count or a house number cannot trip it.

> **This is not a proxy for the rule and the group says so in as many words.** A year is the
> *only* shelf-life marker a script can see. "No work, no person, no brand" is enforced by the
> authoring rule now written into both bank headers and by the reader pass at the phase gate —
> nothing more. A gate that implies more coverage than it has is worse than no gate, because
> the next author trusts it. T-04-13 is dispositioned **accept**, and this is what accepting it
> looks like when written down honestly.

**B. The passage keeps its answers.** 04-03's cross-surface rule, with one structural
difference that had to be handled rather than flattened. The idioms passage withholds all four
of the expressions its questions turn on. **This passage withholds three and glosses the fourth
on purpose** — its header says a white elephant is glossed because the question about it turns
on the possessive (*"our white elephant"*) rather than on the phrase.

So the record carries a `glossed` flag, and the exception is made self-validating:

1. The record names **one reference per question** (4 = 4), cross-checked so it cannot drift.
2. **Exactly one** of the four may be the glossed exception.
3. For the three: the passage's glossary must stay **silent**.
4. For the one: the glossary must **really define it** — asserted in the *positive*, so the
   flag cannot be flipped onto a second entry to silence an inconvenient check.
5. For **all four including the glossed one**: no bank field may name it. The passage may gloss
   its own white elephant; the banks may not, because the possessive turn only works while the
   phrase itself is unremarkable in the reader's hands.
6. Plus the literal rule: no phrase text and no card term appears anywhere in the passage.

## Mutation sweep — 10 declared · 8 of 8 caught · 2 controls green · negative confirmed

The plan mandates no sweep. One was run, because a gate never observed to fire is not yet a
gate. Anchors asserted unique at mutation time; restore is an **in-memory byte snapshot**
written back verbatim, never `git checkout --`; exit codes straight from `spawnSync`; caught
only if the harness fails **and** the expected label appears.

| # | Mutation | Caught by |
|---|---|---|
| M1 | a year injected into a card example | "names no year" |
| M2 | a year injected into a phrase **tip** — proves the other bank is covered | "names no year" |
| M3 | a card glosses `Groundhog Day` | "no bank entry gives away \"groundhog day\"" |
| M4 | a card names the **glossed** exception, `white elephant` | "no bank entry gives away \"white elephant\"" — proving the bank check covers all four |
| M5 | `glossed: true` set on an entry the glossary is silent about | "exactly one of the four is the glossed exception" **and** "the glossary really does define \"the emperor's new clothes\"" |
| M6 | the group's scenario key typo'd (`cluture`) | the vacuity guard |
| M7 | a fifth entry pushed into the withheld record | "names one reference per question" |
| N1 | **negative** — the `glossed` exception removed from white elephant | "the glossary stays silent on \"white elephant\"" fires, proving the exception is load-bearing and not decoration |
| C1 | inert edit inside a `//` comment in `scenario-vocabulary.ts` | control — **green** |
| C2 | inert edit inside a block comment in the harness, `/*` left alone | control — **green** |

**Two mutations failed on the first run and BOTH were defects in my mutations, not in the
gate** — 04-04's rule applied rather than restated:

- **M5 SURVIVED.** My mutation prepended `glossed: true,` to an object literal that already
  carried `glossed: false` further down. **Duplicate key: the last one wins**, so the mutation
  was semantically inert and the gate was right not to fire. Re-aimed at the real field via a
  unique multi-line anchor → caught, on both its labels.
- **N1 was refused as an ANCHOR DEFECT (0 occurrences).** The harness file is **CRLF** on disk
  and my anchor joined lines with `\n`. Diagnosed by reading the bytes rather than by guessing
  (`CRLF present: true`), re-expressed with `\r\n` → caught. The refusal branch did its job:
  the file came back byte-identical.

Post-sweep: `git status` clean, **14,325** assertions, every file byte-identical.

## Corpus-wide near-duplicate scan

Exact + Jaccard over word sets, run **before authoring** and again against the final content.
Stopwords **not** stripped, so every score is an upper bound. Thresholds as this phase has used
throughout: any exact match is a defect, J ≥ 0.50 is investigated, J ≥ 0.60 is a defect.

### The harvester was broken, and fixing it is a finding about prior scans

04-05's harvester pushed a field only when `typeof text === "string"`. A `ScenarioPassage.body`
is `string[]`, so **every reading passage body in the app was silently absent from its corpus**
— along with every glossary (it looked for `.term`/`.es`; the shape is `{word, meaning}`) and
every reading question prompt (it looked for `q.prompt`; the field is `q.q`).

Rebuilt against the real shapes: **4,284 authored fields** across all 35 scenarios' phrases /
vocabulary / grammar / reading / writing / speaking / briefings, plus the curriculum titles and
blurbs, the four global banks, the listening clips, the speaking packs and the speaking tips —
against 04-05's 3,744. Every scan below therefore covered surfaces no prior plan's scan
reached, **including native/culture's own letter home**, which is exactly the text these banks
must not collide with.

154,224 comparisons for the phrases, 205,632 for the deck. **Zero exact duplicates in any
field, in either set.**

### Four fields rewritten after the scan, before authoring

| Field | Was | Rewritten because |
|---|---|---|
| `give-me-that-one-again` (was `gone-straight-past-me`) | *"That's gone straight past me — say it again?"* / *"Eso se me ha escapado del todo."* | J = 0.333 against `social/humor#phrase#went-over-my-head.es` *"Ese chiste se me escapó del todo."* — the **same Spanish frame negated**, for the same phenomenon, in the neighbouring scenario |
| `new-one-on-me` (was `that-ones-new-to-me`) | *"I'll be honest — that one's new to me."* | J = 0.333 against the live `native/register#casual-not-sold-on-that` *"I'm not sold on that, to be honest."* — **same world**, and `global/vocab/opinion` teaches `to be honest` as a card. Three surfaces on one tail |
| `i-got-it-even-if-nobody-else-did` | *"I got it, for what it's worth."* | `native/idioms#phrase#for-what-its-worth` is a **live phrase teaching that exact expression** |
| `euphemism.example` | *"…her post had been made redundant…"* | `academic/summaries#vocab#redundant` and `global/vocab/nuance#redundant` both teach `redundant` in its *other* sense — a third sense of a word two live cards own is confusion, not depth |

### Then both banks were read consecutively, which the scan cannot substitute for

Six more rewrites no Jaccard threshold flagged, because a repeated *shape* is invisible to a
word-set metric:

| Item | Shared its frame with |
|---|---|
| `got-the-tone-not-the-reference` | ended *"carry on, I'll catch up"* while `held-everybody-up-enough` also opened on *carry on* — and `global/vocab/phrasal2` teaches `carry on` as a card. → *"keep going"* / *"Right, sorted"* |
| `ten-seconds-behind` | *"I got there in the end…"* — the fourth phrase in the set to open **"I got"**. → *"Don't mind me — I'm always about ten seconds behind."* |
| `doesnt-travel` | *"that **one** doesn't travel"*, the third *"that one"* in the set. → *"that doesn't travel"* |
| `allude-to.example` | *"let the room supply the rest"* against `well-worn-line`'s *"could have supplied the rest"* — an identical phrase two cards apart. → *"trusted the table to know which March he meant"* |
| `aside.example` | ended on who laughed, duplicating `the-uninitiated`'s subject. → *"so it reached only the three people it was meant for"* |
| `euphemism.example` | opened **"Nobody"**, as `nickname-that-stuck` does immediately above it. → *"The word died was not used once all afternoon…"* |

### Highest pairs, reported rather than gamed

**Phrases — highest J = 0.375**: `new-one-on-me.text` *"That's a new one on me."* against
`global/reading#lost-phone.q[1].option[1]` *"She bought a new one"* — a five-word denominator,
zero shared teaching. The **≥6-word view tops out at J = 0.333**, and that pair is Spanish
function words (`same-job-back-home.es` against *"en lo que a mí respecta"*).

**Deck — highest genuine J = 0.300**: `date-someone.es` *"delatar la edad de quien lo dice"*
against `native/register#vocab#agentless-passive.es` *"la pasiva que no dice quién"*. Three
shared function words, opposite teaching. (Raw scores of 0.500 appear against one-word grammar
options — *"a"*, *"an"*, *"the"* — which is an artefact of a two-word term, not a duplicate.)

**One pair at exactly 0.500 was acted on rather than filed:** `read the room` against the live
`work/networking#vocab#work-the-room` — a 3-word/3-word denominator sharing two words *and* the
`X the room` frame. Below the defect threshold, but it is the shared-shape failure 04-05's
reader pass exists to catch, so the card was replaced by `topical` — which is better content
here anyway, being the opposite pole of this scenario's own shelf-life axis.

**Nothing sat at or above J = 0.60, so this plan files no WINDOWS judgement of 04-04's kind.**

### Five frames found against the EXISTING cards, measured and KEPT

The final consecutive read compared the sixteen new cards against Phase 3's eight. Five mild
frames turned up. **Measured before acting:**

| Pair | J |
|---|---|
| `face-value` *"half the room"* vs live `niche` *"half the table"* | **0.100** |
| `common-currency` *"and now it is…"* vs live `go-viral` *"and now it's…"* | **0.094** |
| `well-worn-line` vs `allude-to` (both *the table*) | **0.108** |
| `well-worn-line` vs live `niche` (both *the table*) | **0.129** |
| `euphemism` *"nobody in the room"* vs `face-value` *"half the room"* | **0.111** |

All five are an order of magnitude below the investigate threshold, and every one is a common
English quantifier or a two-word connective rather than 04-05's genuinely identical skeletons
(*"so calmly that"* / *"so thoroughly that"*). **Clearing them would mean editing a field
behind an id committed forty minutes earlier — a changed hash, which is the one-way door this
phase exists to keep shut. A 0.10 overlap does not buy that.** Kept, with the numbers, rather
than either silently ignored or paid for in the wrong currency.

## The sitting

```
native/culture:  18 x 20 s  +  42-card deck x 15 s  +  0 questions
                 = 360 s + 630 s = 990 s
                 minutes 17 -> 1020 s advertised -> 30 s slack
```

The deck is phrases **plus** vocabulary, so the warm-up is deliberately double-counted per
04-01's documented conservatism. `minutes` was raised **in the same commit as each bank
growth** — 10 → 13 at Task 1 (18 × 20 s + a 26-card deck × 15 s = 750 s), 13 → 17 at Task 2 —
never after.

## No one-way door was opened

**Zero ids retired. Zero ids re-pointed. Zero changed hashes across both commits.** The six
existing phrases and eight existing cards were not touched in any field. **No retirement
decision was put to the user**, because none was needed: the plan's reading was right that
`native/culture`'s Phase 3 content is correct and depth here is pure addition. That is now two
consecutive plans (04-05, 04-06) needing no one-way-door decision.

## Verification

Every `<verify>` block in both tasks was run. **All passed.** Exit codes captured directly.

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **14,325** assertions pass (baseline 13,832; 13,964 after Task 1) |
| `verify-id-stability.mts` | **1,959** assertions pass; **632** ids, 15 retired (unchanged) |
| Fixture diff, Task 1 | 12 added · **0 removed** · **0 changed hashes** |
| Fixture diff, Task 2 | 16 added · **0 removed** · **0 changed hashes** |
| `--update` idempotence (both tasks) | fixture byte-identical after re-running |
| Removed-line check on `phrases.ts` (Task 1) | exit 0 — nothing removed |
| Removed lines in `scenario-vocabulary.ts` (Task 2) | none, comment-filtered or otherwise |
| `minutes: 17` covers the sitting | 990 s needed, 1020 s advertised, 30 s slack |
| Corpus scan | **0 exact duplicates**; phrases highest J = 0.375, deck highest genuine 0.300; ≥6-word view 0.333 |
| Mutation sweep | 10 declared · **8/8 caught** · negative confirmed · 2 controls green · byte-identity IDENTICAL |
| `npx tsc --noEmit` | exit 0 (both tasks) |
| `npm run lint` | exit 0, no warnings (both tasks) |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |
| Payload | 199,631 B saturated over 733 scheduled ids — **19.0 %** of the 1,048,576 B cap (was 18.3 % / 705) |

**Build integrity (the 03-08 hazard).** The build ran only after `git status` showed the tree
clean, and `.next` was wiped first. The rebuilt bundle holds `held-everybody-up-enough`,
`scrolled-back-twice`, `well-worn-line`, `common-currency`, the card term *"the penny drops"*,
the phrase text *"Don't mind me"* and `minutes:17`. Checked rather than assumed.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] Six planned candidates already taught elsewhere; four fields rewritten before authoring; six more after the reader pass**

Documented in full under the corpus scan. **None of the collisions ever reached a commit.**
Commits `7e33d72` and `9a534cb`.

**2. [Rule 1 — Bug] The corpus harvester inherited from 04-05 was dropping three populations**

- **Found during:** the pre-authoring scan, before any content existed.
- **Issue:** its `push` guard required `typeof text === "string"`, so `ScenarioPassage.body`
  (a `string[]`) was skipped entirely; glossaries were read under the wrong field names
  (`.term`/`.es` for a `{word, meaning}` shape) and reading question prompts under `q.prompt`
  rather than `q.q`.
- **Fix:** harvester rebuilt against the real shapes — 4,284 fields against 3,744. Scratch
  tooling, so nothing in the repo changed.
- **Why it matters here specifically:** the surface most relevant to this scenario is its own
  reading passage, and that surface was invisible to the scan that would have checked it.

### Things I did not change

- **The plan's success criterion 3.** Reported unmet with the measurement, not quietly
  satisfied by writing a duplicate of `social/humor`'s deck. See the section above.
- **The five reader-pass frames at J = 0.094–0.129.** Kept, with the numbers, because the fix
  costs a changed hash and the finding does not justify one.
- **`native/culture`'s BRIEFING, which itself has a shelf life.** `scenario-lessons.ts` gives
  its tips as *"It's his Achilles' heel"* and **"That's so 2010"** — a literal four-digit year,
  in the one scenario this plan gates against years. The gate is scoped to the two **banks**,
  which are the files this plan owns; `scenario-lessons.ts` is not in `files_modified`, and the
  briefing's year is arguably deliberate (the joke is that saying it dates you). Flagged rather
  than fixed, and **logged to `deferred-items.md`** — widening the year gate to briefings is a
  decision about the gate, not about this content.
- **`CONT-04`.** Not ticked. This is plan **six of nine**, and `native/pronunciation` still
  sits at Phase 3 floors — a tick here is a claim outrunning the content, which D-02 forbids
  and which 04-03 had to revert.
- **`FALLBACK_LESSON`.** 04-04's open question is still open; nothing here touches
  `scenario-lessons.ts`.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | 18 phrases and 24 cards of machinery, not of references | ✅ three axes, four strands |
| 2 | Nothing in either bank depends on a nameable work, person, brand or year | ✅ authored to the rule; the **year** half is gated and fires (M1, M2) |
| 3 | Irony, sarcasm and deadpan taught in this world for the first time | ❌ **UNMET, deliberately** — `social/humor` already teaches all of them. Reported, not duplicated. `take something at face value` holds the adjacent ground |
| 4 | The passage still asks the reader to recover what nothing else gives away | ✅ gated on all four references, incl. the glossed exception (M3, M4, N1) |
| 5 | No existing id touched; the advertised sitting matches what the page mounts | ✅ 0 removed, 0 changed hashes, 1,959 assertions; 17 min raised in the same commits |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived
from bank contents.

## Self-Check: PASSED

All five modified source files present on disk; both commits (`7e33d72`, `9a534cb`) present in
`git log`.
