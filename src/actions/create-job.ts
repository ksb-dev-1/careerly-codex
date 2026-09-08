"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { employerProfile, job } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type JobInput, jobInputSchema } from "@/lib/validations/job";

export async function createJob(input: JobInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in to create a job.");
  }

  if (session.user.role !== "EMPLOYER") {
    throw new Error("Only employers can create jobs.");
  }

  const validation = jobInputSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message: "Please correct the invalid job details.",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const profile = await db.query.employerProfile.findFirst({
    columns: {
      companyName: true,
    },
    where: eq(employerProfile.userId, session.user.id),
  });

  if (!profile?.companyName) {
    throw new Error("Complete your employer profile before creating a job.");
  }

  const inputData = validation.data;

  const [createdJob] = await db
    .insert(job)
    .values({
      id: crypto.randomUUID(),
      employerId: session.user.id,
      title: inputData.title,
      description: inputData.description,
      location: inputData.location || null,
      employmentType: inputData.employmentType,
      workplaceType: inputData.workplaceType,
      experienceLevel: inputData.experienceLevel,
      minimumSalary: inputData.minimumSalary,
      maximumSalary: inputData.maximumSalary,
      currency: inputData.currency,
      openings: inputData.openings,
      skills: inputData.skills,
      expiresAt: inputData.expiresAt,
    })
    .returning({ id: job.id });

  if (!createdJob) {
    throw new Error("Unable to create the job.");
  }

  return {
    success: true as const,
    jobId: createdJob.id,
  };
}
