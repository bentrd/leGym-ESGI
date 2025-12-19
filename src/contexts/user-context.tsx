"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "@/lib/constants";

type UserProfile = {
  id: number;
  authUserId: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  bio: string | null;
  city: string | null;
  showTopGyms: boolean | null;
  showBadges: boolean | null;
};

type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

import type { ApiGymOwner } from "@/types/api";

type Gym = ApiGymOwner | null;

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  rank: number | null;
  gym: Gym;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [gym, setGym] = useState<Gym>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/bootstrap", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setUser(data.data.user);
          setProfile(data.data.profile);
          setRank(data.data.rank);
          setGym(data.data.gym || null);
        } else {
          setUser(null);
          setProfile(null);
          setRank(null);
          setGym(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRank(null);
        setGym(null);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setProfile(null);
      setRank(null);
      setGym(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    await fetchUserData();
  };

  return (
    <UserContext.Provider value={{ user, profile, rank, gym, isLoading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
