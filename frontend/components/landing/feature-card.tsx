"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export function FeatureCard({ title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, delay }}
      className="group rounded-xl border border-slate-200/80 bg-white p-[var(--card-padding)] shadow-[0_12px_28px_-14px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-14px_rgba(79,70,229,0.32)] dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-[0_12px_28px_-14px_rgba(2,6,23,0.9)]"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    </motion.article>
  );
}
