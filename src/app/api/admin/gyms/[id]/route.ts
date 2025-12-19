import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { gymSchema, normalizeGymPayload } from "@/lib/validators/gym";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const gymStatusUpdateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

const gymEditSchema = gymSchema;

export const PATCH = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const gymId = parseInt(id, 10);
    if (isNaN(gymId)) {
      return jsonError("ID invalide", HttpStatus.BAD_REQUEST);
    }

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      return jsonError("Salle non trouvée", HttpStatus.NOT_FOUND);
    }

    const rawBody = await request.json().catch(() => ({}));

    const statusResult = gymStatusUpdateSchema.safeParse(rawBody);
    if (statusResult.success) {
      const updatedGym = await prisma.gym.update({
        where: { id: gymId },
        data: { status: statusResult.data.status },
      });
      return jsonOk({ gym: updatedGym });
    }

    const editResult = gymEditSchema.safeParse(rawBody);
    if (editResult.success) {
      const normalizedData = normalizeGymPayload(editResult.data);
      const updatedGym = await prisma.gym.update({
        where: { id: gymId },
        data: normalizedData,
      });
      return jsonOk({ gym: updatedGym });
    }

    return jsonError(
      "Données invalides",
      HttpStatus.BAD_REQUEST,
      editResult.error.flatten().fieldErrors,
    );
  } catch (error) {
    logger.error("Erreur mise a jour salle admin:", error);
    return jsonError("Erreur lors de la mise à jour de la salle", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
