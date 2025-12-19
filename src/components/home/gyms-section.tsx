import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GymCarousel } from "@/components/salles/gym-carousel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { domainMeta } from "@/lib/ui/domain-meta";
import type { GymMinimal } from "@/types/gym";
import type { CarouselSurface } from "@/types/colors";

type GymsSectionProps = {
  gyms: GymMinimal[];
  isAuthed: boolean;
  surface?: CarouselSurface;
  title?: string;
  description?: string;
  hideHeader?: boolean;
};

export function GymsSection({
  gyms,
  isAuthed,
  surface = "white",
  title,
  description,
  hideHeader = false,
}: GymsSectionProps) {
  const meta = domainMeta.gyms;
  const displayTitle = title ?? meta.defaultTitle!;
  const displayDescription = description ?? meta.defaultDescription!;

  const action = !isAuthed ? (
    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground text-sm">
      <Link href="/auth/connexion">Voir mon pass</Link>
    </Button>
  ) : undefined;

  return (
    <section id="salles" className="space-y-4">
      {!hideHeader && (
        <SectionHeader
          icon={<meta.icon />}
          title={displayTitle}
          description={displayDescription}
          action={action}
          tone={meta.tone}
        />
      )}
      {gyms.length === 0 ? (
        <Card className="border-white bg-gray-100">
          <CardHeader>
            <CardTitle>Aucune salle publiée pour le moment</CardTitle>
            <CardDescription>
              Les salles du réseau apparaîtront ici dès qu&apos;au moins un propriétaire aura
              complété sa fiche.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <GymCarousel gyms={gyms} surface={surface} />
      )}
    </section>
  );
}
