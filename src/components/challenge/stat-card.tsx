import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { colorStyles, type ButtonColor } from "@/types/colors";

type StatCardProps = {
  color: ButtonColor;
  title: string;
  value: ReactNode;
  icon?: ReactElement;
  className?: string;
};

export function StatCard({ color, title, value, icon, className }: StatCardProps) {
  const palette = colorStyles[color];

  const largeIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ className?: string; style?: unknown }>, {
        className: cn(
          (icon as ReactElement<{ className?: string }>).props?.className,
          "hidden h-10 w-10 sm:inline-block",
        ),
      })
    : null;

  const smallIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ className?: string; style?: unknown }>, {
        className: cn(
          (icon as ReactElement<{ className?: string }>).props?.className,
          "h-6 w-6 sm:hidden",
        ),
      })
    : null;

  return (
    <Card className={cn(`${palette.tintBorder} ${palette.tintBg}`, className)}>
      <CardContent className="flex items-center gap-3 p-3">
        {largeIcon}
        <div className="flex-1">
          <p className="text-muted-foreground line-clamp-1 text-center text-xs font-medium whitespace-nowrap sm:text-sm">
            {title}
          </p>
          <p className="hidden text-2xl font-bold sm:inline-block">{value}</p>
          <div className="flex flex-row items-center justify-center gap-2 sm:hidden">
            {smallIcon}
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
