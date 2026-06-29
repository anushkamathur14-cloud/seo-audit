"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
} from "lucide-react";
import type { AuditResult, Issue } from "@/lib/types";
import { ScoreCards } from "./ScoreCards";
import { IssuesList } from "./IssuesList";
import { PageTable } from "./PageTable";
import { Recommendations } from "./Recommendations";
import { PaidStrategyPanel } from "./PaidStrategyPanel";
import { LighthousePanel } from "./LighthousePanel";
import { DownloadReport } from "./DownloadReport";
import { downloadIssuesCsv } from "@/lib/report-export";

type TabId =
  | "overview"
  | "issues"
  | "pages"
  | "seo"
  | "paid"
  | "performance";

interface ResultTabsProps {
  result: AuditResult;
  filteredIssues: Issue[];
  onFilteredIssuesChange: (issues: Issue[]) => void;
}

const TAB_CONFIG: Record<
  TabId,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  overview: { label: "Overview", icon: LayoutDashboard },
  issues: { label: "Issues", icon: AlertTriangle },
  pages: { label: "Pages", icon: FileText },
  seo: { label: "SEO fixes", icon: Lightbulb },
  paid: { label: "Paid media", icon: Megaphone },
  performance: { label: "Performance", icon: Gauge },
};

export function ResultTabs({
  result,
  filteredIssues,
  onFilteredIssuesChange,
}: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const issuesForExport =
    filteredIssues.length > 0 &&
    filteredIssues.length < result.issues.length
      ? filteredIssues
      : result.issues;

  const topIssues = [...result.issues]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 5);

  const tabs: { id: TabId; badge?: number | string }[] = [
    { id: "overview" },
    { id: "issues", badge: result.summary.totalIssues },
    { id: "pages", badge: result.summary.totalPages },
    { id: "seo", badge: result.recommendations.length },
    ...(result.includePaidMedia
      ? [{ id: "paid" as const, badge: result.paidStrategy.keywords.length }]
      : []),
    { id: "performance", badge: result.lighthouse.length || undefined },
  ];

  return (
    <div className="space-y-4">
      {/* Report header */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
            <ExternalLink className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted">Audit report</p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              {result.url}
            </a>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(result.auditedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredIssues.length < result.issues.length && (
            <button
              onClick={() => downloadIssuesCsv(filteredIssues, result.url)}
              className="rounded-lg border border-card-border px-3 py-2 text-sm text-foreground transition hover:bg-accent-soft"
            >
              Export filtered
            </button>
          )}
          <DownloadReport
            result={{ ...result, issues: issuesForExport }}
            filteredIssueCount={
              filteredIssues.length < result.issues.length
                ? filteredIssues.length
                : undefined
            }
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-[4.5rem] z-10 -mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="flex gap-1 rounded-xl border border-card-border bg-background/90 p-1.5 backdrop-blur-md"
          role="tablist"
        >
          {tabs.map((tab) => {
            const { label, icon: Icon } = TAB_CONFIG[tab.id];
            const isActive = activeTab === tab.id;
            return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
                isActive
                  ? "bg-card text-accent shadow-sm ring-1 ring-accent/20"
                  : "text-muted hover:bg-accent-soft/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {tab.badge !== undefined && tab.badge !== 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "bg-slate-200/80 text-muted dark:bg-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
          })}
        </div>
      </div>

      {/* Tab panels */}
      <div role="tabpanel" className="min-h-[320px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <ScoreCards scores={result.scores} summary={result.summary} />

            {result.summary.avgLighthousePerformance !== undefined && (
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Avg. Lighthouse performance"
                  value={`${result.summary.avgLighthousePerformance}/100`}
                />
                <StatCard
                  label="Avg. Lighthouse SEO"
                  value={`${result.summary.avgLighthouseSeo ?? "—"}/100`}
                />
              </div>
            )}

            {topIssues.length > 0 && (
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Top priorities
                  </h3>
                  <button
                    onClick={() => setActiveTab("issues")}
                    className="flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <ul className="space-y-3">
                  {topIssues.map((issue) => (
                    <li
                      key={issue.id}
                      className="flex items-start gap-3 rounded-lg p-2 text-sm transition hover:bg-accent-soft/30"
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${severityBadge(issue.severity)}`}
                      >
                        {issue.severity}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {issue.title}
                        </p>
                        <p className="text-muted">{issue.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <QuickLink
                label="SEO recommendations"
                count={result.recommendations.length}
                onClick={() => setActiveTab("seo")}
              />
              {result.includePaidMedia && (
                <QuickLink
                  label="Paid media strategy"
                  count={result.paidStrategy.channels.length}
                  onClick={() => setActiveTab("paid")}
                />
              )}
              <QuickLink
                label="Page breakdown"
                count={result.pages.length}
                onClick={() => setActiveTab("pages")}
              />
            </div>
          </div>
        )}

        {activeTab === "issues" && (
          <IssuesList
            issues={result.issues}
            onFilteredChange={onFilteredIssuesChange}
          />
        )}

        {activeTab === "pages" && <PageTable pages={result.pages} />}

        {activeTab === "seo" && (
          <Recommendations
            recommendations={result.recommendations}
            aiGenerated={result.aiGenerated}
          />
        )}

        {activeTab === "paid" && result.includePaidMedia && (
          <PaidStrategyPanel strategy={result.paidStrategy} />
        )}

        {activeTab === "performance" && (
          <LighthousePanel lighthouse={result.lighthouse} />
        )}
      </div>
    </div>
  );
}

function severityRank(severity: Issue["severity"]): number {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return order[severity];
}

function severityBadge(severity: Issue["severity"]): string {
  const styles = {
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return styles[severity];
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  label,
  count,
  onClick,
}: {
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card group p-4 text-left transition hover:ring-2 hover:ring-accent/25"
    >
      <p className="font-medium text-foreground group-hover:text-accent">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted">
        {count} items
        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
      </p>
    </button>
  );
}
