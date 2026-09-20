"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";

import Link from "next/link";

import { applyToJob } from "@/actions/apply-to-job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MembershipPlan } from "@/lib/server/application-quota";

type ApplyToJobFormProps = {
  jobId: string;
  membershipPlan: MembershipPlan;
  dailyLimit: number;
  remainingApplications: number;
  canApplyToday: boolean;
};

export function ApplyToJobForm({
  jobId,
  membershipPlan,
  dailyLimit,
  remainingApplications: initialRemainingApplications,
  canApplyToday: initialCanApplyToday,
}: ApplyToJobFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [remainingApplications, setRemainingApplications] = useState(
    initialRemainingApplications,
  );
  const [canApplyToday, setCanApplyToday] = useState(initialCanApplyToday);

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
        setRemainingApplications(result.remainingApplications);
        form.reset();
      } else if (result.code === "DAILY_LIMIT_REACHED") {
        setRemainingApplications(0);
        setCanApplyToday(false);
      }
    } catch {
      setMessage("Unable to submit your application.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3 border bg-muted/40 p-3 text-sm">
        <Badge variant={membershipPlan === "PREMIUM" ? "default" : "secondary"}>
          {membershipPlan === "PREMIUM" ? "Premium" : "Free"}
        </Badge>
        <span className="text-right text-muted-foreground">
          {remainingApplications} of {dailyLimit} application
          {dailyLimit === 1 ? "" : "s"} left today
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverLetter">
          Cover letter <span className="text-muted-foreground">(optional)</span>
        </Label>

        <Textarea
          disabled={isPending || isSuccessful || !canApplyToday}
          id="coverLetter"
          maxLength={2000}
          name="coverLetter"
          placeholder="Tell the employer why you are interested in this role."
          rows={6}
        />
      </div>

      <Button
        className="w-full"
        disabled={isPending || isSuccessful || !canApplyToday}
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

      {!canApplyToday && !isSuccessful ? (
        <p className="text-sm text-muted-foreground">
          Your daily limit resets at midnight IST.
          {membershipPlan === "FREE" ? (
            <>
              {" "}
              <Link className="font-medium text-primary underline" href="/pricing">
                View Premium
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
