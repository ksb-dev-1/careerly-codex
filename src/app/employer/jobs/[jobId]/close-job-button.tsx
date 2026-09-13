"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { closeJob } from "@/actions/close-job";
import { Button } from "@/components/ui/button";

export function CloseJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    if (!window.confirm("Close this job? It cannot be reopened yet.")) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await closeJob(jobId);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to close this job.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button disabled={isPending} onClick={handleClose} variant="destructive">
        {isPending ? "Closing..." : "Close job"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
