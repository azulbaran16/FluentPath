import { Suspense } from "react";
import { Tutor } from "@/components/Tutor";

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="text-muted">Loading tutor…</div>}>
      <Tutor />
    </Suspense>
  );
}
