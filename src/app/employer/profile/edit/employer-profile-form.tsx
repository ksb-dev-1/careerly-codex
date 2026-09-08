"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { upsertEmployerProfile } from "@/actions/upsert-employer-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EmployerProfileFormProps = {
  initialProfile?: {
    companyName: string | null;
    industry: string | null;
    location: string | null;
    about: string | null;
  };
};

function getString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : undefined;
}

export function EmployerProfileForm({
  initialProfile,
}: EmployerProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await upsertEmployerProfile({
          companyName: getString(formData, "companyName"),
          industry: getString(formData, "industry"),
          location: getString(formData, "location"),
          about: getString(formData, "about"),
        });

        setSuccess("Profile saved.");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to save your profile. Please try again.",
        );
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company name</Label>
        <Input
          defaultValue={initialProfile?.companyName ?? ""}
          id="companyName"
          name="companyName"
          placeholder="Acme Inc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          defaultValue={initialProfile?.industry ?? ""}
          id="industry"
          name="industry"
          placeholder="Software and technology"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          defaultValue={initialProfile?.location ?? ""}
          id="location"
          name="location"
          placeholder="Bengaluru, India"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">About your company</Label>
        <Textarea
          defaultValue={initialProfile?.about ?? ""}
          id="about"
          name="about"
          placeholder="Describe your company, mission, and culture."
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="text-sm text-green-600" role="status">
          {success}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
