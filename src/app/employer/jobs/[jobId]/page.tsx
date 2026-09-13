import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { JobDescription } from "@/components/employer/job-description";
import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";

import { CloseJobButton } from "./close-job-button";
import { PublishJobButton } from "./publish-job-button";

export const metadata: Metadata = {
  title: "Job details | Careerly",
  description: "Review a job posting you created.",
};

export default async function EmployerJobDetailsPage({
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
    where: and(eq(job.id, jobId), eq(job.employerId, session.user.id)),
  });

  if (!listing) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
      <Link className="text-sm underline" href="/employer/jobs">
        Back to your jobs
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="text-sm text-muted-foreground">
          Status: {listing.status.toLowerCase()}
        </p>
        {listing.status === "DRAFT" ? (
          <PublishJobButton jobId={listing.id} />
        ) : null}
        {listing.status === "PUBLISHED" ? (
          <CloseJobButton jobId={listing.id} />
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Description</h2>
        <JobDescription content={listing.description} />
      </section>

      <section className="space-y-2 text-sm">
        <p>Employment: {listing.employmentType.replaceAll("_", " ")}</p>
        <p>Workplace: {listing.workplaceType.replaceAll("_", " ")}</p>
        <p>Experience: {listing.experienceLevel}</p>
        <p>Location: {listing.location || "Not specified"}</p>
        <p>Openings: {listing.openings}</p>
        <p>Skills: {listing.skills.join(", ")}</p>
      </section>
    </main>
  );
}
