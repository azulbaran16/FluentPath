"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { WORLDS, TOTAL_SCENARIOS, type Skill } from "./curriculum";
import {
  EMPTY,
  addDays,
  daysBetween,
  nowInstant,
  today,
  type AttemptStat,
  type ProgressState,
  type SrsItem,
} from "./progress-schema";
import { mergeProgress, progressEqual } from "./progress-merge";

// Local-first progress store + learning engine.
// - Anonymous users: persisted to localStorage (cache).
// - Signed-in users: synced to the server (/api/progress) so progress
//   follows the account across devices, not just one browser.
//
// The state lives in ONE module-level snapshot behind useSyncExternalStore, not
// in per-hook React state: useProgress() has ~17 call sites and /review mounts
// four at once, so a per-hook copy meant four caches of one localStorage key and
// (under D-02) four reconciles per load. Every consumer now reads the same
// object and a mutation in one is visible in all of them on the next render.

// The shape, the empty default and the day helpers live in the framework-free
// contract module so the server can import them too. Re-exported here because
// components and src/lib/achievements.ts import the types from this path.
export type { ProgressState, SrsItem, AttemptStat };

const KEY = "fluentpath:progress:v2";

/** Leitner-style review intervals in days, indexed by box. */
const BOX_DAYS = [0, 1, 3, 7, 16, 30];

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

/** Returns true on a successful write, false if setItem throws (quota
 * exceeded, private browsing, etc). Matches celpip-progress.ts; the retry queue
 * in 02-04 must know whether its own write actually persisted. */
function writeLocal(s: ProgressState): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Module-level store.
 * ------------------------------------------------------------------ */

interface Snapshot {
  state: ProgressState;
  ready: boolean;
}

// A stable singleton: getServerSnapshot must return the same reference on every
// call so SSR and hydration agree, and getSnapshot must return a cached
// reference or React throws "The result of getSnapshot should be cached".
const EMPTY_SNAPSHOT: Snapshot = { state: EMPTY, ready: false };

let snapshot: Snapshot = EMPTY_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

// Hydrating lazily here (rather than in a mount effect that calls setState)
// is what let the react-hooks/set-state-in-effect escape hatch be deleted.
function ensureHydrated() {
  if (hydrated) return;
  hydrated = true;
  snapshot = { state: readLocal(), ready: true };
}

function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

/** Publishes a new state to every consumer. Deliberately does NOT touch the
 * D-01b instant — only the mutation funnel stamps. */
function commit(next: ProgressState) {
  hydrated = true;
  snapshot = { state: next, ready: true };
  emit();
}

/* ------------------------------------------------------------------ *
 * Server sync.
 * ------------------------------------------------------------------ */

// Mirrors useSession().status; owned by useProgressSync, which is mounted
// exactly once (src/components/ProgressSync.tsx).
let authed = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
// Guards D-02's per-load reconcile so it runs at most once per tab per
// authenticated session, no matter how many consumers are mounted.
let reconciled = false;

function putServer(s: ProgressState) {
  fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress: s }),
  }).catch(() => {
    /* offline — local cache still holds the data */
  });
}

function scheduleServerWrite(next: ProgressState) {
  if (!authed) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => putServer(next), 600);
}

/* ------------------------------------------------------------------ *
 * The single mutation funnel.
 * ------------------------------------------------------------------ */

// Every mutation — complete, addSkillXp, recordAttempt, markVocab, setGoalXp,
// setLevel, recordActivity — passes through persist, which is why the D-01b
// activity instant is authored here and in exactly one place in this file. The
// reconcile's own commit must never stamp: reconciling is not learner activity,
// and a stamp there would make the local copy newer than the server on every
// page load, force a write-back every time, and hand vocab to whichever side
// merely loaded the app last.
function persist(updater: (s: ProgressState) => ProgressState): boolean {
  ensureHydrated();
  const prev = snapshot.state;
  const produced = updater(prev);
  if (produced === prev) return true;
  const next = { ...produced, updatedAt: nowInstant() };
  const ok = writeLocal(next);
  commit(next);
  scheduleServerWrite(next);
  return ok;
}

const key = (worldSlug: string, scenarioSlug: string) =>
  `${worldSlug}/${scenarioSlug}`;

/* ------------------------------------------------------------------ *
 * D-02 / D-03: reconcile once per authenticated load, silently.
 * ------------------------------------------------------------------ */

export function useProgressSync() {
  const { status } = useSession();

  useEffect(() => {
    authed = status === "authenticated";
    if (!authed) {
      // Re-arm so a later sign-in reconciles again.
      reconciled = false;
      return;
    }
    if (reconciled) return;
    reconciled = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/progress");
        if (!res.ok || cancelled) return;
        const { progress } = (await res.json()) as {
          progress: ProgressState | null;
        };
        // Read the cache directly rather than through a React closure: the
        // store may have advanced since this effect was created.
        const merged = mergeProgress(readLocal(), progress);
        writeLocal(merged);
        commit(merged);
        // Write back only when the merge actually moved the server's copy.
        // A quiet load leaves both sides equal, so nothing is sent.
        if (!progressEqual(merged, progress)) putServer(merged);
      } catch {
        /* a failed reconcile must never degrade the local session */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);
}

/* ------------------------------------------------------------------ *
 * Public hook — same keys and semantics as before the hoist.
 * ------------------------------------------------------------------ */

export function useProgress() {
  const { state, ready } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const recordActivity = useCallback(() => {
    persist((s) => {
      const t = today();
      if (s.lastActive === t) return s;
      const gap = s.lastActive ? daysBetween(s.lastActive, t) : null;
      const streak = gap === 1 ? s.streak + 1 : 1;
      return { ...s, lastActive: t, streak };
    });
  }, []);

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
        const todayXp = (s.xpDay === t ? s.todayXp : 0) + xpGain;
        return {
          ...s,
          completed: { ...s.completed, [k]: true },
          xp: s.xp + xpGain,
          lastActive: t,
          streak,
          todayXp,
          xpDay: t,
        };
      });
    },
    [],
  );

  const addSkillXp = useCallback((skill: Skill, amount: number) => {
    persist((s) => {
      const t = today();
      const gap = s.lastActive ? daysBetween(s.lastActive, t) : null;
      const streak = s.lastActive === t ? s.streak : gap === 1 ? s.streak + 1 : 1;
      const todayXp = (s.xpDay === t ? s.todayXp : 0) + amount;
      return {
        ...s,
        xp: s.xp + amount,
        skillXp: { ...s.skillXp, [skill]: (s.skillXp[skill] ?? 0) + amount },
        lastActive: t,
        streak,
        todayXp,
        xpDay: t,
      };
    });
  }, []);

  const setLevel = useCallback((level: string) => {
    persist((s) => ({ ...s, level }));
  }, []);

  const setGoalXp = useCallback((goalXp: number) => {
    persist((s) => ({ ...s, goalXp }));
  }, []);

  // Record a quiz attempt: schedules spaced repetition AND tracks per-question
  // stats (for weak-spot detection and the mistake notebook).
  const recordAttempt = useCallback(
    (
      id: string,
      correct: boolean,
      meta?: { topic?: string; level?: string; chosen?: number },
    ) => {
      persist((s) => {
        const prevSrs = s.srs[id];
        const box = correct ? Math.min((prevSrs?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0;
        const due = correct ? addDays(BOX_DAYS[box]) : today();
        const prev = s.attempts[id];
        const stat: AttemptStat = {
          topic: meta?.topic ?? prev?.topic ?? "General",
          level: meta?.level ?? prev?.level,
          tries: (prev?.tries ?? 0) + 1,
          wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
          resolved: correct,
          lastWrongOption: correct ? prev?.lastWrongOption : meta?.chosen,
          updatedAt: today(),
        };
        return {
          ...s,
          srs: { ...s.srs, [id]: { box, due } },
          attempts: { ...s.attempts, [id]: stat },
        };
      });
    },
    [],
  );

  // Backwards-compatible thin wrapper.
  const reviewItem = useCallback(
    (id: string, correct: boolean) => recordAttempt(id, correct),
    [recordAttempt],
  );

  // Mark a vocabulary card as known (or, when false, back to learning).
  const markVocab = useCallback((id: string, known: boolean) => {
    persist((s) => {
      const vocab = { ...s.vocab };
      if (known) vocab[id] = true;
      else delete vocab[id];
      const t = today();
      const gap = s.lastActive ? daysBetween(s.lastActive, t) : null;
      const streak = s.lastActive === t ? s.streak : gap === 1 ? s.streak + 1 : 1;
      return { ...s, vocab, lastActive: t, streak };
    });
  }, []);

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

  // Topics where the learner struggles, worst first.
  const weakTopics = useCallback(() => {
    const byTopic: Record<string, { tries: number; wrong: number }> = {};
    for (const a of Object.values(state.attempts ?? {})) {
      const t = (byTopic[a.topic] ??= { tries: 0, wrong: 0 });
      t.tries += a.tries;
      t.wrong += a.wrong;
    }
    return Object.entries(byTopic)
      .filter(([, v]) => v.wrong > 0)
      .map(([topic, v]) => ({
        topic,
        tries: v.tries,
        wrong: v.wrong,
        accuracy: v.tries ? Math.round(((v.tries - v.wrong) / v.tries) * 100) : 100,
      }))
      .sort((a, b) => b.wrong - a.wrong || a.accuracy - b.accuracy);
  }, [state.attempts]);

  // Question ids the learner got wrong and hasn't yet re-answered correctly.
  const openMistakeIds = useCallback(
    (): string[] =>
      Object.entries(state.attempts ?? {})
        .filter(([, a]) => a.wrong > 0 && !a.resolved)
        .map(([id]) => id),
    [state.attempts],
  );

  const completedCount = Object.keys(state.completed).length;
  const overallProgress = (completedCount / TOTAL_SCENARIOS) * 100;
  const dueCount = dueReviewIds().length;
  const seenCount = Object.keys(state.srs).length;
  const vocabKnownCount = Object.keys(state.vocab ?? {}).length;

  const goalXp = state.goalXp ?? 30;
  const todayXp = state.xpDay === today() ? state.todayXp : 0;
  const dailyGoalPct = goalXp ? Math.min(100, (todayXp / goalXp) * 100) : 0;
  const goalMet = todayXp >= goalXp;
  const weakCount = weakTopics().length;
  const openMistakeCount = openMistakeIds().length;

  return {
    ready,
    state,
    isDone,
    complete,
    addSkillXp,
    setLevel,
    setGoalXp,
    reviewItem,
    recordAttempt,
    markVocab,
    recordActivity,
    worldProgress,
    dueReviewIds,
    weakTopics,
    openMistakeIds,
    completedCount,
    overallProgress,
    dueCount,
    seenCount,
    vocabKnownCount,
    todayXp,
    goalXp,
    dailyGoalPct,
    goalMet,
    weakCount,
    openMistakeCount,
  };
}
