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

## Recommended first move

Not a plan. A conversation with the sister, with three questions:

1. When you say "too basic" — is it too little, too easy, or too aimless?
2. What do you use Anki for that this does not do?
3. What would "you are ready" look like to you?

Her answers decide whether this is a content milestone, a levelling milestone or a
learning-path milestone. Scoping it before asking would be guessing at the one thing the real
user is best placed to answer.
