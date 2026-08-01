import { SKILL_META, type Skill } from "@/lib/curriculum";
import { SkillIcon } from "@/lib/icons";

/**
 * The skill a scenario teaches, and — when the caller knows — whether practice
 * for that pair has actually been written.
 *
 * `available` is OPTIONAL and defaults to true, because several callers show a
 * pill without a coverage lookup in hand. A caller that has the registry should
 * pass it: until this prop existed the pill was a promise, and 22 of the 52
 * declared pairs rendered nothing behind it.
 *
 * An unwritten pair is MUTED, never hidden. The scenario really does teach that
 * skill, so removing the pill would understate the catalogue; the learner is
 * entitled to know both what the scenario covers and what is missing. Same
 * treatment CelpipTabs uses for a section whose bank is empty: lower contrast,
 * the label kept, and the state said in words rather than only in colour.
 */
export function SkillPill({
  skill,
  size = "sm",
  available = true,
}: {
  skill: Skill;
  size?: "sm" | "md";
  available?: boolean;
}) {
  const meta = SKILL_META[skill];
  const geometry =
    size === "sm" ? "px-2 py-0.5 text-[0.7rem]" : "px-3 py-1 text-sm";
  const icon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  if (!available) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong font-medium text-muted opacity-80 ${geometry}`}
        title={`${meta.label} practice for this scenario isn't written yet`}
      >
        <SkillIcon skill={skill} className={icon} />
        {meta.label}
        <span className="sr-only"> — practice not written yet</span>
        <span aria-hidden="true" className="font-semibold">
          ·&nbsp;soon
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${geometry}`}
      style={{
        borderColor: `color-mix(in srgb, var(${meta.color}) 35%, transparent)`,
        color: `var(${meta.color})`,
        background: `color-mix(in srgb, var(${meta.color}) 8%, transparent)`,
      }}
    >
      <SkillIcon skill={skill} className={icon} />
      {meta.label}
    </span>
  );
}

/**
 * The same pending state as a standalone badge, for lists that are not pills.
 * One treatment, one place to change it.
 */
export function PendingBadge({ label = "Not written yet" }: { label?: string }) {
  return (
    <span className="rounded-full bg-paper-deep px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted">
      {label}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className="rounded-md border border-line-strong bg-paper px-1.5 py-0.5 text-[0.7rem] font-semibold text-ink-soft">
      {level}
    </span>
  );
}
