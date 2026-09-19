"use server";

import { headers } from "next/headers";

import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { application, job, resume } from "@/db/schema";
import { auth } from "@/lib/auth";

const applyToJobSchema = z.object({
  jobId: z.uuid(),
  coverLetter: z.string().trim().max(2000).optional(),
});

export async function applyToJob(input: {
  jobId: string;
  coverLetter?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    throw new Error("Only signed-in job seekers can apply.");
  }

  const parsed = applyToJobSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid application details." };
  }

  const currentResume = await db.query.resume.findFirst({
    columns: { id: true },
    where: eq(resume.userId, session.user.id),
  });

  if (!currentResume) {
    return {
      success: false as const,
      message: "Upload a resume before applying for jobs.",
    };
  }

  const now = new Date();
  const availableJob = await db.query.job.findFirst({
    columns: { id: true },
    where: and(
      eq(job.id, parsed.data.jobId),
      eq(job.status, "PUBLISHED"),
      or(isNull(job.expiresAt), gt(job.expiresAt, now)),
    ),
  });

  if (!availableJob) {
    return {
      success: false as const,
      message: "This job is not accepting applications.",
    };
  }

  const applicationDate = new Date();

  const [created] = await db
    .insert(application)
    .values({
      id: crypto.randomUUID(),
      jobId: parsed.data.jobId,
      jobSeekerId: session.user.id,
      coverLetter: parsed.data.coverLetter || null,
      createdAt: applicationDate,
      updatedAt: applicationDate,
    })
    .onConflictDoUpdate({
      target: [application.jobId, application.jobSeekerId],
      set: {
        status: "SUBMITTED",
        coverLetter: parsed.data.coverLetter || null,
        createdAt: applicationDate,
        updatedAt: applicationDate,
      },
      setWhere: eq(application.status, "WITHDRAWN"),
    })
    .returning({ id: application.id });

  if (!created) {
    return {
      success: false as const,
      message: "You have already applied to this job.",
    };
  }

  return { success: true as const, applicationId: created.id };
}
