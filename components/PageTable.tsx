"use client";

import { useMemo, useState } from "react";
import type { PageAudit } from "@/lib/types";
import { matchesSearch } from "@/lib/report-export";
import { SearchInput, FilterChip } from "./FilterBar";

interface PageTableProps {
  pages: PageAudit[];
}

type SortKey = "url" | "issues" | "inboundLinkCount" | "statusCode";
type StatusFilter = "all" | "ok" | "errors" | "has-issues";

export function PageTable({ pages }: PageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("issues");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [minIssues, setMinIssues] = useState(0);

  const filtered = useMemo(() => {
    return pages.filter((page) => {
      if (statusFilter === "errors" && page.statusCode < 400) return false;
      if (statusFilter === "ok" && page.statusCode >= 400) return false;
      if (statusFilter === "has-issues" && page.issues.length === 0) {
        return false;
      }
      if (page.issues.length < minIssues) return false;
      if (
        !matchesSearch(
          `${page.url} ${page.title ?? ""} ${page.metaDescription ?? ""}`,
          search,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [pages, statusFilter, minIssues, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = sortKey === "issues" ? a.issues.length : a[sortKey];
      const bVal = sortKey === "issues" ? b.issues.length : b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
  }, [filtered, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const headerClass =
    "cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted hover:text-foreground";

  const hasActiveFilters =
    statusFilter !== "all" || minIssues > 0 || search.length > 0;

  return (
    <div className="card overflow-hidden">
      <div className="space-y-4 border-b border-card-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Pages ({sorted.length}
            {sorted.length !== pages.length && ` of ${pages.length}`})
          </h2>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setMinIssues(0);
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
          placeholder="Search by URL or title..."
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["has-issues", "Has issues"],
                ["errors", "HTTP errors"],
                ["ok", "OK only"],
              ] as const
            ).map(([value, label]) => (
              <FilterChip
                key={value}
                active={statusFilter === value}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </FilterChip>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            Min issues:
            <select
              value={minIssues}
              onChange={(e) => setMinIssues(Number(e.target.value))}
              className="rounded border border-card-border bg-card px-2 py-1 text-sm text-foreground"
            >
              {[0, 1, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Any" : `${n}+`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-card-border bg-accent-soft/40">
            <tr>
              <th className={headerClass} onClick={() => toggleSort("url")}>
                URL {sortKey === "url" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className={headerClass} onClick={() => toggleSort("statusCode")}>
                Status {sortKey === "statusCode" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className={headerClass} onClick={() => toggleSort("issues")}>
                Issues {sortKey === "issues" && (sortAsc ? "↑" : "↓")}
              </th>
              <th
                className={headerClass}
                onClick={() => toggleSort("inboundLinkCount")}
              >
                Inbound Links{" "}
                {sortKey === "inboundLinkCount" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Title
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No pages match your filters.
                </td>
              </tr>
            ) : (
              sorted.map((page) => (
                <tr
                  key={page.url}
                  className="hover:bg-accent-soft/30"
                >
                  <td className="max-w-xs truncate px-4 py-3">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {page.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        page.statusCode >= 400
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {page.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">{page.issues.length}</td>
                  <td className="px-4 py-3">{page.inboundLinkCount}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">
                    {page.title ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
