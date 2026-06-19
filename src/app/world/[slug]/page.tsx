import { notFound } from "next/navigation";
import { WORLDS, getWorld } from "@/lib/curriculum";
import { WorldView } from "@/components/WorldView";

export function generateStaticParams() {
  return WORLDS.map((w) => ({ slug: w.slug }));
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
