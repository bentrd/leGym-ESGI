"use client";

import { redirect } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { CreateChallengeForm } from "../../nouveau/create-challenge-form";
import type { ApiChallenge } from "@/types/api";

type EditChallengeClientProps = {
  challenge: ApiChallenge & {
    gym: {
      id: number;
      name: string;
      equipmentSummary: string | null;
    } | null;
  };
  exerciseTypes: Array<{ id: number; name: string }>;
  challengeId: number;
};

export function EditChallengeClient({
  challenge,
  exerciseTypes,
  challengeId,
}: EditChallengeClientProps) {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    redirect("/auth/connexion");
  }

  const isSuperAdmin = profile.role === "SUPER_ADMIN";
  const isCreator = challenge.creatorId === profile.id;

  if (!isSuperAdmin && !isCreator) {
    redirect(`/defis/${challengeId}`);
  }

  const parseRecommendedExercises = (value: string | null) => {
    if (!value) return [];
    const exercises = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return Array.from(new Set(exercises));
  };

  return (
    <CreateChallengeForm
      gym={challenge.gym}
      exerciseTypes={exerciseTypes}
      initialValues={{
        title: challenge.title,
        description: challenge.description ?? "",
        goals: challenge.goals ?? "",
        difficulty: challenge.difficulty as "EASY" | "MEDIUM" | "HARD",
        duration: challenge.duration?.toString() ?? "",
        recommendedExercises: parseRecommendedExercises(challenge.recommendedExercises),
        relatedEquipment: challenge.relatedEquipment
          ? challenge.relatedEquipment
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
        attachToGym: !!challenge.gymId,
      }}
      challengeId={challengeId}
    />
  );
}
