import { headers } from "next/headers";
import Link from "next/link";

import { and, count, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import type { Metadata } from "next";

import { BookmarkButton } from "@/components/job-seeker/bookmark-button";
import { JobsPagination } from "@/components/jobs-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { application, bookmark, employerProfile, job } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Find jobs | Careerly",
  description: "Browse active job opportunities on Careerly.",
};

export const dynamic = "force-dynamic";

const JOBS_PER_PAGE = 5;

type JobSeekerJobsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function JobSeekerJobsPage({
  searchParams,
}: JobSeekerJobsPageProps) {
  const { page } = await searchParams;

  const parsedPage = typeof page === "string" ? Number.parseInt(page, 10) : 1;

  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const now = new Date();

  const activeJobCondition = and(
    eq(job.status, "PUBLISHED"),
    or(isNull(job.expiresAt), gt(job.expiresAt, now)),
  );

  const [{ totalJobs }] = await db
    .select({
      totalJobs: count(),
    })
    .from(job)
    .where(activeJobCondition);

  const totalPages = Math.max(1, Math.ceil(totalJobs / JOBS_PER_PAGE));

  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * JOBS_PER_PAGE;

  const jobs = await db
    .select({
      id: job.id,
      title: job.title,
      companyName: employerProfile.companyName,
      location: job.location,
      workplaceType: job.workplaceType,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      skills: job.skills,
      publishedAt: job.publishedAt,
    })
    .from(job)
    .leftJoin(employerProfile, eq(employerProfile.userId, job.employerId))
    .where(activeJobCondition)
    .orderBy(desc(job.publishedAt))
    .limit(JOBS_PER_PAGE)
    .offset(offset);

  const session = await auth.api.getSession({ headers: await headers() });
  const appliedByJob = new Map<string, string>();
  const savedJobIds = new Set<string>();

  if (session?.user.role === "JOB_SEEKER" && jobs.length > 0) {
    const jobIds = jobs.map((currentJob) => currentJob.id);
    const [applications, bookmarks] = await Promise.all([
      db.query.application.findMany({
        columns: { jobId: true, status: true },
        where: and(
          eq(application.jobSeekerId, session.user.id),
          inArray(application.jobId, jobIds),
        ),
      }),
      db.query.bookmark.findMany({
        columns: { jobId: true },
        where: and(
          eq(bookmark.jobSeekerId, session.user.id),
          inArray(bookmark.jobId, jobIds),
        ),
      }),
    ]);

    for (const item of applications) appliedByJob.set(item.jobId, item.status);
    for (const item of bookmarks) savedJobIds.add(item.jobId);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Find jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore current opportunities from employers on Careerly.
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            There are no active jobs available right now.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4">
            {jobs.map((currentJob) => (
              <Card key={currentJob.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link
                      className="hover:text-primary"
                      href={`/job-seeker/jobs/${currentJob.id}`}
                    >
                      {currentJob.title}
                    </Link>
                  </CardTitle>

                  <p className="text-sm text-muted-foreground">
                    {currentJob.companyName ?? "Company"}
                    {currentJob.location ? ` · ${currentJob.location}` : ""}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span>
                      {currentJob.employmentType
                        .replaceAll("_", " ")
                        .toLowerCase()}
                    </span>

                    <span>
                      {currentJob.workplaceType
                        .replaceAll("_", " ")
                        .toLowerCase()}
                    </span>

                    <span>
                      {currentJob.experienceLevel.toLowerCase()} level
                    </span>
                  </div>

                  {currentJob.skills.length > 0 ? (
                    <p className="mt-4 text-sm">
                      {currentJob.skills.join(" · ")}
                    </p>
                  ) : null}

                  {session?.user.role === "JOB_SEEKER" ? (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3 text-sm font-medium text-primary">
                        {appliedByJob.has(currentJob.id) ? (
                          <span>
                            Application: {appliedByJob.get(currentJob.id)?.toLowerCase()}
                          </span>
                        ) : null}
                        {savedJobIds.has(currentJob.id) ? <span>Saved</span> : null}
                      </div>
                      <BookmarkButton
                        initialSaved={savedJobIds.has(currentJob.id)}
                        jobId={currentJob.id}
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          <JobsPagination
            basePath="/job-seeker/jobs"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </main>
  );
}
