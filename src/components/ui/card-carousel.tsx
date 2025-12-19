"use client";

import type { ReactNode } from "react";
import { ScrollableCarousel } from "@/components/ui/scrollable-carousel";
import type { CarouselSurface } from "@/types/colors";

type CardCarouselProps = {
  children: ReactNode;
  itemCount: number;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  emptyMessage?: string;
  scrollAmount?: number;
  containerClassName?: string;
  showArrows?: boolean;
  wrapperClassName?: string;
  surface?: CarouselSurface;
};

export function CardCarousel({
  children,
  itemCount,
  onLoadMore,
  isLoadingMore,
  hasMore,
  emptyMessage,
  scrollAmount,
  containerClassName,
  showArrows,
  wrapperClassName,
  surface,
}: CardCarouselProps) {
  return (
    <ScrollableCarousel
      itemCount={itemCount}
      onLoadMore={onLoadMore}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      emptyMessage={emptyMessage}
      scrollAmount={scrollAmount}
      containerClassName={containerClassName}
      showArrows={showArrows}
      wrapperClassName={wrapperClassName}
      surface={surface}
    >
      {children}
    </ScrollableCarousel>
  );
}
