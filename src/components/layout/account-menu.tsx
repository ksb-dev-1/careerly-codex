"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BriefcaseBusiness, LogOut, UserRound } from "lucide-react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

type AccountMenuProps = {
  name: string;
  email: string;
  image: string | null | undefined;
  profileHref: string;
  isEmployer: boolean;
  hasRole: boolean;
};

export function AccountMenu({
  name,
  email,
  image,
  profileHref,
  isEmployer,
  hasRole,
}: AccountMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

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
              src={image ?? undefined}
            />
            <AvatarPrimitive.Fallback
              className="flex size-full items-center justify-center text-sm font-semibold text-foreground"
              delayMs={0}
            >
              {name.charAt(0).toUpperCase() || "U"}
            </AvatarPrimitive.Fallback>
          </AvatarPrimitive.Root>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isEmployer ? (
          <DropdownMenuItem asChild className="text-sm">
            <Link href="/employer/jobs">
              <BriefcaseBusiness aria-hidden="true" className="size-4" />
              Your jobs
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem asChild className="text-sm">
          <Link href={profileHref}>
            <UserRound aria-hidden="true" className="size-4" />
            {hasRole ? "Edit profile" : "Choose role"}
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
          <p className="px-2 py-1 text-xs text-destructive" role="alert">
            {signOutError}
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
