"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw, ChevronRight } from "lucide-react";
import { SENTENCE_DRILLS, type SentenceDrill, type SentenceLevel } from "@/lib/content/sentences";
import { useProgress } from "@/lib/progress";
import { Rumi } from "../mascot/Rumi";

const LEVELS: SentenceLevel[] = ["A2", "B1", "B2", "C1"];
type Filter = "all" | SentenceLevel;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SentenceBuilder({ accent = "var(--plum)" }: { accent?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [i, setI] = useState(0);

  const drills = useMemo(
    () => (filter === "all" ? SENTENCE_DRILLS : SENTENCE_DRILLS.filter((d) => d.level === filter)),
    [filter],
  );
  const drill = drills[i % drills.length];

  return (
    <div>
      <p className="text-sm text-muted">
        Tap the words in the right order to build the sentence — a hands-on way
        to master word order.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Pill active={filter === "all"} onClick={() => { setFilter("all"); setI(0); }}>
          All levels
        </Pill>
        {LEVELS.map((lv) => (
          <Pill key={lv} active={filter === lv} onClick={() => { setFilter(lv); setI(0); }}>
            {lv}
          </Pill>
        ))}
      </div>

      {/* key remounts the drill on change, resetting its state cleanly */}
      <Drill
        key={drill.id}
        drill={drill}
        accent={accent}
        onNext={() => setI((v) => (v + 1) % drills.length)}
      />
    </div>
  );
}

function Drill({
  drill,
  accent,
  onNext,
}: {
  drill: SentenceDrill;
  accent: string;
  onNext: () => void;
}) {
  const { addSkillXp } = useProgress();
  const [pool, setPool] = useState<number[]>(() => shuffle(drill.words.map((_, idx) => idx)));
  const [tray, setTray] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  function place(idx: number) {
    if (checked === true) return;
    setPool((p) => p.filter((x) => x !== idx));
    setTray((t) => [...t, idx]);
    setChecked(null);
  }
  function unplace(idx: number) {
    if (checked === true) return;
    setTray((t) => t.filter((x) => x !== idx));
    setPool((p) => [...p, idx]);
    setChecked(null);
  }
  function check() {
    const ok = tray.map((idx) => drill.words[idx]).join(" ") === drill.words.join(" ");
    setChecked(ok);
    addSkillXp("grammar", ok ? 8 : 2);
  }
  function reset() {
    setPool(shuffle(drill.words.map((_, idx) => idx)));
    setTray([]);
    setChecked(null);
  }

  const full = tray.length === drill.words.length;

  return (
    <div className="mt-4 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft">
          {drill.hint}
        </span>
        <span className="rounded-full bg-paper-deep px-2 py-1 text-xs font-semibold text-ink-soft">
          {drill.level}
        </span>
      </div>

      {/* Answer tray */}
      <div
        className={`mt-4 flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3 transition-colors ${
          checked === true
            ? "border-teal bg-[color-mix(in_srgb,var(--teal)_8%,transparent)]"
            : checked === false
              ? "shake border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_8%,transparent)]"
              : "border-line-strong"
        }`}
      >
        {tray.length === 0 && (
          <span className="text-sm text-muted">Your sentence appears here…</span>
        )}
        {tray.map((idx) => (
          <button
            key={idx}
            onClick={() => unplace(idx)}
            disabled={checked === true}
            className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
          >
            {drill.words[idx]}
          </button>
        ))}
      </div>

      {/* Word pool */}
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((idx) => (
          <button
            key={idx}
            onClick={() => place(idx)}
            disabled={checked === true}
            className="pop-in rounded-lg border px-3 py-1.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ borderColor: "color-mix(in srgb, var(--plum) 35%, transparent)" }}
          >
            {drill.words[idx]}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {checked === true && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[color-mix(in_srgb,var(--teal)_10%,transparent)] px-4 py-3">
          <Rumi mood="happy" size={40} />
          <p className="text-sm font-semibold text-teal">Perfect — that&apos;s exactly right! ✓</p>
        </div>
      )}
      {checked === false && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)] px-4 py-3 text-sm font-semibold text-vermilion">
          <X className="h-4 w-4" strokeWidth={2.5} /> Not quite — tap a word to move it back and try again.
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Reset
        </button>
        {checked === true ? (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: accent }}
          >
            Next <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={check}
            disabled={!full}
            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
            style={{ background: "var(--ink)" }}
          >
            <Check className="h-4 w-4" strokeWidth={2} /> Check
          </button>
        )}
      </div>
    </div>
  );
}

function Pill({
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
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-paper" : "border border-line bg-card text-ink-soft hover:bg-paper-deep"
      }`}
    >
      {children}
    </button>
  );
}
