import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { mutationRateLimit } from "@/db/schema";

type RateLimitInput = {
  userId: string;
  action: string;
  limit: number;
  windowMs: number;
};

export async function assertMutationRateLimit({
  userId,
  action,
  limit,
  windowMs,
}: RateLimitInput) {
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / windowMs) * windowMs,
  );

  const [usage] = await db
    .insert(mutationRateLimit)
    .values({
      userId,
      action,
      windowStart,
      requestCount: 1,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        mutationRateLimit.userId,
        mutationRateLimit.action,
        mutationRateLimit.windowStart,
      ],
      set: {
        requestCount: sql`${mutationRateLimit.requestCount} + 1`,
        updatedAt: now,
      },
    })
    .returning({ requestCount: mutationRateLimit.requestCount });

  if (usage && usage.requestCount > limit) {
    const retryAfterMinutes = Math.max(
      1,
      Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 60_000),
    );

    throw new Error(
      `Too many requests. Please try again in ${retryAfterMinutes} minute${
        retryAfterMinutes === 1 ? "" : "s"
      }.`,
    );
  }
}
