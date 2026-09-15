"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";

import { applyToJob } from "@/actions/apply-to-job";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ApplyToJobFormProps = {
  jobId: string;
};

export function ApplyToJobForm({ jobId }: ApplyToJobFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    setIsPending(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const coverLetter = String(formData.get("coverLetter") ?? "");

    try {
      const result = await applyToJob({
        jobId,
        coverLetter,
      });

      setMessage(
        result.success
          ? "Your application was submitted successfully."
          : result.message,
      );

      if (result.success) {
        setIsSuccessful(true);
        form.reset();
      }
    } catch {
      setMessage("Unable to submit your application.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="coverLetter">
          Cover letter <span className="text-muted-foreground">(optional)</span>
        </Label>

        <Textarea
          disabled={isPending || isSuccessful}
          id="coverLetter"
          maxLength={2000}
          name="coverLetter"
          placeholder="Tell the employer why you are interested in this role."
          rows={6}
        />
      </div>

      <Button
        className="w-full"
        disabled={isPending || isSuccessful}
        type="submit"
      >
        {isPending
          ? "Submitting..."
          : isSuccessful
            ? "Application submitted"
            : "Apply now"}
      </Button>

      {message ? (
        <p
          className={
            isSuccessful ? "text-sm text-primary" : "text-sm text-destructive"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
