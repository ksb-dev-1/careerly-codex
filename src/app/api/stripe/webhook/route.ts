import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/db";
import { stripeWebhookEvent } from "@/db/schema";
import { syncStripeSubscription } from "@/lib/server/sync-stripe-subscription";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

const HANDLED_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

async function getSubscriptionFromCheckoutSession(
  checkoutSession: Stripe.Checkout.Session,
) {
  if (!checkoutSession.subscription) {
    throw new Error(
      `Checkout session ${checkoutSession.id} has no subscription.`,
    );
  }

  if (typeof checkoutSession.subscription !== "string") {
    return checkoutSession.subscription;
  }

  return getStripe().subscriptions.retrieve(checkoutSession.subscription);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return new Response("Invalid Stripe webhook.", { status: 400 });
  }

  if (!HANDLED_EVENT_TYPES.has(event.type)) {
    return Response.json({ received: true });
  }

  const alreadyProcessed = await db.query.stripeWebhookEvent.findFirst({
    columns: { id: true },
    where: eq(stripeWebhookEvent.id, event.id),
  });

  if (alreadyProcessed) {
    return Response.json({ received: true });
  }

  try {
    const stripeEventCreatedAt = new Date(event.created * 1000);

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const stripeSubscription = await getSubscriptionFromCheckoutSession(
          event.data.object,
        );
        await syncStripeSubscription(
          stripeSubscription,
          stripeEventCreatedAt,
        );
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Retrieve the current object so delayed or retried webhooks cannot
        // overwrite newer subscription state with an older event payload.
        const stripeSubscription = await getStripe().subscriptions.retrieve(
          event.data.object.id,
        );
        await syncStripeSubscription(
          stripeSubscription,
          stripeEventCreatedAt,
        );
        break;
      }
    }

    await db
      .insert(stripeWebhookEvent)
      .values({
        id: event.id,
        type: event.type,
        stripeCreatedAt: new Date(event.created * 1000),
      })
      .onConflictDoNothing();
  } catch (error) {
    console.error(`Unable to process Stripe event ${event.id}:`, error);
    return new Response("Unable to process Stripe webhook.", { status: 500 });
  }

  return Response.json({ received: true });
}
