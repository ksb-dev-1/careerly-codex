"use client";

import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function MarketingHeader() {
  const { data: session, isPending } = authClient.useSession();
  const role = session && "role" in session.user ? session.user.role : null;
  const destination =
    role === "EMPLOYER"
      ? { href: "/employer/jobs", label: "Your jobs" }
      : role === "JOB_SEEKER"
        ? { href: "/job-seeker/profile/edit", label: "Your profile" }
        : session
          ? { href: "/select-user-role", label: "Choose role" }
          : { href: "/sign-in", label: "Sign in" };

  return (
    <header className="border-b border-border bg-background">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link className="text-lg font-bold tracking-tight" href="/">
          Careerly
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="/pricing"
          >
            Pricing
          </Link>
          <ModeToggle />
          {isPending ? (
            <span aria-hidden="true" className="h-9 w-20 rounded-md bg-muted" />
          ) : (
            <Button asChild className="h-9 px-3 text-sm" size="lg" variant="outline">
              <Link href={destination.href}>{destination.label}</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
