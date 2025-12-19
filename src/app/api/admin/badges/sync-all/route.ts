import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { syncUserBadges } from "@/lib/badge-engine";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db";

const batchSyncSchema = z.object({
  batchSize: z.number().int().min(1).max(100).optional(),
  cursor: z.number().int().optional(),
});

export const POST = async (request: NextRequest) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(request, batchSyncSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { batchSize = 50, cursor } = bodyResult.data;

    const users = await prisma.userProfile.findMany({
      where: cursor ? { id: { gt: cursor } } : undefined,
      orderBy: { id: "asc" },
      take: batchSize,
      select: { id: true, displayName: true, email: true },
    });

    if (users.length === 0) {
      return jsonOk({
        message: "Plus d'utilisateurs a synchroniser",
        processed: 0,
        nextCursor: null,
        hasMore: false,
      });
    }

    const results: Array<{
      userId: number;
      displayName: string | null;
      added: number;
      removed: number;
    }> = [];

    for (const user of users) {
      try {
        const syncResult = await syncUserBadges(user.id, { force: true });
        results.push({
          userId: user.id,
          displayName: user.displayName,
          added: syncResult.added.length,
          removed: syncResult.removed.length,
        });
      } catch (error) {
        logger.error(`Erreur sync badges utilisateur ${user.id}:`, error);
        results.push({
          userId: user.id,
          displayName: user.displayName,
          added: 0,
          removed: 0,
        });
      }
    }

    const lastUserId = users[users.length - 1].id;
    const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.removed, 0);

    return jsonOk({
      message: `Badges synchronises pour ${users.length} utilisateurs`,
      processed: users.length,
      totalAdded,
      totalRemoved,
      nextCursor: lastUserId,
      hasMore: users.length === batchSize,
      results,
    });
  } catch (error) {
    logger.error("Erreur sync badges batch:", error);
    return jsonError("Echec de la synchronisation des badges", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
