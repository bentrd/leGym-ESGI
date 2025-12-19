import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/app/auth/connexion/login-form";

export function LoginPageContent() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-semibold">Connexion</h1>
        <p className="text-muted-foreground">
          Accédez à votre espace client ou à la gestion de votre salle.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Se connecter à leGym</CardTitle>
          <CardDescription>Clients et propriétaires se connectent ici.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-row items-center justify-center border-t px-6 py-4 text-sm">
          <span className="text-muted-foreground">Nouveau sur leGym ?</span>
          <Link className="underline-offset-2 hover:underline" href="/auth/inscription">
            Créer un compte
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
