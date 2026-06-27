import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import type { LighthouseMetrics } from "./types";

const LIGHTHOUSE_CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;

function extractMetric(
  audits: Record<string, { numericValue?: number; details?: unknown }>,
  id: string,
): number | undefined {
  const audit = audits[id];
  if (!audit?.numericValue && audit?.numericValue !== 0) return undefined;
  return Math.round(audit.numericValue * 100) / 100;
}

export async function runLighthouseAudit(
  url: string,
  timeoutMs: number,
): Promise<LighthouseMetrics | null> {
  let chrome: chromeLauncher.LaunchedChrome | null = null;

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
    });

    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      onlyCategories: [...LIGHTHOUSE_CATEGORIES],
      port: chrome.port,
    };

    const runnerResult = await Promise.race([
      lighthouse(url, options),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Lighthouse timeout")), timeoutMs),
      ),
    ]);

    if (!runnerResult || !("lhr" in runnerResult)) return null;

    const lhr = runnerResult.lhr;
    const categories = lhr.categories;
    const audits = lhr.audits as Record<
      string,
      { numericValue?: number; details?: { items?: unknown[] } }
    >;

    const renderBlocking = audits["render-blocking-resources"];
    const totalByteWeight = audits["total-byte-weight"];

    return {
      url,
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
      lcp: extractMetric(audits, "largest-contentful-paint"),
      cls: extractMetric(audits, "cumulative-layout-shift"),
      inp: extractMetric(audits, "interaction-to-next-paint"),
      tbt: extractMetric(audits, "total-blocking-time"),
      renderBlockingResources: renderBlocking?.details?.items?.length ?? 0,
      totalByteWeight: totalByteWeight?.numericValue
        ? Math.round(totalByteWeight.numericValue)
        : undefined,
    };
  } catch (error) {
    console.error(`Lighthouse failed for ${url}:`, error);
    return null;
  } finally {
    if (chrome) await chrome.kill();
  }
}

export async function runLighthouseBatch(
  urls: string[],
  timeoutMs: number,
  concurrency = 2,
): Promise<LighthouseMetrics[]> {
  const results: LighthouseMetrics[] = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const result = await runLighthouseAudit(url, timeoutMs);
      if (result) results.push(result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}
