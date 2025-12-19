import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const session = await getSession();
    if (!session) {
      return jsonOk({ rank: null });
    }

    const profile = await getUserProfile(session.user.id);
    if (!profile || profile.role !== "CLIENT") {
      return jsonOk({ rank: null });
    }

    const userStats = await prisma.userProfile.findMany({
      where: { role: "CLIENT" },
      select: {
        id: true,
        sessions: {
          select: {
            logs: {
              select: { duration: true, calories: true },
            },
          },
        },
      },
    });

    const rankedUsers = userStats
      .map((user) => ({
        id: user.id,
        totalSessions: user.sessions.flatMap((s) => s.logs).length,
      }))
      .filter((u) => u.totalSessions > 0)
      .sort((a, b) => b.totalSessions - a.totalSessions);

    const userIndex = rankedUsers.findIndex((u) => u.id === profile.id);
    const rank: number | null = userIndex !== -1 ? userIndex + 1 : null;

    return jsonOk({ rank });
  } catch (error) {
    logger.error("Echec calcul rang utilisateur:", error);
    return jsonError("Echec du calcul du rang utilisateur", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
