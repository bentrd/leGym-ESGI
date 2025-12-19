import { apiFetch } from "@/lib/api-client";
import type { ApiExerciseType } from "@/types/api";
import { NewChallengePageClient } from "./new-challenge-client";

export default async function NewChallengePage() {
  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const exerciseTypesRes = await apiFetch<{ exerciseTypes: ApiExerciseType[] }>(
    `${baseUrl}/api/admin/exercise-types`,
  );

  const exerciseTypes =
    exerciseTypesRes.data?.exerciseTypes.map((et) => ({
      id: et.id,
      name: et.name,
    })) || [];

  return <NewChallengePageClient exerciseTypes={exerciseTypes} />;
}
