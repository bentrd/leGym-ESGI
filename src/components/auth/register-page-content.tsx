import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleForm } from "@/components/register/role-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roleCopy = {
  client: {
    title: "Client",
    description: "Rejoignez nous pour réserver, suivre vos défis et visiter toutes les salles.",
    cta: "Créer mon compte client",
  },
  owner: {
    title: "Propriétaire de salle",
    description: "Déclarez votre salle franchisée et préparez sa fiche publique.",
    cta: "Créer mon espace propriétaire",
  },
};

export function RegisterPageContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Inscription
        </Badge>
        <h1 className="text-foreground text-3xl font-semibold">Choisissez votre entrée</h1>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Inscription</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions rapides</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/connexion">Aller à la connexion</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/#defis">Voir les défis</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Retour à l&apos;accueil</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="client" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="client">
                Client
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="owner">
                Propriétaire
              </TabsTrigger>
            </TabsList>
            <TabsContent value="client" className="space-y-4">
              <RoleForm
                role="client"
                cta={roleCopy.client.cta}
                description={roleCopy.client.description}
              />
            </TabsContent>
            <TabsContent value="owner" className="space-y-4">
              <RoleForm
                role="owner"
                cta={roleCopy.owner.cta}
                description={roleCopy.owner.description}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-row items-center justify-center border-t px-6 py-4 text-sm">
          <span className="text-muted-foreground">Déjà un compte ?</span>
          <Link className="underline-offset-2 hover:underline" href="/auth/connexion">
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
