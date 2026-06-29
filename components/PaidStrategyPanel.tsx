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
  primary: "border-accent/30 bg-accent-soft/60",
  secondary: "border-card-border bg-card",
  test: "border-dashed border-card-border bg-accent-soft/20",
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
      <div className="card border-accent/20 bg-accent-soft/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Paid Media Strategy
            </h2>
            <p className="mt-1 text-sm text-muted">
              {strategy.summary}
            </p>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            {strategy.aiGenerated ? "AI-generated" : "Rule-based"} ·{" "}
            {strategy.businessTypeGuess}
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-card-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Budget guidance
          </p>
          <p className="mt-1 text-sm text-muted">
            {strategy.budgetGuidance}
          </p>
        </div>

        {strategy.quickWins.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">
              Quick wins
            </p>
            <ul className="mt-2 space-y-1">
              {strategy.quickWins.map((win, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted"
                >
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="space-y-4 border-b border-card-border p-4">
          <h3 className="font-semibold text-foreground">
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
            <thead className="border-b border-card-border bg-accent-soft/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  Keyword
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  Intent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  Match
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  Rationale
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    No keywords match your filters.
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-accent-soft/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {kw.keyword}
                      {kw.suggestedLandingPage && (
                        <a
                          href={kw.suggestedLandingPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block truncate text-xs font-normal text-accent hover:underline"
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
                    <td className="px-4 py-3 capitalize text-muted">
                      {kw.matchType}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">
                      {kw.priority}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted">
                      {kw.rationale}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="space-y-4 border-b border-card-border p-4">
          <h3 className="font-semibold text-foreground">
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
                <h4 className="font-medium text-foreground">
                  {channel.channelLabel}
                </h4>
                <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs capitalize text-muted">
                  {channel.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {channel.rationale}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-accent-soft px-2 py-1 text-muted">
                  {channel.estimatedBudgetRange}
                </span>
                <span className="rounded bg-accent-soft px-2 py-1 text-muted">
                  {channel.bestFor}
                </span>
              </div>
              <ul className="mt-3 space-y-1">
                {channel.tactics.map((tactic, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <span className="text-accent">•</span>
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
