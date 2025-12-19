import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardCarousel } from "@/components/ui/card-carousel";
import { SectionHeader } from "@/components/ui/section-header";
import { domainMeta } from "@/lib/ui/domain-meta";
import { AchievementBadgeCard } from "@/components/badges/achievement-badge-card";

type ProfileBadge = {
  id: number;
  name: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  awardedAt: Date;
  rewardRule?: string;
};

type ProfileBadgesSectionProps = {
  badges: ProfileBadge[];
};

export function ProfileBadgesSection({ badges }: ProfileBadgesSectionProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          icon={<domainMeta.badges.icon />}
          title="Badges"
          description="Récompenses obtenues"
          tone={domainMeta.badges.tone}
        />
      </CardHeader>
      <CardContent>
        <CardCarousel itemCount={badges.length} emptyMessage="Aucun badge obtenu">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="shrink-0 scroll-ml-4"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="w-[320px]">
                <AchievementBadgeCard
                  variant="earned"
                  badgeId={badge.id}
                  name={badge.name}
                  icon={badge.icon}
                  earnedAt={badge.awardedAt}
                  ruleName={badge.rewardRule || null}
                />
              </div>
            </div>
          ))}
        </CardCarousel>
      </CardContent>
    </Card>
  );
}
