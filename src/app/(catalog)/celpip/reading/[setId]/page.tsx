import { notFound } from "next/navigation";
import {
  READING_SETS,
  getReadingSet,
  readingPartKindLabel,
  readingSetItemCount,
  readingSetMinutes,
} from "@/lib/celpip";
import { ReadingRunner } from "@/components/celpip/ReadingRunner";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

// Returns an EMPTY array today, and that is the designed intermediate state
// rather than an oversight: `READING_SETS` is empty until plan 09 authors the
// bank, so this route pre-renders nothing and every set id 404s. The moment a
// set is appended, its page is generated with no edit here.
export function generateStaticParams() {
  return READING_SETS.map((set) => ({ setId: set.id }));
}

export default async function CelpipReadingPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const set = getReadingSet(setId);
  if (!set) notFound();

  // Built from the part SHAPES and the counts, never from the passages. This is
  // structured data rendered into the page's HTML, so a description assembled
  // from the text would put authored prose — and, one careless edit later, an
  // answer — into the served document.
  const description = `${set.parts
    .map((part) => readingPartKindLabel(part.kind))
    .join(", ")} — ${readingSetItemCount(set)} questions in ${readingSetMinutes(
    set,
  )} minutes, each part against its own clock as in the exam.`;

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: set.title,
    description,
    learningResourceType: "Interactive practice",
    teaches: "CELPIP Reading",
    inLanguage: "en",
    isAccessibleForFree: true,
    url: absoluteUrl(`/celpip/reading/${set.id}`),
    provider: { "@type": "Organization", name: "FluentPath" },
  };

  return (
    <>
      <JsonLd data={learningResource} />
      {/* The ID, never the resolved set. A prop crossing this boundary is
          serialized into the RSC payload and inlined into this page's HTML —
          which for a reading set means the passages AND the whole answer key in
          the document source. Plan 05 measured exactly that on the listening
          route. The runner resolves the id against the bank on the client. */}
      <ReadingRunner setId={set.id} />
    </>
  );
}
