import { z } from "zod";
import { requireSession } from "@/lib/auth/server";
import { ensureUserProfile } from "@/lib/profile";
import { prisma } from "@/server/db";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

const payloadSchema = z.object({
  role: z.enum(["owner", "client"]).optional(),
  gymName: z.string().optional(),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const POST = async (req: Request) => {
  try {
    const sessionResult = await requireSession();
    if (!sessionResult.success) {
      return sessionResult.response;
    }

    const bodyResult = await parseBody(req, payloadSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const profile = await ensureUserProfile({
      authUserId: sessionResult.session.user.id,
      email: sessionResult.session.user.email,
      name: sessionResult.session.user.name,
      requestedRole: bodyResult.data.role,
      gymName: bodyResult.data.gymName,
    });

    if (bodyResult.data.role === "owner" && bodyResult.data.gymName) {
      const gymName = bodyResult.data.gymName.trim();
      if (gymName.length >= 2) {
        const existingGym = await prisma.gym.findFirst({
          where: { ownerId: profile.id },
        });
        if (!existingGym) {
          const baseSlug = slugify(gymName);
          let slug = baseSlug;
          let counter = 2;

          while (await prisma.gym.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          await prisma.gym.create({
            data: {
              name: gymName,
              slug,
              city: "",
              address: "",
              ownerId: profile.id,
              status: "INCOMPLETE",
            },
          });
        }
      }
    }

    return jsonOk({ profile });
  } catch (error) {
    logger.error("Echec provisionnement profil:", error);
    return jsonError("Echec du provisionnement du profil", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
