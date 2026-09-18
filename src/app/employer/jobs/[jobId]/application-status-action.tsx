"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { updateApplicationStatus } from "@/actions/update-application-status";
import { Button } from "@/components/ui/button";

type ApplicationStatus = "SUBMITTED" | "SHORTLISTED" | "REJECTED" | "WITHDRAWN";

export function ApplicationStatusActions({
  jobId,
  applicationId,
  status,
}: {
  jobId: string;
  applicationId: string;
  status: ApplicationStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(nextStatus: "SHORTLISTED" | "REJECTED") {
    if (
      nextStatus === "REJECTED" &&
      !window.confirm("Reject this application?")
    ) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await updateApplicationStatus(jobId, applicationId, nextStatus);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to update the application.",
        );
      }
    });
  }

  if (status === "REJECTED" || status === "WITHDRAWN") return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "SUBMITTED" ? (
          <Button
            disabled={isPending}
            onClick={() => handleUpdate("SHORTLISTED")}
            type="button"
          >
            Shortlist
          </Button>
        ) : null}
        <Button
          disabled={isPending}
          onClick={() => handleUpdate("REJECTED")}
          type="button"
          variant="destructive"
        >
          Reject
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
