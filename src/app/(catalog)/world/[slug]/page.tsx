import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORLDS, getWorld } from "@/lib/curriculum";
import { WorldView } from "@/components/WorldView";

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
  return <WorldView world={world} />;
}
