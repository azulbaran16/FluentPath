import { WORLDS, TOTAL_SCENARIOS } from "./curriculum";
import type { ProgressState } from "./progress";

// Achievements derived from the existing progress state — no extra storage.

export type AchievementIcon =
  | "footprints"
  | "compass"
  | "flame"
  | "zap"
  | "graduation"
  | "repeat"
  | "crown"
  | "trophy";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  target: number;
  /** current value toward the target, given the progress state */
  value: (s: ProgressState, h: Helpers) => number;
}

interface Helpers {
  completedCount: number;
  worldsStarted: number;
  bestWorldDone: number; // most scenarios completed within a single world
  seen: number; // SRS items practised
}

function helpers(s: ProgressState): Helpers {
  let worldsStarted = 0;
  let bestWorldDone = 0;
  for (const w of WORLDS) {
    const done = w.scenarios.filter(
      (sc) => s.completed[`${w.slug}/${sc.slug}`],
    ).length;
    if (done > 0) worldsStarted += 1;
    if (done > bestWorldDone) bestWorldDone = done;
  }
  return {
    completedCount: Object.keys(s.completed).length,
    worldsStarted,
    bestWorldDone,
    seen: Object.keys(s.srs).length,
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First steps",
    description: "Complete your first scenario.",
    icon: "footprints",
    target: 1,
    value: (_s, h) => h.completedCount,
  },
  {
    id: "getting-going",
    title: "Getting going",
    description: "Complete 5 scenarios.",
    icon: "compass",
    target: 5,
    value: (_s, h) => h.completedCount,
  },
  {
    id: "placement",
    title: "Know thyself",
    description: "Take the placement test.",
    icon: "graduation",
    target: 1,
    value: (s) => (s.level ? 1 : 0),
  },
  {
    id: "streak-7",
    title: "On a roll",
    description: "Reach a 7-day streak.",
    icon: "flame",
    target: 7,
    value: (s) => s.streak,
  },
  {
    id: "xp-500",
    title: "Word collector",
    description: "Earn 500 XP.",
    icon: "zap",
    target: 500,
    value: (s) => s.xp,
  },
  {
    id: "reviewer",
    title: "Memory keeper",
    description: "Practise 15 review items.",
    icon: "repeat",
    target: 15,
    value: (_s, h) => h.seen,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Start scenarios in 3 different worlds.",
    icon: "compass",
    target: 3,
    value: (_s, h) => h.worldsStarted,
  },
  {
    id: "world-master",
    title: "World master",
    description: "Complete every scenario in one world.",
    icon: "crown",
    target: Math.min(...WORLDS.map((w) => w.scenarios.length)),
    value: (_s, h) => h.bestWorldDone,
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Master every scenario.",
    icon: "trophy",
    target: TOTAL_SCENARIOS,
    value: (_s, h) => h.completedCount,
  },
];

export interface AchievementStatus extends Achievement {
  current: number;
  earned: boolean;
}

export function evaluateAchievements(s: ProgressState): AchievementStatus[] {
  const h = helpers(s);
  return ACHIEVEMENTS.map((a) => {
    const current = Math.min(a.value(s, h), a.target);
    return { ...a, current, earned: current >= a.target };
  });
}
