import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { BLOG_POSTS } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "Blog — aprender inglés con trucos reales",
  description:
    "Guías prácticas para aprender inglés: errores comunes de hispanohablantes, frases para viajar y entrevistas, y gramática explicada simple.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "FluentPath Blog", url: "/blog" },
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">Blog</h1>
        <p className="mt-2 text-muted">
          Trucos prácticos para aprender inglés de verdad — gramática, frases y
          los errores más comunes de los hispanohablantes.
        </p>
      </header>

      <div className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft"
                >
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-[var(--vermilion)]">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{post.description}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> {post.minutes} min
              de lectura
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
