"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { notification } from "@/db/schema";
import { auth } from "@/lib/auth";

const notificationIdSchema = z.uuid();

export async function markNotificationRead(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("You must be signed in.");

  const parsed = notificationIdSchema.safeParse(notificationId);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid notification." };
  }

  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notification.id, parsed.data),
        eq(notification.recipientUserId, session.user.id),
        isNull(notification.readAt),
      ),
    );

  revalidatePath("/notifications");
  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("You must be signed in.");

  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notification.recipientUserId, session.user.id),
        isNull(notification.readAt),
      ),
    );

  revalidatePath("/notifications");
  return { success: true as const };
}
