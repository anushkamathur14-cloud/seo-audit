"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UrlForm, type AuditFormValues } from "@/components/UrlForm";
import { GettingStartedTabs } from "@/components/GettingStartedTabs";
import { AuditLimitations } from "@/components/AuditLimitations";
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

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          SEO Audit Agent
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Crawl your site, find SEO issues, and get actionable fixes. Results
          are organized in tabs so you can focus on one section at a time.
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <UrlForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {!result && !loading && (
        <div className="mb-8">
          <GettingStartedTabs />
        </div>
      )}

      {loading && !result && (
        <div className="mb-8 space-y-6">
          <p className="text-center text-sm text-zinc-500">
            Usually takes 2–5 minutes. Keep this tab open, then download your
            report when done.
          </p>
          {job && (
            <div className="flex justify-center">
              <AuditProgress progress={job.progress} />
            </div>
          )}
        </div>
      )}

      {(result || loading) && (
        <div className="mb-6">
          <AuditLimitations compact />
        </div>
      )}

      {error && (
        <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <ResultTabs
          result={result}
          filteredIssues={filteredIssues}
          onFilteredIssuesChange={setFilteredIssues}
        />
      )}
    </main>
  );
}
