import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function DashboardShell({ children, sidebar }: DashboardShellProps) {
  return (
    <div className="dashboard-shell flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 lg:min-h-[calc(100vh-4rem)] lg:flex-row">
      {sidebar}
      <div className="dashboard-main min-w-0 flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/50">
        {children}
      </div>
    </div>
  );
}
