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

    const profiles = await prisma.userProfile.findMany({
      include: {
        gyms: {
          where: {
            status: "APPROVED",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const userIds = profiles.map((p) => p.authUserId);
    const authUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const users = profiles.map((profile) => ({
      ...profile,
      authUser: authUsers.find((u) => u.id === profile.authUserId) || null,
    }));

    return jsonOk({ users });
  } catch (error) {
    logger.error("Echec recuperation utilisateurs:", error);
    return jsonError("Echec de la recuperation des utilisateurs", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
