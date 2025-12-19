"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardCarousel } from "@/components/ui/card-carousel";
import { GymStatusBadge } from "@/components/gym/gym-status-badge";
import { MapPin, Mail, User, Clock, CheckCircle, XCircle } from "lucide-react";

type Gym = {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  description: string | null;
  equipmentSummary: string | null;
  activities: string | null;
  status: string;
  owner?: {
    displayName: string | null;
    email: string | null;
  } | null;
};

type AdminGymsListProps = {
  gyms: Gym[];
};

export function AdminGymsList({ gyms }: AdminGymsListProps) {
  const filteredGyms = gyms.filter((g) => g.status !== "INCOMPLETE");
  const pendingGyms = filteredGyms.filter((g) => g.status === "PENDING");
  const rejectedGyms = filteredGyms.filter((g) => g.status === "REJECTED");

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-blue-300 bg-blue-50/50">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Super admin
            </p>
            <h1 className="text-3xl font-bold">Validation des salles</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Cliquez sur une salle pour voir les détails et approuver ou refuser la demande.
        </p>
      </div>

      {filteredGyms.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm font-medium text-amber-900">En attente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingGyms.length}</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <CardTitle className="text-sm font-medium text-red-900">Refusées</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedGyms.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {pendingGyms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">En attente d&apos;approbation</h2>
          </div>
          <CardCarousel itemCount={pendingGyms.length} surface="white">
            {pendingGyms.map((gym) => (
              <Link key={gym.id} href={`/salles/${gym.id}`} className="block w-85 shrink-0">
                <Card className="group h-full border-amber-200 bg-linear-to-br from-white to-amber-50/30 transition-all hover:border-amber-300 hover:shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold transition-colors group-hover:text-amber-700">
                        {gym.name}
                      </CardTitle>
                      <GymStatusBadge status={gym.status} />
                    </div>
                    <CardDescription className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {gym.owner?.displayName ?? gym.owner?.email ?? "Inconnu"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {gym.city && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="line-clamp-1 font-medium">{gym.city}</span>
                      </div>
                    )}
                    {gym.contactEmail && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="line-clamp-1">{gym.contactEmail}</span>
                      </div>
                    )}
                    {gym.description && (
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                        {gym.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </CardCarousel>
        </div>
      )}

      {rejectedGyms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Salles refusées</h2>
            <Badge className="bg-red-100 text-red-800">{rejectedGyms.length}</Badge>
          </div>
          <CardCarousel itemCount={rejectedGyms.length} surface="white">
            {rejectedGyms.map((gym) => (
              <Link key={gym.id} href={`/salles/${gym.id}`} className="block w-85 shrink-0">
                <Card className="group h-full border-red-200 bg-linear-to-br from-white to-red-50/30 transition-all hover:border-red-300 hover:shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold transition-colors group-hover:text-red-700">
                        {gym.name}
                      </CardTitle>
                      <GymStatusBadge status={gym.status} />
                    </div>
                    <CardDescription className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {gym.owner?.displayName ?? gym.owner?.email ?? "Inconnu"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {gym.city && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 shrink-0 text-red-600" />
                        <span className="line-clamp-1 font-medium">{gym.city}</span>
                      </div>
                    )}
                    {gym.contactEmail && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 shrink-0 text-red-600" />
                        <span className="line-clamp-1">{gym.contactEmail}</span>
                      </div>
                    )}
                    {gym.description && (
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                        {gym.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </CardCarousel>
        </div>
      )}

      {filteredGyms.length === 0 && (
        <Card className="border-dashed">
          <CardHeader className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Aucune salle à valider</CardTitle>
            <CardDescription className="text-base">
              Toutes les demandes ont été traitées. Revenez plus tard pour de nouvelles soumissions.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
