import { cache } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { and, eq, gt, isNull, or } from "drizzle-orm";
import type { Metadata } from "next";

import { JobDescription } from "@/components/employer/job-description";
import { BookmarkButton } from "@/components/job-seeker/bookmark-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { application, bookmark, employerProfile, job } from "@/db/schema";
import { auth } from "@/lib/auth";

import { ApplyToJobForm } from "./apply-to-job-form";

export const dynamic = "force-dynamic";

type JobDetailsPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

const getJob = cache(async (jobId: string) => {
  const [listing] = await db
    .select({
      id: job.id,
      title: job.title,
      description: job.description,
      companyName: employerProfile.companyName,
      location: job.location,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      minimumExperience: job.minimumExperience,
      maximumExperience: job.maximumExperience,
      minimumSalary: job.minimumSalary,
      maximumSalary: job.maximumSalary,
      currency: job.currency,
      openings: job.openings,
      skills: job.skills,
      publishedAt: job.publishedAt,
    })
    .from(job)
    .leftJoin(employerProfile, eq(employerProfile.userId, job.employerId))
    .where(
      and(
        eq(job.id, jobId),
        eq(job.status, "PUBLISHED"),
        or(isNull(job.expiresAt), gt(job.expiresAt, new Date())),
      ),
    )
    .limit(1);

  return listing;
});

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const { jobId } = await params;
  const listing = await getJob(jobId);

  if (!listing) {
    return {
      title: "Job not found | Careerly",
      description: "This job is no longer available.",
    };
  }

  return {
    title: `${listing.title} | Careerly`,
    description: `View the ${listing.title} opportunity at ${
      listing.companyName ?? "Careerly"
    }.`,
  };
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}

function formatSalary(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { jobId } = await params;
  const listing = await getJob(jobId);

  if (!listing) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const existingApplication =
    session?.user.role === "JOB_SEEKER"
      ? await db.query.application.findFirst({
          columns: {
            status: true,
            createdAt: true,
          },
          where: and(
            eq(application.jobId, listing.id),
            eq(application.jobSeekerId, session.user.id),
          ),
        })
      : null;

  const existingBookmark =
    session?.user.role === "JOB_SEEKER"
      ? await db.query.bookmark.findFirst({
          columns: { jobId: true },
          where: and(
            eq(bookmark.jobId, listing.id),
            eq(bookmark.jobSeekerId, session.user.id),
          ),
        })
      : null;

  const salary =
    listing.minimumSalary !== null && listing.maximumSalary !== null
      ? `${formatSalary(
          listing.minimumSalary,
          listing.currency,
        )} – ${formatSalary(listing.maximumSalary, listing.currency)}`
      : listing.minimumSalary !== null
        ? `From ${formatSalary(listing.minimumSalary, listing.currency)}`
        : listing.maximumSalary !== null
          ? `Up to ${formatSalary(listing.maximumSalary, listing.currency)}`
          : "Not specified";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        className="text-sm text-muted-foreground hover:text-foreground"
        href="/job-seeker/jobs"
      >
        ← Back to jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{listing.title}</CardTitle>

            <p className="text-muted-foreground">
              {listing.companyName ?? "Company"}
              {listing.location ? ` · ${listing.location}` : ""}
            </p>
          </CardHeader>

          <CardContent>
            <JobDescription content={listing.description} />
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job overview</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Employment:</span>{" "}
                {formatLabel(listing.employmentType)}
              </p>

              <p>
                <span className="font-medium">Workplace:</span>{" "}
                {formatLabel(listing.workplaceType)}
              </p>

              <p>
                <span className="font-medium">Experience:</span>{" "}
                {listing.minimumExperience}–{listing.maximumExperience} years
              </p>

              <p>
                <span className="font-medium">Salary:</span> {salary}
              </p>

              <p>
                <span className="font-medium">Openings:</span>{" "}
                {listing.openings}
              </p>

              <div>
                <p className="font-medium">Skills:</p>
                <p className="mt-1 text-muted-foreground">
                  {listing.skills.length > 0
                    ? listing.skills.join(", ")
                    : "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {session?.user.role === "JOB_SEEKER" ? (
            <BookmarkButton
              className="w-full"
              initialSaved={Boolean(existingBookmark)}
              jobId={listing.id}
            />
          ) : null}

          {session?.user.role === "JOB_SEEKER" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application</CardTitle>
              </CardHeader>

              <CardContent>
                {existingApplication ? (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-primary">
                      You have applied to this job.
                    </p>

                    <p className="text-muted-foreground">
                      Status: {formatLabel(existingApplication.status)}
                    </p>

                    <p className="text-muted-foreground">
                      Applied{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                      }).format(existingApplication.createdAt)}
                    </p>
                  </div>
                ) : (
                  <ApplyToJobForm jobId={listing.id} />
                )}
              </CardContent>
            </Card>
          ) : !session ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Interested in this job?
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign in as a job seeker to apply.
                </p>

                <Button asChild className="w-full">
                  <Link href="/sign-in">Sign in to apply</Link>
                </Button>
              </CardContent>
            </Card>
          ) : session.user.role === null ? (
            <Card>
              <CardContent className="pt-6">
                <Button asChild className="w-full">
                  <Link href="/select-user-role">Choose job seeker role</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
