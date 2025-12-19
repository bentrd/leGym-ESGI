import { getSession } from "@/lib/session";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const session = await getSession();
    const isAuthed = Boolean(session);

    const gyms = await prisma.gym.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        gym: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    return jsonOk({ gyms, challenges, isAuthed });
  } catch (error) {
    logger.error("Echec recuperation donnees accueil:", error);
    return jsonError("Echec de la recuperation des donnees", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
