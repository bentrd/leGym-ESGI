import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { ExerciseTypeList } from "@/components/admin/exercise-type-list";
import type { ApiExerciseType } from "@/types/api";

export default async function ExerciseTypesAdminPage() {
  const { data, error } = await apiFetch<{ exerciseTypes: ApiExerciseType[] }>(
    "/api/admin/exercise-types",
  );

  if (error || !data) {
    if (error?.includes("Unauthorized") || error?.includes("Forbidden")) {
      redirect("/auth/connexion");
    }
    redirect("/");
  }

  const serializedExerciseTypes = data.exerciseTypes.map((type) => ({
    id: type.id,
    name: type.name,
    description: type.description,
    targetedMuscles: type.targetedMuscles,
    createdAt: type.createdAt,
    updatedAt: type.updatedAt,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <ExerciseTypeList exerciseTypes={serializedExerciseTypes} />
    </div>
  );
}
