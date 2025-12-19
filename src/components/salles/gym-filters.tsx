"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollableCarousel } from "@/components/ui/scrollable-carousel";
import { Search, X, MapPin, Dumbbell } from "lucide-react";
import type { Gym } from "@/types/gym";
import { cn } from "@/lib/utils";
import { getBadgeColor } from "@/lib/badge-colors";

type GymFiltersProps = {
  gyms: Gym[];
  onFilteredGymsChange: (gyms: Gym[]) => void;
};

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function GymFilters({ gyms, onFilteredGymsChange }: GymFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const { cities, activities } = useMemo(() => {
    const citySet = new Set<string>();
    const activitySet = new Set<string>();

    gyms.forEach((gym) => {
      if (gym.city) {
        citySet.add(gym.city);
      }
      if (gym.activities) {
        gym.activities
          .split(/[\n,]/)
          .map((a) => a.trim())
          .filter(Boolean)
          .forEach((a) => activitySet.add(a));
      }
    });

    return {
      cities: Array.from(citySet).sort(),
      activities: Array.from(activitySet).sort(),
    };
  }, [gyms]);

  const filteredGyms = useMemo(() => {
    return gyms.filter((gym) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = gym.name.toLowerCase().includes(query);
        const matchesCity = gym.city.toLowerCase().includes(query);
        const matchesDescription = gym.description?.toLowerCase().includes(query) ?? false;
        const matchesAddress = gym.address.toLowerCase().includes(query);

        if (!matchesName && !matchesCity && !matchesDescription && !matchesAddress) {
          return false;
        }
      }

      if (selectedCities.length > 0 && !selectedCities.includes(gym.city)) {
        return false;
      }

      if (selectedActivities.length > 0) {
        const gymActivities = gym.activities
          ? gym.activities
              .split(/[\n,]/)
              .map((a) => a.trim())
              .filter(Boolean)
          : [];

        const hasMatchingActivity = selectedActivities.some((activity) =>
          gymActivities.includes(activity),
        );

        if (!hasMatchingActivity) {
          return false;
        }
      }

      return true;
    });
  }, [gyms, searchQuery, selectedCities, selectedActivities]);

  useEffect(() => {
    onFilteredGymsChange(filteredGyms);
  }, [filteredGyms, onFilteredGymsChange]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCities([]);
    setSelectedActivities([]);
  }, []);

  const toggleCity = useCallback((city: string) => {
    setSelectedCities((prev) => toggleInArray(prev, city));
  }, []);

  const toggleActivity = useCallback((activity: string) => {
    setSelectedActivities((prev) => toggleInArray(prev, activity));
  }, []);

  const hasActiveFilters =
    searchQuery || selectedCities.length > 0 || selectedActivities.length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Rechercher une salle, ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {cities.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Villes
            {selectedCities.length > 0 && (
              <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-xs font-semibold">
                {selectedCities.length}
              </span>
            )}
          </div>
          <ScrollableCarousel
            itemCount={cities.length}
            containerClassName="no-scrollbar flex gap-2 overflow-x-auto pb-1"
            showArrows={cities.length > 5}
            showGradients={cities.length > 5}
            surface="background"
            scrollAmount={200}
          >
            {cities.map((city) => {
              const isSelected = selectedCities.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  aria-pressed={isSelected}
                  className="focus-visible:ring-ring shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isSelected ? getBadgeColor(city, true) + " shadow-md" : "hover:bg-muted",
                    )}
                  >
                    {city}
                  </Badge>
                </button>
              );
            })}
          </ScrollableCarousel>
        </div>
      )}

      {activities.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Dumbbell className="h-4 w-4" />
            Activités
            {selectedActivities.length > 0 && (
              <span className="bg-foreground text-background rounded-full px-2 py-0.5 text-xs font-semibold">
                {selectedActivities.length}
              </span>
            )}
          </div>
          <ScrollableCarousel
            itemCount={activities.length}
            containerClassName="no-scrollbar flex gap-2 overflow-x-auto pb-1"
            showArrows={activities.length > 5}
            showGradients={activities.length > 5}
            surface="background"
            scrollAmount={200}
          >
            {activities.map((activity) => {
              const isSelected = selectedActivities.includes(activity);
              return (
                <button
                  key={activity}
                  type="button"
                  onClick={() => toggleActivity(activity)}
                  aria-pressed={isSelected}
                  className="focus-visible:ring-ring shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isSelected ? getBadgeColor(activity, true) + " shadow-md" : "hover:bg-muted",
                    )}
                  >
                    {activity}
                  </Badge>
                </button>
              );
            })}
          </ScrollableCarousel>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {filteredGyms.length} {filteredGyms.length === 1 ? "salle trouvée" : "salles trouvées"}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
