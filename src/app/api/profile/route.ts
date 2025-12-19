import { z } from "zod";
import { prisma } from "@/server/db";
import { requireProfile } from "@/lib/auth/server";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

const profileUpdateSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  showTopGyms: z.boolean().optional(),
  showBadges: z.boolean().optional(),
});

export const PUT = async (req: Request) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(req, profileUpdateSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: authResult.profile.id },
      data: bodyResult.data,
    });

    return jsonOk({ profile: updatedProfile });
  } catch (error) {
    logger.error("Erreur mise a jour profil:", error);
    return jsonError("Echec de la mise a jour du profil", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
