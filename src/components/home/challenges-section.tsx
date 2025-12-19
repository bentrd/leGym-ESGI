import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardCarousel } from "@/components/ui/card-carousel";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { domainMeta } from "@/lib/ui/domain-meta";
import type { CarouselSurface } from "@/types/colors";

type ChallengeMinimal = {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  duration: number | null;
  gym: {
    name: string;
    city: string;
  } | null;
};

type ChallengesSectionProps = {
  challenges: ChallengeMinimal[];
  title?: string;
  description?: string;
  hideButton?: boolean;
  surface?: CarouselSurface;
};

export function ChallengesSection({
  challenges,
  title,
  description,
  hideButton = false,
  surface = "gray-100",
}: ChallengesSectionProps) {
  const meta = domainMeta.challenges;
  const displayTitle = title ?? meta.defaultTitle!;
  const displayDescription = description ?? meta.defaultDescription!;

  const action =
    !hideButton && challenges.length > 0 ? (
      <Button to="/defis" endIcon={<ArrowRight className="h-4 w-4" />}>
        Voir tous les défis
      </Button>
    ) : undefined;

  return (
    <section id="defis" className="space-y-6">
      <SectionHeader
        icon={<meta.icon />}
        title={displayTitle}
        description={displayDescription}
        action={action}
        tone={meta.tone}
      />

      <CardCarousel
        itemCount={challenges.length}
        emptyMessage="Aucun défi disponible pour le moment"
        surface={surface}
      >
        {challenges.map((challenge) => {
          return (
            <Link
              key={challenge.id}
              href={`/defis/${challenge.id}`}
              className="group shrink-0 scroll-ml-4"
              style={{ scrollSnapAlign: "start" }}
            >
              <Card className="flex h-55 w-[320px] flex-col justify-between transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    {challenge.duration && (
                      <Badge
                        variant="muted"
                        className="px-2 py-0.5 font-normal text-gray-500"
                        startIcon={<CalendarDays className="h-3 w-3" />}
                      >
                        {challenge.duration}j
                      </Badge>
                    )}
                    <DifficultyBadge
                      className="px-2 py-0.5 font-normal"
                      difficulty={challenge.difficulty}
                    />
                  </div>
                  <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
                  {challenge.gym && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {challenge.gym.name} - {challenge.gym.city}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {challenge.description || "Aucune description disponible"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </CardCarousel>
    </section>
  );
}
