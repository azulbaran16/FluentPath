"use client";

import { useProgressSync } from "@/lib/progress";

/**
 * The single app-wide mount point for D-02's per-load reconcile.
 *
 * It renders nothing and exists only so the reconcile runs once per tab, with
 * session context, no matter how many useProgress() consumers a page mounts —
 * /review alone mounts four. Rendered from src/app/providers.tsx inside
 * <SessionProvider>.
 */
export function ProgressSync() {
  useProgressSync();
  return null;
}
