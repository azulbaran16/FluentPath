import { notFound } from "next/navigation";
import { WORLDS, getScenario } from "@/lib/curriculum";
import { ScenarioView } from "@/components/ScenarioView";

export function generateStaticParams() {
  return WORLDS.flatMap((w) =>
    w.scenarios.map((s) => ({ slug: w.slug, scenario: s.slug })),
  );
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string; scenario: string }>;
}) {
  const { slug, scenario } = await params;
  const found = getScenario(slug, scenario);
  if (!found) notFound();
  return <ScenarioView world={found.world} scenario={found.scenario} />;
}
