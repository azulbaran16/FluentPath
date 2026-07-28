---
phase: 02-server-side-progress
plan: 02
subsystem: api
tags: [crdt, semilattice, merge, srs, streak, associativity, mutation-testing]

# Dependency graph
requires:
  - phase: 02-server-side-progress
    provides: "02-01 — mergeProgress/progressEqual, the coerce funnel, the unionRecord primitive and scripts/verify-merge.mts"
provides:
  - "src/lib/progress-merge.ts — the complete D-01a per-field table as amended by D-01b and D-01c: mergeStreakPair, mergeDailyXp, pickGoalXp, mergeAttemptStat, mergeSrsItem"
  - "srsRecord/attemptRecord — entry-level coercion that drops half-formed entries and upholds the wrong <= tries invariant before the join sees it"
  - "scripts/verify-merge.mts — 3037 assertions, including executable evidence that the two rejected per-entry rules are non-associative"
affects: [02-04, 02-05, 02-06, 02-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Every merge rule is a lexicographic max over a total order whose key travels with the value it selects — the structural test for whether a rule can be associative"
    - "Rejected rules kept as executable shadow implementations in the verification script, asserted to diverge, rather than as prose"
    - "Invariants (wrong <= tries) enforced at coercion so the join can stay a plain max with no clamping"

key-files:
  created: []
  modified:
    - src/lib/progress-merge.ts
    - scripts/verify-merge.mts

key-decisions:
  - "srs[id] is selected entry-only (earlier due, then lower box) — the plan's paired-attempts-updatedAt rule is 02-01's proven non-associativity counterexample applied to a cross-map reference"
  - "The attempts same-day tie is broken on topic, not on tries — tries is independently maxed, so it inflates the winner's comparison key"
  - "todayXp/xpDay are keyed on xpDay alone, never on lastActive — the two days can disagree, and mixing them is what puts yesterday's total in today's ring"
  - "Half-formed srs/attempts entries are dropped at coercion rather than completed with invented values"

patterns-established:
  - "Pattern: a per-entry rule for a key-unioned map may depend only on the two entries — never on state-level fields, never on the paired entry in another map"
  - "Pattern: mutation-test every new assertion group; a mutation that produces zero failures is a coverage gap in the assertions, not a harmless rule"

requirements-completed: [PROG-02, PROG-05]

coverage:
  - id: D1
    description: "A learner with an abandoned 30-day streak and a fresh 1-day streak ends up with the fresh streak, not a fabricated 30"
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#streak pair (D-01c) — 'a 30-day run abandoned in January does not fabricate a streak today'"
        status: pass
    human_judgment: false
  - id: D2
    description: "Three states from three consecutive days merge to the same streak in either bracketing"
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#streak pair — the (Jan 10, 30)/(Jan 11, 1)/(Jan 12, 1) trio, all 27 orderings in both bracketings"
        status: pass
    human_judgment: false
  - id: D3
    description: "A vocabulary card un-marked on one device does not reappear after the next reconcile, including on a shared calendar day"
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#same-day vocab non-resurrection"
        status: pass
    human_judgment: false
  - id: D4
    description: "Today's XP ring never shows yesterday's total after a reconcile"
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#daily XP tuple — 'today's ring never shows yesterday's total' plus the split lastActive/xpDay fixtures"
        status: pass
    human_judgment: false
  - id: D5
    description: "An SRS item merged across devices keeps the box and due date computed together — never a box from one side with a due from the other"
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#srs per-entry rules — 'box and due are never mixed across sides'"
        status: pass
    human_judgment: false
  - id: D6
    description: "A question the learner just got wrong is not marked resolved by a merge with an older attempt record"
    requirement: PROG-02
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts#attempts per-entry rules — both directions asserted"
        status: pass
    human_judgment: false
  - id: D7
    description: "The complete rule set is still total, idempotent, commutative and associative across 13 fixtures"
    requirement: PROG-05
    verification:
      - kind: unit
        ref: "scripts/verify-merge.mts groups 1-4 — 2197 associativity triples, 169 commutativity pairs, 338 idempotence checks"
        status: pass
    human_judgment: false

# Metrics
duration: 20min
completed: 2026-07-28
status: complete
---

# Phase 2 Plan 02: The Full D-01a Per-Field Rule Table Summary

**Every field in `ProgressState` now merges by its own named rule — the streak pair, the XP ring, the daily goal, the mistake notebook and the review queue — and each rule that exists to prevent a specific defect has an assertion naming that defect, with 3037 of them passing under plain node.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 2 of 2
- **Files modified:** 2 (0 created, 2 modified)

## Accomplishments

- **`mergeStreakPair`** — the `streak`/`lastActive` pair moves as a unit from the later day; an equal day takes the larger streak. Two branches, no third. The module performs **no day-distance arithmetic at all**, which is what makes D-01c's rejected adjacent-day carve-out mechanically unwritable rather than merely undocumented.
- **`mergeDailyXp`** — `todayXp` and `xpDay` now move together keyed on `xpDay` **alone**. This was a real defect inherited from 02-01's coarse grouping: the pair rode `lastActive`, so a state whose `lastActive` and `xpDay` disagreed could contribute `todayXp` from one side and `xpDay` from the other — yesterday's total in today's ring. Caught by the TDD RED run, not by inspection.
- **`pickGoalXp`** — the later `lastActive` supplies the goal; a same-day tie keeps the **lower** value, unchanged from 02-01 and now documented as an asymmetry rather than a tie-break.
- **`mergeAttemptStat`** — `tries`/`wrong` take a max, while `resolved`, `lastWrongOption`, `topic` and `level` travel as one **point-in-time group** from the later-`updatedAt` side. A stale record cannot flip an open mistake to resolved, and a stale option index cannot stick to a resolved stat.
- **`mergeSrsItem`** — the `{box, due}` entry moves as a unit: earlier `due` wins, equal `due` takes the lower `box`. Because an incorrect answer writes box 0 with `due` = today (the smallest possible pair), a just-failed item beats any stale success outright — the behaviour truth 6 asks for, reached without any cross-map reference.
- **`srsRecord` / `attemptRecord`** replace 02-01's untyped `entryRecord`. Half-formed entries are dropped rather than completed with invented values, and the `wrong <= tries` invariant is enforced at coercion so the join itself stays a plain max with no clamping.
- **The header comment names three deliberate give-ups** — XP does not sum, a streak may not compound across devices, `goalXp` is asymmetric on a same-day tie — each with the reason it is unavoidable or chosen, so a later reader does not file any of them as a defect.
- **`scripts/verify-merge.mts` grew from 291 to 3037 assertions**, including group 19: executable shadow implementations of the two rejected per-entry rules, asserted to *diverge* under different bracketings, with the shipped rules asserted to agree on the same inputs.

## Task Commits

1. **Task 1: The streak pair, the daily-XP tuple, and the daily-goal carve-out** — `fd95992` (feat)
2. **Task 2: Per-entry rules for the SRS queue and the attempt stats** — `17792c6` (feat)

## Files Created/Modified

- `src/lib/progress-merge.ts` — +208/−21. New: `optNum`, `srsRecord`, `attemptRecord`, `pointInTime`, `pickAttemptSide`, `mergeAttemptStat`, `mergeSrsItem`, `mergeStreakPair`, `mergeDailyXp`, `pickGoalXp`. Removed: `entryRecord`, `pickWholeEntry`, `DailyGroup`/`dailyOf`/`pickDaily`. Still import-free at runtime and still loadable standalone under `node --experimental-strip-types`.
- `scripts/verify-merge.mts` — +369. Eight new fixtures added to the algebra rotation (13 states total), five new assertion groups, and the rejected-rule evidence group.

## Decisions Made

1. **`srs[id]` is selected entry-only.** See Deviation 1 — the plan's primary rule is a cross-map reference, which is 02-01's counterexample in a new coat.
2. **The `attempts` same-day tie is broken on `topic`, not on `tries`.** See Deviation 2 — `tries` is independently maxed, so it inflates the winner's own comparison key.
3. **`todayXp`/`xpDay` are keyed on `xpDay` alone.** `lastActive` names a different day and is merged by a different rule; using it here is precisely how the two fields get mixed.
4. **Half-formed entries are dropped, not repaired.** A fabricated `due` would enter the review queue as a real date and a fabricated `box` would change the interval the next correct answer schedules. Dropping is safe because coercion runs per side, so a readable entry on either side still survives the union.
5. **The `wrong <= tries` invariant is enforced at coercion, not in the join.** If every input satisfies it, `max(wrong)` belongs to a side whose own `tries` is at most `max(tries)`, so the merged pair satisfies it for free — no clamping in the join, and therefore nothing in the join that could break associativity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] `srs[id]` selection changed from "the side whose paired `attempts[id].updatedAt` is later" to the plan's own fallback, applied as the whole rule**

- **Found during:** Task 2, while checking the rule against the associativity group.
- **Issue:** The plan's primary rule reads the paired entry in a *different key-unioned map*. That is 02-01's proven counterexample with a per-entry timestamp substituted for `lastActive`. Concretely: state `a` holds `srs[k]` with `attempts[k].updatedAt` = Jul 1; state `b` holds `attempts[k]` at Jul 3 but **no** `srs[k]` (a shape the union can always produce, and which the merge must handle totally); state `c` holds `srs[k]` with `attempts[k].updatedAt` = Jul 2.
  - `merge(a,b)` keeps a's entry by union and inherits Jul 3, then outranks c → **a's entry**
  - `merge(b,c)` keeps c's entry by union and inherits Jul 3, then outranks a → **c's entry**

  The timestamp travels with the merge; the entry's provenance does not. The plan's own acceptance criteria require associativity, and the prompt's binding constraint from 02-01 requires per-entry rules to stay entry-only.
- **Fix:** The plan's stated fallback — earlier `due` wins, then lower `box` — is promoted to the whole rule. It is a lexicographic max over the entry's own values, so it is total, idempotent, commutative and associative, and it never mixes `box` and `due` across sides. It also lands the intended behaviour by construction: an incorrect answer writes box 0 with `due` = today, the smallest possible pair, so a just-failed item beats any stale success. The accepted cost is the one the plan already documented for the fallback — when the *older* record is the failed one, the learner gets one extra review.
  The plan's ordering-hazard safeguard ("compute both unions from the same unmerged pair, pass the original `attempts` into the srs picker explicitly") is satisfied a stronger way: `mergeSrsItem` takes no `attempts` argument at all, so there is no parameter through which a later refactor could reintroduce the hazard. That is noted at the call site.
- **Files modified:** `src/lib/progress-merge.ts`
- **Verification:** `scripts/verify-merge.mts` group 19 implements the rejected rule as a shadow function and asserts `(a·b)·c !== a·(b·c)` on the three states above, then asserts the shipped rule agrees under both bracketings on the same states. Plus 2197 associativity triples over 13 fixtures.
- **Committed in:** `17792c6`

**2. [Rule 1 — Bug] The `attempts` same-day tie-break dropped `tries` and kept `topic`**

- **Found during:** Task 2.
- **Issue:** The plan breaks an equal-`updatedAt` tie on "the side with more `tries`", then on `topic`. The `tries` rung cannot be used, because `tries` is itself merged with a max: a merged entry carries a counter its own winning group never had, and that inflated counter then wins a comparison the original would have lost. Counterexample, `e1` = (Jul 3, tries 1, topic "aaa"), `e2` = (Jul 1, tries 9, topic "xxx"), `e3` = (Jul 3, tries 5, topic "ccc"):
  - `(e1·e2)` takes e1's group by date and inherits tries 9, then beats e3 on the inflated count → **"aaa"**
  - `(e1·e3)` ties on date and e3 wins on tries, then beats e2 by date → **"ccc"**
- **Fix:** The tie is broken on `topic` (the plan's second rung) and then on the group's own canonical form for totality. Both rungs read fields that *travel with the group being selected*, so they cannot be inflated. This is the general rule the module now states explicitly: a selection key must travel with the value it selects.
- **Files modified:** `src/lib/progress-merge.ts`
- **Verification:** group 19 executes the rejected rule and asserts divergence; the shipped rule is asserted associative on the same three entries.
- **Committed in:** `17792c6`

**3. [Rule 2 — Missing critical functionality] `wrong <= tries` and non-negative counters enforced at coercion**

- **Found during:** Task 2 mutation testing.
- **Issue:** The plan asks the merge to preserve the invariant "wrong never exceeds tries", but a max on each counter only preserves it if the *inputs* satisfy it. A corrupt or hand-edited blob with `wrong: 9, tries: 2` would propagate straight through, and clamping inside the join would have introduced a non-max operation into the algebra.
- **Fix:** `attemptRecord` clamps at coercion (negative counters to zero, `wrong` to `tries`), which makes the invariant an input property the join preserves for free.
- **Files modified:** `src/lib/progress-merge.ts`
- **Committed in:** `17792c6`

### Process deviations

**4. TDD gate commits collapsed into one commit per task.** The plan marks both tasks `tdd="true"`, which normally produces separate `test(...)` RED and `feat(...)` GREEN commits. The execution constraints for this run specify **one commit per task**, so RED and GREEN were run as separate steps in the working tree (both failing runs recorded below) and committed together. The constraint was followed over the default gate pattern.

**5. `compareDay` used where the plan says `laterDay`.** The plan says to compare day strings "with the existing `laterDay` helper". `laterDay` returns the winning *value*; three of the new rules need the winning *side* so they can take a second field from it. `compareDay` (already in the module from 02-01) is the three-way form of exactly the same lexical comparison. `laterDay` is still used inside `mergeAttemptStat`.

---

**Total deviations:** 3 auto-fixed (2 correctness bugs in rules the plan specified, 1 missing invariant), 2 process notes.
**Impact on plan:** No scope creep, no file outside the plan's `files_modified` touched. Deviations 1 and 2 are the same class of correctness fix as 02-01's Deviation 1, and both are demanded by this plan's own acceptance criteria.

## Issues Encountered

- **A mutation-testing script destroyed its own backups and corrupted the module mid-task.** The backup used `$TMPDIR`, which is unset in this shell, so every `cp` failed silently and four mutations accumulated in `src/lib/progress-merge.ts` instead of being reverted one at a time. Caught immediately because the final restore-check reported 2 failures instead of 0. Recovered deterministically: `git checkout HEAD -- src/lib/progress-merge.ts` back to the committed Task 1 state, then the three Task 2 edits re-applied verbatim, confirmed by re-running the suite to the same 3026 assertions and by `grep -c 'pickWholeEntry\|entryRecord'` returning 0. Subsequent mutation rounds used an explicit scratchpad path with an abort-on-failure guard and a final `diff -q` against the backup.
- **The file is CRLF**, which silently broke one multi-line mutation pattern (`\n` does not match `\r\n`). It reported 0 failures and looked like a toothless assertion. Re-run as a single-line pattern it produced 12. Every mutation from that point on prints whether it actually applied.
- **Two mutations exposed genuine gaps in the new assertions**, which is the point of running them:
  - Removing the `box` requirement from `srsRecord` produced **0 failures** — no fixture had an srs entry with a readable `due` but an unusable `box`. Added `q-half`; the mutation now produces 2 failures.
  - Removing the `wrong <= tries` clamp produced **0 failures** — no fixture violated the invariant on input. Added `q-inv` and `q-neg`; the mutation now produces 3.
- **`npx tsc --noEmit` and `npm run lint` failed mid-run on files owned by the parallel sibling plan 02-03** (`src/lib/progress-schema.ts`, `scripts/verify-schema.mts`, mid-write). Confirmed zero errors attributable to `progress-merge.ts` or `verify-merge.mts` at the time, left the sibling's files untouched, and re-ran after 02-03 settled: both exit 0.
- **`npm run build` initially refused to start** — the sibling held the `next build` lock. Retried until the lock cleared; it then succeeded on the first real attempt.
- **02-01's `pickVocabSide` was not touched**, as the plan states. Its ladder and the property that keeps it associative (consult `lastActive` only when *neither* side carries an instant) are preserved; the new fixtures exercise it across 2197 associativity triples.

## Verification Results

Every `<verify>` block in the plan was run. All pass.

| Gate | Task | Result |
|---|---|---|
| `node --experimental-strip-types scripts/verify-merge.mts` | 1, 2 | exit 0 — **3037/3037 assertions passed** |
| `npx tsc --noEmit` | 1, 2 | exit 0 |
| `npm run lint` | 1, 2 | exit 0 |
| `grep -v '^\s*//' src/lib/progress-merge.ts \| grep -c 'daysBetween' \| grep -qx 0` | 1 | **PASS (0)** — no day-distance arithmetic anywhere in the module |
| `npm run build` | 2 | exit 0 — all 26 routes compiled |

### TDD gate evidence (RED before GREEN)

| Task | RED run | GREEN run |
|---|---|---|
| 1 | 2 of 1469 failed — `a null xpDay loses the pair outright`, `while the XP ring follows xpDay` (the real `todayXp`/`xpDay` mixing defect) | 1469/1469 |
| 2 | 11 of 3026 failed — every attempts rule, every srs rule, both drop rules | 3026/3026, then 3037/3037 after the two coverage gaps were closed |

### Mutation testing (do the assertions have teeth?)

Ten mutations, each applied to a verified backup and reverted with a checked `cp`, finishing with `diff -q` confirming the module was restored byte-identically.

| # | Mutation | Failures |
|---|---|---|
| M1 | `resolved` OR'd across sides instead of taken from the winning group | 1 |
| M2b | `srs` returns a box from one side with a due from the other | 12 |
| M3 | Reinstate the rejected "more `tries` wins the tie" rung | 1 |
| M4 | `srs` picks the *later* due (hides a just-failed item) | 2 |
| M5b | `streak` takes `max(streak)` with `max(lastActive)` — the shape D-01a forbids | 221 |
| M6 | `todayXp`/`xpDay` keyed on `lastActive` again (the pre-Task-1 defect) | 9 |
| M7 | `srs` entries repaired instead of dropped | 2 (0 before the fixture gap was closed) |
| M8 | `attempts` entries repaired instead of dropped | 2 |
| M9 | `wrong <= tries` clamp removed | 3 (0 before the fixture gap was closed) |
| M10 | Negative-counter clamp removed | 2 |
| M11 | Optional fields always assigned, including as `undefined` | 174 |

### Truths from the plan's `must_haves`

| Truth | Status |
|---|---|
| A 30-day streak abandoned in January plus a fresh 1-day streak today yields the fresh streak | **Proven** — `streak pair (D-01c)`, asserted in both argument orders and under a repeat merge |
| Three states from three days merge to the same streak in any order | **Proven** — the (Jan 10, 30)/(Jan 11, 1)/(Jan 12, 1) trio, all 27 orderings × both bracketings, plus 2197 general associativity triples |
| A vocabulary card un-marked on one device does not reappear, including on a shared calendar day | **Proven** — `same-day vocab non-resurrection`, with both sides carrying identical `lastActive`, and still absent after a second reconcile |
| Today's XP ring never shows yesterday's total | **Proven** — `daily XP tuple`, including the fixture where `lastActive` and `xpDay` name different days |
| An SRS item keeps the box and due computed together | **Proven** — `srs per-entry rules`, asserting the merged entry is byte-identical to one of the two inputs |
| A just-wrong question is not marked resolved by an older attempt record | **Proven** — `attempts per-entry rules`, asserted in both directions, including that the older `lastWrongOption` does not leak onto a resolved group |

## Known Stubs

None. Every rule in the D-01a table is implemented; nothing renders placeholder data and no data source is left unwired.

## Threat Flags

None. No new network endpoint, auth path or schema change — two pure modules, no runtime imports added. The mitigations the plan's register assigns to this plan are all in place and asserted:

- **T-02-05** (`streak`/`lastActive` tampering) — `mergeStreakPair`, two branches, no adjacency case, proven order-independent.
- **T-02-06** (`vocab` tampering) — unchanged from 02-01; whole-field selection on the D-01b instant, asserted on a shared calendar day.
- **T-02-07** (`attempts[].resolved` tampering) — the point-in-time group travels together from the later `updatedAt`, never OR'd; asserted in both directions.
- **T-02-08** (`srs[]` box/due tampering) — the entry moves as a unit and the tiebreaks bias toward reviewing sooner; asserted the merged entry equals one input exactly.
- **T-02-09** (write amplification from a non-convergent merge) — every rule value-only, 169 commutativity pairs and 2197 associativity triples asserted, so client and server converge and the reconcile stops writing.
- **T-02-SC** — no package installs in this plan.

## User Setup Required

None — no dependency, no schema change, no `Dockerfile` change, no environment variable.

## Next Phase Readiness

- **02-04 (retry queue)** — unaffected. The merge is still idempotent, so a replayed PUT remains harmless.
- **02-05 (CELPIP store)** — `unionRecord`, `maxNum`, `laterDay`, `laterInstant` and `compareDay` are all still exported and reusable. The constraint this plan establishes carries over directly: for `CelpipProgressState`'s attempt map, any per-entry rule must depend only on the two entries, and `drafts` is the whole-field/delete-site field that needs the D-01b instant.
- **02-07 (verification gate)** — nothing here has been observed in a browser, and nothing here needs to be: every rule is a pure function and every hazard case is asserted under node. What 02-07 still owes the phase is 02-01's list (one GET per load, shared state across consumers, cross-browser progress), unchanged by this plan.
- **A note for whoever revisits the merge:** the module now states the structural rule that both deviations came from — *a selection key must travel with the value it selects*. Every rule in the file is a lexicographic max over a total order satisfying that property. A new rule that fails it will pass a hand-check and fail the associativity group, so add fixtures to the `states` rotation before trusting a green run.

## Self-Check: PASSED

| Claim | Verified |
|---|---|
| `src/lib/progress-merge.ts` exists and contains the five new rule functions | yes — `mergeStreakPair`, `mergeDailyXp`, `pickGoalXp`, `mergeAttemptStat`, `mergeSrsItem` all present |
| `scripts/verify-merge.mts` exists and exits 0 | yes — 3037 assertions |
| Commit `fd95992` present in history | yes |
| Commit `17792c6` present in history | yes |
| No file outside `files_modified` was staged | yes — both commits touch exactly `src/lib/progress-merge.ts` and `scripts/verify-merge.mts` |
| No deletions in either commit | yes — `git diff --diff-filter=D` empty for both |

---
*Phase: 02-server-side-progress*
*Completed: 2026-07-28*
