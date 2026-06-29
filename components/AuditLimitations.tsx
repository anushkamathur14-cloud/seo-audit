"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { ANALYSIS_LIMITATIONS } from "@/lib/audit-guide";

interface AuditLimitationsProps {
  compact?: boolean;
  embedded?: boolean;
}

export function AuditLimitations({
  compact = false,
  embedded = false,
}: AuditLimitationsProps) {
  const [expanded, setExpanded] = useState(!compact && !embedded);

  return (
    <section
      className={
        embedded
          ? ""
          : "card border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20"
      }
    >
      {!embedded && (
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              strokeWidth={2}
            />
            <h2 className="font-semibold text-foreground">
              What this audit covers — and what it doesn&apos;t
            </h2>
          </div>
          {!expanded && (
            <p className="mt-1 text-sm text-muted">
              Click to see crawl limits, Lighthouse scope, and other important
              caveats before you run an audit.
            </p>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm text-amber-700 dark:text-amber-400">
          {expanded ? (
            <>
              Hide <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show <ChevronDown className="h-4 w-4" />
            </>
          )}
        </span>
      </button>
      )}

      {(expanded || embedded) && (
        <div
          className={
            embedded
              ? ""
              : "border-t border-amber-200/60 px-5 pb-5 pt-4 dark:border-amber-900/40"
          }
        >
          <p className="mb-4 text-sm text-muted">
            This is a technical on-page and performance audit — useful for
            finding fixable issues, but not a replacement for rank tracking,
            backlink analysis, or paid media planning tools.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ANALYSIS_LIMITATIONS.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-amber-100/80 bg-card/80 p-3 dark:border-amber-900/30"
              >
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
