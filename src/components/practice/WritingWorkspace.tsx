"use client";

import { useState } from "react";
import { BookOpen, PenLine, ChevronDown } from "lucide-react";
import { WRITING_PROMPTS, WRITING_GUIDES } from "@/lib/content/writing";
import { WritingDesk } from "./WritingDesk";

const ACCENT = "var(--sky)";

type Tab = "learn" | "practice";

export function WritingWorkspace() {
  const [tab, setTab] = useState<Tab>("learn");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Writing mode"
        className="inline-flex rounded-xl border border-line bg-card p-1 shadow-[var(--shadow-soft)]"
      >
        <TabButton
          active={tab === "learn"}
          onClick={() => setTab("learn")}
          icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
          label="Learn"
          count={WRITING_GUIDES.length}
        />
        <TabButton
          active={tab === "practice"}
          onClick={() => setTab("practice")}
          icon={<PenLine className="h-4 w-4" strokeWidth={1.75} />}
          label="Practice"
          count={WRITING_PROMPTS.length}
        />
      </div>

      {tab === "learn" ? (
        <>
          <p className="mt-3 text-sm text-muted">
            Quick guides for clear, natural writing — then pick a task in
            Practice.
          </p>
          <div className="mt-4 grid items-start gap-3 sm:grid-cols-2">
            {WRITING_GUIDES.map((g, idx) => (
              <details
                key={g.id}
                open={idx === 0}
                className="group rounded-[var(--radius)] border border-line bg-card shadow-[var(--shadow-soft)] open:shadow-[var(--shadow-lift)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span className="font-display text-base font-semibold">
                    {g.title}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                    strokeWidth={2}
                  />
                </summary>
                <ul className="space-y-1.5 px-4 pb-4 text-sm text-ink-soft">
                  {g.points.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: ACCENT }}>•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 mb-4 text-sm text-muted">
            Pick a task, draft your answer, then compare with the model.
          </p>
          <WritingDesk prompts={WRITING_PROMPTS} accent={ACCENT} />
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
