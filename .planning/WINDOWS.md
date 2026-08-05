---
schema_version: 1
open_count: 59
waived_count: 1
fixed_count: 17
total_count: 77
last_updated: 2026-08-05T03:06:24.106Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | unrun-verify | src/lib/celpip-progress.ts |  | 02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07. | fixed |  | 2026-07-28T23:55:44.383Z | 2026-07-31T12:06:17.747Z |
| 2 | 02 | deviation | src/app/api/celpip-progress/route.ts |  | The plan's route gates are bare presence counts: overwrite-instead-of-merge, cap removal and rate-limit removal all produced ZERO failures. Sharpened call-site gates are recorded in 02-06-SUMMARY.md but live only in that document. | open |  | 2026-07-28T23:55:44.925Z |  |
| 3 | 02.1 | unrun-verify | src/components/celpip/SpeakingRecorder.tsx |  | 02.1-01 checkpoint: the Speaking phone pass was not done (no device available). The MediaRecorder isTypeSupported container probe (WebM -> MP4) exists precisely for Safari before 18.4, which supports MP4 only, so the one browser family it was written for has never run it. Owed to 02.1-12. | open |  | 2026-07-31T03:10:00.000Z |  |
| 4 | 02.1 | unrun-verify | src/components/celpip/SpeakingRecorder.tsx |  | 02.1-01 checkpoint: microphone release-on-stop is code-verified, not observed. The run used a synthetic AudioContext MediaStreamDestination, whose track lifecycle is not the OS recording indicator. Needs one real-device glance in 02.1-12. | open |  | 2026-07-31T03:10:00.000Z |  |
| 5 | 02.1 | unrun-verify | src/components/celpip/CelpipLanding.tsx |  | 02.1-02: the skill-aware /celpip landing has never been opened in a real browser. The server-rendered HTML was read from a production `next start` (coverage line, disabled tabs, JSON-LD) and the client logic was executed in node against a generated copy of the component, but hydration, the skill-tab switch and the Writing group control were never exercised in a browser. The plan explicitly warns that breaking the `ready` discipline produces a hydration mismatch on a page the beta user opens daily. Owed to 02.1-12. | fixed |  | 2026-07-31T07:07:20.000Z | 2026-07-31T11:56:25.250Z |
| 6 | 02.1 | deviation | src/components/celpip/CelpipLanding.tsx |  | 02.1-02: HISTORY_SOURCES is gated only by an ad-hoc harness that was not committed (it transpiles the component and stubs its render imports, which is too heavy for scripts/). 54 assertions and 15 mutations ran green — including two that initially SURVIVED and were closed — but plans 05 and 09 append an entry to that array with no automated protection. CELPIP_SECTIONS is committed-gated by scripts/verify-celpip-sections.mts; the history half is not. | open |  | 2026-07-31T07:07:20.000Z |  |
| 7 | 02.1 | unrun-verify | src/lib/celpip/speaking-prompts.ts |  | 02.1-03: the eight Speaking cards and the Task 3 written-scene caveat render only under the Speaking tab, which is client-side, so the served /celpip HTML carries the Writing tab alone and neither has been SEEN rendered. What was verified against a production `next start`: all eight prompt routes return 200, an unknown id returns 404, the coverage line reads "8 prompts covering 8 of the 8 exam task shapes", and the Task 3 page serves its disclosure, its scene text and its 30/60 timings. What was not: no browser has switched to the Speaking tab, and none of the seven new prompts has been taken through record -> playback -> self-check (only the plan-01 advice prompt was, at 02.1-01's checkpoint). Owed to 02.1-12. | fixed |  | 2026-07-31T07:30:42.000Z | 2026-07-31T11:57:09.694Z |
| 8 | 02.1 | unrun-verify | src/components/celpip/AudioCheck.tsx |  | 02.1-04: nobody has HEARD the audio check. The whole component exists to answer the question 'did sound come out', and it has never been opened in a browser, never run on a phone, and never played through a speaker. Everything checkable without one was checked: the speech driver is gated by scripts/verify-celpip-speech.mts (50 assertions, 22 mutations) against a mock engine, and all seven of the component's render branches were server-rendered in node against a generated copy. What is untested is the part only a device can answer - whether two distinct voices actually come out on Chrome, Safari and Android; whether the iPhone hardware silent switch produces exactly the failure the troubleshoot branch describes; and whether a CELPIP-length multi-turn script really survives Chrome's ~15s utterance truncation. That last one is the reason speaker-turn chunking exists. AudioCheck is not mounted by any route until plan 05, so this cannot be closed before then. Owed to 02.1-12. | open |  | 2026-07-31T08:09:51.051Z |  |
| 9 | 02.1 | deviation | src/components/celpip/AudioCheck.tsx |  | 02.1-04: AudioCheck's markup is gated only by an ad-hoc harness that was not committed - it transpiles the component with the TypeScript compiler API, seeds the phase state, and server-renders each branch, which is too much machinery for scripts/ and is the same judgement 02.1-02 made about HISTORY_SOURCES. 24 checks and 8 mutations ran green (7 caught, 1 known survivor: a dead onClick, which a markup-only harness cannot see). So plan 05 mounts and edits this component with no automated protection on its escape hatches - the iPhone silent-switch guidance, the reveal-the-words escape and the run-anyway path can each be deleted without any committed gate noticing. The speech DRIVER is committed-gated by scripts/verify-celpip-speech.mts; the component half is not. | open |  | 2026-07-31T08:09:51.645Z |  |
| 10 | 02.1 | unrun-verify | src/components/celpip/ListeningPlayer.tsx |  | Nobody has heard the Listening runner or driven it in a browser: the phase machine, the one-question-at-a-time reveal, submit and the recorded attempt have never been clicked through, and no audio has come out of a speaker on any device. | open |  | 2026-07-31T08:45:09.723Z |  |
| 11 | 02.1 | deviation | src/components/celpip/ListeningPlayer.tsx |  | The player's D-04/D-05 behaviour is gated by greps and by a manually-run served-HTML measurement, not by a committed render harness. The RSC-payload leak is now committed-gated at the route boundary, but the one-at-a-time reveal and the no-revisit rule are not. | open |  | 2026-07-31T08:45:19.431Z |  |
| 12 | 02.1 | unrun-verify | src/lib/celpip/listening-set-1.ts |  | Nobody has heard the two new two-speaker parts; the multi-voice distinguishability and the 714-word problem-solving script are unproved by ear | open |  | 2026-07-31T09:12:59.043Z |  |
| 13 | 02.1 | unrun-verify | src/lib/celpip/listening-set-1.ts |  | Nobody has sat listening set 1 end to end and timed it. The set is now 2,090 words and 29 items on a 44-minute derived clock; the timing check is bounded by arithmetic against one real 76-second measurement, not observed. | open |  | 2026-07-31T09:26:46.853Z |  |
| 14 | 02.1 | unrun-verify | src/lib/celpip/listening-set-1.ts |  | Nobody has heard the discussion part: whether three browser voices stay distinguishable by ear across a 378-word script is unknown, and six of its eight questions are unanswerable if they are not. | open |  | 2026-07-31T09:47:19.779Z |  |
| 15 | 02.1 | deviation | src/components/celpip/ListeningPlayer.tsx |  | The player shows no speaker label WHILE audio plays; labels exist only in the post-answer transcript. Plan 11 authored around it by naming all three speakers aloud in the script, but any future multi-speaker part inherits the same constraint unspoken. | open |  | 2026-07-31T09:47:20.426Z |  |
| 16 | 02.1 | unrun-verify | src/components/celpip/ReadingRunner.tsx |  | 02.1-08: nobody has seen the reading runner. Neither ReadingRunner nor DropdownBlank has been opened in a browser, on a phone, or with a screen reader — READING_SETS is empty so no URL reaches them. Untested: whether the native select opens as the system picker on iOS/Android, whether inline selects sit legibly in a paragraph at mobile widths, and whether the per-part clock reads correctly when re-armed. Cannot close before 02.1-09 lands a bank. Owed to 02.1-12. | fixed |  | 2026-07-31T10:02:45.239Z | 2026-07-31T11:57:10.814Z |
| 17 | 02.1 | deviation | src/components/celpip/ReadingRunner.tsx |  | 02.1-08: two component invariants survived mutation with NO gate at all — the Timer's per-part key={part.id} and DropdownBlank's aria-label. Both are silent when broken (a stale clock carried into the next part; four unlabelled combo boxes in one paragraph). A committed gate needs a render harness, which 02.1-04 judged too much machinery for scripts/. The greps live only in 02.1-08-SUMMARY.md. | open |  | 2026-07-31T10:02:45.838Z |  |
| 18 | 02.1 | unrun-verify | src/lib/celpip.ts |  | 02.1-08: id uniqueness across question ids and blank ids within a reading set is documented on CelpipReadingPart but gated by nothing. They share one answers map, so a collision silently overwrites one of two answers and mis-scores the sheet (T-02.1-39). This plan could not gate it — gating needs a bank. Owed to 02.1-09's content harness. | fixed |  | 2026-07-31T10:02:46.482Z | 2026-07-31T11:56:24.626Z |
| 19 | 02.1 | unrun-verify | src/components/celpip/DropdownBlank.tsx |  | Nobody has answered a drop-down blank in a browser. The reading set now serves 200 and the explanation renders under the blank in code, but the plan's human-check (answer one blank wrongly on purpose and read the explanation) was not run: no browser-driving tool was available to this executor and adding one would have installed a package. Closes the moment someone opens /celpip/reading/reading-set-1 and picks a wrong option. | fixed |  | 2026-07-31T10:27:00.428Z | 2026-07-31T11:56:25.867Z |
| 20 | 02.1 | unrun-verify | src/lib/celpip/reading-set-1.ts |  | The two 'the passage does not say' questions are gated for shape but not for pedagogy: nothing asserts that at least one such option is the KEY. An author who made every not-stated option wrong would pass all 519 assertions while teaching the learner to discount the very option the information part tests her on. The invariant is stated in a comment on INFORMATION_PART and gated by nothing. | open |  | 2026-07-31T10:27:00.993Z |  |
| 21 | 02.1 | unrun-verify | src/lib/celpip/reading-set-1.ts |  | Nobody has worked Reading set 1 end to end at a real pace; whether 39 minutes fits these passages is untested | open |  | 2026-07-31T11:00:17.011Z |  |
| 22 | 02.1 | unrun-verify | src/components/celpip/ReadingRunner.tsx |  | The new per-part item order (blanks before questions for the diagram part only) has never been seen rendered; gated by harness and mutation only | fixed |  | 2026-07-31T11:00:17.547Z | 2026-07-31T11:56:26.484Z |
| 23 | 02.1 | deviation | src/lib/celpip-speech.ts |  | planVoices is all-or-nothing: enoughVoices requires pool.length >= distinct.length, so a device offering only two English voices drops ALL THREE discussion speakers to the browser default distinguished by pitch alone (1 / 0.85 / 1.15) rather than using the two real voices it has plus one shift. Six of the discussion part's eight items are attribution questions. Mitigated in content (plan 11 names all three speakers aloud within the first seven turns) but not in code, and unobserved by ear. Found by the 02.1-12 gate. | open |  | 2026-07-31T11:16:10.159Z |  |
| 24 | 02.1 | unrun-verify | .planning/phases/02.1-celpip-remaining-skills/02.1-12-PLAN.md |  | 02.1-12 Task 2, the phase's blocking human checkpoint, was NOT performed: the six ROADMAP success criteria have not been observed in a browser, and no phone or Safari pass happened. The automated half of the gate passed in full. This is the entry that owes ~20 of the others in this ledger; an ordered checklist is in 02.1-12-SUMMARY.md and in the plan-12 final report. | fixed |  | 2026-07-31T11:16:17.383Z | 2026-07-31T11:57:11.927Z |
| 25 | 02.1 | unrun-verify | src/lib/celpip/speaking-prompts.ts |  | Successor to window 7, narrowed by the 02.1-12 browser pass. What CLOSED: the Speaking tab was switched to in a real browser, the cards render, and the Task 3 written-scene caveat was SEEN on screen. What REMAINS: none of the seven prompts added by plan 03 has been taken through record -> playback -> self-check, and no human has HEARD a recording play back on any prompt (a blob: audio element was verified to load and recordingSeconds to be correct, which is not the same thing). | open |  | 2026-07-31T11:57:10.263Z |  |
| 26 | 02.1 | unrun-verify | src/components/celpip/DropdownBlank.tsx |  | Successor to window 16, narrowed by the 02.1-12 browser pass. What CLOSED on desktop: the reading runner renders, a drop-down blank was answered, and the per-part clock re-arms correctly (11:00 -> 8:00 -> 9:00 -> 11:00; part 4 re-armed despite sharing part 1's 11-minute allowance, which is exactly the latent bug key={part.id} was added for). What REMAINS: no mobile pass at all - whether the native select opens as the iOS/Android system picker, and whether four inline selects sit legibly in one paragraph at phone widths, are both still unknown. | open |  | 2026-07-31T11:57:11.373Z |  |
| 27 | 02.1 | unrun-verify | .planning/phases/02.1-celpip-remaining-skills/02.1-12-PLAN.md |  | Successor to window 24: what the 02.1-12 browser pass did NOT reach, and what therefore still blocks a clean phase close. (1) The Listening RESULTS screen and the post-answer transcript with speaker labels - automation overshot it twice. (2) The 55-minute Listening clock, untimed. (3) Speaking playback BY EAR - no human has heard a recording. (4) The OS microphone indicator going out on stop - a synthetic stream cannot show it. (5) ANY phone or Safari path - the MediaRecorder WebM->MP4 container probe has still never executed on the browser family it was written for. (6) Cross-device persistence for the three new sections - not run at all. Reading is the one section verified end to end on desktop. | open |  | 2026-07-31T11:57:21.685Z |  |
| 28 | 02.1 | deviation | src/components/celpip/ReadingRunner.tsx |  | KNOWN LIMITATION, now spanning all four skills: close the tab from the results screen and the attempt is lost - including a full 39-minute Reading sitting. finalizeAttempt runs on results-view EXIT (Retry / Back to tasks), the pattern Phase 1 chose for Writing and that Speaking, Listening and Reading each inherited. Observed 2026-07-31 in the 02.1-12 cross-device pass: a Reading attempt did not persist because the reviewer navigated straight to sign-out rather than through an exit control. IMPROVEMENT CANDIDATE, deliberately not fixed at the gate (out of plan scope). PRECISION FOR WHOEVER FIXES IT: ProgressSync.tsx:62-69 already wires visibilitychange+pagehide, but those flush the sync QUEUE - they push state already recorded. On the results screen finalizeAttempt has not run, so there is nothing queued to flush. The fix needs finalizeAttempt itself wired to the same event pair inside ReadingRunner, ListeningPlayer and SpeakingRecorder, with care for finalizedRef and the reset-on-retry paths. Use visibilitychange/pagehide, NOT beforeunload - ProgressSync.tsx:57-61 records why the unload-time events were deliberately avoided (unreliable on mobile, being removed). | open |  | 2026-07-31T12:06:17.158Z |  |
| 29 | 03 | unrun-verify | src/components/practice/RecallDeck.tsx |  | 03-01: the recall loop and the review flow have not been driven by a human in a browser. What WAS observed (production build, next start, served HTML): social/small-talk renders the 'Lock it in' step with its first authored card; social/dating renders the honest 'not ready yet' warm-up panel and NO generic per-world lines; both scenarios render one section per declared skill with 'Not yet available'; step numbers derive correctly (1 2 3 4 with the recall step omitted); the JSON-LD carries no 'teaches' key. What was NOT observed: (1) the interactive recall loop - Show it, Got it / Not yet, the XP float, the 'Locked in' screen; (2) /review rendering a due scenario item, because /review is auth-gated (307 to /login) and needs a signed-in session plus a populated store - this is the far end of D-05 and is proved deterministically by verify-scenario-content.mts (resolveReviewItem over every composed id, plus the schema/merge storage leg) but has never been seen; (3) the honest panel's link targets actually navigating. Owed to plan 03-11. CLOSED AT THE 03-11 GATE. Item (1), the interactive recall loop, was driven by the user in a browser on 2026-08-01. Item (2), /review rendering a due scenario item, was driven on the same day and re-confirmed at the gate pass, where scenario attempts were recorded under their composite ids and srs scheduled them at box 1. Item (3), the honest panel link targets, is MOOT rather than observed: at 52/52 no declared pair renders that panel on any page, so there is nothing left to navigate from - it survives only as the control that would fire if a bank entry were deleted, which was re-proved against full banks in a scratch copy at the gate. | fixed |  | 2026-08-01T00:27:49.960Z | 2026-08-01T07:25:56.385Z |
| 30 | 03 | unrun-verify | src/components/practice/ReviewHub.tsx |  | 03-02: the three widened review surfaces have not been seen by a human. Dashboard's due count, ReviewHub's 'Due today' badge, the weak-spots drill (both the mixed grammar+recall case and the 'nothing to drill yet' branch) and MistakesView's new compact recall card are gated ONLY by three grep guards, tsc/lint/build, and an inline node proof that the weak-spots selection returns 3 grammar + 14 recall items for a mixed weak set against the real banks. There is no committed assertion over any of these components, because they are React and this repo has no test runner (TEST-01, v2). All four need a signed-in session with a populated srs/attempts store to reach. NOTE: the user drove 03-01's far end in a browser on 2026-08-01 and reported /review resolving and rendering a real scenario item, which closes items (1) and (2) of ledger entry 29 - 03-11 inherits a smaller debt than 29 states. Owed to plan 03-11. | open |  | 2026-08-01T01:12:52.055Z |  |
| 31 | 03 | unrun-verify | src/lib/content/phrases.ts |  | 03-03: the twelve new Work and Practical scenario pages have not been opened by a human. The RENDER PATH is observed (03-01 saw a curated scenario render its 'Lock it in' step from the same accessors, and the user drove /review in a browser on 2026-08-01) and the CONTENT is gated by 4529 committed assertions plus a 17-mutation sweep, so this is a low-risk gap rather than an unproven one. What no one has looked at: the six phrases and eight cards on each of work/emails, work/presentations, work/negotiating, work/networking, work/feedback, work/interviews, work/meetings, practical/phone-calls, practical/tech-support, practical/housing, practical/banking and practical/appointments as they actually read on screen - line breaks, the length of the longer C1 negotiating lines in the card, and whether the Spanish glosses sit well next to the English. Editorial, not structural. Owed to plan 03-11's browser pass, which is already visiting these surfaces for entries 29 and 30. | open |  | 2026-08-01T01:53:21.055Z |  |
| 32 | 03 | unrun-verify | src/lib/content/phrases.ts |  | 03-04: the ten new Reading & Ideas and Sounding Native scenario pages have not been opened by a human. The RENDER PATH is observed (03-01 saw a curated scenario render its 'Lock it in' step through these same accessors, and the user drove /review in a browser on 2026-08-01) and the CONTENT is gated by 6019 committed assertions plus an 18-mutation sweep with 11 caught, 5 controls survived and 2 applier refusals, so this is an editorial gap rather than an unproven one. What nobody has looked at: the six phrases and eight cards on each of academic/news, academic/articles, academic/stories, academic/summaries, academic/debate, native/idioms, native/phrasal-verbs, native/pronunciation, native/register and native/culture as they actually read on screen. Two things are specific to this batch and worth a deliberate glance: native/register's phrases are three CONTRASTING PAIRS and the pairing is only legible if the casual and formal lines sit adjacent in the rendered order, and the C1 articles and debate lines are the longest in the corpus. Owed to plan 03-11's browser pass, which is already visiting these surfaces for entries 29, 30 and 31. | open |  | 2026-08-01T02:24:03.538Z |  |
| 33 | 03 | unrun-verify | src/lib/content/scenario-grammar.ts |  | 03-05: no human has ANSWERED a scenario grammar question in a browser. The four quizzes were observed in the SERVED HTML of a production build (social/small-talk renders step 5 'Practise grammar' with the topic pill 'Question tags', the counter '1 / 5', the prompt 'It's freezing out there today,' and its four options, with the gap showing ____ rather than the answer), and the harness proves the wiring deterministically: every composed id resolves through resolveReviewItem as kind 'grammar', reviewableIds() lists all 20, and GrammarQuiz's untouched recordAttempt(q.id, isRight, {topic, level, chosen}) is what populates weakTopics. But the INTERACTIVE half is unseen: picking an option, the XpFloat, the explanation panel and the 'Ask the tutor why' link, the results screen, and the far end - a wrong answer on social/small-talk#grammar#weather-question-tag appearing under 'Question tags' in /review's weak spots and being drillable there. That last one is ROADMAP criterion 3 for Phase 3 and it is inherited rather than built, so it is proved by construction and not by observation. Needs a signed-in session. Owed to plan 03-11's browser pass, alongside entries 29, 30, 31 and 32. | fixed |  | 2026-08-01T04:19:04.700Z | 2026-08-01T07:24:25.103Z |
| 34 | 03 | stub | src/components/WorldView.tsx |  | 03-05, restated at the 03-11 gate because its STATUS changed while its CODE did not. WorldView.tsx renders SkillPill with no availability flag, so the world page counts DECLARATIONS while the scenario page one click deeper reads the coverage registry. When this was filed it was a LIVE overclaim: /world/social showed a solid Speaking pill on a scenario whose speaking practice was not written. As of 03-10 all 52 declared pairs are written, so today the two surfaces agree by accident and there is nothing to see in a browser. THE CODE IS UNCHANGED, so the overclaim is latent rather than gone: it re-arms the moment PHASE 4 adds a scenario that declares a skill before its bank entry exists, which is the normal authoring order. Deliberately NOT fixed at the gate: it is not a live defect, the plan does not own WorldView.tsx, and a UI change made at a gate is a change nobody in this run can look at. The fix is three lines (import getScenarioCoverage, pass available per skill); the prop exists and defaults to true. Owed to whichever Phase 4 plan first adds a scenario with an unwritten pair. RESOLVED at 04-08 (commit 47454ef), by the plan that then declared two skills before their banks existed and so would have made it live. Fixed NOT the way this entry predicted: 'import getScenarioCoverage' INTO WorldView was measured at +217,154 B (+52.1%, 6 -> 9 chunks) on the /world/[slug] client bundle, because WorldView is a client component and the registry pulls in all six content banks. The derivation went into the server component instead (+50 B) and WorldView takes a REQUIRED `written` prop, so a future caller cannot re-introduce the overclaim by omission. Two source-read assertions in verify-scenario-content.mts hold it, both mutation-proved. | fixed |  | 2026-08-01T04:19:19.508Z | 2026-08-04T20:25:41.000Z |
| 35 | 03 | unrun-verify | src/components/practice/WritingDesk.tsx |  | 03-06: the writing desk's INTERACTIVE half is unseen by a human, and so is the multi-prompt picker path. Observed in the served HTML of a production build: all nine scenario writing pairs render their own task with NO picker row (the markup goes straight from <div> to <div class="grid gap-5 lg:grid-cols-2 ">, with no mt-4), the level badge, the word range and the 0-words counter render, and the model answer is absent from the served HTML. NOT observed: typing into the editor, the counter turning 'in range', Save draft writing to localStorage under the composed id, ticking a checklist line, and Show model answer revealing the model. Also NOT observed: the >1-prompt branch that still renders the picker - the global writing room at /skill/writing mounts WritingDesk behind a client-side tab whose default is 'Learn', so 13 prompts never reach the initial HTML and curl cannot click the tab. The branch is one boolean (prompts.length > 1) and is unchanged for that path, but it is proved by reading rather than by seeing. Owed to plan 03-11's browser pass alongside entries 29-33. | open |  | 2026-08-01T04:55:16.464Z |  |
| 36 | 03 | stub | src/lib/scenario-coverage.ts |  | 03-06: ScenarioSkillCoverage.summary is derived, asserted and rendered NOWHERE. Grep for '.summary' across src/components and src/app returns only the two CELPIP call sites (CelpipLanding.tsx:266 and celpip/page.tsx:90); no scenario surface renders the scenario coverage summary at all. So the strings the harness pins - '5 questions' for grammar since 03-05, '1 task' for writing since 03-06 - are a contract nobody reads yet. This is not a defect in either plan (both were told to produce a count and a unit, and both do) and the assertions have teeth (mutation M18 catches a reworded unit), but a field that is asserted and unrendered can drift into being wrong for a UI that later starts rendering it. Either a surface should show it or its absence should be a deliberate, recorded decision. | open |  | 2026-08-01T04:55:30.754Z |  |
| 37 | 03 | unrun-verify | src/components/practice/ReadingRoom.tsx |  | 03-07: nobody has CHECKED ANSWERS on a scenario reading passage, so the two things this plan built have never been seen doing their job. Observed in the served HTML of a production build: all five scenario reading pairs (travel/restaurant, practical/housing, academic/news, academic/stories, academic/summaries) render the STANDALONE passage reader as their own step - level badge, minutes, Read aloud, title, body, glossary, questions and the Check answers button - with NO back link and NO level-filter pills, and academic/summaries renders its reading passage and its DIFFERENT writing passage on one page. NOT observed: the EXPLAINED KEY. Every explanation is behind {submitted && q.explain}, so it is absent from the served HTML entirely (grep returns 0, as does the answer index) and only appears after a click curl cannot make. So 'every scenario comprehension question tells the learner why the answer is the answer' is proved by construction - the type requires it, the harness asserts it non-empty on all 20 questions, and mutation M3 catches a whitespace explanation - but not by sight. Also unobserved: that the GLOBAL reading room's own single-passage reader still shows its back link after a text is chosen from the list. The ReadingRoom browser function is byte-identical in the diff and every change is behind onBack being present, so this is proved by reading rather than by seeing. Owed to plan 03-11's browser pass alongside entries 29-35. | fixed |  | 2026-08-01T05:29:13.276Z | 2026-08-01T07:24:25.629Z |
| 38 | 03 | unrun-verify | src/components/practice/SpeakingTaskPanel.tsx |  | 03-09: nobody has TICKED A MOVE, so the one thing this panel does that the writing desk does not — award XP — has never been seen doing it. Observed in the served HTML of a production build (next start, shut down afterwards, port 3000 drained to zero sockets and refusing): all fourteen written speaking pairs render the rehearsal panel as their own step, carrying the level badge, the 'say it out loud' label, the title, the setup, the three numbered moves, the 'You did it if' block with the success line, the '0 of 3 moves rehearsed' counter and the footer stating that nothing is listening; social/complaining and academic/debate each render their rehearsal AND their different writing task on one page; travel/airport still renders the honest 'Not yet available' panel for its unwritten speaking pair; and /skill/speaking reads '14 of the 30 scenarios that train your speaking have practice written for the situation itself — the rest are on the way, and say so' with the pending badge on the sixteen. NOT observed: ticking a checkbox, the line-through on a ticked move, the counter moving to 3 of 3, the 'Rehearsed' pill appearing, and the single award of 15 speaking XP with the day's activity recorded — including the T-03-22 property that unticking and re-ticking does not award again. That property is proved by construction (the awarded flag latches and is never cleared) and by mutation (M24, M25 and M26 all fire on the source scan), but not by sight. Owed to plan 03-11's browser pass alongside entries 29-37. | open |  | 2026-08-01T06:05:27.780Z |  |
| 39 | 03 | unmet-truth | scripts/verify-scenario-content.mts |  | 03-08: the D-01 assertion 'no passage text is repeated anywhere in the scenario reading corpus' fingerprints p.body.join(' '), so it only fires when the WHOLE body matches. A scenario passage that borrows ONE paragraph from another scenario's passage is D-01's failure at a finer grain and is NOT caught - proved by mutation M23, which copies native/idioms' first paragraph over native/culture's and SURVIVES a full harness run (declared as an expected survivor rather than deleted). The corpus is clean today: an out-of-band scan over all 31 authored paragraphs finds 0 exact cross-scenario reuse and 0 pairs above Jaccard 0.5 across 426 cross-scenario paragraph pairs, and 0 shared four-word runs against any other authored text. The gap is in the assertion's reach, not in the content. NOT closed by this plan because plan 03-09 had uncommitted work in that same harness file in the same working tree at the time, and staging it would have swept up theirs. Fix is one appended assertion: fingerprint paragraphs, not just joined bodies. | fixed |  | 2026-08-01T06:10:57.860Z | 2026-08-01T07:08:19.848Z |
| 40 | 03 | deviation | .planning/phases/03-every-scenario-practicable/03-08-SUMMARY.md |  | 03-08: a MUTATION SWEEP IN A SHARED WORKING TREE POISONED A PARALLEL PLAN'S PRODUCTION BUILD, silently and with no trace in git. Plan 03-09 ran npm run build at 02:00:04 while this plan's sweep had mutation M21 applied to src/lib/content/scenario-reading.ts (const authored = BANK['social/humor'] instead of BANK[key]). The sweep restored the file byte-for-byte (sha256 verified) so git was clean, but .next kept the mutation: every scenario page served 'The Man Who Mows at Seven', and the minifier had dropped eight of the nine passages from the emitted JS as unreachable. Caught only because this plan curled four pages and saw one title four times; confirmed by reading the mutated accessor back out of the build's own SOURCE MAP (the map records what the bundler read). REPAIRED by rebuilding from the clean committed tree - all nine slugs now present in the emitted JS in equal numbers and the map carries BANK[key] with zero mutated occurrences. 03-09's own browser observation (WINDOWS 38) is unaffected: it is about scenario-speaking.ts, which no mutation touched. THE STANDING HAZARD: any wave that pairs a mutation sweep with a sibling plan in one working tree can do this again in either direction, and neither plan would see it in git status. Mitigations to choose between: run sweeps in a git worktree or a copy, or assert the built accessor after any build a summary makes a claim about. | open |  | 2026-08-01T06:11:18.477Z |  |
| 41 | 03 | deviation | scripts/verify-scenario-content.mts |  | 03-10: A DECLARED GRANULARITY GAP in the speaking D-01 assertions, in the spirit of WINDOWS 39. 'scenario speaking: <key> is written for itself' fingerprints the whole task body (title+setup+moves+success) and 'has its own three moves' fingerprints the whole three-move list, both by byte-identity after canonicalisation. So TWO SCENARIOS SHARING A SINGLE MOVE ARE CAUGHT BY NEITHER, and neither is a near-duplicate that differs by one word. Mutation M17 (one scenario given another's entire move list) fires; a one-move borrow would not. Not a shipped defect: scan 1 shows 90 moves / 90 distinct and scan 2 shows 0 of 3,915 cross-scenario move pairs above Jaccard 0.5, so the corpus is clean out of band. Related, and also declared: 'every scenario speaking id is unique across all scenarios' cannot be falsified from the DATA at all, because every id is composed from a scenario key that is unique by construction - it only fails if the accessor stops using the scenario key, which mutation M12-key catches on a different label. Both assertions imply more grip over authored content than they have. The fix for the first is a per-move cross-scenario check in the speaking group; left for the plan that owns the harness. | fixed |  | 2026-08-01T06:45:16.756Z | 2026-08-01T07:08:20.407Z |
| 42 | 03 | unrun-verify | .planning/phases/03-every-scenario-practicable/03-11-PLAN.md |  | 03-11 Task 2, the phase's BLOCKING human checkpoint, has NOT been performed at the time of the Task 1 commit. The automated half of the gate passed in full (11,981 + 25,647 + 309 + 173 + 24 + 43 + 648 + 50 assertions; tsc/lint/build exit 0; deps 11+11; saturated payload measured at 143,830 bytes = 13.7% of the 1 MiB cap; the derivation control re-proved against FULL banks in a scratch copy: emptying one exercise entry took 52/52 to 51/52, put the pair in pendingPairs(), emptied its summary and flipped the scenario incomplete, with no second edit). What a script cannot establish, and what this entry owes: the three ROADMAP criteria seen in a browser. Specifically still unobserved and inherited from entries 29-38: nobody has ANSWERED a scenario grammar question (33), TYPED into a scenario writing desk (35), pressed CHECK ANSWERS on a scenario passage so no explained key has ever rendered (37), or TICKED A MOVE on any of the thirty rehearsals so the single 15-XP award has never been seen (38). An ordered checklist with URLs is in 03-11-SUMMARY.md. Owed to plan 03-11 Task 3, which is preconditioned on this pass and which sets CONT-01/CONT-02's final status from it. | fixed |  | 2026-08-01T07:08:44.652Z | 2026-08-01T07:24:26.139Z |
| 43 | 03 | unrun-verify | src/lib/content/phrases.ts |  | 03-11: the five SPEAKING_PACKS and the global speaking warm-up were repointed off the deleted lenient accessor onto getScenarioPhrases with a ?? [] at each of the twelve call sites, and their CONTENTS have not been seen. What WAS observed against a served production build: all five pack titles render on /skill/speaking (Greetings & small talk, Travel essentials, At work, Tricky sounds, Idioms), zero of the six deleted WORLD_FALLBACK lines appear on any of eight pages checked, and two scenarios still render their own curated warm-up. What was NOT: the pack PHRASES themselves, because SpeakingWorkspace mounts them behind a client-side tab whose default is not the drill, so curl cannot reach them - the same limitation 03-06 recorded for WritingDesk's picker at /skill/writing. Proved instead by construction (every one of the twelve keys is curated, and the harness asserts every scenario resolves to a non-empty set, so ?? [] is unreachable) and by tsc/lint/build. Closes the moment someone opens /skill/speaking and starts a pack. | open |  | 2026-08-01T07:08:45.202Z |  |
| 44 | 03 | deviation | src/lib/content/scenario-speaking.ts |  | 03-11 READER'S FINDING, from the near-duplication read-through the phase's residual risk (T-03-25) is mitigated by. No near-duplicate exercise was found: nothing in plans 03, 04 or 10 reads as another scenario's exercise with the nouns changed, and the mechanical backing is strong (90 moves all distinct, 0 of 3,915 cross-scenario move pairs at or above J=0.50, 0 shared four-word runs carrying content; same-world highest phrase similarity is 0.20 in Work, 0.14 in Sounding Native, 0.00 for both worlds' vocabulary terms). What a READER sees that a scan does not is repetition of exercise DESIGN, in two places. (1) SOUNDING NATIVE: four of the five rehearsals are the same contrastive-repetition drill - say it, say it again differently, name what changed (idioms: with then without; phrasal-verbs: phrasal then single-word; register: colleague then agency; pronunciation: three passes). native/culture is the only one that escapes it. Defensible, because comparison is the only self-markable drill for style and accent with no listener, but it is the most concentrated design echo in the phase. (2) THE A2 COUNTER TASKS: three of the four (airport, directions, appointments) close on a read-back confirmation; restaurant does not. Also defensible - read-back is THE A2 survival technique and meeting it in three unrelated situations is how a technique is acquired, the same argument 03-03 accepted for 'I'd like ... please' - but it is the phase's most repeated single move type. Corpus-wide, 25 of 90 moves open with 'Say' and 18 with 'Ask'. NOT a defect and nothing was rewritten. RATIFIED at the 03-11 gate: the coordinator reviewed both arguments and accepted them as STATED DESIGN DECISIONS rather than debt, so this entry is a design record and is WAIVED rather than owed. It stands for PHASE 4 to read before writing move 91: do not make Sounding Native five of five, and do not make the A2 read-back four of five. Related and still pointed at Phase 4: native/idioms is original and duplicates nothing, but its six phrases and eight cards are the most canonical idiom list in ELT and it is the one bank in the phase that reads like any textbook rather than like this app - CONT-04 will either deepen it or inherit it. | waived | Design decision reviewed and accepted at the 03-11 phase gate; recorded for Phase 4 rather than owed as a fix. | 2026-08-01T07:09:26.493Z | 2026-08-01T07:25:20.256Z |
| 45 | 03 | deviation | .planning/STATE.md |  | TOOLING DEFECT, consolidated: eight consecutive plans in this phase (03-03 through 03-10) hand-corrected the same state commands, and the corrections live scattered across eight summaries rather than anywhere a fix could start from. ROOT CAUSE, found by 03-05 and confirmed by 03-06 and 03-09: last_activity_desc is derived by a LINE-ORIENTED READ of the hard-wrapped 'Last activity:' paragraph in the body, so it takes the first physical line only and is cut mid-sentence ('...authored (128 new', '...composed lazily'). Not a length cap and not a serialisation bug. Two consequences: every later state.* command RE-DERIVES and re-truncates it, so it must be corrected AFTER the last tool write, not before; and a 'Last activity:' sentence written on one physical line survives intact (03-07 proved the workaround, 03-09 and 03-10 reused it). THREE FURTHER SMALL BUGS observed repeatedly and never fixed: (a) update-progress moves the progress BAR and leaves the PARENTHETICAL on the same line stale, so the line contradicts itself - reported by 03-04, 03-05, 03-07 and 03-09; (b) '**Current focus:** ... plan NN of 11 complete' is never advanced - stale on 03-05, 03-07 and 03-09; (c) state.add-decision stamps '- [Phase ?]:' on every row, and all 107 pre-existing decisions in the file carry it, so the phase has never been resolved by this command in the project's history. Also pre-existing and untouched by any plan: frontmatter total_phases: 4 against a progress line reading '3 of 6 phases' and a ROADMAP defining six; the Velocity block reading 'Total plans completed: 0' under a fully populated per-plan table. WARNING recorded by 03-07 for whoever fixes (c): a blanket [Phase ?] -> [Phase NN] replace stamps 107 historical rows belonging to phases 01, 02 and 02.1 with the wrong phase, which is worse than the state the tool leaves, and it is invisible in command output - only a line-by-line diff shows it. NINTH OCCURRENCE, at the 03-11 gate, diffed against a snapshot taken before the first state.* command: (a) fired again and worse - update-progress moved the bar to 100% and left BOTH halves of the parenthetical stale (3 of 6 phases and 35 of 36 plans, against a true 4 of 6 and 36 of 36 - 36 SUMMARY files on disk and ROADMAP defining six phases); (b) fired again - Current focus still read plan 10 of 11; (c) fired again - all four new decision rows stamped [Phase ?], corrected on exactly those four with the 107 historical rows counted before and after to prove they were untouched. NEW THIS RUN, a fourth bug: record-session REWROTE stopped_at as an UNQUOTED YAML scalar where every previous value in the file is quoted. What went RIGHT: completed_phases 3->4 and completed_plans 35->36 were both correct, and roadmap.update-plan-progress needed no correction. The last_activity_desc workaround held once more - the body sentence was rewritten on ONE physical line and the frontmatter field written LAST, and both parse cleanly as JSON strings. Nine plans is enough evidence: this should be fixed in the tool rather than absorbed a tenth time. | open |  | 2026-08-01T07:09:27.070Z |  |
| 46 | 03 | unrun-verify | .planning/phases/03-every-scenario-practicable/03-11-PLAN.md |  | Successor to 42, narrowed by the 03-11 browser pass of 2026-08-01 (next start -p 3117, signed in). WHAT CLOSED: ROADMAP criterion 3 end to end - five scenario grammar questions answered in social/small-talk, four wrong, all four topics reaching Weak spots BY NAME (Question tags, Past simple, Echo questions, Present simple vs continuous) each with an accuracy figure and a drill behind it, with attempts recorded under the composite ids and srs scheduled at box 1 (closes 33); and Check answers pressed on academic/news, rendering '1 / 4 correct.' with the authored explanations present in the DOM, verified by asserting two explain: strings pulled straight from scenario-reading.ts rather than by guessing at wording - the FIRST time an explained key has rendered anywhere in this app (closes 37). Scenario steps confirmed derived and honest on two scenarios. WHAT REMAINS, genuinely unobserved and deliberately NOT rounded up because the reviewer's context ran short: (1) typing into a scenario writing desk - the counter turning in range, Save draft, ticking a checklist line, Show model answer (WINDOWS 35); (2) ticking a rehearsal move - the line-through, 3 of 3, the Rehearsed pill, the single 15-XP award and the T-03-22 no-double-award property on untick/re-tick (WINDOWS 38); (3) the empty-a-bank honesty demo on a served page (proved in a scratch copy against full banks, not seen on screen); (4) the two neighbour side-by-side reads (the executor's read-through stands as the phase's reader pass; these were the second pair of eyes); (5) checklist item 2c/2d - the dashboard due count, the review hub badge and the list agreeing, and a mistake clearing on a correct re-answer; (6) ANY phone pass, for anything, in this project. Ordered checklist preserved at the foot of 03-11-SUMMARY.md. | open |  | 2026-08-01T07:24:26.661Z |  |
| 47 | 03 | unrun-verify | src/components/practice/ReviewHub.tsx |  | 03-11 browser pass, ONE READING NOT SETTLED - narrow and named so it is not re-investigated from scratch. Observed badges: Due today 4 - Your mistakes 2 - Weak spots 4, while the reviewer read attempts as holding FOUR entries with wrong: 1 and resolved: false. THE RULE IS INTENTIONAL AND IS NOW DOCUMENTED, so that half needs no further work: the three badges answer three different questions and are meant to disagree. Due today counts what the SCHEDULER says (dueReviewIds over srs box/due, independent of attempts). Weak spots counts TOPICS ever got wrong - weakTopics (progress.ts:386-402) filters on wrong > 0 REGARDLESS of resolved, because a topic you fixed once is still a topic you got wrong, which is the point of a recommendation. Your mistakes counts items got wrong and NOT YET re-answered correctly - openMistakeIds (progress.ts:405-411) filters on wrong > 0 && !resolved, and the empty state says so in as many words ('Get it right again and it clears automatically'). The badge and the view call THE SAME function (ReviewHub.tsx:42 and MistakesView.tsx:27), so they cannot drift. WHAT IS NOT SETTLED: from the state exactly as described, the code deterministically yields FOUR, not two - verified by running the verbatim predicate over a state of four wrong-and-unresolved social/small-talk grammar attempts (4 ids, all four resolving through resolveReviewItem, 4 distinct topics). So either two entries were resolved: true at the instant the badge rendered and false when the store was later inspected (most likely: 4/2/4 is EXACTLY what two wrong-then-right items produce, and clearing a mistake by re-answering it is checklist item 2d, which the reviewer was working through), or there is a real mismatch. NEXT STEP, and it is one step: answer two scenario grammar questions wrongly, read the badge and the attempts store AT THE SAME INSTANT, and confirm 2/2. Do not re-derive the predicates - they are above. | open |  | 2026-08-01T07:24:55.743Z |  |
| 48 | 03 | deviation | scripts/verify-scenario-content.mts |  | 03-11: a NEAR-MISS worth recording because the reviewer raised it and the answer is reassuring rather than obvious. Driving the 03-11 browser pass, the reviewer's own regex looked for the scenario reading explanations by searching the DOM for 'because', 'the passage' and 'Why:' and found NOTHING, then correctly warned that any committed assertion phrased that way would be weaker than it looks. Checked at the source: NO assertion anywhere in scripts/verify-scenario-content.mts matches explanation PROSE. Explanations are gated by filled(q.explain) - non-empty after trimming - at lines 919 and 1498, and by distinctness within a passage at 1554, and by nothing else; mutation M4 (a whitespace explanation) and M8/M9 (one explanation pasted over another) are what give those teeth. Measured over the live bank: of the 36 scenario reading explanations, 0 contain 'because', 0 contain 'Why:' and only 7 contain 'the passage' - they are written as substantive prose rather than to a formula, which is why the regex missed them and is arguably the better teaching. NO CHANGE MADE. Recorded so that a future reader who has the same idea does not conclude the explanations are absent, and so that nobody later ADDS a wording-shaped assertion believing it is a tightening. | open |  | 2026-08-01T07:24:56.275Z |  |
| 49 | 04 | deviation | src/lib/content/phrases.ts |  | 04-01: 'take on too much' (taken-on-too-much) shares a frame with listening.ts's C1 interview line, and 'turned up late' (turned-up-an-hour-late) with practical/housing's estate-agent example. Both incidental co-occurrences on other surfaces — neither teaches the unit — and both ids are committed, so correcting them would cost a retirement for no pedagogical gain. Accepted, not fixed. | open |  | 2026-08-02T06:16:03.386Z |  |
| 50 | 04 | deviation | .planning/STATE.md |  | 04-01: WINDOWS 45 recurred for a tenth consecutive plan. state.advance-plan left current_phase at 03, wrote total_phases: 5 for a 6-phase project, and left the prose Progress line contradicting its own frontmatter (36 of 36 vs 37 of 45). Corrected by hand; the root cause in the tooling is still unfixed. | open |  | 2026-08-02T06:16:03.890Z |  |
| 51 | 04 | deviation | .planning/STATE.md |  | 04-02: WINDOWS 45 recurred for an ELEVENTH consecutive plan and regressed rather than merely staling. state.advance-plan rewrote current_phase 04 -> 03 and total_phases 6 -> 5, and reported 'current_plan 11 / total_plans 11 / last_plan / ready_for_verification' -- it read PHASE 03's plan count while the project is on phase 04, plan 2 of 9. state.update-progress DELETED the informative Progress parenthetical outright ('37 of 45 plans (4 of 6 phases complete; Phase 4 has 9 plans written and 1 executed)' -> a bare '84%'), which is bug (a) escalated from stale to destructive. state.add-decision stamped [Phase ?] on all three new rows again. All corrected by hand; the 107 historical [Phase ?] rows were counted before and after to prove the blanket-replace trap of WINDOWS 45 was avoided. The last_activity_desc workaround (one physical line, written LAST) held again and parses as JSON. The Current Position body and Current focus were ALSO still describing Phase 03 plan 11 of 11 with 03-06 prose, pre-existing and never advanced by the tool -- rewritten by hand this run. Eleven plans is past the point where absorbing it again is reasonable. | open |  | 2026-08-04T05:20:57.768Z |  |
| 52 | 04 | deviation | src/lib/content/grammar.ts |  | 04-02: six PRE-EXISTING exact duplicates in the grammar corpus, found by the mandated corpus scan and deliberately NOT fixed (every one is a committed id, so each costs a retirement under the 04-01 gate). The cross-surface one is the notable case: work/emails#grammar#look-forward-to-gerund's prompt is byte-identical to global b8's ('I look forward to ___ from you.'), so a learner answers the same question twice under two ids and only one namespaces to her scenario -- D-01 at the grammar grain. The other five are wholly inside src/lib/content/grammar.ts (a8==a17, a5==a21, c4==c14, c6==c18 explain, d3==d11). Full detail in .planning/phases/04-native-level-depth/deferred-items.md. No assertion was added either: it would fail on arrival, and a gate that fails on arrival gets disabled rather than fixed. | open |  | 2026-08-04T05:20:58.283Z |  |
| 53 | 04 | deviation | src/lib/content/scenario-lessons.ts | 125 | native/idioms briefing tip[0] quotes two phrases retired at 04-03 (piece-of-cake, under-the-weather) and quotes them as expression=gloss; 04-04 owns the briefing | fixed |  | 2026-08-04T05:54:44.298Z | 2026-08-04T06:39:34.204Z |
| 54 | 04 | deviation | src/lib/content/scenario-vocabulary.ts | 1607 | native/idioms 8 vocabulary cards recommended for retirement at 04-03 but MIN_VOCAB_CARDS=8 makes it illegal until replacements land; carried to 04-04, needs its own human approval | fixed |  | 2026-08-04T05:54:56.778Z | 2026-08-04T06:39:34.684Z |
| 55 | 04 | deviation | src/lib/content/scenario-lessons.ts | 340 | OPEN QUESTION for the phase gate, filed by 04-04 rather than decided by it: should FALLBACK_LESSON be DELETED outright and getScenarioLesson made to return ScenarioLesson\|undefined, like every other bank accessor? 04-04 proved it unreachable by assertion (all 35 scenarios resolve to their own briefing, checked by reference AND by value) instead of deleting it, because deletion changes the accessor's return type and every call site - churn in files 04-04 does not own, to buy a property the assertion already buys. The record is therefore dead-and-gated rather than gone. 03-11 took the other route for phrases.ts. Whoever next touches scenario-lessons.ts should settle which is right. | open |  | 2026-08-04T06:40:11.061Z |  |
| 56 | 04 | deviation | src/lib/content/scenario-vocabulary.ts | 1607 | 04-04's corpus scan left TWO pairs above its own declared J>=0.60 defect threshold, judged short-field artefacts and NOT fixed - recorded here so the judgement can be second-guessed rather than buried in a summary. (a) J=0.750 now-and-again.es 'de vez en cuando' vs global/vocab/daily.es 'en vez de': four-word denominator, three shared function words, opposite meanings ('from time to time' vs 'instead of'). (b) J=0.667 a-non-starter.term 'a non-starter' vs travel/restaurant#vocab#starter.term 'a starter': three-word denominator, morphological (non- prefix), zero shared teaching. Neither is the D-01 failure the threshold was written for. The same scan restricted to fields of >=6 words - where duplication actually matters - tops out at J=0.308 over 66,495 pairs, and there are ZERO exact duplicates. If a later plan disagrees, the fix is to change the card, never to move the threshold. | open |  | 2026-08-04T06:40:11.559Z |  |
| 57 | 04 | deviation | src/lib/content/scenario-lessons.ts | 326 | 04-05: native/register's briefing tip quotes the opening shapes of its own phrase pair 1 (Can you...? / Would you be able to...?). 04-04's briefing/bank separation gate is scoped to native/idioms so it does not fire. Not fixed: widening the gate to all 35 briefings is a decision about the gate, and this plan does not own scenario-lessons.ts. | open |  | 2026-08-04T07:28:15.512Z |  |
| 58 | 04 | deviation | src/lib/content/scenario-lessons.ts |  | native/culture's briefing tip says "That's so 2010" — a four-digit year in the one scenario whose banks are now gated against years; 04-06's gate is scoped to the two banks it owns | open |  | 2026-08-04T08:28:00.658Z |  |
| 59 | 04 | deviation | src/components/practice/PronunciationLab.tsx |  | 04-07: T-04-15 is PARTIALLY UNMET, 5 of 6, and it cannot be met by authoring. Its mitigation reads 'every addition puts the contrast on a word the recogniser must return', which holds for the five segmental contrasts only because a mis-articulated segment happens to produce a DIFFERENT WORD. It cannot hold for native/pronunciation#phrase#record-it-and-a-record: scoreAttempt() normalises to a word set and tests membership, so re-CORD and RE-cord are the same token and the noun/verb stress shift is invisible to the score. Vowel length, aspiration and contour are equally invisible - the five that work do so by luck of the metric, not by design. SHIPPED WITH THE LIMITATION DISCLOSED IN THE ITEM'S OWN TIP rather than dropped or hidden. This is the evidence input for deferred VOICE-01 (v2 backlog) and closes only when a real voice model lands. | open |  | 2026-08-04T09:28:26.734Z |  |
| 60 | 04 | deviation | .planning/STATE.md |  | 04-07: WINDOWS 45, FIFTEENTH consecutive occurrence, with one improvement and one NEW sub-finding that entry 45 does not record. IMPROVEMENT: state.record-metric wrote its row correctly this time - the Performance Metrics table is real and populated, contrary to 04-06's reading that it was a placeholder for all 42 plans. STILL BROKEN: update-progress again replaced the informative Progress parenthetical with a bare percentage, and again reset frontmatter total_phases from 6 to 5 against a ROADMAP defining 6. NEW AND ACTIONABLE: state.record-session ALSO resets total_phases, so it reverted a hand-correction I had already applied after update-progress. The correction must therefore be made AFTER THE LAST state.* VERB RUNS, not after the first one that damages the field - the same ordering rule entry 45 records for last_activity_desc now applies to total_phases as well. Any plan that hand-corrects between verbs will silently lose the fix. | open |  | 2026-08-04T09:29:02.718Z |  |
| 61 | 04 | deviation | src/lib/content/scenario-reading.ts |  | 04-08 DELIBERATE DEFERRAL, recorded by name so CONT-04 does not close silent about it. D-01 - the user's own wording - asks for 'large idiom and phrasal-verb banks, MORE READING, MORE REHEARSALS'. The banks were delivered by 04-01 through 04-07 and 'more rehearsals' was delivered in kind at 04-08 by option E (native/idioms reworked off contrastive repetition onto predict-then-check with a count and a ban; the other three keep theirs because contrast is their subject). 'MORE READING' WAS NOT DELIVERED. It was deliverable only through 04-08's options A (native/phrasal-verbs declares reading) and B (native/register declares reading), each about 631 authored words, and both were DECLINED BY THE USER at 04-08's blocking checkpoint on a measured ratio argument: 631 words per passage is 4x what 04-CONTEXT projected (157.8), and the two native passages that already exist are both above the corpus mean (323 and 291 body words vs 247). Option F (a second passage per scenario) was declined as UI work outside D-01's scope - it needs the record type, the accessor, the coverage wrapper, the practice branch and a picker that does not exist. Nothing later in Phase 4 touches reading, so this does not close inside this phase. NOT a defect and nothing is broken: the app claims no reading it does not have, because coverage is derived. This is a scope record, owed to whoever revisits CONT-04 or plans a Phase 4.1. | open |  | 2026-08-04T20:25:41.000Z |  |
| 62 | 04 | unrun-verify | .planning/phases/04-native-level-depth/04-09-PLAN.md |  | 04-09 Task 2, the PHASE 4 BLOCKING BROWSER CHECKPOINT, WAS NOT PERFORMED. The automated half of the gate passed in full (verify-scenario-content 14,577; verify-id-stability 2,021 over 651 ids with 651 fixture entries agreeing EXACTLY under an independent enumeration that does not import the gate's own logic; merge 25,647; schema 309; queue 173; headers 24; celpip 43/648/50; tsc, lint and build all exit 0; deps 11 prod + 11 dev with zero packages installed; payload 205,174 B = 19.6% of the 1,048,576 B cap; 53/53 pairs written and 0 pending, asserted; a 19-mutation sweep in a scratch copy with its OWN node_modules returning 17 of 17 CAUGHT on their own labels with 2 controls surviving, every verdict carrying a landing proof and a parse check; the derivation control re-proved). What a script CANNOT establish and what this entry owes, ten items, none rounded up: (1) THE BATCHED RECALL DECK HAS NEVER BEEN RENDERED - it is the phase's one component change, it sits between the learner and every recall item in the app, and its rest point, per-batch counter, whole-sitting completion totals and 'Go again' return are exactly the kind of thing that is correct in a pure function and wrong on a page; (2) the same deck on /review with MORE THAN SIXTEEN due - RecallDeck has four callers, all inherit batching by design, and a mixed due set is the longest un-pausable run in the app, plus the mount-time-snapshot property (rating an item correct must NOT shrink the deck underneath you) and whether the rest point's copy reads sensibly for a set drawn from several scenarios; (3) a sub-ceiling deck (practical/appointments, 14 cards) confirmed to run start to finish with NO rest point, which is the check that the thirty untouched scenarios were left alone; (4) the eighteen-phrase warm-up at its new length, and whether it is exhausting; (5) native/idioms READ AS A LEARNER against Phase 3's verdict that it 'reads like any ELT textbook', which was the whole reason for this phase; (6) the nine register pairs rendering ADJACENT, casual then formal - a pair split across the deck teaches nothing; (7) the advertised minutes on the five native scenario pages; (8) TICKING A REHEARSAL MOVE - the line-through, 3 of 3, the Rehearsed pill, the single 15-XP award, and whether the latch survives a REMOUNT (research read it as component-local state that may well award twice); inherited from WINDOWS 38, open since Phase 3; (9) the empty-a-bank honesty demo on a SERVED page (proved in a scratch copy, not seen on screen); (10) ANY PHONE PASS, FOR ANYTHING - still true of this entire project. TWO ITEMS OUTRANK THE REST because they came from the real beta user rather than from an internal check: whether tapping a drop-down blank in a CELPIP reading exercise still ZOOMS THE PAGE on mobile (a fix is deployed at f164ec5 and has NEVER been confirmed on a device), and whether the CELPIP NAV LINK (d06c219) renders and routes on a phone as well as desktop - the entire exam section had no menu entry at all until the beta user asked where it was. Also carried forward unobserved: the CELPIP tabs are BELOW the 44px touch minimum (26px and 34px), and Listening audio and Speaking recording have NEVER run on a phone, so the MediaRecorder WebM->MP4 container probe written specifically for Safari has still never executed on the browser family it exists for. An ordered checklist with URLs and expected outcomes is at the foot of 04-09-SUMMARY.md, every item marked unobserved. | open |  | 2026-08-04T21:21:20.000Z |  |
| 63 | 04 | deviation | src/lib/content/scenario-writing.ts |  | 04-09, completing the record WINDOWS 61 began: OPTION D WAS ALSO DECLINED, and it is recorded here by name so that every option the user turned down at 04-08's checkpoint is written down rather than only the ones that mapped onto D-01's headline wording. OPTION D would have grown native/register from one writing task to two or three. WHAT IT WOULD DELIVER: more writing practice in the one native scenario whose subject - the formality dial - is most naturally exercised in writing, where register errors are permanent and visible. ITS MEASURED PRICE, and the reason declining it was right: research priced D as 'bank shape + accessor + ONE call site'. 04-08 measured the true cost as EIGHT FURTHER ASSERTION BLOCKS in verify-scenario-content.mts that read the writing accessor as a SINGLE prompt, so the container would have to be reshaped for ALL NINE writing pairs in the app for one scenario's benefit. That is a corpus-wide refactor bought for a single scenario, and it was declined once priced - the same discipline that declined A and B on their ratio. WHAT WOULD UNBLOCK IT: a plan that owns the writing container end to end and reshapes the accessor from 'a prompt' to 'prompts' for all nine pairs deliberately, with the eight harness blocks migrated in the same commit; at that point a second or third register task costs only its authored words. NOT a defect and nothing is broken: native/register ships one writing task, the coverage registry reports one writing task, and the app claims nothing it does not have. This is a scope record, owed to whoever revisits CONT-04 or plans a Phase 4.1, and it belongs beside WINDOWS 61 rather than inside it because A/B/F were declined on a CONTENT ratio and D was declined on an ENGINEERING price - two different arguments that a later reader should not conflate. | open |  | 2026-08-04T21:21:20.000Z |  |
| 64 | 04 | deviation | src/lib/content/phrases.ts |  | 04-09 READER'S FINDING, from the near-duplication read-through this phase's named residual risk (T-04-21) is mitigated by. NO NEAR-DUPLICATE EXERCISE WAS FOUND and nothing was rewritten: with well over a hundred items authored across seven plans by agents that could not see each other's output, no item in any of the five Sounding Native scenarios reads as another's with the nouns changed. MECHANICAL BACKING, cross-scenario within the world, 2,808 phrase pairs and 4,992 term pairs: highest phrase J = 0.286 stripped / 0.333 raw, highest term J = 0.400 stripped / 0.375 raw, and NOTHING at or above 0.50 in either, in either view. Against 03-11's baselines for this world (0.14 phrases, 0.00 terms) both numbers ROSE - phrases by 0.146, terms by 0.400 - and the honest reading of that rise is mostly POOL SIZE rather than quality: the world went from 30 phrases and 40 cards to 84 and 112, so the same content quality searched over roughly nine times as many pairs will surface a higher maximum. A METHOD FINDING WORTH MORE THAN THE NUMBERS: the first run of this scan used a conventional stoplist containing up/on/off/out/over/into and scored social/small-talk#catch-up against native/phrasal-verbs#catch-on at J = 1.000, because both collapse to {catch}. A PARTICLE IS NOT A STOPWORD IN THIS WORLD - stripping it deletes exactly the unit native/phrasal-verbs exists to teach (verb + particle + SENSE). Any future scan of this world must retain particles as content words or it will manufacture duplicates that are not there. FOUR THINGS A READER SEES THAT THE SCAN DID NOT, all judged and none fixed: (a) 'I'm afraid' occurs on four surfaces - native/idioms#phrase#not-my-call, native/register#phrase#formal-wont-be-possible, work/negotiating's deal-breaker example, and native/register#vocab#softener whose term is literally 'a softener (unfortunately, I'm afraid)'. Only the card TEACHES it; the other three use it as a natural tail. Incidental co-occurrence, the same class as WINDOWS 49, and correcting it would cost a retirement for no pedagogical gain. (b) native/idioms#vocab#a-pinch-of-salt ('take something with a pinch of salt') and native/culture#vocab#face-value ('take something at face value') share an identical syntactic skeleton while teaching NEAR-OPPOSITES (discount it vs believe it literally). This is precisely the shared-frame failure 04-05's reader pass exists to catch and a word-set metric cannot see (J = 0.333). Judged worth keeping: the frame is the ordinary English one for both, and both ids are committed, so a rewrite is a changed hash - the one-way door this phase exists to keep shut - bought for a shared preposition. (c) native/idioms#vocab#keep-someone-in-the-loop and native/culture#vocab#fill-someone-in are the closest same-world pair in the phase (J = 0.400 stripped). They are genuinely distinguishable - ongoing inclusion vs a one-off catch-up, and culture's is specifically about being filled in on a REFERENCE you missed - but a reader may reasonably disagree, so the number is recorded rather than buried. (d) native/register's BRIEFING names three of its own deck's cards in a single tip: 'Contractions and slang signal informal; full forms signal formal' quotes slang, a contraction and a full form. 04-04's briefing/bank separation gate is scoped to native/idioms and does not fire here. This is the CARD half of the same defect WINDOWS 57 records for the PHRASE half in this very scenario, so register's briefing now overlaps its own banks in two independent ways and the case for widening that gate to all 35 briefings is stronger than when 57 was filed. ONE SCAN FLAG WAS A FALSE POSITIVE AND THE READER OVERRULED IT: a within-scenario check reported native/phrasal-verbs teaching 'catch on' on two surfaces. It is 04-01's DELIBERATE polysemy split - the card teaches 'become popular' and the phrase teaches 'understand', and the phrase's tip names the card's sense by contrast ('aqui catch on es entender, no ponerse de moda'). The design working, not a repeat. DESIGN ECHO, named because it is the phase's most concentrated one: THREE OF THE FIVE DECKS ARE METALANGUAGE decks (register markers, reference machinery, phonetics) and two are EXPRESSION decks (idioms, phrasal verbs). A learner moving register -> culture -> pronunciation meets the same card shape - a name for a thing - three times. Defensible and in two of the three cases forced: where the app cannot SCORE the skill, the only deliverable is the vocabulary to understand being told (04-07 argues this explicitly for pronunciation). The three share no term and no territory. Recorded for whoever writes the sixth native scenario: do not make it four of six. | open |  | 2026-08-04T21:21:20.000Z |  |
| 65 | 04 | deviation | .planning/phases/04-native-level-depth/04-07-SUMMARY.md |  | 04-09 SETTLES THE CORPUS-SIZE DISCREPANCY 04-08 RAISED, and closes the silent trap that caused it. 04-07's summary reports the authored corpus at 4,523 fields rising to 4,565; 04-08 measured 4,410 on the same tree with the same harvester and called it a reporting error. MEASURED AT THE GATE, both harvesters run against exported trees at four separate commits: 33f082b (04-07's OWN final commit, the tree that summary describes) = 4,410 fields; 47454ef = 4,410; b4c0e6b = 4,440; HEAD = 4,440. So 04-08 IS RIGHT and 04-07's figure does not reproduce at 04-07's own tree - there are no 155 missing fields and no later plan should go looking for them. The 4,410 -> 4,440 step is EXACTLY the 30 fields option C added (5 grammar questions x (prompt + explain + 4 options)), which also explains why 04-08 measured 4,410: it scanned before its own content landed. Arithmetically exact against independently counted banks at HEAD: phrase fields 2 x 264 + 192 tipped = 720, vocab 3 x 352 = 1,056, grammar 2 x 35 + 140 options = 210. THE CAUSE OF THIS CLASS OF ERROR IS NOW REMOVED. 04-05's broken corpus.mts sat in the scratchpad beside 04-06's corrected corpus2.mts, and scan.mts and probe.mts STILL IMPORTED THE BROKEN ONE. Measured side by side at the gate: corpus2.mts sees 4,440 fields, corpus.mts sees 3,948 - it silently drops 492, being every reading passage BODY (body is string[] and its push guard required typeof text === 'string'), every GLOSSARY entry (it read .term/.es against a {word, meaning} shape) and every reading QUESTION prompt (it read q.prompt against q.q). A near-duplicate scan run through it therefore reports 'clean' over a corpus missing exactly the surfaces a scenario's banks are most likely to collide with, including native/culture's own letter home. 04-08 named the hazard and left the file in place. The gate makes it IMPOSSIBLE TO PICK UP BY MISTAKE instead: corpus.mts now THROWS on evaluation with a message naming corpus2.mts, verified by running scan.mts and watching it exit 1 with that message, and the original is archived as a .txt so it cannot be imported either. This is scratch tooling, so nothing in the repo changed. | open |  | 2026-08-04T21:21:20.000Z |  |
| 66 | 04 | deviation | .planning/STATE.md |  | 04-09: THE state.* TOOLING DEFECT, CONSOLIDATED IN ONE PLACE WITH ITS ROOT CAUSE, on its SEVENTEENTH consecutive occurrence. This supersedes the scattered records in WINDOWS 45, 50, 51 and 60 and in nine plan summaries; read this entry and stop re-deriving it. SEVENTEEN consecutive plans (03-03 through 03-11, then 04-01 through 04-09) have hand-corrected the same commands. ROOT CAUSE, found by 03-05 and confirmed repeatedly: last_activity_desc is derived by a LINE-ORIENTED READ of the hard-wrapped 'Last activity:' paragraph in the body, so it takes the FIRST PHYSICAL LINE ONLY and truncates mid-sentence. It is not a length cap and not a serialisation bug. THE WORKAROUND, proved by 03-07 and reused ever since: write the 'Last activity:' sentence on ONE PHYSICAL LINE, and write the frontmatter field LAST. THE FIVE RECURRING BUGS: (a) update-progress moves the progress BAR and destroys or stales the informative PARENTHETICAL on the same line - escalated from stale to destructive at 04-02, where it replaced the whole parenthetical with a bare percentage; (b) '**Current focus:**' is never advanced; (c) state.add-decision stamps '[Phase ?]' on every row it writes, and 113 pre-existing rows already carry it - WARNING, a blanket [Phase ?] -> [Phase NN] replace would stamp those historical rows, belonging to phases 01/02/02.1/03, with the WRONG phase, which is worse than the state the tool leaves and is invisible in command output; only a line-by-line diff shows it, so correct ONLY your own rows and count the historical ones before and after; (d) advance-plan and record-session both RESET frontmatter total_phases from 6 to 5 against a ROADMAP defining six, and advance-plan has also rewritten current_phase backwards (04 -> 03 at 04-02) and read the WRONG PHASE's plan count; (e) record-session writes stopped_at as an UNQUOTED YAML scalar where every other value in the file is quoted. THE ORDERING RULE THAT MAKES CORRECTION POSSIBLE, and the single most important line here: EVERY HAND-CORRECTION MUST BE MADE AFTER THE LAST state.* VERB HAS RUN, never between verbs - 04-07 proved record-session reverts a total_phases fix already applied after update-progress, so a plan that corrects too early silently loses the fix. NEW AT 04-09, and the reason this entry exists rather than a nineteenth summary paragraph: roadmap.update-plan-progress reported complete:false and WROTE NOTHING AT ALL at 04-08, leaving both the '**Plans**:' line and the phase table row stale. SEVENTEEN plans is long past the point where absorbing this again is reasonable; it should be fixed in the tool, and this entry is where a fix should start. | open |  | 2026-08-04T21:21:20.000Z |  |
| 67 | 04.1 | unrun-verify | .planning/phases/04.1-vocabulary-volume-deck/04.1-01-PLAN.md |  | 04.1-01 task 3 is a blocking human-verify checkpoint that has never been performed; 04.1-02 did not perform it either and VOCAB-01/02/03 stay unmarked | open |  | 2026-08-05T00:42:21.895Z |  |
| 68 | 04.1 | deviation | src/lib/content/core-vocabulary.ts |  | 04.1-04: `color` is glossed "color / tono" purely to satisfy the es!==word gate — Spanish for color IS color. Cognates below rank 500 (total, natural, general, personal, similar) will keep hitting this in plans 05-06; decide whether a `cognate` skip reason is declared BEFORE a plan needs it. | open |  | 2026-08-05T01:25:42.811Z |  |
| 69 | 04.1 | deviation | src/lib/content/core-vocabulary.ts |  | 04.1-05: the plan's removed-line check fails by design on the vocab:color retirement — the same plan's cognate_decision instructs the deletion the check exists to catch; it should assert a matching hand-declared entry in the fixture's retired list instead | open |  | 2026-08-05T02:06:15.952Z |  |
| 70 | 04.1 | unrun-verify | src/app/core-vocabulary |  | 04.1-05: /core-vocabulary has never been opened in a browser (380 cards, 04.1-01 task 3 still outstanding), and it can now hold an orphaned srs key under vocab:color that no bank emits — nothing confirms the surface ignores it rather than counting it | open |  | 2026-08-05T02:06:17.085Z |  |
| 71 | 04.1 | deviation | src/lib/content/core-vocabulary.ts |  | 04.1-07 READER PASS, the finding no gate can see: the deck-wide subject-shape figure HIDES a per-BAND lean, and the band is the unit a learner actually sits through. Pronoun/possessive openers per band of fifty: 14, 10, 6, ONE, ONE, 11, 8, 17, 15, 8. Deck-wide 17.8% is the number every plan in this phase reported; bands 4 and 5 (cards 151-250) run at 2%, i.e. 98 of 100 consecutive sentences with a non-pronoun subject. Those two bands are almost exactly 04.1-04's batch, whose own summary spent 2 pronoun openers of 120 and NAMED the risk it was creating; 04.1-05 and 04.1-06 corrected the deck-wide average by steering their OWN batches, which cannot reach back. NOT FIXED AND MUST NOT BE: every one of those ids is committed, so rewriting them is a re-point on about 49 permanent keys. Any future batch should be judged per-band, not deck-wide. | open |  | 2026-08-05T03:06:18.014Z |  |
| 72 | 04.1 | deviation | src/lib/content/core-vocabulary.ts |  | 04.1-07 READER PASS: the TAKEN-FRONT strategy pushes a gloss off its headword's central sense, and nothing asserts the front is answerable by the card's own word. 04.1-06 re-glossed fifteen cards to avoid a front another card already held; the cost is a class of cards whose most natural English answer is a DIFFERENT word. Named, with what would change them: standard -> habitual (a learner answers *usual*; and the example 'I chose standard delivery and waited nine days' teaches the default-option sense, which is not habitual -- the sharpest of the five, because gloss and example teach different senses); complete -> rellenar (answers *fill in*); evidence -> indicios (answers *clues*); response -> reaccion (answers *reaction*); relate -> vincular (answers *link*). MITIGATION ALREADY IN PLACE, measured rather than assumed: none of fill, link, react, clue, usual or normal is a card, so no front has two right answers INSIDE the deck. Each fix is a retirement plus a new slug -- the user's decision, not a tidy-up at a gate. The bank is untouched. | open |  | 2026-08-05T03:06:19.157Z |  |
| 73 | 04.1 | deviation | src/lib/content/core-vocabulary.ts |  | 04.1-07 READER PASS: three examples lean on a word a B1 learner is unlikely to know, which is the one thing the six-word floor cannot see. affect -- 'Damp affects the plaster on that north wall' needs BOTH damp (as a noun) and plaster; demand -- 'Demand for allotments doubled after the lockdown' turns on allotments, a low-frequency British word carrying the sense; fund -- 'He ran through the funds in under a year' hides the meaning in the phrasal verb 'ran through'. Soft, and named rather than fixed: each is a retire-and-re-add on a live id. Also a CLASS worth naming rather than any single card: a two-sense gloss with a one-sense example -- time 'tiempo / vez', back 'espalda / de vuelta', way 'manera / camino' all show only the first sense. That is legal under every assertion and is still half a card. | open |  | 2026-08-05T03:06:20.130Z |  |
| 74 | 04.1 | unrun-verify | src/app/core-vocabulary/page.tsx |  | 04.1-07: THE BLOCKING BROWSER CHECKPOINT (plan 04.1-07 task 4) WAS NOT PERFORMED. Supersedes and widens WINDOWS 67 and 70. Nobody has opened /core-vocabulary in a browser since the deck held TWENTY cards; it now holds 500 in ten bands of fifty. Unobserved, by name: (1) the sidebar entry reached without typing a URL; (2) the surface reporting 500 words and ten bands; (3) the tier statement on screen; (4) the tier chip on every card; (5) recallBatches splitting a fifty-card band with a rest point -- still never rendered on ANY surface, the same component open as WINDOWS 62 since Phase 4; (6) Dashboard and review 'Reviews due', 'Due today' and 'Your mistakes' UNCHANGED across a study session, which is the whole of L5 and is proved today only from source and from a synthetic state; (7) the Postgres sync round trip -- rate Got it, reload, confirm it is no longer due; (8) the deck's own study-what-is-due queue returning exactly the missed cards and no scenario card; (9) Weak spots showing Core vocabulary as a LINK rather than as not-written; (10) an orphaned vocab:color srs key ignored rather than counted -- now asserted, never seen; (11) anything at all on a PHONE, the device the beta user practises on; (12) the beta user's own verdict on whether 500 NGSL cards are what she meant by 'too little content'. The ordered checklist with URLs is task 4 of 04.1-07-PLAN.md. | open |  | 2026-08-05T03:06:21.150Z |  |
| 75 | 04.1 | deviation | scripts/verify-scenario-content.mts |  | 04.1-07: SUBJECT SHAPE IS DELIBERATELY NOT GATED, decided rather than left implied. It is the dimension that went wrong twice in four batches (04.1-04's bare-plural lean, 04.1-06's 40.8% first draft) and no assertion can see it: the shape that matters -- bare plural / mass / inanimate subject -- needs animacy and part-of-speech, and 'Wash the lettuce' and 'Termites destroyed' open identically to any string test. A ceiling on a proxy that does not track the risk would be weakened the first time it failed a legitimate batch, which is exactly how a gate stops being a gate. Two coarse figures are now PRINTED by the harness under an instruction (pronoun/possessive share, content-word-opener share) so the two named readers have a number instead of a scratch script each writes again. WHO CHECKS IT: (1) the executor of any plan authoring into this bank, at DRAFT time, before --update, while a rewrite is still free; (2) the phase gate's reader pass. If a third batch is ever authored and neither reader is named in its plan, this dimension is unguarded. | open |  | 2026-08-05T03:06:22.142Z |  |
| 76 | 04.1 | deviation | src/lib/content/core-vocabulary.ts |  | 04.1-07: an EMPTIED bank still produces EXACTLY ONE failure at 500 cards, re-measured rather than inherited. 04.1-02's M37 found this at twenty and the property has not changed: every other volume assertion -- INCLUDING the nine 04.1-07 added -- passes vacuously over zero cards, because the loops do not run, the ceilings are satisfied and the containment is perfect. 'volume: the enumerator emits one id per card (the containment is not an empty deck)' is still the ONLY thing standing between a vacuous green and a real one. Stated as 04.1-02 instructed any later plan to state it: the new assertions DO survive an empty deck, and that is written down rather than left to be discovered. | open |  | 2026-08-05T03:06:23.179Z |  |
| 77 | 04.1 | deviation | .planning/WINDOWS.md |  | 04.1-07: gsd-tools windows append REFUSES a CRLF ledger. On Windows with core.autocrlf, any `git checkout -- .planning/WINDOWS.md` restores the file with CRLF endings and every subsequent append dies with 'Ledger frontmatter line is not key: value' pointing at last_updated with a trailing \\r. The workaround is to rewrite the file to LF before appending. Filed beside WINDOWS 66's state.* tooling entry because it is the same class: a tool that cannot round-trip its own artifact on the platform the project is developed on. | open |  | 2026-08-05T03:06:24.106Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "02",
    "file": "src/lib/celpip-progress.ts",
    "line": null,
    "description": "02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-28T23:55:44.383Z",
    "resolved_at": "2026-07-31T12:06:17.747Z"
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "02",
    "file": "src/app/api/celpip-progress/route.ts",
    "line": null,
    "description": "The plan's route gates are bare presence counts: overwrite-instead-of-merge, cap removal and rate-limit removal all produced ZERO failures. Sharpened call-site gates are recorded in 02-06-SUMMARY.md but live only in that document.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-28T23:55:44.925Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/SpeakingRecorder.tsx",
    "line": null,
    "description": "02.1-01 checkpoint: the Speaking phone pass was not done (no device available). The MediaRecorder isTypeSupported container probe (WebM -> MP4) exists precisely for Safari before 18.4, which supports MP4 only, so the one browser family it was written for has never run it. Owed to 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T03:10:00.000Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/SpeakingRecorder.tsx",
    "line": null,
    "description": "02.1-01 checkpoint: microphone release-on-stop is code-verified, not observed. The run used a synthetic AudioContext MediaStreamDestination, whose track lifecycle is not the OS recording indicator. Needs one real-device glance in 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T03:10:00.000Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/CelpipLanding.tsx",
    "line": null,
    "description": "02.1-02: the skill-aware /celpip landing has never been opened in a real browser. The server-rendered HTML was read from a production `next start` (coverage line, disabled tabs, JSON-LD) and the client logic was executed in node against a generated copy of the component, but hydration, the skill-tab switch and the Writing group control were never exercised in a browser. The plan explicitly warns that breaking the `ready` discipline produces a hydration mismatch on a page the beta user opens daily. Owed to 02.1-12.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T07:07:20.000Z",
    "resolved_at": "2026-07-31T11:56:25.250Z"
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/CelpipLanding.tsx",
    "line": null,
    "description": "02.1-02: HISTORY_SOURCES is gated only by an ad-hoc harness that was not committed (it transpiles the component and stubs its render imports, which is too heavy for scripts/). 54 assertions and 15 mutations ran green — including two that initially SURVIVED and were closed — but plans 05 and 09 append an entry to that array with no automated protection. CELPIP_SECTIONS is committed-gated by scripts/verify-celpip-sections.mts; the history half is not.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T07:07:20.000Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/speaking-prompts.ts",
    "line": null,
    "description": "02.1-03: the eight Speaking cards and the Task 3 written-scene caveat render only under the Speaking tab, which is client-side, so the served /celpip HTML carries the Writing tab alone and neither has been SEEN rendered. What was verified against a production `next start`: all eight prompt routes return 200, an unknown id returns 404, the coverage line reads \"8 prompts covering 8 of the 8 exam task shapes\", and the Task 3 page serves its disclosure, its scene text and its 30/60 timings. What was not: no browser has switched to the Speaking tab, and none of the seven new prompts has been taken through record -> playback -> self-check (only the plan-01 advice prompt was, at 02.1-01's checkpoint). Owed to 02.1-12.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T07:30:42.000Z",
    "resolved_at": "2026-07-31T11:57:09.694Z"
  },
  {
    "id": 8,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/AudioCheck.tsx",
    "line": null,
    "description": "02.1-04: nobody has HEARD the audio check. The whole component exists to answer the question 'did sound come out', and it has never been opened in a browser, never run on a phone, and never played through a speaker. Everything checkable without one was checked: the speech driver is gated by scripts/verify-celpip-speech.mts (50 assertions, 22 mutations) against a mock engine, and all seven of the component's render branches were server-rendered in node against a generated copy. What is untested is the part only a device can answer - whether two distinct voices actually come out on Chrome, Safari and Android; whether the iPhone hardware silent switch produces exactly the failure the troubleshoot branch describes; and whether a CELPIP-length multi-turn script really survives Chrome's ~15s utterance truncation. That last one is the reason speaker-turn chunking exists. AudioCheck is not mounted by any route until plan 05, so this cannot be closed before then. Owed to 02.1-12.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T08:09:51.051Z",
    "resolved_at": null
  },
  {
    "id": 9,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/AudioCheck.tsx",
    "line": null,
    "description": "02.1-04: AudioCheck's markup is gated only by an ad-hoc harness that was not committed - it transpiles the component with the TypeScript compiler API, seeds the phase state, and server-renders each branch, which is too much machinery for scripts/ and is the same judgement 02.1-02 made about HISTORY_SOURCES. 24 checks and 8 mutations ran green (7 caught, 1 known survivor: a dead onClick, which a markup-only harness cannot see). So plan 05 mounts and edits this component with no automated protection on its escape hatches - the iPhone silent-switch guidance, the reveal-the-words escape and the run-anyway path can each be deleted without any committed gate noticing. The speech DRIVER is committed-gated by scripts/verify-celpip-speech.mts; the component half is not.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T08:09:51.645Z",
    "resolved_at": null
  },
  {
    "id": 10,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/ListeningPlayer.tsx",
    "line": null,
    "description": "Nobody has heard the Listening runner or driven it in a browser: the phase machine, the one-question-at-a-time reveal, submit and the recorded attempt have never been clicked through, and no audio has come out of a speaker on any device.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T08:45:09.723Z",
    "resolved_at": null
  },
  {
    "id": 11,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/ListeningPlayer.tsx",
    "line": null,
    "description": "The player's D-04/D-05 behaviour is gated by greps and by a manually-run served-HTML measurement, not by a committed render harness. The RSC-payload leak is now committed-gated at the route boundary, but the one-at-a-time reveal and the no-revisit rule are not.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T08:45:19.431Z",
    "resolved_at": null
  },
  {
    "id": 12,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/listening-set-1.ts",
    "line": null,
    "description": "Nobody has heard the two new two-speaker parts; the multi-voice distinguishability and the 714-word problem-solving script are unproved by ear",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T09:12:59.043Z",
    "resolved_at": null
  },
  {
    "id": 13,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/listening-set-1.ts",
    "line": null,
    "description": "Nobody has sat listening set 1 end to end and timed it. The set is now 2,090 words and 29 items on a 44-minute derived clock; the timing check is bounded by arithmetic against one real 76-second measurement, not observed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T09:26:46.853Z",
    "resolved_at": null
  },
  {
    "id": 14,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/listening-set-1.ts",
    "line": null,
    "description": "Nobody has heard the discussion part: whether three browser voices stay distinguishable by ear across a 378-word script is unknown, and six of its eight questions are unanswerable if they are not.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T09:47:19.779Z",
    "resolved_at": null
  },
  {
    "id": 15,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/ListeningPlayer.tsx",
    "line": null,
    "description": "The player shows no speaker label WHILE audio plays; labels exist only in the post-answer transcript. Plan 11 authored around it by naming all three speakers aloud in the script, but any future multi-speaker part inherits the same constraint unspoken.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T09:47:20.426Z",
    "resolved_at": null
  },
  {
    "id": 16,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/ReadingRunner.tsx",
    "line": null,
    "description": "02.1-08: nobody has seen the reading runner. Neither ReadingRunner nor DropdownBlank has been opened in a browser, on a phone, or with a screen reader — READING_SETS is empty so no URL reaches them. Untested: whether the native select opens as the system picker on iOS/Android, whether inline selects sit legibly in a paragraph at mobile widths, and whether the per-part clock reads correctly when re-armed. Cannot close before 02.1-09 lands a bank. Owed to 02.1-12.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T10:02:45.239Z",
    "resolved_at": "2026-07-31T11:57:10.814Z"
  },
  {
    "id": 17,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/ReadingRunner.tsx",
    "line": null,
    "description": "02.1-08: two component invariants survived mutation with NO gate at all — the Timer's per-part key={part.id} and DropdownBlank's aria-label. Both are silent when broken (a stale clock carried into the next part; four unlabelled combo boxes in one paragraph). A committed gate needs a render harness, which 02.1-04 judged too much machinery for scripts/. The greps live only in 02.1-08-SUMMARY.md.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T10:02:45.838Z",
    "resolved_at": null
  },
  {
    "id": 18,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip.ts",
    "line": null,
    "description": "02.1-08: id uniqueness across question ids and blank ids within a reading set is documented on CelpipReadingPart but gated by nothing. They share one answers map, so a collision silently overwrites one of two answers and mis-scores the sheet (T-02.1-39). This plan could not gate it — gating needs a bank. Owed to 02.1-09's content harness.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T10:02:46.482Z",
    "resolved_at": "2026-07-31T11:56:24.626Z"
  },
  {
    "id": 19,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/DropdownBlank.tsx",
    "line": null,
    "description": "Nobody has answered a drop-down blank in a browser. The reading set now serves 200 and the explanation renders under the blank in code, but the plan's human-check (answer one blank wrongly on purpose and read the explanation) was not run: no browser-driving tool was available to this executor and adding one would have installed a package. Closes the moment someone opens /celpip/reading/reading-set-1 and picks a wrong option.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T10:27:00.428Z",
    "resolved_at": "2026-07-31T11:56:25.867Z"
  },
  {
    "id": 20,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/reading-set-1.ts",
    "line": null,
    "description": "The two 'the passage does not say' questions are gated for shape but not for pedagogy: nothing asserts that at least one such option is the KEY. An author who made every not-stated option wrong would pass all 519 assertions while teaching the learner to discount the very option the information part tests her on. The invariant is stated in a comment on INFORMATION_PART and gated by nothing.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T10:27:00.993Z",
    "resolved_at": null
  },
  {
    "id": 21,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/reading-set-1.ts",
    "line": null,
    "description": "Nobody has worked Reading set 1 end to end at a real pace; whether 39 minutes fits these passages is untested",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T11:00:17.011Z",
    "resolved_at": null
  },
  {
    "id": 22,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/ReadingRunner.tsx",
    "line": null,
    "description": "The new per-part item order (blanks before questions for the diagram part only) has never been seen rendered; gated by harness and mutation only",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T11:00:17.547Z",
    "resolved_at": "2026-07-31T11:56:26.484Z"
  },
  {
    "id": 23,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/lib/celpip-speech.ts",
    "line": null,
    "description": "planVoices is all-or-nothing: enoughVoices requires pool.length >= distinct.length, so a device offering only two English voices drops ALL THREE discussion speakers to the browser default distinguished by pitch alone (1 / 0.85 / 1.15) rather than using the two real voices it has plus one shift. Six of the discussion part's eight items are attribution questions. Mitigated in content (plan 11 names all three speakers aloud within the first seven turns) but not in code, and unobserved by ear. Found by the 02.1-12 gate.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T11:16:10.159Z",
    "resolved_at": null
  },
  {
    "id": 24,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": ".planning/phases/02.1-celpip-remaining-skills/02.1-12-PLAN.md",
    "line": null,
    "description": "02.1-12 Task 2, the phase's blocking human checkpoint, was NOT performed: the six ROADMAP success criteria have not been observed in a browser, and no phone or Safari pass happened. The automated half of the gate passed in full. This is the entry that owes ~20 of the others in this ledger; an ordered checklist is in 02.1-12-SUMMARY.md and in the plan-12 final report.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-07-31T11:16:17.383Z",
    "resolved_at": "2026-07-31T11:57:11.927Z"
  },
  {
    "id": 25,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/lib/celpip/speaking-prompts.ts",
    "line": null,
    "description": "Successor to window 7, narrowed by the 02.1-12 browser pass. What CLOSED: the Speaking tab was switched to in a real browser, the cards render, and the Task 3 written-scene caveat was SEEN on screen. What REMAINS: none of the seven prompts added by plan 03 has been taken through record -> playback -> self-check, and no human has HEARD a recording play back on any prompt (a blob: audio element was verified to load and recordingSeconds to be correct, which is not the same thing).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T11:57:10.263Z",
    "resolved_at": null
  },
  {
    "id": 26,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/DropdownBlank.tsx",
    "line": null,
    "description": "Successor to window 16, narrowed by the 02.1-12 browser pass. What CLOSED on desktop: the reading runner renders, a drop-down blank was answered, and the per-part clock re-arms correctly (11:00 -> 8:00 -> 9:00 -> 11:00; part 4 re-armed despite sharing part 1's 11-minute allowance, which is exactly the latent bug key={part.id} was added for). What REMAINS: no mobile pass at all - whether the native select opens as the iOS/Android system picker, and whether four inline selects sit legibly in one paragraph at phone widths, are both still unknown.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T11:57:11.373Z",
    "resolved_at": null
  },
  {
    "id": 27,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": ".planning/phases/02.1-celpip-remaining-skills/02.1-12-PLAN.md",
    "line": null,
    "description": "Successor to window 24: what the 02.1-12 browser pass did NOT reach, and what therefore still blocks a clean phase close. (1) The Listening RESULTS screen and the post-answer transcript with speaker labels - automation overshot it twice. (2) The 55-minute Listening clock, untimed. (3) Speaking playback BY EAR - no human has heard a recording. (4) The OS microphone indicator going out on stop - a synthetic stream cannot show it. (5) ANY phone or Safari path - the MediaRecorder WebM->MP4 container probe has still never executed on the browser family it was written for. (6) Cross-device persistence for the three new sections - not run at all. Reading is the one section verified end to end on desktop.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T11:57:21.685Z",
    "resolved_at": null
  },
  {
    "id": 28,
    "kind": "deviation",
    "phase": "02.1",
    "file": "src/components/celpip/ReadingRunner.tsx",
    "line": null,
    "description": "KNOWN LIMITATION, now spanning all four skills: close the tab from the results screen and the attempt is lost - including a full 39-minute Reading sitting. finalizeAttempt runs on results-view EXIT (Retry / Back to tasks), the pattern Phase 1 chose for Writing and that Speaking, Listening and Reading each inherited. Observed 2026-07-31 in the 02.1-12 cross-device pass: a Reading attempt did not persist because the reviewer navigated straight to sign-out rather than through an exit control. IMPROVEMENT CANDIDATE, deliberately not fixed at the gate (out of plan scope). PRECISION FOR WHOEVER FIXES IT: ProgressSync.tsx:62-69 already wires visibilitychange+pagehide, but those flush the sync QUEUE - they push state already recorded. On the results screen finalizeAttempt has not run, so there is nothing queued to flush. The fix needs finalizeAttempt itself wired to the same event pair inside ReadingRunner, ListeningPlayer and SpeakingRecorder, with care for finalizedRef and the reset-on-retry paths. Use visibilitychange/pagehide, NOT beforeunload - ProgressSync.tsx:57-61 records why the unload-time events were deliberately avoided (unreliable on mobile, being removed).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T12:06:17.158Z",
    "resolved_at": null
  },
  {
    "id": 29,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/components/practice/RecallDeck.tsx",
    "line": null,
    "description": "03-01: the recall loop and the review flow have not been driven by a human in a browser. What WAS observed (production build, next start, served HTML): social/small-talk renders the 'Lock it in' step with its first authored card; social/dating renders the honest 'not ready yet' warm-up panel and NO generic per-world lines; both scenarios render one section per declared skill with 'Not yet available'; step numbers derive correctly (1 2 3 4 with the recall step omitted); the JSON-LD carries no 'teaches' key. What was NOT observed: (1) the interactive recall loop - Show it, Got it / Not yet, the XP float, the 'Locked in' screen; (2) /review rendering a due scenario item, because /review is auth-gated (307 to /login) and needs a signed-in session plus a populated store - this is the far end of D-05 and is proved deterministically by verify-scenario-content.mts (resolveReviewItem over every composed id, plus the schema/merge storage leg) but has never been seen; (3) the honest panel's link targets actually navigating. Owed to plan 03-11. CLOSED AT THE 03-11 GATE. Item (1), the interactive recall loop, was driven by the user in a browser on 2026-08-01. Item (2), /review rendering a due scenario item, was driven on the same day and re-confirmed at the gate pass, where scenario attempts were recorded under their composite ids and srs scheduled them at box 1. Item (3), the honest panel link targets, is MOOT rather than observed: at 52/52 no declared pair renders that panel on any page, so there is nothing left to navigate from - it survives only as the control that would fire if a bank entry were deleted, which was re-proved against full banks in a scratch copy at the gate.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T00:27:49.960Z",
    "resolved_at": "2026-08-01T07:25:56.385Z"
  },
  {
    "id": 30,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/components/practice/ReviewHub.tsx",
    "line": null,
    "description": "03-02: the three widened review surfaces have not been seen by a human. Dashboard's due count, ReviewHub's 'Due today' badge, the weak-spots drill (both the mixed grammar+recall case and the 'nothing to drill yet' branch) and MistakesView's new compact recall card are gated ONLY by three grep guards, tsc/lint/build, and an inline node proof that the weak-spots selection returns 3 grammar + 14 recall items for a mixed weak set against the real banks. There is no committed assertion over any of these components, because they are React and this repo has no test runner (TEST-01, v2). All four need a signed-in session with a populated srs/attempts store to reach. NOTE: the user drove 03-01's far end in a browser on 2026-08-01 and reported /review resolving and rendering a real scenario item, which closes items (1) and (2) of ledger entry 29 - 03-11 inherits a smaller debt than 29 states. Owed to plan 03-11.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T01:12:52.055Z",
    "resolved_at": null
  },
  {
    "id": 31,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/lib/content/phrases.ts",
    "line": null,
    "description": "03-03: the twelve new Work and Practical scenario pages have not been opened by a human. The RENDER PATH is observed (03-01 saw a curated scenario render its 'Lock it in' step from the same accessors, and the user drove /review in a browser on 2026-08-01) and the CONTENT is gated by 4529 committed assertions plus a 17-mutation sweep, so this is a low-risk gap rather than an unproven one. What no one has looked at: the six phrases and eight cards on each of work/emails, work/presentations, work/negotiating, work/networking, work/feedback, work/interviews, work/meetings, practical/phone-calls, practical/tech-support, practical/housing, practical/banking and practical/appointments as they actually read on screen - line breaks, the length of the longer C1 negotiating lines in the card, and whether the Spanish glosses sit well next to the English. Editorial, not structural. Owed to plan 03-11's browser pass, which is already visiting these surfaces for entries 29 and 30.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T01:53:21.055Z",
    "resolved_at": null
  },
  {
    "id": 32,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/lib/content/phrases.ts",
    "line": null,
    "description": "03-04: the ten new Reading & Ideas and Sounding Native scenario pages have not been opened by a human. The RENDER PATH is observed (03-01 saw a curated scenario render its 'Lock it in' step through these same accessors, and the user drove /review in a browser on 2026-08-01) and the CONTENT is gated by 6019 committed assertions plus an 18-mutation sweep with 11 caught, 5 controls survived and 2 applier refusals, so this is an editorial gap rather than an unproven one. What nobody has looked at: the six phrases and eight cards on each of academic/news, academic/articles, academic/stories, academic/summaries, academic/debate, native/idioms, native/phrasal-verbs, native/pronunciation, native/register and native/culture as they actually read on screen. Two things are specific to this batch and worth a deliberate glance: native/register's phrases are three CONTRASTING PAIRS and the pairing is only legible if the casual and formal lines sit adjacent in the rendered order, and the C1 articles and debate lines are the longest in the corpus. Owed to plan 03-11's browser pass, which is already visiting these surfaces for entries 29, 30 and 31.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T02:24:03.538Z",
    "resolved_at": null
  },
  {
    "id": 33,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/lib/content/scenario-grammar.ts",
    "line": null,
    "description": "03-05: no human has ANSWERED a scenario grammar question in a browser. The four quizzes were observed in the SERVED HTML of a production build (social/small-talk renders step 5 'Practise grammar' with the topic pill 'Question tags', the counter '1 / 5', the prompt 'It's freezing out there today,' and its four options, with the gap showing ____ rather than the answer), and the harness proves the wiring deterministically: every composed id resolves through resolveReviewItem as kind 'grammar', reviewableIds() lists all 20, and GrammarQuiz's untouched recordAttempt(q.id, isRight, {topic, level, chosen}) is what populates weakTopics. But the INTERACTIVE half is unseen: picking an option, the XpFloat, the explanation panel and the 'Ask the tutor why' link, the results screen, and the far end - a wrong answer on social/small-talk#grammar#weather-question-tag appearing under 'Question tags' in /review's weak spots and being drillable there. That last one is ROADMAP criterion 3 for Phase 3 and it is inherited rather than built, so it is proved by construction and not by observation. Needs a signed-in session. Owed to plan 03-11's browser pass, alongside entries 29, 30, 31 and 32.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T04:19:04.700Z",
    "resolved_at": "2026-08-01T07:24:25.103Z"
  },
  {
    "id": 34,
    "kind": "stub",
    "phase": "03",
    "file": "src/components/WorldView.tsx",
    "line": null,
    "description": "03-05, restated at the 03-11 gate because its STATUS changed while its CODE did not. WorldView.tsx renders SkillPill with no availability flag, so the world page counts DECLARATIONS while the scenario page one click deeper reads the coverage registry. When this was filed it was a LIVE overclaim: /world/social showed a solid Speaking pill on a scenario whose speaking practice was not written. As of 03-10 all 52 declared pairs are written, so today the two surfaces agree by accident and there is nothing to see in a browser. THE CODE IS UNCHANGED, so the overclaim is latent rather than gone: it re-arms the moment PHASE 4 adds a scenario that declares a skill before its bank entry exists, which is the normal authoring order. Deliberately NOT fixed at the gate: it is not a live defect, the plan does not own WorldView.tsx, and a UI change made at a gate is a change nobody in this run can look at. The fix is three lines (import getScenarioCoverage, pass available per skill); the prop exists and defaults to true. Owed to whichever Phase 4 plan first adds a scenario with an unwritten pair. RESOLVED at 04-08 (commit 47454ef), by the plan that then declared two skills before their banks existed and so would have made it live. Fixed NOT the way this entry predicted: 'import getScenarioCoverage' INTO WorldView was measured at +217,154 B (+52.1%, 6 -> 9 chunks) on the /world/[slug] client bundle, because WorldView is a client component and the registry pulls in all six content banks. The derivation went into the server component instead (+50 B) and WorldView takes a REQUIRED `written` prop, so a future caller cannot re-introduce the overclaim by omission. Two source-read assertions in verify-scenario-content.mts hold it, both mutation-proved.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T04:19:19.508Z",
    "resolved_at": "2026-08-04T20:25:41.000Z"
  },
  {
    "id": 35,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/components/practice/WritingDesk.tsx",
    "line": null,
    "description": "03-06: the writing desk's INTERACTIVE half is unseen by a human, and so is the multi-prompt picker path. Observed in the served HTML of a production build: all nine scenario writing pairs render their own task with NO picker row (the markup goes straight from <div> to <div class=\"grid gap-5 lg:grid-cols-2 \">, with no mt-4), the level badge, the word range and the 0-words counter render, and the model answer is absent from the served HTML. NOT observed: typing into the editor, the counter turning 'in range', Save draft writing to localStorage under the composed id, ticking a checklist line, and Show model answer revealing the model. Also NOT observed: the >1-prompt branch that still renders the picker - the global writing room at /skill/writing mounts WritingDesk behind a client-side tab whose default is 'Learn', so 13 prompts never reach the initial HTML and curl cannot click the tab. The branch is one boolean (prompts.length > 1) and is unchanged for that path, but it is proved by reading rather than by seeing. Owed to plan 03-11's browser pass alongside entries 29-33.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T04:55:16.464Z",
    "resolved_at": null
  },
  {
    "id": 36,
    "kind": "stub",
    "phase": "03",
    "file": "src/lib/scenario-coverage.ts",
    "line": null,
    "description": "03-06: ScenarioSkillCoverage.summary is derived, asserted and rendered NOWHERE. Grep for '.summary' across src/components and src/app returns only the two CELPIP call sites (CelpipLanding.tsx:266 and celpip/page.tsx:90); no scenario surface renders the scenario coverage summary at all. So the strings the harness pins - '5 questions' for grammar since 03-05, '1 task' for writing since 03-06 - are a contract nobody reads yet. This is not a defect in either plan (both were told to produce a count and a unit, and both do) and the assertions have teeth (mutation M18 catches a reworded unit), but a field that is asserted and unrendered can drift into being wrong for a UI that later starts rendering it. Either a surface should show it or its absence should be a deliberate, recorded decision.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T04:55:30.754Z",
    "resolved_at": null
  },
  {
    "id": 37,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/components/practice/ReadingRoom.tsx",
    "line": null,
    "description": "03-07: nobody has CHECKED ANSWERS on a scenario reading passage, so the two things this plan built have never been seen doing their job. Observed in the served HTML of a production build: all five scenario reading pairs (travel/restaurant, practical/housing, academic/news, academic/stories, academic/summaries) render the STANDALONE passage reader as their own step - level badge, minutes, Read aloud, title, body, glossary, questions and the Check answers button - with NO back link and NO level-filter pills, and academic/summaries renders its reading passage and its DIFFERENT writing passage on one page. NOT observed: the EXPLAINED KEY. Every explanation is behind {submitted && q.explain}, so it is absent from the served HTML entirely (grep returns 0, as does the answer index) and only appears after a click curl cannot make. So 'every scenario comprehension question tells the learner why the answer is the answer' is proved by construction - the type requires it, the harness asserts it non-empty on all 20 questions, and mutation M3 catches a whitespace explanation - but not by sight. Also unobserved: that the GLOBAL reading room's own single-passage reader still shows its back link after a text is chosen from the list. The ReadingRoom browser function is byte-identical in the diff and every change is behind onBack being present, so this is proved by reading rather than by seeing. Owed to plan 03-11's browser pass alongside entries 29-35.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T05:29:13.276Z",
    "resolved_at": "2026-08-01T07:24:25.629Z"
  },
  {
    "id": 38,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/components/practice/SpeakingTaskPanel.tsx",
    "line": null,
    "description": "03-09: nobody has TICKED A MOVE, so the one thing this panel does that the writing desk does not — award XP — has never been seen doing it. Observed in the served HTML of a production build (next start, shut down afterwards, port 3000 drained to zero sockets and refusing): all fourteen written speaking pairs render the rehearsal panel as their own step, carrying the level badge, the 'say it out loud' label, the title, the setup, the three numbered moves, the 'You did it if' block with the success line, the '0 of 3 moves rehearsed' counter and the footer stating that nothing is listening; social/complaining and academic/debate each render their rehearsal AND their different writing task on one page; travel/airport still renders the honest 'Not yet available' panel for its unwritten speaking pair; and /skill/speaking reads '14 of the 30 scenarios that train your speaking have practice written for the situation itself — the rest are on the way, and say so' with the pending badge on the sixteen. NOT observed: ticking a checkbox, the line-through on a ticked move, the counter moving to 3 of 3, the 'Rehearsed' pill appearing, and the single award of 15 speaking XP with the day's activity recorded — including the T-03-22 property that unticking and re-ticking does not award again. That property is proved by construction (the awarded flag latches and is never cleared) and by mutation (M24, M25 and M26 all fire on the source scan), but not by sight. Owed to plan 03-11's browser pass alongside entries 29-37.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T06:05:27.780Z",
    "resolved_at": null
  },
  {
    "id": 39,
    "kind": "unmet-truth",
    "phase": "03",
    "file": "scripts/verify-scenario-content.mts",
    "line": null,
    "description": "03-08: the D-01 assertion 'no passage text is repeated anywhere in the scenario reading corpus' fingerprints p.body.join(' '), so it only fires when the WHOLE body matches. A scenario passage that borrows ONE paragraph from another scenario's passage is D-01's failure at a finer grain and is NOT caught - proved by mutation M23, which copies native/idioms' first paragraph over native/culture's and SURVIVES a full harness run (declared as an expected survivor rather than deleted). The corpus is clean today: an out-of-band scan over all 31 authored paragraphs finds 0 exact cross-scenario reuse and 0 pairs above Jaccard 0.5 across 426 cross-scenario paragraph pairs, and 0 shared four-word runs against any other authored text. The gap is in the assertion's reach, not in the content. NOT closed by this plan because plan 03-09 had uncommitted work in that same harness file in the same working tree at the time, and staging it would have swept up theirs. Fix is one appended assertion: fingerprint paragraphs, not just joined bodies.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T06:10:57.860Z",
    "resolved_at": "2026-08-01T07:08:19.848Z"
  },
  {
    "id": 40,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/phases/03-every-scenario-practicable/03-08-SUMMARY.md",
    "line": null,
    "description": "03-08: a MUTATION SWEEP IN A SHARED WORKING TREE POISONED A PARALLEL PLAN'S PRODUCTION BUILD, silently and with no trace in git. Plan 03-09 ran npm run build at 02:00:04 while this plan's sweep had mutation M21 applied to src/lib/content/scenario-reading.ts (const authored = BANK['social/humor'] instead of BANK[key]). The sweep restored the file byte-for-byte (sha256 verified) so git was clean, but .next kept the mutation: every scenario page served 'The Man Who Mows at Seven', and the minifier had dropped eight of the nine passages from the emitted JS as unreachable. Caught only because this plan curled four pages and saw one title four times; confirmed by reading the mutated accessor back out of the build's own SOURCE MAP (the map records what the bundler read). REPAIRED by rebuilding from the clean committed tree - all nine slugs now present in the emitted JS in equal numbers and the map carries BANK[key] with zero mutated occurrences. 03-09's own browser observation (WINDOWS 38) is unaffected: it is about scenario-speaking.ts, which no mutation touched. THE STANDING HAZARD: any wave that pairs a mutation sweep with a sibling plan in one working tree can do this again in either direction, and neither plan would see it in git status. Mitigations to choose between: run sweeps in a git worktree or a copy, or assert the built accessor after any build a summary makes a claim about.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T06:11:18.477Z",
    "resolved_at": null
  },
  {
    "id": 41,
    "kind": "deviation",
    "phase": "03",
    "file": "scripts/verify-scenario-content.mts",
    "line": null,
    "description": "03-10: A DECLARED GRANULARITY GAP in the speaking D-01 assertions, in the spirit of WINDOWS 39. 'scenario speaking: <key> is written for itself' fingerprints the whole task body (title+setup+moves+success) and 'has its own three moves' fingerprints the whole three-move list, both by byte-identity after canonicalisation. So TWO SCENARIOS SHARING A SINGLE MOVE ARE CAUGHT BY NEITHER, and neither is a near-duplicate that differs by one word. Mutation M17 (one scenario given another's entire move list) fires; a one-move borrow would not. Not a shipped defect: scan 1 shows 90 moves / 90 distinct and scan 2 shows 0 of 3,915 cross-scenario move pairs above Jaccard 0.5, so the corpus is clean out of band. Related, and also declared: 'every scenario speaking id is unique across all scenarios' cannot be falsified from the DATA at all, because every id is composed from a scenario key that is unique by construction - it only fails if the accessor stops using the scenario key, which mutation M12-key catches on a different label. Both assertions imply more grip over authored content than they have. The fix for the first is a per-move cross-scenario check in the speaking group; left for the plan that owns the harness.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T06:45:16.756Z",
    "resolved_at": "2026-08-01T07:08:20.407Z"
  },
  {
    "id": 42,
    "kind": "unrun-verify",
    "phase": "03",
    "file": ".planning/phases/03-every-scenario-practicable/03-11-PLAN.md",
    "line": null,
    "description": "03-11 Task 2, the phase's BLOCKING human checkpoint, has NOT been performed at the time of the Task 1 commit. The automated half of the gate passed in full (11,981 + 25,647 + 309 + 173 + 24 + 43 + 648 + 50 assertions; tsc/lint/build exit 0; deps 11+11; saturated payload measured at 143,830 bytes = 13.7% of the 1 MiB cap; the derivation control re-proved against FULL banks in a scratch copy: emptying one exercise entry took 52/52 to 51/52, put the pair in pendingPairs(), emptied its summary and flipped the scenario incomplete, with no second edit). What a script cannot establish, and what this entry owes: the three ROADMAP criteria seen in a browser. Specifically still unobserved and inherited from entries 29-38: nobody has ANSWERED a scenario grammar question (33), TYPED into a scenario writing desk (35), pressed CHECK ANSWERS on a scenario passage so no explained key has ever rendered (37), or TICKED A MOVE on any of the thirty rehearsals so the single 15-XP award has never been seen (38). An ordered checklist with URLs is in 03-11-SUMMARY.md. Owed to plan 03-11 Task 3, which is preconditioned on this pass and which sets CONT-01/CONT-02's final status from it.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-01T07:08:44.652Z",
    "resolved_at": "2026-08-01T07:24:26.139Z"
  },
  {
    "id": 43,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/lib/content/phrases.ts",
    "line": null,
    "description": "03-11: the five SPEAKING_PACKS and the global speaking warm-up were repointed off the deleted lenient accessor onto getScenarioPhrases with a ?? [] at each of the twelve call sites, and their CONTENTS have not been seen. What WAS observed against a served production build: all five pack titles render on /skill/speaking (Greetings & small talk, Travel essentials, At work, Tricky sounds, Idioms), zero of the six deleted WORLD_FALLBACK lines appear on any of eight pages checked, and two scenarios still render their own curated warm-up. What was NOT: the pack PHRASES themselves, because SpeakingWorkspace mounts them behind a client-side tab whose default is not the drill, so curl cannot reach them - the same limitation 03-06 recorded for WritingDesk's picker at /skill/writing. Proved instead by construction (every one of the twelve keys is curated, and the harness asserts every scenario resolves to a non-empty set, so ?? [] is unreachable) and by tsc/lint/build. Closes the moment someone opens /skill/speaking and starts a pack.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T07:08:45.202Z",
    "resolved_at": null
  },
  {
    "id": 44,
    "kind": "deviation",
    "phase": "03",
    "file": "src/lib/content/scenario-speaking.ts",
    "line": null,
    "description": "03-11 READER'S FINDING, from the near-duplication read-through the phase's residual risk (T-03-25) is mitigated by. No near-duplicate exercise was found: nothing in plans 03, 04 or 10 reads as another scenario's exercise with the nouns changed, and the mechanical backing is strong (90 moves all distinct, 0 of 3,915 cross-scenario move pairs at or above J=0.50, 0 shared four-word runs carrying content; same-world highest phrase similarity is 0.20 in Work, 0.14 in Sounding Native, 0.00 for both worlds' vocabulary terms). What a READER sees that a scan does not is repetition of exercise DESIGN, in two places. (1) SOUNDING NATIVE: four of the five rehearsals are the same contrastive-repetition drill - say it, say it again differently, name what changed (idioms: with then without; phrasal-verbs: phrasal then single-word; register: colleague then agency; pronunciation: three passes). native/culture is the only one that escapes it. Defensible, because comparison is the only self-markable drill for style and accent with no listener, but it is the most concentrated design echo in the phase. (2) THE A2 COUNTER TASKS: three of the four (airport, directions, appointments) close on a read-back confirmation; restaurant does not. Also defensible - read-back is THE A2 survival technique and meeting it in three unrelated situations is how a technique is acquired, the same argument 03-03 accepted for 'I'd like ... please' - but it is the phase's most repeated single move type. Corpus-wide, 25 of 90 moves open with 'Say' and 18 with 'Ask'. NOT a defect and nothing was rewritten. RATIFIED at the 03-11 gate: the coordinator reviewed both arguments and accepted them as STATED DESIGN DECISIONS rather than debt, so this entry is a design record and is WAIVED rather than owed. It stands for PHASE 4 to read before writing move 91: do not make Sounding Native five of five, and do not make the A2 read-back four of five. Related and still pointed at Phase 4: native/idioms is original and duplicates nothing, but its six phrases and eight cards are the most canonical idiom list in ELT and it is the one bank in the phase that reads like any textbook rather than like this app - CONT-04 will either deepen it or inherit it.",
    "status": "waived",
    "reason": "Design decision reviewed and accepted at the 03-11 phase gate; recorded for Phase 4 rather than owed as a fix.",
    "recorded_at": "2026-08-01T07:09:26.493Z",
    "resolved_at": "2026-08-01T07:25:20.256Z"
  },
  {
    "id": 45,
    "kind": "deviation",
    "phase": "03",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "TOOLING DEFECT, consolidated: eight consecutive plans in this phase (03-03 through 03-10) hand-corrected the same state commands, and the corrections live scattered across eight summaries rather than anywhere a fix could start from. ROOT CAUSE, found by 03-05 and confirmed by 03-06 and 03-09: last_activity_desc is derived by a LINE-ORIENTED READ of the hard-wrapped 'Last activity:' paragraph in the body, so it takes the first physical line only and is cut mid-sentence ('...authored (128 new', '...composed lazily'). Not a length cap and not a serialisation bug. Two consequences: every later state.* command RE-DERIVES and re-truncates it, so it must be corrected AFTER the last tool write, not before; and a 'Last activity:' sentence written on one physical line survives intact (03-07 proved the workaround, 03-09 and 03-10 reused it). THREE FURTHER SMALL BUGS observed repeatedly and never fixed: (a) update-progress moves the progress BAR and leaves the PARENTHETICAL on the same line stale, so the line contradicts itself - reported by 03-04, 03-05, 03-07 and 03-09; (b) '**Current focus:** ... plan NN of 11 complete' is never advanced - stale on 03-05, 03-07 and 03-09; (c) state.add-decision stamps '- [Phase ?]:' on every row, and all 107 pre-existing decisions in the file carry it, so the phase has never been resolved by this command in the project's history. Also pre-existing and untouched by any plan: frontmatter total_phases: 4 against a progress line reading '3 of 6 phases' and a ROADMAP defining six; the Velocity block reading 'Total plans completed: 0' under a fully populated per-plan table. WARNING recorded by 03-07 for whoever fixes (c): a blanket [Phase ?] -> [Phase NN] replace stamps 107 historical rows belonging to phases 01, 02 and 02.1 with the wrong phase, which is worse than the state the tool leaves, and it is invisible in command output - only a line-by-line diff shows it. NINTH OCCURRENCE, at the 03-11 gate, diffed against a snapshot taken before the first state.* command: (a) fired again and worse - update-progress moved the bar to 100% and left BOTH halves of the parenthetical stale (3 of 6 phases and 35 of 36 plans, against a true 4 of 6 and 36 of 36 - 36 SUMMARY files on disk and ROADMAP defining six phases); (b) fired again - Current focus still read plan 10 of 11; (c) fired again - all four new decision rows stamped [Phase ?], corrected on exactly those four with the 107 historical rows counted before and after to prove they were untouched. NEW THIS RUN, a fourth bug: record-session REWROTE stopped_at as an UNQUOTED YAML scalar where every previous value in the file is quoted. What went RIGHT: completed_phases 3->4 and completed_plans 35->36 were both correct, and roadmap.update-plan-progress needed no correction. The last_activity_desc workaround held once more - the body sentence was rewritten on ONE physical line and the frontmatter field written LAST, and both parse cleanly as JSON strings. Nine plans is enough evidence: this should be fixed in the tool rather than absorbed a tenth time.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T07:09:27.070Z",
    "resolved_at": null
  },
  {
    "id": 46,
    "kind": "unrun-verify",
    "phase": "03",
    "file": ".planning/phases/03-every-scenario-practicable/03-11-PLAN.md",
    "line": null,
    "description": "Successor to 42, narrowed by the 03-11 browser pass of 2026-08-01 (next start -p 3117, signed in). WHAT CLOSED: ROADMAP criterion 3 end to end - five scenario grammar questions answered in social/small-talk, four wrong, all four topics reaching Weak spots BY NAME (Question tags, Past simple, Echo questions, Present simple vs continuous) each with an accuracy figure and a drill behind it, with attempts recorded under the composite ids and srs scheduled at box 1 (closes 33); and Check answers pressed on academic/news, rendering '1 / 4 correct.' with the authored explanations present in the DOM, verified by asserting two explain: strings pulled straight from scenario-reading.ts rather than by guessing at wording - the FIRST time an explained key has rendered anywhere in this app (closes 37). Scenario steps confirmed derived and honest on two scenarios. WHAT REMAINS, genuinely unobserved and deliberately NOT rounded up because the reviewer's context ran short: (1) typing into a scenario writing desk - the counter turning in range, Save draft, ticking a checklist line, Show model answer (WINDOWS 35); (2) ticking a rehearsal move - the line-through, 3 of 3, the Rehearsed pill, the single 15-XP award and the T-03-22 no-double-award property on untick/re-tick (WINDOWS 38); (3) the empty-a-bank honesty demo on a served page (proved in a scratch copy against full banks, not seen on screen); (4) the two neighbour side-by-side reads (the executor's read-through stands as the phase's reader pass; these were the second pair of eyes); (5) checklist item 2c/2d - the dashboard due count, the review hub badge and the list agreeing, and a mistake clearing on a correct re-answer; (6) ANY phone pass, for anything, in this project. Ordered checklist preserved at the foot of 03-11-SUMMARY.md.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T07:24:26.661Z",
    "resolved_at": null
  },
  {
    "id": 47,
    "kind": "unrun-verify",
    "phase": "03",
    "file": "src/components/practice/ReviewHub.tsx",
    "line": null,
    "description": "03-11 browser pass, ONE READING NOT SETTLED - narrow and named so it is not re-investigated from scratch. Observed badges: Due today 4 - Your mistakes 2 - Weak spots 4, while the reviewer read attempts as holding FOUR entries with wrong: 1 and resolved: false. THE RULE IS INTENTIONAL AND IS NOW DOCUMENTED, so that half needs no further work: the three badges answer three different questions and are meant to disagree. Due today counts what the SCHEDULER says (dueReviewIds over srs box/due, independent of attempts). Weak spots counts TOPICS ever got wrong - weakTopics (progress.ts:386-402) filters on wrong > 0 REGARDLESS of resolved, because a topic you fixed once is still a topic you got wrong, which is the point of a recommendation. Your mistakes counts items got wrong and NOT YET re-answered correctly - openMistakeIds (progress.ts:405-411) filters on wrong > 0 && !resolved, and the empty state says so in as many words ('Get it right again and it clears automatically'). The badge and the view call THE SAME function (ReviewHub.tsx:42 and MistakesView.tsx:27), so they cannot drift. WHAT IS NOT SETTLED: from the state exactly as described, the code deterministically yields FOUR, not two - verified by running the verbatim predicate over a state of four wrong-and-unresolved social/small-talk grammar attempts (4 ids, all four resolving through resolveReviewItem, 4 distinct topics). So either two entries were resolved: true at the instant the badge rendered and false when the store was later inspected (most likely: 4/2/4 is EXACTLY what two wrong-then-right items produce, and clearing a mistake by re-answering it is checklist item 2d, which the reviewer was working through), or there is a real mismatch. NEXT STEP, and it is one step: answer two scenario grammar questions wrongly, read the badge and the attempts store AT THE SAME INSTANT, and confirm 2/2. Do not re-derive the predicates - they are above.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T07:24:55.743Z",
    "resolved_at": null
  },
  {
    "id": 48,
    "kind": "deviation",
    "phase": "03",
    "file": "scripts/verify-scenario-content.mts",
    "line": null,
    "description": "03-11: a NEAR-MISS worth recording because the reviewer raised it and the answer is reassuring rather than obvious. Driving the 03-11 browser pass, the reviewer's own regex looked for the scenario reading explanations by searching the DOM for 'because', 'the passage' and 'Why:' and found NOTHING, then correctly warned that any committed assertion phrased that way would be weaker than it looks. Checked at the source: NO assertion anywhere in scripts/verify-scenario-content.mts matches explanation PROSE. Explanations are gated by filled(q.explain) - non-empty after trimming - at lines 919 and 1498, and by distinctness within a passage at 1554, and by nothing else; mutation M4 (a whitespace explanation) and M8/M9 (one explanation pasted over another) are what give those teeth. Measured over the live bank: of the 36 scenario reading explanations, 0 contain 'because', 0 contain 'Why:' and only 7 contain 'the passage' - they are written as substantive prose rather than to a formula, which is why the regex missed them and is arguably the better teaching. NO CHANGE MADE. Recorded so that a future reader who has the same idea does not conclude the explanations are absent, and so that nobody later ADDS a wording-shaped assertion believing it is a tightening.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T07:24:56.275Z",
    "resolved_at": null
  },
  {
    "id": 49,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/phrases.ts",
    "line": null,
    "description": "04-01: 'take on too much' (taken-on-too-much) shares a frame with listening.ts's C1 interview line, and 'turned up late' (turned-up-an-hour-late) with practical/housing's estate-agent example. Both incidental co-occurrences on other surfaces — neither teaches the unit — and both ids are committed, so correcting them would cost a retirement for no pedagogical gain. Accepted, not fixed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-02T06:16:03.386Z",
    "resolved_at": null
  },
  {
    "id": 50,
    "kind": "deviation",
    "phase": "04",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "04-01: WINDOWS 45 recurred for a tenth consecutive plan. state.advance-plan left current_phase at 03, wrote total_phases: 5 for a 6-phase project, and left the prose Progress line contradicting its own frontmatter (36 of 36 vs 37 of 45). Corrected by hand; the root cause in the tooling is still unfixed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-02T06:16:03.890Z",
    "resolved_at": null
  },
  {
    "id": 51,
    "kind": "deviation",
    "phase": "04",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "04-02: WINDOWS 45 recurred for an ELEVENTH consecutive plan and regressed rather than merely staling. state.advance-plan rewrote current_phase 04 -> 03 and total_phases 6 -> 5, and reported 'current_plan 11 / total_plans 11 / last_plan / ready_for_verification' -- it read PHASE 03's plan count while the project is on phase 04, plan 2 of 9. state.update-progress DELETED the informative Progress parenthetical outright ('37 of 45 plans (4 of 6 phases complete; Phase 4 has 9 plans written and 1 executed)' -> a bare '84%'), which is bug (a) escalated from stale to destructive. state.add-decision stamped [Phase ?] on all three new rows again. All corrected by hand; the 107 historical [Phase ?] rows were counted before and after to prove the blanket-replace trap of WINDOWS 45 was avoided. The last_activity_desc workaround (one physical line, written LAST) held again and parses as JSON. The Current Position body and Current focus were ALSO still describing Phase 03 plan 11 of 11 with 03-06 prose, pre-existing and never advanced by the tool -- rewritten by hand this run. Eleven plans is past the point where absorbing it again is reasonable.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T05:20:57.768Z",
    "resolved_at": null
  },
  {
    "id": 52,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/grammar.ts",
    "line": null,
    "description": "04-02: six PRE-EXISTING exact duplicates in the grammar corpus, found by the mandated corpus scan and deliberately NOT fixed (every one is a committed id, so each costs a retirement under the 04-01 gate). The cross-surface one is the notable case: work/emails#grammar#look-forward-to-gerund's prompt is byte-identical to global b8's ('I look forward to ___ from you.'), so a learner answers the same question twice under two ids and only one namespaces to her scenario -- D-01 at the grammar grain. The other five are wholly inside src/lib/content/grammar.ts (a8==a17, a5==a21, c4==c14, c6==c18 explain, d3==d11). Full detail in .planning/phases/04-native-level-depth/deferred-items.md. No assertion was added either: it would fail on arrival, and a gate that fails on arrival gets disabled rather than fixed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T05:20:58.283Z",
    "resolved_at": null
  },
  {
    "id": 53,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-lessons.ts",
    "line": 125,
    "description": "native/idioms briefing tip[0] quotes two phrases retired at 04-03 (piece-of-cake, under-the-weather) and quotes them as expression=gloss; 04-04 owns the briefing",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-04T05:54:44.298Z",
    "resolved_at": "2026-08-04T06:39:34.204Z"
  },
  {
    "id": 54,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-vocabulary.ts",
    "line": 1607,
    "description": "native/idioms 8 vocabulary cards recommended for retirement at 04-03 but MIN_VOCAB_CARDS=8 makes it illegal until replacements land; carried to 04-04, needs its own human approval",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-04T05:54:56.778Z",
    "resolved_at": "2026-08-04T06:39:34.684Z"
  },
  {
    "id": 55,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-lessons.ts",
    "line": 340,
    "description": "OPEN QUESTION for the phase gate, filed by 04-04 rather than decided by it: should FALLBACK_LESSON be DELETED outright and getScenarioLesson made to return ScenarioLesson|undefined, like every other bank accessor? 04-04 proved it unreachable by assertion (all 35 scenarios resolve to their own briefing, checked by reference AND by value) instead of deleting it, because deletion changes the accessor's return type and every call site - churn in files 04-04 does not own, to buy a property the assertion already buys. The record is therefore dead-and-gated rather than gone. 03-11 took the other route for phrases.ts. Whoever next touches scenario-lessons.ts should settle which is right.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T06:40:11.061Z",
    "resolved_at": null
  },
  {
    "id": 56,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-vocabulary.ts",
    "line": 1607,
    "description": "04-04's corpus scan left TWO pairs above its own declared J>=0.60 defect threshold, judged short-field artefacts and NOT fixed - recorded here so the judgement can be second-guessed rather than buried in a summary. (a) J=0.750 now-and-again.es 'de vez en cuando' vs global/vocab/daily.es 'en vez de': four-word denominator, three shared function words, opposite meanings ('from time to time' vs 'instead of'). (b) J=0.667 a-non-starter.term 'a non-starter' vs travel/restaurant#vocab#starter.term 'a starter': three-word denominator, morphological (non- prefix), zero shared teaching. Neither is the D-01 failure the threshold was written for. The same scan restricted to fields of >=6 words - where duplication actually matters - tops out at J=0.308 over 66,495 pairs, and there are ZERO exact duplicates. If a later plan disagrees, the fix is to change the card, never to move the threshold.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T06:40:11.559Z",
    "resolved_at": null
  },
  {
    "id": 57,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-lessons.ts",
    "line": 326,
    "description": "04-05: native/register's briefing tip quotes the opening shapes of its own phrase pair 1 (Can you...? / Would you be able to...?). 04-04's briefing/bank separation gate is scoped to native/idioms so it does not fire. Not fixed: widening the gate to all 35 briefings is a decision about the gate, and this plan does not own scenario-lessons.ts.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T07:28:15.512Z",
    "resolved_at": null
  },
  {
    "id": 58,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-lessons.ts",
    "line": null,
    "description": "native/culture's briefing tip says \"That's so 2010\" — a four-digit year in the one scenario whose banks are now gated against years; 04-06's gate is scoped to the two banks it owns",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T08:28:00.658Z",
    "resolved_at": null
  },
  {
    "id": 59,
    "kind": "deviation",
    "phase": "04",
    "file": "src/components/practice/PronunciationLab.tsx",
    "line": null,
    "description": "04-07: T-04-15 is PARTIALLY UNMET, 5 of 6, and it cannot be met by authoring. Its mitigation reads 'every addition puts the contrast on a word the recogniser must return', which holds for the five segmental contrasts only because a mis-articulated segment happens to produce a DIFFERENT WORD. It cannot hold for native/pronunciation#phrase#record-it-and-a-record: scoreAttempt() normalises to a word set and tests membership, so re-CORD and RE-cord are the same token and the noun/verb stress shift is invisible to the score. Vowel length, aspiration and contour are equally invisible - the five that work do so by luck of the metric, not by design. SHIPPED WITH THE LIMITATION DISCLOSED IN THE ITEM'S OWN TIP rather than dropped or hidden. This is the evidence input for deferred VOICE-01 (v2 backlog) and closes only when a real voice model lands.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T09:28:26.734Z",
    "resolved_at": null
  },
  {
    "id": 60,
    "kind": "deviation",
    "phase": "04",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "04-07: WINDOWS 45, FIFTEENTH consecutive occurrence, with one improvement and one NEW sub-finding that entry 45 does not record. IMPROVEMENT: state.record-metric wrote its row correctly this time - the Performance Metrics table is real and populated, contrary to 04-06's reading that it was a placeholder for all 42 plans. STILL BROKEN: update-progress again replaced the informative Progress parenthetical with a bare percentage, and again reset frontmatter total_phases from 6 to 5 against a ROADMAP defining 6. NEW AND ACTIONABLE: state.record-session ALSO resets total_phases, so it reverted a hand-correction I had already applied after update-progress. The correction must therefore be made AFTER THE LAST state.* VERB RUNS, not after the first one that damages the field - the same ordering rule entry 45 records for last_activity_desc now applies to total_phases as well. Any plan that hand-corrects between verbs will silently lose the fix.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T09:29:02.718Z",
    "resolved_at": null
  },
  {
    "id": 61,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-reading.ts",
    "line": null,
    "description": "04-08 DELIBERATE DEFERRAL, recorded by name so CONT-04 does not close silent about it. D-01 - the user's own wording - asks for 'large idiom and phrasal-verb banks, MORE READING, MORE REHEARSALS'. The banks were delivered by 04-01 through 04-07 and 'more rehearsals' was delivered in kind at 04-08 by option E (native/idioms reworked off contrastive repetition onto predict-then-check with a count and a ban; the other three keep theirs because contrast is their subject). 'MORE READING' WAS NOT DELIVERED. It was deliverable only through 04-08's options A (native/phrasal-verbs declares reading) and B (native/register declares reading), each about 631 authored words, and both were DECLINED BY THE USER at 04-08's blocking checkpoint on a measured ratio argument: 631 words per passage is 4x what 04-CONTEXT projected (157.8), and the two native passages that already exist are both above the corpus mean (323 and 291 body words vs 247). Option F (a second passage per scenario) was declined as UI work outside D-01's scope - it needs the record type, the accessor, the coverage wrapper, the practice branch and a picker that does not exist. Nothing later in Phase 4 touches reading, so this does not close inside this phase. NOT a defect and nothing is broken: the app claims no reading it does not have, because coverage is derived. This is a scope record, owed to whoever revisits CONT-04 or plans a Phase 4.1.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T20:25:41.000Z",
    "resolved_at": null
  },
  {
    "id": 62,
    "kind": "unrun-verify",
    "phase": "04",
    "file": ".planning/phases/04-native-level-depth/04-09-PLAN.md",
    "line": null,
    "description": "04-09 Task 2, the PHASE 4 BLOCKING BROWSER CHECKPOINT, WAS NOT PERFORMED. The automated half of the gate passed in full (verify-scenario-content 14,577; verify-id-stability 2,021 over 651 ids with 651 fixture entries agreeing EXACTLY under an independent enumeration that does not import the gate's own logic; merge 25,647; schema 309; queue 173; headers 24; celpip 43/648/50; tsc, lint and build all exit 0; deps 11 prod + 11 dev with zero packages installed; payload 205,174 B = 19.6% of the 1,048,576 B cap; 53/53 pairs written and 0 pending, asserted; a 19-mutation sweep in a scratch copy with its OWN node_modules returning 17 of 17 CAUGHT on their own labels with 2 controls surviving, every verdict carrying a landing proof and a parse check; the derivation control re-proved). What a script CANNOT establish and what this entry owes, ten items, none rounded up: (1) THE BATCHED RECALL DECK HAS NEVER BEEN RENDERED - it is the phase's one component change, it sits between the learner and every recall item in the app, and its rest point, per-batch counter, whole-sitting completion totals and 'Go again' return are exactly the kind of thing that is correct in a pure function and wrong on a page; (2) the same deck on /review with MORE THAN SIXTEEN due - RecallDeck has four callers, all inherit batching by design, and a mixed due set is the longest un-pausable run in the app, plus the mount-time-snapshot property (rating an item correct must NOT shrink the deck underneath you) and whether the rest point's copy reads sensibly for a set drawn from several scenarios; (3) a sub-ceiling deck (practical/appointments, 14 cards) confirmed to run start to finish with NO rest point, which is the check that the thirty untouched scenarios were left alone; (4) the eighteen-phrase warm-up at its new length, and whether it is exhausting; (5) native/idioms READ AS A LEARNER against Phase 3's verdict that it 'reads like any ELT textbook', which was the whole reason for this phase; (6) the nine register pairs rendering ADJACENT, casual then formal - a pair split across the deck teaches nothing; (7) the advertised minutes on the five native scenario pages; (8) TICKING A REHEARSAL MOVE - the line-through, 3 of 3, the Rehearsed pill, the single 15-XP award, and whether the latch survives a REMOUNT (research read it as component-local state that may well award twice); inherited from WINDOWS 38, open since Phase 3; (9) the empty-a-bank honesty demo on a SERVED page (proved in a scratch copy, not seen on screen); (10) ANY PHONE PASS, FOR ANYTHING - still true of this entire project. TWO ITEMS OUTRANK THE REST because they came from the real beta user rather than from an internal check: whether tapping a drop-down blank in a CELPIP reading exercise still ZOOMS THE PAGE on mobile (a fix is deployed at f164ec5 and has NEVER been confirmed on a device), and whether the CELPIP NAV LINK (d06c219) renders and routes on a phone as well as desktop - the entire exam section had no menu entry at all until the beta user asked where it was. Also carried forward unobserved: the CELPIP tabs are BELOW the 44px touch minimum (26px and 34px), and Listening audio and Speaking recording have NEVER run on a phone, so the MediaRecorder WebM->MP4 container probe written specifically for Safari has still never executed on the browser family it exists for. An ordered checklist with URLs and expected outcomes is at the foot of 04-09-SUMMARY.md, every item marked unobserved.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T21:21:20.000Z",
    "resolved_at": null
  },
  {
    "id": 63,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/scenario-writing.ts",
    "line": null,
    "description": "04-09, completing the record WINDOWS 61 began: OPTION D WAS ALSO DECLINED, and it is recorded here by name so that every option the user turned down at 04-08's checkpoint is written down rather than only the ones that mapped onto D-01's headline wording. OPTION D would have grown native/register from one writing task to two or three. WHAT IT WOULD DELIVER: more writing practice in the one native scenario whose subject - the formality dial - is most naturally exercised in writing, where register errors are permanent and visible. ITS MEASURED PRICE, and the reason declining it was right: research priced D as 'bank shape + accessor + ONE call site'. 04-08 measured the true cost as EIGHT FURTHER ASSERTION BLOCKS in verify-scenario-content.mts that read the writing accessor as a SINGLE prompt, so the container would have to be reshaped for ALL NINE writing pairs in the app for one scenario's benefit. That is a corpus-wide refactor bought for a single scenario, and it was declined once priced - the same discipline that declined A and B on their ratio. WHAT WOULD UNBLOCK IT: a plan that owns the writing container end to end and reshapes the accessor from 'a prompt' to 'prompts' for all nine pairs deliberately, with the eight harness blocks migrated in the same commit; at that point a second or third register task costs only its authored words. NOT a defect and nothing is broken: native/register ships one writing task, the coverage registry reports one writing task, and the app claims nothing it does not have. This is a scope record, owed to whoever revisits CONT-04 or plans a Phase 4.1, and it belongs beside WINDOWS 61 rather than inside it because A/B/F were declined on a CONTENT ratio and D was declined on an ENGINEERING price - two different arguments that a later reader should not conflate.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T21:21:20.000Z",
    "resolved_at": null
  },
  {
    "id": 64,
    "kind": "deviation",
    "phase": "04",
    "file": "src/lib/content/phrases.ts",
    "line": null,
    "description": "04-09 READER'S FINDING, from the near-duplication read-through this phase's named residual risk (T-04-21) is mitigated by. NO NEAR-DUPLICATE EXERCISE WAS FOUND and nothing was rewritten: with well over a hundred items authored across seven plans by agents that could not see each other's output, no item in any of the five Sounding Native scenarios reads as another's with the nouns changed. MECHANICAL BACKING, cross-scenario within the world, 2,808 phrase pairs and 4,992 term pairs: highest phrase J = 0.286 stripped / 0.333 raw, highest term J = 0.400 stripped / 0.375 raw, and NOTHING at or above 0.50 in either, in either view. Against 03-11's baselines for this world (0.14 phrases, 0.00 terms) both numbers ROSE - phrases by 0.146, terms by 0.400 - and the honest reading of that rise is mostly POOL SIZE rather than quality: the world went from 30 phrases and 40 cards to 84 and 112, so the same content quality searched over roughly nine times as many pairs will surface a higher maximum. A METHOD FINDING WORTH MORE THAN THE NUMBERS: the first run of this scan used a conventional stoplist containing up/on/off/out/over/into and scored social/small-talk#catch-up against native/phrasal-verbs#catch-on at J = 1.000, because both collapse to {catch}. A PARTICLE IS NOT A STOPWORD IN THIS WORLD - stripping it deletes exactly the unit native/phrasal-verbs exists to teach (verb + particle + SENSE). Any future scan of this world must retain particles as content words or it will manufacture duplicates that are not there. FOUR THINGS A READER SEES THAT THE SCAN DID NOT, all judged and none fixed: (a) 'I'm afraid' occurs on four surfaces - native/idioms#phrase#not-my-call, native/register#phrase#formal-wont-be-possible, work/negotiating's deal-breaker example, and native/register#vocab#softener whose term is literally 'a softener (unfortunately, I'm afraid)'. Only the card TEACHES it; the other three use it as a natural tail. Incidental co-occurrence, the same class as WINDOWS 49, and correcting it would cost a retirement for no pedagogical gain. (b) native/idioms#vocab#a-pinch-of-salt ('take something with a pinch of salt') and native/culture#vocab#face-value ('take something at face value') share an identical syntactic skeleton while teaching NEAR-OPPOSITES (discount it vs believe it literally). This is precisely the shared-frame failure 04-05's reader pass exists to catch and a word-set metric cannot see (J = 0.333). Judged worth keeping: the frame is the ordinary English one for both, and both ids are committed, so a rewrite is a changed hash - the one-way door this phase exists to keep shut - bought for a shared preposition. (c) native/idioms#vocab#keep-someone-in-the-loop and native/culture#vocab#fill-someone-in are the closest same-world pair in the phase (J = 0.400 stripped). They are genuinely distinguishable - ongoing inclusion vs a one-off catch-up, and culture's is specifically about being filled in on a REFERENCE you missed - but a reader may reasonably disagree, so the number is recorded rather than buried. (d) native/register's BRIEFING names three of its own deck's cards in a single tip: 'Contractions and slang signal informal; full forms signal formal' quotes slang, a contraction and a full form. 04-04's briefing/bank separation gate is scoped to native/idioms and does not fire here. This is the CARD half of the same defect WINDOWS 57 records for the PHRASE half in this very scenario, so register's briefing now overlaps its own banks in two independent ways and the case for widening that gate to all 35 briefings is stronger than when 57 was filed. ONE SCAN FLAG WAS A FALSE POSITIVE AND THE READER OVERRULED IT: a within-scenario check reported native/phrasal-verbs teaching 'catch on' on two surfaces. It is 04-01's DELIBERATE polysemy split - the card teaches 'become popular' and the phrase teaches 'understand', and the phrase's tip names the card's sense by contrast ('aqui catch on es entender, no ponerse de moda'). The design working, not a repeat. DESIGN ECHO, named because it is the phase's most concentrated one: THREE OF THE FIVE DECKS ARE METALANGUAGE decks (register markers, reference machinery, phonetics) and two are EXPRESSION decks (idioms, phrasal verbs). A learner moving register -> culture -> pronunciation meets the same card shape - a name for a thing - three times. Defensible and in two of the three cases forced: where the app cannot SCORE the skill, the only deliverable is the vocabulary to understand being told (04-07 argues this explicitly for pronunciation). The three share no term and no territory. Recorded for whoever writes the sixth native scenario: do not make it four of six.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T21:21:20.000Z",
    "resolved_at": null
  },
  {
    "id": 65,
    "kind": "deviation",
    "phase": "04",
    "file": ".planning/phases/04-native-level-depth/04-07-SUMMARY.md",
    "line": null,
    "description": "04-09 SETTLES THE CORPUS-SIZE DISCREPANCY 04-08 RAISED, and closes the silent trap that caused it. 04-07's summary reports the authored corpus at 4,523 fields rising to 4,565; 04-08 measured 4,410 on the same tree with the same harvester and called it a reporting error. MEASURED AT THE GATE, both harvesters run against exported trees at four separate commits: 33f082b (04-07's OWN final commit, the tree that summary describes) = 4,410 fields; 47454ef = 4,410; b4c0e6b = 4,440; HEAD = 4,440. So 04-08 IS RIGHT and 04-07's figure does not reproduce at 04-07's own tree - there are no 155 missing fields and no later plan should go looking for them. The 4,410 -> 4,440 step is EXACTLY the 30 fields option C added (5 grammar questions x (prompt + explain + 4 options)), which also explains why 04-08 measured 4,410: it scanned before its own content landed. Arithmetically exact against independently counted banks at HEAD: phrase fields 2 x 264 + 192 tipped = 720, vocab 3 x 352 = 1,056, grammar 2 x 35 + 140 options = 210. THE CAUSE OF THIS CLASS OF ERROR IS NOW REMOVED. 04-05's broken corpus.mts sat in the scratchpad beside 04-06's corrected corpus2.mts, and scan.mts and probe.mts STILL IMPORTED THE BROKEN ONE. Measured side by side at the gate: corpus2.mts sees 4,440 fields, corpus.mts sees 3,948 - it silently drops 492, being every reading passage BODY (body is string[] and its push guard required typeof text === 'string'), every GLOSSARY entry (it read .term/.es against a {word, meaning} shape) and every reading QUESTION prompt (it read q.prompt against q.q). A near-duplicate scan run through it therefore reports 'clean' over a corpus missing exactly the surfaces a scenario's banks are most likely to collide with, including native/culture's own letter home. 04-08 named the hazard and left the file in place. The gate makes it IMPOSSIBLE TO PICK UP BY MISTAKE instead: corpus.mts now THROWS on evaluation with a message naming corpus2.mts, verified by running scan.mts and watching it exit 1 with that message, and the original is archived as a .txt so it cannot be imported either. This is scratch tooling, so nothing in the repo changed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T21:21:20.000Z",
    "resolved_at": null
  },
  {
    "id": 66,
    "kind": "deviation",
    "phase": "04",
    "file": ".planning/STATE.md",
    "line": null,
    "description": "04-09: THE state.* TOOLING DEFECT, CONSOLIDATED IN ONE PLACE WITH ITS ROOT CAUSE, on its SEVENTEENTH consecutive occurrence. This supersedes the scattered records in WINDOWS 45, 50, 51 and 60 and in nine plan summaries; read this entry and stop re-deriving it. SEVENTEEN consecutive plans (03-03 through 03-11, then 04-01 through 04-09) have hand-corrected the same commands. ROOT CAUSE, found by 03-05 and confirmed repeatedly: last_activity_desc is derived by a LINE-ORIENTED READ of the hard-wrapped 'Last activity:' paragraph in the body, so it takes the FIRST PHYSICAL LINE ONLY and truncates mid-sentence. It is not a length cap and not a serialisation bug. THE WORKAROUND, proved by 03-07 and reused ever since: write the 'Last activity:' sentence on ONE PHYSICAL LINE, and write the frontmatter field LAST. THE FIVE RECURRING BUGS: (a) update-progress moves the progress BAR and destroys or stales the informative PARENTHETICAL on the same line - escalated from stale to destructive at 04-02, where it replaced the whole parenthetical with a bare percentage; (b) '**Current focus:**' is never advanced; (c) state.add-decision stamps '[Phase ?]' on every row it writes, and 113 pre-existing rows already carry it - WARNING, a blanket [Phase ?] -> [Phase NN] replace would stamp those historical rows, belonging to phases 01/02/02.1/03, with the WRONG phase, which is worse than the state the tool leaves and is invisible in command output; only a line-by-line diff shows it, so correct ONLY your own rows and count the historical ones before and after; (d) advance-plan and record-session both RESET frontmatter total_phases from 6 to 5 against a ROADMAP defining six, and advance-plan has also rewritten current_phase backwards (04 -> 03 at 04-02) and read the WRONG PHASE's plan count; (e) record-session writes stopped_at as an UNQUOTED YAML scalar where every other value in the file is quoted. THE ORDERING RULE THAT MAKES CORRECTION POSSIBLE, and the single most important line here: EVERY HAND-CORRECTION MUST BE MADE AFTER THE LAST state.* VERB HAS RUN, never between verbs - 04-07 proved record-session reverts a total_phases fix already applied after update-progress, so a plan that corrects too early silently loses the fix. NEW AT 04-09, and the reason this entry exists rather than a nineteenth summary paragraph: roadmap.update-plan-progress reported complete:false and WROTE NOTHING AT ALL at 04-08, leaving both the '**Plans**:' line and the phase table row stale. SEVENTEEN plans is long past the point where absorbing this again is reasonable; it should be fixed in the tool, and this entry is where a fix should start.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-04T21:21:20.000Z",
    "resolved_at": null
  },
  {
    "id": 67,
    "kind": "unrun-verify",
    "phase": "04.1",
    "file": ".planning/phases/04.1-vocabulary-volume-deck/04.1-01-PLAN.md",
    "line": null,
    "description": "04.1-01 task 3 is a blocking human-verify checkpoint that has never been performed; 04.1-02 did not perform it either and VOCAB-01/02/03 stay unmarked",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T00:42:21.895Z",
    "resolved_at": null
  },
  {
    "id": 68,
    "kind": "deviation",
    "phase": "04.1",
    "file": "src/lib/content/core-vocabulary.ts",
    "line": null,
    "description": "04.1-04: `color` is glossed \"color / tono\" purely to satisfy the es!==word gate — Spanish for color IS color. Cognates below rank 500 (total, natural, general, personal, similar) will keep hitting this in plans 05-06; decide whether a `cognate` skip reason is declared BEFORE a plan needs it.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T01:25:42.811Z",
    "resolved_at": null
  },
  {
    "id": 69,
    "kind": "deviation",
    "phase": "04.1",
    "file": "src/lib/content/core-vocabulary.ts",
    "line": null,
    "description": "04.1-05: the plan's removed-line check fails by design on the vocab:color retirement — the same plan's cognate_decision instructs the deletion the check exists to catch; it should assert a matching hand-declared entry in the fixture's retired list instead",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T02:06:15.952Z",
    "resolved_at": null
  },
  {
    "id": 70,
    "kind": "unrun-verify",
    "phase": "04.1",
    "file": "src/app/core-vocabulary",
    "line": null,
    "description": "04.1-05: /core-vocabulary has never been opened in a browser (380 cards, 04.1-01 task 3 still outstanding), and it can now hold an orphaned srs key under vocab:color that no bank emits — nothing confirms the surface ignores it rather than counting it",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T02:06:17.085Z",
    "resolved_at": null
  },
  {
    "id": 71,
    "kind": "deviation",
    "phase": "04.1",
    "file": "src/lib/content/core-vocabulary.ts",
    "line": null,
    "description": "04.1-07 READER PASS, the finding no gate can see: the deck-wide subject-shape figure HIDES a per-BAND lean, and the band is the unit a learner actually sits through. Pronoun/possessive openers per band of fifty: 14, 10, 6, ONE, ONE, 11, 8, 17, 15, 8. Deck-wide 17.8% is the number every plan in this phase reported; bands 4 and 5 (cards 151-250) run at 2%, i.e. 98 of 100 consecutive sentences with a non-pronoun subject. Those two bands are almost exactly 04.1-04's batch, whose own summary spent 2 pronoun openers of 120 and NAMED the risk it was creating; 04.1-05 and 04.1-06 corrected the deck-wide average by steering their OWN batches, which cannot reach back. NOT FIXED AND MUST NOT BE: every one of those ids is committed, so rewriting them is a re-point on about 49 permanent keys. Any future batch should be judged per-band, not deck-wide.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:18.014Z",
    "resolved_at": null
  },
  {
    "id": 72,
    "kind": "deviation",
    "phase": "04.1",
    "file": "src/lib/content/core-vocabulary.ts",
    "line": null,
    "description": "04.1-07 READER PASS: the TAKEN-FRONT strategy pushes a gloss off its headword's central sense, and nothing asserts the front is answerable by the card's own word. 04.1-06 re-glossed fifteen cards to avoid a front another card already held; the cost is a class of cards whose most natural English answer is a DIFFERENT word. Named, with what would change them: standard -> habitual (a learner answers *usual*; and the example 'I chose standard delivery and waited nine days' teaches the default-option sense, which is not habitual -- the sharpest of the five, because gloss and example teach different senses); complete -> rellenar (answers *fill in*); evidence -> indicios (answers *clues*); response -> reaccion (answers *reaction*); relate -> vincular (answers *link*). MITIGATION ALREADY IN PLACE, measured rather than assumed: none of fill, link, react, clue, usual or normal is a card, so no front has two right answers INSIDE the deck. Each fix is a retirement plus a new slug -- the user's decision, not a tidy-up at a gate. The bank is untouched.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:19.157Z",
    "resolved_at": null
  },
  {
    "id": 73,
    "kind": "deviation",
    "phase": "04.1",
    "file": "src/lib/content/core-vocabulary.ts",
    "line": null,
    "description": "04.1-07 READER PASS: three examples lean on a word a B1 learner is unlikely to know, which is the one thing the six-word floor cannot see. affect -- 'Damp affects the plaster on that north wall' needs BOTH damp (as a noun) and plaster; demand -- 'Demand for allotments doubled after the lockdown' turns on allotments, a low-frequency British word carrying the sense; fund -- 'He ran through the funds in under a year' hides the meaning in the phrasal verb 'ran through'. Soft, and named rather than fixed: each is a retire-and-re-add on a live id. Also a CLASS worth naming rather than any single card: a two-sense gloss with a one-sense example -- time 'tiempo / vez', back 'espalda / de vuelta', way 'manera / camino' all show only the first sense. That is legal under every assertion and is still half a card.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:20.130Z",
    "resolved_at": null
  },
  {
    "id": 74,
    "kind": "unrun-verify",
    "phase": "04.1",
    "file": "src/app/core-vocabulary/page.tsx",
    "line": null,
    "description": "04.1-07: THE BLOCKING BROWSER CHECKPOINT (plan 04.1-07 task 4) WAS NOT PERFORMED. Supersedes and widens WINDOWS 67 and 70. Nobody has opened /core-vocabulary in a browser since the deck held TWENTY cards; it now holds 500 in ten bands of fifty. Unobserved, by name: (1) the sidebar entry reached without typing a URL; (2) the surface reporting 500 words and ten bands; (3) the tier statement on screen; (4) the tier chip on every card; (5) recallBatches splitting a fifty-card band with a rest point -- still never rendered on ANY surface, the same component open as WINDOWS 62 since Phase 4; (6) Dashboard and review 'Reviews due', 'Due today' and 'Your mistakes' UNCHANGED across a study session, which is the whole of L5 and is proved today only from source and from a synthetic state; (7) the Postgres sync round trip -- rate Got it, reload, confirm it is no longer due; (8) the deck's own study-what-is-due queue returning exactly the missed cards and no scenario card; (9) Weak spots showing Core vocabulary as a LINK rather than as not-written; (10) an orphaned vocab:color srs key ignored rather than counted -- now asserted, never seen; (11) anything at all on a PHONE, the device the beta user practises on; (12) the beta user's own verdict on whether 500 NGSL cards are what she meant by 'too little content'. The ordered checklist with URLs is task 4 of 04.1-07-PLAN.md.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:21.150Z",
    "resolved_at": null
  },
  {
    "id": 75,
    "kind": "deviation",
    "phase": "04.1",
    "file": "scripts/verify-scenario-content.mts",
    "line": null,
    "description": "04.1-07: SUBJECT SHAPE IS DELIBERATELY NOT GATED, decided rather than left implied. It is the dimension that went wrong twice in four batches (04.1-04's bare-plural lean, 04.1-06's 40.8% first draft) and no assertion can see it: the shape that matters -- bare plural / mass / inanimate subject -- needs animacy and part-of-speech, and 'Wash the lettuce' and 'Termites destroyed' open identically to any string test. A ceiling on a proxy that does not track the risk would be weakened the first time it failed a legitimate batch, which is exactly how a gate stops being a gate. Two coarse figures are now PRINTED by the harness under an instruction (pronoun/possessive share, content-word-opener share) so the two named readers have a number instead of a scratch script each writes again. WHO CHECKS IT: (1) the executor of any plan authoring into this bank, at DRAFT time, before --update, while a rewrite is still free; (2) the phase gate's reader pass. If a third batch is ever authored and neither reader is named in its plan, this dimension is unguarded.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:22.142Z",
    "resolved_at": null
  },
  {
    "id": 76,
    "kind": "deviation",
    "phase": "04.1",
    "file": "src/lib/content/core-vocabulary.ts",
    "line": null,
    "description": "04.1-07: an EMPTIED bank still produces EXACTLY ONE failure at 500 cards, re-measured rather than inherited. 04.1-02's M37 found this at twenty and the property has not changed: every other volume assertion -- INCLUDING the nine 04.1-07 added -- passes vacuously over zero cards, because the loops do not run, the ceilings are satisfied and the containment is perfect. 'volume: the enumerator emits one id per card (the containment is not an empty deck)' is still the ONLY thing standing between a vacuous green and a real one. Stated as 04.1-02 instructed any later plan to state it: the new assertions DO survive an empty deck, and that is written down rather than left to be discovered.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:23.179Z",
    "resolved_at": null
  },
  {
    "id": 77,
    "kind": "deviation",
    "phase": "04.1",
    "file": ".planning/WINDOWS.md",
    "line": null,
    "description": "04.1-07: gsd-tools windows append REFUSES a CRLF ledger. On Windows with core.autocrlf, any `git checkout -- .planning/WINDOWS.md` restores the file with CRLF endings and every subsequent append dies with 'Ledger frontmatter line is not key: value' pointing at last_updated with a trailing \\r. The workaround is to rewrite the file to LF before appending. Filed beside WINDOWS 66's state.* tooling entry because it is the same class: a tool that cannot round-trip its own artifact on the platform the project is developed on.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-05T03:06:24.106Z",
    "resolved_at": null
  }
]
````
