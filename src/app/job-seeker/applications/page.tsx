import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { JobsPagination } from "@/components/jobs-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { application, employerProfile, job } from "@/db/schema";
import { auth } from "@/lib/auth";

import { WithdrawApplicationButton } from "./withdraw-application-button";

export const metadata: Metadata = {
  title: "Your applications | Careerly",
  description: "Track the jobs you have applied to on Careerly.",
};

const APPLICATIONS_PER_PAGE = 5;

type ApplicationsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "JOB_SEEKER") redirect("/");

  const { page } = await searchParams;
  const pageNumber = typeof page === "string" ? Number(page) : 1;
  const requestedPage =
    Number.isSafeInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  const [{ totalApplications }] = await db
    .select({ totalApplications: count() })
    .from(application)
    .where(eq(application.jobSeekerId, session.user.id));

  const totalPages = Math.max(
    1,
    Math.ceil(totalApplications / APPLICATIONS_PER_PAGE),
  );
  const currentPage = Math.min(requestedPage, totalPages);

  const applications = await db
    .select({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      jobId: job.id,
      jobTitle: job.title,
      jobStatus: job.status,
      companyName: employerProfile.companyName,
    })
    .from(application)
    .innerJoin(job, eq(application.jobId, job.id))
    .leftJoin(employerProfile, eq(job.employerId, employerProfile.userId))
    .where(eq(application.jobSeekerId, session.user.id))
    .orderBy(desc(application.createdAt), desc(application.id))
    .limit(APPLICATIONS_PER_PAGE)
    .offset((currentPage - 1) * APPLICATIONS_PER_PAGE);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Your applications</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Track the jobs you have applied to.
      </p>

      {applications.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You haven’t applied to any jobs yet.
            </p>
            <Link
              className="text-sm text-primary underline"
              href="/job-seeker/jobs"
            >
              Browse jobs
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {applications.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {item.jobStatus === "PUBLISHED" ? (
                      <Link
                        className="hover:text-primary"
                        href={`/job-seeker/jobs/${item.jobId}`}
                      >
                        {item.jobTitle}
                      </Link>
                    ) : (
                      item.jobTitle
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.companyName ?? "Company"}
                  </p>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    Status:{" "}
                    <span className="font-medium">
                      {item.status.toLowerCase()}
                    </span>
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Applied{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(item.createdAt)}
                  </p>
                  {item.status === "SUBMITTED" ||
                  item.status === "SHORTLISTED" ? (
                    <div className="mt-4">
                      <WithdrawApplicationButton applicationId={item.id} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 ? (
            <JobsPagination
              basePath="/job-seeker/applications"
              currentPage={currentPage}
              totalPages={totalPages}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
