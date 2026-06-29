"use client";

import {
  BarChart3,
  Gauge,
  Search,
  TrendingUp,
} from "lucide-react";
import type { AuditScores, AuditSummary } from "@/lib/types";
import { getScoreLabel } from "@/lib/report-insights";
import { useCountUp } from "@/hooks/useCountUp";

interface ScoreCardsProps {
  scores: AuditScores;
  summary: AuditSummary;
}

function ScoreRing({
  score,
  label,
  context,
  icon: Icon,
  animate = true,
}: {
  score: number;
  label: string;
  context?: string;
  icon: React.ComponentType<{ className?: string }>;
  animate?: boolean;
}) {
  const display = useCountUp(score, 800, animate);
  const color =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
        ? "text-amber-500"
        : "text-red-500";
  const ring =
    score >= 80
      ? "from-emerald-500/20 to-emerald-500/5"
      : score >= 60
        ? "from-amber-500/20 to-amber-500/5"
        : "from-red-500/20 to-red-500/5";

  return (
    <div className="card flex flex-col items-center p-6 transition hover:ring-1 hover:ring-accent/20">
      <div
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${ring}`}
      >
        <Icon className={`h-5 w-5 ${color}`} aria-hidden />
      </div>
      <span className={`text-4xl font-bold tabular-nums ${color}`}>
        {display}
        <span className="text-lg text-muted">/100</span>
      </span>
      <span className="mt-1 text-center text-sm font-medium text-foreground">
        {label}
      </span>
      {context && (
        <span className="mt-1 text-center text-xs text-muted">{context}</span>
      )}
    </div>
  );
}

export function ScoreCards({ scores, summary }: ScoreCardsProps) {
  const issueCount = useCountUp(summary.totalIssues);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ScoreRing
        score={scores.overall}
        label="Overall health"
        context={getScoreLabel(scores.overall)}
        icon={TrendingUp}
      />
      <ScoreRing
        score={scores.ruleBased}
        label="On-page SEO"
        context="From crawl analysis"
        icon={Search}
      />
      <ScoreRing
        score={scores.lighthouseSeo}
        label="Lighthouse SEO"
        context="Sampled key pages"
        icon={Gauge}
      />
      <div className="card flex flex-col items-center justify-center p-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5">
          <BarChart3 className="h-5 w-5 text-orange-500" aria-hidden />
        </div>
        <span className="text-4xl font-bold tabular-nums text-foreground">
          {issueCount}
        </span>
        <span className="mt-1 text-sm text-muted">Issues found</span>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
          <SeverityPill count={summary.issuesBySeverity.critical} label="crit" tone="red" />
          <SeverityPill count={summary.issuesBySeverity.high} label="high" tone="orange" />
          <SeverityPill count={summary.issuesBySeverity.medium} label="med" tone="amber" />
          <SeverityPill count={summary.issuesBySeverity.low} label="low" tone="slate" />
        </div>
      </div>
    </div>
  );
}

function SeverityPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "red" | "orange" | "amber" | "slate";
}) {
  const styles = {
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    slate: "bg-slate-500/10 text-muted",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 ${styles[tone]}`}>
      {count} {label}
    </span>
  );
}
