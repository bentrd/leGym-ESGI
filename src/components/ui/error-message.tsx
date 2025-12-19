import { CircleAlert } from "lucide-react";

export const renderError = (
  meta?: {
    errorMap?: Record<string, unknown>;
    errors: unknown[];
    isTouched: boolean;
    isBlurred: boolean;
  },
  errorStr?: string,
) => {
  const extractMessage = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return extractMessage(value[0]);
    if (typeof value === "object" && "message" in (value as { message?: unknown })) {
      const message = (value as { message?: unknown }).message;
      return typeof message === "string" ? message : undefined;
    }
    return undefined;
  };

  const message = extractMessage(meta?.errors?.[0] ?? errorStr ?? undefined);

  return message ? (
    <div className="mt-2 flex flex-row items-center gap-1">
      <CircleAlert className="text-destructive" size={12} />
      <p className="text-destructive text-xs">{message}</p>
    </div>
  ) : null;
};
