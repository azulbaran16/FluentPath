"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem("fluentpath:theme", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-line-strong text-ink-soft transition-colors hover:bg-paper-deep ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
      ) : (
        <Moon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.75} />
      )}
    </button>
  );
}
