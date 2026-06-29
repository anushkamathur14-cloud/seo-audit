import {
  Bot,
  CheckCircle2,
  Circle,
  Gauge,
  Loader2,
  Megaphone,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import type { AuditProgress as AuditProgressType } from "@/lib/types";

interface AuditProgressProps {
  progress: AuditProgressType;
  includePaidMedia?: boolean;
}

const STEPS = [
  {
    key: "technical",
    label: "Checking technical SEO",
    detail: "Crawling pages and HTTP status",
    icon: ScanSearch,
    activePhases: ["crawling"],
  },
  {
    key: "metadata",
    label: "Reading metadata & headings",
    detail: "Titles, descriptions, and structure",
    icon: Sparkles,
    activePhases: ["analyzing"],
  },
  {
    key: "performance",
    label: "Evaluating page performance",
    detail: "Lighthouse Core Web Vitals",
    icon: Gauge,
    activePhases: ["lighthouse"],
  },
  {
    key: "content",
    label: "Identifying content opportunities",
    detail: "Issues ranked by business impact",
    icon: Bot,
    activePhases: ["ai"],
  },
  {
    key: "paid",
    label: "Reviewing paid media readiness",
    detail: "Keywords and channel fit",
    icon: Megaphone,
    activePhases: ["ai"],
    paidOnly: true,
  },
  {
    key: "recommendations",
    label: "Building your recommendations",
    detail: "Prioritized action plan",
    icon: CheckCircle2,
    activePhases: ["ai"],
  },
] as const;

const PHASE_ORDER = ["crawling", "analyzing", "lighthouse", "ai", "complete"];

export function AuditProgress({
  progress,
  includePaidMedia = false,
}: AuditProgressProps) {
  const phaseIndex = PHASE_ORDER.indexOf(progress.phase);
  const visibleSteps = STEPS.filter(
    (s) => !("paidOnly" in s && s.paidOnly) || includePaidMedia,
  );

  function stepStatus(step: (typeof STEPS)[number], index: number) {
    const activePhaseIndices = step.activePhases.map((p) =>
      PHASE_ORDER.indexOf(p),
    );
    const stepPhaseIndex = Math.max(...activePhaseIndices);

    if (phaseIndex > stepPhaseIndex) return "done";
    if (activePhaseIndices.includes(phaseIndex)) return "active";
    if (index === 0 && phaseIndex <= 0) return "active";
    return "pending";
  }

  return (
    <div className="card w-full p-6" aria-live="polite" aria-busy="true">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
          <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            {progress.message ?? "Analyzing your website…"}
          </p>
          <p className="text-sm text-muted">
            {progress.pagesCrawled} of {progress.totalEstimate} pages crawled
            · usually 2–5 minutes
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {visibleSteps.map((step, index) => {
          const status = stepStatus(step, index);
          const Icon = step.icon;
          return (
            <li
              key={step.key}
              className={`flex items-start gap-3 rounded-lg px-3 py-2 transition ${
                status === "active" ? "bg-accent-soft/50" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  status === "done"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : status === "active"
                      ? "bg-accent-soft text-accent"
                      : "text-muted"
                }`}
                aria-hidden
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : status === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    status === "pending" ? "text-muted" : "text-foreground"
                  }`}
                >
                  {status === "done" && "✓ "}
                  {step.label}
                </p>
                {status === "active" && (
                  <p className="text-xs text-muted">{step.detail}</p>
                )}
              </div>
              {status === "active" && (
                <Icon className="h-4 w-4 shrink-0 text-accent opacity-60" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
