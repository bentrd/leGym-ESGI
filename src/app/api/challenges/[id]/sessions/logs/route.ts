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

const workoutLogSchema = z.object({
  date: z.string().optional(),
  duration: z.number().optional(),
  calories: z.number().optional(),
  notes: z.string().optional(),
});

export const POST = async (request: NextRequest, context: RouteContext) => {
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
    });

    if (!challengeSession) {
      return jsonError("Non inscrit a ce defi", HttpStatus.FORBIDDEN);
    }

    const bodyResult = await parseBody(request, workoutLogSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { date, duration, calories, notes } = bodyResult.data;

    const workoutLog = await prisma.workoutLog.create({
      data: {
        challengeSessionId: challengeSession.id,
        date: date ? new Date(date) : new Date(),
        duration: duration || null,
        calories: calories || null,
        notes: notes || null,
      },
    });

    let updatedStatus = challengeSession.status;
    if (challengeSession.status === "NOT_STARTED") {
      const updated = await prisma.challengeSession.update({
        where: { id: challengeSession.id },
        data: { status: "IN_PROGRESS" },
      });
      updatedStatus = updated.status;
    }

    const badgeResult = await syncUserBadges(authResult.profile.id, { force: true });

    return jsonOk({
      workoutLog,
      session: { status: updatedStatus },
      badgesAdded: badgeResult.added.length > 0 ? badgeResult.added : undefined,
      badgesRemoved: badgeResult.removed.length > 0 ? badgeResult.removed : undefined,
    });
  } catch (error) {
    logger.error("Erreur enregistrement entrainement:", error);
    return jsonError(
      "Echec de l'enregistrement de l'entrainement",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
