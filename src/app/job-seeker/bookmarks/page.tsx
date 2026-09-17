import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { BookmarkButton } from "@/components/job-seeker/bookmark-button";
import { JobsPagination } from "@/components/jobs-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { bookmark, employerProfile, job } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Saved jobs | Careerly",
  description: "Review jobs you have bookmarked on Careerly.",
};

const BOOKMARKS_PER_PAGE = 5;

type BookmarksPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "JOB_SEEKER") redirect("/");

  const { page } = await searchParams;
  const pageNumber = typeof page === "string" ? Number(page) : 1;
  const requestedPage =
    Number.isSafeInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  const [{ totalBookmarks }] = await db
    .select({ totalBookmarks: count() })
    .from(bookmark)
    .where(eq(bookmark.jobSeekerId, session.user.id));

  const totalPages = Math.max(1, Math.ceil(totalBookmarks / BOOKMARKS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  const savedJobs = await db
    .select({
      jobId: job.id,
      title: job.title,
      companyName: employerProfile.companyName,
      location: job.location,
      workplaceType: job.workplaceType,
      status: job.status,
      expiresAt: job.expiresAt,
      savedAt: bookmark.createdAt,
    })
    .from(bookmark)
    .innerJoin(job, eq(bookmark.jobId, job.id))
    .leftJoin(employerProfile, eq(job.employerId, employerProfile.userId))
    .where(eq(bookmark.jobSeekerId, session.user.id))
    .orderBy(desc(bookmark.createdAt), desc(bookmark.jobId))
    .limit(BOOKMARKS_PER_PAGE)
    .offset((currentPage - 1) * BOOKMARKS_PER_PAGE);

  const now = new Date();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Saved jobs</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Jobs you bookmarked for later.
      </p>

      {savedJobs.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have not saved any jobs yet.
            </p>
            <Link className="text-sm text-primary underline" href="/job-seeker/jobs">
              Browse jobs
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {savedJobs.map((savedJob) => {
              const available =
                savedJob.status === "PUBLISHED" &&
                (savedJob.expiresAt === null || savedJob.expiresAt > now);

              return (
                <Card key={savedJob.jobId}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {available ? (
                        <Link
                          className="hover:text-primary"
                          href={`/job-seeker/jobs/${savedJob.jobId}`}
                        >
                          {savedJob.title}
                        </Link>
                      ) : (
                        savedJob.title
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {savedJob.companyName ?? "Company"}
                      {savedJob.location ? ` · ${savedJob.location}` : ""}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {available
                        ? savedJob.workplaceType.replaceAll("_", " ").toLowerCase()
                        : "No longer available"}
                    </span>
                    <BookmarkButton initialSaved jobId={savedJob.jobId} />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <JobsPagination
              basePath="/job-seeker/bookmarks"
              currentPage={currentPage}
              totalPages={totalPages}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
