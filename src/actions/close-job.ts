"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function closeJob(jobId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can close jobs.");
  }

  const [closed] = await db
    .update(job)
    .set({
      status: "CLOSED",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(job.id, jobId),
        eq(job.employerId, session.user.id),
        eq(job.status, "PUBLISHED"),
      ),
    )
    .returning({ id: job.id });

  if (!closed) {
    throw new Error("This job cannot be closed.");
  }

  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);
}
