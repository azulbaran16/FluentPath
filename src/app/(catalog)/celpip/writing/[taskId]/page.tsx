import { notFound } from "next/navigation";
import { CELPIP_TASKS, getTask } from "@/lib/celpip";
import { WritingSimulator } from "@/components/celpip/WritingSimulator";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return CELPIP_TASKS.map((task) => ({ taskId: task.id }));
}

export default async function CelpipWritingPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = getTask(taskId);
  if (!task) notFound();

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: task.title,
    description: task.scenario,
    learningResourceType: "Interactive practice",
    teaches: "CELPIP Writing",
    inLanguage: "en",
    isAccessibleForFree: true,
    url: absoluteUrl(`/celpip/writing/${task.id}`),
    provider: { "@type": "Organization", name: "FluentPath" },
  };

  return (
    <>
      <JsonLd data={learningResource} />
      <WritingSimulator task={task} />
    </>
  );
}
