import { and, count, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { application, user } from "@/db/schema";

export const DAILY_APPLICATION_LIMITS = {
  FREE: 1,
  PREMIUM: 5,
} as const;

export type MembershipPlan = keyof typeof DAILY_APPLICATION_LIMITS;

const INDIA_UTC_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getIndiaDayBounds(now = new Date()) {
  const indiaTime = new Date(now.getTime() + INDIA_UTC_OFFSET_MS);
  const startOfIndiaDayAsUtc = Date.UTC(
    indiaTime.getUTCFullYear(),
    indiaTime.getUTCMonth(),
    indiaTime.getUTCDate(),
  );
  const startsAt = new Date(startOfIndiaDayAsUtc - INDIA_UTC_OFFSET_MS);
  const resetsAt = new Date(startsAt.getTime() + 24 * 60 * 60 * 1000);

  return { startsAt, resetsAt };
}

export async function getDailyApplicationQuota(
  userId: string,
  now = new Date(),
) {
  const { startsAt, resetsAt } = getIndiaDayBounds(now);

  const [[account], [usage]] = await Promise.all([
    db
      .select({ membershipPlan: user.membershipPlan })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
    db
      .select({ used: count() })
      .from(application)
      .where(
        and(
          eq(application.jobSeekerId, userId),
          gte(application.createdAt, startsAt),
          lt(application.createdAt, resetsAt),
        ),
      ),
  ]);

  const membershipPlan = account?.membershipPlan ?? "FREE";
  const limit = DAILY_APPLICATION_LIMITS[membershipPlan];
  const used = usage?.used ?? 0;

  return {
    membershipPlan,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    startsAt,
    resetsAt,
  };
}
