"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { employerProfile } from "@/db/schema";
import { auth } from "@/lib/auth";

export type EmployerProfileInput = {
  companyName?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  about?: string;
};

function toNullableString(value?: string) {
  return value?.trim() || null;
}

export async function upsertEmployerProfile(input: EmployerProfileInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update your profile.");
  }

  if (session.user.role !== "EMPLOYER") {
    throw new Error("Only employers can update this profile.");
  }

  await db
    .insert(employerProfile)
    .values({
      userId: session.user.id,
      companyName: toNullableString(input.companyName),
      logoUrl: toNullableString(input.logoUrl),
      industry: toNullableString(input.industry),
      location: toNullableString(input.location),
      about: toNullableString(input.about),
    })
    .onConflictDoUpdate({
      target: employerProfile.userId,
      set: {
        companyName: toNullableString(input.companyName),
        logoUrl: toNullableString(input.logoUrl),
        industry: toNullableString(input.industry),
        location: toNullableString(input.location),
        about: toNullableString(input.about),
        updatedAt: new Date(),
      },
    });
}
