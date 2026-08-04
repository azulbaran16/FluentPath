---
phase: 04-native-level-depth
plan: 05
subsystem: scenario-content
tags: [content, register, srs, harness, gate, pairing, additions-only]
status: complete

requires:
  - "04-01's id-stability gate + fixture — 28 additions regenerated into it in the same commits, zero retirements"
  - "04-01's session-length invariant — native/register's minutes raised under it twice, not around it"
  - "04-01's recall-batches contract — the 42-card deck inherits batching with no change to the renderer"
  - "04-04's corpus-scan-before-authoring precedent, and its rule that a surviving mutation is the mutation's fault first"
provides:
  - "the pairing gate for native/register: even length, alternation by slug prefix, and nine adjacent pairs — the first assertion in the project on ARRAY ORDER as a teaching property"
  - "a 24-card deck that is mostly GRAMMAR (full form, agentless passive, distancing past, nominalisation, bare imperative), which is what research says carries register in English"
  - "the first plan in this phase to need NO human retirement decision — every id is an addition"
affects:
  - "04-06 … 04-09: native/register is finished; native/pronunciation and native/culture still sit at Phase 3 floors"
  - "anyone inserting a tenth situation into native/register — it must go in as TWO consecutive entries, casual first, or the harness fails"

tech-stack:
  added: []
  patterns:
    - "asserting an ORDERING invariant that no field records: the pairing of contrasting halves is carried by array adjacency alone, so the property has to be asserted rather than typed"
    - "splitting one invariant into three separable checks (even length / alternation / adjacency) and proving by a negative mutation that the third is not redundant with the second"
    - "reading a whole deck consecutively AFTER the corpus scan passes — the scan catches cross-corpus duplication and is blind to two adjacent cards sharing one syntactic frame"
    - "a Spanish gloss rewritten for CLARITY that also lowers a Jaccard score is legitimate; rewriting one only to lower the score is not"

key-files:
  created: []
  modified:
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - src/lib/curriculum.ts
    - scripts/verify-scenario-content.mts
    - scripts/fixtures/scheduled-item-ids.json

decisions:
  - "FOUR of the sixteen planned cards were killed by the pre-authoring scan because another scenario ALREADY TEACHES THE UNIT — `understatement` (social/humor), `sign-off` (work/emails), `filler` (work/presentations, as `a filler word`) and `tag-question` (social/small-talk's grammar bank drills question tags). The plan named the first three explicitly; naming them did not make them free. Replaced by `downplay something`, `a salutation`, `textspeak` and `deferential`."
  - "The deck is deliberately more GRAMMAR than vocabulary — a full form, the agentless passive, the distancing past, nominalisation, a bare imperative. RESEARCH §5 says register in English is carried by grammar more than by word choice, and `ScenarioVocabCard` holds a marker perfectly well without becoming a new item type (D-01)."
  - "The pairing gate is THREE separable checks, not one. Even length catches the commonest mistake; alternation catches a pair inserted backwards, which even length cannot see; adjacency is stated separately because it is the property the RENDERERS depend on. A negative mutation (alternation neutered, a reversed pair appended) proved adjacency still fires — so check 3 is not redundant."
  - "NO id was retired and none was re-pointed, so no one-way-door decision was put to the user. This is the first plan in the phase where the existing content did not need replacing: the six Phase 3 entries are correct, their pairing already works, and the plan says so."
  - "The chase-up pair overlaps in SITUATION with the scenario's own speaking rehearsal (`one-chase-up-two-dials`). Kept, with different material (figures, not a file), and recorded as a judgement rather than buried — the rehearsal supplies no lines, so the warm-up feeding it is the scenario's intended structure, but a reader may reasonably disagree."

metrics:
  duration: "~55 min"
  completed: 2026-08-04
  tasks: 2
  commits: 2
  harness_assertions: 13832
  harness_baseline: 13477
---

# Phase 4 Plan 05: Nine Situations on the Dial, and the Pairing Gated Summary

`native/register` now teaches nine situations said twice instead of three, names twenty-four
markers a learner can point at in a sentence, and — for the first time in the project — has the
thing that makes the contrast legible **asserted** rather than left to whoever inserts the next
item: the pairing is carried by array order and by nothing else, and the harness now says so.

## What shipped

| | Before | After |
|---|---|---|
| `native/register` phrases | 6 (three contrasting pairs) | **18 (nine contrasting pairs)** |
| `native/register` cards | 8 | **24** |
| Advertised `minutes` | 9 | **17** |
| `verify-scenario-content` assertions | 13,477 | **13,832** |
| Scheduled ids under a committed hash | 576 (+15 retired) | **604 (+15 retired — unchanged)** |
| `verify-id-stability` assertions | 1,791 | **1,875** |
| Ids retired by this plan | — | **zero** |

## The nine situations

Three were already here and were not touched. Six are new.

| # | Situation | Casual half | Formal half | The mark that moves |
|---|---|---|---|---|
| 1 | A request | `casual-send-it-over` | `formal-earliest-convenience` | *(Phase 3)* |
| 2 | An apology | `casual-my-bad` | `formal-apologise-oversight` | *(Phase 3)* |
| 3 | A refusal | `casual-not-going-to-work` | `formal-wont-be-possible` | *(Phase 3)* |
| 4 | **Delivering bad news** | `casual-slight-problem-friday` | `formal-friday-no-longer-realistic` | a pre-shrinking opener vs `Unfortunately` fronted — softening in the FORM, never in the fact |
| 5 | **Chasing something overdue** | `casual-any-joy-with-those-figures` | `formal-still-awaiting-those-figures` | an idiom with no subject vs `still awaiting` + a date, i.e. a nudge vs a record |
| 6 | **Disagreeing with a decision** | `casual-not-sold-on-that` | `formal-reservations-about-the-approach` | `not sold on` vs the emphatic `do` + the nominalisation `reservations` |
| 7 | **Asking for more time** | `casual-give-me-till-monday` | `formal-wondering-about-an-extension` | `till` vs `until`; a direct ask vs the **distancing past** doubled with `might` |
| 8 | **Giving credit** | `casual-nice-one-that-was-all-you` | `formal-acknowledge-martas-part` | a two-word formula vs `acknowledge` + the full name — praise that survives in writing |
| 9 | **Correcting a mistake** | `casual-cced-the-wrong-sarah` | `formal-appears-to-have-been-copied` | `you` + an active verb vs the **agentless passive** — nobody erred, something happened |

Every one of the twelve new entries carries a tip that says who says it, to whom, and what it
costs to get that wrong. None translates its line. **Both halves of every pair carry the same
facts** — pair 4 misses Friday in both versions, pair 8 gives Marta the whole of it in both — which
is the rule the scenario's own writing task states and the failure it exists to prevent.

## Task 1 — the warm-up (`d24b3ba`)

Twelve entries appended as six adjacent pairs, casual first, keeping the `casual-` / `formal-`
slug convention. The six existing entries were not moved and not edited: they are correct, they
are live keys, and their pairing already works.

The header comment was rewritten to state the three rules the array obeys, and the third is the
one that matters in code:

> **Adjacency carries the pairing and nothing else does.** No field records which entry pairs with
> which; both renderers walk the array from index 0. A casual half separated from its formal half
> still type-checks, still passes every other assertion in the file, still renders eighteen
> perfectly good phrases, and quietly stops teaching the one thing this scenario exists for.

`minutes` went 9 → 13 at this commit (18 × 20 s + a 26-card deck × 15 s = 750 s; 13 min = 780 s,
30 s slack), then 13 → 17 at Task 2 once the deck reached 24.

Fixture: **12 added, 0 removed, 0 changed hashes**, regenerated in the same commit and idempotent
on re-run.

## Task 2 — the deck, and the gate (`1d591e3`)

### A. Sixteen cards, and why most of them are grammar

The organising claim, taken from RESEARCH §5 and stated in the deck header so the next author
inherits it rather than rediscovering it:

> `phrases.ts` holds nine situations **said**. This deck holds the **names for what changed**
> between the two sayings. A marker earns a card only if the learner can point at it in a sentence.

Which is why five of the sixteen are grammar rather than vocabulary — `a full form`,
`the agentless passive`, `the distancing past`, `nominalisation`, `a bare imperative` — sitting
beside Phase 3's `slang` and `jargon`. Four strands:

- **The grammar of the dial (5)** — `a full form (do not, cannot)` · `the agentless passive
  (it was sent)` · `the distancing past (I was hoping to ask)` · `nominalisation (the decision,
  not we decided)` · `a bare imperative (Send me the file.)`
- **The moves around bad news (4)** — `a softener (unfortunately, I'm afraid)` · `a discourse
  marker (well, right, so)` · `over-hedge something` · `downplay something`
- **What it looks like on the page (3)** — `a salutation (Dear Ms Ruiz, Hi Ana)` ·
  `textspeak (thx, asap)` · `plain English`
- **Who is in the room (4)** — `in-group language` · `effusive` · `deferential` ·
  `be on first-name terms`

The last strand is the Spanish-speaker strand, and it is the reason `deferential` is in the deck
at all: over-formality is a register error too, and its example says what it costs — *"The letter
was so deferential that the client assumed we had done something wrong."*

`ScenarioVocabCard` stays `{id, term, es, example}` — no new item type (D-01). With no `tip`
field, the mark lives where 04-04 established it lives: the parenthesis that names the marker's
instances, and an example that shows it doing work or doing damage.

Fixture: **16 added, 0 removed, 0 changed hashes**, regenerated in the same commit, idempotent.

### B. The pairing gate

A new group, `native/register: the dial is legible, because the pairing survives`, appended under
the file's two-edit rule (**zero new imports** — `getScenarioPhrases` was already imported).
Three separable checks plus a vacuity guard:

1. **The set resolves and is not empty** — without this the whole group is vacuous, because an
   empty array alternates and pairs perfectly.
2. **Even length** — an odd count is a half added without its partner: one situation the learner
   only ever sees said once, which is the one thing a dial cannot be shown with.
3. **Alternation by the slug convention** — every entry declares which half it is, and the
   declaration must agree with its index. This catches a pair inserted backwards, which even
   length cannot see.
4. **Adjacency** — pair *k* is the entries at 2*k* and 2*k*+1, one of each, in that order. Stated
   separately from (3) because it is the property the *renderers* depend on, and a failure should
   name the broken pair rather than a broken index.

Plus, per entry, a non-blank tip: in this scenario the tip is where the mark lives.

**The slugs deliberately do not share a stem** — `casual-my-bad` pairs with
`formal-apologise-oversight` — so matching suffixes is not, and must not become, the mechanism.
Adjacency is the mechanism, and adjacency is what is asserted.

**Measured clean before any of it was written:** 18 entries, 0 alternation violations, 0 untipped
entries, 9 well-formed pairs.

## Corpus-wide near-duplicate scan

Exact + Jaccard over word sets, run **before authoring** and again against the final committed
content. **3,744 authored corpus fields** across all 35 scenarios' phrases / vocabulary / grammar /
reading / speaking / writing / briefings plus all four global banks (vocabulary, grammar, reading,
writing) and the listening transcripts — with the scenario's own bank excluded so nothing matched
itself. Stopwords **not** stripped, so every score is an upper bound. Thresholds as this phase has
used throughout: any exact match is a defect, J ≥ 0.50 is investigated, J ≥ 0.60 is a defect.
132,840 comparisons for the phrases, 179,712 for the deck.

**Zero exact duplicates in any field.**

### The pre-authoring scan killed four cards, and three of them the plan had named

This is the fourth consecutive plan where the scan earned its cost, and the first where what it
killed was written into the plan itself:

| Killed candidate | Killed by |
|---|---|
| `understatement` | `social/humor#vocab#understatement` — same word, same card shape, example *"Calling minus ten 'a bit chilly' is classic English understatement."* |
| `sign-off` | `work/emails#vocab#sign-off` — same id, same term, and its example is the `Kind regards` one |
| `filler` | `work/presentations#vocab#filler-word`, glossed *"una muletilla"* |
| `tag-question` | `social/small-talk#grammar#weather-question-tag` **teaches the unit** — a B1 drill on forming tags, whose own explanation gives the interactional function |

The plan's action names *understatement*, *filler* and *formulaic sign-offs* explicitly. Naming
them did not make them free: a second scenario teaching the same unit is the D-01 failure at the
grain 04-01 established as real. Replaced by **`downplay something`** (the same territory as
understatement, a distinct lexical item), **`a salutation`** (the opener, where work/emails owns
the closer), **`textspeak`** and **`deferential`**.

### Two fields rewritten after drafting, and four examples rewritten after reading

- `salutation.es` was *"el encabezamiento de un mensaje"*, J = 0.500 against
  `practical/tech-support#vocab#error-message.es` *"un mensaje de error"*. Rewritten to **"el
  saludo inicial de una carta o un correo"** — which is clearer for a learner *and* drops the pair
  to 0.182. Worth stating the direction of that: the rewrite is legitimate because it improves the
  gloss; rewriting one purely to move a number is what 04-04 refused to do and this plan did not
  do either.
- `textspeak.example` was *"Textspeak belongs in a message to a friend and nowhere near a
  tender."*, J = 0.278 against the **existing, live** `stilted.example` *"'I should be most
  grateful' sounds stilted in a message to a friend."* — a shared six-word frame **inside the same
  deck**. Rewritten to *"Textspeak in a tender document costs far more than the keystrokes it
  saves."* (The existing card could not have been the one to move: its id is committed.)

**Then the twenty-four were read consecutively, which the scan cannot substitute for**, and it
found four shared *frames* that no Jaccard threshold flagged:

| Card | Was | Shared its frame with |
|---|---|---|
| `bare-imperative` | *"A bare imperative is ordinary in Spanish and reads as an order in English…"* | existing `blunt`: *"That reads as blunt in English, even though it's normal in Spanish."* |
| `downplay` | *"He downplayed the delay **so calmly that** nobody realised…"* | the card immediately above it, `over-hedge`: *"She over-hedged the cancellation **so thoroughly that** two people…"* |
| `effusive` | *"**Three** exclamation marks read as effusive here…"* | existing `hedge`: *"**Three** hedges in one sentence…"*, and the Spanish/English frame again |
| `first-name-terms` | *"…**would read as** a step backwards."* | existing `overfamiliar`: *"…**would come across as** overfamiliar."* |

All four rewritten. This is the "item twenty is item eight with the nouns changed" failure the
plan warns about, and it is invisible to a word-set metric: `over-hedge` and `downplay` scored
J = 0.15 on their examples while sharing an identical syntactic skeleton, adjacent on the page.

### Highest pairs, reported rather than gamed

**Deck — highest J = 0.500**: `over-hedge.term` *"over-hedge something"* against
`social/making-friends#vocab#bond-over.term` *"bond over (something)"*. A three-word denominator
sharing the function words *over* and *something*; zero shared teaching, and `X something` is this
repo's standard shape for a verb card (`flag something`, `let something slide`). Investigated
under the threshold, not a defect, not changed.

**Phrases — highest J = 0.375**: `casual-not-sold-on-that.text` against
`global/vocab/opinion` *"to be honest"* — a three-word denominator, and the overlap is the
line's hedging tail, which is itself register-relevant. Kept.

> **The same scans restricted to pairs where BOTH fields hold ≥ 6 words — where duplication
> actually matters — top out at J = 0.333 for the deck and score nothing at all ≥ 0.40 for the
> phrases.**

Within the new sets: deck 0.250, phrase tips 0.240 (Spanish function words plus the deliberately
shared frame of a register tip — *entre compañeros*, *a un cliente*).

**Nothing sat at or above J = 0.60, so this plan files no WINDOWS judgement of 04-04's kind.**

## The sitting

```
native/register:  18 x 20 s  +  42-card deck x 15 s  +  0 questions
                  = 360 s + 630 s = 990 s
                  minutes 17 -> 1020 s advertised -> 30 s slack
```

The deck is phrases **plus** vocabulary, so the warm-up is deliberately double-counted per 04-01's
documented conservatism. `minutes` was raised in the same commit as each bank growth — 9 → 13 at
Task 1, 13 → 17 at Task 2 — never after.

## Mutation sweep — 7 declared · 7 executed · 5 of 5 caught · 2 controls green · negative confirmed

The plan mandates no sweep. One was run anyway, because a gate that has never been observed to
fire is not yet a gate. Anchors are unique single-line substrings asserted at mutation time;
restore is an **in-memory byte snapshot** written back verbatim, never `git checkout --`; exit
codes come straight from `spawnSync`; a mutation counts as caught only if the harness fails **and**
its expected label appears.

| # | Mutation | Caught by |
|---|---|---|
| M1 | one half of pair 9 deleted — an odd-length set | "holds an even number of entries" |
| M2 | index 16's slug flipped `casual-` → `formal-`, the signature of an entry inserted between two halves | "at index 16 it declares itself the casual half" |
| M3 | a tenth pair appended **the wrong way round** — even length cannot see this | "at index 18 it declares itself the casual half" |
| M4 | a tip blanked — the entry keeps its line and loses the mark | "carries a non-blank tip" |
| M5 | the group's scenario key typo'd (`regsiter`) — the vacuity guard | "its phrase set resolves and is not empty" |
| N1 | **negative** — alternation neutered, M3 re-applied | the **adjacency** assertion still fires: *"pair 10 sits adjacent — formal-x-ten then casual-x-ten"*, proving check 3 is not redundant with check 2 |
| C1 | inert edit inside a `//` comment in `phrases.ts` | control — **green** |
| C2 | inert edit inside a block comment in the harness, `/*` left alone (04-04's C2 lesson, applied) | control — **green** |

**M3 reported "FAILED but WRONG LABEL" on the first run, and the mutation was the defect** — 04-04's
rule applied rather than restated. My reversed pair was inserted *before* the last entry, landing
at indices 17 and 18, where a formal-then-casual pair **alternates correctly**. The only assertion
that fired was the session-length one (20 phrases against `minutes: 17`). The group was right not
to fire; the mutation did not produce the defect it claimed. Fixed to **append** after the last
entry, so the formal half lands on the even index 18 — then caught on its own label.

Smoke-tested in both directions before any verdict was trusted: the **SURVIVED branch** was run
live (a genuinely inert comment edit, exit 0, with a byte-difference check so the test cannot be
vacuous), and the **ANCHOR-DEFECT branch** was run live (a deliberately non-unique anchor, 251
occurrences, refused with the file byte-identical).

**Post-sweep byte identity: IDENTICAL for both files.** Post-sweep tree: `git status` clean,
13,832 assertions.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] Four planned cards already taught by other scenarios; two fields and four examples rewritten**

Documented in full under the corpus scan. Four candidates never reached a draft; two drafted
fields and four drafted examples were rewritten before commit. **None of the collisions ever
reached a commit.** Commit `1d591e3`.

**2. [Rule 1 — Bug] `curriculum.ts` carried a stale sitting comment for `native/idioms`**

- **Found during:** Task 1, while editing the adjacent line.
- **Issue:** the comment above the `idioms` entry read *"18 x 20 s + a 26-card deck x 15 s = 750 s.
  The smallest whole minute that covers it is 13"* while the entry it describes says `minutes: 17`.
  04-04 raised the number and left the comment describing 04-03's arithmetic.
- **Fix:** comment-only, no behaviour — corrected to 04-04's actual 42-card deck and 990 s. This
  is the same class 04-04 itself brought into scope at `scenario-reading.ts`: a comment stating a
  number goes stale the moment the number moves.
- **Commit:** `d24b3ba`

### Things I did not change

- **The `over-hedge` / `bond-over` pair at J = 0.500.** A three-word denominator with zero shared
  teaching, and `X something` is this repo's own verb-card shape. Below the 0.60 defect threshold,
  investigated and reported rather than moved.
- **The chase-up overlap with the scenario's own rehearsal.** `one-chase-up-two-dials` asks the
  learner to chase a colleague and an agency; pair 5 is a casual/formal chase-up. Kept, with
  deliberately different material (figures requested on the 4th, not the rehearsal's Monday file),
  because the rehearsal supplies **no lines** — it asks her to produce them, and a warm-up feeding
  a rehearsal is this scenario's intended structure rather than the three-surfaces-one-expression
  defect 04-04 removed from `native/idioms`. Recorded as a judgement a reader may disagree with.
- **`CONT-04`.** Not ticked. This is plan **five of nine**, and two of the five native scenarios
  (`pronunciation`, `culture`) still sit at Phase 3 floors — a tick here is a claim outrunning the
  content, which D-02 forbids and which 04-03 had to revert.
- **`FALLBACK_LESSON`.** 04-04's open question is still open; nothing in this plan touches
  `scenario-lessons.ts`.
- **`native/register`'s briefing.** Its tips quote the *shapes* `"Can you…?"` and
  `"Would you be able to…?"`, which are the openings of pair 1's two halves. 04-04's
  briefing/bank separation gate is scoped to `native/idioms` and does not fire here. Flagged
  rather than fixed: widening that gate to a second scenario is a decision about the gate, not
  about this content, and this plan does not own `scenario-lessons.ts`. **Logged to
  `deferred-items.md`.**

## No one-way door was opened

**Zero ids retired. Zero ids re-pointed. Zero changed hashes across both commits.** The six
existing phrases and eight existing cards were not touched in any field. The two previous plans in
this phase each had to put a retirement to the user; this one did not, because the plan's own
reading was right — the existing `native/register` content is correct and its pairing already
works, so depth here is pure addition.

## Verification

Every `<verify>` block in both tasks was run. **All passed.** Exit codes captured directly.

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **13,832** assertions pass (baseline 13,477; 13,609 after Task 1) |
| `verify-id-stability.mts` | **1,875** assertions pass; **604** ids, 15 retired |
| Fixture diff, Task 1 | 12 added · **0 removed** · **0 changed hashes** |
| Fixture diff, Task 2 | 16 added · **0 removed** · **0 changed hashes** |
| `--update` idempotence (both tasks) | fixture byte-identical after re-running |
| Removed-line check on `phrases.ts` (Task 1) | exit 0 — nothing removed |
| Removed lines in `scenario-vocabulary.ts` (Task 2) | 3, **all `//` comment lines** (the header this task rewrote) |
| `minutes: 17` covers the sitting | 990 s needed, 1020 s advertised, 30 s slack |
| Corpus scan | **0 exact duplicates**; deck highest J = 0.500 (3-word denominator), phrases highest J = 0.375; ≥6-word view 0.333 |
| Mutation sweep | 7 declared · 7 executed · **5/5 caught** · negative confirmed · 2 controls green · byte-identity IDENTICAL |
| `npx tsc --noEmit` | exit 0 (both tasks) |
| `npm run lint` | exit 0, no warnings (both tasks) |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `-schema` / `-queue` / `-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged — zero packages installed |
| Port 3000 | free before and after |
| Payload | 191,945 B saturated over 705 scheduled ids — **18.3 %** of the 1,048,576 B cap (was 17.5 % / 677) |

**Build integrity (the 03-08 hazard).** The build ran only after `git status` showed the tree clean
of every mutation, and `.next` was wiped first. The rebuilt bundle holds
`formal-appears-to-have-been-copied`, `casual-any-joy-with-those-figures`, `agentless-passive`,
`in-group language`, the phrase text *"Any joy with those figures"* and `minutes: 17`. Checked
rather than assumed.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Nine situations, each said twice, adjacent and legible, every new line carrying a use-and-audience tip | ✅ 18 phrases, 9 pairs, 12/12 tipped |
| 2 | Twenty-four markers a learner can point at in a sentence | ✅ four strands, five of them grammar |
| 3 | No existing id touched; the id-stability gate green | ✅ 0 removed, 0 changed hashes, 1,875 assertions |
| 4 | The advertised sitting matches what the page mounts | ✅ 17 min, raised in the same commits as the growth |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived from
bank contents.

## Self-Check: PASSED

All five modified source files present on disk; both commits (`d24b3ba`, `1d591e3`) present in
`git log`.
