"use client";

import { useMemo, useState } from "react";
import { Volume2, Check, X, BookOpen } from "lucide-react";
import { type Passage, READING_LEVELS, type ReadingLevel } from "@/lib/content/reading";
import { LevelBadge } from "../SkillPill";

type Filter = "all" | ReadingLevel;

export function ReadingRoom({
  passages,
  accent = "var(--teal)",
}: {
  passages: Passage[];
  accent?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const active = passages.find((p) => p.id === activeId) ?? null;

  const shown = useMemo(
    () => (filter === "all" ? passages : passages.filter((p) => p.level === filter)),
    [passages, filter],
  );

  if (!active) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} accent={accent}>
            All levels
          </FilterPill>
          {READING_LEVELS.map((lv) => (
            <FilterPill
              key={lv}
              active={filter === lv}
              onClick={() => setFilter(lv)}
              accent={accent}
            >
              {lv}
            </FilterPill>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className="group flex items-center gap-4 rounded-[var(--radius)] border border-line bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
              style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
            >
              <BookOpen className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="text-xs text-muted">
                {p.minutes} min read · {p.questions.length} questions
              </p>
            </div>
            <span className="ml-auto">
              <LevelBadge level={p.level} />
            </span>
          </button>
          ))}
        </div>
      </div>
    );
  }

  return <PassageReader passage={active} accent={accent} onBack={() => setActiveId(null)} />;
}

function PassageReader({
  passage,
  accent,
  onBack,
}: {
  passage: Passage;
  accent: string;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  function speak() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(passage.body.join(" "));
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  const correct = passage.questions.filter(
    (q, idx) => answers[idx] === q.answer,
  ).length;

  return (
    <div>
      <button onClick={onBack} className="text-sm text-muted hover:text-ink">
        ← All texts
      </button>

      <article className="mt-3 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LevelBadge level={passage.level} />
            <span className="text-xs text-muted">{passage.minutes} min</span>
          </div>
          <button
            onClick={speak}
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-paper-deep"
          >
            <Volume2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Read aloud
          </button>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold">{passage.title}</h2>
        <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
          {passage.body.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {passage.glossary.length > 0 && (
          <div className="mt-5 rounded-xl bg-paper-deep/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Glossary
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              {passage.glossary.map((g) => (
                <div key={g.word} className="flex gap-2">
                  <dt className="font-semibold" style={{ color: accent }}>
                    {g.word}
                  </dt>
                  <dd className="text-ink-soft">— {g.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </article>

      <section className="mt-5 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <h3 className="font-display text-lg font-semibold">Comprehension</h3>
        <div className="mt-4 space-y-5">
          {passage.questions.map((q, qi) => (
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
                      onClick={() =>
                        !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))
                      }
                      disabled={submitted}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${cls}`}
                    >
                      {opt}
                      {submitted && isAnswer && (
                        <Check className="h-4 w-4 text-teal" strokeWidth={2.5} />
                      )}
                      {submitted && picked && !isAnswer && (
                        <X className="h-4 w-4 text-vermilion" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < passage.questions.length}
            className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
            style={{ background: accent }}
          >
            Check answers
          </button>
        ) : (
          <p className="mt-5 font-semibold">
            You got {correct} / {passage.questions.length} correct.
          </p>
        )}
      </section>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent: string;
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
      style={active ? { background: accent } : undefined}
    >
      {children}
    </button>
  );
}
