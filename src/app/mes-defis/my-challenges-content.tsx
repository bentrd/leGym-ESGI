"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/challenge/stats-cards";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { Eye } from "lucide-react";

type ChallengeSession = {
  id: number;
  status: string;
  score: number | null;
  completedAt: Date | null;
  challenge: {
    id: number;
    title: string;
    difficulty: string;
    duration: number | null;
    gym: {
      name: string;
      city: string;
    } | null;
  };
  logs: {
    id: number;
    date: Date;
    duration: number | null;
    calories: number | null;
  }[];
};

type MyChallengesContentProps = {
  challengeSessions: ChallengeSession[];
};

export function MyChallengesContent({ challengeSessions }: MyChallengesContentProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "Pas commencé";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateStats = (logs: ChallengeSession["logs"]) => {
    const totalSessions = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
    return { totalSessions, totalDuration, totalCalories };
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Mes défis</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Suivez vos progrès et enregistrez vos séances
        </p>
      </div>

      {challengeSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Vous n&apos;avez rejoint aucun défi pour le moment
            </p>
            <Button to="/defis">Explorer les défis</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {challengeSessions.map((session) => {
            const stats = calculateStats(session.logs);
            return (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{session.challenge.title}</CardTitle>
                      {session.challenge.gym && (
                        <p className="text-muted-foreground text-sm">
                          {session.challenge.gym.name} - {session.challenge.gym.city}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <DifficultyBadge difficulty={session.challenge.difficulty} />
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusLabel(session.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatsCards
                    totalSessions={stats.totalSessions}
                    totalDuration={stats.totalDuration}
                    totalCalories={stats.totalCalories}
                    variant="compact"
                  />

                  <div className="flex gap-2">
                    <Button
                      to={`/mes-defis/${session.challenge.id}`}
                      color="blue"
                      startIcon={<Eye className="h-4 w-4" />}
                    >
                      Voir détails & ajouter séance
                    </Button>
                    <Button
                      to={`/defis/${session.challenge.id}`}
                      startIcon={<Eye className="h-4 w-4" />}
                    >
                      Voir le défi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
