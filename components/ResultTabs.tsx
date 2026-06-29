"use client";

import { useRef, useState } from "react";
import { Calendar, ExternalLink } from "lucide-react";
import type { AuditResult, Issue } from "@/lib/types";
import { ScoreCards } from "./ScoreCards";
import { IssuesList } from "./IssuesList";
import { PageTable } from "./PageTable";
import { Recommendations } from "./Recommendations";
import { PaidStrategyPanel } from "./PaidStrategyPanel";
import { LighthousePanel } from "./LighthousePanel";
import { DownloadReport } from "./DownloadReport";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { TrustBar } from "./TrustBar";
import { IssueDistribution } from "./IssueDistribution";
import { NextSteps } from "./NextSteps";
import { ReportNav, type ReportSectionId } from "./ReportNav";
import { downloadIssuesCsv, downloadMarkdownReport } from "@/lib/report-export";

type TabId = ReportSectionId;

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
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const downloadRef = useRef<HTMLDivElement>(null);

  const issuesForExport =
    filteredIssues.length > 0 &&
    filteredIssues.length < result.issues.length
      ? filteredIssues
      : result.issues;

  const navBadges: Partial<Record<TabId, number>> = {
    issues: result.summary.totalIssues,
    pages: result.summary.totalPages,
    seo: result.recommendations.length,
    paid: result.includePaidMedia
      ? result.paidStrategy.keywords.length
      : undefined,
    performance: result.lighthouse.length || undefined,
  };

  function scrollToDownloads() {
    downloadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="rounded-xl border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-foreground">
          <strong>Sample report</strong> — illustrative data so you can preview
          the experience. Run your own audit to analyze a real site.
        </div>
      )}

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
            <ExternalLink className="h-5 w-5 text-accent" aria-hidden />
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
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {new Date(result.auditedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div ref={downloadRef} className="flex flex-wrap gap-2">
          {filteredIssues.length < result.issues.length && (
            <button
              type="button"
              onClick={() => downloadIssuesCsv(filteredIssues, result.url)}
              className="rounded-lg border border-card-border px-3 py-2 text-sm text-foreground transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(200px,220px)_1fr]">
        <ReportNav
          active={activeTab}
          onSelect={setActiveTab}
          badges={navBadges}
          includePaidMedia={result.includePaidMedia}
          onDownload={scrollToDownloads}
        />

        <div role="tabpanel" className="min-w-0 space-y-6">
          {activeTab === "overview" && (
            <>
              <ExecutiveSummary
                result={result}
                onViewIssues={() => setActiveTab("issues")}
                onViewRecommendations={() => setActiveTab("seo")}
              />
              <TrustBar result={result} />
              <ScoreCards scores={result.scores} summary={result.summary} />
              <IssueDistribution summary={result.summary} />
              {result.summary.avgLighthousePerformance !== undefined && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    label="Avg. Lighthouse performance"
                    value={`${result.summary.avgLighthousePerformance}/100`}
                    hint={
                      result.summary.avgLighthousePerformance >= 80
                        ? "Good"
                        : "Needs attention"
                    }
                  />
                  <StatCard
                    label="Avg. Lighthouse SEO"
                    value={`${result.summary.avgLighthouseSeo ?? "—"}/100`}
                    hint="Sampled key pages"
                  />
                </div>
              )}
              <NextSteps
                result={result}
                onGoToSeo={() => setActiveTab("seo")}
                onGoToPaid={
                  result.includePaidMedia
                    ? () => setActiveTab("paid")
                    : undefined
                }
                onDownload={() => downloadMarkdownReport(result)}
              />
            </>
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
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
