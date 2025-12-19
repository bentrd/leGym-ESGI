import type { ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { colorStyles, type ButtonColor } from "@/types/colors";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: ButtonColor;
  className?: string;
};

export function SectionHeader({
  icon,
  title,
  description,
  action,
  tone = "grey",
  className,
}: SectionHeaderProps) {
  const palette = colorStyles[tone];

  const sizedIcon = isValidElement(icon)
    ? cloneElement(icon as React.ReactElement<{ className?: string }>, {
        className: cn(
          (icon as React.ReactElement<{ className?: string }>).props?.className,
          "h-5 w-5",
          palette.icon,
        ),
      })
    : icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold sm:text-2xl">
          {sizedIcon && <span className="flex items-center">{sizedIcon}</span>}
          {title}
        </h2>
        {description && <p className="text-muted-foreground text-sm sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}
