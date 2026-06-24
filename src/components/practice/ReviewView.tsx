"use client";

import Link from "next/link";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { useProgress } from "@/lib/progress";
import { GrammarQuiz } from "./GrammarQuiz";
import { Rumi } from "../mascot/Rumi";

export function ReviewView() {
  const { ready, dueReviewIds, seenCount } = useProgress();

  if (!ready) {
    return <p className="text-muted">Loading your review queue…</p>;
  }

  const dueIds = new Set(dueReviewIds());
  const dueQuestions = GRAMMAR_QUESTIONS.filter((q) => dueIds.has(q.id));

  if (dueQuestions.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <Rumi mood={seenCount === 0 ? "idle" : "sleeping"} size={92} className="mx-auto" />
        <h2 className="mt-2 font-display text-xl font-semibold">
          {seenCount === 0 ? "Nothing to review yet" : "All caught up!"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {seenCount === 0
            ? "Practice some grammar first — the questions you answer will come back here for review, spaced out over time so they stick."
            : "You've reviewed everything that's due. Come back tomorrow — spaced repetition will resurface items right before you'd forget them."}
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

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        {dueQuestions.length} item{dueQuestions.length > 1 ? "s" : ""} due for
        review.
      </p>
      <GrammarQuiz questions={dueQuestions} accent="var(--teal)" />
    </div>
  );
}
