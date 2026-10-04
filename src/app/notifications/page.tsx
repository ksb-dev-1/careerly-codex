import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { Bell } from "lucide-react";
import type { Metadata } from "next";

import { JobsPagination } from "@/components/jobs-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { notification } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  MarkAllNotificationsReadButton,
  MarkNotificationReadButton,
} from "./notification-actions";

export const metadata: Metadata = {
  title: "Notifications | Careerly",
  description: "Review updates about your Careerly activity.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NOTIFICATIONS_PER_PAGE = 10;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const parsedPage =
    typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;
  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [[summary], [unreadSummary]] = await Promise.all([
    db
      .select({ total: count() })
      .from(notification)
      .where(eq(notification.recipientUserId, session.user.id)),
    db
      .select({ total: count() })
      .from(notification)
      .where(
        and(
          eq(notification.recipientUserId, session.user.id),
          isNull(notification.readAt),
        ),
      ),
  ]);

  const totalNotifications = summary?.total ?? 0;
  const unreadNotifications = unreadSummary?.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalNotifications / NOTIFICATIONS_PER_PAGE),
  );
  const currentPage = Math.min(requestedPage, totalPages);

  const notifications = await db
    .select()
    .from(notification)
    .where(eq(notification.recipientUserId, session.user.id))
    .orderBy(desc(notification.createdAt), desc(notification.id))
    .limit(NOTIFICATIONS_PER_PAGE)
    .offset((currentPage - 1) * NOTIFICATIONS_PER_PAGE);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {unreadNotifications} unread notification
            {unreadNotifications === 1 ? "" : "s"}.
          </p>
        </div>
        {unreadNotifications > 0 ? <MarkAllNotificationsReadButton /> : null}
      </div>

      {notifications.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Updates about applications and hiring activity will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {notifications.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    {item.readAt === null ? <Badge>New</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    }).format(item.createdAt)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.href ? (
                      <Button asChild>
                        <Link href={item.href}>View details</Link>
                      </Button>
                    ) : null}
                    {item.readAt === null ? (
                      <MarkNotificationReadButton notificationId={item.id} />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 ? (
            <JobsPagination
              basePath="/notifications"
              currentPage={currentPage}
              totalPages={totalPages}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
