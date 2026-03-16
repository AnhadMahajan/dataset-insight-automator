"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface InsightPanelProps {
  summary: string;
}

export function InsightPanel({ summary }: InsightPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-xl border border-primary-200 bg-white p-[var(--card-padding)] shadow-[0_18px_36px_-20px_rgba(99,102,241,0.45)] dark:border-primary-500/35 dark:bg-slate-900/80 dark:shadow-[0_18px_36px_-20px_rgba(30,41,59,0.95)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-primary-300/50 shadow-[0_0_0_1px_rgba(139,92,246,0.18),0_0_32px_rgba(99,102,241,0.16)] dark:border-primary-400/30 dark:shadow-[0_0_0_1px_rgba(129,140,248,0.3),0_0_32px_rgba(79,70,229,0.18)]" />
      <div className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
        <Sparkles className="h-4 w-4" />
        AI Generated Insights
      </div>
      <div className="relative whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">{summary}</div>
    </motion.section>
  );
}
