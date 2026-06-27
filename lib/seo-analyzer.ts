import * as cheerio from "cheerio";
import type { Issue, PageSignals } from "./types";

function issueId(prefix: string, url: string, index: number): string {
  return `${prefix}-${Buffer.from(url).toString("base64url").slice(0, 12)}-${index}`;
}

export function analyzePageHtml(
  url: string,
  html: string,
  statusCode: number,
  responseTimeMs: number,
  contentLength: number,
  internalLinks: string[],
  externalLinks: string[],
  brokenLinks: number,
): { signals: PageSignals; issues: Issue[] } {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];
  let issueIndex = 0;

  const title = $("title").first().text().trim();
  const titleLength = title.length;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim();
  const metaDescriptionLength = metaDescription?.length ?? 0;
  const h1Texts = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  const h1Count = h1Texts.length;
  const canonical = $('link[rel="canonical"]').attr("href")?.trim();
  const robotsMeta = $('meta[name="robots"]').attr("content")?.trim();
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasOgTags =
    $('meta[property="og:title"]').length > 0 &&
    $('meta[property="og:description"]').length > 0;
  const hasTwitterTags =
    $('meta[name="twitter:card"]').length > 0 ||
    $('meta[name="twitter:title"]').length > 0;
  const hasStructuredData =
    $('script[type="application/ld+json"]').length > 0 ||
    $("[itemscope]").length > 0;

  const imagesTotal = $("img").length;
  let imagesMissingAlt = 0;
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt.trim() === "") imagesMissingAlt++;
  });

  const headingHierarchyIssues: string[] = [];
  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((_, el) => ({
      level: parseInt(el.tagName.slice(1), 10),
      text: $(el).text().trim().slice(0, 80),
    }))
    .get();

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr - prev > 1) {
      headingHierarchyIssues.push(
        `Skipped from H${prev} to H${curr}: "${headings[i].text}"`,
      );
    }
  }

  const addIssue = (
    severity: Issue["severity"],
    category: string,
    titleText: string,
    description: string,
    recommendation?: string,
  ) => {
    issues.push({
      id: issueId(category, url, issueIndex++),
      severity,
      category,
      title: titleText,
      description,
      pageUrl: url,
      recommendation,
    });
  };

  if (statusCode >= 400) {
    addIssue(
      "critical",
      "http",
      `Page returns HTTP ${statusCode}`,
      `The page at ${url} returned status code ${statusCode}.`,
      "Fix server errors or remove broken links pointing to this URL.",
    );
  }

  if (!title) {
    addIssue(
      "critical",
      "title",
      "Missing page title",
      "No <title> tag found.",
      "Add a unique, descriptive title between 30–60 characters.",
    );
  } else if (titleLength < 30) {
    addIssue(
      "medium",
      "title",
      "Title too short",
      `Title is ${titleLength} characters: "${title}"`,
      "Expand the title to 30–60 characters with primary keywords.",
    );
  } else if (titleLength > 60) {
    addIssue(
      "low",
      "title",
      "Title too long",
      `Title is ${titleLength} characters and may be truncated in search results.`,
      "Shorten the title to under 60 characters.",
    );
  }

  if (!metaDescription) {
    addIssue(
      "high",
      "meta",
      "Missing meta description",
      "No meta description tag found.",
      "Add a compelling meta description between 120–160 characters.",
    );
  } else if (metaDescriptionLength < 120) {
    addIssue(
      "medium",
      "meta",
      "Meta description too short",
      `Description is ${metaDescriptionLength} characters.`,
      "Expand to 120–160 characters to improve click-through rate.",
    );
  } else if (metaDescriptionLength > 160) {
    addIssue(
      "low",
      "meta",
      "Meta description too long",
      `Description is ${metaDescriptionLength} characters and may be truncated.`,
      "Trim to 160 characters or less.",
    );
  }

  if (h1Count === 0) {
    addIssue(
      "high",
      "headings",
      "Missing H1 heading",
      "Page has no H1 element.",
      "Add a single H1 that describes the main topic of the page.",
    );
  } else if (h1Count > 1) {
    addIssue(
      "medium",
      "headings",
      "Multiple H1 headings",
      `Found ${h1Count} H1 elements on the page.`,
      "Use a single H1 per page; demote extras to H2.",
    );
  }

  for (const hierarchyIssue of headingHierarchyIssues) {
    addIssue(
      "low",
      "headings",
      "Heading hierarchy skip",
      hierarchyIssue,
      "Maintain sequential heading levels (H1 → H2 → H3).",
    );
  }

  if (imagesMissingAlt > 0) {
    addIssue(
      imagesMissingAlt > 5 ? "high" : "medium",
      "images",
      "Images missing alt text",
      `${imagesMissingAlt} of ${imagesTotal} images lack alt attributes.`,
      "Add descriptive alt text to all meaningful images.",
    );
  }

  if (!canonical) {
    addIssue(
      "medium",
      "canonical",
      "Missing canonical tag",
      "No canonical link element found.",
      "Add a self-referencing canonical URL to prevent duplicate content issues.",
    );
  } else {
    try {
      const canonicalUrl = new URL(canonical, url).href;
      if (canonicalUrl !== url && !canonicalUrl.startsWith(url.split("?")[0])) {
        addIssue(
          "low",
          "canonical",
          "Canonical points elsewhere",
          `Canonical is set to ${canonicalUrl}.`,
          "Verify the canonical URL is intentional.",
        );
      }
    } catch {
      addIssue(
        "medium",
        "canonical",
        "Invalid canonical URL",
        `Canonical value "${canonical}" is not a valid URL.`,
        "Fix the canonical link to a valid absolute URL.",
      );
    }
  }

  if (!hasOgTags) {
    addIssue(
      "medium",
      "social",
      "Missing Open Graph tags",
      "og:title and og:description are not both present.",
      "Add Open Graph meta tags for better social sharing previews.",
    );
  }

  if (!hasTwitterTags) {
    addIssue(
      "low",
      "social",
      "Missing Twitter Card tags",
      "No Twitter Card meta tags found.",
      "Add twitter:card and twitter:title meta tags.",
    );
  }

  if (!hasStructuredData) {
    addIssue(
      "medium",
      "structured-data",
      "No structured data detected",
      "No JSON-LD or microdata found on the page.",
      "Add schema.org JSON-LD markup relevant to your content type.",
    );
  }

  if (robotsMeta?.toLowerCase().includes("noindex")) {
    addIssue(
      "critical",
      "robots",
      "Page blocked from indexing",
      `robots meta tag: "${robotsMeta}"`,
      "Remove noindex if this page should appear in search results.",
    );
  }

  if (!hasViewport) {
    addIssue(
      "high",
      "mobile",
      "Missing viewport meta tag",
      "No viewport meta tag for mobile rendering.",
      'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    );
  }

  if (brokenLinks > 0) {
    addIssue(
      "high",
      "links",
      "Broken links detected",
      `${brokenLinks} broken link(s) found on this page.`,
      "Fix or remove links returning 4xx/5xx status codes.",
    );
  }

  return {
    signals: {
      url,
      statusCode,
      title: title || undefined,
      titleLength: title ? titleLength : undefined,
      metaDescription: metaDescription || undefined,
      metaDescriptionLength: metaDescription ? metaDescriptionLength : undefined,
      h1Count,
      h1Texts,
      headingHierarchyIssues,
      imagesMissingAlt,
      imagesTotal,
      canonical,
      hasOgTags,
      hasTwitterTags,
      hasStructuredData,
      robotsMeta,
      hasViewport,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      brokenLinks,
      responseTimeMs,
      contentLength,
    },
    issues,
  };
}
