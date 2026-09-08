import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link className="text-lg font-semibold tracking-tight" href="/">
          Careerly
        </Link>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild size="sm" variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
