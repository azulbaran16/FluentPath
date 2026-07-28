# Roadmap: FluentPath — Milestone "Completar producto"

## Overview

FluentPath is live but incomplete: practice modes, accounts, and billing exist, while progress is only loosely synced to the database, parts of the curriculum are thin, and the AI tutor — though coded — has never run for real users in production. This milestone finishes the product in five moves: first ship a free CELPIP Writing practice section (prioritized 2026-07-23 — the first beta user has an exam date), then make Postgres the authoritative home of learner progress (validated, retried, cross-device), then make every existing scenario fully practicable, then expand the curriculum to its full designed coverage including native-level content, and finally bring the AI tutor to life end-to-end — real Claude replies, scenario role-play, gentle correction, and progress credit. The tutor goes last, honoring the 2026-06-19 decision to complete everything free before switching on the paid feature. Commercial-launch work (Stripe live, domain, security hardening) is deliberately out of this milestone.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: CELPIP Writing Practice** - Free exam-prep section at `/celpip`: original Task 1/Task 2 bank, real-exam simulator (timer, word count), model answers + descriptor-based self-evaluation
- [ ] **Phase 2: Server-Side Progress** - Postgres becomes the authoritative, validated, retry-safe home of learner progress across devices
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

**Plans**: 6/7 plans executed
Plans:

- [x] 02-01-PLAN.md — Tracer: one shared store, one reconcile per load, merge-on-write end to end
- [x] 02-02-PLAN.md — Complete the D-01a merge: streak pair, daily-XP tuple, SRS/attempt per-entry rules
- [x] 02-03-PLAN.md — Shared zod contract: strip-and-save validation, safe reads, bounded payload
- [x] 02-04-PLAN.md — Persisted retry queue, flush triggers, and the discreet not-synced indicator
- [x] 02-05-PLAN.md — CELPIP persistence contract: additive column, zod shape, de-duplicating merge
- [x] 02-06-PLAN.md — CELPIP sync: merge-on-write route, module store, per-load reconcile
- [ ] 02-07-PLAN.md — Live-data safety audit + full gate + human verification of the 4 criteria

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
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CELPIP Writing Practice | 6/6 | Complete | 2026-07-28 |
| 2. Server-Side Progress | 6/7 | In Progress|  |
| 3. Every Scenario Practicable | 0/TBD | Not started | - |
| 4. Full Curriculum Expansion | 0/TBD | Not started | - |
| 5. AI Tutor End-to-End | 0/TBD | Not started | - |
