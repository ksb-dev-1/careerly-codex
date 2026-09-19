import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { and, count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { JobDescription } from "@/components/employer/job-description";
import { JobsPagination } from "@/components/jobs-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import {
  application,
  job,
  jobSeekerProfile,
  resume,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { ApplicationStatusActions } from "./application-status-action";
import { CloseJobButton } from "./close-job-button";
import { PublishJobButton } from "./publish-job-button";

export const metadata: Metadata = {
  title: "Job details | Careerly",
  description: "Review a job posting you created.",
};

export default async function EmployerJobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYER") redirect("/");

  const { jobId } = await params;

  const listing = await db.query.job.findFirst({
    where: and(eq(job.id, jobId), eq(job.employerId, session.user.id)),
  });

  if (!listing) notFound();

  const [{ applicationCount }] = await db
    .select({ applicationCount: count() })
    .from(application)
    .where(eq(application.jobId, listing.id));

  const { page } = await searchParams;
  const pageNumber = typeof page === "string" ? Number(page) : 1;
  const requestedPage =
    Number.isSafeInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const totalPages = Math.max(1, Math.ceil(applicationCount / 5));
  const currentPage = Math.min(requestedPage, totalPages);

  const applicants = await db
    .select({
      id: application.id,
      name: user.name,
      email: user.email,
      status: application.status,
      appliedAt: application.createdAt,
      coverLetter: application.coverLetter,
      headline: jobSeekerProfile.headline,
      experience: jobSeekerProfile.experience,
      location: jobSeekerProfile.location,
      skills: jobSeekerProfile.skills,
      resumeId: resume.id,
      resumeFileName: resume.fileName,
    })
    .from(application)
    .innerJoin(user, eq(application.jobSeekerId, user.id))
    .leftJoin(
      jobSeekerProfile,
      eq(application.jobSeekerId, jobSeekerProfile.userId),
    )
    .leftJoin(resume, eq(application.jobSeekerId, resume.userId))
    .where(eq(application.jobId, listing.id))
    .orderBy(desc(application.createdAt), desc(application.id))
    .limit(5)
    .offset((currentPage - 1) * 5);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
      <Link className="text-sm underline" href="/employer/jobs">
        Back to your jobs
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="text-sm text-muted-foreground">
          Status: {listing.status.toLowerCase()}
        </p>
        <p className="text-sm text-muted-foreground">
          Applications: {applicationCount}
        </p>
        {listing.status === "DRAFT" ? (
          <PublishJobButton jobId={listing.id} />
        ) : null}
        {listing.status === "PUBLISHED" ? (
          <CloseJobButton jobId={listing.id} />
        ) : null}
        {listing.status !== "CLOSED" ? (
          <Link
            className="inline-block text-sm underline"
            href={`/employer/jobs/${listing.id}/edit`}
          >
            Edit job
          </Link>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Description</h2>
        <JobDescription content={listing.description} />
      </section>

      <section className="space-y-2 text-sm">
        <p>Employment: {listing.employmentType.replaceAll("_", " ")}</p>
        <p>Workplace: {listing.workplaceType.replaceAll("_", " ")}</p>
        <p>
          Experience: {listing.minimumExperience}–{listing.maximumExperience}{" "}
          years
        </p>
        <p>Location: {listing.location || "Not specified"}</p>
        <p>Openings: {listing.openings}</p>
        <p>Skills: {listing.skills.join(", ")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Applicants</h2>
        {applicants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applicants.map((applicant) => (
              <Card key={applicant.id}>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-medium">{applicant.name}</p>
                  <p>{applicant.email}</p>
                  {applicant.headline ? <p>{applicant.headline}</p> : null}
                  <p className="text-muted-foreground">
                    Experience: {applicant.experience || "Not provided"}
                  </p>
                  <p className="text-muted-foreground">
                    Location: {applicant.location || "Not provided"}
                  </p>
                  <p className="text-muted-foreground">
                    Skills:{" "}
                    {applicant.skills?.length
                      ? applicant.skills.join(", ")
                      : "Not provided"}
                  </p>
                  {applicant.resumeId ? (
                    <Button asChild type="button" variant="outline">
                      <Link
                        href={`/api/resumes/${applicant.resumeId}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Download {applicant.resumeFileName ?? "resume"}
                      </Link>
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">
                      Resume: Not available
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    Status: {applicant.status.toLowerCase()}
                  </p>
                  <p className="text-muted-foreground">
                    Applied{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(applicant.appliedAt)}
                  </p>

                  {applicant.coverLetter ? (
                    <div className="pt-2">
                      <p className="font-medium">Cover letter</p>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {applicant.coverLetter}
                      </p>
                    </div>
                  ) : null}

                  <ApplicationStatusActions
                    jobId={listing.id}
                    applicationId={applicant.id}
                    status={applicant.status}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {totalPages > 1 ? (
          <JobsPagination
            basePath={`/employer/jobs/${listing.id}`}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        ) : null}
      </section>
    </main>
  );
}
