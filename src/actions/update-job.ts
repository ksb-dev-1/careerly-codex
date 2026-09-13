"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sanitizeJobDescription } from "@/lib/server/job-description";
import { type JobInput, jobInputSchema } from "@/lib/validations/job";

export async function updateJob(jobId: string, input: JobInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can edit jobs.");
  }

  const validation = jobInputSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false as const,
      message: "Please correct the invalid job details.",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const [updated] = await db
    .update(job)
    .set({
      ...validation.data,
      description: sanitizeJobDescription(validation.data.description),
      location: validation.data.location || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(job.id, jobId),
        eq(job.employerId, session.user.id),
        inArray(job.status, ["DRAFT", "PUBLISHED"]),
      ),
    )
    .returning({ id: job.id });

  if (!updated) {
    throw new Error("This job cannot be edited.");
  }

  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);

  return { success: true as const, jobId: updated.id };
}
