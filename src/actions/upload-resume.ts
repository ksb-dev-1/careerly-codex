"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  deleteResumeAsset,
  uploadResumeAsset,
} from "@/lib/server/resume-storage";
import { validateResumeFile } from "@/lib/validations/resume";

export async function uploadResume(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    throw new Error("Only signed-in job seekers can upload a resume.");
  }

  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return {
      success: false as const,
      message: "Choose a resume file.",
    };
  }

  const validationMessage = validateResumeFile(file);

  if (validationMessage) {
    return {
      success: false as const,
      message: validationMessage,
    };
  }

  const existingResume = await db.query.resume.findFirst({
    columns: { publicId: true },
    where: eq(resume.userId, session.user.id),
  });

  let uploaded: Awaited<ReturnType<typeof uploadResumeAsset>>;

  try {
    uploaded = await uploadResumeAsset(file, session.user.id);
  } catch {
    return {
      success: false as const,
      message: "Unable to upload the resume.",
    };
  }

  try {
    await db
      .insert(resume)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        fileName: file.name,
        fileSize: uploaded.bytes,
      })
      .onConflictDoUpdate({
        target: resume.userId,
        set: {
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
          fileName: file.name,
          fileSize: uploaded.bytes,
          updatedAt: new Date(),
        },
      });
  } catch {
    await deleteResumeAsset(uploaded.public_id).catch(() => undefined);

    return {
      success: false as const,
      message: "Unable to save the resume.",
    };
  }

  if (existingResume && existingResume.publicId !== uploaded.public_id) {
    await deleteResumeAsset(existingResume.publicId).catch((error) => {
      console.error("Unable to delete the previous resume:", error);
    });
  }

  revalidatePath("/job-seeker/profile/edit");

  return {
    success: true as const,
    message: "Resume uploaded successfully.",
  };
}
