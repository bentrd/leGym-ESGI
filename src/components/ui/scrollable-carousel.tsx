"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselSurface } from "@/types/colors";

type ScrollableCarouselProps = {
  children: ReactNode;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  itemCount: number;
  emptyMessage?: string;
  scrollAmount?: number;
  containerClassName?: string;
  showArrows?: boolean;
  showGradients?: boolean;
  wrapperClassName?: string;
  surface?: CarouselSurface;
};

const surfaceGradients: Record<CarouselSurface, string> = {
  white: "from-white",
  background: "from-background",
  "gray-100": "from-gray-100",
  "gray-50": "from-gray-50",
  muted: "from-muted",
};

export function ScrollableCarousel({
  children,
  onLoadMore,
  isLoadingMore,
  hasMore,
  itemCount,
  emptyMessage = "Aucun élément trouvé",
  scrollAmount = 400,
  containerClassName,
  showArrows = true,
  showGradients = true,
  wrapperClassName,
  surface = "gray-100",
}: ScrollableCarouselProps) {
  const shouldShowGradients = showGradients;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const gradientFrom = surfaceGradients[surface];

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtStart = container.scrollLeft <= 1;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

    setShowLeftGradient(!isAtStart);
    setShowRightGradient(!isAtEnd);
  }, []);

  const handleScroll = useCallback(() => {
    checkScroll();

    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  }, [checkScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();

    container.addEventListener("scroll", handleScroll);

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [checkScroll, handleScroll]);

  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (itemCount === 0) {
    return (
      <div className="bg-muted/50 flex h-60 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={
        wrapperClassName
          ? `relative overflow-visible ${wrapperClassName}`
          : "relative overflow-visible"
      }
    >
      {shouldShowGradients && (
        <div
          className={`${gradientFrom} pointer-events-none absolute top-0 left-0 z-10 h-full w-16 bg-linear-to-r to-transparent transition-opacity duration-300`}
          style={{ opacity: showLeftGradient ? 1 : 0 }}
        />
      )}

      {showArrows && (
        <Button
          onClick={() => scroll("left")}
          startIcon={<ChevronLeft className="h-6 w-6" />}
          className="bg-background hover:bg-muted absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full p-2 shadow-lg transition-opacity duration-300"
          style={{ opacity: showLeftGradient && !isScrolling ? 1 : 0 }}
          aria-label="Scroll left"
          disabled={!showLeftGradient || isScrolling}
        />
      )}

      <div
        ref={scrollContainerRef}
        className={containerClassName || "scrollbar-hide flex gap-4 overflow-x-auto pb-10"}
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}

        {hasMore && (
          <div ref={sentinelRef} className="w-[320px] shrink-0 scroll-ml-4">
            <div className="bg-muted/50 flex h-55 w-full items-center justify-center rounded-lg border border-dashed">
              {isLoadingMore ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Faites défiler pour plus</p>
              )}
            </div>
          </div>
        )}
      </div>

      {shouldShowGradients && (
        <div
          className={`${gradientFrom} pointer-events-none absolute top-0 right-0 z-10 h-full w-16 bg-linear-to-l to-transparent transition-opacity duration-300`}
          style={{ opacity: showRightGradient ? 1 : 0 }}
        />
      )}

      {showArrows && (
        <Button
          onClick={() => scroll("right")}
          className="bg-background hover:bg-muted absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full border border-white p-2 shadow-lg transition-opacity duration-300"
          style={{ opacity: showRightGradient && !isScrolling ? 1 : 0 }}
          aria-label="Scroll right"
          disabled={!showRightGradient || isScrolling}
          endIcon={<ChevronRight className="h-6 w-6" />}
        />
      )}
    </div>
  );
}
