"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthButtonsProps = {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  loginClassName?: string;
  signupClassName?: string;
  variant?: "horizontal" | "vertical";
};

export function AuthButtons({
  onLoginClick,
  onSignupClick,
  loginClassName,
  signupClassName,
  variant = "horizontal",
}: AuthButtonsProps) {
  const isVertical = variant === "vertical";
  return (
    <div className={isVertical ? "flex flex-col gap-2" : "flex flex-row items-center gap-2"}>
      <Button
        to="/auth/connexion"
        size="sm"
        color="blue"
        onClick={onLoginClick}
        className={isVertical ? "w-full" : loginClassName}
      >
        Se connecter
      </Button>
      <Button
        variant="ghost"
        to="/auth/inscription"
        onClick={onSignupClick}
        className={cn(
          "text-muted-foreground hover:text-foreground text-sm",
          isVertical ? "w-full justify-start" : signupClassName || "",
        )}
        startIcon={<UserPlus className="h-4 w-4" />}
      >
        <span className="hidden sm:inline">Créer un compte</span>
        <span className="sm:hidden">Inscription</span>
      </Button>
    </div>
  );
}
