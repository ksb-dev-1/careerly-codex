"use client";

import { useState, useTransition } from "react";
import type { SubmitEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteResume } from "@/actions/delete-resume";
import { uploadResume } from "@/actions/upload-resume";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateResumeFile } from "@/lib/validations/resume";

type ResumeSummary = {
  id: string;
  fileName: string;
  fileSize: number | null;
};

function formatFileSize(bytes: number | null) {
  if (bytes === null) return "Size unavailable";

  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeUploadForm({
  initialResume,
  returnTo,
}: {
  initialResume: ResumeSummary | null;
  returnTo: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      setIsSuccessful(false);
      setMessage("Choose a resume file.");
      return;
    }

    const validationMessage = validateResumeFile(file);

    if (validationMessage) {
      setIsSuccessful(false);
      setMessage(validationMessage);
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const result = await uploadResume(formData);

        setIsSuccessful(result.success);
        setMessage(result.message);

        if (result.success) {
          form.reset();

          if (returnTo) {
            router.push(returnTo);
          } else {
            router.refresh();
          }
        }
      } catch {
        setIsSuccessful(false);
        setMessage("Unable to upload the resume.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete your current resume?")) return;

    setMessage(null);

    startTransition(async () => {
      try {
        const result = await deleteResume();

        setIsSuccessful(result.success);
        setMessage(result.message);

        if (result.success) router.refresh();
      } catch {
        setIsSuccessful(false);
        setMessage("Unable to delete the resume.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>
          Upload a PDF, DOC, or DOCX file up to 5 MB.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {initialResume ? (
          <div className="space-y-3 border-b pb-6">
            <div>
              <p className="font-medium">{initialResume.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(initialResume.fileSize)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild type="button" variant="outline">
                <Link
                  href={`/api/resumes/${initialResume.id}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Download resume
                </Link>
              </Button>
              <Button
                disabled={isPending}
                onClick={handleDelete}
                type="button"
                variant="destructive"
              >
                {isPending ? "Deleting..." : "Delete resume"}
              </Button>
            </div>
          </div>
        ) : null}

        <form
          className="space-y-4"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="resume">Resume file</Label>
            <Input
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={isPending}
              id="resume"
              name="resume"
              required
              type="file"
            />
          </div>

          <Button disabled={isPending} type="submit">
            {isPending
              ? "Uploading..."
              : initialResume
                ? "Replace resume"
                : "Upload resume"}
          </Button>

          {message ? (
            <p
              className={
                isSuccessful
                  ? "text-sm text-primary"
                  : "text-sm text-destructive"
              }
              role="status"
            >
              {message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
