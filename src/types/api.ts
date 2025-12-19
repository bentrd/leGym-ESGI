import type { GymMinimal } from "./gym";

export type ApiHomeData = {
  gyms: GymMinimal[];
  challenges: Array<{
    id: number;
    title: string;
    description: string | null;
    difficulty: string;
    duration: number | null;
    gym: {
      name: string;
      city: string;
    } | null;
  }>;
  isAuthed: boolean;
};

export type ApiChallenge = {
  id: number;
  title: string;
  description: string | null;
  goals: string | null;
  difficulty: string;
  duration: number | null;
  recommendedExercises: string | null;
  relatedEquipment: string | null;
  gymId: number | null;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    displayName: string | null;
    email: string | null;
  };
  gym: {
    name: string;
    slug: string;
    city?: string;
  } | null;
  sessions?: Array<{
    userId: number;
    status: string;
  }>;
};

export type ApiChallengeParticipant = {
  id: number;
  displayName: string | null;
};

export type ApiMyParticipation = {
  status: string;
  stats: {
    totalSessions: number;
    totalDuration: number;
    totalCalories: number;
  };
};

export type ApiChallengeSession = {
  id: number;
  challengeId: number;
  userId: number;
  status: string;
  score: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  challenge: {
    id: number;
    title: string;
    description: string | null;
    difficulty: string;
    duration: number | null;
    recommendedExercises: string | null;
    relatedEquipment: string | null;
    gym: {
      name: string;
      city: string;
    } | null;
  };
  logs: Array<{
    id: number;
    date: string;
    duration: number | null;
    calories: number | null;
  }>;
};

export type ApiChallengeSessionWithDetails = ApiChallengeSession & {
  challenge: {
    id: number;
    title: string;
    description: string | null;
    difficulty: string;
    duration: number | null;
    recommendedExercises: string | null;
    relatedEquipment: string | null;
    gym: {
      name: string;
      city: string;
    } | null;
  };
};

export type ApiUserBadge = {
  id: number;
  badgeId: number;
  userId: number;
  awardedAt: string;
  badge: {
    id: number;
    name: string;
    icon: string | null;
    rewardRule: {
      id: number;
      name: string;
      criteria: string;
    } | null;
  };
};

export type ApiBadgeData = {
  id: number;
  name: string;
  icon: string | null;
  rewardRule: {
    id: number;
    name: string;
    criteria: string;
  } | null;
};

export type ApiLeaderboardUser = {
  id: number;
  name: string;
  totalSessions: number;
  totalDuration: number;
  totalCalories: number;
};

export type ApiProfile = {
  id: number;
  displayName: string | null;
  email: string | null;
  bio: string | null;
  city: string | null;
  showTopGyms: boolean | null;
  showBadges: boolean | null;
  role: string;
};

export type ApiProfileBadge = {
  id: number;
  name: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  awardedAt: string;
  rewardRule?: string | null;
};

export type ApiTopGym = {
  id: number;
  name: string;
  slug: string;
  city: string;
  address: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  activities: string | null;
};

export type ApiRecentSession = {
  id: number;
  challengeId: number;
  challengeTitle: string;
  status: string;
  completedAt: string | null;
  gymName?: string | null;
};

export type ApiProfileChallenge = {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  duration: number | null;
  gym: {
    name: string;
    city: string;
  } | null;
};

export type ApiProfileStats = {
  totalSessions: number;
  totalLogs: number;
  totalDuration: number;
  totalCalories: number;
  rank?: number | null;
};

export type ApiExerciseType = {
  id: number;
  name: string;
  description: string | null;
  targetedMuscles: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiGymOwner = {
  id: number;
  slug: string;
  status: string;
  name?: string;
  city?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  equipmentSummary?: string;
  activities?: string;
};

export type ApiBadge = {
  id: number;
  name: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  rewardRule: {
    id: number;
    name: string;
    criteria: string;
  } | null;
  _count?: {
    awards: number;
  };
};

export type ApiUser = {
  id: number;
  authUserId: string;
  email: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  gyms?: Array<{
    id: number;
    name: string;
    slug: string;
    status: string;
  }>;
  authUser?: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  } | null;
};
