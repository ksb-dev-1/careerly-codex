"use client";

import { useState, useTransition } from "react";
import type { SubmitEvent } from "react";

import { useRouter } from "next/navigation";

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

export function ResumeUploadForm() {
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
          router.refresh();
        }
      } catch {
        setIsSuccessful(false);
        setMessage("Unable to upload the resume.");
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

      <CardContent>
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
            {isPending ? "Uploading..." : "Upload resume"}
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
