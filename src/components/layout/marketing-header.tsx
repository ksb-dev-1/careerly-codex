"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BriefcaseBusiness, LogOut, Tag, UserRound } from "lucide-react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function MarketingHeader() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const role = session && "role" in session.user ? session.user.role : null;
  const destination =
    role === "EMPLOYER"
      ? { href: "/employer/jobs", label: "Your jobs" }
      : role === "JOB_SEEKER"
        ? { href: "/job-seeker/profile/edit", label: "Your profile" }
        : session
          ? { href: "/select-user-role", label: "Choose role" }
          : { href: "/sign-in", label: "Sign in" };
  const profileHref =
    role === "EMPLOYER"
      ? "/employer/profile/edit"
      : role === "JOB_SEEKER"
        ? "/job-seeker/profile/edit"
        : "/select-user-role";

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);

    const { error } = await authClient.signOut();

    if (error) {
      setSignOutError(error.message ?? "Unable to sign out. Please try again.");
      setIsSigningOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-background">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link className="shrink-0 text-xl font-bold text-primary" href="/">
          Careerly
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6">
            {session ? (
              <Link
                aria-label={destination.label}
                className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-foreground/80 transition-colors hover:text-brand-700 dark:hover:text-brand-400"
                href={destination.href}
              >
                {role === "EMPLOYER" ? (
                  <BriefcaseBusiness aria-hidden="true" className="size-4" />
                ) : (
                  <UserRound aria-hidden="true" className="size-4" />
                )}
                <span className="hidden sm:inline">{destination.label}</span>
              </Link>
            ) : null}
            <Link
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-foreground/80 transition-colors hover:text-brand-700 dark:hover:text-brand-400"
              href="/pricing"
            >
              <Tag aria-hidden="true" className="size-4" />
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            {isPending ? (
              <span
                aria-hidden="true"
                className="size-9 rounded-full bg-muted"
              />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open account menu"
                    className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted outline-none transition-colors hover:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:hover:border-brand-400 dark:focus-visible:ring-brand-400"
                    type="button"
                  >
                    <AvatarPrimitive.Root className="flex size-full items-center justify-center overflow-hidden rounded-full">
                      <AvatarPrimitive.Image
                        alt=""
                        className="size-full object-cover"
                        src={session.user.image ?? undefined}
                      />
                      <AvatarPrimitive.Fallback
                        className="flex size-full items-center justify-center text-sm font-semibold text-foreground"
                        delayMs={0}
                      >
                        {session.user.name.charAt(0).toUpperCase() || "U"}
                      </AvatarPrimitive.Fallback>
                    </AvatarPrimitive.Root>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {session.user.name}
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {session.user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {role === "EMPLOYER" ? (
                    <DropdownMenuItem asChild className="text-sm">
                      <Link href="/employer/jobs">
                        <BriefcaseBusiness
                          aria-hidden="true"
                          className="size-4"
                        />
                        Your jobs
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem asChild className="text-sm">
                    <Link href={profileHref}>
                      <UserRound aria-hidden="true" className="size-4" />
                      {role ? "Edit profile" : "Choose role"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-sm"
                    disabled={isSigningOut}
                    onSelect={(event) => {
                      event.preventDefault();
                      void handleSignOut();
                    }}
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    {isSigningOut ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                  {signOutError ? (
                    <p
                      className="px-2 py-1 text-xs text-destructive"
                      role="alert"
                    >
                      {signOutError}
                    </p>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
