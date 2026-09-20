"use server";

import { headers } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getApplicationUrl, getStripe } from "@/lib/stripe";

export async function createBillingPortalSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "JOB_SEEKER") {
    return {
      success: false as const,
      message: "Sign in as a job seeker to manage billing.",
    };
  }

  const account = await db.query.user.findFirst({
    columns: { stripeCustomerId: true },
    where: eq(user.id, session.user.id),
  });

  if (!account?.stripeCustomerId) {
    return {
      success: false as const,
      message: "No Stripe billing account is connected to your profile.",
    };
  }

  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: account.stripeCustomerId,
      return_url: `${getApplicationUrl()}/pricing`,
    });

    return {
      success: true as const,
      url: portalSession.url,
    };
  } catch (error) {
    console.error("Unable to create Stripe billing portal session:", error);
    return {
      success: false as const,
      message:
        "The billing portal is temporarily unavailable. Please try again later.",
    };
  }
}
