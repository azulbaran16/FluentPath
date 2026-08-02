---
phase: 04-native-level-depth
plan: 01
subsystem: scenario-content
tags: [content, srs, harness, recall-deck, gate]
status: complete

requires:
  - "Phase 3's derived-coverage machinery (scenario-coverage.ts, EXERCISE_SOURCES)"
  - "review-items.ts scenarioItemId / SCHEDULED_ITEM_KINDS — the one id author"
provides:
  - "src/lib/recall-batches.ts — the ONE author of how a recall sitting is split"
  - "scripts/verify-id-stability.mts + scripts/fixtures/scheduled-item-ids.json — the re-point detector every later plan in this phase runs"
  - "the session-length invariant: minutes x 60 >= phrases x 20 + deck x 15, gated for all 35 scenarios"
  - "the saturated-payload assertion, against the route's own cap read from source"
affects:
  - "all four RecallDeck callers: ScenarioView, ReviewHub, ReviewView, MistakesView"
  - "every later plan that adds or retires a scheduled id — the fixture must be regenerated in the same commit"

tech-stack:
  added: []
  patterns:
    - "a pure, React-free, alias-free module as the single author of a rendering rule, asserted by the harness rather than by poking the component"
    - "a committed hash fixture as the detector for an otherwise-undetectable one-way-door edit"
    - "reading a constant out of another module's SOURCE when importing it is impossible, so two numbers cannot drift"

key-files:
  created:
    - src/lib/recall-batches.ts
    - scripts/verify-id-stability.mts
    - scripts/fixtures/scheduled-item-ids.json
  modified:
    - src/lib/content/phrases.ts
    - src/lib/content/scenario-vocabulary.ts
    - src/components/practice/RecallDeck.tsx
    - src/lib/curriculum.ts
    - scripts/verify-scenario-content.mts

decisions:
  - "The deck batches at 16 and ALL FOUR callers inherit it, with no opt-out prop — /review is the longest un-pausable run in the app, so it is the surface a rest point is worth most, not the one to exempt."
  - "The id-stability hash covers the FULL authored record, every field, so a partial edit under a live id (a rewritten tip, a rewritten example) fails exactly as a wholesale re-point does."
  - "An id in the tree and NOT in the fixture FAILS as an unrecorded addition. That inversion is what makes the gate mandatory rather than opt-in."
  - "`ran-into-at-the-airport` was RETIRED and replaced rather than edited, even though it had never been deployed — the only two legal moves on a committed id are leave it or retire-and-re-add, and taking the legal path proved rules 2 and 4 on real content."
  - "The session-length budget deliberately double-counts warm-up phrases. It is conservatism, documented beside the constants, and removing it would weaken the assertion."

metrics:
  duration: "~22 min"
  completed: 2026-08-02
  tasks: 4
  commits: 4
  harness_assertions: 12683
  harness_baseline: 11981
---

# Phase 4 Plan 01: The Tracer — native/phrasal-verbs Carried End to End Summary

`native/phrasal-verbs` now holds 18 warm-up phrases and a 42-card recall deck that arrives in
three batches of fourteen, honestly advertised at 17 minutes — and every plan after this one
inherits a committed gate that makes a silently re-pointed spaced-repetition id impossible.

## What shipped

| | Before | After |
|---|---|---|
| `native/phrasal-verbs` phrases | 6 | **18** |
| `native/phrasal-verbs` vocabulary | 8 | **24** |
| Recall deck (phrases + vocabulary) | 14, one linear run | **42, batched 14 / 14 / 14** |
| Advertised `minutes` | 9 | **17** |
| `verify-scenario-content` assertions | 11,981 | **12,683** |
| Scheduled ids under a committed hash | 0 | **538** (+ 1 retired) |

**Task 1 — the tracer (`1595c88`).** Twelve phrases, authored on a different rule from the first
six: the unit is verb + particle + **sense**. Ten of the twelve are a second or third sense of a
verb the scenario already teaches — `bring up` (raise a child, not raise a topic), `catch on`
(understand, not become popular), `pick up`, `fall out`, `take on`, `get away`, `look into`,
`make up for`, `turn up`, `pull off` — and the tip is what tells the senses apart. Every one of
the eighteen carries a register-and-use tip; none is a Spanish gloss.

`src/lib/recall-batches.ts` landed in the same commit, because depth is what *creates* the
un-pausable sitting the batching solves. It is pure, React-free and alias-free. `RecallDeck`
consumes it, keeps its mount-time snapshot with the comment recording why, and shows a rest panel
between batches. **A deck of 16 or fewer yields exactly one batch holding the whole deck**, so the
thirty scenarios this phase never touches render byte-identically to before.

**Task 2 — the gate (`725bda2`).** `scripts/verify-id-stability.mts` and its fixture. Scoped to the
scheduled kinds; hashes the whole authored record; four rules; an update mode that refuses to
launder a changed hash or an undeclared deletion into the fixture.

**Task 3 — the deck (`53a3d2f`).** Sixteen cards, one per sense. `take in`, `go off` and
`break down` each get two; `work out` gets three; the `term` names the sense and each example
could not be reworded into its sibling.

**Task 4 — the harness (`2811444`).** Three groups, appended under the file's two-edit rule.

## The contract later plans depend on

1. **`recallBatches(items, ceiling = RECALL_BATCH_CEILING)`** in `src/lib/recall-batches.ts` is the
   only author of the split. Empty → no batches. At or below 16 → exactly one batch holding the
   whole input. Above → the fewest batches that fit, sized so longest minus shortest is ≤ 1. The
   harness asserts this over lengths 0–60 **and** over all 35 real decks, and asserts from the
   renderer's source that it calls the helper and spells no `Math.ceil`/`Math.floor` of its own.
   **Do not add a prop to opt a caller out.**

2. **Every commit that adds or removes a scheduled id must regenerate the fixture in that same
   commit.**
   ```
   node --experimental-strip-types scripts/verify-id-stability.mts --update
   ```
   A legitimate diff is: **new id lines added, nothing removed except into `retired`, and not one
   changed hash on an id that already existed.** A retirement is `{ "id", "reason" }` added to
   `retired` by hand *before* re-running `--update`; the script never invents a reason. A retired
   id may never come back.

3. **A replacement is delete-the-old-id, add-a-new-one-with-its-own-slug.** Never edit content
   behind an existing id. The hash covers `{slug, kind, en, es, tip}` for a phrase,
   `{slug, kind, term, es, example}` for a card and `{slug, kind, level, topic, prompt, options,
   answer, explain}` for a grammar question — so a rewritten `tip` or `example` alone fails too.
   The covered-field list is enforced, not merely documented: the union of field names seen across
   every item is asserted against it, so a type that grows a field fails rather than going
   un-gated.

4. **`minutes` is now a gated claim.** `minutes × 60 >= phrases × 20 + deck × 15`, for all 35
   scenarios. **Any plan that deepens a bank must raise that scenario's `minutes` in the same
   commit.** The comparison is `>=`, so exactly zero slack passes; the budget double-counts warm-up
   phrases deliberately. The fix for a failure is always to raise `minutes`, never to lower a rate.

## Numbers

**Batch shape of the 42-card deck:** `[14, 14, 14]`. Not `[16, 16, 10]` — the evenness rule exists
so the last batch is never a stub.

**Saturated payload:** **173,143 B — 16.5 % of the 1,048,576 B cap**, over 639 scheduled ids
(538 scenario ids + 101 global grammar ids). 03-11 measured 143,830 B / 13.7 % over 611 ids; this
plan spent 2.8 points of headroom. Printed on every harness run. Asserted against the route's own
`MAX_BODY_BYTES`, **read out of `route.ts`'s source** rather than retyped, so the two cannot drift.

**`minutes` for the native world now:** idioms 10 · **phrasal-verbs 17** · pronunciation 10 ·
register 9 · culture 10. Tightest slack anywhere in the curriculum: 30 s, at
`practical/appointments` and `native/phrasal-verbs`.

**Corpus-wide near-duplicate scan** (exact + Jaccard over word sets, all 35 scenarios):
**zero exact duplicates** in any field. Highest pairs involving `native/phrasal-verbs`:

| Field | Highest cross-scenario | The pair |
|---|---|---|
| phrase text | 0.429 | `whats-he-getting-at` vs `social/making-friends/what-are-you-into` — **both pre-existing** |
| vocab term | 0.500 | `put-someone-up` vs `social/dating/stand-someone-up` — **both pre-existing** |
| vocab example | 0.278 | `turn-out-transpire` vs `social/complaining/out-of-order` |
| vocab `es` | 0.500 | `take-after` vs `social/humor/at-someones-expense` — **both pre-existing** |

Attributed same-world (comparable to 03-11's method): pairs involving a **new** item peak at
**0.200** on vocabulary terms, *below* the 0.333 pre-existing baseline, and at **0.214** on phrase
text against a 0.200 pre-existing baseline — that one on function words only ("I'll", "it").

Note: 03-11 recorded 0.14 / 0.00 for the same world. My scan does not strip articles, so
"a homophone" vs "a contraction" — two untouched Phase 3 items — scores 0.333 under it. The
measurements are **not directly comparable**; what is comparable is that this plan's items sit at
or below the pre-existing maxima.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] Three cross-scenario content duplicates the byte-identity harness cannot see**

- **Found during:** Task 3, by the corpus-wide scan the task itself mandates.
- **Issue:**
  - `native/phrasal-verbs#phrase#ran-into-at-the-airport` (authored in Task 1) taught `run into` in
    the same sense, with the same example frame, as `social/small-talk#vocab#run-into`. Two
    scenarios handed the same material — D-01's failure at the grain WINDOWS 39/41 established as
    real.
  - `come-across-impression` taught the same unit as `work/feedback#phrase#came-across-as`.
  - `come-across-find`'s Spanish gloss scored **0.750** against `social/small-talk#vocab#run-into`'s.
    The `es` field is the **front** of a recall card, so two near-identical fronts expecting
    different answers is a usability defect, not a stylistic echo.
- **Fix:** The two uncommitted items were replaced outright (`hold-up-delay`, `take-in-deceive`) and
  the gloss re-written to `"dar con algo sin ir buscándolo"` (0.000 overlap). The **committed** id
  was **not edited** — it was retired in the fixture with a reason and replaced by
  `didnt-think-wed-pull-it-off`, which carries its own slug. It had never been deployed, but the
  only two legal moves on a committed id are leave it or retire-and-re-add, and taking the legal
  path exercised rules 2 and 4 of the gate on real content one task after committing it.
- **Commit:** `53a3d2f`

**2. [Rule 3 — Blocking] `phrases.ts` modified in Task 3, which the plan assigned to Task 1**

The retirement above required touching `phrases.ts` in Task 3. Task 3's own removed-line assertion
covers `scenario-vocabulary.ts` only, and rule 2 of the id gate exists precisely to make a deletion
auditable, so the plan's machinery anticipated this. Recorded rather than hidden.

**3. [Rule 3 — Blocking] The payload cap could not be imported**

`MAX_BODY_BYTES` is a private const in a Next.js route; importing `route.ts` into a
`--experimental-strip-types` harness would pull in `next/server`, Prisma and auth. Rather than
retype the number (which the plan forbids) or export it (which would touch a file outside this
plan's scope), the harness **reads it out of the route's source** with the comment-stripping
technique the file already uses, and asserts it is parseable. Mutation N5 proves that assertion
fires when the literal stops being readable.

### Things I did not change

- **`take on too much`** also appears in `listening.ts`'s C1 interview transcript, and
  **`turned up late`** in `practical/housing`'s `estate-agent` example. Both are incidental
  co-occurrences on other surfaces — neither *teaches* the unit — and both ids are committed, so
  correcting them would cost a retirement for no pedagogical gain. Recorded here rather than fixed.
- `reviewableIds()` was not touched, as success criterion 7 requires.

## Verification

Every `<verify>` block in the plan was run. All passed.

| Check | Result |
|---|---|
| `verify-scenario-content.mts` | **12,683** assertions pass (baseline 11,981) |
| `verify-id-stability.mts` | **1,639** assertions pass; 538 ids, 1 retired |
| `--update` idempotence (Tasks 2 and 3) | fixture byte-identical after re-running |
| Removed-line assertions (`phrases.ts` T1, `scenario-vocabulary.ts` T3) | exit 0, nothing removed |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0, no warnings |
| `npm run build` | exit 0, from the **committed** tree after a `.next` wipe |
| `verify-merge` / `verify-schema` / `verify-queue` / `verify-headers` | 25,647 · 309 · 173 · 24 — all at baseline |
| `verify-celpip-sections` / `-content` / `-speech` | 43 · 648 · 50 — all at baseline |
| Dependencies | **11 prod / 11 dev**, unchanged |
| Port 3000 | free before and after |

**Build integrity (the 03-08 hazard).** Every mutation was restored and `git status` was verified
clean *before* `.next` was wiped and rebuilt, and the rebuilt bundle was then grepped for
`didnt-think-wed-pull-it-off` and `hold-up-delay` — both present, so the build reflects the
committed tree and not a stale or poisoned artifact.

### Mutation sweeps — 14 declared, 14 executed, 14 caught, 4 controls green

**Against the id-stability gate (8):** a hash that no longer matches; a fixture id absent from the
tree and not retired; a live id missing from the fixture; a retired id still emitted by a bank; a
**partial** edit (the `tip` only) under a live id, which is the headline claim — a hash over the
headline field alone would have passed it; `--update` refusing to launder a re-point. Two controls.

**Against the three new harness groups (6):** a scenario advertising less than it mounts; the
renderer spelling its own chunking arithmetic; the renderer no longer calling the one author; the
split silently dropping cards; the route's cap falling below the payload; the cap becoming
unreadable from source. Two controls.

**Two harness defects were found and fixed before any verdict was recorded**, which is the reason
the declared/executed/caught counting exists:

1. The first sweep runner read `$?` **through a pipe into `grep`**, so it was reading grep's exit
   status, not node's. Every mutation "survived" and — worse — the control "passed" spuriously. The
   control was lying.
2. The first mutation script read `process.argv[2]`, which is **undefined under `node -e`**
   (argv[1] is the first user argument). The mutation was never applied.

Both were caught by the declared-vs-executed count and by the "if a mutation survives, check
whether the mutation was defective first" rule. Anchors were thereafter extracted by unique
substring at generation time, asserted single-line and unique, and applied CRLF-safe.

## Success criteria

| # | Criterion | Status |
|---|---|---|
| 1 | 18 phrases, 24 cards, all additions, no id re-pointed | ✅ (one id **retired** and replaced — the legal path, not a re-point) |
| 2 | 42-card deck in batches of ≤16 through all four callers; ≤16 decks unchanged | ✅ 14/14/14; asserted |
| 3 | 17 minutes, and no scenario's minutes contradicted, under `>=` with documented conservatism | ✅ all 35 |
| 4 | Saturated payload asserted under the cap, figure printed | ✅ 173,143 B / 16.5 % |
| 5 | A re-point, a partial edit and an absent id all fail a committed gate | ✅ proved by mutation |
| 6 | Every id this plan authored is in the fixture, regenerated in the same commit | ✅ 538, additions-only diff |
| 7 | `reviewableIds()` not touched | ✅ |

## Known Stubs

None. Nothing in this plan renders a placeholder, and every count on the page remains derived from
bank contents.

## Self-Check: PASSED

All created files present; all four commits present in `git log`.
