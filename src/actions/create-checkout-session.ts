"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { subscription, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  getApplicationUrl,
  getStripe,
  getStripePremiumPriceId,
} from "@/lib/stripe";

const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
  "CANCELED",
  "INCOMPLETE_EXPIRED",
]);

const checkoutSchema = z.object({
  billingInterval: z.enum(["monthly", "yearly"]),
});

export async function createCheckoutSession(input: {
  billingInterval: "monthly" | "yearly";
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    return {
      success: false as const,
      message: "Sign in as a job seeker to upgrade to Premium.",
    };
  }

  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Choose a valid Premium billing interval.",
    };
  }

  const [account] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      membershipPlan: user.membershipPlan,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionStatus: subscription.status,
    })
    .from(user)
    .leftJoin(subscription, eq(subscription.userId, user.id))
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!account) {
    return {
      success: false as const,
      message: "Your Careerly account could not be found.",
    };
  }

  if (account.membershipPlan === "PREMIUM") {
    return {
      success: false as const,
      message: "Your account already has Premium access.",
    };
  }

  if (
    account.subscriptionStatus &&
    !TERMINAL_SUBSCRIPTION_STATUSES.has(account.subscriptionStatus)
  ) {
    return {
      success: false as const,
      message:
        "You already have a Stripe subscription. Use Manage billing to update it.",
    };
  }

  try {
    const stripe = getStripe();
    let stripeCustomerId = account.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: account.email,
        name: account.name,
        metadata: {
          userId: account.id,
        },
      });

      stripeCustomerId = customer.id;

      await db
        .update(user)
        .set({
          stripeCustomerId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, account.id));
    }

    const applicationUrl = getApplicationUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: account.id,
      line_items: [
        {
          price: getStripePremiumPriceId(parsed.data.billingInterval),
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        userId: account.id,
      },
      subscription_data: {
        metadata: {
          userId: account.id,
        },
      },
      success_url: `${applicationUrl}/pricing?checkout=success`,
      cancel_url: `${applicationUrl}/pricing?checkout=canceled`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    return {
      success: true as const,
      url: checkoutSession.url,
    };
  } catch (error) {
    console.error("Unable to create Stripe Checkout session:", error);
    return {
      success: false as const,
      message:
        "Premium checkout is temporarily unavailable. Please try again later.",
    };
  }
}
