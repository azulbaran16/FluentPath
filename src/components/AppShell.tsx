import Link from "next/link";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-0 lg:gap-8 px-4 lg:px-8">
      <Sidebar />
      <main className="min-w-0 flex-1 py-6 lg:py-10">{children}</main>
      <footer className="sr-only">
        <Link href="/">FluentPath home</Link>
      </footer>
    </div>
  );
}
