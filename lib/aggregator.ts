import type {
  AuditResult,
  AuditScores,
  AuditSummary,
  Issue,
  LighthouseMetrics,
  PageAudit,
  PageSignals,
  Recommendation,
  Severity,
  SiteAudit,
} from "./types";

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 15,
  high: 8,
  medium: 4,
  low: 2,
};

function computeRuleBasedScore(issues: Issue[]): number {
  let score = 100;
  for (const issue of issues) {
    score -= SEVERITY_WEIGHTS[issue.severity];
  }
  return Math.max(0, Math.min(100, score));
}

function computeOverallScore(
  ruleBased: number,
  lighthouseSeo: number,
): number {
  return Math.round(ruleBased * 0.6 + lighthouseSeo * 0.4);
}

function countBySeverity(issues: Issue[]): Record<Severity, number> {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.severity]++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );
}

function addDuplicateIssues(
  pages: PageAudit[],
  field: "title" | "metaDescription",
  label: string,
): Issue[] {
  const map = new Map<string, string[]>();
  for (const page of pages) {
    const value =
      field === "title" ? page.title : page.metaDescription;
    if (!value) continue;
    const key = value.toLowerCase().trim();
    const existing = map.get(key) ?? [];
    existing.push(page.url);
    map.set(key, existing);
  }

  const issues: Issue[] = [];
  let index = 0;
  for (const [value, urls] of map.entries()) {
    if (urls.length < 2) continue;
    issues.push({
      id: `dup-${field}-${index++}`,
      severity: field === "title" ? "high" : "medium",
      category: "duplicates",
      title: `Duplicate ${label} across pages`,
      description: `"${value.slice(0, 80)}" appears on ${urls.length} pages.`,
      recommendation: `Write unique ${label.toLowerCase()}s for each page.`,
      pageUrl: urls[0],
    });
  }
  return issues;
}

function addLighthouseIssues(metrics: LighthouseMetrics[]): Issue[] {
  const issues: Issue[] = [];
  let index = 0;

  for (const m of metrics) {
    if (m.performance < 50) {
      issues.push({
        id: `lh-perf-${index++}`,
        severity: "high",
        category: "performance",
        title: "Poor Lighthouse performance score",
        description: `Performance score is ${m.performance}/100 on ${m.url}.`,
        recommendation:
          "Optimize images, reduce JavaScript, and eliminate render-blocking resources.",
        pageUrl: m.url,
      });
    }

    if (m.lcp !== undefined && m.lcp > 2500) {
      issues.push({
        id: `lh-lcp-${index++}`,
        severity: m.lcp > 4000 ? "high" : "medium",
        category: "performance",
        title: "Largest Contentful Paint too slow",
        description: `LCP is ${Math.round(m.lcp)}ms (target: <2500ms).`,
        recommendation:
          "Optimize hero images, preload critical resources, improve server response time.",
        pageUrl: m.url,
      });
    }

    if (m.cls !== undefined && m.cls > 0.1) {
      issues.push({
        id: `lh-cls-${index++}`,
        severity: m.cls > 0.25 ? "high" : "medium",
        category: "performance",
        title: "High Cumulative Layout Shift",
        description: `CLS is ${m.cls} (target: <0.1).`,
        recommendation:
          "Set explicit dimensions on images/embeds and avoid inserting content above existing content.",
        pageUrl: m.url,
      });
    }

    if (m.seo < 80) {
      issues.push({
        id: `lh-seo-${index++}`,
        severity: "medium",
        category: "lighthouse-seo",
        title: "Low Lighthouse SEO score",
        description: `Lighthouse SEO score is ${m.seo}/100 on ${m.url}.`,
        recommendation: "Address Lighthouse SEO audit failures for this page.",
        pageUrl: m.url,
      });
    }
  }

  return issues;
}

export function buildPageAudits(
  pageData: Array<{
    signals: PageSignals;
    issues: Issue[];
  }>,
  inboundCounts: Map<string, number>,
): PageAudit[] {
  return pageData.map(({ signals, issues }) => ({
    ...signals,
    issues,
    inboundLinkCount: inboundCounts.get(signals.url) ?? 0,
  }));
}

export function aggregateAudit(input: {
  url: string;
  pages: PageAudit[];
  site: SiteAudit;
  lighthouse: LighthouseMetrics[];
  siteIssues: Issue[];
  recommendations: Recommendation[];
  aiGenerated: boolean;
}): AuditResult {
  const duplicateTitleIssues = addDuplicateIssues(input.pages, "title", "title");
  const duplicateDescIssues = addDuplicateIssues(
    input.pages,
    "metaDescription",
    "meta description",
  );
  const lighthouseIssues = addLighthouseIssues(input.lighthouse);

  const allIssues = [
    ...input.pages.flatMap((p) => p.issues),
    ...input.siteIssues,
    ...duplicateTitleIssues,
    ...duplicateDescIssues,
    ...lighthouseIssues,
  ];

  const ruleBased = computeRuleBasedScore(allIssues);
  const avgLighthouseSeo =
    input.lighthouse.length > 0
      ? Math.round(
          input.lighthouse.reduce((s, m) => s + m.seo, 0) /
            input.lighthouse.length,
        )
      : 70;
  const avgLighthousePerformance =
    input.lighthouse.length > 0
      ? Math.round(
          input.lighthouse.reduce((s, m) => s + m.performance, 0) /
            input.lighthouse.length,
        )
      : undefined;

  const scores: AuditScores = {
    ruleBased,
    lighthouseSeo: avgLighthouseSeo,
    overall: computeOverallScore(ruleBased, avgLighthouseSeo),
  };

  const summary: AuditSummary = {
    totalPages: input.pages.length,
    totalIssues: allIssues.length,
    issuesBySeverity: countBySeverity(allIssues),
    avgLighthousePerformance,
    avgLighthouseSeo,
  };

  return {
    url: input.url,
    auditedAt: new Date().toISOString(),
    pages: input.pages,
    site: input.site,
    lighthouse: input.lighthouse,
    issues: allIssues,
    recommendations: input.recommendations,
    scores,
    summary,
    aiGenerated: input.aiGenerated,
  };
}

export function buildFallbackRecommendations(issues: Issue[]): Recommendation[] {
  const severityOrder: Severity[] = ["critical", "high", "medium", "low"];
  const sorted = [...issues].sort(
    (a, b) =>
      severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
  );

  const grouped = new Map<string, Issue[]>();
  for (const issue of sorted.slice(0, 30)) {
    const key = issue.category;
    const list = grouped.get(key) ?? [];
    list.push(issue);
    grouped.set(key, list);
  }

  let index = 0;
  const recommendations: Recommendation[] = [];

  for (const [category, categoryIssues] of grouped) {
    const top = categoryIssues[0];
    recommendations.push({
      id: `fallback-${index++}`,
      severity: top.severity,
      title: top.title,
      description: top.description,
      fixInstructions:
        top.recommendation ??
        "Review and fix the identified issue on affected pages.",
      impact: top.severity === "critical" || top.severity === "high"
        ? "quick-win"
        : "long-term",
      estimatedSeoImpact:
        top.severity === "critical"
          ? "High — directly blocks indexing or ranking"
          : top.severity === "high"
            ? "Moderate — improves crawlability and rankings"
            : "Low — incremental improvement",
      affectedPages: categoryIssues
        .map((i) => i.pageUrl)
        .filter((u): u is string => !!u)
        .slice(0, 5),
    });
  }

  return recommendations;
}
