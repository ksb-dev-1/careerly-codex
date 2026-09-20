import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | undefined;

function requireEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getStripe() {
  stripeClient ??= new Stripe(requireEnvironmentVariable("STRIPE_SECRET_KEY"));
  return stripeClient;
}

export type PremiumBillingInterval = "monthly" | "yearly";

export function getStripePremiumPriceId(
  billingInterval: PremiumBillingInterval,
) {
  return requireEnvironmentVariable(
    billingInterval === "monthly"
      ? "STRIPE_PREMIUM_MONTHLY_PRICE_ID"
      : "STRIPE_PREMIUM_YEARLY_PRICE_ID",
  );
}

export function getStripePremiumPriceIds() {
  return new Set([
    getStripePremiumPriceId("monthly"),
    getStripePremiumPriceId("yearly"),
  ]);
}

export function getStripeWebhookSecret() {
  return requireEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
}

export function getApplicationUrl() {
  const configuredUrl = requireEnvironmentVariable("BETTER_AUTH_URL");
  return new URL(configuredUrl).origin;
}
