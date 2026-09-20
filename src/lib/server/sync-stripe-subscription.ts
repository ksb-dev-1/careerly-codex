import "server-only";

import { eq, lte } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/db";
import { subscription, user } from "@/db/schema";
import { getStripePremiumPriceIds } from "@/lib/stripe";

type StoredSubscriptionStatus =
  (typeof subscription.$inferInsert)["status"];

function normalizeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): StoredSubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "past_due":
      return "PAST_DUE";
    case "paused":
      return "PAUSED";
    case "trialing":
      return "TRIALING";
    case "unpaid":
      return "UNPAID";
    default:
      return "INCOMPLETE";
  }
}

function unixSecondsToDate(value: number | undefined) {
  return value === undefined ? null : new Date(value * 1000);
}

export async function syncStripeSubscription(
  stripeSubscription: Stripe.Subscription,
  stripeEventCreatedAt: Date,
) {
  const stripeCustomerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  let userId = stripeSubscription.metadata.userId;

  if (!userId) {
    const account = await db.query.user.findFirst({
      columns: { id: true },
      where: eq(user.stripeCustomerId, stripeCustomerId),
    });
    userId = account?.id ?? "";
  }

  if (!userId) {
    throw new Error(
      `No Careerly user is associated with Stripe customer ${stripeCustomerId}.`,
    );
  }

  const premiumPriceIds = getStripePremiumPriceIds();
  const premiumItem = stripeSubscription.items.data.find(
    (item) => premiumPriceIds.has(item.price.id),
  );
  const primaryItem = premiumItem ?? stripeSubscription.items.data[0];

  if (!primaryItem) {
    throw new Error(
      `Stripe subscription ${stripeSubscription.id} has no price item.`,
    );
  }

  const hasPremiumAccess =
    Boolean(premiumItem) &&
    (stripeSubscription.status === "active" ||
      stripeSubscription.status === "trialing");

  const synced = await db.transaction(async (tx) => {
    const [savedSubscription] = await tx
      .insert(subscription)
      .values({
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        stripePriceId: primaryItem.price.id,
        status: normalizeSubscriptionStatus(stripeSubscription.status),
        currentPeriodStart: unixSecondsToDate(
          primaryItem.current_period_start,
        ),
        currentPeriodEnd: unixSecondsToDate(primaryItem.current_period_end),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        lastStripeEventAt: stripeEventCreatedAt,
      })
      .onConflictDoUpdate({
        target: subscription.userId,
        set: {
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId,
          stripePriceId: primaryItem.price.id,
          status: normalizeSubscriptionStatus(stripeSubscription.status),
          currentPeriodStart: unixSecondsToDate(
            primaryItem.current_period_start,
          ),
          currentPeriodEnd: unixSecondsToDate(primaryItem.current_period_end),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          lastStripeEventAt: stripeEventCreatedAt,
          updatedAt: new Date(),
        },
        setWhere: lte(subscription.lastStripeEventAt, stripeEventCreatedAt),
      })
      .returning({ userId: subscription.userId });

    if (!savedSubscription) {
      return false;
    }

    await tx
      .update(user)
      .set({
        membershipPlan: hasPremiumAccess ? "PREMIUM" : "FREE",
        stripeCustomerId,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return true;
  });

  return synced;
}
