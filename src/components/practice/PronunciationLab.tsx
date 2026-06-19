"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Mic, MicOff, RotateCcw, ChevronRight, Check } from "lucide-react";
import type { Phrase } from "@/lib/content/phrases";

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface Scored {
  score: number; // 0–100
  words: { word: string; ok: boolean }[];
  heard: string;
}

function scoreAttempt(target: string, heard: string): Scored {
  const targetWords = normalize(target).split(" ").filter(Boolean);
  const heardSet = new Set(normalize(heard).split(" ").filter(Boolean));
  const words = targetWords.map((w) => ({ word: w, ok: heardSet.has(w) }));
  const ok = words.filter((w) => w.ok).length;
  const score = targetWords.length ? Math.round((ok / targetWords.length) * 100) : 0;
  return { score, words, heard };
}

export function PronunciationLab({
  phrases,
  accent = "var(--vermilion)",
  onComplete,
}: {
  phrases: Phrase[];
  accent?: string;
  onComplete?: () => void;
}) {
  const [i, setI] = useState(0);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<Scored | null>(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);

  const phrase = phrases[i];
  const isLast = i === phrases.length - 1;

  useEffect(() => {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;
    setSupported(Boolean(Ctor));
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, []);

  const listen = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setError(null);
    setResult(null);
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const heard = e.results[0][0].transcript;
      setResult(scoreAttempt(phrase.text, heard));
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Necesito permiso del micrófono. Actívalo y reintenta."
          : "No te escuché bien. Intenta de nuevo.",
      );
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [phrase]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const next = useCallback(() => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setI((v) => v + 1);
    setResult(null);
    setError(null);
  }, [isLast, onComplete]);

  const progressPct = useMemo(
    () => ((i + (result ? 1 : 0)) / phrases.length) * 100,
    [i, result, phrases.length],
  );

  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      {/* progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progressPct}%`, background: accent }}
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Phrase {i + 1} / {phrases.length}
      </p>

      <h3 className="mt-2 font-display text-2xl font-semibold leading-snug">
        {phrase.text}
      </h3>
      <p className="mt-1 text-sm text-muted">{phrase.es}</p>
      {phrase.tip && (
        <p className="mt-2 rounded-lg bg-paper-deep/60 px-3 py-2 text-xs text-ink-soft">
          💡 {phrase.tip}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => speak(phrase.text)}
          className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          <Volume2 className="h-4 w-4" strokeWidth={1.75} /> Listen
        </button>

        {supported ? (
          <button
            onClick={listening ? stop : listen}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            style={{ background: listening ? "var(--vermilion-deep)" : accent }}
          >
            {listening ? (
              <>
                <MicOff className="h-4 w-4" strokeWidth={1.75} /> Stop
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" strokeWidth={1.75} /> Speak it
              </>
            )}
          </button>
        ) : (
          <span className="rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-sm text-muted">
            El reconocimiento de voz funciona en Chrome / Edge de escritorio.
          </span>
        )}

        {result && (
          <button
            onClick={() => setResult(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Retry
          </button>
        )}
      </div>

      {listening && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: accent }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
          </span>
          Listening… say the phrase out loud.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-vermilion-deep">{error}</p>}

      {result && (
        <div className="mt-5 rounded-xl border border-line bg-paper p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {result.score >= 80
                ? "Excellent! 🎉"
                : result.score >= 50
                  ? "Good — keep practicing."
                  : "Let's try that again."}
            </span>
            <span
              className="font-display text-2xl font-semibold"
              style={{ color: accent }}
            >
              {result.score}%
            </span>
          </div>
          <p className="mt-3 flex flex-wrap gap-1.5 text-sm">
            {result.words.map((w, idx) => (
              <span
                key={idx}
                className={`rounded px-1.5 py-0.5 ${
                  w.ok
                    ? "bg-[color-mix(in_srgb,var(--teal)_15%,transparent)] text-teal"
                    : "bg-[color-mix(in_srgb,var(--vermilion)_15%,transparent)] text-vermilion-deep line-through"
                }`}
              >
                {w.word}
              </span>
            ))}
          </p>
          <p className="mt-2 text-xs text-muted">Heard: “{result.heard}”</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={!result && supported}
          className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
          style={{ background: "var(--ink)" }}
        >
          {isLast ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} /> Finish
            </>
          ) : (
            <>
              Next <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
