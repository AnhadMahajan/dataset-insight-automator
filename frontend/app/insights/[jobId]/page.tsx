"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { fetchJob } from "@/lib/api";
import { JobDetail } from "@/lib/types";
import { InsightsCharts } from "@/components/dashboard/charts";
import { InsightPanel } from "@/components/dashboard/insight-panel";
import { JobStatusHeader } from "@/components/dashboard/job-status";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { TopNav } from "@/components/dashboard/top-nav";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    let cancelled = false;

    const loadJob = async () => {
      try {
        const detail = await fetchJob(jobId);
        if (cancelled) {
          return;
        }
        setJob(detail);
        setError(null);

        if (detail.status === "completed" || detail.status === "failed") {
          clearInterval(intervalId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load job.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const intervalId = setInterval(() => {
      loadJob().catch(() => null);
    }, 3000);
    loadJob().catch(() => null);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [jobId]);

  const metricsReady = useMemo(
    () => Boolean(job?.status === "completed" && job.metrics && job.summary),
    [job]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(1000px_450px_at_20%_5%,rgba(99,102,241,0.12),transparent_60%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] dark:bg-[radial-gradient(900px_420px_at_20%_5%,rgba(79,70,229,0.22),transparent_58%),linear-gradient(180deg,#020617_0%,#0b1120_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[size:36px_36px] bg-[linear-gradient(to_right,rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.11)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />
      <TopNav />
      <main className="relative z-10 mx-auto max-w-6xl space-y-5 px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Analytics Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">Insights Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Live status and analytics for job {jobId}</p>
        </motion.div>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}

        {job && (
          <>
            <JobStatusHeader status={job.status} />

            {job.status !== "completed" && !error && (
              <Card>
                <CardTitle>Processing</CardTitle>
                <CardDescription className="mt-1">
                  Your dataset is being analyzed. This page refreshes every 3 seconds.
                </CardDescription>
              </Card>
            )}

            {job.status === "failed" && (
              <Card className="border border-rose-200 bg-rose-50 dark:border-rose-500/35 dark:bg-rose-500/10">
                <CardTitle className="text-rose-800 dark:text-rose-300">Processing Failed</CardTitle>
                <CardDescription className="text-rose-700 dark:text-rose-300">{job.error ?? "Unknown error."}</CardDescription>
              </Card>
            )}

            {metricsReady && job.metrics && job.summary && (
              <>
                <MetricCards metrics={job.metrics} />
                <InsightsCharts metrics={job.metrics} />
                <InsightPanel summary={job.summary} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
