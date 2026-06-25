import type { NextConfig } from "next";

// Content-Security-Policy. 'unsafe-inline' is required because Next.js injects
// inline hydration scripts and styles (and next/font emits an inline <style>).
// External scripts are still blocked — only same-origin code runs. Stripe
// Checkout/Portal are full-page redirects (not framed), so no stripe.com
// allowances are needed here. Avatars (e.g. Google) load over https.
// Analytics domains (Google Analytics 4 + Meta Pixel) are allow-listed so the
// tags work without weakening the rest of the policy. img-src already allows
// https: for tracking pixels and avatars.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://connect.facebook.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Force HTTPS for a year (incl. subdomains).
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Anti-clickjacking (frame-ancestors covers modern browsers; this covers old ones).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Allow the microphone for same-origin (Web Speech API in Speaking/Listening);
  // block camera & geolocation outright.
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
];

const nextConfig: NextConfig = {
  // Emit a self-contained server (.next/standalone) for Docker / Coolify.
  output: "standalone",
  // Don't leak the framework version in responses.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
