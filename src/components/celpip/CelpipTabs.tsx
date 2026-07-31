import {
  CELPIP_SECTIONS,
  type CelpipSection,
  type CelpipSkill,
} from "@/lib/celpip";

// Presentational only — no "use client" here on purpose. It receives its
// callbacks from CelpipLanding and inherits that file's client boundary.
//
// There is no hard-coded coming-soon list any more. A tab is interactive when
// its section's bank holds content and carries the unavailable badge when it
// does not, so a section that ships (or is dropped from the phase for the
// calendar) changes what this renders without anybody editing this file.

const PILL =
  "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors";

export function CelpipTabs({
  active,
  onChange,
}: {
  active: CelpipSkill;
  onChange: (skill: CelpipSkill) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CELPIP_SECTIONS.map((section) =>
        section.coverage.available ? (
          <SkillTab
            key={section.skill}
            section={section}
            isActive={active === section.skill}
            onChange={onChange}
          />
        ) : (
          <span
            key={section.skill}
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-muted opacity-60"
          >
            {section.label}
            <span className="rounded-full bg-paper-deep px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted">
              Not yet available
            </span>
          </span>
        ),
      )}
    </div>
  );
}

function SkillTab({
  section,
  isActive,
  onChange,
}: {
  section: CelpipSection;
  isActive: boolean;
  onChange: (skill: CelpipSkill) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onChange(section.skill)}
      className={`${PILL} ${
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
      {section.label}
    </button>
  );
}

/**
 * The second level, rendered only for a section that has more than one group
 * — today that is Writing alone, whose one skill covers the exam's two
 * writing tasks. The sections are uneven by design (D-01); a general
 * two-level tab system would pretend the four skills are symmetric.
 */
export function CelpipGroupTabs({
  groups,
  active,
  onChange,
}: {
  groups: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  if (groups.length < 2) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {groups.map((group) => {
        const isActive = active === group.key;
        return (
          <button
            key={group.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(group.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              isActive
                ? "border-line-strong bg-paper-deep text-ink"
                : "border-transparent text-muted hover:bg-paper-deep"
            }`}
          >
            {group.label}
          </button>
        );
      })}
    </div>
  );
}
