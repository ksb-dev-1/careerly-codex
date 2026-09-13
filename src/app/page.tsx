import { headers } from "next/headers";
import Link from "next/link";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";

import { MarketingFooter } from "@/components/layout/marketing-footer";
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
    <>
      <main>
        <section className="border-b border-border bg-background text-foreground">
          <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:min-h-[680px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20 lg:py-24">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-emerald-800 uppercase dark:text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-500" />
                The place for your next move
              </p>

              <h1 className="mt-7 text-[clamp(3.25rem,6vw,5.75rem)] leading-[1.02] font-semibold tracking-[-0.055em]">
                Better careers.
                <br />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Stronger teams.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Where talented people find room to grow, and ambitious teams
                find people who move them forward.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-9 h-12 rounded-full bg-emerald-800 px-7 text-base text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-900 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
              >
                <Link href={destination.href}>
                  {session ? destination.label : "Get started"}
                  <ArrowUpRight aria-hidden="true" className="ml-1 size-4" />
                </Link>
              </Button>

              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                One platform. A more meaningful way to connect.
              </p>
            </div>

            <aside
              aria-label="Careerly for job seekers and employers"
              className="relative mx-auto w-full max-w-[500px] min-w-0"
            >
              <div className="absolute inset-0 rotate-[-4deg] rounded-[2rem] border border-border bg-muted" />
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 text-card-foreground shadow-xl shadow-foreground/5 sm:p-8">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <p className="text-sm font-bold tracking-[0.18em] text-primary uppercase">
                    Careerly
                  </p>
                  <span className="size-2 rounded-full bg-primary" />
                </div>

                <p className="mt-9 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  A better connection starts here
                </p>
                <h2 className="mt-3 max-w-sm text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                  Good things happen when the right people meet.
                </h2>

                <div className="mt-9 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
                    <BriefcaseBusiness aria-hidden="true" className="size-6" />
                    <p className="mt-6 font-semibold">Find your fit</p>
                    <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
                      Explore a new direction for your career.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-5 text-foreground">
                    <UsersRound aria-hidden="true" className="size-6" />
                    <p className="mt-6 font-semibold">Grow your team</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Meet people ready to make an impact.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
        <section
          aria-labelledby="paths-title"
          className="border-b border-border bg-muted/30 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Made for both sides
              </p>
              <h2
                id="paths-title"
                className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                One platform. Two ways forward.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Whether you&apos;re looking for your next role or building a
                team, Careerly gives you a place to begin.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <article className="rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-sm">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <BriefcaseBusiness aria-hidden="true" className="size-6" />
                </div>
                <p className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  For job seekers
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  Be more than a résumé.
                </h3>
                <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                  Show your experience and strengths, discover opportunities,
                  and take your next career step with confidence.
                </p>
              </article>

              <article className="rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-sm">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <UsersRound aria-hidden="true" className="size-6" />
                </div>
                <p className="mt-8 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  For employers
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  Make every opening count.
                </h3>
                <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                  Create clear job posts, keep your openings organized, and
                  connect with people who can help your team grow.
                </p>
              </article>
            </div>
          </div>
        </section>
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-title"
          className="border-b border-border bg-background py-20 sm:py-28"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="max-w-md">
              <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                How Careerly works
              </p>
              <h2
                id="how-it-works-title"
                className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
              >
                Simple steps. Better connections.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                From your first introduction to the next opportunity, the path
                forward should feel clear.
              </p>
            </div>

            <ol className="border-t border-border">
              <li className="flex gap-6 border-b border-border py-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                  01
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Create your starting point
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Build your job-seeker profile or introduce your company to
                    future teammates.
                  </p>
                </div>
              </li>
              <li className="flex gap-6 border-b border-border py-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                  02
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Find the right opportunity
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Employers share open roles. Job seekers explore the ones
                    that match where they want to go.
                  </p>
                </div>
              </li>
              <li className="flex gap-6 py-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                  03
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Move forward together
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    Apply with confidence, review interested candidates, and
                    take the next step toward a great fit.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section
          id="faq"
          aria-labelledby="faq-title"
          className="bg-muted/30 py-20 sm:py-28"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="max-w-md">
              <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Frequently asked questions
              </p>
              <h2
                id="faq-title"
                className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Good questions deserve clear answers.
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Here are the essentials about getting started and our upcoming
                memberships.
              </p>
            </div>

            <div className="space-y-3">
              <details className="group rounded-2xl border border-border bg-card text-card-foreground">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  How do I get started?
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 leading-7 text-muted-foreground">
                  Sign in with Google or GitHub, choose whether you&apos;re a job
                  seeker or employer, and complete your profile.
                </p>
              </details>

              <details className="group rounded-2xl border border-border bg-card text-card-foreground">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  Can employers manage their job posts?
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 leading-7 text-muted-foreground">
                  Yes. Employers can create, edit, publish, and close their job
                  listings.
                </p>
              </details>

              <details className="group rounded-2xl border border-border bg-card text-card-foreground">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  How many jobs can I apply to each day?
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 leading-7 text-muted-foreground">
                  We plan to allow one application per day on Free and five per
                  day on Premium. These limits are not active yet.
                </p>
              </details>

              <details className="group rounded-2xl border border-border bg-card text-card-foreground">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  Is Premium available now?
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 leading-7 text-muted-foreground">
                  Not yet. We haven&apos;t set a price or enabled Stripe checkout.
                  We&apos;ll update the Pricing page when memberships launch.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter href={destination.href} label={destination.label} />
    </>
  );
}
