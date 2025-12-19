import { apiFetch } from "@/lib/api-client";
import { ChallengesPageContent } from "./challenges-client";
import type { ApiChallenge } from "@/types/api";

function transformChallenge(challenge: ApiChallenge) {
  return {
    ...challenge,
    createdAt: new Date(challenge.createdAt),
  };
}

export default async function ChallengesPage() {
  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [allChallengesRes, myChallengesRes] = await Promise.all([
    apiFetch<{ challenges: ApiChallenge[]; isAuthed: boolean }>(`${baseUrl}/api/challenges`),
    apiFetch<{ challenges: ApiChallenge[] }>(`${baseUrl}/api/challenges?my=true`),
  ]);

  const challenges = (allChallengesRes.data?.challenges || []).map(transformChallenge);
  const myChallenges = myChallengesRes.data?.challenges?.map(transformChallenge);

  return <ChallengesPageContent challenges={challenges} myChallenges={myChallenges} />;
}
