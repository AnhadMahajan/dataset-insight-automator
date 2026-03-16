import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-slate-200/80 bg-white p-[var(--card-padding)] shadow-[0_18px_34px_-22px_rgba(15,23,42,0.42)] dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-[0_18px_34px_-22px_rgba(2,6,23,0.9)]",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-slate-900 dark:text-slate-100", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-600 dark:text-slate-400", className)} {...props} />;
}
