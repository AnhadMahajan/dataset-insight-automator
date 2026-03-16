"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Rows3 } from "lucide-react";

const THEME_KEY = "sia-theme";
const DENSITY_KEY = "sia-density";

type Theme = "light" | "dark";
type Density = "comfortable" | "compact";

function applyAppearance(theme: Theme, density: Density) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("density-compact", density === "compact");
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
}

export function AppearanceToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
    const savedDensity = (localStorage.getItem(DENSITY_KEY) as Density | null) ?? "comfortable";

    setTheme(savedTheme);
    setDensity(savedDensity);
    applyAppearance(savedTheme, savedDensity);
    setReady(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyAppearance(nextTheme, density);
  };

  const toggleDensity = () => {
    const nextDensity: Density = density === "comfortable" ? "compact" : "comfortable";
    setDensity(nextDensity);
    localStorage.setItem(DENSITY_KEY, nextDensity);
    applyAppearance(theme, nextDensity);
  };

  if (!ready) {
    return (
      <div className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white/90 px-1.5 dark:border-slate-700 dark:bg-slate-900/70">
        <div className="h-6 w-6 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        <div className="h-6 w-6 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Toggle dark mode"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={toggleDensity}
        className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold transition ${
          density === "compact"
            ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        }`}
        aria-label="Toggle compact density"
        title="Toggle compact layout"
      >
        <Rows3 className="h-3.5 w-3.5" />
        Compact
      </button>
    </div>
  );
}
