import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const gyms = await prisma.gym.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        owner: true,
      },
      where: {
        status: {
          in: ["PENDING", "REJECTED"],
        },
      },
    });

    return jsonOk({ gyms });
  } catch (error) {
    logger.error("Echec recuperation salles admin:", error);
    return jsonError("Echec de la recuperation des salles", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
