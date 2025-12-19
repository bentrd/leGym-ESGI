import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

export const GET = async () => {
  try {
    const session = await getSession();

    if (!session) {
      return jsonOk({ user: null, profile: null });
    }

    const profile = await getUserProfile(session.user.id);

    return jsonOk({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
      profile: profile
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
        : null,
    });
  } catch (error) {
    logger.error("Echec recuperation donnees utilisateur:", error);
    return jsonError(
      "Echec de la recuperation des donnees utilisateur",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
