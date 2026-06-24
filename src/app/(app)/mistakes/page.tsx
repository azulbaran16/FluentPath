import Link from "next/link";
import { MistakesView } from "@/components/practice/MistakesView";

export const metadata = { title: "My mistakes" };

export default function MistakesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">My mistakes</h1>
        <p className="mt-1 text-muted">
          The questions you&apos;ve missed, gathered so you can turn them into
          strengths.
        </p>
      </header>
      <MistakesView />
    </div>
  );
}
