import { ArrowRight, FileDown, Megaphone, Wrench } from "lucide-react";
import type { AuditResult } from "@/lib/types";

interface NextStepsProps {
  result: AuditResult;
  onGoToSeo: () => void;
  onGoToPaid?: () => void;
  onDownload: () => void;
}

export function NextSteps({
  result,
  onGoToSeo,
  onGoToPaid,
  onDownload,
}: NextStepsProps) {
  const hasIssues = result.summary.totalIssues > 0;

  return (
    <section className="card border-accent/20 bg-accent-soft/20 p-6">
      <h3 className="text-lg font-semibold text-foreground">
        What should you do next?
      </h3>
      <p className="mt-1 text-sm text-muted">
        Turn this report into action — start with the highest-impact items.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {hasIssues ? (
          <NextStepCard
            icon={Wrench}
            title="Fix priority SEO issues"
            description={`${result.recommendations.length || result.summary.totalIssues} actionable items ready`}
            onClick={onGoToSeo}
          />
        ) : (
          <NextStepCard
            icon={Wrench}
            title="Great baseline — optimize further"
            description="No major issues found. Review performance and content opportunities."
            onClick={onGoToSeo}
          />
        )}

        {result.includePaidMedia && onGoToPaid && (
          <NextStepCard
            icon={Megaphone}
            title="Review paid media launch plan"
            description="Keywords, channels, and 12-week timeline"
            onClick={onGoToPaid}
          />
        )}

        <NextStepCard
          icon={FileDown}
          title="Export for your team"
          description="JSON, Markdown, or CSV for developers and marketers"
          onClick={onDownload}
        />
      </div>
    </section>
  );
}

function NextStepCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-card-border bg-card p-4 text-left transition hover:ring-2 hover:ring-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
        <Icon className="h-5 w-5 text-accent" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground group-hover:text-accent">
          {title}
        </p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <ArrowRight
        className="mt-1 h-4 w-4 shrink-0 text-muted opacity-0 transition group-hover:opacity-100"
        aria-hidden
      />
    </button>
  );
}
