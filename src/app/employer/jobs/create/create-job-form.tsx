"use client";

import type { SubmitEvent } from "react";
import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { createJob } from "@/actions/create-job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CURRENCIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  type JobInput,
  WORKPLACE_TYPES,
} from "@/lib/validations/job";

function getString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function getOptionalNumber(formData: FormData, field: string) {
  const value = getString(formData, field).trim();

  return value ? Number(value) : null;
}

function formatOption(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}

export function CreateJobForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const expiresAt = getString(formData, "expiresAt");

    const input: JobInput = {
      title: getString(formData, "title"),
      description: getString(formData, "description"),
      location: getString(formData, "location"),
      employmentType: getString(
        formData,
        "employmentType",
      ) as JobInput["employmentType"],
      workplaceType: getString(
        formData,
        "workplaceType",
      ) as JobInput["workplaceType"],
      experienceLevel: getString(
        formData,
        "experienceLevel",
      ) as JobInput["experienceLevel"],
      minimumSalary: getOptionalNumber(formData, "minimumSalary"),
      maximumSalary: getOptionalNumber(formData, "maximumSalary"),
      currency: getString(formData, "currency") as JobInput["currency"],
      openings: Number(getString(formData, "openings")),
      skills: getString(formData, "skills").split(","),
      expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999`) : null,
    };

    setError(null);

    startTransition(async () => {
      try {
        const result = await createJob(input);

        if (!result.success) {
          const firstFieldError = Object.values(result.fieldErrors)
            .flat()
            .find(Boolean);

          setError(firstFieldError ?? result.message);
          return;
        }

        router.push("/employer/jobs");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to create the job. Please try again.",
        );
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Job title</Label>
        <Input
          id="title"
          maxLength={120}
          minLength={3}
          name="title"
          placeholder="Senior frontend developer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          maxLength={10_000}
          minLength={50}
          name="description"
          placeholder="Describe the role, responsibilities, and requirements."
          required
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          maxLength={120}
          name="location"
          placeholder="Bengaluru, India"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment type</Label>
          <Select defaultValue="FULL_TIME" name="employmentType">
            <SelectTrigger className="w-full" id="employmentType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem className="capitalize" key={type} value={type}>
                  {formatOption(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workplaceType">Workplace type</Label>
          <Select defaultValue="ONSITE" name="workplaceType">
            <SelectTrigger className="w-full" id="workplaceType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKPLACE_TYPES.map((type) => (
                <SelectItem className="capitalize" key={type} value={type}>
                  {formatOption(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Experience level</Label>
          <Select defaultValue="ENTRY" name="experienceLevel">
            <SelectTrigger className="w-full" id="experienceLevel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem className="capitalize" key={level} value={level}>
                  {formatOption(level)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select defaultValue="INR" name="currency">
            <SelectTrigger className="w-full" id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minimumSalary">Minimum salary</Label>
          <Input
            id="minimumSalary"
            min={0}
            name="minimumSalary"
            type="number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumSalary">Maximum salary</Label>
          <Input
            id="maximumSalary"
            min={0}
            name="maximumSalary"
            type="number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="openings">Openings</Label>
        <Input
          defaultValue={1}
          id="openings"
          max={1_000}
          min={1}
          name="openings"
          required
          type="number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          name="skills"
          placeholder="React, TypeScript, PostgreSQL"
          required
        />
        <p className="text-xs text-muted-foreground">
          Separate skills with commas.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Application deadline</Label>
        <Input id="expiresAt" name="expiresAt" type="date" />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        {isPending ? "Creating draft..." : "Create draft"}
      </Button>
    </form>
  );
}
