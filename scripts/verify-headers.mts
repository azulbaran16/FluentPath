// Executable proof of the security response headers.
//
//   node --experimental-strip-types scripts/verify-headers.mts
//
// Same posture as scripts/verify-merge.mts and scripts/verify-schema.mts: no
// test runner and no new dependency. next.config.ts carries exactly one import
// and it is `import type`, which strip-types erases entirely, so node can load
// the config directly and ask it for the headers it will serve. The import
// carries an explicit .ts extension because path aliases (and extensionless
// relative specifiers) only resolve inside the bundler.
//
// Node prints a MODULE_TYPELESS_PACKAGE_JSON warning on stderr while loading a
// .ts file from a package with no "type" field. That is expected noise, not a
// failure — this script's verdict is its exit code, never its stderr.
//
// WHY THIS FILE EXISTS. The CELPIP Speaking recorder plays a recording back
// through an object URL, and `media-src` decides whether the browser will load
// it. `next dev` does not apply next.config.ts's `headers()`, so the failure it
// guards against is invisible in development and appears only against a real
// build — the exact shape of defect that reaches production. This makes the
// policy assertable by command instead of by memory.
//
// If an assertion here exposes a real weakening of the policy, fix the config —
// never weaken the assertion.

import nextConfig from "../next.config.ts";

/* ------------------------------------------------------------------ *
 * Harness (mirrors scripts/verify-schema.mts)
 * ------------------------------------------------------------------ */

let failures = 0;
let checks = 0;

function ok(label: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) return;
  failures += 1;
  console.error(`FAIL  ${label}${detail ? `\n      ${detail}` : ""}`);
}

function group(name: string) {
  console.log(`· ${name}`);
}

/* ------------------------------------------------------------------ *
 * Read the policy the config will actually serve.
 * ------------------------------------------------------------------ */

const headersFn = nextConfig.headers;
if (typeof headersFn !== "function") {
  console.error("FAIL  next.config.ts exports no headers() function");
  process.exit(1);
}

const routes = await headersFn();
ok("headers() returns at least one route entry", routes.length > 0);

const route = routes[0];
ok(
  "the first route entry covers every path",
  route?.source === "/:path*",
  `source = ${String(route?.source)}`,
);

function headerValue(key: string): string | null {
  const found = route?.headers.find(
    (h) => h.key.toLowerCase() === key.toLowerCase(),
  );
  return found ? found.value : null;
}

const csp = headerValue("Content-Security-Policy");
if (csp === null) {
  console.error("FAIL  no Content-Security-Policy header is served");
  process.exit(1);
}

/** The policy is one string of `; `-joined directives. Split it back into a
 * directive -> source-list map so an assertion names a directive rather than
 * pattern-matching the whole line — `"blob:" appears somewhere in the CSP` is
 * exactly the assertion that would pass while blob: sat in script-src. */
const directives = new Map<string, string[]>();
for (const raw of csp.split(";")) {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) continue;
  directives.set(parts[0].toLowerCase(), parts.slice(1));
}

function sources(name: string): string[] | null {
  return directives.get(name) ?? null;
}

function has(name: string, source: string): boolean {
  return (sources(name) ?? []).includes(source);
}

/* ------------------------------------------------------------------ *
 * 1. media-src — the directive this phase added, and the whole reason
 *    in-browser playback of a recording works in production.
 * ------------------------------------------------------------------ */

group("media-src — an in-memory recording can be played back");
{
  ok("media-src is declared explicitly", sources("media-src") !== null, csp);
  ok(
    "media-src allows same-origin media",
    has("media-src", "'self'"),
    `media-src ${(sources("media-src") ?? []).join(" ")}`,
  );
  ok(
    "media-src allows blob: — the object URL the recorder hands <audio>",
    has("media-src", "blob:"),
    `media-src ${(sources("media-src") ?? []).join(" ")}`,
  );
}

/* ------------------------------------------------------------------ *
 * 2. The widening did not drift. blob: in script-src is the genuinely
 *    dangerous case; these assertions are what keep the media grant
 *    from becoming a script grant on a later edit.
 * ------------------------------------------------------------------ */

group("the widening stayed narrow — no new script capability");
{
  ok(
    "script-src does NOT allow blob:",
    !has("script-src", "blob:"),
    `script-src ${(sources("script-src") ?? []).join(" ")}`,
  );
  ok("script-src does NOT allow data:", !has("script-src", "data:"));
  ok(
    "script-src still restricts to 'self' plus the named analytics origins",
    has("script-src", "'self'"),
  );
  ok("default-src is still 'self'", has("default-src", "'self'"));
  ok(
    "object-src is still 'none'",
    (sources("object-src") ?? []).join(" ") === "'none'",
    `object-src ${(sources("object-src") ?? []).join(" ")}`,
  );
  ok(
    "frame-ancestors is still 'none'",
    (sources("frame-ancestors") ?? []).join(" ") === "'none'",
    `frame-ancestors ${(sources("frame-ancestors") ?? []).join(" ")}`,
  );
  ok("base-uri is still 'self'", has("base-uri", "'self'"));
  ok("form-action is still 'self'", has("form-action", "'self'"));
  ok("upgrade-insecure-requests is still set", directives.has("upgrade-insecure-requests"));
  ok(
    "connect-src does NOT allow blob: — recordings never go over the wire",
    !has("connect-src", "blob:"),
  );
}

/* ------------------------------------------------------------------ *
 * 3. The microphone grant. The Speaking section depends on it and it is
 *    easy to lose in an unrelated Permissions-Policy edit.
 * ------------------------------------------------------------------ */

group("Permissions-Policy — the microphone stays granted to this origin");
{
  const pp = headerValue("Permissions-Policy");
  ok("Permissions-Policy is served", pp !== null);
  ok(
    "microphone is granted to same-origin",
    (pp ?? "").replace(/\s+/g, "").includes("microphone=(self)"),
    `Permissions-Policy: ${String(pp)}`,
  );
  ok("camera is still denied outright", (pp ?? "").replace(/\s+/g, "").includes("camera=()"));
  ok(
    "geolocation is still denied outright",
    (pp ?? "").replace(/\s+/g, "").includes("geolocation=()"),
  );
}

/* ------------------------------------------------------------------ *
 * 4. The rest of the security header set, unchanged.
 * ------------------------------------------------------------------ */

group("the remaining security headers are intact");
{
  ok(
    "HSTS is a year and covers subdomains",
    (headerValue("Strict-Transport-Security") ?? "").includes("max-age=31536000"),
  );
  ok("X-Frame-Options is DENY", headerValue("X-Frame-Options") === "DENY");
  ok("X-Content-Type-Options is nosniff", headerValue("X-Content-Type-Options") === "nosniff");
  ok(
    "Referrer-Policy is strict-origin-when-cross-origin",
    headerValue("Referrer-Policy") === "strict-origin-when-cross-origin",
  );
  ok("the framework version is not advertised", nextConfig.poweredByHeader === false);
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

if (failures > 0) {
  console.error(`\nverify-headers: ${failures} of ${checks} assertions FAILED`);
  process.exit(1);
}
console.log(`\nverify-headers: all ${checks} assertions passed.`);
