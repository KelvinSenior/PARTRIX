import type { ReactNode } from "react";
import type { SessionUser } from "@/types/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { appShell } from "@/lib/appStyles";

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
  showFab?: boolean;
  fabHref?: string;
  fabLabel?: string;
};

export default function AppShell({
  user,
  children,
  showFab = true,
  fabHref,
  fabLabel,
}: AppShellProps) {
  return (
    <main className={appShell}>
      <div className="app-shell-grid mx-auto grid min-h-[100dvh] w-full max-w-[1800px] gap-5 px-0 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:py-6">
        <Sidebar />
        <section className="min-w-0 space-y-5 pb-24 lg:pb-6">
          <TopNav user={user} />
          {children}
        </section>
      </div>
      {showFab ? <FloatingActionButton href={fabHref} label={fabLabel} /> : null}
    </main>
  );
}
