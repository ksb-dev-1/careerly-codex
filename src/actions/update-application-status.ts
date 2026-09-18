"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { application, job } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function updateApplicationStatus(
  jobId: string,
  applicationId: string,
  status: "SHORTLISTED" | "REJECTED",
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can review applications.");
  }

  if (status !== "SHORTLISTED" && status !== "REJECTED") {
    throw new Error("Invalid application status.");
  }

  const ownedJob = await db.query.job.findFirst({
    columns: { id: true },
    where: and(eq(job.id, jobId), eq(job.employerId, session.user.id)),
  });

  if (!ownedJob) {
    throw new Error("Job not found.");
  }

  const allowedPreviousStatus =
    status === "SHORTLISTED"
      ? eq(application.status, "SUBMITTED")
      : inArray(application.status, ["SUBMITTED", "SHORTLISTED"]);

  const [updated] = await db
    .update(application)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(application.id, applicationId),
        eq(application.jobId, jobId),
        allowedPreviousStatus,
      ),
    )
    .returning({ id: application.id });

  if (!updated) {
    throw new Error("This application cannot be updated.");
  }

  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/job-seeker/applications");
}
