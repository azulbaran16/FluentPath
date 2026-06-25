"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getScenario } from "@/lib/curriculum";
import { Mic } from "lucide-react";
import { Rumi } from "./mascot/Rumi";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function Tutor() {
  const params = useSearchParams();
  const scenarioParam = params.get("scenario") ?? undefined;
  const askParam = params.get("q") ?? undefined;
  const scenarioInfo = scenarioParam
    ? getScenario(...(scenarioParam.split("/") as [string, string]))
    : undefined;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // On load: if arriving with a question (?q=), ask it; otherwise just greet.
  useEffect(() => {
    if (askParam) void send(askParam);
    else void send("", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string, silent = false) {
    const nextMsgs = silent
      ? messages
      : [...messages, { role: "user" as const, content: text }];
    if (!silent) setMessages(nextMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs, scenario: scenarioParam }),
      });
      const data = (await res.json()) as { reply: string; stub: boolean };
      setDemo(data.stub);
      setMessages([
        ...nextMsgs,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages([
        ...nextMsgs,
        {
          role: "assistant",
          content: "⚠️ Couldn't reach the tutor. Is the dev server running?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-3xl flex-col lg:h-[calc(100dvh-5rem)]">
      <header className="rise flex items-center justify-between gap-3 rounded-[var(--radius)] border border-line bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper-deep">
            <Rumi mood={loading ? "thinking" : "idle"} size={40} />
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight">
              Rumi · your tutor
            </h1>
            <p className="text-xs text-muted">
              {scenarioInfo
                ? `Practicing: ${scenarioInfo.scenario.title}`
                : "Free conversation"}
            </p>
          </div>
        </div>
        {demo && (
          <span className="rounded-full border border-gold/40 bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] px-3 py-1 text-xs font-semibold text-gold">
            Demo mode
          </span>
        )}
      </header>

      <div
        ref={scrollRef}
        className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-[var(--radius)] border border-line bg-card p-4 shadow-[var(--shadow-soft)]"
      >
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} />
        ))}
        {loading && <Bubble role="assistant" text="…" pulse />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading) void send(input.trim());
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type in English…"
          className="flex-1 rounded-xl border border-line-strong bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-vermilion"
          style={{ borderColor: undefined }}
        />
        <button
          type="button"
          title="Voice input arrives in Fase 3"
          aria-label="Voice input (coming soon)"
          className="grid h-12 w-12 place-items-center rounded-xl border border-line-strong text-muted transition-colors hover:bg-paper-deep"
        >
          <Mic className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-xl px-5 py-3 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: "var(--vermilion)" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Bubble({
  role,
  text,
  pulse,
}: {
  role: "user" | "assistant";
  text: string;
  pulse?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="grid h-8 w-8 shrink-0 place-items-center self-end rounded-full bg-paper-deep">
          <Rumi mood={pulse ? "thinking" : "idle"} size={26} />
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-ink text-paper"
            : "border border-line bg-paper text-ink"
        } ${pulse ? "animate-pulse" : ""}`}
      >
        {text}
      </div>
    </div>
  );
}
