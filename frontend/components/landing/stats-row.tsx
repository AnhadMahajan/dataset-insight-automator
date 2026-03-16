"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

const stats: StatItem[] = [
  { label: "rows analyzed", value: 10, suffix: "M+" },
  { label: "reports generated", value: 500, suffix: "+" },
  { label: "processing time", value: 5, prefix: "<", suffix: " seconds" },
  { label: "uptime", value: 99.9, suffix: "%" }
];

function CountUp({ value, prefix = "", suffix = "" }: Omit<StatItem, "label">) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const duration = 1100;
    const start = performance.now();

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = value * eased;
      const hasDecimal = String(value).includes(".");
      setDisplay(hasDecimal ? current.toFixed(1) : Math.round(current).toString());

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function StatsRow() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-slate-200/70 bg-white/90 p-[var(--card-padding)] shadow-[0_18px_35px_-22px_rgba(15,23,42,0.5)] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-[0_18px_35px_-22px_rgba(2,6,23,0.95)]"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="space-y-1">
            <CountUp value={item.value} prefix={item.prefix} suffix={item.suffix} />
            <p className="text-sm capitalize text-slate-600 dark:text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
