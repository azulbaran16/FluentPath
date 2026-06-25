// Lightweight in-memory rate limiter (fixed window).
//
// Scope: single server instance — counters live in memory and reset on
// restart. That's enough for the current one-container deployment and adds
// real brute-force/abuse protection. If the app is ever scaled to multiple
// instances, swap this for a shared store (Redis, etc.).

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();
let opsSinceSweep = 0;

function sweep(now: number) {
  for (const [key, w] of buckets) {
    if (w.resetAt <= now) buckets.delete(key);
  }
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  /** seconds until the window resets (for Retry-After) */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded.
  if (++opsSinceSweep >= 500) {
    opsSinceSweep = 0;
    sweep(now);
  }

  const w = buckets.get(key);
  if (!w || w.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (w.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((w.resetAt - now) / 1000) };
  }
  w.count += 1;
  return { ok: true, remaining: limit - w.count, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Traefik/Coolify set these). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
