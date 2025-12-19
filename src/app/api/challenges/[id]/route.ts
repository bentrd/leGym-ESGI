import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { requireProfile } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const challengeUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  goals: z.string().nullable().optional(),
  difficulty: z.string(),
  duration: z.number().nullable().optional(),
  recommendedExercises: z.string().nullable().optional(),
  relatedEquipment: z.string().nullable().optional(),
  gymId: z.number().nullable().optional(),
});

export const GET = async (request: NextRequest, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return jsonError("ID de defi invalide", HttpStatus.BAD_REQUEST);
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        gym: {
          select: {
            name: true,
            slug: true,
            city: true,
          },
        },
        sessions: {
          select: {
            id: true,
            userId: true,
            status: true,
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      return jsonError("Defi non trouve", HttpStatus.NOT_FOUND);
    }

    const session = await getSession();
    const profile = session ? await getUserProfile(session.user.id) : null;

    const userSession = profile ? challenge.sessions.find((s) => s.userId === profile.id) : null;

    const isSuperAdmin = profile?.role === "SUPER_ADMIN";
    const isCreator = profile && challenge.creatorId === profile.id;
    const canEdit = !!(isSuperAdmin || isCreator);

    const rawExerciseTokens = challenge.recommendedExercises
      ? challenge.recommendedExercises
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const exerciseIds = rawExerciseTokens
      .map((t) => (/^\d+$/.test(t) ? parseInt(t, 10) : NaN))
      .filter((n) => !Number.isNaN(n));

    const exerciseNames = rawExerciseTokens.filter((t) => !/^\d+$/.test(t));

    const exerciseTypes =
      exerciseIds.length > 0 || exerciseNames.length > 0
        ? await prisma.exerciseType.findMany({
            where: {
              OR: [
                ...(exerciseIds.length > 0 ? [{ id: { in: exerciseIds } }] : []),
                ...(exerciseNames.length > 0
                  ? [
                      {
                        OR: exerciseNames.map((name) => ({
                          name: { equals: name, mode: "insensitive" as const },
                        })),
                      },
                    ]
                  : []),
              ],
            },
            select: { id: true, name: true },
          })
        : [];

    const participants = challenge.sessions.map((s) => ({
      id: s.user.id,
      displayName: s.user.displayName,
    }));

    let myParticipation: {
      status: string;
      stats: { totalSessions: number; totalDuration: number; totalCalories: number };
    } | null = null;

    if (userSession) {
      const aggregates = await prisma.workoutLog.aggregate({
        where: { challengeSessionId: userSession.id },
        _count: { id: true },
        _sum: { duration: true, calories: true },
      });

      myParticipation = {
        status: userSession.status,
        stats: {
          totalSessions: aggregates._count.id,
          totalDuration: aggregates._sum.duration ?? 0,
          totalCalories: aggregates._sum.calories ?? 0,
        },
      };
    }

    return jsonOk({
      challenge,
      isAuthed: !!session,
      userHasJoined: !!userSession,
      participantCount: challenge.sessions.length,
      canEdit,
      exerciseTypes,
      participants,
      myParticipation,
    });
  } catch (error) {
    logger.error("Echec recuperation defi:", error);
    return jsonError("Echec de la recuperation du defi", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const PATCH = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireProfile();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return jsonError("ID de defi invalide", HttpStatus.BAD_REQUEST);
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) {
      return jsonError("Defi non trouve", HttpStatus.NOT_FOUND);
    }

    const profile = authResult.profile;
    const isSuperAdmin = profile.role === "SUPER_ADMIN";
    const isCreator = challenge.creatorId === profile.id;
    if (!isSuperAdmin && !isCreator) {
      return jsonError("Acces interdit", HttpStatus.FORBIDDEN);
    }

    const bodyResult = await parseBody(request, challengeUpdateSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const gymId = bodyResult.data.gymId ?? null;
    if (gymId && !isSuperAdmin) {
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      });
      if (!gym || gym.ownerId !== profile.id) {
        return jsonError("Acces a la salle non autorise", HttpStatus.FORBIDDEN);
      }
    }

    const updatePayload: {
      title: string;
      description: string | null;
      goals: string | null;
      difficulty: string;
      duration?: number | null;
      recommendedExercises?: string | null;
      relatedEquipment?: string | null;
      gymId: number | null;
    } = {
      title: bodyResult.data.title,
      description: bodyResult.data.description || null,
      goals: bodyResult.data.goals || null,
      difficulty: bodyResult.data.difficulty,
      gymId,
    };

    if (bodyResult.data.duration !== undefined) {
      updatePayload.duration = bodyResult.data.duration ?? null;
    }

    if (bodyResult.data.recommendedExercises !== undefined) {
      updatePayload.recommendedExercises = bodyResult.data.recommendedExercises || null;
    }

    if (bodyResult.data.relatedEquipment !== undefined) {
      updatePayload.relatedEquipment = bodyResult.data.relatedEquipment || null;
    }

    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: updatePayload,
    });

    return jsonOk(updatedChallenge);
  } catch (error) {
    logger.error("Echec mise a jour defi:", error);
    return jsonError("Echec de la mise a jour du defi", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
