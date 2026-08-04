"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { WORLDS, SKILL_META, type Skill } from "@/lib/curriculum";
import { WorldIcon, SkillIcon, NAV_ICONS } from "@/lib/icons";
import { GraduationCap, RefreshCw, LogOut, Lightbulb, Settings, Trophy, Headphones, Layers, BookMarked, Sparkles, Gift } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const SKILLS = Object.keys(SKILL_META) as Skill[];

export interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

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

export function Sidebar({ user }: { user?: SidebarUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg border border-line-strong px-3 py-1.5 text-sm"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <aside
        className={`${
          open ? "block" : "hidden"
        } lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:py-10`}
      >
        <div className="hidden items-center justify-between lg:flex">
          <Brand />
          <ThemeToggle />
        </div>

        {/* Core, everyday actions only — kept short on purpose. */}
        <nav className="mt-2 lg:mt-10 flex flex-col gap-1">
          <NavLink href="/dashboard" active={isActive("/dashboard")}>
            <NAV_ICONS.dashboard className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Home
          </NavLink>
          <NavLink href="/tutor" active={isActive("/tutor")}>
            <NAV_ICONS.tutor className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            AI Tutor
          </NavLink>
          <NavLink href="/review" active={isActive("/review") || isActive("/mistakes")}>
            <RefreshCw className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Review
          </NavLink>
          {/* The CELPIP section had no entry point anywhere in the app until now:
              four skills of exam practice were reachable only by typing the URL.
              Found by the beta user, who asked where it was. */}
          <NavLink href="/celpip" active={isActive("/celpip")}>
            <GraduationCap className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            CELPIP
          </NavLink>
        </nav>

        <p className="mt-7 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Scenarios
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
          <NavLink href="/listening" active={isActive("/listening")}>
            <Headphones className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={1.75} />
            Listening
          </NavLink>
          <NavLink href="/vocabulary" active={isActive("/vocabulary")}>
            <Layers className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={1.75} />
            Vocabulary
          </NavLink>
          {/* The volume tier. Added in the same commit as the route, because
              the comment above the CELPIP entry records what happens otherwise.
              No count in the label: a hand-written number in a nav item is the
              un-derived claim this project has refused since 2.1, and it is the
              one place nobody re-reads when the bank grows. */}
          <NavLink href="/core-vocabulary" active={isActive("/core-vocabulary")}>
            <BookMarked className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={1.75} />
            Core vocabulary
          </NavLink>
        </nav>

        {/* Secondary, occasional actions — tucked out of the daily path. */}
        <p className="mt-7 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
          More
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          <NavLink href="/pro" active={isActive("/pro")}>
            <Sparkles
              className="h-[1.05rem] w-[1.05rem]"
              strokeWidth={1.75}
              style={{ color: "var(--vermilion)" }}
            />
            FluentPath Pro
          </NavLink>
          <NavLink href="/invite" active={isActive("/invite")}>
            <Gift className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Invite friends
          </NavLink>
          <NavLink href="/achievements" active={isActive("/achievements")}>
            <Trophy className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Achievements
          </NavLink>
          <NavLink href="/diagnostic" active={isActive("/diagnostic")}>
            <GraduationCap className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Placement test
          </NavLink>
          <NavLink href="/tips" active={isActive("/tips")}>
            <Lightbulb className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
            Learning tips
          </NavLink>
        </nav>

        {!user && (
          <div className="mt-8 space-y-2 border-t border-line pt-4">
            <Link
              href="/signup"
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
            >
              Sign up free
            </Link>
            <Link
              href="/login"
              className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-line-strong px-3 py-2 text-sm font-semibold transition-colors hover:bg-paper-deep"
            >
              Log in
            </Link>
          </div>
        )}

        {user && (
          <div className="mt-8 border-t border-line pt-4">
            <div className="flex items-center gap-3 px-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-paper-deep font-display text-sm font-semibold text-ink-soft">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user.name ?? user.email ?? "?").charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user.name ?? "Learner"}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <Link
              href="/settings"
              className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-deep"
            >
              <Settings className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-deep"
            >
              <LogOut className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
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
