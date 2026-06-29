import {
  BarChart3,
  Gauge,
  Search,
  TrendingUp,
} from "lucide-react";
import type { AuditScores, AuditSummary } from "@/lib/types";

interface ScoreCardsProps {
  scores: AuditScores;
  summary: AuditSummary;
}

function ScoreRing({
  score,
  label,
  icon: Icon,
}: {
  score: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
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
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <span className={`text-4xl font-bold tabular-nums ${color}`}>
        {score}
      </span>
      <span className="mt-1 text-center text-sm text-muted">{label}</span>
    </div>
  );
}

export function ScoreCards({ scores, summary }: ScoreCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ScoreRing score={scores.overall} label="Overall health" icon={TrendingUp} />
      <ScoreRing score={scores.ruleBased} label="On-page SEO" icon={Search} />
      <ScoreRing score={scores.lighthouseSeo} label="Lighthouse SEO" icon={Gauge} />
      <div className="card flex flex-col items-center justify-center p-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5">
          <BarChart3 className="h-5 w-5 text-orange-500" />
        </div>
        <span className="text-4xl font-bold tabular-nums text-foreground">
          {summary.totalIssues}
        </span>
        <span className="mt-1 text-sm text-muted">Issues found</span>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-red-600 dark:text-red-400">
            {summary.issuesBySeverity.critical} crit
          </span>
          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-600 dark:text-orange-400">
            {summary.issuesBySeverity.high} high
          </span>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400">
            {summary.issuesBySeverity.medium} med
          </span>
          <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-muted">
            {summary.issuesBySeverity.low} low
          </span>
        </div>
      </div>
    </div>
  );
}
