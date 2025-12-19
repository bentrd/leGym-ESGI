"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RankBadge } from "@/components/ui/rank-badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ChevronDown, Unplug, User } from "lucide-react";
import { useUser } from "@/contexts/user-context";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  rank?: number;
  profileId?: number;
  className?: string;
};

export function UserMenu({ name, email, rank, profileId, className }: UserMenuProps) {
  const label = name || email || "Compte";
  const router = useRouter();
  const { refresh } = useUser();
  const [pending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      await refresh();
      router.refresh();
    });
  };

  return (
    <div className={cn("w-full max-w-70 min-w-40", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "group border-border bg-muted text-foreground flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm shadow-sm transition",
              "hover:bg-muted/80 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "data-[state=open]:rounded-br-none data-[state=open]:rounded-bl-none data-[state=open]:border-b-0",
            )}
            aria-label="Ouvrir le menu utilisateur"
          >
            <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
              {rank ? (
                <RankBadge rank={rank} size="sm" className="shrink-0" />
              ) : (
                <span className="inline-flex h-2 w-2 shrink-0 rounded-xl bg-green-500" />
              )}
              <span className="truncate font-medium">{label}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-border bg-muted -mt-px overflow-hidden rounded-t-none rounded-b-md border"
          style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
          sideOffset={0}
        >
          {profileId && (
            <>
              <DropdownMenuItem
                asChild
                className="bg-background hover:bg-background/70 focus:bg-background/70 flex w-full items-center justify-start gap-2 rounded-md p-2 focus:outline-none"
              >
                <Link href={`/profil/${profileId}`}>
                  <User className="h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleSignOut();
            }}
            disabled={pending}
            className="flex w-full flex-row flex-nowrap items-center justify-start gap-2 rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-700 focus:bg-red-100 focus:text-red-700 focus:outline-red-600"
          >
            <Unplug className="h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
