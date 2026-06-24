import Link from "next/link";
import { Suspense } from "react";
import { ReviewHub } from "@/components/practice/ReviewHub";

export const metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Review &amp; reinforce</h1>
        <p className="mt-1 text-muted">
          One place to practice exactly what you need — what&apos;s due, the
          questions you missed, and your weak spots.
        </p>
      </header>
      <Suspense>
        <ReviewHub />
      </Suspense>
    </div>
  );
}
