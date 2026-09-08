"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { upsertJobSeekerProfile } from "@/actions/upsert-job-seeker-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type JobSeekerProfileFormProps = {
  initialProfile?: {
    headline: string | null;
    experience: string | null;
    skills: string[];
    location: string | null;
    about: string | null;
  };
};

function getString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : undefined;
}

export function JobSeekerProfileForm({
  initialProfile,
}: JobSeekerProfileFormProps) {
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
        await upsertJobSeekerProfile({
          headline: getString(formData, "headline"),
          experience: getString(formData, "experience"),
          skills: (getString(formData, "skills") ?? "").split(","),
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
        <Label htmlFor="headline">Professional headline</Label>
        <Input
          defaultValue={initialProfile?.headline ?? ""}
          id="headline"
          name="headline"
          placeholder="Frontend developer building accessible web apps"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience</Label>
        <Input
          defaultValue={initialProfile?.experience ?? ""}
          id="experience"
          name="experience"
          placeholder="3 years of experience"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          defaultValue={initialProfile?.skills.join(", ") ?? ""}
          id="skills"
          name="skills"
          placeholder="React, TypeScript, PostgreSQL"
        />
        <p className="text-xs text-muted-foreground">
          Separate skills with commas.
        </p>
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
        <Label htmlFor="about">About</Label>
        <Textarea
          defaultValue={initialProfile?.about ?? ""}
          id="about"
          name="about"
          placeholder="Tell employers about your background and goals."
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
