import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Mic,
  Headphones,
  Target,
  Brain,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import { LEARNING_TIPS, type TipIcon } from "@/lib/content/learning-tips";

export const metadata: Metadata = {
  title: "How to learn English better — tips & study advice",
  description:
    "Practical, research-backed tips on how to learn English faster: build the habit, speak from day one, immerse yourself, train each skill, and make it stick.",
  alternates: { canonical: "/tips" },
};

const ICONS: Record<TipIcon, LucideIcon> = {
  habit: CalendarCheck,
  speak: Mic,
  immerse: Headphones,
  skills: Target,
  memory: Brain,
  mindset: Mountain,
};

const COLORS: Record<TipIcon, string> = {
  habit: "--gold",
  speak: "--vermilion",
  immerse: "--teal",
  skills: "--sky",
  memory: "--plum",
  mindset: "--moss",
};

export default function TipsPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="rise mt-3 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          How to learn English better
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          The app gives you the practice — these habits make it work. A few
          simple principles, drawn from how people actually reach a native
          level.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {LEARNING_TIPS.map((section, idx) => {
          const Icon = ICONS[section.icon];
          const color = `var(${COLORS[section.icon]})`;
          return (
            <section
              key={section.id}
              className="rise rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in srgb, ${color} 14%, transparent)`,
                    color,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h2 className="font-display text-xl font-semibold">
                  {section.title}
                </h2>
              </div>
              <p className="mt-3 text-sm text-ink-soft">{section.intro}</p>
              <ul className="mt-4 space-y-2.5">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-8 rounded-[var(--radius)] border border-dashed border-line-strong bg-paper-deep/40 p-6 text-center">
        <p className="text-ink-soft">Ready to put it into practice?</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link
            href="/diagnostic"
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            Find your level
          </Link>
          <Link
            href="/review"
            className="rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-card"
          >
            Do today&apos;s review
          </Link>
        </div>
      </div>
    </div>
  );
}
