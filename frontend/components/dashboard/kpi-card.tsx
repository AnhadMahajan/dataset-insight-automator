"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  trendLabel: string;
  trendDirection?: "up" | "down";
}

export function KpiCard({
  title,
  value,
  description,
  trendLabel,
  trendDirection = "up"
}: KpiCardProps) {
  const positive = trendDirection === "up";
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-slate-200/80 bg-white p-[var(--card-padding)] shadow-[0_14px_30px_-20px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_-22px_rgba(79,70,229,0.45)] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-[0_18px_34px_-20px_rgba(2,6,23,0.92)]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      <div
        className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          positive
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
            : "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
        }`}
      >
        <TrendIcon className="h-3.5 w-3.5" />
        {trendLabel}
      </div>
    </motion.div>
  );
}
