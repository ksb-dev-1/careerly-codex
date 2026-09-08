import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Metadata } from "next";

import { auth } from "@/lib/auth";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | Careerly",
  description: "Sign in to Careerly to find jobs or manage job postings.",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role) {
    redirect("/");
  }

  if (session) {
    redirect("/select-user-role");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SignInForm />
    </main>
  );
}
