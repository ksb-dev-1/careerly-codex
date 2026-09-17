"use client";

import Link from "next/link";

import { AccountMenu } from "@/components/layout/account-menu";
import {
  EmployerNavLinks,
  GuestNavLinks,
  JobSeekerNavLinks,
  UnassignedNavLinks,
} from "@/components/layout/marketing-nav-links";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function MarketingHeader() {
  const { data: session, isPending } = authClient.useSession();
  const role = session?.user.role ?? null;

  const profileHref =
    role === "EMPLOYER"
      ? "/employer/profile/edit"
      : role === "JOB_SEEKER"
        ? "/job-seeker/profile/edit"
        : "/select-user-role";

  return (
    <header className="border-b border-border bg-background">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link className="shrink-0 text-xl font-bold text-primary" href="/">
          Careerly
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6">
            {role === "JOB_SEEKER" ? (
              <JobSeekerNavLinks />
            ) : role === "EMPLOYER" ? (
              <EmployerNavLinks />
            ) : session ? (
              <UnassignedNavLinks />
            ) : (
              <GuestNavLinks />
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />

            {isPending ? (
              <span
                aria-hidden="true"
                className="size-9 rounded-full bg-muted"
              />
            ) : session ? (
              <AccountMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
                profileHref={profileHref}
                isEmployer={role === "EMPLOYER"}
                hasRole={Boolean(role)}
              />
            ) : (
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
