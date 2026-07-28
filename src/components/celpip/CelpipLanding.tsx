"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTask, getTasksByType, type CelpipTaskType } from "@/lib/celpip";
import { formatDuration, useCelpipProgress } from "@/lib/celpip-progress";
import { CelpipTabs } from "./CelpipTabs";
import { TaskCard, type TaskAttemptStatus } from "./TaskCard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function attemptsLabel(n: number): string {
  return n === 1 ? "1 attempt" : `${n} attempts`;
}

export function CelpipLanding() {
  // The store's `ready` flag distinguishes the SSR/pre-hydration baseline
  // (state === CELPIP_EMPTY) from the real localStorage-hydrated state.
  // Since `state` itself already defaults to the empty shape before
  // hydration, deriving status/history straight from `state` is SSR-safe
  // by construction; `ready` is read here only to make that guarantee
  // explicit rather than incidental.
  const { ready, state, completedTasks } = useCelpipProgress();
  const [active, setActive] = useState<CelpipTaskType>("email");
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const tasks = useMemo(() => getTasksByType(active), [active]);

  function statusFor(taskId: string): TaskAttemptStatus {
    if (!ready) return "not-started";
    if (completedTasks.includes(taskId)) return "completed";
    const draft = state.drafts[taskId];
    if (draft && draft.trim().length > 0) return "in-progress";
    return "not-started";
  }

  const history = useMemo(() => {
    return Object.entries(state.attempts)
      .flatMap(([taskId, attempts]) =>
        attempts.map((attempt) => ({
          ...attempt,
          taskTitle: getTask(taskId)?.title ?? taskId,
        })),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.attempts]);

  return (
    <div>
      <CelpipTabs active={active} onChange={setActive} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            status={statusFor(task.id)}
            attemptCount={state.attempts[task.id]?.length ?? 0}
          />
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">
            Attempt history
          </h2>
          {history.length > 0 && (
            <span className="text-xs text-muted">
              {attemptsLabel(history.length)}
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="mt-3 rounded-[var(--radius)] border border-dashed border-line-strong bg-card/50 p-6 text-center">
            <p className="font-display text-base font-semibold">
              No attempts yet
            </p>
            <p className="mt-1 text-sm text-muted">
              Pick a task below and complete your first timed practice — your
              attempt history will show up here.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((attempt) => (
              <li key={`${attempt.taskId}-${attempt.date}`}>
                <Link
                  href={`/celpip/writing/${attempt.taskId}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-4 py-3 text-sm transition-colors hover:bg-paper-deep"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {attempt.taskTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(attempt.date)} ·{" "}
                      {formatDuration(attempt.durationSeconds)} used ·{" "}
                      {attempt.wordCount} words
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-sky">
                    View →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!noticeDismissed && (
        <div className="mt-8 flex items-start justify-between gap-3 rounded-xl border border-line bg-paper-deep/60 p-4 text-sm text-ink-soft md:hidden">
          <p>
            The real CELPIP exam runs on a desktop computer — for the closest
            simulation, try this on a larger screen. You can still practice
            here.
          </p>
          <button
            type="button"
            onClick={() => setNoticeDismissed(true)}
            aria-label="Dismiss notice"
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
