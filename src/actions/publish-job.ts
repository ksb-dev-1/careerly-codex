"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { employerProfile, job } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function publishJob(jobId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can publish jobs.");
  }

  const profile = await db.query.employerProfile.findFirst({
    columns: { companyName: true },
    where: eq(employerProfile.userId, session.user.id),
  });

  if (!profile?.companyName) {
    throw new Error("Complete your employer profile before publishing.");
  }

  const now = new Date();

  const [published] = await db
    .update(job)
    .set({
      status: "PUBLISHED",
      publishedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(job.id, jobId),
        eq(job.employerId, session.user.id),
        eq(job.status, "DRAFT"),
        or(isNull(job.expiresAt), gt(job.expiresAt, now)),
      ),
    )
    .returning({ id: job.id });

  if (!published) {
    throw new Error("This draft cannot be published.");
  }

  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);
}
