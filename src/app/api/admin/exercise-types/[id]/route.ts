import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { updateExerciseTypeSchema } from "@/lib/validators/exercise-type";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const exerciseTypeId = parseInt(id);

    if (isNaN(exerciseTypeId)) {
      return jsonError("ID de type d'exercice invalide", HttpStatus.BAD_REQUEST);
    }

    const bodyResult = await parseBody(req, updateExerciseTypeSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const exerciseType = await prisma.exerciseType.update({
      where: { id: exerciseTypeId },
      data: bodyResult.data,
    });

    return jsonOk(exerciseType);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Un type d'exercice avec ce nom existe déjà", HttpStatus.CONFLICT);
    }
    logger.error("Exercise type update error:", error);
    return jsonError(
      "Erreur lors de la mise à jour du type d'exercice",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const exerciseTypeId = parseInt(id);

    if (isNaN(exerciseTypeId)) {
      return jsonError("ID de type d'exercice invalide", HttpStatus.BAD_REQUEST);
    }

    await prisma.exerciseType.delete({
      where: { id: exerciseTypeId },
    });

    return jsonOk({ success: true });
  } catch (error) {
    logger.error("Exercise type deletion error:", error);
    return jsonError(
      "Erreur lors de la suppression du type d'exercice",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
