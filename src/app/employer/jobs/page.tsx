import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { and, count, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { JobsPagination } from "@/components/jobs-pagination";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Your jobs | Careerly",
  description: "Manage your Careerly job postings.",
};

const JOBS_PER_PAGE = 5;

type EmployerJobsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function EmployerJobsPage({
  searchParams,
}: EmployerJobsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/");
  }

  const { page } = await searchParams;

  const parsedPage = typeof page === "string" ? Number.parseInt(page, 10) : 1;

  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const employerCondition = and(eq(job.employerId, session.user.id));

  const [{ totalJobs }] = await db
    .select({
      totalJobs: count(),
    })
    .from(job)
    .where(employerCondition);

  const totalPages = Math.max(1, Math.ceil(totalJobs / JOBS_PER_PAGE));

  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * JOBS_PER_PAGE;

  const jobs = await db.query.job.findMany({
    limit: JOBS_PER_PAGE,
    offset,
    orderBy: (job, { desc }) => [desc(job.createdAt)],
    where: employerCondition,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Your jobs</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your job postings.
          </p>
        </div>

        <Button asChild>
          <Link href="/employer/jobs/create">Create job</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-10 border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You have not created any jobs yet.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-10 space-y-4">
            {jobs.map((currentJob) => (
              <li className="border p-5" key={currentJob.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="font-semibold">
                      <Link
                        className="underline-offset-4 hover:underline"
                        href={`/employer/jobs/${currentJob.id}`}
                      >
                        {currentJob.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {currentJob.workplaceType
                        .replaceAll("_", " ")
                        .toLowerCase()}
                      {currentJob.location ? ` · ${currentJob.location}` : ""}
                    </p>
                  </div>

                  <span className="border px-2 py-1 text-xs">
                    {currentJob.status.toLowerCase()}
                  </span>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Created{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                  }).format(currentJob.createdAt)}
                </p>
              </li>
            ))}
          </ul>

          <JobsPagination
            basePath="/employer/jobs"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </main>
  );
}
