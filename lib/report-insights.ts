import type { AuditResult, Issue, Recommendation } from "./types";

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Needs attention";
  return "Critical gaps";
}

export function getScoreContext(score: number): string {
  if (score >= 80) {
    return "Your site is in good shape — focus on the quick wins below to push performance further.";
  }
  if (score >= 60) {
    return "Several fixable issues are holding back visibility and performance.";
  }
  return "Important SEO and technical issues need attention before scaling traffic.";
}

export function getMainWeakness(result: AuditResult): string {
  const { issuesBySeverity } = result.summary;
  if (issuesBySeverity.critical > 0) {
    return "Critical technical or indexing issues";
  }
  if (issuesBySeverity.high > 0) {
    return "On-page SEO and performance gaps";
  }
  const perfIssues = result.issues.filter((i) => i.category === "performance");
  if (perfIssues.length > 0) {
    return "Page speed and Core Web Vitals";
  }
  const metaIssues = result.issues.filter((i) =>
    /meta|title|description/i.test(i.title),
  );
  if (metaIssues.length > 0) {
    return "Metadata and content clarity";
  }
  return "Incremental optimization opportunities";
}

export function getTopWins(
  recommendations: Recommendation[],
  limit = 3,
): Recommendation[] {
  return [...recommendations]
    .filter((r) => r.impact === "quick-win")
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, limit);
}

export function getBiggestRisks(issues: Issue[], limit = 3): Issue[] {
  return [...issues]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, limit);
}

export function getPriorityActions(
  recommendations: Recommendation[],
  issues: Issue[],
  limit = 3,
): Array<{ title: string; why: string; effort: string }> {
  if (recommendations.length > 0) {
    return recommendations.slice(0, limit).map((rec) => ({
      title: rec.title,
      why: rec.description,
      effort: estimateEffort(rec),
    }));
  }

  return getBiggestRisks(issues, limit).map((issue) => ({
    title: issue.title,
    why: issue.description,
    effort: issue.severity === "critical" || issue.severity === "high"
      ? "30–60 min"
      : "15–30 min",
  }));
}

export function impactTier(
  rec: Recommendation,
): "high" | "medium" | "low" {
  if (rec.severity === "critical" || rec.severity === "high") return "high";
  if (rec.severity === "medium") return "medium";
  return "low";
}

export function estimateEffort(rec: Recommendation): string {
  if (rec.impact === "quick-win") {
    return rec.severity === "critical" || rec.severity === "high"
      ? "30–60 min"
      : "15–30 min";
  }
  return "1–3 hours";
}

export function impactStars(tier: "high" | "medium" | "low"): string {
  if (tier === "high") return "★★★★☆";
  if (tier === "medium") return "★★★☆☆";
  return "★★☆☆☆";
}

function severityRank(severity: Issue["severity"] | Recommendation["severity"]) {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return order[severity];
}

export function groupRecommendationsByImpact(recommendations: Recommendation[]) {
  const groups: Record<"high" | "medium" | "low", Recommendation[]> = {
    high: [],
    medium: [],
    low: [],
  };
  for (const rec of recommendations) {
    groups[impactTier(rec)].push(rec);
  }
  return groups;
}

export function getAiInsightText(result: AuditResult): string {
  const weakness = getMainWeakness(result);
  if (result.scores.overall >= 80) {
    return `Your site has strong fundamentals. Focus on ${weakness.toLowerCase()} and the quick wins in your report to unlock the next level of growth.`;
  }
  if (result.scores.overall >= 60) {
    return `Your site has solid content potential. Focus on technical optimizations and targeted fixes for ${weakness.toLowerCase()} to improve rankings and drive more conversions.`;
  }
  return `There are meaningful gaps holding this site back — especially around ${weakness.toLowerCase()}. Tackle the high-impact recommendations first for the fastest ROI.`;
}

export function getEstimatedTrafficLift(score: number): number {
  if (score >= 85) return 12;
  if (score >= 70) return 24;
  if (score >= 55) return 38;
  return 52;
}

export function countHighImpactOpportunities(result: AuditResult): number {
  const highRecs = result.recommendations.filter(
    (r) => impactTier(r) === "high",
  ).length;
  const highIssues = result.summary.issuesBySeverity.critical +
    result.summary.issuesBySeverity.high;
  return Math.max(highRecs, highIssues, result.recommendations.length);
}

export function getPerformanceScore(result: AuditResult): number {
  return result.summary.avgLighthousePerformance ?? result.scores.lighthouseSeo;
}

export function getPerformanceLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
}

export function getSeoHealthLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  return "Needs work";
}
