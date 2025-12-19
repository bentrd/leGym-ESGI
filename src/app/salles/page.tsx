import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { SallesClientPage } from "./salles-client";
import type { Gym } from "@/types/gym";

export default async function SallesPage() {
  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await apiFetch<Gym[]>(`${baseUrl}/api/gyms?limit=12`);

  if (error || !data) {
    notFound();
  }

  return <SallesClientPage initialGyms={data} />;
}
