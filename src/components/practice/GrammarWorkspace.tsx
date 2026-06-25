"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Puzzle, Blocks, PencilLine } from "lucide-react";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { GRAMMAR_LESSONS, type GrammarLevel } from "@/lib/content/lessons";
import { useProgress } from "@/lib/progress";
import { GrammarLessons } from "./GrammarLessons";
import { GrammarQuiz } from "./GrammarQuiz";
import { SentenceBuilder } from "./SentenceBuilder";
import { TypeAnswer } from "./TypeAnswer";

const ACCENT = "var(--plum)";
const LEVELS: GrammarLevel[] = ["A2", "B1", "B2", "C1"];

type Tab = "learn" | "practice" | "build" | "fill";
type Filter = "all" | "weak" | GrammarLevel;

export function GrammarWorkspace() {
  const focusWeak = useSearchParams().get("focus") === "weak";
  const { weakTopics } = useProgress();
  const [tab, setTab] = useState<Tab>(focusWeak ? "practice" : "learn");
  const [filter, setFilter] = useState<Filter>(focusWeak ? "weak" : "all");

  const weakSet = useMemo(
    () => new Set(weakTopics().map((w) => w.topic)),
    [weakTopics],
  );

  const questions = useMemo(() => {
    if (filter === "weak") {
      const weak = GRAMMAR_QUESTIONS.filter((q) => weakSet.has(q.topic));
      return weak.length ? weak : GRAMMAR_QUESTIONS;
    }
    return filter === "all"
      ? GRAMMAR_QUESTIONS
      : GRAMMAR_QUESTIONS.filter((q) => q.level === filter);
  }, [filter, weakSet]);

  return (
    <div>
      {/* Segmented mode control — scrolls horizontally on small screens */}
      <div
        role="tablist"
        aria-label="Grammar mode"
        className="inline-flex max-w-full overflow-x-auto rounded-xl border border-line bg-card p-1 shadow-[var(--shadow-soft)]"
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
        <TabButton
          active={tab === "build"}
          onClick={() => setTab("build")}
          icon={<Blocks className="h-4 w-4" strokeWidth={1.75} />}
          label="Build"
        />
        <TabButton
          active={tab === "fill"}
          onClick={() => setTab("fill")}
          icon={<PencilLine className="h-4 w-4" strokeWidth={1.75} />}
          label="Fill"
        />
      </div>

      {tab === "learn" && (
        <>
          <p className="mt-3 text-sm text-muted">
            {GRAMMAR_LESSONS.length} topics from A2 to C1 — open one, then switch
            to Practice to test yourself.
          </p>
          <div className="mt-4">
            <GrammarLessons />
          </div>
        </>
      )}

      {tab === "build" && (
        <div className="mt-3">
          <SentenceBuilder accent={ACCENT} />
        </div>
      )}

      {(tab === "practice" || tab === "fill") && (
        <>
          <p className="mt-3 text-sm text-muted">
            {tab === "fill"
              ? "Type the missing word — no options to pick from, just like real life."
              : "Answer in context — you'll get the rule and an explanation after each one."}
          </p>
          {/* Level / weak-spot filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
              All levels
            </FilterPill>
            {weakSet.size > 0 && (
              <FilterPill active={filter === "weak"} onClick={() => setFilter("weak")}>
                ⚡ Weak spots
              </FilterPill>
            )}
            {LEVELS.map((lv) => (
              <FilterPill
                key={lv}
                active={filter === lv}
                onClick={() => setFilter(lv)}
              >
                {lv}
              </FilterPill>
            ))}
          </div>
          <div className="mt-4">
            {/* key forces a fresh run when the filter or mode changes */}
            {tab === "fill" ? (
              <TypeAnswer key={`fill-${filter}`} questions={questions} accent={ACCENT} />
            ) : (
              <GrammarQuiz key={filter} questions={questions} accent={ACCENT} />
            )}
          </div>
        </>
      )}
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
  count?: number;
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
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-xs font-semibold ${
            active ? "bg-paper/20 text-paper" : "bg-paper-deep text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "border-transparent text-paper"
          : "border-line-strong text-ink-soft hover:bg-paper-deep"
      }`}
      style={active ? { background: ACCENT } : undefined}
    >
      {children}
    </button>
  );
}
