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

    const challengeSessions = await prisma.challengeSession.findMany({
      where: { userId: authResult.profile.id },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            duration: true,
            gym: {
              select: {
                name: true,
                city: true,
              },
            },
          },
        },
        logs: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk({ challengeSessions });
  } catch (error) {
    logger.error("Echec recuperation defis utilisateur:", error);
    return jsonError("Echec de la recuperation des defis", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
