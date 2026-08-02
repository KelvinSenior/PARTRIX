import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getOrganizationSettings } from "@/services/settings";
import { listActivityLogs } from "@/services/audit";
import { appCard, appCardInner, appBtnSecondary } from "@/lib/appStyles";
import SettingsForm from "@/components/settings/SettingsForm";
import LogoutButton from "@/components/auth/LogoutButton";
import SettingsRefreshButton from "@/components/settings/SettingsRefreshButton";

export default async function SettingsPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const settings = await getOrganizationSettings();
  const activityLogs = await listActivityLogs();

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Settings"
        title="Workspace configuration"
        description="Manage your business settings, payment preferences, deposit policy, invoice branding, and audit history."
      />

      <div className="mx-auto w-full max-w-[1500px]">
        <div className="grid w-full items-stretch gap-5 xl:grid-cols-[1.4fr_0.6fr]">
          <section className={`${appCard} h-full w-full`}>
            <h2 className="text-lg font-semibold text-white">Workspace settings</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Update business, rental, payment, invoice, notification, and appearance preferences for your organization.
            </p>
            <div className="mt-6">
              <SettingsForm initialSettings={settings} />
            </div>

            <div className="mt-6 rounded-2xl border border-rose-400/15 bg-rose-500/8 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Sign out</p>
                  <p className="mt-1 text-sm text-zinc-400">End your current session from this workspace.</p>
                </div>
                <LogoutButton className={`${appBtnSecondary} border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15`} label="Log out" />
              </div>
            </div>
          </section>

          <section className={`${appCard} h-full w-full`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/75">Audit log</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Recent activity</h3>
              </div>
              <SettingsRefreshButton />
            </div>

            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              {activityLogs.length === 0 ? (
                <p className="text-zinc-500">No recent activity has been recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.slice(0, 12).map((log) => (
                    <div key={log.id} className={`${appCardInner} space-y-2`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{log.action}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{log.entity}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.24em] text-zinc-400">{log.level}</span>
                      </div>
                      <div className="grid gap-1 text-xs text-zinc-400 sm:grid-cols-2">
                        <div>{log.userName ?? "System"}</div>
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <pre className="overflow-x-auto rounded-xl bg-slate-950/70 p-3 text-xs text-zinc-300">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
