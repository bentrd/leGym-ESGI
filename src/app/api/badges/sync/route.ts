import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/server";
import { syncUserBadges, maybeSyncUserBadges } from "@/lib/badge-engine";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

const syncRequestSchema = z.object({
  force: z.boolean().optional(),
});

export const POST = async (request: NextRequest) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(request, syncRequestSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { force } = bodyResult.data;

    let result;
    if (force) {
      result = await syncUserBadges(authResult.profile.id, { force: true });
    } else {
      result = await maybeSyncUserBadges(authResult.profile.id);
      if (!result) {
        return jsonOk({
          throttled: true,
          message: "Synchronisation des badges ignoree (throttling)",
          added: [],
          removed: [],
        });
      }
    }

    return jsonOk({
      throttled: false,
      added: result.added,
      removed: result.removed,
      message:
        result.added.length > 0 || result.removed.length > 0
          ? `Badges synchronises: ${result.added.length} ajoutes, ${result.removed.length} retires`
          : "Les badges sont deja a jour",
    });
  } catch (error) {
    logger.error("Erreur sync badges:", error);
    return jsonError("Echec de la synchronisation des badges", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
