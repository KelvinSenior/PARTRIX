"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Search, Trash2 } from "lucide-react";
import type { NotificationDTO } from "@/types/notification";
import { appBtnPrimary, appBtnSecondary, appInput } from "@/lib/appStyles";
import CollapsibleFilterPanel from "@/components/ui/CollapsibleFilterPanel";

const types = ["all", "BOOKING", "PAYMENT", "INVENTORY", "INVOICE", "ORGANIZATION", "SYSTEM"];

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const params = useMemo(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (type !== "all") next.set("type", type);
    if (status !== "all") next.set("status", status);
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    next.set("page", String(page));
    next.set("pageSize", String(pageSize));
    return next;
  }, [from, page, pageSize, query, status, to, type]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?${params.toString()}`, { cache: "no-store" });
      const text = await response.text();
      let body: { notifications?: NotificationDTO[]; total?: number; unreadCount?: number; message?: string } = {};

      if (text) {
        try {
          body = JSON.parse(text) as typeof body;
        } catch {
          body = { message: text };
        }
      }

      if (!response.ok) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
        console.error("Failed to load notifications", body.message ?? "Unknown error");
        return;
      }

      setNotifications(Array.isArray(body.notifications) ? body.notifications : []);
      setTotal(typeof body.total === "number" ? body.total : 0);
      setUnreadCount(typeof body.unreadCount === "number" ? body.unreadCount : 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([]);
      setTotal(0);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const timer = window.setTimeout(loadNotifications, 250);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    await loadNotifications();
  }

  async function remove(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    await loadNotifications();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    await loadNotifications();
  }

  async function clearRead() {
    await fetch("/api/notifications?scope=read", { method: "DELETE" });
    await loadNotifications();
  }

  return (
    <div className="space-y-4">
      <section className="sticky top-4 z-20 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-xl dark:border-cyan-200/10 dark:bg-[#050816]/90">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className={`${appInput} pl-10`}
                placeholder="Search notifications"
              />
            </div>
            <CollapsibleFilterPanel title="Advanced filters" description="Refine notifications by type, status, and date" activeCount={[type !== "all", status !== "all", from, to].filter(Boolean).length} storageKey="partrix-notifications-filters-open">
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">
                <select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} className={appInput}>
                  {types.map((item) => <option key={item} value={item}>{item === "all" ? "All types" : item}</option>)}
                </select>
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={appInput}>
                  <option value="all">All statuses</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
                <input aria-label="Filter notifications from date" placeholder="From" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className={appInput} />
                <input aria-label="Filter notifications to date" placeholder="To" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} className={appInput} />
                <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className={appInput}>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </CollapsibleFilterPanel>
          </div>
          <button type="button" onClick={markAllRead} className={appBtnPrimary}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
          <button type="button" onClick={clearRead} className={appBtnSecondary}>
            <Trash2 className="h-4 w-4" />
            Clear read
          </button>
        </div>

      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-cyan-200/10 dark:bg-white/4.5">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{total} notifications</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{unreadCount} unread</p>
          </div>
          {loading ? <span className="text-xs text-zinc-500">Refreshing...</span> : null}
        </div>

        {notifications.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-zinc-400">
            <Bell className="mx-auto mb-3 h-8 w-8 text-cyan-500" />
            No notifications match these filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {notifications.map((notification) => (
              <div key={notification.id} className="grid gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-white/2.5 lg:grid-cols-[1fr_auto]">
                <Link href={notification.href} onClick={() => markRead(notification.id)} className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {!notification.readAt ? <span className="h-2 w-2 rounded-full bg-cyan-500" /> : null}
                    <p className="font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-zinc-300">
                      {notification.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">{formatNotificationDate(notification.createdAt)}</p>
                </Link>
                <div className="flex items-center gap-2 lg:justify-end">
                  {!notification.readAt ? (
                    <button type="button" onClick={() => markRead(notification.id)} className={`${appBtnSecondary} h-10 px-3 text-xs`}>
                      Read
                    </button>
                  ) : null}
                  <button type="button" onClick={() => remove(notification.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-300/30 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className={appBtnSecondary}>
              Previous
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(current + 1, totalPages))} className={appBtnSecondary}>
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
