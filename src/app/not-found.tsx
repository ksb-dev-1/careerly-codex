import Link from "next/link";

import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl px-6 py-20">
      <Card className="w-full">
        <CardHeader className="text-center">
          <SearchX className="mx-auto size-9 text-muted-foreground" />
          <CardTitle className="text-xl">Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            The page may have moved, or the job may no longer be available.
          </p>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
