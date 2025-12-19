import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export const GET = async (request: NextRequest, context: RouteContext) => {
  try {
    const { slug: rawSlug } = await context.params;
    const slugOrId = decodeURIComponent(rawSlug ?? "").trim();

    if (!slugOrId) {
      return jsonError("Slug requis", HttpStatus.BAD_REQUEST);
    }

    const gymId = parseInt(slugOrId, 10);
    const gym = isNaN(gymId)
      ? await prisma.gym.findUnique({ where: { slug: slugOrId } })
      : await prisma.gym.findUnique({ where: { id: gymId } });

    if (!gym) {
      return jsonError("Salle non trouvee", HttpStatus.NOT_FOUND);
    }

    const session = await getSession();
    const profile = session?.user?.id ? await getUserProfile(session.user.id) : null;
    const isSuperAdmin = profile?.role === "SUPER_ADMIN";
    const isOwner = profile?.id === gym.ownerId;
    const canEdit = isSuperAdmin || isOwner;

    return jsonOk({
      gym,
      isSuperAdmin,
      isOwner,
      canEdit,
    });
  } catch (error) {
    logger.error("Echec recuperation salle:", error);
    return jsonError("Echec de la recuperation de la salle", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
