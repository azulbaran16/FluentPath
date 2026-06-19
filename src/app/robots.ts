import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private, per-user areas — no SEO value, keep them out of the index.
      disallow: ["/dashboard", "/review", "/diagnostic", "/tutor", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
