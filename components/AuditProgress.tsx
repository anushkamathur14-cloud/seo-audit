import {
  Bot,
  CheckCircle2,
  Loader2,
  ScanSearch,
  Zap,
} from "lucide-react";
import type { AuditProgress as AuditProgressType } from "@/lib/types";

interface AuditProgressProps {
  progress: AuditProgressType;
}

const PHASES = [
  { key: "crawling", label: "Crawling", icon: ScanSearch },
  { key: "analyzing", label: "Analyzing", icon: Zap },
  { key: "lighthouse", label: "Lighthouse", icon: Loader2 },
  { key: "ai", label: "Recommendations", icon: Bot },
] as const;

export function AuditProgress({ progress }: AuditProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.key === progress.phase);

  return (
    <div className="card w-full max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            {progress.message ?? "Running your audit…"}
          </p>
          <p className="text-sm text-muted">
            {progress.pagesCrawled} of {progress.totalEstimate} pages crawled
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {PHASES.map((phase, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          const Icon = phase.icon;

          return (
            <div key={phase.key} className="text-center">
              <div
                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isDone
                    ? "bg-emerald-500/15 text-emerald-500"
                    : isActive
                      ? "bg-accent-soft text-accent ring-2 ring-accent/30"
                      : "bg-slate-100 text-muted dark:bg-slate-800"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isActive ? (
                  <Icon className={`h-5 w-5 ${phase.key === "lighthouse" || phase.key === "ai" ? "animate-pulse" : ""}`} />
                ) : (
                  <Icon className="h-5 w-5 opacity-50" />
                )}
              </div>
              <p
                className={`text-xs font-medium ${
                  isActive || isDone ? "text-accent" : "text-muted"
                }`}
              >
                {phase.label}
              </p>
              {isActive && (
                <div className="mx-auto mt-2 h-1 w-full max-w-[48px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="progress-shimmer h-full w-full rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
