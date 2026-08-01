"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { resolveReviewItem, type RecallItem } from "@/lib/review-items";
import type { GrammarQuestion } from "@/lib/content/grammar";
import { GrammarQuiz } from "./GrammarQuiz";
import { RecallDeck } from "./RecallDeck";
import { Rumi } from "../mascot/Rumi";

// This screen used to filter GRAMMAR_QUESTIONS by the due set, which meant the
// review queue could only ever render one bank's items. A scenario phrase was
// stored under its id, merged across devices and scheduled correctly — and was
// invisible here, which is D-05: CONT-02 satisfied on paper and broken on
// screen. Every due id now goes through resolveReviewItem, the one function
// that knows all the banks; an id that resolves to nothing is skipped, exactly
// as the old bank filter did implicitly.

export function ReviewView() {
  const { ready, dueReviewIds, seenCount } = useProgress();

  if (!ready) {
    return <p className="text-muted">Loading your review queue…</p>;
  }

  const dueQuestions: GrammarQuestion[] = [];
  const dueRecall: RecallItem[] = [];
  for (const id of dueReviewIds()) {
    const resolved = resolveReviewItem(id);
    if (!resolved) continue;
    if (resolved.kind === "grammar") dueQuestions.push(resolved.question);
    else dueRecall.push(resolved.item);
  }
  const dueTotal = dueQuestions.length + dueRecall.length;

  if (dueTotal === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <Rumi mood={seenCount === 0 ? "idle" : "sleeping"} size={92} className="mx-auto" />
        <h2 className="mt-2 font-display text-xl font-semibold">
          {seenCount === 0 ? "Nothing to review yet" : "All caught up!"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {seenCount === 0
            ? "Practice some grammar, or lock in a scenario's phrases and vocabulary — everything you rate comes back here for review, spaced out over time so it sticks."
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
        {dueTotal} item{dueTotal > 1 ? "s" : ""} due for review.
      </p>
      {dueRecall.length > 0 && (
        <RecallDeck
          items={dueRecall}
          accent="var(--gold)"
          title="Phrases & vocabulary"
        />
      )}
      {dueQuestions.length > 0 && (
        <div className={dueRecall.length > 0 ? "mt-6" : undefined}>
          <GrammarQuiz questions={dueQuestions} accent="var(--teal)" />
        </div>
      )}
    </div>
  );
}
