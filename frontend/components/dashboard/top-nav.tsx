"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppearanceToggle } from "@/components/theme/appearance-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/history", label: "History" }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="mx-auto flex h-[var(--nav-height)] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sales Insight Automator
        </Link>

        <div className="flex items-center gap-2">
          <AppearanceToggle />
          <nav className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 p-1 shadow-[0_8px_22px_-16px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-[0_10px_26px_-16px_rgba(2,6,23,0.85)]">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-[0_12px_24px_-16px_rgba(79,70,229,0.75)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          </nav>
        </div>
      </div>
    </header>
  );
}
