import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { MyChallengesContent } from "./my-challenges-content";
import type { ApiChallengeSession } from "@/types/api";

function transformChallengeSession(cs: ApiChallengeSession) {
  return {
    id: cs.id,
    status: cs.status,
    score: cs.score,
    completedAt: cs.completedAt ? new Date(cs.completedAt) : null,
    challenge: {
      id: cs.challenge.id,
      title: cs.challenge.title,
      difficulty: cs.challenge.difficulty,
      duration: cs.challenge.duration,
      gym: cs.challenge.gym,
    },
    logs: cs.logs.map((log) => ({
      id: log.id,
      date: new Date(log.date),
      duration: log.duration,
      calories: log.calories,
    })),
  };
}

export default async function MyChallengesPage() {
  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await apiFetch<{ challengeSessions: ApiChallengeSession[] }>(
    `${baseUrl}/api/challenges/my`,
  );

  if (error || !data) {
    redirect("/auth/connexion");
  }

  return (
    <MyChallengesContent
      challengeSessions={data.challengeSessions.map(transformChallengeSession)}
    />
  );
}
