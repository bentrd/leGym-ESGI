"use client";

import { redirect } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { OwnerGymPanel } from "@/components/gym/owner-gym-panel";

export default function ProprietaireSallePage() {
  const { gym, profile, isLoading } = useUser();

  if (!isLoading && !profile) {
    redirect("/auth/connexion");
  }

  if (!isLoading && profile?.role !== "GYM_OWNER") {
    redirect("/");
  }

  if (isLoading || !profile) {
    return <div>Chargement...</div>;
  }

  return (
    <OwnerGymPanel
      gym={gym ? { id: gym.id, slug: gym.slug, status: gym.status } : null}
      initialStatus={gym?.status ?? "INCOMPLETE"}
      initialValues={{
        name: gym?.name ?? "",
        city: gym?.city ?? "",
        address: gym?.address ?? "",
        contactEmail: gym?.contactEmail ?? "",
        contactPhone: gym?.contactPhone ?? "",
        description: gym?.description ?? "",
        equipmentSummary: gym?.equipmentSummary ?? "",
        activities: gym?.activities ?? "",
      }}
    />
  );
}
