import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { BadgesDisplayContent } from "./badges-display-content";
import type { ApiUserBadge, ApiBadgeData } from "@/types/api";

function transformUserBadge(ub: ApiUserBadge) {
  return {
    id: ub.id,
    earnedAt: new Date(ub.awardedAt),
    reason: null,
    badge: {
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      rewardRule: ub.badge.rewardRule,
    },
  };
}

function transformBadgeData(b: ApiBadgeData) {
  return {
    id: b.id,
    name: b.name,
    icon: b.icon,
    rewardRule: b.rewardRule,
  };
}

export default async function ClientBadgesPage() {
  const { data, error } = await apiFetch<{
    userBadges: ApiUserBadge[];
    availableBadges: ApiBadgeData[];
  }>("/api/badges/my");

  if (error || !data) {
    redirect("/auth/connexion");
  }

  return (
    <BadgesDisplayContent
      userBadges={data.userBadges.map(transformUserBadge)}
      availableBadges={data.availableBadges.map(transformBadgeData)}
    />
  );
}
