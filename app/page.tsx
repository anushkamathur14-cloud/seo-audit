"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  AlertCircle,
  Clock,
  Gauge,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { UrlForm, type AuditFormValues } from "@/components/UrlForm";
import { GettingStartedTabs } from "@/components/GettingStartedTabs";
import { AuditLimitations } from "@/components/AuditLimitations";
import { AuditProgress } from "@/components/AuditProgress";
import { ResultTabs } from "@/components/ResultTabs";
import type { AuditJob, AuditResult, Issue } from "@/lib/types";

const FEATURES = [
  { icon: Search, label: "On-page SEO" },
  { icon: Gauge, label: "Lighthouse scores" },
  { icon: Sparkles, label: "AI recommendations" },
  { icon: Target, label: "Paid media plan" },
];

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
    <main className="mx-auto min-h-screen max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      {!result && (
        <div className="mb-10 animate-fade-in-up text-center">
          <h1 className="bg-gradient-to-br from-foreground via-foreground to-muted bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
            Audit your site in minutes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
            Crawl pages, catch SEO issues, measure performance, and get a clear
            plan to improve — all in one tabbed report.
          </p>

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/80 px-3 py-1.5 text-sm text-muted backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-accent" />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 flex justify-center">
        <UrlForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {!result && !loading && (
        <div className="mb-8 animate-fade-in-up">
          <GettingStartedTabs />
        </div>
      )}

      {loading && !result && (
        <div className="mb-8 space-y-6 animate-fade-in-up">
          <p className="flex items-center justify-center gap-2 text-center text-sm text-muted">
            <Clock className="h-4 w-4" />
            Usually takes 2–5 minutes — keep this tab open
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
        <div className="card mx-auto mb-8 flex max-w-2xl items-start gap-3 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="animate-fade-in-up">
          <ResultTabs
            result={result}
            filteredIssues={filteredIssues}
            onFilteredIssuesChange={setFilteredIssues}
          />
        </div>
      )}
    </main>
  );
}
