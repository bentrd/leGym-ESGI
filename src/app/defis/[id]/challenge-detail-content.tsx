"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBadgeColor } from "@/lib/badge-colors";
import { ScrollableBadges } from "@/components/ui/scrollable-badges";
import { ShareButton } from "@/components/challenge/share-button";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/challenge/stats-cards";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Clock, Target, Users, ChevronLeft, Edit, Activity } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { useUser } from "@/contexts/user-context";

type Participant = {
  id: number;
  displayName: string | null;
};

type MyParticipation = {
  status: string;
  stats: {
    totalSessions: number;
    totalDuration: number;
    totalCalories: number;
  };
};

type Challenge = {
  id: number;
  title: string;
  description: string | null;
  goals: string | null;
  difficulty: string;
  duration: number | null;
  recommendedExercises: string | null;
  relatedEquipment: string | null;
  createdAt: Date;
  creator: {
    id: number;
    displayName: string | null;
    email: string | null;
  };
  gym: {
    name: string;
    slug: string;
    city: string;
  } | null;
};

type ChallengeDetailContentProps = {
  challenge: Challenge;
  isAuthed?: boolean;
  userHasJoined: boolean;
  participantCount: number;
  canEdit?: boolean;
  exerciseTypes: { id: number; name: string }[];
  participants: Participant[];
  myParticipation: MyParticipation | null;
};

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Non commencé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
};

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-800 border-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
};

export function ChallengeDetailContent({
  challenge,
  isAuthed: isAuthedProp,
  userHasJoined,
  participantCount,
  canEdit: canEditProp,
  exerciseTypes,
  participants,
  myParticipation,
}: ChallengeDetailContentProps) {
  const router = useRouter();
  const { user, profile } = useUser();
  const isAuthed = isAuthedProp ?? Boolean(user);
  const canEdit =
    canEditProp ??
    (profile ? profile.role === "SUPER_ADMIN" || profile.id === challenge.creator.id : false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const handleJoin = async () => {
    if (!isAuthed) {
      router.push("/auth/connexion");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/challenges/${challenge.id}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to join challenge");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsJoining(false);
    }
  };

  const parseList = (value: string | null) => {
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const equipment = parseList(challenge.relatedEquipment);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" to="/defis" startIcon={<ChevronLeft className="h-4 w-4" />}>
          Retour aux défis
        </Button>
        <div className="flex gap-2">
          <ShareButton challengeId={challenge.id} title={challenge.title} />
          {canEdit && (
            <Button
              size="sm"
              to={`/defis/${challenge.id}/modifier`}
              startIcon={<Edit className="h-4 w-4" />}
            >
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <DifficultyBadge difficulty={challenge.difficulty} />
              {challenge.duration && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {challenge.duration} jours
                </div>
              )}
              <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
                <DialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors hover:underline">
                    <Users className="h-4 w-4" />
                    {participantCount} participant{participantCount > 1 ? "s" : ""}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Participants ({participantCount})</DialogTitle>
                  </DialogHeader>
                  {participants.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      Aucun participant pour le moment.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {participants.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/profil/${p.id}`}
                            className="text-primary hover:underline"
                            onClick={() => setIsParticipantsOpen(false)}
                          >
                            {p.displayName || "Utilisateur anonyme"}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <CardTitle className="text-3xl">{challenge.title}</CardTitle>
            <p className="text-muted-foreground">
              Par{" "}
              <Link
                href={`/profil/${challenge.creator.id}`}
                className="text-primary hover:underline"
              >
                {challenge.creator.displayName || challenge.creator.email}
              </Link>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenge.description && (
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="text-muted-foreground">{challenge.description}</p>
              </div>
            )}

            {challenge.goals && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <Target className="h-5 w-5" />
                  Objectifs
                </h3>
                <p className="text-muted-foreground">{challenge.goals}</p>
              </div>
            )}

            {challenge.gym && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <MapPin className="h-5 w-5" />
                  Salle de sport
                </h3>
                <Link
                  href={`/salles/${challenge.gym.slug}`}
                  className="text-primary hover:underline"
                >
                  {challenge.gym.name} - {challenge.gym.city}
                </Link>
              </div>
            )}

            {exerciseTypes.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <Activity className="h-5 w-5" />
                  Types d&apos;exercices
                </h3>
                <ScrollableBadges itemCount={exerciseTypes.length}>
                  {exerciseTypes.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${getBadgeColor(exercise.name)}`}
                    >
                      {exercise.name}
                    </div>
                  ))}
                </ScrollableBadges>
              </div>
            )}

            {equipment.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Équipements liés</h3>
                <ScrollableBadges itemCount={equipment.length}>
                  {equipment.map((item, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors select-none ${getBadgeColor(item)}`}
                    >
                      {item}
                    </div>
                  ))}
                </ScrollableBadges>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}
            {userHasJoined && myParticipation ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-muted-foreground text-sm">Votre participation :</span>
                  <Badge
                    className={statusColors[myParticipation.status] || statusColors.NOT_STARTED}
                  >
                    {statusLabels[myParticipation.status] || myParticipation.status}
                  </Badge>
                </div>
                <StatsCards
                  variant="compact"
                  totalSessions={myParticipation.stats.totalSessions}
                  totalDuration={myParticipation.stats.totalDuration}
                  totalCalories={myParticipation.stats.totalCalories}
                />
                <div className="text-center">
                  <Button to={`/mes-defis/${challenge.id}`} color="blue">
                    Accéder à mon suivi
                  </Button>
                </div>
              </div>
            ) : userHasJoined ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Vous participez déjà à ce défi !</p>
                <Button to={`/mes-defis/${challenge.id}`} color="blue">
                  Accéder à mon suivi
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Prêt à relever ce défi ?</p>
                <Button size="lg" onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? "Inscription..." : "Rejoindre le défi"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
