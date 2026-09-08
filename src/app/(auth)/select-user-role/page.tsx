import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { auth } from "@/lib/auth";

import { SelectUserRoleForm } from "./select-user-role-form";

export const metadata: Metadata = {
  title: "Choose your role | Careerly",
  description: "Choose how you want to use Careerly.",
};

export default async function SelectUserRolePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <section className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Choose your role</h1>
        <p className="text-sm text-muted-foreground">
          Tell us how you want to use Careerly.
        </p>
        <SelectUserRoleForm />
      </section>
    </main>
  );
}
