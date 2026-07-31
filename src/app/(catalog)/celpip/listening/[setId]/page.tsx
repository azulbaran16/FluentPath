import { notFound } from "next/navigation";
import { LISTENING_SETS, getListeningSet, listeningPartKindLabel } from "@/lib/celpip";
import { ListeningPlayer } from "@/components/celpip/ListeningPlayer";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return LISTENING_SETS.map((set) => ({ setId: set.id }));
}

export default async function CelpipListeningPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const set = getListeningSet(setId);
  if (!set) notFound();

  // Built from the part SHAPES and the counts, never from the scripts. D-04
  // makes this more than tidiness: structured data is rendered into the page's
  // HTML, so a description assembled from the script text would put the words
  // she is supposed to hear into the DOM before she has heard anything.
  const description = `${set.parts
    .map((part) => listeningPartKindLabel(part.kind))
    .join(", ")} — heard once, with the questions revealed only after playback.`;

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: set.title,
    description,
    learningResourceType: "Interactive practice",
    teaches: "CELPIP Listening",
    inLanguage: "en",
    isAccessibleForFree: true,
    url: absoluteUrl(`/celpip/listening/${set.id}`),
    provider: { "@type": "Organization", name: "FluentPath" },
  };

  return (
    <>
      <JsonLd data={learningResource} />
      <ListeningPlayer set={set} />
    </>
  );
}
