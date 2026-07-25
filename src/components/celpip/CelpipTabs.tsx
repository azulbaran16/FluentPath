import type { CelpipTaskType } from "@/lib/celpip";

const ACTIVE_TABS: { type: CelpipTaskType; label: string }[] = [
  { type: "email", label: "Task 1" },
  { type: "survey", label: "Task 2" },
];

const COMING_SOON = ["Speaking", "Reading", "Listening"];

export function CelpipTabs({
  active,
  onChange,
}: {
  active: CelpipTaskType;
  onChange: (type: CelpipTaskType) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACTIVE_TABS.map((tab) => {
        const isActive = active === tab.type;
        return (
          <button
            key={tab.type}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.type)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              isActive
                ? "text-paper"
                : "border-line-strong text-ink-soft hover:bg-paper-deep"
            }`}
            style={
              isActive
                ? { background: "var(--sky)", borderColor: "var(--sky)" }
                : undefined
            }
          >
            {tab.label}
          </button>
        );
      })}
      {COMING_SOON.map((label) => (
        <span
          key={label}
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-muted opacity-60"
        >
          {label}
          <span className="rounded-full bg-paper-deep px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted">
            Coming soon
          </span>
        </span>
      ))}
    </div>
  );
}
