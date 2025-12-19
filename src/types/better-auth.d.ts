declare module "@/lib/better-auth-prisma-adapter" {
  import type { BetterAuthOptions } from "better-auth";
  import type { DBAdapter } from "@better-auth/core/db/adapter";
  import type { PrismaClient } from "@prisma/client";

  export interface PrismaConfig {
    provider: "sqlite" | "postgresql" | "mysql" | "sqlserver" | "cockroachdb" | "mongodb";
    debugLogs?: boolean;
    usePlural?: boolean;
    transaction?: boolean;
  }

  export function prismaAdapter(
    prisma: PrismaClient,
    config: PrismaConfig,
  ): (options: BetterAuthOptions) => DBAdapter<BetterAuthOptions>;
}
