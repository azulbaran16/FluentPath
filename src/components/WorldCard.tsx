import Link from "next/link";
import type { World } from "@/lib/curriculum";
import { WorldIcon } from "@/lib/icons";
import { ProgressRing } from "./ProgressRing";

export function WorldCard({
  world,
  progress = 0,
  index = 0,
}: {
  world: World;
  progress?: number;
  index?: number;
}) {
  const accent = `var(${world.color})`;
  return (
    <Link
      href={`/world/${world.slug}`}
      className="rise group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <WorldIcon slug={world.slug} className="h-6 w-6" />
        </span>
        <ProgressRing value={progress} size={48} stroke={5} color={accent} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold leading-tight">
        {world.title}
      </h3>
      <p className="mt-1 text-sm text-muted">{world.tagline}</p>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span>{world.scenarios.length} scenarios</span>
        <span
          className="font-semibold transition-transform group-hover:translate-x-0.5"
          style={{ color: accent }}
        >
          Explore →
        </span>
      </div>
    </Link>
  );
}
