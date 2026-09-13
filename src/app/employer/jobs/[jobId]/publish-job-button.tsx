"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { publishJob } from "@/actions/publish-job";
import { Button } from "@/components/ui/button";

export function PublishJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    setError(null);

    startTransition(async () => {
      try {
        await publishJob(jobId);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to publish this job.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button disabled={isPending} onClick={handlePublish}>
        {isPending ? "Publishing..." : "Publish job"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
