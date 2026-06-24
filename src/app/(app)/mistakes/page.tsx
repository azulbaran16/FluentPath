import { redirect } from "next/navigation";

// The mistake notebook now lives as a tab inside the unified Review hub.
export default function MistakesPage() {
  redirect("/review?tab=mistakes");
}
