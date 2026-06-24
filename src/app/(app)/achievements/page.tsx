import Link from "next/link";
import { AchievementsView } from "@/components/AchievementsView";

export const metadata = { title: "Achievements" };

export default function AchievementsPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Achievements</h1>
        <p className="mt-1 text-muted">
          Badges you unlock as you practise — a little motivation for the long
          run.
        </p>
      </header>
      <AchievementsView />
    </div>
  );
}
