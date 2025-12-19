export const GYM_STATUS_COPY: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvée",
  REJECTED: "Refusée",
  INCOMPLETE: "À compléter",
};

export type Role = "SUPER_ADMIN" | "GYM_OWNER" | "CLIENT";

export const ROLES: Role[] = ["SUPER_ADMIN", "GYM_OWNER", "CLIENT"];

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (ROLES as readonly string[]).includes(value);

export const tagList = (value?: string | null): string[] =>
  value
    ? value
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
