"use client";

import { useState } from "react";
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
          : "rounded-xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20"
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
            <span className="text-amber-600 dark:text-amber-400" aria-hidden>
              ⚠
            </span>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              What this audit covers — and what it doesn&apos;t
            </h2>
          </div>
          {!expanded && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Click to see crawl limits, Lighthouse scope, and other important
              caveats before you run an audit.
            </p>
          )}
        </div>
        <span className="shrink-0 text-sm text-amber-700 dark:text-amber-400">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>
      )}

      {(expanded || embedded) && (
        <div
          className={
            embedded
              ? ""
              : "border-t border-amber-200 px-5 pb-5 pt-4 dark:border-amber-900/50"
          }
        >
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            This is a technical on-page and performance audit — useful for
            finding fixable issues, but not a replacement for rank tracking,
            backlink analysis, or paid media planning tools.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ANALYSIS_LIMITATIONS.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-amber-100 bg-white/70 p-3 dark:border-amber-900/30 dark:bg-zinc-900/50"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
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
