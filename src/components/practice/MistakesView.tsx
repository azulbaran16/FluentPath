"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Check, X, Dumbbell } from "lucide-react";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { useProgress } from "@/lib/progress";
import { GrammarQuiz } from "./GrammarQuiz";

export function MistakesView() {
  const { ready, state, openMistakeIds } = useProgress();
  const [practicing, setPracticing] = useState(false);

  if (!ready) return <p className="text-muted">Loading…</p>;

  const ids = new Set(openMistakeIds());
  const mistakes = GRAMMAR_QUESTIONS.filter((q) => ids.has(q.id));

  if (mistakes.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: "color-mix(in srgb, var(--teal) 14%, transparent)", color: "var(--teal)" }}
        >
          <BookmarkCheck className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold">No open mistakes</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          When you miss a grammar question, it lands here so you can master it.
          Get it right again and it clears automatically.
        </p>
        <Link
          href="/skill/grammar"
          className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--plum)" }}
        >
          Practice grammar →
        </Link>
      </div>
    );
  }

  if (practicing) {
    return (
      <div>
        <button
          onClick={() => setPracticing(false)}
          className="mb-3 cursor-pointer text-sm text-muted hover:text-ink"
        >
          ← Back to list
        </button>
        <GrammarQuiz questions={mistakes} accent="var(--vermilion)" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {mistakes.length} question{mistakes.length > 1 ? "s" : ""} to master.
          Get each right again to clear it.
        </p>
        <button
          onClick={() => setPracticing(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--vermilion)" }}
        >
          <Dumbbell className="h-4 w-4" strokeWidth={1.75} /> Practice these
        </button>
      </div>

      <div className="space-y-3">
        {mistakes.map((q) => {
          const before = q.prompt.split("___")[0];
          const after = q.prompt.split("___")[1] ?? "";
          const chosen = state.attempts?.[q.id]?.lastWrongOption;
          return (
            <div
              key={q.id}
              className="rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft">
                {q.topic}
              </span>
              <p className="mt-3 font-display text-lg font-semibold leading-relaxed">
                {before}
                <span className="mx-1 rounded-md bg-paper-deep px-2 py-0.5">____</span>
                {after}
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                {chosen !== undefined && chosen !== q.answer && (
                  <p className="flex items-center gap-2 text-vermilion-deep">
                    <X className="h-4 w-4 shrink-0" strokeWidth={2.5} /> You chose:{" "}
                    <span className="font-semibold">{q.options[chosen]}</span>
                  </p>
                )}
                <p className="flex items-center gap-2 text-teal">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> Correct:{" "}
                  <span className="font-semibold">{q.options[q.answer]}</span>
                </p>
              </div>
              <p className="mt-3 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
                {q.explain}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
