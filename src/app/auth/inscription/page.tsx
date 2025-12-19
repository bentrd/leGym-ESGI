import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSession } from "@/lib/session";
import { RegisterPageContent } from "@/components/auth/register-page-content";

export const metadata: Metadata = {
  title: "Inscription | leGym",
  description: "Créer un compte client ou enregistrer votre salle franchisée.",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/");

  return <RegisterPageContent />;
}
