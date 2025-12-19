import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "@/lib/better-auth-prisma-adapter";

import { env } from "@/lib/env";
import { prisma } from "@/server/db";

const baseURL =
  env.BETTER_AUTH_URL &&
  !(env.NODE_ENV === "production" && env.BETTER_AUTH_URL.includes("localhost"))
    ? env.BETTER_AUTH_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

const trustedOrigins = Array.from(
  new Set(
    [
      baseURL,
      env.BETTER_AUTH_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      "https://*.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter((value): value is string => typeof value === "string" && value.length > 0),
  ),
);

export const auth = betterAuth({
  baseURL,
  basePath: "/api/auth",
  trustedOrigins,
  plugins: [nextCookies()],
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    transaction: false,
  }),
  rateLimit: {
    enabled: env.NODE_ENV === "production",
  },
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "error",
  },
});

export type AuthInstance = typeof auth;
