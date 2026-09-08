import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { job } from "@/db/schema";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Your jobs | Careerly",
  description: "Manage your Careerly job postings.",
};

export default async function EmployerJobsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/");
  }

  const jobs = await db.query.job.findMany({
    orderBy: (job, { desc }) => [desc(job.createdAt)],
    where: eq(job.employerId, session.user.id),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Your jobs</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your job postings.
          </p>
        </div>

        <Button asChild>
          <Link href="/employer/jobs/create">Create job</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You have not created any jobs yet.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {jobs.map((job) => (
            <li className="rounded-lg border p-5" key={job.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="font-semibold">{job.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {job.workplaceType.replaceAll("_", " ").toLowerCase()}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                </div>

                <span className="rounded-full border px-2 py-1 text-xs">
                  {job.status.toLowerCase()}
                </span>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Created{" "}
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                }).format(job.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
