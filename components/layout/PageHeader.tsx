import type { ReactNode } from "react";
import { appEyebrow, appSubtitle, appTitle } from "@/lib/appStyles";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <p className={appEyebrow}>{eyebrow}</p> : null}
        <h1 className={appTitle}>{title}</h1>
        {description ? <p className={appSubtitle}>{description}</p> : null}
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
