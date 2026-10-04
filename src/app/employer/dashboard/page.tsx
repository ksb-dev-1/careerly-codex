import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { and, count, desc, eq, gte } from "drizzle-orm";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleStop,
  Clock3,
  FilePlus2,
  FileText,
  Send,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { application, employerProfile, job, user } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Employer dashboard | Careerly",
  description:
    "Review your job postings, recent applicants, and hiring activity on Careerly.",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

type ApplicationStatus =
  | "SUBMITTED"
  | "SHORTLISTED"
  | "REJECTED"
  | "WITHDRAWN";

type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

function formatStatus(status: ApplicationStatus | JobStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getApplicationStatusVariant(status: ApplicationStatus) {
  if (status === "SHORTLISTED") return "default" as const;
  if (status === "REJECTED") return "destructive" as const;
  if (status === "WITHDRAWN") return "outline" as const;
  return "secondary" as const;
}

function getJobStatusVariant(status: JobStatus) {
  if (status === "PUBLISHED") return "default" as const;
  if (status === "CLOSED") return "outline" as const;
  return "secondary" as const;
}

export default async function EmployerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYER") redirect("/");

  const employerId = session.user.id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    jobStatusRows,
    [applicantSummary],
    [recentApplicantSummary],
    recentApplications,
    jobPerformance,
    [profile],
  ] = await Promise.all([
    db
      .select({ status: job.status, total: count() })
      .from(job)
      .where(eq(job.employerId, employerId))
      .groupBy(job.status),
    db
      .select({ total: count() })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .where(eq(job.employerId, employerId)),
    db
      .select({ total: count() })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .where(
        and(
          eq(job.employerId, employerId),
          gte(application.createdAt, sevenDaysAgo),
        ),
      ),
    db
      .select({
        id: application.id,
        applicantName: user.name,
        jobId: job.id,
        jobTitle: job.title,
        status: application.status,
        appliedAt: application.createdAt,
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .innerJoin(user, eq(application.jobSeekerId, user.id))
      .where(eq(job.employerId, employerId))
      .orderBy(desc(application.createdAt), desc(application.id))
      .limit(5),
    db
      .select({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
        applications: count(application.id),
      })
      .from(job)
      .leftJoin(application, eq(application.jobId, job.id))
      .where(eq(job.employerId, employerId))
      .groupBy(job.id, job.title, job.status, job.createdAt)
      .orderBy(desc(count(application.id)), desc(job.createdAt))
      .limit(5),
    db
      .select({ companyName: employerProfile.companyName })
      .from(employerProfile)
      .where(eq(employerProfile.userId, employerId))
      .limit(1),
  ]);

  const jobCounts: Record<JobStatus, number> = {
    DRAFT: 0,
    PUBLISHED: 0,
    CLOSED: 0,
  };

  for (const row of jobStatusRows) jobCounts[row.status] = row.total;

  const totalJobs = Object.values(jobCounts).reduce(
    (total, value) => total + value,
    0,
  );
  const totalApplicants = applicantSummary?.total ?? 0;
  const recentApplicants = recentApplicantSummary?.total ?? 0;
  const reviewApplicantsHref = "/employer/jobs";

  const summaryCards = [
    { label: "Total jobs", value: totalJobs, icon: BriefcaseBusiness },
    { label: "Published", value: jobCounts.PUBLISHED, icon: CheckCircle2 },
    { label: "Drafts", value: jobCounts.DRAFT, icon: FileText },
    { label: "Closed", value: jobCounts.CLOSED, icon: CircleStop },
    { label: "Total applicants", value: totalApplicants, icon: UsersRound },
    { label: "New in 7 days", value: recentApplicants, icon: Clock3 },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Employer dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            Welcome back, {profile?.companyName ?? session.user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor your job postings and applicant activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={reviewApplicantsHref}>
              <UsersRound data-icon="inline-start" />
              Review applicants
            </Link>
          </Button>
          <Button asChild>
            <Link href="/employer/jobs/create">
              <FilePlus2 data-icon="inline-start" />
              Create job
            </Link>
          </Button>
        </div>
      </div>

      <section aria-labelledby="employer-summary" className="mt-8">
        <h2 className="sr-only" id="employer-summary">
          Employer summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {summaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label} size="sm">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground">
                    {item.label}
                  </CardTitle>
                  <CardAction>
                    <Icon aria-hidden="true" className="size-4 text-primary" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{item.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent applicants</CardTitle>
            <CardDescription>
              The five latest applications across your jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="py-10 text-center">
                <UsersRound
                  aria-hidden="true"
                  className="mx-auto size-8 text-muted-foreground"
                />
                <p className="mt-3 font-medium">No applicants yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Applicants will appear here after candidates apply.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentApplications.map((item) => (
                  <li
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <Link
                        className="font-medium hover:text-primary"
                        href={`/employer/jobs/${item.jobId}`}
                      >
                        {item.applicantName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.jobTitle} · {dateFormatter.format(item.appliedAt)}
                      </p>
                    </div>
                    <Badge variant={getApplicationStatusVariant(item.status)}>
                      {formatStatus(item.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job performance</CardTitle>
            <CardDescription>
              Your top five jobs ranked by application count.
            </CardDescription>
            <CardAction>
              <Button asChild variant="ghost">
                <Link href="/employer/jobs">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {jobPerformance.length === 0 ? (
              <div className="py-10 text-center">
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="mx-auto size-8 text-muted-foreground"
                />
                <p className="mt-3 font-medium">No jobs yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first job to start receiving applications.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/employer/jobs/create">Create job</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {jobPerformance.map((item) => (
                  <li
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <Link
                        className="font-medium hover:text-primary"
                        href={`/employer/jobs/${item.id}`}
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant={getJobStatusVariant(item.status)}>
                          {formatStatus(item.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {dateFormatter.format(item.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-semibold">{item.applications}</p>
                      <p className="text-xs text-muted-foreground">
                        application{item.applications === 1 ? "" : "s"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick actions</CardTitle>
          <CardDescription>
            Continue managing your company and open positions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/employer/jobs/create">
              <FilePlus2 data-icon="inline-start" />
              Create job
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/employer/jobs">
              <BriefcaseBusiness data-icon="inline-start" />
              Manage jobs
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={reviewApplicantsHref}>
              <Send data-icon="inline-start" />
              Review applicants
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/employer/profile/edit">Edit company profile</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
