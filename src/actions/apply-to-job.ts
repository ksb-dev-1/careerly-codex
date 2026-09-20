"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, count, eq, gt, gte, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { application, job, resume, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  DAILY_APPLICATION_LIMITS,
  getIndiaDayBounds,
} from "@/lib/server/application-quota";

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
    return {
      success: false as const,
      code: "INVALID_INPUT" as const,
      message: "Invalid application details.",
    };
  }

  const currentResume = await db.query.resume.findFirst({
    columns: { id: true },
    where: eq(resume.userId, session.user.id),
  });

  if (!currentResume) {
    return {
      success: false as const,
      code: "RESUME_REQUIRED" as const,
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
      code: "JOB_UNAVAILABLE" as const,
      message: "This job is not accepting applications.",
    };
  }

  const applicationDate = new Date();
  const { startsAt, resetsAt } = getIndiaDayBounds(applicationDate);

  const result = await db.transaction(async (tx) => {
    // Serialize application attempts for this user so concurrent requests
    // cannot both pass the daily quota check.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${session.user.id}, 0))`,
    );

    const [[account], [existingApplication], [usage]] = await Promise.all([
      tx
        .select({ membershipPlan: user.membershipPlan })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1),
      tx
        .select({
          status: application.status,
          createdAt: application.createdAt,
        })
        .from(application)
        .where(
          and(
            eq(application.jobId, parsed.data.jobId),
            eq(application.jobSeekerId, session.user.id),
          ),
        )
        .limit(1),
      tx
        .select({ used: count() })
        .from(application)
        .where(
          and(
            eq(application.jobSeekerId, session.user.id),
            gte(application.createdAt, startsAt),
            lt(application.createdAt, resetsAt),
          ),
        ),
    ]);

    if (existingApplication && existingApplication.status !== "WITHDRAWN") {
      return {
        success: false as const,
        code: "ALREADY_APPLIED" as const,
        message: "You have already applied to this job.",
      };
    }

    const membershipPlan = account?.membershipPlan ?? "FREE";
    const dailyLimit = DAILY_APPLICATION_LIMITS[membershipPlan];
    const usedToday = usage?.used ?? 0;
    const alreadyCountedToday =
      existingApplication !== undefined &&
      existingApplication.createdAt >= startsAt &&
      existingApplication.createdAt < resetsAt;

    if (!alreadyCountedToday && usedToday >= dailyLimit) {
      return {
        success: false as const,
        code: "DAILY_LIMIT_REACHED" as const,
        message: `You have reached your ${dailyLimit}-application daily limit. Your limit resets at midnight IST.`,
        membershipPlan,
        dailyLimit,
        remainingApplications: 0,
        resetsAt: resetsAt.toISOString(),
      };
    }

    const [created] = await tx
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
        code: "ALREADY_APPLIED" as const,
        message: "You have already applied to this job.",
      };
    }

    const applicationsUsed = usedToday + (alreadyCountedToday ? 0 : 1);

    return {
      success: true as const,
      applicationId: created.id,
      membershipPlan,
      dailyLimit,
      remainingApplications: Math.max(dailyLimit - applicationsUsed, 0),
      resetsAt: resetsAt.toISOString(),
    };
  });

  if (result.success) {
    revalidatePath("/job-seeker/jobs");
    revalidatePath(`/job-seeker/jobs/${parsed.data.jobId}`);
    revalidatePath("/job-seeker/applications");
    revalidatePath(`/employer/jobs/${parsed.data.jobId}`);
  }

  return result;
}
