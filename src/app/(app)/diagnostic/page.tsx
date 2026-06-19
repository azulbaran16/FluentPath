import Link from "next/link";
import { DiagnosticTest } from "@/components/practice/DiagnosticTest";

export const metadata = { title: "Placement test — FluentPath" };

export default function DiagnosticPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Placement test</h1>
        <p className="mt-1 text-muted">
          Eight quick questions to estimate your level and tailor your path. No
          pressure — pick the best option you can.
        </p>
      </header>
      <DiagnosticTest />
    </div>
  );
}
