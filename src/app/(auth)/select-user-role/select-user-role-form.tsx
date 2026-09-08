"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { type UserRole, assignUserRole } from "@/actions/assign-user-role";
import { Button } from "@/components/ui/button";

const roles: Array<{
  value: UserRole;
  title: string;
  description: string;
}> = [
  {
    value: "JOB_SEEKER",
    title: "Job seeker",
    description: "Find jobs and track your applications.",
  },
  {
    value: "EMPLOYER",
    title: "Employer",
    description: "Post jobs and manage applicants.",
  },
];

const roleDestinations: Record<UserRole, string> = {
  JOB_SEEKER: "/job-seeker/profile/edit",
  EMPLOYER: "/employer/profile/edit",
};

export function SelectUserRoleForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function selectRole(role: UserRole) {
    setError(null);

    startTransition(async () => {
      try {
        await assignUserRole(role);
        router.replace(roleDestinations[role]);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to save your role. Please try again.",
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <Button
          className="h-auto w-full justify-start p-4 text-left"
          disabled={isPending}
          key={role.value}
          onClick={() => selectRole(role.value)}
          size="lg"
          variant="outline"
        >
          <span className="space-y-1">
            <span className="block font-semibold">{role.title}</span>
            <span className="block text-muted-foreground">
              {role.description}
            </span>
          </span>
        </Button>
      ))}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
