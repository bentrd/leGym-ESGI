import { notFound } from "next/navigation";
import { ChallengeDetailContent } from "./challenge-detail-content";
import { prisma } from "@/server/db";
import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const challengeId = parseInt(id, 10);

  if (isNaN(challengeId)) {
    notFound();
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
    notFound();
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

  return (
    <ChallengeDetailContent
      challenge={{
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        goals: challenge.goals,
        difficulty: challenge.difficulty,
        duration: challenge.duration,
        recommendedExercises: challenge.recommendedExercises,
        relatedEquipment: challenge.relatedEquipment,
        createdAt: challenge.createdAt,
        creator: {
          id: challenge.creator.id,
          displayName: challenge.creator.displayName,
          email: challenge.creator.email,
        },
        gym: challenge.gym
          ? {
              name: challenge.gym.name,
              slug: challenge.gym.slug,
              city: challenge.gym.city || "",
            }
          : null,
      }}
      userHasJoined={!!userSession}
      participantCount={challenge.sessions.length}
      canEdit={canEdit}
      exerciseTypes={exerciseTypes}
      participants={participants}
      myParticipation={myParticipation}
    />
  );
}
