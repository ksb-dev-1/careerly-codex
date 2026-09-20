import { headers } from "next/headers";
import Link from "next/link";

import { eq } from "drizzle-orm";
import { Check } from "lucide-react";
import type { Metadata } from "next";

import { SubscriptionActionButton } from "@/app/pricing/subscription-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { subscription, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  getStripe,
  getStripePremiumPriceId,
  type PremiumBillingInterval,
} from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing | Careerly",
  description:
    "Compare Careerly's Free, Premium Monthly, and Premium Yearly job-seeker memberships.",
};

export const dynamic = "force-dynamic";

type PricingPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

type SessionRole = "JOB_SEEKER" | "EMPLOYER" | null | undefined;

const ACTIVE_BILLING_STATUSES = new Set([
  "INCOMPLETE",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "UNPAID",
  "PAUSED",
]);

const freeFeatures = [
  "One job application each day",
  "Search and filter active jobs",
  "Save jobs and track applications",
];

const monthlyFeatures = [
  "Five job applications each day",
  "Everything included in Free",
  "Flexible month-to-month billing",
];

const yearlyFeatures = [
  "Five job applications each day",
  "Everything included in Free",
  "One payment for 12 months",
];

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-3 text-sm text-muted-foreground">
      {features.map((feature) => (
        <li className="flex gap-2" key={feature}>
          <Check aria-hidden="true" className="mt-0.5 size-4 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

async function getFormattedStripePrice(
  billingInterval: PremiumBillingInterval,
) {
  try {
    const price = await getStripe().prices.retrieve(
      getStripePremiumPriceId(billingInterval),
    );

    if (price.unit_amount === null) {
      return null;
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: price.currency.toUpperCase(),
      maximumFractionDigits: price.unit_amount % 100 === 0 ? 0 : 2,
    }).format(price.unit_amount / 100);
  } catch (error) {
    console.error(`Unable to load the ${billingInterval} Stripe price:`, error);
    return null;
  }
}

function PremiumPlanAction({
  billingInterval,
  hasManageableSubscription,
  isCurrentSubscription,
  sessionRole,
}: {
  billingInterval: PremiumBillingInterval;
  hasManageableSubscription: boolean;
  isCurrentSubscription: boolean;
  sessionRole: SessionRole;
}) {
  if (sessionRole === "JOB_SEEKER") {
    if (hasManageableSubscription) {
      return (
        <SubscriptionActionButton
          action="portal"
          label={
            isCurrentSubscription
              ? "Manage billing"
              : `Switch to ${billingInterval}`
          }
        />
      );
    }

    return (
      <SubscriptionActionButton
        action="checkout"
        billingInterval={billingInterval}
      />
    );
  }

  if (sessionRole === undefined) {
    return (
      <Button asChild className="w-full">
        <Link href="/sign-in">Sign in to upgrade</Link>
      </Button>
    );
  }

  if (sessionRole === null) {
    return (
      <Button asChild className="w-full">
        <Link href="/select-user-role">Choose job seeker role</Link>
      </Button>
    );
  }

  return (
    <Button className="w-full" disabled>
      Available to job seekers
    </Button>
  );
}

function PremiumPlanCard({
  billingInterval,
  currentPeriodEnd,
  formattedPrice,
  hasManageableSubscription,
  isCurrentSubscription,
  isPremium,
  isScheduledToCancel,
  sessionRole,
}: {
  billingInterval: PremiumBillingInterval;
  currentPeriodEnd: Date | null | undefined;
  formattedPrice: string | null;
  hasManageableSubscription: boolean;
  isCurrentSubscription: boolean;
  isPremium: boolean;
  isScheduledToCancel: boolean;
  sessionRole: SessionRole;
}) {
  const isMonthly = billingInterval === "monthly";
  const title = isMonthly ? "Premium Monthly" : "Premium Yearly";
  const features = isMonthly ? monthlyFeatures : yearlyFeatures;

  return (
    <Card
      className={`flex h-full flex-col ${
        isCurrentSubscription ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardHeader>
        <div className="flex min-h-6 items-center justify-between gap-3">
          <Badge>{isMonthly ? "Monthly" : "Yearly"}</Badge>
          {isCurrentSubscription ? (
            <Badge variant="outline">
              {isPremium ? "Current plan" : "Current subscription"}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="mt-3 text-2xl">{title}</CardTitle>
        <CardDescription className="text-sm leading-6">
          {isMonthly
            ? "Stay flexible with a recurring monthly subscription."
            : "Keep Premium for a full year with one annual payment."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          <p className="text-3xl font-semibold">
            {formattedPrice ?? "Price at checkout"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            billed {billingInterval}
          </p>
        </div>

        <FeatureList features={features} />

        {isCurrentSubscription && currentPeriodEnd ? (
          <p className="mt-6 text-xs text-muted-foreground">
            {isScheduledToCancel ? "Access ends" : "Current period renews"}{" "}
            {new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
            }).format(currentPeriodEnd)}
          </p>
        ) : null}
      </CardContent>

      <CardFooter>
        <PremiumPlanAction
          billingInterval={billingInterval}
          hasManageableSubscription={hasManageableSubscription}
          isCurrentSubscription={isCurrentSubscription}
          sessionRole={sessionRole}
        />
      </CardFooter>
    </Card>
  );
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const [{ checkout }, session, monthlyPrice, yearlyPrice] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
    getFormattedStripePrice("monthly"),
    getFormattedStripePrice("yearly"),
  ]);

  const billingAccount =
    session?.user.role === "JOB_SEEKER"
      ? await db
          .select({
            membershipPlan: user.membershipPlan,
            stripeCustomerId: user.stripeCustomerId,
            stripePriceId: subscription.stripePriceId,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          })
          .from(user)
          .leftJoin(subscription, eq(subscription.userId, user.id))
          .where(eq(user.id, session.user.id))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : null;

  const isPremium = billingAccount?.membershipPlan === "PREMIUM";
  const hasManageableSubscription = Boolean(
    billingAccount?.stripeCustomerId &&
      billingAccount.subscriptionStatus &&
      ACTIVE_BILLING_STATUSES.has(billingAccount.subscriptionStatus),
  );
  const monthlyPriceId = getStripePremiumPriceId("monthly");
  const yearlyPriceId = getStripePremiumPriceId("yearly");
  const isMonthlySubscription =
    hasManageableSubscription &&
    billingAccount?.stripePriceId === monthlyPriceId;
  const isYearlySubscription =
    hasManageableSubscription && billingAccount?.stripePriceId === yearlyPriceId;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
          Job-seeker memberships
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          More opportunities when you need them.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Start free, then choose monthly or yearly Premium billing when you
          want more applications each day.
        </p>
      </div>

      {checkout === "success" ? (
        <p
          className="mx-auto mt-8 max-w-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground"
          role="status"
        >
          Checkout completed. Stripe is confirming your subscription. Premium
          access appears as soon as the verified webhook is received.
        </p>
      ) : checkout === "canceled" ? (
        <p
          className="mx-auto mt-8 max-w-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
          role="status"
        >
          Checkout was canceled. Your current membership has not changed.
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <div className="flex min-h-6 items-center justify-between gap-3">
              <Badge variant="secondary">Free</Badge>
              {billingAccount && !isPremium ? (
                <Badge variant="outline">Current plan</Badge>
              ) : null}
            </div>
            <CardTitle className="mt-3 text-2xl">Get started</CardTitle>
            <CardDescription className="text-sm leading-6">
              Build your profile and apply thoughtfully to one opportunity each
              day.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-6">
              <p className="text-3xl font-semibold">₹0</p>
              <p className="mt-1 text-sm text-muted-foreground">forever</p>
            </div>
            <FeatureList features={freeFeatures} />
          </CardContent>
          <CardFooter>
            {billingAccount && !isPremium ? (
              <Button className="w-full" disabled variant="outline">
                Current plan
              </Button>
            ) : !session ? (
              <Button asChild className="w-full" variant="outline">
                <Link href="/sign-in">Sign in to get started</Link>
              </Button>
            ) : (
              <Button className="w-full" disabled variant="outline">
                Included
              </Button>
            )}
          </CardFooter>
        </Card>

        <PremiumPlanCard
          billingInterval="monthly"
          currentPeriodEnd={billingAccount?.currentPeriodEnd}
          formattedPrice={monthlyPrice}
          hasManageableSubscription={hasManageableSubscription}
          isCurrentSubscription={isMonthlySubscription}
          isPremium={isPremium}
          isScheduledToCancel={billingAccount?.cancelAtPeriodEnd ?? false}
          sessionRole={session?.user.role}
        />

        <PremiumPlanCard
          billingInterval="yearly"
          currentPeriodEnd={billingAccount?.currentPeriodEnd}
          formattedPrice={yearlyPrice}
          hasManageableSubscription={hasManageableSubscription}
          isCurrentSubscription={isYearlySubscription}
          isPremium={isPremium}
          isScheduledToCancel={billingAccount?.cancelAtPeriodEnd ?? false}
          sessionRole={session?.user.role}
        />
      </div>
    </main>
  );
}
