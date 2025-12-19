import { z } from "zod";
import { REQUIRED_FIELD } from "./constants";

export const exerciseTypeSchema = z.object({
  name: z.string().min(1, REQUIRED_FIELD).max(100),
  description: z.string().optional().nullable(),
  targetedMuscles: z.string().optional().nullable(),
});

export const createExerciseTypeSchema = exerciseTypeSchema;

export const updateExerciseTypeSchema = exerciseTypeSchema.partial();

export type ExerciseTypeFormData = z.infer<typeof exerciseTypeSchema>;
export type CreateExerciseTypeData = z.infer<typeof createExerciseTypeSchema>;
export type UpdateExerciseTypeData = z.infer<typeof updateExerciseTypeSchema>;

export const MUSCLE_GROUPS = [
  "Pectoraux",
  "Dorsaux",
  "Épaules",
  "Biceps",
  "Triceps",
  "Abdominaux",
  "Quadriceps",
  "Ischio-jambiers",
  "Mollets",
  "Fessiers",
  "Trapèzes",
  "Avant-bras",
  "Corps complet",
] as const;
