// Central site metadata used for SEO across the app.
// Set NEXT_PUBLIC_SITE_URL to your deployed URL in production.

export const SITE = {
  name: "FluentPath",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Learn English for real life. Practice speaking, grammar, reading and writing across every real-world scenario — social, work, travel — with an AI tutor that talks, listens and corrects you.",
  tagline: "Speak English like you live it.",
  locale: "en_US",
} as const;

export function absoluteUrl(path = "/"): string {
  const base = SITE.url.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
