import { ChevronDown } from "lucide-react";
import {
  GRAMMAR_LESSONS,
  LESSON_LEVELS,
  type GrammarLevel,
} from "@/lib/content/lessons";

const ACCENT = "var(--plum)";

const LEVEL_LABEL: Record<GrammarLevel, string> = {
  A2: "A2 · Foundations",
  B1: "B1 · Intermediate",
  B2: "B2 · Upper-intermediate",
  C1: "C1 · Advanced",
};

// "Learn" step: compact, collapsible grammar lessons grouped by CEFR level.
// Native <details> — accessible and works without JavaScript.
export function GrammarLessons() {
  return (
    <div className="space-y-8">
      {LESSON_LEVELS.map((level) => {
        const lessons = GRAMMAR_LESSONS.filter((l) => l.level === level);
        if (lessons.length === 0) return null;
        return (
          <section key={level}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-xs font-bold"
                style={{
                  background: `color-mix(in srgb, ${ACCENT} 14%, transparent)`,
                  color: ACCENT,
                }}
              >
                {level}
              </span>
              <h3 className="font-display text-base font-semibold text-ink-soft">
                {LEVEL_LABEL[level]}
              </h3>
              <span className="text-xs text-muted">({lessons.length})</span>
            </div>

            <div className="grid items-start gap-3 sm:grid-cols-2">
              {lessons.map((lesson) => {
                const num =
                  GRAMMAR_LESSONS.findIndex((l) => l.id === lesson.id) + 1;
                return (
                  <details
                    key={lesson.id}
                    className="group rounded-[var(--radius)] border border-line bg-card shadow-[var(--shadow-soft)] open:shadow-[var(--shadow-lift)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold"
                          style={{
                            background: `color-mix(in srgb, ${ACCENT} 14%, transparent)`,
                            color: ACCENT,
                          }}
                        >
                          {num}
                        </span>
                        <span className="font-display text-base font-semibold leading-tight">
                          {lesson.topic}
                        </span>
                      </span>
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                        strokeWidth={2}
                      />
                    </summary>

                    <div className="px-4 pb-4">
                      <p className="text-sm text-ink-soft">{lesson.rule}</p>
                      <ul className="mt-3 space-y-2">
                        {lesson.examples.map((ex, i) => (
                          <li
                            key={i}
                            className="rounded-lg bg-paper-deep/50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium">{ex.en}</span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {ex.es}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {lesson.tip && (
                        <p
                          className="mt-3 rounded-lg px-3 py-2 text-xs"
                          style={{
                            background: `color-mix(in srgb, ${ACCENT} 8%, transparent)`,
                            color: ACCENT,
                          }}
                        >
                          {lesson.tip}
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
