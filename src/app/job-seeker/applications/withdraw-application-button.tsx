"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { withdrawApplication } from "@/actions/withdraw-application";
import { Button } from "@/components/ui/button";

export function WithdrawApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleWithdraw() {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?",
    );

    if (!confirmed) return;

    setError(null);

    startTransition(async () => {
      try {
        const result = await withdrawApplication(applicationId);

        if (!result.success) {
          setError(result.message);
          return;
        }

        router.refresh();
      } catch {
        setError("Unable to withdraw the application.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        disabled={isPending}
        onClick={handleWithdraw}
        type="button"
        variant="destructive"
      >
        {isPending ? "Withdrawing..." : "Withdraw application"}
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
