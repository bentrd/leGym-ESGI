export function serializeDates<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates) as T;
  }

  if (typeof obj === "object") {
    const serialized = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (serialized as Record<string, unknown>)[key] = serializeDates(value);
    }
    return serialized;
  }

  return obj;
}
