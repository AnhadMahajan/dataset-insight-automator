import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-[0_14px_28px_-16px_rgba(79,70,229,0.8)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_20px_40px_-18px_rgba(99,102,241,0.8)] focus-visible:ring-primary-500 dark:from-primary-500 dark:to-violet-500 dark:shadow-[0_20px_38px_-20px_rgba(99,102,241,0.9)]",
        secondary:
          "bg-white text-slate-700 border border-slate-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-slate-50 hover:shadow-[0_16px_30px_-18px_rgba(15,23,42,0.42)] focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:shadow-[0_16px_30px_-18px_rgba(2,6,23,0.9)]",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:scale-[1.01] focus-visible:ring-slate-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      },
      size: {
        default: "h-[var(--btn-h-default)] px-[var(--btn-px-default)]",
        sm: "h-[var(--btn-h-sm)] px-[var(--btn-px-sm)]",
        lg: "h-[var(--btn-h-lg)] px-[var(--btn-px-lg)]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
