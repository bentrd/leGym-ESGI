"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { GymFilters } from "@/components/salles/gym-filters";
import { GymCarousel } from "@/components/salles/gym-carousel";
import type { Gym } from "@/types/gym";

const GymMap = dynamic(
  () => import("@/components/salles/gym-map").then((mod) => ({ default: mod.GymMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/50 flex h-125 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    ),
  },
);

type SallesClientPageProps = {
  initialGyms: Gym[];
};

export function SallesClientPage({ initialGyms }: SallesClientPageProps) {
  const [allGyms, setAllGyms] = useState<Gym[]>(initialGyms);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>(initialGyms);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialGyms.length === 12);

  const loadMoreGyms = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const lastId = allGyms[allGyms.length - 1]?.id || "";
      const response = await fetch(`/api/gyms?cursor=${lastId}&limit=12`);
      const result = await response.json();

      const newGyms = result.data || result;

      if (!newGyms || newGyms.length === 0 || newGyms.length < 12) {
        setHasMore(false);
      }

      if (newGyms && newGyms.length > 0) {
        setAllGyms((prev) => [...prev, ...newGyms]);
      }
    } catch (error) {
      console.error("Failed to load more gyms:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Nos Salles de Sport</h1>

      <div className="mb-8">
        <GymFilters gyms={allGyms} onFilteredGymsChange={setFilteredGyms} />
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Parcourir les salles</h2>
        <GymCarousel
          gyms={filteredGyms}
          onLoadMore={loadMoreGyms}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          surface="background"
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Localisation</h2>
        <GymMap gyms={filteredGyms} />
      </div>
    </main>
  );
}
