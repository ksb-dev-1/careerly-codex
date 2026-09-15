import { BriefcaseBusiness, UsersRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function AudiencePathsSection() {
  return (
    <section
      aria-labelledby="paths-title"
      className="border-b border-border bg-muted/30 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-800 uppercase dark:text-brand-300">
            <span className="size-2 rounded-full bg-brand-500" />
            Made for both sides
          </p>
          <h2
            id="paths-title"
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            One platform. Two ways forward.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Whether you&apos;re looking for your next role or building a team,
            Careerly gives you a place to begin.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 text-base sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-md bg-brand-700 text-white dark:bg-brand-400 dark:text-slate-950">
                <BriefcaseBusiness aria-hidden="true" className="size-6" />
              </div>
              <p className="mt-8 text-sm font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-400">
                For job seekers
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Be more than a résumé.
              </h3>
              <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                Show your experience and strengths, discover opportunities, and
                take your next career step with confidence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-base sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                <UsersRound aria-hidden="true" className="size-6" />
              </div>
              <p className="mt-8 text-sm font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-400">
                For employers
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Make every opening count.
              </h3>
              <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                Create clear job posts, keep your openings organized, and
                connect with people who can help your team grow.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
