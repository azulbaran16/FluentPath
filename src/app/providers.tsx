"use client";

import { SessionProvider } from "next-auth/react";
import { ProgressSync } from "@/components/ProgressSync";

export function Providers({ children }: { children: React.ReactNode }) {
  // Don't re-poll the session on every window focus — it adds load and the
  // JWT session is stable for the tab's lifetime.
  //
  // ProgressSync renders null; it sits here so the per-load progress reconcile
  // mounts exactly once for the whole app and has session context.
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <ProgressSync />
      {children}
    </SessionProvider>
  );
}
