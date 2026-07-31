import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";

export type TaskAttemptStatus = "not-started" | "in-progress" | "completed";

const STATUS_LABEL: Record<TaskAttemptStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

// Symbolic fill for the reused ProgressRing (0/50/100), not a literal
// percentage — mirrors WorldCard's ProgressRing usage but for a 3-state
// attempt status rather than a scenario-completion ratio.
const STATUS_RING_VALUE: Record<TaskAttemptStatus, number> = {
  "not-started": 0,
  "in-progress": 50,
  completed: 100,
};

/**
 * A card for one practice item in any CELPIP section.
 *
 * It used to be Writing-shaped: the href was hard-coded to the writing route
 * and the icon was looked up from the writing task-type union, so a Reading or
 * Speaking card was impossible. Both now arrive as props, resolved from the
 * section registry (`CELPIP_SECTIONS`) by the landing. Nothing about the look
 * changed — same accent bar, same ProgressRing, same `rise` entrance and
 * stagger, same status pill.
 */
export function TaskCard({
  title,
  summary,
  timing,
  href,
  icon: Icon,
  status,
  attemptCount,
  index = 0,
}: {
  title: string;
  summary: string;
  /** Bottom-left meta, e.g. "27 min" or "30s prep · 90s speaking". */
  timing: string;
  href: string;
  icon: LucideIcon;
  status: TaskAttemptStatus;
  attemptCount: number;
  index?: number;
}) {
  const accent = "var(--sky)";

  return (
    <Link
      href={href}
      className="rise group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <ProgressRing
          value={STATUS_RING_VALUE[status]}
          size={40}
          stroke={4}
          color={accent}
          label=""
        />
      </div>
      <h3 className="mt-4 line-clamp-2 font-display text-lg font-semibold leading-tight">
        {title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{summary}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
        <span>{timing}</span>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold"
          style={{
            borderColor:
              status === "not-started"
                ? "var(--line-strong)"
                : `color-mix(in srgb, ${accent} 35%, transparent)`,
            color: status === "not-started" ? undefined : accent,
          }}
        >
          {STATUS_LABEL[status]}
          {status === "completed" && attemptCount > 1
            ? ` · ${attemptCount} attempts`
            : ""}
        </span>
      </div>
    </Link>
  );
}
