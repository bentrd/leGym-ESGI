import { z } from "zod";

export const challengeSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string(),
  goals: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  duration: z.string().refine(
    (val) => {
      if (!val) return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0;
    },
    { message: "La durée doit être un nombre entier supérieur à 0" },
  ),
  recommendedExercises: z.array(z.string()),
  relatedEquipment: z.array(z.string()),
  attachToGym: z.boolean(),
});

export type ChallengeFormValues = z.infer<typeof challengeSchema>;
