"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Flame, TrendingUp, Calendar, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type LeaderboardUser = {
  id: number;
  name: string;
  totalSessions: number;
  totalDuration: number;
  totalCalories: number;
};

type LeaderboardContentProps = {
  leaderboardData: LeaderboardUser[];
};

type SortBy = "sessions" | "duration" | "calories";

export function LeaderboardContent({ leaderboardData }: LeaderboardContentProps) {
  const [sortBy, setSortBy] = useState<SortBy>("sessions");

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case "duration":
        return b.totalDuration - a.totalDuration;
      case "calories":
        return b.totalCalories - a.totalCalories;
      case "sessions":
      default:
        return b.totalSessions - a.totalSessions;
    }
  });

  const getSortLabel = (type: SortBy) => {
    switch (type) {
      case "sessions":
        return "Séances";
      case "duration":
        return "Durée";
      case "calories":
        return "Calories";
    }
  };

  const getSortIcon = (type: SortBy) => {
    switch (type) {
      case "sessions":
        return <Calendar className="mr-2 h-4 w-4" />;
      case "duration":
        return <TrendingUp className="mr-2 h-4 w-4" />;
      case "calories":
        return <Flame className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Classement</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Les membres les plus actifs de la communauté
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
        <Button
          color={sortBy === "sessions" ? "blue" : undefined}
          size="sm"
          onClick={() => setSortBy("sessions")}
        >
          {getSortIcon("sessions")}
          {getSortLabel("sessions")}
        </Button>
        <Button
          color={sortBy === "duration" ? "blue" : undefined}
          size="sm"
          onClick={() => setSortBy("duration")}
        >
          {getSortIcon("duration")}
          {getSortLabel("duration")}
        </Button>
        <Button
          color={sortBy === "calories" ? "blue" : undefined}
          size="sm"
          onClick={() => setSortBy("calories")}
        >
          {getSortIcon("calories")}
          {getSortLabel("calories")}
        </Button>
      </div>

      {sortedData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedData.map((user, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            const rankStyles = {
              1: {
                border: "border-yellow-500",
                from: "from-yellow-500/20",
                text: "text-yellow-500",
              },
              2: {
                border: "border-gray-400",
                from: "from-gray-400/20",
                text: "text-gray-400",
              },
              3: {
                border: "border-amber-600",
                from: "from-amber-600/20",
                text: "text-amber-600",
              },
              default: {
                border: "border-muted-foreground",
                from: "from-muted-foreground/20",
                text: "text-muted-foreground",
              },
            } as const;

            const rankStyle = rankStyles[rank as 1 | 2 | 3] ?? rankStyles.default;

            const getRankIcon = () => {
              const iconClass = `h-5 w-5 ${rankStyle.text}`;
              if (rank === 1) return <Crown className={iconClass} />;
              if (rank === 2) return <Crown className={iconClass} />;
              if (rank === 3) return <Crown className={iconClass} />;
              return null;
            };

            return (
              <Link key={user.id} href={`/profil/${user.id}`} className="block">
                <Card
                  className={cn(
                    "transition-all hover:shadow-md",
                    isTopThree &&
                      `border-2 ${rankStyle.border} bg-linear-to-l ${rankStyle.from} to-transparent`,
                  )}
                >
                  <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                    <div className="flex min-w-8 items-center justify-center sm:min-w-12">
                      <span className={`text-xl font-bold sm:text-2xl ${rankStyle.text}`}>
                        #{rank}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="flex items-center gap-2 truncate font-semibold">
                        <span className="truncate">{user.name}</span>
                        {getRankIcon()}
                      </h3>
                    </div>

                    <div className="hidden gap-4 text-sm sm:flex sm:gap-6">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Séances</p>
                        <p className="font-bold">{user.totalSessions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Durée</p>
                        <p className="font-bold">{user.totalDuration} min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Calories</p>
                        <p className="font-bold">{user.totalCalories}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
