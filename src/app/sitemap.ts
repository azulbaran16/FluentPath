import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { WORLDS, SKILL_META, type Skill } from "@/lib/curriculum";

const SKILLS = Object.keys(SKILL_META) as Skill[];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tips"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/listening"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/vocabulary"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/signup"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/login"), changeFrequency: "monthly", priority: 0.3 },
  ];

  const worldPages: MetadataRoute.Sitemap = WORLDS.map((w) => ({
    url: absoluteUrl(`/world/${w.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const scenarioPages: MetadataRoute.Sitemap = WORLDS.flatMap((w) =>
    w.scenarios.map((s) => ({
      url: absoluteUrl(`/world/${w.slug}/${s.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  const skillPages: MetadataRoute.Sitemap = SKILLS.map((s) => ({
    url: absoluteUrl(`/skill/${s}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...worldPages, ...scenarioPages, ...skillPages];
}
