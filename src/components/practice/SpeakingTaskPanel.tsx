"use client";

import { useState } from "react";
import { Mic, Check } from "lucide-react";
import type { ScenarioSpeakingTask } from "@/lib/content/scenario-speaking";
import { useProgress } from "@/lib/progress";
import { LevelBadge } from "../SkillPill";

// The renderer for a scenario's rehearsal task: a setup, three ordered moves as
// a tickable self-check, and the success line the learner measures herself
// against. The self-check is deliberately the same shape `WritingDesk` already
// uses, so the two surfaces read as one product rather than as two authors.
//
// NO AI AND NO MICROPHONE. There is no fetch, no speechSynthesis, no
// SpeechRecognition and no recording anywhere in this file, and
// scripts/verify-scenario-content.mts reads this source and asserts so. That is
// not an aesthetic choice: the tutor role-play is a clearly-labelled stub until
// ANTHROPIC_API_KEY is configured (Phase 5), so an exercise that leaned on it
// would not be practicable today. The learner speaks aloud on her own and judges
// herself — which is why the footer says plainly that nothing here is listening.
//
// NOTHING IS SCORED, SO NOTHING IS SCHEDULED. This panel calls `addSkillXp` and
// `recordActivity` and nothing else. It never calls `recordAttempt`, so no
// srs["…#speaking#…"] entry is ever written, and the task's id is deliberately
// absent from `reviewableIds()` — a ticked box is a self-report, and scheduling
// a self-report would put an item in the review queue that nothing can ever mark
// wrong. See the header of scenario-speaking.ts and SCHEDULED_ITEM_KINDS.
//
// The award fires ONCE, when the set of ticks first completes. Unticking and
// re-ticking does not award again (T-03-22): `awarded` latches and is never
// cleared.

/** One full rehearsal. A grammar question is 10 and finishing a whole scenario
 * is 20 (progress.ts), so three moves spoken aloud sits between the two. */
const REHEARSAL_XP = 15;

export function SpeakingTaskPanel({
  task,
  accent = "var(--vermilion)",
}: {
  task: ScenarioSpeakingTask;
  accent?: string;
}) {
  const { addSkillXp, recordActivity } = useProgress();
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [awarded, setAwarded] = useState(false);

  const doneCount = task.moves.filter((_, i) => checked[i]).length;
  const allDone = doneCount === task.moves.length;

  function toggle(index: number, next: boolean) {
    const updated = { ...checked, [index]: next };
    setChecked(updated);
    if (!awarded && task.moves.every((_, i) => updated[i])) {
      addSkillXp("speaking", REHEARSAL_XP);
      recordActivity();
      setAwarded(true);
    }
  }

  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <Mic className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <LevelBadge level={task.level} />
            <span className="text-xs text-muted">say it out loud</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold">
            {task.title}
          </h3>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-soft">{task.setup}</p>

      <ol className="mt-5 space-y-2">
        {task.moves.map((move, idx) => (
          <li key={idx}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(checked[idx])}
                onChange={(e) => toggle(idx, e.target.checked)}
                className="mt-0.5 h-4 w-4"
                style={{ accentColor: accent }}
              />
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold text-paper"
                style={{ background: accent }}
                aria-hidden="true"
              >
                {idx + 1}
              </span>
              <span className={checked[idx] ? "text-muted line-through" : ""}>
                {move}
              </span>
            </label>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl bg-paper-deep/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          You did it if
        </p>
        <p className="mt-1 text-sm text-ink-soft">{task.success}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted">
          {doneCount} of {task.moves.length} moves rehearsed
        </span>
        {allDone && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-paper"
            style={{ background: accent }}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Rehearsed
          </span>
        )}
      </div>

      <p className="mt-4 text-xs text-muted">
        Nothing here is listening or marking you — this is your own rehearsal,
        and you tick a move when you have said it out loud. For live correction,
        take the same situation to Rumi, your AI Tutor, in the role-play step
        below.
      </p>
    </div>
  );
}
