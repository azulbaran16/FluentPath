"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  googleEnabled,
}: {
  mode: Mode;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Could not create your account.");
          setLoading(false);
          return;
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }
      // New users start with the placement test; returning users go home.
      router.push(isSignup ? "/diagnostic?welcome=1" : "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[var(--radius)] border border-line bg-card p-7 shadow-[var(--shadow-lift)]">
        <h1 className="font-display text-2xl font-semibold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isSignup
            ? "Start practicing in under a minute — it's free."
            : "Log in to pick up right where you left off."}
        </p>

        {googleEnabled && (
          <>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-paper-deep"
            >
              <GoogleMark /> Continue with Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              or with email
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className={googleEnabled ? "" : "mt-6"}>
          {isSignup && (
            <Field
              id="name"
              label="Name"
              type="text"
              value={name}
              autoComplete="name"
              onChange={setName}
              placeholder="Your name"
            />
          )}
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            autoComplete={isSignup ? "new-password" : "current-password"}
            onChange={setPassword}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
          />

          {!isSignup && (
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-muted hover:text-ink hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)] px-3 py-2 text-sm text-vermilion-deep"
            >
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
                {isSignup ? "Create account" : "Log in"}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to FluentPath?{" "}
            <Link href="/signup" className="font-semibold text-ink hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-vermilion"
      />
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
