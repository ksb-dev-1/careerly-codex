"use server";

import { headers } from "next/headers";

import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { application, job } from "@/db/schema";
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

  const [created] = await db
    .insert(application)
    .values({
      id: crypto.randomUUID(),
      jobId: parsed.data.jobId,
      jobSeekerId: session.user.id,
      coverLetter: parsed.data.coverLetter || null,
    })
    .onConflictDoNothing({
      target: [application.jobId, application.jobSeekerId],
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
