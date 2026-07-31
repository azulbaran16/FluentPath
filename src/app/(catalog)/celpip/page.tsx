import type { Metadata } from "next";
import { CelpipLanding } from "@/components/celpip/CelpipLanding";
import { JsonLd } from "@/components/JsonLd";
import { availableSections, pendingSections } from "@/lib/celpip";
import { CelpipIcon } from "@/lib/icons";
import { absoluteUrl } from "@/lib/site";

// Every claim this page makes about what CELPIP practice exists is read off
// the section registry, which reads it off the content banks.
//
// Four strings here used to say "Writing" — the metadata title, the
// description, the h1 and the JSON-LD — and all four went stale the moment a
// second skill shipped. The learner reading this has an exam date and is
// planning her preparation around what the page says exists, so an overclaim
// costs her real time. Deriving the claims means a set that never ships, or is
// dropped for the calendar, cannot leave a false sentence behind.

const AVAILABLE = availableSections();
const PENDING = pendingSections();

function joinWords(words: string[]): string {
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

const SKILLS = joinWords(AVAILABLE.map((s) => s.label));

const TITLE = "CELPIP Practice — Free Exam Simulator";
const DESCRIPTION = `Practice CELPIP ${SKILLS} under real exam timing, with original prompts and descriptor-based self-checks — no automated scoring pretending to be the real thing. Free, no account required.`;

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

// Compact hero + derived coverage line; the interactive body (skill tabs,
// card grids and the cross-skill attempt history) lives in CelpipLanding, a
// client component.
export default function CelpipPage() {
  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "CELPIP Practice",
    description: DESCRIPTION,
    learningResourceType: "Interactive practice",
    // Names only the skills whose banks are non-empty (T-02.1-10): the public
    // structured data must not claim coverage the app does not have.
    teaches: AVAILABLE.map((section) => `CELPIP ${section.label}`),
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
          <CelpipIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            CELPIP Practice
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Free, timed practice in the shape of the real exam — original
            prompts and a self-check rubric, no account needed.
          </p>
          <p className="mt-2 max-w-2xl text-xs text-muted">
            <span className="font-semibold text-ink-soft">Available now:</span>{" "}
            {AVAILABLE.map((section) => (
              <span key={section.skill}>
                {section.label} — {section.coverage.summary}.{" "}
              </span>
            ))}
            {PENDING.length > 0 && (
              <>
                <span className="font-semibold text-ink-soft">Not yet:</span>{" "}
                {joinWords(PENDING.map((section) => section.label))} — those
                sections are not built yet.
              </>
            )}
          </p>
        </div>
      </header>

      <div className="mt-8">
        <CelpipLanding />
      </div>
    </div>
  );
}
