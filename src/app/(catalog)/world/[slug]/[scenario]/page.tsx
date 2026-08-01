import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORLDS, getScenario, SKILL_META, type Skill } from "@/lib/curriculum";
import { ScenarioView } from "@/components/ScenarioView";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { getScenarioCoverage } from "@/lib/scenario-coverage";

/**
 * The skills this page can actually be practised in, read from the coverage
 * registry rather than from `scenario.skills`.
 *
 * `scenario.skills` is a DECLARATION — what the scenario is meant to train.
 * Putting it in `teaches` and in the description is live on production today
 * for 22 pairs that render no exercise at all, which is a claim a search engine
 * indexes and a learner arrives on. This is the same edit 02.1-02 made for
 * /celpip: say what ships.
 */
function practisableSkills(worldSlug: string, scenarioSlug: string): Skill[] {
  const coverage = getScenarioCoverage(worldSlug, scenarioSlug);
  return (coverage?.skills ?? []).filter((s) => s.available).map((s) => s.skill);
}

export function generateStaticParams() {
  return WORLDS.flatMap((w) =>
    w.scenarios.map((s) => ({ slug: w.slug, scenario: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; scenario: string }>;
}): Promise<Metadata> {
  const { slug, scenario } = await params;
  const found = getScenario(slug, scenario);
  if (!found) return {};
  const { world, scenario: sc } = found;
  const shipped = practisableSkills(world.slug, sc.slug);
  const skills = shipped.map((s) => SKILL_META[s].label.toLowerCase()).join(", ");
  const title = `${sc.title} in English (${sc.level})`;
  const description = skills
    ? `${sc.blurb} Practice ${skills} for "${sc.title}" — part of ${world.title} on FluentPath.`
    : `${sc.blurb} Part of ${world.title} on FluentPath.`;
  return {
    title,
    description,
    alternates: { canonical: `/world/${world.slug}/${sc.slug}` },
    openGraph: {
      title,
      description,
      url: `/world/${world.slug}/${sc.slug}`,
      type: "article",
    },
  };
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string; scenario: string }>;
}) {
  const { slug, scenario } = await params;
  const found = getScenario(slug, scenario);
  if (!found) notFound();
  const { world, scenario: sc } = found;
  const shipped = practisableSkills(world.slug, sc.slug);
  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${sc.title} in English`,
    description: sc.blurb,
    educationalLevel: sc.level,
    learningResourceType: "Interactive practice",
    // Omitted entirely rather than emitted empty when nothing ships yet: an
    // empty `teaches` is a claim about the vocabulary of the markup, not about
    // the page, and this key spreads back in the moment a bank lands.
    ...(shipped.length > 0
      ? { teaches: shipped.map((s) => SKILL_META[s].label) }
      : {}),
    inLanguage: "en",
    isAccessibleForFree: true,
    url: absoluteUrl(`/world/${world.slug}/${sc.slug}`),
    provider: { "@type": "Organization", name: "FluentPath" },
  };
  return (
    <>
      <JsonLd data={learningResource} />
      <ScenarioView world={world} scenario={sc} />
    </>
  );
}
