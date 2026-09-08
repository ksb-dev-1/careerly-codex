"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

const userRoles = ["JOB_SEEKER", "EMPLOYER"] as const;

export type UserRole = (typeof userRoles)[number];

export async function assignUserRole(role: UserRole) {
  if (!userRoles.includes(role)) {
    throw new Error("Invalid user role.");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to select a role.");
  }

  const [updatedUser] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, session.user.id))
    .returning({ id: user.id, role: user.role });

  if (!updatedUser) {
    throw new Error("Unable to update user role.");
  }

  return updatedUser;
}
