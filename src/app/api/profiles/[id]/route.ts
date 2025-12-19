import type { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (request: NextRequest, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const profileId = parseInt(id, 10);

    if (isNaN(profileId)) {
      return jsonError("ID de profil invalide", HttpStatus.BAD_REQUEST);
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
      include: {
        sessions: {
          include: {
            challenge: {
              include: {
                gym: true,
              },
            },
            logs: true,
          },
        },
        badges: {
          include: {
            badge: {
              select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
                icon: true,
                rewardRule: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return jsonError("Profil introuvable", HttpStatus.NOT_FOUND);
    }

    const gymActivity = profile.sessions.reduce<
      Record<
        number,
        {
          gym: {
            id: number;
            name: string;
            slug: string;
            city: string;
            address: string;
            postcode: string | null;
            latitude: number | null;
            longitude: number | null;
            description: string | null;
            activities: string | null;
          };
          sessionCount: number;
          totalLogs: number;
        }
      >
    >((acc, session) => {
      if (session.challenge.gymId && session.challenge.gym) {
        const gymId = session.challenge.gymId;
        if (!acc[gymId]) {
          acc[gymId] = {
            gym: {
              id: session.challenge.gym.id,
              name: session.challenge.gym.name,
              slug: session.challenge.gym.slug,
              city: session.challenge.gym.city,
              address: session.challenge.gym.address,
              postcode: session.challenge.gym.postcode,
              latitude: session.challenge.gym.latitude,
              longitude: session.challenge.gym.longitude,
              description: session.challenge.gym.description,
              activities: session.challenge.gym.activities,
            },
            sessionCount: 0,
            totalLogs: 0,
          };
        }
        acc[gymId].sessionCount += 1;
        acc[gymId].totalLogs += session.logs.length;
      }
      return acc;
    }, {});

    const topGyms = (
      Object.values(gymActivity) as Array<{
        gym: {
          id: number;
          name: string;
          slug: string;
          city: string;
          address: string;
          postcode: string | null;
          latitude: number | null;
          longitude: number | null;
          description: string | null;
          activities: string | null;
        };
        sessionCount: number;
        totalLogs: number;
      }>
    )
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 3)
      .map((g) => g.gym);

    const totalSessions = profile.sessions.filter((s) => s.status === "COMPLETED").length;
    const totalLogs = profile.sessions.flatMap((s) => s.logs).length;
    const totalDuration = profile.sessions
      .flatMap((s) => s.logs)
      .reduce((sum: number, log) => sum + (log.duration || 0), 0);
    const totalCalories = profile.sessions
      .flatMap((s) => s.logs)
      .reduce((sum: number, log) => sum + (log.calories || 0), 0);

    let rank: number | null = null;
    if (profile.role === "CLIENT") {
      const allClients = await prisma.userProfile.findMany({
        where: { role: "CLIENT" },
        select: {
          id: true,
          sessions: {
            select: {
              logs: true,
            },
          },
        },
      });

      const rankedUsers = allClients
        .map((user) => ({
          id: user.id,
          totalSessions: user.sessions.flatMap((s) => s.logs).length,
        }))
        .filter((u) => u.totalSessions > 0)
        .sort((a, b) => b.totalSessions - a.totalSessions);

      const userIndex = rankedUsers.findIndex((u) => u.id === profileId);
      rank = userIndex !== -1 ? userIndex + 1 : null;
    }

    const userChallenges = await prisma.challenge.findMany({
      where: {
        sessions: {
          some: {
            userId: profileId,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        gym: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    return jsonOk({
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.email,
        bio: profile.bio,
        city: profile.city,
        showTopGyms: profile.showTopGyms,
        showBadges: profile.showBadges,
        role: profile.role,
      },
      badges: profile.badges
        .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime())
        .map((ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          icon: ub.badge.icon,
          awardedAt: ub.awardedAt.toISOString(),
          rewardRule: ub.badge.rewardRule?.name,
          updatedAt: ub.badge.updatedAt.toISOString(),
          createdAt: ub.badge.createdAt.toISOString(),
        })),
      topGyms,
      recentSessions: profile.sessions.map((s) => ({
        id: s.id,
        challengeId: s.challengeId,
        challengeTitle: s.challenge.title,
        status: s.status,
        completedAt: s.completedAt?.toISOString() ?? null,
        gymName: s.challenge.gym?.name,
      })),
      challenges: userChallenges,
      stats: {
        totalSessions,
        totalLogs,
        totalDuration,
        totalCalories,
        rank,
      },
    });
  } catch (error) {
    logger.error("Echec recuperation profil:", error);
    return jsonError("Échec de la récupération du profil", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
