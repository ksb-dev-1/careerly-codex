"use client";

import { useState } from "react";

import { CreditCard, Crown } from "lucide-react";

import { createBillingPortalSession } from "@/actions/create-billing-portal-session";
import { createCheckoutSession } from "@/actions/create-checkout-session";
import { Button } from "@/components/ui/button";

type SubscriptionActionButtonProps = {
  action: "checkout" | "portal";
  billingInterval?: "monthly" | "yearly";
  label?: string;
};

export function SubscriptionActionButton({
  action,
  billingInterval,
  label,
}: SubscriptionActionButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setError(null);

    const result =
      action === "checkout"
        ? await createCheckoutSession({
            billingInterval: billingInterval ?? "monthly",
          })
        : await createBillingPortalSession();

    if (!result.success) {
      setError(result.message);
      setIsPending(false);
      return;
    }

    window.location.assign(result.url);
  }

  const isCheckout = action === "checkout";

  return (
    <div className="w-full space-y-2">
      <Button
        className="w-full"
        disabled={isPending}
        onClick={() => void handleClick()}
        type="button"
        variant={isCheckout ? "default" : "outline"}
      >
        {isCheckout ? <Crown /> : <CreditCard />}
        {isPending
          ? "Opening Stripe…"
          : (label ??
            (isCheckout
              ? `Choose ${billingInterval ?? "monthly"}`
              : "Manage billing"))}
      </Button>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
