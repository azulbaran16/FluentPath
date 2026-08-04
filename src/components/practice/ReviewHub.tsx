"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, NotebookPen, Zap } from "lucide-react";
import type { GrammarQuestion } from "@/lib/content/grammar";
import {
  resolveReviewItem,
  reviewableIds,
  type RecallItem,
} from "@/lib/review-items";
import { CORE_VOCAB_TOPIC } from "@/lib/core-vocab-items";
import { useProgress } from "@/lib/progress";
import { GrammarQuiz } from "./GrammarQuiz";
import { RecallDeck } from "./RecallDeck";
import { ReviewView } from "./ReviewView";
import { MistakesView } from "./MistakesView";
import { Rumi } from "../mascot/Rumi";

// This file had TWO sites resolving through the global grammar bank, two
// hundred lines and one function apart: the "Due today" badge and the
// weak-spots drill. Both go through the shared resolver now. Half-converting
// them would be worse than converting neither — a badge that counts scenario
// items above a drill that cannot produce them promises practice the tab does
// not have.
//
// ------------------------------------------------------------------
// WHY THE VOLUME DECK (04.1) DOES NOT SHOW UP IN THIS SCREEN'S QUEUE.
// ------------------------------------------------------------------
// It is worth stating once here rather than re-deriving it from three files.
// `dueReviewIds()`, `openMistakeIds()` and `weakTopics()` all read the stored
// state with NO FILTER at all. What contains the volume space is:
//
//   · the "Due today" badge below and Dashboard's count both filter the due set
//     through `reviewableIds()`, which deliberately omits the `vocab:` space;
//   · ReviewView and MistakesView do NOT filter — they resolve every stored id
//     through `resolveReviewItem`, which returns undefined for a `vocab:` id
//     because it carries no `#` and matches no global grammar id.
//
// That second one is why src/lib/core-vocab-items.ts must never gain a branch
// in `resolveReviewItem`: the BRANCH, not the enumerator, is what would put
// volume cards into the due list and the mistake notebook. Two places did not
// contain themselves, and both are fixed below.
//
// This file's ONLY permitted knowledge of the volume space is the topic string.
// It must not import the volume resolver or the volume enumerator, and neither
// ReviewView nor MistakesView may reference that module at all — plan 02
// asserts all three from source with comments stripped, so a comment naming the
// module (like this one) cannot make the check lie in either direction.

type Tab = "due" | "mistakes" | "weak";

// Static across the session: the banks are compile-time modules.
const REVIEWABLE_IDS = new Set(reviewableIds());

export function ReviewHub() {
  const initial = (useSearchParams().get("tab") as Tab) || "due";
  const { ready, dueReviewIds, openMistakeIds, weakTopics } = useProgress();
  const [tab, setTab] = useState<Tab>(
    ["due", "mistakes", "weak"].includes(initial) ? initial : "due",
  );

  const dueCount = ready
    ? dueReviewIds().filter((id) => REVIEWABLE_IDS.has(id)).length
    : 0;
  // Counted through the SAME resolver MistakesView renders with, so the badge
  // and the notebook cannot disagree.
  //
  // This is a PRE-EXISTING honesty defect, not new work for the volume deck:
  // the badge counted `openMistakeIds()` unfiltered while the body rendered
  // only what resolved, so an id whose content had since been deleted or
  // renamed already inflated it — a badge reading 1 above a notebook that says
  // "No open mistakes". Fixing it needs no knowledge of the volume space at
  // all, and that is the point: it contains the volume deck as a side effect
  // of being correct rather than by a special case that would have to be
  // remembered.
  const mistakeCount = ready
    ? openMistakeIds().filter((id) => resolveReviewItem(id) !== undefined).length
    : 0;
  const weak = ready ? weakTopics() : [];

  const tabs: { key: Tab; label: string; icon: typeof RefreshCw; count: number; color: string }[] = [
    { key: "due", label: "Due today", icon: RefreshCw, count: dueCount, color: "var(--teal)" },
    { key: "mistakes", label: "Your mistakes", icon: NotebookPen, count: mistakeCount, color: "var(--vermilion)" },
    { key: "weak", label: "Weak spots", icon: Zap, count: weak.length, color: "var(--gold)" },
  ];

  return (
    <div>
      <div role="tablist" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-transparent bg-ink text-paper"
                  : "border-line bg-card text-ink-soft hover:bg-paper-deep"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {t.label}
              {t.count > 0 && (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs ${
                    active ? "bg-paper/25 text-paper" : "text-paper"
                  }`}
                  style={active ? undefined : { background: t.color }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "due" && <ReviewView />}
      {tab === "mistakes" && <MistakesView />}
      {tab === "weak" && <WeakSpots />}
    </div>
  );
}

function WeakSpots() {
  const { ready, weakTopics } = useProgress();
  if (!ready) return <p className="text-muted">Loading…</p>;

  const weak = weakTopics();
  if (weak.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <Rumi mood="happy" size={92} className="mx-auto" />
        <h2 className="mt-2 font-display text-xl font-semibold">No weak spots yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          As you practice, the topics you struggle with show up here so you can
          drill them directly.
        </p>
        <Link
          href="/skill/grammar"
          className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--plum)" }}
        >
          Practice grammar →
        </Link>
      </div>
    );
  }

  // The drill is built by resolving every reviewable id and keeping the ones
  // whose topic is weak — the same resolver the badge above counts through, so
  // the two cannot disagree. A weak topic is a grammar topic OR a scenario
  // title, because that is what recordAttempt stores in `attempts[id].topic`.
  const weakSet = new Set(weak.map((w) => w.topic));
  const questions: GrammarQuestion[] = [];
  const recall: RecallItem[] = [];
  const practisableTopics = new Set<string>();
  for (const id of REVIEWABLE_IDS) {
    const resolved = resolveReviewItem(id);
    if (!resolved) continue;
    const topic =
      resolved.kind === "grammar" ? resolved.question.topic : resolved.item.topic;
    if (!weakSet.has(topic)) continue;
    practisableTopics.add(topic);
    if (resolved.kind === "grammar") questions.push(resolved.question);
    else recall.push(resolved.item);
  }

  // The volume tier is weak-ABLE here but not drillable here, and that
  // combination is new. `recordAttempt` stores CORE_VOCAB_TOPIC like any other
  // topic and `weakTopics()` groups by it with no filter, so a missed volume
  // card genuinely does raise "Core vocabulary" as a weak topic. The drill
  // below is built from `reviewableIds()`, which omits the volume space by
  // design (L5), so it finds nothing — and without this branch the learner
  // would be told that practice "isn't written yet", which is FALSE: it is
  // written, on another surface, and she is one click from it.
  //
  // So the topic stays visible, because she really is weak on it, and the
  // not-written line is replaced by a link. The drill itself still produces no
  // volume card, because it is still built from `reviewableIds()` alone.
  const volumeIsWeak = weak.some((w) => w.topic === CORE_VOCAB_TOPIC);

  // Naming a topic the learner cannot drill and then handing her an empty quiz
  // is the failure this branch exists to prevent: say plainly that nothing is
  // written for it yet. The volume tier is excluded because for it the
  // statement would be untrue.
  const unpractisable = weak.filter(
    (w) => !practisableTopics.has(w.topic) && w.topic !== CORE_VOCAB_TOPIC,
  );

  const pills = (
    <div className="mb-4 flex flex-wrap gap-2">
      {weak.slice(0, 5).map((w) => (
        <span
          key={w.topic}
          className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-soft"
        >
          {w.topic} · {w.accuracy}%
        </span>
      ))}
    </div>
  );

  const nothingYet = unpractisable.length > 0 && (
    <p className="mt-4 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
      Nothing to drill yet for {unpractisable.map((w) => w.topic).join(", ")} —
      that practice isn&apos;t written yet.
    </p>
  );

  const volumeElsewhere = volumeIsWeak && (
    <p className="mt-4 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
      {CORE_VOCAB_TOPIC} has its own deck and its own queue —{" "}
      <Link
        href="/core-vocabulary"
        className="font-semibold underline hover:text-ink"
      >
        study what&apos;s due there
      </Link>
      .
    </p>
  );

  if (questions.length === 0 && recall.length === 0) {
    // Exactly one of the two blocks below always renders: `weak` is non-empty
    // here (the empty case returned above), so if the volume tier is not weak
    // then `unpractisable` cannot be empty. There is no path to a blank tab.
    return (
      <div>
        <p className="mb-3 text-sm text-muted">
          Topics you miss most — let&apos;s turn them around.
        </p>
        {pills}
        {volumeElsewhere}
        {unpractisable.length > 0 && (
          <div className="mt-4 rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
            <Rumi mood="idle" size={92} className="mx-auto" />
            <h2 className="mt-2 font-display text-xl font-semibold">
              Nothing to drill for these yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              We haven&apos;t written practice for{" "}
              {unpractisable.length === 1 ? "this topic" : "these topics"} yet.
              Practising somewhere else in the app will bring it back here once
              it exists.
            </p>
            <Link
              href="/skill/grammar"
              className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--plum)" }}
            >
              Practice grammar →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Topics you miss most — let&apos;s turn them around.
      </p>
      {pills}
      {recall.length > 0 && (
        <RecallDeck
          items={recall}
          accent="var(--gold)"
          title="Phrases & vocabulary"
        />
      )}
      {questions.length > 0 && (
        <div className={recall.length > 0 ? "mt-6" : undefined}>
          <GrammarQuiz questions={questions} accent="var(--gold)" />
        </div>
      )}
      {volumeElsewhere}
      {nothingYet}
    </div>
  );
}
