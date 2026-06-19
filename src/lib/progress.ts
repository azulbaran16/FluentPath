"use client";

import { useCallback, useEffect, useState } from "react";
import { WORLDS, TOTAL_SCENARIOS, type Skill } from "./curriculum";

// Local-first progress store + learning engine (Fase 5).
// Fase 5 keeps everything in localStorage behind this hook; a future
// phase can swap the storage for a DB without changing callers.

const KEY = "fluentpath:progress:v2";

/** Leitner-style review intervals in days, indexed by box. */
const BOX_DAYS = [0, 1, 3, 7, 16, 30];

export interface SrsItem {
  box: number;
  due: string; // YYYY-MM-DD
}

export interface ProgressState {
  /** keys are `${worldSlug}/${scenarioSlug}` */
  completed: Record<string, true>;
  xp: number;
  skillXp: Partial<Record<Skill, number>>;
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
  /** estimated CEFR level from the placement test, or null */
  level: string | null;
  /** spaced-repetition schedule, keyed by item id (e.g. grammar question id) */
  srs: Record<string, SrsItem>;
}

const EMPTY: ProgressState = {
  completed: {},
  xp: 0,
  skillXp: {},
  streak: 0,
  lastActive: null,
  level: null,
  srs: {},
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

function read(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    // migrate from v1 if present
    const v1 = window.localStorage.getItem("fluentpath:progress:v1");
    if (v1) return { ...EMPTY, ...JSON.parse(v1) };
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

const key = (worldSlug: string, scenarioSlug: string) =>
  `${worldSlug}/${scenarioSlug}`;

export function useProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(read());
    setReady(true);
  }, []);

  const persist = useCallback((updater: (s: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in-memory */
      }
      return next;
    });
  }, []);

  /** Bump the day-streak. Call on any meaningful activity. */
  const recordActivity = useCallback(() => {
    persist((s) => {
      const t = today();
      if (s.lastActive === t) return s; // already counted today
      const gap = s.lastActive ? daysBetween(s.lastActive, t) : null;
      const streak = gap === 1 ? s.streak + 1 : 1;
      return { ...s, lastActive: t, streak };
    });
  }, [persist]);

  const isDone = useCallback(
    (worldSlug: string, scenarioSlug: string) =>
      Boolean(state.completed[key(worldSlug, scenarioSlug)]),
    [state.completed],
  );

  const complete = useCallback(
    (worldSlug: string, scenarioSlug: string, xpGain = 20) => {
      persist((s) => {
        const k = key(worldSlug, scenarioSlug);
        if (s.completed[k]) return s;
        const t = today();
        const gap = s.lastActive ? daysBetween(s.lastActive, t) : null;
        const streak = s.lastActive === t ? s.streak : gap === 1 ? s.streak + 1 : 1;
        return {
          ...s,
          completed: { ...s.completed, [k]: true },
          xp: s.xp + xpGain,
          lastActive: t,
          streak,
        };
      });
    },
    [persist],
  );

  const addSkillXp = useCallback(
    (skill: Skill, amount: number) => {
      persist((s) => ({
        ...s,
        xp: s.xp + amount,
        skillXp: { ...s.skillXp, [skill]: (s.skillXp[skill] ?? 0) + amount },
      }));
      recordActivity();
    },
    [persist, recordActivity],
  );

  const setLevel = useCallback(
    (level: string) => {
      persist((s) => ({ ...s, level }));
      recordActivity();
    },
    [persist, recordActivity],
  );

  /** Schedule a review item after an attempt (true = correct). */
  const reviewItem = useCallback(
    (id: string, correct: boolean) => {
      persist((s) => {
        const prev = s.srs[id];
        const box = correct ? Math.min((prev?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0;
        // Correct → schedule further out; wrong → due again today so it comes back soon.
        const due = correct ? addDays(BOX_DAYS[box]) : today();
        return { ...s, srs: { ...s.srs, [id]: { box, due } } };
      });
    },
    [persist],
  );

  const worldProgress = useCallback(
    (worldSlug: string) => {
      const world = WORLDS.find((w) => w.slug === worldSlug);
      if (!world) return 0;
      const done = world.scenarios.filter((sc) =>
        Boolean(state.completed[key(worldSlug, sc.slug)]),
      ).length;
      return (done / world.scenarios.length) * 100;
    },
    [state.completed],
  );

  /** Ids whose review is due on or before today. */
  const dueReviewIds = useCallback((): string[] => {
    const t = today();
    return Object.entries(state.srs)
      .filter(([, item]) => item.due <= t)
      .map(([id]) => id);
  }, [state.srs]);

  const completedCount = Object.keys(state.completed).length;
  const overallProgress = (completedCount / TOTAL_SCENARIOS) * 100;
  const dueCount = dueReviewIds().length;
  const seenCount = Object.keys(state.srs).length;

  return {
    ready,
    state,
    isDone,
    complete,
    addSkillXp,
    setLevel,
    reviewItem,
    recordActivity,
    worldProgress,
    dueReviewIds,
    completedCount,
    overallProgress,
    dueCount,
    seenCount,
  };
}
