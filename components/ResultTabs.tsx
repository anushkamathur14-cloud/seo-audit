"use client";

import { useState } from "react";
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

const TAB_LABELS: Record<TabId, string> = {
  overview: "Overview",
  issues: "Issues",
  pages: "Pages",
  seo: "SEO fixes",
  paid: "Paid media",
  performance: "Performance",
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
    { id: "paid", badge: result.paidStrategy.keywords.length },
    { id: "performance", badge: result.lighthouse.length || undefined },
  ];

  return (
    <div className="space-y-4">
      {/* Report header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-sm text-zinc-500">Audit report</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {result.url}
          </a>
          <p className="mt-1 text-xs text-zinc-500">
            {new Date(result.auditedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredIssues.length < result.issues.length && (
            <button
              onClick={() => downloadIssuesCsv(filteredIssues, result.url)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
      <div className="sticky top-0 z-10 -mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-300"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {TAB_LABELS[tab.id]}
              {tab.badge !== undefined && tab.badge !== 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
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
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Top priorities
                  </h3>
                  <button
                    onClick={() => setActiveTab("issues")}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View all issues →
                  </button>
                </div>
                <ul className="space-y-3">
                  {topIssues.map((issue) => (
                    <li
                      key={issue.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${severityBadge(issue.severity)}`}
                      >
                        {issue.severity}
                      </span>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {issue.title}
                        </p>
                        <p className="text-zinc-500">{issue.description}</p>
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
              <QuickLink
                label="Paid media strategy"
                count={result.paidStrategy.channels.length}
                onClick={() => setActiveTab("paid")}
              />
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

        {activeTab === "paid" && (
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
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
      className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
    >
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
      <p className="mt-1 text-sm text-zinc-500">{count} items</p>
    </button>
  );
}
