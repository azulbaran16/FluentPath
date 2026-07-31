---
schema_version: 1
open_count: 22
waived_count: 0
fixed_count: 0
total_count: 22
last_updated: 2026-07-31T11:00:17.547Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 02 | unrun-verify | src/lib/celpip-progress.ts |  | 02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07. | open |  | 2026-07-28T23:55:44.383Z |  |
| 2 | 02 | deviation | src/app/api/celpip-progress/route.ts |  | The plan's route gates are bare presence counts: overwrite-instead-of-merge, cap removal and rate-limit removal all produced ZERO failures. Sharpened call-site gates are recorded in 02-06-SUMMARY.md but live only in that document. | open |  | 2026-07-28T23:55:44.925Z |  |
| 3 | 02.1 | unrun-verify | src/components/celpip/SpeakingRecorder.tsx |  | 02.1-01 checkpoint: the Speaking phone pass was not done (no device available). The MediaRecorder isTypeSupported container probe (WebM -> MP4) exists precisely for Safari before 18.4, which supports MP4 only, so the one browser family it was written for has never run it. Owed to 02.1-12. | open |  | 2026-07-31T03:10:00.000Z |  |
| 4 | 02.1 | unrun-verify | src/components/celpip/SpeakingRecorder.tsx |  | 02.1-01 checkpoint: microphone release-on-stop is code-verified, not observed. The run used a synthetic AudioContext MediaStreamDestination, whose track lifecycle is not the OS recording indicator. Needs one real-device glance in 02.1-12. | open |  | 2026-07-31T03:10:00.000Z |  |
| 5 | 02.1 | unrun-verify | src/components/celpip/CelpipLanding.tsx |  | 02.1-02: the skill-aware /celpip landing has never been opened in a real browser. The server-rendered HTML was read from a production `next start` (coverage line, disabled tabs, JSON-LD) and the client logic was executed in node against a generated copy of the component, but hydration, the skill-tab switch and the Writing group control were never exercised in a browser. The plan explicitly warns that breaking the `ready` discipline produces a hydration mismatch on a page the beta user opens daily. Owed to 02.1-12. | open |  | 2026-07-31T07:07:20.000Z |  |
| 6 | 02.1 | deviation | src/components/celpip/CelpipLanding.tsx |  | 02.1-02: HISTORY_SOURCES is gated only by an ad-hoc harness that was not committed (it transpiles the component and stubs its render imports, which is too heavy for scripts/). 54 assertions and 15 mutations ran green — including two that initially SURVIVED and were closed — but plans 05 and 09 append an entry to that array with no automated protection. CELPIP_SECTIONS is committed-gated by scripts/verify-celpip-sections.mts; the history half is not. | open |  | 2026-07-31T07:07:20.000Z |  |
| 7 | 02.1 | unrun-verify | src/lib/celpip/speaking-prompts.ts |  | 02.1-03: the eight Speaking cards and the Task 3 written-scene caveat render only under the Speaking tab, which is client-side, so the served /celpip HTML carries the Writing tab alone and neither has been SEEN rendered. What was verified against a production `next start`: all eight prompt routes return 200, an unknown id returns 404, the coverage line reads "8 prompts covering 8 of the 8 exam task shapes", and the Task 3 page serves its disclosure, its scene text and its 30/60 timings. What was not: no browser has switched to the Speaking tab, and none of the seven new prompts has been taken through record -> playback -> self-check (only the plan-01 advice prompt was, at 02.1-01's checkpoint). Owed to 02.1-12. | open |  | 2026-07-31T07:30:42.000Z |  |
| 8 | 02.1 | unrun-verify | src/components/celpip/AudioCheck.tsx |  | 02.1-04: nobody has HEARD the audio check. The whole component exists to answer the question 'did sound come out', and it has never been opened in a browser, never run on a phone, and never played through a speaker. Everything checkable without one was checked: the speech driver is gated by scripts/verify-celpip-speech.mts (50 assertions, 22 mutations) against a mock engine, and all seven of the component's render branches were server-rendered in node against a generated copy. What is untested is the part only a device can answer - whether two distinct voices actually come out on Chrome, Safari and Android; whether the iPhone hardware silent switch produces exactly the failure the troubleshoot branch describes; and whether a CELPIP-length multi-turn script really survives Chrome's ~15s utterance truncation. That last one is the reason speaker-turn chunking exists. AudioCheck is not mounted by any route until plan 05, so this cannot be closed before then. Owed to 02.1-12. | open |  | 2026-07-31T08:09:51.051Z |  |
| 9 | 02.1 | deviation | src/components/celpip/AudioCheck.tsx |  | 02.1-04: AudioCheck's markup is gated only by an ad-hoc harness that was not committed - it transpiles the component with the TypeScript compiler API, seeds the phase state, and server-renders each branch, which is too much machinery for scripts/ and is the same judgement 02.1-02 made about HISTORY_SOURCES. 24 checks and 8 mutations ran green (7 caught, 1 known survivor: a dead onClick, which a markup-only harness cannot see). So plan 05 mounts and edits this component with no automated protection on its escape hatches - the iPhone silent-switch guidance, the reveal-the-words escape and the run-anyway path can each be deleted without any committed gate noticing. The speech DRIVER is committed-gated by scripts/verify-celpip-speech.mts; the component half is not. | open |  | 2026-07-31T08:09:51.645Z |  |
| 10 | 02.1 | unrun-verify | src/components/celpip/ListeningPlayer.tsx |  | Nobody has heard the Listening runner or driven it in a browser: the phase machine, the one-question-at-a-time reveal, submit and the recorded attempt have never been clicked through, and no audio has come out of a speaker on any device. | open |  | 2026-07-31T08:45:09.723Z |  |
| 11 | 02.1 | deviation | src/components/celpip/ListeningPlayer.tsx |  | The player's D-04/D-05 behaviour is gated by greps and by a manually-run served-HTML measurement, not by a committed render harness. The RSC-payload leak is now committed-gated at the route boundary, but the one-at-a-time reveal and the no-revisit rule are not. | open |  | 2026-07-31T08:45:19.431Z |  |
| 12 | 02.1 | unrun-verify | src/lib/celpip/listening-set-1.ts |  | Nobody has heard the two new two-speaker parts; the multi-voice distinguishability and the 714-word problem-solving script are unproved by ear | open |  | 2026-07-31T09:12:59.043Z |  |
| 13 | 02.1 | unrun-verify | src/lib/celpip/listening-set-1.ts |  | Nobody has sat listening set 1 end to end and timed it. The set is now 2,090 words and 29 items on a 44-minute derived clock; the timing check is bounded by arithmetic against one real 76-second measurement, not observed. | open |  | 2026-07-31T09:26:46.853Z |  |
| 14 | 02.1 | unrun-verify | src/lib/celpip/listening-set-1.ts |  | Nobody has heard the discussion part: whether three browser voices stay distinguishable by ear across a 378-word script is unknown, and six of its eight questions are unanswerable if they are not. | open |  | 2026-07-31T09:47:19.779Z |  |
| 15 | 02.1 | deviation | src/components/celpip/ListeningPlayer.tsx |  | The player shows no speaker label WHILE audio plays; labels exist only in the post-answer transcript. Plan 11 authored around it by naming all three speakers aloud in the script, but any future multi-speaker part inherits the same constraint unspoken. | open |  | 2026-07-31T09:47:20.426Z |  |
| 16 | 02.1 | unrun-verify | src/components/celpip/ReadingRunner.tsx |  | 02.1-08: nobody has seen the reading runner. Neither ReadingRunner nor DropdownBlank has been opened in a browser, on a phone, or with a screen reader — READING_SETS is empty so no URL reaches them. Untested: whether the native select opens as the system picker on iOS/Android, whether inline selects sit legibly in a paragraph at mobile widths, and whether the per-part clock reads correctly when re-armed. Cannot close before 02.1-09 lands a bank. Owed to 02.1-12. | open |  | 2026-07-31T10:02:45.239Z |  |
| 17 | 02.1 | deviation | src/components/celpip/ReadingRunner.tsx |  | 02.1-08: two component invariants survived mutation with NO gate at all — the Timer's per-part key={part.id} and DropdownBlank's aria-label. Both are silent when broken (a stale clock carried into the next part; four unlabelled combo boxes in one paragraph). A committed gate needs a render harness, which 02.1-04 judged too much machinery for scripts/. The greps live only in 02.1-08-SUMMARY.md. | open |  | 2026-07-31T10:02:45.838Z |  |
| 18 | 02.1 | unrun-verify | src/lib/celpip.ts |  | 02.1-08: id uniqueness across question ids and blank ids within a reading set is documented on CelpipReadingPart but gated by nothing. They share one answers map, so a collision silently overwrites one of two answers and mis-scores the sheet (T-02.1-39). This plan could not gate it — gating needs a bank. Owed to 02.1-09's content harness. | open |  | 2026-07-31T10:02:46.482Z |  |
| 19 | 02.1 | unrun-verify | src/components/celpip/DropdownBlank.tsx |  | Nobody has answered a drop-down blank in a browser. The reading set now serves 200 and the explanation renders under the blank in code, but the plan's human-check (answer one blank wrongly on purpose and read the explanation) was not run: no browser-driving tool was available to this executor and adding one would have installed a package. Closes the moment someone opens /celpip/reading/reading-set-1 and picks a wrong option. | open |  | 2026-07-31T10:27:00.428Z |  |
| 20 | 02.1 | unrun-verify | src/lib/celpip/reading-set-1.ts |  | The two 'the passage does not say' questions are gated for shape but not for pedagogy: nothing asserts that at least one such option is the KEY. An author who made every not-stated option wrong would pass all 519 assertions while teaching the learner to discount the very option the information part tests her on. The invariant is stated in a comment on INFORMATION_PART and gated by nothing. | open |  | 2026-07-31T10:27:00.993Z |  |
| 21 | 02.1 | unrun-verify | src/lib/celpip/reading-set-1.ts |  | Nobody has worked Reading set 1 end to end at a real pace; whether 39 minutes fits these passages is untested | open |  | 2026-07-31T11:00:17.011Z |  |
| 22 | 02.1 | unrun-verify | src/components/celpip/ReadingRunner.tsx |  | The new per-part item order (blanks before questions for the diagram part only) has never been seen rendered; gated by harness and mutation only | open |  | 2026-07-31T11:00:17.547Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "02",
    "file": "src/lib/celpip-progress.ts",
    "line": null,
    "description": "02-06 Task 2 asked for a hand-check that a completed CELPIP task shows a blank editor after a reconcile; it needs an authenticated session against the live DB, which this run deliberately did not touch. Owed to 02-07.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-28T23:55:44.383Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T07:07:20.000Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T07:30:42.000Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T10:02:45.239Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T10:02:46.482Z",
    "resolved_at": null
  },
  {
    "id": 19,
    "kind": "unrun-verify",
    "phase": "02.1",
    "file": "src/components/celpip/DropdownBlank.tsx",
    "line": null,
    "description": "Nobody has answered a drop-down blank in a browser. The reading set now serves 200 and the explanation renders under the blank in code, but the plan's human-check (answer one blank wrongly on purpose and read the explanation) was not run: no browser-driving tool was available to this executor and adding one would have installed a package. Closes the moment someone opens /celpip/reading/reading-set-1 and picks a wrong option.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T10:27:00.428Z",
    "resolved_at": null
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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-31T11:00:17.547Z",
    "resolved_at": null
  }
]
````
