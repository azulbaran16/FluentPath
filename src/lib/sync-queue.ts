// Durable, coalesced write queue for server sync (PROG-04, D-06, D-07).
//
// WHAT IT GUARANTEES
//   - A failed write survives the failure, the tab close and the reboot: the
//     queue lives in localStorage under `fluentpath:sync:v1` and is replayed on
//     the next load or the next flush trigger.
//   - A write is never discarded for age. The *delay* is capped, never the
//     attempt count — dropping a payload after N tries is exactly the silent
//     loss PROG-04 forbids. Only a rejection classified as permanent discards a
//     slot, and that path logs at error level.
//   - A newer write cannot be thrown away by an older flush still in the air:
//     every slot carries a monotonic sequence number and the success path
//     clears it only if the stored number still matches what was sent.
//   - Retries are spread with full jitter (AWS Architecture Blog), so a whole
//     population reconnecting after an outage does not retry in lockstep.
//   - If the queue itself cannot be persisted, the retry falls back to memory
//     and the status says `storageOk: false` rather than pretending.
//
// WHAT IT DOES NOT DO
//   - It is NOT a mutation site. It transports the snapshot it is handed,
//     byte for byte. Re-stamping D-01b's activity instant at flush time would
//     make a snapshot that has sat in the queue since yesterday claim to be the
//     freshest state on the account.
//   - It holds ONE slot per domain, not a log. Every entry is a full snapshot
//     of the same key, so an older entry is pure waste — and coalescing is what
//     bounds localStorage growth when a CELPIP snapshot carries full essays.
//   - It does not de-duplicate or order-guard across tabs. It does not need to:
//     `PUT /api/progress` merges on write (02-01), which makes duplicate
//     delivery, out-of-order arrival and two tabs flushing at once harmless.
//   - It does not poll, and it owns no listeners. Every flush trigger
//     (connectivity, page-hidden, the backoff timer, app load) is wired exactly
//     once in src/components/ProgressSync.tsx.
//   - It does not use the beacon transport, and it does not listen for the
//     legacy unload-time event. Both were ruled out in 02-RESEARCH.md: the
//     beacon is POST-only, capped at ~64 KiB and cannot report whether the
//     server accepted (so the slot cannot be cleared correctly), and the
//     unload-time events are not reliably fired on mobile. The page-hidden
//     transition is the last reliably observable point and the page is still
//     fully alive there, so a plain fetch is enough.
//
// WHEN TO REPLACE IT
//   When writes stop being whole-snapshot idempotent PUTs. The moment the API
//   grows an append-style or delta endpoint, coalescing to one slot per domain
//   becomes data loss rather than an optimisation, and this module needs a real
//   log with per-entry acknowledgement.
//
// The storage key uses the colon separator deliberately, matching
// `fluentpath:progress:v2`. The CELPIP store's `fluentpath.celpip.v1` dot
// separator is the older inconsistency, not the pattern to copy.
//
// Framework-free on purpose: no react, no next, no `@/` aliases and no runtime
// imports, so `scripts/verify-queue.mts` can exercise it under plain node with
// a memory-backed store installed on the global.

const KEY = "fluentpath:sync:v1";

/** Full-jitter base. */
const BASE_MS = 1_000;
/** Full-jitter ceiling; attempt 6 saturates. */
const CAP_MS = 60_000;

/** D-06's "persistent" threshold: BOTH must hold before the learner is told. */
const STALE_FAILURES = 3;
const STALE_AFTER_MS = 30_000;

export type SyncDomain = "progress" | "celpip";

/** What to do with a failed send. `retry` keeps the slot and reschedules;
 * `stop` means the session itself is gone; `drop` means this body will fail
 * forever and keeping it would spin. */
export type FailureDisposition = "retry" | "stop" | "drop";

export interface SyncSlot {
  /** Monotonic across both domains, taken from the maximum already stored, so
   * it is shared between tabs and survives a reload. */
  seq: number;
  /** The snapshot exactly as the store produced it. Never rewritten here. */
  body: unknown;
  attempts: number;
  /** Epoch ms; a flush before this moment does not spend an attempt. */
  nextAt: number;
}

export interface SyncQueue {
  progress: SyncSlot | null;
  celpip: SyncSlot | null;
}

export interface SyncStatus {
  /** Anything waiting to reach the server. */
  pending: boolean;
  /** Consecutive failed sends. Only a success resets this — a connectivity
   * hint must not, or the indicator would flicker off on every network event. */
  failures: number;
  lastSuccessAt: number | null;
  /** False once a queue write has thrown (quota, private browsing). The retry
   * is then in-memory only and will not survive the tab. */
  storageOk: boolean;
  /** D-06: failure has persisted, so the learner may finally be told. */
  stale: boolean;
}

const DOMAINS: readonly SyncDomain[] = ["progress", "celpip"];

/** Where each domain goes and the envelope it is sent in. `/api/celpip-progress`
 * arrives in 02-05; nothing enqueues to the CELPIP slot before then. */
const ENDPOINTS: Record<SyncDomain, { url: string; envelope: (body: unknown) => unknown }> = {
  progress: { url: "/api/progress", envelope: (body) => ({ progress: body }) },
  celpip: { url: "/api/celpip-progress", envelope: (body) => ({ celpipProgress: body }) },
};

const EMPTY_QUEUE: SyncQueue = { progress: null, celpip: null };

/* ------------------------------------------------------------------ *
 * Storage — reached only through these two helpers, which is what lets a
 * node harness install a memory-backed store on the global.
 * ------------------------------------------------------------------ */

function storage(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    // Some privacy modes throw on the property access itself.
    return null;
  }
}

function coerceSlot(value: unknown): SyncSlot | null {
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  if (typeof o.seq !== "number" || !Number.isFinite(o.seq)) return null;
  if (!("body" in o)) return null;
  const attempts =
    typeof o.attempts === "number" && Number.isFinite(o.attempts)
      ? Math.max(0, Math.floor(o.attempts))
      : 0;
  const nextAt = typeof o.nextAt === "number" && Number.isFinite(o.nextAt) ? o.nextAt : 0;
  return { seq: Math.max(0, Math.floor(o.seq)), body: o.body, attempts, nextAt };
}

function coerceQueue(value: unknown): SyncQueue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return EMPTY_QUEUE;
  const o = value as Record<string, unknown>;
  return { progress: coerceSlot(o.progress), celpip: coerceSlot(o.celpip) };
}

/** The authoritative copy while storage is unavailable or broken. Kept in step
 * with every successful read and every write, successful or not. */
let memoryQueue: SyncQueue = EMPTY_QUEUE;
let storageOk = true;

/** Reads defensively: any unreadable slot file yields an empty queue rather
 * than throwing on hydrate, exactly as readLocal() does for the progress
 * cache. Once a write has failed, memory is authoritative — re-reading storage
 * would resurrect the state the failed write was replacing. */
function readQueue(): SyncQueue {
  if (!storageOk) return memoryQueue;
  const s = storage();
  if (!s) return memoryQueue;
  try {
    const raw = s.getItem(KEY);
    const next = raw ? coerceQueue(JSON.parse(raw)) : EMPTY_QUEUE;
    memoryQueue = next;
    return next;
  } catch {
    return memoryQueue;
  }
}

/** Returns true on a successful persist, false if the write threw — the same
 * honest contract as celpip-progress.ts's writeLocal. A false here is not
 * fatal: memory still holds the write and the flush loop still sends it. It
 * only means the retry will not outlive the tab, which is what `storageOk`
 * exists to tell the learner. */
function writeQueue(next: SyncQueue): boolean {
  memoryQueue = next;
  const s = storage();
  if (!s) {
    storageOk = false;
    return false;
  }
  try {
    s.setItem(KEY, JSON.stringify({ progress: next.progress, celpip: next.celpip }));
    storageOk = true;
    return true;
  } catch {
    storageOk = false;
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Status — a subscribable snapshot shaped for useSyncExternalStore.
 * ------------------------------------------------------------------ */

let consecutiveFailures = 0;
let lastSuccessAt: number | null = null;
/** Fallback anchor for the staleness window before any success has happened. */
let startedAt = Date.now();

const statusListeners = new Set<() => void>();

function computeStatus(): SyncStatus {
  // Derived on every queue event rather than on a timer of its own: the flag
  // turns on at the first failure past the threshold, which is guaranteed to
  // come because a retryable failure always schedules another attempt. No
  // polling, and getStatus() keeps returning one cached reference in between.
  const since = Date.now() - (lastSuccessAt ?? startedAt);
  return {
    pending: memoryQueue.progress !== null || memoryQueue.celpip !== null,
    failures: consecutiveFailures,
    lastSuccessAt,
    storageOk,
    stale: consecutiveFailures >= STALE_FAILURES && since > STALE_AFTER_MS,
  };
}

let status: SyncStatus = computeStatus();

function same(a: SyncStatus, b: SyncStatus): boolean {
  return (
    a.pending === b.pending &&
    a.failures === b.failures &&
    a.lastSuccessAt === b.lastSuccessAt &&
    a.storageOk === b.storageOk &&
    a.stale === b.stale
  );
}

/** Emits only on a real change, so a subscriber that reschedules a timer from
 * the queue cannot be woken by a no-op flush and spin. */
function publish() {
  const next = computeStatus();
  if (same(next, status)) return;
  status = next;
  for (const listener of statusListeners) listener();
}

export function subscribeStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/** Cached reference — React throws if getSnapshot returns a fresh object. */
export function getStatus(): SyncStatus {
  return status;
}

/** Stable server snapshot so SSR and hydration agree. Nothing can be pending
 * or stale before the client has run. */
const SERVER_STATUS: SyncStatus = {
  pending: false,
  failures: 0,
  lastSuccessAt: null,
  storageOk: true,
  stale: false,
};

export function getServerStatus(): SyncStatus {
  return SERVER_STATUS;
}

/* ------------------------------------------------------------------ *
 * Backoff and classification.
 * ------------------------------------------------------------------ */

/**
 * Full jitter: a uniform draw below a capped exponential ceiling. Capped
 * exponential backoff alone still clusters retries; the jitter is what spreads
 * a reconnecting population (T-02-16).
 *
 * `rand` is injectable so scripts/verify-queue.mts can assert the bounds
 * without flaking.
 */
export function backoffDelay(attempt: number, rand: () => number = Math.random): number {
  const n = Number.isFinite(attempt) ? Math.max(0, Math.floor(attempt)) : 0;
  const ceiling = Math.min(CAP_MS, BASE_MS * 2 ** n);
  return Math.floor(rand() * ceiling);
}

/**
 * Maps a failed send to what may be done about it. `status` is the HTTP status,
 * or null when the request never produced a response at all (offline, DNS,
 * connection reset).
 *
 * The default is `retry`, deliberately: the never-lose direction. An unexpected
 * code keeps the payload rather than discarding it.
 */
export function classifyFailure(status: number | null): FailureDisposition {
  if (status === null) return "retry";
  // The session ended. Stop the loop rather than spinning; the local cache
  // still holds everything and the next sign-in reconciles it back up.
  if (status === 401 || status === 403) return "stop";
  // Rate limited (02-03 answers 429 with Retry-After), request timeout, early
  // hints replay — all worth trying again.
  if (status === 429 || status === 408 || status === 425) return "retry";
  // 409 means the server refused to overwrite a stored blob it could not read.
  // The body is fine; the row is frozen. Keep the write queued so a repaired
  // row heals on the next attempt instead of needing the learner to redo work,
  // and let the failure count raise the not-synced indicator meanwhile.
  if (status === 409) return "retry";
  // 400 and 413 are permanent for THIS body: under D-08 the route answers 400
  // only for a body that is not an object at all, and 413 only above 1 MiB.
  // The same bytes will fail forever, so retrying is a spin, not a rescue.
  if (status >= 400 && status < 500) return "drop";
  return "retry";
}

/** `Retry-After` in delta-seconds. An HTTP-date form or anything unparsable
 * falls back to the local curve rather than to a guess. */
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header.trim());
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.min(seconds * 1_000, CAP_MS);
}

/* ------------------------------------------------------------------ *
 * The queue itself.
 * ------------------------------------------------------------------ */

function withSlot(queue: SyncQueue, domain: SyncDomain, slot: SyncSlot | null): SyncQueue {
  return domain === "progress"
    ? { progress: slot, celpip: queue.celpip }
    : { progress: queue.progress, celpip: slot };
}

/**
 * Overwrites the domain's slot with a newer snapshot. Returns false if the
 * queue could not be persisted (the write is still held in memory).
 *
 * Coalescing to depth 1 is safe because every body is a full snapshot of the
 * same key: keeping the older one would upload the same data twice. It is also
 * what keeps an XP tick from re-uploading every CELPIP essay — the two domains
 * hold independent slots.
 */
export function enqueue(domain: SyncDomain, body: unknown): boolean {
  const queue = readQueue();
  const seq = Math.max(queue.progress?.seq ?? 0, queue.celpip?.seq ?? 0) + 1;
  const ok = writeQueue(withSlot(queue, domain, { seq, body, attempts: 0, nextAt: 0 }));
  publish();
  return ok;
}

/** The earliest moment a flush could do something, or null when the queue is
 * empty. ProgressSync schedules its single timer from this, so a flush still
 * happens when no event ever arrives (a captive portal, say). */
export function nextAttemptAt(): number | null {
  const queue = readQueue();
  const times = DOMAINS.map((d) => queue[d]?.nextAt).filter((t): t is number => t !== undefined);
  return times.length > 0 ? Math.min(...times) : null;
}

/**
 * Wakes the queue up: clears the scheduled delay and the attempt count on every
 * slot. Called when connectivity is restored — that event's only job is to be a
 * hint, so it is never used to gate a write, only to stop waiting.
 *
 * It deliberately does NOT reset the consecutive-failure count. Only a real
 * success may do that, or the D-06 indicator would blink off every time the
 * browser reported a network change it could not actually reach anything over.
 */
export function resetBackoff(): void {
  const queue = readQueue();
  if (!queue.progress && !queue.celpip) return;
  writeQueue({
    progress: queue.progress ? { ...queue.progress, attempts: 0, nextAt: 0 } : null,
    celpip: queue.celpip ? { ...queue.celpip, attempts: 0, nextAt: 0 } : null,
  });
  publish();
}

/**
 * Drops everything and re-anchors the staleness window. Used on the 401 path —
 * the queued state is auth-bound and the learner is now anonymous — and by
 * scripts/verify-queue.mts between scenarios.
 *
 * Discarding here is not data loss: the local cache still holds the same
 * snapshot, and the next authenticated load merges it back into the account.
 */
export function resetQueue(): void {
  writeQueue(EMPTY_QUEUE);
  consecutiveFailures = 0;
  lastSuccessAt = null;
  startedAt = Date.now();
  publish();
}

function onSuccess(domain: SyncDomain, sentSeq: number): void {
  const queue = readQueue();
  // Compare-and-clear. If a live write landed while this request was in the
  // air, its sequence number is higher and the slot must survive — clearing it
  // here is precisely how the newer write would be lost.
  if (queue[domain]?.seq === sentSeq) writeQueue(withSlot(queue, domain, null));
  consecutiveFailures = 0;
  lastSuccessAt = Date.now();
}

function onFailure(
  domain: SyncDomain,
  sentSeq: number,
  httpStatus: number | null,
  retryAfterMs: number | null,
): void {
  consecutiveFailures += 1;
  const disposition = classifyFailure(httpStatus);

  if (disposition === "stop") {
    // The whole queue is auth-bound; keeping it would spin against 401s.
    writeQueue(EMPTY_QUEUE);
    consecutiveFailures = 0;
    return;
  }

  const queue = readQueue();
  const slot = queue[domain];
  // A newer write arrived mid-flight: leave it alone with its fresh attempt
  // count. This failure belongs to a body that no longer exists.
  if (!slot || slot.seq !== sentSeq) return;

  if (disposition === "drop") {
    console.error(
      `[sync-queue] permanent rejection (HTTP ${httpStatus}) for the "${domain}" ` +
        `write — the queued snapshot is discarded and will not be retried. Under ` +
        `D-08 this should be unreachable, so an occurrence is a genuine bug.`,
    );
    writeQueue(withSlot(queue, domain, null));
    return;
  }

  const attempts = slot.attempts + 1;
  const delay = retryAfterMs ?? backoffDelay(attempts);
  writeQueue(withSlot(queue, domain, { ...slot, attempts, nextAt: Date.now() + delay }));
}

async function sendSlot(domain: SyncDomain, slot: SyncSlot): Promise<void> {
  const sentSeq = slot.seq;
  const { url, envelope } = ENDPOINTS[domain];
  let httpStatus: number | null = null;
  let retryAfterMs: number | null = null;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope(slot.body)),
    });
    if (res.ok) {
      onSuccess(domain, sentSeq);
      return;
    }
    httpStatus = res.status;
    retryAfterMs = parseRetryAfter(res.headers.get("Retry-After"));
  } catch {
    // No response at all — offline, DNS, reset. Retryable by classification.
    httpStatus = null;
  }
  onFailure(domain, sentSeq, httpStatus, retryAfterMs);
}

async function runFlush(): Promise<void> {
  for (const domain of DOMAINS) {
    const slot = readQueue()[domain];
    if (!slot) continue;
    if (slot.nextAt > Date.now()) continue;
    try {
      await sendSlot(domain, slot);
    } catch {
      // sendSlot already swallows transport failures; this is belt and braces
      // so one domain can never prevent the other from draining.
    }
  }
  publish();
}

/** Single-flight, module level: a page-hidden flush and a backoff-timer flush
 * in the same tab must not both fire. A caller arriving mid-flush gets the
 * SAME promise rather than an instant resolve, so a caller that reschedules
 * itself when the flush settles cannot busy-loop. (Two tabs flushing at once
 * is still possible and still harmless — the route merges on write.) */
let inFlight: Promise<void> | null = null;

export function flushQueue(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = runFlush().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
