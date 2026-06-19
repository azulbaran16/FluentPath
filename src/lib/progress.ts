"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { WORLDS, TOTAL_SCENARIOS, type Skill } from "./curriculum";

// Local-first progress store + learning engine.
// - Anonymous users: persisted to localStorage (cache).
// - Signed-in users: synced to the server (/api/progress) so progress
//   follows the account across devices, not just one browser.

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
  level: string | null;
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

function readLocal(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    const v1 = window.localStorage.getItem("fluentpath:progress:v1");
    if (v1) return { ...EMPTY, ...JSON.parse(v1) };
    return EMPTY;
  } catch {
    return EMPTY;
  }
}
function writeLocal(s: ProgressState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

function hasData(s: ProgressState): boolean {
  return (
    Object.keys(s.completed).length > 0 ||
    s.xp > 0 ||
    s.level !== null ||
    Object.keys(s.srs).length > 0
  );
}

const key = (worldSlug: string, scenarioSlug: string) =>
  `${worldSlug}/${scenarioSlug}`;

export function useProgress() {
  const { status } = useSession();
  const authed = status === "authenticated";
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Instant local hydrate from localStorage after mount (SSR-safe: the server
  // renders the empty state, then the client fills it in).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setState(readLocal());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const putServer = useCallback((s: ProgressState) => {
    fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: s }),
    }).catch(() => {
      /* offline — local cache still holds the data */
    });
  }, []);

  // On sign-in, reconcile local cache with the server copy.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/progress");
        if (!res.ok || cancelled) return;
        const { progress } = (await res.json()) as { progress: ProgressState | null };
        const local = readLocal();
        if (progress && hasData(progress)) {
          const merged = { ...EMPTY, ...progress };
          setState(merged);
          writeLocal(merged);
        } else if (hasData(local)) {
          // First sign-in with anonymous progress → migrate it up.
          putServer(local);
        }
      } catch {
        /* keep local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, putServer]);

  const persist = useCallback(
    (updater: (s: ProgressState) => ProgressState) => {
      setState((prev) => {
        const next = updater(prev);
        writeLocal(next);
        if (authed) {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => putServer(next), 600);
        }
        return next;
      });
    },
    [authed, putServer],
  );

  const recordActivity = useCallback(() => {
    persist((s) => {
      const t = today();
      if (s.lastActive === t) return s;
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
      persist((s) => {
        const t = today();
        const gap = s.lastActive ? daysBetween(s.lastActive, t) : null;
        const streak = s.lastActive === t ? s.streak : gap === 1 ? s.streak + 1 : 1;
        return {
          ...s,
          xp: s.xp + amount,
          skillXp: { ...s.skillXp, [skill]: (s.skillXp[skill] ?? 0) + amount },
          lastActive: t,
          streak,
        };
      });
    },
    [persist],
  );

  const setLevel = useCallback(
    (level: string) => {
      persist((s) => ({ ...s, level }));
    },
    [persist],
  );

  const reviewItem = useCallback(
    (id: string, correct: boolean) => {
      persist((s) => {
        const prev = s.srs[id];
        const box = correct ? Math.min((prev?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0;
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
