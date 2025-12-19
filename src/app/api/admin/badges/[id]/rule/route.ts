import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/server/db";
import { rewardRuleSchema } from "@/lib/validators/badge";
import { parseBody } from "@/lib/http/parsing";
import { jsonOk, jsonError, HttpStatus } from "@/lib/http/responses";
import { logger } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ruleRequestSchema = z.object({
  name: z.string().min(1),
  criteria: z.string().min(1),
});

export const POST = async (request: NextRequest, context: RouteContext) => {
  try {
    const authResult = await requireRole("SUPER_ADMIN");
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await context.params;
    const badgeId = parseInt(id, 10);

    if (isNaN(badgeId)) {
      return jsonError("ID de badge invalide", HttpStatus.BAD_REQUEST);
    }

    const bodyResult = await parseBody(request, ruleRequestSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    let criteriaObj: unknown;
    try {
      criteriaObj = JSON.parse(bodyResult.data.criteria);
    } catch {
      return jsonError("Format JSON des criteres invalide", HttpStatus.BAD_REQUEST);
    }

    const validatedCriteria = rewardRuleSchema.parse(criteriaObj);

    const validatedCriteriaString = JSON.stringify(validatedCriteria);

    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      return jsonError("Badge non trouve", HttpStatus.NOT_FOUND);
    }

    const rule = await prisma.rewardRule.upsert({
      where: { badgeId },
      update: { name: bodyResult.data.name, criteria: validatedCriteriaString },
      create: {
        badgeId,
        name: bodyResult.data.name,
        criteria: validatedCriteriaString,
      },
    });

    return jsonOk(rule);
  } catch (error) {
    logger.error("Error creating reward rule:", error);

    if (error instanceof z.ZodError) {
      return jsonError("Erreur de validation", HttpStatus.BAD_REQUEST, error.issues);
    }

    return jsonError("Echec de la creation de la regle", HttpStatus.INTERNAL_SERVER_ERROR);
  }
};
