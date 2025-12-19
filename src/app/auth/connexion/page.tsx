import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSession } from "@/lib/session";
import { LoginPageContent } from "@/components/auth/login-page-content";

export const metadata: Metadata = {
  title: "Connexion | leGym",
  description: "Espace client leGym et accès propriétaire de salle.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return <LoginPageContent />;
}
