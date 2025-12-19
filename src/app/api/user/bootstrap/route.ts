import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/server/db";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const session = await getSession();

    if (!session) {
      return jsonOk({
        user: null,
        profile: null,
        rank: null,
        gym: null,
      });
    }

    const profile = await getUserProfile(session.user.id);

    const user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    };

    const profileData = profile
      ? {
          id: profile.id,
          authUserId: profile.authUserId,
          email: profile.email,
          displayName: profile.displayName,
          role: profile.role,
          bio: profile.bio,
          city: profile.city,
          showTopGyms: profile.showTopGyms,
          showBadges: profile.showBadges,
        }
      : null;

    let rank: number | null = null;
    if (profile?.role === "CLIENT") {
      const userStats = await prisma.userProfile.findMany({
        where: { role: "CLIENT" },
        select: {
          id: true,
          sessions: {
            select: {
              logs: {
                select: { duration: true, calories: true },
              },
            },
          },
        },
      });

      const rankedUsers = userStats
        .map((u) => ({
          id: u.id,
          totalSessions: u.sessions.flatMap((s) => s.logs).length,
        }))
        .filter((u) => u.totalSessions > 0)
        .sort((a, b) => b.totalSessions - a.totalSessions);

      const userIndex = rankedUsers.findIndex((u) => u.id === profile.id);
      rank = userIndex !== -1 ? userIndex + 1 : null;
    }

    let gym = null;
    if (profile?.role === "GYM_OWNER") {
      const gymData = await prisma.gym.findFirst({
        where: { ownerId: profile.id },
      });
      if (gymData) {
        gym = {
          id: gymData.id,
          slug: gymData.slug,
          status: gymData.status,
          name: gymData.name,
          city: gymData.city,
          address: gymData.address,
          contactEmail: gymData.contactEmail,
          contactPhone: gymData.contactPhone,
          description: gymData.description,
          equipmentSummary: gymData.equipmentSummary,
          activities: gymData.activities,
        };
      }
    }

    return jsonOk({
      user,
      profile: profileData,
      rank,
      gym,
    });
  } catch (error) {
    logger.error("Echec bootstrap donnees utilisateur:", error);
    return jsonError(
      "Echec du bootstrap des donnees utilisateur",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
