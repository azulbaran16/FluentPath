"use client";

import type { CelpipRubricDimension } from "@/lib/celpip";

// Dimension-grouped, yes/no self-check. A partially-checked list is a valid,
// persisted state on purpose — no check-all gate exists here or anywhere
// else in the flow.
export function RubricChecklist({
  rubric,
  checked,
  onToggle,
}: {
  rubric: CelpipRubricDimension[];
  checked: Record<string, boolean>;
  onToggle: (itemId: string, value: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      {rubric.map((dimension) => (
        <div key={dimension.key}>
          <h3 className="font-display text-base font-semibold">{dimension.label}</h3>
          <ul className="mt-2 space-y-2.5">
            {dimension.items.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[item.id])}
                    onChange={(e) => onToggle(item.id, e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ accentColor: "var(--sky)" }}
                  />
                  <span>
                    <span
                      className={
                        checked[item.id]
                          ? "font-semibold text-sky"
                          : "font-semibold"
                      }
                    >
                      {item.text}
                    </span>
                    <span className="mt-0.5 block text-muted">{item.explanation}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
