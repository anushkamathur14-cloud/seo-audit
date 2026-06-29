import { chromium, type Browser } from "playwright";
import { createRobotsChecker } from "./robots-sitemap";
import type { CrawlOptions, CrawledPage } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SEO-Audit-Agent/1.0";

function normalizeUrl(href: string, base: string): string | null {
  try {
    const url = new URL(href, base);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

async function fetchRobotsText(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function isLinkReachable(url: string): Promise<boolean> {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return true;
  }

  const fetchOpts = {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow" as RequestRedirect,
    signal: AbortSignal.timeout(10000),
  };

  async function tryRequest(method: "HEAD" | "GET"): Promise<number> {
    const res = await fetch(url, { ...fetchOpts, method });
    return res.status;
  }

  try {
    let status = await tryRequest("HEAD");

    if (
      status === 405 ||
      status === 403 ||
      status === 401 ||
      status === 0 ||
      status >= 400
    ) {
      status = await tryRequest("GET");
    }

    if (status === 429) return true;
    return status > 0 && status < 400;
  } catch {
    try {
      const status = await tryRequest("GET");
      if (status === 429) return true;
      return status > 0 && status < 400;
    } catch {
      return false;
    }
  }
}

function shouldCheckLink(href: string): boolean {
  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    return false;
  }
  try {
    const parsed = new URL(href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function crawlSite(
  startUrl: string,
  options: CrawlOptions,
): Promise<CrawledPage[]> {
  const origin = new URL(startUrl).origin;
  const robotsText = await fetchRobotsText(origin);
  const robots = createRobotsChecker(`${origin}/robots.txt`, robotsText);

  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
  const results: CrawledPage[] = [];

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const context = await browser.newContext({ userAgent: USER_AGENT });

    while (queue.length > 0 && results.length < options.maxPages) {
      const { url, depth } = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      if (!robots.isAllowed(url)) continue;

      if (results.length > 0) {
        await new Promise((r) => setTimeout(r, options.rateLimitMs));
      }

      const startTime = Date.now();
      let statusCode = 0;
      let html = "";
      const internalLinks: string[] = [];
      const externalLinks: string[] = [];

      try {
        const page = await context.newPage();
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        statusCode = response?.status() ?? 0;
        html = await page.content();

        const hrefs: string[] = await page.$$eval("a[href]", (anchors) =>
          anchors.map((a) => (a as HTMLAnchorElement).href),
        );

        for (const href of hrefs) {
          const normalized = normalizeUrl(href, url);
          if (!normalized) continue;
          if (isSameOrigin(normalized, origin)) {
            internalLinks.push(normalized);
            if (
              depth < options.maxDepth &&
              !visited.has(normalized) &&
              !queue.some((q) => q.url === normalized)
            ) {
              queue.push({ url: normalized, depth: depth + 1 });
            }
          } else {
            externalLinks.push(normalized);
          }
        }

        await page.close();
      } catch {
        statusCode = statusCode || 0;
      }

      const responseTimeMs = Date.now() - startTime;
      const contentLength = Buffer.byteLength(html, "utf8");

      results.push({
        url,
        html,
        statusCode,
        internalLinks: [...new Set(internalLinks)],
        externalLinks: [...new Set(externalLinks)],
        responseTimeMs,
        contentLength,
      });

      options.onProgress?.(results.length);
    }

    // Check a sample of broken links per page (limit total checks)
    let linkChecks = 0;
    const maxLinkChecks = 30;

    for (const page of results) {
      const brokenUrls: string[] = [];
      const linksToCheck = [
        ...page.internalLinks.slice(0, 5),
        ...page.externalLinks.slice(0, 3),
      ].filter(shouldCheckLink);

      for (const link of linksToCheck) {
        if (linkChecks >= maxLinkChecks) break;
        linkChecks++;
        const reachable = await isLinkReachable(link);
        if (!reachable) brokenUrls.push(link);
      }

      (page as CrawledPage & { brokenLinkUrls?: string[] }).brokenLinkUrls =
        brokenUrls;
    }
  } finally {
    if (browser) await browser.close();
  }

  return results;
}

export function getTopLinkedPages(
  pages: CrawledPage[],
  startUrl: string,
  limit: number,
): string[] {
  const inboundCounts = new Map<string, number>();

  for (const page of pages) {
    for (const link of page.internalLinks) {
      inboundCounts.set(link, (inboundCounts.get(link) ?? 0) + 1);
    }
  }

  const sorted = [...inboundCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([url]) => url)
    .filter((url) => url !== startUrl);

  return [startUrl, ...sorted.slice(0, limit - 1)];
}
