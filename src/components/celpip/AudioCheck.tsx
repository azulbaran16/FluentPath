"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelSpeech,
  speakTurns,
  speechSupported,
  useEnglishVoices,
  type CelpipSpeechTurn,
} from "@/lib/celpip-speech";

// The unscored warm-up that runs before a Listening set arms its timer.
//
// It mirrors the exam, which opens Listening with an unscored practice task —
// but its real job here is to be this section's FAILURE VALVE. D-04 forbids
// showing the script and D-05 hides the questions until playback ends, so a
// learner whose audio silently fails has nothing on screen and no way forward.
// Finding that out here, before the clock starts, is the difference between a
// wasted evening and a thirty-second fix.
//
// It also does something the exam's practice task does not have to: it anchors
// the very first `speak()` of the session in a deliberate button press. iOS
// Safari rejects speech that is not part of a user gesture, and this is the
// moment the learner is actually paying attention to whether sound came out.
//
// Nothing here is scored, nothing is persisted, and the timer is not armed
// until this step is passed or explicitly skipped.

/** What the learner reported, handed up so the player can act on it. */
export type AudioCheckOutcome =
  /** She heard it. Arm the timer and run the set normally. */
  | "heard"
  /** She heard nothing and chose to go on anyway. The set still runs; the
   * attempt records `audioFailed` so her own history stays honest. */
  | "no-audio"
  /** She skipped the check without answering either way. */
  | "skipped";

/**
 * The warm-up line. Original prose (D-06) and deliberately TWO speakers, so the
 * check exercises the same multi-voice path a real part uses — if only one of
 * the two comes through, that is worth discovering here rather than in Part 1.
 *
 * Short on purpose: a learner who cannot hear should not have to sit through
 * thirty seconds to find out.
 */
const CHECK_TURNS: CelpipSpeechTurn[] = [
  { speaker: "Fern", text: "This is a sound check. Nothing here is scored." },
  { speaker: "Owen", text: "If you can hear both of us clearly, you are ready to begin." },
];

type Phase = "idle" | "playing" | "asked" | "troubleshoot";

export function AudioCheck({ onDone }: { onDone: (outcome: AudioCheckOutcome) => void }) {
  const voices = useEnglishVoices();
  const [phase, setPhase] = useState<Phase>("idle");
  const [supported, setSupported] = useState(true);
  const [engineFailed, setEngineFailed] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [plays, setPlays] = useState(0);
  /** Guards the callbacks: an utterance that ends after the component has moved
   * on must not drag it back into `asked`. */
  const liveRef = useRef(true);

  // Feature-detect after mount so the server renders the optimistic shell and
  // hydration agrees with it.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSupported(speechSupported());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The one guaranteed cleanup. `speechSynthesis` is a platform singleton, so
  // leaving it speaking talks over whatever the learner opens next.
  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      cancelSpeech();
    };
  }, []);

  /**
   * Plays the line. Called ONLY from a press — never from an effect — because
   * that press is what makes the utterance legal on iOS.
   */
  const play = useCallback(() => {
    setEngineFailed(false);
    setPhase("playing");
    const queued = speakTurns(CHECK_TURNS, {
      voices,
      onCompleted: () => {
        if (!liveRef.current) return;
        setPhase("asked");
      },
      onFailed: () => {
        if (!liveRef.current) return;
        // A failure here is treated exactly like "I heard nothing": the learner
        // is asked the same question and offered the same ways forward. She
        // does not need to know whether the engine errored or the volume was
        // down — she needs the next step either way.
        setEngineFailed(true);
        setPhase("troubleshoot");
      },
    });
    if (!queued) {
      setSupported(false);
      setPhase("idle");
      return;
    }
    setPlays((n) => n + 1);
  }, [voices]);

  const cardClass =
    "rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]";

  /* ---------------------------------------------------------------- *
   * No speech engine at all — a different problem from "I heard
   * nothing", and it gets its own sentence rather than a retry loop
   * that cannot succeed.
   * ---------------------------------------------------------------- */

  if (!supported) {
    return (
      <section className={cardClass}>
        <h2 className="font-display text-xl font-semibold">This browser cannot speak</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The audio for these sets is spoken by your browser, and this one has no speech
          engine available. Chrome, Edge and Safari all do — but you do not have to stop
          here.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          You can run the set with the scripts written out instead. It stops being listening
          practice and becomes reading practice, which is worth less for this section, so it
          is worth trying another browser first.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => onDone("no-audio")}
            className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--sky)" }}
          >
            Read the scripts instead
          </button>
          <button
            onClick={() => onDone("skipped")}
            className="cursor-pointer rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Start anyway
          </button>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- *
   * She heard nothing — or the engine failed, which she experiences as
   * exactly the same thing. Every branch here has to lead somewhere.
   * ---------------------------------------------------------------- */

  if (phase === "troubleshoot") {
    return (
      <section className={cardClass}>
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--vermilion)" }}>
          Let&apos;s fix the sound
        </h2>
        {engineFailed && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft" role="alert">
            The browser stopped part-way through that line, which usually means the page lost
            focus. Try it once more before changing anything.
          </p>
        )}
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          <li>
            <strong>On an iPhone or iPad, check the silent switch on the side.</strong> When
            it is on, Safari makes no sound at all — even though music, calls and other apps
            still do. This catches almost everyone.
          </li>
          <li>Turn the volume up, and unplug or reconnect headphones if you use them.</li>
          <li>
            If a video or another tab is playing, close it. Only one thing can hold the audio
            output on some devices.
          </li>
          <li>Keep this tab in front while it plays — speech stops when the page is hidden.</li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={play}
            className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--sky)" }}
          >
            Play it again
          </button>
          <button
            onClick={() => setShowWords(true)}
            className="cursor-pointer rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Show me what it said
          </button>
          <button
            onClick={() => onDone("no-audio")}
            className="cursor-pointer rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Read the scripts instead
          </button>
        </div>

        {showWords && (
          <div className="mt-5 rounded-xl border border-line-strong p-4">
            <h3 className="font-display text-base font-semibold">What you should have heard</h3>
            <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">
              {CHECK_TURNS.map((turn) => (
                <p key={turn.speaker}>
                  <span className="font-semibold">{turn.speaker}:</span> {turn.text}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-muted">
          This is practice, not the exam — reading the scripts is a worse way to prepare for
          this section, but it is much better than stopping here.
        </p>
      </section>
    );
  }

  /* ---------------------------------------------------------------- *
   * Played through — the one explicit branch.
   * ---------------------------------------------------------------- */

  if (phase === "asked") {
    return (
      <section className={cardClass}>
        <h2 className="font-display text-xl font-semibold">Did you hear two voices?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Answer honestly — nothing here is scored, and the timer has not started.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => onDone("heard")}
            className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--sky)" }}
          >
            Yes — I heard it
          </button>
          <button
            onClick={() => setPhase("troubleshoot")}
            className="cursor-pointer rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{
              borderColor: "var(--vermilion)",
              color: "var(--vermilion)",
            }}
          >
            No — I heard nothing
          </button>
        </div>
        <button
          onClick={play}
          className="mt-3 cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Play it once more
        </button>
      </section>
    );
  }

  /* ---------------------------------------------------------------- *
   * Idle and playing.
   * ---------------------------------------------------------------- */

  return (
    <section className={cardClass}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Listening · sound check
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold">Check your audio first</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        The exam opens with an unscored practice task, and so does this. Press play and
        listen for two different voices. Nothing is scored and the clock has not started.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Once the set begins you will hear each part <strong>once</strong>, and the questions
        appear only after the audio ends — as in the exam. The audio cannot be paused, so it
        is worth being sure now.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={play}
          disabled={phase === "playing"}
          className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          style={{ background: "var(--sky)" }}
        >
          {phase === "playing" ? "Playing…" : plays > 0 ? "Play again" : "Play the sound check"}
        </button>
        <button
          onClick={() => onDone("skipped")}
          className="cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Skip the check
        </button>
      </div>

      {phase === "playing" && (
        <p className="mt-3 text-sm text-ink-soft" role="status" aria-live="polite">
          Speaking now — keep this tab in front until it finishes.
        </p>
      )}
    </section>
  );
}
