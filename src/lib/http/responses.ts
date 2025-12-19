import { NextResponse } from "next/server";
import { serializeDates } from "./serialization";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function jsonOk<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  const serialized = serializeDates(data);
  return NextResponse.json({ data: serialized }, { status });
}

export function jsonError(
  message: string,
  status = 500,
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = { error: message };

  if (process.env.NODE_ENV === "development" && details) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (response as any).details = details;
  }

  return NextResponse.json(response, { status });
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
