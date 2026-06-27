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
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
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
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-4 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
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
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
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

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.length === 0 ? (
          <p className="p-6 text-zinc-500">No issues match your filters.</p>
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
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {issue.title}
                    </p>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                      {issue.category}
                    </span>
                  </div>
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
