"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Target } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardCarousel } from "@/components/ui/card-carousel";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { ChallengeCard } from "@/components/challenge/challenge-card";
import { useUser } from "@/contexts/user-context";

import type { ChallengeCardData } from "@/components/challenge/challenge-card";

type Challenge = ChallengeCardData & {
  createdAt: Date;
};

type ChallengesPageContentProps = {
  challenges: Challenge[];
  isAuthed?: boolean;
  myChallenges?: Challenge[];
};

export function ChallengesPageContent({
  challenges,
  isAuthed: isAuthedProp,
  myChallenges,
}: ChallengesPageContentProps) {
  const { user } = useUser();
  const isAuthed = isAuthedProp ?? Boolean(user);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty = !difficultyFilter || challenge.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const difficulties = ["EASY", "MEDIUM", "HARD"];

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "Facile";
      case "MEDIUM":
        return "Moyen";
      case "HARD":
        return "Difficile";
      default:
        return difficulty;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Défis</h1>
          <p className="text-muted-foreground mt-2">
            Découvrez et rejoignez des défis pour progresser
          </p>
        </div>
        {isAuthed && (
          <Button to="/defis/nouveau" color="green" startIcon={<Plus className="h-4 w-4" />}>
            Créer un défi
          </Button>
        )}
      </div>

      <div className="mb-8 space-y-4">
        <Input
          placeholder="Rechercher un défi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant={difficultyFilter === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setDifficultyFilter(null)}
          >
            Tous
          </Button>
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty}
              variant={difficultyFilter === difficulty ? "default" : "ghost"}
              size="sm"
              onClick={() => setDifficultyFilter(difficulty)}
            >
              {getDifficultyLabel(difficulty)}
            </Button>
          ))}
        </div>
      </div>

      {isAuthed && myChallenges && myChallenges.length > 0 && (
        <div className="mb-8">
          <SectionHeader icon={<Trophy />} title="Mes défis" tone="orange" className="mb-4" />
          <CardCarousel itemCount={myChallenges.length} surface="background">
            {myChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/defis/${challenge.id}`}
                className="group shrink-0 scroll-ml-4"
                style={{ scrollSnapAlign: "start" }}
              >
                <ChallengeCard challenge={challenge} className="h-full w-[320px]" />
              </Link>
            ))}
          </CardCarousel>
        </div>
      )}

      <div className="mb-8">
        <SectionHeader icon={<Target />} title="Tous les défis" tone="blue" className="mb-4" />
        {filteredChallenges.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun défi trouvé</CardTitle>
              <CardDescription>
                {searchTerm || difficultyFilter
                  ? "Essayez de modifier vos filtres"
                  : "Soyez le premier à créer un défi !"}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <CardCarousel itemCount={filteredChallenges.length} surface="background">
            {filteredChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/defis/${challenge.id}`}
                className="group shrink-0 scroll-ml-4"
                style={{ scrollSnapAlign: "start" }}
              >
                <ChallengeCard challenge={challenge} className="h-full w-[320px]" />
              </Link>
            ))}
          </CardCarousel>
        )}
      </div>
    </main>
  );
}
