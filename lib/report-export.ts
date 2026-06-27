import type { AuditResult, Issue, PageAudit, Recommendation } from "./types";

function slugify(url: string): string {
  try {
    return new URL(url).hostname.replace(/\./g, "-");
  } catch {
    return "report";
  }
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeCsv(value: string | number | undefined): string {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonReport(result: AuditResult): void {
  const filename = `seo-audit-${slugify(result.url)}-${timestamp()}.json`;
  downloadBlob(JSON.stringify(result, null, 2), filename, "application/json");
}

export function downloadIssuesCsv(issues: Issue[], siteUrl: string): void {
  const headers = [
    "Severity",
    "Category",
    "Title",
    "Description",
    "Page URL",
    "Recommendation",
  ];
  const rows = issues.map((issue) =>
    [
      issue.severity,
      issue.category,
      issue.title,
      issue.description,
      issue.pageUrl ?? "",
      issue.recommendation ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `seo-issues-${slugify(siteUrl)}-${timestamp()}.csv`;
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

export function downloadPagesCsv(pages: PageAudit[], siteUrl: string): void {
  const headers = [
    "URL",
    "Status Code",
    "Title",
    "Title Length",
    "Meta Description",
    "H1 Count",
    "Issues",
    "Inbound Links",
    "Internal Links",
    "External Links",
    "Broken Links",
    "Missing Alt Images",
    "Has Canonical",
    "Has OG Tags",
    "Has Structured Data",
    "Response Time (ms)",
  ];
  const rows = pages.map((page) =>
    [
      page.url,
      page.statusCode,
      page.title ?? "",
      page.titleLength ?? "",
      page.metaDescription ?? "",
      page.h1Count,
      page.issues.length,
      page.inboundLinkCount,
      page.internalLinks,
      page.externalLinks,
      page.brokenLinks,
      page.imagesMissingAlt,
      page.canonical ? "yes" : "no",
      page.hasOgTags ? "yes" : "no",
      page.hasStructuredData ? "yes" : "no",
      page.responseTimeMs ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `seo-pages-${slugify(siteUrl)}-${timestamp()}.csv`;
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

export function downloadRecommendationsCsv(
  recommendations: Recommendation[],
  siteUrl: string,
): void {
  const headers = [
    "Severity",
    "Impact",
    "Title",
    "Description",
    "Fix Instructions",
    "SEO Impact",
    "Affected Pages",
  ];
  const rows = recommendations.map((rec) =>
    [
      rec.severity,
      rec.impact,
      rec.title,
      rec.description,
      rec.fixInstructions,
      rec.estimatedSeoImpact,
      (rec.affectedPages ?? []).join("; "),
    ]
      .map(escapeCsv)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `seo-recommendations-${slugify(siteUrl)}-${timestamp()}.csv`;
  downloadBlob(csv, filename, "text/csv;charset=utf-8");
}

export function downloadMarkdownReport(result: AuditResult): void {
  const lines: string[] = [
    `# SEO Audit Report`,
    ``,
    `**Site:** ${result.url}`,
    `**Audited:** ${new Date(result.auditedAt).toLocaleString()}`,
    `**Overall Score:** ${result.scores.overall}/100`,
    ``,
    `## Scores`,
    `- Overall: ${result.scores.overall}/100`,
    `- On-page: ${result.scores.ruleBased}/100`,
    `- Lighthouse SEO: ${result.scores.lighthouseSeo}/100`,
    ``,
    `## Summary`,
    `- Pages crawled: ${result.summary.totalPages}`,
    `- Total issues: ${result.summary.totalIssues}`,
    `- Critical: ${result.summary.issuesBySeverity.critical}`,
    `- High: ${result.summary.issuesBySeverity.high}`,
    `- Medium: ${result.summary.issuesBySeverity.medium}`,
    `- Low: ${result.summary.issuesBySeverity.low}`,
    ``,
  ];

  if (result.recommendations.length > 0) {
    lines.push(`## Top Recommendations`, ``);
    for (const rec of result.recommendations) {
      lines.push(
        `### ${rec.title}`,
        `- **Severity:** ${rec.severity}`,
        `- **Impact:** ${rec.impact}`,
        `- ${rec.description}`,
        `- **Fix:** ${rec.fixInstructions}`,
        ``,
      );
    }
  }

  if (result.issues.length > 0) {
    lines.push(`## All Issues`, ``);
    for (const issue of result.issues) {
      lines.push(
        `- **[${issue.severity.toUpperCase()}] ${issue.title}** (${issue.category})`,
        `  ${issue.description}`,
        issue.pageUrl ? `  Page: ${issue.pageUrl}` : "",
        issue.recommendation ? `  Fix: ${issue.recommendation}` : "",
        ``,
      );
    }
  }

  const filename = `seo-audit-${slugify(result.url)}-${timestamp()}.md`;
  downloadBlob(lines.filter(Boolean).join("\n"), filename, "text/markdown;charset=utf-8");
}

export function matchesSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}
