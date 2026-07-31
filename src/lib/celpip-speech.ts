"use client";

import { useEffect, useState } from "react";

// The ONE place the CELPIP section drives `speechSynthesis` (D-03).
//
// Every browser landmine in this section is handled here, once, rather than
// four times across components — because the Listening section is the one place
// where a silent failure leaves the learner with nothing on screen at all: D-04
// forbids showing the script and D-05 hides the questions until playback ends.
//
// WHAT THIS MODULE GUARANTEES
//
//   Chrome-safe    One utterance per speaker turn. Chrome truncates a single
//                  long utterance at roughly fifteen seconds with no `onerror`
//                  and sometimes no `onend`, so a 300-word script spoken as one
//                  utterance dies a third of the way through and the questions
//                  never appear. Chunking by turn keeps every utterance far
//                  under the ceiling, and it is the same work the multi-speaker
//                  parts need anyway. It supersedes the widely-circulated
//                  `resume()`-every-14-seconds hack, which is a timer fighting
//                  the engine and misbehaves on Android.
//
//   iOS-safe       EVERY utterance is handed to `speak()` synchronously inside
//                  the caller's click handler. iOS Safari rejects a `speak()`
//                  that is not part of a user gesture, and a call chained from a
//                  previous utterance's `onend` is no longer part of one.
//                  `speechSynthesis` is a queue, so queueing all of them up
//                  front is both legal and simpler.
//
//   Android-safe   No `pause()` and no `onboundary`. On Android `pause()` is
//                  implemented as cancel and the `paused` flag is not reliably
//                  updated, so no product requirement may rest on it; practice
//                  mode pauses the TIMER, which `Timer` already supports, and
//                  the UI has to say that the audio itself cannot be paused.
//                  `onboundary` is not fired on Android and is unsupported for
//                  many voices, so it can carry no progress indicator.
//
//   SSR-safe       One combined `typeof window === "undefined" ||
//                  !window.speechSynthesis` check, so the module imports
//                  cleanly on the server and feature-detects in one expression.
//
//   Tidy           `cancel()` before every play, on unmount, and when the page
//                  is hidden. `speechSynthesis` is a platform singleton shared
//                  with every other page in the tab: a component that does not
//                  cancel keeps talking over the next page.
//
// Voice selection is a PREFERENCE and never a requirement. `getVoices()` is
// frequently empty on the first call because the list populates asynchronously,
// and at least one source reports Safari returning nothing usable at all — so
// voices are never awaited and never gate playback.

/** One line of a script: who says it, and what they say. */
export interface CelpipSpeechTurn {
  speaker: string;
  text: string;
}

/** What playback stopped for, when it did not simply finish. */
export type SpeechFailureReason =
  /** The engine reported an error on an utterance. */
  | "engine"
  /** The page was hidden mid-utterance. Safari can wedge its synthesizer when
   * backgrounded, so this is treated as a real stop rather than pretended past. */
  | "interrupted"
  /** No speech engine at all. */
  | "unsupported";

/**
 * The pitch ladder used ONLY when there are not enough distinct voices to give
 * every speaker one of their own. Small offsets either side of neutral: enough
 * to tell two speakers apart by ear, not enough to sound like a cartoon.
 */
const PITCH_LADDER = [1, 0.85, 1.15, 0.92, 1.08];

/** The pacing used everywhere else in the app. Kept identical on purpose — a
 * learner who practises pronunciation and then listens should not meet two
 * different speaking rates. */
const RATE = 0.95;
const LANG = "en-US";

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  return window.speechSynthesis;
}

/** Can this browser speak at all? Call it from an effect, never during render:
 * the server has no answer and a render-time answer would mismatch hydration. */
export function speechSupported(): boolean {
  return synth() !== null;
}

/**
 * English voices, read once at mount and refreshed on `voiceschanged`.
 *
 * Returns an empty array on the first render and often on the first call to
 * `getVoices()` too — that is expected, and it is exactly why nothing here may
 * be awaited. Playback with no voices at all is still playback: the browser
 * uses its default.
 *
 * The teardown cancels. A component that unmounts mid-utterance without
 * cancelling keeps talking over whatever the learner navigated to.
 */
export function useEnglishVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const engine = synth();
    if (!engine) return;
    const read = () =>
      setVoices(
        engine.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en")),
      );
    read();
    engine.addEventListener("voiceschanged", read);
    return () => {
      engine.removeEventListener("voiceschanged", read);
      engine.cancel();
    };
  }, []);

  return voices;
}

/** How one speaker will be voiced. `voice` absent means the browser default. */
export interface SpeakerVoice {
  voice?: SpeechSynthesisVoice;
  pitch: number;
}

/**
 * Assigns a voice per distinct speaker, deterministically.
 *
 * Deterministic matters: the same script must sound the same on every run, or
 * the learner cannot build the who-said-what habit these parts test. The voice
 * list is sorted by name first because `getVoices()` order is not stable across
 * calls or platforms.
 *
 * When there are not enough distinct voices — and Safari may offer none at all
 * — every speaker falls through to the browser default and is distinguished by
 * a pitch offset instead, on top of the on-screen label the turn already
 * carries. Playback is NEVER blocked on a missing voice.
 */
export function planVoices(
  speakers: string[],
  voices: SpeechSynthesisVoice[],
): Map<string, SpeakerVoice> {
  const distinct: string[] = [];
  for (const speaker of speakers) {
    if (speaker !== "" && !distinct.includes(speaker)) distinct.push(speaker);
  }
  const pool = [...voices].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const enoughVoices = distinct.length > 0 && pool.length >= distinct.length;

  const plan = new Map<string, SpeakerVoice>();
  distinct.forEach((speaker, i) => {
    plan.set(speaker, {
      voice: enoughVoices ? pool[i] : undefined,
      pitch: enoughVoices ? 1 : PITCH_LADDER[i % PITCH_LADDER.length],
    });
  });
  return plan;
}

export interface SpeakTurnsOptions {
  /** Available voices, from `useEnglishVoices`. An empty array is fine. */
  voices?: SpeechSynthesisVoice[];
  /** The first utterance actually began. */
  onStarted?: () => void;
  /** The LAST utterance ended. Under D-05 this is the only signal that may
   * reveal the questions, which is why it is attached to the final utterance
   * and nowhere else. */
  onCompleted?: () => void;
  /** Playback stopped without finishing. An explicit `cancelSpeech()` is not a
   * failure and does not call this. */
  onFailed?: (reason: SpeechFailureReason) => void;
}

/**
 * The active playback, if any. Module-level because `speechSynthesis` is a
 * platform singleton and pretending otherwise would let two callers each think
 * they own the queue.
 */
let active: { settle: (fn?: () => void) => void } | null = null;

/**
 * Speaks an ordered list of turns, once.
 *
 * MUST BE CALLED FROM A USER GESTURE. Every utterance is queued synchronously
 * inside this call, which is what keeps the whole sequence inside the gesture
 * iOS Safari requires. Do not call this from an effect, a timeout, or another
 * utterance's `onend`.
 *
 * Returns false when there is nothing to play or no engine to play it — the
 * caller renders an unsupported state from that rather than waiting for a
 * callback that will never arrive.
 */
export function speakTurns(turns: CelpipSpeechTurn[], options: SpeakTurnsOptions = {}): boolean {
  const engine = synth();
  if (!engine) {
    options.onFailed?.("unsupported");
    return false;
  }
  const spoken = turns.filter((t) => t.text.trim() !== "");
  if (spoken.length === 0) return false;

  // Always cancel first. Anything this app queued earlier — including a
  // previous playback whose settle handler is still installed — is cleared.
  active?.settle();
  engine.cancel();

  let settled = false;
  const onVisibility = () => {
    if (typeof document === "undefined" || document.visibilityState !== "hidden") return;
    // Safari can wedge its synthesizer when backgrounded mid-utterance until
    // the page is reloaded, so the honest move is to stop and say so rather
    // than to leave the learner believing she heard the whole thing.
    engine.cancel();
    settle(() => options.onFailed?.("interrupted"));
  };
  function settle(fn?: () => void) {
    if (settled) return;
    settled = true;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibility);
    }
    if (active === handle) active = null;
    fn?.();
  }
  const handle = { settle };
  active = handle;
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibility);
  }

  const plan = planVoices(
    spoken.map((t) => t.speaker),
    options.voices ?? [],
  );

  spoken.forEach((turn, i) => {
    const utterance = new SpeechSynthesisUtterance(turn.text);
    utterance.lang = LANG;
    utterance.rate = RATE;
    const assigned = plan.get(turn.speaker);
    // An absent voice is a fall-through to the browser default, never a crash
    // and never a reason not to play.
    if (assigned?.voice) utterance.voice = assigned.voice;
    if (assigned) utterance.pitch = assigned.pitch;
    if (i === 0) utterance.onstart = () => options.onStarted?.();
    if (i === spoken.length - 1) utterance.onend = () => settle(options.onCompleted);
    utterance.onerror = (event) => {
      // A deliberate cancel raises an error on every queued utterance. That is
      // this module doing its job, not a failure to report to the learner.
      if (event.error === "canceled" || event.error === "interrupted") return;
      settle(() => options.onFailed?.("engine"));
    };
    engine.speak(utterance);
  });

  return true;
}

/**
 * Stops playback deliberately. Neither `onCompleted` nor `onFailed` fires — the
 * caller already knows, because the caller asked.
 *
 * Call it on unmount and whenever an attempt is abandoned. Leaving the platform
 * singleton speaking affects every other page in the tab.
 */
export function cancelSpeech(): void {
  const engine = synth();
  active?.settle();
  engine?.cancel();
}
