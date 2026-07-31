# Roadmap: FluentPath — Milestone "Completar producto"

## Overview

FluentPath is live but incomplete: practice modes, accounts, and billing exist, while progress is only loosely synced to the database, parts of the curriculum are thin, and the AI tutor — though coded — has never run for real users in production. This milestone finishes the product in five moves: first ship a free CELPIP Writing practice section (prioritized 2026-07-23 — the first beta user has an exam date), then make Postgres the authoritative home of learner progress (validated, retried, cross-device), then make every existing scenario fully practicable, then expand the curriculum to its full designed coverage including native-level content, and finally bring the AI tutor to life end-to-end — real Claude replies, scenario role-play, gentle correction, and progress credit. The tutor goes last, honoring the 2026-06-19 decision to complete everything free before switching on the paid feature. Commercial-launch work (Stripe live, domain, security hardening) is deliberately out of this milestone.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: CELPIP Writing Practice** - Free exam-prep section at `/celpip`: original Task 1/Task 2 bank, real-exam simulator (timer, word count), model answers + descriptor-based self-evaluation
- [x] **Phase 2: Server-Side Progress** - Postgres becomes the authoritative, validated, retry-safe home of learner progress across devices
- [x] **Phase 2.1: CELPIP Remaining Skills** (INSERTED 2026-07-30, URGENT) - Reading and Listening built to depth, Speaking to a usable minimum, before the beta user's exam
- [ ] **Phase 3: Every Scenario Practicable** - Audit and fill content so all existing scenarios offer real practice in every applicable skill, feeding SRS and weak topics
- [ ] **Phase 4: Full Curriculum Expansion** - Expand the 6 worlds to their complete designed topic coverage with graduated B1–C1 and native-level content
- [ ] **Phase 5: AI Tutor End-to-End** - Real Claude tutor live in production: scenario role-play, gentle correction, graceful gating/errors, progress credit

## Phase Details

### Phase 1: CELPIP Writing Practice

**Goal**: Any learner can realistically practice CELPIP Writing Task 1 and Task 2 — timed like the real exam, self-evaluated against descriptor-based checklists — for free, starting with the user's sister as first beta user
**Depends on**: Nothing (first phase; prioritized 2026-07-23 because the beta user has an exam date; self-eval mode needs no AI or server-side progress)
**Requirements**: CELPIP-01, CELPIP-02, CELPIP-03, CELPIP-04, CELPIP-05
**Success Criteria** (what must be TRUE):

  1. A learner opens `/celpip`, picks any of ~16 original tasks, and completes it under real exam conditions (countdown, 150–200 word guidance, plain editor) without losing text on refresh (draft autosave)
  2. On submit, the learner sees their text beside an original model answer and completes an interactive self-evaluation checklist written in our own words from the CELPIP descriptors
  3. When the timer expires the editor locks and offers submit-as-is or continue-untimed — never data loss
  4. Attempt history (per task: date, duration, word count, text, checklist) persists locally across sessions and is shaped for later DB migration
  5. No text from the third-party study material or official PDFs appears in the app — verified during review

**Plans**: 6/6 plans executed
Plans:

- [x] 01-01-PLAN.md — Tracer: end-to-end writing slice (data → storage → route → simulator → results → persist)
- [x] 01-02-PLAN.md — Task 1 email bank (~8 original formal-email tasks + model answers + tips)
- [x] 01-03-PLAN.md — Task 2 survey bank (~8 original opinion tasks + model answers + tips)
- [x] 01-04-PLAN.md — Simulator: countdown timer + expiry lock + autosave + descriptor self-eval rubric
- [x] 01-05-PLAN.md — Free /celpip landing: tabs, task cards, attempt history, mobile notice
- [x] 01-06-PLAN.md — Human verification gate (5 success criteria + no-third-party-text) — agent-driven browser verification; 2 defects found and fixed

**UI hint**: yes
**Design doc**: `docs/plans/2026-07-23-celpip-writing-design.md` (approved)

### Phase 2: Server-Side Progress

**Goal**: A learner's progress lives safely in the database — identical on every device, validated on write, resilient to network failures, and preserved when an anonymous learner signs up
**Depends on**: Nothing blocking (runs after Phase 1 by priority, not dependency)
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04, PROG-05
**Success Criteria** (what must be TRUE):

  1. A signed-in learner completes a scenario, then logs in from a different browser and sees the same completions, XP, streak, CEFR level, and due reviews
  2. Progress made anonymously before signup appears in the account after first sign-in — nothing lost
  3. A malformed progress write is rejected by the server without corrupting stored data, and corrupted stored progress loads as a safe default instead of crashing the app
  4. Progress recorded while the network is down reaches the server automatically once the connection returns — no silent loss

**Plans**: 7/7 plans executed
Plans:

- [x] 02-01-PLAN.md — Tracer: one shared store, one reconcile per load, merge-on-write end to end
- [x] 02-02-PLAN.md — Complete the D-01a merge: streak pair, daily-XP tuple, SRS/attempt per-entry rules
- [x] 02-03-PLAN.md — Shared zod contract: strip-and-save validation, safe reads, bounded payload
- [x] 02-04-PLAN.md — Persisted retry queue, flush triggers, and the discreet not-synced indicator
- [x] 02-05-PLAN.md — CELPIP persistence contract: additive column, zod shape, de-duplicating merge
- [x] 02-06-PLAN.md — CELPIP sync: merge-on-write route, module store, per-load reconcile
- [x] 02-07-PLAN.md — Live-data safety audit + full gate + human verification of the 4 criteria

### Phase 2.1: CELPIP Remaining Skills (INSERTED — URGENT) — ✅ COMPLETE 2026-07-31

**Status**: Complete. All six success criteria met — four fully observed in a browser, two
(Listening and Speaking) met with the stated limitations recorded under phase-exit debt below.
**Goal**: The beta user can practise CELPIP Reading and Listening in the real exam's shape, and rehearse Speaking with her own recording, before her exam
**Depends on**: Phase 2 (attempts persist through the server-side contract shipped there)
**Requirements**: CELPIP-06, CELPIP-07, CELPIP-08, CELPIP-09, CELPIP-10
**Inserted**: 2026-07-30 — the beta user's exam is under three weeks away and the app only covers Writing
**Success Criteria** (what must be TRUE):

  1. A learner opens `/celpip`, picks a Reading set, works through passages covering the exam's four parts under a timer, submits, and sees which answers were wrong and why
  2. A learner starts a Listening set, hears an original script read aloud (never reads it), takes notes, answers questions revealed only after playback, and sees an explained answer key
  3. A learner records a timed Speaking response in the browser, plays it back, and self-evaluates it against a descriptor checklist
  4. Attempts in all three sections appear in her account from any device, exactly like Writing attempts
  5. The `/celpip` landing offers the shipped sections as real, and is honest about anything still missing
  6. No text from third-party study material appears anywhere — verified during review

**Scope decisions (user, 2026-07-30):**

- Uneven by design: **Reading and Listening to depth, Speaking to a usable minimum** — no automated scoring anywhere
- **Listening audio uses the Web Speech API** already in the app, not recorded files. Accepted cost: it sounds more robotic than the real exam. Accepted benefit: it ships now, at no cost, and still trains note-taking and pacing
- All content original (same IP constraint as Phase 1)

**Exam format confirmed 2026-07-30:** the beta user's official study material settled every
format figure, closing RESEARCH assumptions A1 and A2. Reading is 4 parts / 38 questions /
39 minutes, timed **per part** (11/8/9/11), with fill-in-the-blank items in three of the four
parts. Listening is 6 parts / ~38 questions, the discussion part carrying **8** items, and
questions are revealed **one at a time after the audio ends**. Speaking is a real two-phase
timer (silent prep, then recording starts on its own): 30/90 for tasks 1 and 7, 60/60 for
tasks 5 and 6, 30/60 for the rest. Only structure was taken from those documents; D-06 stands
in full. Speaking task 3 ships a written scene description rather than an image — an open
content dependency, stated on the landing.

**Plans**: 12/12 plans executed

Plans:

- [x] 02.1-01-PLAN.md — Tracer: one Speaking prompt end to end (CSP → record → play back → self-evaluate → Postgres) — **complete 2026-07-31**; browser checkpoint approved, phone pass owed to plan 12
- [x] 02.1-02-PLAN.md — Landing becomes skill-aware and self-honest (coverage derived from the banks)
- [x] 02.1-03-PLAN.md — Speaking bank complete: 8 task shapes, full self-eval rubric, content harness
- [x] 02.1-04-PLAN.md — Listening plumbing: types, listeningAttempts, the speaker-turn speech driver, audio check
- [x] 02.1-05-PLAN.md — Listening runner + set 1 news-item part: the first hearable drill
- [x] 02.1-06-PLAN.md — Listening set 1: problem-solving and daily-conversation parts
- [x] 02.1-07-PLAN.md — Listening set 1: information and viewpoints parts
- [x] 02.1-08-PLAN.md — Reading plumbing + runner + the fill-in-the-blank control
- [x] 02.1-09-PLAN.md — Reading set 1: correspondence and information parts, reading harness group
- [x] 02.1-10-PLAN.md — Reading set 1: diagram and viewpoints parts (set complete at 38 items / 39 min)
- [x] 02.1-11-PLAN.md — Listening set 1: the three-speaker discussion part (8 items)
- [x] 02.1-12-PLAN.md — Phase gate: IP grep, full suite, production-header CSP check, browser + phone UAT — **automated half complete 2026-07-31; the browser pass is outstanding**

**Gate record (02.1-12, 2026-07-31)** — automated gate **and** browser pass. Read this before
planning the next milestone.

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Reading set, four parts, timed, explained key | **MET on desktop — the one section verified end to end.** Four part shapes, 38 items over 39 minutes; render order confirmed by DOM position (questions before blanks for correspondence); per-part clocks re-arm 11→8→9→**11**, part 4 re-arming despite sharing part 1's allowance, which proves the `key={part.id}` fix rather than assuming it; blanks 5/5/0/5; submission allowed at 2/38 and it graded; 36 explanation blocks on the results screen; no positional prose in the rendered DOM. Outstanding: no mobile pass, and nobody has worked it at a real pace |
| 2 | Listening heard-not-read, questions after playback, explained key | **PARTIAL.** 6/6 shapes, 37 items, 157 turns; D-04/D-05 re-proved at the served boundary (0 of 142 turns and 0 of 37 stems in the HTML). Questions were reached in a browser. **Not reached: the results screen and the post-answer transcript with speaker labels** (automation overshot twice) and the **55-minute clock** (untimed) |
| 3 | Speaking record → play back → self-evaluate | **PARTIAL.** All 8 shapes at the exam's confirmed windows; the Speaking tab and its Task 3 caveat were seen rendering. **No human has heard a recording play back** — a `blob:` element loads and `recordingSeconds` is right, which is not the same claim. Mic-indicator-on-stop is code-verified only |
| 4 | Attempts cross devices | **MET, observed end to end 2026-07-31.** Production build, real Postgres, fresh account: three sections' attempts reached the server (2,890 bytes, **no audio payload** — T-02.1-59 on live data); local storage was then **wiped entirely**, a second device by construction; on reload all five attempts came back and rendered with **per-skill metrics**, and the **Writing history was untouched** (T-02.1-62 against the data it was written to protect). A further Reading attempt took it to 6. All four sections round-trip. One known limitation recorded below |
| 5 | Landing honest about what is missing | **MET, fully observed.** Four real tabs switching grids, clean hydration, **no "Coming soon" anywhere**, Speaking's Task 3 caveat on screen. Coverage lines derived, not written: Writing 17, Reading 4/4, Listening 6/6, Speaking 8/8. The Listening caveat exists and ships in the same client chunk as Speaking's — it says *"spoken by your browser rather than played from a recording"* and never uses the word "synthesised", which is why an earlier text-match for that word found nothing |
| 6 | No third-party text anywhere | **MET both ways.** Repository-wide grep over `src` for the academy name, six prep-site names and the official archive filenames: 0 hits. Reviewer read-through of the Speaking rubric, all four Reading parts and the Listening scripts: original throughout. One disclosed borrowing, now a settled decision — see below |

**Decision (user, 2026-07-31): the four Speaking rubric dimension names stay verbatim.** "Task
Fulfilment", "Content & Coherence", "Vocabulary" and "Listenability" are the exam's own scoring
axes. They are how she will be marked, and renaming them would hurt her recognition on the day.
Recorded as a decision, not an open item — the only verbatim borrowing in the app, and a
deliberate one.

**What did NOT ship, so the next milestone inherits a known gap rather than a surprise:**

- **Only one set per skill.** One Reading set, one Listening set. A second set of either was never
  authored — she can sit each drill exactly once before the answers are known to her.

- **No recorded or premium-TTS audio.** D-03 stands; Listening is browser speech and sounds it.
  VOICE-01 in the v2 backlog owns the replacement. The data model already takes an optional
  `audioUrl` without migration.

- **No image for Speaking task 3.** The scene is written out. Stated on the landing and in the
  prompt; needs only an optional `sceneImage` field when a genuine original image exists.

- **No automated scoring anywhere** (D-02, deliberate). Reading and Listening self-score against
  objective keys; Speaking and Writing are learner self-evaluation. AI evaluation waits on Phase 5.

**Phase-exit debt — carried forward as debt, not as blockers. The phase closes with these open:**

- **Nothing has ever run on a phone or on Safari, and this is the one that matters most.** She
  has a dated exam and is most likely to practise on the bus. Every mobile-specific control
  built in this phase is therefore unexercised on the devices it exists for: the MediaRecorder
  WebM→MP4 container probe (written *precisely* for Safari before 18.4, which supports MP4
  only), the iPhone hardware-silent-switch guidance in the audio check, the native select as an
  iOS/Android system picker, and whether four inline selects sit legibly in one paragraph at
  phone widths. If one item is picked up after this phase, it should be this one.

- **Close the tab from the results screen and the attempt is lost** — including a full 39-minute
  Reading sitting. `finalizeAttempt` runs on results-view *exit* (Retry / Back to tasks), the
  pattern Phase 1 chose for Writing and that all four skills now inherit. Found during the
  cross-device pass. An improvement candidate with a route already sketched in `WINDOWS.md`;
  deliberately not fixed at the gate, because the phase should not grow at its own gate.

- **No human has heard a Speaking recording play back**, on any prompt or device. A `blob:`
  element loads and `recordingSeconds` is correct; that is not the same claim.

- **The Listening results screen, post-answer transcript and 55-minute clock are unobserved**,
  and nobody has worked Reading set 1 at a real pace.

- **The three-voice collapse in `planVoices` is bounded but untested.** The test machine had 5
  English voices, so the fallback did not engage. Below three voices all three discussion
  speakers become one voice at pitches 1 / 0.85 / 1.15, and six of that part's eight items are
  attribution questions. Content mitigates it (all three are named aloud early); code does not.

**UI hint**: yes

### Phase 3: Every Scenario Practicable

**Goal**: Every existing scenario in all 6 worlds is deeply practicable — real content in each applicable skill, with vocabulary and mistakes flowing into the review loop
**Depends on**: Phase 2 (content work is independent, but ordering it after ensures new completions are recorded server-side)
**Requirements**: CONT-01, CONT-02
**Success Criteria** (what must be TRUE):

  1. A learner can open any scenario in any of the 6 worlds and complete real practice in each skill that scenario offers — no placeholder, stub, or empty activity anywhere
  2. Practicing any scenario adds its phrases and vocabulary to the SRS queue, and those items later appear in the review flow when due
  3. Mistakes made in any scenario's grammar practice surface in the learner's weak-topics recommendations

**Plans**: TBD

### Phase 4: Full Curriculum Expansion

**Goal**: The curriculum covers the full designed scope — every world's complete topic list, native-level Sounding Native material, and difficulty graduated across B1–C1
**Depends on**: Phase 3 (extends the fully-practicable content baseline and reuses its content patterns)
**Requirements**: CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):

  1. Each world's scenario list covers its complete designed topic set (e.g., Social includes humor and favors; Work includes networking and feedback; Practical includes housing and bank)
  2. A learner can practice native-level material in Sounding Native: idioms, phrasal verbs, pronunciation drills, and register/culture
  3. Every new scenario ships fully practicable across its applicable skills from day one — no stub content
  4. Content difficulty spans B1–C1 so learners at different levels find appropriately graduated material

**Plans**: TBD

### Phase 5: AI Tutor End-to-End

**Goal**: The AI tutor works for real learners in production — in-character scenario role-play with gentle correction, graceful gating and error states, and progress credit for completed conversations
**Depends on**: Phase 2 (tutor progress credit must persist server-side); ordered last per the 2026-06-19 decision (free features first, paid tutor last)
**Requirements**: TUTOR-01, TUTOR-02, TUTOR-03, TUTOR-04, TUTOR-05
**Success Criteria** (what must be TRUE):

  1. A signed-in learner with tutor access sends a message in production and receives a real Claude reply — the demo stub never appears when the API key is configured
  2. Opening the tutor from a scenario produces role-play grounded in that scenario, staying in character
  3. When the learner makes a grammar or word-choice mistake, the tutor gently shows the better phrasing and continues the conversation
  4. Not-Pro, daily-cap-reached, and transient-error states each show a clear, friendly message, and a failed reply can be retried without consuming the daily quota
  5. Finishing a tutor conversation registers scenario progress that persists server-side

**Plans**: TBD
**UI hint**: yes

## Later Milestones (backlog, not scoped here)

- **Commercial launch**: Stripe live mode, custom domain, security hardening (LAUNCH-01..04 in REQUIREMENTS.md v2)
- **Native-level extras**: premium TTS/STT voice, normalized progress schema for analytics (VOICE-01, DATA-01)
- **Quality**: automated test suite for critical paths (TEST-01)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CELPIP Writing Practice | 6/6 | Complete | 2026-07-28 |
| 2. Server-Side Progress | 7/7 | Complete | 2026-07-30 |
| 2.1 CELPIP Remaining Skills | 12/12 | Complete | 2026-07-31 |
| 3. Every Scenario Practicable | 0/TBD | Not started | - |
| 4. Full Curriculum Expansion | 0/TBD | Not started | - |
| 5. AI Tutor End-to-End | 0/TBD | Not started | - |
