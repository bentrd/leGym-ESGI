import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Mail, MapPin, Pencil, Phone, Trash2, LogOut } from "lucide-react";
import { getBadgeColor } from "@/lib/badge-colors";
import { tagList } from "@/lib/constants";

import { GymApprovalButtons } from "@/components/gym/gym-approval-buttons";
import { OwnerGymForm } from "@/components/gym/owner-gym-form";
import { GymStatusBadge } from "@/components/gym/gym-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/server/db";

async function deleteGym(formData: FormData) {
  "use server";
  const gymId = Number(formData.get("gymId"));
  if (!Number.isFinite(gymId)) return;

  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/connexion");
  const profile = await getUserProfile(session.user.id);
  if (!profile || profile.role !== "SUPER_ADMIN") redirect("/");

  await prisma.gym.delete({ where: { id: gymId } });
  revalidatePath("/salles");
  revalidatePath("/admin/salles");
  redirect("/admin/salles");
}

type GymDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GymDetailPage(props: GymDetailPageProps) {
  const { slug: rawSlug } = await props.params;
  const searchParams = (props.searchParams ? await props.searchParams : {}) ?? {};
  const slugOrId = decodeURIComponent(rawSlug ?? "").trim();
  if (!slugOrId) notFound();

  const gymId = parseInt(slugOrId, 10);
  const gym = isNaN(gymId)
    ? await prisma.gym.findUnique({ where: { slug: slugOrId } })
    : await prisma.gym.findUnique({ where: { id: gymId } });

  if (!gym) {
    notFound();
  }

  const session = await getSession();
  const profile = session?.user?.id ? await getUserProfile(session.user.id) : null;
  const isSuperAdmin = profile?.role === "SUPER_ADMIN";
  const isOwner = profile?.id === gym.ownerId;
  const canEdit = isSuperAdmin || isOwner;

  const editParam =
    typeof searchParams.edit === "string"
      ? searchParams.edit
      : Array.isArray(searchParams.edit)
        ? searchParams.edit[0]
        : undefined;

  const forceEdit = isOwner && gym.status === "INCOMPLETE";
  const isEditing = forceEdit || editParam === "1";

  const activities = tagList(gym.activities);
  const equipments = tagList(gym.equipmentSummary);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full space-y-2">
            <h1 className="text-3xl font-semibold">{gym.name}</h1>
            {gym.city ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{gym.city}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <GymStatusBadge status={gym.status} />
              {gym.status === "INCOMPLETE" ? (
                <p className="text-muted-foreground text-xs">
                  Fiche à compléter avant publication.
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {canEdit && isSuperAdmin && (
              <form action={deleteGym}>
                <input type="hidden" name="gymId" value={gym.id} />
                <Button
                  type="submit"
                  color="red"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </form>
            )}
            {canEdit && isEditing && !forceEdit && (
              <Button
                to={`/salles/${gym.slug}`}
                startIcon={<LogOut className="h-4 w-4" />}
                size="sm"
                className="justify-between"
              >
                Quitter
              </Button>
            )}
            {canEdit && !isEditing && (
              <Button
                to={`/salles/${gym.slug}?edit=1`}
                color="grey"
                size="sm"
                startIcon={<Pencil className="h-4 w-4" />}
              >
                Modifier
              </Button>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <OwnerGymForm
          gymId={gym.id}
          initialStatus={gym.status}
          restrictEditsAfterSubmission={isOwner}
          canEditLockedFields={Boolean(isSuperAdmin)}
          initialValues={{
            name: gym.name ?? "",
            city: gym.city ?? "",
            address: gym.address ?? "",
            contactEmail: gym.contactEmail ?? "",
            contactPhone: gym.contactPhone ?? "",
            description: gym.description ?? "",
            equipmentSummary: gym.equipmentSummary ?? "",
            activities: gym.activities ?? "",
          }}
        />
      ) : (
        <div className="space-y-6">
          <Card className="relative">
            <CardHeader className="space-y-2">
              <CardTitle>Description</CardTitle>
              <CardDescription>
                {gym.description ?? "La description de cette salle sera bientôt disponible."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Activités proposées</p>
                  <div className="flex flex-wrap gap-2">
                    {activities.map((activity) => (
                      <Badge key={activity} variant="outline" className={getBadgeColor(activity)}>
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {equipments.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Équipements principaux</p>
                  <div className="flex flex-wrap gap-2">
                    {equipments.map((item) => (
                      <Badge key={item} variant="outline" className={getBadgeColor(item)}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                {gym.address ? (
                  <div className="text-sm">
                    <p className="text-foreground font-medium">Adresse</p>
                    <a
                      className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gym.address}, ${gym.city}`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {gym.address}, {gym.city}
                    </a>
                  </div>
                ) : null}
                {gym.contactEmail ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a className="hover:text-foreground" href={`mailto:${gym.contactEmail}`}>
                      {gym.contactEmail}
                    </a>
                  </div>
                ) : null}
                {gym.contactPhone ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <a className="hover:text-foreground" href={`tel:${gym.contactPhone}`}>
                      {gym.contactPhone}
                    </a>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {isSuperAdmin && gym.status === "PENDING" && (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader>
                <CardDescription>
                  Cette salle est en attente d&apos;approbation. Validez ou refusez la demande.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GymApprovalButtons gymId={gym.id} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
