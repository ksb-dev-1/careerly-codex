"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";
import { assertMutationRateLimit } from "@/lib/server/rate-limit";

export async function deleteDraftJob(jobId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can delete jobs.");
  }

  await assertMutationRateLimit({
    userId: session.user.id,
    action: "delete-draft-job",
    limit: 10,
    windowMs: 60 * 60 * 1_000,
  });

  const [deleted] = await db
    .delete(job)
    .where(
      and(
        eq(job.id, jobId),
        eq(job.employerId, session.user.id),
        eq(job.status, "DRAFT"),
      ),
    )
    .returning({ id: job.id });

  if (!deleted) {
    return {
      success: false as const,
      message: "Only a draft job that belongs to you can be deleted.",
    };
  }

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");

  return { success: true as const };
}
