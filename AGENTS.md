<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workflow: GSD

Este repo usa GSD Core (open-gsd/gsd-core) como flujo de trabajo: para features, bugs
y trabajo no trivial usa los skills `gsd-*` (entrada: `/gsd-progress` o `/gsd-next`;
tareas pequeñas: `/gsd-quick` o `/gsd-fast`). El estado de planificación vive en
`.planning/`. GSD tiene prioridad sobre el flujo de Superpowers en este repo.

# FluentPath

Web app to learn English to a native level: interactive scenarios + AI tutor.
Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

- Curriculum (6 worlds + scenarios) lives in `src/lib/curriculum.ts` — single source of truth.
- Progress lives in Postgres as of Fase 2 — `User.progress` and `User.celpipProgress`.
  `src/lib/progress.ts` and `src/lib/celpip-progress.ts` are module stores behind
  `useSyncExternalStore`; localStorage is a cache plus an offline queue, not the source
  of truth. The shared contract is `src/lib/progress-schema.ts` (zod, strips unknown
  fields) and the merge rules are `src/lib/progress-merge.ts` — read both before
  touching either store. The merge must stay idempotent, commutative and associative:
  it re-runs on every authenticated load.
- CELPIP practice at `/celpip` covers all four skills as of Fase 2.1 — Writing, plus Reading
  (`src/lib/celpip/reading-set-1.ts`), Listening (`listening-set-1.ts`) and Speaking
  (`speaking-prompts.ts`, `rubric-speaking.ts`). All content is original: third-party study
  material is a format reference only and no sentence of it may enter the app. Section
  availability and every coverage line on the landing are **derived from bank contents**
  (`CELPIP_SECTIONS` in `src/lib/celpip.ts`) — never hand-written, so they cannot overclaim.
- **A CELPIP attempt is recorded when the learner LEAVES the results view** (Retry / Back to
  tasks), via each runner's `finalizeAttempt` behind a `finalizedRef` guard. Phase 1 chose this
  for Writing and Speaking, Listening and Reading all inherit it. **Known limitation: closing
  the tab from the results screen loses the attempt**, including a full 39-minute Reading
  sitting. `ProgressSync.tsx` wires `visibilitychange`/`pagehide`, but those flush the sync
  *queue* — on the results screen nothing is queued yet, so they do not help. Fixing it means
  wiring `finalizeAttempt` itself to those events in all three runners.
- Listening audio is the Web Speech API (`src/lib/celpip-speech.ts`), not recorded files.
  **Scripts are chunked one turn per speaker turn, ≤25 words each, and that is a correctness
  constraint rather than a style note:** Chrome truncates a single utterance at roughly
  fifteen seconds with no error and sometimes no `onend`, and the questions are revealed by
  that `onend` and by nothing else — so an over-long turn strands the learner on a screen with
  no words and no questions. `scripts/verify-celpip-content.mts` gates the ceiling at 35 words.
  A single-speaker news item is still written as many turns for this reason alone.
- Scenario practice is per-scenario as of Fase 3 — all 35 scenarios and all **53** declared
  scenario×skill pairs. Content is keyed by the composite scenario key `"world/scenario"`
  across `scenario-lessons.ts`, `phrases.ts`, `scenario-vocabulary.ts`, `scenario-grammar.ts`,
  `scenario-writing.ts`, `scenario-reading.ts` and `scenario-speaking.ts`. **Coverage is
  derived from bank contents** (`src/lib/scenario-coverage.ts`, `EXERCISE_SOURCES`) and never
  hand-written, so a claim cannot outrun the content: a bank that exists but is EMPTY still
  reports its pair unwritten and the page says so. Wiring a new skill bank is one entry in
  `EXERCISE_SOURCES`, one branch in `ScenarioPractice.tsx` — plus `reviewableIds()` **only if
  the renderer calls `recordAttempt`**. Three of the four exercise banks do not; adding an
  unscored id there puts a permanent phantom in the "Due today" count.
- **There is exactly ONE phrase accessor and it is strict.** `getScenarioPhrases` returns
  `undefined`, never a neighbour's set: the per-world fallback that used to hand every
  unwritten scenario three shared lines was deleted at 03-11. **A new scenario added without
  its own phrase set FAILS the content harness** ("every scenario resolves to a non-empty
  phrase set") rather than silently borrowing one. Add a scenario, add its six phrases in the
  same change.
- **A spaced-repetition id is a one-way door.** Every SRS item carries an authored slug and its
  stored key is composed by `scenarioItemId` alone as `world/scenario#kind#slug`. That string
  is the key its Postgres `srs` entry lives under and `mergeProgress` unions keys blindly, so
  **an id must never be renamed or renumbered once shipped** — a rename orphans live progress
  with no migration path and no way to detect it. Insert freely; never renumber.
- **The one-way door is now DETECTABLE, not merely documented** (`scripts/verify-id-stability.mts`
  + `scripts/fixtures/scheduled-item-ids.json`, added 04-01). Every scheduled id carries a
  committed SHA-256 of its **whole authored record, every field** — so rewriting a phrase's `tip`
  or a card's `example` under a live id is a re-point and **fails**, exactly as swapping the
  headline field does. Three rules follow, and all three are mutation-proved:
  **(1)** a new id must be regenerated into the fixture **in the same commit as its content**
  (`… verify-id-stability.mts --update`) — an id in the tree and not in the fixture fails as an
  unrecorded addition, which is what makes the gate mandatory rather than opt-in;
  **(2)** a deletion must be declared in `retired` **by hand, with a reason, before `--update` runs**
  — the script never invents one, and a retired id may never come back;
  **(3)** regenerate **once, after content is final**. `--update` deliberately refuses to launder a
  changed hash, and it cannot tell your uncommitted rewrite from a real re-point (04-07 tripped
  this; recover by restoring the fixture from `HEAD` and regenerating once).
  A replacement is therefore always *retire the old id, add a new one with its own slug* — never
  edit content behind an existing id.
- **The recall deck is batched, and `src/lib/recall-batches.ts` is the ONE author of the split**
  (D-03, 04-01). `recallBatches(items, ceiling = 16)`: empty → no batches; at or below the ceiling
  → exactly one batch holding the whole deck, so the scenarios nobody has deepened render
  byte-identically to before; above → the fewest batches that fit, sized so longest minus shortest
  is ≤ 1 (42 cards is 14/14/14, never 16/16/10). **All four `RecallDeck` callers inherit it —
  `ScenarioView`, `ReviewHub`, `ReviewView`, `MistakesView` — and there is deliberately no opt-out
  prop**, because `/review` is the longest un-pausable run in the app and so is the surface a rest
  point is worth most, not the one to exempt. **A component must never chunk by hand:** the harness
  reads `RecallDeck`'s source and fails if it stops calling the helper or spells any `Math.ceil` /
  `Math.floor` of its own. `RecallDeck` also snapshots its deck at mount on purpose, so rating an
  item correct cannot shrink the deck underneath the learner.
- **A scenario's advertised `minutes` is a GATED CLAIM, not a label.** `minutes × 60 >= phrases × 20
  + deck × 15 + questions × 30`, asserted for all 35 scenarios. **Any commit that grows a bank must
  raise that scenario's `minutes` in the same commit**, and the fix for a failure is always to raise
  `minutes` — never to lower a rate. Two properties are deliberate and must not be "corrected": the
  comparison is `>=`, so exactly zero slack passes (three scenarios sit there today), and the budget
  **double-counts the warm-up phrases**, because the deck is phrases *plus* vocabulary. That
  double-count is documented conservatism; removing it weakens the assertion.
- **The pair-count literals are tripwires. Raise them by hand; never make them self-comparisons.**
  `DECLARED_PAIRS.length === 53` and `COVERAGE_TOTALS.pairsTotal === 53` are written as literals so
  that declaring a skill *before* its bank exists fails loudly. Replacing either with
  `DECLARED_PAIRS.length === DECLARED_PAIRS.length` would be green forever and worth nothing. The
  cross-check between the two, and the separate `pendingPairs().length === 0`, are different
  assertions — keep all three.
- **Sounding Native's five scenarios are deliberately UNEQUAL, and that is recorded, not accidental.**
  `idioms`, `phrasal-verbs`, `register` and `culture` hold 18 phrases and 24 cards; `native/pronunciation`
  holds **12 and 16**, on purpose, with the reason written into both of its banks. The drills that
  scenario actually needs — minimal pairs, word stress, intonation *as exercises* — are new drill
  components, which D-01 rules out; and `PronunciationLab` scores word-by-word against the browser
  recogniser, so it cannot hear vowel length, aspiration or stress position at all. Volume buys less
  there than anywhere else, and padding it to a uniform floor would imply the five were deepened
  equally when they were not. Do not "fix" the inequality without reading those bank headers.
- Which exercises feed the review queue is deliberate: **phrases, vocabulary and scenario
  grammar are scheduled; writing, reading and speaking are not.** Those three compose ids for
  uniqueness and storage scoping only (`SCHEDULED_ITEM_KINDS` in `review-items.ts`) because
  nothing scores them — a drafted text, a comprehension question that cannot leave its passage,
  and a ticked self-report are not answers that can come due.
- **There is a SECOND vocabulary tier and it has its OWN key space, its own module and its own
  queue.** `src/lib/content/core-vocabulary.ts` holds **500** NGSL cards at `/core-vocabulary`,
  stored under `vocab:<slug>` — composed by `coreVocabItemId` in `src/lib/core-vocab-items.ts` and
  **nowhere else**. `parseScenarioItemId` does not parse it, `resolveReviewItem` does not resolve
  it and `reviewableIds()` does not list it, and **all three are deliberate.** The pseudo-scenario
  `core/vocab#word#<slug>` was designed first, measured against the live parser and found to be
  stored, merged and scheduled correctly and **never rendered** — the exact D-05 failure
  `review-items.ts` exists to prevent, reproduced in permanent keys. It is dead by decision; do not
  revive it. The `:` is the collision property, asserted against all four existing key spaces
  *and* against `no deck is named vocab`, because `vocabulary.ts` already builds deck-browser ids
  as `` `${deckId}:${i}` `` and `daily:0` exists today.
- **The volume deck's queue is its own, and that is a product decision (L5), not an oversight.**
  `/review` holds 752 scenario items earned across Phases 3 and 4 — the app's best content — and
  500 lower-tier cards in the same queue would bury it within days. The Leitner engine,
  `recordAttempt` and the `srs` store are **shared**; only the queue is not. **The trap that makes
  this non-obvious: `ReviewView` and `MistakesView` do not filter through `reviewableIds()` at
  all** — they resolve *every* stored id — so it is a branch in `resolveReviewItem`, not an entry
  in the enumerator, that would leak the deck into the due list and the mistake notebook. Both
  directions are asserted, from source and from behaviour.
- **The tier's lower bar is encoded in the TYPE.** `CoreVocabCard` is `{ id, word, es, example }`
  and has **no `tip` field, not even an optional one** — an optional field is a field an author
  forgets, so the bar has nowhere to hide. A word that needs a register note belongs in a scenario
  bank, where it gets a tip, a scenario around it and a place in `/review`.
- **WHICH words is derived from the NGSL, not chosen.** Below the deepest rank the deck reaches,
  every headword is either carded or declared in `core-vocabulary-skips.ts` with a reason from a
  closed list of four (`function-word`, `already-taught`, `no-base-form-example`, `cognate`).
  500 + 148 = 648 exactly. "Hard to example" is not a reason and never will be.
- **The payload has a STOP LINE at 40 % and a WALL at 100 %, and they are different things.** The
  wall is where the route answers 413, `sync-queue` classifies it permanent and drops the slot —
  silent, unrecoverable loss of a snapshot. The stop line is where a **human decides**. **The fix
  for a failing stop line is to stop and ask, never to raise the ceiling** — exactly as the fix for
  a failing session-length budget is to raise `minutes` and never to lower a rate. Measured at
  04.1-06: **317,038 B over 1,252 storage ids = 30.2 %**, at **223.7 B per volume card** (mean over
  all 500; five measurements, drifting +0.8 B per batch). CONTEXT's 272.8 B/id is an average over
  the *scenario* ids and over-states a volume card by 22 % — conservative, so nothing was decided
  wrongly on it, but do not extrapolate from it a sixth time. The harness prints the figure.
- **Two things about this deck no gate can see, recorded so they are checked by somebody rather
  than by nobody.** (1) **Subject-shape monotony** — bare plural / mass / inanimate subjects —
  needs animacy and part-of-speech, so it is deliberately printed and never asserted; it went
  wrong on the first draft of two batches in four. It is reader-checked, by the executor of any
  authoring plan **at draft time, before `--update`, while a rewrite is still free**, and by a
  phase gate's reader pass. (2) **A front answerable by a different English word** — the
  "taken front" re-glossing that avoids a duplicate front pushes a gloss off its headword's
  central sense (`standard` → "habitual", `complete` → "rellenar"). Both are open by name in
  `.planning/WINDOWS.md`, and both are fixed only by *retire and re-add*, never by an edit.
- The gate for all of it: `node --experimental-strip-types scripts/verify-scenario-content.mts`
  (**21,914** assertions) and `scripts/verify-id-stability.mts` (**3,524**, over 1,151 ids in
  **two** key spaces, 16 retired). Beside them, `scripts/verify-removed-cards.mts [baseRef]` —
  a pre-commit diff check, not one of the nine: **a removed card must have a matching
  hand-declared entry in the fixture's `retired` list, with a reason.** It compares parsed records
  rather than raw lines, which is why appending a member to a union (moving a semicolon) is
  invisible to it and a real deletion is not. The first two are low-conflict append targets — one
  import line, one group at the bottom. If any of them fails, fix the content; never weaken the
  assertion. **And a gate that has never failed is a gate nobody has tested:** aim a mutation at
  every assertion you add, require it to be CAUGHT *on its own label*, and keep controls that must
  survive — a non-zero exit from a syntax error is not a catch. 04.1-07 is the proof that this is
  not ceremony: it wrote a "no number in the copy claims a quantity" assertion, aimed two mutations
  at it, and **both survived** — the regex approximating "what a learner reads" was wrong in the
  direction that makes an assertion vacuous rather than loud. The check now asks TypeScript for
  `JsxText` nodes, because a node kind cannot be approximately right.
- AI tutor endpoint `src/app/api/tutor/route.ts` is a stub until `ANTHROPIC_API_KEY` is set (Fase 5).
- **A mutation sweep can poison a `.next` build that outlives it.** Sweeps restore source
  byte-for-byte and `git status` comes back clean while the build keeps the mutation — 03-08
  hit this (every scenario page served one passage; the minifier had dropped the rest as
  unreachable) and diagnosed it from the build's own source map, which records what the bundler
  read. Run sweeps in a worktree or a scratch copy, and rebuild from the committed tree before
  making any claim from a build.
- Design system & theme tokens in `src/app/globals.css` ("Traveler's Journal": Fraunces + Hanken Grotesk).
- Full plan & phases: `docs/plans/2026-06-19-fluentpath-design.md`.
