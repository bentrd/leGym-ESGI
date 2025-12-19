import { Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CTACardProps = {
  isAuthed: boolean;
};

export function CTACard({ isAuthed }: CTACardProps) {
  return (
    <section id="offres" className="space-y-4">
      <Card className="relative overflow-hidden border-2 border-amber-200 bg-linear-to-br from-white via-amber-50/50 to-orange-50/50 shadow-[0_12px_40px_rgba(251,146,60,0.15)]">
        <div className="absolute -top-10 -left-10 h-40 w-40 opacity-10">
          <svg viewBox="0 0 100 100" className="h-full w-full text-amber-500">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <CardHeader className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="bg-linear-to-r from-amber-600 via-orange-600 to-pink-600 bg-clip-text text-xl font-semibold text-transparent">
              Prêt à utiliser votre pass ?
            </CardTitle>
            <CardDescription>
              Un compte, toutes les salles. Réservations rapides, défis synchronisés, support coach.
            </CardDescription>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Badge variant="outline" startIcon={<Flame className="h-3.5 w-3.5" />}>
              Accès illimité
            </Badge>
            <Badge variant="outline" startIcon={<Clock className="h-3.5 w-3.5" />}>
              Réservations rapides
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground space-y-1 text-sm">
            <p>• Check-in mobile dans toutes les salles</p>
            <p>• Défis et badges synchronisés</p>
            <p>• Support coach depuis l&apos;app</p>
          </div>
          {!isAuthed ? (
            <div className="flex flex-col gap-2 sm:items-end">
              <Button to="/auth/inscription" className="min-w-45">
                Je crée mon compte
              </Button>
              <Button
                variant="ghost"
                to="/auth/connexion"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                J&apos;ai déjà un compte
              </Button>
            </div>
          ) : (
            <Button color="gold" to="/salles">
              Voir les salles
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
