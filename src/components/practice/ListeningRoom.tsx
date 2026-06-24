"use client";

import { useMemo, useState } from "react";
import { Play, Square, RotateCcw, Headphones, Check, X, Eye } from "lucide-react";
import { type Clip, LISTENING_LEVELS, type ListeningLevel } from "@/lib/content/listening";
import { LevelBadge } from "../SkillPill";

const ACCENT = "var(--sky)";
type Filter = "all" | ListeningLevel;

export function ListeningRoom({ clips }: { clips: Clip[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const active = clips.find((c) => c.id === activeId) ?? null;

  const shown = useMemo(
    () => (filter === "all" ? clips : clips.filter((c) => c.level === filter)),
    [clips, filter],
  );

  if (active) {
    return <ClipPlayer clip={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All levels
        </FilterPill>
        {LISTENING_LEVELS.map((lv) => (
          <FilterPill key={lv} active={filter === lv} onClick={() => setFilter(lv)}>
            {lv}
          </FilterPill>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className="group flex items-center gap-4 rounded-[var(--radius)] border border-line bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
              style={{ background: `color-mix(in srgb, ${ACCENT} 14%, transparent)`, color: ACCENT }}
            >
              <Headphones className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold">{c.title}</h3>
              <p className="text-xs text-muted">{c.questions.length} questions</p>
            </div>
            <LevelBadge level={c.level} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ClipPlayer({ clip, onBack }: { clip: Clip; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  function play() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clip.lines.join(". "));
    u.lang = "en-US";
    u.rate = 0.95;
    u.onend = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(u);
  }
  function stop() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }

  const correct = clip.questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div>
      <button onClick={onBack} className="cursor-pointer text-sm text-muted hover:text-ink">
        ← All clips
      </button>

      <section className="mt-3 rounded-[var(--radius)] border border-line bg-card p-6 text-center shadow-[var(--shadow-soft)]">
        <LevelBadge level={clip.level} />
        <h2 className="mt-3 font-display text-2xl font-semibold">{clip.title}</h2>
        <p className="mt-1 text-sm text-muted">
          Listen as many times as you need, then answer below.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={playing ? stop : play}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: ACCENT }}
          >
            {playing ? (
              <>
                <Square className="h-4 w-4" strokeWidth={2} /> Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" strokeWidth={2} /> Play
              </>
            )}
          </button>
          <button
            onClick={play}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-5 py-3 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Replay
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <h3 className="font-display text-lg font-semibold">Comprehension</h3>
        <div className="mt-4 space-y-5">
          {clip.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium">
                {qi + 1}. {q.q}
              </p>
              <div className="mt-2 grid gap-2">
                {q.options.map((opt, oi) => {
                  const picked = answers[qi] === oi;
                  const isAnswer = q.answer === oi;
                  let cls = "border-line-strong hover:bg-paper-deep";
                  if (submitted && isAnswer)
                    cls = "border-teal bg-[color-mix(in_srgb,var(--teal)_10%,transparent)]";
                  else if (submitted && picked && !isAnswer)
                    cls = "border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]";
                  else if (picked) cls = "border-ink";
                  return (
                    <button
                      key={oi}
                      onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                      disabled={submitted}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                    >
                      {opt}
                      {submitted && isAnswer && <Check className="h-4 w-4 text-teal" strokeWidth={2.5} />}
                      {submitted && picked && !isAnswer && <X className="h-4 w-4 text-vermilion" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            onClick={() => {
              setSubmitted(true);
              setShowTranscript(true);
            }}
            disabled={Object.keys(answers).length < clip.questions.length}
            className="mt-5 cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            Check answers
          </button>
        ) : (
          <p className="mt-5 font-semibold">
            You got {correct} / {clip.questions.length} correct.
          </p>
        )}
      </section>

      <section className="mt-5">
        {!showTranscript ? (
          <button
            onClick={() => setShowTranscript(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            <Eye className="h-4 w-4" strokeWidth={1.75} /> Show transcript
          </button>
        ) : (
          <div className="rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)]">
            <h3 className="mb-2 font-display text-base font-semibold">Transcript</h3>
            <div className="space-y-1.5 text-sm leading-relaxed text-ink-soft">
              {clip.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
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
        active ? "border-transparent text-paper" : "border-line-strong text-ink-soft hover:bg-paper-deep"
      }`}
      style={active ? { background: ACCENT } : undefined}
    >
      {children}
    </button>
  );
}
