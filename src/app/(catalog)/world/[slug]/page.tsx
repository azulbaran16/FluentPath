import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORLDS, getWorld, type World } from "@/lib/curriculum";
import { getScenarioCoverage } from "@/lib/scenario-coverage";
import { WorldView, type WorldSkillsWritten } from "@/components/WorldView";

/**
 * Which skills each scenario on this page has practice WRITTEN for, read off
 * the coverage registry — the same registry, and the same `.filter(available)`
 * derivation, that the scenario route uses for its JSON-LD `teaches` field
 * (`world/[slug]/[scenario]/page.tsx`). One source, so the world page's pills
 * and the scenario page's pills cannot disagree.
 *
 * Derived HERE, in the server component, rather than inside `WorldView`:
 * WorldView is `"use client"` and the registry pulls in all six content banks,
 * which measured +217,154 B on this route's client bundle at 04-08. The pills
 * are known at build time, so none of that needs to reach a browser.
 */
function skillsWritten(world: World): WorldSkillsWritten {
  return Object.fromEntries(
    world.scenarios.map((s) => [
      s.slug,
      (getScenarioCoverage(world.slug, s.slug)?.skills ?? [])
        .filter((c) => c.available)
        .map((c) => c.skill),
    ]),
  );
}

export function generateStaticParams() {
  return WORLDS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) return {};
  const title = `${world.title} — English practice`;
  const description = `Practice English for ${world.title.toLowerCase()}: ${world.scenarios
    .map((s) => s.title)
    .slice(0, 5)
    .join(", ")} and more. ${world.tagline}`;
  return {
    title,
    description,
    alternates: { canonical: `/world/${world.slug}` },
    openGraph: { title, description, url: `/world/${world.slug}`, type: "website" },
  };
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  return <WorldView world={world} written={skillsWritten(world)} />;
}
