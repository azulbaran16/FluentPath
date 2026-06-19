"use client";

import { useState } from "react";
import { BookOpen, Puzzle } from "lucide-react";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { GRAMMAR_LESSONS } from "@/lib/content/lessons";
import { GrammarLessons } from "./GrammarLessons";
import { GrammarQuiz } from "./GrammarQuiz";

const ACCENT = "var(--plum)";

type Tab = "learn" | "practice";

export function GrammarWorkspace() {
  const [tab, setTab] = useState<Tab>("learn");

  return (
    <div>
      {/* Segmented Learn / Practice control */}
      <div
        role="tablist"
        aria-label="Grammar mode"
        className="inline-flex rounded-xl border border-line bg-card p-1 shadow-[var(--shadow-soft)]"
      >
        <TabButton
          active={tab === "learn"}
          onClick={() => setTab("learn")}
          icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
          label="Learn"
          count={GRAMMAR_LESSONS.length}
        />
        <TabButton
          active={tab === "practice"}
          onClick={() => setTab("practice")}
          icon={<Puzzle className="h-4 w-4" strokeWidth={1.75} />}
          label="Practice"
          count={GRAMMAR_QUESTIONS.length}
        />
      </div>

      <p className="mt-3 text-sm text-muted">
        {tab === "learn"
          ? "Quick refreshers — open a topic, then switch to Practice to test yourself."
          : "Answer in context — you'll get the rule and an explanation after each one."}
      </p>

      <div className="mt-4">
        {tab === "learn" ? (
          <GrammarLessons />
        ) : (
          <GrammarQuiz questions={GRAMMAR_QUESTIONS} accent={ACCENT} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "text-paper" : "text-ink-soft hover:bg-paper-deep"
      }`}
      style={active ? { background: "var(--ink)" } : undefined}
    >
      {icon}
      {label}
      <span
        className={`rounded-full px-1.5 text-xs font-semibold ${
          active ? "bg-paper/20 text-paper" : "bg-paper-deep text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
