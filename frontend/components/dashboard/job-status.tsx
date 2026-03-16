import { JobStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";

const label: Record<JobStatus, string> = {
  queued: "Job queued",
  processing: "Processing dataset",
  completed: "Insights ready",
  failed: "Processing failed"
};

export function JobStatusHeader({ status }: { status: JobStatus }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/70">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label[status]}</p>
      <StatusBadge status={status} />
    </div>
  );
}
