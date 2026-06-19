import { SKILL_META, type Skill } from "@/lib/curriculum";
import { SkillIcon } from "@/lib/icons";

export function SkillPill({ skill, size = "sm" }: { skill: Skill; size?: "sm" | "md" }) {
  const meta = SKILL_META[skill];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[0.7rem]" : "px-3 py-1 text-sm"
      }`}
      style={{
        borderColor: `color-mix(in srgb, var(${meta.color}) 35%, transparent)`,
        color: `var(${meta.color})`,
        background: `color-mix(in srgb, var(${meta.color}) 8%, transparent)`,
      }}
    >
      <SkillIcon
        skill={skill}
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
      />
      {meta.label}
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
