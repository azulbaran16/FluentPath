"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CelpipWritingTask } from "@/lib/celpip";
import { useCelpipProgress } from "@/lib/celpip-progress";

type Phase = "compose" | "results";
type Mode = "timed" | "practice" | null;
type WordState = "under" | "in-range" | "over";

export function WritingSimulator({ task }: { task: CelpipWritingTask }) {
  const { addAttempt } = useCelpipProgress();
  const [phase, setPhase] = useState<Phase>("compose");
  const [mode, setMode] = useState<Mode>(null);
  const [text, setText] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const { min, max } = task.wordRange;
  const words = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const wordState: WordState =
    words < min ? "under" : words > max ? "over" : "in-range";

  function start(selected: "timed" | "practice") {
    setMode(selected);
    setStartedAt(Date.now());
  }

  function submit() {
    const durationSeconds = startedAt
      ? Math.round((Date.now() - startedAt) / 1000)
      : 0;
    addAttempt(task.id, {
      taskId: task.id,
      taskType: task.taskType,
      date: new Date().toISOString(),
      durationSeconds,
      wordCount: words,
      text,
      checkedRubric: {},
      outOfTime: false,
    });
    setPhase("results");
  }

  function retry() {
    setText("");
    setMode(null);
    setStartedAt(null);
    setPhase("compose");
  }

  if (phase === "results") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold">Attempt complete</h1>
        <p className="mt-2 text-ink-soft">{task.title}</p>

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

        {/* Expansion seam: RubricChecklist ("Self-check against the descriptors") goes here — plan 04 */}

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
      {/* Expansion seam: Timer (countdown, pausable in practice mode) goes here — plan 04 */}

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
        placeholder="Write your answer here…"
        rows={14}
        className="mt-4 w-full resize-y rounded-xl border border-line-strong bg-paper p-3 text-base leading-relaxed outline-none transition-colors focus:border-sky"
      />

      {/* Expansion seam: autosave-interval (saveDraft every few seconds) goes here — plan 04 */}

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
        <button
          onClick={submit}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-paper transition-colors"
          style={{ background: "var(--sky)" }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
