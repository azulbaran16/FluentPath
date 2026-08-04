# Phase 4 — deferred items

Out-of-scope discoveries made while executing this phase. Logged rather than fixed, per the
scope boundary: only issues directly caused by the current task's changes are auto-fixed.

---

## From 04-02 — pre-existing exact duplicates in the grammar corpus

Found by the corpus-wide exact + Jaccard scan 04-02's authoring rule mandates. **All six predate
this plan**, none involves an item 04-02 authored, and every one of them is a committed id — so
correcting any of them costs a retirement under the 04-01 id gate and belongs in a plan that has
budgeted for it.

Normalisation for "exact": lowercased, smart quotes folded, punctuation stripped, whitespace
collapsed. Distractor options are excluded from the exact-duplicate count (a two-word option
string colliding with another item's is not a duplicated teaching unit).

| # | Pair | Duplicated text |
|---|---|---|
| 1 | `work/emails#grammar#look-forward-to-gerund` prompt **==** global `b8` prompt | "I look forward to ___ from you." |
| 2 | global `a8` prompt **==** global `a17` prompt | "Look at those clouds — it ___ rain." |
| 3 | global `a5` prompt **==** global `a21` prompt | "There isn't ___ milk left." |
| 4 | global `c4` prompt **==** global `c14` prompt | "English ___ all over the world." |
| 5 | global `c6` explain **==** global `c18` explain | "Regret about the past → wish + past perfect." |
| 6 | global `d3` prompt **==** global `d11` prompt | "___ I really need is a holiday." |

**#1 is the interesting one** and the only cross-surface case: a scenario grammar prompt that is
byte-identical to a global grammar prompt. A learner who meets both is answering the same question
twice under two different ids, and only one of them namespaces to her scenario. It is the D-01
failure at the grammar grain, on a committed id, in a scenario 04-02 did not otherwise touch.

**#2–#6 are wholly inside the global bank** (`src/lib/content/grammar.ts`), which no plan in this
phase touches. They are duplicated drill items rather than duplicated teaching across surfaces, so
they are cheaper to fix and less harmful to leave.

Nothing here was changed. No assertion was added for it either: an assertion added now would fail
immediately on pre-existing content, and a gate that fails on arrival is a gate that gets disabled
rather than fixed — the lesson `02.1-05` recorded and the reason the phase progress meter is
printed rather than asserted.

---

## From 04-03 — `native/idioms`' briefing quotes two RETIRED phrases · **FOR 04-04**

**This one is not a pre-existing curiosity; 04-03 created it and could not fix it in scope.**

`src/lib/content/scenario-lessons.ts:125` — the first tip of `native/idioms`' briefing reads:

```
"“It's a piece of cake” = very easy. “Under the weather” = feeling ill.",
```

Both expressions were **retired from the phrase bank at 04-03** (`native/idioms#phrase#piece-of-cake`,
`native/idioms#phrase#under-the-weather`, recorded in `scripts/fixtures/scheduled-item-ids.json`).
So the briefing now teaches from a bank that no longer holds either one, and it teaches them the
way the retirement condemned — as a gloss, `expression = translation`, which is exactly the defect
the new `MIN_TIP_WORDS` / no-verbatim-`es` gate was written to stop appearing in tips.

**Why 04-03 did not fix it.** `scenario-lessons.ts` is not in this plan's `files_modified`, and the
plan states the briefing is 04-04's surface and that Task 2 "must leave them a clean field". A
briefing edit here would also have collided with whatever 04-04 writes.

**Severity: low, and honest.** Nothing crashes and no derived count is wrong — coverage is computed
from bank contents and briefings are not counted, so the page still claims exactly what it holds.
What is wrong is the pedagogy: the briefing's worked examples are now the two weakest items in the
scenario's history, and neither is recoverable from any exercise.

**What 04-04 should do, precisely.** Replace that tip's two worked examples with two of the
eighteen live phrases, choosing ones whose tips already carry the register mark — e.g.
`at-the-end-of-the-day` and `timing-isnt-ideal` — and write them as a use note rather than as
`expression = gloss`, so the briefing models the standard the bank is now held to. The other two
tips in that briefing ("Idioms are mostly informal…", "If unsure of an idiom, plain English is
always safe.") are still true and still consistent with the re-selected bank; only tip[0] moves.

**Also for 04-04 — the eight vocabulary cards.** 04-03's Task 1 table recommended retiring all
eight of `native/idioms`' cards on the same selection grounds as the six phrases (all eight are
the canonical core-idiom list; `bite-the-bullet` and `blessing-in-disguise` are additionally
duplicated in the global vocabulary decks). **It was not legal to do it in 04-03**:
`MIN_VOCAB_CARDS = 8` at `scripts/verify-scenario-content.mts:247` means a card retirement only
passes the harness in the commit that also lands its replacements, and 04-04 owns the deck. The
retirement list is therefore 04-04's decision to take, and it is a one-way door on live progress
exactly as the phrase list was — it needs the same explicit human approval before any id is
deleted.
