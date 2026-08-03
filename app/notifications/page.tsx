import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { getAuthCookie } from "@/lib/cookies";
import { getCurrentUserFromToken } from "@/services/auth";

export default async function NotificationsPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Notification center"
        title="Notifications"
        description="Review real workspace events, act on unread alerts, and keep your operations queue tidy."
      />
      <NotificationCenter />
    </AppShell>
  );
}
