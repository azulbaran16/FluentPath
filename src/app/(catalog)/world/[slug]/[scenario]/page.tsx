import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORLDS, getScenario, SKILL_META } from "@/lib/curriculum";
import { ScenarioView } from "@/components/ScenarioView";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

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
  const skills = sc.skills.map((s) => SKILL_META[s].label.toLowerCase()).join(", ");
  const title = `${sc.title} in English (${sc.level})`;
  const description = `${sc.blurb} Practice ${skills} for "${sc.title}" — part of ${world.title} on FluentPath.`;
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
  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${sc.title} in English`,
    description: sc.blurb,
    educationalLevel: sc.level,
    learningResourceType: "Interactive practice",
    teaches: sc.skills.map((s) => SKILL_META[s].label),
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
