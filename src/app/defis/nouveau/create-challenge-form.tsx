"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBadgeColor } from "@/lib/badge-colors";
import { renderError } from "@/components/ui/error-message";
import { challengeSchema } from "@/lib/validators/challenge";
import { useUser } from "@/contexts/user-context";

type CreateChallengeFormProps = {
  userRole?: string;
  gym?: { id: number; name: string; equipmentSummary: string | null } | null;
  exerciseTypes: { id: number; name: string }[];
  initialValues?: {
    title: string;
    description: string;
    goals: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    duration: string;
    recommendedExercises: string[];
    relatedEquipment: string[];
    attachToGym: boolean;
  };
  challengeId?: number;
};

const textareaClass =
  "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function CreateChallengeForm({
  userRole: userRoleProp,
  gym: gymProp,
  exerciseTypes,
  initialValues,
  challengeId,
}: CreateChallengeFormProps) {
  const router = useRouter();
  const { profile, gym: contextGym } = useUser();
  const [error, setError] = useState<string | null>(null);

  const userRole = userRoleProp || profile?.role || "";
  const gym = gymProp ?? contextGym;

  const gymEquipment = gym?.equipmentSummary
    ? gym.equipmentSummary
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean)
    : [];

  const fieldSchema = challengeSchema.shape;
  const isEditing = !!challengeId;

  const form = useForm({
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      goals: "",
      difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
      duration: "",
      recommendedExercises: [] as string[],
      relatedEquipment: [] as string[],
      attachToGym: gym ? true : false,
    },
    validators: { onSubmit: challengeSchema },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const url = isEditing ? `/api/challenges/${challengeId}` : "/api/challenges";
        const method = isEditing ? "PATCH" : "POST";

        const payload = {
          title: value.title,
          description: value.description,
          goals: value.goals,
          difficulty: value.difficulty,
          ...(value.duration ? { duration: parseInt(value.duration, 10) } : {}),
          ...(value.recommendedExercises.length
            ? { recommendedExercises: value.recommendedExercises.join(",") }
            : {}),
          ...(value.relatedEquipment.length
            ? { relatedEquipment: value.relatedEquipment.join(",") }
            : {}),
          ...(value.attachToGym && gym ? { gymId: gym.id } : {}),
        };

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const apiMessage = await response
            .json()
            .then((r) => (typeof r?.message === "string" ? r.message : null))
            .catch(() => null);
          throw new Error(
            apiMessage ||
              (isEditing
                ? "Échec lors de la modification du challenge"
                : "Échec lors de la création du challenge"),
          );
        }

        const result = await response.json();
        const challenge = result.data ?? result;
        router.push(`/defis/${challenge.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    },
    onSubmitInvalid: () => {
      setError("Le formulaire contient des erreurs. Veuillez les corriger puis réessayer.");
    },
  });

  const toggleExercise = (exercise: string) => {
    const current = form.state.values.recommendedExercises;
    form.setFieldValue(
      "recommendedExercises",
      current.includes(exercise) ? current.filter((e) => e !== exercise) : [...current, exercise],
    );
  };

  const toggleEquipment = (equipment: string) => {
    const current = form.state.values.relatedEquipment;
    form.setFieldValue(
      "relatedEquipment",
      current.includes(equipment)
        ? current.filter((e) => e !== equipment)
        : [...current, equipment],
    );
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{isEditing ? "Modifier le défi" : "Créer un défi"}</h1>
        <p className="text-muted-foreground mt-2">
          {isEditing
            ? "Modifiez les informations de votre défi"
            : userRole === "GYM_OWNER"
              ? "Créez un défi pour votre salle ou la communauté"
              : "Créez un défi pour la communauté"}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field
              name="title"
              validators={{ onBlur: fieldSchema.title, onSubmit: fieldSchema.title }}
            >
              {(field) => (
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium">
                    Titre du défi *
                  </label>
                  <Input
                    id="title"
                    required
                    value={field.state.value}
                    onChange={(e) => {
                      field.setErrorMap({});
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Ex: 100 pompes en 30 jours"
                  />
                  {renderError(field.state.meta)}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={field.state.value}
                    onChange={(e) => {
                      field.setErrorMap({});
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Décrivez votre défi..."
                    className={textareaClass}
                  />
                  {renderError(field.state.meta)}
                </div>
              )}
            </form.Field>

            <form.Field name="goals">
              {(field) => (
                <div>
                  <label htmlFor="goals" className="mb-2 block text-sm font-medium">
                    Objectifs
                  </label>
                  <textarea
                    id="goals"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ex: Compléter 100 pompes réparties sur 30 jours"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            </form.Field>

            <div className="grid gap-4 md:grid-cols-2">
              <form.Field name="difficulty">
                {(field) => (
                  <div>
                    <label htmlFor="difficulty" className="mb-2 block text-sm font-medium">
                      Difficulté *
                    </label>
                    <select
                      id="difficulty"
                      required
                      value={field.state.value}
                      onChange={(e) => {
                        field.setErrorMap({});
                        field.handleChange(e.target.value as "EASY" | "MEDIUM" | "HARD");
                      }}
                      onBlur={field.handleBlur}
                      className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="EASY">Facile</option>
                      <option value="MEDIUM">Moyen</option>
                      <option value="HARD">Difficile</option>
                    </select>
                    {renderError(field.state.meta)}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="duration"
                validators={{ onBlur: fieldSchema.duration, onSubmit: fieldSchema.duration }}
              >
                {(field) => (
                  <div>
                    <label htmlFor="duration" className="mb-2 block text-sm font-medium">
                      Durée (jours)
                    </label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={field.state.value}
                      onChange={(e) => {
                        field.setErrorMap({});
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                      placeholder="Ex: 30"
                    />
                    {renderError(field.state.meta)}
                  </div>
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        {exerciseTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exercices recommandés</CardTitle>
              <CardDescription>
                Sélectionnez les types d&apos;exercices pour ce défi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form.Subscribe selector={(state) => state.values.recommendedExercises}>
                {(recommendedExercises) => (
                  <div className="flex flex-wrap gap-2">
                    {exerciseTypes.map((exercise) => {
                      const isSelected = recommendedExercises.includes(exercise.name);
                      const colorClass = getBadgeColor(exercise.name, true);
                      return (
                        <button
                          key={exercise.name}
                          type="button"
                          onClick={() => toggleExercise(exercise.name)}
                          className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                            isSelected
                              ? colorClass
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {exercise.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </form.Subscribe>
            </CardContent>
          </Card>
        )}

        {userRole === "GYM_OWNER" && gym && (
          <Card>
            <CardHeader>
              <CardTitle>Options salle de sport</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form.Field name="attachToGym">
                {(field) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="attachToGym"
                      checked={field.state.value}
                      onChange={(e) => {
                        field.setErrorMap({});
                        field.handleChange(e.target.checked);
                      }}
                      onBlur={field.handleBlur}
                      className="border-input h-4 w-4 rounded"
                    />
                    <label htmlFor="attachToGym" className="text-sm font-medium">
                      Attacher ce défi à ma salle ({gym.name})
                    </label>
                  </div>
                )}
              </form.Field>

              {gymEquipment.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Équipements liés (de votre salle)
                  </label>
                  <form.Subscribe selector={(state) => state.values.relatedEquipment}>
                    {(relatedEquipment) => (
                      <div className="flex flex-wrap gap-2">
                        {gymEquipment.map((equipment) => {
                          const isSelected = relatedEquipment.includes(equipment);
                          const colorClass = getBadgeColor(equipment, true);
                          return (
                            <button
                              key={equipment}
                              type="button"
                              onClick={() => toggleEquipment(equipment)}
                              className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                                isSelected
                                  ? colorClass
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {equipment}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </form.Subscribe>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && renderError(undefined, error)}

        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit, state.isDefaultValue]}
        >
          {([isSubmitting, canSubmit, isDefaultValue]) => {
            const disabled = isSubmitting || !canSubmit || isDefaultValue;
            return (
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={disabled}
                  color="green"
                  startIcon={
                    isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEditing ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )
                  }
                >
                  {isSubmitting
                    ? isEditing
                      ? "Modification..."
                      : "Création..."
                    : isEditing
                      ? "Modifier le défi"
                      : "Créer le défi"}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  startIcon={<X className="h-4 w-4" />}
                >
                  Annuler
                </Button>
              </div>
            );
          }}
        </form.Subscribe>
      </form>
    </main>
  );
}
