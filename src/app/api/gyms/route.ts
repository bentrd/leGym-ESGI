import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { parseQuery } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

const querySchema = z.object({
  cursor: z.string().transform(Number).optional(),
  limit: z.string().default("12").transform(Number),
});

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryResult = parseQuery(searchParams, querySchema);
    if (!queryResult.success) {
      return queryResult.response;
    }

    const { cursor, limit } = queryResult.data;

    const gyms = await prisma.gym.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
    });

    return jsonOk(gyms);
  } catch (error) {
    logger.error("Echec recuperation salles:", error);
    return jsonError("Echec de la recuperation des salles", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
