import Link from "next/link";
import { DiagnosticTest } from "@/components/practice/DiagnosticTest";

export const metadata = { title: "Placement test" };

export default async function DiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const isWelcome = welcome === "1";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">
          {isWelcome ? "Welcome to FluentPath!" : "Placement test"}
        </h1>
        <p className="mt-1 text-muted">
          {isWelcome
            ? "Let's find your level first so we can tailor your path. Eight quick questions — no pressure, just pick the best option you can."
            : "Eight quick questions to estimate your level and tailor your path. No pressure — pick the best option you can."}
        </p>
      </header>
      <DiagnosticTest />
    </div>
  );
}
