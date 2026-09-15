import Link from "next/link";

import { ArrowUpRight, BriefcaseBusiness, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type HomeHeroProps = {
  destination: {
    href: string;
    label: string;
  };
  isAuthenticated: boolean;
};

export function HomeHero({ destination, isAuthenticated }: HomeHeroProps) {
  return (
    <section className="border-b border-border bg-background text-foreground">
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:min-h-170 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-20 lg:py-24">
        <div className="max-w-2xl">
          <h1 className="mt-7 text-[clamp(3.25rem,6vw,5.75rem)] leading-[1.02] font-semibold tracking-[-0.055em]">
            Better careers.
            <br />
            <span className="text-brand-700 dark:text-brand-400">
              Stronger teams.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Where talented people find room to grow, and ambitious teams find
            people who move them forward.
          </p>

          <Button
            asChild
            className="mt-9 h-12 bg-brand-800 px-7 text-base text-white shadow-lg shadow-brand-900/10 hover:bg-brand-900 dark:bg-brand-400 dark:text-slate-950 dark:hover:bg-brand-300"
            size="lg"
          >
            <Link href={destination.href}>
              {isAuthenticated ? destination.label : "Get started"}
              <ArrowUpRight aria-hidden="true" className="ml-1 size-4" />
            </Link>
          </Button>

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            One platform. A more meaningful way to connect.
          </p>
        </div>

        <aside
          aria-label="Careerly for job seekers and employers"
          className="relative mx-auto w-full max-w-125 min-w-0"
        >
          <Card
            aria-hidden="true"
            className="absolute inset-0 rotate-[-4deg] border-brand-700/20 bg-brand-100/80 py-0 dark:border-brand-400/20 dark:bg-brand-400/10"
          />
          <Card className="relative border-brand-700/15 py-0 shadow-xl shadow-foreground/5 dark:border-brand-400/20">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <p className="font-bold text-brand-700 dark:text-brand-400">
                  Careerly
                </p>
                <span className="size-2 rounded-full bg-brand-500" />
              </div>

              <p className="mt-9 text-xs font-bold tracking-widest text-brand-700 uppercase dark:text-brand-400">
                A better connection starts here
              </p>
              <h2 className="mt-3 max-w-sm text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                Good things happen when the right people meet.
              </h2>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <Card className="bg-brand-700 py-0 text-white ring-0 dark:bg-brand-400 dark:text-slate-950">
                  <CardContent className="p-5">
                    <BriefcaseBusiness aria-hidden="true" className="size-6" />
                    <p className="mt-6 font-semibold">Find your fit</p>
                    <p className="mt-2 text-sm leading-6 text-white/80 dark:text-slate-950/75">
                      Explore a new direction for your career.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-brand-50 py-0 text-brand-950 ring-0 dark:bg-brand-400/10 dark:text-brand-100">
                  <CardContent className="p-5">
                    <UsersRound
                      aria-hidden="true"
                      className="size-6 text-brand-700 dark:text-brand-300"
                    />
                    <p className="mt-6 font-semibold">Grow your team</p>
                    <p className="mt-2 text-sm leading-6 text-brand-950/70 dark:text-brand-100/70">
                      Meet people ready to make an impact.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
