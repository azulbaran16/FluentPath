import Link from "next/link";
import { ReviewView } from "@/components/practice/ReviewView";

export const metadata = { title: "Review — FluentPath" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Daily review</h1>
        <p className="mt-1 text-muted">
          Spaced repetition brings back what you&apos;ve practiced, right before
          you&apos;d forget it.
        </p>
      </header>
      <ReviewView />
    </div>
  );
}
