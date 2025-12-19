import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { parseQuery, parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

const querySchema = z.object({
  my: z.string().optional(),
});

const challengeSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  difficulty: z.string(),
  duration: z.number().nullable().optional(),
  recommendedExercises: z.string().nullable().optional(),
  relatedEquipment: z.string().nullable().optional(),
  gymId: z.number().nullable().optional(),
});

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryResult = parseQuery(searchParams, querySchema);
    if (!queryResult.success) {
      return queryResult.response;
    }

    const myChallenges = queryResult.data.my === "true";

    const session = await getSession();
    const profile = session?.user?.id ? await getUserProfile(session.user.id) : null;

    if (myChallenges && profile) {
      const challenges = await prisma.challenge.findMany({
        where: { creatorId: profile.id },
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { displayName: true, email: true } },
          gym: { select: { name: true, slug: true } },
        },
      });
      return jsonOk({ challenges });
    }

    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            displayName: true,
            email: true,
          },
        },
        gym: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return jsonOk({ challenges, isAuthed: !!session });
  } catch (error) {
    logger.error("Echec recuperation defis:", error);
    return jsonError("Echec de la recuperation des defis", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const bodyResult = await parseBody(request, challengeSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { gymId, ...data } = bodyResult.data;

    if (gymId) {
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      });

      if (!gym || gym.ownerId !== authResult.profile.id) {
        return jsonError("Acces a la salle non autorise", HttpStatus.FORBIDDEN);
      }
    }

    const challenge = await prisma.challenge.create({
      data: {
        ...data,
        description: data.description || null,
        goals: data.goals || null,
        duration: data.duration || null,
        recommendedExercises: data.recommendedExercises || null,
        relatedEquipment: data.relatedEquipment || null,
        gymId: gymId || null,
        creatorId: authResult.profile.id,
      },
    });

    return jsonOk(challenge);
  } catch (error) {
    logger.error("Echec creation defi:", error);
    return jsonError("Echec de la creation du defi", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
