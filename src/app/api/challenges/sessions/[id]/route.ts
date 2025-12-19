import type { NextRequest } from "next/server";
import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (request: NextRequest, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return jsonError("ID de defi invalide", HttpStatus.BAD_REQUEST);
    }

    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const challengeSession = await prisma.challengeSession.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: authResult.profile.id,
        },
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            duration: true,
            recommendedExercises: true,
            relatedEquipment: true,
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
        },
      },
    });

    if (!challengeSession) {
      return jsonError("Session de defi non trouvee", HttpStatus.NOT_FOUND);
    }

    return jsonOk({ challengeSession });
  } catch (error) {
    logger.error("Echec recuperation session defi:", error);
    return jsonError("Echec de la recuperation de la session", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
