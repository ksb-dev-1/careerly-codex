import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { count, desc, eq } from "drizzle-orm";
import {
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Send,
  UserRound,
  XCircle,
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
import {
  application,
  bookmark,
  employerProfile,
  job,
  jobSeekerProfile,
  resume,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getDailyApplicationQuota } from "@/lib/server/application-quota";

export const metadata: Metadata = {
  title: "Job seeker dashboard | Careerly",
  description:
    "Track your applications, saved jobs, profile progress, and daily application allowance.",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

type ApplicationStatus =
  | "SUBMITTED"
  | "SHORTLISTED"
  | "REJECTED"
  | "WITHDRAWN";

function formatStatus(status: ApplicationStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getStatusVariant(status: ApplicationStatus) {
  if (status === "SHORTLISTED") return "default" as const;
  if (status === "REJECTED") return "destructive" as const;
  if (status === "WITHDRAWN") return "outline" as const;
  return "secondary" as const;
}

export default async function JobSeekerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "JOB_SEEKER") redirect("/unauthorized");

  const userId = session.user.id;
  const now = new Date();

  const [
    statusRows,
    recentApplications,
    recentBookmarks,
    [bookmarkSummary],
    [profile],
    [currentResume],
    quota,
  ] = await Promise.all([
    db
      .select({ status: application.status, total: count() })
      .from(application)
      .where(eq(application.jobSeekerId, userId))
      .groupBy(application.status),
    db
      .select({
        id: application.id,
        jobId: job.id,
        jobTitle: job.title,
        jobStatus: job.status,
        companyName: employerProfile.companyName,
        status: application.status,
        appliedAt: application.createdAt,
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .leftJoin(employerProfile, eq(job.employerId, employerProfile.userId))
      .where(eq(application.jobSeekerId, userId))
      .orderBy(desc(application.createdAt), desc(application.id))
      .limit(5),
    db
      .select({
        jobId: job.id,
        title: job.title,
        companyName: employerProfile.companyName,
        location: job.location,
        status: job.status,
        expiresAt: job.expiresAt,
        savedAt: bookmark.createdAt,
      })
      .from(bookmark)
      .innerJoin(job, eq(bookmark.jobId, job.id))
      .leftJoin(employerProfile, eq(job.employerId, employerProfile.userId))
      .where(eq(bookmark.jobSeekerId, userId))
      .orderBy(desc(bookmark.createdAt), desc(bookmark.jobId))
      .limit(4),
    db
      .select({ total: count() })
      .from(bookmark)
      .where(eq(bookmark.jobSeekerId, userId)),
    db
      .select({
        headline: jobSeekerProfile.headline,
        experience: jobSeekerProfile.experience,
        skills: jobSeekerProfile.skills,
        location: jobSeekerProfile.location,
        about: jobSeekerProfile.about,
      })
      .from(jobSeekerProfile)
      .where(eq(jobSeekerProfile.userId, userId))
      .limit(1),
    db
      .select({ id: resume.id })
      .from(resume)
      .where(eq(resume.userId, userId))
      .limit(1),
    getDailyApplicationQuota(userId, now),
  ]);

  const counts: Record<ApplicationStatus, number> = {
    SUBMITTED: 0,
    SHORTLISTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  for (const row of statusRows) counts[row.status] = row.total;

  const totalApplications = Object.values(counts).reduce(
    (total, value) => total + value,
    0,
  );

  const completionItems = [
    { label: "headline", complete: Boolean(profile?.headline?.trim()) },
    { label: "experience", complete: Boolean(profile?.experience?.trim()) },
    { label: "skills", complete: Boolean(profile?.skills.length) },
    { label: "location", complete: Boolean(profile?.location?.trim()) },
    { label: "about section", complete: Boolean(profile?.about?.trim()) },
    { label: "resume", complete: Boolean(currentResume) },
  ];
  const completedItems = completionItems.filter((item) => item.complete).length;
  const completionPercentage = Math.round(
    (completedItems / completionItems.length) * 100,
  );
  const missingItems = completionItems
    .filter((item) => !item.complete)
    .map((item) => item.label);

  const statusCards = [
    {
      label: "Total applications",
      value: totalApplications,
      icon: FileText,
    },
    { label: "Submitted", value: counts.SUBMITTED, icon: Send },
    {
      label: "Shortlisted",
      value: counts.SHORTLISTED,
      icon: CheckCircle2,
    },
    { label: "Rejected", value: counts.REJECTED, icon: XCircle },
    { label: "Withdrawn", value: counts.WITHDRAWN, icon: CircleAlert },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Job seeker dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your job search and decide what to do next.
          </p>
        </div>
        <Button asChild>
          <Link href="/job-seeker/jobs">
            <BriefcaseBusiness data-icon="inline-start" />
            Browse jobs
          </Link>
        </Button>
      </div>

      <section aria-labelledby="application-summary" className="mt-8">
        <h2 className="sr-only" id="application-summary">
          Application summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statusCards.map((item) => {
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

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent applications</CardTitle>
            <CardDescription>Your five latest applications.</CardDescription>
            <CardAction>
              <Button asChild variant="ghost">
                <Link href="/job-seeker/applications">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="py-8 text-center">
                <FileText
                  aria-hidden="true"
                  className="mx-auto size-8 text-muted-foreground"
                />
                <p className="mt-3 font-medium">No applications yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse open jobs and submit your first application.
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
                      {item.jobStatus === "PUBLISHED" ? (
                        <Link
                          className="font-medium hover:text-primary"
                          href={`/job-seeker/jobs/${item.jobId}`}
                        >
                          {item.jobTitle}
                        </Link>
                      ) : (
                        <p className="font-medium">{item.jobTitle}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.companyName ?? "Company"} · Applied{" "}
                        {dateFormatter.format(item.appliedAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(item.status)}>
                      {formatStatus(item.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s applications</CardTitle>
              <CardDescription>
                Your allowance resets daily at midnight IST.
              </CardDescription>
              <CardAction>
                <Badge variant={quota.membershipPlan === "PREMIUM" ? "default" : "secondary"}>
                  {quota.membershipPlan === "PREMIUM" ? "Premium" : "Free"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {quota.remaining}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  of {quota.limit} remaining
                </span>
              </p>
              <div
                aria-label={`${quota.used} of ${quota.limit} daily applications used`}
                aria-valuemax={quota.limit}
                aria-valuemin={0}
                aria-valuenow={quota.used}
                className="mt-4 h-2 overflow-hidden bg-muted"
                role="progressbar"
              >
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3.5" />
                Resets at {timeFormatter.format(quota.resetsAt)} IST
              </p>
              {quota.membershipPlan === "FREE" ? (
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/pricing">View Premium</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile completion</CardTitle>
              <CardDescription>
                A complete profile helps employers understand your experience.
              </CardDescription>
              <CardAction>
                <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                  {completionPercentage}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div
                aria-label={`Profile ${completionPercentage}% complete`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={completionPercentage}
                className="h-2 overflow-hidden bg-muted"
                role="progressbar"
              >
                <div
                  className="h-full bg-primary"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              {missingItems.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Add {missingItems.join(", ")} to finish your profile.
                </p>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 aria-hidden="true" className="size-3.5 text-primary" />
                  Your profile and resume are complete.
                </p>
              )}
              <Button asChild className="mt-4" variant="outline">
                <Link href="/job-seeker/profile/edit">
                  <UserRound data-icon="inline-start" />
                  {completionPercentage === 100 ? "Review profile" : "Complete profile"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Saved jobs</CardTitle>
          <CardDescription>
            {bookmarkSummary?.total ?? 0} saved job
            {(bookmarkSummary?.total ?? 0) === 1 ? "" : "s"} in total.
          </CardDescription>
          <CardAction>
            <Button asChild variant="ghost">
              <Link href="/job-seeker/bookmarks">View all</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {recentBookmarks.length === 0 ? (
            <div className="py-8 text-center">
              <Bookmark
                aria-hidden="true"
                className="mx-auto size-8 text-muted-foreground"
              />
              <p className="mt-3 font-medium">No saved jobs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Bookmark jobs you want to review later.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {recentBookmarks.map((item) => {
                const available =
                  item.status === "PUBLISHED" &&
                  (item.expiresAt === null || item.expiresAt > now);

                return (
                  <li className="border p-4" key={item.jobId}>
                    {available ? (
                      <Link
                        className="font-medium hover:text-primary"
                        href={`/job-seeker/jobs/${item.jobId}`}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <p className="font-medium">{item.title}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.companyName ?? "Company"}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Saved {dateFormatter.format(item.savedAt)}
                      </span>
                      {!available ? (
                        <Badge variant="outline">Unavailable</Badge>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
