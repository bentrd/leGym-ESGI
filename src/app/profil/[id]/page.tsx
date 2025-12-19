import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { ProfileContent } from "./profile-content";
import type {
  ApiProfile,
  ApiProfileBadge,
  ApiTopGym,
  ApiRecentSession,
  ApiProfileChallenge,
  ApiProfileStats,
} from "@/types/api";

function transformBadge(badge: ApiProfileBadge) {
  return {
    id: badge.id,
    name: badge.name,
    icon: badge.icon,
    createdAt: new Date(badge.createdAt),
    updatedAt: new Date(badge.updatedAt),
    awardedAt: new Date(badge.awardedAt),
    rewardRule: badge.rewardRule || undefined,
  };
}

function transformProfile(profile: ApiProfile) {
  return {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.email,
    bio: profile.bio,
    city: profile.city,
    showTopGyms: profile.showTopGyms ?? false,
    showBadges: profile.showBadges ?? false,
    role: profile.role,
  };
}

function transformStats(stats: ApiProfileStats) {
  return {
    totalSessions: stats.totalSessions,
    totalLogs: stats.totalLogs,
    totalDuration: stats.totalDuration,
    totalCalories: stats.totalCalories,
    rank: stats.rank ?? undefined,
  };
}

function transformRecentSession(session: ApiRecentSession) {
  return {
    id: session.id,
    challengeId: session.challengeId,
    challengeTitle: session.challengeTitle,
    status: session.status,
    completedAt: session.completedAt ? new Date(session.completedAt) : null,
    gymName: session.gymName,
  };
}

function transformChallenge(challenge: ApiProfileChallenge) {
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    duration: challenge.duration,
    gym: challenge.gym,
  };
}

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage(props: ProfilePageProps) {
  const { id } = await props.params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId)) {
    notFound();
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await apiFetch<{
    profile: ApiProfile;
    badges: ApiProfileBadge[];
    topGyms: ApiTopGym[];
    recentSessions: ApiRecentSession[];
    challenges: ApiProfileChallenge[];
    stats: ApiProfileStats;
  }>(`${baseUrl}/api/profiles/${profileId}`);

  if (error || !data || !data.profile) {
    notFound();
  }

  return (
    <ProfileContent
      profile={transformProfile(data.profile)}
      badges={data.badges.map(transformBadge)}
      topGyms={data.topGyms}
      recentSessions={data.recentSessions.map(transformRecentSession)}
      challenges={data.challenges.map(transformChallenge)}
      stats={transformStats(data.stats)}
    />
  );
}
