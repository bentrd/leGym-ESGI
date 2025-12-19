import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { colorStyles } from "@/types/colors";
import { formatDateFr } from "@/lib/formatters/date";

type AchievementBadgeCardProps = {
  variant: "earned" | "locked";
  badgeId: number;
  name: string;
  icon?: string | null;
  earnedAt?: Date;
  ruleName?: string | null;
};

export function AchievementBadgeCard({
  variant,
  badgeId,
  name,
  icon,
  earnedAt,
  ruleName,
}: AchievementBadgeCardProps) {
  const colors = Object.entries(colorStyles).at(
    badgeId % Object.entries(colorStyles).length,
  )?.[1] || {
    bg: "bg-green-50",
    text: "text-green-700",
    borderColor: "rgb(187, 247, 208)",
  };

  const isEarned = variant === "earned";

  return (
    <Card className={`border border-gray-200 ${!isEarned ? "opacity-60" : ""}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={`text-5xl ${!isEarned ? "grayscale" : ""}`}>{icon || "🏅"}</div>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-muted-foreground text-xs">
              {isEarned && earnedAt ? `Obtenu le ${formatDateFr(earnedAt)}` : "Non obtenu"}
            </p>
          </div>
          {!isEarned && <Lock className="h-5 w-5 text-gray-400" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {ruleName && (
          <div className={`rounded-lg p-3 ${isEarned ? colors.bg : "bg-gray-50"}`}>
            <p className={`text-sm ${isEarned ? colors.text : "text-gray-700"}`}>{ruleName}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
