"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OwnerGymForm } from "@/components/gym/owner-gym-form";
import { GymStatusBadge } from "@/components/gym/gym-status-badge";
import { type GymFormValues } from "@/lib/validators/gym";
import { ChevronRight, Trash2, X } from "lucide-react";

type OwnerGymPanelProps = {
  gym?: { id: number; slug: string; status: string } | null;
  initialStatus: string;
  initialValues: GymFormValues;
};

export function OwnerGymPanel({ gym, initialStatus, initialValues }: OwnerGymPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!gym?.id) return;

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      const res = await fetch("/api/owner/gym", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId: gym.id }),
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/auth/connexion");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeleteError(data?.error ?? "Impossible de supprimer la salle.");
        setIsDeleting(false);
        return;
      }

      router.push("/proprietaire/salle");
      router.refresh();
    } catch (error) {
      console.error("Error deleting gym:", error);
      setDeleteError("Une erreur est survenue.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">Espace propriétaire</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Profil de votre salle</h1>
            <p className="text-muted-foreground text-sm">
              Complétez votre fiche. Une fois validée, elle sera visible pour tous les clients.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GymStatusBadge status={status} />
            {gym?.slug && (
              <Button
                size="sm"
                to={`/salles/${gym.slug}`}
                endIcon={<ChevronRight className="h-4 w-4" />}
              >
                Voir la page
              </Button>
            )}
            {gym?.id && (
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer votre salle</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer définitivement votre salle ? Cette action
                      est irréversible.
                    </DialogDescription>
                  </DialogHeader>
                  {deleteError && <p className="text-destructive text-sm">{deleteError}</p>}
                  <DialogFooter>
                    <Button
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={isDeleting}
                      startIcon={<X className="h-4 w-4" />}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      startIcon={<Trash2 className="h-4 w-4" />}
                    >
                      {isDeleting ? "Suppression..." : "Supprimer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <OwnerGymForm
        initialStatus={status}
        initialValues={initialValues}
        onStatusChange={(next) => setStatus(next)}
      />
    </div>
  );
}
