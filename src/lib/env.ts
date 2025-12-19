import { z } from "zod";

const resolvedDatabaseUrl = process.env.STORAGE_PRISMA_DATABASE_URL ?? process.env.DATABASE_URL;
const resolvedDirectUrl = process.env.STORAGE_POSTGRES_URL ?? process.env.DIRECT_URL;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  STORAGE_PRISMA_DATABASE_URL: z
    .string()
    .min(1, "STORAGE_PRISMA_DATABASE_URL is required")
    .optional(),
  STORAGE_POSTGRES_URL: z.string().min(1, "STORAGE_POSTGRES_URL is required").optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").optional(),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required").optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long")
    .optional(),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL").optional(),
  SUPER_ADMIN_EMAILS: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  STORAGE_PRISMA_DATABASE_URL: resolvedDatabaseUrl,
  STORAGE_POSTGRES_URL: resolvedDirectUrl,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS,
});

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const env = parsed.data;

const requiredInProduction: Array<keyof typeof env> = [
  "STORAGE_PRISMA_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
];

if (env.NODE_ENV === "production") {
  for (const key of requiredInProduction) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export type Env = typeof env;
export { env };
