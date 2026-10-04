import { headers } from "next/headers";
import Link from "next/link";

import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Access denied | Careerly",
  description: "You do not have permission to view this Careerly page.",
  robots: { index: false, follow: false },
};

export default async function UnauthorizedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const destination =
    session?.user.role === "EMPLOYER"
      ? "/employer/dashboard"
      : session?.user.role === "JOB_SEEKER"
        ? "/job-seeker/dashboard"
        : "/";

  return (
    <main className="mx-auto flex w-full max-w-xl px-6 py-20">
      <Card className="w-full">
        <CardHeader className="text-center">
          <ShieldAlert className="mx-auto size-9 text-destructive" />
          <CardTitle className="text-xl">You cannot access this page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            This page belongs to a different account role or requires
            permissions your account does not have.
          </p>
          <Button asChild>
            <Link href={destination}>Go to your dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
