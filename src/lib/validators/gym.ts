import { z } from "zod";
import { REQUIRED_FIELD } from "./constants";

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean);

export const gymSchema = z.object({
  name: z.string().trim().min(1, REQUIRED_FIELD),
  city: z.string().trim().optional(),
  address: z.string().trim().min(5, REQUIRED_FIELD),
  postcode: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactEmail: z.email("Email invalide"),
  contactPhone: z.string().trim().optional(),
  description: z.string().trim().min(10, "La description doit contenir au moins 10 caractères"),
  equipmentSummary: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const list = splitList(value);
      if (!list.length) {
        ctx.addIssue({
          code: "custom",
          path: ["equipmentSummary"],
          message: "Ajoutez au moins un équipement (séparé par virgule ou retour à la ligne)",
        });
      }
    }),
  activities: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const list = splitList(value);
      if (!list.length) {
        ctx.addIssue({
          code: "custom",
          path: ["activities"],
          message: "Ajoutez au moins une activité (séparée par virgule ou retour à la ligne)",
        });
      }
    }),
});

export type GymFormValues = z.infer<typeof gymSchema>;

export const splitActivities = splitList;
export const splitEquipments = splitList;

export const normalizeGymPayload = (data: GymFormValues) => {
  const activities = splitActivities(data.activities);
  const equipments = splitEquipments(data.equipmentSummary);

  const uniqueActivities = Array.from(new Set(activities.map((a) => a.toLowerCase()))).map(
    (lower) => activities.find((a) => a.toLowerCase() === lower)!,
  );

  const uniqueEquipments = Array.from(new Set(equipments.map((e) => e.toLowerCase()))).map(
    (lower) => equipments.find((e) => e.toLowerCase() === lower)!,
  );

  return {
    name: data.name.trim(),
    city: data.city?.trim() ?? "",
    address: data.address.trim(),
    postcode: data.postcode?.trim(),
    latitude: data.latitude,
    longitude: data.longitude,
    contactEmail: data.contactEmail.trim(),
    contactPhone: data.contactPhone?.trim() ?? "",
    description: data.description.trim(),
    equipmentSummary: uniqueEquipments.join(", "),
    activities: uniqueActivities.join(", "),
  };
};
