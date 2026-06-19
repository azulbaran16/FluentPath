"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import type { WritingPrompt } from "@/lib/content/writing";
import { LevelBadge } from "../SkillPill";

export function WritingDesk({
  prompts,
  accent = "var(--sky)",
}: {
  prompts: WritingPrompt[];
  accent?: string;
}) {
  const [activeId, setActiveId] = useState(prompts[0]?.id);
  const prompt = prompts.find((p) => p.id === activeId) ?? prompts[0];
  const [text, setText] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);

  const storageKey = `fluentpath:writing:${prompt.id}`;

  // Reset the editor and load the saved draft when the active prompt changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setShowModel(false);
    setChecked({});
    setSaved(false);
    try {
      setText(window.localStorage.getItem(storageKey) ?? "");
    } catch {
      setText("");
    }
  }, [storageKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const words = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const inRange = words >= prompt.minWords && words <= prompt.maxWords;

  function save() {
    try {
      window.localStorage.setItem(storageKey, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      {/* prompt picker */}
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              p.id === activeId
                ? "text-paper"
                : "border-line-strong hover:bg-paper-deep"
            }`}
            style={p.id === activeId ? { background: accent, borderColor: accent } : undefined}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {/* task + editor */}
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2">
            <LevelBadge level={prompt.level} />
            <span className="text-xs text-muted">
              {prompt.minWords}–{prompt.maxWords} words
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{prompt.title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{prompt.task}</p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer here…"
            rows={10}
            className="mt-4 w-full resize-y rounded-xl border border-line-strong bg-paper p-3 text-sm leading-relaxed outline-none transition-colors focus:border-sky"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={inRange ? "font-semibold text-teal" : "text-muted"}>
              {words} words {inRange ? "✓ in range" : `(target ${prompt.minWords}–${prompt.maxWords})`}
            </span>
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-1.5 font-semibold transition-colors hover:bg-paper-deep"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
              {saved ? "Saved!" : "Save draft"}
            </button>
          </div>
        </div>

        {/* checklist + model */}
        <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-display text-lg font-semibold">Self-check</h3>
          <p className="text-xs text-muted">
            Tick each point once your draft covers it.
          </p>
          <ul className="mt-3 space-y-2">
            {prompt.checklist.map((item, idx) => (
              <li key={idx}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[idx])}
                    onChange={(e) =>
                      setChecked((c) => ({ ...c, [idx]: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 accent-sky"
                    style={{ accentColor: accent }}
                  />
                  <span className={checked[idx] ? "text-muted line-through" : ""}>
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowModel((v) => !v)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
          >
            {showModel ? (
              <>
                <EyeOff className="h-4 w-4" strokeWidth={1.75} /> Hide model answer
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" strokeWidth={1.75} /> Show model answer
              </>
            )}
          </button>

          {showModel && (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-paper-deep/50 p-4 font-sans text-sm leading-relaxed text-ink-soft">
              {prompt.model}
            </pre>
          )}

          <p className="mt-4 text-xs text-muted">
            ✍️ Detailed AI correction of your own text arrives with the tutor
            (final phase).
          </p>
        </div>
      </div>
    </div>
  );
}
