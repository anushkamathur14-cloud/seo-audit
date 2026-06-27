import type { AuditProgress } from "@/lib/types";

interface AuditProgressProps {
  progress: AuditProgress;
}

const PHASES = [
  { key: "crawling", label: "Crawling" },
  { key: "analyzing", label: "Analyzing" },
  { key: "lighthouse", label: "Lighthouse" },
  { key: "ai", label: "AI Recommendations" },
] as const;

export function AuditProgress({ progress }: AuditProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === progress.phase);

  return (
    <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          {progress.message ?? "Running audit..."}
        </p>
        <span className="text-sm text-zinc-500">
          {progress.pagesCrawled} / {progress.totalEstimate} pages
        </span>
      </div>

      <div className="flex gap-2">
        {PHASES.map((phase, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <div key={phase.key} className="flex-1">
              <div
                className={`h-2 rounded-full transition ${
                  isDone
                    ? "bg-indigo-600"
                    : isActive
                      ? "animate-pulse bg-indigo-400"
                      : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
              <p
                className={`mt-2 text-xs ${
                  isActive || isDone
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400"
                }`}
              >
                {phase.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
