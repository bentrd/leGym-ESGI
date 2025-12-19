import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { AdminGymsList } from "@/components/admin/admin-gyms-list";
import type { Gym } from "@/types/gym";

export default async function AdminSallesPage() {
  const { data, error } = await apiFetch<{ gyms: Gym[] }>("/api/admin/gyms");

  if (error || !data) {
    if (error?.includes("Unauthorized") || error?.includes("Forbidden")) {
      redirect("/auth/connexion");
    }
    redirect("/");
  }

  return <AdminGymsList gyms={data.gyms} />;
}
