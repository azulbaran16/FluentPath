---
phase: 04-native-level-depth
plan: 09
subsystem: scenario-content
tags: [gate, mutation-sweep, reader-pass, requirements, ledger, honesty, unobserved]
status: complete

requires:
  - "04-01's id-stability gate + fixture — the thing this gate had to prove covers the phase's OWN 155 ids, not only the 538 present when it was seeded"
  - "04-01's recall-batches contract, session-length invariant and payload assertion"
  - "04-03's tip gate, 04-05's pairing gate, 04-06's shelf-life gate, 04-08's pair-count tripwires"
  - "04-06's REBUILT corpus harvester (corpus2.mts) — the one that sees reading bodies, glossaries and question prompts"
  - "04-08's measured decision record: C and E taken, A/B/D declined, F deferred"
provides:
  - "CONT-04 at [~] met-with-a-stated-limitation, annotated with what was measured, what was seen (nothing) and what is not"
  - "proof that every gate this phase bought has teeth: 17 of 17 mutations CAUGHT on their own labels, 2 controls green"
  - "an INDEPENDENT id-completeness observation — 651 emitted = 651 recorded — that does not import verify-id-stability's logic"
  - "the settled corpus figure (4,410 at 04-07's tree, 4,440 at HEAD) and a broken harvester that can no longer be picked up by mistake"
  - "the state.* tooling defect consolidated in ONE place with its root cause, after seventeen consecutive occurrences"
  - "an ordered browser checklist with URLs, every item marked unobserved"
affects:
  - "Phase 5 / the tutor: inherits a world at three times its Phase 3 depth and an untested rendering path through it"
  - "whoever drives the browser next: WINDOWS 62 is the checklist, and its top two items came from the real beta user"

tech-stack:
  added: []
  patterns:
    - "running a mutation sweep in a scratch git-archive export with its OWN node_modules holding only the packages the harness needs — isolation without copying 500 MB"
    - "asserting a completeness property from OUTSIDE the script that owns it, so a softened rule would be noticed by something that does not share its assumptions"
    - "requiring a LANDING PROOF (bytes differ) and a PARSE CHECK before any mutation verdict, so a syntax error can never masquerade as a catch"
    - "DISABLING a known-broken tool by making it throw, rather than documenting it as dangerous beside the good one"
    - "reporting a similarity metric alongside the pool size it was measured over, because a maximum rises with the pool even when quality does not move"

key-files:
  created:
    - .planning/phases/04-native-level-depth/04-09-SUMMARY.md
  modified:
    - .planning/REQUIREMENTS.md
    - .planning/WINDOWS.md
    - AGENTS.md

decisions:
  - "CONT-04 IS [~], NOT [x]. Its content is complete, derived and gated, and the reader pass is done — but this phase added a COMPONENT change that has never been rendered, and 03-11's precedent for CONT-01/02 included a browser confirmation. [~] is this project's own convention for 'built and proved by script, unproved by sight', and neither [ ] nor [x] is true here."
  - "A PARTICLE IS NOT A STOPWORD IN THIS WORLD. The first reader scan used a conventional stoplist and scored social/small-talk#catch-up against native/phrasal-verbs#catch-on at J = 1.000, because both collapse to {catch}. That is the metric deleting the exact unit native/phrasal-verbs teaches. The stoplist was corrected and the artefact is recorded, because the next scan of this world will hit it too."
  - "04-08 WAS RIGHT AND 04-07 WAS WRONG, settled by measurement at four commits rather than by argument: 33f082b = 4,410 fields, HEAD = 4,440. 04-07's 4,523/4,565 does not reproduce at 04-07's own tree. There are no 155 missing fields."
  - "THE BROKEN HARVESTER IS NOW DISABLED, NOT DOCUMENTED. 04-08 named corpus.mts as a hazard and left it beside corpus2.mts; scan.mts and probe.mts still imported it. It now throws on evaluation, proved by running scan.mts and watching it exit 1."
  - "TWO OF MY OWN CHECKS WERE WRONG BEFORE ANY GATE WAS: the independent id enumeration called the accessors with a composite key (they take two arguments) and then double-composed grammar ids. Both were my bugs, found by the DISAGREE branch firing, and the fix proved that branch is live."
  - "THE BROWSER PASS IS REPORTED AS NOT PERFORMED. It is the one thing this plan could not do, and it is written as missing rather than as done — including the two items that came from the real beta user and outrank every internal check."

metrics:
  duration: "~135 min"
  completed: 2026-08-04
  tasks: 3
  commits: 1
  harness_assertions: 14577
  harness_baseline: 14577
---

# Phase 4 Plan 09: The Gate Summary

Every assertion this phase bought was aimed at and made to fail on its own label; the world was read
end to end by a reader rather than only scanned; and **CONT-04 closes at `[~]`, not `[x]`, because the
one thing nobody did is the one thing a script cannot do.**

## 1. The automated gate, in numbers

| Check | Result | Baseline |
|---|---|---|
| `verify-scenario-content.mts` | **14,577** assertions pass | 14,577 (04-08) — held |
| `verify-id-stability.mts` | **2,021** assertions pass · **651** ids · **15** retired | 2,021 — held |
| `verify-merge.mts` | **25,647** | 25,647 — held |
| `verify-schema.mts` | **309** | 309 — held |
| `verify-queue.mts` | **173** | 173 — held |
| `verify-headers.mts` | **24** | 24 — held |
| `verify-celpip-sections / -content / -speech` | **43 · 648 · 50** | held |
| `npx tsc --noEmit` | exit 0 | |
| `npm run lint` | exit 0, no warnings | |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe | |
| Dependencies | **11 prod / 11 dev** — zero packages installed in the whole phase | |
| Pairs | **53 / 53 written · 0 pending** — asserted, not reported | |
| Saturated payload | **205,174 B over 752 ids — 19.6 %** of the 1,048,576 B cap | |
| Port 3000 | free before and after | |
| `git status --porcelain` | clean but for a pre-existing untracked `.claude/` | |

**The payload as a delta.** 03-11 closed Phase 3 at 143,830 B / **13.7 %** over 611 ids. Phase 4 closes at
205,174 B / **19.6 %** over 752 ids: **+61,344 B and +5.9 points of headroom spent** for 141 net new
scheduled items. Four fifths of the cap remain.

**The dependency-count assertion.** 11 and 11, unchanged at every plan in the phase. No package was
installed at any point, which is T-04-SC discharged as a test rather than eyeballed.

### The independent completeness check — an outside observation, not the script's opinion of itself

Run **before** the sweep and deliberately **without importing `verify-id-stability.mts`'s logic**: walk
the curriculum, call the three bank accessors, compose `world/scenario#kind#slug` literally, and compare
against the fixture's own `ids` keys.

```
emitted by the banks     : 651
present in the fixture   : 651
retired entries          : 15
emitted but NOT recorded : 0
recorded but NOT emitted : 0                     AGREE EXACTLY
```

If rule 3 were ever softened, this is what would notice — and it agrees exactly with the 155 ids this
phase added. **Two of my own bugs had to be fixed before it agreed, and both are recorded rather than
quietly corrected:** the first run called `getScenarioPhrases(key)` when the accessor takes
`(worldSlug, scenarioSlug)` and reported 0 emitted against 651 recorded; the second double-composed the
grammar ids, because scenario grammar's accessor already composes through `scenarioItemId` on first
access while phrases and vocabulary carry a bare slug. Both failures fired the **DISAGREE** branch, which
is how that branch was proved live twice over before its **AGREE** was believed.

### The derivation control, re-proved

One edit — `native/phrasal-verbs`' grammar bank emptied in the scratch copy, 10,801 bytes removed — and
every dependent claim moved with it, with **no second edit anywhere**:

| | pairsWritten | pending | grammar available | grammar summary | scenario complete |
|---|---|---|---|---|---|
| before | 53 / 53 | 0 | true | `15 questions` | true |
| **after** | **52 / 53** | **1** | **false** | *(empty)* | **false** |
| restored | 53 / 53 | 0 | true | `15 questions` | true |

## 2. The mutation sweep — 19 declared · 19 executed · **17 of 17 CAUGHT** · 2 controls green

**Where it ran, and why that matters.** In a `git archive HEAD` export in the scratchpad **with its own
`node_modules`**, so the working tree and `.next` could not be touched at all — not avoided, impossible
(T-04-18). The harness turned out to need `zod`, which is exactly why the plan demanded real dependencies
rather than a bare export; only the packages the harness needs were copied.

**Smoke-tested in all three directions before any verdict was trusted**, which is the discipline 04-01
paid for after two defective runners:

- **baseline green** — the untouched export exits 0 on both scripts;
- **the SURVIVED branch is live** — control C1 ran as a mutation, landed, and left the harness at exit 0;
- **the ANCHOR-DEFECT branch is live** — a deliberately non-unique anchor (264 occurrences) was refused
  and the file came back byte-identical.

A verdict of CAUGHT required **all three of**: a non-zero exit captured straight from `spawnSync` (never
through a pipe), the expected label on a `FAIL` line, and a file that still parses. Restore was an
**in-memory byte snapshot**, never `git checkout --`.

| # | The gate it aims at | Verdict | Caught on |
|---|---|---|---|
| M1 | id stability — re-point, **LATE-phase id (04-07)** | **CAUGHT** | `native/pronunciation#phrase#state-school-not-estate still holds the content it was recorded with` |
| M2 | id stability — re-point, **EARLY-phase id (04-01)** | **CAUGHT** | `native/phrasal-verbs#phrase#didnt-think-wed-pull-it-off …` |
| M3 | id stability — **partial** edit, `tip` only, `en` untouched | **CAUGHT** | `native/idioms#phrase#off-the-top-of-my-head …` |
| M4 | id stability — **partial** edit, `example` only, `term` untouched | **CAUGHT** | `native/culture#vocab#well-worn-line …` |
| M5 | id stability — **an id added with NO fixture regeneration** | **CAUGHT** | `…#sweep-unrecorded-addition is recorded in the fixture` |
| M6 | id stability — a **retired** id put back into its own bank | **CAUGHT** | `native/idioms#phrase#piece-of-cake is recorded in the fixture` |
| M7 | batching — the component chunks by hand | **CAUGHT** | `the deck component calls the one chunking author` |
| M8 | batching — a batch above the ceiling | **CAUGHT** | `batches(17): no batch exceeds the ceiling of 16` |
| M9 | batching — batch **order** permuted | **CAUGHT** | `batches(17): concatenating the batches reproduces the input, in order` |
| M10 | session length — minutes left behind after the bank grew | **CAUGHT** | `native/culture: its advertised 10 min covers 18 warm-up phrase(s), a 42-card deck …` |
| M11 | the **pair-count tripwire** — a skill declared without raising the literal | **CAUGHT** | `the curriculum declares 53 scenario×skill pairs` |
| M12 | the payload — the cap driven below the saturated body | **CAUGHT** | `a fully saturated ProgressState fits under the route's body cap` |
| M13 | the tip gate — a tip replaced by its own translation | **CAUGHT** | `its tip is a use note, not a gloss (>= 12 words)` |
| M14 | the pairing — a register pair split | **CAUGHT** | `native/register: pair 9 sits adjacent — formal-… then casual-…` |
| M15 | briefing separation — a tip quoting its own card | **CAUGHT** | `the briefing does not work its example from vocab#par-for-the-course` |
| M16 | the withholding — a bank entry glossing what the passage withholds | **CAUGHT** | `no bank entry gives away "groundhog day"` |
| M17 | the shelf life — a four-digit year in a `native/culture` bank | **CAUGHT** | `native/culture#vocab#nickname-that-stuck.example: names no year` |
| **C1** | **control** — a reworded item that is not a copy | **SURVIVED** *(as required)* | — |
| **C2** | **control** — a gate literal placed inside a `//` comment | **SURVIVED** *(as required)* | — |

**M1/M2 are labelled separately on purpose.** An id-stability sweep that only ever mutates an id from the
plan that seeded the fixture proves nothing about the ~155 ids authored after it. Both a 04-07 id and a
04-01 id were re-pointed, and both failed on their own names — so the gate is shown to cover the phase's
own additions, not merely the 538 present when it was built.

**M5 is the one that makes the gate mandatory rather than opt-in.** Without it an author could add a
hundred ids that the re-point rule can never protect, and every check would stay green.

**Every restore byte-identical, and the sweep tree proved clean afterwards:** a `diff -r` of the sweep
tree against a **fresh** export of `HEAD` reports no differences at all. The working tree never moved —
`git diff HEAD -- src scripts` is empty and was empty throughout.

**Build integrity (the 03-08 hazard).** `.next` was deleted and rebuilt from the committed tree *after*
the sweep. The rebuilt bundle carries `held-everybody-up-enough`, `state-school-not-estate`,
`negative-inversion-formal-notice`, `well-worn-line`, `par-for-the-course`, `let it go past` and
`linking and elision`; and carries **zero** occurrences of any mutation-only string
(`sweep-unrecorded-addition`, `piece-of-cake`, `groundhog day`, `nickname that stuck in 2014`,
`public school, not a private`). Checked, not assumed.

## 3. The phase in items and words

| | before (phase start) | after | |
|---|---|---|---|
| phrases | 30 | **84** | ×2.8 |
| vocabulary cards | 40 | **112** | ×2.8 |
| grammar questions | 5 | **20** | ×4.0 |
| authored-field words | 1,643 | **8,132** | **+6,489** |
| scheduled ids (native) | 75 | **216** | **155 added · 14 removed** |

Per scenario: `idioms` 18/24 · `phrasal-verbs` 18/24 + 15 questions · `register` 18/24 + 5 questions ·
`culture` 18/24 · `pronunciation` **12/16, deliberately the smallest**.

**Ids: 155 added, 15 retired, ZERO re-pointed.** Fourteen retirements removed pre-existing
`native/idioms` material under two explicit human approvals (04-03's six phrases, 04-04's eight cards);
the fifteenth was authored *and* retired inside 04-01. All 15 carry a written reason, checked
programmatically, and none is both live and retired.

**Against research's projection, measured rather than assumed.** Research projected roughly **3,020**
authored words for the phase; the five scenarios grew by **6,489** words of authored fields — **2.15×**
the projection. Counting basis, stated so the next plan can reproduce it: phrase `text` + `es` + `tip`,
card `term` + `es` + `example`, question `prompt` + `explain` + `topic` + all options; Spanish included.

**And the per-unit rate did not reproduce either.** 04-08 measured option C at **80.6 words per grammar
question** against research's **47.7** — **1.69×** — with the overrun concentrated in `explain` (56.8 of
the 80.6), because a register question must name its reader in the prompt and its explanation must say
why *both* options are grammatical. **That is now the third phase running in which a quoted per-unit rate
did not reproduce. Phase 5 should inherit measurements, not estimates.**

## 4. The corpus figure, settled

04-08 flagged that 04-07's reported corpus size does not reproduce. Measured here with 04-06's rebuilt
harvester against exported trees at four commits:

| Tree | Fields |
|---|---|
| `33f082b` — **04-07's own final commit**, the tree that summary describes | **4,410** |
| `47454ef` — 04-08 task 2 | 4,410 |
| `b4c0e6b` — 04-08 option C | **4,440** |
| `HEAD` | **4,440** |

**04-08 is right.** 04-07's 4,523 → 4,565 does not reproduce at 04-07's own tree; there are **no 155
missing fields** and no later plan should go looking for them. The 4,410 → 4,440 step is exactly the
**30** fields option C added (5 questions × (prompt + explain + 4 options)), which also explains why
04-08 measured 4,410: it scanned before its own content landed. Arithmetically exact against
independently counted banks at HEAD: `2 × 264 + 192 tipped = 720` phrase fields · `3 × 352 = 1,056` vocab
· `2 × 35 + 140 = 210` grammar.

**The cause is now removed rather than documented.** 04-05's broken `corpus.mts` sat in the scratchpad
beside the good `corpus2.mts`, and **`scan.mts` and `probe.mts` still imported the broken one**. Measured
side by side: **corpus2 sees 4,440 fields, corpus sees 3,948 — it silently drops 492**, being every
reading body, every glossary and every reading question prompt. `corpus.mts` now **throws on evaluation**
with a message naming its replacement; running `scan.mts` exits 1 with that message, verified. The
original is archived as `.txt` so it cannot be imported either.

## 5. The reader pass — this phase's named residual risk (T-04-21)

Over a hundred items were authored across seven plans by agents that could not see each other's output.
The harness sees byte-identity; a lazy paraphrase passes everything. **This is the only defence, and it
was done by reading, not by scanning: all five phrase sets side by side, all five decks side by side,
each scenario against its own deck, briefing, rehearsal and passage, and the phase's output against its
two nearest neighbours elsewhere in the app.**

### The verdict

**No near-duplicate exercise was found, and nothing was rewritten.** Nothing in the five scenarios reads
as another's with the nouns changed. The five sets are doing genuinely different jobs: `idioms` is
conversational *moves*; `phrasal-verbs` is sentences built around verb + particle + **sense**;
`register` is nine situations said twice; `culture` is a repertoire of *repairs* for a missed reference;
`pronunciation` is contrasts inside sayable sentences.

### The numbers, and the honest reading of them

Cross-scenario **within** Sounding Native — 2,808 phrase pairs, 4,992 term pairs:

| | stripped | raw | 03-11 baseline | ≥ 0.50 |
|---|---|---|---|---|
| phrase text | **0.286** | 0.333 | 0.14 | **0** |
| vocabulary term | **0.400** | 0.375 | 0.00 | **0** |

Cross-world (a native item against any other world): phrases **0.400** stripped / 0.429 raw, **0** pairs
at or above 0.50; terms **0.500** stripped / 0.667 raw.

**Both same-world numbers rose, and the honest explanation is mostly pool size.** 03-11 measured this
world at 30 phrases and 40 cards; it now holds 84 and 112, so the same quality searched over roughly nine
times as many pairs will surface a higher maximum. **Nothing anywhere in the world reaches 0.50**, which
is the number that would matter. A reader's judgement: the rise does not matter, and the two pairs at the
top are named below so anyone may disagree with that judgement rather than take it on trust.

**A method finding worth more than the numbers.** The first run of this scan used a conventional stoplist
containing *up / on / off / out / over / into* and scored `social/small-talk#catch-up` against
`native/phrasal-verbs#catch-on` at **J = 1.000** — both collapse to `{catch}`. **A particle is not a
stopword in this world:** stripping it deletes exactly the unit `native/phrasal-verbs` exists to teach.
The stoplist was corrected and this is recorded in WINDOWS 64, because the next scan of this world will
hit it too.

### Four things a reader sees that the scan did not — all judged, none fixed

1. **`I'm afraid` on four surfaces.** `native/idioms#not-my-call`, `native/register#formal-wont-be-possible`,
   `work/negotiating`'s deal-breaker example, and `native/register#vocab#softener`, whose term *is*
   `a softener (unfortunately, I'm afraid)`. **Only the card teaches it**; the other three use it as a
   natural tail. Incidental co-occurrence — the WINDOWS 49 class — and a correction costs a retirement
   for no pedagogical gain.
2. **A shared skeleton teaching near-opposites.** `native/idioms#a-pinch-of-salt` ("take something with a
   pinch of salt") and `native/culture#face-value` ("take something at face value") share an identical
   frame while pointing in opposite directions — discount it vs believe it literally. J = 0.333, so no
   threshold flags it; this is precisely the failure 04-05's reader pass exists to catch. **Kept:** the
   frame is the ordinary English one for both, and both ids are committed, so a rewrite is a changed hash
   — a one-way door bought for a shared preposition.
3. **The closest same-world pair in the phase**, at J = 0.400: `native/idioms#keep-someone-in-the-loop`
   and `native/culture#fill-someone-in`. Genuinely distinguishable — ongoing inclusion vs a one-off
   catch-up, and culture's is specifically about being filled in on a *reference* — but a reader may
   reasonably disagree, so the number is recorded rather than buried.
4. **`native/register`'s briefing names three of its own cards in one tip.** *"Contractions and slang
   signal informal; full forms signal formal"* quotes `slang`, `a contraction` and `a full form`. 04-04's
   briefing/bank separation gate is scoped to `native/idioms` and does not fire. This is the **card** half
   of the defect WINDOWS 57 records for the **phrase** half *in the same scenario*, so the case for
   widening that gate to all 35 briefings is now stronger than when 57 was filed.

**One scan flag was a false positive and the reader overruled it.** A within-scenario check reported
`native/phrasal-verbs` teaching `catch on` twice. It is 04-01's **deliberate polysemy split**: the card
teaches *become popular*, the phrase teaches *understand*, and the phrase's tip names the card's sense by
contrast (*"aquí 'catch on' es entender, no ponerse de moda"*). That is the design working. Across all
five scenarios the within-scenario check found **no** repeat that survived reading.

### The two cross-world reads the plan asked for

**The formal halves of the register pairs against the Work world — the collision that did not happen.**
Work's email lines are about the *mechanics* of email (the spam folder, reply-all, the thread, a nudge,
`the recipient`, `a sign-off`); register's nine formal halves are about the *tone dial* on a speech act.
Different axis entirely. The closest adjacency is register's *"The message appears to have been copied to
the wrong recipient."* against `work/emails`' *"I hit reply all by mistake."* — same mishap, but one
teaches the agentless passive and the other teaches the confession. **Two earlier kills are confirmed to
have held:** 04-05 dropped `sign-off` because `work/emails` owns it and shipped `a salutation` (the
opener) instead, and dropped `understatement` because `social/humor` owns it, shipping `downplay
something`. Both boundaries are intact in the live decks.

**The culture bank against `social/humor` — a clean conceptual boundary.** `social/humor` is tone
(`deadpan`, `dry humour`, `tongue in cheek`, `banter`, `an understatement`); `native/culture` is shared
reference (`a catchphrase`, `an in-joke`, `common currency`, `the uninitiated`, `a callback`). **Zero term
overlap.** The boundary was actively policed — 04-06 declined to write irony, sarcasm and deadpan and
reported its own criterion 3 unmet rather than duplicating a neighbour. The single closest adjacency is
`social/humor#went-over-my-head` against culture's whole repair repertoire: the same experience, different
cause, and `native/culture#got-the-tone-not-the-reference` is the line that names the distinction — good
design rather than duplication.

### The design echo, named for whoever writes the sixth native scenario

**Three of the five decks are metalanguage** (register markers, reference machinery, phonetics) **and two
are expressions** (idioms, phrasal verbs). A learner moving `register → culture → pronunciation` meets the
same card shape — *a name for a thing* — three times. Defensible, and in two cases forced: where the app
cannot **score** the skill, the only deliverable is the vocabulary to understand being told, which 04-07
argues explicitly for pronunciation. The three share no term and no territory. Recorded as WINDOWS 64:
**do not make it four of six.**

## 6. The browser pass — NOT PERFORMED

**No item below was observed. Nothing here passed, and nothing here failed; it was not run.** The
reviewer's context was exhausted. This is recorded as missing rather than as done, and it is open by name
as **WINDOWS 62**.

Start:

```
npm run build && npx next start -p 3117      # sign in first — the deck and the review items need a session
```

**The two items at the top came from the real beta user and outrank every internal check below them.**

| # | What to do | Expected | Status |
|---|---|---|---|
| **0a** | **On a phone**, open a CELPIP reading exercise and **tap a drop-down blank** | The page does **not** zoom. A fix is deployed (`f164ec5`) and has **never** been confirmed on a device | **UNOBSERVED** |
| **0b** | **On a phone and on desktop**, look for the **CELPIP nav link** (`d06c219`) | It renders and routes to `/celpip`. The entire exam section had no menu entry until the beta user asked where it was | **UNOBSERVED** |
| 1 | `/world/native/phrasal-verbs` → "Lock it in". Rate to the end of batch 1 | Counter and progress bar track **the batch**, not the whole deck; a **rest point** appears instead of the completion screen; carrying on repeats nothing and skips nothing; the final screen totals the **whole sitting**; "Go again" returns to card 1 of batch 1 | **UNOBSERVED** |
| 2 | `/world/practical/appointments` → same step (14 cards, under the ceiling) | Runs start to finish with **no rest point at all** — the check that the thirty untouched scenarios were left alone | **UNOBSERVED** |
| 3 | Get **>16 items due**, then `/review` | The deck batches here too; the rest point reads sensibly for a **mixed** set from several scenarios; nothing repeats or is skipped; and rating an item correct does **not** shrink the deck underneath you (the mount-time snapshot). If the copy assumes one scenario, that is a finding: one renderer, four callers | **UNOBSERVED** |
| 4 | `/world/native/phrasal-verbs` → "Warm up & speak" | Counts to **18**; tips read as use notes, not translations; and it is not exhausting — if it is, say so, the deck's ceiling can be applied here too | **UNOBSERVED** |
| 5 | `/world/native/idioms` — read briefing + 18 phrases + 24 cards in one pass | Answer one question: **does this still read like any ELT textbook?** That was Phase 3's verdict and the whole reason for this phase. Also: the briefing's worked example appears nowhere else on the page | **UNOBSERVED** |
| 6 | `/world/native/register` → the warm-up | The casual and formal halves of each of the nine situations sit **adjacent**, casual first, in render order | **UNOBSERVED** |
| 7 | All five native scenario pages — the "~N min" in the header | 17 · 24 · 21 · 17 · 11 — a number you would not laugh at, given what is on the page | **UNOBSERVED** |
| 8 | Any native scenario → "Practise speaking". Tick all three moves | Line-through on tick; 3 of 3; the "Rehearsed" pill; **15 speaking XP awarded once**. Untick and re-tick — it must **not** award again. Then **navigate away, come back and tick again**: research read the latch as component-local state that may not survive a remount, so a second award is a real finding. Nobody has ever ticked a rehearsal move in this app (WINDOWS 38, open since Phase 3) | **UNOBSERVED** |
| 9 | Ask for one scenario's exercise entry to be temporarily emptied | The pair says its practice is not written yet, offers the global skill room, disappears from that page's structured data, and returns on restore with no other edit | **UNOBSERVED** |
| 10 | **On a phone**, open one native scenario | Deck buttons tappable, rest point readable, the 18-phrase warm-up usable at phone width | **UNOBSERVED** |

**Also carried forward, unobserved and not re-derived:** the CELPIP tabs are **below the 44 px touch
minimum** (26 px and 34 px); **Listening audio and Speaking recording have never run on a phone**, so the
MediaRecorder WebM→MP4 container probe written specifically for Safari has still never executed on the
browser family it exists for (WINDOWS 3, 4, 25, 27).

## 7. CONT-04

**Marked `[~]` — met with a stated limitation — and deliberately not `[x]`.** The content half is
complete, derived and gated, and the reader pass is done; but this phase amended D-01 with a **component**
change that has never been rendered, and 03-11's precedent for CONT-01/CONT-02 included a browser
confirmation before either was ticked. `[~]` is this project's own convention, invented at the 02.1-12
gate for exactly this shape of evidence, and the legend in `REQUIREMENTS.md` now says it is project-wide
rather than a CELPIP quirk.

The requirement carries, inside itself: what is written (measured, per scenario); what the tick rests on;
**what a human saw — nothing**, with all ten unobserved items named; **"more reading" as a deliberate
deferral** the user declined knowingly at 04-08 on a measured ratio argument, because D-01's own wording
asked for it and this phase did not deliver it; and why `native/pronunciation` is deliberately the
smallest of the five.

## 8. The ledger at the close of Phase 4

**66 entries · 48 open · 17 fixed · 1 waived.** The world-page entry (**34**) was already closed by 04-08
at commit `47454ef` and needed no action here. Five entries added:

| id | What it records |
|---|---|
| **62** | The unperformed browser pass, its ten items, and the two beta-user findings that outrank them |
| **63** | **Option D declined by name** — the only 04-08 option with no ledger record. A/B/F are entry 61. D was declined on an **engineering** price (eight harness blocks, reshaping all nine writing pairs) where A/B were declined on a **content** ratio; a later reader should not conflate the two arguments |
| **64** | The reader pass: the four judged findings, the particle-stoplist artefact, and the three-of-five metalanguage echo |
| **65** | The corpus figure settled at four commits, and the broken harvester disabled rather than documented |
| **66** | **The `state.*` defect consolidated in one place with its root cause**, superseding the scattered records in 45/50/51/60 and nine summaries |

Two entries the plan asked to be re-recorded were already open and were **not duplicated**:
**55** (`FALLBACK_LESSON` asserted dead rather than deleted — 04-04's open question, still open) and
**59** (the strengthened, measured case for deferred **VOICE-01**).

## 9. The tooling defect — WINDOWS 45/60/66, seventeenth consecutive occurrence

Consolidated into entry **66** with its root cause, per the plan's instruction to stop leaving it
scattered. In summary: `last_activity_desc` is truncated by a **line-oriented read** of a hard-wrapped
paragraph (write it on one physical line, and write the frontmatter field last); `update-progress`
destroys the informative Progress parenthetical; `advance-plan` and `record-session` **both** reset
`total_phases` 6 → 5; `add-decision` stamps `[Phase ?]`; `record-session` writes `stopped_at` unquoted;
and at 04-08 `roadmap.update-plan-progress` reported `complete: false` and **wrote nothing at all**.
**The ordering rule is the load-bearing line: every hand-correction must be made after the LAST `state.*`
verb runs**, never between verbs, or a later verb silently reverts it.

**What fired this run**, diffed against a snapshot taken before the first verb:

| Field | What happened | Corrected to |
|---|---|---|
| `total_phases` | reset **6 → 5** again, against a ROADMAP defining six | 6 |
| `stopped_at` | written **unquoted** where every other value is quoted | re-quoted |
| `**Current focus:**` | never advanced — still read "8 of 9 plans" | Phase 05, with Phase 4 closed at 9 of 9 |
| body `Progress:` | informative parenthetical destroyed for a bare `100%` | restored, naming 45 of 45 written plans and 5 of 6 phases |
| body `Last activity:` | still 04-08's prose | rewritten on **one physical line** |
| decision rows | all **five** of mine stamped `[Phase ?]` | `[Phase 04]` |
| `roadmap.update-plan-progress` | reported `complete: false` **again**, and left the phase checkbox and the table status stale | phase marked `[x]`, row set to Complete by hand |

**One genuine improvement, recorded as such:** unlike at 04-08, `roadmap.update-plan-progress` *did*
write its plan counts this time (8/9 → 9/9 in both the `**Plans**:` line and the phase table row). It
still reported `complete: false` and still flipped neither status marker.

**The blanket-replace trap was avoided and proved avoided:** `[Phase ?]` **decision rows** numbered
**113 before the first verb and 113 after all corrections** — only my five moved to `[Phase 04]`. Counting
raw occurrences instead would have read 122 → 117, because the token also appears inside
`last_activity_desc`; the row-level count is the one that answers the question. `last_activity_desc` was
written **last** and on **one physical line**, and re-parses as a JSON string (5,592 chars).

## 10. Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] My own independent id check was wrong twice before any gate was**

- **Found during:** Task 1A, by the check's own DISAGREE branch firing.
- **Issue:** it called the bank accessors with a composite key when they take `(worldSlug, scenarioSlug)`,
  reporting 0 emitted against 651 recorded; then it double-composed grammar ids, because scenario
  grammar's accessor already composes through `scenarioItemId` while phrases and vocabulary carry a bare
  slug.
- **Fix:** both corrected, with the asymmetry written into the script as a comment so the next reader does
  not repeat it. The upside is real: the DISAGREE branch was proved live twice before its AGREE was
  believed.

**2. [Rule 1 — Bug] My reader-pass metric deleted the unit under test**

- **Found during:** Task 1C.
- **Issue:** a conventional stoplist stripped particles, scoring `catch up` against `catch on` at
  **J = 1.000**.
- **Fix:** particles retained as content words; the artefact recorded in WINDOWS 64 because the next scan
  of this world will hit it.

**3. [Rule 2 — Missing critical] The broken corpus harvester was still importable, and still imported**

- **Found during:** Task 1A, checking 04-08's third finding.
- **Issue:** `scan.mts` and `probe.mts` imported 04-05's `corpus.mts`, which silently drops 492 of 4,440
  fields. A scan run through it reports "clean" over a corpus missing exactly the surfaces most likely to
  collide.
- **Fix:** `corpus.mts` now throws on evaluation, naming `corpus2.mts`; proved by running `scan.mts` and
  watching it exit 1. Scratch tooling, so nothing in the repo changed.

**4. [Rule 3 — Blocking] The exit code was read through a pipe, once**

- **Found during:** the first attempt to run the harness in the bare scratch export, which reported
  `EXIT=0` for a run that had genuinely crashed on a missing `zod`.
- **Fix:** every exit code in this plan is captured **directly** into a variable or from `spawnSync`. This
  is the same defect 04-01 and 04-02 each recorded; it affected no verdict, because it was caught before
  any number was written down.

**5. [Rule 3 — Blocking] `requirements.mark-complete CONT-04` was deliberately NOT run**

- **Issue:** the verb ticks a requirement to `[x]`. CONT-04's honest status is `[~]`, and running it
  would have silently destroyed the annotation that names the browser pass as unperformed — the exact
  overclaim this plan exists to prevent.
- **Fix:** `REQUIREMENTS.md` was edited by hand instead, and both the checkbox and the traceability row
  carry the `[~]` status with their evidence. **Note for the tooling:** there is no verb for
  "met with a stated limitation", so this convention can only ever be maintained by hand. Recorded so the
  next plan does not run the verb and quietly round CONT-04 up.

### Things I did not change

- **`CONT-04` to `[x]`.** Explained in §7. The browser pass was not performed and is not rounded up.
- **The four reader-pass findings.** All judged, all recorded with their numbers, none rewritten — every
  one would cost a changed hash on a committed id, which is the one-way door this phase exists to keep shut.
- **`FALLBACK_LESSON`** (WINDOWS 55) and **`native/register`'s briefing** (WINDOWS 57, now strengthened).
  Widening the briefing gate to all 35 scenarios is a decision about the gate; this plan does not own
  `scenario-lessons.ts`.
- **Any source file.** This plan modified `REQUIREMENTS.md`, `WINDOWS.md` and `AGENTS.md` and nothing else;
  `git diff HEAD -- src scripts` was empty before the sweep and after it.

## 11. Verification

Every `<verify>` block in both auto tasks was run. **All passed.** Exit codes captured directly.

| Check | Result |
|---|---|
| Task 1 — nine harnesses | **14,577 · 2,021 · 25,647 · 309 · 173 · 24 · 43 · 648 · 50** — all at baseline |
| Task 1 — `tsc` / `lint` / `build` | exit 0 · exit 0 (no warnings) · exit 0 from the committed tree after a `.next` wipe |
| Task 1 — `git status --porcelain` | clean but for a pre-existing untracked `.claude/` |
| Task 3 — `verify-scenario-content` + `verify-id-stability` | **14,577** and **2,021**, re-run after the edits |
| Task 3 — `git diff --stat` | `REQUIREMENTS.md` +74/−2 · `WINDOWS.md` +69/−5 · `AGENTS.md` +56/−2 |
| Mutation sweep | 19 declared · 19 executed · **17/17 caught** · 2 controls green · every restore IDENTICAL |
| Sweep tree vs a fresh `HEAD` export | **no differences** |
| Post-commit deletion check | none |
| Port 3000 | free before and after |

## Known Stubs

None. This plan renders nothing; it modified three planning/documentation files. Every count on every
surface remains derived from bank contents, and the derivation control was re-proved this run.

## Self-Check: PASSED

`04-09-SUMMARY.md`, `REQUIREMENTS.md`, `WINDOWS.md` and `AGENTS.md` all present on disk. Commit `6e183c5`
present in `git log`. `WINDOWS.md` re-parsed after editing: 66 entries in the JSON block, 66 rows in the
markdown table, frontmatter counts agreeing with both.
