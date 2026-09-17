import Link from "next/link";

import { Bookmark, BriefcaseBusiness, FileText, Tag } from "lucide-react";

const linkClassName =
  "inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-foreground/80 hover:text-primary";

function PricingLink() {
  return (
    <Link className={linkClassName} href="/pricing">
      <Tag aria-hidden="true" className="size-4" />
      Pricing
    </Link>
  );
}

export function GuestNavLinks() {
  return <PricingLink />;
}

export function JobSeekerNavLinks() {
  return (
    <>
      <Link aria-label="Jobs" className={linkClassName} href="/job-seeker/jobs">
        <BriefcaseBusiness aria-hidden="true" className="size-4" />
        <span className="hidden lg:inline">Jobs</span>
      </Link>

      <Link
        aria-label="Bookmarks"
        className={linkClassName}
        href="/job-seeker/bookmarks"
      >
        <Bookmark aria-hidden="true" className="size-4" />
        <span className="hidden lg:inline">Bookmarks</span>
      </Link>

      <Link
        aria-label="Applications"
        className={linkClassName}
        href="/job-seeker/applications"
      >
        <FileText aria-hidden="true" className="size-4" />
        <span className="hidden lg:inline">Applications</span>
      </Link>

      <PricingLink />
    </>
  );
}

export function EmployerNavLinks() {
  return (
    <>
      <Link
        aria-label="Your jobs"
        className={linkClassName}
        href="/employer/jobs"
      >
        <BriefcaseBusiness aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Your jobs</span>
      </Link>

      <PricingLink />
    </>
  );
}

export function UnassignedNavLinks() {
  return (
    <>
      <Link className={linkClassName} href="/select-user-role">
        Choose role
      </Link>

      <PricingLink />
    </>
  );
}
