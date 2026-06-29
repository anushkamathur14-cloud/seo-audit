"use client";

import {
  BarChart3,
  Bot,
  Download,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  Search,
} from "lucide-react";

export type DashboardSection =
  | "overview"
  | "seo-audit"
  | "performance"
  | "paid"
  | "recommendations"
  | "export";

interface DashboardNavProps {
  active: DashboardSection;
  onSelect: (section: DashboardSection) => void;
  includePaidMedia: boolean;
  badges?: Partial<Record<DashboardSection, number>>;
}

const NAV: {
  id: DashboardSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  paidOnly?: boolean;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "seo-audit", label: "SEO Audit", icon: Search },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "paid", label: "Paid Media", icon: Megaphone, paidOnly: true },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "export", label: "Export Report", icon: Download },
];

export function DashboardNav({
  active,
  onSelect,
  includePaidMedia,
  badges,
}: DashboardNavProps) {
  const items = NAV.filter((n) => !n.paidOnly || includePaidMedia);

  return (
    <nav
      className="dashboard-sidebar flex w-full flex-col lg:w-56 lg:shrink-0"
      aria-label="Dashboard"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
          <Bot className="h-4 w-4 text-violet-300" aria-hidden />
        </div>
        <span className="text-sm font-semibold text-white">
          Marketing Strategy Agent
        </span>
      </div>

      <ul className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const badge = badges?.[id];
          return (
            <li key={id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{label}</span>
                {badge !== undefined && badge > 0 && id !== "export" && (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                      isActive ? "bg-white/20" : "bg-white/10"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function mapLegacyTabToDashboard(tab: string): DashboardSection {
  const map: Record<string, DashboardSection> = {
    overview: "overview",
    issues: "seo-audit",
    pages: "seo-audit",
    seo: "recommendations",
    paid: "paid",
    performance: "performance",
  };
  return map[tab] ?? "overview";
}
