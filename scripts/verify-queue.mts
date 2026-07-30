// Executable proof of the durable sync queue (PROG-04, D-06, D-07).
//
//   node --experimental-strip-types scripts/verify-queue.mts
//
// Same posture as scripts/verify-merge.mts and scripts/verify-schema.mts: no
// test runner and no new dependency. src/lib/sync-queue.ts has zero runtime
// imports and no react, no next and no `@/` aliases, so node can load it
// directly — which is the whole reason the queue reaches storage only through
// internal helpers reading `globalThis.localStorage`. This script installs a
// memory-backed store on the global BEFORE the dynamic import, so the module
// binds to the fake exactly as it would bind to a browser's real one.
//
// What is proven here is the anti-loss policy, not just a shape: a write is
// never discarded for age, a newer write cannot be thrown away by an older
// flush that happened to be in the air, and the learner is told nothing until
// failure has genuinely persisted.
//
// If an assertion here exposes a real defect, fix the module — never weaken the
// assertion.

/* ------------------------------------------------------------------ *
 * Harness
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  // report(), never console.error: the module's own error logging is captured
  // below, and a failure that lands in that capture is a failure nobody sees.
  report(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

function eq(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual) ?? "undefined";
  const b = JSON.stringify(expected) ?? "undefined";
  ok(label, a === b, a === b ? undefined : `actual   ${a}\n      expected ${b}`);
}

function group(name: string) {
  console.log(`· ${name}`);
}

/* ------------------------------------------------------------------ *
 * A memory-backed Storage, installed before the module is imported.
 * ------------------------------------------------------------------ */

const store = new Map<string, string>();
let storageThrows = false;

const memoryStorage: Storage = {
  get length() {
    return store.size;
  },
  clear() {
    store.clear();
  },
  getItem(key: string) {
    return store.has(key) ? store.get(key)! : null;
  },
  key(index: number) {
    return [...store.keys()][index] ?? null;
  },
  removeItem(key: string) {
    store.delete(key);
  },
  setItem(key: string, value: string) {
    // Models a quota-exceeded / private-browsing throw, which is the only way
    // a real setItem fails. The queue must keep the write in memory and say so.
    if (storageThrows) throw new Error("QuotaExceededError (simulated)");
    store.set(key, String(value));
  },
};

(globalThis as { localStorage?: Storage }).localStorage = memoryStorage;

const KEY = "fluentpath:sync:v1";

interface RawSlot {
  seq: number;
  body: unknown;
  attempts: number;
  nextAt: number;
}
interface RawQueue {
  progress: RawSlot | null;
  celpip: RawSlot | null;
}

/** Reads what actually landed in storage, deliberately WITHOUT going through
 * the module — the point is to prove the persisted shape, not to trust the
 * module's own view of it. */
function persisted(): RawQueue {
  const raw = store.get(KEY);
  return raw ? (JSON.parse(raw) as RawQueue) : { progress: null, celpip: null };
}

/** A missing slot yields impossible sentinel values rather than throwing, so a
 * regression that empties a slot reports as a readable FAIL line instead of
 * crashing the run on a null dereference and hiding every later assertion. */
function slot(domain: "progress" | "celpip"): RawSlot {
  return persisted()[domain] ?? { seq: -1, body: "<<no slot>>", attempts: -1, nextAt: -1 };
}

/* ------------------------------------------------------------------ *
 * Controllable clock, randomness and transport.
 * ------------------------------------------------------------------ */

const realNow = Date.now;
const realRandom = Math.random;
const realFetch = globalThis.fetch;
const realConsoleError = console.error;

let clock = 0;
Date.now = () => clock;

interface Sent {
  url: string;
  method: string;
  body: unknown;
}

let sent: Sent[] = [];
/** Replaced per scenario. Returns a Response, or throws to model a network
 * error (which is what a real `fetch` does when the connection fails). */
let respond: (call: Sent) => Response | Promise<Response> = () => new Response(null, { status: 200 });
/** Runs while the request is "in the air" — used to model a live write racing
 * a flush that has already read the slot. */
let duringFlight: (() => void) | null = null;

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const call: Sent = {
    url: String(input),
    method: init?.method ?? "GET",
    body: typeof init?.body === "string" ? JSON.parse(init.body) : init?.body,
  };
  sent.push(call);
  if (duringFlight) duringFlight();
  return respond(call);
}) as typeof fetch;

// Captures only the module's own error logging. Node routes its
// ExperimentalWarning for type stripping through console.error too, and
// counting that as a permanent-rejection log would be a false failure.
let logged: string[] = [];
console.error = (...args: unknown[]) => {
  const line = args.map(String).join(" ");
  if (line.includes("[sync-queue]")) logged.push(line);
  else realConsoleError(line);
};
function flushLogs() {
  const out = logged;
  logged = [];
  return out;
}
/** Failures must still be visible, so the capture is lifted for our own output. */
function report(line: string) {
  realConsoleError(line);
}

/* ------------------------------------------------------------------ *
 * The module under test.
 * ------------------------------------------------------------------ */

const q = await import("../src/lib/sync-queue.ts");

const {
  backoffDelay,
  classifyFailure,
  enqueue,
  flushQueue,
  getStatus,
  nextAttemptAt,
  resetBackoff,
  resetQueue,
  subscribeStatus,
} = q;

/** Full reset between scenarios: storage, transport log, clock and the
 * module's own counters. */
function scenario(name: string, at = 100_000) {
  group(name);
  storageThrows = false;
  store.clear();
  sent = [];
  duringFlight = null;
  respond = () => new Response(null, { status: 200 });
  clock = at;
  Math.random = () => 0;
  resetQueue();
}

/* ================================================================== *
 * 1. Full-jitter backoff: bounded, saturating, deterministic.
 * ================================================================== */

group("backoff — full jitter, capped delay");

const CAP = 60_000;
const ceilingFor = (n: number) => Math.min(CAP, 1_000 * 2 ** n);
const almostOne = 1 - Number.EPSILON;

ok("a zero draw yields no delay at all", backoffDelay(0, () => 0) === 0);
for (let n = 0; n <= 12; n += 1) {
  const hi = backoffDelay(n, () => almostOne);
  ok(
    `attempt ${n}: the draw stays strictly below its ceiling ${ceilingFor(n)}`,
    hi < ceilingFor(n) && hi >= 0,
    `got ${hi}`,
  );
  ok(`attempt ${n}: a zero draw is still 0`, backoffDelay(n, () => 0) === 0);
}

// The ceiling doubles until it saturates, and then stops moving. A midpoint
// draw makes the ceiling directly observable.
eq("attempt 0 ceiling is the 1s base", backoffDelay(0, () => 0.5), 500);
eq("attempt 5 ceiling has not yet saturated", backoffDelay(5, () => 0.5), 16_000);
eq("attempt 6 ceiling has saturated at 60s", backoffDelay(6, () => 0.5), 30_000);
for (let n = 6; n <= 20; n += 1) {
  eq(`attempt ${n} stays saturated`, backoffDelay(n, () => 0.5), 30_000);
}
ok(
  "the ceiling never decreases as attempts grow",
  Array.from({ length: 20 }, (_, n) => backoffDelay(n, () => almostOne)).every(
    (v, i, all) => i === 0 || v >= all[i - 1]!,
  ),
);
eq("a nonsensical attempt count degrades to the base, not to NaN", backoffDelay(-3, () => 0.5), 500);
eq("a NaN attempt count degrades to the base", backoffDelay(Number.NaN, () => 0.5), 500);

/* ================================================================== *
 * 2. Failure classification.
 * ================================================================== */

group("classification — what may be retried, what must stop, what is dropped");

eq("a network error (no response at all) is retried", classifyFailure(null), "retry");
eq("500 is retried", classifyFailure(500), "retry");
eq("502 is retried", classifyFailure(502), "retry");
eq("503 is retried", classifyFailure(503), "retry");
eq("429 is retried — the route's own rate limit, not a rejection", classifyFailure(429), "retry");
eq("408 request timeout is retried", classifyFailure(408), "retry");
// 409 is the frozen-row guard: the server could not read the stored blob and
// refused to overwrite it. The body is valid, so dropping it would discard the
// learner's write for a condition that a repair fixes. It must NOT fall into
// the generic 4xx drop rule below.
eq(
  "409 is retried — the row is frozen, not the payload rejected",
  classifyFailure(409),
  "retry",
);
eq("401 stops the loop — the session is gone", classifyFailure(401), "stop");
eq("403 stops the loop for the same reason", classifyFailure(403), "stop");
eq("400 is permanent for this body", classifyFailure(400), "drop");
eq("413 is permanent for this body", classifyFailure(413), "drop");
eq("404 is permanent", classifyFailure(404), "drop");
eq("a 2xx is never classified as a failure", classifyFailure(200), "retry");

/* ================================================================== *
 * 3. Coalescing: one slot per domain, newest body wins.
 * ================================================================== */

scenario("coalescing — a full snapshot supersedes the one before it");

ok("enqueue reports a successful persist", enqueue("progress", { xp: 10 }) === true);
const first = slot("progress");
enqueue("progress", { xp: 20 });
const second = slot("progress");

eq("the persisted queue holds exactly the two domain slots", Object.keys(persisted()).sort(), [
  "celpip",
  "progress",
]);
eq("the slot holds the newer body", second.body, { xp: 20 });
ok("the sequence number advanced", second.seq > first.seq, `${first.seq} -> ${second.seq}`);
eq("the attempt count is reset by a fresh enqueue", second.attempts, 0);
eq("a fresh enqueue is due immediately", second.nextAt, 0);
ok("the status reports pending work", getStatus().pending === true);
ok("a healthy enqueue does not mark storage broken", getStatus().storageOk === true);

/* ================================================================== *
 * 4. The two domains are independent slots.
 * ================================================================== */

scenario("per-domain isolation — an XP tick does not re-upload every essay");

enqueue("progress", { xp: 10 });
const progressBefore = JSON.stringify(persisted().progress);
enqueue("celpip", { attempts: { "task-1": ["…1200 characters of essay…"] } });

eq("the progress slot is untouched by a CELPIP enqueue", JSON.stringify(persisted().progress), progressBefore);
ok("the CELPIP slot now exists", persisted().celpip !== null);
ok(
  "the sequence counter is shared across domains, so it stays monotonic",
  slot("celpip").seq > slot("progress").seq,
);

// …and survives a "reload": a queue read back from storage keeps counting up.
const highest = slot("celpip").seq;
enqueue("progress", { xp: 99 });
ok(
  "a later enqueue takes its number from the maximum already stored",
  slot("progress").seq > highest,
);

/* ================================================================== *
 * 5. The happy path, and the envelope each domain is sent in.
 * ================================================================== */

scenario("flush — success clears the slot");

enqueue("progress", { xp: 10 });
await flushQueue();

eq("exactly one request was made", sent.length, 1);
eq("the progress slot goes to the existing route", sent[0]!.url, "/api/progress");
eq("as a PUT", sent[0]!.method, "PUT");
eq("in the { progress } envelope", sent[0]!.body, { progress: { xp: 10 } });
eq("the slot is cleared on success", persisted().progress, null);
ok("nothing is pending", getStatus().pending === false);
eq("the consecutive-failure count is zero", getStatus().failures, 0);
eq("the last success is recorded", getStatus().lastSuccessAt, clock);
ok("the status is healthy", getStatus().stale === false);
eq("no permanent-rejection was logged", flushLogs(), []);

scenario("flush — the CELPIP slot has its own route and envelope");

enqueue("celpip", { drafts: {} });
await flushQueue();
eq("the CELPIP slot goes to its own route", sent[0]!.url, "/api/celpip-progress");
eq("in the { celpipProgress } envelope", sent[0]!.body, { celpipProgress: { drafts: {} } });

/* ================================================================== *
 * 6. THE RACE: compare-and-clear.
 * ================================================================== */

scenario("compare-and-clear — a write enqueued mid-flight is not thrown away");

enqueue("progress", { xp: 10 });
const sentSeq = slot("progress").seq;
// The learner completes a scenario while the request is in the air.
duringFlight = () => {
  enqueue("progress", { xp: 30 });
};
await flushQueue();

ok("the slot survived the successful flush", persisted().progress !== null);
eq("and it still holds the NEWER body", slot("progress").body, { xp: 30 });
ok(
  "because its sequence number no longer matches what was sent",
  slot("progress").seq > sentSeq,
);
ok("the queue still reports pending work", getStatus().pending === true);
eq("the success itself was still recorded", getStatus().failures, 0);

scenario("compare-and-clear — the matching sequence DOES empty the slot");

enqueue("progress", { xp: 10 });
await flushQueue();
eq("nothing raced it, so the slot is gone", persisted().progress, null);

/* ================================================================== *
 * 7. Retryable failure: the write survives, the delay grows.
 * ================================================================== */

scenario("retry — a network error keeps the write and schedules a new attempt");

Math.random = () => 0.5;
enqueue("progress", { xp: 10 });
respond = () => {
  throw new TypeError("Failed to fetch");
};
await flushQueue();

ok("the write is still queued", persisted().progress !== null);
eq("its body is untouched", slot("progress").body, { xp: 10 });
eq("the attempt count advanced", slot("progress").attempts, 1);
eq("the next attempt is scheduled on the jittered curve", slot("progress").nextAt, clock + 1_000);
eq("one consecutive failure is recorded", getStatus().failures, 1);
ok("a single failure is never shown to the learner", getStatus().stale === false);
eq("nothing was logged — a retryable failure is not an incident", flushLogs().length, 0);

// A flush before the scheduled moment must not spend an attempt.
sent = [];
await flushQueue();
eq("a flush before nextAt sends nothing", sent.length, 0);
eq("and does not inflate the attempt count", slot("progress").attempts, 1);
eq("nor the failure count", getStatus().failures, 1);

// …and once the clock passes it, the attempt happens and the delay doubles.
clock = slot("progress").nextAt;
await flushQueue();
eq("at nextAt the attempt is made", sent.length, 1);
eq("the attempt count advanced again", slot("progress").attempts, 2);
eq("on the doubled ceiling", slot("progress").nextAt, clock + 2_000);

eq("nextAttemptAt reports the earliest scheduled moment", nextAttemptAt(), slot("progress").nextAt);

// The connectivity hint wakes it up without waiting for the curve.
resetBackoff();
eq("resetBackoff clears the scheduled delay", slot("progress").nextAt, 0);
eq("and the attempt count", slot("progress").attempts, 0);
eq(
  "but NOT the consecutive-failure count — only a real success may do that",
  getStatus().failures,
  2,
);

/* ================================================================== *
 * 8. A write is NEVER dropped for age.
 * ================================================================== */

scenario("no silent loss — fifty consecutive failures still keep the payload");

Math.random = () => 0;
enqueue("progress", { xp: 10 });
respond = () => new Response(null, { status: 503 });
for (let i = 0; i < 50; i += 1) {
  clock += 60_000;
  await flushQueue();
}
ok("after fifty failures the write is still queued", persisted().progress !== null);
eq("with its body intact", slot("progress").body, { xp: 10 });
eq("and fifty attempts on the record", slot("progress").attempts, 50);
eq("the failure count matches", getStatus().failures, 50);
eq("nothing was logged as a permanent rejection", flushLogs().length, 0);

/* ================================================================== *
 * 9. Retry-After is honoured over the local curve.
 * ================================================================== */

scenario("429 — the server's own Retry-After wins");

enqueue("progress", { xp: 10 });
respond = () => new Response(null, { status: 429, headers: { "Retry-After": "5" } });
await flushQueue();
ok("the write is kept", persisted().progress !== null);
eq("and rescheduled where the server asked", slot("progress").nextAt, clock + 5_000);

scenario("429 — an unparsable Retry-After falls back to the curve");

Math.random = () => 0.5;
enqueue("progress", { xp: 10 });
respond = () => new Response(null, { status: 429, headers: { "Retry-After": "soon" } });
await flushQueue();
eq("the local jittered delay is used instead", slot("progress").nextAt, clock + 1_000);

/* ================================================================== *
 * 10. Permanent rejection: dropped, and loudly.
 * ================================================================== */

scenario("400 — a body that can never succeed is dropped, with a log");

enqueue("progress", { xp: 10 });
respond = () => new Response(null, { status: 400 });
await flushQueue();
eq("the slot is discarded", persisted().progress, null);
const drop400 = flushLogs();
eq("exactly one line was logged", drop400.length, 1);
ok("carrying the module prefix", drop400[0]!.includes("[sync-queue]"), drop400[0]);
ok("and the status code", drop400[0]!.includes("400"), drop400[0]);

scenario("413 — an oversized body is dropped the same way");

enqueue("progress", { xp: 10 });
respond = () => new Response(null, { status: 413 });
await flushQueue();
eq("the slot is discarded", persisted().progress, null);
eq("and the drop was logged", flushLogs().length, 1);

/* ================================================================== *
 * 11. 401: stop the loop, clear auth-bound state, do not spin.
 * ================================================================== */

scenario("401 — the session ended; stop rather than spin");

enqueue("progress", { xp: 10 });
enqueue("celpip", { drafts: {} });
respond = () => new Response(null, { status: 401 });
await flushQueue();

eq("the progress slot is cleared", persisted().progress, null);
eq("the CELPIP slot is cleared too — all of it was auth-bound", persisted().celpip, null);
eq("nothing is pending", getStatus().pending, false);
eq("the failure counter is reset, so no indicator is left behind", getStatus().failures, 0);
eq("and there is nothing left to schedule", nextAttemptAt(), null);

sent = [];
await flushQueue();
eq("a further flush sends nothing at all", sent.length, 0);

/* ================================================================== *
 * 12. The D-06 staleness threshold, in both directions.
 * ================================================================== */

scenario("staleness — three failures AND thirty seconds, not either alone", 0);

Math.random = () => 0;
// Anchor a real success so the threshold is measured from a known moment.
enqueue("progress", { xp: 1 });
await flushQueue();
eq("the anchor succeeded", getStatus().lastSuccessAt, 0);

respond = () => {
  throw new TypeError("Failed to fetch");
};
enqueue("progress", { xp: 2 });

clock = 1_000;
await flushQueue();
eq("one failure", getStatus().failures, 1);
ok("nothing is shown", getStatus().stale === false);

clock = 2_000;
await flushQueue();
eq("two failures", getStatus().failures, 2);
ok("still nothing — a two-second blip is invisible (D-06)", getStatus().stale === false);

clock = 3_000;
await flushQueue();
eq("three failures", getStatus().failures, 3);
ok(
  "three failures inside thirty seconds is still not persistent failure",
  getStatus().stale === false,
);

clock = 40_000;
await flushQueue();
eq("four failures", getStatus().failures, 4);
ok("now both conditions hold, so the learner is told", getStatus().stale === true);

// The other direction: plenty of time, not enough failures.
scenario("staleness — long silence with fewer than three failures stays quiet", 0);

Math.random = () => 0;
enqueue("progress", { xp: 1 });
await flushQueue();
respond = () => {
  throw new TypeError("Failed to fetch");
};
enqueue("progress", { xp: 2 });
clock = 100_000;
await flushQueue();
clock = 200_000;
await flushQueue();
eq("two failures, more than thirty seconds apart", getStatus().failures, 2);
ok("the threshold needs BOTH conditions, so nothing is shown", getStatus().stale === false);

// …and recovery.
scenario("staleness — one success turns it off again", 0);

Math.random = () => 0;
enqueue("progress", { xp: 1 });
await flushQueue();
respond = () => {
  throw new TypeError("Failed to fetch");
};
enqueue("progress", { xp: 2 });
for (const t of [10_000, 20_000, 30_000, 40_000]) {
  clock = t;
  await flushQueue();
}
ok("the indicator is on", getStatus().stale === true);

respond = () => new Response(null, { status: 200 });
clock = 41_000;
await flushQueue();
ok("the very next success turns it off", getStatus().stale === false);
eq("the failure count is back to zero", getStatus().failures, 0);
eq("and the queue is empty", persisted().progress, null);

/* ================================================================== *
 * 13. A storage write that throws: in-memory retry, degraded status.
 * ================================================================== */

scenario("degraded storage — the write is kept in memory and the status says so");

storageThrows = true;
const persistedOk = enqueue("progress", { xp: 42 });
eq("enqueue reports the failed persist rather than pretending", persistedOk, false);
eq("nothing reached storage", persisted().progress, null);
eq("the status reports broken storage", getStatus().storageOk, false);
eq("but the write is still pending in memory", getStatus().pending, true);

respond = () => new Response(null, { status: 200 });
await flushQueue();
eq("and the in-memory body is still sent", sent[0]!.body, { progress: { xp: 42 } });
eq("nothing pending once it lands", getStatus().pending, false);

/* ================================================================== *
 * 14. Defensive read of the persisted slot file.
 * ================================================================== */

scenario("defensive read — unreadable persisted state degrades to an empty queue");

for (const raw of [
  "",
  "{",
  "null",
  "[]",
  '"a string"',
  "{{{",
  '{"progress":42}',
  '{"progress":{"body":{"xp":1}}}',
  '{"celpip":{"seq":"nope","body":{}}}',
]) {
  store.set(KEY, raw);
  let threw = false;
  let status;
  try {
    status = getStatus();
    // A read happens on the next enqueue; it must not throw either.
    enqueue("progress", { xp: 1 });
  } catch {
    threw = true;
  }
  ok(`an unreadable slot file never throws: ${raw.slice(0, 24)}`, !threw);
  ok("and the queue still works afterwards", persisted().progress !== null, JSON.stringify(status));
  store.clear();
  resetQueue();
}

/* ================================================================== *
 * 15. The subscribable status.
 * ================================================================== */

scenario("subscription — the status is readable with useSyncExternalStore");

let notifications = 0;
const unsubscribe = subscribeStatus(() => {
  notifications += 1;
});
const before = getStatus();
enqueue("progress", { xp: 10 });
ok("a subscriber is notified when the queue changes", notifications > 0);
ok("and the snapshot reference changed with it", getStatus() !== before);

const stable = getStatus();
ok("repeated reads return the SAME reference (React requires a cached snapshot)", getStatus() === stable);

// The change-only emit is load-bearing, not a micro-optimisation: ProgressSync
// reschedules its single backoff timer from this subscription, so an emit that
// carries no change would wake the timer, which would flush, which would emit…
const quiet = notifications;
enqueue("progress", { xp: 11 });
eq("a queue event that changes nothing wakes nobody", notifications, quiet);
ok("and the cached snapshot is not replaced either", getStatus() === stable);

const at = notifications;
unsubscribe();
enqueue("progress", { xp: 20 });
eq("an unsubscribed listener is not called", notifications, at);

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

Date.now = realNow;
Math.random = realRandom;
globalThis.fetch = realFetch;
console.error = realConsoleError;

if (failures > 0) {
  report(`\n${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nOK — ${checks}/${checks} assertions passed`);
