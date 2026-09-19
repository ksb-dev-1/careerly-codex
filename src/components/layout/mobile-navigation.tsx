"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Bookmark,
  BriefcaseBusiness,
  CircleUserRound,
  FilePlus2,
  FileText,
  LogIn,
  LogOut,
  Menu,
  Tag,
  UserRoundCog,
} from "lucide-react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

type UserRole = "JOB_SEEKER" | "EMPLOYER" | null;

type MobileNavigationProps = {
  email?: string;
  image?: string | null;
  isPending: boolean;
  name?: string;
  profileHref: string;
  role: UserRole;
  signedIn: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof BriefcaseBusiness;
};

function getNavigationItems(
  role: UserRole,
  signedIn: boolean,
  profileHref: string,
): NavItem[] {
  if (role === "JOB_SEEKER") {
    return [
      { href: "/job-seeker/jobs", label: "Jobs", icon: BriefcaseBusiness },
      { href: "/job-seeker/bookmarks", label: "Bookmarks", icon: Bookmark },
      {
        href: "/job-seeker/applications",
        label: "Applications",
        icon: FileText,
      },
      { href: profileHref, label: "Edit profile", icon: CircleUserRound },
      { href: "/pricing", label: "Pricing", icon: Tag },
    ];
  }

  if (role === "EMPLOYER") {
    return [
      { href: "/employer/jobs", label: "Your jobs", icon: BriefcaseBusiness },
      { href: "/employer/jobs/create", label: "Create job", icon: FilePlus2 },
      { href: profileHref, label: "Edit profile", icon: CircleUserRound },
      { href: "/pricing", label: "Pricing", icon: Tag },
    ];
  }

  if (signedIn) {
    return [
      { href: "/select-user-role", label: "Choose role", icon: UserRoundCog },
      { href: "/pricing", label: "Pricing", icon: Tag },
    ];
  }

  return [
    { href: "/pricing", label: "Pricing", icon: Tag },
    { href: "/sign-in", label: "Sign in", icon: LogIn },
  ];
}

export function MobileNavigation({
  email,
  image,
  isPending,
  name,
  profileHref,
  role,
  signedIn,
}: MobileNavigationProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const navigationItems = getNavigationItems(role, signedIn, profileHref);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);

    const { error } = await authClient.signOut();

    if (error) {
      setSignOutError(error.message ?? "Unable to sign out. Please try again.");
      setIsSigningOut(false);
      return;
    }

    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open navigation menu"
          className="size-9"
          size="icon"
          variant="outline"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg text-primary">Careerly</SheetTitle>
          <SheetDescription>Navigate your Careerly account.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isPending ? (
            <p className="text-sm text-muted-foreground">Loading account…</p>
          ) : (
            <>
              {signedIn ? (
                <Card className="mb-5" size="sm">
                  <CardContent className="flex items-center gap-3">
                    <AvatarPrimitive.Root className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      <AvatarPrimitive.Image
                        alt=""
                        className="size-full object-cover"
                        src={image ?? undefined}
                      />
                      <AvatarPrimitive.Fallback
                        className="flex size-full items-center justify-center font-semibold"
                        delayMs={0}
                      >
                        {name?.charAt(0).toUpperCase() || "U"}
                      </AvatarPrimitive.Fallback>
                    </AvatarPrimitive.Root>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <nav aria-label="Mobile navigation" className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SheetClose asChild key={item.href}>
                      <Button
                        asChild
                        className="h-10 w-full justify-start px-3"
                        variant="ghost"
                      >
                        <Link href={item.href}>
                          <Icon aria-hidden="true" />
                          {item.label}
                        </Link>
                      </Button>
                    </SheetClose>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        <SheetFooter className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Appearance</p>
              <p className="text-xs text-muted-foreground">Choose your theme</p>
            </div>
            <ModeToggle />
          </div>

          {signedIn && !isPending ? (
            <Button
              className="w-full"
              disabled={isSigningOut}
              onClick={() => void handleSignOut()}
              variant="destructive"
            >
              <LogOut data-icon="inline-start" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          ) : null}

          {signOutError ? (
            <p className="text-xs text-destructive" role="alert">
              {signOutError}
            </p>
          ) : null}

        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
