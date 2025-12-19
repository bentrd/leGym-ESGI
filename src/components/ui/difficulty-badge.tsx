import { Badge } from "@/components/ui/badge";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type DifficultyBadgeProps = {
  difficulty: string;
  className?: string;
};

const difficultyConfig: Record<Difficulty, { label: string; colorClass: string }> = {
  EASY: {
    label: "Facile",
    colorClass: "bg-green-50 text-green-800 border-green-300",
  },
  MEDIUM: {
    label: "Moyen",
    colorClass: "bg-yellow-50 text-yellow-800 border-yellow-300",
  },
  HARD: {
    label: "Difficile",
    colorClass: "bg-red-50 text-red-800 border-red-300",
  },
};

export function DifficultyBadge({ difficulty, className = "" }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty as Difficulty] || difficultyConfig.MEDIUM;

  return (
    <Badge variant="muted" className={`${config.colorClass} ${className}`}>
      {config.label}
    </Badge>
  );
}
