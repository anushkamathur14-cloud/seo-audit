"use client";

import { useRef, useState } from "react";
import type { AuditResult, Issue } from "@/lib/types";
import { IssuesList } from "./IssuesList";
import { PageTable } from "./PageTable";
import { Recommendations } from "./Recommendations";
import { PaidStrategyPanel } from "./PaidStrategyPanel";
import { LighthousePanel } from "./LighthousePanel";
import { DownloadReport } from "./DownloadReport";
import { OverviewDashboard } from "./OverviewDashboard";
import { DashboardShell } from "./DashboardShell";
import { DashboardNav, type DashboardSection } from "./DashboardNav";
import { downloadIssuesCsv } from "@/lib/report-export";

interface ResultTabsProps {
  result: AuditResult;
  filteredIssues: Issue[];
  onFilteredIssuesChange: (issues: Issue[]) => void;
  isDemo?: boolean;
}

export function ResultTabs({
  result,
  filteredIssues,
  onFilteredIssuesChange,
  isDemo = false,
}: ResultTabsProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const downloadRef = useRef<HTMLDivElement>(null);

  const issuesForExport =
    filteredIssues.length > 0 &&
    filteredIssues.length < result.issues.length
      ? filteredIssues
      : result.issues;

  const badges: Partial<Record<DashboardSection, number>> = {
    "seo-audit": result.summary.totalIssues,
    performance: result.lighthouse.length || undefined,
    paid: result.includePaidMedia
      ? result.paidStrategy.keywords.length
      : undefined,
    recommendations: result.recommendations.length,
  };

  function handleNav(section: DashboardSection) {
    if (section === "export") {
      downloadRef.current?.querySelector("button")?.click();
      return;
    }
    setActiveSection(section);
  }

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          active={activeSection}
          onSelect={handleNav}
          includePaidMedia={result.includePaidMedia}
          badges={badges}
        />
      }
    >
      {isDemo && (
        <div className="border-b border-amber-200/60 bg-amber-50 px-5 py-2.5 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <strong>Sample report</strong> — run your own audit for real data.
        </div>
      )}

      <div className="hidden border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex sm:items-center sm:justify-between">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
        >
          {result.url}
        </a>
        <div ref={downloadRef}>
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

      {activeSection === "overview" && (
        <OverviewDashboard
          result={result}
          onViewRecommendations={() => setActiveSection("recommendations")}
          onViewPaid={() => setActiveSection("paid")}
        />
      )}

      {activeSection === "seo-audit" && (
        <div className="space-y-6 p-5 sm:p-6 lg:p-8">
          <header>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              SEO Audit
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {result.summary.totalIssues} issues across {result.summary.totalPages}{" "}
              pages
            </p>
          </header>
          <IssuesList
            issues={result.issues}
            onFilteredChange={onFilteredIssuesChange}
          />
          <PageTable pages={result.pages} />
        </div>
      )}

      {activeSection === "performance" && (
        <div className="p-5 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Performance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lighthouse scores on key pages
            </p>
          </header>
          <LighthousePanel lighthouse={result.lighthouse} />
        </div>
      )}

      {activeSection === "paid" && result.includePaidMedia && (
        <div className="p-5 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Paid Media
            </h2>
          </header>
          <PaidStrategyPanel strategy={result.paidStrategy} />
        </div>
      )}

      {activeSection === "recommendations" && (
        <div className="p-5 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recommendations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Prioritized by business impact
            </p>
          </header>
          <Recommendations
            recommendations={result.recommendations}
            aiGenerated={result.aiGenerated}
          />
        </div>
      )}

      {activeSection === "export" && (
        <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Use the download button above to export PDF, JSON, Markdown, or CSV.
          </p>
          <div className="mt-4" ref={downloadRef}>
            <DownloadReport result={{ ...result, issues: issuesForExport }} />
          </div>
          {filteredIssues.length < result.issues.length && (
            <button
              type="button"
              onClick={() => downloadIssuesCsv(filteredIssues, result.url)}
              className="mt-3 text-sm text-violet-600 hover:underline"
            >
              Export filtered issues (CSV)
            </button>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
