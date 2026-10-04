"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Copy, Trash2 } from "lucide-react";

import { deleteDraftJob } from "@/actions/delete-draft-job";
import { duplicateJob } from "@/actions/duplicate-job";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function JobManagementActions({
  canDelete,
  jobId,
}: {
  canDelete: boolean;
  jobId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDuplicate() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await duplicateJob(jobId);

        if (!result.success) {
          setError(result.message);
          return;
        }

        router.push(`/employer/jobs/${result.jobId}/edit`);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to duplicate the job. Please try again.",
        );
      }
    });
  }

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await deleteDraftJob(jobId);

        if (!result.success) {
          setError(result.message);
          return;
        }

        router.replace("/employer/jobs");
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete the draft. Please try again.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button disabled={isPending} onClick={handleDuplicate} variant="outline">
          <Copy data-icon="inline-start" />
          {isPending ? "Working..." : "Duplicate job"}
        </Button>
        {canDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isPending} variant="destructive">
                <Trash2 data-icon="inline-start" />
                Delete draft
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the draft. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button disabled={isPending} variant="outline">
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    disabled={isPending}
                    onClick={handleDelete}
                    variant="destructive"
                  >
                    Delete draft
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
