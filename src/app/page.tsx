import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Mic,
  MessagesSquare,
  RefreshCw,
  GraduationCap,
  Check,
} from "lucide-react";
import { auth } from "@/auth";
import { WORLDS, SKILL_META, TOTAL_SCENARIOS, type Skill } from "@/lib/curriculum";
import { WorldIcon, SkillIcon } from "@/lib/icons";
import { JsonLd } from "@/components/JsonLd";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE, absoluteUrl } from "@/lib/site";

const SKILLS = Object.keys(SKILL_META) as Skill[];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE.name,
      url: absoluteUrl("/"),
      description: SITE.description,
    },
    {
      "@type": "WebSite",
      name: SITE.name,
      url: absoluteUrl("/"),
      inLanguage: "en",
    },
  ],
};

export default async function Landing() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <JsonLd data={STRUCTURED_DATA} />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="paper-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <span style={{ color: "var(--vermilion)" }}>●</span> Learn English
              for real life
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Speak English
              <br />
              like you{" "}
              <span style={{ color: "var(--vermilion)" }}>live</span> it.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              Practice every situation that matters — making friends, nailing an
              interview, traveling the world — with an AI tutor that talks,
              listens and corrects you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
              >
                Start free <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/login"
                className="inline-flex cursor-pointer items-center rounded-xl border border-line-strong px-6 py-3 text-sm font-semibold transition-colors hover:bg-paper-deep"
              >
                I already have an account
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Free to start · No card required · {TOTAL_SCENARIOS}+ real-life
              scenarios
            </p>
          </div>

          {/* Hero preview card */}
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Skills strip */}
      <section className="border-y border-line bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {SKILLS.map((s) => {
            const meta = SKILL_META[s];
            return (
              <div key={s} className="flex items-start gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in srgb, var(${meta.color}) 14%, transparent)`,
                    color: `var(${meta.color})`,
                  }}
                >
                  <SkillIcon skill={s} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {meta.label}
                  </h3>
                  <p className="text-sm text-muted">{meta.blurb}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Worlds */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Six worlds. Every situation you&apos;ll actually face.
          </h2>
          <p className="mt-3 text-ink-soft">
            From small talk to job interviews to ordering dinner abroad — nothing
            left out.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORLDS.map((w) => {
            const accent = `var(${w.color})`;
            return (
              <div
                key={w.slug}
                className="rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                    color: accent,
                  }}
                >
                  <WorldIcon slug={w.slug} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {w.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{w.tagline}</p>
                <p className="mt-3 text-xs font-semibold text-muted">
                  {w.scenarios.length} scenarios
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <HowStep
              n={1}
              icon={GraduationCap}
              color="--teal"
              title="Find your level"
              body="A 2-minute placement test tailors your path from A2 to C1."
            />
            <HowStep
              n={2}
              icon={Mic}
              color="--vermilion"
              title="Practice out loud"
              body="Speak real phrases; get scored on pronunciation, word by word."
            />
            <HowStep
              n={3}
              icon={RefreshCw}
              color="--plum"
              title="Remember for good"
              body="Spaced repetition brings back what you learn, right on time."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <MessagesSquare
          className="mx-auto h-10 w-10"
          style={{ color: "var(--vermilion)" }}
          strokeWidth={1.5}
        />
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
          Your fluent self is one conversation away.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Create a free account and your progress follows you everywhere.
        </p>
        <Link
          href="/signup"
          className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
        >
          Get started — it&apos;s free
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Brand small />
          <p>Built for learners who want the real thing.</p>
        </div>
      </footer>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="cursor-pointer rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

function Brand({ small }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl text-paper"
        style={{ background: "var(--vermilion)" }}
      >
        <span className="font-display text-lg font-semibold">F</span>
      </span>
      {!small && (
        <span className="font-display text-xl font-semibold tracking-tight">
          FluentPath
        </span>
      )}
    </Link>
  );
}

function HeroPreview() {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-lift)]">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: "color-mix(in srgb, var(--vermilion) 14%, transparent)", color: "var(--vermilion)" }}
        >
          <MessagesSquare className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-sm font-semibold">Small talk</p>
          <p className="text-xs text-muted">Speaking · B1</p>
        </div>
      </div>
      <p className="mt-4 font-display text-2xl font-semibold">How&apos;s it going?</p>
      <p className="text-sm text-muted">¿Cómo te va?</p>
      <div className="mt-4 flex flex-wrap gap-1.5 text-sm">
        {[
          ["How's", true],
          ["it", true],
          ["going", true],
        ].map(([w], i) => (
          <span
            key={i}
            className="rounded px-1.5 py-0.5"
            style={{ background: "color-mix(in srgb, var(--teal) 15%, transparent)", color: "var(--teal)" }}
          >
            {w as string}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-paper-deep/60 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium text-teal">
          <Check className="h-4 w-4" strokeWidth={2.5} /> Great pronunciation
        </span>
        <span className="font-display text-lg font-semibold text-teal">100%</span>
      </div>
    </div>
  );
}

function HowStep({
  n,
  icon: Icon,
  color,
  title,
  body,
}: {
  n: number;
  icon: typeof Mic;
  color: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl"
          style={{ background: `color-mix(in srgb, var(${color}) 14%, transparent)`, color: `var(${color})` }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="font-display text-sm font-semibold text-muted">
          Step {n}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
