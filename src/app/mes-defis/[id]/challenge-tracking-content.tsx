"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { ChevronLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { renderError } from "@/components/ui/error-message";
import { ScrollableBadges } from "@/components/ui/scrollable-badges";
import { getBadgeColor } from "@/lib/badge-colors";
import { StatsCards } from "@/components/challenge/stats-cards";
import type { ChallengeSession, WorkoutLog, Challenge, Gym } from "@prisma/client";
import { REQUIRED_FIELD } from "@/lib/validators/constants";

const workoutLogSchema = z.object({
  date: z.string().min(1, REQUIRED_FIELD),
  duration: z.number().int().min(1, REQUIRED_FIELD),
  calories: z.number().int().min(0, "Les calories doivent être positives").optional(),
  notes: z.string().optional(),
});

type WorkoutLogFormData = z.infer<typeof workoutLogSchema>;

type ChallengeSessionWithDetails = ChallengeSession & {
  challenge: Pick<
    Challenge,
    | "id"
    | "title"
    | "description"
    | "difficulty"
    | "duration"
    | "recommendedExercises"
    | "relatedEquipment"
  > & {
    gym: Pick<Gym, "name" | "city"> | null;
  };
  logs: WorkoutLog[];
};

type Props = {
  challengeSession: ChallengeSessionWithDetails;
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-800 border-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
};

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Non commencé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
};

const parseList = (value: string | null) => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export function ChallengeTrackingContent({ challengeSession: initialSession }: Props) {
  const [challengeSession, setChallengeSession] = useState(initialSession);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const router = useRouter();

  const totalDuration = challengeSession.logs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const totalCalories = challengeSession.logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalSessions = challengeSession.logs.length;

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      duration: 0,
      calories: 0,
      notes: "",
    } as WorkoutLogFormData,
    validators: { onSubmit: workoutLogSchema },
    onSubmit: async ({ value }) => {
      try {
        const url = editingLog
          ? `/api/challenges/${challengeSession.challengeId}/sessions/logs/${editingLog.id}`
          : `/api/challenges/${challengeSession.challengeId}/sessions/logs`;

        const method = editingLog ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (!res.ok) {
          const error = await res.json();
          alert(error.error || "Une erreur s'est produite");
          return;
        }

        const data = await res.json();

        if (editingLog) {
          setChallengeSession((prev) => ({
            ...prev,
            logs: prev.logs.map((log) => (log.id === editingLog.id ? data.workoutLog : log)),
          }));
        } else {
          setChallengeSession((prev) => ({
            ...prev,
            status: data.session?.status || prev.status,
            logs: [data.workoutLog, ...prev.logs],
          }));
        }

        form.reset();
        setIsAddDialogOpen(false);
        setEditingLog(null);
        router.refresh();
      } catch (error) {
        console.error("Error submitting workout log:", error);
        alert("Une erreur s'est produite");
      }
    },
  });

  const handleEdit = (log: WorkoutLog) => {
    setEditingLog(log);
    form.setFieldValue("date", log.date.toISOString().split("T")[0]);
    form.setFieldValue("duration", log.duration || 0);
    form.setFieldValue("calories", log.calories || 0);
    form.setFieldValue("notes", log.notes || "");
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (logId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      return;
    }

    setIsDeleting(logId);
    try {
      const res = await fetch(
        `/api/challenges/${challengeSession.challengeId}/sessions/logs/${logId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Une erreur s'est produite");
        return;
      }

      setChallengeSession((prev) => ({
        ...prev,
        logs: prev.logs.filter((log) => log.id !== logId),
      }));
      router.refresh();
    } catch (error) {
      console.error("Error deleting workout log:", error);
      alert("Une erreur s'est produite");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingLog(null);
      form.reset();
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link
          href="/mes-defis"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Retour à mes défis
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{challengeSession.challenge.title}</h1>
            <p className="mb-4 text-gray-600">{challengeSession.challenge.description}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              <DifficultyBadge difficulty={challengeSession.challenge.difficulty} />
              <Badge className={statusColors[challengeSession.status]}>
                {statusLabels[challengeSession.status]}
              </Badge>
              <Badge variant="outline">{challengeSession.challenge.duration} jours</Badge>
              {challengeSession.challenge.gym && (
                <Badge variant="outline">
                  {challengeSession.challenge.gym.name}, {challengeSession.challenge.gym.city}
                </Badge>
              )}
            </div>
            {(() => {
              const exercises = parseList(challengeSession.challenge.recommendedExercises);
              const equipment = parseList(challengeSession.challenge.relatedEquipment);
              const allTags = [...exercises, ...equipment];

              if (allTags.length > 0) {
                return (
                  <div className="mb-4">
                    <ScrollableBadges itemCount={allTags.length}>
                      {allTags.map((tag, idx) => (
                        <div
                          key={idx}
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors select-none ${getBadgeColor(tag)}`}
                        >
                          {tag}
                        </div>
                      ))}
                    </ScrollableBadges>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button color="blue" startIcon={<Plus className="h-4 w-4" />}>
                Ajouter une séance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLog ? "Modifier la séance" : "Ajouter une séance"}
                </DialogTitle>
                <DialogDescription>
                  Enregistrez les détails de votre séance d&apos;entraînement
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <form.Field
                    name="duration"
                    validators={{
                      onBlur: workoutLogSchema.shape.duration,
                      onSubmit: workoutLogSchema.shape.duration,
                    }}
                  >
                    {(field) => (
                      <div>
                        <label htmlFor="duration" className="mb-1 block text-sm font-medium">
                          Durée (min) <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={field.state.value || ""}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(parseInt(e.target.value) || 0);
                          }}
                          onBlur={field.handleBlur}
                        />
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="date"
                    validators={{
                      onBlur: workoutLogSchema.shape.date,
                      onSubmit: workoutLogSchema.shape.date,
                    }}
                  >
                    {(field) => (
                      <div>
                        <label htmlFor="date" className="mb-1 block text-sm font-medium">
                          Date <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="date"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(e.target.value);
                          }}
                          onBlur={field.handleBlur}
                        />
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="calories"
                    validators={{
                      onBlur: workoutLogSchema.shape.calories,
                      onSubmit: workoutLogSchema.shape.calories,
                    }}
                  >
                    {(field) => (
                      <div>
                        <label htmlFor="calories" className="mb-1 block text-sm font-medium">
                          Calories
                        </label>
                        <Input
                          id="calories"
                          type="number"
                          min="0"
                          value={field.state.value || ""}
                          onChange={(e) => {
                            field.setErrorMap({});
                            field.handleChange(parseInt(e.target.value) || 0);
                          }}
                          onBlur={field.handleBlur}
                        />
                        {renderError(field.state.meta)}
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field
                  name="notes"
                  validators={{
                    onBlur: workoutLogSchema.shape.notes,
                    onSubmit: workoutLogSchema.shape.notes,
                  }}
                >
                  {(field) => (
                    <div>
                      <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={3}
                        value={field.state.value || ""}
                        onChange={(e) => {
                          field.setErrorMap({});
                          field.handleChange(e.target.value);
                        }}
                        onBlur={field.handleBlur}
                      />
                      {renderError(field.state.meta)}
                    </div>
                  )}
                </form.Field>

                <form.Subscribe selector={(state) => [state.isSubmitting]}>
                  {([isSubmitting]) => (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        onClick={() => handleDialogClose(false)}
                        disabled={isSubmitting}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        color="green"
                        disabled={isSubmitting}
                        startIcon={
                          isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined
                        }
                      >
                        {isSubmitting ? "Enregistrement..." : editingLog ? "Modifier" : "Ajouter"}
                      </Button>
                    </div>
                  )}
                </form.Subscribe>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6 p-5">
        <StatsCards
          variant="compact"
          totalSessions={totalSessions}
          totalDuration={totalDuration}
          totalCalories={totalCalories}
        />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historique des séances</CardTitle>
        </CardHeader>
        <CardContent>
          {challengeSession.logs.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Aucune séance enregistrée. Commencez à tracker vos entraînements !
            </p>
          ) : (
            <div className="space-y-4">
              {challengeSession.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-medium">
                        {new Date(log.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {log.duration && <Badge variant="outline">{log.duration} min</Badge>}
                      {log.calories && log.calories > 0 && (
                        <Badge variant="outline">{log.calories} kcal</Badge>
                      )}
                    </div>
                    {log.notes && <p className="text-sm text-gray-600">{log.notes}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" onClick={() => handleEdit(log)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(log.id)}
                      disabled={isDeleting === log.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
