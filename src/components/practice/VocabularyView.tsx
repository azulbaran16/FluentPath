"use client";

import { useMemo, useState } from "react";
import { Volume2, Check, RotateCcw, ChevronRight, Layers, BookOpen, Shuffle } from "lucide-react";
import { VOCAB_DECKS, type VocabDeck, type VocabCard } from "@/lib/content/vocabulary";
import { useProgress } from "@/lib/progress";
import { LevelBadge } from "../SkillPill";
import { Rumi } from "../mascot/Rumi";

const ACCENT = "var(--gold)";

export function VocabularyView() {
  const { ready, state, markVocab } = useProgress();
  const [deckId, setDeckId] = useState<string | null>(null);
  const deck = VOCAB_DECKS.find((d) => d.id === deckId) ?? null;

  const knownInDeck = (d: VocabDeck) =>
    d.cards.filter((c) => state.vocab?.[c.id]).length;

  if (deck) {
    return (
      <DeckView
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
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-line">
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

function DeckView({
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
  const [mode, setMode] = useState<"cards" | "match">("cards");
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="cursor-pointer text-sm text-muted hover:text-ink">
          ← All decks
        </button>
        <div className="inline-flex rounded-xl border border-line bg-card p-1 shadow-[var(--shadow-soft)]">
          <Seg active={mode === "cards"} onClick={() => setMode("cards")} icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />} label="Flashcards" />
          <Seg active={mode === "match"} onClick={() => setMode("match")} icon={<Layers className="h-4 w-4" strokeWidth={1.75} />} label="Match" />
        </div>
      </div>
      {mode === "cards" ? (
        <DeckStudy deck={deck} knownIds={knownIds} onRate={onRate} onBack={onBack} />
      ) : (
        <MatchGame deck={deck} onMatch={(id) => onRate(id, true)} />
      )}
    </div>
  );
}

function Seg({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? "text-paper" : "text-ink-soft hover:bg-paper-deep"
      }`}
      style={active ? { background: "var(--ink)" } : undefined}
    >
      {icon}
      {label}
    </button>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchGame({ deck, onMatch }: { deck: VocabDeck; onMatch: (id: string) => void }) {
  const [round, setRound] = useState(0);
  return (
    <MatchBoard
      key={round}
      deck={deck}
      onMatch={onMatch}
      onNewRound={() => setRound((r) => r + 1)}
    />
  );
}

function MatchBoard({
  deck,
  onMatch,
  onNewRound,
}: {
  deck: VocabDeck;
  onMatch: (id: string) => void;
  onNewRound: () => void;
}) {
  const { addSkillXp } = useProgress();
  const pairs = useMemo(() => shuffle(deck.cards).slice(0, 6), [deck.cards]);
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);

  const [sel, setSel] = useState<{ side: "L" | "R"; id: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ l?: string; r?: string }>({});

  const done = matched.size === pairs.length;

  function tap(side: "L" | "R", card: VocabCard) {
    if (matched.has(card.id) || done) return;
    if (!sel || sel.side === side) {
      setSel({ side, id: card.id });
      return;
    }
    // tapped the opposite column
    if (sel.id === card.id) {
      const nextMatched = new Set(matched).add(card.id);
      setMatched(nextMatched);
      setSel(null);
      onMatch(card.id);
      if (nextMatched.size === pairs.length) addSkillXp("reading", pairs.length);
    } else {
      const w = side === "L" ? { l: card.id, r: sel.id } : { l: sel.id, r: card.id };
      setWrong(w);
      setSel(null);
      setTimeout(() => setWrong({}), 450);
    }
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius)] border border-line bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <Rumi mood="happy" size={92} className="mx-auto" />
        <h3 className="mt-2 font-display text-2xl font-semibold">Round complete!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          {`You matched all ${pairs.length} pairs — they're marked as known. Nice work!`}
        </p>
        <button
          onClick={onNewRound}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper"
          style={{ background: ACCENT }}
        >
          <Shuffle className="h-4 w-4" strokeWidth={1.75} /> New round
        </button>
      </div>
    );
  }

  const tileCls = (active: boolean, isMatched: boolean, isWrong: boolean) =>
    `rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
      isMatched
        ? "cursor-default border-teal bg-[color-mix(in_srgb,var(--teal)_12%,transparent)] text-teal opacity-70"
        : isWrong
          ? "shake border-vermilion bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]"
          : active
            ? "border-gold bg-[color-mix(in_srgb,var(--gold)_12%,transparent)]"
            : "cursor-pointer border-line-strong hover:-translate-y-0.5 hover:bg-paper-deep"
    }`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">Tap an English word, then its meaning.</p>
        <span className="text-xs font-semibold text-muted">
          {matched.size}/{pairs.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2.5">
          {left.map((c) => {
            const m = matched.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => tap("L", c)}
                disabled={m}
                className={tileCls(sel?.side === "L" && sel.id === c.id, m, wrong.l === c.id)}
              >
                {c.term}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5">
          {right.map((c) => {
            const m = matched.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => tap("R", c)}
                disabled={m}
                className={tileCls(sel?.side === "R" && sel.id === c.id, m, wrong.r === c.id)}
              >
                {c.es}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
