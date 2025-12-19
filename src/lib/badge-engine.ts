import { prisma } from "@/server/db";
import type { RuleField, RuleOperator } from "./validators/badge";
import { logger } from "./logger";

type RuleCriteria = {
  field: RuleField;
  operator: RuleOperator;
  value: number;
};

type UserStats = {
  totalSessions: number;
  completedChallenges: number;
  totalCalories: number;
  totalDuration: number;
};

export type BadgeSyncResult = {
  added: number[];
  removed: number[];
};

export async function computeUserStats(userId: number): Promise<UserStats> {
  const userSessions = await prisma.challengeSession.findMany({
    where: { userId },
    include: {
      logs: {
        select: {
          duration: true,
          calories: true,
        },
      },
    },
  });

  return {
    totalSessions: userSessions.reduce((sum, session) => sum + session.logs.length, 0),
    completedChallenges: userSessions.filter((s) => s.status === "COMPLETED").length,
    totalCalories: userSessions
      .flatMap((s) => s.logs)
      .reduce((sum, log) => sum + (log.calories || 0), 0),
    totalDuration: userSessions
      .flatMap((s) => s.logs)
      .reduce((sum, log) => sum + (log.duration || 0), 0),
  };
}

function evaluateRule(criteria: RuleCriteria, stats: UserStats): boolean {
  const fieldValue = stats[criteria.field];
  const targetValue = criteria.value;

  switch (criteria.operator) {
    case ">=":
      return fieldValue >= targetValue;
    case "<=":
      return fieldValue <= targetValue;
    case "==":
      return fieldValue === targetValue;
    case ">":
      return fieldValue > targetValue;
    default:
      return false;
  }
}

export async function computeEligibleAutoBadgeIds(stats: UserStats): Promise<number[]> {
  const badges = await prisma.badge.findMany({
    where: {
      rewardRule: {
        isNot: null,
      },
    },
    include: {
      rewardRule: true,
    },
  });

  const eligibleIds: number[] = [];

  for (const badge of badges) {
    if (!badge.rewardRule) continue;

    let criteria: RuleCriteria;
    try {
      criteria = JSON.parse(badge.rewardRule.criteria);
    } catch {
      logger.error(`Invalid criteria JSON for badge ${badge.id}`);
      continue;
    }

    if (evaluateRule(criteria, stats)) {
      eligibleIds.push(badge.id);
    }
  }

  return eligibleIds;
}

export async function syncUserBadges(
  userId: number,
  options?: { force?: boolean; now?: Date },
): Promise<BadgeSyncResult> {
  const now = options?.now ?? new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      const userSessions = await tx.challengeSession.findMany({
        where: { userId },
        include: {
          logs: {
            select: {
              duration: true,
              calories: true,
            },
          },
        },
      });

      const stats: UserStats = {
        totalSessions: userSessions.reduce((sum, session) => sum + session.logs.length, 0),
        completedChallenges: userSessions.filter((s) => s.status === "COMPLETED").length,
        totalCalories: userSessions
          .flatMap((s) => s.logs)
          .reduce((sum, log) => sum + (log.calories || 0), 0),
        totalDuration: userSessions
          .flatMap((s) => s.logs)
          .reduce((sum, log) => sum + (log.duration || 0), 0),
      };

      const autoBadges = await tx.badge.findMany({
        where: {
          rewardRule: {
            isNot: null,
          },
        },
        include: {
          rewardRule: true,
        },
      });

      const eligibleIds = new Set<number>();
      for (const badge of autoBadges) {
        if (!badge.rewardRule) continue;

        let criteria: RuleCriteria;
        try {
          criteria = JSON.parse(badge.rewardRule.criteria);
        } catch {
          logger.error(`Invalid criteria JSON for badge ${badge.id}`);
          continue;
        }

        if (evaluateRule(criteria, stats)) {
          eligibleIds.add(badge.id);
        }
      }

      const autoBadgeIds = new Set(autoBadges.map((b) => b.id));
      const existingUserBadges = await tx.userBadge.findMany({
        where: {
          userId,
          badgeId: { in: Array.from(autoBadgeIds) },
        },
        select: { badgeId: true },
      });

      const existingBadgeIds = new Set(existingUserBadges.map((ub) => ub.badgeId));

      const toAdd = Array.from(eligibleIds).filter((id) => !existingBadgeIds.has(id));
      const toRemove = Array.from(existingBadgeIds).filter((id) => !eligibleIds.has(id));

      if (toAdd.length > 0) {
        const badgesWithRules = autoBadges.filter((b) => toAdd.includes(b.id));
        for (const badge of badgesWithRules) {
          await tx.userBadge.upsert({
            where: {
              userId_badgeId: {
                userId,
                badgeId: badge.id,
              },
            },
            create: {
              userId,
              badgeId: badge.id,
              reason: badge.rewardRule?.name ?? "Auto-awarded",
            },
            update: {},
          });
        }
      }

      if (toRemove.length > 0) {
        await tx.userBadge.deleteMany({
          where: {
            userId,
            badgeId: { in: toRemove },
          },
        });
      }

      await tx.userProfile.update({
        where: { id: userId },
        data: { lastBadgeSyncAt: now },
      });

      logger.info(
        `Badge sync for user ${userId}: +${toAdd.length} added, -${toRemove.length} removed`,
      );

      return {
        added: toAdd,
        removed: toRemove,
      };
    });
  } catch (error) {
    logger.error(`Error syncing badges for user ${userId}:`, error);
    return { added: [], removed: [] };
  }
}

export async function maybeSyncUserBadges(
  userId: number,
  options?: { maxAgeMs?: number },
): Promise<BadgeSyncResult | null> {
  const maxAgeMs = options?.maxAgeMs ?? 60 * 60 * 1000;
  const now = new Date();

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { lastBadgeSyncAt: true },
    });

    if (!profile) {
      logger.warn(`User profile ${userId} not found for badge sync`);
      return null;
    }

    if (profile.lastBadgeSyncAt) {
      const ageMs = now.getTime() - profile.lastBadgeSyncAt.getTime();
      if (ageMs < maxAgeMs) {
        return null;
      }
    }

    return await syncUserBadges(userId, { force: true, now });
  } catch (error) {
    logger.error(`Error in maybeSyncUserBadges for user ${userId}:`, error);
    return null;
  }
}

export async function evaluateAndAwardBadges(userId: number): Promise<number[]> {
  const result = await syncUserBadges(userId, { force: true });
  return result.added;
}
