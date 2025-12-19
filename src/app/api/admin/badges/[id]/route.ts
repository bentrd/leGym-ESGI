import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { badgeSchema } from "@/lib/validators/badge";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const badgeId = parseInt(id, 10);

    if (isNaN(badgeId)) {
      return jsonError("ID de badge invalide", HttpStatus.BAD_REQUEST);
    }

    const bodyResult = await parseBody(request, badgeSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const badge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        name: bodyResult.data.name,
        icon: bodyResult.data.icon || null,
      },
    });

    return jsonOk(badge);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Un badge avec ce nom existe déjà", HttpStatus.CONFLICT);
    }
    logger.error("Error updating badge:", error);
    return jsonError("Échec de la mise à jour du badge", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const DELETE = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const badgeId = parseInt(id, 10);

    if (isNaN(badgeId)) {
      return jsonError("ID de badge invalide", HttpStatus.BAD_REQUEST);
    }

    await prisma.$transaction(async (tx) => {
      await tx.userBadge.deleteMany({
        where: { badgeId },
      });

      await tx.rewardRule.deleteMany({
        where: { badgeId },
      });

      await tx.badge.delete({
        where: { id: badgeId },
      });
    });

    return jsonOk({ success: true });
  } catch (error) {
    logger.error("Error deleting badge:", error);
    return jsonError("Échec de la suppression du badge", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
