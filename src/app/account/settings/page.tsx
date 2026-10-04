import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

import { AccountSettingsForm } from "./account-settings-form";

export const metadata: Metadata = {
  title: "Account settings | Careerly",
  description: "Manage your Careerly account and personal information.",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Account settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account details and data.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">Your account</CardTitle>
            <Badge variant="secondary">
              {session.user.role?.replaceAll("_", " ").toLowerCase() ?? "No role"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm
            email={session.user.email}
            initialName={session.user.name}
          />
        </CardContent>
      </Card>
    </main>
  );
}
