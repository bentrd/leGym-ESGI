import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type RankBadgeProps = {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function RankBadge({ rank, size = "md", className }: RankBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  if (rank === 1) {
    return <Trophy className={cn(iconSize, "text-yellow-500", className)} />;
  }

  if (rank === 2) {
    return <Medal className={cn(iconSize, "text-gray-400", className)} />;
  }

  if (rank === 3) {
    return <Award className={cn(iconSize, "text-amber-600", className)} />;
  }

  return (
    <span className={cn("text-muted-foreground font-bold", textSize, className)}>#{rank}</span>
  );
}
