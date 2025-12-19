import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { ChallengeTrackingContent } from "./challenge-tracking-content";
import type { ApiChallengeSessionWithDetails } from "@/types/api";

function transformChallengeSessionWithDetails(cs: ApiChallengeSessionWithDetails) {
  return {
    id: cs.id,
    challengeId: cs.challengeId,
    userId: cs.userId,
    status: cs.status,
    score: cs.score,
    completedAt: cs.completedAt ? new Date(cs.completedAt) : null,
    createdAt: new Date(cs.createdAt),
    updatedAt: new Date(cs.updatedAt),
    challenge: {
      id: cs.challenge.id,
      title: cs.challenge.title,
      description: cs.challenge.description,
      difficulty: cs.challenge.difficulty,
      duration: cs.challenge.duration,
      recommendedExercises: cs.challenge.recommendedExercises,
      relatedEquipment: cs.challenge.relatedEquipment,
      gym: cs.challenge.gym,
    },
    logs: cs.logs.map((log) => ({
      id: log.id,
      challengeSessionId: cs.id,
      date: new Date(log.date),
      duration: log.duration,
      calories: log.calories,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeTrackingPage({ params }: PageProps) {
  const { id } = await params;
  const challengeId = parseInt(id, 10);

  if (isNaN(challengeId)) {
    notFound();
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await apiFetch<{ challengeSession: ApiChallengeSessionWithDetails }>(
    `${baseUrl}/api/challenges/sessions/${challengeId}`,
  );

  if (error || !data || !data.challengeSession) {
    redirect(`/defis/${challengeId}`);
  }

  return (
    <ChallengeTrackingContent
      challengeSession={transformChallengeSessionWithDetails(data.challengeSession)}
    />
  );
}
