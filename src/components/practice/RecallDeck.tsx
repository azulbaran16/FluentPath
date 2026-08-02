"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, Volume2, Eye } from "lucide-react";
import type { RecallItem } from "@/lib/review-items";
import { useProgress } from "@/lib/progress";
import { recallBatches } from "@/lib/recall-batches";

// The ONE recall renderer. The scenario page uses it to study a scenario's own
// phrases and vocabulary, and /review uses it to bring the same items back when
// they fall due — same component, same items, same ids, so the two surfaces
// cannot disagree about what an item is.
//
// Every rating goes through recordAttempt and nothing else: it is the only
// function that computes the Leitner box and the due date together and the only
// one that stamps the merge's instant. No new progress field is written here —
// under D-06 the selection metadata lives in the ID, because srsItemSchema is a
// closed two-field object and a fifth field would be silently dropped by
// sanitizeEntries on the next round trip.

export function RecallDeck({
  items,
  accent = "var(--gold)",
  title,
}: {
  items: RecallItem[];
  accent?: string;
  title?: string;
}) {
  const { recordAttempt, addSkillXp, recordActivity } = useProgress();
  // The deck is snapshotted at mount. On /review the caller's array is derived
  // from the due set, and rating an item correct removes it from that set on
  // the very next render — so reading the live prop would make the deck shrink
  // under the learner's index and skip an item per correct answer.
  const [deck] = useState(() => items);
  // The sitting is divided by ONE author (src/lib/recall-batches.ts) and this
  // component never spells the arithmetic itself — the content harness asserts
  // the split's properties on that pure function, over synthetic lengths and
  // over all 35 real decks.
  //
  // ALL FOUR CALLERS INHERIT THIS, AND THAT IS THE INTENT, NOT A SIDE EFFECT.
  // RecallDeck is the one recall renderer; ScenarioView, ReviewHub, ReviewView
  // and MistakesView all mount it. A due set on /review routinely runs past
  // sixteen items and is the longest un-pausable run anywhere in the app, so it
  // is the surface where a rest point is worth the most — not the one to exempt.
  // There is deliberately no prop to opt a caller out: one renderer, one
  // behaviour, which is the property this component's header exists to protect.
  //
  // A deck of RECALL_BATCH_CEILING or fewer yields exactly one batch holding the
  // whole deck, so every short deck renders precisely as it did before batching
  // existed: `resting` can never become true and `offset` is always 0.
  const batches = useMemo(() => recallBatches(deck), [deck]);
  const [b, setB] = useState(0);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [got, setGot] = useState(0);
  const [done, setDone] = useState(false);
  const [resting, setResting] = useState(false);

  if (deck.length === 0) return null;

  const batch = batches[b];
  // How many cards of the WHOLE sitting are behind the current batch, so the
  // counter and the progress bar keep measuring the sitting rather than
  // restarting at 1 / 14 three times.
  const offset = batches
    .slice(0, b)
    .reduce((sum, previous) => sum + previous.length, 0);
  const seen = offset + i;
  const item = batch[i];
  const isLastInBatch = i === batch.length - 1;
  const isLastBatch = b === batches.length - 1;

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function rate(gotIt: boolean) {
    recordAttempt(item.id, gotIt, { topic: item.topic, level: item.level });
    addSkillXp(item.xpSkill, gotIt ? 8 : 2);
    recordActivity();
    if (gotIt) setGot((n) => n + 1);
    if (isLastInBatch) {
      // Rated either way, the card is already scheduled — recordAttempt above
      // is the only writer and it has already run. So a learner who stops at
      // the rest point loses nothing she has answered.
      if (isLastBatch) setDone(true);
      else setResting(true);
      return;
    }
    setI((v) => v + 1);
    setRevealed(false);
  }

  function carryOn() {
    setB((v) => v + 1);
    setI(0);
    setRevealed(false);
    setResting(false);
  }

  function restart() {
    setB(0);
    setI(0);
    setRevealed(false);
    setGot(0);
    setDone(false);
    setResting(false);
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-paper"
          style={{ background: accent }}
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold">Locked in</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          You got {got} of {deck.length}. They&apos;re scheduled — the ones you
          missed come back tomorrow, the rest a little further out.
        </p>
        <button
          onClick={restart}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Go again
        </button>
      </div>
    );
  }

  if (resting) {
    const throughSoFar = offset + batch.length;
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(throughSoFar / deck.length) * 100}%`,
              background: accent,
            }}
          />
        </div>
        <h3 className="font-display text-2xl font-semibold">
          {throughSoFar} of {deck.length} done
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Good place to stop if you want to — everything you&apos;ve rated is
          already scheduled, and it&apos;ll be waiting when you come back.
          {deck.length - throughSoFar === 1
            ? " There's one card left."
            : ` There are ${deck.length - throughSoFar} cards left.`}
        </p>
        <button
          onClick={carryOn}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: accent }}
        >
          Keep going <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(seen / deck.length) * 100}%`, background: accent }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft">
          {title ?? item.topic}
        </span>
        <span className="text-xs text-muted">
          {seen + 1} / {deck.length}
        </span>
      </div>

      <p className="mt-4 font-display text-2xl font-semibold leading-snug">
        {item.front}
      </p>

      {revealed ? (
        <div className="mt-4">
          <p className="text-xl font-semibold" style={{ color: accent }}>
            {item.back}
          </p>
          {item.hint && (
            <p className="mt-2 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">
              {item.hint}
            </p>
          )}
          <button
            onClick={() => speak(item.back)}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            <Volume2 className="h-4 w-4" strokeWidth={1.75} /> Listen
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Say it in English, then check yourself.
        </p>
      )}

      {revealed ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => rate(false)}
            className="cursor-pointer rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            Not yet
          </button>
          <button
            onClick={() => rate(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: accent }}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} /> Got it
          </button>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setRevealed(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--ink)" }}
          >
            <Eye className="h-4 w-4" strokeWidth={2} /> Show it
          </button>
        </div>
      )}
    </div>
  );
}
