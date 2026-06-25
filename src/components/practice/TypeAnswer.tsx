"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, X, RotateCcw, ChevronRight, MessagesSquare, CornerDownLeft } from "lucide-react";
import type { GrammarQuestion } from "@/lib/content/grammar";
import { useProgress } from "@/lib/progress";
import { XpFloat } from "../motion/XpFloat";

const norm = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");

export function TypeAnswer({
  questions,
  accent = "var(--plum)",
}: {
  questions: GrammarQuestion[];
  accent?: string;
}) {
  const { recordAttempt, addSkillXp } = useProgress();
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[i];
  const isLast = i === questions.length - 1;
  const answer = q.options[q.answer];

  const [before, after] = useMemo(() => {
    const parts = q.prompt.split("___");
    return [parts[0], parts[1] ?? ""];
  }, [q.prompt]);

  function check() {
    if (checked !== null || !value.trim()) return;
    const ok = norm(value) === norm(answer);
    setChecked(ok);
    if (ok) setCorrect((c) => c + 1);
    recordAttempt(q.id, ok, { topic: q.topic, level: q.level });
    addSkillXp("grammar", ok ? 10 : 2);
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setI((v) => v + 1);
    setValue("");
    setChecked(null);
  }

  function restart() {
    setI(0);
    setValue("");
    setChecked(null);
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
          Typing the answer is harder than picking it — great training for real
          conversations.
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

  const wrong = checked === false;

  return (
    <div className="relative rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      {checked === true && (
        <XpFloat key={i} amount={10} className="absolute right-5 top-4 z-10" />
      )}
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
          {checked !== null ? answer : "____"}
        </span>
        {after}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (checked === null) check();
          else next();
        }}
        className="mt-5"
      >
        <div className="relative">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={checked !== null}
            placeholder="Type the missing word…"
            className={`w-full rounded-xl border-2 bg-card px-4 py-3 pr-11 text-sm outline-none transition-colors disabled:opacity-100 ${
              checked === true
                ? "border-teal"
                : wrong
                  ? "shake border-vermilion"
                  : "border-line-strong focus:border-[color-mix(in_srgb,var(--plum)_60%,transparent)]"
            }`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {checked === true ? (
              <Check className="h-5 w-5 text-teal" strokeWidth={2.5} />
            ) : wrong ? (
              <X className="h-5 w-5 text-vermilion" strokeWidth={2.5} />
            ) : (
              <CornerDownLeft className="h-4 w-4" strokeWidth={1.75} />
            )}
          </span>
        </div>

        {wrong && (
          <p className="mt-3 text-sm text-ink-soft">
            Not quite — the answer is{" "}
            <span className="font-semibold text-teal">{answer}</span>.
          </p>
        )}

        {checked !== null && (
          <div className="mt-4 rounded-xl bg-paper-deep/60 px-4 py-3 text-sm text-ink-soft">
            <p>{q.explain}</p>
            <Link
              href={`/tutor?q=${encodeURIComponent(
                `I'm practicing English grammar (${q.topic}). In "${before}${answer}${after}", why is "${answer}" the right word here? Explain simply with one more example.`,
              )}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
              style={{ color: accent }}
            >
              <MessagesSquare className="h-3.5 w-3.5" strokeWidth={2} /> Ask the tutor why
            </Link>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {checked === null ? (
            <button
              type="submit"
              disabled={!value.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: "var(--ink)" }}
            >
              <Check className="h-4 w-4" strokeWidth={2} /> Check
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
              style={{ background: accent }}
            >
              {isLast ? "See results" : "Next"}
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
