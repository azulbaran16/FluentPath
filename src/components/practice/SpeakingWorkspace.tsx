"use client";

import { useState } from "react";
import { BookOpen, Mic, ChevronDown, ChevronRight } from "lucide-react";
import { SPEAKING_PACKS, SPEAKING_TIPS } from "@/lib/content/phrases";
import { LevelBadge } from "../SkillPill";
import { PronunciationLab } from "./PronunciationLab";

const ACCENT = "var(--vermilion)";

type Tab = "learn" | "practice";

export function SpeakingWorkspace() {
  const [tab, setTab] = useState<Tab>("practice");
  const [packId, setPackId] = useState<string | null>(null);
  const pack = SPEAKING_PACKS.find((p) => p.id === packId) ?? null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Speaking mode"
        className="inline-flex rounded-xl border border-line bg-card p-1 shadow-[var(--shadow-soft)]"
      >
        <TabButton
          active={tab === "practice"}
          onClick={() => setTab("practice")}
          icon={<Mic className="h-4 w-4" strokeWidth={1.75} />}
          label="Practice"
          count={SPEAKING_PACKS.length}
        />
        <TabButton
          active={tab === "learn"}
          onClick={() => setTab("learn")}
          icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
          label="Learn"
          count={SPEAKING_TIPS.length}
        />
      </div>

      {tab === "learn" ? (
        <>
          <p className="mt-3 text-sm text-muted">
            Pronunciation & fluency tips — then drill them in Practice.
          </p>
          <div className="mt-4 grid items-start gap-3 sm:grid-cols-2">
            {SPEAKING_TIPS.map((t, idx) => (
              <details
                key={t.id}
                open={idx === 0}
                className="group rounded-[var(--radius)] border border-line bg-card shadow-[var(--shadow-soft)] open:shadow-[var(--shadow-lift)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                  <span className="font-display text-base font-semibold">
                    {t.title}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                    strokeWidth={2}
                  />
                </summary>
                <ul className="space-y-1.5 px-4 pb-4 text-sm text-ink-soft">
                  {t.points.map((p, i) => (
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
      ) : pack ? (
        <div className="mt-4">
          <button
            onClick={() => setPackId(null)}
            className="mb-3 cursor-pointer text-sm text-muted hover:text-ink"
          >
            ← All packs
          </button>
          <PronunciationLab
            key={pack.id}
            phrases={pack.phrases}
            accent={ACCENT}
          />
        </div>
      ) : (
        <>
          <p className="mt-3 mb-4 text-sm text-muted">
            Pick a pack and practice out loud — you&apos;ll be scored word by word.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPEAKING_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPackId(p.id)}
                className="group flex items-center gap-4 rounded-[var(--radius)] border border-line bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in srgb, ${ACCENT} 14%, transparent)`,
                    color: ACCENT,
                  }}
                >
                  <Mic className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <LevelBadge level={p.level} />
                  </div>
                  <p className="text-sm text-muted">{p.blurb}</p>
                  <p className="mt-1 text-xs text-muted">{p.phrases.length} phrases</p>
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </button>
            ))}
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
