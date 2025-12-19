import {
  Dumbbell,
  Swords,
  SquareStar,
  Trophy,
  Building2,
  Users,
  BowArrow,
  CircleCheckBig,
  type LucideIcon,
} from "lucide-react";
import { ButtonColors, type ButtonColor } from "@/types/colors";

export type DomainKind =
  | "gyms"
  | "challenges"
  | "badges"
  | "leaderboard"
  | "gym-owner"
  | "users"
  | "exercise-types"
  | "validation";

export type DomainMeta = {
  icon: LucideIcon;
  tone: ButtonColor;
  defaultTitle?: string;
  defaultDescription?: string;
};

export const domainMeta: Record<DomainKind, DomainMeta> = {
  gyms: {
    icon: Dumbbell,
    tone: ButtonColors.BLUE,
    defaultTitle: "Salles du réseau",
    defaultDescription: "Sélectionnez un club, présentez votre pass, entraînez-vous.",
  },
  challenges: {
    icon: Swords,
    tone: ButtonColors.RED,
    defaultTitle: "Défis disponibles",
    defaultDescription:
      "Des programmes courts, pensés par chaque club. Rejoignez depuis l'app, vos stats se synchronisent.",
  },
  badges: {
    icon: SquareStar,
    tone: ButtonColors.GOLD,
    defaultTitle: "Badges",
    defaultDescription: "Récompenses obtenues",
  },
  leaderboard: {
    icon: Trophy,
    tone: ButtonColors.AMBER,
    defaultTitle: "Classement",
    defaultDescription: "Les meilleurs membres du réseau",
  },
  "gym-owner": {
    icon: Building2,
    tone: ButtonColors.GREEN,
    defaultTitle: "Ma salle",
    defaultDescription: "Gérez votre établissement",
  },
  users: {
    icon: Users,
    tone: ButtonColors.BLACK,
    defaultTitle: "Utilisateurs",
    defaultDescription: "Gestion des comptes",
  },
  "exercise-types": {
    icon: BowArrow,
    tone: ButtonColors.PINK,
    defaultTitle: "Types d'exercices",
    defaultDescription: "Catalogue des mouvements",
  },
  validation: {
    icon: CircleCheckBig,
    tone: ButtonColors.GREEN,
    defaultTitle: "Validation",
    defaultDescription: "Salles en attente",
  },
};
