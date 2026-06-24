"use client";

import { useState } from "react";
import { Volume2, Check, RotateCcw, ChevronRight, Layers } from "lucide-react";
import { VOCAB_DECKS, type VocabDeck } from "@/lib/content/vocabulary";
import { useProgress } from "@/lib/progress";
import { LevelBadge } from "../SkillPill";

const ACCENT = "var(--gold)";

export function VocabularyView() {
  const { ready, state, markVocab } = useProgress();
  const [deckId, setDeckId] = useState<string | null>(null);
  const deck = VOCAB_DECKS.find((d) => d.id === deckId) ?? null;

  const knownInDeck = (d: VocabDeck) =>
    d.cards.filter((c) => state.vocab?.[c.id]).length;

  if (deck) {
    return (
      <DeckStudy
        deck={deck}
        knownIds={state.vocab ?? {}}
        onRate={markVocab}
        onBack={() => setDeckId(null)}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {VOCAB_DECKS.map((d) => {
        const known = ready ? knownInDeck(d) : 0;
        const pct = (known / d.cards.length) * 100;
        return (
          <button
            key={d.id}
            onClick={() => setDeckId(d.id)}
            className="group rounded-[var(--radius)] border border-line bg-card p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                style={{ background: `color-mix(in srgb, ${ACCENT} 16%, transparent)`, color: ACCENT }}
              >
                <Layers className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{d.title}</h3>
                  <LevelBadge level={d.level} />
                </div>
                <p className="text-sm text-muted">{d.blurb}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: ACCENT }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-muted">
                {known}/{d.cards.length} known
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DeckStudy({
  deck,
  knownIds,
  onRate,
  onBack,
}: {
  deck: VocabDeck;
  knownIds: Record<string, true>;
  onRate: (id: string, known: boolean) => void;
  onBack: () => void;
}) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [gotCount, setGotCount] = useState(0);

  const card = deck.cards[i];
  const isLast = i === deck.cards.length - 1;

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function rate(known: boolean) {
    onRate(card.id, known);
    if (known) setGotCount((n) => n + 1);
    if (isLast) {
      setDone(true);
      return;
    }
    setI((v) => v + 1);
    setFlipped(false);
  }

  function restart() {
    setI(0);
    setFlipped(false);
    setDone(false);
    setGotCount(0);
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-paper"
          style={{ background: ACCENT }}
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold">Deck complete!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          You marked {gotCount} of {deck.cards.length} as known. Come back
          tomorrow to keep them fresh.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={restart}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper"
            style={{ background: ACCENT }}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Study again
          </button>
          <button
            onClick={onBack}
            className="cursor-pointer rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            All decks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="cursor-pointer text-sm text-muted hover:text-ink">
        ← All decks
      </button>

      <div className="mt-3 mb-4 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(i / deck.cards.length) * 100}%`, background: ACCENT }}
        />
      </div>
      <p className="mb-2 text-xs text-muted">
        {deck.title} · card {i + 1} / {deck.cards.length}
        {knownIds[card.id] ? " · already known" : ""}
      </p>

      {/* Flashcard */}
      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
      >
        {!flipped ? (
          <>
            <span className="font-display text-3xl font-semibold">{card.term}</span>
            <span className="text-xs text-muted">Tap to flip</span>
          </>
        ) : (
          <>
            <span className="text-lg font-semibold" style={{ color: ACCENT }}>
              {card.es}
            </span>
            <span className="text-ink-soft">“{card.example}”</span>
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center">
        <button
          onClick={() => speak(`${card.term}. ${card.example}`)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          <Volume2 className="h-4 w-4" strokeWidth={1.75} /> Listen
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => rate(false)}
          className="cursor-pointer rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          Still learning
        </button>
        <button
          onClick={() => rate(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: ACCENT }}
        >
          Got it <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
