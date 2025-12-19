import type { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { badgeSchema } from "@/lib/validators/badge";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export const POST = async (request: NextRequest) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(request, badgeSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const badge = await prisma.badge.create({
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
    logger.error("Error creating badge:", error);
    return jsonError("Échec de la création du badge", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const GET = async () => {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        rewardRule: true,
        _count: {
          select: { awards: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(badges);
  } catch (error) {
    logger.error("Error fetching badges:", error);
    return jsonError("Échec de la récupération des badges", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
