import { ChevronDown } from "lucide-react";
import { GRAMMAR_LESSONS } from "@/lib/content/lessons";

const ACCENT = "var(--plum)";

// "Learn" step: compact, collapsible grammar lessons shown before practice.
// Native <details> — accessible and works without JavaScript.
export function GrammarLessons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {GRAMMAR_LESSONS.map((lesson, idx) => (
        <details
          key={lesson.id}
          open={idx === 0}
          className="group rounded-[var(--radius)] border border-line bg-card p-0 shadow-[var(--shadow-soft)] open:shadow-[var(--shadow-lift)]"
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
                {idx + 1}
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
                  <span className="mt-0.5 block text-xs text-muted">{ex.es}</span>
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
      ))}
    </div>
  );
}
