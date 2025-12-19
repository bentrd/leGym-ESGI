import { Calendar, TrendingUp, Flame, CheckCircle } from "lucide-react";
import { StatCard } from "./stat-card";

type StatsCardsProps = {
  totalSessions: number;
  totalDuration: number;
  totalCalories: number;
  completedChallenges?: number;
  variant?: "default" | "compact";
};

export function StatsCards({
  totalSessions,
  totalDuration,
  totalCalories,
  completedChallenges,
  variant = "default",
}: StatsCardsProps) {
  const gridClasses =
    variant === "compact" ? "flex flex-row flex-nowrap gap-3" : "grid gap-2 grid-cols-2";
  const cardClasses = variant === "compact" ? "flex-1" : "";

  return (
    <div className="-mx-4 sm:-mx-6">
      <div className={`${gridClasses} px-4 sm:px-6`}>
        {completedChallenges !== undefined && variant !== "compact" && (
          <StatCard
            color="green"
            title="Défis complétés"
            value={completedChallenges}
            icon={
              <CheckCircle
                className="text-green-400"
                style={{ filter: "drop-shadow(0 0 8px rgba(74, 222, 128, 0.7))" }}
              />
            }
            className={cardClasses}
          />
        )}

        <StatCard
          color="red"
          title="Séances"
          value={totalSessions}
          icon={
            <Calendar
              className="text-red-400"
              style={{ filter: "drop-shadow(0 0 8px rgba(248, 113, 113, 0.7))" }}
            />
          }
          className={cardClasses}
        />

        <StatCard
          color="purple"
          title="Durée totale (min)"
          value={`${totalDuration}`}
          icon={
            <TrendingUp
              className="text-purple-400"
              style={{ filter: "drop-shadow(0 0 8px rgba(192, 132, 252, 0.7))" }}
            />
          }
          className={cardClasses}
        />

        <StatCard
          color="orange"
          title="Calories brûlées"
          value={totalCalories}
          icon={
            <Flame
              className="text-orange-500"
              style={{ filter: "drop-shadow(0 0 10px rgba(249, 115, 22, 0.8))" }}
            />
          }
          className={cardClasses}
        />
      </div>
    </div>
  );
}
