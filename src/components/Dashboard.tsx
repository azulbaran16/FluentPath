"use client";

import Link from "next/link";
import { WORLDS, SKILL_META, TOTAL_SCENARIOS, type Skill } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { SkillIcon } from "@/lib/icons";
import { GRAMMAR_QUESTIONS } from "@/lib/content/grammar";
import { WorldCard } from "./WorldCard";
import { ProgressRing } from "./ProgressRing";
import { Zap, Flame, GraduationCap, RefreshCw, ChevronRight, Target, type LucideIcon } from "lucide-react";
import { CountUp } from "./motion/CountUp";

const SKILLS = Object.keys(SKILL_META) as Skill[];
const REVIEWABLE_IDS = new Set(GRAMMAR_QUESTIONS.map((q) => q.id));

export function Dashboard() {
  const {
    ready,
    state,
    worldProgress,
    completedCount,
    overallProgress,
    dueReviewIds,
    weakTopics,
    todayXp,
    goalXp,
    dailyGoalPct,
    goalMet,
    openMistakeCount,
  } = useProgress();

  // Only count reviews that still exist in the current question bank, so the
  // dashboard matches what the Review page actually shows.
  const dueCount = ready
    ? dueReviewIds().filter((id) => REVIEWABLE_IDS.has(id)).length
    : 0;

  const weak = ready ? weakTopics().slice(0, 3) : [];

  // Recommend the next unfinished scenario (fallback: the first one).
  const nextScenario =
    WORLDS.flatMap((w) => w.scenarios.map((sc) => ({ w, sc }))).find(
      ({ w, sc }) => !state.completed[`${w.slug}/${sc.slug}`],
    ) ?? { w: WORLDS[0], sc: WORLDS[0].scenarios[0] };

  // per-skill completion: completed scenarios containing the skill / all that contain it
  const skillCompletion = (skill: Skill) => {
    let total = 0;
    let done = 0;
    for (const w of WORLDS) {
      for (const sc of w.scenarios) {
        if (!sc.skills.includes(skill)) continue;
        total += 1;
        if (state.completed[`${w.slug}/${sc.slug}`]) done += 1;
      }
    }
    return total ? (done / total) * 100 : 0;
  };

  return (
    <div>
      {/* Hero */}
      <section className="rise relative overflow-hidden rounded-[var(--radius)] border border-line bg-card p-6 sm:p-9 shadow-[var(--shadow-soft)]">
        <div className="aurora" />
        <div className="paper-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <span style={{ color: "var(--vermilion)" }}>●</span> Your journey
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.05]">
              Speak English for{" "}
              <span style={{ color: "var(--vermilion)" }}>real life</span>.
            </h1>
            <p className="mt-3 text-ink-soft">
              Practice every situation that matters — chatting with friends,
              nailing an interview, traveling the world — with an AI tutor that
              talks, listens and corrects you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tutor"
                className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
              >
                Practice with the AI Tutor →
              </Link>
              <Link
                href="/world/social"
                className="rounded-xl border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
              >
                Browse scenarios
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6 rounded-2xl border border-line bg-paper px-6 py-5">
            <ProgressRing
              value={ready ? overallProgress : 0}
              size={88}
              stroke={8}
            />
            <div className="text-sm">
              <p className="font-display text-2xl font-semibold leading-none">
                {ready ? completedCount : 0}
                <span className="text-base font-normal text-muted">
                  /{TOTAL_SCENARIOS}
                </span>
              </p>
              <p className="text-muted">scenarios mastered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="XP earned" value={ready ? state.xp : 0} icon={Zap} color="--gold" />
        <Stat label="Day streak" value={ready ? state.streak : 0} icon={Flame} color="--vermilion" />
        <Stat label="Level" value={ready ? (state.level ?? "—") : "—"} icon={GraduationCap} color="--teal" />
        <Stat label="Reviews due" value={ready ? dueCount : 0} icon={RefreshCw} color="--plum" />
      </section>

      {/* Level / Review CTAs */}
      <section className="mt-3 grid gap-3 sm:grid-cols-2">
        {ready && !state.level ? (
          <CtaCard
            href="/diagnostic"
            icon={GraduationCap}
            color="--teal"
            title="Find your level"
            body="Take a 2-minute placement test to tailor your path."
          />
        ) : (
          <CtaCard
            href="/diagnostic"
            icon={GraduationCap}
            color="--teal"
            title={`You're at ${ready ? state.level : "—"}`}
            body="Retake the placement test anytime to recheck your level."
          />
        )}
        <CtaCard
          href="/review"
          icon={RefreshCw}
          color="--plum"
          title={ready && dueCount > 0 ? `${dueCount} item${dueCount > 1 ? "s" : ""} to review` : "Daily review"}
          body={
            ready && dueCount > 0
              ? "Spaced repetition is ready — reinforce what you've learned."
              : "Practice resurfaces here right before you'd forget it."
          }
        />
      </section>

      {/* Daily goal */}
      <section className="mt-6 flex flex-col gap-4 rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={ready ? dailyGoalPct : 0}
            size={56}
            color={goalMet ? "var(--teal)" : "var(--vermilion)"}
            label={`${ready ? todayXp : 0}`}
          />
          <div>
            <h2 className="font-display text-lg font-semibold">
              {goalMet ? "Daily goal reached! 🎉" : "Today's goal"}
            </h2>
            <p className="text-sm text-muted">
              {goalMet
                ? `${todayXp} XP today — nice work. Keep the streak going.`
                : `${todayXp} / ${goalXp} XP today · about ${nextScenario.sc.minutes} min for a scenario.`}
            </p>
          </div>
        </div>
        <Link
          href={`/world/${nextScenario.w.slug}/${nextScenario.sc.slug}`}
          className="rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--vermilion)" }}
        >
          {completedCount > 0 ? "Continue" : "Start"}: {nextScenario.sc.title}
        </Link>
      </section>

      {/* Weak spots & mistakes (adaptive) */}
      {ready && (weak.length > 0 || openMistakeCount > 0) && (
        <section className="mt-3 grid gap-3 sm:grid-cols-2">
          {weak.length > 0 && (
            <Link
              href="/review?tab=weak"
              className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                style={{ background: "color-mix(in srgb, var(--gold) 16%, transparent)", color: "var(--gold)" }}
              >
                <Zap className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold">Focus on weak spots</h3>
                <p className="truncate text-sm text-muted">
                  {weak.map((w) => w.topic).join(" · ")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          )}
          {openMistakeCount > 0 && (
            <Link
              href="/review?tab=mistakes"
              className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                style={{ background: "color-mix(in srgb, var(--vermilion) 14%, transparent)", color: "var(--vermilion)" }}
              >
                <Target className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold">
                  {openMistakeCount} mistake{openMistakeCount > 1 ? "s" : ""} to master
                </h3>
                <p className="text-sm text-muted">Turn your errors into strengths.</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          )}
        </section>
      )}

      {/* Worlds */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Worlds</h2>
          <p className="text-sm text-muted">6 worlds · {TOTAL_SCENARIOS} scenarios</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORLDS.map((w, i) => (
            <WorldCard
              key={w.slug}
              world={w}
              progress={ready ? worldProgress(w.slug) : 0}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Train each skill</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s, i) => {
            const meta = SKILL_META[s];
            return (
              <Link
                key={s}
                href={`/skill/${s}`}
                className="rise group rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in srgb, var(${meta.color}) 14%, transparent)`,
                    color: `var(${meta.color})`,
                  }}
                >
                  <SkillIcon skill={s} className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {meta.label}
                </h3>
                <p className="mt-1 text-sm text-muted">{meta.blurb}</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${ready ? skillCompletion(s) : 0}%`,
                      background: `var(${meta.color})`,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <Icon className="h-4 w-4" style={{ color: `var(${color})` }} strokeWidth={1.75} />
      </div>
      <p
        className="mt-1 font-display text-2xl font-semibold"
        style={{ color: `var(${color})` }}
      >
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
    </div>
  );
}

function CtaCard({
  href,
  icon: Icon,
  color,
  title,
  body,
}: {
  href: string;
  icon: LucideIcon;
  color: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
        style={{ background: `color-mix(in srgb, var(${color}) 14%, transparent)`, color: `var(${color})` }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted">{body}</p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </Link>
  );
}
