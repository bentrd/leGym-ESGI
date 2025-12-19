"use client";

import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUPS } from "@/lib/validators/exercise-type";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getBadgeColor } from "@/lib/badge-colors";
type ExerciseType = {
  id: number;
  name: string;
  description: string | null;
  targetedMuscles: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (exerciseType: ExerciseType) => void;
  exerciseType?: ExerciseType;
};

export function ExerciseTypeFormModal({ open, onClose, onSuccess, exerciseType }: Props) {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(
    exerciseType?.targetedMuscles
      ? exerciseType.targetedMuscles
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
      : [],
  );

  const isEditing = !!exerciseType;

  const form = useForm({
    defaultValues: {
      name: exerciseType?.name ?? "",
      description: exerciseType?.description ?? "",
      targetedMuscles: exerciseType?.targetedMuscles ?? "",
    },
    onSubmit: async ({ value }) => {
      const targetedMuscles = selectedMuscles.length > 0 ? selectedMuscles.join(", ") : null;

      const payload = {
        ...value,
        targetedMuscles,
      };

      try {
        const url = isEditing
          ? `/api/admin/exercise-types/${exerciseType.id}`
          : "/api/admin/exercise-types";

        const response = await fetch(url, {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          onSuccess(data);
          form.reset();
          setSelectedMuscles([]);
        } else {
          const data = await response.json();
          alert(data.error || "Erreur lors de l'enregistrement");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        alert("Erreur lors de l'enregistrement");
      }
    },
  });

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le type d'exercice" : "Créer un type d'exercice"}
          </DialogTitle>
          <DialogDescription>
            Définissez les caractéristiques du type d&apos;exercice
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field name="name">
            {(field) => (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="ex: Cardio, Musculation..."
                />
                {field.state.meta.errors && (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Description du type d'exercice..."
                />
              </div>
            )}
          </form.Field>

          <div>
            <label className="mb-2 block text-sm font-medium">Groupes musculaires ciblés</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <Badge
                  key={muscle}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedMuscles.includes(muscle) && getBadgeColor(muscle),
                  )}
                  onClick={() => toggleMuscle(muscle)}
                >
                  {muscle}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Sélectionnez les groupes musculaires concernés
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} startIcon={<X className="h-4 w-4" />}>
              Annuler
            </Button>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {(state) => (
                <Button
                  type="submit"
                  color="green"
                  disabled={!state.canSubmit || state.isSubmitting}
                  startIcon={
                    state.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEditing ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )
                  }
                >
                  {state.isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
