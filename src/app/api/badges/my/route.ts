import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { maybeSyncUserBadges } from "@/lib/badge-engine";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    await maybeSyncUserBadges(authResult.profile.id, { maxAgeMs: 60 * 60 * 1000 });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: authResult.profile.id },
      include: {
        badge: {
          include: {
            rewardRule: true,
          },
        },
      },
      orderBy: { awardedAt: "desc" },
    });

    const allBadges = await prisma.badge.findMany({
      include: {
        rewardRule: true,
      },
    });

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
    const availableBadges = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

    return jsonOk({ userBadges, availableBadges });
  } catch (error) {
    logger.error("Echec recuperation badges:", error);
    return jsonError("Echec de la recuperation des badges", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
