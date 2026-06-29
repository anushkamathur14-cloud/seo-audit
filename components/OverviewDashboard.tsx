"use client";

import {
  BarChart3,
  Megaphone,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { AuditResult } from "@/lib/types";
import {
  countHighImpactOpportunities,
  getEstimatedTrafficLift,
  getPerformanceLabel,
  getPerformanceScore,
  getSeoHealthLabel,
  getAiInsightText,
  impactTier,
} from "@/lib/report-insights";
import { MetricGauge } from "./MetricGauge";
import { TrafficImpactChart } from "./TrafficImpactChart";

interface OverviewDashboardProps {
  result: AuditResult;
  onViewRecommendations?: () => void;
  onViewPaid?: () => void;
}

export function OverviewDashboard({
  result,
  onViewRecommendations,
  onViewPaid,
}: OverviewDashboardProps) {
  const perfScore = getPerformanceScore(result);
  const topRecs = result.recommendations.slice(0, 5);
  const paidItems = [
    ...result.paidStrategy.quickWins.slice(0, 3),
    ...result.paidStrategy.channels.slice(0, 2).map((c) => c.channelLabel),
  ].slice(0, 5);
  const opportunities = countHighImpactOpportunities(result);
  const trafficLift = getEstimatedTrafficLift(result.scores.overall);

  const auditTime = new Date(result.auditedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 p-5 sm:p-6 lg:p-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Last audit: {auditTime} · {result.summary.totalPages} pages analyzed
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricGauge
          score={result.scores.overall}
          label="SEO Health Score"
          status={getSeoHealthLabel(result.scores.overall)}
          accent="violet"
        />
        <MetricGauge
          score={perfScore}
          label="Performance Score"
          status={getPerformanceLabel(perfScore)}
          accent="blue"
        />
        <div className="dashboard-card flex flex-col justify-between p-5">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Top Opportunities
            </p>
            <p className="mt-3 text-4xl font-bold tabular-nums text-slate-900 dark:text-white">
              {opportunities}
            </p>
            <p className="mt-1 text-sm text-slate-500">High impact opportunities</p>
          </div>
          <BarChart3 className="mt-4 h-8 w-8 text-violet-400 opacity-80" aria-hidden />
        </div>
        <div className="dashboard-card flex flex-col justify-between p-5">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Estimated Impact
            </p>
            <p className="mt-3 text-4xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              +{trafficLift}%
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Potential organic traffic increase
            </p>
          </div>
          <TrendingUp className="mt-4 h-8 w-8 text-emerald-500 opacity-80" aria-hidden />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="dashboard-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Top Recommendations
            </h3>
            {onViewRecommendations && (
              <button
                type="button"
                onClick={onViewRecommendations}
                className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                View all
              </button>
            )}
          </div>
          {topRecs.length === 0 ? (
            <p className="text-sm text-slate-500">No major issues flagged.</p>
          ) : (
            <ul className="space-y-3">
              {topRecs.map((rec) => (
                <li
                  key={rec.id}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {rec.title}
                  </span>
                  <ImpactPill tier={impactTier(rec)} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Paid Media Strategy
            </h3>
            {result.includePaidMedia && onViewPaid && (
              <button
                type="button"
                onClick={onViewPaid}
                className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                View plan
              </button>
            )}
          </div>
          {!result.includePaidMedia ? (
            <p className="text-sm text-slate-500">
              Enable paid media on your next audit to see channel and keyword
              recommendations here.
            </p>
          ) : paidItems.length === 0 ? (
            <p className="text-sm text-slate-500">No paid strategy items yet.</p>
          ) : (
            <ul className="space-y-3">
              {paidItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/50">
                    <Megaphone className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficImpactChart currentScore={result.scores.overall} />

        <div className="dashboard-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/50">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              AI Summary
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {getAiInsightText(result)} By implementing the recommended SEO
            {result.includePaidMedia ? " and paid media strategies" : " fixes"},
            you could see stronger visibility over the next few months.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <StatChip icon={Search} label={`${result.summary.totalIssues} issues`} />
            <StatChip icon={Target} label={`${result.recommendations.length} fixes`} />
            {result.includePaidMedia && (
              <StatChip
                icon={Megaphone}
                label={`${result.paidStrategy.keywords.length} keywords`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactPill({ tier }: { tier: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  const labels = { high: "High Impact", medium: "Medium Impact", low: "Low Impact" };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[tier]}`}>
      {labels[tier]}
    </span>
  );
}

function StatChip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
