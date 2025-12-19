"use client";

import Link from "next/link";
import { getBadgeColor } from "@/lib/badge-colors";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { ScrollableBadges } from "@/components/ui/scrollable-badges";
import { CardCarousel } from "@/components/ui/card-carousel";
import type { GymMinimal } from "@/types/gym";
import type { CarouselSurface } from "@/types/colors";

type GymCarouselProps = {
  gyms: GymMinimal[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  surface?: CarouselSurface;
};

export function GymCarousel({
  gyms,
  onLoadMore,
  isLoadingMore,
  hasMore,
  surface = "gray-100",
}: GymCarouselProps) {
  const getActivities = (gym: GymMinimal) => {
    if (!gym.activities) return [];
    return gym.activities
      .split(/[\n,]/)
      .map((a) => a.trim())
      .filter(Boolean);
  };

  return (
    <CardCarousel
      itemCount={gyms.length}
      onLoadMore={onLoadMore}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      emptyMessage="Aucune salle trouvée"
      surface={surface}
    >
      {gyms.map((gym) => (
        <Link
          key={gym.id}
          href={`/salles/${gym.slug}`}
          className="group shrink-0 scroll-ml-4"
          style={{ scrollSnapAlign: "start" }}
        >
          <div className="h-55 w-[320px] overflow-hidden rounded-lg border border-white bg-gray-100 transition-shadow hover:shadow-lg">
            <div className="flex h-full flex-col p-6">
              <div className="mb-2">
                <h3 className="line-clamp-2 text-lg font-semibold">{gym.name}</h3>
              </div>

              {gym.description && (
                <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{gym.description}</p>
              )}

              <div className="mt-auto space-y-2">
                <div className="shrink-0">
                  <Badge
                    variant="noborder"
                    className="text-xs"
                    startIcon={<MapPin className="h-3 w-3" />}
                  >
                    {gym.city}
                  </Badge>
                </div>
                <ScrollableBadges itemCount={getActivities(gym).length}>
                  {getActivities(gym).map((activity, idx) => {
                    const colorClass = getBadgeColor(activity);
                    return (
                      <div
                        key={idx}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors select-none ${colorClass}`}
                      >
                        {activity}
                      </div>
                    );
                  })}
                </ScrollableBadges>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </CardCarousel>
  );
}
