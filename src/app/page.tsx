import { HomePageContent } from "@/components/home/home-page-content";
import { apiFetch } from "@/lib/api-client";
import type { ApiHomeData } from "@/types/api";

export default async function Home() {
  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await apiFetch<ApiHomeData>(`${baseUrl}/api/home-data`);

  if (error || !data) {
    return <HomePageContent gyms={[]} challenges={[]} />;
  }

  return <HomePageContent gyms={data.gyms} challenges={data.challenges} />;
}
