"use client";

import type { SubmitEvent } from "react";
import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";

import { deleteAccount } from "@/actions/delete-account";
import { updateAccount } from "@/actions/update-account";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function AccountSettingsForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleUpdate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");

    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateAccount({
          name: typeof name === "string" ? name : "",
        });
        if (!result.success) setError(result.message);
        else {
          setMessage(result.message);
          router.refresh();
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to update account.");
      }
    });
  }

  function handleDelete() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await deleteAccount({ confirmation });
        if (!result.success) {
          setError(result.message);
          return;
        }

        await authClient.signOut().catch(() => undefined);
        router.replace("/");
        router.refresh();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to delete account.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <form className="space-y-5" onSubmit={handleUpdate}>
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            defaultValue={initialName}
            id="name"
            maxLength={80}
            minLength={2}
            name="name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input disabled id="email" value={email} />
          <p className="text-xs text-muted-foreground">
            Your email is managed by your sign-in provider.
          </p>
        </div>
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Save account"}
        </Button>
      </form>

      <div className="border-t pt-6">
        <h2 className="font-semibold text-destructive">Delete account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This permanently removes your profile, jobs or applications, saved
          jobs, notifications, and authentication data.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="mt-4" variant="destructive">
              <Trash2 data-icon="inline-start" />
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your Careerly account?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Type DELETE to confirm. Active Premium
                subscriptions must be canceled and ended first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">Confirmation</Label>
              <Input
                autoComplete="off"
                id="delete-confirmation"
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="DELETE"
                value={confirmation}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button disabled={isPending} variant="outline">
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  disabled={isPending || confirmation !== "DELETE"}
                  onClick={handleDelete}
                  variant="destructive"
                >
                  {isPending ? "Deleting..." : "Delete permanently"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
