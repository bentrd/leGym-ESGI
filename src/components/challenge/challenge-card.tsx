import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { ScrollableBadges } from "@/components/ui/scrollable-badges";
import { getBadgeColor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";

export type ChallengeCardData = {
  id: number;
  title: string;
  description: string | null;
  goals: string | null;
  difficulty: string;
  duration: number | null;
  recommendedExercises: string | null;
  relatedEquipment: string | null;
  creator: {
    displayName: string | null;
    email: string | null;
  };
  gym: {
    name: string;
    slug: string;
  } | null;
};

type ChallengeCardProps = {
  challenge: ChallengeCardData;
  className?: string;
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  const exercises = parseList(challenge.recommendedExercises);
  const equipment = parseList(challenge.relatedEquipment);
  const allTags = [...exercises, ...equipment];

  return (
    <Card className={cn("flex h-full flex-col transition-shadow hover:shadow-lg", className)}>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <DifficultyBadge difficulty={challenge.difficulty} />
          {challenge.duration && (
            <span className="text-muted-foreground text-sm">{challenge.duration} jours</span>
          )}
        </div>
        <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {challenge.description || challenge.goals || "Aucune description"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between space-y-3">
        <div className="space-y-3">
          {challenge.gym && (
            <div className="text-sm">
              <span className="text-muted-foreground">Salle : </span>
              <span className="font-medium">{challenge.gym.name}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {allTags.length > 0 && (
            <ScrollableBadges itemCount={allTags.length}>
              {allTags.map((tag, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors select-none ${getBadgeColor(tag)}`}
                >
                  {tag}
                </div>
              ))}
            </ScrollableBadges>
          )}
          <div className="text-muted-foreground text-xs">
            Par {challenge.creator.displayName || challenge.creator.email}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
