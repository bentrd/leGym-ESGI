import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { BadgesContent } from "./badges-content";
import type { ApiBadge } from "@/types/api";

function transformBadge(badge: ApiBadge) {
  return {
    ...badge,
    createdAt: new Date(badge.createdAt),
    updatedAt: new Date(badge.updatedAt),
    _count: badge._count || { awards: 0 },
  };
}

export default async function AdminBadgesPage() {
  const { data, error } = await apiFetch<ApiBadge[]>("/api/admin/badges");

  if (error || !data) {
    if (error?.includes("Unauthorized") || error?.includes("Forbidden")) {
      redirect("/auth/connexion");
    }
    notFound();
  }

  return <BadgesContent badges={data.map(transformBadge)} />;
}
