"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap select-none min-w-fit",
  {
    variants: {
      variant: {
        default: "border-blue-300 bg-blue-50/50 text-blue-600",
        secondary: "border-green-300 bg-green-50/50 text-green-600",
        outline: "text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        destructive: "border-red-300 bg-red-50/50 text-red-600",
        noborder: "border-0 bg-transparent p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

function Badge({ className, variant, startIcon, endIcon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {startIcon}
      <span>{children}</span>
      {endIcon}
    </div>
  );
}

export { Badge, badgeVariants };
