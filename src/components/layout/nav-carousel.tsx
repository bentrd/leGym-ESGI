"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardCarousel } from "@/components/ui/card-carousel";
import { colorStyles, type ButtonColor } from "@/types/colors";
import { cn } from "@/lib/utils";
import { cloneElement, isValidElement } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  color?: ButtonColor;
};

type NavCarouselProps = {
  items: NavItem[];
  variant: "header" | "mobile";
  onNavigate?: () => void;
};

export function NavCarousel({ items, variant, onNavigate }: NavCarouselProps) {
  const isHeader = variant === "header";
  const cardWidth = isHeader ? "w-[130px]" : "w-[180px]";
  const iconSize = isHeader ? "h-3.5 w-3.5" : "h-5 w-5";
  const scrollAmount = isHeader ? 240 : 400;

  return (
    <CardCarousel
      itemCount={items.length}
      scrollAmount={scrollAmount}
      containerClassName={cn("scrollbar-hide flex overflow-x-auto overflow-y-visible gap-3 p-2")}
      showArrows={true}
      wrapperClassName={isHeader ? "w-full min-w-0 overflow-visible" : undefined}
      surface={isHeader ? "gray-100" : "muted"}
    >
      {items.map((item) => {
        const colorKey: ButtonColor = item.color ?? "grey";
        const palette = colorStyles[colorKey];

        const sizedIcon = isValidElement(item.icon)
          ? cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
              className: cn(
                (item.icon as React.ReactElement<{ className?: string }>).props?.className,
                iconSize,
                palette.icon,
              ),
            })
          : item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn("scroll-snap-align-start shrink-0", cardWidth)}
          >
            <Card
              className={cn(
                "group flex items-center justify-center transition-colors",
                isHeader ? "flex-row gap-1.5 p-2" : "flex-col gap-2 p-3",
                "hover:shadow-sm",
                palette.tintBg,
                palette.tintBorder,
                (palette as typeof palette & { tintHover?: string }).tintHover || palette.hover,
                "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              {sizedIcon && (
                <div className="flex shrink-0 items-center justify-center">{sizedIcon}</div>
              )}
              <span
                className={cn(
                  "leading-tight font-semibold whitespace-nowrap",
                  isHeader ? "text-xs" : "text-center text-sm",
                )}
              >
                {item.label}
              </span>
            </Card>
          </Link>
        );
      })}
    </CardCarousel>
  );
}
