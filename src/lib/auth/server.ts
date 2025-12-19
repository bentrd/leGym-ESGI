import { getSession } from "@/lib/session";
import { getUserProfile } from "@/lib/profile";
import { isRole, type Role } from "@/lib/constants";
import { jsonError, HttpStatus } from "@/lib/http/responses";
import type { NextResponse } from "next/server";

type SessionPayload = {
  session: { token: string; userId: string; expiresAt: string; [key: string]: unknown };
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    [key: string]: unknown;
  };
};

export async function requireSession(): Promise<
  { success: true; session: SessionPayload } | { success: false; response: NextResponse }
> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      success: false,
      response: jsonError("Non authentifié", HttpStatus.UNAUTHORIZED),
    };
  }

  return { success: true, session };
}

export async function requireProfile(): Promise<
  | {
      success: true;
      session: SessionPayload;
      profile: NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;
    }
  | { success: false; response: NextResponse }
> {
  const sessionResult = await requireSession();
  if (!sessionResult.success) {
    return sessionResult;
  }

  const profile = await getUserProfile(sessionResult.session.user.id);

  if (!profile) {
    return {
      success: false,
      response: jsonError("Profil introuvable", HttpStatus.NOT_FOUND),
    };
  }

  return { success: true, session: sessionResult.session, profile };
}

export async function requireRole(allowedRoles: Role | Role[]): Promise<
  | {
      success: true;
      session: SessionPayload;
      profile: NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;
    }
  | { success: false; response: NextResponse }
> {
  const profileResult = await requireProfile();
  if (!profileResult.success) {
    return profileResult;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  const roleValue = profileResult.profile.role;
  if (!isRole(roleValue) || !roles.includes(roleValue)) {
    return {
      success: false,
      response: jsonError("Accès interdit", HttpStatus.FORBIDDEN),
    };
  }

  return {
    success: true,
    session: profileResult.session,
    profile: profileResult.profile,
  };
}

export async function requireOwner(): Promise<
  | {
      success: true;
      session: SessionPayload;
      profile: NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;
    }
  | { success: false; response: NextResponse }
> {
  return requireRole(["GYM_OWNER", "SUPER_ADMIN"]);
}
