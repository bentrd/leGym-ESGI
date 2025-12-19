"use client";

import { redirect } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { CreateChallengeForm } from "./create-challenge-form";

type NewChallengePageClientProps = {
  exerciseTypes: Array<{ id: number; name: string }>;
};

export function NewChallengePageClient({ exerciseTypes }: NewChallengePageClientProps) {
  const { user, profile, isLoading } = useUser();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    redirect("/auth/connexion");
  }

  if (!profile) {
    redirect("/");
  }

  return <CreateChallengeForm exerciseTypes={exerciseTypes} />;
}
