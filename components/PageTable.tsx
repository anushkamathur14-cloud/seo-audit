"use client";

import { useState } from "react";
import type { PageAudit } from "@/lib/types";

interface PageTableProps {
  pages: PageAudit[];
}

type SortKey = "url" | "issues" | "inboundLinkCount" | "statusCode";

export function PageTable({ pages }: PageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("issues");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...pages].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc
      ? Number(aVal) - Number(bVal)
      : Number(bVal) - Number(aVal);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const headerClass =
    "cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-700";

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Pages ({pages.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                Title
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sorted.map((page) => (
              <tr key={page.url} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                <td className="max-w-xs truncate px-4 py-3">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
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
                <td className="max-w-xs truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {page.title ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
