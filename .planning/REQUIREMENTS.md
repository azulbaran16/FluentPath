# Requirements: FluentPath — Milestone "Completar producto"

**Defined:** 2026-07-23
**Core Value:** A learner can practice any real-life English scenario end-to-end — with an AI tutor that corrects them in context — and their progress is never lost.

Brownfield note: shipped capabilities (auth, practice modes, progress engine, Stripe test billing, analytics, referrals, blog) are recorded as Validated in `.planning/PROJECT.md`. The requirements below cover only the remaining work for this milestone.

## v1 Requirements

Requirements for this milestone. Each maps to exactly one roadmap phase.

### CELPIP (exam prep — Writing v1)

Added 2026-07-23 from approved design `docs/plans/2026-07-23-celpip-writing-design.md`. All content original — third-party study material used only as format reference, never copied.

- [x] **CELPIP-01**: Original task bank in `src/lib/celpip.ts` — ~8 Writing Task 1 (formal email: scenario + 3 bullets) and ~8 Task 2 (survey: scenario + 2 options) with model answers and rewritten strategy tips
- [x] **CELPIP-02**: Exam simulator at `/celpip/writing/[taskId]` — real exam countdown (27 min T1 / 26 min T2, pausable in practice mode), 150–200 word counter, plain-text editor, draft autosave; timer expiry locks the editor and offers submit-as-is or untimed continue
- [x] **CELPIP-03**: Post-submit results — learner's text beside the original model answer, interactive self-evaluation checklist derived (in our own words) from CELPIP level descriptors, attempt metrics (time, words)
- [x] **CELPIP-04**: Attempt history stored local-first under its own namespace following the `progress.ts` pattern, shaped for later Postgres migration
- [x] **CELPIP-05**: `/celpip` landing free for all users — Task 1/Task 2 libraries with attempt status; Speaking/Reading/Listening shown as "coming soon"

### CELPIP (exam prep — remaining skills)

Added 2026-07-30. The beta user's exam is under three weeks away, so scope is deliberately
uneven: Reading and Listening are built to depth, Speaking to a usable minimum. Same IP
constraint as v1 — **all content original**, third-party material is format reference only.

- [ ] **CELPIP-06**: Original Reading bank covering the exam's four parts (correspondence, diagram, information, viewpoints) — passages with matching question types, answer key, and per-question explanations
- [x] **CELPIP-07**: Original Listening bank read aloud through the Web Speech API already used elsewhere in the app — scripts the learner hears (not reads), note-taking space, questions revealed after playback, answer key with explanations
- [x] **CELPIP-08**: Speaking practice — timed prompts matching the real task shapes, in-browser recording so the learner can hear herself back, and a descriptor-based self-evaluation checklist. No automated scoring
- [ ] **CELPIP-09**: Attempts for all three new sections persist under the Phase 2 server-side contract — same account, every device, offline-safe
- [x] **CELPIP-10**: `/celpip` landing exposes Reading, Listening and Speaking as real sections — the "coming soon" badges are gone for what ships and honest about what does not

### Progress (server-side persistence)

- [x] **PROG-01**: Signed-in learner's progress (completions, XP, streak, CEFR level, SRS queue, attempts) is persisted in Postgres as the authoritative copy, with localStorage acting as cache/offline buffer
- [x] **PROG-02**: Learner logs in from a different browser or device and sees identical progress
- [x] **PROG-03**: Progress API validates payloads against the ProgressState schema; malformed writes are rejected without corrupting stored data, and corrupted stored data loads as a safe default instead of crashing
- [x] **PROG-04**: Progress writes that fail (offline, flaky network, server error) are retried automatically — no silent data loss
- [x] **PROG-05**: Anonymous local progress migrates into the account on first sign-in without loss

### Content (curriculum completeness)

- [ ] **CONT-01**: Every existing scenario in all 6 worlds offers real practice in each of its applicable skills (grammar, speaking, reading, writing) — no stub, placeholder, or empty activity
- [ ] **CONT-02**: Every scenario has scenario-specific phrases and vocabulary that feed the SRS review queue

### Content (curriculum expansion)

- [ ] **CONT-03**: Each of the 6 worlds covers its full designed topic list with scenarios (e.g., Social includes humor and favors; Work includes networking and feedback; Practical includes housing and bank)
- [ ] **CONT-04**: Sounding Native world delivers native-level content: idioms, phrasal verbs, pronunciation drills, and register/culture
- [ ] **CONT-05**: New content is graduated across CEFR levels (B1–C1) so difficulty progresses with the learner

### Tutor (AI tutor end-to-end)

- [ ] **TUTOR-01**: A signed-in learner with tutor access receives real Claude replies in production — the demo stub only ever appears when no API key is configured
- [ ] **TUTOR-02**: Launching the tutor from a scenario produces in-character role-play grounded in that scenario
- [ ] **TUTOR-03**: The tutor gently corrects the learner's most important grammar or word-choice mistake and keeps the conversation going
- [ ] **TUTOR-04**: Gating and failure states are clear and friendly — not-Pro upsell, daily-cap-reached message, and transient errors that can be retried without consuming the daily quota
- [ ] **TUTOR-05**: Completing a tutor conversation counts toward scenario progress (XP/completion) persisted server-side

## v2 Requirements

Deferred to later milestones. Tracked but not in the current roadmap.

### Commercial Launch

- **LAUNCH-01**: Stripe live mode enabled with real prices and verified webhooks
- **LAUNCH-02**: Custom domain with correct AUTH_URL/OAuth callbacks
- **LAUNCH-03**: Security hardening — consistent password rules, distributed rate limiting, webhook error handling, proper Prisma migrations
- **LAUNCH-04**: Error observability (Sentry or similar) for production API routes

### Native-Level Extras

- **VOICE-01**: Premium TTS/STT voice replacing/augmenting Web Speech API
- **DATA-01**: Normalized progress schema (Scenario/SrsItem/Attempt tables) enabling analytics queries

### Quality

- **TEST-01**: Automated test suite for critical paths (auth, progress sync, billing webhook, tutor gating)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Stripe live mode, custom domain, security hardening | Commercial-launch milestone — user decision 2026-07-23 keeps this milestone focused on completing the product |
| Premium voice (TTS/STT) | Web Speech API sufficient for now; expensive; revisit after tutor is live |
| Progress DB schema normalization | JSON column suffices at current scale; only needed for analytics |
| Full automated test suite | Separate quality effort; phases add targeted verification only |
| Growth/marketing work (more SEO, ads) | Post-completion; blog + analytics + referrals already shipped |
| Mobile app | Web-first product |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CELPIP-01 | Phase 1 | Complete |
| CELPIP-02 | Phase 1 | Complete |
| CELPIP-03 | Phase 1 | Complete |
| CELPIP-04 | Phase 1 | Complete |
| CELPIP-05 | Phase 1 | Complete |
| CELPIP-06 | Phase 2.1 | **In progress — two of the exam's four parts ship** (02.1-08 machinery + 02.1-09 content). `reading-set-1` holds the correspondence part (11 min, an original 270-word email plus a 5-blank reply, six comprehension questions and five drop-down blanks in the exam's confirmed six-then-five order) and the information part (9 min, a 569-word text in five labelled sections, nine questions, two of which offer a "the passage does not say" option and one of which has it as the key). 20 items, every one with an original explanation, every answer index in range, ids unique across questions AND blanks — all gated by the reading group of `scripts/verify-celpip-content.mts` (383 → 519 assertions) and by 17 of 17 mutations failing against 4 unharmed controls. `/celpip/reading/reading-set-1` serves 200 and an unknown id 404s. **The diagram and viewpoints parts are not authored**, so the requirement's "four parts" is not met and the landing says so in derived numbers ("2 of the 4 exam part shapes"). 02.1-10 lands the other two. Nobody has answered a blank in a browser (WINDOWS.md) |
| CELPIP-07 | Phase 2.1 | Complete as content and structure (02.1-04 + 02.1-05 + 02.1-06 + 02.1-07 + 02.1-11): original scripts read aloud through the Web Speech API, heard and never read before answering, a note pad during playback, questions revealed only by the last utterance's `onCompleted` and one at a time, and an answer key with a per-question explanation. The bank covers **all 6 exam part shapes** (`listening-set-1`: problem solving, daily conversation, information, news item, discussion, viewpoints — 2,468 words, 157 turns, **37 items** at the exam's confirmed 8/5/6/5/8/5, 55-minute derived limit, inside the exam's own 47-55 window). The landing derives "6 of the 6" from the bank, so the claim and the app agree. **Barely heard, and that qualification stands:** the user drove 12 turns of the news item in a real browser against a production build; nothing else in the set has been played, nobody has timed the 55-minute set, and nobody knows whether the discussion part's three voices are followable by ear — six of its eight items are unanswerable if they are not (WINDOWS.md ids 8, 10, 11, 12, 13, 14, 15) |
| CELPIP-08 | Phase 2.1 | Complete (02.1-01 + 02.1-03) — all eight exam task shapes ship, one original prompt each, at the exam's own prep/response timings; in-browser recording and playback; a four-dimension descriptor self-check; no automated scoring anywhere. One disclosed compromise: exam Task 3 shows a photograph and this app writes the scene out instead, said in the prompt copy and in the landing's Speaking caveat |
| CELPIP-09 | Phase 2.1 | In progress — Speaking attempts persist and cross devices (02.1-01, verified against a real account). Listening's persistence contract now exists end to end (02.1-04: `listeningAttempts` through all six lockstep sites, merged by the existing union rule, proved by 12,040 merge and 254 schema assertions) and 02.1-05 shipped its first caller: `ListeningPlayer.finalizeAttempt` appends through `addListeningAttempt` from every exit path out of the results view, guarded once by `finalizedRef`. **No attempt has yet been written from a real browser**, so the Listening round trip is proved by 12,040 merge assertions and by nothing else. **Reading's persistence contract now exists too** (02.1-08: `readingAttempts` through all six lockstep sites, a fourth append-only field merged by the same one-line union rule, natural key `setId`+`date`, answers dropped-never-clamped over one map shared by question and blank ids — proved by 20,146 merge and 309 schema assertions, and by 24 of 26 mutations failing). **`addReadingAttempt` now has a reachable caller** (02.1-09): `READING_SETS` holds a set, `/celpip/reading/reading-set-1` serves, and `ReadingRunner.finalizeAttempt` appends from both exits out of the results view under one `finalizedRef` guard. All four attempt records now coexist and a stored blob written before any of them still parses with all three recovering to empty records. **No reading or listening attempt has yet been written from a real browser**, so both round trips are proved by 20,146 merge assertions and by nothing else |
| CELPIP-10 | Phase 2.1 | Complete (02.1-03 + 02.1-05 + 02.1-09) — **all four skills are real sections on `/celpip` and no tab carries the "Not yet available" badge.** Reading was the last one; 02.1-09 replaced the `undefined` source with `readingSource()` and the section went available on its own, because availability is DERIVED from bank contents rather than declared. Every coverage line is likewise derived and moves without an edit: Writing "17 prompts across the exam's two writing tasks", Reading "1 set covering 2 of the 4 exam part shapes", Listening "1 set covering 6 of the 6 exam part shapes", Speaking "8 prompts covering 8 of the 8 exam task shapes". Honest about what does not ship: Reading's own line states 2 of 4 in numbers that move when 02.1-10 lands, and the two qualitative compromises are named in hand-written caveats (Listening's synthesised audio, Speaking's written-out photograph). Reading deliberately carries no caveat — it is incomplete rather than compromised, and a sentence naming the missing parts would be stale the day 02.1-10 commits. The attempt history is one list across all four skills, each with its own metrics |
| PROG-01 | Phase 2 | Complete |
| PROG-02 | Phase 2 | Complete |
| PROG-03 | Phase 2 | Complete |
| PROG-04 | Phase 2 | Complete |
| PROG-05 | Phase 2 | Complete |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 4 | Pending |
| CONT-05 | Phase 4 | Pending |
| TUTOR-01 | Phase 5 | Pending |
| TUTOR-02 | Phase 5 | Pending |
| TUTOR-03 | Phase 5 | Pending |
| TUTOR-04 | Phase 5 | Pending |
| TUTOR-05 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

*Renumbering note (2026-07-23): CELPIP Writing inserted as Phase 1 before any phase was planned or executed; former phases 1–4 became 2–5.*

---
*Requirements defined: 2026-07-23*
*Last updated: 2026-07-23 after roadmap creation*
