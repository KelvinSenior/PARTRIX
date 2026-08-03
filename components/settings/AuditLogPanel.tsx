"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ActivityLogDTO } from "@/services/audit";
import { appBtnSecondary, appCardInner, appInput } from "@/lib/appStyles";
import CollapsibleFilterPanel from "@/components/ui/CollapsibleFilterPanel";

export default function AuditLogPanel({ logs }: { logs: ActivityLogDTO[] }) {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState("all");
  const [action, setAction] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pageSize = 8;

  const users = useMemo(() => Array.from(new Set(logs.map((log) => log.userName ?? "System"))).sort(), [logs]);
  const actions = useMemo(() => Array.from(new Set(logs.map((log) => log.action))).sort(), [logs]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter((log) => {
      const created = log.createdAt.slice(0, 10);
      return (
        (!needle || [log.action, log.entity, log.userName ?? "System", JSON.stringify(log.details)].some((value) => value.toLowerCase().includes(needle))) &&
        (user === "all" || (log.userName ?? "System") === user) &&
        (action === "all" || log.action === action) &&
        (!from || created >= from) &&
        (!to || created <= to)
      );
    });
  }, [action, from, logs, query, to, user]);

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const visibleLogs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="sticky top-4 z-20 flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-sm backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className={`${appInput} pl-10`} placeholder="Search audit log" />
        </div>
        <CollapsibleFilterPanel title="Advanced filters" description="Filter by activity user, action, and date" activeCount={[user !== "all", action !== "all", from, to].filter(Boolean).length} storageKey="partrix-audit-filters-open">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <select value={user} onChange={(event) => { setUser(event.target.value); setPage(1); }} className={appInput}>
              <option value="all">All users</option>
              {users.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className={appInput}>
              <option value="all">All actions</option>
              {actions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input aria-label="Filter audit log from date" placeholder="From" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className={appInput} />
            <input aria-label="Filter audit log to date" placeholder="To" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} className={appInput} />
          </div>
        </CollapsibleFilterPanel>
      </div>

      {visibleLogs.length === 0 ? (
        <p className="rounded-2xl border border-white/10 p-4 text-sm text-zinc-500">No audit entries match these filters.</p>
      ) : (
        <div className="space-y-3">
          {visibleLogs.map((log) => {
            const isExpanded = expanded === log.id;
            return (
              <button
                key={log.id}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : log.id)}
                className={`${appCardInner} w-full space-y-2 text-left transition hover:border-cyan-200/30`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{log.entity}</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-zinc-400">{log.level}</span>
                </div>
                <div className="grid gap-1 text-xs text-zinc-400 sm:grid-cols-2">
                  <div>{log.userName ?? "System"}</div>
                  <div>{new Date(log.createdAt).toLocaleString()}</div>
                </div>
                <div className={`grid transition-all duration-300 ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/70 p-3 text-xs text-zinc-300">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-500">No additional details.</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">Page {currentPage} of {totalPages}</p>
        <div className="flex gap-2">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className={`${appBtnSecondary} h-10 px-3 text-xs`}>
            Previous
          </button>
          <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))} className={`${appBtnSecondary} h-10 px-3 text-xs`}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
