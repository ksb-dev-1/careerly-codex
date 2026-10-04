"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  application,
  employerProfile,
  job,
  notification,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { assertMutationRateLimit } from "@/lib/server/rate-limit";
import { sendApplicationStatusEmail } from "@/lib/server/send-application-status-email";

export async function updateApplicationStatus(
  jobId: string,
  applicationId: string,
  status: "SHORTLISTED" | "REJECTED",
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can review applications.");
  }

  if (status !== "SHORTLISTED" && status !== "REJECTED") {
    throw new Error("Invalid application status.");
  }

  await assertMutationRateLimit({
    userId: session.user.id,
    action: "update-application-status",
    limit: 60,
    windowMs: 60 * 60 * 1_000,
  });

  const updatedAt = new Date();
  const result = await db.transaction(async (tx) => {
    const [target] = await tx
      .select({
        applicantId: user.id,
        applicantName: user.name,
        applicantEmail: user.email,
        jobTitle: job.title,
        companyName: employerProfile.companyName,
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .innerJoin(user, eq(application.jobSeekerId, user.id))
      .leftJoin(employerProfile, eq(job.employerId, employerProfile.userId))
      .where(
        and(
          eq(application.id, applicationId),
          eq(application.jobId, jobId),
          eq(job.employerId, session.user.id),
        ),
      )
      .limit(1);

    if (!target) return null;

    const allowedPreviousStatus =
      status === "SHORTLISTED"
        ? eq(application.status, "SUBMITTED")
        : inArray(application.status, ["SUBMITTED", "SHORTLISTED"]);

    const [updated] = await tx
      .update(application)
      .set({ status, updatedAt })
      .where(
        and(
          eq(application.id, applicationId),
          eq(application.jobId, jobId),
          allowedPreviousStatus,
        ),
      )
      .returning({ id: application.id });

    if (!updated) return null;

    const shortlisted = status === "SHORTLISTED";
    await tx.insert(notification).values({
      id: crypto.randomUUID(),
      recipientUserId: target.applicantId,
      type: shortlisted ? "APPLICATION_SHORTLISTED" : "APPLICATION_REJECTED",
      title: shortlisted ? "Application shortlisted" : "Application update",
      message: shortlisted
        ? `${target.companyName ?? "An employer"} shortlisted you for ${target.jobTitle}.`
        : `${target.companyName ?? "An employer"} did not move forward with your application for ${target.jobTitle}.`,
      href: "/job-seeker/applications",
      createdAt: updatedAt,
    });

    return target;
  });

  if (!result) {
    throw new Error("This application cannot be updated.");
  }

  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/job-seeker/applications");
  revalidatePath("/job-seeker/dashboard");
  revalidatePath("/notifications");

  const applicationUrl = process.env.BETTER_AUTH_URL;

  if (!applicationUrl) {
    console.error(
      `Application ${applicationId} was updated, but BETTER_AUTH_URL is not configured.`,
    );
  } else {
    try {
      await sendApplicationStatusEmail({
        applicationId,
        updatedAt: updatedAt.toISOString(),
        recipientEmail: result.applicantEmail,
        applicantName: result.applicantName,
        companyName: result.companyName ?? "the employer",
        jobTitle: result.jobTitle,
        status,
        applicationsUrl: new URL(
          "/job-seeker/applications",
          applicationUrl,
        ).toString(),
      });
    } catch (error) {
      console.error(
        `Application ${applicationId} was updated, but its status email could not be sent:`,
        error,
      );
    }
  }

  return { success: true as const };
}
