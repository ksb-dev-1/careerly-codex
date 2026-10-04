"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/mark-notification-read";
import { Button } from "@/components/ui/button";

export function MarkNotificationReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await markNotificationRead(notificationId);
            if (!result.success) setError(result.message);
            else router.refresh();
          });
        }}
        variant="outline"
      >
        {isPending ? "Updating..." : "Mark as read"}
      </Button>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function MarkAllNotificationsReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markAllNotificationsRead();
          router.refresh();
        });
      }}
      variant="outline"
    >
      {isPending ? "Updating..." : "Mark all as read"}
    </Button>
  );
}
