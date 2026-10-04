"use client";

import { useEffect } from "react";

import Link from "next/link";

import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Careerly route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl px-6 py-20">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CircleAlert className="mx-auto size-9 text-destructive" />
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            We could not complete this request. Try again, or return home if the
            problem continues.
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
