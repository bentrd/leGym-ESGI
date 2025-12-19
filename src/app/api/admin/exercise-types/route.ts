import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { createExerciseTypeSchema } from "@/lib/validators/exercise-type";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export const GET = async () => {
  try {
    const exerciseTypes = await prisma.exerciseType.findMany({
      orderBy: { name: "asc" },
    });

    return jsonOk({ exerciseTypes });
  } catch (error) {
    logger.error("Exercise types fetch error:", error);
    return jsonError(
      "Erreur lors de la récupération des types d'exercices",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(req, createExerciseTypeSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const exerciseType = await prisma.exerciseType.create({
      data: bodyResult.data,
    });

    return jsonOk(exerciseType, HttpStatus.CREATED);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Un type d'exercice avec ce nom existe déjà", HttpStatus.CONFLICT);
    }
    logger.error("Exercise type creation error:", error);
    return jsonError(
      "Erreur lors de la création du type d'exercice",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
