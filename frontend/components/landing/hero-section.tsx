"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="space-y-6"
      >
        <span className="inline-flex rounded-full border border-primary-200 bg-primary-100/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/20 dark:text-primary-300">
          Sales AI Platform
        </span>
        <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 dark:text-slate-100 md:text-6xl">
          Turn raw sales data into executive strategy
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Transform spreadsheet exports into a boardroom-ready intelligence layer with AI summaries,
          regional revenue trends, and automated reporting.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/upload">
            <Button size="lg">Start Upload</Button>
          </Link>
          <Link href="/history">
            <Button size="lg" variant="secondary">
              View Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 26 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        <DashboardPreview />
      </motion.div>
    </section>
  );
}
