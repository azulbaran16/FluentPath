import {
  MessagesSquare,
  Briefcase,
  Plane,
  BookOpenText,
  Home,
  Sparkles,
  Puzzle,
  Mic,
  BookOpen,
  PenLine,
  Compass,
  Bot,
  type LucideIcon,
} from "lucide-react";
import type { Skill } from "./curriculum";

// Presentation layer: maps curriculum data → real icons.
// Keeps `curriculum.ts` as pure data, free of UI concerns.

export const WORLD_ICONS: Record<string, LucideIcon> = {
  social: MessagesSquare,
  work: Briefcase,
  travel: Plane,
  academic: BookOpenText,
  practical: Home,
  native: Sparkles,
};

export const SKILL_ICONS: Record<Skill, LucideIcon> = {
  grammar: Puzzle,
  speaking: Mic,
  reading: BookOpen,
  writing: PenLine,
};

export const NAV_ICONS = {
  dashboard: Compass,
  tutor: Bot,
} as const;

export function WorldIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = WORLD_ICONS[slug] ?? Compass;
  return <Icon className={className} strokeWidth={1.75} />;
}

export function SkillIcon({
  skill,
  className,
}: {
  skill: Skill;
  className?: string;
}) {
  const Icon = SKILL_ICONS[skill];
  return <Icon className={className} strokeWidth={1.75} />;
}
