"use client";

import { useState } from "react";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

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
    <section className="space-y-4">
      <div className="space-y-3">
        <Button
          className="relative h-10 w-full text-sm font-semibold"
          disabled={isPending}
          onClick={() => handleSignIn("google")}
          variant="outline"
        >
          <FcGoogle aria-hidden="true" className="absolute left-4 size-5" />
          Continue with Google
        </Button>

        <Button
          className="relative h-10 w-full text-sm font-semibold"
          disabled={isPending}
          onClick={() => handleSignIn("github")}
          variant="outline"
        >
          <FaGithub aria-hidden="true" className="absolute left-4 size-5" />
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
