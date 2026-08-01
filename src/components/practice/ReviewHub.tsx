"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, NotebookPen, Zap } from "lucide-react";
import type { GrammarQuestion } from "@/lib/content/grammar";
import {
  resolveReviewItem,
  reviewableIds,
  type RecallItem,
} from "@/lib/review-items";
import { useProgress } from "@/lib/progress";
import { GrammarQuiz } from "./GrammarQuiz";
import { RecallDeck } from "./RecallDeck";
import { ReviewView } from "./ReviewView";
import { MistakesView } from "./MistakesView";
import { Rumi } from "../mascot/Rumi";

// This file had TWO sites resolving through the global grammar bank, two
// hundred lines and one function apart: the "Due today" badge and the
// weak-spots drill. Both go through the shared resolver now. Half-converting
// them would be worse than converting neither — a badge that counts scenario
// items above a drill that cannot produce them promises practice the tab does
// not have.

type Tab = "due" | "mistakes" | "weak";

// Static across the session: the banks are compile-time modules.
const REVIEWABLE_IDS = new Set(reviewableIds());

export function ReviewHub() {
  const initial = (useSearchParams().get("tab") as Tab) || "due";
  const { ready, dueReviewIds, openMistakeIds, weakTopics } = useProgress();
  const [tab, setTab] = useState<Tab>(
    ["due", "mistakes", "weak"].includes(initial) ? initial : "due",
  );

  const dueCount = ready
    ? dueReviewIds().filter((id) => REVIEWABLE_IDS.has(id)).length
    : 0;
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

  // The drill is built by resolving every reviewable id and keeping the ones
  // whose topic is weak — the same resolver the badge above counts through, so
  // the two cannot disagree. A weak topic is a grammar topic OR a scenario
  // title, because that is what recordAttempt stores in `attempts[id].topic`.
  const weakSet = new Set(weak.map((w) => w.topic));
  const questions: GrammarQuestion[] = [];
  const recall: RecallItem[] = [];
  const practisableTopics = new Set<string>();
  for (const id of REVIEWABLE_IDS) {
    const resolved = resolveReviewItem(id);
    if (!resolved) continue;
    const topic =
      resolved.kind === "grammar" ? resolved.question.topic : resolved.item.topic;
    if (!weakSet.has(topic)) continue;
    practisableTopics.add(topic);
    if (resolved.kind === "grammar") questions.push(resolved.question);
    else recall.push(resolved.item);
  }

  // Naming a topic the learner cannot drill and then handing her an empty quiz
  // is the failure this branch exists to prevent: say plainly that nothing is
  // written for it yet.
  const unpractisable = weak.filter((w) => !practisableTopics.has(w.topic));

  const pills = (
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
  );

  const nothingYet = unpractisable.length > 0 && (
    <p className="mt-4 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
      Nothing to drill yet for {unpractisable.map((w) => w.topic).join(", ")} —
      that practice isn&apos;t written yet.
    </p>
  );

  if (questions.length === 0 && recall.length === 0) {
    return (
      <div>
        <p className="mb-3 text-sm text-muted">
          Topics you miss most — let&apos;s turn them around.
        </p>
        {pills}
        <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <Rumi mood="idle" size={92} className="mx-auto" />
          <h2 className="mt-2 font-display text-xl font-semibold">
            Nothing to drill for these yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            We haven&apos;t written practice for{" "}
            {weak.length === 1 ? "this topic" : "these topics"} yet. Practising
            somewhere else in the app will bring it back here once it exists.
          </p>
          <Link
            href="/skill/grammar"
            className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--plum)" }}
          >
            Practice grammar →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Topics you miss most — let&apos;s turn them around.
      </p>
      {pills}
      {recall.length > 0 && (
        <RecallDeck
          items={recall}
          accent="var(--gold)"
          title="Phrases & vocabulary"
        />
      )}
      {questions.length > 0 && (
        <div className={recall.length > 0 ? "mt-6" : undefined}>
          <GrammarQuiz questions={questions} accent="var(--gold)" />
        </div>
      )}
      {nothingYet}
    </div>
  );
}
