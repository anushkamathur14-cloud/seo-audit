"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { UrlForm, type AuditFormValues } from "@/components/UrlForm";
import { AuditGuideSidebar } from "@/components/AuditGuideSidebar";
import { AuditProgress } from "@/components/AuditProgress";
import { ResultTabs } from "@/components/ResultTabs";
import type { AuditJob, AuditResult, Issue } from "@/lib/types";

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

  async function handleSubmit({
    url,
    openaiApiKey,
    includePaidMedia,
  }: AuditFormValues) {
    setLoading(true);
    setError(null);
    setResult(null);
    setJob(null);
    stopPolling();

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, openaiApiKey, includePaidMedia }),
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
        includePaidMedia,
      };
      setJob(newJob);
      pollJob(data.jobId);
    } catch {
      setError("Failed to start audit. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      {!result && (
        <div className="mb-8 animate-fade-in-up text-center lg:mb-10">
          <h1 className="bg-gradient-to-br from-foreground via-foreground to-muted bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
            Audit your site in minutes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            Crawl pages, catch SEO issues, measure performance, and get a clear
            plan to improve — all in one tabbed report.
          </p>
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-10">
        <AuditGuideSidebar />

        <div className="min-w-0 space-y-6">
          {result && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-foreground">
                Your audit results
              </h2>
              <p className="mt-1 text-sm text-muted">
                Browse tabs on the right — use the guide on the left if you need
                help interpreting scores or limitations.
              </p>
            </div>
          )}

          {!result && <UrlForm onSubmit={handleSubmit} loading={loading} />}

          {loading && !result && (
            <div className="space-y-4 animate-fade-in-up">
              <p className="flex items-center gap-2 text-sm text-muted">
                <Clock className="h-4 w-4 shrink-0" />
                Usually takes 2–5 minutes — keep this tab open
              </p>
              {job && <AuditProgress progress={job.progress} />}
            </div>
          )}

          {error && (
            <div className="card flex items-start gap-3 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in-up">
              <div className="mb-4">
                <UrlForm onSubmit={handleSubmit} loading={loading} />
              </div>
              <ResultTabs
                result={result}
                filteredIssues={filteredIssues}
                onFilteredIssuesChange={setFilteredIssues}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
