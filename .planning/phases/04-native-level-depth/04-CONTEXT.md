# Phase 4: Native-Level Depth - Context

**Gathered:** 2026-08-01
**Status:** Ready for planning

<domain>
## Phase Boundary

The five Sounding Native scenarios — `idioms`, `phrasal-verbs`, `pronunciation`, `register`,
`culture` — carry genuinely native-level material rather than sitting at the same depth as the
other thirty scenarios.

In scope: **CONT-04 only**. Out of scope: new scenarios or new worlds (CONT-03 is closed), and
level graduation (CONT-05 is closed).

</domain>

<why_this_phase_shrank>
## The phase was rescoped on measurement, before planning

Phase 4 was "expand the 6 worlds to their complete designed topic coverage". Measured first:

| World | Designed topics | Scenarios today |
|---|---|---|
| Social | 7 | 7 |
| Work | 7 | 7 |
| Travel | 6 | 6 |
| Reading & Ideas | 5 | 5 |
| Practical | 5 | 5 |
| Sounding Native | 5 | 5 |

One-for-one in every world, and every example CONT-03 itself named — humor, favors,
networking, feedback, housing, banking — already exists. Levels span **A2 ×4, B1 ×11, B2 ×13,
C1 ×7**. So CONT-03 and CONT-05 were satisfied as a side effect of Phases 1–3 and are closed on
that measurement, recorded inside each requirement in `REQUIREMENTS.md`.

**Planning "expand the worlds" would have been planning work already done.**

</why_this_phase_shrank>

<measured_starting_point>
## What the five scenarios hold today (measured 2026-08-01)

| Bank | Native scenarios covered | Items |
|---|---|---|
| phrases | 5/5 | **30** |
| vocabulary | 5/5 | **40** |
| speaking rehearsals | 5/5 | **5** (one per scenario, 3 moves each) |
| reading | 2/5 | 2 passages |
| grammar | 1/5 | 5 questions |
| writing | 1/5 | 1 task |

> **Corrected 2026-08-01.** This table first read 84 / 81 / 15. Those were my numbers and they
> were wrong: the counting script scanned a fixed window from each key and overlapped into
> neighbouring scenarios, and "15 rehearsals" was 15 *moves* across 5 rehearsals. Research
> caught it and reported the discrepancy rather than quietly using its own figures. The
> practical consequence: **the phase is ~2.5× larger than this document originally implied**
> if depth is expressed as a multiple of what exists today.

These are Phase 3's **floors**, not depth — six phrases and eight cards per scenario, one
rehearsal each. Phase 3's own gate said so unprompted: `native/idioms` is original but "reads
like any ELT textbook", and plan 03-04 deliberately held this world to floors because depth
belongs here.

Note the reading/grammar/writing rows: those counts reflect which native scenarios *declare*
those skills, not a gap. Only declared pairs exist, and all 52 are written.

</measured_starting_point>

<decisions>
## Implementation Decisions

- **D-01 — depth means more of the same shapes, not new ones.** The user chose volume over new
  exercise types: large idiom and phrasal-verb banks, more reading, more rehearsals, using the
  content types and renderers Phase 3 already built. Rejected: designing new drill components
  (minimal pairs, word stress, intonation, register choice) — more valuable for sounding
  native, but it means building UI rather than writing content; and picking two or three areas
  to do deeply while declaring the rest.
  — **Reversibility:** reversible — content is additive, and new drill shapes can be added later
  without disturbing what this phase writes.

- **D-02 — the honesty mechanism is inherited and must not be weakened.** Coverage is derived
  from bank contents (`scenario-coverage.ts`, `EXERCISE_SOURCES`), so a claim cannot outrun the
  content. Depth must not be asserted anywhere it is not written.

### Claude's Discretion

- How much is "native-level" per scenario — the floor to aim for, given Phase 3's was 6 phrases
  and 8 cards
- Whether depth lands in the existing banks or in new per-scenario modules
- Whether any native scenario should declare a skill it does not declare today (that changes
  the 52-pair total, so it is a real decision — flag it rather than doing it silently)
- Sequencing across the five scenarios

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — CONT-04, and the measured closures of CONT-03/CONT-05
- `.planning/ROADMAP.md` §"Phase 4: Native-Level Depth (RESCOPED)"
- `src/lib/curriculum.ts` — the five native scenarios and their declared skills and levels
- `src/lib/content/phrases.ts`, `scenario-vocabulary.ts`, `scenario-speaking.ts`,
  `scenario-reading.ts` — the banks to deepen, keyed `"world/scenario"`
- `src/lib/scenario-coverage.ts` — derived coverage; never hand-write a claim
- `src/lib/review-items.ts` — `scenarioItemId`, `SCHEDULED_ITEM_KINDS`; **an SRS id is a
  one-way door** (`AGENTS.md`): insert freely, never renumber
- `scripts/verify-scenario-content.mts` — 11,981 assertions; append one group, never weaken one
- `.planning/phases/03-every-scenario-practicable/03-11-SUMMARY.md` — the gate that flagged this
  world, and the two design echoes it recorded as accepted decisions
- `AGENTS.md` — the phase's inherited rules, including the mutation-sweep/`.next` hazard

</canonical_refs>

<specifics>
## Specific Ideas

- Phase 3's gate named `native/idioms` as the weakest content in the project — "the most
  canonical idiom list in existence". That is the bar to clear, and it is a judgement about
  *quality*, not volume: more canonical idioms would not fix it.
- It also recorded that four of five native rehearsals are the same drill (say it, say it
  again differently, name what changed) — accepted as a stated design decision because contrast
  is the only self-markable drill for style. Adding volume without addressing that leaves the
  most concentrated echo in the project untouched.
- The named residual risk of every content phase here has been **authoring fatigue producing
  near-duplicates**. The harness catches byte-identity only; each plan has run exact + Jaccard
  scans and a reader pass. Carry that forward.

</specifics>

<deferred>
## Deferred Ideas

- **New drill shapes** — minimal pairs, word stress, intonation, register choice. Rejected for
  this phase under D-01, not rejected forever.
- **Premium TTS/STT voice** — VOICE-01, v2 backlog. Pronunciation depth may make the case
  stronger; note it rather than acting on it.

</deferred>

---

*Phase: 04-native-level-depth*
*Context gathered: 2026-08-01*
