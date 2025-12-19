import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesCard() {
  return (
    <Card className="relative h-full overflow-hidden border-orange-200 bg-linear-to-br from-white via-amber-50/50 to-orange-50/50 shadow-[0_10px_30px_rgba(251,146,60,0.15)]">
      <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 opacity-10">
        <svg viewBox="0 0 100 100" className="h-full w-full text-orange-500">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>
      </div>
      <CardHeader className="relative space-y-3">
        <CardTitle className="bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-lg text-transparent">
          Ce que vous débloquez
        </CardTitle>
        <CardDescription>Une expérience uniforme, quel que soit le club.</CardDescription>
      </CardHeader>
      <CardContent className="text-foreground relative space-y-3 text-sm">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-orange-200 bg-linear-to-r from-orange-50 to-transparent px-3 py-2">
          <div>
            <p className="text-foreground text-sm font-medium">Accès réseau</p>
            <p className="text-muted-foreground text-sm">
              Check-in avec votre pass dans chaque salle.
            </p>
          </div>
          <Check className="h-4 w-4 text-orange-600" />
        </div>
        <div className="flex items-start justify-between gap-3 rounded-lg border border-cyan-200 bg-linear-to-r from-cyan-50 to-transparent px-3 py-2">
          <div>
            <p className="text-foreground text-sm font-medium">Défis locaux</p>
            <p className="text-muted-foreground text-sm">
              Programmes créés par les coachs du club que vous choisissez.
            </p>
          </div>
          <Check className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="flex items-start justify-between gap-3 rounded-lg border border-purple-200 bg-linear-to-r from-purple-50 to-transparent px-3 py-2">
          <div>
            <p className="text-foreground text-sm font-medium">Suivi centralisé</p>
            <p className="text-muted-foreground text-sm">
              Réservations, stats et badges au même endroit.
            </p>
          </div>
          <Check className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 px-3 py-2 text-amber-900">
          Propriétaires : enregistrez votre salle et publiez vos défis depuis le même espace.
        </div>
      </CardContent>
    </Card>
  );
}
