"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, X, RotateCcw, ChevronRight, MessagesSquare } from "lucide-react";
import type { GrammarQuestion } from "@/lib/content/grammar";
import { useProgress } from "@/lib/progress";

export function GrammarQuiz({
  questions,
  accent = "var(--plum)",
}: {
  questions: GrammarQuestion[];
  accent?: string;
}) {
  const { recordAttempt, addSkillXp } = useProgress();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[i];
  const isLast = i === questions.length - 1;
  const answered = picked !== null;

  const [before, after] = useMemo(() => {
    const parts = q.prompt.split("___");
    return [parts[0], parts[1] ?? ""];
  }, [q.prompt]);

  function pick(idx: number) {
    if (answered) return;
    setPicked(idx);
    const isRight = idx === q.answer;
    if (isRight) setCorrect((c) => c + 1);
    // schedule spaced repetition + track stats for weak spots / mistake notebook
    recordAttempt(q.id, isRight, {
      topic: q.topic,
      level: q.level,
      chosen: idx,
    });
    addSkillXp("grammar", isRight ? 10 : 2);
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setI((v) => v + 1);
    setPicked(null);
  }

  function restart() {
    setI(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="font-display text-5xl font-semibold" style={{ color: accent }}>
          {pct}%
        </p>
        <p className="mt-2 text-lg font-semibold">
          {correct} / {questions.length} correct
        </p>
        <p className="mt-1 text-sm text-muted">
          {pct >= 80
            ? "Great control of grammar!"
            : pct >= 50
              ? "Solid — review the ones you missed."
              : "Keep at it — repetition is the secret."}
        </p>
        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper"
          style={{ background: accent }}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(i / questions.length) * 100}%`, background: accent }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft">
          {q.topic}
        </span>
        <span className="text-xs text-muted">
          {i + 1} / {questions.length}
        </span>
      </div>

      <p className="mt-4 font-display text-xl font-semibold leading-relaxed">
        {before}
        <span
          className="mx-1 rounded-md px-2 py-0.5"
          style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
        >
          {answered ? q.options[q.answer] : "____"}
        </span>
        {after}
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, idx) => {
          const isAnswer = idx === q.answer;
          const isPicked = idx === picked;
          let cls = "border-line-strong hover:bg-paper-deep";
          if (answered && isAnswer)
            cls = "border-teal bg-[color-mix(in_srgb,var(--teal)_10%,transparent)]";
          else if (answered && isPicked && !isAnswer)
            cls = "border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]";
          else if (answered) cls = "border-line opacity-60";
          return (
            <button
              key={idx}
              onClick={() => pick(idx)}
              disabled={answered}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${cls}`}
            >
              {opt}
              {answered && isAnswer && (
                <Check className="h-4 w-4 text-teal" strokeWidth={2.5} />
              )}
              {answered && isPicked && !isAnswer && (
                <X className="h-4 w-4 text-vermilion" strokeWidth={2.5} />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 rounded-xl bg-paper-deep/60 px-4 py-3 text-sm text-ink-soft">
          <p>{q.explain}</p>
          <Link
            href={`/tutor?q=${encodeURIComponent(
              `I'm practicing English grammar (${q.topic}). In "${before}${q.options[q.answer]}${after}", why is "${q.options[q.answer]}" correct${
                picked !== null && picked !== q.answer
                  ? ` and not "${q.options[picked]}"`
                  : ""
              }? Explain simply with one more example.`,
            )}`}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
            style={{ color: accent }}
          >
            <MessagesSquare className="h-3.5 w-3.5" strokeWidth={2} /> Ask the tutor why
          </Link>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={!answered}
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          style={{ background: "var(--ink)" }}
        >
          {isLast ? "See results" : "Next"}
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
