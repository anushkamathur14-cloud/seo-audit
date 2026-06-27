import robotsParser from "robots-parser";
import type { Issue, SiteAudit } from "./types";

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SEO-Audit-Agent/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseSitemapUrls(xml: string): string[] {
  const locMatches = xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi);
  return [...locMatches].map((m) => m[1].trim());
}

export async function checkSiteLevel(
  startUrl: string,
  crawledUrls: string[],
): Promise<{ site: SiteAudit; issues: Issue[] }> {
  const origin = new URL(startUrl).origin;
  const issues: Issue[] = [];
  let issueIndex = 0;

  const robotsUrl = `${origin}/robots.txt`;
  const robotsText = await fetchText(robotsUrl);
  const sitemapUrls: string[] = [];
  const disallowRules: string[] = [];

  if (robotsText) {
    const robots = robotsParser(robotsUrl, robotsText);
    const lines = robotsText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("disallow:")) {
        disallowRules.push(line.trim());
      }
      if (trimmed.startsWith("sitemap:")) {
        sitemapUrls.push(line.split(":").slice(1).join(":").trim());
      }
    }

    if (!robots.isAllowed(startUrl, "SEO-Audit-Agent")) {
      issues.push({
        id: `site-robots-block-${issueIndex++}`,
        severity: "critical",
        category: "robots",
        title: "Homepage blocked by robots.txt",
        description: "The starting URL is disallowed for crawlers in robots.txt.",
        recommendation:
          "Review robots.txt Disallow rules if you want this site indexed.",
      });
    }
  } else {
    issues.push({
      id: `site-robots-missing-${issueIndex++}`,
      severity: "medium",
      category: "robots",
      title: "robots.txt not found",
      description: `No robots.txt at ${robotsUrl}.`,
      recommendation: "Add a robots.txt file to guide search engine crawlers.",
    });
  }

  let sitemapFound = false;
  let sitemapUrlCount: number | undefined;
  let sitemapError: string | undefined;

  const sitemapCandidates = [
    ...sitemapUrls,
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
  ];

  for (const sitemapUrl of [...new Set(sitemapCandidates)]) {
    const xml = await fetchText(sitemapUrl);
    if (!xml) continue;
    sitemapFound = true;
    const urls = parseSitemapUrls(xml);
    sitemapUrlCount = urls.length;
    if (urls.length === 0) {
      sitemapError = "Sitemap found but contains no URLs.";
    }
    break;
  }

  if (!sitemapFound) {
    issues.push({
      id: `site-sitemap-missing-${issueIndex++}`,
      severity: "high",
      category: "sitemap",
      title: "Sitemap not found",
      description: "No sitemap.xml discovered at common locations.",
      recommendation:
        "Create and submit an XML sitemap; reference it in robots.txt.",
    });
  } else if (sitemapError) {
    issues.push({
      id: `site-sitemap-empty-${issueIndex++}`,
      severity: "medium",
      category: "sitemap",
      title: "Empty sitemap",
      description: sitemapError,
      recommendation: "Populate the sitemap with all indexable URLs.",
    });
  }

  const httpsUsed = startUrl.startsWith("https://");
  if (!httpsUsed) {
    issues.push({
      id: `site-https-${issueIndex++}`,
      severity: "critical",
      category: "security",
      title: "Site not using HTTPS",
      description: "The audited URL uses HTTP instead of HTTPS.",
      recommendation: "Migrate to HTTPS and set up 301 redirects from HTTP.",
    });
  }

  const urlConsistencyIssues: string[] = [];
  const host = new URL(startUrl).host;
  const hasWww = host.startsWith("www.");
  const trailingSlashVariants = new Set<string>();

  for (const url of crawledUrls.slice(0, 20)) {
    try {
      const parsed = new URL(url);
      if (parsed.host.startsWith("www.") !== hasWww) {
        urlConsistencyIssues.push(`Mixed www/non-www: ${url}`);
      }
      const path = parsed.pathname;
      if (path !== "/" && (path.endsWith("/") || !path.endsWith("/"))) {
        trailingSlashVariants.add(path.endsWith("/") ? "trailing" : "no-trailing");
      }
    } catch {
      // skip invalid
    }
  }

  if (urlConsistencyIssues.length > 0) {
    issues.push({
      id: `site-www-${issueIndex++}`,
      severity: "high",
      category: "consistency",
      title: "Inconsistent URL format (www)",
      description: urlConsistencyIssues.slice(0, 3).join("; "),
      recommendation:
        "Pick www or non-www and redirect all variants to the canonical version.",
    });
  }

  if (trailingSlashVariants.size > 1) {
    issues.push({
      id: `site-trailing-${issueIndex++}`,
      severity: "medium",
      category: "consistency",
      title: "Inconsistent trailing slashes",
      description: "Some URLs use trailing slashes while others do not.",
      recommendation:
        "Standardize trailing slash usage and redirect non-canonical variants.",
    });
  }

  const site: SiteAudit = {
    robotsTxt: {
      found: !!robotsText,
      sitemapUrls,
      disallowRules,
    },
    sitemap: {
      found: sitemapFound,
      urlCount: sitemapUrlCount,
      error: sitemapError,
    },
    httpsUsed,
    mixedContentWarnings: 0,
    urlConsistencyIssues,
  };

  return { site, issues };
}

export function createRobotsChecker(robotsUrl: string, robotsText: string | null) {
  if (!robotsText) {
    return { isAllowed: () => true };
  }
  const robots = robotsParser(robotsUrl, robotsText);
  return {
    isAllowed: (url: string) => robots.isAllowed(url, "SEO-Audit-Agent") !== false,
  };
}
