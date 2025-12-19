import { Badge } from "@/components/ui/badge";
import { GYM_STATUS_COPY } from "@/lib/constants";

type GymStatusBadgeProps = {
  status: string;
  className?: string;
};

export function GymStatusBadge({ status, className }: GymStatusBadgeProps) {
  const label = GYM_STATUS_COPY[status] ?? status;
  const variant =
    status === "APPROVED"
      ? "default"
      : status === "PENDING"
        ? "secondary"
        : status === "REJECTED"
          ? "destructive"
          : status === "INCOMPLETE"
            ? "destructive"
            : "secondary";
  const tone =
    status === "APPROVED"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "PENDING"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : status === "REJECTED" || status === "INCOMPLETE"
          ? "bg-red-100 text-red-700 border-red-200"
          : "";

  return (
    <Badge variant={variant} className={`text-xs ${tone} ${className || ""}`}>
      {label}
    </Badge>
  );
}
