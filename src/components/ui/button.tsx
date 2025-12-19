"use client";

import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { type ButtonColor, colorStyles } from "@/types/colors";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "align-center border border-input bg-background text-foreground shadow-sm hover:bg-muted hover:text-foreground",
        outline: "border border-input bg-background/0 text-foreground hover:bg-muted",
        secondary:
          "align-center border border-gray-200 bg-gray-50 text-foreground shadow-sm hover:bg-gray-100",
        ghost: "text-foreground hover:bg-muted",
        link: "underline-offset-4 hover:underline",
        destructive: "border border-red-300 bg-red-50 text-red-600 shadow-sm hover:bg-red-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9 p-0 justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  color?: ButtonColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  to?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      color,
      startIcon,
      endIcon,
      children,
      to,
      ...props
    },
    ref,
  ) => {
    const colorClasses = color
      ? `${colorStyles[color].bg} ${colorStyles[color].border} ${colorStyles[color].text} ${colorStyles[color].hover} border shadow-sm`
      : "";

    const buttonClasses = cn(
      buttonVariants({ variant: color ? undefined : variant, size }),
      colorClasses,
      className,
    );

    const content = (
      <div className="flex w-full items-center justify-between gap-2">
        {startIcon && <span className="inline-flex">{startIcon}</span>}
        {children}
        {endIcon && <span className="inline-flex">{endIcon}</span>}
      </div>
    );

    if (to) {
      return (
        <Link
          href={to}
          className={buttonClasses}
          onClick={
            props.onClick
              ? (e) => props.onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>)
              : undefined
          }
        >
          {content}
        </Link>
      );
    }

    if (asChild) {
      return (
        <Slot className={buttonClasses} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button className={buttonClasses} ref={ref} {...props}>
        {content}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
