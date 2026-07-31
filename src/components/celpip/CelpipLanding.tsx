"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CELPIP_SECTIONS,
  getListeningSet,
  getSection,
  getSpeakingPrompt,
  getTask,
  type CelpipSkill,
} from "@/lib/celpip";
import {
  formatDuration,
  useCelpipProgress,
  type CelpipAttempt,
  type CelpipListeningAttempt,
  type CelpipProgressState,
  type CelpipSpeakingAttempt,
} from "@/lib/celpip-progress";
import { CELPIP_CARD_ICONS } from "@/lib/icons";
import { CelpipGroupTabs, CelpipTabs } from "./CelpipTabs";
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

/* ------------------------------------------------------------------ *
 * The attempt history — one list, every skill.
 * ------------------------------------------------------------------ */

interface HistoryRow {
  key: string;
  skill: CelpipSkill;
  itemId: string;
  title: string;
  /** null when the id no longer resolves to a bank item. */
  href: string | null;
  date: string;
  /** The skill's own metrics, minus the date, which every row renders. */
  meta: string;
}

interface HistorySource {
  skill: CelpipSkill;
  rows: (state: CelpipProgressState) => HistoryRow[];
}

/**
 * Builds one history source. Generic in the attempt shape so each entry keeps
 * full type-safety over its own record, erased to `HistorySource` at the
 * boundary so the four entries can live in one array.
 */
function historySource<T extends { date: string }>(config: {
  skill: CelpipSkill;
  /** Which record on the stored state this reads. */
  read: (state: CelpipProgressState) => Record<string, T[]>;
  /** undefined when the id resolves to nothing in the bank. */
  title: (itemId: string) => string | undefined;
  /** That skill's metrics line. */
  meta: (attempt: T) => string;
}): HistorySource {
  const routePrefix = getSection(config.skill)?.routePrefix;
  return {
    skill: config.skill,
    rows: (state) =>
      Object.entries(config.read(state)).flatMap(([itemId, attempts]) =>
        attempts.map((attempt) => {
          const title = config.title(itemId);
          return {
            // The id/date pair is the natural key the merge de-duplicates on
            // (progress-merge.ts); the skill prefix is here only because two
            // records now feed one list. The two must stay aligned: a React
            // key that could collide where the merge would not would hide a
            // duplicate attempt rather than reveal it.
            key: `${config.skill}\u0000${itemId}\u0000${attempt.date}`,
            skill: config.skill,
            itemId,
            title: title ?? itemId,
            // T-02.1-08: an id that resolves to nothing never reaches a path.
            // The row renders as plain text instead of as a link, rather than
            // interpolating a stored, unresolved id into a route.
            href:
              title !== undefined && routePrefix !== undefined
                ? `${routePrefix}/${encodeURIComponent(itemId)}`
                : null,
            date: attempt.date,
            meta: config.meta(attempt),
          };
        }),
      ),
  };
}

function checkedCount(checkedRubric: Record<string, boolean>): number {
  return Object.values(checkedRubric).filter(Boolean).length;
}

/**
 * The single extension point for the attempt history.
 *
 * One entry per skill: which record on the stored state it reads, how to
 * resolve a title from an item id, and how to render that skill's own metrics.
 * **A later plan adds ONE entry here per new skill — listening in plan 05,
 * reading in plan 09 — and needs to change nothing else in this file.** The
 * sort, the empty state, the count, the per-card status, the href and the
 * unresolved-id fallback are all driven off these entries.
 *
 * Metrics are per skill on purpose. The old rollup printed a word count for
 * every row; that is meaningless for a spoken or a read attempt, and printing
 * a zero for it would be a small lie on the page whose whole job is honesty.
 */
const HISTORY_SOURCES: HistorySource[] = [
  historySource<CelpipAttempt>({
    skill: "writing",
    read: (state) => state.attempts,
    title: (itemId) => getTask(itemId)?.title,
    meta: (attempt) =>
      `${formatDuration(attempt.durationSeconds)} used · ${attempt.wordCount} words`,
  }),
  historySource<CelpipSpeakingAttempt>({
    skill: "speaking",
    read: (state) => state.speakingAttempts,
    title: (itemId) => getSpeakingPrompt(itemId)?.title,
    meta: (attempt) => {
      const checks = checkedCount(attempt.checkedRubric);
      return [
        `${formatDuration(attempt.durationSeconds)} used`,
        attempt.recorded
          ? `${formatDuration(attempt.recordingSeconds)} recorded`
          : "no recording",
        `${checks} self-check${checks === 1 ? "" : "s"} ticked`,
      ].join(" · ");
    },
  }),
  historySource<CelpipListeningAttempt>({
    skill: "listening",
    read: (state) => state.listeningAttempts,
    title: (itemId) => getListeningSet(itemId)?.title,
    // A score, not a word count. The "read, not heard" note is on here rather
    // than left off because a listening score from an attempt she read the
    // scripts for is not the same result, and a row that hid the difference
    // would be the one small lie on the page whose whole job is honesty.
    meta: (attempt) =>
      [
        `${formatDuration(attempt.durationSeconds)} used`,
        `${attempt.correct}/${attempt.total} correct`,
        ...(attempt.audioFailed ? ["read, not heard"] : []),
      ].join(" · "),
  }),
];

// Module-level so SSR and hydration pick the same tab: the first section
// whose bank actually holds something. Writing is that section today, but
// deriving it means the landing still opens on a real section if Writing were
// ever emptied.
const DEFAULT_SKILL: CelpipSkill = (
  CELPIP_SECTIONS.find((s) => s.coverage.available) ?? CELPIP_SECTIONS[0]
).skill;

export function CelpipLanding() {
  // The store's `ready` flag distinguishes the SSR/pre-hydration baseline
  // (state === CELPIP_EMPTY) from the real localStorage-hydrated state.
  // Since `state` itself already defaults to the empty shape before
  // hydration, deriving status/history straight from `state` is SSR-safe
  // by construction; `ready` is read here only to make that guarantee
  // explicit rather than incidental.
  const { ready, state } = useCelpipProgress();
  const [activeSkill, setActiveSkill] = useState<CelpipSkill>(DEFAULT_SKILL);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const section = useMemo(() => getSection(activeSkill), [activeSkill]);
  const group =
    section?.groups.find((g) => g.key === activeGroup) ?? section?.groups[0];
  const items = group?.items ?? [];

  function selectSkill(skill: CelpipSkill) {
    setActiveSkill(skill);
    setActiveGroup(null);
  }

  const history = useMemo(
    () =>
      HISTORY_SOURCES.flatMap((source) => source.rows(state)).sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    [state],
  );

  // Per-item attempt counts come off the same rows the history renders, so a
  // card's "3 attempts" and the list below it can never disagree.
  const attemptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of history) {
      const key = `${row.skill}\u0000${row.itemId}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [history]);

  function attemptCountFor(skill: CelpipSkill, itemId: string): number {
    return attemptCounts[`${skill}\u0000${itemId}`] ?? 0;
  }

  function statusFor(skill: CelpipSkill, itemId: string): TaskAttemptStatus {
    if (!ready) return "not-started";
    if (attemptCountFor(skill, itemId) > 0) return "completed";
    // `drafts` is a writing-only map — it is the essay autosave, and no other
    // section keeps a resumable half-finished state.
    const draft = state.drafts[itemId];
    if (skill === "writing" && draft && draft.trim().length > 0)
      return "in-progress";
    return "not-started";
  }

  return (
    <div>
      <CelpipTabs active={activeSkill} onChange={selectSkill} />
      {section && (
        <CelpipGroupTabs
          groups={section.groups}
          active={group?.key ?? ""}
          onChange={setActiveGroup}
        />
      )}

      {section?.coverage.caveat && (
        <p className="mt-3 text-xs text-muted">{section.coverage.caveat}</p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section &&
          items.map((item, index) => (
            <TaskCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              timing={item.timing}
              href={`${section.routePrefix}/${item.id}`}
              icon={CELPIP_CARD_ICONS[item.icon]}
              index={index}
              status={statusFor(section.skill, item.id)}
              attemptCount={attemptCountFor(section.skill, item.id)}
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
            {history.map((row) => (
              <li key={row.key}>
                {row.href === null ? (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-4 py-3 text-sm">
                    <HistoryRowBody row={row} />
                    <span className="shrink-0 text-xs text-muted">
                      No longer available
                    </span>
                  </div>
                ) : (
                  <Link
                    href={row.href}
                    className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-4 py-3 text-sm transition-colors hover:bg-paper-deep"
                  >
                    <HistoryRowBody row={row} />
                    <span className="shrink-0 text-xs font-semibold text-sky">
                      View →
                    </span>
                  </Link>
                )}
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

function HistoryRowBody({ row }: { row: HistoryRow }) {
  const sectionLabel = getSection(row.skill)?.label ?? row.skill;
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">{row.title}</p>
      <p className="mt-0.5 text-xs text-muted">
        {sectionLabel} · {formatDate(row.date)} · {row.meta}
      </p>
    </div>
  );
}
