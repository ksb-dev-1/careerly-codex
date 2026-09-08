import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { jobSeekerProfile } from "@/db/schema";
import { auth } from "@/lib/auth";

import { JobSeekerProfileForm } from "./job-seeker-profile-form";

export const metadata: Metadata = {
  title: "Edit job-seeker profile | Careerly",
  description: "Update your job-seeker profile on Careerly.",
};

export default async function EditJobSeekerProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "JOB_SEEKER") {
    redirect("/");
  }

  const profile = await db.query.jobSeekerProfile.findFirst({
    where: eq(jobSeekerProfile.userId, session.user.id),
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Your job-seeker profile</h1>
        <p className="text-sm text-muted-foreground">
          Add the details employers need to understand your experience.
        </p>
      </div>

      <div className="mt-8">
        <JobSeekerProfileForm initialProfile={profile} />
      </div>
    </main>
  );
}
