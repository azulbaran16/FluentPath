import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS, getPost } from "@/lib/content/blog";
import { JsonLd } from "@/components/JsonLd";
import { SITE, absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          inLanguage: "es",
          author: { "@type": "Organization", name: SITE.name },
          publisher: { "@type": "Organization", name: SITE.name },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        }}
      />

      <Link href="/blog" className="text-sm text-muted hover:text-ink">
        ← Blog
      </Link>

      <header className="mt-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight">
          {post.title}
        </h1>
        <p className="mt-2 text-xs text-muted">{post.minutes} min de lectura</p>
      </header>

      <p className="mt-6 text-lg leading-relaxed text-ink-soft">{post.intro}</p>

      <div className="mt-8 space-y-8">
        {post.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="mt-2 leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 space-y-1.5">
                {s.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="rounded-lg bg-paper-deep/50 px-3 py-2 text-sm text-ink-soft"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-[var(--radius)] border border-line bg-card p-6 text-center shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl font-semibold">
          Practica esto de verdad, no solo lo leas
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          En FluentPath practicas inglés con escenarios reales y un tutor de IA
          que te corrige al hablar. Gratis para empezar.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--vermilion)" }}
        >
          Empezar gratis <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}
