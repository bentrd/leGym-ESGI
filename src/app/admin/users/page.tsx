import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { UsersManagementContent } from "./users-management-content";
import type { ApiUser } from "@/types/api";

function transformUser(user: ApiUser) {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    authUser: user.authUser
      ? {
          ...user.authUser,
          createdAt: new Date(user.authUser.createdAt),
        }
      : null,
  };
}

export default async function UsersManagementPage() {
  const { data, error } = await apiFetch<{ users: ApiUser[] }>("/api/admin/users");

  if (error || !data) {
    if (error?.includes("Unauthorized") || error?.includes("Forbidden")) {
      redirect("/auth/connexion");
    }
    notFound();
  }

  return <UsersManagementContent users={data.users.map(transformUser)} />;
}
