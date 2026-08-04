import type { Metadata } from "next";
import Link from "next/link";
import { CoreVocabView } from "@/components/practice/CoreVocabView";

// In the public catalog group, beside /vocabulary, for the same reason that one
// is: it is content, it is indexable, and it is a fair preview of the product.
//
// The description below says what the tier IS without saying how big it is. A
// word count in metadata would be a hand-written claim in the one place nobody
// re-reads when the bank grows — the page itself derives every figure from the
// bank, and this string is deliberately kept out of that business.
export const metadata: Metadata = {
  title: "Core vocabulary",
  description:
    "The most frequent words in English, in frequency order, as spaced-repetition flashcards — each with a Spanish translation and one example sentence.",
  alternates: { canonical: "/core-vocabulary" },
};

export default function CoreVocabularyPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Core vocabulary</h1>
        <p className="mt-1 text-muted">
          The words English uses most, in the order it uses them.
        </p>
      </header>
      <CoreVocabView />
    </div>
  );
}
