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
