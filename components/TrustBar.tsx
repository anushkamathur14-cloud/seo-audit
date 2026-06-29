"use client";

import { useState } from "react";
import { ChevronDown, Clock, FileText, Info, Layers } from "lucide-react";
import type { AuditResult } from "@/lib/types";

interface TrustBarProps {
  result: AuditResult;
}

export function TrustBar({ result }: TrustBarProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <TrustItem
          icon={Layers}
          label={`${result.summary.totalPages} pages analyzed`}
        />
        <TrustItem
          icon={Clock}
          label={`Crawled ${new Date(result.auditedAt).toLocaleString()}`}
        />
        <TrustItem
          icon={FileText}
          label={result.aiGenerated ? "AI-enhanced recommendations" : "Rule-based analysis"}
        />
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          aria-expanded={showMethodology}
        >
          <Info className="h-4 w-4" aria-hidden />
          How scores are calculated
          <ChevronDown
            className={`h-4 w-4 transition ${showMethodology ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {showMethodology && (
        <div className="mt-4 rounded-lg border border-card-border bg-accent-soft/30 p-4 text-sm text-muted">
          <p>
            <strong className="text-foreground">Overall score</strong> combines
            on-page SEO ({result.scores.ruleBased}/100 from issue severity) with
            Lighthouse SEO ({result.scores.lighthouseSeo}/100 from sampled
            pages). Critical issues reduce the score fastest; low-severity items
            have a smaller effect.
          </p>
          <p className="mt-2">
            Lighthouse performance is sampled on the homepage plus top-linked
            pages — not every crawled URL. Paid media suggestions are
            directional and based on on-page content, not live auction data.
          </p>
        </div>
      )}
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-muted">
      <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      {label}
    </span>
  );
}
