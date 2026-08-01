---
schema_version: 1
open_count: 33
waived_count: 0
fixed_count: 8
total_count: 41
last_updated: 2026-08-01T06:45:16.756Z
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
| 29 | 03 | unrun-verify | src/components/practice/RecallDeck.tsx |  | 03-01: the recall loop and the review flow have not been driven by a human in a browser. What WAS observed (production build, next start, served HTML): social/small-talk renders the 'Lock it in' step with its first authored card; social/dating renders the honest 'not ready yet' warm-up panel and NO generic per-world lines; both scenarios render one section per declared skill with 'Not yet available'; step numbers derive correctly (1 2 3 4 with the recall step omitted); the JSON-LD carries no 'teaches' key. What was NOT observed: (1) the interactive recall loop - Show it, Got it / Not yet, the XP float, the 'Locked in' screen; (2) /review rendering a due scenario item, because /review is auth-gated (307 to /login) and needs a signed-in session plus a populated store - this is the far end of D-05 and is proved deterministically by verify-scenario-content.mts (resolveReviewItem over every composed id, plus the schema/merge storage leg) but has never been seen; (3) the honest panel's link targets actually navigating. Owed to plan 03-11. | open |  | 2026-08-01T00:27:49.960Z |  |
| 30 | 03 | unrun-verify | src/components/practice/ReviewHub.tsx |  | 03-02: the three widened review surfaces have not been seen by a human. Dashboard's due count, ReviewHub's 'Due today' badge, the weak-spots drill (both the mixed grammar+recall case and the 'nothing to drill yet' branch) and MistakesView's new compact recall card are gated ONLY by three grep guards, tsc/lint/build, and an inline node proof that the weak-spots selection returns 3 grammar + 14 recall items for a mixed weak set against the real banks. There is no committed assertion over any of these components, because they are React and this repo has no test runner (TEST-01, v2). All four need a signed-in session with a populated srs/attempts store to reach. NOTE: the user drove 03-01's far end in a browser on 2026-08-01 and reported /review resolving and rendering a real scenario item, which closes items (1) and (2) of ledger entry 29 - 03-11 inherits a smaller debt than 29 states. Owed to plan 03-11. | open |  | 2026-08-01T01:12:52.055Z |  |
| 31 | 03 | unrun-verify | src/lib/content/phrases.ts |  | 03-03: the twelve new Work and Practical scenario pages have not been opened by a human. The RENDER PATH is observed (03-01 saw a curated scenario render its 'Lock it in' step from the same accessors, and the user drove /review in a browser on 2026-08-01) and the CONTENT is gated by 4529 committed assertions plus a 17-mutation sweep, so this is a low-risk gap rather than an unproven one. What no one has looked at: the six phrases and eight cards on each of work/emails, work/presentations, work/negotiating, work/networking, work/feedback, work/interviews, work/meetings, practical/phone-calls, practical/tech-support, practical/housing, practical/banking and practical/appointments as they actually read on screen - line breaks, the length of the longer C1 negotiating lines in the card, and whether the Spanish glosses sit well next to the English. Editorial, not structural. Owed to plan 03-11's browser pass, which is already visiting these surfaces for entries 29 and 30. | open |  | 2026-08-01T01:53:21.055Z |  |
| 32 | 03 | unrun-verify | src/lib/content/phrases.ts |  | 03-04: the ten new Reading & Ideas and Sounding Native scenario pages have not been opened by a human. The RENDER PATH is observed (03-01 saw a curated scenario render its 'Lock it in' step through these same accessors, and the user drove /review in a browser on 2026-08-01) and the CONTENT is gated by 6019 committed assertions plus an 18-mutation sweep with 11 caught, 5 controls survived and 2 applier refusals, so this is an editorial gap rather than an unproven one. What nobody has looked at: the six phrases and eight cards on each of academic/news, academic/articles, academic/stories, academic/summaries, academic/debate, native/idioms, native/phrasal-verbs, native/pronunciation, native/register and native/culture as they actually read on screen. Two things are specific to this batch and worth a deliberate glance: native/register's phrases are three CONTRASTING PAIRS and the pairing is only legible if the casual and formal lines sit adjacent in the rendered order, and the C1 articles and debate lines are the longest in the corpus. Owed to plan 03-11's browser pass, which is already visiting these surfaces for entries 29, 30 and 31. | open |  | 2026-08-01T02:24:03.538Z |  |
| 33 | 03 | unrun-verify | src/lib/content/scenario-grammar.ts |  | 03-05: no human has ANSWERED a scenario grammar question in a browser. The four quizzes were observed in the SERVED HTML of a production build (social/small-talk renders step 5 'Practise grammar' with the topic pill 'Question tags', the counter '1 / 5', the prompt 'It's freezing out there today,' and its four options, with the gap showing ____ rather than the answer), and the harness proves the wiring deterministically: every composed id resolves through resolveReviewItem as kind 'grammar', reviewableIds() lists all 20, and GrammarQuiz's untouched recordAttempt(q.id, isRight, {topic, level, chosen}) is what populates weakTopics. But the INTERACTIVE half is unseen: picking an option, the XpFloat, the explanation panel and the 'Ask the tutor why' link, the results screen, and the far end - a wrong answer on social/small-talk#grammar#weather-question-tag appearing under 'Question tags' in /review's weak spots and being drillable there. That last one is ROADMAP criterion 3 for Phase 3 and it is inherited rather than built, so it is proved by construction and not by observation. Needs a signed-in session. Owed to plan 03-11's browser pass, alongside entries 29, 30, 31 and 32. | open |  | 2026-08-01T04:19:04.700Z |  |
| 34 | 03 | stub | src/components/WorldView.tsx |  | 03-05: the world page's scenario cards still render SkillPill without an availability flag, so they count DECLARATIONS. Plan 03-05 gave SkillPill an optional 'available' prop and wired it in ScenarioView and on /skill/[skill]; WorldView.tsx was NOT in that plan's files_modified and was deliberately left alone rather than expanding scope quietly. The consequence today: /world/social shows a solid 'Speaking' pill on a scenario whose speaking practice is not written, while the scenario page one click deeper shows the same pill muted. The fix is three lines (import getScenarioCoverage, pass available per skill) and the prop already exists and defaults to true. Self-closing as plans 03-06 through 03-10 land, in the sense that the overclaim disappears when every pair is written - but it is an overclaim until then, which is precisely what D-03 forbids. | open |  | 2026-08-01T04:19:19.508Z |  |
| 35 | 03 | unrun-verify | src/components/practice/WritingDesk.tsx |  | 03-06: the writing desk's INTERACTIVE half is unseen by a human, and so is the multi-prompt picker path. Observed in the served HTML of a production build: all nine scenario writing pairs render their own task with NO picker row (the markup goes straight from <div> to <div class="grid gap-5 lg:grid-cols-2 ">, with no mt-4), the level badge, the word range and the 0-words counter render, and the model answer is absent from the served HTML. NOT observed: typing into the editor, the counter turning 'in range', Save draft writing to localStorage under the composed id, ticking a checklist line, and Show model answer revealing the model. Also NOT observed: the >1-prompt branch that still renders the picker - the global writing room at /skill/writing mounts WritingDesk behind a client-side tab whose default is 'Learn', so 13 prompts never reach the initial HTML and curl cannot click the tab. The branch is one boolean (prompts.length > 1) and is unchanged for that path, but it is proved by reading rather than by seeing. Owed to plan 03-11's browser pass alongside entries 29-33. | open |  | 2026-08-01T04:55:16.464Z |  |
| 36 | 03 | stub | src/lib/scenario-coverage.ts |  | 03-06: ScenarioSkillCoverage.summary is derived, asserted and rendered NOWHERE. Grep for '.summary' across src/components and src/app returns only the two CELPIP call sites (CelpipLanding.tsx:266 and celpip/page.tsx:90); no scenario surface renders the scenario coverage summary at all. So the strings the harness pins - '5 questions' for grammar since 03-05, '1 task' for writing since 03-06 - are a contract nobody reads yet. This is not a defect in either plan (both were told to produce a count and a unit, and both do) and the assertions have teeth (mutation M18 catches a reworded unit), but a field that is asserted and unrendered can drift into being wrong for a UI that later starts rendering it. Either a surface should show it or its absence should be a deliberate, recorded decision. | open |  | 2026-08-01T04:55:30.754Z |  |
| 37 | 03 | unrun-verify | src/components/practice/ReadingRoom.tsx |  | 03-07: nobody has CHECKED ANSWERS on a scenario reading passage, so the two things this plan built have never been seen doing their job. Observed in the served HTML of a production build: all five scenario reading pairs (travel/restaurant, practical/housing, academic/news, academic/stories, academic/summaries) render the STANDALONE passage reader as their own step - level badge, minutes, Read aloud, title, body, glossary, questions and the Check answers button - with NO back link and NO level-filter pills, and academic/summaries renders its reading passage and its DIFFERENT writing passage on one page. NOT observed: the EXPLAINED KEY. Every explanation is behind {submitted && q.explain}, so it is absent from the served HTML entirely (grep returns 0, as does the answer index) and only appears after a click curl cannot make. So 'every scenario comprehension question tells the learner why the answer is the answer' is proved by construction - the type requires it, the harness asserts it non-empty on all 20 questions, and mutation M3 catches a whitespace explanation - but not by sight. Also unobserved: that the GLOBAL reading room's own single-passage reader still shows its back link after a text is chosen from the list. The ReadingRoom browser function is byte-identical in the diff and every change is behind onBack being present, so this is proved by reading rather than by seeing. Owed to plan 03-11's browser pass alongside entries 29-35. | open |  | 2026-08-01T05:29:13.276Z |  |
| 38 | 03 | unrun-verify | src/components/practice/SpeakingTaskPanel.tsx |  | 03-09: nobody has TICKED A MOVE, so the one thing this panel does that the writing desk does not — award XP — has never been seen doing it. Observed in the served HTML of a production build (next start, shut down afterwards, port 3000 drained to zero sockets and refusing): all fourteen written speaking pairs render the rehearsal panel as their own step, carrying the level badge, the 'say it out loud' label, the title, the setup, the three numbered moves, the 'You did it if' block with the success line, the '0 of 3 moves rehearsed' counter and the footer stating that nothing is listening; social/complaining and academic/debate each render their rehearsal AND their different writing task on one page; travel/airport still renders the honest 'Not yet available' panel for its unwritten speaking pair; and /skill/speaking reads '14 of the 30 scenarios that train your speaking have practice written for the situation itself — the rest are on the way, and say so' with the pending badge on the sixteen. NOT observed: ticking a checkbox, the line-through on a ticked move, the counter moving to 3 of 3, the 'Rehearsed' pill appearing, and the single award of 15 speaking XP with the day's activity recorded — including the T-03-22 property that unticking and re-ticking does not award again. That property is proved by construction (the awarded flag latches and is never cleared) and by mutation (M24, M25 and M26 all fire on the source scan), but not by sight. Owed to plan 03-11's browser pass alongside entries 29-37. | open |  | 2026-08-01T06:05:27.780Z |  |
| 39 | 03 | unmet-truth | scripts/verify-scenario-content.mts |  | 03-08: the D-01 assertion 'no passage text is repeated anywhere in the scenario reading corpus' fingerprints p.body.join(' '), so it only fires when the WHOLE body matches. A scenario passage that borrows ONE paragraph from another scenario's passage is D-01's failure at a finer grain and is NOT caught - proved by mutation M23, which copies native/idioms' first paragraph over native/culture's and SURVIVES a full harness run (declared as an expected survivor rather than deleted). The corpus is clean today: an out-of-band scan over all 31 authored paragraphs finds 0 exact cross-scenario reuse and 0 pairs above Jaccard 0.5 across 426 cross-scenario paragraph pairs, and 0 shared four-word runs against any other authored text. The gap is in the assertion's reach, not in the content. NOT closed by this plan because plan 03-09 had uncommitted work in that same harness file in the same working tree at the time, and staging it would have swept up theirs. Fix is one appended assertion: fingerprint paragraphs, not just joined bodies. | open |  | 2026-08-01T06:10:57.860Z |  |
| 40 | 03 | deviation | .planning/phases/03-every-scenario-practicable/03-08-SUMMARY.md |  | 03-08: a MUTATION SWEEP IN A SHARED WORKING TREE POISONED A PARALLEL PLAN'S PRODUCTION BUILD, silently and with no trace in git. Plan 03-09 ran npm run build at 02:00:04 while this plan's sweep had mutation M21 applied to src/lib/content/scenario-reading.ts (const authored = BANK['social/humor'] instead of BANK[key]). The sweep restored the file byte-for-byte (sha256 verified) so git was clean, but .next kept the mutation: every scenario page served 'The Man Who Mows at Seven', and the minifier had dropped eight of the nine passages from the emitted JS as unreachable. Caught only because this plan curled four pages and saw one title four times; confirmed by reading the mutated accessor back out of the build's own SOURCE MAP (the map records what the bundler read). REPAIRED by rebuilding from the clean committed tree - all nine slugs now present in the emitted JS in equal numbers and the map carries BANK[key] with zero mutated occurrences. 03-09's own browser observation (WINDOWS 38) is unaffected: it is about scenario-speaking.ts, which no mutation touched. THE STANDING HAZARD: any wave that pairs a mutation sweep with a sibling plan in one working tree can do this again in either direction, and neither plan would see it in git status. Mitigations to choose between: run sweeps in a git worktree or a copy, or assert the built accessor after any build a summary makes a claim about. | open |  | 2026-08-01T06:11:18.477Z |  |
| 41 | 03 | deviation | scripts/verify-scenario-content.mts |  | 03-10: A DECLARED GRANULARITY GAP in the speaking D-01 assertions, in the spirit of WINDOWS 39. 'scenario speaking: <key> is written for itself' fingerprints the whole task body (title+setup+moves+success) and 'has its own three moves' fingerprints the whole three-move list, both by byte-identity after canonicalisation. So TWO SCENARIOS SHARING A SINGLE MOVE ARE CAUGHT BY NEITHER, and neither is a near-duplicate that differs by one word. Mutation M17 (one scenario given another's entire move list) fires; a one-move borrow would not. Not a shipped defect: scan 1 shows 90 moves / 90 distinct and scan 2 shows 0 of 3,915 cross-scenario move pairs above Jaccard 0.5, so the corpus is clean out of band. Related, and also declared: 'every scenario speaking id is unique across all scenarios' cannot be falsified from the DATA at all, because every id is composed from a scenario key that is unique by construction - it only fails if the accessor stops using the scenario key, which mutation M12-key catches on a different label. Both assertions imply more grip over authored content than they have. The fix for the first is a per-move cross-scenario check in the speaking group; left for the plan that owns the harness. | open |  | 2026-08-01T06:45:16.756Z |  |

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
    "description": "03-01: the recall loop and the review flow have not been driven by a human in a browser. What WAS observed (production build, next start, served HTML): social/small-talk renders the 'Lock it in' step with its first authored card; social/dating renders the honest 'not ready yet' warm-up panel and NO generic per-world lines; both scenarios render one section per declared skill with 'Not yet available'; step numbers derive correctly (1 2 3 4 with the recall step omitted); the JSON-LD carries no 'teaches' key. What was NOT observed: (1) the interactive recall loop - Show it, Got it / Not yet, the XP float, the 'Locked in' screen; (2) /review rendering a due scenario item, because /review is auth-gated (307 to /login) and needs a signed-in session plus a populated store - this is the far end of D-05 and is proved deterministically by verify-scenario-content.mts (resolveReviewItem over every composed id, plus the schema/merge storage leg) but has never been seen; (3) the honest panel's link targets actually navigating. Owed to plan 03-11.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T00:27:49.960Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T04:19:04.700Z",
    "resolved_at": null
  },
  {
    "id": 34,
    "kind": "stub",
    "phase": "03",
    "file": "src/components/WorldView.tsx",
    "line": null,
    "description": "03-05: the world page's scenario cards still render SkillPill without an availability flag, so they count DECLARATIONS. Plan 03-05 gave SkillPill an optional 'available' prop and wired it in ScenarioView and on /skill/[skill]; WorldView.tsx was NOT in that plan's files_modified and was deliberately left alone rather than expanding scope quietly. The consequence today: /world/social shows a solid 'Speaking' pill on a scenario whose speaking practice is not written, while the scenario page one click deeper shows the same pill muted. The fix is three lines (import getScenarioCoverage, pass available per skill) and the prop already exists and defaults to true. Self-closing as plans 03-06 through 03-10 land, in the sense that the overclaim disappears when every pair is written - but it is an overclaim until then, which is precisely what D-03 forbids.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T04:19:19.508Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T05:29:13.276Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T06:10:57.860Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T06:45:16.756Z",
    "resolved_at": null
  }
]
````
