"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { resume, subscription, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { assertMutationRateLimit } from "@/lib/server/rate-limit";
import {
  deleteResumeAsset,
  deleteResumeFolder,
} from "@/lib/server/resume-storage";

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
  "CANCELED",
  "INCOMPLETE_EXPIRED",
]);

export async function deleteAccount(input: { confirmation: string }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("You must be signed in.");

  const parsed = deleteAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: 'Type "DELETE" exactly to confirm account deletion.',
    };
  }

  await assertMutationRateLimit({
    userId: session.user.id,
    action: "delete-account",
    limit: 3,
    windowMs: 60 * 60 * 1_000,
  });

  const [[billing], [currentResume]] = await Promise.all([
    db
      .select({ status: subscription.status })
      .from(subscription)
      .where(eq(subscription.userId, session.user.id))
      .limit(1),
    db
      .select({ publicId: resume.publicId })
      .from(resume)
      .where(eq(resume.userId, session.user.id))
      .limit(1),
  ]);

  if (billing && !TERMINAL_SUBSCRIPTION_STATUSES.has(billing.status)) {
    return {
      success: false as const,
      message:
        "Cancel your Premium subscription and wait for it to end before deleting your account.",
    };
  }

  if (currentResume) {
    try {
      await deleteResumeAsset(currentResume.publicId);
      await deleteResumeFolder(session.user.id);
    } catch (error) {
      console.error("Unable to remove resume assets during account deletion:", error);
    }
  }

  const [deleted] = await db
    .delete(user)
    .where(eq(user.id, session.user.id))
    .returning({ id: user.id });

  if (!deleted) {
    return {
      success: false as const,
      message: "Your account could not be deleted.",
    };
  }

  return { success: true as const };
}
