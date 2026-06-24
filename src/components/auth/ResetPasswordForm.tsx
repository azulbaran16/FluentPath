"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Could not reset your password.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-[var(--radius)] border border-line bg-card p-7 text-center shadow-[var(--shadow-lift)]">
        <h1 className="font-display text-2xl font-semibold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted">
          This reset link is missing its token. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-5 inline-block rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[var(--radius)] border border-line bg-card p-7 shadow-[var(--shadow-lift)]">
        {done ? (
          <div className="text-center">
            <span
              className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-paper"
              style={{ background: "var(--teal)" }}
            >
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold">
              Password updated
            </h1>
            <p className="mt-2 text-sm text-muted">
              You can now log in with your new password.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
            >
              Go to log in <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold">
              Choose a new password
            </h1>
            <form onSubmit={submit} className="mt-6">
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-vermilion"
              />
              {error && (
                <p className="mt-3 rounded-lg bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)] px-3 py-2 text-sm text-vermilion-deep">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <>
                    Reset password <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
