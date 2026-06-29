import { Gauge, ExternalLink } from "lucide-react";
import type { LighthouseMetrics } from "@/lib/types";

interface LighthousePanelProps {
  lighthouse: LighthouseMetrics[];
}

export function LighthousePanel({ lighthouse }: LighthousePanelProps) {
  if (lighthouse.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Gauge className="mx-auto mb-3 h-10 w-10 text-muted" strokeWidth={1.5} />
        <p className="text-muted">No Lighthouse data available for this audit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Performance scores for the homepage and top-linked pages (not every crawled
        page).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lighthouse.map((lh) => (
          <div key={lh.url} className="card p-4 transition hover:ring-1 hover:ring-accent/20">
            <a
              href={lh.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 truncate text-sm font-medium text-accent hover:underline"
            >
              <span className="truncate">{lh.url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Performance" value={lh.performance} />
              <Metric label="SEO" value={lh.seo} />
              <Metric label="Accessibility" value={lh.accessibility} />
              <Metric label="Best practices" value={lh.bestPractices} />
              {lh.lcp !== undefined && (
                <span className="col-span-2 text-muted">
                  LCP: {Math.round(lh.lcp)}ms
                </span>
              )}
              {lh.cls !== undefined && (
                <span className="col-span-2 text-muted">
                  CLS: {lh.cls}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : value >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  return (
    <div>
      <span className="text-xs text-muted">{label}</span>
      <p className={`font-semibold ${color}`}>{value}</p>
    </div>
  );
}
