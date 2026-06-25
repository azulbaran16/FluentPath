"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { DIAGNOSTIC, estimateLevel, type Cefr } from "@/lib/content/diagnostic";
import { useProgress } from "@/lib/progress";
import { celebrate } from "@/lib/confetti";
import { Rumi } from "../mascot/Rumi";

const ACCENT = "var(--gold)";

const LEVEL_BLURB: Record<Cefr, string> = {
  A2: "You handle everyday basics. Let's build confidence with core scenarios.",
  B1: "Solid foundations — time to push toward natural, flowing conversation.",
  B2: "Strong and independent. We'll polish nuance, tone and idioms.",
  C1: "Advanced! Let's chase the final 10%: sounding truly native.",
};

export function DiagnosticTest() {
  const { setLevel } = useProgress();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<Cefr | null>(null);

  useEffect(() => {
    if (result) celebrate();
  }, [result]);

  const q = DIAGNOSTIC[i];
  const isLast = i === DIAGNOSTIC.length - 1;
  const answered = picked !== null;

  // Selection can be changed freely until the learner advances.
  function pick(idx: number) {
    setPicked(idx);
  }

  function next() {
    // Record correctness for the current question based on the final choice.
    const updated = new Set(correctIds);
    if (picked === q.answer) updated.add(q.id);
    else updated.delete(q.id);
    setCorrectIds(updated);

    if (isLast) {
      const level = estimateLevel(updated);
      setResult(level);
      setLevel(level);
      return;
    }
    setI((v) => v + 1);
    setPicked(null);
  }

  if (result) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <Rumi mood="happy" size={96} className="pop-in mx-auto" />
        <p className="mt-2 text-sm uppercase tracking-wider text-muted">
          Your estimated level
        </p>
        <p className="mt-1 font-display text-6xl font-semibold" style={{ color: ACCENT }}>
          {result}
        </p>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">{LEVEL_BLURB[result]}</p>
        <p className="mt-2 text-xs text-muted">
          This is a quick estimate — your real level grows as you practice.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/world/social/small-talk"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: ACCENT }}
          >
            Start practicing →
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const before = q.prompt.split("___")[0];
  const after = q.prompt.split("___")[1] ?? "";

  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(i / DIAGNOSTIC.length) * 100}%`, background: ACCENT }}
        />
      </div>
      <p className="text-xs text-muted">
        Question {i + 1} / {DIAGNOSTIC.length}
      </p>
      <p className="mt-3 font-display text-xl font-semibold leading-relaxed">
        {before}
        <span
          className="mx-1 rounded-md px-2 py-0.5"
          style={{ background: `color-mix(in srgb, ${ACCENT} 12%, transparent)`, color: ACCENT }}
        >
          {answered ? q.options[picked] : "____"}
        </span>
        {after}
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => pick(idx)}
            className={`cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              idx === picked
                ? "border-gold bg-[color-mix(in_srgb,var(--gold)_12%,transparent)]"
                : "border-line-strong hover:bg-paper-deep"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={!answered}
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          style={{ background: "var(--ink)" }}
        >
          {isLast ? "See my level" : "Next"}
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
