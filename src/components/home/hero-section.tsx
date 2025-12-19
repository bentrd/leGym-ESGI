import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  isAuthed: boolean;
};

export function HeroSection({ isAuthed }: HeroSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
        <span className="rounded-full border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 px-2.5 py-0.5 text-amber-700 sm:px-3 sm:py-1">
          Pass réseau
        </span>
        <span className="rounded-full border border-cyan-200 bg-linear-to-r from-cyan-50 to-blue-50 px-2.5 py-0.5 text-cyan-700 sm:px-3 sm:py-1">
          Défis en salle
        </span>
        <span className="rounded-full border border-purple-200 bg-linear-to-r from-purple-50 to-pink-50 px-2.5 py-0.5 text-purple-700 sm:px-3 sm:py-1">
          Coach local
        </span>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          <span className="bg-linear-to-r from-amber-600 via-orange-500 to-pink-600 bg-clip-text text-transparent">
            Un pass. Toutes les salles leGym.
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
          Une seule inscription pour passer de Bastille à Confluence sans changer vos habitudes.
          Réservez, suivez vos défis et laissez vos stats se synchroniser automatiquement.
        </p>
      </div>
      {!isAuthed ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button to="/auth/inscription" color="blue" endIcon={<ArrowRight className="h-4 w-4" />}>
            Créer mon compte client
          </Button>
          <Button to="/salles">Découvrir les salles</Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button to="/#defis" color="blue" endIcon={<ArrowRight className="h-4 w-4" />}>
            Voir les défis en cours
          </Button>
          <Button to="/salles">Parcourir les salles</Button>
        </div>
      )}
      <div className="text-muted-foreground grid grid-cols-2 gap-3 text-sm sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border-2 border-orange-200 bg-linear-to-br from-orange-50 to-amber-50 px-3 py-2.5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md sm:px-4 sm:py-3">
          <p className="bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-base font-semibold text-transparent sm:text-lg">
            +120
          </p>
          <p className="text-muted-foreground text-xs">salles franchisées</p>
        </div>
        <div className="rounded-xl border-2 border-cyan-200 bg-linear-to-br from-cyan-50 to-blue-50 px-3 py-2.5 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md sm:px-4 sm:py-3">
          <p className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-base font-semibold text-transparent sm:text-lg">
            24/7
          </p>
          <p className="text-muted-foreground text-xs">check-in mobile</p>
        </div>
        <div className="rounded-xl border-2 border-purple-200 bg-linear-to-br from-purple-50 to-pink-50 px-3 py-2.5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md sm:px-4 sm:py-3">
          <p className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-base font-semibold text-transparent sm:text-lg">
            Hebdo
          </p>
          <p className="text-muted-foreground text-xs">nouveaux défis</p>
        </div>
        <div className="rounded-xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-3 py-2.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md sm:px-4 sm:py-3">
          <p className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-base font-semibold text-transparent sm:text-lg">
            1 compte
          </p>
          <p className="text-muted-foreground text-xs">partout dans le réseau</p>
        </div>
      </div>
    </div>
  );
}
