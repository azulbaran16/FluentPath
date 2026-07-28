"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CELPIP_RUBRIC, type CelpipWritingTask } from "@/lib/celpip";
import { formatDuration, useCelpipProgress } from "@/lib/celpip-progress";
import { RubricChecklist } from "./RubricChecklist";
import { Timer } from "./Timer";

type Phase = "compose" | "results";
type Mode = "timed" | "practice" | null;
type WordState = "under" | "in-range" | "over";

const AUTOSAVE_DEBOUNCE_MS = 3000;

export function WritingSimulator({ task }: { task: CelpipWritingTask }) {
  const { addAttempt, saveDraft, clearDraft, draftFor, ready } = useCelpipProgress();
  const [phase, setPhase] = useState<Phase>("compose");
  const [mode, setMode] = useState<Mode>(null);
  const [text, setText] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [locked, setLocked] = useState(false);
  const [autosaveWarning, setAutosaveWarning] = useState(false);
  const [checkedRubric, setCheckedRubric] = useState<Record<string, boolean>>({});
  const hydratedRef = useRef(false);
  // Held in state, not a ref: the results view renders it in the metrics strip.
  const [submittedDuration, setSubmittedDuration] = useState(0);
  const finalizedRef = useRef(false);

  const { min, max } = task.wordRange;
  const words = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const wordState: WordState =
    words < min ? "under" : words > max ? "over" : "in-range";

  // The countdown runs whenever a mode is active and composing hasn't
  // already expired once — expiry is one-way (never re-arms mid-attempt).
  const timerRunning = mode !== null && phase === "compose" && !expired;

  // Restore a previously autosaved draft once the local store has hydrated
  // from localStorage (client-only; SSR renders the empty default).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready || hydratedRef.current) return;
    hydratedRef.current = true;
    const draft = draftFor(task.id);
    if (draft) setText(draft);
  }, [ready, draftFor, task.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Debounced autosave while composing: a few seconds after the learner
  // stops typing, persist the draft. A setItem failure surfaces a visible
  // warning instead of being silently dropped — the in-memory text is
  // never touched either way.
  useEffect(() => {
    if (!mode || phase !== "compose") return;
    const id = setTimeout(() => {
      const ok = saveDraft(task.id, text);
      setAutosaveWarning(!ok);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [mode, phase, saveDraft, task.id, text]);

  function start(selected: "timed" | "practice") {
    setMode(selected);
    setStartedAt(Date.now());
  }

  function handleExpire() {
    setExpired(true);
    setLocked(true);
  }

  function continueUntimed() {
    setLocked(false);
  }

  function submit() {
    setSubmittedDuration(
      startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    );
    finalizedRef.current = false;
    setPhase("results");
  }

  // The attempt is recorded once, holding the local rubric self-check state
  // so a partial (or empty) check-in is still a valid, persisted result.
  // Called on every results-view exit path (Retry / Back to tasks) so
  // whatever the learner last checked is what lands in history.
  //
  // The draft is dropped in the same step: the text now lives in the attempt
  // record, so keeping it would pre-fill the next timed run with the previous
  // answer instead of starting under real exam conditions.
  function finalizeAttempt() {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    clearDraft(task.id);
    addAttempt(task.id, {
      taskId: task.id,
      taskType: task.taskType,
      date: new Date().toISOString(),
      durationSeconds: submittedDuration,
      wordCount: words,
      text,
      checkedRubric,
      outOfTime: expired,
    });
  }

  function retry() {
    finalizeAttempt();
    setText("");
    setMode(null);
    setStartedAt(null);
    setExpired(false);
    setLocked(false);
    setCheckedRubric({});
    setSubmittedDuration(0);
    setAutosaveWarning(false);
    finalizedRef.current = false;
    setPhase("compose");
  }

  if (phase === "results") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Attempt complete</h1>
        <p className="mt-2 text-ink-soft">{task.title}</p>

        {/* Compact tertiary metrics strip — states the attempt's facts without
            competing with the side-by-side comparison below. */}
        <p className="mt-3 text-xs text-muted">
          {formatDuration(submittedDuration)} used · {words} words ·{" "}
          {min}–{max} target
          {expired && (
            <span className="ml-1 font-semibold" style={{ color: "var(--vermilion)" }}>
              · ran out of time
            </span>
          )}
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold">Your answer</h2>
            <pre className="mt-3 max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl bg-paper-deep/50 p-4 font-sans text-sm leading-relaxed text-ink-soft">
              {text}
            </pre>
          </div>
          <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-semibold">Model answer</h2>
            <pre className="mt-3 max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl bg-paper-deep/50 p-4 font-sans text-sm leading-relaxed text-ink-soft">
              {task.modelAnswer}
            </pre>
          </div>
        </div>

        <div className="mt-6 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-lg font-semibold">
            Self-check against the descriptors
          </h2>
          <div className="mt-4">
            <RubricChecklist
              rubric={CELPIP_RUBRIC[task.taskType]}
              checked={checkedRubric}
              onToggle={(itemId, value) =>
                setCheckedRubric((c) => ({ ...c, [itemId]: value }))
              }
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={retry}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Retry
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

  if (!mode) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">{task.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{task.scenario}</p>

        {task.bullets && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-base text-ink-soft">
            {task.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        )}
        {task.options && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-base text-ink-soft">
            <li>{task.options[0]}</li>
            <li>{task.options[1]}</li>
          </ul>
        )}

        <p className="mt-4 text-xs text-muted">
          {task.timeLimitMinutes} minutes · {min}–{max} words
        </p>

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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="sticky top-4 z-10 mb-4 flex items-center justify-between rounded-xl border border-line bg-card/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <Timer
          totalSeconds={task.timeLimitMinutes * 60}
          running={timerRunning}
          mode={mode}
          onExpire={handleExpire}
        />
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
            The editor is locked, but your text is safe. Submit what you have, or keep
            writing in untimed mode — it&apos;ll be marked as over time.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={submit}
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

      <h1 className="font-display text-2xl font-semibold">{task.title}</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">{task.scenario}</p>

      {task.bullets && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-base text-ink-soft">
          {task.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      {task.options && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-base text-ink-soft">
          <li>{task.options[0]}</li>
          <li>{task.options[1]}</li>
        </ul>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={locked}
        placeholder="Write your answer here…"
        rows={14}
        className={`mt-4 w-full resize-y rounded-xl border border-line-strong bg-paper p-3 text-base leading-relaxed outline-none transition-colors focus:border-sky ${
          locked ? "opacity-70" : ""
        }`}
      />

      {autosaveWarning && (
        <p
          className="mt-2 text-xs font-semibold"
          style={{ color: "var(--vermilion)" }}
          role="alert"
        >
          We couldn&apos;t save your draft just now. Keep writing — we&apos;ll keep
          trying, but copy your text somewhere safe if you&apos;re about to close
          this tab.
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span
          className={
            wordState === "in-range"
              ? "font-semibold text-sky"
              : wordState === "over"
                ? "font-semibold text-vermilion"
                : "text-muted"
          }
        >
          {wordState === "in-range"
            ? `${words} words · in range ✓`
            : `${words} / ${min}–${max} words`}
        </span>
        {!locked && (
          <button
            onClick={submit}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-paper transition-colors"
            style={{ background: "var(--sky)" }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
