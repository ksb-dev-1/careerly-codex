import Link from "next/link";

import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  WalletCards,
} from "lucide-react";

import { BookmarkButton } from "@/components/job-seeker/bookmark-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ApplicationStatus =
  | "SUBMITTED"
  | "SHORTLISTED"
  | "REJECTED"
  | "WITHDRAWN";

type JobCardProps = {
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
    workplaceType: "ONSITE" | "REMOTE" | "HYBRID";
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
    minimumExperience: number;
    maximumExperience: number;
    minimumSalary: number | null;
    maximumSalary: number | null;
    currency: string;
    skills: string[];
    publishedAt: Date | null;
  };
  applicationStatus?: ApplicationStatus;
  isJobSeeker: boolean;
  isSaved: boolean;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSalary(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSalaryLabel(job: JobCardProps["job"]) {
  if (job.minimumSalary !== null && job.maximumSalary !== null) {
    return `${formatSalary(job.minimumSalary, job.currency)} – ${formatSalary(
      job.maximumSalary,
      job.currency,
    )}`;
  }

  if (job.minimumSalary !== null) {
    return `From ${formatSalary(job.minimumSalary, job.currency)}`;
  }

  if (job.maximumSalary !== null) {
    return `Up to ${formatSalary(job.maximumSalary, job.currency)}`;
  }

  return "Salary not specified";
}

function getStatusDetails(status: ApplicationStatus) {
  switch (status) {
    case "SHORTLISTED":
      return { label: "Shortlisted", variant: "default" as const };
    case "REJECTED":
      return { label: "Not selected", variant: "destructive" as const };
    case "WITHDRAWN":
      return { label: "Withdrawn", variant: "outline" as const };
    default:
      return { label: "Applied", variant: "secondary" as const };
  }
}

export function JobCard({
  job,
  applicationStatus,
  isJobSeeker,
  isSaved,
}: JobCardProps) {
  const statusDetails = applicationStatus
    ? getStatusDetails(applicationStatus)
    : null;

  return (
    <Card className="gap-0 py-0 transition-shadow hover:shadow-sm">
      <CardHeader className="py-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Building2 aria-hidden="true" className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl leading-tight font-semibold tracking-tight">
              <Link
                className="transition-colors hover:text-primary"
                href={`/job-seeker/jobs/${job.id}`}
              >
                {job.title}
              </Link>
            </CardTitle>
              {isJobSeeker ? (
                <BookmarkButton
                  iconOnly
                  initialSaved={isSaved}
                  jobId={job.id}
                />
              ) : null}
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate">{job.companyName ?? "Company"}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-5 sm:px-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <p className="flex shrink-0 items-center gap-2">
            <BriefcaseBusiness
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            <span>
              {job.minimumExperience}–{job.maximumExperience} years
            </span>
          </p>
          <p className="flex shrink-0 items-center gap-2">
            <WalletCards
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            <span>{getSalaryLabel(job)}</span>
          </p>
          <p className="flex shrink-0 items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            <span>{job.location ?? "Location not specified"}</span>
          </p>
        </div>

        {job.skills.length > 0 ? (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {job.skills.join(" · ")}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="flex-col items-start justify-between gap-3 border-t py-3.5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{formatLabel(job.workplaceType)}</Badge>
          <Badge variant="outline">{formatLabel(job.employmentType)}</Badge>
          {statusDetails ? (
            <Badge variant={statusDetails.variant}>{statusDetails.label}</Badge>
          ) : null}
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {job.publishedAt
            ? `Posted ${new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
              }).format(job.publishedAt)}`
            : "Recently posted"}
        </p>
      </CardFooter>
    </Card>
  );
}
