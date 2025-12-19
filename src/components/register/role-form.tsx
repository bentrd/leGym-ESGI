"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renderError } from "../ui/error-message";
import { REQUIRED_FIELD } from "@/lib/validators/constants";
import { useUser } from "@/contexts/user-context";

type Role = "owner" | "client";

type RoleFormProps = {
  role: Role;
  cta: string;
  description: string;
};

type FormState = {
  role: Role;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gymName?: string;
};

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Ajoutez une lettre majuscule")
  .regex(/[0-9]/, "Ajoutez un chiffre");

const baseSchema = z.object({
  role: z.enum(["owner", "client"]),
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: passwordSchema,
  confirmPassword: z.string(),
  gymName: z.string().optional(),
});

const buildSchema = (role: Role) =>
  baseSchema.superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Les mots de passe ne correspondent pas",
      });
    }
    if (role === "owner" && (!data.gymName || data.gymName.trim().length < 2)) {
      ctx.addIssue({
        code: "custom",
        path: ["gymName"],
        message: REQUIRED_FIELD,
      });
    }
  });

export function RoleForm({ role, cta, description }: RoleFormProps) {
  const [success, setSuccess] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const router = useRouter();
  const { refresh } = useUser();

  const defaultValues: FormState = {
    role,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gymName: role === "owner" ? "" : undefined,
  };

  const schema = buildSchema(role);
  const fieldSchema = baseSchema.shape;

  const form = useForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setSuccess(undefined);
      setSubmitError(undefined);
      const payload = { email: value.email, password: value.password, name: value.name };
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        setSubmitError(data?.error ?? data?.message ?? "Impossible de créer le compte.");
        return;
      }
      const provision = await fetch("/api/profile/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: value.role, gymName: value.gymName }),
      });
      if (!provision.ok) {
        const data = (await provision.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setSubmitError(data?.error ?? data?.message ?? "Compte créé, profil incomplet.");
        return;
      }
      await refresh();

      const destination = value.role === "owner" ? "/proprietaire/salle" : "/";
      router.push(destination);
      router.refresh();
      setSuccess("Compte créé, vous êtes connecté.");
    },
    onSubmitInvalid: () => {
      setSuccess(undefined);
      setSubmitError(undefined);
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
    >
      <div className="space-y-2">
        <form.Field
          name="name"
          validators={{ onBlur: fieldSchema.name, onSubmit: fieldSchema.name }}
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor={`${role}-name`}>
                Nom complet <span className="text-destructive">*</span>
              </label>
              <Input
                id={`${role}-name`}
                name="name"
                autoComplete="name"
                required
                value={field.state.value}
                onChange={(e) => {
                  field.setErrorMap({});
                  field.handleChange(e.target.value);
                }}
                onBlur={field.handleBlur}
              />
              {renderError(field.state.meta)}
            </div>
          )}
        </form.Field>
      </div>

      {role === "owner" ? (
        <form.Field
          name="gymName"
          validators={{
            onBlur: z.string().min(2, REQUIRED_FIELD),
            onSubmit: z.string().min(2, REQUIRED_FIELD),
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="gym-name">
                Nom de la salle <span className="text-destructive">*</span>
              </label>
              <Input
                id="gym-name"
                name="gymName"
                required
                value={field.state.value ?? ""}
                onChange={(e) => {
                  field.setErrorMap({});
                  {
                    field.setErrorMap({});
                    field.handleChange(e.target.value);
                  }
                }}
                onBlur={field.handleBlur}
              />
              {renderError(field.state.meta)}
            </div>
          )}
        </form.Field>
      ) : null}

      <form.Field
        name="email"
        validators={{ onBlur: fieldSchema.email, onSubmit: fieldSchema.email }}
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor={`${role}-email`}>
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id={`${role}-email`}
              name="email"
              type="email"
              placeholder="vous@example.com"
              autoComplete="email"
              required
              value={field.state.value}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
            />
            {renderError(field.state.meta)}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onBlur: fieldSchema.password, onSubmit: fieldSchema.password }}
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor={`${role}-password`}>
              Mot de passe <span className="text-destructive">*</span>
            </label>
            <Input
              id={`${role}-password`}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={field.state.value}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
            />
            {renderError(field.state.meta) ?? (
              <p className="text-muted-foreground text-xs">
                8 caractères minimum, inclure au moins une majuscule et un chiffre.
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="confirmPassword"
        validators={{
          onBlur: ({ value, fieldApi }) =>
            value === (fieldApi.form.state.values as FormState).password
              ? undefined
              : "Les mots de passe ne correspondent pas",
          onSubmit: ({ value, fieldApi }) =>
            value === (fieldApi.form.state.values as FormState).password
              ? undefined
              : "Les mots de passe ne correspondent pas",
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor={`${role}-confirm`}>
              Confirmer le mot de passe <span className="text-destructive">*</span>
            </label>
            <Input
              id={`${role}-confirm`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={field.state.value}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              onBlur={field.handleBlur}
            />
            {renderError(field.state.meta)}
          </div>
        )}
      </form.Field>

      <div className="bg-muted/40 text-muted-foreground flex flex-col rounded-lg p-3 text-sm">
        {description}
      </div>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <Button
            className="w-full"
            type="submit"
            color="green"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isSubmitting ? "Création..." : cta}
          </Button>
        )}
      </form.Subscribe>

      {success ? <p className="text-secondary-foreground text-sm font-medium">{success}</p> : null}
      {submitError ? <p className="text-destructive text-sm font-medium">{submitError}</p> : null}
    </form>
  );
}
