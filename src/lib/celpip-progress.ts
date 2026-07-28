"use client";

import { useCallback, useEffect, useState } from "react";
import type { CelpipTaskType } from "./celpip";

// Local-first CELPIP attempt store. Mirrors progress.ts's defensive
// read/write pattern but has NO server sync in this phase — Phase 2
// migrates this namespace to Postgres once server-side progress exists.
// Shape is deliberately flat and serializable (no functions/class
// instances) — this is the Phase 2 migration contract.

const KEY = "fluentpath.celpip.v1";

export interface CelpipAttempt {
  taskId: string;
  taskType: CelpipTaskType;
  /** ISO timestamp of submission. */
  date: string;
  durationSeconds: number;
  wordCount: number;
  text: string;
  /** Rubric item id -> checked state for this attempt. */
  checkedRubric: Record<string, boolean>;
  outOfTime: boolean;
}

export interface CelpipProgressState {
  attempts: Record<string, CelpipAttempt[]>;
  drafts: Record<string, string>;
}

export const CELPIP_EMPTY: CelpipProgressState = {
  attempts: {},
  drafts: {},
};

function readLocal(): CelpipProgressState {
  if (typeof window === "undefined") return CELPIP_EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...CELPIP_EMPTY, ...JSON.parse(raw) } : CELPIP_EMPTY;
  } catch {
    return CELPIP_EMPTY;
  }
}

/** Returns true on a successful write, false if setItem throws (quota
 * exceeded, private browsing, etc). Callers use this to surface a visible
 * warning instead of silently losing the write. */
function writeLocal(s: CelpipProgressState): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export function useCelpipProgress() {
  const [state, setState] = useState<CelpipProgressState>(CELPIP_EMPTY);
  const [ready, setReady] = useState(false);

  // Instant local hydrate after mount (SSR-safe: server renders the empty
  // state, then the client fills it in from localStorage).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setState(readLocal());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback(
    (updater: (s: CelpipProgressState) => CelpipProgressState): boolean => {
      let ok = true;
      setState((prev) => {
        const next = updater(prev);
        ok = writeLocal(next);
        return next;
      });
      return ok;
    },
    [],
  );

  const addAttempt = useCallback(
    (taskId: string, attempt: CelpipAttempt) => {
      persist((s) => ({
        ...s,
        attempts: {
          ...s.attempts,
          [taskId]: [...(s.attempts[taskId] ?? []), attempt],
        },
      }));
    },
    [persist],
  );

  /** Returns true on a successful save, false if the underlying localStorage
   * write threw — callers surface a visible warning on false. */
  const saveDraft = useCallback(
    (taskId: string, text: string): boolean =>
      persist((s) => ({
        ...s,
        drafts: { ...s.drafts, [taskId]: text },
      })),
    [persist],
  );

  /** Drops a task's saved draft. Called once an attempt is recorded so the
   * next attempt starts from a blank editor under real exam conditions —
   * a submitted answer must never pre-fill the next timed run. */
  const clearDraft = useCallback(
    (taskId: string) =>
      persist((s) => {
        if (!(taskId in s.drafts)) return s;
        const drafts = { ...s.drafts };
        delete drafts[taskId];
        return { ...s, drafts };
      }),
    [persist],
  );

  const draftFor = useCallback(
    (taskId: string) => state.drafts[taskId] ?? "",
    [state.drafts],
  );

  const attemptsForTask = useCallback(
    (taskId: string) => state.attempts[taskId] ?? [],
    [state.attempts],
  );

  const lastAttempt = useCallback(
    (taskId: string) => {
      const list = state.attempts[taskId];
      return list && list.length > 0 ? list[list.length - 1] : undefined;
    },
    [state.attempts],
  );

  const completedTasks = Object.keys(state.attempts).filter(
    (taskId) => (state.attempts[taskId]?.length ?? 0) > 0,
  );

  return {
    ready,
    state,
    addAttempt,
    saveDraft,
    clearDraft,
    draftFor,
    attemptsForTask,
    lastAttempt,
    completedTasks,
  };
}
