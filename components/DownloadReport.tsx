"use client";

import { useState, useRef, useEffect } from "react";
import type { AuditResult } from "@/lib/types";
import {
  downloadJsonReport,
  downloadIssuesCsv,
  downloadPagesCsv,
  downloadRecommendationsCsv,
  downloadMarkdownReport,
} from "@/lib/report-export";

interface DownloadReportProps {
  result: AuditResult;
  filteredIssueCount?: number;
}

export function DownloadReport({ result, filteredIssueCount }: DownloadReportProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    {
      label: "Full report (JSON)",
      description: "Complete audit data",
      action: () => downloadJsonReport(result),
    },
    {
      label: "Summary (Markdown)",
      description: "Readable report for sharing",
      action: () => downloadMarkdownReport(result),
    },
    {
      label: "Issues (CSV)",
      description: filteredIssueCount
        ? `${filteredIssueCount} filtered issues`
        : `${result.issues.length} issues`,
      action: () => downloadIssuesCsv(result.issues, result.url),
    },
    {
      label: "Pages (CSV)",
      description: `${result.pages.length} pages`,
      action: () => downloadPagesCsv(result.pages, result.url),
    },
    {
      label: "Recommendations (CSV)",
      description: `${result.recommendations.length} items`,
      action: () =>
        downloadRecommendationsCsv(result.recommendations, result.url),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        Download report
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.label}
              </span>
              <span className="text-xs text-zinc-500">{item.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
