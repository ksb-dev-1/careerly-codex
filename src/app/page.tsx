import { headers } from "next/headers";
import Link from "next/link";

import type { Metadata } from "next";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Careerly | Find your next opportunity",
  description:
    "Careerly connects job seekers with meaningful opportunities and employers with great talent.",
};

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const destination =
    session?.user.role === "EMPLOYER"
      ? { href: "/employer/jobs", label: "Your jobs" }
      : session?.user.role === "JOB_SEEKER"
        ? { href: "/job-seeker/profile/edit", label: "Your profile" }
        : session
          ? { href: "/select-user-role", label: "Choose role" }
          : { href: "/sign-in", label: "Sign in" };

  return (
    <main>
      <MarketingHeader href={destination.href} label={destination.label} />
      <section className="flex min-h-[calc(100vh-1px)] items-center justify-center px-6 py-24">
        <div className="max-w-3xl space-y-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Careerly
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Unlock your career potential
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Discover opportunities that inspire you, or connect with the
            talented people your team needs.
          </p>

          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href={destination.href}>Start exploring</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
