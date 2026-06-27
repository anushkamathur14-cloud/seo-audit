"use client";

import { useMemo, useState } from "react";
import type { PaidStrategy, KeywordIntent } from "@/lib/types";
import { matchesSearch } from "@/lib/report-export";
import { SearchInput, FilterChip } from "./FilterBar";

interface PaidStrategyPanelProps {
  strategy: PaidStrategy;
}

const INTENT_STYLES: Record<KeywordIntent, string> = {
  informational: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  navigational: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  commercial: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  transactional: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const PRIORITY_STYLES = {
  primary: "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40",
  secondary: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
  test: "border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950",
};

export function PaidStrategyPanel({ strategy }: PaidStrategyPanelProps) {
  const [keywordSearch, setKeywordSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<KeywordIntent | "all">("all");
  const [channelFilter, setChannelFilter] = useState<
    "all" | "primary" | "secondary" | "test"
  >("all");

  const filteredKeywords = useMemo(() => {
    return strategy.keywords.filter((kw) => {
      if (intentFilter !== "all" && kw.intent !== intentFilter) return false;
      if (
        !matchesSearch(
          `${kw.keyword} ${kw.rationale} ${kw.suggestedLandingPage ?? ""}`,
          keywordSearch,
        )
      ) {
        return false;
      }
      return true;
    });
  }, [strategy.keywords, intentFilter, keywordSearch]);

  const filteredChannels = useMemo(() => {
    if (channelFilter === "all") return strategy.channels;
    return strategy.channels.filter((ch) => ch.priority === channelFilter);
  }, [strategy.channels, channelFilter]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900 dark:bg-indigo-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Paid Media Strategy
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {strategy.summary}
            </p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {strategy.aiGenerated ? "AI-generated" : "Rule-based"} ·{" "}
            {strategy.businessTypeGuess}
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Budget guidance
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {strategy.budgetGuidance}
          </p>
        </div>

        {strategy.quickWins.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Quick wins
            </p>
            <ul className="mt-2 space-y-1">
              {strategy.quickWins.map((win, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Keyword targets ({filteredKeywords.length})
          </h3>
          <SearchInput
            value={keywordSearch}
            onChange={setKeywordSearch}
            placeholder="Search keywords..."
          />
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "commercial", "transactional", "informational", "navigational"] as const
            ).map((intent) => (
              <FilterChip
                key={intent}
                active={intentFilter === intent}
                onClick={() => setIntentFilter(intent)}
              >
                {intent}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Keyword
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Intent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Match
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Rationale
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    No keywords match your filters.
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {kw.keyword}
                      {kw.suggestedLandingPage && (
                        <a
                          href={kw.suggestedLandingPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block truncate text-xs font-normal text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          → {kw.suggestedLandingPage}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${INTENT_STYLES[kw.intent]}`}
                      >
                        {kw.intent}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                      {kw.matchType}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                      {kw.priority}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {kw.rationale}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Recommended channels ({filteredChannels.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["all", "primary", "secondary", "test"] as const).map((p) => (
              <FilterChip
                key={p}
                active={channelFilter === p}
                onClick={() => setChannelFilter(p)}
              >
                {p}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className={`rounded-lg border p-4 ${PRIORITY_STYLES[channel.priority]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {channel.channelLabel}
                </h4>
                <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs capitalize dark:bg-zinc-700">
                  {channel.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {channel.rationale}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                  {channel.estimatedBudgetRange}
                </span>
                <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                  {channel.bestFor}
                </span>
              </div>
              <ul className="mt-3 space-y-1">
                {channel.tactics.map((tactic, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="text-indigo-500">•</span>
                    {tactic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
