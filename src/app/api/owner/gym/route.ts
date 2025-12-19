import { z } from "zod";
import { prisma } from "@/server/db";
import { requireOwner, requireRole } from "@/lib/auth/server";
import { gymSchema, normalizeGymPayload } from "@/lib/validators/gym";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const POST = async (req: Request) => {
  try {
    const authResult = await requireOwner();
    if (!authResult.success) {
      return authResult.response;
    }

    const rawBody = await req.json().catch(() => ({}));
    const requestedGymId =
      authResult.profile.role === "SUPER_ADMIN" && rawBody.gymId !== undefined
        ? Number(rawBody.gymId)
        : undefined;
    const targetGymId = Number.isFinite(requestedGymId) ? requestedGymId : undefined;

    const { gymId: _, ...gymData } = rawBody;
    const parsed = gymSchema.safeParse(gymData);

    if (!parsed.success) {
      return jsonError(
        "Donnees de requete invalides",
        HttpStatus.BAD_REQUEST,
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;

    const existing = targetGymId
      ? await prisma.gym.findUnique({ where: { id: targetGymId } })
      : await prisma.gym.findFirst({
          where: { ownerId: authResult.profile.id },
        });

    if (!existing && authResult.profile.role === "SUPER_ADMIN") {
      return jsonError("Salle introuvable", HttpStatus.NOT_FOUND);
    }

    const slugBase = slugify(data.name);
    const ownerId = existing?.ownerId ?? authResult.profile.id;
    const slug = existing?.slug ?? `${slugBase}-${ownerId}`;

    let nextStatus = existing?.status ?? "PENDING";
    if (
      authResult.profile.role !== "SUPER_ADMIN" &&
      (existing?.status === "REJECTED" || existing?.status === "INCOMPLETE")
    ) {
      nextStatus = "PENDING";
    }

    const gym = existing
      ? await prisma.gym.update({
          where: { id: existing.id },
          data: {
            ...normalizeGymPayload(data),
            slug,
            status: nextStatus,
          },
        })
      : await prisma.gym.create({
          data: {
            ...normalizeGymPayload(data),
            slug,
            status: nextStatus,
            ownerId,
          },
        });

    return jsonOk({ gym });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Une salle avec cet identifiant existe déjà", HttpStatus.CONFLICT);
    }
    logger.error("Echec creation/mise a jour salle:", error);
    return jsonError(
      "Échec de la création/mise à jour de la salle",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const GET = async () => {
  try {
    const authResult = await requireRole("GYM_OWNER");
    if (!authResult.success) {
      return authResult.response;
    }

    const gym = await prisma.gym.findFirst({
      where: { ownerId: authResult.profile.id },
    });

    return jsonOk({ gym });
  } catch (error) {
    logger.error("Echec recuperation salle proprietaire:", error);
    return jsonError("Échec de la récupération de votre salle", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const DELETE = async (req: Request) => {
  try {
    const authResult = await requireOwner();
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(req, z.object({ gymId: z.number().int().positive() }));
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { gymId } = bodyResult.data;

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      return jsonError("Salle introuvable", HttpStatus.NOT_FOUND);
    }

    if (authResult.profile.role !== "SUPER_ADMIN" && gym.ownerId !== authResult.profile.id) {
      return jsonError("Accès interdit", HttpStatus.FORBIDDEN);
    }

    await prisma.gym.delete({
      where: { id: gymId },
    });

    return jsonOk({ success: true, message: "Salle supprimée avec succès" });
  } catch (error) {
    logger.error("Echec suppression salle:", error);
    return jsonError("Échec de la suppression de la salle", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
