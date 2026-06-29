import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AuditResult } from "./types";
import {
  getAiInsightText,
  getEstimatedTrafficLift,
  getPerformanceLabel,
  getPerformanceScore,
  getSeoHealthLabel,
} from "./report-insights";

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

const MARGIN = 14;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const VIOLET: [number, number, number] = [124, 58, 237];

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `AI Marketing Strategy Agent · Page ${pageNum} of ${totalPages}`,
    PAGE_WIDTH / 2,
    290,
    { align: "center" },
  );
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    return MARGIN + 8;
  }
  return y;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = ensureSpace(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(title, MARGIN, y);
  return y + 8;
}

function addBodyText(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  for (const line of lines) {
    y = ensureSpace(doc, y, 5);
    doc.text(line, MARGIN, y);
    y += 4.5;
  }
  return y + 4;
}

export function downloadPdfReport(result: AuditResult): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const perfScore = getPerformanceScore(result);
  const trafficLift = getEstimatedTrafficLift(result.scores.overall);
  const auditedAt = new Date(result.auditedAt).toLocaleString();

  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text("SEO Audit Report", MARGIN, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("AI Marketing Strategy Agent", MARGIN, y + 6);

  y += 16;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Site: ${result.url}`, MARGIN, y);
  y += 5;
  doc.text(`Audited: ${auditedAt}`, MARGIN, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Score", "Status"]],
    body: [
      [
        "SEO Health",
        `${result.scores.overall}/100`,
        getSeoHealthLabel(result.scores.overall),
      ],
      [
        "Performance",
        `${perfScore}/100`,
        getPerformanceLabel(perfScore),
      ],
      [
        "On-page",
        `${result.scores.ruleBased}/100`,
        "Rule-based audit",
      ],
      [
        "Lighthouse SEO",
        `${result.scores.lighthouseSeo}/100`,
        "Sampled pages",
      ],
      [
        "Est. traffic lift",
        `+${trafficLift}%`,
        "If fixes implemented",
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: VIOLET, textColor: 255 },
    margin: { left: MARGIN, right: MARGIN },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  y = addSectionTitle(doc, "Summary", y);
  y = addBodyText(
    doc,
    `${result.summary.totalPages} pages crawled · ${result.summary.totalIssues} issues ` +
      `(Critical: ${result.summary.issuesBySeverity.critical}, ` +
      `High: ${result.summary.issuesBySeverity.high}, ` +
      `Medium: ${result.summary.issuesBySeverity.medium}, ` +
      `Low: ${result.summary.issuesBySeverity.low})`,
    y,
  );

  y = addSectionTitle(doc, "AI Insight", y);
  y = addBodyText(doc, getAiInsightText(result), y);

  if (result.recommendations.length > 0) {
    y = addSectionTitle(doc, "SEO Recommendations", y);
    autoTable(doc, {
      startY: y,
      head: [["Title", "Severity", "Impact", "Fix"]],
      body: result.recommendations.map((rec) => [
        rec.title,
        rec.severity,
        rec.impact,
        rec.fixInstructions,
      ]),
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: VIOLET, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 42 },
        3: { cellWidth: 70 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
    y =
      (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  if (result.includePaidMedia && result.paidStrategy.included) {
    const ps = result.paidStrategy;
    y = addSectionTitle(doc, "Paid Media Strategy", y);
    y = addBodyText(
      doc,
      `Business type: ${ps.businessTypeGuess}. ${ps.summary}`,
      y,
    );
    y = addBodyText(doc, `Budget guidance: ${ps.budgetGuidance}`, y);

    if (ps.quickWins.length > 0) {
      y = addBodyText(
        doc,
        `Quick wins: ${ps.quickWins.join("; ")}`,
        y,
      );
    }

    if (ps.launchTimeline.length > 0) {
      y = addSectionTitle(doc, "Launch Timeline", y);
      for (const phase of ps.launchTimeline) {
        y = addBodyText(
          doc,
          `${phase.phase} (${phase.timeframe}): ${phase.goals.join(", ")}. Tasks: ${phase.tasks.join("; ")}`,
          y,
        );
      }
    }

    if (ps.keywords.length > 0) {
      y = addSectionTitle(doc, "Keyword Targets", y);
      autoTable(doc, {
        startY: y,
        head: [["Keyword", "Intent", "Match", "Priority"]],
        body: ps.keywords.map((kw) => [
          kw.keyword,
          kw.intent,
          kw.matchType,
          kw.priority,
        ]),
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: VIOLET, textColor: 255 },
        margin: { left: MARGIN, right: MARGIN },
      });
      y =
        (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;
    }

    if (ps.channels.length > 0) {
      y = addSectionTitle(doc, "Recommended Channels", y);
      autoTable(doc, {
        startY: y,
        head: [["Channel", "Priority", "Budget", "Best for"]],
        body: ps.channels.map((ch) => [
          ch.channelLabel,
          ch.priority,
          ch.estimatedBudgetRange,
          ch.bestFor,
        ]),
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
        headStyles: { fillColor: VIOLET, textColor: 255 },
        margin: { left: MARGIN, right: MARGIN },
      });
      y =
        (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;
    }
  }

  if (result.issues.length > 0) {
    y = addSectionTitle(doc, "All Issues", y);
    autoTable(doc, {
      startY: y,
      head: [["Severity", "Category", "Title", "Page", "Fix"]],
      body: result.issues.map((issue) => [
        issue.severity,
        issue.category,
        issue.title,
        issue.pageUrl ?? "—",
        issue.recommendation ?? issue.description,
      ]),
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: VIOLET, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 22 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i, totalPages);
  }

  const filename = `seo-audit-${slugify(result.url)}-${timestamp()}.pdf`;
  doc.save(filename);
}
