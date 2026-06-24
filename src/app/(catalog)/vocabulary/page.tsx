import type { Metadata } from "next";
import Link from "next/link";
import { VocabularyView } from "@/components/practice/VocabularyView";

export const metadata: Metadata = {
  title: "Vocabulary flashcards",
  description:
    "Build your English vocabulary with themed flashcard decks — everyday words, linking words, phrasal verbs, workplace English and idioms.",
  alternates: { canonical: "/vocabulary" },
};

export default function VocabularyPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Vocabulary</h1>
        <p className="mt-1 text-muted">
          Flashcard decks by theme. Flip, listen, and mark what you know.
        </p>
      </header>
      <VocabularyView />
    </div>
  );
}
