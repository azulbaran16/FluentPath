"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WORLDS, SKILL_META, type Skill } from "@/lib/curriculum";
import { WorldIcon, SkillIcon, NAV_ICONS } from "@/lib/icons";
import { GraduationCap, RefreshCw } from "lucide-react";

const SKILLS = Object.keys(SKILL_META) as Skill[];

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-ink text-paper font-semibold"
          : "text-ink-soft hover:bg-paper-deep"
      }`}
    >
      {children}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg border border-line-strong px-3 py-1.5 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${
          open ? "block" : "hidden"
        } lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:py-10`}
      >
        <div className="hidden lg:block">
          <Brand />
        </div>

        <nav className="mt-2 lg:mt-10 flex flex-col gap-1">
          <NavLink href="/" active={isActive("/")}>
            <NAV_ICONS.dashboard className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Dashboard
          </NavLink>
          <NavLink href="/tutor" active={isActive("/tutor")}>
            <NAV_ICONS.tutor className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            AI Tutor
          </NavLink>
          <NavLink href="/diagnostic" active={isActive("/diagnostic")}>
            <GraduationCap className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Placement test
          </NavLink>
          <NavLink href="/review" active={isActive("/review")}>
            <RefreshCw className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Review
          </NavLink>
        </nav>

        <p className="mt-7 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Worlds
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          {WORLDS.map((w) => (
            <NavLink
              key={w.slug}
              href={`/world/${w.slug}`}
              active={isActive(`/world/${w.slug}`)}
            >
              <WorldIcon slug={w.slug} className="h-[1.05rem] w-[1.05rem] shrink-0" />
              <span className="truncate">{w.title}</span>
            </NavLink>
          ))}
        </nav>

        <p className="mt-7 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Skills
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          {SKILLS.map((s) => (
            <NavLink
              key={s}
              href={`/skill/${s}`}
              active={isActive(`/skill/${s}`)}
            >
              <SkillIcon skill={s} className="h-[1.05rem] w-[1.05rem] shrink-0" />
              {SKILL_META[s].label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl text-paper"
        style={{ background: "var(--vermilion)" }}
      >
        <span className="font-display text-lg font-semibold">F</span>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        FluentPath
      </span>
    </Link>
  );
}
