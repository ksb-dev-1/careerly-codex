"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Provider = "google" | "github";

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSignIn(provider: Provider) {
    setError(null);
    setIsPending(true);

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/select-user-role",
    });

    if (error) {
      setError(error.message ?? "Unable to sign in. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <section className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in to Careerly</h1>
        <p className="text-sm text-muted-foreground">
          Continue with your preferred account.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          disabled={isPending}
          onClick={() => handleSignIn("google")}
          size="lg"
          variant="outline"
        >
          Continue with Google
        </Button>
        <Button
          className="w-full"
          disabled={isPending}
          onClick={() => handleSignIn("github")}
          size="lg"
          variant="outline"
        >
          Continue with GitHub
        </Button>
      </div>

      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
