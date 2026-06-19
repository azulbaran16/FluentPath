import Link from "next/link";
import { notFound } from "next/navigation";
import { WORLDS, SKILL_META, type Skill } from "@/lib/curriculum";
import { LevelBadge } from "@/components/SkillPill";
import { SkillIcon, WorldIcon } from "@/lib/icons";
import { SkillPractice } from "@/components/practice/SkillPractice";

const SKILLS = Object.keys(SKILL_META) as Skill[];

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ skill }));
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

  const matches = WORLDS.flatMap((w) =>
    w.scenarios
      .filter((sc) => sc.skills.includes(s))
      .map((sc) => ({ world: w, scenario: sc })),
  );

  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="rise mt-3 rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl"
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

      {/* Interactive practice for this skill */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-xl font-semibold">Practice now</h2>
        <SkillPractice skill={s} />
      </section>

      <p className="mt-10 text-sm text-muted">
        {matches.length} scenarios train your {meta.label.toLowerCase()}:
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {matches.map(({ world, scenario }, i) => (
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
              <p className="text-xs text-muted">{world.title}</p>
            </div>
            <LevelBadge level={scenario.level} />
          </Link>
        ))}
      </div>
    </div>
  );
}
