"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UrlForm, type AuditFormValues } from "@/components/UrlForm";
import { MarketingPanel } from "@/components/MarketingPanel";
import { AuditProgress } from "@/components/AuditProgress";
import { ResultTabs } from "@/components/ResultTabs";
import { ErrorBanner } from "@/components/ErrorBanner";
import { DashboardShell } from "@/components/DashboardShell";
import { DEMO_AUDIT_RESULT } from "@/lib/demo-report";
import type { AuditJob, AuditResult, Issue } from "@/lib/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<AuditJob | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [includePaidMedia, setIncludePaidMedia] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (result) setFilteredIssues(result.issues);
  }, [result]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();
      const poll = async () => {
        try {
          const res = await fetch(`/api/audit/${jobId}`, { cache: "no-store" });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Failed to fetch audit status.");
            setLoading(false);
            stopPolling();
            return;
          }
          setJob((prev) =>
            prev
              ? { ...prev, status: data.status, progress: data.progress, error: data.error }
              : prev,
          );
          if (data.status === "complete" && data.result) {
            setResult(data.result);
            setIsDemo(false);
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
      };
      setTimeout(() => {
        poll();
        pollRef.current = setInterval(poll, 2000);
      }, 500);
    },
    [stopPolling],
  );

  function showDemoReport() {
    stopPolling();
    setLoading(false);
    setError(null);
    setJob(null);
    setIsDemo(true);
    setResult(DEMO_AUDIT_RESULT);
    setIncludePaidMedia(true);
  }

  async function handleSubmit({
    url,
    openaiApiKey,
    includePaidMedia: paidMedia,
  }: AuditFormValues) {
    setLoading(true);
    setError(null);
    setResult(null);
    setIsDemo(false);
    setJob(null);
    setIncludePaidMedia(paidMedia);
    stopPolling();

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, openaiApiKey, includePaidMedia: paidMedia }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start audit.");
        setLoading(false);
        return;
      }
      setJob({
        id: data.jobId,
        url,
        status: "running",
        progress: {
          pagesCrawled: 0,
          totalEstimate: 50,
          phase: "crawling",
          message: "Checking technical SEO…",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        includePaidMedia: paidMedia,
      });
      pollJob(data.jobId);
    } catch {
      setError("Lost connection while starting your audit.");
      setLoading(false);
    }
  }

  return (
    <div className="app-split min-h-screen lg:grid lg:grid-cols-[minmax(300px,400px)_1fr]">
      <MarketingPanel result={result} />

      <main className="flex flex-col p-4 sm:p-6 lg:p-8">
        {result ? (
          <div className="animate-fade-in-up flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDemo ? "Sample dashboard" : "Live audit dashboard"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setIsDemo(false);
                  setError(null);
                }}
                className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                Run new audit
              </button>
            </div>
            <ResultTabs
              result={result}
              filteredIssues={filteredIssues}
              onFilteredIssuesChange={setFilteredIssues}
              isDemo={isDemo}
            />
          </div>
        ) : (
          <DashboardShell sidebar={<LandingSidebar />}>
            <div className="flex flex-1 flex-col justify-center p-6 sm:p-10 lg:p-12">
              <div className="mx-auto w-full max-w-xl">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  Run your free audit
                </h2>
                <p className="mt-2 text-slate-500">
                  Paste your URL below. No signup required — results in 2–5
                  minutes.
                </p>

                {error && (
                  <div className="mt-6">
                    <ErrorBanner error={error} />
                  </div>
                )}

                <div className="mt-6">
                  <UrlForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    onViewSample={showDemoReport}
                  />
                </div>

                {loading && (
                  <div className="mt-6">
                    <AuditProgress
                      progress={
                        job?.progress ?? {
                          pagesCrawled: 0,
                          totalEstimate: 50,
                          phase: "crawling",
                          message: "Starting crawl…",
                        }
                      }
                      includePaidMedia={includePaidMedia}
                    />
                  </div>
                )}
              </div>
            </div>
          </DashboardShell>
        )}
      </main>
    </div>
  );
}

function LandingSidebar() {
  return (
    <div className="dashboard-sidebar hidden border-r border-white/10 p-6 lg:block lg:w-56">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Getting started
      </p>
      <ol className="mt-4 space-y-3 text-sm text-slate-400">
        <li>1. Enter your website URL</li>
        <li>2. Optional: add paid media or AI</li>
        <li>3. Review your dashboard report</li>
      </ol>
    </div>
  );
}
