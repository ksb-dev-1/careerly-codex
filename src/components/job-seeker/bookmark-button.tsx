"use client";

import { useState } from "react";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

import { setJobBookmark } from "@/actions/set-bookmark";
import { Button } from "@/components/ui/button";

type BookmarkButtonProps = {
  jobId: string;
  initialSaved: boolean;
  className?: string;
  iconOnly?: boolean;
};

export function BookmarkButton({
  jobId,
  initialSaved,
  className,
  iconOnly = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setError(null);

    try {
      const result = await setJobBookmark({ jobId, saved: !saved });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSaved(result.saved);
      router.refresh();
    } catch {
      setError("Unable to update your bookmark.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        aria-label={saved ? "Remove bookmark" : "Save job"}
        aria-pressed={saved}
        className={className}
        disabled={isPending}
        onClick={handleClick}
        size={iconOnly ? "icon" : "default"}
        title={saved ? "Remove bookmark" : "Save job"}
        type="button"
        variant="outline"
      >
        <Bookmark
          aria-hidden="true"
          className={`${saved ? "fill-current" : ""} ${
            isPending ? "animate-pulse" : ""
          }`}
        />
        {iconOnly ? (
          <span className="sr-only">
            {isPending ? "Updating bookmark" : saved ? "Remove bookmark" : "Save job"}
          </span>
        ) : isPending ? (
          "Updating..."
        ) : saved ? (
          "Remove bookmark"
        ) : (
          "Save job"
        )}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
