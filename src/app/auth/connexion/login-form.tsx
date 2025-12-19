"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renderError } from "@/components/ui/error-message";
import { useUser } from "@/contexts/user-context";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const { refresh } = useUser();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(undefined);

      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: value.email, password: value.password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          code?: string;
        };

        if (data?.code === "INVALID_EMAIL_OR_PASSWORD") {
          setError("Email ou mot de passe invalide");
        } else {
          setError(data?.error ?? data?.message ?? "Email ou mot de passe invalide");
        }
        return;
      }

      await fetch("/api/profile/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      }).catch(() => null);

      await refresh();

      router.push("/");
      router.refresh();
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor={field.name}>
              Email
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="vous@example.com"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              required
            />
          </div>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col space-y-2">
            <label className="text-foreground text-sm font-medium" htmlFor={field.name}>
              Mot de passe
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.setErrorMap({});
                field.handleChange(e.target.value);
              }}
              required
            />
            <Link
              className="text-muted-foreground self-end text-sm underline-offset-4 hover:underline"
              href="/auth/connexion#reset"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <Button
            className="w-full"
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        )}
      </form.Subscribe>
      {renderError(undefined, error)}
    </form>
  );
}
