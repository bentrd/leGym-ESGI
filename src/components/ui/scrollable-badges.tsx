"use client";

import { useEffect, useRef } from "react";
import { ScrollableCarousel } from "./scrollable-carousel";

type ScrollableBadgesProps = {
  children: React.ReactNode;
  itemCount: number;
};

export function ScrollableBadges({ children, itemCount }: ScrollableBadgesProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);
  const userScrolledRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    isAutoScrollingRef.current = false;
    startTimeRef.current = null;
  };

  const getScrollContainer = () => {
    if (!wrapperRef.current) return null;
    return wrapperRef.current.querySelector<HTMLDivElement>('[class*="overflow-x-auto"]');
  };

  const animate = (timestamp: number) => {
    const container = getScrollContainer();
    if (!container || userScrolledRef.current) {
      stopAutoScroll();
      return;
    }

    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    if (scrollLeft >= scrollWidth - clientWidth) {
      stopAutoScroll();
      return;
    }

    isAutoScrollingRef.current = true;
    container.scrollLeft = (elapsed / 1000) * 50;
    autoScrollRef.current = requestAnimationFrame(animate);
  };

  const handleMouseEnter = () => {
    userScrolledRef.current = false;
    startTimeRef.current = null;
    autoScrollRef.current = requestAnimationFrame(animate);
  };

  const handleMouseLeave = () => {
    stopAutoScroll();
    userScrolledRef.current = false;
    const container = getScrollContainer();
    if (container) {
      container.scrollLeft = 0;
    }
  };

  useEffect(() => {
    const container = getScrollContainer();
    if (!container) return;

    const handleScroll = () => {
      if (!isAutoScrollingRef.current) {
        userScrolledRef.current = true;
        stopAutoScroll();
      }
    };

    const handleWheel = () => {
      userScrolledRef.current = true;
      stopAutoScroll();
    };

    const handleTouchStart = () => {
      userScrolledRef.current = true;
      stopAutoScroll();
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", handleWheel);
    container.addEventListener("touchstart", handleTouchStart);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, [itemCount]);

  if (itemCount <= 2) {
    return <div className="flex gap-2">{children}</div>;
  }

  return (
    <div
      ref={wrapperRef}
      className="flex-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ScrollableCarousel
        itemCount={itemCount}
        containerClassName="no-scrollbar flex gap-2 overflow-x-auto pb-1"
        showArrows={false}
        surface="gray-100"
      >
        {children}
      </ScrollableCarousel>
    </div>
  );
}
