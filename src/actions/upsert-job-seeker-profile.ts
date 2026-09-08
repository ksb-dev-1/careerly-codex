"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { jobSeekerProfile } from "@/db/schema";
import { auth } from "@/lib/auth";

export type JobSeekerProfileInput = {
  headline?: string;
  experience?: string;
  skills: string[];
  location?: string;
  about?: string;
};

function toNullableString(value?: string) {
  return value?.trim() || null;
}

export async function upsertJobSeekerProfile(input: JobSeekerProfileInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to update your profile.");
  }

  if (session.user.role !== "JOB_SEEKER") {
    throw new Error("Only job seekers can update this profile.");
  }

  const skills = [
    ...new Set(input.skills.map((skill) => skill.trim()).filter(Boolean)),
  ];

  await db
    .insert(jobSeekerProfile)
    .values({
      userId: session.user.id,
      headline: toNullableString(input.headline),
      experience: toNullableString(input.experience),
      skills,
      location: toNullableString(input.location),
      about: toNullableString(input.about),
    })
    .onConflictDoUpdate({
      target: jobSeekerProfile.userId,
      set: {
        headline: toNullableString(input.headline),
        experience: toNullableString(input.experience),
        skills,
        location: toNullableString(input.location),
        about: toNullableString(input.about),
        updatedAt: new Date(),
      },
    });
}
