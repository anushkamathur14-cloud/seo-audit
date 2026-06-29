"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, FileType } from "lucide-react";
import type { AuditResult } from "@/lib/types";
import {
  downloadJsonReport,
  downloadIssuesCsv,
  downloadPagesCsv,
  downloadRecommendationsCsv,
  downloadPaidStrategyCsv,
  downloadMarkdownReport,
} from "@/lib/report-export";
import { downloadPdfReport } from "@/lib/report-pdf";

interface DownloadReportProps {
  result: AuditResult;
  filteredIssueCount?: number;
}

export function DownloadReport({
  result,
  filteredIssueCount,
}: DownloadReportProps) {
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
      label: "Full report (PDF)",
      description: "Print-ready summary for stakeholders",
      icon: FileType,
      action: () => downloadPdfReport(result),
    },
    {
      label: "Full report (JSON)",
      description: "Complete audit data",
      icon: FileJson,
      action: () => downloadJsonReport(result),
    },
    {
      label: "Summary (Markdown)",
      description: "Readable report for sharing",
      icon: FileText,
      action: () => downloadMarkdownReport(result),
    },
    {
      label: "Issues (CSV)",
      description: filteredIssueCount
        ? `${filteredIssueCount} filtered issues`
        : `${result.issues.length} issues`,
      icon: FileSpreadsheet,
      action: () => downloadIssuesCsv(result.issues, result.url),
    },
    {
      label: "Pages (CSV)",
      description: `${result.pages.length} pages`,
      icon: FileSpreadsheet,
      action: () => downloadPagesCsv(result.pages, result.url),
    },
    {
      label: "SEO recommendations (CSV)",
      description: `${result.recommendations.length} items`,
      icon: FileSpreadsheet,
      action: () =>
        downloadRecommendationsCsv(result.recommendations, result.url),
    },
    ...(result.includePaidMedia && result.paidStrategy.included
      ? [
          {
            label: "Paid strategy (CSV)",
            description: `${result.paidStrategy.keywords.length} keywords`,
            icon: FileSpreadsheet,
            action: () =>
              downloadPaidStrategyCsv(result.paidStrategy, result.url),
          },
        ]
      : []),
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-primary !py-2 !text-sm"
      >
        <Download className="h-4 w-4" />
        Download
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-card-border bg-card py-1 shadow-xl">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-accent-soft/50"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
