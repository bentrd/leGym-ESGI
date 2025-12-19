import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { EditChallengeClient } from "./edit-challenge-client";
import type { ApiChallenge, ApiExerciseType } from "@/types/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditChallengePage({ params }: PageProps) {
  const { id } = await params;
  const challengeId = parseInt(id, 10);

  if (isNaN(challengeId)) {
    notFound();
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [challengeRes, exerciseTypesRes] = await Promise.all([
    apiFetch<{
      challenge: ApiChallenge & {
        gym: {
          id: number;
          name: string;
          equipmentSummary: string | null;
        } | null;
      };
      canEdit: boolean;
    }>(`${baseUrl}/api/challenges/${challengeId}`),
    apiFetch<{ exerciseTypes: ApiExerciseType[] }>(`${baseUrl}/api/admin/exercise-types`),
  ]);

  if (!challengeRes.data?.challenge) {
    notFound();
  }

  const challenge = challengeRes.data.challenge;
  const exerciseTypes =
    exerciseTypesRes.data?.exerciseTypes.map((et) => ({
      id: et.id,
      name: et.name,
    })) || [];

  return (
    <EditChallengeClient
      challenge={challenge}
      exerciseTypes={exerciseTypes}
      challengeId={challengeId}
    />
  );
}
