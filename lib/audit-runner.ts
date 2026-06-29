import { analyzePageHtml } from "./seo-analyzer";
import { crawlSite, getTopLinkedPages } from "./crawler";
import { checkSiteLevel } from "./robots-sitemap";
import { runLighthouseBatch } from "./lighthouse-runner";
import {
  aggregateAudit,
  buildPageAudits,
} from "./aggregator";
import { generateRecommendations } from "./ai-recommender";
import { generatePaidStrategy } from "./paid-strategy";
import { emptyPaidStrategy } from "./paid-strategy-empty";
import { config } from "./config";
import {
  completeJob,
  failJob,
  getJob,
  updateJobProgress,
} from "./job-store";
import type { CrawledPage } from "./types";

function countInboundLinks(pages: CrawledPage[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const page of pages) {
    for (const link of page.internalLinks) {
      counts.set(link, (counts.get(link) ?? 0) + 1);
    }
  }
  return counts;
}

export async function runAuditJob(jobId: string, url: string): Promise<void> {
    const job = getJob(jobId);
    if (!job) {
      throw new Error(
        "Audit job was lost. Please run a new audit — this can happen if the server restarted.",
      );
    }
    const openaiApiKey = job.openaiApiKey || config.openaiApiKey;
    const includePaidMedia = job.includePaidMedia ?? false;
  const timeout = setTimeout(() => {
    failJob(jobId, "Audit timed out after 5 minutes.");
  }, config.jobTimeoutMs);

  try {
    updateJobProgress(jobId, {
      phase: "crawling",
      message: "Crawling pages...",
      totalEstimate: config.maxPages,
    });

    const crawled = await crawlSite(url, {
      maxPages: config.maxPages,
      maxDepth: config.maxDepth,
      rateLimitMs: config.rateLimitMs,
      onProgress: (pagesCrawled) => {
        updateJobProgress(jobId, { pagesCrawled, phase: "crawling" });
      },
    });

    if (crawled.length === 0) {
      throw new Error("Could not crawl any pages. Check the URL and try again.");
    }

    updateJobProgress(jobId, {
      phase: "analyzing",
      pagesCrawled: crawled.length,
      message: "Analyzing SEO signals...",
    });

    const inboundCounts = countInboundLinks(crawled);
    const pageData = crawled.map((page) => {
      const brokenLinkUrls =
        (page as CrawledPage & { brokenLinkUrls?: string[] }).brokenLinkUrls ?? [];
      return analyzePageHtml(
        page.url,
        page.html,
        page.statusCode,
        page.responseTimeMs,
        page.contentLength,
        page.internalLinks,
        page.externalLinks,
        brokenLinkUrls,
      );
    });

    const pages = buildPageAudits(pageData, inboundCounts);
    const crawledUrls = crawled.map((p) => p.url);
    const { site, issues: siteIssues } = await checkSiteLevel(url, crawledUrls);

    updateJobProgress(jobId, {
      phase: "lighthouse",
      message: "Running Lighthouse audits...",
    });

    const lighthouseUrls = getTopLinkedPages(
      crawled,
      url,
      config.lighthousePages,
    );
    const lighthouse = await runLighthouseBatch(
      lighthouseUrls,
      config.lighthouseTimeoutMs,
      2,
    );

    const preliminaryIssues = [
      ...pages.flatMap((p) => p.issues),
      ...siteIssues,
    ];

    updateJobProgress(jobId, {
      phase: "ai",
      message: openaiApiKey
        ? includePaidMedia
          ? "Generating AI-powered SEO and paid media recommendations..."
          : "Generating AI-powered SEO recommendations..."
        : includePaidMedia
          ? "Generating recommendations (add an OpenAI key for AI insights)..."
          : "Generating SEO recommendations...",
    });

    const avgPerformance =
      lighthouse.length > 0
        ? Math.round(
            lighthouse.reduce((s, m) => s + m.performance, 0) /
              lighthouse.length,
          )
        : undefined;
    const avgSeo =
      lighthouse.length > 0
        ? Math.round(
            lighthouse.reduce((s, m) => s + m.seo, 0) / lighthouse.length,
          )
        : undefined;

    const { recommendations, aiGenerated } = await generateRecommendations(
      {
        url,
        totalPages: pages.length,
        issues: preliminaryIssues,
        lighthouseSummary: { avgPerformance, avgSeo },
      },
      openaiApiKey,
      config.openaiModel,
    );

    const paidStrategy = includePaidMedia
      ? await generatePaidStrategy(
          {
            url,
            pages,
            businessSignals: {
              topTitles: pages
                .map((p) => p.title)
                .filter((t): t is string => !!t)
                .slice(0, 10),
              topMetaDescriptions: pages
                .map((p) => p.metaDescription)
                .filter((d): d is string => !!d)
                .slice(0, 10),
              avgPerformance,
              totalPages: pages.length,
            },
          },
          openaiApiKey,
          config.openaiModel,
        )
      : emptyPaidStrategy();

    const result = aggregateAudit({
      url,
      pages,
      site,
      lighthouse,
      siteIssues,
      recommendations,
      paidStrategy,
      aiGenerated,
      includePaidMedia,
    });

    completeJob(jobId, result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during audit.";
    failJob(jobId, message);
  } finally {
    clearTimeout(timeout);
  }
}
