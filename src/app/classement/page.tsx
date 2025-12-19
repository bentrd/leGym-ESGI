import { apiFetch } from "@/lib/api-client";
import { LeaderboardContent } from "./leaderboard-content";
import type { ApiLeaderboardUser } from "@/types/api";

export default async function LeaderboardPage() {
  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await apiFetch<{ leaderboardData: ApiLeaderboardUser[] }>(
    `${baseUrl}/api/leaderboard`,
  );

  if (error || !data) {
    return <LeaderboardContent leaderboardData={[]} />;
  }

  return <LeaderboardContent leaderboardData={data.leaderboardData} />;
}
