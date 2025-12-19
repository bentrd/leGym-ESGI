import { env } from "@/lib/env";
import { prisma } from "@/server/db";
import type { Role } from "@/lib/constants";

type RequestedRole = "owner" | "client" | undefined;

const superAdmins = new Set(
  (env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const resolveRole = (email: string | null | undefined, requested: RequestedRole): Role => {
  if (email && superAdmins.has(email.toLowerCase())) {
    return "SUPER_ADMIN";
  }
  if (requested === "owner") return "GYM_OWNER";
  return "CLIENT";
};

export async function ensureUserProfile(options: {
  authUserId: string;
  email?: string | null;
  name?: string | null;
  requestedRole?: RequestedRole;
  gymName?: string | null;
}) {
  const targetRole = resolveRole(options.email, options.requestedRole);
  const { authUserId, email, name } = options;

  const profile = await prisma.userProfile.upsert({
    where: { authUserId },
    create: {
      authUserId,
      ...(email ? { email } : {}),
      ...(name ? { displayName: name } : {}),
      role: targetRole,
    },
    update: {
      ...(email ? { email } : {}),
      ...(name ? { displayName: name } : {}),
      ...(targetRole === "SUPER_ADMIN" ? { role: targetRole } : {}),
    },
  });

  if (targetRole === "GYM_OWNER" && options.gymName) {
    const gymName = options.gymName.trim();
    if (gymName.length >= 2) {
      const existingRequest = await prisma.gymOwnerRequest.findFirst({
        where: { userId: profile.id },
      });
      if (!existingRequest) {
        await prisma.gymOwnerRequest.create({
          data: { userId: profile.id, gymName, status: "PENDING" },
        });
      }
    }
  }

  return profile;
}

export async function getUserProfile(authUserId: string) {
  return prisma.userProfile.findUnique({
    where: { authUserId },
  });
}
