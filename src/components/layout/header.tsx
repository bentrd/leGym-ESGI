"use client";

import Link from "next/link";

import {
  BowArrow,
  Building2,
  CircleCheckBig,
  Dumbbell,
  HandCoins,
  SquareStar,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { AuthButtons } from "@/components/layout/auth-buttons";
import { NavCarousel, type NavItem } from "@/components/layout/nav-carousel";
import { useUser } from "@/contexts/user-context";
import { ButtonColors } from "@/types/colors";
import type { Role } from "@/lib/constants";

const navByRole: Record<Role | "GUEST", NavItem[]> = {
  GUEST: [
    {
      label: "Offres",
      href: "/#offres",
      icon: <HandCoins />,
      color: ButtonColors.YELLOW,
    },
    {
      label: "Salles",
      href: "/salles",
      icon: <Dumbbell />,
      color: ButtonColors.BLUE,
    },
    {
      label: "Défis",
      href: "/defis",
      icon: <Swords />,
      color: ButtonColors.RED,
    },
  ],
  CLIENT: [
    {
      label: "Salles",
      href: "/salles",
      icon: <Dumbbell />,
      color: ButtonColors.BLUE,
    },
    {
      label: "Défis",
      href: "/defis",
      icon: <Swords />,
      color: ButtonColors.RED,
    },
    {
      label: "Classement",
      href: "/classement",
      icon: <Trophy />,
      color: ButtonColors.AMBER,
    },
    {
      label: "Badges",
      href: "/client/badges",
      icon: <SquareStar />,
      color: ButtonColors.GOLD,
    },
  ],
  GYM_OWNER: [
    {
      label: "Ma salle",
      href: "/proprietaire/salle",
      icon: <Building2 />,
      color: ButtonColors.GREEN,
    },
    {
      label: "Salles",
      href: "/salles",
      icon: <Dumbbell />,
      color: ButtonColors.BLUE,
    },
    {
      label: "Défis",
      href: "/defis",
      icon: <Swords />,
      color: ButtonColors.RED,
    },
  ],
  SUPER_ADMIN: [
    {
      label: "Validation salles",
      href: "/admin/salles",
      icon: <CircleCheckBig />,
      color: ButtonColors.GREEN,
    },
    {
      label: "Types d'exercices",
      href: "/admin/types-exercices",
      icon: <BowArrow />,
      color: ButtonColors.PINK,
    },
    {
      label: "Badges",
      href: "/admin/badges",
      icon: <SquareStar />,
      color: ButtonColors.GOLD,
    },
    {
      label: "Salles",
      href: "/salles",
      icon: <Dumbbell />,
      color: ButtonColors.BLUE,
    },
    {
      label: "Défis",
      href: "/defis",
      icon: <Swords />,
      color: ButtonColors.RED,
    },
    {
      label: "Utilisateurs",
      href: "/admin/users",
      icon: <Users />,
      color: ButtonColors.BLACK,
    },
  ],
};

export function Header() {
  const { user, profile, rank } = useUser();
  const role = profile?.role as Role | undefined;
  const navItems = role ? navByRole[role] : navByRole.GUEST;
  const isAuthenticated = Boolean(user);

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-white bg-gray-100 shadow-md backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 overflow-visible px-4 py-[18px] sm:gap-6 sm:px-6 sm:py-[22px] lg:px-8">
        <Link href="/" className="text-foreground flex items-center gap-2 font-semibold sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-base text-white sm:h-10 sm:w-10 sm:text-lg">
            LG
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold sm:text-base">leGym</span>
            <span className="text-muted-foreground line-clamp-1 hidden text-xs whitespace-nowrap sm:inline">
              Réseau de salles en franchise
            </span>
          </div>
        </Link>
        <nav className="hidden flex-1 md:flex md:max-w-full md:min-w-0 md:overflow-visible">
          <NavCarousel items={navItems} variant="header" />
        </nav>
        <div className="flex items-center gap-2">
          <MobileMenu navItems={navItems} isAuthenticated={isAuthenticated} />
          {user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              rank={rank ?? undefined}
              profileId={profile?.id}
            />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <AuthButtons />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
