"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { gymSchema, normalizeGymPayload, type GymFormValues } from "@/lib/validators/gym";
import { renderError } from "../ui/error-message";
import { Loader2, Save, Send } from "lucide-react";

type OwnerGymFormProps = {
  initialValues: GymFormValues;
  initialStatus?: string;
  onStatusChange?: (status: string) => void;
  gymId?: number;
  restrictEditsAfterSubmission?: boolean;
  editableWhenRestricted?: (keyof GymFormValues)[];
  canEditLockedFields?: boolean;
  onSuccess?: (gym: { status?: string; slug?: string; id?: number }) => void;
};

const textareaClass =
  "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function OwnerGymForm({
  initialValues,
  initialStatus,
  onStatusChange,
  gymId,
  restrictEditsAfterSubmission = false,
  editableWhenRestricted = ["equipmentSummary", "activities", "description"],
  canEditLockedFields = false,
  onSuccess,
}: OwnerGymFormProps) {
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();
  const effectiveStatus = status ?? initialStatus ?? "INCOMPLETE";
  const isRestrictedEdit =
    restrictEditsAfterSubmission && !canEditLockedFields && effectiveStatus !== "INCOMPLETE";
  const isFieldLocked = (field: keyof GymFormValues) =>
    isRestrictedEdit && !editableWhenRestricted.includes(field);

  const form = useForm({
    defaultValues: {
      name: initialValues.name ?? "",
      city: initialValues.city ?? "",
      address: initialValues.address ?? "",
      postcode: initialValues.postcode ?? "",
      latitude: initialValues.latitude,
      longitude: initialValues.longitude,
      contactEmail: initialValues.contactEmail ?? "",
      contactPhone: initialValues.contactPhone ?? "",
      description: initialValues.description ?? "",
      equipmentSummary: initialValues.equipmentSummary ?? "",
      activities: initialValues.activities ?? "",
    },
    onSubmit: async ({ value, formApi }) => {
      setError(undefined);
      setSuccess(undefined);

      const parsed = gymSchema.safeParse(value);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setError(issue?.message ?? "Formulaire invalide");
        return;
      }

      const payload = normalizeGymPayload(parsed.data);

      const res = await fetch("/api/owner/gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(gymId ? { gymId } : {}),
        }),
        credentials: "include",
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        gym?: { status?: string; slug?: string; id?: number };
      };

      if (res.status === 401) {
        router.push("/auth/connexion");
        return;
      }

      if (!res.ok) {
        setError(data?.error ?? data?.message ?? "Impossible d'enregistrer la salle.");
        return;
      }

      const nextStatus = data?.gym?.status ?? status;
      setStatus(nextStatus);
      if (nextStatus) onStatusChange?.(nextStatus);
      if (data?.gym) onSuccess?.(data.gym);
      formApi.reset({
        ...payload,
        postcode: payload.postcode ?? "",
      });
      router.refresh();
      setSuccess("Salle enregistrée. Nous la passerons en revue rapidement.");
    },
    onSubmitInvalid: () => {
      setError(undefined);
      setSuccess(undefined);
    },
  });

  return (
    <form
      className="space-y-6 rounded-xl border border-white bg-gray-100 p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
    >
      {isRestrictedEdit ? (
        <div className="bg-muted/60 text-muted-foreground rounded-lg px-3 py-2 text-xs leading-relaxed">
          Certaines informations (nom, ville, adresse, contacts) sont verrouillées après la
          soumission. Contactez un administrateur si vous devez les modifier.
        </div>
      ) : null}

      <form.Field
        name="name"
        validators={{
          onBlur: gymSchema.shape.name,
          onSubmit: gymSchema.shape.name,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor="name">
              Nom de la salle <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              required
              value={field.state.value}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
              placeholder="leGym Bastille"
              disabled={isFieldLocked("name")}
            />
            {renderError(field.state.meta)}
          </div>
        )}
      </form.Field>

      <form.Field
        name="address"
        validators={{
          onBlur: gymSchema.shape.address,
          onSubmit: gymSchema.shape.address,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor="address">
              Adresse <span className="text-destructive">*</span>
            </label>
            <AddressAutocomplete
              id="address"
              name="address"
              required
              value={field.state.value}
              onChange={(value) => {
                field.setErrorMap({});
                field.handleChange(value);
              }}
              onAddressSelect={(data) => {
                form.setFieldValue("address", data.address);
                form.setFieldValue("city", data.city);
                form.setFieldValue("postcode", data.postcode);
                form.setFieldValue("latitude", data.coordinates[0]);
                form.setFieldValue("longitude", data.coordinates[1]);

                const cityField = form.getFieldInfo("city");
                if (cityField) {
                  form.setFieldMeta("city", (prev) => ({
                    ...prev,
                    errorMap: {},
                  }));
                }
              }}
              onBlur={field.handleBlur}
              placeholder="Tapez une adresse française..."
              disabled={isFieldLocked("address")}
            />
            {renderError(field.state.meta)}
            {form.state.values.postcode && form.state.values.city ? (
              <p className="text-muted-foreground text-xs">
                📍 {form.state.values.postcode} {form.state.values.city}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Commencez à taper et sélectionnez une adresse pour remplir automatiquement le code
                postal, la ville et les coordonnées GPS
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="contactEmail"
          validators={{
            onBlur: gymSchema.shape.contactEmail,
            onSubmit: gymSchema.shape.contactEmail,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="contactEmail">
                Email de contact <span className="text-destructive">*</span>
              </label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                value={field.state.value}
                onChange={(e) => {
                  field.setErrorMap({});
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                placeholder="contact@salle.com"
                disabled={isFieldLocked("contactEmail")}
              />
              {renderError(field.state.meta)}
            </div>
          )}
        </form.Field>

        <form.Field name="contactPhone">
          {(field) => (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="contactPhone">
                Téléphone
              </label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={field.state.value ?? ""}
                onChange={(e) => {
                  field.setErrorMap({});
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                placeholder="+33 6 12 34 56 78"
                disabled={isFieldLocked("contactPhone")}
              />
              {renderError(field.state.meta)}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="equipmentSummary"
          validators={{
            onBlur: gymSchema.shape.equipmentSummary,
            onSubmit: gymSchema.shape.activities,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="equipmentSummary">
                Équipements principaux <span className="text-destructive">*</span>
              </label>
              <textarea
                id="equipmentSummary"
                name="equipmentSummary"
                className={textareaClass}
                value={field.state.value ?? ""}
                onChange={(e) => {
                  field.setErrorMap({});
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                placeholder="zone free weight, machines Technogym, sauna, espace mobilité..."
                disabled={isFieldLocked("equipmentSummary")}
              />
              {renderError(field.state.meta) ?? (
                <p className="text-muted-foreground text-xs">
                  Séparez par des virgules ou des retours à la ligne.
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="activities"
          validators={{
            onBlur: gymSchema.shape.activities,
            onSubmit: gymSchema.shape.activities,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="activities">
                Activités proposées <span className="text-destructive">*</span>
              </label>
              <textarea
                id="activities"
                name="activities"
                className={textareaClass}
                value={field.state.value ?? ""}
                onChange={(e) => {
                  field.setErrorMap({});
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
                placeholder="aquagym, cycling, boxe, yoga..."
                disabled={isFieldLocked("activities")}
              />
              {renderError(field.state.meta) ?? (
                <p className="text-muted-foreground text-xs">
                  Séparez par des virgules ou des retours à la ligne.
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="description"
        validators={{
          onBlur: gymSchema.shape.description,
          onSubmit: gymSchema.shape.description,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor="description">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={textareaClass}
              required
              value={field.state.value ?? ""}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
              placeholder="Décrivez l'expérience dans votre salle, le staff, les services..."
              disabled={isFieldLocked("description")}
            />
            {renderError(field.state.meta)}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.isSubmitting, state.isDefaultValue, state.canSubmit]}
      >
        {([isSubmitting, isDefaultValue, canSubmit]) => (
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isDefaultValue || !canSubmit || isSubmitting}
              className="min-w-40"
              color="green"
              startIcon={
                isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : effectiveStatus === "INCOMPLETE" ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )
              }
            >
              {isSubmitting
                ? "Enregistrement..."
                : effectiveStatus === "INCOMPLETE"
                  ? "Postuler"
                  : "Enregistrer les modifications"}
            </Button>
            {status === "PENDING" ? (
              <p className="text-muted-foreground text-sm">
                Une fois complète, votre fiche sera soumise à l&apos;approbation du siège.
              </p>
            ) : null}
          </div>
        )}
      </form.Subscribe>

      {success ? <p className="text-foreground text-sm font-medium">{success}</p> : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </form>
  );
}
