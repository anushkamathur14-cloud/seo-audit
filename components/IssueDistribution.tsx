import type { AuditSummary } from "@/lib/types";

interface IssueDistributionProps {
  summary: AuditSummary;
}

export function IssueDistribution({ summary }: IssueDistributionProps) {
  const total = summary.totalIssues || 1;
  const segments = [
    {
      key: "critical",
      label: "Critical",
      count: summary.issuesBySeverity.critical,
      color: "bg-red-500",
    },
    {
      key: "high",
      label: "High",
      count: summary.issuesBySeverity.high,
      color: "bg-orange-500",
    },
    {
      key: "medium",
      label: "Medium",
      count: summary.issuesBySeverity.medium,
      color: "bg-amber-500",
    },
    {
      key: "low",
      label: "Low",
      count: summary.issuesBySeverity.low,
      color: "bg-slate-400",
    },
  ];

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-foreground">Issue distribution</h3>
      <p className="mt-1 text-sm text-muted">
        {summary.totalIssues} total issues across {summary.totalPages} pages
      </p>

      <div
        className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="img"
        aria-label={`Issue distribution: ${segments.map((s) => `${s.count} ${s.label}`).join(", ")}`}
      >
        {segments.map(
          (segment) =>
            segment.count > 0 && (
              <div
                key={segment.key}
                className={`${segment.color} transition-all`}
                style={{ width: `${(segment.count / total) * 100}%` }}
              />
            ),
        )}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-sm">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment.color}`}
              aria-hidden
            />
            <span className="text-muted">{segment.label}</span>
            <span className="font-medium tabular-nums text-foreground">
              {segment.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
