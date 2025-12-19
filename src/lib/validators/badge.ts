import { z } from "zod";
import { REQUIRED_FIELD } from "./constants";

export const badgeSchema = z.object({
  name: z.string().min(1, REQUIRED_FIELD),
  icon: z.string().max(2, "L'icône ne peut pas dépasser 2 caractères").optional(),
});

export type BadgeFormData = z.infer<typeof badgeSchema>;

export const badgeWithRuleSchema = z.object({
  name: z.string().min(1, REQUIRED_FIELD),
  icon: z.string().max(2, "L'icône ne peut pas dépasser 2 caractères").optional(),
  ruleName: z.string().optional(),
  field: z.enum(["totalSessions", "completedChallenges", "totalCalories", "totalDuration"]),
  operator: z.enum([">", ">=", "<", "<=", "=="]),
  value: z.number().int().min(0, "La valeur doit être positive"),
});

export type BadgeWithRuleFormData = z.infer<typeof badgeWithRuleSchema>;

export const ruleFieldSchema = z.enum([
  "totalSessions",
  "completedChallenges",
  "totalCalories",
  "totalDuration",
]);

export type RuleField = z.infer<typeof ruleFieldSchema>;

export const ruleOperatorSchema = z.enum([">=", "<=", "==", ">"]);

export type RuleOperator = z.infer<typeof ruleOperatorSchema>;

export const rewardRuleSchema = z.object({
  name: z.string().min(1, REQUIRED_FIELD),
  field: ruleFieldSchema,
  operator: ruleOperatorSchema,
  value: z.number().int().min(0, "La valeur doit être positive"),
});

export type RewardRuleFormData = z.infer<typeof rewardRuleSchema>;

export const getRuleFieldLabel = (field: RuleField): string => {
  switch (field) {
    case "totalSessions":
      return "Nombre de séances";
    case "completedChallenges":
      return "Défis terminés";
    case "totalCalories":
      return "Calories brûlées (total)";
    case "totalDuration":
      return "Durée totale (minutes)";
  }
};

export const getRuleOperatorLabel = (operator: RuleOperator): string => {
  switch (operator) {
    case ">=":
      return "supérieur ou égal à";
    case "<=":
      return "inférieur ou égal à";
    case "==":
      return "égal à";
    case ">":
      return "supérieur à";
  }
};
