import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Careerly",
  description:
    "Compare Careerly's Free and Premium job-seeker memberships.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Job-seeker memberships
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          A plan for your next move.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Choose how much room you need to explore new opportunities each day.
        </p>
      </div>

      <p
        className="mt-10 rounded-xl border border-border bg-muted/50 px-5 py-4 text-sm leading-6 text-muted-foreground"
        role="note"
      >
        Daily limits are now enforced. Premium checkout will become available
        when Stripe billing is integrated.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-8 text-card-foreground">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Free
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            Get started
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Build your profile and take the first step toward a new opportunity.
          </p>
          <p className="mt-10 border-t border-border pt-6 text-lg font-semibold">
            1 job application per day
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Active for every job seeker
          </p>
        </article>

        <article className="rounded-3xl border border-border bg-card p-8 text-card-foreground">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Premium
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            More room to explore
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Apply to more roles each day when you&apos;re ready to broaden your
            search.
          </p>
          <p className="mt-10 border-t border-border pt-6 text-lg font-semibold">
            5 job applications per day
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Checkout coming soon · Price to be announced
          </p>
        </article>
      </div>
    </main>
  );
}
