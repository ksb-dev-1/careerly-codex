import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { and, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";

import { JobForm } from "@/components/employer/job-form";
import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CURRENCIES, type JobInput } from "@/lib/validations/job";

export const metadata: Metadata = {
  title: "Edit job | Careerly",
  description: "Update a job posting you created.",
  robots: { index: false, follow: false },
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYER") redirect("/");

  const { jobId } = await params;

  const listing = await db.query.job.findFirst({
    where: and(
      eq(job.id, jobId),
      eq(job.employerId, session.user.id),
      inArray(job.status, ["DRAFT", "PUBLISHED"]),
    ),
  });

  if (!listing) notFound();

  const initialJob: JobInput = {
    title: listing.title,
    description: listing.description,
    location: listing.location ?? "",
    employmentType: listing.employmentType,
    workplaceType: listing.workplaceType,
    experienceLevel: listing.experienceLevel,
    minimumSalary: listing.minimumSalary,
    maximumSalary: listing.maximumSalary,
    currency: CURRENCIES.find((value) => value === listing.currency) ?? "INR",
    openings: listing.openings,
    skills: listing.skills,
    expiresAt: listing.expiresAt,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link className="text-sm underline" href={`/employer/jobs/${listing.id}`}>
        Back to job
      </Link>

      <h1 className="mt-6 text-2xl font-semibold">Edit job</h1>

      <div className="mt-8">
        <JobForm initialJob={initialJob} jobId={listing.id} />
      </div>
    </main>
  );
}
