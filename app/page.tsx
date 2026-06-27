"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UrlForm, type AuditFormValues } from "@/components/UrlForm";
import { AuditProgress } from "@/components/AuditProgress";
import { ScoreCards } from "@/components/ScoreCards";
import { IssuesList } from "@/components/IssuesList";
import { PageTable } from "@/components/PageTable";
import { Recommendations } from "@/components/Recommendations";
import { DownloadReport } from "@/components/DownloadReport";
import { PaidStrategyPanel } from "@/components/PaidStrategyPanel";
import type { AuditJob, AuditResult, Issue } from "@/lib/types";
import { downloadIssuesCsv } from "@/lib/report-export";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<AuditJob | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (result) {
      setFilteredIssues(result.issues);
    }
  }, [result]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/audit/${jobId}`);
          const data = await res.json();

          if (!res.ok) {
            setError(data.error ?? "Failed to fetch audit status.");
            setLoading(false);
            stopPolling();
            return;
          }

          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: data.status,
                  progress: data.progress,
                  error: data.error,
                }
              : prev,
          );

          if (data.status === "complete" && data.result) {
            setResult(data.result);
            setLoading(false);
            stopPolling();
          } else if (data.status === "error") {
            setError(data.error ?? "Audit failed.");
            setLoading(false);
            stopPolling();
          }
        } catch {
          setError("Lost connection while polling audit status.");
          setLoading(false);
          stopPolling();
        }
      }, 2000);
    },
    [stopPolling],
  );

  async function handleSubmit({ url, openaiApiKey }: AuditFormValues) {
    setLoading(true);
    setError(null);
    setResult(null);
    setJob(null);
    stopPolling();

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, openaiApiKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to start audit.");
        setLoading(false);
        return;
      }

      const newJob: AuditJob = {
        id: data.jobId,
        url,
        status: "running",
        progress: {
          pagesCrawled: 0,
          totalEstimate: 50,
          phase: "crawling",
          message: "Starting crawl...",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setJob(newJob);
      pollJob(data.jobId);
    } catch {
      setError("Failed to start audit. Check your connection.");
      setLoading(false);
    }
  }

  const issuesForExport =
    filteredIssues.length > 0 &&
    filteredIssues.length < (result?.issues.length ?? 0)
      ? filteredIssues
      : (result?.issues ?? []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          SEO Audit Agent
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Crawl your site, analyze on-page SEO, run Lighthouse audits, and get
          AI-powered recommendations.
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <UrlForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {error && (
        <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && job && (
        <div className="mb-10 flex justify-center">
          <AuditProgress progress={job.progress} />
        </div>
      )}

      {result && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <p className="text-sm text-zinc-500">Audited site</p>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {result.url}
              </a>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(result.auditedAt).toLocaleString()} ·{" "}
                {result.summary.totalPages} pages · {result.summary.totalIssues}{" "}
                issues
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredIssues.length < result.issues.length && (
                <button
                  onClick={() =>
                    downloadIssuesCsv(filteredIssues, result.url)
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Export filtered issues
                </button>
              )}
              <DownloadReport
                result={{
                  ...result,
                  issues: issuesForExport,
                }}
                filteredIssueCount={
                  filteredIssues.length < result.issues.length
                    ? filteredIssues.length
                    : undefined
                }
              />
            </div>
          </div>

          <ScoreCards scores={result.scores} summary={result.summary} />

          {result.lighthouse.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Lighthouse Performance
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.lighthouse.map((lh) => (
                  <div
                    key={lh.url}
                    className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
                  >
                    <a
                      href={lh.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {lh.url}
                    </a>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <span>Performance: {lh.performance}</span>
                      <span>SEO: {lh.seo}</span>
                      <span>Accessibility: {lh.accessibility}</span>
                      <span>Best Practices: {lh.bestPractices}</span>
                      {lh.lcp !== undefined && (
                        <span>LCP: {Math.round(lh.lcp)}ms</span>
                      )}
                      {lh.cls !== undefined && <span>CLS: {lh.cls}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Recommendations
            recommendations={result.recommendations}
            aiGenerated={result.aiGenerated}
          />
          <PaidStrategyPanel strategy={result.paidStrategy} />
          <IssuesList
            issues={result.issues}
            onFilteredChange={setFilteredIssues}
          />
          <PageTable pages={result.pages} />
        </div>
      )}
    </main>
  );
}
