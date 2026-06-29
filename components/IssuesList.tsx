"use client";

import { useMemo, useState, useEffect } from "react";
import type { Issue, Severity } from "@/lib/types";
import { matchesSearch } from "@/lib/report-export";
import { SearchInput, FilterChip } from "./FilterBar";

interface IssuesListProps {
  issues: Issue[];
  onFilteredChange?: (issues: Issue[]) => void;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function IssuesList({ issues, onFilteredChange }: IssuesListProps) {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(issues.map((i) => i.category))].sort(),
    [issues],
  );

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) {
        return false;
      }
      if (categoryFilter !== "all" && issue.category !== categoryFilter) {
        return false;
      }
      if (
        !matchesSearch(
          `${issue.title} ${issue.description} ${issue.pageUrl ?? ""} ${issue.category}`,
          search,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [issues, severityFilter, categoryFilter, search]);

  useEffect(() => {
    onFilteredChange?.(filtered);
  }, [filtered, onFilteredChange]);

  const hasActiveFilters =
    severityFilter !== "all" || categoryFilter !== "all" || search.length > 0;

  return (
    <div className="card overflow-hidden">
      <div className="space-y-4 border-b border-card-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Issues ({filtered.length}
            {filtered.length !== issues.length && ` of ${issues.length}`})
          </h2>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSeverityFilter("all");
                setCategoryFilter("all");
                setSearch("");
              }}
              className="text-xs text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search issues, URLs, categories..."
        />

        <div className="flex flex-wrap gap-2">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
            <FilterChip
              key={s}
              active={severityFilter === s}
              onClick={() => setSeverityFilter(s)}
            >
              {s}
            </FilterChip>
          ))}
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Category:
            </span>
            <FilterChip
              active={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
            >
              all
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                active={categoryFilter === cat}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-card-border">
        {filtered.length === 0 ? (
          <p className="p-6 text-muted">No issues match your filters.</p>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {issue.title}
                    </p>
                    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs text-muted">
                      {issue.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {issue.description}
                  </p>
                  {issue.pageUrl && (
                    <a
                      href={issue.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs text-accent hover:underline"
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
