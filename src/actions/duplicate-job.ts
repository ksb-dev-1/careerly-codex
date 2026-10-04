"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";

function createCopyTitle(title: string) {
  const suffix = " (Copy)";

  return `${title.slice(0, 120 - suffix.length).trimEnd()}${suffix}`;
}

export async function duplicateJob(jobId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "EMPLOYER") {
    throw new Error("Only signed-in employers can duplicate jobs.");
  }

  const source = await db.query.job.findFirst({
    where: and(eq(job.id, jobId), eq(job.employerId, session.user.id)),
  });

  if (!source) {
    return {
      success: false as const,
      message: "This job could not be found.",
    };
  }

  const now = new Date();
  const [created] = await db
    .insert(job)
    .values({
      id: crypto.randomUUID(),
      employerId: session.user.id,
      title: createCopyTitle(source.title),
      description: source.description,
      location: source.location,
      employmentType: source.employmentType,
      workplaceType: source.workplaceType,
      minimumExperience: source.minimumExperience,
      maximumExperience: source.maximumExperience,
      minimumSalary: source.minimumSalary,
      maximumSalary: source.maximumSalary,
      currency: source.currency,
      openings: source.openings,
      skills: source.skills,
      status: "DRAFT",
      publishedAt: null,
      expiresAt:
        source.expiresAt && source.expiresAt > now ? source.expiresAt : null,
    })
    .returning({ id: job.id });

  if (!created) {
    throw new Error("Unable to duplicate the job.");
  }

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");

  return { success: true as const, jobId: created.id };
}
