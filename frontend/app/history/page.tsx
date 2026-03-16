"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { fetchJobs } from "@/lib/api";
import { JobDetail } from "@/lib/types";
import { TopNav } from "@/components/dashboard/top-nav";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs(50);
        setJobs(response.jobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs().catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0b1120_100%)]">
      <TopNav />
      <main className="mx-auto max-w-5xl space-y-5 px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Processing History</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Recent uploads and processing outcomes</p>
        </div>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>}

        {!loading && jobs.length === 0 && (
          <Card>
            <CardTitle>No Jobs Yet</CardTitle>
            <CardDescription className="mt-2">Upload your first dataset to start generating insights.</CardDescription>
            <Link className="mt-4 inline-flex" href="/upload">
              <Button>Go to Upload</Button>
            </Link>
          </Card>
        )}

        {jobs.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_18px_36px_-22px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-[0_18px_36px_-22px_rgba(2,6,23,0.95)]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upload History</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Track dataset processing and delivery status</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/90">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">File Name</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Upload Time</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Email Sent</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr
                      key={job.id}
                      className={cn(
                        "border-t border-slate-100 transition-colors hover:bg-primary-50/35 dark:border-slate-800 dark:hover:bg-primary-500/10",
                        index % 2 === 0
                          ? "bg-white dark:bg-slate-900/70"
                          : "bg-slate-50/60 dark:bg-slate-800/45"
                      )}
                    >
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{job.filename}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{new Date(job.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {job.status === "completed" ? "Yes" : job.status === "failed" ? "No" : "Pending"}
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/insights/${job.id}`}>
                          <Button size="sm" variant="secondary">
                            View Insights
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
