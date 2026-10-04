"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { assertMutationRateLimit } from "@/lib/server/rate-limit";

const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(80, "Name cannot exceed 80 characters."),
});

export async function updateAccount(input: { name: string }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("You must be signed in.");

  const parsed = updateAccountSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.issues[0]?.message ?? "Enter a valid name.",
    };
  }

  await assertMutationRateLimit({
    userId: session.user.id,
    action: "update-account",
    limit: 10,
    windowMs: 60 * 60 * 1_000,
  });

  await db
    .update(user)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/");
  revalidatePath("/account/settings");

  return { success: true as const, message: "Account updated successfully." };
}
