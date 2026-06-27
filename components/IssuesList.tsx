"use client";

import { useState } from "react";
import type { Issue, Severity } from "@/lib/types";

interface IssuesListProps {
  issues: Issue[];
}

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function IssuesList({ issues }: IssuesListProps) {
  const [filter, setFilter] = useState<Severity | "all">("all");

  const filtered =
    filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Issues ({filtered.length})
        </h2>
        <div className="flex gap-2">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                filter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.length === 0 ? (
          <p className="p-6 text-zinc-500">No issues match this filter.</p>
        ) : (
          filtered.map((issue) => (
            <div key={issue.id} className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[issue.severity]}`}
                >
                  {issue.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {issue.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {issue.description}
                  </p>
                  {issue.pageUrl && (
                    <a
                      href={issue.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {issue.pageUrl}
                    </a>
                  )}
                  {issue.recommendation && (
                    <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                      Fix: {issue.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
