import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type CityBadgeProps = {
  city: string;
  className?: string;
};

export function CityBadge({ city, className }: CityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`w-fit ${className ?? ""}`}
      startIcon={<MapPin className="h-3.5 w-3.5" />}
    >
      {city}
    </Badge>
  );
}
