import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { syncUserBadges } from "@/lib/badge-engine";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string; logId: string }>;
};

const workoutLogUpdateSchema = z.object({
  date: z.string().optional(),
  duration: z.number().optional(),
  calories: z.number().optional(),
  notes: z.string().optional(),
});

export const PATCH = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const { logId } = await context.params;
    const workoutLogId = parseInt(logId, 10);

    if (isNaN(workoutLogId)) {
      return jsonError("ID de log invalide", HttpStatus.BAD_REQUEST);
    }

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: workoutLogId },
      include: {
        challengeSession: {
          select: { userId: true },
        },
      },
    });

    if (!workoutLog) {
      return jsonError("Log d'entrainement non trouve", HttpStatus.NOT_FOUND);
    }

    if (workoutLog.challengeSession.userId !== authResult.profile.id) {
      return jsonError("Non autorise a modifier ce log", HttpStatus.FORBIDDEN);
    }

    const bodyResult = await parseBody(request, workoutLogUpdateSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { date, duration, calories, notes } = bodyResult.data;

    const updatedLog = await prisma.workoutLog.update({
      where: { id: workoutLogId },
      data: {
        ...(date && { date: new Date(date) }),
        ...(duration !== undefined && { duration }),
        ...(calories !== undefined && { calories }),
        ...(notes !== undefined && { notes }),
      },
    });

    const badgeResult = await syncUserBadges(authResult.profile.id, { force: true });

    return jsonOk({
      workoutLog: updatedLog,
      badgesAdded: badgeResult.added.length > 0 ? badgeResult.added : undefined,
      badgesRemoved: badgeResult.removed.length > 0 ? badgeResult.removed : undefined,
    });
  } catch (error) {
    logger.error("Erreur mise a jour log entrainement:", error);
    return jsonError("Echec de la mise a jour du log", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const DELETE = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const { logId } = await context.params;
    const workoutLogId = parseInt(logId, 10);

    if (isNaN(workoutLogId)) {
      return jsonError("ID de log invalide", HttpStatus.BAD_REQUEST);
    }

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id: workoutLogId },
      include: {
        challengeSession: {
          select: { userId: true },
        },
      },
    });

    if (!workoutLog) {
      return jsonError("Log d'entrainement non trouve", HttpStatus.NOT_FOUND);
    }

    if (workoutLog.challengeSession.userId !== authResult.profile.id) {
      return jsonError("Non autorise a supprimer ce log", HttpStatus.FORBIDDEN);
    }

    await prisma.workoutLog.delete({
      where: { id: workoutLogId },
    });

    const badgeResult = await syncUserBadges(authResult.profile.id, { force: true });

    return jsonOk({
      success: true,
      badgesAdded: badgeResult.added.length > 0 ? badgeResult.added : undefined,
      badgesRemoved: badgeResult.removed.length > 0 ? badgeResult.removed : undefined,
    });
  } catch (error) {
    logger.error("Erreur suppression log entrainement:", error);
    return jsonError("Echec de la suppression du log", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
