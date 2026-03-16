import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  queued: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  processing: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  failed: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        styles[status] ?? "bg-slate-100 text-slate-800 dark:bg-slate-700/60 dark:text-slate-200"
      )}
    >
      {status}
    </span>
  );
}
