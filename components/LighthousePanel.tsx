import type { LighthouseMetrics } from "@/lib/types";

interface LighthousePanelProps {
  lighthouse: LighthouseMetrics[];
}

export function LighthousePanel({ lighthouse }: LighthousePanelProps) {
  if (lighthouse.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500">No Lighthouse data available for this audit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Performance scores for the homepage and top-linked pages (not every crawled
        page).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lighthouse.map((lh) => (
          <div
            key={lh.url}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <a
              href={lh.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {lh.url}
            </a>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Performance" value={lh.performance} />
              <Metric label="SEO" value={lh.seo} />
              <Metric label="Accessibility" value={lh.accessibility} />
              <Metric label="Best practices" value={lh.bestPractices} />
              {lh.lcp !== undefined && (
                <span className="col-span-2 text-zinc-600 dark:text-zinc-400">
                  LCP: {Math.round(lh.lcp)}ms
                </span>
              )}
              {lh.cls !== undefined && (
                <span className="col-span-2 text-zinc-600 dark:text-zinc-400">
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
      ? "text-emerald-600"
      : value >= 60
        ? "text-amber-600"
        : "text-red-600";
  return (
    <div>
      <span className="text-xs text-zinc-500">{label}</span>
      <p className={`font-semibold ${color}`}>{value}</p>
    </div>
  );
}
