import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { application, job, resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getResumeDownloadUrl } from "@/lib/server/resume-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { resumeId } = await params;
  const currentResume = await db.query.resume.findFirst({
    where: eq(resume.id, resumeId),
  });

  if (!currentResume) {
    return NextResponse.json({ message: "Resume not found." }, { status: 404 });
  }

  const ownsResume =
    session.user.role === "JOB_SEEKER" &&
    currentResume.userId === session.user.id;

  let canReviewResume = false;

  if (session.user.role === "EMPLOYER") {
    const relatedApplication = await db
      .select({ id: application.id })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .where(
        and(
          eq(application.jobSeekerId, currentResume.userId),
          eq(job.employerId, session.user.id),
        ),
      )
      .limit(1);

    canReviewResume = relatedApplication.length > 0;
  }

  if (!ownsResume && !canReviewResume) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const downloadUrl = getResumeDownloadUrl(
    currentResume.publicId,
    currentResume.fileName,
  );

  return NextResponse.redirect(downloadUrl);
}
