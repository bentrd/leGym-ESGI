"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type GymApprovalButtonsProps = {
  gymId: number;
};

export function GymApprovalButtons({ gymId }: GymApprovalButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function handleStatusUpdate(status: "APPROVED" | "REJECTED") {
    setIsLoading(status);

    try {
      const response = await fetch(`/api/admin/gyms/${gymId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      router.push("/admin/salles");
      router.refresh();
    } catch (error) {
      console.error("Failed to update gym status:", error);
      setIsLoading(null);
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        type="button"
        color="green"
        disabled={isLoading !== null}
        onClick={() => handleStatusUpdate("APPROVED")}
        startIcon={
          isLoading === "APPROVED" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )
        }
      >
        Approuver la salle
      </Button>
      <Button
        type="button"
        variant="destructive"
        disabled={isLoading !== null}
        onClick={() => handleStatusUpdate("REJECTED")}
        startIcon={
          isLoading === "REJECTED" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )
        }
      >
        Refuser la salle
      </Button>
    </div>
  );
}
