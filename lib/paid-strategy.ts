import OpenAI from "openai";
import type { KeywordTarget, LaunchTimelinePhase, PageAudit, PaidStrategy } from "./types";

const CHANNEL_LABELS: Record<string, string> = {
  "google-search": "Google Search Ads",
  "google-display": "Google Display Network",
  "google-shopping": "Google Shopping",
  "meta-facebook": "Meta (Facebook)",
  "meta-instagram": "Meta (Instagram)",
  linkedin: "LinkedIn Ads",
  youtube: "YouTube Ads",
  tiktok: "TikTok Ads",
  "microsoft-ads": "Microsoft Advertising (Bing)",
  retargeting: "Retargeting / Remarketing",
};

function extractKeywordCandidates(pages: PageAudit[]): string[] {
  const candidates = new Set<string>();

  for (const page of pages) {
    if (page.title) {
      const cleaned = page.title
        .replace(/\s*[|\-–—].*$/, "")
        .trim()
        .toLowerCase();
      if (cleaned.length > 3 && cleaned.length < 60) {
        candidates.add(cleaned);
      }
    }
    for (const h1 of page.h1Texts.slice(0, 2)) {
      const text = h1.trim().toLowerCase();
      if (text.length > 3 && text.length < 50) candidates.add(text);
    }
    if (page.metaDescription) {
      const words = page.metaDescription
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4);
      for (let i = 0; i < Math.min(words.length - 1, 3); i++) {
        candidates.add(`${words[i]} ${words[i + 1]}`);
      }
    }
  }

  return [...candidates].slice(0, 15);
}

function guessBusinessType(url: string, pages: PageAudit[]): string {
  const text = [
    url,
    ...pages.slice(0, 5).map((p) => `${p.title ?? ""} ${p.metaDescription ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();

  if (/shop|store|cart|product|buy|ecommerce|e-commerce/.test(text)) {
    return "E-commerce / online retail";
  }
  if (/saas|software|platform|api|app|tool/.test(text)) {
    return "B2B SaaS / software";
  }
  if (/agency|consulting|services|marketing|seo/.test(text)) {
    return "Professional services / agency";
  }
  if (/blog|news|article|guide|learn/.test(text)) {
    return "Content / media / publisher";
  }
  if (/local|near me|city|location|clinic|restaurant/.test(text)) {
    return "Local business";
  }
  return "General business / brand";
}

function buildLaunchTimeline(businessType: string): LaunchTimelinePhase[] {
  const isEcom = businessType.includes("E-commerce");
  const isB2b = businessType.includes("B2B") || businessType.includes("SaaS");
  const isLocal = businessType.includes("Local");

  return [
    {
      id: "phase-1",
      phase: "Foundation",
      timeframe: "Week 1–2",
      goals: [
        "Tracking, pixels, and ad accounts ready before any spend",
      ],
      tasks: [
        "Install Google Tag Manager with Google Ads + GA4 conversion events",
        "Add Meta Pixel and verify PageView + lead/purchase events",
        "Create Google Ads and Meta Business Manager accounts",
        isLocal
          ? "Set up call tracking and location extensions for local campaigns"
          : "Document primary conversion actions (demo, signup, purchase)",
      ],
    },
    {
      id: "phase-2",
      phase: "Search launch",
      timeframe: "Week 3–4",
      goals: [
        "Capture high-intent demand on your top keyword themes",
      ],
      tasks: [
        "Launch Google Search campaigns on top 3–5 phrase/exact keywords",
        "Build responsive search ads tied to existing landing pages",
        "Set daily budgets 20–30% below target while learning",
        "Review search terms daily and add negatives for irrelevant queries",
      ],
    },
    {
      id: "phase-3",
      phase: "Retargeting & creative",
      timeframe: "Week 5–6",
      goals: [
        "Re-engage site visitors who did not convert",
      ],
      tasks: [
        "Launch remarketing lists for all visitors (30-day window)",
        isEcom
          ? "Separate cart abandoners with product-specific creative"
          : "Promote your strongest offer to warm audiences",
        "Test 2–3 ad variants per ad group and pause underperformers",
      ],
    },
    {
      id: "phase-4",
      phase: "Expand & optimize",
      timeframe: "Week 7–12",
      goals: [
        "Scale what works and test secondary channels",
      ],
      tasks: [
        isB2b
          ? "Pilot LinkedIn lead gen on decision-maker audiences"
          : "Test one secondary channel (Display, YouTube, or Meta prospecting)",
        "Increase budget 15–20% on campaigns with positive ROAS/CPA",
        "Refresh landing pages using SEO audit fixes before scaling spend",
        "Monthly review: keywords, creatives, budgets, and channel mix",
      ],
    },
  ];
}

function resolveLandingPage(
  candidate: string | undefined,
  pages: PageAudit[],
  fallbackUrl: string,
): string {
  const crawled = new Set(pages.map((p) => p.url));
  if (candidate) {
    try {
      const resolved = new URL(candidate, fallbackUrl).href;
      if (crawled.has(resolved)) return resolved;
      const pathname = new URL(resolved).pathname;
      const match = pages.find((p) => new URL(p.url).pathname === pathname);
      if (match) return match.url;
    } catch {
      // fall through
    }
  }
  const homepage =
    pages.find((p) => {
      try {
        return new URL(p.url).pathname === "/" || p.url === fallbackUrl;
      } catch {
        return false;
      }
    }) ?? pages[0];
  return homepage?.url ?? fallbackUrl;
}
function buildFallbackKeywords(
  pages: PageAudit[],
  url: string,
): KeywordTarget[] {
  const candidates = extractKeywordCandidates(pages);
  const homepage =
    pages.find((p) => {
      try {
        return new URL(p.url).pathname === "/" || p.url === url;
      } catch {
        return false;
      }
    }) ?? pages[0];

  const landingPage = homepage?.url ?? url;

  if (candidates.length === 0) {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const brand = hostname.split(".")[0];
    return [
      {
        id: "kw-0",
        keyword: brand,
        intent: "navigational",
        matchType: "exact",
        rationale: "Brand term to capture users searching for your company name.",
        suggestedLandingPage: landingPage,
        priority: "high",
      },
    ];
  }

  return candidates.slice(0, 10).map((keyword, index) => ({
    id: `kw-${index}`,
    keyword,
    intent:
      index < 2
        ? "commercial"
        : index < 5
          ? "informational"
          : "transactional",
    matchType: index < 3 ? "phrase" : "broad",
    rationale:
      index < 3
        ? "Derived from your page titles — likely core offering terms."
        : "Supporting term from on-page content worth testing in paid search.",
    suggestedLandingPage: resolveLandingPage(
      pages.find((p) =>
        p.title?.toLowerCase().includes(keyword.split(" ")[0]),
      )?.url,
      pages,
      url,
    ),
    priority: index < 3 ? "high" : index < 6 ? "medium" : "low",
  }));
}

function buildFallbackChannels(businessType: string): PaidStrategy["channels"] {
  const channels: PaidStrategy["channels"] = [
    {
      id: "ch-google-search",
      channel: "google-search",
      channelLabel: CHANNEL_LABELS["google-search"],
      priority: "primary",
      rationale:
        "Capture high-intent users actively searching for your products or services.",
      estimatedBudgetRange: "$500–$2,000/month to start",
      bestFor: "Demand capture and lead generation",
      tactics: [
        "Start with phrase and exact match on top 5 keywords",
        "Use Search campaigns with responsive search ads",
        "Add negative keywords weekly based on search term reports",
        "Send traffic to your highest-converting landing pages",
      ],
    },
    {
      id: "ch-retargeting",
      channel: "retargeting",
      channelLabel: CHANNEL_LABELS.retargeting,
      priority: "secondary",
      rationale:
        "Re-engage visitors who didn't convert on their first visit — typically 2–3x higher conversion rates.",
      estimatedBudgetRange: "$200–$800/month",
      bestFor: "Recovering lost conversions from site visitors",
      tactics: [
        "Install Meta Pixel and Google Ads remarketing tag",
        "Build audiences of all site visitors (30-day window)",
        "Create separate ads for cart abandoners vs. blog readers",
      ],
    },
  ];

  if (businessType.includes("E-commerce")) {
    channels.unshift({
      id: "ch-google-shopping",
      channel: "google-shopping",
      channelLabel: CHANNEL_LABELS["google-shopping"],
      priority: "primary",
      rationale:
        "Product listing ads show images and prices directly in search — strong for e-commerce.",
      estimatedBudgetRange: "$1,000–$5,000/month",
      bestFor: "Product discovery and direct sales",
      tactics: [
        "Set up Google Merchant Center with product feed",
        "Run Performance Max or Standard Shopping campaigns",
        "Optimize product titles with target keywords",
      ],
    });
    channels.push({
      id: "ch-meta-instagram",
      channel: "meta-instagram",
      channelLabel: CHANNEL_LABELS["meta-instagram"],
      priority: "secondary",
      rationale:
        "Visual products perform well on Instagram — ideal for discovery and retargeting.",
      estimatedBudgetRange: "$500–$2,000/month",
      bestFor: "Visual product discovery and brand awareness",
      tactics: [
        "Use carousel ads showcasing top products",
        "Run Advantage+ shopping campaigns",
        "Test UGC-style creative vs. polished studio shots",
      ],
    });
  }

  if (businessType.includes("B2B") || businessType.includes("SaaS")) {
    channels.push({
      id: "ch-linkedin",
      channel: "linkedin",
      channelLabel: CHANNEL_LABELS.linkedin,
      priority: "primary",
      rationale:
        "LinkedIn offers precise B2B targeting by job title, company size, and industry.",
      estimatedBudgetRange: "$1,500–$5,000/month",
      bestFor: "B2B lead generation and account-based marketing",
      tactics: [
        "Target decision-makers by job function and seniority",
        "Use lead gen forms for lower-friction conversions",
        "Promote case studies and demo offers",
      ],
    });
  }

  if (businessType.includes("Local")) {
    channels.push({
      id: "ch-google-search-local",
      channel: "google-search",
      channelLabel: "Google Search Ads (Local)",
      priority: "primary",
      rationale:
        "Local service ads and geo-targeted search campaigns drive foot traffic and calls.",
      estimatedBudgetRange: "$300–$1,500/month",
      bestFor: "Local leads, phone calls, and store visits",
      tactics: [
        "Enable location extensions and call extensions",
        "Geo-fence campaigns to your service area",
        "Bid on \"near me\" and city-specific keywords",
      ],
    });
  }

  channels.push({
    id: "ch-youtube",
    channel: "youtube",
    channelLabel: CHANNEL_LABELS.youtube,
    priority: "test",
    rationale:
      "Video ads build trust and explain complex offerings — test once core search is profitable.",
    estimatedBudgetRange: "$300–$1,000/month",
    bestFor: "Brand awareness and product education",
    tactics: [
      "Start with 15–30 second skippable in-stream ads",
      "Target custom intent audiences based on search keywords",
      "Repurpose existing video content or create explainer clips",
    ],
  });

  return channels;
}

export function buildFallbackPaidStrategy(
  url: string,
  pages: PageAudit[],
): PaidStrategy {
  const businessType = guessBusinessType(url, pages);
  const keywords = buildFallbackKeywords(pages, url);

  return {
    included: true,
    summary: `Based on your site content, a paid strategy should focus on capturing search demand for your core terms while building retargeting audiences from existing traffic. As a ${businessType.toLowerCase()}, prioritize channels where your audience is actively looking to buy or learn.`,
    businessTypeGuess: businessType,
    keywords,
    channels: buildFallbackChannels(businessType),
    quickWins: [
      "Set up Google Search Ads on your top 3 keyword themes with phrase match",
      "Install conversion tracking (Google Tag + Meta Pixel) before spending",
      "Create a dedicated landing page for your highest-intent keyword",
      "Launch a retargeting campaign for all site visitors within 30 days",
      "Add negative keywords weekly to reduce wasted spend",
    ],
    budgetGuidance:
      "Start with $1,000–$2,500/month total across 2 channels. Allocate 60% to search (high intent), 25% to retargeting, and 15% to testing new channels. Scale the best-performing channel by 20% monthly once ROAS is positive.",
    launchTimeline: buildLaunchTimeline(businessType),
    aiGenerated: false,
  };
}

interface PaidStrategyInput {
  url: string;
  pages: PageAudit[];
  businessSignals: {
    topTitles: string[];
    topMetaDescriptions: string[];
    avgPerformance?: number;
    totalPages: number;
  };
}

export async function generatePaidStrategy(
  input: PaidStrategyInput,
  apiKey?: string,
  model = "gpt-4o-mini",
): Promise<PaidStrategy> {
  if (!apiKey) {
    return buildFallbackPaidStrategy(input.url, input.pages);
  }

  const prompt = `You are a digital marketing strategist specializing in paid media (PPC, paid social, retargeting). Based on this website audit, recommend a paid advertising strategy.

Website: ${input.url}
Pages crawled: ${input.businessSignals.totalPages}
Business type signals from page titles: ${JSON.stringify(input.businessSignals.topTitles)}
Meta descriptions: ${JSON.stringify(input.businessSignals.topMetaDescriptions.slice(0, 5))}
Site performance score: ${input.businessSignals.avgPerformance ?? "unknown"}

Respond with ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence overview of recommended paid strategy",
  "businessTypeGuess": "e.g. B2B SaaS, e-commerce, local services",
  "keywords": [
    {
      "keyword": "target keyword phrase",
      "intent": "informational|navigational|commercial|transactional",
      "matchType": "exact|phrase|broad",
      "rationale": "why target this keyword",
      "suggestedLandingPage": "which page type to send traffic to",
      "priority": "high|medium|low"
    }
  ],
  "channels": [
    {
      "channel": "google-search|google-display|google-shopping|meta-facebook|meta-instagram|linkedin|youtube|tiktok|microsoft-ads|retargeting",
      "priority": "primary|secondary|test",
      "rationale": "why this channel fits this business",
      "estimatedBudgetRange": "e.g. $500-$2000/month",
      "bestFor": "what goal this channel serves",
      "tactics": ["specific tactic 1", "specific tactic 2", "specific tactic 3"]
    }
  ],
  "quickWins": ["actionable quick win 1", "quick win 2", "quick win 3"],
  "budgetGuidance": "How to allocate budget across channels for first 90 days",
  "launchTimeline": [
    {
      "phase": "Foundation",
      "timeframe": "Week 1-2",
      "goals": ["goal 1"],
      "tasks": ["task 1", "task 2"]
    }
  ]
}

Provide 8-12 keyword targets, 4-6 channel recommendations, and a 4-phase launch timeline (weeks 1-12). Only suggest landing pages that exist on the crawled site. Be specific to this site's content and industry — not generic advice. Include retargeting and at least one test channel.`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as Omit<
      PaidStrategy,
      "aiGenerated" | "included" | "keywords" | "channels" | "launchTimeline"
    > & {
      keywords: Array<Omit<KeywordTarget, "id">>;
      channels: Array<Omit<PaidStrategy["channels"][0], "id" | "channelLabel">>;
      launchTimeline?: Array<Omit<LaunchTimelinePhase, "id">>;
    };

    const crawledPages = input.pages;

    return {
      included: true,
      summary: parsed.summary,
      businessTypeGuess: parsed.businessTypeGuess,
      keywords: parsed.keywords.map((kw, i) => ({
        ...kw,
        id: `ai-kw-${i}`,
        suggestedLandingPage: resolveLandingPage(
          kw.suggestedLandingPage,
          crawledPages,
          input.url,
        ),
      })),
      channels: parsed.channels.map((ch, i) => ({
        ...ch,
        id: `ai-ch-${i}`,
        channelLabel: CHANNEL_LABELS[ch.channel] ?? ch.channel,
      })),
      quickWins: parsed.quickWins,
      budgetGuidance: parsed.budgetGuidance,
      launchTimeline: (parsed.launchTimeline?.length
        ? parsed.launchTimeline
        : buildLaunchTimeline(parsed.businessTypeGuess)
      ).map((phase, i) => ({ ...phase, id: `ai-phase-${i}` })),
      aiGenerated: true,
    };
  } catch (error) {
    console.error("Paid strategy AI generation failed:", error);
    return buildFallbackPaidStrategy(input.url, input.pages);
  }
}
