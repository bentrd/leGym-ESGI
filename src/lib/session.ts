import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");

    if (!cookieHeader) {
      return null;
    }

    const session = await auth.api.getSession({
      headers: { cookie: cookieHeader },
    });

    if (!session?.user || !session?.session) {
      return null;
    }

    return {
      session: {
        ...session.session,
        expiresAt: session.session.expiresAt.toISOString(),
      },
      user: session.user,
    };
  } catch (_error) {
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");

    if (cookieHeader) {
      await auth.api.signOut({
        headers: { cookie: cookieHeader },
      });
    }
  } catch (_error) {}
}
