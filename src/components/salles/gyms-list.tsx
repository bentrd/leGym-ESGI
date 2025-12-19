import Link from "next/link";
import { getBadgeColor } from "@/lib/badge-colors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CityBadge } from "@/components/salles/city-badge";
import { Badge } from "@/components/ui/badge";
import { ScrollableBadges } from "@/components/ui/scrollable-badges";

type Gym = {
  id: number;
  name: string;
  city: string | null;
  description: string | null;
  activities: string | null;
  equipmentSummary: string | null;
  slug: string | null;
};

type GymsListProps = {
  gyms: Gym[];
};

const tagList = (value?: string | null) =>
  value
    ? value
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

export function GymsList({ gyms }: GymsListProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">Réseau leGym</p>
        <h1 className="text-3xl font-semibold">Toutes les salles du réseau</h1>
        <p className="text-muted-foreground text-sm">
          Présentez votre pass dans n&apos;importe quelle salle du réseau.
        </p>
      </div>

      {gyms.length === 0 ? (
        <Card className="border-white bg-gray-100">
          <CardHeader>
            <CardTitle>Aucune salle publiée pour le moment</CardTitle>
            <CardDescription>
              Les salles du réseau apparaîtront ici dès qu&apos;au moins un propriétaire aura
              complété sa fiche.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {gyms.map((gym) => {
            const tags =
              tagList(gym.activities).length > 0
                ? tagList(gym.activities)
                : tagList(gym.equipmentSummary);
            return (
              <Link key={gym.id} href={`/salles/${gym.slug}`} className="block">
                <Card className="flex h-55 flex-col border-white bg-gray-100 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                  <CardHeader className="flex-none space-y-2">
                    <CardTitle className="line-clamp-1 text-base font-semibold">
                      {gym.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2 text-sm">
                      {gym.description
                        ? gym.description
                        : tags.length
                          ? `Équipements clés : ${tags.slice(0, 2).join(" · ")}`
                          : "Salle approuvée, fiche en cours de finalisation."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative flex flex-1 flex-col justify-end gap-2">
                    {gym.city && (
                      <div className="flex-none">
                        <CityBadge city={gym.city} />
                      </div>
                    )}
                    {tags.length > 0 && (
                      <ScrollableBadges itemCount={tags.length}>
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`shrink-0 ${getBadgeColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </ScrollableBadges>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
