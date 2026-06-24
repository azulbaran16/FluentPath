import type { Metadata } from "next";
import Link from "next/link";
import { ListeningRoom } from "@/components/practice/ListeningRoom";
import { CLIPS } from "@/lib/content/listening";

export const metadata: Metadata = {
  title: "Listening practice",
  description:
    "Train your English listening with short clips and dialogues, then check your comprehension. Graded from A2 to C1.",
  alternates: { canonical: "/listening" },
};

export default function ListeningPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Listening</h1>
        <p className="mt-1 text-muted">
          Train your ear with short clips, then check what you understood.
        </p>
      </header>
      <ListeningRoom clips={CLIPS} />
    </div>
  );
}
