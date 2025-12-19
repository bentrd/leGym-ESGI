import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { syncUserBadges } from "@/lib/badge-engine";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const sessionUpdateSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
});

export const GET = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return jsonError("ID de defi invalide", HttpStatus.BAD_REQUEST);
    }

    const challengeSession = await prisma.challengeSession.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: authResult.profile.id,
        },
      },
      include: {
        logs: {
          orderBy: { date: "desc" },
        },
        challenge: {
          select: {
            title: true,
            difficulty: true,
            duration: true,
          },
        },
      },
    });

    if (!challengeSession) {
      return jsonError("Non inscrit a ce defi", HttpStatus.NOT_FOUND);
    }

    return jsonOk(challengeSession);
  } catch (error) {
    logger.error("Erreur recuperation session defi:", error);
    return jsonError("Echec de la recuperation de la session", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const PATCH = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return jsonError("ID de defi invalide", HttpStatus.BAD_REQUEST);
    }

    const bodyResult = await parseBody(request, sessionUpdateSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { status } = bodyResult.data;

    const existingSession = await prisma.challengeSession.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: authResult.profile.id,
        },
      },
    });

    if (!existingSession) {
      return jsonError("Non inscrit a ce defi", HttpStatus.NOT_FOUND);
    }

    const updatedSession = await prisma.challengeSession.update({
      where: { id: existingSession.id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      include: {
        challenge: {
          select: {
            title: true,
            difficulty: true,
            duration: true,
          },
        },
        logs: {
          orderBy: { date: "desc" },
        },
      },
    });

    const badgeResult = await syncUserBadges(authResult.profile.id, { force: true });

    return jsonOk({
      session: updatedSession,
      badgesAdded: badgeResult.added.length > 0 ? badgeResult.added : undefined,
      badgesRemoved: badgeResult.removed.length > 0 ? badgeResult.removed : undefined,
    });
  } catch (error) {
    logger.error("Erreur mise a jour session defi:", error);
    return jsonError("Echec de la mise a jour de la session", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
