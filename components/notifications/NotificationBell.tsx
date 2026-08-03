"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import type { NotificationDTO } from "@/types/notification";

const importantPriorities = new Set(["SUCCESS", "WARNING", "CRITICAL"]);

function formatTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenLatestId = useRef<string | null>(null);
  const initialized = useRef(false);

  async function loadNotifications() {
    const response = await fetch("/api/notifications?status=unread&pageSize=6", { cache: "no-store" });
    if (!response.ok) return;

    const data = await response.json();
    const nextNotifications = data.notifications ?? [];
    setNotifications(nextNotifications);
    setUnreadCount(data.unreadCount ?? 0);

    const newest = nextNotifications[0];
    if (newest && initialized.current && newest.id !== seenLatestId.current && importantPriorities.has(newest.priority)) {
      toast(newest.title, {
        icon: newest.priority === "CRITICAL" ? "!" : "✓",
        style: { borderRadius: "1rem", background: "#0f172a", color: "#f8fafc" },
      });
    }
    if (newest) seenLatestId.current = newest.id;
    initialized.current = true;
  }

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const badge = useMemo(() => (unreadCount > 99 ? "99+" : String(unreadCount)), [unreadCount]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    await loadNotifications();
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white/80 text-slate-700 transition hover:bg-slate-50 dark:border-cyan-200/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-13 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-cyan-200/10 dark:bg-[#050816]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 dark:text-cyan-200 dark:hover:bg-cyan-400/10"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all
            </button>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/[0.04] dark:text-zinc-400">
                No unread notifications.
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => {
                    markRead(notification.id);
                    setOpen(false);
                  }}
                  className="block rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                    <span className="text-xs text-slate-500 dark:text-zinc-500">{formatTime(notification.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-zinc-400">
                    {notification.message}
                  </p>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-200 px-4 py-3 text-center text-sm font-semibold text-cyan-700 hover:bg-cyan-50 dark:border-white/10 dark:text-cyan-200 dark:hover:bg-cyan-400/10"
          >
            View notification center
          </Link>
        </div>
      ) : null}
    </div>
  );
}
