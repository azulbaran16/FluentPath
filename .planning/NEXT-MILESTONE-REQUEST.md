# Next milestone — request captured 2026-08-04

**Status:** captured, NOT scoped. Needs `/gsd-new-milestone` or a brainstorming pass in a
fresh session. Recorded here because the session that received it had no context budget left
to scope it honestly.

## What the user asked for, verbatim in substance

Before the AI tutor (Phase 5), improve the app generally. **The beta user — his sister, the
real learner — says it is "too basic to learn English."** Three things follow from that:

1. Add content.
2. Add "an Anki functionality — an app for learning words".
3. Expand it so that **anyone can learn English through verifiable, effective routes**.

## The finding that reframes request 2

**The app already has Anki's core mechanism.** `src/lib/progress.ts:38` defines Leitner-style
box intervals; `:325-326` promotes on a correct answer and resets to box 0 on a wrong one;
due dates are computed from the box. Measured today: **752 schedulable items** across 35
scenarios, surfaced at `/review` with due/mistakes/weak-spots.

So "add Anki" cannot mean "build spaced repetition" — that shipped in Phase 2 and was filled
in Phase 3. It means something else, and **which something is the first question to settle**.
Candidate readings, none of them confirmed:

- **A deck-study surface.** Anki's model is "study *this deck* now"; ours is "review what is
  due across the whole app". Those are different products on the same engine.
- **Learner-created cards.** Anki's defining feature for many users. Nothing in FluentPath
  lets a learner add a word they met in the wild.
- **Deck import/export**, so she could bring an existing CELPIP or vocabulary deck.
- **A better algorithm** — Leitner is coarse next to SM-2/FSRS.
- **Volume.** Serious Anki decks run 5,000–10,000 cards. 752 is thin by that standard.

## The finding that reframes requests 1 and 3

"Too basic" came from the person the app is for, after using it. That outranks any internal
measure, and it is the second time she has been right about something no gate caught (the
first: CELPIP had no navigation entry at all — five phases of work reachable only by URL).

But "too basic" is ambiguous in a way that changes the whole milestone:

- **Too little content?** → volume work, the most expensive reading.
- **Too easy?** → the curriculum tops out at C1 across 35 scenarios; if she is already past
  the material, that is a levelling problem, not a volume one.
- **Too shallow a path?** → request 3's "verifiable, effective routes" suggests this: the app
  has scenarios and a review queue but **no ordered path** — nothing tells a learner what to
  do first, what comes next, or how they know they are ready to move on.

**Ask her which one before scoping.** These lead to three different milestones, and the
cheapest is not the same as the most valuable.

## What exists today, measured

| | |
|---|---|
| Scenarios | 35 across 6 worlds, all with own phrases + vocabulary |
| Scenario×skill pairs with their own exercise | **53/53** |
| Schedulable review items | **752** |
| CELPIP | all four skills, exam-shaped |
| Levels | A2 ×4, B1 ×11, B2 ×13, C1 ×7 |
| Ordered learning path | **none** |
| Learner-created content | **none** |
| Placement → path linkage | a placement test exists at `/diagnostic`; nothing consumes its result to route the learner |

## Constraints any scoping must respect

- **An SRS id is a one-way door.** See `AGENTS.md`. Any change to how cards are keyed touches
  live learner progress with no migration path.
- **Coverage is derived, never hand-written.** A new surface must report what exists by
  reading the banks, or it will overclaim the moment content lags.
- **The beta user has a dated CELPIP exam.** Anything that destabilises `/celpip` before it
  is a bad trade.
- **Phase 5 (the AI tutor) is still unplanned** and is the only large feature that does not
  exist at all. This request deliberately precedes it — that ordering was the user's call.

## ANSWERED 2026-08-04 — the ambiguity is resolved

The user asked his sister. **"Too basic" means too little content.** Not too easy, not too
aimless — volume. And "Anki" means what Anki is actually for: **learning words and their
meanings, to expand vocabulary massively.**

So this is a **vocabulary-volume milestone**, and the numbers make the gap concrete.

### What the research says a vocabulary needs to be

| Target | Words | What it buys |
|---|---|---|
| Beginner core (consensus) | 1,000–2,000 by frequency | top 2,000 ≈ **80 % of everyday text**, roughly A2–B1 |
| New General Service List | **2,809** | ~90–95 % of colloquial speech, 80–85 % of common written text |
| "Core deck" fluency claim | 8,000–11,000 | the whole journey |

**FluentPath has ~280 vocabulary cards.** That is about **10 % of even the beginner target**,
and ~1 % of a fluency deck. The sister is right, and she is right by an order of magnitude —
this is not a gap that another phase of hand-authored scenario decks closes.

### The tension this creates, and it is the real scoping question

Every card in this app today is **scenario-keyed and hand-authored**, and the measured rate is
**16 words of authoring per card**. Two thousand cards would be ~32,000 words — roughly **five
times Phase 4's entire output**, and Phase 4 took a full session per plan.

So volume at this scale cannot come from the pattern that got us here. The options, and none
is free:

1. **A frequency-list backbone** (NGSL is public and citable). Fast to reach 2,000+. But those
   cards are **not scenario-specific**, which breaks the principle every phase has enforced:
   content belongs to a scenario, and coverage is derived from it. A second, unkeyed card
   space is a real architectural decision, not a content one.
2. **Import an existing deck.** Fastest of all — and a **licensing question before an
   engineering one**. This project has held a hard original-content line since Phase 1
   precisely because third-party material was available and was refused.
3. **Learner-added cards.** Solves it for one motivated learner, not for "anyone".
4. **Generate them.** Cheap per card, and the quality bar this project has held — a register
   note that says who says it and what getting it wrong costs — is exactly what generation is
   worst at.

**Whichever is chosen, the SRS one-way door still applies**: 2,000 new ids are 2,000 permanent
keys. And the payload is already at 19.6 % of its 1 MiB cap with 752 items; 2,000 more needs
measuring before it is authored, not after.

## DECIDED 2026-08-04 — generate, two tiers, 500 first, grow gradually

The user has **no further budget**. Asked whether the cards could be generated, and approved
the shape below. This is the milestone's design; a fresh session executes it.

**The framing that made the decision easy:** every card in this app is *already* generated —
all 280 were written by agents. The question was never human-vs-generated. It is **what care
level, at what volume**. The 280 cost roughly a session per plan because each passed a
pre-authoring corpus scan, a consecutive read of the finished bank, and a mutation sweep. Two
thousand at that care is ~20 sessions. That is the budget that does not exist.

### The design

**Two tiers, declared honestly** — the same move this project has made with derived coverage
since Phase 2.1: never blend two quality levels and present them as one.

| Tier | Source of words | Card contents | Bar |
|---|---|---|---|
| **Volume deck** (new) | **NGSL**, public and frequency-ordered — solves *which* words for free | word · translation · one usage sentence | explicit and lower: **no register note** |
| **Scenario cards** (the 280 today) | hand-picked per scenario | term · gloss · example that cannot be reworded to carry another sense | unchanged — who says it, and what getting it wrong costs |

The UI must say which is which. Mixing them silently is the overclaim every phase has been
built to prevent.

### Start at 500, not 2,000

The user's own instruction: **start with 500 and add gradually.** Rationale accepted as given —
500 is one or two sessions, covers the A2→B1 jump where the beta user actually is, and shows
the real quality before committing twenty sessions to a deck that may not land. If she says
the cards are flat at 500, that is known for a tenth of the cost.

### What is NOT settled, and must be before a single card is generated

1. **Where the volume deck lives.** A new bank? A new field on the existing card type? A
   separate unkeyed space? This determines whether `scenario-coverage.ts` can keep deriving
   truthfully, and it is an architectural choice, not a content one.
2. **The id shape.** 500 ids are 500 permanent keys — `AGENTS.md`'s one-way door applies in
   full. The composite `world/scenario#kind#slug` does not fit a deck with no scenario.
3. **Payload.** 19.6 % of the 1 MiB cap at 752 items. 500 more must be **measured before
   authoring**, not after — and the growth path to 2,000 measured with it, or the gradual plan
   hits a wall it cannot back out of.
4. **The quality floor, written as an assertion.** At volume, prose quality degrades and the
   corpus scan cannot see it — it detects repeated words, not flat translations or dull
   examples. Whatever bar the volume tier holds must be gated, or it is not a bar.

**A generation run must not start before those four are decided.** Creating 500 permanent ids
in a shape nobody designed is the one mistake this project's id gate exists to make
impossible, and it would be made by moving fast rather than by moving wrong.

## DESIGN 2026-08-04 — the four open points, decided

### 1. Id shape — reuse the composite, do not invent a space

**`core/vocab#word#<slug>`.** A pseudo-scenario key, so it flows through every mechanism that
already exists — `scenarioItemId` composes it, `parseScenarioItemId` reads it,
`mergeProgress` unions it, `verify-id-stability` hashes it — with **zero changes to any of
them**. It is slash-bearing, so it cannot collide with the 39 global grammar ids, exactly as
the Phase 3 audit established.

**The one risk to check first:** if `verify-scenario-content.mts` asserts that every scheduled
id parses to a scenario present in `curriculum.ts`, `core/vocab` fails on arrival. Find that
assertion before writing a card. If it exists, the fix is to scope it to scenario kinds rather
than to weaken it.

**Deliberate consequence:** `core/vocab` is not in `curriculum.ts`, so it does **not** enter
`scenario-coverage.ts`'s 35/35 or 53/53. The honesty mechanism stays intact and the volume
deck cannot inflate a scenario claim. That is a feature, not an oversight.

### 2. Bank shape — a new file, and the lower bar encoded in the TYPE

`src/lib/content/core-vocabulary.ts` — alias-free, React-free, explicit `.ts` extensions, like
every other bank, so the harness can load it standalone.

```
CoreVocabCard = { id, word, es, example }   // NO tip field
```

**The missing `tip` is the design.** This project's own rule is that an optional field is one
an author forgets — so the volume tier's lower bar is expressed by the type having nowhere to
put a register note, not by a convention someone must remember. A card that needs one belongs
in a scenario bank instead.

### 3. Payload — measured, and it caps the ambition

At **252 bytes per scheduled id** (measured at 04-01) against a 1 MiB body cap:

| Added | Total | % of cap |
|---|---|---|
| +500 | 331 KB | **31.6 %** |
| +1,000 | 457 KB | 43.6 % |
| +2,000 | 709 KB | **67.6 %** |
| +3,000 | 961 KB | 91.7 % |
| +5,000 | 1.47 MB | **OVER** |

**The architecture caps at ~3,346 cards.** So the "grow gradually" plan has a real ceiling:
500 is comfortable, 2,000 is the practical limit with margin, and **the 8,000–11,000 fluency
deck is not reachable in the current JSON-column design at all** — that needs DATA-01
(normalised progress schema), which sits in the v2 backlog.

**And it does not fail gracefully.** The route answers 413 above the cap, and `sync-queue`
classifies 413 as *permanent* and drops the slot. Crossing the cap does not degrade — it
**silently stops syncing her progress**. So the growth path must be gated with headroom, not
discovered.

### 4. The quality floor, as assertions — including one that catches flatness

Mechanically gateable, and all of it belongs in the harness:

- every field non-empty; the `es` gloss is not the English word
- the `example` **contains the word** (inflected forms allowed) and is ≥ 6 words
- **no duplicate word** across the deck, and none against the 280 scenario cards
- **provenance**: every word is on the NGSL list, asserted against a committed copy

And the one that addresses the actual risk, since the corpus scan sees repeated words but not
dull prose:

- **a frame-diversity ceiling.** Signature each example by its opening shape (first two
  part-of-speech-ish tokens, or first two words lowercased) and assert **no signature exceeds
  ~5 % of the deck**. Five hundred examples that all begin *"I have a…"* pass every existing
  check and are exactly what "flat" means. This is the volume tier's equivalent of the
  consecutive read that caught repeated syntactic frames in Phases 3 and 4 — automated,
  because at 500 nobody will read them all.

## Recommended first move

A short planning pass on the four unsettled items above — bank shape, id shape, payload, quality gate — then the first 500. Not a generation run first.

## Sources

- https://ankicoredecks.com/
- https://en.wikipedia.org/wiki/New_General_Service_List
- https://en.wikipedia.org/wiki/General_Service_List
- https://refold.la/roadmap/library/learning-words-with-anki
