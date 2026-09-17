"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { bookmark, job } from "@/db/schema";
import { auth } from "@/lib/auth";

const inputSchema = z.object({
  jobId: z.uuid(),
  saved: z.boolean(),
});

export async function setJobBookmark(input: { jobId: string; saved: boolean }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    return {
      success: false as const,
      message: "Sign in as a job seeker to save jobs.",
    };
  }

  const parsed = inputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid bookmark request.",
    };
  }

  const { jobId, saved } = parsed.data;
  const jobSeekerId = session.user.id;

  if (saved) {
    const availableJob = await db.query.job.findFirst({
      columns: { id: true },
      where: and(
        eq(job.id, jobId),
        eq(job.status, "PUBLISHED"),
        or(isNull(job.expiresAt), gt(job.expiresAt, new Date())),
      ),
    });

    if (!availableJob) {
      return {
        success: false as const,
        message: "This job is no longer available.",
      };
    }

    await db
      .insert(bookmark)
      .values({ jobSeekerId, jobId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(bookmark)
      .where(
        and(eq(bookmark.jobSeekerId, jobSeekerId), eq(bookmark.jobId, jobId)),
      );
  }

  revalidatePath(`/job-seeker/jobs/${jobId}`);
  revalidatePath("/job-seeker/jobs");
  revalidatePath("/job-seeker/bookmarks");

  return { success: true as const, saved };
}
