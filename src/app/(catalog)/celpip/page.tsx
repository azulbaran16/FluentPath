import type { Metadata } from "next";
import { CelpipLanding } from "@/components/celpip/CelpipLanding";
import { JsonLd } from "@/components/JsonLd";
import { SkillIcon } from "@/lib/icons";
import { absoluteUrl } from "@/lib/site";

const TITLE = "CELPIP Writing Practice — Free Exam Simulator";
const DESCRIPTION =
  "Practice CELPIP Writing Task 1 (email) and Task 2 (survey) under real exam timing, then self-check against original model answers and descriptor-based rubrics. Free, no account required.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/celpip" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: "/celpip",
      type: "website",
    },
  };
}

// Full landing (plan 05): compact hero, Task 1/Task 2 tabs + card grids,
// attempt history, and a mobile desktop-recommendation notice — all the
// interactive body lives in CelpipLanding, a client component.
export default function CelpipPage() {
  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "CELPIP Writing Practice",
    description: DESCRIPTION,
    learningResourceType: "Interactive practice",
    teaches: "CELPIP Writing",
    inLanguage: "en",
    isAccessibleForFree: true,
    url: absoluteUrl("/celpip"),
    provider: { "@type": "Organization", name: "FluentPath" },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={learningResource} />

      <header className="rise flex items-center gap-4 rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)]">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{
            background: "color-mix(in srgb, var(--sky) 14%, transparent)",
            color: "var(--sky)",
          }}
        >
          <SkillIcon skill="writing" className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            CELPIP Writing Practice
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Free, timed practice for CELPIP Writing Task 1 (email) and Task 2
            (survey) — original prompts, model answers, and a self-check
            rubric. No account needed.
          </p>
        </div>
      </header>

      <div className="mt-8">
        <CelpipLanding />
      </div>
    </div>
  );
}
