import Link from "next/link";

// Centered layout for the login / signup pages, with a quiet brand
// header and a decorative side panel on large screens.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / marketing side */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-card lg:block">
        <div className="paper-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-paper"
              style={{ background: "var(--vermilion)" }}
            >
              <span className="font-display text-lg font-semibold">F</span>
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              FluentPath
            </span>
          </Link>
          <div>
            <h2 className="max-w-sm font-display text-3xl font-semibold leading-tight">
              Speak English like you{" "}
              <span style={{ color: "var(--vermilion)" }}>live</span> it.
            </h2>
            <p className="mt-3 max-w-sm text-ink-soft">
              Real-life scenarios, an AI tutor, and a memory engine that makes it
              stick. Your progress follows your account everywhere.
            </p>
          </div>
          <p className="text-sm text-muted">
            Practice for life, work, travel — and sounding truly native.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-paper"
              style={{ background: "var(--vermilion)" }}
            >
              <span className="font-display text-lg font-semibold">F</span>
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              FluentPath
            </span>
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
