export const AUDIT_LIMITS = {
  maxPages: 50,
  maxDepth: 3,
  lighthousePages: 5,
  jobTimeoutMinutes: 5,
  rateLimitSeconds: 1,
} as const;

export const HOW_TO_STEPS = [
  {
    step: 1,
    title: "Enter your website URL",
    description:
      "Paste your homepage or any page on the site you want audited. We'll crawl pages on the same domain.",
  },
  {
    step: 2,
    title: "Add an OpenAI key (optional)",
    description:
      "Expand the optional key field if you want AI-written SEO fixes and a tailored paid media strategy. Without a key, you still get full technical analysis with rule-based recommendations.",
  },
  {
    step: 3,
    title: "Run the audit and wait",
    description:
      "Click Run Audit. The crawl usually takes 2–5 minutes depending on site size. You'll see progress for crawling, analysis, Lighthouse, and recommendations.",
  },
  {
    step: 4,
    title: "Review your results",
    description:
      "Check your overall score, then dig into issues by severity, Lighthouse performance, SEO recommendations, paid strategy, and per-page details.",
  },
  {
    step: 5,
    title: "Filter and download",
    description:
      "Use search and filters to focus on what matters, then export JSON, Markdown, or CSV reports to share with your team.",
  },
] as const;

export const ANALYSIS_LIMITATIONS = [
  {
    title: "Crawl scope",
    detail: `Audits up to ${AUDIT_LIMITS.maxPages} pages, ${AUDIT_LIMITS.maxDepth} links deep, same domain only. Large sites are sampled, not fully crawled.`,
  },
  {
    title: "robots.txt respected",
    detail:
      "Pages blocked for crawlers in robots.txt are skipped. If your site disallows bots, fewer pages may be analyzed.",
  },
  {
    title: "Lighthouse sample",
    detail: `Performance scores run on the homepage plus up to ${AUDIT_LIMITS.lighthousePages - 1} top-linked pages — not every crawled page.`,
  },
  {
    title: "JavaScript-heavy sites",
    detail:
      "Single-page apps and client-rendered navigation may expose fewer internal links than a full site map.",
  },
  {
    title: "No search console data",
    detail:
      "We analyze your pages directly. This tool does not connect to Google Search Console, Analytics, or rank tracking APIs.",
  },
  {
    title: "Paid strategy is directional",
    detail:
      "Keyword and channel suggestions are based on your on-page content — not live ad auction data, search volume, or competitor spend.",
  },
  {
    title: "Results are not saved",
    detail:
      "Each audit runs fresh. Download your report before leaving the page if you need to keep it.",
  },
  {
    title: "Time limit",
    detail: `Audits time out after ${AUDIT_LIMITS.jobTimeoutMinutes} minutes. Very slow or blocking sites may return partial results.`,
  },
] as const;
