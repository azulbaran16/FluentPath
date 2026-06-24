"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Check, AlertTriangle } from "lucide-react";

type Status = { kind: "idle" | "ok" | "error"; msg?: string };

export function SettingsForm({
  name: initialName,
  email,
  hasPassword,
}: {
  name: string;
  email: string;
  hasPassword: boolean;
}) {
  return (
    <div className="space-y-5">
      <ProfileCard initialName={initialName} email={email} />
      {hasPassword ? (
        <PasswordCard />
      ) : (
        <Card title="Password">
          <p className="text-sm text-muted">
            You sign in with Google, so there&apos;s no password to manage here.
          </p>
        </Card>
      )}
      <DangerCard />
    </div>
  );
}

function ProfileCard({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setStatus({ kind: "error", msg: d.error ?? "Could not save." });
      } else {
        setStatus({ kind: "ok", msg: "Saved." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Profile">
      <form onSubmit={save}>
        <Field id="email" label="Email" value={email} disabled />
        <Field
          id="name"
          label="Display name"
          value={name}
          onChange={setName}
        />
        <StatusLine status={status} />
        <SubmitButton loading={loading}>Save changes</SubmitButton>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setStatus({ kind: "error", msg: d.error ?? "Could not update." });
      } else {
        setStatus({ kind: "ok", msg: "Password updated." });
        setCurrent("");
        setNext("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Password">
      <form onSubmit={save}>
        <Field
          id="current"
          label="Current password"
          type="password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <Field
          id="next"
          label="New password"
          type="password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <StatusLine status={status} />
        <SubmitButton loading={loading}>Update password</SubmitButton>
      </form>
    </Card>
  );
}

function DangerCard() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function remove() {
    setLoading(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius)] border border-vermilion/30 bg-[color-mix(in_srgb,var(--vermilion)_5%,transparent)] p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-vermilion-deep">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} /> Danger zone
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Deleting your account permanently removes your profile and all your
        progress. This can&apos;t be undone.
      </p>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 cursor-pointer rounded-xl border border-vermilion/40 px-4 py-2 text-sm font-semibold text-vermilion-deep transition-colors hover:bg-[color-mix(in_srgb,var(--vermilion)_10%,transparent)]"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Are you sure?</span>
          <button
            onClick={remove}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-paper disabled:opacity-60"
            style={{ background: "var(--vermilion-deep)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            Yes, delete everything
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="cursor-pointer rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:bg-card"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  disabled,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-vermilion disabled:opacity-60"
      />
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  const ok = status.kind === "ok";
  return (
    <p
      className={`mb-3 flex items-center gap-1.5 text-sm ${
        ok ? "text-teal" : "text-vermilion-deep"
      }`}
    >
      {ok && <Check className="h-4 w-4" strokeWidth={2.5} />}
      {status.msg}
    </p>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
      {children}
    </button>
  );
}
