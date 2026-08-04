"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, RefreshCw, ChevronRight } from "lucide-react";
import {
  coreVocabBands,
  coreVocabIds,
  coreVocabRecallItems,
  resolveCoreVocabItem,
  CORE_VOCAB_TITLE,
} from "@/lib/core-vocab-items";
import { useProgress } from "@/lib/progress";
import { RecallDeck } from "./RecallDeck";
import { Rumi } from "../mascot/Rumi";

// The volume tier's surface, and the whole of "its own queue" (L5): the Leitner
// engine, recordAttempt and the srs store are SHARED with /review — only the
// queue is not. What is due here is `state.srs` filtered through this tier's own
// enumerator, and /review's due list never learns the key space exists.
//
// EVERY NUMBER ON THIS PAGE IS DERIVED — from the bank's length, from
// coreVocabBands().length, and from the learner's own srs. Not one count is
// written into the copy. That is the rule this project has held since Phase 2.1,
// and here it is what stops the page claiming five hundred words while twenty
// are written: it reports twenty because twenty is what exists.
//
// AND THERE IS NO DURATION CLAIM, for a band or for the deck. A scenario's
// `minutes` is a GATED claim — asserted against its own bank sizes for all 35
// scenarios — so a minute figure here would be an un-gated one, which is the
// exact class of claim this project has spent three phases removing. If a time
// estimate is ever wanted here, it arrives with its assertion or not at all.

const ACCENT = "var(--sky)";

// Static across the session: the bank is a compile-time module.
const ALL_ITEMS = coreVocabRecallItems();
const BANDS = coreVocabBands();
const VOLUME_IDS = new Set(coreVocabIds());

type Study = { kind: "due" } | { kind: "band"; index: number };

export function CoreVocabView() {
  const { ready, state, dueReviewIds } = useProgress();
  const [study, setStudy] = useState<Study | null>(null);

  const srs = state.srs ?? {};
  const isMet = (id: string) => Boolean(srs[id]);
  const dueIds = ready
    ? new Set(dueReviewIds().filter((id) => VOLUME_IDS.has(id)))
    : new Set<string>();

  const metCount = ready
    ? ALL_ITEMS.filter((item) => isMet(item.id)).length
    : 0;
  const dueCount = dueIds.size;

  if (study) {
    const items =
      study.kind === "due"
        ? [...dueIds]
            .map((id) => resolveCoreVocabItem(id))
            .filter((item) => item !== undefined)
        : BANDS[study.index];

    return (
      <div>
        <button
          onClick={() => setStudy(null)}
          className="mb-3 cursor-pointer text-sm text-muted hover:text-ink"
        >
          ← Back to bands
        </button>
        <RecallDeck
          key={study.kind === "due" ? "due" : `band-${study.index}`}
          items={items}
          accent={ACCENT}
          title={CORE_VOCAB_TITLE}
        />
      </div>
    );
  }

  return (
    <div>
      {/* The tier, said out loud (L4). It names the difference rather than
          implying the two tiers are the same thing at different sizes. */}
      <section className="rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
            style={{
              background: `color-mix(in srgb, ${ACCENT} 16%, transparent)`,
              color: ACCENT,
            }}
          >
            <BookMarked className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-ink-soft">
              These are the most frequent words in English, in order of how often
              they actually turn up. Each one comes with a translation and one
              example sentence — and nothing else.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              They are <strong>not</strong> the scenario cards. Those carry a
              register note — who says a thing, to whom, and what getting it
              wrong costs — and they come back in your daily{" "}
              <Link href="/review" className="underline hover:text-ink">
                Review
              </Link>
              . These are the breadth tier: more words, less around each one, on
              their own schedule.
            </p>
          </div>
        </div>
      </section>

      {/* Every figure below is read off the bank or off the learner's own srs. */}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={ALL_ITEMS.length === 1 ? "word" : "words"} value={ALL_ITEMS.length} />
        <Stat label={BANDS.length === 1 ? "band" : "bands"} value={BANDS.length} />
        <Stat label="you've met" value={ready ? metCount : "—"} />
        <Stat label="due today" value={ready ? dueCount : "—"} />
      </dl>

      {ready && dueCount > 0 && (
        <button
          onClick={() => setStudy({ kind: "due" })}
          className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: ACCENT }}
        >
          <RefreshCw className="h-4 w-4" strokeWidth={2} />
          Study what&apos;s due ({dueCount})
        </button>
      )}

      {ready && dueCount === 0 && metCount > 0 && (
        <p className="mt-4 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
          Nothing due here today. Everything you&apos;ve rated comes back on its
          own schedule — start a band below to meet more words.
        </p>
      )}

      <h2 className="mt-7 font-display text-xl font-semibold">Bands</h2>
      <p className="mt-1 text-sm text-muted">
        In frequency order, most common first.
      </p>

      {BANDS.length === 0 ? (
        <div className="mt-3 rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
          <Rumi mood="idle" size={92} className="mx-auto" />
          <h3 className="mt-2 font-display text-xl font-semibold">
            No words written yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            This deck is empty. When words are added they show up here
            automatically — this page counts what exists rather than what was
            promised.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {BANDS.map((band, index) => {
            const met = ready
              ? band.filter((item) => isMet(item.id)).length
              : 0;
            const due = ready
              ? band.filter((item) => dueIds.has(item.id)).length
              : 0;
            const pct = (met / band.length) * 100;
            return (
              <button
                key={index}
                onClick={() => setStudy({ kind: "band", index })}
                className="group rounded-[var(--radius)] border border-line bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      Band {index + 1}
                    </h3>
                    <p className="truncate text-sm text-muted">
                      {band[0].back} → {band[band.length - 1].back}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: ACCENT }}
                    />
                  </div>
                  <p className="mt-1 flex justify-between text-xs text-muted">
                    <span>
                      {ready ? met : "—"}/{band.length} met
                    </span>
                    {ready && due > 0 && <span>{due} due</span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-4 shadow-[var(--shadow-soft)]">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-2xl font-semibold">{value}</dd>
    </div>
  );
}
