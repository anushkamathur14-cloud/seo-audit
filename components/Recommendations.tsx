"use client";

import { useMemo, useState } from "react";
import type { Recommendation, Severity } from "@/lib/types";
import { matchesSearch } from "@/lib/report-export";
import {
  estimateEffort,
  groupRecommendationsByImpact,
  impactStars,
  impactTier,
} from "@/lib/report-insights";
import { SearchInput, FilterChip } from "./FilterBar";
import { PartyPopper } from "lucide-react";

interface RecommendationsProps {
  recommendations: Recommendation[];
  aiGenerated: boolean;
}

const IMPACT_SECTIONS = [
  {
    tier: "high" as const,
    title: "High impact",
    emoji: "🔥",
    description: "Fix these first for the biggest SEO and business gains.",
    border: "border-red-200/60 dark:border-red-900/40",
    bg: "bg-red-50/50 dark:bg-red-950/20",
  },
  {
    tier: "medium" as const,
    title: "Medium impact",
    emoji: "🟡",
    description: "Important improvements worth scheduling this sprint.",
    border: "border-amber-200/60 dark:border-amber-900/40",
    bg: "bg-amber-50/40 dark:bg-amber-950/15",
  },
  {
    tier: "low" as const,
    title: "Low impact",
    emoji: "🟢",
    description: "Polish items when higher-priority work is done.",
    border: "border-card-border",
    bg: "bg-accent-soft/20",
  },
];

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

  const grouped = useMemo(
    () => groupRecommendationsByImpact(filtered),
    [filtered],
  );

  const hasActiveFilters =
    severityFilter !== "all" || impactFilter !== "all" || search.length > 0;

  if (recommendations.length === 0) {
    return (
      <div className="card p-8 text-center">
        <PartyPopper className="mx-auto mb-3 h-10 w-10 text-emerald-500" aria-hidden />
        <h3 className="font-semibold text-foreground">Looking good!</h3>
        <p className="mt-2 text-sm text-muted">
          No major SEO recommendations flagged. Review performance and paid media
          tabs for growth opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="space-y-4 border-b border-card-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                SEO recommendations
              </h2>
              <p className="mt-1 text-sm text-muted">
                Grouped by business impact — each item includes what, why,
                effort, and how.
              </p>
            </div>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              {aiGenerated ? "AI consultant" : "Rule-based"}
            </span>
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

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSeverityFilter("all");
                setImpactFilter("all");
                setSearch("");
              }}
              className="text-xs text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="card p-6 text-muted">No recommendations match your filters.</p>
      ) : (
        IMPACT_SECTIONS.map((section) => {
          const items = grouped[section.tier];
          if (items.length === 0) return null;
          return (
            <section
              key={section.tier}
              className={`card overflow-hidden border ${section.border} ${section.bg}`}
            >
              <div className="border-b border-card-border/60 px-4 py-3">
                <h3 className="font-semibold text-foreground">
                  {section.emoji} {section.title}{" "}
                  <span className="text-sm font-normal text-muted">
                    ({items.length})
                  </span>
                </h3>
                <p className="text-sm text-muted">{section.description}</p>
              </div>
              <div className="divide-y divide-card-border">
                {items.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    expanded={expanded === rec.id}
                    onToggle={() =>
                      setExpanded(expanded === rec.id ? null : rec.id)
                    }
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  expanded,
  onToggle,
}: {
  rec: Recommendation;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tier = impactTier(rec);
  const effort = estimateEffort(rec);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{rec.title}</p>
            <span className="text-xs text-amber-600 dark:text-amber-400" aria-label={`Impact ${impactStars(tier)}`}>
              {impactStars(tier)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{rec.description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Badge label={`Impact: ${tier}`} />
            <Badge label={`Effort: ${effort}`} />
            <Badge label={rec.impact === "quick-win" ? "Quick win" : "Long-term"} />
          </div>
        </div>
        <span className="text-muted" aria-hidden>
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-card-border bg-card/80 px-4 py-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Why it matters" value={rec.description} />
            <Detail label="Expected impact" value={rec.estimatedSeoImpact} />
            <Detail label="Effort" value={effort} />
            <Detail label="Priority" value={rec.severity} />
          </dl>
          <div className="mt-4">
            <p className="font-medium text-foreground">How to fix</p>
            <p className="mt-1 text-muted">{rec.fixInstructions}</p>
          </div>
          {rec.affectedPages && rec.affectedPages.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-foreground">Affected pages</p>
              <ul className="mt-1 space-y-1">
                {rec.affectedPages.map((page) => (
                  <li key={page}>
                    <a
                      href={page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
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
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-card px-2 py-0.5 capitalize text-muted ring-1 ring-card-border">
      {label}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 capitalize text-foreground">{value}</dd>
    </div>
  );
}
