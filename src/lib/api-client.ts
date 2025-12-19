import { buildCookieHeader } from "@/lib/http/cookies";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";

    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {}

  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const cookieHeader = await buildCookieHeader();

    let absoluteUrl = url;
    if (url.startsWith("/")) {
      const baseUrl = await getBaseUrl();
      absoluteUrl = `${baseUrl}${url}`;
    }

    const response = await fetch(absoluteUrl, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiResponse<T>;
      return {
        data: null,
        error: errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    const responseData = (await response.json()) as ApiResponse<T> | T;

    const data =
      typeof responseData === "object" &&
      responseData !== null &&
      "data" in responseData &&
      responseData.data !== undefined
        ? responseData.data
        : (responseData as T);

    return { data, error: null };
  } catch (error) {
    logger.error(`API fetch error for ${url}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
