"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  deleteResumeAsset,
  deleteResumeFolder,
} from "@/lib/server/resume-storage";

export async function deleteResume() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    throw new Error("Only signed-in job seekers can delete a resume.");
  }

  const existingResume = await db.query.resume.findFirst({
    columns: { id: true, publicId: true },
    where: eq(resume.userId, session.user.id),
  });

  if (!existingResume) {
    return {
      success: false as const,
      message: "No resume was found.",
    };
  }

  await db.delete(resume).where(eq(resume.id, existingResume.id));

  try {
    await deleteResumeAsset(existingResume.publicId);
    await deleteResumeFolder(session.user.id);
  } catch (error) {
    console.error("Unable to clean up the resume in Cloudinary:", error);
  }

  revalidatePath("/job-seeker/profile/edit");

  return {
    success: true as const,
    message: "Resume deleted successfully.",
  };
}
