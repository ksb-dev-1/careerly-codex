"use client";

import type { SubmitEvent } from "react";
import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { createJob } from "@/actions/create-job";
import { updateJob } from "@/actions/update-job";
import { JobDescriptionEditor } from "@/components/employer/job-description-editor";
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
import {
  CURRENCIES,
  EMPLOYMENT_TYPES,
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

function getRequiredNumber(formData: FormData, field: string) {
  const value = getString(formData, field).trim();

  return value === "" ? Number.NaN : Number(value);
}

function formatOption(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}

function formatDateInput(date: Date | null | undefined) {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

type JobFieldErrors = Partial<Record<keyof JobInput, string[]>>;

function FieldError({ errors }: { errors?: string[] }) {
  const message = errors?.[0];

  return message ? (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}

export function JobForm({
  initialJob,
  jobId,
}: {
  initialJob?: JobInput;
  jobId?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<JobFieldErrors>({});
  const [description, setDescription] = useState(initialJob?.description ?? "");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const expiresAt = getString(formData, "expiresAt");

    const input: JobInput = {
      title: getString(formData, "title"),
      description,
      location: getString(formData, "location"),
      employmentType: getString(
        formData,
        "employmentType",
      ) as JobInput["employmentType"],
      workplaceType: getString(
        formData,
        "workplaceType",
      ) as JobInput["workplaceType"],
      minimumExperience: getRequiredNumber(formData, "minimumExperience"),
      maximumExperience: getRequiredNumber(formData, "maximumExperience"),
      minimumSalary: getOptionalNumber(formData, "minimumSalary"),
      maximumSalary: getOptionalNumber(formData, "maximumSalary"),
      currency: getString(formData, "currency") as JobInput["currency"],
      openings: Number(getString(formData, "openings")),
      skills: getString(formData, "skills").split(","),
      expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.999`) : null,
    };

    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = jobId
          ? await updateJob(jobId, input)
          : await createJob(input);

        if (!result.success) {
          setError(result.message);
          setFieldErrors(result.fieldErrors as JobFieldErrors);
          return;
        }

        router.push(jobId ? `/employer/jobs/${jobId}` : "/employer/jobs");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to save the job. Please try again.",
        );
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title" className="font-semibold">
          Job title
        </Label>
        <Input
          id="title"
          maxLength={120}
          minLength={3}
          name="title"
          placeholder="Senior frontend developer"
          defaultValue={initialJob?.title}
          required
        />
        <FieldError errors={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <JobDescriptionEditor
          initialContent={initialJob?.description ?? ""}
          onChange={setDescription}
        />
        <FieldError errors={fieldErrors.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          maxLength={120}
          name="location"
          placeholder="Bengaluru, India"
          defaultValue={initialJob?.location}
        />
        <FieldError errors={fieldErrors.location} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment type</Label>
          <Select
            defaultValue={initialJob?.employmentType ?? "FULL_TIME"}
            name="employmentType"
          >
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
          <FieldError errors={fieldErrors.employmentType} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workplaceType">Workplace type</Label>
          <Select
            defaultValue={initialJob?.workplaceType ?? "ONSITE"}
            name="workplaceType"
          >
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
          <FieldError errors={fieldErrors.workplaceType} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumExperience">Minimum experience (years)</Label>
          <Input
            id="minimumExperience"
            name="minimumExperience"
            type="number"
            min={0}
            max={50}
            defaultValue={initialJob?.minimumExperience ?? ""}
            required
          />
          <FieldError errors={fieldErrors.minimumExperience} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumExperience">Maximum experience (years)</Label>
          <Input
            id="maximumExperience"
            name="maximumExperience"
            type="number"
            min={0}
            max={50}
            defaultValue={initialJob?.maximumExperience ?? ""}
            required
          />
          <FieldError errors={fieldErrors.maximumExperience} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select defaultValue={initialJob?.currency ?? "INR"} name="currency">
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
          <FieldError errors={fieldErrors.currency} />
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
            defaultValue={initialJob?.minimumSalary ?? ""}
          />
          <FieldError errors={fieldErrors.minimumSalary} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumSalary">Maximum salary</Label>
          <Input
            id="maximumSalary"
            min={0}
            name="maximumSalary"
            type="number"
            defaultValue={initialJob?.maximumSalary ?? ""}
          />
          <FieldError errors={fieldErrors.maximumSalary} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="openings">Openings</Label>
        <Input
          defaultValue={initialJob?.openings ?? 1}
          id="openings"
          max={1_000}
          min={1}
          name="openings"
          required
          type="number"
        />
        <FieldError errors={fieldErrors.openings} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          name="skills"
          placeholder="React, TypeScript, PostgreSQL"
          defaultValue={initialJob?.skills.join(", ")}
          required
        />
        <p className="text-xs text-muted-foreground">
          Separate skills with commas.
        </p>
        <FieldError errors={fieldErrors.skills} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Application deadline</Label>
        <Input
          defaultValue={formatDateInput(initialJob?.expiresAt)}
          id="expiresAt"
          name="expiresAt"
          type="date"
        />
        <FieldError errors={fieldErrors.expiresAt} />
      </div>

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : jobId ? "Save changes" : "Create draft"}
      </Button>
    </form>
  );
}
