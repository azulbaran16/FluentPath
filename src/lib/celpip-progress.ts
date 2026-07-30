"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import {
  CELPIP_EMPTY,
  nowInstant,
  safeReadCelpip,
  type CelpipAttempt,
  type CelpipProgressState,
} from "./progress-schema";
import { celpipEqual, mergeCelpip } from "./progress-merge";
import { enqueue, flushQueue } from "./sync-queue";

// Local-first CELPIP attempt store, now synced to Postgres.
// - Anonymous learners: purely local, exactly as in Phase 1.
// - Signed-in learners: synced through the shared queue's own CELPIP slot
//   (D-05), so the beta user's attempt history follows her account across
//   devices instead of living in one browser.
//
// Shape is deliberately flat and serializable — the shapes themselves live in
// progress-schema.ts beside their zod contract, so the client store, the route
// handler and the verification scripts read one definition. They are
// re-exported here unchanged so every existing importer keeps resolving.
//
// The state lives in ONE module-level snapshot behind useSyncExternalStore
// rather than in per-hook React state, mirroring what 02-01 did to the progress
// store: the landing and the simulator both mount this hook, and a per-hook
// copy meant two caches of one localStorage key and (under D-02) two reconciles
// per load.

const KEY = "fluentpath.celpip.v1";

/** Slower than the progress store's 600ms, on purpose. This payload carries the
 * learner's essay prose and the simulator autosaves a draft as they type, so a
 * tighter debounce would push the whole history on every pause in typing. The
 * separate queue slot is what already stops an XP tick from carrying any essay
 * at all; this is what stops a keystroke from carrying one. */
const SAVE_DEBOUNCE_MS = 2_000;

export { CELPIP_EMPTY };
export type { CelpipAttempt, CelpipProgressState };

/** Renders an attempt's durationSeconds as m:ss — shared by the results
 * metrics strip and the landing's attempt-history rows so both read the same. */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** The cache is read through the SAME contract the server reads its column
 * with, so a corrupted localStorage entry degrades to the empty state exactly
 * the way a corrupted Postgres row does — and a single malformed attempt costs
 * only itself. The try/catch stays because `getItem` itself throws in some
 * privacy modes: that is a different failure from unreadable contents, which
 * safeReadCelpip owns. */
function readLocal(): CelpipProgressState {
  if (typeof window === "undefined") return CELPIP_EMPTY;
  try {
    return safeReadCelpip(window.localStorage.getItem(KEY));
  } catch {
    return CELPIP_EMPTY;
  }
}

/** Returns true on a successful write, false if setItem throws (quota
 * exceeded, private browsing, etc). Callers use this to surface a visible
 * warning instead of silently losing the write — the simulator shows one on a
 * false return, and Phase 1 verified that path. */
function writeLocal(s: CelpipProgressState): boolean {
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
  state: CelpipProgressState;
  ready: boolean;
}

// A stable singleton: getServerSnapshot must return the same reference on every
// call so SSR and hydration agree, and getSnapshot must return a cached
// reference or React throws "The result of getSnapshot should be cached".
const EMPTY_SNAPSHOT: Snapshot = { state: CELPIP_EMPTY, ready: false };

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

// Publishes a new state to every consumer. Deliberately does NOT touch the
// D-01b instant — only the mutation funnel below stamps. The reconcile commits
// through here for exactly that reason.
function commit(next: CelpipProgressState) {
  hydrated = true;
  snapshot = { state: next, ready: true };
  emit();
}

/* ------------------------------------------------------------------ *
 * Server sync.
 * ------------------------------------------------------------------ */

// Mirrors useSession().status; owned by useCelpipSync, which is mounted
// exactly once (src/components/ProgressSync.tsx).
let authed = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
// Guards D-02's per-load reconcile so it runs at most once per tab per
// authenticated session, no matter how many consumers are mounted.
let reconciled = false;

/** Hands the snapshot to the durable queue (D-07) and asks it to drain now.
 *
 * The CELPIP slot is separate from the progress one, which is the whole point
 * of D-05: an XP tick never re-uploads an essay, and a draft autosave never
 * re-uploads the review queue.
 *
 * The snapshot goes in EXACTLY as persist() produced it, D-01b instant
 * included and unmodified. The queue is a transport, not a mutation site.
 *
 * The flush is deliberately not awaited. The learner never waits on the
 * network — the local write already happened, synchronously, in persist(). */
function putServer(s: CelpipProgressState) {
  enqueue("celpip", s);
  void flushQueue();
}

function scheduleServerWrite(next: CelpipProgressState) {
  if (!authed) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => putServer(next), SAVE_DEBOUNCE_MS);
}

/* ------------------------------------------------------------------ *
 * The single mutation funnel.
 * ------------------------------------------------------------------ */

// Every mutation — addAttempt, saveDraft, clearDraft — passes through persist,
// which is why the D-01b activity instant is authored here and in exactly one
// place in this file.
//
// clearDraft is the call that makes this load-bearing. It runs the moment an
// attempt is submitted, and the merge takes the drafts map WHOLE from the side
// with the later instant — so the device that cleared must be the one carrying
// it, or the larger (stale) map wins and the submitted answer pre-fills the
// next timed run. That is the Phase 1 defect fca41b7 fixed.
//
// The reconcile's own commit must never stamp: reconciling is not learner
// activity, and a stamp there would make the local copy newer than the server
// on every page load, force a write-back every time, and hand the drafts map
// to whichever device merely loaded the app last.
function persist(
  updater: (s: CelpipProgressState) => CelpipProgressState,
): boolean {
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

/* ------------------------------------------------------------------ *
 * D-02 / D-03: reconcile once per authenticated load, silently.
 * ------------------------------------------------------------------ */

export function useCelpipSync() {
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
        // Drain first, reconcile second. A queued snapshot means the server's
        // copy is known-stale, and merging against it would join with data the
        // queue is about to overwrite anyway.
        await flushQueue();
        if (cancelled) return;
        const res = await fetch("/api/celpip-progress");
        if (!res.ok || cancelled) return;
        const { celpipProgress } = (await res.json()) as {
          celpipProgress: CelpipProgressState | null;
        };
        // Read the cache directly rather than through a React closure: the
        // store may have advanced since this effect was created.
        const merged = mergeCelpip(readLocal(), celpipProgress);
        writeLocal(merged);
        commit(merged);
        // Write back only when the merge actually moved the server's copy.
        // A quiet load leaves both sides equal, so nothing is sent.
        if (!celpipEqual(merged, celpipProgress)) putServer(merged);
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

export function useCelpipProgress() {
  const { state, ready } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
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
    [],
  );

  /** Returns true on a successful save, false if the underlying localStorage
   * write threw — callers surface a visible warning on false. */
  const saveDraft = useCallback(
    (taskId: string, text: string): boolean =>
      persist((s) => ({
        ...s,
        drafts: { ...s.drafts, [taskId]: text },
      })),
    [],
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
    [],
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
