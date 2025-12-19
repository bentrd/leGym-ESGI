import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AchievementBadgeCard } from "@/components/badges/achievement-badge-card";

type BadgeData = {
  id: number;
  name: string;
  icon: string | null;
  rewardRule: {
    id: number;
    name: string;
    criteria: string;
  } | null;
};

export type UserBadge = {
  id: number;
  earnedAt: Date;
  reason: string | null;
  badge: BadgeData;
};

type BadgesDisplayContentProps = {
  userBadges: UserBadge[];
  availableBadges: BadgeData[];
};

export function BadgesDisplayContent({ userBadges, availableBadges }: BadgesDisplayContentProps) {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Mes badges</h1>
        <p className="text-muted-foreground mt-2">
          Débloquez des badges en atteignant vos objectifs
        </p>
      </div>

      {userBadges.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Badges obtenus</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userBadges.map((userBadge) => (
              <AchievementBadgeCard
                key={userBadge.id}
                variant="earned"
                badgeId={userBadge.badge.id}
                name={userBadge.badge.name}
                icon={userBadge.badge.icon}
                earnedAt={userBadge.earnedAt}
                ruleName={userBadge.badge.rewardRule?.name || null}
              />
            ))}
          </div>
        </div>
      )}

      {availableBadges.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Badges à débloquer</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableBadges.map((badge) => (
              <AchievementBadgeCard
                key={badge.id}
                variant="locked"
                badgeId={badge.id}
                name={badge.name}
                icon={badge.icon}
                ruleName={badge.rewardRule?.name || null}
              />
            ))}
          </div>
        </div>
      )}

      {userBadges.length === 0 && availableBadges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground">Aucun badge disponible pour le moment</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
