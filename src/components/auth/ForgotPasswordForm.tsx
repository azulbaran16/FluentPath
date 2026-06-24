"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setSent(true); // we don't reveal errors either way
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[var(--radius)] border border-line bg-card p-7 shadow-[var(--shadow-lift)]">
        {sent ? (
          <div className="text-center">
            <span
              className="mx-auto grid h-12 w-12 place-items-center rounded-2xl"
              style={{ background: "color-mix(in srgb, var(--teal) 14%, transparent)", color: "var(--teal)" }}
            >
              <MailCheck className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-muted">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a
              link to reset your password. It&apos;s valid for one hour.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={submit} className="mt-6">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-vermilion"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <>
                    Send reset link <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-ink hover:underline">
          ← Back to log in
        </Link>
      </p>
    </div>
  );
}
