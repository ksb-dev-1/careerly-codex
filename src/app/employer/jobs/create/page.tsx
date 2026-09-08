import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { employerProfile } from "@/db/schema";
import { auth } from "@/lib/auth";

import { CreateJobForm } from "./create-job-form";

export const metadata: Metadata = {
  title: "Create a job | Careerly",
  description: "Create a new job posting for your organization.",
};

export default async function CreateJobPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/");
  }

  const profile = await db.query.employerProfile.findFirst({
    columns: {
      companyName: true,
    },
    where: eq(employerProfile.userId, session.user.id),
  });

  if (!profile?.companyName) {
    redirect("/employer/profile/edit");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create a job</h1>
        <p className="text-sm text-muted-foreground">
          Create a draft first. You can review it before publishing.
        </p>
      </div>

      <div className="mt-8">
        <CreateJobForm />
      </div>
    </main>
  );
}
