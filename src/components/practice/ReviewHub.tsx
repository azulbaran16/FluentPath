"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, NotebookPen, Zap } from "lucide-react";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { useProgress } from "@/lib/progress";
import { GrammarQuiz } from "./GrammarQuiz";
import { ReviewView } from "./ReviewView";
import { MistakesView } from "./MistakesView";
import { Rumi } from "../mascot/Rumi";

type Tab = "due" | "mistakes" | "weak";

export function ReviewHub() {
  const initial = (useSearchParams().get("tab") as Tab) || "due";
  const { ready, dueReviewIds, openMistakeIds, weakTopics } = useProgress();
  const [tab, setTab] = useState<Tab>(
    ["due", "mistakes", "weak"].includes(initial) ? initial : "due",
  );

  const dueSet = ready ? new Set(dueReviewIds()) : new Set<string>();
  const dueCount = GRAMMAR_QUESTIONS.filter((q) => dueSet.has(q.id)).length;
  const mistakeCount = ready ? openMistakeIds().length : 0;
  const weak = ready ? weakTopics() : [];

  const tabs: { key: Tab; label: string; icon: typeof RefreshCw; count: number; color: string }[] = [
    { key: "due", label: "Due today", icon: RefreshCw, count: dueCount, color: "var(--teal)" },
    { key: "mistakes", label: "Your mistakes", icon: NotebookPen, count: mistakeCount, color: "var(--vermilion)" },
    { key: "weak", label: "Weak spots", icon: Zap, count: weak.length, color: "var(--gold)" },
  ];

  return (
    <div>
      <div role="tablist" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-transparent bg-ink text-paper"
                  : "border-line bg-card text-ink-soft hover:bg-paper-deep"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {t.label}
              {t.count > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs ${
                    active ? "bg-paper/25 text-paper" : "text-paper"
                  }`}
                  style={active ? undefined : { background: t.color }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "due" && <ReviewView />}
      {tab === "mistakes" && <MistakesView />}
      {tab === "weak" && <WeakSpots />}
    </div>
  );
}

function WeakSpots() {
  const { ready, weakTopics } = useProgress();
  if (!ready) return <p className="text-muted">Loading…</p>;

  const weak = weakTopics();
  if (weak.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <Rumi mood="happy" size={92} className="mx-auto" />
        <h2 className="mt-2 font-display text-xl font-semibold">No weak spots yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          As you practice, the topics you struggle with show up here so you can
          drill them directly.
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

  const weakSet = new Set(weak.map((w) => w.topic));
  const questions = GRAMMAR_QUESTIONS.filter((q) => weakSet.has(q.topic));

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Topics you miss most — let&apos;s turn them around.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {weak.slice(0, 5).map((w) => (
          <span
            key={w.topic}
            className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-soft"
          >
            {w.topic} · {w.accuracy}%
          </span>
        ))}
      </div>
      <GrammarQuiz questions={questions} accent="var(--gold)" />
    </div>
  );
}
