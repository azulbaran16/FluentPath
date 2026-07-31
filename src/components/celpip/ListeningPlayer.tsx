"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import {
  listeningPartKindLabel,
  type CelpipListeningPart,
  type CelpipListeningSegment,
  type CelpipListeningSet,
  type CelpipObjectiveQuestion,
} from "@/lib/celpip";
import { formatDuration, useCelpipProgress } from "@/lib/celpip-progress";
import { cancelSpeech, speakTurns, useEnglishVoices } from "@/lib/celpip-speech";
import { AudioCheck, type AudioCheckOutcome } from "./AudioCheck";
import { Timer } from "./Timer";

// CELPIP Listening: brief -> sound check -> hear once -> answer -> results.
//
// THREE THINGS IN HERE ARE LOAD-BEARING, and all three are invisible to `tsc`.
//
// 1. SHE HEARS, SHE NEVER READS (D-04). There is no render path that puts the
//    script on screen before she has answered — no "reveal" control anywhere,
//    deliberately, because the shipped practice-room player has one and copying
//    it would quietly turn this section into reading practice. The ONE exception
//    is the failure valve: a learner whose audio genuinely does not work chooses
//    to run the set with the script written out, and the attempt then records
//    `audioFailed: true` so her own history never claims she listened. That is a
//    degraded mode entered from a failure, not a button offered to someone whose
//    audio works.
//
// 2. THE QUESTIONS APPEAR ONLY AFTER PLAYBACK (D-05), and exactly one thing
//    advances the phase: `onCompleted` from the speech driver, which is attached
//    to the LAST utterance and nowhere else. Not a timer, not `onboundary`, not
//    a word-count estimate. They are then revealed ONE AT A TIME, in the order
//    the audio covered them, and an answered question is not revisitable —
//    seeing all five at once, or going back after a later one jogs your memory,
//    makes this easier than the exam and trains the wrong habit.
//
// 3. THE NOTES ARE NEVER PERSISTED. The note pad below is React state and dies
//    with the set. It is shown in the results view within this session and it
//    reaches no store: persisting it would put a second map with a real delete
//    site on the one `updatedAt` this state carries, which `drafts` already
//    rides, and a cleared writing draft would come back (the fca41b7 defect).
//    Both the schema and the merge assert that a client sending `notes` has it
//    stripped, so this is a contract rather than a convention.
//
// "Plays once" is RECORDED, not enforced: a reload restarts everything and a
// lock she can defeat in one keystroke would be theatre. The play control
// disables the moment the first utterance starts, and every start after the
// first counts into `replays` on the attempt.

type Phase = "brief" | "check" | "playing" | "answering" | "results";
type Mode = "timed" | "practice" | null;

/**
 * One run of audio and the questions that follow it.
 *
 * A stage is a SEGMENT, not a part, because problem solving asks its questions
 * after each of its three segments rather than after the whole part. Every
 * other part shape has one segment and therefore one stage, so this costs
 * nothing today and means the parts appended by later plans need no new
 * machinery here.
 */
interface Stage {
  key: string;
  part: CelpipListeningPart;
  partNumber: number;
  segment: CelpipListeningSegment;
  segmentNumber: number;
  segmentCount: number;
  questions: CelpipObjectiveQuestion[];
}

/**
 * Flattens a set into the sequence the learner actually walks.
 *
 * Every question lands in exactly one stage. A question naming a segment goes
 * with that segment; a question naming none belongs to the part's first
 * segment; and anything left over — a `segmentId` that resolves to nothing,
 * which the content harness rejects at build time — is appended to the part's
 * last stage rather than silently dropped. A question that never renders is a
 * worse failure than one that renders in the wrong place: under D-05 she would
 * simply never see it, and nothing on screen would say so.
 */
function buildStages(set: CelpipListeningSet): Stage[] {
  const stages: Stage[] = [];
  set.parts.forEach((part, partIndex) => {
    if (part.segments.length === 0) return;
    const perSegment = part.segments.map((segment, segmentIndex) =>
      part.questions.filter((question) =>
        question.segmentId === undefined
          ? segmentIndex === 0
          : question.segmentId === segment.id,
      ),
    );
    const placed = new Set(perSegment.flat().map((question) => question.id));
    const orphans = part.questions.filter((question) => !placed.has(question.id));
    if (orphans.length > 0) perSegment[perSegment.length - 1].push(...orphans);

    part.segments.forEach((segment, segmentIndex) => {
      stages.push({
        key: `${part.id}::${segment.id}`,
        part,
        partNumber: partIndex + 1,
        segment,
        segmentNumber: segmentIndex + 1,
        segmentCount: part.segments.length,
        questions: perSegment[segmentIndex],
      });
    });
  });
  return stages;
}

const CARD =
  "rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]";

export function ListeningPlayer({ set }: { set: CelpipListeningSet }) {
  const { addListeningAttempt } = useCelpipProgress();
  const voices = useEnglishVoices();

  const stages = useMemo(() => buildStages(set), [set]);
  const allQuestions = useMemo(
    () => stages.flatMap((stage) => stage.questions),
    [stages],
  );

  const [phase, setPhase] = useState<Phase>("brief");
  const [mode, setMode] = useState<Mode>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [locked, setLocked] = useState(false);

  const [stageIndex, setStageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  /** The option highlighted for the question on screen, before she moves on.
   * Separate from `answers` so that moving on is the deliberate act — which is
   * what makes "no revisiting" a rule rather than an accident. */
  const [pending, setPending] = useState<number | null>(null);

  const [speaking, setSpeaking] = useState(false);
  const [playedStage, setPlayedStage] = useState(false);
  const [interrupted, setInterrupted] = useState<string | null>(null);
  const [replays, setReplays] = useState(0);
  const [audioFailed, setAudioFailed] = useState(false);

  /** React state only. Never persisted — see the header. */
  const [notes, setNotes] = useState("");
  const [submittedDuration, setSubmittedDuration] = useState(0);

  const finalizedRef = useRef(false);
  /** Guards the speech callbacks: an utterance that ends after the component
   * has moved on must not drag it back into `answering`. */
  const liveRef = useRef(true);
  /** The same fact as `playedStage`, held where the play handler can read AND
   * write it in one pass. Counting replays inside a `setState` updater would
   * double-count under React's development double-invoke, and a replay counter
   * that inflates is worse than none — it is the one number on the attempt whose
   * whole job is to be believed. */
  const playedStageRef = useRef(false);

  const stage = stages[stageIndex];
  const question = stage?.questions[questionIndex];

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      cancelSpeech();
    };
  }, []);

  // Backgrounding stops playback, and the stage then needs an explicit restart
  // rather than a pretence that it carried on. The speech driver installs its
  // own visibilitychange listener for the duration of a playback and reports
  // "interrupted"; this one is deliberately a second layer, because it also
  // covers the window between a settled playback and the next press, and
  // because Safari can wedge its synthesizer when hidden mid-utterance until
  // the page is reloaded — in which case no utterance event ever arrives.
  useEffect(() => {
    if (phase !== "playing") return;
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      cancelSpeech();
      setSpeaking(false);
      setInterrupted(
        "Playback stopped because this tab went to the background. Start the audio again when you are ready — the exam would not wait, so this counts as another play.",
      );
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [phase]);

  const timerRunning =
    mode !== null && (phase === "playing" || phase === "answering") && !expired;

  /**
   * Speaks the current stage. Called ONLY from a press: the speech driver
   * queues every utterance synchronously inside this call, and that is what
   * keeps the whole sequence inside the one user gesture iOS Safari requires.
   *
   * `onCompleted` fires on the last utterance only. Under D-05 it is the single
   * signal permitted to reveal the questions.
   */
  const playStage = useCallback(
    (advanceOnEnd: boolean) => {
      if (!stage) return;
      setInterrupted(null);
      setSpeaking(true);
      const queued = speakTurns(stage.segment.turns, {
        voices,
        onCompleted: () => {
          if (!liveRef.current) return;
          setSpeaking(false);
          if (advanceOnEnd) setPhase("answering");
        },
        onFailed: () => {
          if (!liveRef.current) return;
          setSpeaking(false);
          setInterrupted(
            "The audio stopped before it finished. Try it once more — or, if you cannot hear anything at all, read the script instead and this attempt will record that you did not listen to it.",
          );
        },
      });
      if (!queued) {
        setSpeaking(false);
        setInterrupted(
          "This browser could not play the audio. Read the script instead — the attempt will record that you did not listen to it.",
        );
        return;
      }
      if (playedStageRef.current) setReplays((n) => n + 1);
      playedStageRef.current = true;
      setPlayedStage(true);
    },
    [stage, voices],
  );

  function start(selected: "timed" | "practice") {
    setMode(selected);
    setPhase("check");
  }

  /** The sound check is what arms the clock — never before it resolves. */
  function handleCheck(outcome: AudioCheckOutcome) {
    if (outcome === "no-audio") setAudioFailed(true);
    setStartedAt(Date.now());
    setPhase("playing");
  }

  function handleExpire() {
    setExpired(true);
    setLocked(true);
  }

  function continueUntimed() {
    setLocked(false);
  }

  /** Her current selection folded into the answer sheet. An unanswered question
   * simply has no entry and scores as wrong — submission is never blocked on
   * one, because under exam conditions a blank is a real outcome. */
  function withPending(): Record<string, number> {
    if (pending === null || question === undefined) return answers;
    return { ...answers, [question.id]: pending };
  }

  function nextQuestion() {
    const merged = withPending();
    setAnswers(merged);
    setPending(null);
    if (stage && questionIndex + 1 < stage.questions.length) {
      setQuestionIndex(questionIndex + 1);
      return;
    }
    if (stageIndex + 1 < stages.length) {
      setStageIndex(stageIndex + 1);
      setQuestionIndex(0);
      playedStageRef.current = false;
      setPlayedStage(false);
      setInterrupted(null);
      setPhase("playing");
      return;
    }
    submit(merged);
  }

  function submit(merged: Record<string, number> = withPending()) {
    cancelSpeech();
    setAnswers(merged);
    setPending(null);
    setSpeaking(false);
    setSubmittedDuration(startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0);
    finalizedRef.current = false;
    setPhase("results");
  }

  const correct = allQuestions.filter((q) => answers[q.id] === q.answer).length;

  // Recorded once, from every exit path out of the results view, and idempotent
  // across all of them — the Phase 1 lesson, copied from the Writing simulator
  // rather than re-derived. NO NOTES GO IN.
  function finalizeAttempt() {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    addListeningAttempt(set.id, {
      setId: set.id,
      date: new Date().toISOString(),
      durationSeconds: submittedDuration,
      answers,
      correct,
      total: allQuestions.length,
      replays,
      audioFailed,
      outOfTime: expired,
    });
  }

  function retry() {
    finalizeAttempt();
    cancelSpeech();
    setMode(null);
    setStartedAt(null);
    setExpired(false);
    setLocked(false);
    setStageIndex(0);
    setQuestionIndex(0);
    setAnswers({});
    setPending(null);
    setSpeaking(false);
    playedStageRef.current = false;
    setPlayedStage(false);
    setInterrupted(null);
    setReplays(0);
    setAudioFailed(false);
    setNotes("");
    setSubmittedDuration(0);
    finalizedRef.current = false;
    setPhase("brief");
  }

  /* ---------------------------------------------------------------- *
   * Results — the ONLY place the script is shown to a learner whose
   * audio worked.
   * ---------------------------------------------------------------- */

  if (phase === "results") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Attempt complete</h1>
        <p className="mt-2 text-ink-soft">{set.title}</p>

        <p className="mt-3 text-xs text-muted">
          {formatDuration(submittedDuration)} used · {correct} / {allQuestions.length}{" "}
          correct
          {replays > 0 && ` · ${replays} replay${replays === 1 ? "" : "s"}`}
          {audioFailed && (
            <span className="ml-1 font-semibold" style={{ color: "var(--vermilion)" }}>
              · read, not heard
            </span>
          )}
          {expired && (
            <span className="ml-1 font-semibold" style={{ color: "var(--vermilion)" }}>
              · ran out of time
            </span>
          )}
        </p>

        {stages.map((s) => (
          <section key={s.key} className={`${CARD} mt-6`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Part {s.partNumber} · {listeningPartKindLabel(s.part.kind)}
              {s.segmentCount > 1 && ` · segment ${s.segmentNumber} of ${s.segmentCount}`}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">{s.part.title}</h2>

            <div className="mt-4 space-y-6">
              {s.questions.map((q, qi) => {
                const chosen = answers[q.id];
                const right = chosen === q.answer;
                return (
                  <div key={q.id}>
                    <p className="font-medium">
                      {qi + 1}. {q.stem}
                    </p>
                    <div className="mt-2 grid gap-2">
                      {q.options.map((opt, oi) => {
                        const picked = chosen === oi;
                        const isAnswer = q.answer === oi;
                        let cls = "border-line-strong";
                        if (isAnswer)
                          cls =
                            "border-teal bg-[color-mix(in_srgb,var(--teal)_10%,transparent)]";
                        else if (picked)
                          cls =
                            "border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]";
                        return (
                          <div
                            key={oi}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${cls}`}
                          >
                            {opt}
                            {isAnswer && (
                              <Check className="h-4 w-4 text-teal" strokeWidth={2.5} />
                            )}
                            {picked && !isAnswer && (
                              <X className="h-4 w-4 text-vermilion" strokeWidth={2.5} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {chosen === undefined
                        ? "You left this one blank. "
                        : right
                          ? ""
                          : "That was not the answer. "}
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-line-strong p-4">
              <h3 className="font-display text-base font-semibold">Transcript</h3>
              <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                {s.segment.turns.map((turn, i) => (
                  <p key={i}>
                    <span className="font-semibold">{turn.speaker}:</span> {turn.text}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}

        {notes.trim().length > 0 && (
          <section className={`${CARD} mt-6`}>
            <h2 className="font-display text-lg font-semibold">Your notes</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-paper-deep/50 p-4 font-sans text-sm leading-relaxed text-ink-soft">
              {notes}
            </pre>
            <p className="mt-2 text-xs text-muted">
              Notes stay on this page for this attempt only — they are not saved to your
              account, exactly as the scratch paper is not kept at the test centre.
            </p>
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={retry}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Try this set again
          </button>
          <Link
            href="/celpip"
            onClick={finalizeAttempt}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Back to tasks
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Sound check — plan 04's component, mounted here. Nothing is armed
   * until it resolves one way or the other.
   * ---------------------------------------------------------------- */

  if (phase === "check") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {set.title}
        </p>
        <h1 className="mb-5 mt-1 font-display text-3xl font-semibold">
          Before the clock starts
        </h1>
        <AudioCheck onDone={handleCheck} />
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Brief
   * ---------------------------------------------------------------- */

  if (phase === "brief" || !mode || !stage) {
    const kinds = set.parts.map((part) => listeningPartKindLabel(part.kind));
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          CELPIP · Listening
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{set.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          {kinds.length === 1 ? kinds[0] : `${kinds.length} parts: ${kinds.join(", ")}`} ·{" "}
          {allQuestions.length} question{allQuestions.length === 1 ? "" : "s"} ·{" "}
          {set.timeLimitMinutes} minutes
        </p>

        <div
          className="mt-5 rounded-xl border p-4"
          style={{
            borderColor: "var(--sky)",
            background: "color-mix(in srgb, var(--sky) 10%, transparent)",
          }}
        >
          <h2 className="font-display text-base font-semibold">How this runs</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>A short sound check first. The clock does not start until it is done.</li>
            <li>
              You press play and <strong>hear each part once</strong>. The audio cannot be
              paused or rewound, and you will not see the words.
            </li>
            <li>
              The questions appear <strong>only when the audio ends</strong>, one at a time.
              Once you move on from a question you cannot go back to it — that is how the
              exam works.
            </li>
            <li>
              Afterwards you get the answer key, an explanation for every question, and the
              full script.
            </li>
          </ol>
          <p className="mt-3 text-xs text-muted">
            There is a note pad on screen while you listen. Use it — the exam gives you
            paper for exactly this, and it is the habit this section rewards. Your notes
            stay on this page and are not saved to your account.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => start("timed")}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Start Timed Attempt
          </button>
          <button
            onClick={() => start("practice")}
            className="rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Start Practice
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Practice lets you pause the clock and play a part again. It cannot pause the
          audio itself — no browser does that reliably — and every extra play is recorded
          on the attempt so your history stays honest with you.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Playing and answering
   * ---------------------------------------------------------------- */

  const answeredSoFar =
    stages.slice(0, stageIndex).reduce((n, s) => n + s.questions.length, 0) +
    questionIndex;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="sticky top-4 z-10 mb-4 flex items-center justify-between gap-4 rounded-xl border border-line bg-card/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <Timer
          totalSeconds={set.timeLimitMinutes * 60}
          running={timerRunning}
          mode={mode}
          onExpire={handleExpire}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {phase === "playing"
            ? `Part ${stage.partNumber} of ${set.parts.length}`
            : `Question ${answeredSoFar + 1} of ${allQuestions.length}`}
        </span>
      </div>

      {locked && (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            borderColor: "var(--vermilion)",
            background: "color-mix(in srgb, var(--vermilion) 10%, transparent)",
          }}
        >
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--vermilion)" }}>
            Time&apos;s up
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Nothing you have answered is lost. Submit what you have, or keep going untimed
            — it&apos;ll be marked as over time.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={() => submit()}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-colors"
              style={{ background: "var(--sky)" }}
            >
              Submit as-is
            </button>
            <button
              onClick={continueUntimed}
              className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
            >
              Continue untimed
            </button>
          </div>
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {listeningPartKindLabel(stage.part.kind)}
        {stage.segmentCount > 1 &&
          ` · segment ${stage.segmentNumber} of ${stage.segmentCount}`}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold">{stage.part.title}</h1>

      {phase === "playing" ? (
        <section className={`${CARD} mt-4`}>
          {audioFailed ? (
            <>
              {/* The failure valve, and the ONLY pre-answer path to the words.
                  She is here because the sound check found no audio or playback
                  failed outright; the attempt records `audioFailed` so this can
                  never be mistaken for listening practice in her history. */}
              <h2 className="font-display text-lg font-semibold">Read this part instead</h2>
              <p className="mt-1 text-sm text-ink-soft">
                You told us the audio is not working, so here are the words. This is
                reading practice rather than listening practice, and the attempt will say
                so.
              </p>
              <div className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                {stage.segment.turns.map((turn, i) => (
                  <p key={i}>
                    <span className="font-semibold">{turn.speaker}:</span> {turn.text}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setPhase("answering")}
                disabled={locked}
                className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
                style={{ background: "var(--sky)" }}
              >
                I&apos;ve read it — go to the questions
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-lg font-semibold">
                {speaking ? "Listen — this plays once" : "Ready when you are"}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {speaking
                  ? "Keep this tab in front. The questions appear as soon as it finishes."
                  : "Press play when you are ready to listen. You will not see the words, and the questions stay hidden until the audio ends."}
              </p>

              {interrupted && (
                <p
                  className="mt-4 rounded-xl border p-4 text-sm"
                  style={{
                    borderColor: "var(--vermilion)",
                    background: "color-mix(in srgb, var(--vermilion) 10%, transparent)",
                  }}
                  role="alert"
                >
                  {interrupted}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => playStage(true)}
                  disabled={speaking || locked || (playedStage && mode === "timed" && !interrupted)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
                  style={{ background: "var(--sky)" }}
                >
                  {speaking
                    ? "Playing…"
                    : playedStage
                      ? "Play it again"
                      : "Play this part"}
                </button>
                {interrupted && !speaking && (
                  <button
                    onClick={() => {
                      setAudioFailed(true);
                      setInterrupted(null);
                    }}
                    className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
                  >
                    I can&apos;t hear anything — read the script
                  </button>
                )}
              </div>
              {speaking && (
                <p className="mt-3 text-xs text-muted" role="status" aria-live="polite">
                  Speaking now. The audio cannot be paused — that is true of the exam too.
                </p>
              )}
            </>
          )}
        </section>
      ) : (
        <section className={`${CARD} mt-4`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Question {answeredSoFar + 1} of {allQuestions.length}
          </p>
          {question === undefined ? (
            <p className="mt-2 text-sm text-ink-soft">
              There are no questions on this part. Move on when you are ready.
            </p>
          ) : (
            <>
              <p className="mt-2 font-medium">{question.stem}</p>
              <div className="mt-3 grid gap-2">
                {question.options.map((opt, oi) => {
                  const picked = pending === oi;
                  const cls = picked ? "border-ink" : "border-line-strong hover:bg-paper-deep";
                  return (
                    <button
                      key={oi}
                      onClick={() => !locked && setPending(oi)}
                      disabled={locked}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={nextQuestion}
              disabled={locked}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: "var(--sky)" }}
            >
              {answeredSoFar + 1 < allQuestions.length
                ? "Next question"
                : "Submit answers"}
            </button>
            {mode === "practice" && !audioFailed && (
              <button
                onClick={() => playStage(false)}
                disabled={speaking || locked}
                className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep disabled:opacity-40"
              >
                {speaking ? "Playing…" : "Hear it again (practice only)"}
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            {pending === null
              ? "You can move on without answering — a blank counts as wrong, which is what it would count as in the exam."
              : "Once you move on you cannot come back to this question."}
            {mode === "practice" &&
              !audioFailed &&
              " The exam plays each part once; hearing it again here is a practice aid and is recorded on your attempt."}
          </p>
        </section>
      )}

      <section className={`${CARD} mt-5`}>
        <h2 className="font-display text-base font-semibold">Note pad</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Names, numbers, times — whatever you would scribble on the paper they give you…"
          className="mt-3 w-full resize-y rounded-xl border border-line-strong bg-paper p-3 text-base leading-relaxed outline-none transition-colors focus:border-sky"
        />
        <p className="mt-1 text-xs text-muted">
          Stays on this page for this attempt and is not saved to your account.
        </p>
      </section>
    </div>
  );
}
