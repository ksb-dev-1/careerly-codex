"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { application } from "@/db/schema";
import { auth } from "@/lib/auth";
import { assertMutationRateLimit } from "@/lib/server/rate-limit";

const withdrawApplicationSchema = z.object({
  applicationId: z.uuid(),
});

export async function withdrawApplication(applicationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    throw new Error("Only signed-in job seekers can withdraw applications.");
  }

  await assertMutationRateLimit({
    userId: session.user.id,
    action: "withdraw-application",
    limit: 20,
    windowMs: 60 * 60 * 1_000,
  });

  const parsed = withdrawApplicationSchema.safeParse({
    applicationId,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid application.",
    };
  }

  const [updatedApplication] = await db
    .update(application)
    .set({
      status: "WITHDRAWN",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(application.id, parsed.data.applicationId),
        eq(application.jobSeekerId, session.user.id),
        inArray(application.status, ["SUBMITTED", "SHORTLISTED"]),
      ),
    )
    .returning({
      jobId: application.jobId,
    });

  if (!updatedApplication) {
    return {
      success: false as const,
      message: "This application cannot be withdrawn.",
    };
  }

  revalidatePath("/job-seeker/applications");
  revalidatePath("/job-seeker/dashboard");
  revalidatePath(`/job-seeker/jobs/${updatedApplication.jobId}`);
  revalidatePath(`/employer/jobs/${updatedApplication.jobId}`);
  revalidatePath("/employer/dashboard");

  return {
    success: true as const,
    message: "Application withdrawn successfully.",
  };
}
