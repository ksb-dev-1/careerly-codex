import { headers } from "next/headers";
import Link from "next/link";

import { SearchX } from "lucide-react";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { Metadata } from "next";

import { JobFilters } from "@/components/job-seeker/job-filters";
import { JobCard } from "@/components/job-seeker/job-card";
import { JobsPagination } from "@/components/jobs-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    q?: string | string[];
    location?: string | string[];
    skill?: string | string[];
    workplaceType?: string | string[];
    employmentType?: string | string[];
    experience?: string | string[];
    minimumSalary?: string | string[];
    sort?: string | string[];
  }>;
};

const workplaceTypes = ["ONSITE", "REMOTE", "HYBRID"] as const;
const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
] as const;
const sortOptions = [
  "NEWEST",
  "OLDEST",
  "SALARY_HIGH",
  "SALARY_LOW",
] as const;

function getSingleSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

function getAllowedValue<T extends readonly string[]>(
  value: string,
  allowedValues: T,
) {
  return allowedValues.includes(value as T[number])
    ? (value as T[number])
    : "";
}

function getPositiveNumber(value: string) {
  if (!value) return null;

  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

export default async function JobSeekerJobsPage({
  searchParams,
}: JobSeekerJobsPageProps) {
  const params = await searchParams;
  const { page } = params;

  const q = getSingleSearchParam(params.q);
  const location = getSingleSearchParam(params.location);
  const skill = getSingleSearchParam(params.skill);
  const workplaceType = getAllowedValue(
    getSingleSearchParam(params.workplaceType),
    workplaceTypes,
  );
  const employmentType = getAllowedValue(
    getSingleSearchParam(params.employmentType),
    employmentTypes,
  );
  const experience = getPositiveNumber(getSingleSearchParam(params.experience));
  const minimumSalary = getPositiveNumber(
    getSingleSearchParam(params.minimumSalary),
  );
  const sort = getAllowedValue(
    getSingleSearchParam(params.sort),
    sortOptions,
  ) || "NEWEST";
  const hasActiveFilters = Boolean(
    q ||
      location ||
      skill ||
      workplaceType ||
      employmentType ||
      experience !== null ||
      minimumSalary !== null ||
      sort !== "NEWEST",
  );
  const filterKey = [
    q,
    location,
    skill,
    workplaceType,
    employmentType,
    experience,
    minimumSalary,
    sort,
  ].join("|");

  const parsedPage = typeof page === "string" ? Number.parseInt(page, 10) : 1;

  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const now = new Date();

  const activeJobCondition = and(
    eq(job.status, "PUBLISHED"),
    or(isNull(job.expiresAt), gt(job.expiresAt, now)),
  )!;

  const jobConditions = [activeJobCondition];

  if (q) {
    const searchPattern = `%${q}%`;
    jobConditions.push(
      or(
        ilike(job.title, searchPattern),
        ilike(job.description, searchPattern),
        ilike(employerProfile.companyName, searchPattern),
        ilike(job.location, searchPattern),
        ilike(sql<string>`array_to_string(${job.skills}, ' ')`, searchPattern),
      )!,
    );
  }

  if (location) {
    jobConditions.push(ilike(job.location, `%${location}%`));
  }

  if (skill) {
    jobConditions.push(
      ilike(sql<string>`array_to_string(${job.skills}, ' ')`, `%${skill}%`),
    );
  }

  if (workplaceType) {
    jobConditions.push(eq(job.workplaceType, workplaceType));
  }

  if (employmentType) {
    jobConditions.push(eq(job.employmentType, employmentType));
  }

  if (experience !== null) {
    jobConditions.push(
      and(
        lte(job.minimumExperience, experience),
        gte(job.maximumExperience, experience),
      )!,
    );
  }

  if (minimumSalary !== null) {
    jobConditions.push(gte(job.maximumSalary, minimumSalary));
  }

  const filteredJobCondition = and(...jobConditions);

  const jobOrder =
    sort === "OLDEST"
      ? asc(job.publishedAt)
      : sort === "SALARY_HIGH"
        ? sql`${job.maximumSalary} DESC NULLS LAST`
        : sort === "SALARY_LOW"
          ? sql`${job.minimumSalary} ASC NULLS LAST`
          : desc(job.publishedAt);

  const [{ totalJobs }] = await db
    .select({
      totalJobs: count(),
    })
    .from(job)
    .leftJoin(employerProfile, eq(employerProfile.userId, job.employerId))
    .where(filteredJobCondition);

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
      minimumExperience: job.minimumExperience,
      maximumExperience: job.maximumExperience,
      minimumSalary: job.minimumSalary,
      maximumSalary: job.maximumSalary,
      currency: job.currency,
      skills: job.skills,
      publishedAt: job.publishedAt,
    })
    .from(job)
    .leftJoin(employerProfile, eq(employerProfile.userId, job.employerId))
    .where(filteredJobCondition)
    .orderBy(jobOrder)
    .limit(JOBS_PER_PAGE)
    .offset(offset);

  const session = await auth.api.getSession({ headers: await headers() });
  const appliedByJob = new Map<
    string,
    (typeof application.$inferSelect)["status"]
  >();
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
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Find your next job
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search opportunities from employers hiring on Careerly.
        </p>
      </header>

      <JobFilters
        key={filterKey}
        initialFilters={{
          q,
          location,
          skill,
          workplaceType,
          employmentType,
          experience: experience === null ? "" : String(experience),
          minimumSalary:
            minimumSalary === null ? "" : String(minimumSalary),
          sort,
        }}
      >
        <section aria-labelledby="job-results-title">
        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="job-results-title" className="text-xl font-semibold tracking-tight">
              {totalJobs} {totalJobs === 1 ? "opportunity" : "opportunities"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              {totalJobs > 0
                ? `Showing ${offset + 1}–${Math.min(
                    offset + jobs.length,
                    totalJobs,
                  )} of ${totalJobs}`
                : "Try broadening your search to see more roles."}
            </p>
          </div>
          {totalPages > 1 ? (
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          ) : null}
        </div>

        {jobs.length === 0 ? (
          <Card className="mt-6 border-dashed">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <SearchX aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                {hasActiveFilters ? "No matching jobs" : "No active jobs yet"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {hasActiveFilters
                  ? "Try removing one or two filters, or search with a broader keyword."
                  : "New opportunities will appear here as soon as employers publish them."}
              </p>
              {hasActiveFilters ? (
                <Button asChild className="mt-5" variant="outline">
                  <Link href="/job-seeker/jobs">Clear all filters</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-4 grid gap-4">
              {jobs.map((currentJob) => (
                <JobCard
                  applicationStatus={appliedByJob.get(currentJob.id)}
                  isJobSeeker={session?.user.role === "JOB_SEEKER"}
                  isSaved={savedJobIds.has(currentJob.id)}
                  job={currentJob}
                  key={currentJob.id}
                />
              ))}
            </div>

            <JobsPagination
              basePath="/job-seeker/jobs"
              currentPage={currentPage}
              searchParams={{
                q: q || undefined,
                location: location || undefined,
                skill: skill || undefined,
                workplaceType: workplaceType || undefined,
                employmentType: employmentType || undefined,
                experience:
                  experience === null ? undefined : String(experience),
                minimumSalary:
                  minimumSalary === null ? undefined : String(minimumSalary),
                sort: sort === "NEWEST" ? undefined : sort,
              }}
              totalPages={totalPages}
            />
          </>
        )}
        </section>
      </JobFilters>
    </main>
  );
}
