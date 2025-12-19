import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { syncUserBadges } from "@/lib/badge-engine";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return jsonError("ID utilisateur invalide", HttpStatus.BAD_REQUEST);
    }

    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { id: true, displayName: true, email: true },
    });

    if (!user) {
      return jsonError("Utilisateur non trouve", HttpStatus.NOT_FOUND);
    }

    const result = await syncUserBadges(userId, { force: true });

    return jsonOk({
      userId,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      },
      added: result.added,
      removed: result.removed,
      message: `Badges synchronises pour l'utilisateur ${userId}: ${result.added.length} ajoutes, ${result.removed.length} retires`,
    });
  } catch (error) {
    logger.error("Erreur sync badges utilisateur (admin):", error);
    return jsonError("Echec de la synchronisation des badges", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
