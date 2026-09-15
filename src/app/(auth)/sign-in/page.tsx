import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="flex flex-1 items-center px-6 py-12">
      <div className="mx-auto grid w-full max-w-4xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <section className="hidden border-l-4 border-primary py-4 pl-8 lg:block">
          <p className="mb-5 text-sm font-semibold text-primary">WELCOME TO CAREERLY</p>
          <h1 className="text-4xl font-bold tracking-tight">
            Your next move starts here.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Find your next opportunity or connect with the people who will
            help your team grow.
          </p>
        </section>

        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Sign in to <span className="text-primary">Careerly</span>
            </CardTitle>
            <CardDescription>
              Choose a provider to continue to your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
