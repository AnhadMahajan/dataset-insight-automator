"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

import { fetchJobs, uploadDataset } from "@/lib/api";
import { TopNav } from "@/components/dashboard/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function UploadPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => Boolean(email && file && !loading), [email, file, loading]);

  const recoverRecentJob = async (targetEmail: string, targetFile: File): Promise<string | null> => {
    try {
      const response = await fetchJobs(25);
      const emailNormalized = targetEmail.trim().toLowerCase();
      const filenameNormalized = targetFile.name.trim().toLowerCase();
      const nowMs = Date.now();
      const maxAgeMs = 5 * 60 * 1000;

      const matched = response.jobs
        .filter((job) => {
          const createdAtMs = Date.parse(job.created_at);
          if (!Number.isFinite(createdAtMs) || nowMs - createdAtMs > maxAgeMs) {
            return false;
          }

          return (
            job.recipient_email.trim().toLowerCase() === emailNormalized
            && job.filename.trim().toLowerCase() === filenameNormalized
          );
        })
        .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));

      return matched[0]?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await uploadDataset(file, email);
      setJobId(response.job_id);
      setTimeout(() => router.push(`/insights/${response.job_id}`), 900);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload dataset.";

      // If the browser lost the response but backend accepted the upload,
      // recover by finding a recently created matching job.
      if (message.includes("Failed to fetch") || message.includes("Network request failed")) {
        const recoveredJobId = await recoverRecentJob(email, file);
        if (recoveredJobId) {
          setJobId(recoveredJobId);
          setTimeout(() => router.push(`/insights/${recoveredJobId}`), 900);
          return;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Upload Sales Dataset</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Accepted formats: CSV or XLSX, max file size 10MB. Your insight report will be emailed when
            processing completes.
          </p>
        </motion.div>

        <Card className="space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Recipient Email
              <Input
                type="email"
                placeholder="team@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Dataset File
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </label>

            <div className="flex items-center gap-3">
              <Button disabled={!canSubmit} type="submit">
                <UploadCloud className="mr-2 h-4 w-4" />
                {loading ? "Uploading..." : "Upload and Process"}
              </Button>
              <Link href="/history">
                <Button variant="secondary" type="button">
                  View History
                </Button>
              </Link>
            </div>
          </form>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-28 w-full" />
            </motion.div>
          )}

          {jobId && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/35 dark:bg-emerald-500/10"
            >
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                Upload successful
              </CardTitle>
              <CardDescription className="mt-1 text-emerald-700 dark:text-emerald-300">
                Job {jobId} is queued. Redirecting to insights dashboard.
              </CardDescription>
            </motion.div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
