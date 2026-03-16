"use client";

import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className = "" }: ChartCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
      className={`rounded-xl border border-slate-200/80 bg-white p-[var(--card-padding)] shadow-[0_14px_30px_-20px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-[0_18px_34px_-20px_rgba(2,6,23,0.92)] ${className}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-4 h-[300px] w-full">{children}</div>
    </motion.section>
  );
}
