import type { AuditResult } from "@/lib/types";
import {
  getBiggestRisks,
  getMainWeakness,
  getPriorityActions,
  getScoreContext,
  getScoreLabel,
  getTopWins,
} from "@/lib/report-insights";
import { Flame, ShieldAlert, Sparkles, Target } from "lucide-react";
import { ScoreRingLarge } from "./ScoreRingLarge";

interface ExecutiveSummaryProps {
  result: AuditResult;
  onViewIssues?: () => void;
  onViewRecommendations?: () => void;
}

export function ExecutiveSummary({
  result,
  onViewIssues,
  onViewRecommendations,
}: ExecutiveSummaryProps) {
  const topWins = getTopWins(result.recommendations);
  const risks = getBiggestRisks(result.issues);
  const actions = getPriorityActions(result.recommendations, result.issues);

  return (
    <section className="card overflow-hidden" aria-labelledby="executive-summary">
      <div className="grid gap-6 border-b border-card-border p-6 lg:grid-cols-[minmax(200px,280px)_1fr]">
        <ScoreRingLarge
          score={result.scores.overall}
          label="Overall health"
          sublabel={`${getScoreLabel(result.scores.overall)} · /100`}
        />
        <div className="flex flex-col justify-center">
          <h2 id="executive-summary" className="text-xl font-bold text-foreground">
            Executive summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {getScoreContext(result.scores.overall)}
          </p>
          <p className="mt-3 text-sm text-foreground">
            <span className="font-medium">Main weakness:</span>{" "}
            <span className="text-muted">{getMainWeakness(result)}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Understand your report in under 30 seconds — then drill into tabs for
            detail.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-3">
        <SummaryColumn
          icon={Sparkles}
          title="Top wins"
          accent="text-emerald-600 dark:text-emerald-400"
          empty="No quick wins flagged — see recommendations for longer-term improvements."
          items={topWins.map((w) => ({
            title: w.title,
            detail: w.estimatedSeoImpact,
          }))}
          onViewAll={onViewRecommendations}
          viewLabel="View SEO fixes"
        />

        <SummaryColumn
          icon={ShieldAlert}
          title="Biggest risks"
          accent="text-red-600 dark:text-red-400"
          empty="No critical risks found — nice work."
          items={risks.map((r) => ({
            title: r.title,
            detail: r.severity,
          }))}
          onViewAll={onViewIssues}
          viewLabel="View all issues"
        />

        <SummaryColumn
          icon={Target}
          title="Priority actions"
          accent="text-accent"
          empty="Run another audit or enable AI for tailored next steps."
          items={actions.map((a) => ({
            title: a.title,
            detail: `Effort: ${a.effort}`,
          }))}
          onViewAll={onViewRecommendations}
          viewLabel="See how to fix"
        />
      </div>
    </section>
  );
}

function SummaryColumn({
  icon: Icon,
  title,
  accent,
  items,
  empty,
  onViewAll,
  viewLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  accent: string;
  items: { title: string; detail: string }[];
  empty: string;
  onViewAll?: () => void;
  viewLabel: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-accent-soft/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} aria-hidden />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.title} className="text-sm">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="mt-0.5 capitalize text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
      {onViewAll && items.length > 0 && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-3 text-xs font-medium text-accent hover:underline"
        >
          {viewLabel} →
        </button>
      )}
    </div>
  );
}

export function ImpactLegend() {
  return (
    <p className="flex items-center gap-2 text-xs text-muted">
      <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden />
      Recommendations are grouped by business impact, not SEO category.
    </p>
  );
}
