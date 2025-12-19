"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RankBadge } from "@/components/ui/rank-badge";
import { ChallengesSection } from "@/components/home/challenges-section";
import { GymsSection } from "@/components/home/gyms-section";
import { StatsCards } from "@/components/challenge/stats-cards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, MapPin } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { ProfileBadgesSection } from "@/components/profile/profile-badges-section";

type ProfileContentProps = {
  profile: {
    id: number;
    displayName: string | null;
    email: string | null;
    bio: string | null;
    city: string | null;
    showTopGyms: boolean;
    showBadges: boolean;
    role: string;
  };
  isOwnProfile?: boolean;
  badges: Array<{
    id: number;
    name: string;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
    awardedAt: Date;
    rewardRule?: string;
  }>;
  topGyms: Array<{
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
  }>;
  recentSessions: Array<{
    id: number;
    challengeId: number;
    challengeTitle: string;
    status: string;
    completedAt: Date | null;
    gymName?: string | null;
  }>;
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
  stats: {
    totalSessions: number;
    totalLogs: number;
    totalDuration: number;
    totalCalories: number;
    rank?: number;
  };
};

export function ProfileContent({
  profile,
  isOwnProfile: isOwnProfileProp,
  badges,
  topGyms,
  challenges,
  stats,
}: ProfileContentProps) {
  const router = useRouter();
  const { profile: currentUserProfile } = useUser();
  const isOwnProfile = isOwnProfileProp ?? currentUserProfile?.id === profile.id;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [editData, setEditData] = useState({
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    city: profile.city || "",
    showTopGyms: profile.showTopGyms,
    showBadges: profile.showBadges,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setIsEditDialogOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = profile.displayName || profile.email || "Utilisateur";

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Card className="mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex-1 space-y-2 sm:space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold sm:text-3xl">{displayName}</h1>
                {stats.rank && <RankBadge rank={stats.rank} size="lg" />}
              </div>

              {profile.city && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.city}</span>
                </div>
              )}

              {profile.bio && (
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {isOwnProfile && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" startIcon={<Edit className="h-4 w-4" />}>
                    Modifier le profil
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Modifier mon profil</DialogTitle>
                    <DialogDescription>
                      Personnalisez votre profil public et gérez vos préférences d&apos;affichage
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="displayName" className="text-sm font-medium">
                        Nom d&apos;affichage
                      </label>
                      <Input
                        id="displayName"
                        value={editData.displayName}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        Ville
                      </label>
                      <Input
                        id="city"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        placeholder="Paris"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">
                        Bio (max 500 caractères)
                      </label>
                      <textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Parlez-nous de vous..."
                        maxLength={500}
                        rows={4}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <p className="text-muted-foreground text-xs">
                        {editData.bio.length}/500 caractères
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Préférences d&apos;affichage</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="showTopGyms"
                          checked={editData.showTopGyms}
                          onChange={(e) =>
                            setEditData({ ...editData, showTopGyms: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="showTopGyms" className="text-sm">
                          Afficher mes salles favorites
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="showBadges"
                          checked={editData.showBadges}
                          onChange={(e) =>
                            setEditData({ ...editData, showBadges: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="showBadges" className="text-sm">
                          Afficher mes badges
                        </label>
                      </div>
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} color="green">
                      {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <StatsCards
          completedChallenges={stats.totalSessions}
          totalSessions={stats.totalLogs}
          totalDuration={stats.totalDuration}
          totalCalories={stats.totalCalories}
        />
      </div>

      <div className="flex flex-col gap-6">
        {profile.showTopGyms && topGyms.length > 0 && (
          <Card className="p-5">
            <GymsSection
              gyms={topGyms}
              isAuthed={true}
              surface="white"
              title="Salles favorites"
              description="Mes salles les plus fréquentées"
            />
          </Card>
        )}

        {profile.showBadges && <ProfileBadgesSection badges={badges} />}
      </div>

      {challenges.length > 0 && (
        <Card className="mt-6 p-5">
          <ChallengesSection
            challenges={challenges}
            title="Défis"
            description="Les défis auxquels ce membre a participé"
            hideButton
          />
        </Card>
      )}
    </main>
  );
}
