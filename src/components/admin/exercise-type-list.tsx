"use client";
import { getBadgeColor } from "@/lib/badge-colors";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseTypeFormModal } from "@/components/admin/exercise-type-form-modal";
import { ScrollableBadges } from "@/components/ui/scrollable-badges";

type ExerciseType = {
  id: number;
  name: string;
  description: string | null;
  targetedMuscles: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  exerciseTypes: ExerciseType[];
};

export function ExerciseTypeList({ exerciseTypes: initialExerciseTypes }: Props) {
  const [exerciseTypes, setExerciseTypes] = useState(initialExerciseTypes);
  const [editingType, setEditingType] = useState<ExerciseType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce type d'exercice ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/exercise-types/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExerciseTypes(exerciseTypes.filter((type) => type.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleCreateSuccess = (newType: ExerciseType) => {
    setExerciseTypes([...exerciseTypes, newType]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateSuccess = (updatedType: ExerciseType) => {
    setExerciseTypes(
      exerciseTypes.map((type) => (type.id === updatedType.id ? updatedType : type)),
    );
    setEditingType(null);
  };

  const getMuscleGroups = (targetedMuscles: string | null): string[] => {
    if (!targetedMuscles) return [];
    return targetedMuscles
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Types d&apos;exercices</h2>
          <p className="text-muted-foreground">
            Gérez les types d&apos;exercices disponibles pour les défis
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          color="green"
          startIcon={<Plus className="h-4 w-4" />}
        >
          Créer un type d&apos;exercice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exerciseTypes.map((type) => {
          const muscles = getMuscleGroups(type.targetedMuscles);

          return (
            <Card key={type.id} className="flex h-60 flex-col">
              <CardHeader className="flex-none">
                <CardTitle className="line-clamp-1">{type.name}</CardTitle>
                {type.description && (
                  <CardDescription className="line-clamp-2">{type.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-end gap-4">
                {muscles.length > 0 && (
                  <ScrollableBadges itemCount={muscles.length}>
                    {muscles.map((muscle) => (
                      <Badge
                        key={muscle}
                        variant="outline"
                        className={`shrink-0 ${getBadgeColor(muscle)}`}
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </ScrollableBadges>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingType(type)}
                    startIcon={<Edit className="h-4 w-4" />}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(type.id)}
                    startIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exerciseTypes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aucun type d&apos;exercice créé. Commencez par en créer un.
            </p>
          </CardContent>
        </Card>
      )}

      <ExerciseTypeFormModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {editingType && (
        <ExerciseTypeFormModal
          open={true}
          onClose={() => setEditingType(null)}
          onSuccess={handleUpdateSuccess}
          exerciseType={editingType}
        />
      )}
    </div>
  );
}
