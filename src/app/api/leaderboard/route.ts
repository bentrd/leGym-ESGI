import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const userStats = await prisma.userProfile.findMany({
      where: {
        role: "CLIENT",
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        sessions: {
          select: {
            logs: {
              select: {
                duration: true,
                calories: true,
              },
            },
          },
        },
      },
    });

    const leaderboardData = userStats
      .map((user) => {
        const allLogs = user.sessions.flatMap((session) => session.logs);
        const totalSessions = allLogs.length;
        const totalDuration = allLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const totalCalories = allLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

        return {
          id: user.id,
          name: user.displayName || user.email || "Utilisateur",
          totalSessions,
          totalDuration,
          totalCalories,
        };
      })
      .filter((user) => user.totalSessions > 0)
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, 100);
    return jsonOk({ leaderboardData });
  } catch (error) {
    logger.error("Echec recuperation classement:", error);
    return jsonError("Echec de la recuperation du classement", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
