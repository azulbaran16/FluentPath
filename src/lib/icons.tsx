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
  Mail,
  ClipboardList,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import type { Skill } from "./curriculum";
import type { CelpipCardIcon } from "./celpip";

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

// CELPIP card icons. `src/lib/celpip.ts` names them as strings so it stays
// loadable by `node --experimental-strip-types`; the mapping to real
// components belongs here, with the rest of the presentation layer.
//
// `Headphones` is the one icon imported for this map: the app had no
// listening glyph, and reusing `Mic` (speaking) or `MessagesSquare`
// (conversation) would have read as the wrong skill. lucide-react is
// already a dependency — nothing was installed.
export const CELPIP_CARD_ICONS: Record<CelpipCardIcon, LucideIcon> = {
  email: Mail,
  survey: ClipboardList,
  speaking: Mic,
  reading: BookOpen,
  listening: Headphones,
};

/**
 * The /celpip hero glyph. Deliberately not a per-skill icon: the section
 * covers four skills now, and the writing nib read as a claim about one.
 */
export function CelpipIcon({ className }: { className?: string }) {
  return <BookOpenText className={className} strokeWidth={1.75} />;
}

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
