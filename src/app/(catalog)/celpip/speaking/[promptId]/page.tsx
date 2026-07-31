import { notFound } from "next/navigation";
import { SPEAKING_PROMPTS, getSpeakingPrompt } from "@/lib/celpip";
import { SpeakingRecorder } from "@/components/celpip/SpeakingRecorder";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return SPEAKING_PROMPTS.map((prompt) => ({ promptId: prompt.id }));
}

export default async function CelpipSpeakingPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;
  const prompt = getSpeakingPrompt(promptId);
  if (!prompt) notFound();

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: prompt.title,
    description: prompt.scenario,
    learningResourceType: "Interactive practice",
    teaches: "CELPIP Speaking",
    inLanguage: "en",
    isAccessibleForFree: true,
    url: absoluteUrl(`/celpip/speaking/${prompt.id}`),
    provider: { "@type": "Organization", name: "FluentPath" },
  };

  return (
    <>
      <JsonLd data={learningResource} />
      <SpeakingRecorder prompt={prompt} />
    </>
  );
}
