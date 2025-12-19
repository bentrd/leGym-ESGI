import type { NextRequest } from "next/server";
import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return jsonError("ID de défi invalide", HttpStatus.BAD_REQUEST);
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return jsonError("Défi introuvable", HttpStatus.NOT_FOUND);
    }

    const existingSession = await prisma.challengeSession.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: authResult.profile.id,
        },
      },
    });

    if (existingSession) {
      return jsonError("Déjà inscrit à ce défi", HttpStatus.BAD_REQUEST);
    }

    const challengeSession = await prisma.challengeSession.create({
      data: {
        challengeId,
        userId: authResult.profile.id,
        status: "NOT_STARTED",
      },
    });

    return jsonOk(challengeSession);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Déjà inscrit à ce défi", HttpStatus.BAD_REQUEST);
    }
    logger.error("Echec inscription defi:", error);
    return jsonError("Échec de l'inscription au défi", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
