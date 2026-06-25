"use client";

import { useState } from "react";
import { Copy, Check, Gift, Users, Sparkles } from "lucide-react";
import { Rumi } from "./mascot/Rumi";

export function InviteCard({
  link,
  count,
  rewardDays,
}: {
  link: string;
  count: number;
  rewardDays: number;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const message = `I'm learning English with FluentPath — practice real conversations with an AI tutor. Sign up with my link and we both get ${rewardDays} days of Pro free: ${link}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "FluentPath", text: message, url: link });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex items-center gap-4">
        <Rumi mood="happy" size={72} />
        <div>
          <h2 className="font-display text-2xl font-semibold">Give Pro, get Pro</h2>
          <p className="mt-1 text-sm text-muted">
            Share your link. When a friend joins, you <b>both</b> get {rewardDays}{" "}
            days of Pro free.
          </p>
        </div>
      </div>

      {/* Link + copy */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm outline-none"
        />
        <button
          onClick={copy}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--ink)" }}
        >
          {copied ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Share shortcuts */}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          Share on WhatsApp
        </a>
        <button
          onClick={share}
          className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
        >
          More options…
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-paper-deep/60 p-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Users className="h-4 w-4" strokeWidth={1.75} /> Friends joined
          </div>
          <p className="mt-1 font-display text-2xl font-semibold">{count}</p>
        </div>
        <div className="rounded-2xl bg-paper-deep/60 p-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Gift className="h-4 w-4" strokeWidth={1.75} /> Pro days earned
          </div>
          <p className="mt-1 font-display text-2xl font-semibold">{count * rewardDays}</p>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs text-muted">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        Your friend also starts with {rewardDays} days of Pro — so the AI tutor is
        unlocked for both of you right away.
      </p>
    </div>
  );
}
