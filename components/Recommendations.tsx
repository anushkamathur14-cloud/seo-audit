"use client";

import { useMemo, useState } from "react";
import type { Recommendation, Severity } from "@/lib/types";
import { matchesSearch } from "@/lib/report-export";
import { SearchInput, FilterChip } from "./FilterBar";

interface RecommendationsProps {
  recommendations: Recommendation[];
  aiGenerated: boolean;
}

export function Recommendations({
  recommendations,
  aiGenerated,
}: RecommendationsProps) {
  const [expanded, setExpanded] = useState<string | null>(
    recommendations[0]?.id ?? null,
  );
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [impactFilter, setImpactFilter] = useState<"all" | "quick-win" | "long-term">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return recommendations.filter((rec) => {
      if (severityFilter !== "all" && rec.severity !== severityFilter) {
        return false;
      }
      if (impactFilter !== "all" && rec.impact !== impactFilter) {
        return false;
      }
      if (
        !matchesSearch(
          `${rec.title} ${rec.description} ${rec.fixInstructions}`,
          search,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [recommendations, severityFilter, impactFilter, search]);

  const hasActiveFilters =
    severityFilter !== "all" || impactFilter !== "all" || search.length > 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-4 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Recommendations ({filtered.length}
              {filtered.length !== recommendations.length &&
                ` of ${recommendations.length}`}
              )
            </h2>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {aiGenerated ? "AI-generated" : "Rule-based"}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSeverityFilter("all");
                setImpactFilter("all");
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
          placeholder="Search recommendations..."
        />

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "critical", "high", "medium", "low"] as const).map(
              (s) => (
                <FilterChip
                  key={s}
                  active={severityFilter === s}
                  onClick={() => setSeverityFilter(s)}
                >
                  {s}
                </FilterChip>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All impact"],
                ["quick-win", "Quick wins"],
                ["long-term", "Long-term"],
              ] as const
            ).map(([value, label]) => (
              <FilterChip
                key={value}
                active={impactFilter === value}
                onClick={() => setImpactFilter(value)}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.length === 0 ? (
          <p className="p-6 text-zinc-500">
            No recommendations match your filters.
          </p>
        ) : (
          filtered.map((rec) => (
            <div key={rec.id}>
              <button
                onClick={() =>
                  setExpanded(expanded === rec.id ? null : rec.id)
                }
                className="flex w-full items-start gap-3 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    rec.impact === "quick-win"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {rec.impact === "quick-win" ? "Quick win" : "Long-term"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {rec.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {rec.description}
                  </p>
                </div>
                <span className="text-zinc-400">
                  {expanded === rec.id ? "−" : "+"}
                </span>
              </button>

              {expanded === rec.id && (
                <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    How to fix
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {rec.fixInstructions}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      SEO impact:{" "}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {rec.estimatedSeoImpact}
                    </span>
                  </p>
                  {rec.affectedPages && rec.affectedPages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Affected pages
                      </p>
                      <ul className="mt-1 space-y-1">
                        {rec.affectedPages.map((page) => (
                          <li key={page}>
                            <a
                              href={page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              {page}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
