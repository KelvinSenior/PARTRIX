"use client";

import { appBtnPrimary } from "@/lib/appStyles";

export default function SettingsRefreshButton() {
  return (
    <button type="button" onClick={() => window.location.reload()} className={appBtnPrimary}>
      Refresh
    </button>
  );
}
