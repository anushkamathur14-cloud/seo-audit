"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UrlForm, type AuditFormValues } from "@/components/UrlForm";
import { AuditGuideSidebar } from "@/components/AuditGuideSidebar";
import { HeroSection } from "@/components/HeroSection";
import { AuditProgress } from "@/components/AuditProgress";
import { ResultTabs } from "@/components/ResultTabs";
import { ErrorBanner } from "@/components/ErrorBanner";
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
    if (result) {
      setFilteredIssues(result.issues);
    }
  }, [result]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();

      const poll = async () => {
        try {
          const res = await fetch(`/api/audit/${jobId}`, { cache: "no-store" });
          const data = await res.json();

          if (!res.ok) {
            setError(
              data.error ??
                "Failed to fetch audit status. Try running a new audit.",
            );
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

      const newJob: AuditJob = {
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
      };
      setJob(newJob);
      pollJob(data.jobId);
    } catch {
      setError("Lost connection while starting your audit. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div
        className={`grid items-start gap-8 lg:gap-10 ${
          result ? "" : "lg:grid-cols-[minmax(280px,360px)_1fr]"
        }`}
      >
        {!result && <AuditGuideSidebar />}

        <div className="min-w-0 space-y-6">
          {!result && <HeroSection />}

          {!result && (
            <UrlForm
              onSubmit={handleSubmit}
              loading={loading}
              onViewSample={showDemoReport}
            />
          )}

          {loading && !result && (
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
          )}

          {error && <ErrorBanner error={error} />}

          {result && (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {isDemo ? "Sample audit report" : "Your audit results"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Executive summary first — use the report menu to go deeper.
                  </p>
                </div>
              </div>

              <UrlForm
                onSubmit={handleSubmit}
                loading={loading}
                compact
                onViewSample={showDemoReport}
              />

              <ResultTabs
                result={result}
                filteredIssues={filteredIssues}
                onFilteredIssuesChange={setFilteredIssues}
                isDemo={isDemo}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
