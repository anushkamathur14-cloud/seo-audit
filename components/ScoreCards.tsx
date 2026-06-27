import type { AuditScores, AuditSummary } from "@/lib/types";

interface ScoreCardsProps {
  scores: AuditScores;
  summary: AuditSummary;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className={`text-4xl font-bold ${color}`}>{score}</span>
      <span className="mt-1 text-sm text-zinc-500">{label}</span>
    </div>
  );
}

export function ScoreCards({ scores, summary }: ScoreCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ScoreRing score={scores.overall} label="Overall SEO Health" />
      <ScoreRing score={scores.ruleBased} label="On-Page Score" />
      <ScoreRing score={scores.lighthouseSeo} label="Lighthouse SEO" />
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {summary.totalIssues}
        </span>
        <span className="mt-1 text-sm text-zinc-500">Issues Found</span>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="text-red-600">{summary.issuesBySeverity.critical} crit</span>
          <span className="text-orange-600">{summary.issuesBySeverity.high} high</span>
          <span className="text-amber-600">{summary.issuesBySeverity.medium} med</span>
          <span className="text-zinc-500">{summary.issuesBySeverity.low} low</span>
        </div>
      </div>
    </div>
  );
}
