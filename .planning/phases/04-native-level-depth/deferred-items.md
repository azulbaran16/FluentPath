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

## From 04-03 — `native/idioms`' briefing quotes two RETIRED phrases · ✅ **RESOLVED at 04-04**

> **Closed by 04-04, commit `96e18e0`.** The briefing was rewritten: it no longer quotes
> `piece of cake` or `under the weather`, no longer teaches in the `expression = gloss` shape, and
> now demonstrates on `a lot on my plate` — an expression used on NO other surface of the scenario.
> 04-03's recommendation (reuse two of the eighteen live phrases) was **deliberately not taken**:
> the plan requires the briefing to demonstrate on material no other surface uses, and quoting a
> live phrase would have swapped one three-surface repeat for another. The separation is now
> asserted rather than trusted — `verify-scenario-content.mts` fails if any briefing surface of
> this scenario contains any of its own phrase texts or card terms. 04-03's other observation held
> exactly: tips 1 and 2 were still true, and only their wording moved.
>
> **Also closed:** the stale header comment at `scenario-reading.ts:753-756`, which asserted the
> banks "already teach fourteen expressions" and named five that are now retired. `scenario-reading.ts`
> was not in 04-04's `files_modified` either; it was fixed anyway (comment-only, no behaviour) on
> the coordinator's explicit instruction that a stale claim about retired content is the class of
> defect this phase exists to stop. Recorded as a deviation in `04-04-SUMMARY.md`.
> WINDOWS 53 and 54 are both marked fixed.

### The original entry, kept for the record

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

> ✅ **RESOLVED at 04-04, commit `0c4d821`.** The decision was presented, not taken: all eight cards
> were put to the user with the three facts per card, and the user answered **`stands`** — retire
> all eight. The presentation carried one fact 04-03 could not have known, and it changed the
> shape of the decision: **for the phrases, five of fourteen items survived in the global decks;
> for the cards it is two of eight.** Six of these expressions existed nowhere else in the corpus,
> so retiring them deleted them from the product rather than de-duplicating them, and that was
> said in as many words before the answer was given. Twenty-four replacements landed in the same
> commit, which is what made the retirement legal under `MIN_VOCAB_CARDS = 8`.

---

## From 04-04 — should the generic briefing record be DELETED? · **OPEN QUESTION for the phase gate**

**Filed rather than decided, exactly as 04-04's plan required.**

`getScenarioLesson` (`src/lib/content/scenario-lessons.ts:340`) resolves an unknown scenario key to
a single generic record, `FALLBACK_LESSON`. All 35 scenarios have a briefing of their own, so that
record is dead — and as of 04-04 it is **provably** dead: the harness asserts, on every run, that
every scenario resolves to its own briefing, checked both by reference (`!== FALLBACK_LESSON`,
which proves the accessor did not fall through) and by value (which catches a briefing written by
pasting the generic one).

**Why 04-04 asserted it dead instead of deleting it.** The accessor returns `ScenarioLesson`, not
`ScenarioLesson | undefined`. Deleting the record changes that signature and every call site — real
churn in files 04-04 does not own, to buy a safety property the assertion buys for nothing. 03-11
faced the identical situation in `phrases.ts` and took the other route: it deleted the fallback and
made the accessor strict, and `AGENTS.md` now records that as the rule ("there is exactly ONE phrase
accessor and it is strict").

**So the two precedents genuinely disagree**, and that is the question:

- **Delete it** — consistent with `phrases.ts` and with every other bank accessor, and it makes
  "this scenario has no briefing" a thing the type system can say. Costs a signature change and a
  sweep of call sites.
- **Keep it, gated** — what 04-04 did. Zero churn, and the safety property is already bought. Costs
  an inconsistency: one bank accessor in the project is lenient and the rest are strict.

Filed to `.planning/WINDOWS.md` as well. **Whoever next touches `scenario-lessons.ts` should settle
it** — not leave a third plan to find the same fork.

---

## 04-05 — `native/register`'s briefing quotes the shapes of its own phrase pair

**Found:** 04-05, Task 2, while checking whether 04-04's briefing/bank separation gate applies.

`scenario-lessons.ts:322-330`'s first tip reads *"Casual ↔ formal: “Can you…?” becomes “Would you
be able to…?”"*. Those are the opening shapes of pair 1's two halves —
`casual-send-it-over` (*"Can you send it over when you get a sec?"*) and
`formal-earliest-convenience` (*"Would you be able to forward it at your earliest convenience?"*).

**04-04's gate does not fire**, and correctly so: it is scoped to `native/idioms`, and it matches
whole phrase texts and bare card terms, not sentence openings.

**Not fixed, deliberately.** Two reasons:

1. This is weaker than the defect 04-04 removed. `native/idioms`' briefing quoted whole
   expressions the deck and warm-up also taught, three surfaces on one item. Here the briefing
   quotes a two-word *frame* (`Can you` / `Would you be able to`) which is the scenario's subject
   matter rather than an item of its content — arguably the briefing doing its job.
2. Deciding it means deciding whether the separation gate should be widened from one scenario to
   all thirty-five, which is a decision about the gate. `scenario-lessons.ts` is outside this
   plan's `files_modified`, and 04-04 already has an open question on that file.

**For whoever widens the gate:** the check would need a notion of a phrase PREFIX, not a whole
text — and it should be measured across all 35 briefings before being written, because several
briefings legitimately name the structure their scenario teaches.
