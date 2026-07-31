"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CELPIP_SPEAKING_RUBRIC, type CelpipSpeakingPrompt } from "@/lib/celpip";
import { formatDuration, useCelpipProgress } from "@/lib/celpip-progress";
import { CELPIP_MAX_TEXT } from "@/lib/progress-schema";
import { RubricChecklist } from "./RubricChecklist";
import { Timer } from "./Timer";

// CELPIP Speaking rehearsal: brief -> silent prep -> recorded response -> review.
//
// TWO THINGS ABOUT THIS COMPONENT ARE LOAD-BEARING.
//
// 1. THE AUDIO NEVER LEAVES. The recording lives in a Blob and an object URL
//    held in refs for this session only, revoked on unmount. It is never written
//    to localStorage, never to IndexedDB, and never into `celpipProgress`. The
//    stored attempt carries four facts about it — recorded, recordingSeconds,
//    mimeType, sizeBytes — and none of its bytes. The reason is not tidiness:
//    the CELPIP payload is capped at 2 MiB on the wire and a 413 is classified
//    as a permanent drop by the retry queue, so one synced recording would
//    silently discard the learner's entire CELPIP history, essays included.
//
// 2. RECORDING STARTS BY ITSELF. The exam gives a silent preparation window and
//    then begins recording whether or not you are ready; being caught mid-thought
//    is part of what it measures. So there is no Record button — the prep timer's
//    expiry starts the capture. What there IS is an explicit press to open the
//    microphone before prep begins, so a permission dialog can never eat the
//    first seconds of her response.
//
// There is no scoring anywhere in here (D-02), and nothing is gated on a quality
// signal: an attempt with no recording at all and nothing ticked is a valid
// result and persists like any other.

type Phase = "brief" | "prep" | "respond" | "review";
type Mode = "timed" | "practice" | null;

/** How long before prep expires the "it is about to start" warning escalates. */
const PREP_WARNING_LEAD_SECONDS = 8;

/**
 * Container preference order, probed rather than assumed.
 *
 * Safari 14.1 to 18.3 supported MP4 only and returned false for WebM, so a
 * hard-coded container throws outright on an iPhone a version or two behind.
 * A miss on all three is not a failure either: MediaRecorder is then constructed
 * with no options and the container it chose is read back off the instance.
 */
const PREFERRED_CONTAINERS = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
] as const;

function pickContainer(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return PREFERRED_CONTAINERS.find((type) => MediaRecorder.isTypeSupported(type));
}

/** The rejection paths are different problems with different fixes, so they get
 * different sentences — the precedent PronunciationLab set for `not-allowed`. */
function describeMicFailure(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Your browser blocked the microphone. Allow it for this site in the address bar, then start the attempt again. You can still run the timers and the self-check without it.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No microphone was found. Plug one in or check your system sound settings, then start again. You can still run the timers and the self-check without it.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Another app is holding the microphone. Close it — a call or a meeting tab is the usual culprit — then start again.";
  }
  return "The microphone could not be started. You can still run the timers and the self-check without it.";
}

interface RecordingMeta {
  seconds: number;
  mimeType: string;
  sizeBytes: number;
}

export function SpeakingRecorder({ prompt }: { prompt: CelpipSpeakingPrompt }) {
  const { addSpeakingAttempt } = useCelpipProgress();

  const [phase, setPhase] = useState<Phase>("brief");
  const [mode, setMode] = useState<Mode>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [supported, setSupported] = useState(true);
  const [micFailure, setMicFailure] = useState<string | null>(null);
  /** Whether a live audio track was actually acquired. Kept in state rather
   * than read off `streamRef` at render time — a ref does not re-render, and
   * the banner below has to change when it changes. */
  const [micReady, setMicReady] = useState(false);
  const [recorderFailure, setRecorderFailure] = useState<string | null>(null);
  const [prepEndingSoon, setPrepEndingSoon] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<RecordingMeta | null>(null);
  const [checkedRubric, setCheckedRubric] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [outOfTime, setOutOfTime] = useState(false);
  const [submittedDuration, setSubmittedDuration] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const urlRef = useRef<string | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const finalizedRef = useRef(false);

  // Feature-detect on the client after mount so SSR renders the optimistic
  // shell and hydration agrees with it.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        typeof MediaRecorder !== "undefined" &&
        typeof navigator !== "undefined" &&
        typeof navigator.mediaDevices?.getUserMedia === "function",
    );
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Every track stopped, every time. A live track leaves the operating
   * system's recording indicator lit, which is a real privacy defect rather
   * than a cosmetic one — the learner has no way to tell the app is done. */
  const releaseMicrophone = useCallback(() => {
    const stream = streamRef.current;
    if (stream) for (const track of stream.getTracks()) track.stop();
    streamRef.current = null;
    setMicReady(false);
  }, []);

  const releasePlayback = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    chunksRef.current = [];
    setPlaybackUrl(null);
  }, []);

  // The one guaranteed cleanup. Leaving the page mid-attempt must not leave a
  // track open or an object URL pinning the recording in memory.
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      const stream = streamRef.current;
      if (stream) for (const track of stream.getTracks()) track.stop();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  // Escalate the prep warning a few seconds out. Deliberately not a second
  // countdown — Timer already owns the digits; this only owns the sentence.
  useEffect(() => {
    if (phase !== "prep") return;
    const lead = Math.max(0, prompt.prepSeconds - PREP_WARNING_LEAD_SECONDS);
    const id = setTimeout(() => setPrepEndingSoon(true), lead * 1000);
    return () => clearTimeout(id);
  }, [phase, prompt.prepSeconds]);

  /**
   * Opens the microphone from an explicit press, then moves into prep.
   *
   * getUserMedia is called HERE and nowhere else — never from an effect, and
   * never at the moment recording starts, because a permission dialog appearing
   * then would eat the opening seconds of her response. The stream stays open
   * through the prep window so capture can begin the instant it expires; the UI
   * says so in words, because the microphone indicator is lit and pretending
   * otherwise would be worse than explaining it.
   */
  async function start(selected: "timed" | "practice") {
    setMicFailure(null);
    setRecorderFailure(null);
    if (supported) {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicReady(true);
      } catch (err) {
        streamRef.current = null;
        setMicReady(false);
        setMicFailure(describeMicFailure(err));
      }
    }
    setMode(selected);
    setStartedAt(Date.now());
    setPhase("prep");
  }

  /** Fired by the prep countdown reaching zero, not by a button. */
  function beginRecording() {
    setPhase("respond");
    const stream = streamRef.current;
    // No stream means unsupported or refused. The response window still runs —
    // the prompt, the timers and the self-check are useful without capture, and
    // white-screening here would cost the learner the whole rehearsal.
    if (!stream) return;
    try {
      const container = pickContainer();
      const recorder = new MediaRecorder(
        stream,
        container ? { mimeType: container } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        // Read the container back off the instance rather than trusting the
        // probe: a browser that ignored the hint still tells the truth here.
        const type = recorder.mimeType || container || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const startedMs = recordingStartedAtRef.current ?? Date.now();
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setPlaybackUrl(url);
        setRecording({
          seconds: Math.max(0, Math.round((Date.now() - startedMs) / 1000)),
          mimeType: blob.type || type,
          sizeBytes: blob.size,
        });
        // The instant recording ends — not on unmount, not on navigation.
        releaseMicrophone();
      };
      recorder.onerror = () => {
        setRecorderFailure(
          "The recording stopped unexpectedly. Your timers and self-check still work; try the attempt again for audio.",
        );
        releaseMicrophone();
      };
      recorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      recorder.start();
    } catch {
      setRecorderFailure(
        "This browser refused to start a recording. Everything else in the attempt still works.",
      );
      releaseMicrophone();
    }
  }

  /** `ranOut` is true when the response window ended the recording, false when
   * she stopped it herself. For Speaking, running the window out is the normal
   * path, so this is a fact about the attempt rather than a warning. */
  function finishResponse(ranOut: boolean) {
    setOutOfTime(ranOut);
    setSubmittedDuration(startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // onstop builds the blob and releases the microphone
    } else {
      releaseMicrophone();
    }
    finalizedRef.current = false;
    setPhase("review");
  }

  // Recorded once, carrying whatever she last ticked and wrote. Called from
  // every exit path out of the review view, and idempotent across all of them.
  function finalizeAttempt() {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    addSpeakingAttempt(prompt.id, {
      promptId: prompt.id,
      date: new Date().toISOString(),
      shape: prompt.shape,
      durationSeconds: submittedDuration,
      recorded: recording !== null,
      recordingSeconds: recording?.seconds ?? 0,
      mimeType: recording?.mimeType ?? "",
      sizeBytes: recording?.sizeBytes ?? 0,
      checkedRubric,
      outOfTime,
      note: note.trim(),
    });
  }

  function retry() {
    finalizeAttempt();
    releaseMicrophone();
    releasePlayback();
    setRecording(null);
    setMode(null);
    setStartedAt(null);
    setCheckedRubric({});
    setNote("");
    setOutOfTime(false);
    setSubmittedDuration(0);
    setMicFailure(null);
    setRecorderFailure(null);
    setPrepEndingSoon(false);
    recordingStartedAtRef.current = null;
    recorderRef.current = null;
    finalizedRef.current = false;
    setPhase("brief");
  }

  /* ---------------------------------------------------------------- *
   * Review
   * ---------------------------------------------------------------- */

  if (phase === "review") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Attempt complete</h1>
        <p className="mt-2 text-ink-soft">{prompt.title}</p>

        <p className="mt-3 text-xs text-muted">
          {formatDuration(submittedDuration)} total ·{" "}
          {recording
            ? `${recording.seconds}s recorded · ${Math.round(
                recording.sizeBytes / 1024,
              )} KB · ${recording.mimeType}`
            : "no recording captured"}
          {outOfTime && (
            <span className="ml-1 font-semibold" style={{ color: "var(--vermilion)" }}>
              · the window ran out
            </span>
          )}
        </p>

        <div className="mt-6 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold">Listen back</h2>
          {playbackUrl ? (
            <>
              <audio src={playbackUrl} controls className="mt-3 w-full" />
              <p className="mt-2 text-xs text-muted">
                This recording lives in this tab only. It is never uploaded and it is gone
                when you leave the page — listen now, then judge yourself against the
                descriptors below.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              No audio was captured for this attempt. The self-check below is still worth
              filling in from memory.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold">
            Self-check against the descriptors
          </h2>
          <p className="mt-1 text-xs text-muted">
            Nothing here is scored, and a partly-ticked list is a perfectly valid result.
          </p>
          <div className="mt-4">
            <RubricChecklist
              rubric={CELPIP_SPEAKING_RUBRIC}
              checked={checkedRubric}
              onToggle={(itemId, value) =>
                setCheckedRubric((current) => ({ ...current, [itemId]: value }))
              }
            />
          </div>
        </div>

        <div className="mt-6 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold">One note to your next self</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={CELPIP_MAX_TEXT}
            rows={3}
            placeholder="What would you do differently next time?"
            className="mt-3 w-full resize-y rounded-xl border border-line-strong bg-paper p-3 text-sm leading-relaxed outline-none transition-colors focus:border-sky"
          />
          <p className="mt-1 text-xs text-muted">
            Saved with the attempt — this is the part that follows you to another device.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={retry}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Try this prompt again
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
   * Brief
   * ---------------------------------------------------------------- */

  if (phase === "brief" || !mode) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Speaking · Task {prompt.taskNumber}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{prompt.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{prompt.scenario}</p>
        {prompt.sceneDescription && (
          <p className="mt-3 text-base leading-relaxed text-ink-soft">
            {prompt.sceneDescription}
          </p>
        )}

        <div
          className="mt-5 rounded-xl border p-4"
          style={{
            borderColor: "var(--sky)",
            background: "color-mix(in srgb, var(--sky) 10%, transparent)",
          }}
        >
          <h2 className="font-display text-base font-semibold">How this runs</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            <li>
              {prompt.prepSeconds} seconds to think. Nothing is recorded — read, plan, and
              get one opening sentence ready.
            </li>
            <li>
              <strong>Recording then starts on its own</strong> and runs for{" "}
              {prompt.responseSeconds} seconds. There is no Record button, because the exam
              does not have one either.
            </li>
            <li>You listen back and check yourself against the descriptors.</li>
          </ol>
          {supported && (
            <p className="mt-3 text-xs text-muted">
              Pressing start asks for the microphone now rather than later, so a permission
              pop-up cannot swallow the first seconds of your answer. Your microphone
              indicator will be on through the thinking time — nothing is captured until the
              countdown reaches zero.
            </p>
          )}
        </div>

        {!supported && (
          <p
            className="mt-4 rounded-xl border p-4 text-sm"
            style={{
              borderColor: "var(--vermilion)",
              background: "color-mix(in srgb, var(--vermilion) 10%, transparent)",
            }}
            role="alert"
          >
            This browser cannot record audio, so you will not be able to hear yourself back.
            The prompt, both timers and the self-check all still work — speak out loud
            anyway, and use a different browser when you want the recording.
          </p>
        )}

        {micFailure && (
          <p
            className="mt-4 rounded-xl border p-4 text-sm"
            style={{
              borderColor: "var(--vermilion)",
              background: "color-mix(in srgb, var(--vermilion) 10%, transparent)",
            }}
            role="alert"
          >
            {micFailure}
          </p>
        )}

        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          {prompt.strategyTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => void start("timed")}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Start Timed Attempt
          </button>
          <button
            onClick={() => void start("practice")}
            className="rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Start Practice
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Practice lets you pause the thinking time. The response window never pauses —
          neither does the exam&apos;s.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Prep and respond
   * ---------------------------------------------------------------- */

  const isPrep = phase === "prep";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="sticky top-4 z-10 mb-4 flex items-center justify-between gap-4 rounded-xl border border-line bg-card/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
        {/* Keyed by phase so the countdown is a fresh instance each time rather
            than relying on the two durations happening to differ. */}
        {isPrep ? (
          <Timer
            key="prep"
            totalSeconds={prompt.prepSeconds}
            running
            mode={mode}
            onExpire={beginRecording}
          />
        ) : (
          <Timer
            key="respond"
            totalSeconds={prompt.responseSeconds}
            running
            // Always timed, even in practice: pausing a countdown while the
            // microphone keeps capturing would desynchronise the two, and the
            // exam gives no pause here either.
            mode="timed"
            onExpire={() => finishResponse(true)}
          />
        )}
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {isPrep ? "Thinking time" : "Recording"}
        </span>
      </div>

      {isPrep ? (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            borderColor: prepEndingSoon ? "var(--vermilion)" : "var(--sky)",
            background: prepEndingSoon
              ? "color-mix(in srgb, var(--vermilion) 12%, transparent)"
              : "color-mix(in srgb, var(--sky) 10%, transparent)",
          }}
          role="status"
          aria-live="polite"
        >
          <h2
            className="font-display text-lg font-semibold"
            style={prepEndingSoon ? { color: "var(--vermilion)" } : undefined}
          >
            {prepEndingSoon ? "Recording is about to start" : "Nothing is being recorded yet"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {prepEndingSoon
              ? "Take a breath and have your first sentence ready — it begins by itself, with no further warning."
              : "Read the prompt, decide on two or three points, and settle on the sentence you will open with. Recording starts by itself when this countdown reaches zero."}
          </p>
        </div>
      ) : (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            borderColor: "var(--vermilion)",
            background: "color-mix(in srgb, var(--vermilion) 10%, transparent)",
          }}
          role="status"
          aria-live="polite"
        >
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--vermilion)" }}>
            {micReady ? "Recording — speak now" : "Speak now"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {micReady
              ? "Keep going until the countdown ends. Stopping early is allowed, but the exam would not."
              : "No microphone is available, so nothing is being captured — say your answer out loud anyway and time yourself against the countdown."}
          </p>
        </div>
      )}

      {recorderFailure && (
        <p
          className="mb-4 rounded-xl border border-line-strong p-4 text-sm"
          role="alert"
        >
          {recorderFailure}
        </p>
      )}

      <h1 className="font-display text-2xl font-semibold">{prompt.title}</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">{prompt.scenario}</p>
      {prompt.sceneDescription && (
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{prompt.sceneDescription}</p>
      )}

      {!isPrep && (
        <div className="mt-6">
          <button
            onClick={() => finishResponse(false)}
            className="rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            I&apos;m finished — stop and listen back
          </button>
        </div>
      )}
    </div>
  );
}
