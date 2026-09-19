import { headers } from "next/headers";
import Link from "next/link";

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

import { BookmarkButton } from "@/components/job-seeker/bookmark-button";
import { JobFilters } from "@/components/job-seeker/job-filters";
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

function formatSalary(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSalaryLabel({
  minimumSalary,
  maximumSalary,
  currency,
}: {
  minimumSalary: number | null;
  maximumSalary: number | null;
  currency: string;
}) {
  if (minimumSalary !== null && maximumSalary !== null) {
    return `${formatSalary(minimumSalary, currency)} – ${formatSalary(
      maximumSalary,
      currency,
    )}`;
  }

  if (minimumSalary !== null) {
    return `From ${formatSalary(minimumSalary, currency)}`;
  }

  if (maximumSalary !== null) {
    return `Up to ${formatSalary(maximumSalary, currency)}`;
  }

  return "Salary not specified";
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

      <JobFilters
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
      />

      {jobs.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active jobs match these filters.
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
                      {currentJob.minimumExperience}–{currentJob.maximumExperience} years
                    </span>
                    <span>{getSalaryLabel(currentJob)}</span>
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
                            Application:{" "}
                            {appliedByJob.get(currentJob.id)?.toLowerCase()}
                          </span>
                        ) : null}
                        {savedJobIds.has(currentJob.id) ? (
                          <span>Saved</span>
                        ) : null}
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
            searchParams={{
              q: q || undefined,
              location: location || undefined,
              skill: skill || undefined,
              workplaceType: workplaceType || undefined,
              employmentType: employmentType || undefined,
              experience: experience === null ? undefined : String(experience),
              minimumSalary:
                minimumSalary === null ? undefined : String(minimumSalary),
              sort: sort === "NEWEST" ? undefined : sort,
            }}
            totalPages={totalPages}
          />
        </>
      )}
    </main>
  );
}
