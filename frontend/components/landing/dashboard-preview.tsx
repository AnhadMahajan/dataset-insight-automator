"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const lineData = [
  { month: "Jan", revenue: 280 },
  { month: "Feb", revenue: 340 },
  { month: "Mar", revenue: 320 },
  { month: "Apr", revenue: 410 },
  { month: "May", revenue: 465 }
];

const barData = [
  { region: "North", value: 46 },
  { region: "West", value: 31 },
  { region: "East", value: 18 },
  { region: "South", value: 12 }
];

export function DashboardPreview() {
  const tooltipStyle = {
    background: "var(--tooltip-bg)",
    borderColor: "var(--tooltip-border)",
    borderRadius: 10,
    color: "var(--fg)"
  };

  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -7, 0], rotateX: [0, 1.5, 0], rotateY: [0, -1.5, 0] }}
      transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/60 p-5 shadow-[0_30px_80px_-30px_rgba(79,70,229,0.55)] dark:border-slate-700/45 dark:shadow-[0_28px_70px_-30px_rgba(30,41,59,0.9)]">
        <div className="pointer-events-none absolute -left-16 -top-20 h-44 w-44 rounded-full bg-primary-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-8 h-44 w-44 rounded-full bg-violet-400/25 blur-3xl" />

        <div className="relative space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700/70 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Revenue KPI</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">$684K</p>
            <p className="mt-1 text-xs text-emerald-600">+18.4% from previous quarter</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3 dark:border-slate-700/70 dark:bg-slate-900/70">
              <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Trend</p>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2.7}
                      dot={false}
                      animationDuration={700}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-3 dark:border-slate-700/70 dark:bg-slate-900/70">
              <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Region Mix</p>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
                    <XAxis dataKey="region" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
