import { z } from "zod";
import { jsonError, HttpStatus } from "./responses";
import type { NextResponse } from "next/server";

export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      const details = z.treeifyError(parsed.error);
      return {
        success: false,
        response: jsonError("Données de requête invalides", HttpStatus.BAD_REQUEST, details),
      };
    }

    return { success: true, data: parsed.data };
  } catch {
    return {
      success: false,
      response: jsonError("JSON invalide dans le corps de la requête", HttpStatus.BAD_REQUEST),
    };
  }
}

export function parseQuery<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T,
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const params = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return {
      success: false,
      response: jsonError("Paramètres de requête invalides", HttpStatus.BAD_REQUEST, details),
    };
  }

  return { success: true, data: parsed.data };
}
