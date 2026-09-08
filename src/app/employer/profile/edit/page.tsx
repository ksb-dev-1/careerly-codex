import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db";
import { employerProfile } from "@/db/schema";
import { auth } from "@/lib/auth";

import { EmployerProfileForm } from "./employer-profile-form";

export const metadata: Metadata = {
  title: "Edit employer profile | Careerly",
  description: "Update your employer profile on Careerly.",
};

export default async function EditEmployerProfilePage() {
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
    where: eq(employerProfile.userId, session.user.id),
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Your employer profile</h1>
        <p className="text-sm text-muted-foreground">
          Add the company details candidates should see.
        </p>
      </div>

      <div className="mt-8">
        <EmployerProfileForm initialProfile={profile} />
      </div>
    </main>
  );
}
