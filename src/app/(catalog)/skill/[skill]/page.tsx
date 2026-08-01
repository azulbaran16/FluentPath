import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WORLDS, SKILL_META, type Skill } from "@/lib/curriculum";
import { getScenarioCoverage } from "@/lib/scenario-coverage";
import { LevelBadge, PendingBadge } from "@/components/SkillPill";
import { SkillIcon, WorldIcon } from "@/lib/icons";
import { SkillPractice } from "@/components/practice/SkillPractice";
import { GrammarWorkspace } from "@/components/practice/GrammarWorkspace";
import { WritingWorkspace } from "@/components/practice/WritingWorkspace";
import { SpeakingWorkspace } from "@/components/practice/SpeakingWorkspace";

const SKILLS = Object.keys(SKILL_META) as Skill[];

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ skill }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skill: string }>;
}): Promise<Metadata> {
  const { skill } = await params;
  if (!SKILLS.includes(skill as Skill)) return {};
  const meta = SKILL_META[skill as Skill];
  const title = `Practice English ${meta.label.toLowerCase()}`;
  const description = `${meta.blurb} Free interactive ${meta.label.toLowerCase()} practice on FluentPath.`;
  return {
    title,
    description,
    alternates: { canonical: `/skill/${skill}` },
    openGraph: { title, description, url: `/skill/${skill}`, type: "website" },
  };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = await params;
  if (!SKILLS.includes(skill as Skill)) notFound();
  const s = skill as Skill;
  const meta = SKILL_META[s];

  // Every scenario that DECLARES the skill stays in the list: the list is
  // navigation, and dropping entries would make the catalogue look smaller than
  // it is. What changes is that each one now carries whether practice for that
  // pair has actually been written, read off the coverage registry.
  const matches = WORLDS.flatMap((w) =>
    w.scenarios
      .filter((sc) => sc.skills.includes(s))
      .map((sc) => ({
        world: w,
        scenario: sc,
        written:
          getScenarioCoverage(w.slug, sc.slug)?.skills.find(
            (c) => c.skill === s,
          )?.available ?? false,
      })),
  );
  // Both numbers come off the banks. Neither is written by hand, so they move
  // on their own as the remaining skill plans land and cannot drift apart.
  const written = matches.filter((m) => m.written).length;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="rise mt-3 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-4 sm:items-center">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
            style={{
              background: `color-mix(in srgb, var(${meta.color}) 14%, transparent)`,
              color: `var(${meta.color})`,
            }}
          >
            <SkillIcon skill={s} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">
              {meta.label}
            </h1>
            <p className="max-w-2xl text-muted">{meta.blurb}</p>
          </div>
        </div>
      </header>

      {/* Each skill renders its own Learn/Practice workspace */}
      <section className="mt-6">
        {s === "grammar" ? (
          <GrammarWorkspace />
        ) : s === "writing" ? (
          <WritingWorkspace />
        ) : s === "speaking" ? (
          <SpeakingWorkspace />
        ) : (
          <>
            <h2 className="mb-3 font-display text-xl font-semibold">
              Reading room
            </h2>
            <SkillPractice skill={s} />
          </>
        )}
      </section>

      <p className="mt-10 text-sm text-muted">
        {written} of the {matches.length} scenarios that train your{" "}
        {meta.label.toLowerCase()}{" "}
        {written === 1 ? "has" : "have"} practice written for the situation
        itself
        {written < matches.length
          ? " — the rest are on the way, and say so"
          : ""}
        :
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {matches.map(({ world, scenario, written: hasPractice }, i) => (
          <Link
            key={`${world.slug}/${scenario.slug}`}
            href={`/world/${world.slug}/${scenario.slug}`}
            className="rise group flex items-center gap-4 rounded-[var(--radius)] border border-line bg-card p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{
                background: `color-mix(in srgb, var(${world.color}) 14%, transparent)`,
                color: `var(${world.color})`,
              }}
            >
              <WorldIcon slug={world.slug} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{scenario.title}</h3>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                {world.title}
                {!hasPractice && <PendingBadge />}
              </p>
            </div>
            <LevelBadge level={scenario.level} />
          </Link>
        ))}
      </div>
    </div>
  );
}
