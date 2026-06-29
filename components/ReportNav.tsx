"use client";

import {
  AlertTriangle,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
} from "lucide-react";

export type ReportSectionId =
  | "overview"
  | "issues"
  | "pages"
  | "seo"
  | "paid"
  | "performance"
  | "downloads";

interface ReportNavProps {
  active: ReportSectionId;
  onSelect: (id: ReportSectionId) => void;
  badges: Partial<Record<ReportSectionId, number>>;
  includePaidMedia: boolean;
  onDownload?: () => void;
}

const NAV_ITEMS: {
  id: ReportSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  paidOnly?: boolean;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "seo", label: "SEO fixes", icon: Lightbulb },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "paid", label: "Paid media", icon: Megaphone, paidOnly: true },
];

export function ReportNav({
  active,
  onSelect,
  badges,
  includePaidMedia,
  onDownload,
}: ReportNavProps) {
  const items = NAV_ITEMS.filter((item) => !item.paidOnly || includePaidMedia);

  return (
    <nav
      className="card p-3 lg:sticky lg:top-24"
      aria-label="Report sections"
    >
      <p className="mb-2 hidden px-2 text-xs font-semibold uppercase tracking-wide text-muted lg:block">
        Report
      </p>
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const badge = badges[id];
          return (
            <li key={id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-accent-soft/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="ml-auto rounded-full bg-card px-1.5 py-0.5 text-xs tabular-nums text-muted">
                    {badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-lg border border-card-border px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:flex"
        >
          <Download className="h-4 w-4" aria-hidden />
          Downloads
        </button>
      )}
    </nav>
  );
}
