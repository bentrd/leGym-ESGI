import { cookies } from "next/headers";

export async function buildCookieHeader(): Promise<string | undefined> {
  try {
    const jar = await cookies();
    const all = jar.getAll?.() ?? [];
    if (!all.length) return undefined;
    return all.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    return undefined;
  }
}
