import type { NextRequest } from "next/server";
import { z } from "zod";
import type { Role } from "@/lib/constants";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["CLIENT", "GYM_OWNER", "SUPER_ADMIN"] as [Role, ...Role[]]),
});

export const PUT = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return jsonError("ID invalide", HttpStatus.BAD_REQUEST);
    }

    const bodyResult = await parseBody(request, userUpdateSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { name, email, role } = bodyResult.data;

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!userProfile) {
      return jsonError("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
    }

    if (userProfile.authUserId === authResult.session.user.id && userProfile.role !== role) {
      return jsonError("Vous ne pouvez pas modifier votre propre rôle", HttpStatus.BAD_REQUEST);
    }

    const [updatedProfile, updatedUser] = await prisma.$transaction([
      prisma.userProfile.update({
        where: { id: userId },
        data: { role },
      }),
      prisma.user.update({
        where: { id: userProfile.authUserId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
        },
      }),
    ]);

    const result = {
      ...updatedProfile,
      authUser: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    };

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Cet email est déjà utilisé", HttpStatus.CONFLICT);
    }
    logger.error("Erreur mise a jour utilisateur:", error);
    return jsonError("Erreur lors de la mise à jour", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const DELETE = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return jsonError("ID invalide", HttpStatus.BAD_REQUEST);
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!userProfile) {
      return jsonError("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
    }

    if (userProfile.authUserId === authResult.session.user.id) {
      return jsonError("Vous ne pouvez pas supprimer votre propre compte", HttpStatus.BAD_REQUEST);
    }

    await prisma.$transaction([
      prisma.userProfile.delete({
        where: { id: userId },
      }),
      prisma.user.delete({
        where: { id: userProfile.authUserId },
      }),
    ]);

    return jsonOk({ success: true });
  } catch (error) {
    logger.error("Erreur suppression utilisateur:", error);
    return jsonError("Erreur lors de la suppression", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
